"use client"

import Link from "next/link"
import { useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { StatusLine } from "@/components/brand/club-parts"
import {
  type ClubId,
  ClubSet,
  clubObjects,
  generalObjects,
  ObjectRack,
} from "@/components/brand/graphics"
import { BusynessMeter } from "@/components/brand/meters"
import { Toggle } from "@/components/graphical"
import { Check } from "@/components/icons"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { fmtTime } from "@/lib/time"
import type { AmenityKey, Club } from "@/lib/types"
import { cn } from "@/lib/utils"

const isClubId = (slug: string): slug is ClubId => slug in clubObjects

/** An orbit around the club's lead object; the rest of its Set and the general objects fill the rings. */
function ClubOrbit({ slug, seed }: { slug: string; seed: number }) {
  if (!isClubId(slug)) return null
  const [lead, ...rest] = clubObjects[slug]
  return (
    <ObjectRack
      ratio="4/5"
      layout="orbit"
      scheme="copper"
      focus={lead}
      ids={[...rest, ...generalObjects.filter((id) => id !== lead)]}
      seed={seed + 1}
      className="rounded-lg"
    />
  )
}

/** Your club strip (spec 1.2). Shown only when a club is set. First-time visitors use the finder below. */
export function ClubStrip({ className }: { className?: string }) {
  const { club } = useMyClub()
  const { sessions, now } = useSessions()
  if (!club) return null
  const next = sessions.find(
    (s) => s.clubSlug === club.slug && s.day === 0 && s.start >= now.min
  )
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-card p-6 edge ring-border lg:flex-row lg:items-center lg:gap-6",
        className
      )}
    >
      {isClubId(club.slug) ? (
        <ClubSet club={club.slug} className="w-24 shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Your club</p>
        <p className="font-display-wide text-h3">{club.name}</p>
        <div className="flex flex-wrap items-center gap-x-4">
          <StatusLine />
          <BusynessMeter level={club.busyness} />
        </div>
        {next ? (
          <p className="tabular mt-1 text-caption">
            Next: {next.className}, {fmtTime(next.start)}
            {next.left <= 5 && next.left > 0
              ? `, ${next.left} ${next.unit === "bikes" ? "bikes" : "spots"} left`
              : ""}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <LinkButton href={`/tour?club=${club.slug}`}>Tour this club</LinkButton>
        <ClubChange />
      </div>
    </div>
  )
}
function ClubChange() {
  const { clear } = useMyClub()
  return (
    <button
      type="button"
      onClick={clear}
      className="min-h-11 text-label text-link underline-offset-4 hover:underline"
    >
      Change
    </button>
  )
}

/** Home club finder (spec 1.3): five rows, one photo slot that follows the focused row. Chips dim clubs that lack the amenity. */
export function ClubFinderGrid() {
  const { clubs, amenityFilters } = useCatalog()
  const [on, setOn] = useState<AmenityKey[]>([])
  const [focus, setFocus] = useState(0)
  const toggle = (k: AmenityKey) =>
    setOn((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]))
  const dim = (c: Club) => on.some((k) => !c.has[k])
  const f = clubs[focus]
  return (
    <div>
      {/* biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout */}
      <div
        role="group"
        aria-label="Filter clubs by what they have"
        className="hidden flex-wrap gap-2 md:flex"
      >
        {amenityFilters.map((a) => (
          <Toggle
            key={a.key}
            pressed={on.includes(a.key)}
            onPressedChange={() => toggle(a.key)}
            className="min-h-11"
          >
            {on.includes(a.key) ? <Check aria-hidden="true" /> : null}
            {a.label}
          </Toggle>
        ))}
      </div>
      {/* A row is a name, one line and today's status. Address, busyness and the signature list live on the club page (REDESIGN.md goal 4). */}
      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <ul className="border-t border-border lg:col-span-7">
          {clubs.map((c, i) => (
            <li
              key={c.slug}
              onMouseEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
              className={cn(
                "border-b border-border transition-opacity duration-150",
                dim(c) && "opacity-40"
              )}
            >
              <Link
                href={`/clubs/${c.slug}`}
                className="group grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
              >
                <span className="font-display-wide text-h2 group-hover:underline lg:text-h1">
                  {c.name}
                </span>
                <StatusLine className="max-sm:order-last" />
                <span className="text-body text-muted-foreground sm:col-span-2">
                  {c.personality}
                </span>
                {dim(c) ? (
                  <span className="sr-only">
                    Does not match the chosen filters
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28">
            <ClubOrbit slug={f.slug} seed={focus} />
          </div>
        </div>
      </div>
    </div>
  )
}
