"use client"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "@/components/icons"
import { Tip } from "@/components/kit/tip"
import { Button } from "@/components/ui/button"
import {
  addDays,
  DAY,
  DOW,
  dateKey,
  dayStart,
  monthLabel,
  parts,
} from "@/lib/time"
import { cn } from "@/lib/utils"

// Month grid. Disabled days stay focusable and say why. Arrow keys move by day and week, PageUp/PageDown by month.
export function MiniCalendar({
  selected,
  month: monthProp,
  onMonthChange,
  onSelect,
  disabled,
  marks,
  rings,
  today,
  className,
  label = "Choose a date",
}: {
  selected?: number
  month?: number
  onMonthChange?: (m: number) => void
  onSelect: (day: number) => void
  disabled?: (day: number) => string | false | undefined
  marks?: Set<string>
  rings?: Set<string>
  today: number
  className?: string
  label?: string
}) {
  const [internal, setInternal] = useState(selected ?? today)
  const monthMs = monthProp ?? internal
  const p = parts(monthMs)
  const first = dayStart(Date.UTC(p.y, p.m, 1, 7))
  const lead = parts(first).dow
  const total = new Date(Date.UTC(p.y, p.m + 1, 0)).getUTCDate()
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => first + i * DAY),
  ]
  while (cells.length % 7) cells.push(null)
  const grid = useRef<HTMLDivElement>(null)
  const go = (delta: number) => {
    const m = Date.UTC(p.y, p.m + delta, 1, 7)
    if (onMonthChange) onMonthChange(m)
    else setInternal(m)
  }
  const focusDay = (day: number) => {
    const key = dateKey(day)
    const el = grid.current?.querySelector<HTMLElement>(`[data-key="${key}"]`)
    if (el) el.focus()
    else {
      const t = parts(day)
      const m = Date.UTC(t.y, t.m, 1, 7)
      if (onMonthChange) onMonthChange(m)
      else setInternal(m)
      requestAnimationFrame(() =>
        grid.current?.querySelector<HTMLElement>(`[data-key="${key}"]`)?.focus()
      )
    }
  }
  const focusable =
    selected && cells.includes(dayStart(selected))
      ? dayStart(selected)
      : cells.includes(dayStart(today))
        ? dayStart(today)
        : (cells.find(Boolean) as number)
  return (
    <div className={cn("w-full max-w-[22rem]", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-label" aria-live="polite">
          {monthLabel(first)}
        </p>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => go(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => go(1)}
            aria-label="Next month"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: date grid on CSS grid with roving-tabindex buttons, a native table would change the layout */}
      <div
        ref={grid}
        role="grid"
        aria-label={`${label}, ${monthLabel(first)}`}
        className="grid grid-cols-7 gap-y-1"
      >
        {DOW.map((d) => (
          // biome-ignore lint/a11y/useSemanticElements: date grid on CSS grid with roving-tabindex buttons, a native table would change the layout
          // biome-ignore lint/a11y/useFocusableInteractive: static grid cell, the button inside it takes focus
          <div
            key={d}
            role="columnheader"
            className="pb-1 text-center text-detail text-muted-foreground"
          >
            {d.slice(0, 2)}
          </div>
        ))}
        {cells.map((c, i) => {
          // biome-ignore lint/a11y/useSemanticElements: date grid on CSS grid with roving-tabindex buttons, a native table would change the layout
          // biome-ignore lint/a11y/useFocusableInteractive: static grid cell, the button inside it takes focus
          // biome-ignore lint/suspicious/noArrayIndexKey: month cells are fixed positions and never reorder
          if (c === null) return <div key={i} role="gridcell" />
          const reason = disabled?.(c)
          const sel = selected !== undefined && dayStart(selected) === c
          const isToday = dayStart(today) === c
          const key = dateKey(c)
          return (
            // biome-ignore lint/a11y/useSemanticElements: date grid on CSS grid with roving-tabindex buttons, a native table would change the layout
            // biome-ignore lint/a11y/useFocusableInteractive: static grid cell, the button inside it takes focus
            // biome-ignore lint/suspicious/noArrayIndexKey: month cells are fixed positions and never reorder
            <div key={i} role="gridcell" className="grid place-items-center">
              {/* The reason is also in the day's accessible name, so the hint only repeats it for sighted users. */}
              <Tip content={reason || undefined}>
                <button
                  type="button"
                  data-key={key}
                  tabIndex={c === focusable ? 0 : -1}
                  aria-pressed={sel}
                  aria-disabled={reason ? true : undefined}
                  aria-label={`${parts(c).d} ${monthLabel(c)}${isToday ? ", today" : ""}${marks?.has(key) ? ", has a booking" : ""}${reason ? `. ${reason}` : ""}`}
                  onClick={() => {
                    if (!reason) onSelect(c)
                  }}
                  onKeyDown={(e) => {
                    const map: Record<string, number> = {
                      ArrowLeft: -1,
                      ArrowRight: 1,
                      ArrowUp: -7,
                      ArrowDown: 7,
                    }
                    if (map[e.key] !== undefined) {
                      e.preventDefault()
                      focusDay(addDays(c, map[e.key]))
                    } else if (e.key === "PageDown" || e.key === "PageUp") {
                      e.preventDefault()
                      focusDay(
                        Date.UTC(
                          parts(c).y,
                          parts(c).m + (e.key === "PageDown" ? 1 : -1),
                          parts(c).d,
                          7
                        )
                      )
                    } else if (e.key === "Home") {
                      e.preventDefault()
                      focusDay(addDays(c, -parts(c).dow))
                    } else if (e.key === "End") {
                      e.preventDefault()
                      focusDay(addDays(c, 6 - parts(c).dow))
                    }
                  }}
                  className={cn(
                    "relative grid size-11 place-items-center rounded-full num text-body",
                    sel
                      ? "bg-night text-on-night"
                      : reason
                        ? "text-muted-foreground opacity-60"
                        : "hover:bg-muted",
                    isToday && !sel && "font-bold ring-2 ring-input ring-inset",
                    rings?.has(key) && !sel && "ring-2 ring-primary ring-inset"
                  )}
                >
                  {parts(c).d}
                  {marks?.has(key) ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-1 size-2 rounded-full",
                        sel ? "bg-on-night" : "bg-primary"
                      )}
                    />
                  ) : null}
                </button>
              </Tip>
            </div>
          )
        })}
      </div>
    </div>
  )
}
