"use client"
import { useState } from "react"
import { Tip } from "@/components/kit/tip"
import { Segmented } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { BUSY_WORDS } from "@/lib/data/catalog"
import { typicalFor } from "@/lib/engine"
import { DOW, hourLabel } from "@/lib/time"
import { cn } from "@/lib/utils"

// Typical hours by weekday. Bars use five stepped heights. "Now" is a text label and an outline, not a colour.
export function PopularTimesChart({
  slug,
  nowDow,
  nowHour,
  live,
}: {
  slug: string
  nowDow: number
  nowHour: number
  live: boolean
}) {
  const [dow, setDow] = useState(nowDow)
  const [table, setTable] = useState(false)
  const arr = typicalFor(slug, dow)
  const open = dow === 0 || dow === 6 ? [6, 20] : [4, 22]
  const hours = arr
    .map((v, i) => ({ h: i + 4, v }))
    .filter((x) => x.h >= open[0] && x.h < open[1])
  const peak = hours.filter((x) => x.v === Math.max(...hours.map((y) => y.v)))
  const quiet = hours.filter(
    (x) =>
      x.v ===
        Math.min(
          ...hours.filter((y) => y.h >= 8 && y.h <= 21).map((y) => y.v)
        ) && x.h >= 8
  )
  const bare = (h: number) => `${h % 12 || 12}`
  const range = (xs: { h: number }[]) => {
    const a = xs[0].h,
      b = xs.at(-1)!.h + 1
    const ap = (h: number) => (h < 12 ? "a.m." : "p.m.")
    return `${bare(a)}${ap(a) !== ap(b) ? ` ${ap(a)}` : ""} to ${bare(b)} ${ap(b)}`
  }
  const days = [1, 2, 3, 4, 5, 6, 0]
  return (
    <figure className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Day of the week"
          value={dow}
          onChange={setDow}
          size="sm"
          options={days.map((d) => ({
            value: d,
            label: DOW[d],
            sr: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ][d],
          }))}
        />
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={table}
          onClick={() => setTable((t) => !t)}
        >
          {table ? "Show as chart" : "Show as table"}
        </Button>
      </div>
      {table ? (
        <table className="w-full max-w-md text-caption">
          <caption className="sr-only">
            Typical busyness by hour, {DOW[dow]}
          </caption>
          <thead>
            <tr className="text-left text-muted-foreground">
              <th scope="col" className="py-1">
                Hour
              </th>
              <th scope="col">Typical busyness</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((x) => (
              <tr key={x.h} className="rule-b">
                <th scope="row" className="py-1.5 text-left font-normal">
                  {hourLabel(x.h)}
                </th>
                <td>
                  {BUSY_WORDS[x.v]} · <span className="num">{x.v}</span> of 5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          role="img"
          aria-label={`Typical busyness by hour on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow]}. Busiest ${range(peak)}`}
          className="flex h-40 items-end gap-1 border-b rule-b"
        >
          {hours.map((x) => {
            const isNow = live && dow === nowDow && x.h === nowHour
            return (
              <div
                key={x.h}
                className="relative flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                {isNow ? (
                  <span className="rounded-xs absolute -top-1 left-1/2 -translate-x-1/2 bg-foreground px-1 text-tab text-background">
                    Now
                  </span>
                ) : null}
                {/* A pointer hint for one bar. The bars are not focusable: the chart label and the table view carry
                    the same data for keyboard and screen reader users. */}
                <Tip content={`${hourLabel(x.h)}: ${BUSY_WORDS[x.v]}`}>
                  <div
                    className={cn(
                      "rounded-t-xs w-full bg-night/80 dark:bg-on-night/70",
                      isNow && "outline-2 outline-offset-2 outline-foreground"
                    )}
                    style={{ height: `${x.v * 17}%` }}
                  />
                </Tip>
              </div>
            )
          })}
        </div>
      )}
      {!table ? (
        <div
          className="flex justify-between text-tab text-muted-foreground"
          aria-hidden="true"
        >
          {hours
            .filter((_, i) => i % 3 === 0)
            .map((x) => (
              <span key={x.h}>
                {hourLabel(x.h).replace(".m.", "m").replace(". ", "")}
              </span>
            ))}
        </div>
      ) : null}
      <figcaption className="text-caption">
        <span className="font-semibold">Busiest</span> {range(peak)}{" "}
        <span className="font-semibold">Quietest</span>{" "}
        {quiet.length ? range(quiet.slice(0, 2)) : "after 8 p.m."}{" "}
        <span className="text-muted-foreground">Typical for {DOW[dow]}.</span>
      </figcaption>
    </figure>
  )
}
