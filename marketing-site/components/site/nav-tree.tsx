"use client"

import type { ReactNode } from "react"
import {
  type ClubId,
  categoryObject,
  clubObjects,
  GymObject,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { cn } from "@/lib/utils"
import { useCatalog } from "./catalog-context"
import { useMyClub } from "./club-context"

/*
 * The site's navigation tree. The desktop header and the phone drawer render the same tree, so a
 * visitor finds a page in the same place on every screen.
 * Only Clubs and Classes open a menu (marketing spec 02, section 1): a visitor must choose one of
 * several things there, and the menu saves a page load. Every other top item is one page, so it is a
 * plain link. A menu that only repeats one page's sections makes the visitor open it for nothing.
 * Each menu ends with one callout that the header bar does not already offer (a Night card with one
 * Crop: the tour and offer band rule, VISUAL-IDENTITY.md section 8).
 */

export type NavItem = {
  href: string
  title: string
  /** One short line under the title. */
  desc?: string
  /** A bare object, 20 px. Decorative: the title names the link. */
  icon?: ReactNode
  /** A short fact at the row end, with its unit. */
  meta?: ReactNode
  badge?: string
}

/** `cols: 2` sets a list of short names (the class types) in two columns, so it stays short. */
export type NavSection = { label?: string; items: NavItem[]; cols?: 2 }

export type NavCallout = {
  href: string
  /** A short tag above the title, for a time limit or a price. */
  tag?: string
  title: string
  line: string
  action: string
  object: ObjectId
}

export type NavGroupId = "clubs" | "classes"

export type NavGroup = {
  id: NavGroupId
  label: string
  sections: NavSection[]
  callout: NavCallout
}

/** Top items that are one page each (spec 02 section 1: five top items in all). */
export const navLinks = [
  { href: "/membership", label: "Membership" },
  { href: "/personal-training", label: "Personal training" },
  { href: "/kids", label: "Kids & family" },
] as const

/** Pages a visitor looks for less often. The footer lists them on desktop; the drawer lists them on phones. */
export const moreLinks = [
  { href: "/schedule", label: "Schedule" },
  { href: "/coaches", label: "Coaches" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const

/** The fall offer. The Membership page links to it; the phone drawer shows it at the root. */
export const offerCallout: NavCallout = {
  href: "/offers/fall-climb",
  tag: "Through Nov 30",
  title: "$0 enrollment",
  line: "Join any plan this fall and skip the enrollment fee.",
  action: "See the offer",
  object: "gym-bag",
}

const isClubId = (slug: string): slug is ClubId => slug in clubObjects

const obj = (id: ObjectId) => (
  <GymObject id={id} scheme="mono" className="size-5 text-muted-foreground" />
)

export function useNavTree(): NavGroup[] {
  const { clubs, classTypes, categories } = useCatalog()
  const { club: mine } = useMyClub()
  // Your club first, so the most likely pick is at the top of the list.
  const list = [...clubs].sort((a, b) =>
    a.slug === mine?.slug ? -1 : b.slug === mine?.slug ? 1 : 0
  )
  return [
    {
      id: "clubs",
      label: "Clubs",
      sections: [
        {
          label: "Five clubs",
          items: [
            ...list.map((c) => ({
              href: `/clubs/${c.slug}`,
              title: c.name,
              desc: `${c.type} · ${c.city}`,
              // The club's lead object: its Set is too small to read at row size.
              icon: isClubId(c.slug) ? obj(clubObjects[c.slug][0]) : undefined,
              badge: c.slug === mine?.slug ? "Your club" : undefined,
            })),
          ],
        },
        {
          // The three reasons people pick a club. Kids club is a top item, so it is not repeated here.
          label: "Inside the clubs",
          items: [
            { href: "/aquatics", title: "Pools", icon: obj("wave") },
            { href: "/courts", title: "Courts", icon: obj("paddle") },
            {
              href: "/recovery",
              title: "Recovery suite",
              icon: obj("spa-stones"),
            },
          ],
        },
      ],
      // The header bar holds "Book a free tour", so this card answers the question the list cannot:
      // which club is mine, or which one is nearest.
      callout: mine
        ? {
            href: `/clubs/${mine.slug}`,
            tag: "Your club",
            title: mine.name,
            line: "Hours, classes and how busy it is now.",
            action: "Open your club",
            object: isClubId(mine.slug) ? clubObjects[mine.slug][0] : "key",
          }
        : {
            href: "/clubs",
            title: "Find your nearest club",
            line: "Enter a ZIP code to sort all five by distance, with a map.",
            action: "Open the club finder",
            object: "sneaker",
          },
    },
    {
      id: "classes",
      label: "Classes",
      sections: [
        {
          // The range at a glance (spec 02 section 1, principle 4). One click to a type skips the index.
          label: "Class types",
          cols: 2,
          items: categories.map((c) => ({
            href: `/classes/category/${c.id}`,
            title: c.name,
            icon: obj(categoryObject[c.id]),
          })),
        },
        {
          label: "Plan your week",
          items: [
            {
              href: "/schedule",
              title: "Schedule",
              desc: "This week at every club",
              icon: obj("schedule"),
            },
            {
              href: "/classes",
              title: "All classes",
              desc: `${classTypes.length} classes, with intensity`,
              icon: obj("stopwatch"),
            },
          ],
        },
      ],
      callout: {
        href: "/trial",
        tag: "Free",
        title: "Try any class for 3 days",
        line: "One club, any class with room. No card.",
        action: "Get a 3-day pass",
        object: "water-bottle",
      },
    },
  ]
}

/** The text of one list row. The parent link owns the row padding and the hover fill. */
export function NavItemBody({ item }: { item: NavItem }) {
  return (
    <>
      {item.icon ? (
        <span
          aria-hidden="true"
          className="flex w-6 shrink-0 items-center justify-center"
        >
          {item.icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-label">
          {item.title}
          {item.badge ? (
            <span className="rounded-sm bg-accent px-1.5 text-caption text-link">
              {item.badge}
            </span>
          ) : null}
        </span>
        {item.desc ? (
          <span className="block text-caption text-muted-foreground">
            {item.desc}
          </span>
        ) : null}
      </span>
      {item.meta ? (
        <span className="tabular shrink-0 text-caption text-muted-foreground">
          {item.meta}
        </span>
      ) : null}
    </>
  )
}

/**
 * The callout card body: a Night field, the object cropped by the top-right corner, the copy at the
 * foot and one copper action. The parent link owns the click target and the focus ring.
 */
export function NavCalloutBody({
  callout,
  className,
}: {
  callout: NavCallout
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex min-h-64 flex-col justify-end overflow-hidden rounded-lg bg-night p-5 pt-28 text-night-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="absolute -top-2 -right-2 block w-28">
        <ObjectCrop
          id={callout.object}
          scheme="night"
          scale={1}
          x={0.1}
          y={0}
        />
      </span>
      <span className="relative">
        {callout.tag ? (
          <span className="mb-2 inline-block rounded-sm bg-night-foreground/10 px-1.5 text-caption">
            {callout.tag}
          </span>
        ) : null}
        <span className="font-display-wide block text-h3 text-balance">
          {callout.title}
        </span>
        <span className="mt-1 block text-caption text-night-muted">
          {callout.line}
        </span>
        <span className="mt-3 inline-flex items-center gap-1 text-label font-semibold text-[color-mix(in_oklab,var(--cat-strength)_60%,var(--neutral-1))]">
          {callout.action}
          <span aria-hidden="true">→</span>
        </span>
      </span>
    </span>
  )
}
