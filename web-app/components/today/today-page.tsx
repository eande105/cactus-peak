"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { CancelDialog } from "@/components/booking/cancel-dialog"
import { SessionAction } from "@/components/booking/session-action"
import {
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  Pause,
  Sparkles,
} from "@/components/icons"
import { Collapse } from "@/components/kit/collapse"
import { ProgressRibs } from "@/components/kit/progress"
import { BusynessMeter, IntensityRibs } from "@/components/kit/ribs"
import { SectionTitle, SelectBox } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { confirmHold, releaseHold } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { sessionById, sessionsForDay } from "@/lib/data/sessions"
import {
  busyHint,
  cancelNote,
  clubOpen,
  guestPassesLeft,
  liveBusyness,
  opensAt,
  paymentDaysLate,
  sessionLeft,
  weekStart,
  windowDays,
} from "@/lib/engine"
import {
  addDays,
  DAY,
  dayStart,
  endSentence,
  fmtCountdown,
  fmtDay,
  fmtDayLong,
  fmtDayShort,
  fmtDowTime,
  fmtRange,
  fmtTime,
  HOUR,
  MIN,
  parts,
} from "@/lib/time"
import type { Booking } from "@/lib/types"
import { openDialog, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const plural = (n: number, w: string) => `${n} ${n === 1 ? w : `${w}s`}`

// "in 14 minutes", "in 2 h 10 min", "tomorrow 4:30 p.m.", "Thursday 6:00 a.m."
function whenText(start: number, now: number) {
  if (start - now >= 6 * HOUR)
    return `${Math.round((dayStart(start) - dayStart(now)) / DAY) === 0 ? "today" : Math.round((dayStart(start) - dayStart(now)) / DAY) === 1 ? "tomorrow" : fmtDay(start).split(",")[0]} at ${fmtTime(start)}`
  const diff = start - now
  const m = Math.max(1, Math.round(diff / MIN))
  if (m < 60) return `in ${plural(m, "minute")}`
  if (diff < 6 * HOUR)
    return `in ${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`
  const d = Math.round((dayStart(start) - dayStart(now)) / DAY)
  return `${d === 0 ? "today" : d === 1 ? "tomorrow" : fmtDay(start).split(",")[0]} ${fmtTime(start)}`
}

export default function TodayPage() {
  const { s, me, hh, prefs, club, now } = useApp()
  const router = useRouter()
  const offline = useOffline()
  const household = Object.values(s.members).filter(
    (m) => m.householdId === hh.id
  )
  const [who, setWho] = useState<"me" | "household">(
    me.role !== "teen" && household.length > 1 ? "household" : "me"
  )
  const [cancel, setCancel] = useState<Booking | null>(null)
  const today = dayStart(now)
  const hour = parts(now).h
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const ids =
    who === "household" && me.role !== "teen"
      ? household.map((m) => m.id)
      : [me.id]
  const group = (list: Booking[]) => {
    const out: (Booking & { names?: string })[] = []
    for (const b of list) {
      const prev = out.find(
        (o) =>
          o.kind === "kids" &&
          b.kind === "kids" &&
          o.start === b.start &&
          o.ref === b.ref
      )
      if (prev)
        prev.names = `${prev.names} and ${s.members[b.memberId].firstName}`
      else
        out.push({
          ...b,
          names:
            b.kind === "kids" ? s.members[b.memberId].firstName : undefined,
        })
    }
    return out
  }
  const todays = s.bookings
    .filter(
      (b) =>
        ids.includes(b.memberId) &&
        ["booked", "held"].includes(b.status) &&
        dayStart(b.start) === today &&
        b.end > now - 2 * HOUR
    )
    .sort((a, b) => a.start - b.start)
  const agenda = group(todays)
  const mineNext = s.bookings
    .filter((b) => b.memberId === me.id && b.status === "booked" && b.end > now)
    .sort((a, b) => a.start - b.start)
  const nextAny = group(
    s.bookings
      .filter(
        (b) => ids.includes(b.memberId) && b.status === "booked" && b.end > now
      )
      .sort((a, b) => a.start - b.start)
  )[0]
  const next = nextAny ?? mineNext[0]
  const held = s.bookings.find(
    (b) =>
      b.memberId === me.id &&
      b.status === "held" &&
      (b.holdExpiresAt ?? 0) > now
  )
  const waitlists = s.bookings.filter(
    (b) => b.memberId === me.id && b.status === "waitlisted" && b.start > now
  )
  const hb = liveBusyness(club, now)
  const open = clubOpen(now)
  const c = CLUB_BY_SLUG[club]
  const wk = weekStart(now)
  const weekCount = s.visits.filter(
    (v) => v.memberId === me.id && v.at >= wk && v.at < wk + 7 * DAY
  ).length
  const win = windowDays(hh.plan)
  const openingDay = addDays(today, win + (now < today + 6 * HOUR ? 0 : 1))
  const opensMs = opensAt(openingDay + 9 * HOUR, win)
  const untilOpen = opensMs - now
  const { left: passesLeft } = guestPassesLeft(s, hh.id, now)
  const nextSession = next?.sessionId ? sessionById(next.sessionId) : undefined
  const frozen = hh.status === "frozen" && hh.freeze
  const cn0 = next
    ? cancelNote(s, next.memberId, next.start, now, next.kind)
    : null
  const inProgress = next && next.start <= now
  const label = (b: Booking & { names?: string }) =>
    b.kind === "kids" ? `Kids club, ${b.names}` : b.title
  const nextHeadline = next
    ? inProgress
      ? `${label(next)} is on. ${plural(Math.max(1, Math.round((next.end - now) / MIN)), "minute")} left.`
      : endSentence(`${label(next)} ${whenText(next.start, now)}`)
    : "Nothing booked today."
  const myClubToday = sessionsForDay(club, today).filter(
    (x) => x.start > now && sessionLeft(s, x) > 0
  )
  const suggestions = myClubToday
    .filter(
      (x) =>
        x.minAge <= me.age &&
        (me.role !== "teen" || x.teenOk) &&
        !s.bookings.some(
          (b) =>
            b.sessionId === x.id &&
            b.memberId === me.id &&
            b.status !== "cancelled"
        )
    )
    .slice(0, 3)

  const attention: { key: string; node: React.ReactNode }[] = []
  for (const w of waitlists)
    attention.push({
      key: w.id,
      node: (
        <Link
          href="/bookings?tab=waitlist"
          className="hover:text-link flex min-h-11 items-start gap-3 py-3"
        >
          <Clock3
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-label">On the waitlist: {w.title}</span>
            <span className="block text-caption text-muted-foreground">
              {fmtDowTime(w.start)} ·{" "}
              {w.position === 2 ? "2nd" : `#${w.position}`} in line
            </span>
          </span>
          <ChevronRight
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
      ),
    })
  if (prefs.onboardingStep < 6)
    attention.push({
      key: "onb",
      node: (
        <Link
          href={`/welcome?step=${prefs.onboardingStep}`}
          className="hover:text-link flex min-h-11 items-start gap-3 py-3"
        >
          <Sparkles
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-label">
              Finish setting up (
              {plural(Math.max(1, 6 - prefs.onboardingStep), "step")} left)
            </span>
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ),
    })
  if (
    me.role === "primary" &&
    hh.card.expYear === 26 &&
    hh.status !== "payment_failed"
  )
    attention.push({
      key: "card",
      node: (
        <button
          type="button"
          onClick={() => openDialog("card")}
          className="hover:text-link flex min-h-11 w-full items-start gap-3 py-3 text-left"
        >
          <CreditCard
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-label">
              Card expires {String(hh.card.expMonth).padStart(2, "0")}/
              {hh.card.expYear}. Update it.
            </span>
          </span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      ),
    })
  if (me.role === "primary")
    for (const k of household.filter(
      (m) => m.role === "child" && !m.allergyNotes
    ))
      attention.push({
        key: `al-${k.id}`,
        node: (
          <Link
            href={`/family/${k.id}`}
            className="hover:text-link flex min-h-11 items-start gap-3 py-3"
          >
            <Gift
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-label">
                Add allergy notes for {k.firstName}
              </span>
              <span className="block text-caption text-muted-foreground">
                Kids club needs them before check-in.
              </span>
            </span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ),
      })

  const rail = (
    <aside className="flex flex-col gap-8" aria-label="Club and alerts">
      <section aria-labelledby="club-status" className="flex flex-col gap-1.5">
        <h2 id="club-status" className="eyebrow text-muted-foreground">
          {c.name}
        </h2>
        <p className="text-caption text-muted-foreground">
          {open.open ? (
            <>
              Open now · closes{" "}
              <span className="num">{fmtTime(open.closeAt)}</span>
            </>
          ) : (
            <>
              Closed now · opens{" "}
              <span className="num">{fmtTime(open.openAt)}</span>
            </>
          )}
        </p>
        {open.open ? <BusynessMeter variant="inline" level={hb.level} /> : null}
        {open.open ? (
          <p className="text-body">
            {offline ? "Offline: live count unavailable." : busyHint(club, now)}
          </p>
        ) : null}
        <Link
          href={`/clubs/${club}#popular`}
          className="text-link inline-flex min-h-11 w-fit items-center gap-1 text-label hover:underline"
        >
          Popular times
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      {attention.length ? (
        <section aria-labelledby="attn">
          <h2 id="attn" className="eyebrow text-muted-foreground">
            Needs attention
          </h2>
          <ul className="mt-1 rule-rows">
            {attention.slice(0, 3).map((a) => (
              <li key={a.key}>{a.node}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  )

  return (
    <div className="grid gap-x-16 gap-y-10 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex max-w-[760px] flex-col gap-8">
        <Collapse show={!!held}>
          {held ? (
            <section
              aria-label="Held spot"
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-warning-subtle px-4 py-3"
            >
              <Clock3
                className="size-5 shrink-0 text-warning"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-label">
                  Spot held: {held.title},{" "}
                  {parts(held.start).d === parts(now).d
                    ? "today"
                    : fmtDay(held.start)}{" "}
                  {fmtTime(held.start)}
                </p>
                <p className="text-caption">
                  Confirm by {fmtTime(held.holdExpiresAt!)} If you do nothing,
                  the spot goes to the next person.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  aria-label={`Confirm spot, ${Math.ceil(((held.holdExpiresAt ?? 0) - now) / MIN)} minutes left`}
                  onClick={() => {
                    const r = confirmHold(held.id)
                    if (r.ok) announce("Spot confirmed. You're booked.")
                  }}
                >
                  Confirm spot ·{" "}
                  <span className="num">
                    {fmtCountdown((held.holdExpiresAt ?? 0) - now)}
                  </span>
                </Button>
                <Button variant="outline" onClick={() => releaseHold(held.id)}>
                  Release
                </Button>
              </div>
            </section>
          ) : null}
        </Collapse>

        <header className="flex flex-col gap-3">
          <p className="eyebrow text-muted-foreground">{fmtDayLong(now)}</p>
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h2 display-stretch outline-none md:text-h1"
          >
            {greeting}, {prefs.preferredName || me.firstName}.
          </h1>
          {frozen ? (
            <div className="flex flex-col items-start gap-2">
              <p className="flex items-center gap-2 font-heading text-h2 display-stretch">
                <Pause
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                Frozen until {fmtDay(hh.freeze!.resume - DAY)}.
              </p>
              <p className="text-muted-foreground">
                See you {fmtDay(hh.freeze!.resume)}.
              </p>
              {me.role === "primary" ? (
                <Button variant="outline" render={<Link href="/membership" />}>
                  Resume early
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <p className="font-heading text-[1.75rem] leading-[1.15] display-stretch md:text-[2.25rem]">
                {nextHeadline}
              </p>
              {next ? (
                <>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 num text-body">
                    <span>
                      {fmtRange(next.start, next.end)} · {next.place}
                      {next.kind === "class"
                        ? `, ${CLUB_BY_SLUG[next.clubSlug].name}`
                        : ""}
                    </span>
                    {next.spot ? (
                      <span className="font-semibold">{next.spot}</span>
                    ) : null}
                    {nextSession ? (
                      <span className="font-sans text-caption text-muted-foreground">
                        {INSTRUCTOR_BY_ID[nextSession.instructorId]?.name}
                      </span>
                    ) : null}
                    {nextSession ? (
                      <IntensityRibs
                        level={nextSession.intensity}
                        category={nextSession.category}
                      />
                    ) : null}
                  </p>
                  {inProgress ? (
                    <p className="text-caption text-muted-foreground">
                      In progress. Show your pass at the desk.
                    </p>
                  ) : null}
                  {cn0 && !inProgress ? (
                    <p
                      className={cn(
                        "text-caption",
                        cn0.late ? "text-warning" : "text-muted-foreground"
                      )}
                    >
                      {cn0.text}
                    </p>
                  ) : null}
                  <div className="grid max-w-sm grid-cols-2 gap-2 pt-1">
                    <Button
                      variant={
                        !held &&
                        next.start - now < HOUR &&
                        paymentDaysLate(s, me.id, now) < 0
                          ? "primary"
                          : "outline"
                      }
                      onClick={() =>
                        window.innerWidth >= 1024
                          ? openDialog("pass")
                          : router.push("/pass")
                      }
                    >
                      Show pass
                    </Button>
                    <Button
                      variant="outline"
                      render={
                        <Link
                          href={
                            next.sessionId
                              ? `/schedule/${next.sessionId}`
                              : "/bookings"
                          }
                          scroll={false}
                        />
                      }
                    >
                      Details
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  {c.name} has {plural(myClubToday.length, "class")} with room
                  today.{" "}
                  <Link href="/schedule" className="text-link underline">
                    Browse today&apos;s schedule
                  </Link>
                </p>
              )}
            </>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-caption text-muted-foreground">
            {me.role !== "child" ? (
              <span className="flex items-center gap-2">
                <ProgressRibs visits={weekCount} target={prefs.weeklyTarget} />{" "}
                this week
              </span>
            ) : null}
            {untilOpen > 0 && untilOpen < DAY && me.role !== "teen" ? (
              <span className="num">
                {fmtDayShort(openingDay)} classes open at {fmtTime(opensMs)}
                {untilOpen < HOUR
                  ? `, in ${plural(Math.max(1, Math.round(untilOpen / MIN)), "minute")}`
                  : ""}
              </span>
            ) : null}
          </div>
        </header>

        <section aria-labelledby="agenda">
          <SectionTitle
            id="agenda"
            action={
              me.role !== "teen" && household.length > 1 ? (
                <SelectBox
                  label="Show"
                  hideLabel
                  value={who}
                  onChange={setWho}
                  options={[
                    { value: "me", label: "Me" },
                    { value: "household", label: "Everyone" },
                  ]}
                />
              ) : undefined
            }
          >
            Today
          </SectionTitle>
          {agenda.length ? (
            <ol className="mt-2 rule-rows">
              {agenda.map((b) => (
                <li key={b.id}>
                  <Link
                    href={
                      b.sessionId ? `/schedule/${b.sessionId}` : "/bookings"
                    }
                    scroll={false}
                    className={cn(
                      `cat-${b.category}`,
                      "grid min-h-14 grid-cols-[88px_3px_minmax(0,1fr)_auto] items-center gap-x-3 py-3 hover:bg-muted/60"
                    )}
                  >
                    <span className="num text-body-strong whitespace-nowrap">
                      {fmtTime(b.start)}
                    </span>
                    <span
                      className="h-9 w-[3px] rounded-full bg-cat"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-label">{label(b)}</span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {b.kind === "kids"
                          ? `${fmtRange(b.start, b.end)} · ${b.place}`
                          : b.kind === "class"
                            ? `${b.place}${nextSessionName(b)}`
                            : b.place}
                        {who === "household" &&
                        b.kind !== "kids" &&
                        b.memberId !== me.id
                          ? ` · ${s.members[b.memberId].firstName}`
                          : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-caption">
                      {b.status === "held" ? (
                        <span className="font-semibold text-warning">Held</span>
                      ) : (
                        <span className="text-muted-foreground">Booked</span>
                      )}
                      <ChevronRight
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-muted-foreground">
              Nothing on the calendar.{" "}
              <Link href="/schedule" className="text-link underline">
                Find a class
              </Link>
            </p>
          )}
        </section>

        <div className="xl:hidden">{rail}</div>

        {suggestions.length ? (
          <section aria-labelledby="sugg">
            <SectionTitle
              id="sugg"
              action={
                <Link
                  href="/schedule"
                  className="text-link inline-flex min-h-11 items-center text-label hover:underline"
                >
                  Full schedule
                </Link>
              }
            >
              Still open today
            </SectionTitle>
            <ul className="mt-1 rule-rows">
              {suggestions.map((x) => (
                <li
                  key={x.id}
                  className={cn(
                    `cat-${x.category}`,
                    "grid grid-cols-[88px_3px_minmax(0,1fr)_auto] items-center gap-x-3 py-3"
                  )}
                >
                  <span className="num text-body-strong whitespace-nowrap">
                    {fmtTime(x.start)}
                  </span>
                  <span
                    className="h-9 w-[3px] rounded-full bg-cat"
                    aria-hidden="true"
                  />
                  <Link
                    href={`/schedule/${x.id}`}
                    scroll={false}
                    className="min-w-0 hover:underline"
                  >
                    <span className="block text-label">{x.name}</span>
                    <span className="block truncate num text-caption text-muted-foreground">
                      {x.studio} · {sessionLeft(s, x)} {x.unit} left
                    </span>
                  </Link>
                  <SessionAction se={x} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {me.role !== "teen" &&
        me.role !== "child" &&
        hh.plan !== "trailhead" &&
        passesLeft > 0 &&
        !agenda.length ? (
          <p className="text-caption text-muted-foreground">
            You have {plural(passesLeft, "guest pass")} left this month.{" "}
            <Link href="/guest-passes" className="text-link underline">
              Send a guest pass
            </Link>
          </p>
        ) : null}
        {cancel ? (
          <CancelDialog
            booking={cancel}
            open
            onOpenChange={(o) => !o && setCancel(null)}
          />
        ) : null}
      </div>
      <div className="hidden xl:block xl:pt-12">{rail}</div>
    </div>
  )
}
function nextSessionName(b: Booking) {
  const se = b.sessionId ? sessionById(b.sessionId) : undefined
  return se ? ` · ${INSTRUCTOR_BY_ID[se.instructorId]?.name ?? ""}` : ""
}
