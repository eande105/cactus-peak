"use client"
import Link from "next/link"
import { useApp } from "@/components/app/use-app"
import { SessionAction } from "@/components/booking/session-action"
import { categoryObject, ObjectCrop } from "@/components/brand/graphics"
import { Check, Clock3, TriangleAlert } from "@/components/icons"
import { ArtFrame } from "@/components/kit/brand-art"
import { CategoryBadge } from "@/components/kit/category"
import { CapacityIndicator, IntensityRibs } from "@/components/kit/ribs"
import { CLUB_BY_SLUG, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { bookingOf, bookingState, sessionLeft, waitCount } from "@/lib/engine"
import { fmtDowTime, fmtRange, fmtTime } from "@/lib/time"
import type { Session } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ClassTags({ se }: { se: Session }) {
  const tags = [
    se.firstTimerOk ? "First-timers welcome" : "",
    se.teenOk && se.category !== "youth" ? "Teen OK" : "",
    se.minAge >= 18 ? "18+" : "",
  ].filter(Boolean)
  return tags.length ? (
    <span className="text-detail text-muted-foreground">
      {tags.join(" · ")}
    </span>
  ) : null
}

// One line per class: time, class, coach, club, intensity, spots. The row opens the sheet; the action lives there.
// Only a held spot keeps a button, because its clock is running.
export function ScheduleRow({
  se,
  showClub,
  query = "",
}: {
  se: Session
  showClub?: boolean
  query?: string
}) {
  const { s, me, now } = useApp()
  const st = bookingState(s, me.id, se, now)
  const left = sessionLeft(s, se)
  const mine = st.state === "booked" || st.state === "late-cancel"
  const inst = INSTRUCTOR_BY_ID[se.instructorId]
  const status = mine ? (
    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
      <Check className="size-4 text-success" aria-hidden="true" />
      Booked
    </span>
  ) : st.state === "waitlisted" ? (
    <span className="font-semibold">Waitlist #{st.booking?.position}</span>
  ) : st.state === "started" ? (
    <span className="text-muted-foreground">Started</span>
  ) : st.state === "paused" || st.state === "restricted" ? (
    <span className="text-muted-foreground">{st.label}</span>
  ) : (
    <CapacityIndicator
      left={left}
      capacity={se.capacity}
      unit={se.unit}
      waiting={waitCount(s, se)}
      variant="text"
    />
  )
  return (
    <li
      className={cn(
        `cat-${se.category}`,
        "relative grid grid-cols-[88px_3px_minmax(0,1fr)_auto] items-center gap-x-3 px-1 py-2.5 hover:bg-muted/60 max-md:grid-cols-[3px_minmax(0,1fr)_auto] max-md:gap-y-0.5 max-md:py-3"
      )}
    >
      <span className="num text-body-strong whitespace-nowrap max-md:col-start-2 max-md:row-start-1">
        {fmtTime(se.start)}
        <span className="ml-2 text-detail font-normal text-muted-foreground md:hidden">
          {se.duration} min
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "w-[3px] self-stretch rounded-full max-md:col-start-1 max-md:row-span-2 max-md:row-start-1",
          mine ? "bg-success" : "bg-cat"
        )}
      />
      <div className="min-w-0 max-md:col-start-2 max-md:row-start-2">
        <h3 className="flex min-w-0 flex-wrap items-baseline gap-x-3 text-body-strong">
          <Link
            href={`/schedule/${se.id}${query}`}
            scroll={false}
            className="after:absolute after:inset-0 hover:underline focus-visible:outline-offset-[-2px]"
          >
            {se.name}
            <span className="sr-only">
              , {fmtTime(se.start)}, {inst?.name}
            </span>
          </Link>
          <span className="text-caption font-normal text-muted-foreground max-md:basis-full">
            {inst?.name} · {se.studio}
            {showClub ? ` · ${CLUB_BY_SLUG[se.clubSlug].name}` : ""}
          </span>
          <IntensityRibs
            level={se.intensity}
            category={se.category}
            className="font-normal whitespace-nowrap max-md:hidden"
          />
        </h3>
        {mine && st.state === "late-cancel" ? (
          <p className="text-caption text-warning">
            Cancelling now is a late cancel.
          </p>
        ) : null}
      </div>
      <div className="text-right num text-caption max-md:col-start-3 max-md:row-span-2 max-md:row-start-1 max-md:self-center">
        {st.state === "hold" ? (
          <span className="relative z-10 block">
            <SessionAction se={se} />
          </span>
        ) : (
          status
        )}
      </div>
    </li>
  )
}

