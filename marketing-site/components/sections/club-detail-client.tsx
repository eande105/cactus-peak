"use client"

import { useEffect, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { Tabs } from "@/components/graphical"
import { useClubNow } from "@/components/site/catalog-context"
import { Tip } from "@/components/ui/controls"
import { BUSY_WORD } from "@/lib/labels"
import { clubHours, clubStatus, fmtTimeShort } from "@/lib/time"
import type { Club, Level } from "@/lib/types"
import { cn } from "@/lib/utils"

const WEEK = [1, 2, 3, 4, 5, 6, 0] // Monday first
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/** Typical busyness by hour from the club row (index 0 = 4 a.m.), for a weekday (0 = Sunday). */
function typical(club: Club, weekday: number) {
  const weekend = weekday === 0 || weekday === 6
  const [open, close] = clubHours(weekday)
  return (weekend ? club.typicalWeekend : club.typicalWeekday)
    .map((v, i) => [i + 4, v] as const)
    .filter(([h]) => h * 60 >= open - 30 && h * 60 < close)
}

export function PopularTimesChart({ club }: { club: Club }) {
  const now = useClubNow()
  const [pick, setPick] = useState<number | null>(null)
  const day = pick ?? now.weekday
  const data = typical(club, day)
  const nowH = Math.floor(now.min / 60)
  const status = clubStatus(now)
  const usual = typical(club, now.weekday).find(([h]) => h === nowH)?.[1]
  return (
    <div>
      <h3 className="eyebrow mb-3">Popular times</h3>
      {/* The tabs pick the day the chart shows. The chart redraws in place, so there is one shared panel area. */}
      <Tabs.Root
        value={day}
        onValueChange={(v) => setPick(v as number)}
        className="mb-4"
      >
        <Tabs.List
          aria-label="Day of week"
          className="max-w-full scrollbar-none overflow-x-auto"
        >
          {WEEK.map((d) => (
            <Tabs.Tab key={d} value={d} className="min-h-11 min-w-11">
              {DAY_SHORT[d]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
      <ul
        className="flex h-40 items-end gap-1 border-b border-border-strong"
        aria-label={`Typical busyness, ${DAY_LONG[day]}`}
      >
        {data.map(([h, v]) => {
          const isNow = day === now.weekday && h === nowH && status.open
          const label = `${DAY_LONG[day]} ${fmtTimeShort(h * 60)}: ${BUSY_WORD[(v || 1) as Level]}${isNow ? ". Now" : ""}`
          return (
            <li
              key={h}
              className="relative flex h-full flex-1 flex-col justify-end"
            >
              {/* The bar is chart art, so it keeps its own fill. The Graphical tooltip shows the value on hover and focus. */}
              <Tip label={label}>
                <button
                  type="button"
                  aria-label={label}
                  className={cn(
                    "w-full min-w-3 rounded-t-sm transition-[height] duration-150",
                    isNow ? "bg-primary" : "bg-night/70 hover:bg-night"
                  )}
                  style={{ height: `${(v || 0.3) * 20}%` }}
                />
              </Tip>
            </li>
          )
        })}
      </ul>
      <div
        className="tabular mt-1 flex justify-between text-caption text-muted-foreground"
        aria-hidden="true"
      >
        {data
          .filter(([h]) => h % 3 === 0)
          .map(([h]) => (
            <span key={h}>{fmtTimeShort(h * 60)}</span>
          ))}
      </div>
      <p className="mt-3 text-body text-muted-foreground">
        Typical busyness. Quietest: weekdays 1:00–3:00 p.m. and after 8:00 p.m.{" "}
        {status.open && usual ? (
          <>
            Usually at this hour at {club.short}:{" "}
            <span className="font-semibold text-foreground">
              {BUSY_WORD[usual as Level]}
            </span>
            .
          </>
        ) : (
          <>{club.short} is closed now.</>
        )}
      </p>
    </div>
  )
}

export function SectionNav({
  items,
  cta,
}: {
  items: { id: string; label: string }[]
  cta: { href: string; label: string }
}) {
  const [active, setActive] = useState(items[0].id)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    items.forEach((i) => {
      const el = document.getElementById(i.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [items])
  useEffect(() => {
    const el = document.getElementById("quick-facts")
    if (!el) return
    const io = new IntersectionObserver(([e]) =>
      setStuck(!e.isIntersecting && e.boundingClientRect.top < 0)
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-40 border-y border-border bg-background"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <ul className="flex scrollbar-none overflow-x-auto">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={cn(
                  "relative inline-flex min-h-14 items-center px-4 text-label whitespace-nowrap hover:bg-muted",
                  active === i.id &&
                    "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-primary"
                )}
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
        <LinkButton
          href={cta.href}
          size="sm"
          className={cn(
            "hidden shrink-0 transition-opacity duration-150 lg:inline-flex",
            stuck ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          tabIndex={stuck ? 0 : -1}
        >
          {cta.label}
        </LinkButton>
      </div>
    </nav>
  )
}
