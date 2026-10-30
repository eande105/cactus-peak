"use client"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { SuggestedCard } from "@/components/booking/class-row"
import { Collapsible } from "@/components/graphical"
import { Check, ChevronRight } from "@/components/icons"
import { ProgressRibs, VisitMonth, VisitStrip } from "@/components/kit/progress"
import { RibMeter } from "@/components/kit/ribs"
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  Segmented,
} from "@/components/kit/ui"
import { BookingList } from "@/components/reserve/booking-list"
import { Button } from "@/components/ui/button"
import { CATEGORIES, CATEGORY_BY_ID } from "@/lib/data/catalog"
import { sessionsForDay } from "@/lib/data/sessions"
import { weekStart } from "@/lib/engine"
import { visitHistory } from "@/lib/history"
import {
  addDays,
  DAY,
  DOW_LONG,
  dateKey,
  dayStart,
  fmtDay,
  parts,
} from "@/lib/time"
import type { CategoryId } from "@/lib/types"
import { openDialog } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

export default function ProgressPage() {
  const { s, me, now, prefs, club } = useApp()
  const [range, setRange] = useState<"4" | "12" | "year">("4")
  const [loading, setLoading] = useState(false)
  const [table, setTable] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const hist = visitHistory(s, me.id, now)
  const real = s.visits.filter((v) => v.memberId === me.id)
  const p = parts(now)
  const monthStart = dayStart(Date.UTC(p.y, p.m, 1, 7))
  const monthVisits = hist.filter((v) => v.at >= monthStart && v.at < now + DAY)
  const from =
    range === "4"
      ? now - 28 * DAY
      : range === "12"
        ? now - 84 * DAY
        : Date.UTC(p.y, 0, 1)
  const inRange = hist.filter((v) => v.at >= from && v.at <= now + DAY)
  const weeks = Math.max(1, (now - from) / (7 * DAY))
  const wk = weekStart(now)
  const weekCount = hist.filter((v) => v.at >= wk && v.at < wk + 7 * DAY).length
  const target = prefs.weeklyTarget
  const stats = s.stats[me.id]
  const mix = CATEGORIES.map((c) => ({
    id: c.id as CategoryId,
    n: inRange.filter((v) => v.category === c.id).length,
  }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  const fav = mix[0]
  const byDow = Array.from({ length: 7 }, (_, i) => ({
    dow: (i + 1) % 7,
    n: inRange.filter((v) => parts(v.at).dow === (i + 1) % 7).length,
  }))
  const topDays = [...byDow]
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .map((x) => DOW_LONG[x.dow])
  const morning =
    inRange.filter((v) => parts(v.at).h < 12).length >= inRange.length / 2
  const visitDays = new Set(real.map((v) => dateKey(v.at)))
  const monthDays = new Set(monthVisits.map((v) => dateKey(v.at)))
  const planned = new Set(
    s.bookings
      .filter(
        (b) => b.memberId === me.id && b.status === "booked" && b.start > now
      )
      .map((b) => dateKey(b.start))
  )
  const to50 = Math.max(0, 50 - stats.lifetime)
  const monthlyGoal = target * 4
  const maxMix = Math.max(1, ...mix.map((x) => x.n))
  const maxDow = Math.max(1, ...byDow.map((x) => x.n))
  if (loading) return <LoadingBlock text="Loading your progress…" rows={4} />
  if (!hist.length)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Progress" />
        <EmptyState
          object="heart-watch"
          title="Your first visit starts the streak"
          body="Show your pass at the front desk. Here are 3 good first-timer classes."
          action={
            <Button onClick={() => openDialog("pass")}>Show my pass</Button>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-3">
          {sessionsForDay(club, addDays(dayStart(now), 1))
            .filter((x) => x.firstTimerOk)
            .slice(0, 3)
            .map((x) => (
              <li key={x.id}>
                <SuggestedCard se={x} />
              </li>
            ))}
        </ul>
      </div>
    )
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Progress"
        description="Effort without pressure. Rest days count too."
        actions={
          <Segmented
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: "4", label: "4 weeks" },
              { value: "12", label: "12 weeks" },
              { value: "year", label: "This year" },
            ]}
          />
        }
      />
      <p className="max-w-[28ch] font-heading text-h2 display-stretch">
        {monthVisits.length} {monthVisits.length === 1 ? "visit" : "visits"}{" "}
        this month.{" "}
        <span className="num">{(inRange.length / weeks).toFixed(1)}</span> a
        week. {stats.streakWeeks}-{stats.streakWeeks === 1 ? "week" : "week"}{" "}
        streak.{fav ? ` Most often ${CATEGORY_BY_ID[fav.id].name}.` : ""}
      </p>
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
        <section aria-labelledby="wg" className="flex flex-col gap-4">
          <p id="wg" className="eyebrow text-muted-foreground">
            Weekly goal
          </p>
          <ProgressRibs
            variant="hero"
            size="xl"
            visits={weekCount}
            target={target}
          />
          <p className="text-body">
            {monthVisits.length >= monthlyGoal
              ? `Goal ${monthlyGoal} a month, ${monthVisits.length} done.`
              : `${monthVisits.length} of ${monthlyGoal} visits this month.`}
          </p>
          <p className="text-caption text-muted-foreground">
            {to50} visits to your 50th.
          </p>
        </section>
        <section aria-labelledby="st" className="flex flex-col gap-4">
          <p id="st" className="eyebrow text-muted-foreground">
            This week
          </p>
          <VisitStrip
            weekStart={wk}
            visits={visitDays}
            planned={planned}
            today={now}
            goal={target}
          />
          <div className="flex items-end gap-3">
            <p className="num-l text-h1 leading-none">{stats.streakWeeks}</p>
            <p className="pb-1 text-body">
              weeks in a row at {target} or more visits.
            </p>
          </div>
          <p className="text-caption text-muted-foreground">
            Rest days count too. One quiet week doesn&apos;t erase a streak: you
            get 1 rest week per 10 weeks.
          </p>
        </section>
        <section aria-labelledby="mc" className="flex flex-col gap-3">
          <SectionTitle id="mc">
            {
              [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ][p.m]
            }
          </SectionTitle>
          <VisitMonth today={now} visits={monthDays} planned={planned} />
        </section>
        <section aria-labelledby="cm" className="flex flex-col gap-3">
          <SectionTitle
            id="cm"
            action={
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={table}
                onClick={() => setTable((t) => !t)}
              >
                {table ? "Show as chart" : "Show as table"}
              </Button>
            }
          >
            Class mix
          </SectionTitle>
          {table ? (
            <table className="w-full text-caption">
              <caption className="sr-only">Visits by category</caption>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th scope="col">Category</th>
                  <th scope="col" className="text-right">
                    Visits
                  </th>
                </tr>
              </thead>
              <tbody>
                {mix.map((m) => (
                  <tr key={m.id} className="rule-b">
                    <th scope="row" className="py-2 text-left font-normal">
                      {CATEGORY_BY_ID[m.id].name}
                    </th>
                    <td className="text-right num">{m.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="flex flex-col gap-3">
              {mix.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    `cat-${m.id}`,
                    "grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3"
                  )}
                >
                  <span className="text-label">
                    {CATEGORY_BY_ID[m.id].name}
                  </span>
                  <span className="rounded-xs h-4 bg-muted">
                    <span
                      className="rounded-xs block h-full bg-cat"
                      style={{ width: `${(m.n / maxMix) * 100}%` }}
                    />
                  </span>
                  <span className="text-right num text-label">{m.n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section aria-labelledby="vd" className="flex flex-col gap-3">
        <SectionTitle id="vd">Visits by day</SectionTitle>
        <div
          role="img"
          aria-label={`Visits by weekday. ${topDays.join(" and ")} are your busiest days.`}
          className="flex h-32 max-w-xl items-end gap-3 border-b border-border"
        >
          {byDow.map((d) => (
            <div
              key={d.dow}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="num text-detail">{d.n}</span>
              <div
                className="rounded-t-xs w-full bg-night dark:bg-on-night"
                style={{
                  height: d.n ? `${Math.max(4, (d.n / maxDow) * 88)}px` : "2px",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex max-w-xl gap-3 text-detail text-muted-foreground">
          {byDow.map((d) => (
            <span key={d.dow} className="flex-1 text-center">
              {DOW_LONG[d.dow].slice(0, 3)}
            </span>
          ))}
        </div>
        <p className="text-body">
          You come most on{" "}
          {DOW_LONG[[...byDow].sort((a, b) => b.n - a.n)[0].dow]}s,{" "}
          {morning ? "mostly in the morning" : "mostly later in the day"}.
        </p>
        <Collapsible.Root className="max-w-xl">
          <Collapsible.Trigger className="max-md:min-h-11">
            Show as table
            <Collapsible.Indicator>
              <ChevronRight aria-hidden="true" />
            </Collapsible.Indicator>
          </Collapsible.Trigger>
          <Collapsible.Panel>
            <table className="w-full text-caption">
              <caption className="sr-only">Visits by weekday</caption>
              <tbody>
                {byDow.map((d) => (
                  <tr key={d.dow} className="border-b border-border">
                    <th scope="row" className="py-1.5 text-left font-normal">
                      {DOW_LONG[d.dow]}
                    </th>
                    <td className="text-right num">{d.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapsible.Panel>
        </Collapsible.Root>
      </section>
      <section aria-labelledby="ms">
        <SectionTitle id="ms">Milestones</SectionTitle>
        <ul className="mt-2 rule-rows">
          <li className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3">
              <RibMeter
                value={Math.round((stats.lifetime / 50) * 5)}
                size="sm"
                tone="brand"
                label="Progress to 50th visit"
                valueText={`${stats.lifetime} of 50`}
                decorative
              />
              50th visit
            </span>
            <span className="num text-caption text-muted-foreground">
              {to50} to go
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3">
              <RibMeter
                value={Math.min(5, Math.round((stats.streakWeeks / 10) * 5))}
                size="sm"
                tone="brand"
                label="Progress to 10-week streak"
                valueText={`${stats.streakWeeks} of 10`}
                decorative
              />
              10-week streak
            </span>
            <span className="num text-caption text-muted-foreground">
              {Math.max(0, 10 - stats.streakWeeks)}{" "}
              {10 - stats.streakWeeks === 1 ? "week" : "weeks"} to go
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3">
              <Check className="size-5 text-success" aria-hidden="true" />
              First lap swim
            </span>
            <span className="num text-caption text-muted-foreground">
              Done {fmtDay(Date.UTC(2026, 9, 9, 14))}
            </span>
          </li>
        </ul>
      </section>
      <span className="sr-only">
        <BookingList list={[]} />
      </span>
    </div>
  )
}
