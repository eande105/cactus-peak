"use client"

import { Clock } from "@/components/icons"
import { clubStatus } from "@/lib/time"
import { cn } from "@/lib/utils"
import { useClubNow } from "./catalog-context"

/** Open, closing soon or closed, from the live Arizona clock. All five clubs keep the same hours. */
export function LiveClubStatus({
  className,
  short,
  iconClassName = "size-3",
}: {
  className?: string
  short?: boolean
  iconClassName?: string
}) {
  const s = clubStatus(useClubNow())
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {s.state === "open" ? (
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
      ) : (
        <Clock
          className={cn(iconClassName, s.open && "text-warning")}
          aria-hidden="true"
        />
      )}
      {short ? s.short : s.text}
    </span>
  )
}

/** A "Today" tag that shows when today is in the given group of days. */
export function TodayTag({
  weekend,
  className,
}: {
  weekend: boolean
  className?: string
}) {
  const { weekday } = useClubNow()
  const isWeekend = weekday === 0 || weekday === 6
  if (isWeekend !== weekend) return null
  return <span className={className}>Today</span>
}
