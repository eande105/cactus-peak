"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ScheduleList } from "@/components/brand/class-parts"
import { catColor } from "@/components/brand/icons"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { useBooking } from "@/components/site/booking"
import {
  useCatalog,
  useClubNow,
  useSessions,
} from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectBox, Tip } from "@/components/ui/controls"
import { Overlay, OverlayPopup, OverlayTitle } from "@/components/ui/overlay"
import { dayInfo, fmtTime } from "@/lib/time"
import type { CategoryId, ClubSlug, Session } from "@/lib/types"
import { EmptyState } from "./common"
import { ScheduleDayStrip } from "./schedule-parts"

type Init = {
  club?: string
  category?: string
  classSlug?: string
  coach?: string
  firstTimer?: boolean
  time?: string
}
const TIMES = [
  ["early", "Early", "Before 7 a.m."],
  ["morning", "Morning", "7–11 a.m."],
  ["midday", "Midday", "11 a.m.–4 p.m."],
  ["evening", "Evening", "After 4 p.m."],
] as const
const LEVELS = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: String(n),
}))
const band = (m: number) =>
  m < 420 ? "early" : m < 660 ? "morning" : m < 960 ? "midday" : "evening"

export function ScheduleBoard({ init }: { init: Init }) {
  const { club: mine } = useMyClub()
  const { categories, clubs, coaches, classBySlug } = useCatalog()
  const { sessions, now } = useSessions()
  const [clubSel, setClubSel] = useState<string>(init.club ?? "")
  const club = (clubSel || mine?.slug || "all") as ClubSlug | "all"
  const [day, setDay] = useState(0)
  const [cats, setCats] = useState<CategoryId[]>(
    init.category ? [init.category as CategoryId] : []
  )
  const [times, setTimes] = useState<string[]>(init.time ? [init.time] : [])
  const [lo, setLo] = useState(1)
  const [hi, setHi] = useState(5)
  const [coach, setCoach] = useState(init.coach ?? "")
  const [first, setFirst] = useState(!!init.firstTimer)
  const [spots, setSpots] = useState(false)
  const [viewPick, setViewPick] = useState<"list" | "week">("list")
  const { openPanel } = useBooking()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const match = (s: Session) => {
    const ct = classBySlug(s.classSlug)!
    return (
      (!init.classSlug || s.classSlug === init.classSlug) &&
      (club === "all" || s.clubSlug === club) &&
      (!cats.length || cats.includes(ct.category)) &&
      (!times.length || times.includes(band(s.start))) &&
      ct.intensity[1] >= lo &&
      ct.intensity[0] <= hi &&
      (!coach || s.coach === coach) &&
      (!first || ct.firstTimer) &&
      (!spots || s.left > 0)
    )
  }
  const upcoming = (s: Session) => s.day > 0 || s.start >= now.min
  // biome-ignore lint/correctness/useExhaustiveDependencies: match and upcoming are new functions each render; the listed filter values are the real inputs
  const pool = useMemo(
    () => sessions.filter(match).filter(upcoming),
    [
      sessions,
      now.min,
      club,
      cats,
      times,
      lo,
      hi,
      coach,
      first,
      spots,
      init.classSlug,
    ]
  )
  // Only coaches who lead a class this week.
  const teaching = coaches.filter((c) =>
    sessions.some((s) => s.coach === c.name)
  )
  const counts = Array.from(
    { length: 7 },
    (_, d) => pool.filter((s) => s.day === d).length
  )
  const dayList = pool
    .filter((s) => s.day === day)
    .sort((a, b) => a.start - b.start || a.clubSlug.localeCompare(b.clubSlug))
  const activeCount =
    cats.length +
    times.length +
    (lo > 1 || hi < 5 ? 1 : 0) +
    (coach ? 1 : 0) +
    (first ? 1 : 0) +
    (spots ? 1 : 0)
  const clear = () => {
    setCats([])
    setTimes([])
    setLo(1)
    setHi(5)
    setCoach("")
    setFirst(false)
    setSpots(false)
  }
  const weekOk = club !== "all"
  const view = viewPick === "week" && weekOk ? "week" : "list"

  // Time of day is a multi-select (several bands can be on), so the group allows more than one pressed toggle.
  const timeSeg = (
    <ToggleGroup
      multiple
      aria-label="Time of day"
      value={times}
      onValueChange={(v) => setTimes(v as string[])}
    >
      {TIMES.map(([k, l, d]) => (
        <Tip key={k} label={d}>
          <Toggle value={k} className="min-h-11">
            {l}
            <span className="sr-only">, {d}</span>
          </Toggle>
        </Tip>
      ))}
    </ToggleGroup>
  )
  const catSelect = (
    <SelectBox
      inline
      label="Category"
      value={cats[0] ?? ""}
      onChange={(v) => setCats(v ? [v as CategoryId] : [])}
      options={[
        { value: "", label: "All" },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
      ]}
    />
  )
  const more = (
    <div className="flex flex-col gap-5">
      <div className="lg:hidden">{catSelect}</div>
      <div className="lg:hidden">
        <p className="eyebrow mb-2">Time</p>
        {timeSeg}
      </div>
      <fieldset>
        <legend className="eyebrow mb-2">Intensity</legend>
        <div className="flex items-center gap-2">
          <SelectBox
            inline
            hideLabel
            id="int-lo"
            label="Lowest intensity"
            value={String(lo)}
            onChange={(x) => {
              const v = +x
              setLo(v)
              if (v > hi) setHi(v)
            }}
            options={LEVELS}
          />
          <span aria-hidden="true">to</span>
          <SelectBox
            inline
            hideLabel
            id="int-hi"
            label="Highest intensity"
            value={String(hi)}
            onChange={(x) => {
              const v = +x
              setHi(v)
              if (v < lo) setLo(v)
            }}
            options={LEVELS}
          />
        </div>
      </fieldset>
      <SelectBox
        inline
        label="Coach"
        value={coach}
        onChange={setCoach}
        options={[
          { value: "", label: "Any coach" },
          ...teaching.map((c) => ({ value: c.name, label: c.name })),
        ]}
      />
      <CheckRow checked={first} onChange={setFirst}>
        Good for first-timers
      </CheckRow>
      <CheckRow checked={spots} onChange={setSpots}>
        Spots available
      </CheckRow>
    </div>
  )

  return (
    <div>
      {/* One 56 px toolbar. Sticky stack = header + 56 px. */}
      <div className="sticky top-16 z-30 border-y border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1200px] scrollbar-none items-center gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <SelectBox
            inline
            className="shrink-0"
            label="Club"
            value={club}
            onChange={setClubSel}
            options={[
              { value: "all", label: "All clubs" },
              ...clubs.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <div className="hidden shrink-0 lg:block">{catSelect}</div>
          <div className="hidden shrink-0 lg:block">{timeSeg}</div>
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => setFiltersOpen(true)}
          >
            Filters{activeCount ? ` (${activeCount})` : ""}
          </Button>
          {activeCount ? (
            <button
              type="button"
              className="min-h-11 shrink-0 text-label text-link underline-offset-4 hover:underline"
              onClick={clear}
            >
              Clear filters
            </button>
          ) : null}
          <div className="ml-auto hidden shrink-0 items-center gap-3 xl:flex">
            <span className="text-caption text-muted-foreground">
              Arizona time
            </span>
            <ToggleGroup
              aria-label="View"
              value={[view]}
              onValueChange={(v) => {
                // Single choice: pressing the current view again keeps it on.
                if (v[0]) setViewPick(v[0] as "list" | "week")
              }}
            >
              <Toggle value="list" className="min-h-11">
                List
              </Toggle>
              <Toggle value="week" disabled={!weekOk} className="min-h-11">
                Week
              </Toggle>
            </ToggleGroup>
          </div>
        </div>
      </div>
      {!weekOk ? (
        <p className="mx-auto hidden max-w-[1200px] px-8 pt-2 text-right text-caption text-muted-foreground xl:block">
          Pick one club to see the week table.
        </p>
      ) : null}
      <Overlay
        placement="bottom"
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
      >
        <OverlayPopup label="Filters">
          {/* The title keeps XL space at its end for the corner close (dialog.md). */}
          <OverlayTitle className="pr-8">Filters</OverlayTitle>
          <div className="min-h-0 flex-1 overflow-y-auto">{more}</div>
          <Button onClick={() => setFiltersOpen(false)}>
            Show {pool.length} classes
          </Button>
        </OverlayPopup>
      </Overlay>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <ScheduleDayStrip value={day} onChange={setDay} counts={counts} />
        <p
          className="mt-2 text-caption text-muted-foreground"
          aria-live="polite"
        >
          Members book 7 days ahead. Summit: 9.
        </p>
        {view === "week" && weekOk ? (
          <WeekGrid
            list={pool}
            onOpen={openPanel}
            onMore={(d) => {
              setDay(d)
              setViewPick("list")
            }}
          />
        ) : dayList.length ? (
          <div className="mt-6 flex flex-col gap-8">
            {TIMES.map(([k, , d]) => {
              const rows = dayList.filter((s) => band(s.start) === k)
              if (!rows.length) return null
              return (
                <section key={k} aria-label={d}>
                  <h2 className="font-display-wide sticky top-[112px] z-10 bg-background py-3 text-h3 xl:top-[120px]">
                    {k === "early"
                      ? "Early · before 7 a.m."
                      : k === "morning"
                        ? "Morning"
                        : k === "midday"
                          ? "Midday"
                          : "Evening"}
                  </h2>
                  <ScheduleList
                    sessions={rows}
                    showClub={club === "all"}
                    onOpen={openPanel}
                    label={d}
                  />
                </section>
              )
            })}
          </div>
        ) : (
          <EmptyState
            className="mt-6"
            title={`No classes match those filters on ${dayInfo(day, now.dayNum).long}.`}
            text="Clear a filter or look at another day."
          >
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
            {counts.findIndex((c, i) => i > day && c > 0) > -1 ? (
              <Button
                variant="ghost"
                onClick={() =>
                  setDay(counts.findIndex((c, i) => i > day && c > 0))
                }
              >
                See{" "}
                {
                  dayInfo(
                    counts.findIndex((c, i) => i > day && c > 0),
                    now.dayNum
                  ).long
                }
              </Button>
            ) : null}
          </EmptyState>
        )}
        <p className="mt-10 max-w-[68ch] text-body text-muted-foreground">
          Cancel free up to 2 hours before. Late cancels count as a strike.
          Three strikes in 30 days pause booking for 3 days. Waitlists move up
          until 1 hour before class.{" "}
          <Link
            href="/faq#booking"
            className="text-link underline underline-offset-4"
          >
            Read the booking rules
          </Link>
        </p>
      </div>
    </div>
  )
}

/** Week as a table: rows are start hours, columns are days. Each cell lists one-line entries (time + name). No lanes, no clipping. */
function WeekGrid({
  list,
  onOpen,
  onMore,
}: {
  list: Session[]
  onOpen: (s: Session) => void
  onMore: (d: number) => void
}) {
  const { classBySlug } = useCatalog()
  const { dayNum } = useClubNow()
  // 5 a.m. to 8 p.m. covers every start time in the timetable.
  const hours = Array.from({ length: 16 }, (_, i) => 5 + i)
  const MAX = 3
  return (
    <div className="mt-6 hidden xl:block">
      <table className="w-full table-fixed border-collapse text-caption">
        <caption className="sr-only">Classes this week by hour and day</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-24 border-b-2 border-foreground p-2 text-left"
            >
              <span className="sr-only">Hour</span>
            </th>
            {Array.from({ length: 7 }, (_, d) => dayInfo(d, dayNum)).map(
              (dd) => (
                <th
                  key={dd.i}
                  scope="col"
                  className="border-b-2 border-foreground p-2 text-left"
                >
                  <span className="tabular block text-label">
                    {dd.short} {dd.dom}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMore(dd.i)}
                    className="min-h-11 text-caption font-normal text-link underline-offset-4 hover:underline"
                  >
                    {list.filter((s) => s.day === dd.i).length} classes
                  </button>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h} className="border-b border-border align-top">
              <th
                scope="row"
                className="tabular p-2 text-left font-normal whitespace-nowrap text-muted-foreground"
              >
                {fmtTime(h * 60)}
              </th>
              {Array.from({ length: 7 }, (_, d) => {
                const items = list
                  .filter((s) => s.day === d && Math.floor(s.start / 60) === h)
                  .sort((a, b) => a.start - b.start)
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: seven fixed weekday columns
                  <td key={d} className="p-1.5">
                    {items.slice(0, MAX).map((s) => {
                      const ct = classBySlug(s.classSlug)!
                      return (
                        // The entry truncates in a narrow column; the tooltip shows the full time and name.
                        <Tip
                          key={s.id}
                          label={`${fmtTime(s.start)} ${ct.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => onOpen(s)}
                            className="block w-full truncate border-l-2 py-0.5 pl-1.5 text-left text-caption leading-5 hover:bg-muted"
                            style={{ borderColor: catColor(ct.category) }}
                          >
                            {s.start % 60 ? (
                              <span className="tabular text-muted-foreground">
                                :{String(s.start % 60).padStart(2, "0")}{" "}
                              </span>
                            ) : null}
                            {ct.name}
                            {s.left === 0 ? " (full)" : ""}
                          </button>
                        </Tip>
                      )
                    })}
                    {items.length > MAX ? (
                      <button
                        type="button"
                        onClick={() => onMore(d)}
                        className="min-h-11 text-caption text-link underline-offset-4 hover:underline"
                      >
                        +{items.length - MAX} more
                      </button>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
