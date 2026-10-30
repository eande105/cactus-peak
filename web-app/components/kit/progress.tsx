"use client"
import { useState } from "react"
import { MiniCalendar } from "@/components/kit/calendar"
import { RibMeter } from "@/components/kit/ribs"
import { addDays, DOW, dateKey, dayStart } from "@/lib/time"
import { cn } from "@/lib/utils"

// Weekly goal as five ribs. Over goal shows bonus text. Month totals are plain numbers elsewhere.
export function ProgressRibs({
  visits,
  target,
  size = "md",
  className,
  variant = "inline",
}: {
  visits: number
  target: number
  size?: "md" | "xl"
  className?: string
  variant?: "inline" | "hero"
}) {
  const filled = Math.min(
    5,
    Math.round((Math.min(visits, target) / Math.max(1, target)) * 5)
  )
  const over = visits > target
  const met = visits >= target
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <RibMeter
        value={met ? 5 : filled}
        tone={met ? "success" : "brand"}
        size={size}
        label="Weekly goal"
        valueText={`${visits} of ${target} visits this week`}
        decorative
      />
      <p
        className={cn(
          variant === "hero"
            ? "font-heading text-h2 display-stretch"
            : "num text-body-strong"
        )}
      >
        <span className="num">{visits}</span> of{" "}
        <span className="num">{target}</span> visits
        {over ? (
          <span className="ml-2 text-caption font-normal text-success">
            +{visits - target} bonus
          </span>
        ) : null}
      </p>
    </div>
  )
}

export function VisitStrip({
  weekStart,
  visits,
  planned,
  today,
  goal,
}: {
  weekStart: number
  visits: Set<string>
  planned: Set<string>
  today: number
  goal: number
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const count = days.filter((d) => visits.has(dateKey(d))).length
  return (
    <div
      role="img"
      aria-label={`This week: ${count} visits so far, goal ${goal}. ${days.map((d, i) => `${DOW[(i + 1) % 7]} ${visits.has(dateKey(d)) ? "visited" : planned.has(dateKey(d)) ? "booked" : "no visit"}`).join(", ")}`}
      className="flex gap-1.5"
    >
      {days.map((d, i) => {
        const k = dateKey(d)
        const v = visits.has(k)
        const p = planned.has(k)
        return (
          <span
            key={d}
            className="flex flex-col items-center gap-1"
            aria-hidden="true"
          >
            <span
              className={cn(
                "size-3.5 rounded-full",
                v
                  ? "bg-success"
                  : p
                    ? "ring-2 ring-success ring-inset"
                    : "bg-border",
                d === dayStart(today) &&
                  "outline-2 outline-offset-2 outline-foreground"
              )}
            />
            <span className="text-tab text-muted-foreground">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export function VisitMonth({
  today,
  visits,
  planned,
}: {
  today: number
  visits: Set<string>
  planned: Set<string>
}) {
  const [month, setMonth] = useState(today)
  return (
    <MiniCalendar
      today={today}
      month={month}
      onMonthChange={setMonth}
      onSelect={() => {}}
      marks={visits}
      rings={planned}
      label="Visits this month"
      className="max-w-full sm:max-w-sm"
    />
  )
}
