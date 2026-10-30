import Link from "next/link"
import { Check } from "@/components/icons"
import { BookingStateButton, RowOpen } from "@/components/site/booking"
import { initials } from "@/lib/catalog"
import { fmtTime } from "@/lib/time"
import type { ClassType, Coach, Session } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CategoryBadge } from "./atoms"
import { categoryObject, coachObjects, GymObject, ObjectCrop } from "./graphics"
import { CategoryIcon, catColor } from "./icons"
import { CapacityIndicator, IntensityRibs } from "./meters"

/**
 * The coach's initials on Night, with their discipline's gym object as a badge (VISUAL-IDENTITY.md,
 * section 8). A real headshot replaces this when one exists.
 */
export function CoachAvatar({
  slug,
  name,
  size,
  className,
}: {
  slug: string | null | undefined
  name: string
  size?: number
  className?: string
}) {
  const object = slug ? coachObjects[slug] : undefined
  // The badge shows from 40 px; below that the initials alone stay readable.
  const badge = object && (size ?? 40) >= 40
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-night text-caption font-semibold text-night-foreground",
        className
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      {initials(name)}
      {badge ? (
        <span className="absolute -right-1 -bottom-1 grid size-[45%] place-items-center rounded-full bg-card ring-2 ring-background">
          <GymObject id={object} className="size-[70%]" />
        </span>
      ) : null}
    </span>
  )
}

export function InstructorChip({
  name,
  slug,
  size = 32,
  showName = true,
  className,
  empty = "Self-guided",
}: {
  name: string | null
  /** Coach slug, for the coach mark. */
  slug?: string | null
  size?: number
  showName?: boolean
  className?: string
  empty?: string
}) {
  if (!name)
    return (
      <span className={cn("text-caption text-muted-foreground", className)}>
        {empty}
      </span>
    )
  const [given, family] = name.split(" ")
  const short = family ? `${given} ${family[0]}.` : given
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <CoachAvatar slug={slug} name={name} size={size} />
      {showName ? (
        <span className="text-caption">{short}</span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </span>
  )
}

export function ClassCard({
  ct,
  variant = "card",
  next,
  className,
}: {
  ct: ClassType
  variant?: "card" | "compact" | "level"
  next?: string
  className?: string
}) {
  const href = `/classes/${ct.slug}`
  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex min-h-14 items-center gap-3 rounded-lg bg-card px-3 py-2 edge ring-border hover:ring-border-strong",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-1 rounded-r-sm"
          style={{ background: catColor(ct.category) }}
        />
        <CategoryIcon id={ct.category} className="ml-1 size-4 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label">{ct.name}</span>
          <span className="block text-caption text-muted-foreground">
            {ct.categoryName} · {ct.duration} min
          </span>
        </span>
        <IntensityRibs
          level={ct.intensity}
          categoryId={ct.category}
          showLabel={false}
        />
      </Link>
    )
  }
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card edge ring-border transition-[box-shadow] hover:ring-border-strong",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-10 w-1"
        style={{ background: catColor(ct.category) }}
      />
      <div className="p-2 pb-0 pl-3">
        {/* The category's object, large and cut by the frame, on the category tint. */}
        <ObjectCrop
          id={categoryObject[ct.category]}
          ratio="3/2"
          scheme={{ category: ct.category }}
          scale={0.62}
          x={0.42}
          y={0.22}
          className="rounded-md"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pl-5">
        <CategoryBadge id={ct.category} name={ct.categoryName} />
        <h3 className="font-display-wide text-h3">
          <Link href={href} className="after:absolute after:inset-0">
            {ct.name}
          </Link>
        </h3>
        <p className="text-body text-muted-foreground">{ct.blurb}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-caption">
          <span className="tabular">{ct.duration} min</span>
          <IntensityRibs level={ct.intensity} categoryId={ct.category} />
        </div>
        <p className="flex items-center gap-1.5 text-caption text-foreground">
          {ct.firstTimer ? (
            <>
              <Check className="size-3.5 text-success" aria-hidden="true" />
              Good for first-timers
            </>
          ) : (
            <span className="text-muted-foreground">Some experience helps</span>
          )}
          <span className="text-muted-foreground">
            ·{" "}
            {ct.clubs === "all"
              ? "All 5 clubs"
              : `${ct.clubs.length} ${ct.clubs.length === 1 ? "club" : "clubs"}`}
          </span>
        </p>
        {next ? (
          <p className="tabular text-caption font-medium">Next: {next}</p>
        ) : null}
      </div>
    </article>
  )
}

/** Timetable. A row is the time, the class, one muted line (coach and studio) and Book. Spots show only when they run low.
 *  Duration, category and intensity live in the booking sheet and on the class page (REDESIGN.md goal 4). */
