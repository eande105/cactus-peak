"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { AddToCalendar } from "@/components/booking/calendar-menu"
import { CancelDialog } from "@/components/booking/cancel-dialog"
import {
  calEventFor,
  WaitlistDialog,
} from "@/components/booking/session-action"
import {
  CalendarPlus,
  Check,
  ChevronDown,
  ListFilter,
  MessageSquare,
} from "@/components/icons"
import { MiniCalendar } from "@/components/kit/calendar"
import {
  Banner,
  EmptyState,
  LateCancelMeter,
  LoadingBlock,
  PageHeader,
  PersonAvatar,
  SectionTitle,
  Segmented,
  SelectBox,
  StatusPill,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  confirmHold,
  leaveWaitlist,
  rejoinWaitlist,
  releaseHold,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { sessionById } from "@/lib/data/sessions"
import { activeStrikes, pausedUntil } from "@/lib/engine"
import {
  DAY,
  dateKey,
  dayStart,
  fmtCountdown,
  fmtDay,
  fmtDayShort,
  fmtRange,
  fmtTime,
  HOUR,
  relDay,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking } from "@/lib/types"
import { useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const KIND: Record<Booking["kind"], string> = {
  class: "Class",
  court: "Court",
  lane: "Lane",
  kids: "Kids club",
  pt: "Training",
}

function evFor(b: Booking) {
  const se = b.sessionId ? sessionById(b.sessionId) : undefined
  if (se) return calEventFor(se)
  const club = CLUB_BY_SLUG[b.clubSlug]
  return {
    title: b.title,
    start: b.start,
    end: b.end,
    uid: b.id,
    location: `${club.name}, ${club.address}`,
    description: `${b.place}. Arizona time (no daylight saving).`,
  }
}

function BookingRow({
  b,
  group,
  who,
  now,
  open,
  onToggle,
}: {
  b: Booking
  group?: Booking[]
  who: string
  now: number
  open: boolean
  onToggle: () => void
}) {
  const { s } = useApp()
  const router = useRouter()
  const offline = useOffline()
  const [cancel, setCancel] = useState(false)
  const [wl, setWl] = useState(false)
  const club = CLUB_BY_SLUG[b.clubSlug]
  const se = b.sessionId ? sessionById(b.sessionId) : undefined
  const names = group?.map((g) => s.members[g.memberId].firstName).join(" and ")
  const person = s.members[b.memberId]
  const late = b.start - now < 2 * HOUR
  const held = b.status === "held" ? (b.holdExpiresAt ?? 0) - now : 0
  return (
    <li className={cn(`cat-${b.category}`, "relative")}>
      <div className="grid grid-cols-[72px_3px_minmax(0,1fr)] gap-x-3 py-3 md:grid-cols-[88px_3px_minmax(0,1fr)_auto] md:items-center">
        <span
          aria-hidden="true"
          className="order-2 w-[3px] self-stretch rounded-full bg-cat md:row-span-1"
        />
        <div className="order-1">
          <p className="num text-body-strong leading-tight whitespace-nowrap">
            {fmtTime(b.start)}
          </p>
          <p className="text-detail text-muted-foreground">
            {b.kind === "kids" ? (
              "2 h"
            ) : (
              <>
                <span className="num">
                  {Math.round((b.end - b.start) / 60000)}
                </span>{" "}
                min
              </>
            )}
          </p>
        </div>
        <div className="order-3 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-body-strong">
              {b.kind === "kids"
                ? `Kids club · ${names ?? person.firstName}`
                : b.title}
            </h3>
            {b.kind !== "class" ? (
              <span className="rounded-xs bg-muted px-1.5 text-detail">
                {KIND[b.kind]}
              </span>
            ) : null}
            {b.status === "held" ? (
              <StatusPill tone="warning">Held</StatusPill>
            ) : b.status === "waitlisted" ? (
              <StatusPill tone="neutral">On the waitlist</StatusPill>
            ) : b.status === "pending_approval" ? (
              <StatusPill tone="neutral">Waiting for a parent</StatusPill>
            ) : null}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-caption text-muted-foreground">
            {b.kind === "class"
              ? `${b.place} · ${club.name}`
              : b.kind === "kids"
                ? club.name
                : b.place}
            {b.resource && b.kind !== "court" ? "" : ""}
            {person.id !== who && b.kind !== "kids" ? (
              <span className="inline-flex items-center gap-1">
                <PersonAvatar
                  name={person.firstName}
                  hue={person.hue}
                  size={20}
                />
                {person.firstName}
              </span>
            ) : null}
            {b.status === "waitlisted" ? (
              <span>
                · {b.position === 2 ? "2nd" : `#${b.position}`} in line
              </span>
            ) : null}
          </p>
        </div>
        <div className="order-4 col-span-1 col-start-3 mt-2 flex flex-wrap items-center gap-2 md:col-start-auto md:mt-0 md:justify-end">
          {b.status === "held" ? (
            <Button
              size="sm"
              onClick={() => {
                const r = confirmHold(b.id)
                if (r.ok) {
                  toast({
                    title: "You're booked",
                    description: r.lateNow
                      ? "Cancelling now counts as a late cancel."
                      : undefined,
                  })
                  announce("Spot confirmed.")
                } else toast({ type: "error", title: r.message })
              }}
            >
              Confirm spot · <span className="num">{fmtCountdown(held)}</span>
            </Button>
          ) : null}
          {b.status === "held" ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                releaseHold(b.id)
                toast({ title: "Released" })
              }}
            >
              Release
            </Button>
          ) : null}
          {b.status === "waitlisted" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                leaveWaitlist(b.id)
                toast({
                  title: "You left the waitlist",
                  action: {
                    label: "Undo",
                    onClick: () => rejoinWaitlist(b.id),
                  },
                })
              }}
            >
              Leave waitlist
            </Button>
          ) : null}
          {b.status === "booked" || b.status === "pending_approval" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onToggle}
              aria-expanded={open}
            >
              Details
              <ChevronDown
                className={cn("transition-transform", open && "rotate-180")}
                aria-hidden="true"
                data-icon="inline-end"
              />
            </Button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div className="mb-3 ml-[calc(88px+4px+1.5rem)] grid gap-4 rounded-md bg-muted p-4 text-caption max-md:ml-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="eyebrow text-muted-foreground">Where</p>
            <p>{club.address}</p>
            {se ? (
              <p>
                {se.studio} · {INSTRUCTOR_BY_ID[se.instructorId]?.name}
              </p>
            ) : (
              <p>{b.place}</p>
            )}
            {b.spot ? <p className="num">{b.spot}</p> : null}
            {b.resource ? <p className="num">{b.resource}</p> : null}
          </div>
          <div className="flex flex-col gap-1">
            <p className="eyebrow text-muted-foreground">Booking reference</p>
            <p className="w-fit rounded-sm border border-border bg-card px-2 py-1 num text-body-strong">
              {b.ref}
            </p>
            <p>
              {b.kind === "kids"
                ? "Free to cancel. Please give 2 hours' notice."
                : late
                  ? "Cancelling now counts as a late cancel."
                  : `Free to cancel until ${fmtTime(b.start - (b.kind === "pt" ? 24 : 2) * HOUR)}`}
            </p>
          </div>
          {b.players?.length ? (
            <div className="sm:col-span-2">
              <p className="mb-1 eyebrow text-muted-foreground">Players</p>
              <ul className="flex flex-wrap gap-2">
                {b.players.map((p) => (
                  <li key={p.name} className="rounded-full bg-card px-3 py-1">
                    {p.name} ·{" "}
                    {p.status === "confirmed"
                      ? "Confirmed"
                      : p.status === "guest"
                        ? "Guest pass"
                        : "Invited"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {se ? (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/schedule/${se.id}`} scroll={false} />}
              >
                Class details
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/clubs/${b.clubSlug}`} />}
              >
                Club details
              </Button>
            )}
            <AddToCalendar
              event={evFor(b)}
              variant="outline"
              className="!min-h-9 !px-4 text-caption"
            >
              Add to calendar
            </AddToCalendar>
            {b.kind === "court" || b.kind === "lane" || b.kind === "pt" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(
                    b.kind === "pt"
                      ? `/training/coaches/${b.coachSlug}/book?move=${b.id}`
                      : `/reserve/${b.kind === "court" ? "courts" : "lanes"}?club=${b.clubSlug}&move=${b.id}`
                  )
                }
              >
                Move
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              disabled={offline}
              onClick={() => setCancel(true)}
            >
              {late && b.kind !== "kids" ? "Cancel (late)" : "Cancel"}
            </Button>
          </div>
        </div>
      ) : null}
      {se ? (
        <WaitlistDialog
          se={se}
          forId={b.memberId}
          open={wl}
          onOpenChange={setWl}
        />
      ) : null}
      <CancelDialog
        booking={group?.length ? b : b}
        open={cancel}
        onOpenChange={setCancel}
      />
    </li>
  )
}

