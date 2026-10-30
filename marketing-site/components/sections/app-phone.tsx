"use client"

import { BusynessMeter } from "@/components/brand/meters"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { fmtTime } from "@/lib/time"

/** A phone drawn in CSS with the next four classes from the live timetable. Shows what the app does without a screenshot. */
export function AppPhone() {
  const { clubBySlug, clubs } = useCatalog()
  const { sessions, now } = useSessions()
  const club = clubBySlug("gilbert-val-vista") ?? clubs[0]
  const rows = sessions
    .filter(
      (s) => s.clubSlug === club.slug && (s.day > 0 || s.start >= now.min)
    )
    .slice(0, 4)
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-[260px] rounded-[36px] border-[6px] border-night bg-card p-4 shadow-(--shadow-m)"
    >
      <p className="tabular text-caption font-semibold">
        {fmtTime(now.min, true)}
      </p>
      <p className="font-display-wide mt-3 text-h3">{club.name}</p>
      <div className="mt-1">
        <BusynessMeter level={club.busyness} />
      </div>
      <p className="eyebrow mt-4">Next up</p>
      <ul className="mt-1">
        {rows.map((s) => {
          return (
            <li
              key={s.id}
              className="flex items-baseline justify-between gap-2 border-t border-border py-2 text-caption"
            >
              <span className="tabular font-semibold">
                {fmtTime(s.start, true)}
              </span>
              <span className="flex-1 truncate">{s.className}</span>
              <span className="rounded-sm bg-night px-1.5 text-night-foreground">
                Book
              </span>
            </li>
          )
        })}
      </ul>
      <div className="rounded-xl mt-4 h-24 bg-muted p-3 text-caption">
        <p className="eyebrow">Pass</p>
        <p className="tabular font-data text-h3 font-bold">4821 7730</p>
      </div>
    </div>
  )
}
