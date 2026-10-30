"use client"

import Link from "next/link"
import { Fragment } from "react"
import { Clock, MapPin, Phone } from "@/components/icons"
import { useClubNow } from "@/components/site/catalog-context"
import { clubStatus, fmtRange } from "@/lib/time"
import type { Club } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AmenityChip, LinkButton, TextLink } from "./atoms"
import { ClubArt } from "./club-art"
import { BusynessMeter } from "./meters"

export function StatusLine({
  className,
  showHours,
}: {
  className?: string
  showHours?: boolean
}) {
  const s = clubStatus(useClubNow())
  const Icon = s.state === "open" ? "dot" : Clock
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-caption font-medium text-foreground",
        className
      )}
    >
      {Icon === "dot" ? (
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
      ) : (
        <Clock className="size-3.5 text-warning" aria-hidden="true" />
      )}
      {s.text}
      {showHours ? (
        <span className="font-normal text-muted-foreground">
          ({s.hours} today)
        </span>
      ) : null}
    </span>
  )
}

const BARVAR: Record<string, string> = {
  copper: "--cat-strength",
  night: "--night",
  sage: "--cat-mind-body",
  teal: "--cat-aqua",
  gold: "--cat-court",
  plum: "--cat-recovery",
  sand: "--neutral-6",
  rose: "--cat-youth",
}
export type ClubCardVariant =
  | "compact"
  | "feature"
  | "grid"
  | "list-row"
  | "map-callout"