function Inner() {
  const { s, me, hh, now } = useApp()
  const sp = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [open, setOpen] = useState<string | null>(null)
  const [pastFilter, setPastFilter] = useState<
    "all" | "attended" | "cancelled"
  >("all")
  const [pastN, setPastN] = useState(10)
  const [day, setDay] = useState(dayStart(now))
  const who = sp.get("who") ?? "all"
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const tab = sp.get("tab")
    if (tab && !loading)
      document
        .getElementById(`block-${tab}`)
        ?.scrollIntoView({ block: "start" })
  }, [sp, loading])
  const household = Object.values(s.members).filter(
    (m) => m.householdId === hh.id
  )
  const ids =
    me.role === "teen"
      ? [me.id]
      : who === "all"
        ? household.map((m) => m.id)
        : [who]
  const mine = s.bookings.filter(
    (b) =>
      ids.includes(b.memberId) &&
      (me.role === "teen" ||
        b.memberId === me.id ||
        b.ownerId === me.id ||
        me.role !== "child")
  )
  const group = (list: Booking[]) => {
    const out: { b: Booking; group?: Booking[] }[] = []
    for (const b of list) {
      if (b.kind === "kids") {
        const prev = out.find(
          (o) =>
            o.b.kind === "kids" &&
            o.b.ref === b.ref &&
            o.b.start === b.start &&
            o.b.status === b.status
        )
        if (prev) {
          prev.group!.push(b)
          continue
        }
        out.push({ b, group: [b] })
      } else out.push({ b })
    }
    return out
  }
  const upcoming = group(
    mine
      .filter(
        (b) =>
          ["booked", "held", "pending_approval"].includes(b.status) &&
          b.end > now
      )
      .sort((a, b) => a.start - b.start)
  )
  const waiting = mine
    .filter((b) => b.status === "waitlisted" && b.start > now)
    .sort((a, b) => a.start - b.start)
  const pastAll = mine
    .filter(
      (b) =>
        ["attended", "late_cancelled", "cancelled", "no_show"].includes(
          b.status
        ) ||
        (["booked"].includes(b.status) && b.end <= now)
    )
    .sort((a, b) => b.start - a.start)
  const past = pastAll.filter(
    (b) =>
      pastFilter === "all" ||
      (pastFilter === "attended"
        ? b.status === "attended"
        : b.status !== "attended")
  )
  const byDay = upcoming.reduce<Record<number, typeof upcoming>>((acc, r) => {
    const day = dayStart(r.b.start)
    acc[day] ??= []
    acc[day].push(r)
    return acc
  }, {})
  const strikes = activeStrikes(s, me.id, now)
  const pu = pausedUntil(s, me.id, now)
  // biome-ignore lint/correctness/useExhaustiveDependencies: `upcoming` is a new array each render, so the length is the stable key
  const marks = useMemo(
    () => new Set(upcoming.map((r) => dateKey(r.b.start))),
    [upcoming.length]
  )
  if (loading) return <LoadingBlock text="Loading your bookings…" rows={5} />
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="My bookings"
        description="Everything on your calendar: classes, courts, lanes, kids club and training."
        actions={
          <>
            <Segmented
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: "list", label: "List" },
                { value: "calendar", label: "Calendar" },
              ]}
            />
            {me.role !== "teen" && household.length > 1 ? (
              <SelectBox
                label="Who"
                value={who}
                onChange={(v) => router.replace(`/bookings?who=${v}`)}
                options={[
                  { value: "all", label: "Everyone" },
                  ...household
                    .filter((m) => m.role !== "teen" || true)
                    .map((m) => ({ value: m.id, label: m.firstName })),
                ]}
              />
            ) : null}
            <Button
              variant="outline"
              render={<Link href="/settings/calendar" />}
            >
              <CalendarPlus aria-hidden="true" data-icon="inline-start" />
              Calendar feed
            </Button>
          </>
        }
      />
      {strikes.length || pu ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 rule-t">
          <p className="eyebrow text-muted-foreground">Late cancels</p>
          <LateCancelMeter count={strikes.length} />
          <p className="min-w-0 flex-1 basis-60 text-caption">
            {strikes.length} of 3 in the last 30 days
            {strikes.length
              ? `. Clears ${fmtDayShort(strikes[0].at + 30 * DAY)}.`
              : "."}{" "}
            <Link
              href="/help"
              className="text-link inline-flex min-h-11 items-center underline"
            >
              How it works
            </Link>
          </p>
        </div>
      ) : null}
      {view === "calendar" ? (
        <div className="grid gap-8 md:grid-cols-[22rem_1fr]">
          <MiniCalendar
            today={now}
            selected={day}
            onSelect={setDay}
            marks={marks}
            label="Your bookings"
          />
          <div>
            <SectionTitle>{fmtDay(day)}</SectionTitle>
            {(() => {
              const rows = upcoming.filter((r) => dayStart(r.b.start) === day)
              return rows.length ? (
                <ul className="mt-2 rule-rows">
                  {rows.map((r) => (
                    <BookingRow
                      key={r.b.id}
                      b={r.b}
                      group={r.group}
                      who={me.id}
                      now={now}
                      open={open === r.b.id}
                      onToggle={() => setOpen(open === r.b.id ? null : r.b.id)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-muted-foreground">
                  Nothing booked this day.
                </p>
              )
            })()}
          </div>
        </div>
      ) : (
        <>
          {me.role === "teen" &&
          s.requests.some(
            (r) => r.teenId === me.id && r.status === "pending"
          ) ? (
            <section aria-label="Requests">
              <ul className="rule-rows">
                {s.requests
                  .filter((r) => r.teenId === me.id && r.status === "pending")
                  .map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <span className="text-label">{r.title}</span>
                      <StatusPill tone="neutral">
                        Waiting for {s.members[r.parentId].firstName}
                      </StatusPill>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
          <section
            id="block-upcoming"
            aria-labelledby="up"
            className="scroll-mt-24"
          >
            <SectionTitle id="up">
              Upcoming{" "}
              <span className="num text-muted-foreground">
                · {upcoming.length}
              </span>
            </SectionTitle>
            {upcoming.length ? (
              <div className="mt-3 flex flex-col gap-4">
                {Object.entries(byDay).map(([d, rows]) => (
                  <div key={d}>
                    <h3 className="py-2 eyebrow text-muted-foreground">
                      {relDay(Number(d), now) === "Today" ||
                      relDay(Number(d), now) === "Tomorrow"
                        ? `${relDay(Number(d), now)} · ${fmtDay(Number(d))}`
                        : fmtDay(Number(d))}
                    </h3>
                    <ul className="rule-rows">
                      {rows.map((r) => (
                        <BookingRow
                          key={r.b.id}
                          b={r.b}
                          group={r.group}
                          who={me.id}
                          now={now}
                          open={open === r.b.id}
                          onToggle={() =>
                            setOpen(open === r.b.id ? null : r.b.id)
                          }
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                object="schedule"
                title="No classes booked yet"
                body="Pick a class and we'll save your spot."
                action={
                  <Button render={<Link href="/schedule" />}>
                    Book a class
                  </Button>
                }
              />
            )}
          </section>
          <section
            id="block-waitlist"
            aria-labelledby="wl"
            className="scroll-mt-24"
          >
            <SectionTitle id="wl">
              Waitlist{" "}
              <span className="num text-muted-foreground">
                · {waiting.length}
              </span>
            </SectionTitle>
            {waiting.length ? (
              <ul className="mt-2 rule-rows">
                {waiting.map((b) => (
                  <BookingRow
                    key={b.id}
                    b={b}
                    who={me.id}
                    now={now}
                    open={false}
                    onToggle={() => {}}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState
                object="stopwatch"
                title="You are not on any waitlists"
                body="Full class? Join its waitlist and we will book you if a spot opens."
                action={
                  <Button render={<Link href="/schedule" />}>
                    Browse today&apos;s classes
                  </Button>
                }
              />
            )}
          </section>
          <section
            id="block-past"
            aria-labelledby="pa"
            className="scroll-mt-24"
          >
            <SectionTitle
              id="pa"
              action={
                <SelectBox
                  label="Show"
                  hideLabel
                  value={pastFilter}
                  onChange={setPastFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "attended", label: "Attended" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                />
              }
            >
              Past and cancelled
            </SectionTitle>
            {past.length ? (
              <>
                <ul className="mt-2 rule-rows">
                  {past.slice(0, pastN).map((b) => {
                    const fb =
                      b.status === "attended" &&
                      !b.feedbackDone &&
                      now - b.end < 7 * DAY &&
                      b.kind === "class"
                    return (
                      <li
                        key={b.id}
                        className={cn(
                          `cat-${b.category}`,
                          "grid grid-cols-[4px_1fr_auto] items-center gap-x-3 py-3 md:grid-cols-[88px_4px_1fr_auto]"
                        )}
                      >
                        <span className="hidden num text-body-strong md:block">
                          {fmtTime(b.start)}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-9 w-1 rounded-full bg-cat"
                        />
                        <span className="min-w-0">
                          <span className="block text-label">
                            {b.kind === "kids"
                              ? `Kids club · ${s.members[b.memberId].firstName}`
                              : b.title}
                          </span>
                          <span className="block text-caption text-muted-foreground">
                            {fmtDay(b.start)} · {fmtRange(b.start, b.end)} ·{" "}
                            {b.place}
                          </span>
                        </span>
                        <span className="flex items-center gap-3">
                          {fb ? (
                            <button
                              type="button"
                              className="text-link inline-flex min-h-11 items-center text-caption underline"
                              onClick={() =>
                                import("@/lib/ui-state").then((m) =>
                                  m.openDialog("feedback", b.id)
                                )
                              }
                            >
                              <MessageSquare
                                className="mr-1 inline size-3.5"
                                aria-hidden="true"
                              />
                              Give feedback
                            </button>
                          ) : null}
                          {b.status === "attended" ? (
                            <StatusPill tone="success" icon={Check}>
                              Attended
                            </StatusPill>
                          ) : b.status === "late_cancelled" ? (
                            <StatusPill tone="warning">Late cancel</StatusPill>
                          ) : b.status === "no_show" ? (
                            <StatusPill tone="warning">Missed</StatusPill>
                          ) : (
                            <StatusPill>Cancelled</StatusPill>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {past.length > pastN ? (
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setPastN((n) => n + 10)}
                  >
                    Show 10 more
                  </Button>
                ) : null}
              </>
            ) : (
              <EmptyState
                object="heart-watch"
                title="No past classes yet"
                body="Your finished classes will show here."
              />
            )}
          </section>
        </>
      )}
      {pu ? (
        <Banner tone="warning" title={`Booking is paused until ${fmtDay(pu)}`}>
          You can still cancel and check in.
        </Banner>
      ) : null}
    </div>
  )
}
void ListFilter
export default function BookingsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
