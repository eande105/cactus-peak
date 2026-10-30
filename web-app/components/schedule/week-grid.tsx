"use client"
import Link from "next/link"
import { useApp } from "@/components/app/use-app"
import { Check, Clock3 } from "@/components/icons"
import { bookingOf, sessionLeft } from "@/lib/engine"
import { addDays, DOW, dayStart, fmtTime, parts } from "@/lib/time"
import type { Session } from "@/lib/types"
import { cn } from "@/lib/utils"

// Five days by hour. Each hour is a row that grows with the number of classes in it. One line per class, no lanes.
export function WeekGrid({
  start,
  sessions,
  now,
  query,
}: {
  start: number
  sessions: Session[]
  now: number
  query: string
}) {
  const { s, me } = useApp()
  const days = Array.from({ length: 5 }, (_, i) => addDays(start, i))
  const byCell = new Map<string, Session[]>()
  for (const x of sessions) {
    const k = `${dayStart(x.start)}-${parts(x.start).h}`
    byCell.set(k, [...(byCell.get(k) ?? []), x])
  }
  const hours = [
    ...new Set(
      sessions
        .filter((x) => days.includes(dayStart(x.start)))
        .map((x) => parts(x.start).h)
    ),
  ].sort((a, b) => a - b)
  const nowHour = parts(now).h
  return (
    // biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout
    <div role="grid" aria-label="Schedule by day and hour">
      <div>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus */}
        <div
          role="row"
          className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-foreground"
        >
          {/* biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout */}
          {/* biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus */}
          <div role="columnheader" />
          {days.map((d) => (
            // biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout
            // biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus
            <div key={d} role="columnheader" className="px-2 py-2">
              <span className="text-caption text-muted-foreground">
                {DOW[parts(d).dow]}
              </span>{" "}
              <span
                className={cn(
                  "num text-label",
                  d === dayStart(now) &&
                    "font-bold underline decoration-2 underline-offset-4"
                )}
              >
                {parts(d).d}
              </span>
            </div>
          ))}
        </div>
        {hours.map((h) => (
          // biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout
          // biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus
          <div
            key={h}
            role="row"
            className={cn(
              "grid grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-border",
              h === nowHour && "border-t-2 border-t-foreground"
            )}
          >
            {/* biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout */}
            {/* biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus */}
            <div
              role="rowheader"
              className="py-2 pr-2 text-right num text-caption text-muted-foreground"
            >
              {h % 12 || 12} {h < 12 ? "a.m." : "p.m."}
              {h === nowHour ? (
                <span className="font-bold block text-detail text-foreground">
                  Now {fmtTime(now, false)}
                </span>
              ) : null}
            </div>
            {days.map((d) => (
              // biome-ignore lint/a11y/useSemanticElements: ARIA table on CSS grid rows, native table elements would break the grid layout
              // biome-ignore lint/a11y/useFocusableInteractive: static table cell, the links inside it take focus
              <div
                key={d}
                role="gridcell"
                className={cn(
                  "flex flex-col gap-0.5 px-2 py-1.5",
                  d < dayStart(now) && "bg-muted/50"
                )}
              >
                {(byCell.get(`${d}-${h}`) ?? []).map((se) => {
                  const bk = bookingOf(s, me.id, se.id)
                  const left = sessionLeft(s, se)
                  const booked = bk?.status === "booked"
                  return (
                    <Link
                      key={se.id}
                      href={`/schedule/${se.id}${query}`}
                      scroll={false}
                      className={cn(
                        `cat-${se.category}`,
                        "flex min-h-8 items-center gap-2 border-l-[3px] border-cat pl-2 text-caption hover:bg-muted",
                        booked && "font-semibold"
                      )}
                    >
                      <span className="shrink-0 num text-muted-foreground">
                        {fmtTime(se.start, false)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{se.name}</span>
                      <span className="shrink-0 num text-muted-foreground">
                        {booked ? (
                          <Check
                            className="size-3.5 text-success"
                            aria-label="Booked"
                          />
                        ) : bk?.status === "waitlisted" ? (
                          <Clock3
                            className="size-3.5"
                            aria-label="On the waitlist"
                          />
                        ) : left === 0 ? (
                          "Full"
                        ) : left < 5 ? (
                          <span className="font-semibold text-warning">
                            {left} left
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
        {!hours.length ? (
          <p className="p-4 text-muted-foreground">
            No classes in these 5 days.
          </p>
        ) : null}
      </div>
    </div>
  )
}
