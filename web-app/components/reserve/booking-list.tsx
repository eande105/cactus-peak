"use client"
import Link from "next/link"
import { useApp } from "@/components/app/use-app"
import { Check } from "@/components/icons"
import { StatusPill } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { fmtDay, fmtRange, fmtTime } from "@/lib/time"
import type { Booking } from "@/lib/types"

export function BookingList({ list }: { list: Booking[] }) {
  const { s } = useApp()
  const seen = new Set<string>()
  const rows = list
    .filter((b) => {
      const k = b.kind === "kids" ? `${b.ref}${b.start}` : b.id
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => a.start - b.start)
  return (
    <ul className="mt-2 rule-rows">
      {rows.map((b) => (
        <li
          key={b.id}
          className={`cat-${b.category} flex flex-wrap items-center gap-x-4 gap-y-2 py-3`}
        >
          <span className="w-28 shrink-0">
            <span className="block num text-body-strong">
              {fmtTime(b.start)}
            </span>
            <span className="block text-detail text-muted-foreground">
              {fmtDay(b.start)}
            </span>
          </span>
          <span className="h-9 w-1 rounded-full bg-cat" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-label">
              {b.kind === "kids"
                ? `Kids club · ${list
                    .filter((x) => x.ref === b.ref && x.start === b.start)
                    .map((x) => s.members[x.memberId].firstName)
                    .join(", ")}`
                : b.title}
            </span>
            <span className="block text-caption text-muted-foreground">
              {fmtRange(b.start, b.end)} · {b.place}
            </span>
          </span>
          <StatusPill tone="success" icon={Check}>
            Booked
          </StatusPill>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/bookings" />}
          >
            Details
          </Button>
        </li>
      ))}
    </ul>
  )
}
