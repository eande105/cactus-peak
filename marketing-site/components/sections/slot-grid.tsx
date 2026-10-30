"use client"

import { useState } from "react"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { Check, X } from "@/components/icons"
import { fmtTime } from "@/lib/time"
import { cn } from "@/lib/utils"

/** Read-only slot preview. Words and icons carry state, never colour alone. */
export function LaneGrid() {
  const slots = [360, 405, 450, 495, 540, 585, 630, 675]
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map((m, i) => {
        const left = [2, 0, 3, 5, 6, 4, 1, 8][i]
        return (
          <li key={m} className="rounded-md bg-card px-3 py-2 edge ring-border">
            <p className="tabular text-label">{fmtTime(m)}</p>
            <p className="text-caption text-muted-foreground">
              {left === 0
                ? "Full"
                : left <= 5
                  ? `${left} lanes left`
                  : "Lanes open"}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
export function CourtGrid() {
  const [dur, setDur] = useState<60 | 90>(60)
  const times = [420, 480, 540, 600, 660, 720]
  const courts = [1, 2, 3, 4, 5, 6]
  return (
    <div>
      {/* Single choice: pressing the current length again keeps it on. */}
      <ToggleGroup
        aria-label="Slot length"
        value={[String(dur)]}
        onValueChange={(v) => {
          if (v[0]) setDur(Number(v[0]) as 60 | 90)
        }}
        className="mb-4"
      >
        {([60, 90] as const).map((d) => (
          <Toggle key={d} value={String(d)} className="min-h-11">
            {d} min
          </Toggle>
        ))}
      </ToggleGroup>
      <section
        className="relative overflow-x-auto rounded-lg bg-card edge ring-border"
        aria-label="Courts open today"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs a tab stop so keyboard users can scroll it
        tabIndex={0}
      >
        <table className="w-full min-w-[560px] text-caption">
          <thead>
            <tr>
              <th className="p-3 text-left" scope="col">
                <span className="sr-only">Time</span>
              </th>
              {courts.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="p-3 text-left text-caption font-semibold text-muted-foreground"
                >
                  Court {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t, r) => (
              <tr key={t} className="border-t border-border">
                <th scope="row" className="tabular p-3 text-left">
                  {fmtTime(t)}
                </th>
                {courts.map((c, i) => {
                  const open = (r * 7 + i * 3 + (dur === 90 ? 2 : 0)) % 5 > 1
                  return (
                    <td key={c} className="p-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          !open && "text-muted-foreground"
                        )}
                      >
                        {open ? (
                          <Check
                            className="size-4 text-success"
                            aria-hidden="true"
                          />
                        ) : (
                          <X className="size-4" aria-hidden="true" />
                        )}
                        {open ? "Open" : "Booked"}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
