"use client"

import { useMemo, useState } from "react"
import { TextLink } from "@/components/brand/atoms"
import { ScheduleList } from "@/components/brand/class-parts"
import { Toggle, ToggleGroup } from "@/components/graphical"
import {
  useCatalog,
  useClubNow,
  useSessions,
} from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { ClubSwitcher } from "@/components/site/club-switcher"
import { Button } from "@/components/ui/button"
import { SelectBox } from "@/components/ui/controls"
import { filterSessions } from "@/lib/catalog"
import { clubHours, dayInfo, fmtTimeShort } from "@/lib/time"
import type { ClubSlug, Session } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EmptyState } from "./common"

export function ScheduleDayStrip({
  value,
  onChange,
  counts,
  className,
}: {
  value: number
  onChange: (d: number) => void
  counts?: number[]
  className?: string
}) {
  const { dayNum } = useClubNow()
  // Single choice on a Graphical ToggleGroup. Pressing the current day again keeps it on.
  return (
    <ToggleGroup
      aria-label="Choose a day"
      value={[String(value)]}
      onValueChange={(v) => {
        if (v[0] !== undefined) onChange(Number(v[0]))
      }}
      className={cn("max-w-full scrollbar-none overflow-x-auto", className)}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const d = dayInfo(i, dayNum)
        const on = value === i
        return (
          // One line per day. An empty day dims; the count lives in the list below (REDESIGN.md goal 7).
          // The dim is a data state, so its muted text stays on the unpressed toggle.
          <Toggle
            // biome-ignore lint/suspicious/noArrayIndexKey: seven fixed weekday buttons never reorder
            key={i}
            value={String(i)}
            aria-label={
              counts
                ? `${i === 0 ? "Today" : `${d.short} ${d.dom}`}, ${counts[i]} classes`
                : undefined
            }
            className={cn(
              "tabular min-h-11 min-w-[76px] flex-1",
              !on && counts && counts[i] === 0 && "text-muted-foreground"
            )}
          >
            {i === 0 ? "Today" : `${d.short} ${d.dom}`}
          </Toggle>
        )
      })}
    </ToggleGroup>
  )
}

/** Sessions that have not started yet, and how many fall on each of the next 7 days. */
export function useUpcoming(opts: {
  club: ClubSlug | "all"
  category?: string
  classSlug?: string
  coach?: string
}) {
  const { sessions, now } = useSessions()
  const { club, category, classSlug, coach } = opts
  return useMemo(() => {
    const upcoming = filterSessions(sessions, {
      club,
      category,
      classSlug,
      coach,
    }).filter((s) => s.day > 0 || s.start >= now.min)
    const counts = Array.from(
      { length: 7 },
      (_, d) => upcoming.filter((s) => s.day === d).length
    )
    return { upcoming, counts, now }
  }, [sessions, now, club, category, classSlug, coach])
}

export function ScheduleTeaser({
  club: fixedClub,
  category,
  classSlug,
  coach,
  allowAll,
  switcher = true,
  limit = 6,
  onOpen,
  hideClass,
}: {
  club?: ClubSlug | "all"
  category?: string
  classSlug?: string
  coach?: string
  allowAll?: boolean
  switcher?: boolean
  limit?: number
  onOpen?: (s: Session) => void
  hideClass?: boolean
}) {
  const { club: mine } = useMyClub()
  const { clubs, clubBySlug } = useCatalog()
  const [day, setDay] = useState(0)
  const [picked, setPicked] = useState<ClubSlug | "all" | "">("")
  const club: ClubSlug | "all" =
    fixedClub ??
    (picked || mine?.slug || (allowAll ? "all" : "gilbert-val-vista"))
  const { upcoming, counts, now } = useUpcoming({
    club,
    category,
    classSlug,
    coach,
  })
  const rows = upcoming.filter((s) => s.day === day).slice(0, limit)
  const nextDay = counts.findIndex((c, i) => i > day && c > 0)
  const c = club === "all" ? null : clubBySlug(club)
  return (
    <div>
      {switcher && !fixedClub ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {allowAll ? (
            <SelectBox
              inline
              label="Club"
              value={club}
              onChange={setPicked}
              options={[
                { value: "all", label: "All clubs" },
                ...clubs.map((x) => ({ value: x.slug, label: x.name })),
              ]}
            />
          ) : (
            <ClubSwitcher />
          )}
        </div>
      ) : null}
      <ScheduleDayStrip value={day} onChange={setDay} counts={counts} />
      <div className="mt-4" aria-live="polite">
        {rows.length ? (
          <ScheduleList
            sessions={rows}
            showClub={club === "all"}
            hideClass={hideClass}
            onOpen={onOpen}
            mobileFour
          />
        ) : (
          <EmptyState
            title={
              day === 0
                ? `No more classes today${c ? ` at ${c.name}` : ""}.`
                : "No classes that day."
            }
            text={
              day === 0 && now.min < clubHours(now.weekday)[1]
                ? `The club is open until ${fmtTimeShort(clubHours(now.weekday)[1])}.`
                : "Try another day."
            }
          >
            {nextDay > -1 ? (
              <Button variant="outline" onClick={() => setDay(nextDay)}>
                See {dayInfo(nextDay, now.dayNum).long}
              </Button>
            ) : null}
          </EmptyState>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6">
        <TextLink
          href={`/schedule?${c ? `club=${c.slug}` : "club=all"}${category ? `&category=${category}` : ""}${classSlug ? `&class=${classSlug}` : ""}${coach ? `&coach=${coach}` : ""}`}
        >
          {classSlug
            ? "Open the full schedule for this class"
            : "See full schedule"}
        </TextLink>
        <p className="text-caption text-muted-foreground">
          All times are Arizona time.
        </p>
      </div>
    </div>
  )
}