export function ScheduleList({
  sessions,
  showClub,
  hideClass,
  onOpen,
  label,
  mobileFour,
}: {
  sessions: Session[]
  showClub?: boolean
  hideClass?: boolean
  onOpen?: (s: Session) => void
  label?: string
  mobileFour?: boolean
}) {
  return (
    <div className="@container max-w-[1040px]">
      <ul
        aria-label={label}
        className={cn(
          "border-t border-border",
          mobileFour && "max-sm:[&>li:nth-child(n+5)]:hidden"
        )}
      >
        {sessions.map((s, i) => (
          <ScheduleRow
            key={s.id}
            s={s}
            showTime={
              i === 0 ||
              sessions[i - 1].start !== s.start ||
              sessions[i - 1].day !== s.day
            }
            showClub={showClub}
            hideClass={hideClass}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </div>
  )
}
export function ScheduleRow({
  s,
  showTime = true,
  showClub,
  hideClass,
  onOpen,
}: {
  s: Session
  showTime?: boolean
  showClub?: boolean
  hideClass?: boolean
  onOpen?: (s: Session) => void
}) {
  const title = hideClass ? s.clubName : s.className
  const Title = onOpen ? (
    <button
      type="button"
      onClick={() => onOpen(s)}
      className="min-h-11 rounded-sm text-left text-body-strong underline-offset-4 hover:underline"
    >
      {title}
    </button>
  ) : (
    <Link
      href={hideClass ? `/clubs/${s.clubSlug}` : `/classes/${s.classSlug}`}
      className="inline-flex min-h-11 items-center text-body-strong underline-offset-4 hover:underline"
    >
      {title}
    </Link>
  )
  const who =
    s.coach ??
    (s.category === "youth"
      ? "Kids club staff"
      : s.category === "court"
        ? "Open play"
        : "Self-guided")
  const meta = [who, s.room, showClub && !hideClass ? s.clubShort : null]
    .filter(Boolean)
    .join(" · ")
  return (
    <li className="relative grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border py-2 @min-[620px]:grid-cols-[80px_minmax(0,1fr)_auto_104px]">
      <RowOpen s={s} onOpen={onOpen} />
      <div className="tabular text-body whitespace-nowrap">
        {showTime ? (
          fmtTime(s.start)
        ) : (
          <span className="sr-only">{fmtTime(s.start)}</span>
        )}
      </div>
      <div className="min-w-0">
        <span className="relative z-10">{Title}</span>
        <p className="truncate text-caption text-muted-foreground">{meta}</p>
      </div>
      <div className="text-right whitespace-nowrap">
        {s.left === 0 ? (
          <span className="text-caption font-semibold">
            Full{s.waitlist ? ` · ${s.waitlist} waiting` : ""}
          </span>
        ) : s.left <= 5 ? (
          <CapacityIndicator
            left={s.left}
            capacity={s.capacity}
            noun={s.unit === "bikes" ? "bikes" : "spots"}
          />
        ) : null}
      </div>
      <div className="relative z-10 hidden w-[104px] justify-self-end @min-[620px]:block">
        <BookingStateButton session={s} className="w-full" />
      </div>
    </li>
  )
}

export function CoachCard({
  coach,
  variant = "headshot",
  className,
}: {
  coach: Coach
  variant?: "headshot" | "card" | "compact"
  className?: string
}) {
  const href = `/coaches/${coach.slug}`
  const line = coach.specialties[0] ? `${coach.specialties[0]} coach` : "Coach"
  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg bg-card p-3 edge ring-border hover:ring-border-strong",
          className
        )}
      >
        <CoachAvatar slug={coach.slug} name={coach.name} size={48} />
        <span>
          <span className="block text-label group-hover:underline">
            {coach.name}
          </span>
          <span className="block text-caption text-muted-foreground">
            {line}
          </span>
        </span>
      </Link>
    )
  }
  if (variant === "headshot") {
    return (
      <Link
        href={href}
        className={cn("group flex flex-col items-start gap-3", className)}
      >
        <CoachAvatar
          slug={coach.slug}
          name={coach.name}
          className="size-24 md:size-28"
        />
        <span>
          <span className="block text-label group-hover:underline">
            {coach.name}
          </span>
          <span className="block text-body text-muted-foreground">{line}</span>
        </span>
      </Link>
    )
  }
  return (
    <article
      className={cn(
        "group relative flex flex-col items-start gap-4",
        className
      )}
    >
      <CoachAvatar
        slug={coach.slug}
        name={coach.name}
        className="size-24 md:size-28"
      />
      <div>
        <h3 className="font-display-wide text-h3">
          <Link href={href} className="after:absolute after:inset-0">
            {coach.name}
          </Link>
        </h3>
        <p className="text-body text-muted-foreground">{line}</p>
      </div>
    </article>
  )
}