export function CompactClass({
  se,
  className,
  label,
}: {
  se: Session
  className?: string
  label?: string
}) {
  const { s, me, now } = useApp()
  const st = bookingState(s, me.id, se, now)
  const bk = bookingOf(s, me.id, se.id)
  return (
    <Link
      href={`/schedule/${se.id}`}
      scroll={false}
      className={cn(
        `cat-${se.category}`,
        "relative flex min-w-52 flex-col gap-1 border-l-4 border-cat py-1 pr-2 pl-3 hover:bg-muted",
        className
      )}
    >
      <span className="text-detail text-muted-foreground">
        {label ?? fmtDowTime(se.start)}
      </span>
      <span className="text-label">{se.name}</span>
      <span className="flex items-center gap-2 text-detail text-muted-foreground">
        {st.state === "booked" || st.state === "late-cancel" ? (
          <span className="inline-flex items-center gap-1 text-foreground">
            <Check className="size-3.5 text-success" aria-hidden="true" />
            Booked
          </span>
        ) : bk?.status === "waitlisted" ? (
          <span className="inline-flex items-center gap-1 text-foreground">
            <Clock3 className="size-3.5" aria-hidden="true" />
            Waitlist {bk.position === 2 ? "2nd" : `#${bk.position}`}
          </span>
        ) : st.state === "hold" ? (
          <span className="inline-flex items-center gap-1 text-warning">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            Spot held
          </span>
        ) : (
          <CapacityIndicator
            variant="text"
            left={sessionLeft(s, se)}
            capacity={se.capacity}
            unit={se.unit}
            waiting={waitCount(s, se)}
          />
        )}
      </span>
    </Link>
  )
}

export function SuggestedCard({ se }: { se: Session }) {
  const { s } = useApp()
  const left = sessionLeft(s, se)
  const club = CLUB_BY_SLUG[se.clubSlug]
  return (
    <Link
      href={`/schedule/${se.id}`}
      scroll={false}
      className={cn(
        `cat-${se.category}`,
        "group flex min-w-64 snap-start flex-col gap-2"
      )}
    >
      <ArtFrame
        className="aspect-[16/9] rounded-md"
        art={
          <ObjectCrop
            id={categoryObject[se.category]}
            ratio="16/9"
            scheme={{ category: se.category }}
            scale={0.5}
            x={0.48}
            y={0.18}
            fill
          />
        }
      >
        <span className="absolute right-2 bottom-2 rounded-sm bg-photo-band px-2 py-0.5 num text-detail text-on-night">
          {se.duration} min
        </span>
        {left > 0 && left < 5 ? (
          <span className="absolute top-2 left-2">
            <CapacityIndicator
              variant="badge"
              left={left}
              capacity={se.capacity}
              unit={se.unit}
            />
          </span>
        ) : null}
      </ArtFrame>
      <div>
        <p className="text-detail text-muted-foreground">
          {fmtDowTime(se.start)} · {club.name}
        </p>
        <p className="text-body-strong group-hover:underline">{se.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryBadge id={se.category} />
          <IntensityRibs level={se.intensity} category={se.category} />
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          {INSTRUCTOR_BY_ID[se.instructorId]?.name}
          {se.firstTimerOk ? " · First-timers welcome" : ""}
        </p>
      </div>
    </Link>
  )
}
void fmtRange
