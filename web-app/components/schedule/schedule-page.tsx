"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { ScheduleRow } from "@/components/booking/class-row"
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Lock,
  Search,
} from "@/components/icons"
import { SideSheet } from "@/components/kit/overlays"
import {
  Banner,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Segmented,
} from "@/components/kit/ui"
import { DayStrip } from "@/components/schedule/day-strip"
import { ScheduleFilters } from "@/components/schedule/filters"
import { WeekGrid } from "@/components/schedule/week-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMedia } from "@/hooks/use-media"
import { addRemind, setPrefs } from "@/lib/actions"
import { CATEGORIES, CLUB_BY_SLUG } from "@/lib/data/catalog"
import { sessionsForDay } from "@/lib/data/sessions"
import { opensAt, windowDays } from "@/lib/engine"
import {
  activeCount,
  applyFilters,
  bandOf,
  EMPTY,
  type Filters,
  parseFilters,
  serializeFilters,
} from "@/lib/schedule-filters"
import {
  addDays,
  dateKey,
  dayStart,
  fmtDay,
  fmtDayLong,
  fmtDayShort,
  fmtTime,
  fromKey,
  parts,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

function Inner() {
  const { s, me, hh, prefs, club, now } = useApp()
  const router = useRouter()
  const path = usePathname()
  const sp = useSearchParams()
  const wide = useMedia("(min-width: 1280px)")
  const [loadedFor, setLoadedFor] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [retry, setRetry] = useState(0)
  const loadKey = `${club}${retry}`
  const loading = false
  void loadedFor
  void setLoadedFor
  void loadKey
  const f = useMemo(() => parseFilters(sp, club), [sp, club])
  const today = dayStart(now)
  const date = sp.get("date") ? fromKey(sp.get("date")!) : today
  const stored = useRef(false)
  // The member's saved filters apply once when the URL has none.
  // biome-ignore lint/correctness/useExhaustiveDependencies: saved filters apply once on mount, the stored ref guards repeats
  useEffect(() => {
    if (stored.current) return
    stored.current = true
    if (
      prefs.savedFilters &&
      ![...sp.keys()].some((k) => !["view", "date"].includes(k))
    ) {
      try {
        const saved = JSON.parse(prefs.savedFilters) as Filters
        router.replace(`${path}?${serializeFilters(saved, sp, club)}`)
      } catch {}
    }
  }, [])
  const view = (sp.get("view") as "week" | "list" | null) ?? "list"
  const effView = wide ? view : "list"
  const win = windowDays(hh.plan)
  const push = (p: URLSearchParams, replace = false) => {
    const url = `${path}?${p.toString()}`
    if (replace) router.replace(url, { scroll: false })
    else router.push(url, { scroll: false })
  }
  const setParam = (k: string, v: string, replace = false) => {
    const p = new URLSearchParams(sp)
    if (v) p.set(k, v)
    else p.delete(k)
    push(p, replace)
  }
  const setFilters = (nf: Filters) => push(serializeFilters(nf, sp, club), true)

  const clubs = f.clubs.filter(
    (c) => hh.plan !== "trailhead" || c === me.homeClub
  )
  const clubKey = clubs.join(",")
  const dayList = (d: number) => clubs.flatMap((c) => sessionsForDay(c, d))
  // biome-ignore lint/correctness/useExhaustiveDependencies: dayList is rebuilt each render and clubKey stands for clubs, so it is left out on purpose
  const baseDay = useMemo(
    () => dayList(date).sort((a, b) => a.start - b.start),
    [date, clubKey]
  )
  const shown = applyFilters(baseDay, f, s, me.id)
  // biome-ignore lint/correctness/useExhaustiveDependencies: dayList is rebuilt each render and f, s, me.id cover its inputs, so it is left out on purpose
  const weekSessions = useMemo(
    () =>
      applyFilters(
        Array.from({ length: 5 }, (_, i) => dayList(addDays(date, i))).flat(),
        f,
        s,
        me.id
      ),
    [date, f, s, me.id]
  )
  const catCounts = Object.fromEntries(
    CATEGORIES.map((c) => [
      c.id,
      baseDay.filter((x) => x.category === c.id).length,
    ])
  )
  const studios = [...new Set(clubs.flatMap((c) => CLUB_BY_SLUG[c].studios))]
  const marks = new Set(
    s.bookings
      .filter(
        (b) => b.memberId === me.id && ["booked", "held"].includes(b.status)
      )
      .map((b) => dateKey(b.start))
  )
  const opens = opensAt(date + 9 * 3600_000, win)
  const notOpen = now < opens
  const viewing = CLUB_BY_SLUG[club]
  const homeOnlyBanner = hh.plan === "trailhead" && club !== me.homeClub
  const n = activeCount(f, club)
  const bands: { id: string; label: string; test: (m: number) => boolean }[] = [
    { id: "early", label: "Early" },
    { id: "morning", label: "Morning" },
    { id: "midday", label: "Midday" },
    { id: "evening", label: "Evening" },
  ].map((b) => ({ ...b, test: () => true }))
  const rowsByBand = shown.reduce<Record<string, typeof shown>>((acc, x) => {
    const band = bandOf(x.start)
    acc[band] ??= []
    acc[band].push(x)
    return acc
  }, {})
  const filtersPanel = (
    <ScheduleFilters
      f={f}
      onChange={setFilters}
      count={shown.length}
      counts={catCounts}
      studios={studios}
    />
  )
  // Live region for spot changes, summarised and throttled.
  const liveText = `${shown.length} ${shown.length === 1 ? "class" : "classes"} on ${fmtDayLong(date)}`

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={
          <>
            {viewing.name}{" "}
            <button
              type="button"
              className="text-link ml-1 inline-flex min-h-11 items-center tracking-normal normal-case underline underline-offset-4"
              onClick={() =>
                document
                  .querySelector<HTMLElement>('[aria-label^="Viewing club"]')
                  ?.click()
              }
            >
              change
            </button>
          </>
        }
        title="Schedule"
        actions={
          <>
            {wide ? (
              <Segmented
                label="View"
                value={effView}
                onChange={(v) => setParam("view", v)}
                options={[
                  { value: "week", label: "Week" },
                  { value: "list", label: "List" },
                ]}
              />
            ) : null}
            <Button
              variant="outline"
              onClick={() =>
                push(
                  new URLSearchParams(
                    [...sp.entries()].filter(([k]) => k !== "date")
                  )
                )
              }
            >
              Today
            </Button>
            {!(effView === "list" && wide) ? (
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                <ListFilter aria-hidden="true" data-icon="inline-start" />
                Filters{n ? ` (${n})` : ""}
              </Button>
            ) : null}
          </>
        }
      />
      {homeOnlyBanner ? (
        <Banner
          tone="neutral"
          icon={Lock}
          title={`Trailhead books at ${CLUB_BY_SLUG[me.homeClub].name}.`}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/membership/change-plan")}
            >
              See Ridge
            </Button>
          }
        >
          You can browse this schedule. Booking is read-only.
        </Banner>
      ) : null}
      <div className="flex flex-col gap-1">
        <DayStrip
          selected={date}
          onSelect={(d) => setParam("date", d === today ? "" : dateKey(d))}
          now={now}
          windowDays={win}
          count={(d) =>
            clubs.reduce((a, c) => a + sessionsForDay(c, d).length, 0)
          }
          marks={marks}
        />
        <p className="text-detail text-muted-foreground md:text-right">
          Arizona time, no daylight saving. Spots update live.
        </p>
      </div>
      {n > 0 ? (
        <ul
          className="flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          {[
            ...f.cats.map((c) => ({
              k: `cat-${c}`,
              label: CATEGORIES.find((x) => x.id === c)!.name,
              clear: () =>
                setFilters({ ...f, cats: f.cats.filter((x) => x !== c) }),
            })),
            ...f.times.map((t) => ({
              k: `t-${t}`,
              label: t[0].toUpperCase() + t.slice(1),
              clear: () =>
                setFilters({ ...f, times: f.times.filter((x) => x !== t) }),
            })),
            ...(f.open
              ? [
                  {
                    k: "open",
                    label: "Open spots",
                    clear: () => setFilters({ ...f, open: false }),
                  },
                ]
              : []),
            ...(f.first
              ? [
                  {
                    k: "first",
                    label: "First-timers",
                    clear: () => setFilters({ ...f, first: false }),
                  },
                ]
              : []),
            ...(f.mine
              ? [
                  {
                    k: "mine",
                    label: "My bookings",
                    clear: () => setFilters({ ...f, mine: false }),
                  },
                ]
              : []),
            ...(f.series
              ? [
                  {
                    k: "series",
                    label: "Same class",
                    clear: () => setFilters({ ...f, series: "" }),
                  },
                ]
              : []),
            ...(f.intMin !== 1 || f.intMax !== 5
              ? [
                  {
                    k: "int",
                    label: `Intensity ${f.intMin}–${f.intMax}`,
                    clear: () => setFilters({ ...f, intMin: 1, intMax: 5 }),
                  },
                ]
              : []),
          ].map((c) => (
            <li key={c.k}>
              <button
                type="button"
                onClick={c.clear}
                className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted px-3 text-caption hover:bg-secondary-hover"
              >
                {c.label}
                <span className="sr-only">Remove filter</span>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
          <li>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ ...EMPTY, clubs: [club] })}
            >
              Clear all
            </Button>
          </li>
        </ul>
      ) : null}
      <p role="status" className="sr-only">
        {liveText}
      </p>

      <div
        className={cn(
          "grid gap-8",
          effView === "list" && wide && "grid-cols-[260px_minmax(0,900px)]"
        )}
      >
        {effView === "list" && wide ? (
          <aside
            aria-label="Schedule filters"
            className="sticky top-24 max-h-[calc(100dvh-7rem)] self-start overflow-y-auto pr-2"
          >
            {filtersPanel}
          </aside>
        ) : null}
        <div className="min-w-0">
          {loading ? (
            <LoadingBlock text="Checking availability…" rows={8} />
          ) : retry < 0 ? (
            <ErrorState
              what="the schedule"
              onRetry={() => setRetry((r) => r + 1)}
            />
          ) : effView === "week" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="num font-heading text-h3 display-stretch">
                  {fmtDayShort(date)} – {fmtDayShort(addDays(date, 4))}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous day"
                    disabled={date <= today}
                    onClick={() => setParam("date", dateKey(addDays(date, -1)))}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next day"
                    onClick={() => setParam("date", dateKey(addDays(date, 1)))}
                  >
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <WeekGrid
                start={date}
                sessions={weekSessions}
                now={now}
                query={`?view=week&date=${dateKey(date)}`}
              />
            </div>
          ) : notOpen ? (
            <EmptyState
              icon={Lock}
              title={`${fmtDayShort(date)} classes open ${fmtDay(opens)} at ${fmtTime(opens)}`}
              body="We can remind you."
              action={
                <Button
                  onClick={() => {
                    addRemind(dateKey(date))
                    toast({
                      title: "We'll remind you",
                      description: `A push at ${fmtTime(opens - 5 * 60000)} on ${fmtDay(opens)}.`,
                    })
                  }}
                >
                  Remind me
                </Button>
              }
              secondary={
                <Button variant="outline" onClick={() => setParam("date", "")}>
                  See today
                </Button>
              }
            />
          ) : !baseDay.length ? (
            <EmptyState
              object="schedule"
              title={`No classes on ${fmtDayLong(date).split(",")[0]}`}
              body={`Try the next day. ${viewing.name} opens ${parts(date).dow === 0 || parts(date).dow === 6 ? "6:00" : "4:30"} a.m.`}
              action={
                <Button
                  onClick={() => setParam("date", dateKey(addDays(date, 1)))}
                >
                  See the next day
                </Button>
              }
              secondary={
                <Button
                  variant="outline"
                  onClick={() =>
                    document
                      .querySelector<HTMLElement>(
                        '[aria-label^="Viewing club"]'
                      )
                      ?.click()
                  }
                >
                  Switch club
                </Button>
              }
            />
          ) : !shown.length ? (
            <EmptyState
              icon={Search}
              title="No classes match"
              body="Try removing a filter or pick another day."
              action={
                <Button onClick={() => setFilters({ ...EMPTY, clubs: [club] })}>
                  Clear filters
                </Button>
              }
              secondary={
                <Button
                  variant="outline"
                  onClick={() => setParam("date", dateKey(addDays(date, 1)))}
                >
                  See tomorrow
                </Button>
              }
            />
          ) : (
            <section aria-labelledby="day-head">
              <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 md:top-16 md:mx-0 md:px-0">
                <h2
                  id="day-head"
                  className="font-heading text-h3 display-stretch"
                >
                  {fmtDayLong(date)}{" "}
                  <span className="num text-body text-muted-foreground">
                    · {shown.length} {shown.length === 1 ? "class" : "classes"}
                  </span>
                </h2>
                <div className="flex gap-1">
                  {bands
                    .filter((b) => rowsByBand[b.id]?.length)
                    .map((b) => (
                      <Button
                        key={b.id}
                        variant="ghost"
                        size="sm"
                        className="max-md:min-h-11"
                        onClick={() =>
                          document
                            .getElementById(`band-${b.id}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        }
                      >
                        {b.label}
                      </Button>
                    ))}
                </div>
              </div>
              <ul className="rule-rows" aria-label="Classes">
                {bands
                  .filter((b) => rowsByBand[b.id]?.length)
                  .map((b) => (
                    <li key={b.id} id={`band-${b.id}`} className="scroll-mt-32">
                      <p className="py-2 eyebrow text-muted-foreground">
                        <span className="sr-only">Classes starting </span>
                        {b.label}
                      </p>
                      <ul className="rule-rows">
                        {rowsByBand[b.id].map((x) => (
                          <ScheduleRow
                            key={x.id}
                            se={x}
                            showClub={clubs.length > 1}
                            query={sp.toString() ? `?${sp.toString()}` : ""}
                          />
                        ))}
                      </ul>
                    </li>
                  ))}
              </ul>
              <p className="mt-4 text-detail text-muted-foreground">
                Cancel free until 2 hours before. Waitlists move up until 1 hour
                before. <Badge tone="outline">Live</Badge>
              </p>
            </section>
          )}
        </div>
      </div>
      <SideSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        label="Schedule filters"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-h2 display-stretch">Filters</h2>
            <Button size="sm" onClick={() => setFiltersOpen(false)}>
              Show {shown.length} {shown.length === 1 ? "class" : "classes"}
            </Button>
          </div>
          {filtersPanel}
        </div>
      </SideSheet>
    </div>
  )
}
void setPrefs
export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
