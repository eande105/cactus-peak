"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Modal } from "@/components/kit/overlays"
import {
  Banner,
  EmptyState,
  FormField,
  LoadingBlock,
  PageHeader,
  Segmented,
  SelectBox,
} from "@/components/kit/ui"
import {
  LockedCard,
  SlotHoldTimer,
  Stepper,
  StickyBar,
} from "@/components/reserve/common"
import {
  type CellInfo,
  SlotGrid,
  SlotList,
} from "@/components/reserve/slot-grid"
import { DayStrip } from "@/components/schedule/day-strip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/hooks/use-media"
import { addRemind, moveReservation, reserveCourt } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import {
  cancelNote,
  courtBlocks,
  courtCount,
  gridSlots,
  guestPassesLeft,
  opensAt,
  pausedUntil,
} from "@/lib/engine"
import {
  addDays,
  DAY,
  dateKey,
  dayStart,
  fmtDay,
  fmtDowTime,
  fmtRange,
  fmtTime,
  fromKey,
  HOUR,
  MIN,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import { openDialog, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const SPORTS = {
  pickleball: "Pickleball",
  tennis: "Tennis",
  basketball: "Basketball",
} as const
type Sport = keyof typeof SPORTS
const ROSTER = [
  "Linda Park",
  "Pat Lowe",
  "Dana Kessler",
  "Marty Gómez",
  "Sofia Reyes",
]

function Inner() {
  const { s, me, hh, now, club: viewing } = useApp()
  const router = useRouter()
  const sp = useSearchParams()
  const wide = useMedia("(min-width: 1024px)")
  const xl = useMedia("(min-width: 1280px)")
  const offline = useOffline()
  const [loading, setLoading] = useState(false)
  const withCourts = CLUBS.filter((c) => c.courts.length)
  const clubSlug =
    sp.get("club") ??
    (CLUB_BY_SLUG[viewing].courts.length ? viewing : withCourts[0].slug)
  const club = CLUB_BY_SLUG[clubSlug]
  const sports = club.courts.map((c) => c.sport) as Sport[]
  const sport =
    (sp.get("sport") as Sport | null) &&
    sports.includes(sp.get("sport") as Sport)
      ? (sp.get("sport") as Sport)
      : sports[0]
  const dur = (Number(sp.get("dur")) === 90 ? 90 : 60) as 60 | 90
  const today = dayStart(now)
  const date = sp.get("date") ? fromKey(sp.get("date")!) : today
  const moveId = sp.get("move")
  const moving = moveId ? s.bookings.find((b) => b.id === moveId) : undefined
  const [sel, setSel] = useState<{ row: number; slot: number } | null>(null)
  const [holdUntil, setHoldUntil] = useState(0)
  const [extended, setExtended] = useState(false)
  const [ended, setEnded] = useState<{ row: number; slot: number } | null>(null)
  const [count, setCount] = useState(2)
  const [players, setPlayers] = useState<
    { kind: "member" | "guest"; name: string }[]
  >([{ kind: "member", name: "" }])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: clubSlug restarts the fake load delay when the club changes
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [clubSlug])
  const setParam = (p: Record<string, string>) => {
    const q = new URLSearchParams(sp)
    Object.entries(p).forEach(([k, v]) => {
      if (v) q.set(k, v)
      else q.delete(k)
    })
    router.replace(`/reserve/courts?${q}`, { scroll: false })
    setSel(null)
    setHoldUntil(0)
  }
  const n = courtCount(clubSlug, sport)
  const rows = Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    label: `Court ${i + 1}`,
    sub: `${SPORTS[sport]}${club.slug === "mesa-red-mountain" ? ", outdoor" : ", indoor"}`,
  }))
  const slots = gridSlots(date, "court").filter((x) => x + 30 * MIN > now)
  const opens = opensAt(date + 9 * HOUR, 3)
  const notOpen = now < opens
  const maxPlayers = sport === "basketball" ? 10 : 4
  const changeCount = (c: number) => {
    setCount(c)
    setPlayers((p) => {
      const next = p.slice(0, c - 1)
      while (next.length < c - 1) next.push({ kind: "member", name: "" })
      return next
    })
  }
  const mineRanges = s.bookings.filter(
    (b) =>
      b.kind === "court" &&
      b.status === "booked" &&
      b.clubSlug === clubSlug &&
      s.members[b.memberId].householdId === hh.id
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: rows is rebuilt each render and n stands for it, so it is left out on purpose
  const blocksFor = useMemo(
    () =>
      Object.fromEntries(
        rows.map((r) => [
          r.id,
          courtBlocks(s, clubSlug, sport, r.id, date).blocks,
        ])
      ),
    [s, clubSlug, sport, date, n]
  )
  const closeAt =
    dayStart(date) +
    (new Date(date + 3600e3 * -7).getUTCDay() === 0 ||
    new Date(date - 7 * HOUR).getUTCDay() === 6
      ? 20
      : 21) *
      HOUR
  const info = (court: number, slot: number): CellInfo => {
    if (slot < now) return { status: "past" }
    if (notOpen)
      return { status: "notOpen", label: `Opens ${fmtDowTime(opens)}` }
    const bl = blocksFor[court] ?? []
    const hit = bl.find((b) => b.from < slot + 30 * MIN && b.to > slot)
    if (hit)
      return {
        status: mineRanges.some(
          (m) =>
            m.resource === `Court ${court}` &&
            m.start < slot + 30 * MIN &&
            m.end > slot
        )
          ? "mine"
          : hit.kind === "closed"
            ? "closed"
            : "taken",
      }
    if (
      bl.some((b) => b.from < slot + dur * MIN && b.to > slot) ||
      slot + dur * MIN > closeAt
    )
      return { status: "short" }
    return { status: "open" }
  }
  const select = (row: number, slot: number) => {
    setError("")
    setSel({ row, slot })
    setHoldUntil(now + 5 * MIN)
    setExtended(false)
    announce(
      `Court ${row} selected, ${fmtTime(slot)} to ${fmtTime(slot + dur * MIN)}`
    )
  }
  const free = (court: number, slot: number) =>
    info(court, slot).status === "open"
  const noneOpen =
    !loading &&
    !notOpen &&
    rows.every((r) => slots.every((sl) => !free(r.id, sl)))
  const guests = players.filter((p) => p.kind === "guest").length
  const { left: passesLeft } = guestPassesLeft(s, hh.id, now)
  const teen = me.role === "teen"
  const waiting = teen
    ? s.requests.find(
        (r) =>
          r.teenId === me.id &&
          r.status === "pending" &&
          r.title.startsWith("Court")
      )
    : undefined
  const needsParent = teen && !me.permissions?.courts
  const parentName = me.parentId
    ? s.members[me.parentId].firstName
    : "your parent"
  const resolved = (p: { kind: "member" | "guest"; name: string }) =>
    p.kind === "guest"
      ? p.name.trim().length > 1
      : !!Object.values(s.members).find(
          (m) =>
            m.role !== "child" &&
            m.id !== me.id &&
            `${m.firstName} ${m.lastName}`.toLowerCase() ===
              p.name.trim().toLowerCase()
        ) || ROSTER.some((r) => r.toLowerCase() === p.name.trim().toLowerCase())
  const valid = sel && (needsParent || players.every(resolved)) && !offline
  const label = sel ? `Reserve Court ${sel.row}` : "Reserve a court"
  const reserve = async () => {
    if (!sel) return
    if (needsParent) {
      openDialog("askParent", {
        title: `Court ${sel.row}, ${fmtDowTime(sel.slot)} at ${club.name}`,
      })
      return
    }
    setBusy(true)
    await new Promise((r) => setTimeout(r, 450))
    const member = (nm: string) =>
      Object.values(s.members).find(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase() ===
          nm.trim().toLowerCase()
      )
    if (moving) {
      const r = moveReservation(moving.id, {
        start: sel.slot,
        resource: `Court ${sel.row}`,
      })
      setBusy(false)
      if (r.ok) {
        toast({
          title: `Moved to Court ${sel.row}`,
          description: fmtDowTime(sel.slot),
        })
        router.push("/bookings")
      } else setError(r.message)
      return
    }
    const r = reserveCourt({
      clubSlug,
      sport,
      court: sel.row,
      start: sel.slot,
      duration: dur,
      players: players.map((p) => ({
        name: p.name.trim(),
        kind: p.kind,
        memberId: p.kind === "member" ? member(p.name)?.id : undefined,
      })),
    })
    setBusy(false)
    if (r.ok) {
      announce(`Court ${sel.row} is yours.`)
      router.push(`/reserve/confirmed/${r.booking.id}`)
    } else {
      setError(r.message)
      announce(r.message)
      if (r.code === "SLOT_TAKEN") {
        setSel(null)
        setHoldUntil(0)
        toast({ type: "error", title: r.message })
      }
    }
  }
  const playersPanel = sel ? (
    <aside
      aria-label="Players"
      className="flex flex-col gap-4 rounded-lg bg-card p-4 edge ring-border"
    >
      <Stepper
        label="How many players?"
        value={count}
        min={2}
        max={maxPlayers}
        onChange={changeCount}
        help={
          sport === "basketball"
            ? "2 to 10 for basketball."
            : "2 to 4 for pickleball and tennis."
        }
      />
      <datalist id="roster">
        {ROSTER.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      {players.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: player slots have no id and only change at the end of the list
        <div key={i} className="flex flex-col gap-2 pt-3 rule-t">
          <Segmented
            label={`Player ${i + 2} type`}
            size="sm"
            value={p.kind}
            onChange={(k) =>
              setPlayers((a) =>
                a.map((x, j) => (j === i ? { ...x, kind: k } : x))
              )
            }
            options={[
              { value: "member", label: "Member" },
              { value: "guest", label: "Guest" },
            ]}
          />
          <FormField
            label={
              p.kind === "member"
                ? `Player ${i + 2}: search members`
                : `Player ${i + 2}: guest's name`
            }
            error={
              p.name.trim() && !resolved(p)
                ? p.kind === "member"
                  ? "Pick a member from the list, or switch to Guest."
                  : "Enter the guest's name."
                : undefined
            }
          >
            {(f) => (
              <Input
                {...f}
                list={p.kind === "member" ? "roster" : undefined}
                value={p.name}
                onChange={(e) =>
                  setPlayers((a) =>
                    a.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x
                    )
                  )
                }
                placeholder={p.kind === "member" ? "Linda Park" : "Guest name"}
              />
            )}
          </FormField>
          {p.kind === "guest" ? (
            <p className="text-detail text-muted-foreground">
              {passesLeft -
                players.slice(0, i).filter((x) => x.kind === "guest").length >
              0
                ? `Uses 1 guest pass. You have ${passesLeft} left.`
                : "Costs $20 per guest. Charged to your card on file."}
            </p>
          ) : (
            <p className="text-detail text-muted-foreground">
              We send an invite. They add it to their calendar when they accept.
            </p>
          )}
        </div>
      ))}
      {holdUntil ? (
        <SlotHoldTimer
          holdUntil={holdUntil}
          now={now}
          what={`Court ${sel.row}`}
          canExtend={!extended}
          onExtend={() => {
            setHoldUntil((h) => h + 5 * MIN)
            setExtended(true)
          }}
          onExpire={() => {
            setEnded(sel)
            setSel(null)
            setHoldUntil(0)
          }}
        />
      ) : null}
      {(() => {
        const c = cancelNote(s, me.id, sel.slot, now, "court")
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
    </aside>
  ) : null
  if (hh.plan === "trailhead")
    return (
      <div>
        <PageHeader eyebrow="Reserve" title="Courts" />
        <LockedCard
          title="Courts come with Ridge and Summit."
          body="Trailhead covers pools and classes at your home club."
        />
      </div>
    )
  const pu = pausedUntil(s, me.id, now)
  return (
    <div className="flex flex-col gap-5 pb-28">
      <PageHeader
        eyebrow="Reserve"
        title={moving ? "Move your court" : "Courts"}
        backHref="/reserve"
        backLabel="Reserve"
      />
      {moving ? (
        <Banner
          tone="neutral"
          title={`Original selection: ${fmtDay(moving.start)}, ${fmtRange(moving.start, moving.end)}, ${moving.resource}`}
        >
          Free to move until {fmtTime(moving.start - 2 * HOUR)}
        </Banner>
      ) : null}
      {pu ? (
        <Banner tone="warning" title={`Booking is paused until ${fmtDay(pu)}.`}>
          You can still look at courts.
        </Banner>
      ) : null}
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-end gap-x-4 gap-y-3 bg-background px-4 py-3 md:top-16 md:mx-0 md:px-0">
        <SelectBox
          label="Club"
          value={clubSlug}
          onChange={(v) => setParam({ club: v, sport: "" })}
          options={withCourts.map((c) => ({ value: c.slug, label: c.name }))}
          className="min-w-52"
        />
        {sports.length > 1 ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-label">Sport</span>
            <Segmented
              label="Sport"
              value={sport}
              onChange={(v) => setParam({ sport: v })}
              options={sports.map((v) => ({ value: v, label: SPORTS[v] }))}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-label">Sport</span>
            <p className="flex min-h-11 items-center text-body">
              {SPORTS[sport]} · <span className="ml-1 num">{n}</span> courts
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="text-label">Duration</span>
          <Segmented
            label="Duration"
            value={dur}
            onChange={(v) => setParam({ dur: String(v) })}
            options={[
              { value: 60, label: "60 min" },
              { value: 90, label: "90 min" },
            ]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <DayStrip
          selected={date}
          onSelect={(d) => setParam({ date: d === today ? "" : dateKey(d) })}
          now={now}
          windowDays={3}
          days={5}
          label="Choose a day"
        />
        <p className="text-detail text-muted-foreground">
          <span className="rounded-xs bg-muted px-2 py-0.5">
            Arizona time (no daylight saving)
          </span>
        </p>
      </div>
      <h2 className="sr-only">Choose a court and start time</h2>
      {loading ? (
        <LoadingBlock text="Checking availability…" rows={6} />
      ) : notOpen ? (
        <EmptyState
          object="paddle"
          title={`${fmtDay(date)} courts open ${fmtDay(opens)} at ${fmtTime(opens)}`}
          body="Courts open 3 days ahead at 6:00 a.m. We can remind you."
          action={
            <Button
              onClick={() => {
                addRemind(`court-${dateKey(date)}`)
                toast({ title: "We'll remind you" })
              }}
            >
              Remind me
            </Button>
          }
        />
      ) : noneOpen ? (
        <Banner
          tone="warning"
          title={`Every court is taken on ${fmtDay(date)}.`}
          actions={
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setParam({ date: dateKey(addDays(date, 1)) })}
              >
                Try the next day
              </Button>
              {club.slug !== "mesa-dobson" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setParam({ club: "mesa-dobson" })}
                >
                  Mesa – Dobson
                </Button>
              ) : null}
            </>
          }
        >
          Try another day, or another club.
        </Banner>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            sel && !needsParent && "xl:grid-cols-[minmax(0,1fr)_320px]"
          )}
        >
          <div className="flex min-w-0 flex-col gap-3">
            {wide ? (
              <SlotGrid
                kind="court"
                rows={rows}
                slots={slots}
                info={info}
                selected={sel}
                rangeCells={dur / 30}
                onSelect={select}
                label="Choose a court and start time"
                disabled={offline || !!pu}
                now={now}
              />
            ) : (
              <SlotList
                kind="court"
                rows={rows}
                slots={slots.filter((sl) => rows.some((r) => free(r.id, sl)))}
                info={info}
                selected={sel}
                onSelect={select}
                label="Choose a court and start time"
                disabled={offline || !!pu}
              />
            )}
            <ul
              className="flex flex-wrap gap-x-5 gap-y-1 text-detail text-muted-foreground"
              aria-label="Legend"
            >
              <li className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full bg-success"
                  aria-hidden="true"
                />
                Free
              </li>
              <li className="flex items-center gap-1.5">
                <span
                  className="rounded-xs size-3 bg-night"
                  aria-hidden="true"
                />
                Selected
              </li>
              <li>
                <span className="font-semibold">Yours</span> · mine
              </li>
              <li className="flex items-center gap-1.5">
                <span
                  className="rounded-xs size-3 bg-muted hatch"
                  aria-hidden="true"
                />
                Taken or closed
              </li>
              <li>Dimmed: not enough time for {dur} minutes</li>
            </ul>
            {offline ? (
              <p className="text-caption text-muted-foreground">
                Reconnect to reserve.
              </p>
            ) : null}
          </div>
          {xl && !needsParent ? playersPanel : null}
        </div>
      )}
      {!xl && !needsParent ? (
        <Modal
          open={!!sel && !wide}
          onOpenChange={(o) => {
            if (!o) {
              setSel(null)
              setHoldUntil(0)
            }
          }}
          title="Who's playing?"
          description={
            sel
              ? `Court ${sel.row} · ${fmtDay(sel.slot)} · ${fmtRange(sel.slot, sel.slot + dur * MIN)}`
              : undefined
          }
        >
          {playersPanel}
          <Button
            className="w-full"
            disabled={!valid}
            loading={busy}
            onClick={() => void reserve()}
          >
            {label}
          </Button>
        </Modal>
      ) : null}
      {!xl && wide && sel && !needsParent ? <div>{playersPanel}</div> : null}
      {needsParent ? (
        <p className="text-caption text-muted-foreground">
          Courts need {parentName}&apos;s OK. Pick a time, then ask. The time is
          held for 24 hours.
        </p>
      ) : null}
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
                <span className="text-label">
                  {SPORTS[sport]} · Court {sel.row}
                </span>{" "}
                ·{" "}
                <span className="num">
                  {fmtDay(sel.slot)} ·{" "}
                  {fmtRange(sel.slot, sel.slot + dur * MIN)}
                </span>{" "}
                · {club.name}
              </>
            ) : (
              "Pick a free time to hold a court for 5 minutes."
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
          <div className="flex items-center gap-2">
            {sel && !waiting ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSel(null)
                  setHoldUntil(0)
                }}
              >
                Clear
              </Button>
            ) : null}
            <Button
              size="lg"
              disabled={!valid || !!waiting}
              loading={busy}
              onClick={() => void reserve()}
            >
              {waiting
                ? `Waiting for ${parentName}`
                : needsParent
                  ? `Ask ${parentName}`
                  : moving
                    ? `Move to ${sel ? `Court ${sel.row}` : "this court"}`
                    : label}
            </Button>
          </div>
        </div>
      </StickyBar>
      <Modal
        open={!!ended}
        onOpenChange={(o) => !o && setEnded(null)}
        title="Your hold ended"
        description="The court is open to others. Pick it again?"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEnded(null)}>
            Close
          </Button>
          <Button
            onClick={() => {
              if (ended && free(ended.row, ended.slot))
                select(ended.row, ended.slot)
              else
                toast({
                  type: "error",
                  title: "Court was just booked. Pick another time.",
                })
              setEnded(null)
            }}
          >
            Pick again
          </Button>
        </div>
      </Modal>
      {guests > passesLeft ? null : null}
    </div>
  )
}
void Link
void DAY
export default function CourtsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
