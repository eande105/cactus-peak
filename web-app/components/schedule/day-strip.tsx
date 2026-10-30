"use client"
import { useState } from "react"
import { Popover, Toggle, ToggleGroup } from "@/components/graphical"
import { CalendarDays } from "@/components/icons"
import { MiniCalendar } from "@/components/kit/calendar"
import { Tip } from "@/components/kit/tip"
import { opensAt } from "@/lib/engine"
import {
  addDays,
  DAY,
  DOW,
  dateKey,
  dayStart,
  fmtDay,
  fmtTime,
  parts,
} from "@/lib/time"
import { cn } from "@/lib/utils"

export function dayLabel(day: number, today: number) {
  const diff = Math.round((day - dayStart(today)) / DAY)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  return `${DOW[parts(day).dow]} ${parts(day).d}`
}

export function DayStrip({
  selected,
  onSelect,
  now,
  windowDays,
  count,
  marks,
  days = windowDays + 1,
  label = "Choose a day",
}: {
  selected: number
  onSelect: (d: number) => void
  now: number
  windowDays: number
  count?: (d: number) => number
  marks?: Set<string>
  days?: number
  label?: string
}) {
  const today = dayStart(now)
  const list = Array.from({ length: days }, (_, i) => addDays(today, i))
  const [cal, setCal] = useState(false)
  const status = (d: number) => {
    const o = opensAt(d + 9 * 3600_000, windowDays)
    return now >= o ? null : `Opens ${fmtDay(o)} at ${fmtTime(o)}`
  }
  return (
    <div className="flex items-center gap-2">
      {/* One day at a time, so this is a single-choice group. The group owns arrow-key focus. */}
      <ToggleGroup
        aria-label={label}
        value={[String(dayStart(selected))]}
        onValueChange={(v) => {
          // A press on the selected day would empty the group, so ignore it.
          if (v[0] !== undefined) onSelect(Number(v[0]))
        }}
        className="flex min-w-0 flex-1 snap-x overflow-x-auto"
      >
        {list.map((d) => {
          const closed = status(d)
          const on = dayStart(selected) === d
          const n = count?.(d)
          return (
            <Tip key={d} content={closed}>
              <Toggle
                value={String(d)}
                className="relative flex min-w-[4.25rem] shrink-0 snap-start flex-col text-center"
              >
                <span
                  className={cn(
                    "whitespace-nowrap",
                    closed && !on && "text-muted-foreground"
                  )}
                >
                  {dayLabel(d, now)}
                </span>
                {n !== undefined && !closed ? (
                  <span
                    className={cn(
                      "num text-detail",
                      !on && "text-muted-foreground"
                    )}
                  >
                    {n} classes
                  </span>
                ) : closed ? (
                  <span className="text-detail">Not open</span>
                ) : null}
                {marks?.has(dateKey(d)) ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-2 right-2 size-1.5 rounded-full",
                      // The dot takes the text color on the selected day, so it shows on any selected fill.
                      on ? "bg-current" : "bg-primary"
                    )}
                  />
                ) : null}
                {marks?.has(dateKey(d)) ? (
                  <span className="sr-only">You have a booking</span>
                ) : null}
              </Toggle>
            </Tip>
          )
        })}
      </ToggleGroup>
      <Popover.Root open={cal} onOpenChange={setCal}>
        <Popover.Trigger className="!inline-flex !min-h-11 !shrink-0 !items-center !gap-2 !bg-transparent !whitespace-nowrap hover:!bg-muted">
          <CalendarDays className="size-4" aria-hidden="true" />
          <span className="max-md:sr-only">Choose date</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" sideOffset={6}>
            <Popover.Popup className="!w-auto">
              <Popover.Title className="sr-only">Choose a date</Popover.Title>
              <MiniCalendar
                today={now}
                selected={selected}
                onSelect={(d) => {
                  onSelect(d)
                  setCal(false)
                }}
                marks={marks}
                disabled={(d) => (d < today ? "Past" : false)}
              />
              <p className="text-detail text-muted-foreground">
                Arizona time (no daylight saving)
              </p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
