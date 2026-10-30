import Link from "next/link"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import {
  type ClubId,
  clubObjects,
  GymObject,
  type ObjectId,
  ObjectRack,
  ObjectRow,
} from "@/components/brand/graphics"
import { ArrowLeft, Check, ChevronRight } from "@/components/icons"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { PassEmailRow } from "./pass-email"

export function Container({
  children,
  className,
  as: T = "div",
  id,
}: {
  children: React.ReactNode
  className?: string
  as?: "div" | "section" | "header"
  id?: string
}) {
  return (
    <T
      id={id}
      className={cn(
        "mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </T>
  )
}
/** Section band. Tone alternates background and surface-muted; never two muted bands in a row. */
export function Band({
  children,
  tone = "plain",
  className,
  id,
  label,
}: {
  children: React.ReactNode
  tone?: "plain" | "muted" | "tint" | "night"
  className?: string
  id?: string
  label?: string
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn(
        "scroll-mt-24 py-12 lg:py-24",
        tone === "muted" && "border-t border-border",
        tone === "tint" && "bg-muted",
        tone === "night" && "bg-night text-night-foreground",
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  )
}

/** Four section types. Use each at most once in a row. */
/** 1. Lead: a 66 px heading on 5 columns and one fact at display size on 7. */
export function LeadSection({
  title,
  fact,
  factLabel,
  icon,
  children,
  id,
}: {
  title: string
  fact?: string
  factLabel?: string
  /** A gym object set beside the fact, as a visual accent for what the fact is about. */
  icon?: ObjectId
  children?: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 lg:py-24">
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <h2 className="display-lead lg:col-span-5">{title}</h2>
        {fact ? (
          <div className="lg:col-span-7">
            <p className="flex items-end gap-4">
              <span className="tabular font-data text-[clamp(3.5rem,8vw,7rem)] leading-none font-bold">
                {fact}
              </span>
              {icon ? (
                <GymObject
                  id={icon}
                  className="mb-1 size-14 shrink-0 lg:size-20"
                />
              ) : null}
            </p>
            {factLabel ? (
              <p className="mt-2 text-body text-muted-foreground">
                {factLabel}
              </p>
            ) : null}
          </div>
        ) : null}
        {children ? (
          <div className="min-w-0 lg:col-span-12">{children}</div>
        ) : null}
      </Container>
    </section>
  )
}
/** 2. Dense: a quiet 24 px label over a full-width table or list, with a rule. */
export function DenseSection({
  label,
  icon,
  children,
  id,
}: {
  label: string
  /** A gym object before the label. */
  icon?: ObjectId
  children: React.ReactNode
  id?: string
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border py-8 lg:py-12"
    >
      <Container>
        <h2 className="display-quiet mb-4 flex items-center gap-3">
          {icon ? <GymObject id={icon} className="size-8 shrink-0" /> : null}
          {label}
        </h2>
        {children}
      </Container>
    </section>
  )
}
/** 3. Split: a sticky 24 px label on 4 columns, rows on 8. */
export function SplitSection({
  label,
  graphic,
  children,
  id,
}: {
  label: string
  /** A bento graphic (an ObjectRack) under the sticky label that pictures the section's point. */
  graphic?: React.ReactNode
  children: React.ReactNode
  id?: string
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border py-10 lg:py-16"
    >
      <Container className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <h2 className="display-quiet">{label}</h2>
          {graphic ? (
            <div className="mt-6 hidden overflow-hidden rounded-lg sm:block">
              {graphic}
            </div>
          ) : null}
        </div>
        {/* min-w-0 lets a wide table scroll inside its own container instead of widening the page. */}
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </Container>
    </section>
  )
}
/** 4. Quiet: plain text at a reading width, no heading weight. */
export function QuietSection({
  children,
  id,
}: {
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-24 py-8 lg:py-12">
      <Container>
        <div className="max-w-[62ch] text-body">{children}</div>
      </Container>
    </section>
  )
}

export function Breadcrumbs({
  trail,
}: {
  trail: { label: string; href?: string }[]
}) {
  const parent = [...trail].reverse().find((t) => t.href)
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8"
    >
      {parent ? (
        <Link
          href={parent.href!}
          className="inline-flex min-h-11 items-center gap-1 text-caption text-link hover:underline sm:hidden"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {parent.label}
        </Link>
      ) : null}
      <ol className="hidden min-h-11 flex-wrap items-center gap-1 text-caption sm:flex">
        <li>
          <Link href="/" className="text-link hover:underline">
            Home
          </Link>
        </li>
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1">
            <ChevronRight
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {t.href && i < trail.length - 1 ? (
              <Link href={t.href} className="text-link hover:underline">
                {t.label}
              </Link>
            ) : (
              <span aria-current="page">{t.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** What a tour includes: a bag, a locker key, the schedule, a coach, a towel and water. */
const TOUR_OBJECTS: readonly ObjectId[] = [
  "key",
  "schedule",
  "whistle",
  "towel",
  "water-bottle",
  "heart-watch",
]
const tourIds = (club?: string): readonly ObjectId[] =>
  club && club in clubObjects
    ? [...clubObjects[club as ClubId], ...TOUR_OBJECTS]
    : TOUR_OBJECTS

export function TourCTABand({
  title = "Come see the club.",
  support = "A 30-minute tour. A coach, not a salesperson. No card.",
  club,
  phone = "(480) 555-0100",
  tel = "+14805550100",
  primary = "Book a free tour",
  passEmail,
  night,
}: {
  title?: string
  support?: string
  club?: string
  phone?: string
  tel?: string
  primary?: string
  passEmail?: boolean
  night?: boolean
  variant?: string
}) {
  if (night) {
    return (
      <section
        aria-labelledby="tour-band-title"
        className="bg-night text-night-foreground"
      >
        <Container className="grid gap-8 py-12 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <h2
              id="tour-band-title"
              className="display-lead text-night-foreground"
            >
              {title}
            </h2>
            <p className="mt-3 max-w-[48ch] text-body text-night-muted">
              {support}
            </p>
          </div>
          <div className="flex flex-col justify-end gap-4 lg:col-span-5">
            {/* What the tour includes: the gym bag at the hub, the club's objects and the tour's on the spokes. */}
            <ObjectRack
              ratio="16/9"
              layout="hub"
              focus="gym-bag"
              ids={tourIds(club)}
              className="hidden rounded-lg lg:block"
            />
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={club ? `/tour?club=${club}` : "/tour"}
                size="lg"
                className="bg-[var(--color-3)] text-[var(--neutral-10)] hover:bg-[var(--color-3)]/90"
              >
                {primary}
              </LinkButton>
              {!passEmail ? (
                <LinkButton
                  href="/trial"
                  variant="outline"
                  size="lg"
                  className="text-night-foreground ring-night-muted hover:bg-night-foreground/10"
                >
                  Try a free 3-day pass
                </LinkButton>
              ) : null}
            </div>
            {passEmail ? <PassEmailRow /> : null}
            <p className="text-caption text-night-muted">
              Or call {club ? "the club" : "your club"}:{" "}
              <a
                className="font-semibold text-night-foreground underline underline-offset-4"
                href={`tel:${tel}`}
              >
                {phone}
              </a>
            </p>
          </div>
        </Container>
      </section>
    )
  }
  // Sand closing block: Night appears once per site flow (the footer), and on Home.
  return (
    <section aria-labelledby="tour-band-title">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 border-t-2 border-foreground pt-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ObjectRow
              ids={tourIds(club).slice(0, 3)}
              className="mb-4 h-8 w-auto"
            />
            <h2
              id="tour-band-title"
              className="font-display-wide text-h2 lg:text-h1"
            >
              {title}
            </h2>
            <p className="mt-2 max-w-[52ch] text-body text-muted-foreground">
              {support}
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={club ? `/tour?club=${club}` : "/tour"}
                size="lg"
              >
                {primary}
              </LinkButton>
              <LinkButton href="/trial" variant="outline" size="lg">
                3-day pass
              </LinkButton>
            </div>
            <p className="text-body text-muted-foreground">
              Or call {club ? "the club" : "your club"}:{" "}
              <a
                className="tabular font-semibold text-link underline underline-offset-4"
                href={`tel:${tel}`}
              >
                {phone}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Quiet page ending: a hairline, one line, one outline button. For pages that do not need the Night band. */
export function ClosingRow({
  title,
  href = "/tour",
  label = "Book a free tour",
}: {
  title: string
  href?: string
  label?: string
}) {
  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground pt-6">
        <p className="font-display-wide text-h2">{title}</p>
        <LinkButton href={href} variant="outline">
          {label}
        </LinkButton>
      </div>
    </Container>
  )
}

export function TourTimeline({
  steps,
  labels,
  className,
}: {
  steps: { title: string; text: string }[]
  labels?: string[]
  className?: string
}) {
  return (
    <ol className={cn("relative flex flex-col gap-8", className)}>
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="relative grid grid-cols-[2rem_1fr] gap-x-4"
        >
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-8 bottom-[-2rem] left-4 w-0.5 -translate-x-1/2 bg-border"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="tabular z-10 inline-flex size-8 items-center justify-center rounded-full bg-night text-caption font-semibold text-night-foreground"
          >
            {labels ? "" : i + 1}
            {labels ? <Check className="size-4" /> : null}
          </span>
          <div>
            {labels ? <p className="eyebrow">{labels[i]}</p> : null}
            <h3 className="font-display-wide text-h3">{s.title}</h3>
            <p className="mt-1 max-w-[56ch] text-body text-muted-foreground">
              {s.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FaqList({
  items,
  defaultOpen = 0,
  className,
}: {
  items: { id: string; q: string; a: string }[]
  defaultOpen?: number | null
  className?: string
}) {
  return (
    <Accordion
      defaultValue={defaultOpen === null ? [] : [items[defaultOpen]?.id]}
      className={cn("border-t border-border", className)}
    >
      {items.map((f) => (
        <AccordionItem
          key={f.id}
          value={f.id}
          id={f.id}
          className="scroll-mt-24 border-b border-border shadow-none"
        >
          <AccordionTrigger className="font-display-wide text-h3 hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent>
            <p className="max-w-[62ch] pb-5 text-body text-muted-foreground">
              {f.a}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export function FaqSection({
  items,
  title = "Good questions.",
  phone = "(480) 555-0100",
  tel = "+14805550100",
}: {
  items: { id: string; q: string; a: string }[]
  title?: string
  phone?: string
  tel?: string
}) {
  return (
    <Band>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead title={title} />
          <div className="mt-6 flex flex-wrap gap-x-6">
            <TextLink href="/faq">All questions</TextLink>
            <a
              className="inline-flex min-h-11 items-center text-label text-link underline-offset-4 hover:underline"
              href={`tel:${tel}`}
            >
              Call {phone}
            </a>
          </div>
        </div>
        <div className="lg:col-span-8">
          <FaqList items={items} />
        </div>
      </div>
    </Band>
  )
}

export function StatTile({
  value,
  label,
  icon,
  phoneRow,
  className,
}: {
  value: string
  label: string
  /** A gym object above the value. */
  icon?: ObjectId
  phoneRow?: boolean
  className?: string
}) {
  return (
    // Always inside a <dl>. The term (label) comes first in the markup and the value shows first on screen.
    // phoneRow: below sm, the value and label sit side by side, because a value like "6 mo–12 yr" cannot fit a third of a phone.
    <div
      className={cn(
        "flex flex-col-reverse justify-end gap-1 border-t-2 border-foreground pt-3",
        phoneRow &&
          "max-sm:flex-row-reverse max-sm:items-baseline max-sm:gap-3",
        className
      )}
    >
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="tabular font-data text-h1 leading-none font-bold">
        {icon ? (
          <GymObject id={icon} className="mb-3 size-10 max-sm:hidden" />
        ) : null}
        {value}
      </dd>
    </div>
  )
}

export function EmptyState({
  title,
  text,
  children,
  className,
}: {
  title: string
  text?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border-strong bg-card/60 p-8",
        className
      )}
    >
      <h3 className="font-display-wide text-h3">{title}</h3>
      {text ? (
        <p className="mt-2 max-w-[56ch] text-body text-muted-foreground">
          {text}
        </p>
      ) : null}
      {children ? (
        <div className="mt-4 flex flex-wrap gap-3">{children}</div>
      ) : null}
    </div>
  )
}

/** Page head: breadcrumbs, H1, lede. Left aligned, never centred. */
export function PageHead({
  trail,
  title,
  lede,
  icons,
  children,
}: {
  trail?: { label: string; href?: string }[]
  title: string
  lede?: string
  /** A Row of gym objects under the lede: one for each thing the page covers. */
  icons?: readonly ObjectId[]
  children?: React.ReactNode
}) {
  return (
    <>
      {trail ? <Breadcrumbs trail={trail} /> : null}
      <Container className="grid gap-6 pt-4 pb-8 lg:grid-cols-12 lg:pb-12">
        <div className="lg:col-span-7">
          <h1 className="display-lead text-balance">{title}</h1>
          {lede ? (
            <p className="lede mt-4 text-pretty text-muted-foreground">
              {lede}
            </p>
          ) : null}
          {icons ? (
            <ObjectRow ids={icons} className="mt-6 h-10 w-auto" />
          ) : null}
        </div>
        {children ? (
          <div className="lg:col-span-5 lg:self-end">{children}</div>
        ) : null}
      </Container>
    </>
  )
}

export function HeroSplit({
  title,
  support,
  actions,
  fact,
  flip,
  className,
}: {
  title: string
  support: string
  actions: React.ReactNode
  fact?: { value: string; label: string; icon?: ObjectId }
  flip?: boolean
  className?: string
}) {
  // Home has its own hero (HomeHero), because its picture explains something. Every other hero is a headline on 7 columns
  // and one fact on 5. A hero is a headline, one line and its actions: no eyebrow, no trust line, no caption (REDESIGN.md goals 1 and 5).
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[1200px] items-center gap-8 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-10 lg:pb-20",
        className
      )}
    >
      <div className={cn("lg:col-span-7", flip && "lg:order-2")}>
        <h1
          className={cn(
            "display-hero",
            fact && "!text-[clamp(2.5rem,5.4vw,4.75rem)]"
          )}
        >
          {title}
        </h1>
        <p className="lede mt-6 text-pretty">{support}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {actions}
        </div>
      </div>
      {fact ? (
        <div className="border-t-2 border-foreground pt-4 lg:col-span-5">
          {fact.icon ? (
            <GymObject id={fact.icon} className="mb-4 size-16 lg:size-24" />
          ) : null}
          {/* Stays one step below the H1 beside it (clamp 2.5rem, 5.4vw, 4.75rem) at every width, on one line. */}
          <p className="tabular font-data text-[clamp(2.25rem,4.4vw,4rem)] leading-none font-bold whitespace-nowrap">
            {fact.value}
          </p>
          <p className="mt-2 text-body text-muted-foreground">{fact.label}</p>
        </div>
      ) : null}
    </div>
  )
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: standard JSON-LD script; data is built on the server from trusted content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