export function ClubCard({
  club,
  variant = "grid",
  yourClub,
  dim,
  distance,
  active,
  className,
  ctaLabel = "Tour this club",
}: {
  club: Club
  variant?: ClubCardVariant
  yourClub?: boolean
  dim?: boolean
  distance?: number
  active?: boolean
  className?: string
  ctaLabel?: string
}) {
  const status = clubStatus(useClubNow())
  const tour = `/tour?club=${club.slug}`
  const href = `/clubs/${club.slug}`
  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex min-h-16 items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted",
          className
        )}
      >
        <ClubArt
          slug={club.slug}
          detail="simple"
          className="w-14 shrink-0 rounded-sm"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-label">
            {club.name}
            {yourClub ? (
              <span className="rounded-sm bg-accent px-1.5 text-caption text-link">
                Your club
              </span>
            ) : null}
          </span>
          <span className="block text-caption text-muted-foreground">
            {club.type}
            <span aria-hidden="true"> · </span>
            <span className="text-foreground">{status.text}</span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    )
  }
  const chips = club.signature
  const dimmed = dim ? "opacity-50" : ""
  if (variant === "list-row" || variant === "map-callout") {
    const n = club.n
    return (
      <article
        data-club={club.slug}
        aria-label={club.name}
        className={cn(
          "relative grid gap-x-4 gap-y-1 border-b border-border py-4 pr-2 pl-6 transition-[background-color,opacity] hover:bg-card",
          active && "bg-accent",
          dimmed,
          className
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-4 left-0 w-[3px] rounded-r-sm"
          style={{ background: `var(${BARVAR[club.tone]})` }}
        />
        {dim ? (
          <p className="sr-only">Does not match the chosen filters</p>
        ) : null}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display-wide text-h3">
            <span className="tabular mr-2 inline-flex size-7 items-center justify-center rounded-full bg-night text-caption font-semibold text-night-foreground">
              <span className="sr-only">Pin </span>
              {n}
            </span>
            {club.name}
          </h3>
          {distance !== undefined ? (
            <span className="tabular shrink-0 text-label text-foreground">
              {distance.toFixed(1)} mi
            </span>
          ) : null}
        </div>
        <p className="text-body text-muted-foreground">
          {club.cross}, {club.city}
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <StatusLine showHours />
          <BusynessMeter level={club.busyness} />
        </p>
        <p className="text-caption text-muted-foreground">
          {club.signature.join(" · ")}
        </p>
        <div className="flex flex-wrap items-center gap-x-6">
          <TextLink href={tour}>Tour</TextLink>
          <TextLink href={href}>See club</TextLink>
        </div>
      </article>
    )
  }
  const feature = variant === "feature"
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg bg-card edge ring-border transition-[box-shadow,opacity] hover:ring-border-strong",
        feature ? "h-full" : "",
        dimmed,
        className
      )}
    >
      <div className="p-2 pb-0">
        <ClubArt slug={club.slug} ratio="4/3" className="rounded-md" />
      </div>
      <div
        className={cn("flex flex-1 flex-col gap-3 p-4", feature && "sm:p-6")}
      >
        {dim ? (
          <p className="sr-only">Does not match the chosen filters</p>
        ) : null}
        <div>
          <h3
            className={cn(
              "font-display-wide mt-1",
              feature ? "text-h2" : "text-h3"
            )}
          >
            <Link
              href={href}
              className="after:absolute after:inset-0 hover:underline"
            >
              {club.name}
            </Link>
          </h3>
          <p
            className={cn(
              "mt-1",
              feature ? "text-body" : "text-caption text-muted-foreground"
            )}
          >
            {club.personality}
          </p>
        </div>
        {!feature ? (
          <p className="text-caption text-muted-foreground">{club.cross}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {(feature ? club.amenities.slice(0, 5) : chips).map((c) => (
            <AmenityChip key={c}>{c}</AmenityChip>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <StatusLine showHours={feature} />
          <BusynessMeter level={club.busyness} />
        </div>
        <div className="relative z-10 pt-1">
          <LinkButton href={tour} size={feature ? "md" : "sm"}>
            {ctaLabel}
          </LinkButton>
        </div>
      </div>
    </article>
  )
}

/** Weekdays | weekend, today bold with a Today tag (spec: HoursTable). */
export function HoursTable({
  compact,
  className,
  kids,
  pool,
}: {
  compact?: boolean
  className?: string
  kids?: boolean
  pool?: boolean
}) {
  const { weekday } = useClubNow()
  const today = { weekend: weekday === 0 || weekday === 6 }
  const rows: { label: string; hours: string; isToday: boolean }[] = pool
    ? [
        {
          label: "Mon–Fri",
          hours: fmtRange(270, 21 * 60 + 30),
          isToday: !today.weekend,
        },
        {
          label: "Sat–Sun",
          hours: fmtRange(360, 19 * 60 + 30),
          isToday: today.weekend,
        },
      ]
    : [
        {
          label: "Mon–Fri",
          hours: fmtRange(270, 22 * 60),
          isToday: !today.weekend,
        },
        {
          label: "Sat–Sun",
          hours: fmtRange(360, 20 * 60),
          isToday: today.weekend,
        },
      ]
  return (
    <dl
      className={cn(
        "grid gap-y-2 text-caption",
        compact ? "grid-cols-2 gap-x-4" : "grid-cols-[auto_1fr] gap-x-8",
        className
      )}
    >
      {rows.map((r) => (
        <Fragment key={r.label}>
          <dt
            className={cn(
              r.isToday
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {r.label}
            {r.isToday ? (
              <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 text-caption text-foreground">
                Today
              </span>
            ) : null}
          </dt>
          <dd className={cn("tabular", r.isToday ? "font-semibold" : "")}>
            {r.hours}
          </dd>
        </Fragment>
      ))}
      {!compact && !pool ? (
        <>
          <dt className="text-muted-foreground">Staffed</dt>
          <dd className="tabular">6:00 a.m.–8:00 p.m.</dd>
          {kids ? (
            <>
              <dt className="text-muted-foreground">Kids club</dt>
              <dd className="tabular">
                Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m.
              </dd>
            </>
          ) : null}
        </>
      ) : null}
    </dl>
  )
}

export function ClubContact({ club }: { club: Club }) {
  return (
    <div className="flex flex-col gap-1 text-caption">
      <span className="inline-flex items-start gap-2">
        <MapPin
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {club.cross}, {club.city}, AZ {club.zip}
      </span>
      <a
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline"
        href={`tel:${club.tel}`}
      >
        <Phone className="size-4" aria-hidden="true" />
        {club.phone}
      </a>
    </div>
  )
}
