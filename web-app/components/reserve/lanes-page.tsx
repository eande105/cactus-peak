"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { AddToCalendar } from "@/components/booking/calendar-menu"
import { SuccessPanel } from "@/components/booking/success-panel"
import {
  Banner,
  CheckRow,
  EmptyState,
  FormField,
  LoadingBlock,
  PageHeader,
  SelectBox,
} from "@/components/kit/ui"
import { StickyBar } from "@/components/reserve/common"
import {
  type CellInfo,
  SlotGrid,
  SlotList,
} from "@/components/reserve/slot-grid"
import { DayStrip } from "@/components/schedule/day-strip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/hooks/use-media"
import { cancelBooking, moveReservation, reserveLane } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import {
  cancelNote,
  gridSlots,
  laneSwimmers,
  pausedUntil,
  windowDays,
} from "@/lib/engine"
import {
  dateKey,
  dayStart,
  fmtDay,
  fmtDowTime,
  fmtRange,
  fmtTime,
  fromKey,
  HOUR,
  MIN,
  minutesOfDay,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking } from "@/lib/types"
import { openDialog, useOffline } from "@/lib/ui-state"

function Inner() {
  const { s, me, hh, now, club: viewing } = useApp()
  const router = useRouter()
  const sp = useSearchParams()
  const wide = useMedia("(min-width: 1024px)")
  const offline = useOffline()
  const [loading, setLoading] = useState(false)
  const pools = CLUBS.filter((c) => c.pool)
  const clubSlug =
    sp.get("club") ?? (CLUB_BY_SLUG[viewing].pool ? viewing : pools[0].slug)
  const club = CLUB_BY_SLUG[clubSlug]
  const today = dayStart(now)
  const date = sp.get("date") ? fromKey(sp.get("date")!) : today
  const moveId = sp.get("move")
  const moving = moveId ? s.bookings.find((b) => b.id === moveId) : undefined
  const [any, setAny] = useState(true)
  const [sel, setSel] = useState<{ row: number; slot: number } | null>(null)
  const [partner, setPartner] = useState("")
  const [done, setDone] = useState<Booking | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: clubSlug restarts the fake load delay when the club changes
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 280)
    return () => clearTimeout(t)
  }, [clubSlug])
  const setParam = (p: Record<string, string>) => {
    const q = new URLSearchParams(sp)
    Object.entries(p).forEach(([k, v]) => {
      if (v) q.set(k, v)
      else q.delete(k)
    })
    router.replace(`/reserve/lanes?${q}`, { scroll: false })
    setSel(null)
  }
  const lanes = club.pool?.lanes ?? 0
  const rows = Array.from({ length: lanes }, (_, i) => ({
    id: i + 1,
    label: `Lane ${i + 1}`,
  }))
  const slots = gridSlots(date, "lane").filter((x) => x + 45 * MIN > now)
  const win = windowDays(hh.plan)
  const opens = dayStart(date) - win * 86400000 + 6 * HOUR
  const notOpen = now < opens
  const info = (lane: number, slot: number): CellInfo => {
    if (slot < now) return { status: "past" }
    const { swimmers, mine } = laneSwimmers(s, clubSlug, lane, slot)
    if (mine) return { status: "mine", swimmers }
    if (swimmers >= 2) return { status: "full", swimmers }
    return { status: "open", swimmers }
  }
  const pickAny = (slot: number) => {
    const opts = rows
      .map((r) => ({ r, i: info(r.id, slot) }))
      .filter((x) => x.i.status === "open")
    if (!opts.length)
      return toast({
        type: "info",
        title: `All ${lanes} lanes are taken at ${fmtTime(slot)}`,
      })
    const best = opts.sort(
      (a, b) => (b.i.swimmers ?? 0) - (a.i.swimmers ?? 0) || a.r.id - b.r.id
    )[0]
    setSel({ row: best.r.id, slot })
    announce(`Lane ${best.r.id} selected at ${fmtTime(slot)}`)
  }
  const sw = sel ? laneSwimmers(s, clubSlug, sel.row, sel.slot).swimmers : 0
  const reserve = async () => {
    if (!sel) return
    if (me.role === "teen" && !(me.permissions?.lanes && me.age >= 14)) {
      openDialog("askParent", {
        title: `Lane ${sel.row}, ${fmtDowTime(sel.slot)} at ${club.name}`,
      })
      return
    }
    setBusy(true)
    await new Promise((r) => setTimeout(r, 400))
    if (moving) {
      const r = moveReservation(moving.id, {
        start: sel.slot,
        resource: `Lane ${sel.row}`,
      })
      setBusy(false)
      if (r.ok) {
        toast({
          title: `Moved to Lane ${sel.row}`,
          description: fmtDowTime(sel.slot),
        })
        router.push("/bookings")
      } else setError(r.message)
      return
    }
    const r = reserveLane({
      clubSlug,
      lane: sel.row,
      start: sel.slot,
      partnerName: partner.trim() || undefined,
    })
    setBusy(false)
    if (r.ok) {
      setDone(r.booking)
      announce(`Lane ${sel.row} is yours, ${fmtDowTime(sel.slot)}`)
      toast({
        title: `Lane ${sel.row} is yours, ${fmtDowTime(sel.slot)}`,
        action: {
          label: "Undo",
          onClick: () => {
            cancelBooking(r.booking.id, { undoWindow: true })
            setDone(null)
            setSel(null)
          },
        },
      })
    } else {
      setError(r.message)
      setSel(null)
      toast({ type: "error", title: r.message })
    }
  }
  const noneAtAll =
    !notOpen &&
    !loading &&
    slots
      .filter((x) => x > now)
      .every((x) => rows.every((r) => info(r.id, x).status !== "open"))
  const waiting =
    me.role === "teen"
      ? s.requests.find(
          (r) =>
            r.teenId === me.id &&
            r.status === "pending" &&
            r.title.startsWith("Lane")
        )
      : undefined
  const needsParent =
    me.role === "teen" && !(me.permissions?.lanes && me.age >= 14)
  const parentName = me.parentId
    ? s.members[me.parentId].firstName
    : "your parent"
  const pu = pausedUntil(s, me.id, now)
  if (done)
    return (
      <div className="max-w-[560px]">
        <SuccessPanel
          pill="Reserved"
          headline={`${done.resource}, ${fmtRange(done.start, done.end)}`}
          summary={[
            {
              label: "When",
              value: `${fmtDay(done.start)} · ${fmtRange(done.start, done.end)}`,
            },
            { label: "Where", value: `${club.name} · ${club.pool?.label}` },
            { label: "Lane", value: done.resource },
            { label: "Reference", value: done.ref },
          ]}
          event={{
            title: `Lap lane, ${done.resource}`,
            start: done.start,
            end: done.end,
            location: club.address,
          }}
          shareText="https://my.cactuspeakathletic.example/lane"
          onDone={() => {
            setDone(null)
            setSel(null)
          }}
          extra={(() => {
            const c = cancelNote(s, me.id, done.start, now, "lane")
            return (
              <p
                className={
                  c.late
                    ? "rounded-md bg-warning-subtle px-3 py-2 text-caption"
                    : "text-caption text-muted-foreground"
                }
              >
                {c.text}
                {c.late ? "" : " Late cancels count as strikes."}
              </p>
            )
          })()}
        />
      </div>
    )
  if (!club.pool) return null
  return (
    <div className="flex flex-col gap-5 pb-28">
      <PageHeader
        eyebrow="Reserve"
        title={moving ? "Move your lane" : "Lap lanes"}
        description={`${club.pool.label} · ${lanes} lanes · 45-minute slots`}
        backHref="/reserve"
        backLabel="Reserve"
        actions={<AddToCalendarPlaceholder />}
      />
      {moving ? (
        <Banner
          tone="neutral"
          title={`Original selection: ${fmtDay(moving.start)}, ${fmtRange(moving.start, moving.end)}, ${moving.resource}`}
        />
      ) : null}
      {pu ? (
        <Banner tone="warning" title={`Booking is paused until ${fmtDay(pu)}.`}>
          You can still look at lanes.
        </Banner>
      ) : null}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <SelectBox
          label="Club"
          value={clubSlug}
          onChange={(v) => setParam({ club: v })}
          options={pools.map((c) => ({ value: c.slug, label: c.name }))}
          className="min-w-52"
        />
        <CheckRow checked={any} onChange={setAny} className="max-md:min-h-11">
          Any lane: tap a time to pick the best lane
        </CheckRow>
      </div>
      <div className="flex flex-col gap-1">
        <DayStrip
          selected={date}
          onSelect={(d) => setParam({ date: d === today ? "" : dateKey(d) })}
          now={now}
          windowDays={win}
          label="Choose a day"
        />
        <p className="text-detail text-muted-foreground">
          <span className="rounded-xs bg-muted px-2 py-0.5">
            Arizona time (no daylight saving)
          </span>{" "}
          The warm-water therapy pool is not reservable here.{" "}
          <Link className="text-link underline" href="/schedule?cat=aqua">
            See Aqua classes
          </Link>
        </p>
      </div>
      <h2 className="sr-only">Choose a lane and start time</h2>
      {loading ? (
        <LoadingBlock text="Checking availability…" rows={6} />
      ) : notOpen ? (
        <EmptyState
          object="wave"
          title={`${fmtDay(date)} lanes open ${fmtDay(opens)} at ${fmtTime(opens)}`}
          body="Lane slots open at the same time as classes."
        />
      ) : noneAtAll ? (
        <EmptyState
          object="pool"
          title={`All ${lanes} lanes are taken`}
          body="Try another day."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {wide ? (
            <SlotGrid
              kind="lane"
              rows={rows}
              slots={slots}
              info={info}
              selected={sel}
              onSelect={(r, sl) => {
                setSel({ row: r, slot: sl })
                announce(`Lane ${r} selected, ${fmtTime(sl)}`)
              }}
              onHeaderClick={any ? pickAny : undefined}
              label="Choose a lane and start time"
              disabled={offline || !!pu}
              now={now}
            />
          ) : (
            <SlotList
              kind="lane"
              rows={rows}
              slots={slots.filter(
                (sl) =>
                  sl > now && rows.some((r) => info(r.id, sl).status === "open")
              )}
              info={info}
              selected={sel}
              onSelect={(r, sl) => setSel({ row: r, slot: sl })}
              label="Choose a lane and start time"
              disabled={offline || !!pu}
            />
          )}
          <p className="text-detail text-muted-foreground">
            Two dots show the two swimmers a lane holds. Up to 2 swimmers share
            a lane, in circle swim. Pools close 30 minutes before the club. Lap
            lanes have no waitlist.
          </p>
          {sel ? (
            <div className="max-w-sm">
              <FormField
                label="Swimming with someone? Add a lane partner (optional)"
                help="A partner uses the 2nd place."
              >
                {(f) => (
                  <Input
                    {...f}
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    placeholder="Partner's name"
                  />
                )}
              </FormField>
            </div>
          ) : null}
        </div>
      )}
      <StickyBar>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 lg:px-8">
          <p className="min-w-0 flex-1 basis-64 text-caption">
            {waiting ? (
              <>
                <span className="text-label">Waiting for {parentName}.</span>{" "}
                {waiting.title}. Held until {fmtDay(waiting.expiresAt)},{" "}
                {fmtTime(waiting.expiresAt)}
              </>
            ) : sel ? (
              <>
                <span className="text-label">Lane {sel.row}</span> ·{" "}
                <span className="num">
                  {fmtDay(sel.slot)} · {fmtRange(sel.slot, sel.slot + 45 * MIN)}
                </span>{" "}
                · {club.name} · {sw === 1 ? "1 swimmer already" : "Empty lane"}
              </>
            ) : (
              "Pick a lane and time."
            )}
            {error ? (
              <span
                role="alert"
                className="mt-1 block font-semibold text-destructive"
              >
                {error}
              </span>
            ) : null}
          </p>
          <Button
            size="lg"
            disabled={!sel || offline || !!pu || !!waiting}
            loading={busy}
            onClick={() => void reserve()}
          >
            {waiting
              ? `Waiting for ${parentName}`
              : needsParent
                ? `Ask ${parentName}`
                : moving
                  ? "Move lane"
                  : "Reserve lane"}
          </Button>
        </div>
      </StickyBar>
    </div>
  )
}
function AddToCalendarPlaceholder() {
  return null
}
void AddToCalendar
void minutesOfDay
export default function LanesPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
