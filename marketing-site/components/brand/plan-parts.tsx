"use client"

import Link from "next/link"
import {
  ObjectRow,
  type PlanId,
  planObjects,
} from "@/components/brand/graphics"
import { Check } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import type { Plan } from "@/lib/types"
import { cn } from "@/lib/utils"
import { LinkButton } from "./atoms"
import { RibMeter } from "./meters"

export function PlanCard({
  plan,
  variant = "default",
  yourClub,
  className,
}: {
  plan: Plan
  variant?: "default" | "highlighted" | "compact"
  yourClub?: string
  className?: string
}) {
  const hi = variant === "highlighted" || plan.badge
  const features = variant === "compact" ? plan.compact : plan.features
  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 rounded-lg bg-card p-6",
        hi ? "ring-2 ring-primary lg:-translate-y-2" : "edge ring-border",
        className
      )}
    >
      {plan.badge ? (
        <p className="eyebrow absolute -top-3 left-6 rounded-sm bg-primary px-2 py-1 text-primary-foreground">
          {plan.badge}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display-wide text-h3">{plan.name}</h3>
        <RibMeter
          value={plan.ribs}
          tone="brand"
          size="md"
          label="Plan level"
          valueText={`${plan.name}, ${plan.ribs} of 5`}
          decorative
        />
      </div>
      <p className="flex items-baseline gap-1">
        <span className="tabular font-data text-h1 font-bold">
          ${plan.price}
        </span>
        <span className="text-caption text-muted-foreground">/mo</span>
      </p>
      <p className="text-caption text-foreground">
        {plan.bestFor}
        {plan.slug === "trailhead" && yourClub ? (
          <span className="mt-1 block text-muted-foreground">
            Your club: {yourClub}.
          </span>
        ) : null}
      </p>
      <ul className="flex flex-col gap-2 text-caption">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            {f}
          </li>
        ))}
      </ul>
      <LinkButton
        href={`/join/plan?plan=${plan.slug}`}
        variant={plan.badge ? "primary" : "outline"}
        className="mt-auto"
      >
        Join {plan.name}
      </LinkButton>
    </article>
  )
}

export function PlanComparisonTable({
  className,
  stickyTop = false,
}: {
  className?: string
  stickyTop?: boolean
}) {
  const { plans, comparison } = useCatalog()
  return (
    <section
      className={cn(
        "relative overflow-x-auto border-y border-foreground",
        className
      )}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs a tab stop so keyboard users can scroll it
      tabIndex={0}
      aria-label="Plan comparison. Scroll sideways on small screens."
    >
      <table className="w-full min-w-[640px] border-collapse text-caption">
        <caption className="sr-only">
          Compare Trailhead, Ridge and Summit
        </caption>
        <thead
          className={cn("bg-background", stickyTop && "sticky top-16 z-10")}
        >
          <tr>
            <th
              scope="col"
              className="w-[28%] bg-transparent p-4 text-left text-caption font-semibold text-muted-foreground"
            >
              What you get
            </th>
            {plans.map((p) => (
              <th
                key={p.slug}
                scope="col"
                className={cn(
                  "p-4 text-left align-bottom",
                  p.badge && "bg-accent/40"
                )}
              >
                <span className="font-display-wide block text-h3">
                  {p.name}
                </span>
                <span className="tabular block font-data text-label">
                  ${p.price}/mo
                </span>
                {p.badge ? <span className="eyebrow">{p.badge}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.map((r) => (
            <tr key={r.row} className="border-t border-border">
              <th scope="row" className="p-4 text-left font-medium">
                {r.row}
              </th>
              {r.vals.map((v, i) => (
                <td
                  // biome-ignore lint/suspicious/noArrayIndexKey: each cell lines up with a plan column; the table is static
                  key={i}
                  className={cn("p-4", plans[i].badge && "bg-accent/40")}
                >
                  {v === "–" ? (
                    <span className="sr-only">Not included</span>
                  ) : v === "Included" ? (
                    <span>
                      <span
                        aria-hidden="true"
                        className="mr-2 inline-block size-2 rounded-full bg-foreground align-middle"
                      />
                      Included
                    </span>
                  ) : (
                    v
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

/** Three plans as columns divided by hairlines. Ridge carries the one filled button. */
export function PlanColumns({
  yourClub,
  className,
}: {
  yourClub?: string
  className?: string
}) {
  const { plans } = useCatalog()
  return (
    <ul
      className={cn(
        "grid border-t-2 border-foreground lg:grid-cols-3",
        className
      )}
    >
      {plans.map((p, i) => (
        <li
          key={p.slug}
          className={cn(
            "flex flex-col gap-3 border-b border-border py-5 lg:gap-4 lg:border-b-0 lg:px-8 lg:py-8 lg:py-10",
            i > 0 && "lg:border-l lg:border-border",
            i === 0 && "lg:pl-0",
            p.badge && "lg:bg-card/60",
            p.badge ? "max-lg:order-first" : ""
          )}
        >
          {/* Name, price, who it is for, what is in it. The price and the name rank the plans, so no meter (REDESIGN.md goal 7). */}
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display-wide text-h2">{p.name}</h3>
            {p.badge ? (
              <span className="rounded-sm bg-accent px-2 py-0.5 text-label text-foreground">
                {p.badge}
              </span>
            ) : null}
          </div>
          <p className="flex items-baseline gap-1">
            <span className="tabular font-data text-[3.5rem] leading-none font-bold">
              ${p.price}
            </span>
            <span className="text-body text-muted-foreground">/mo</span>
          </p>
          {p.slug in planObjects ? (
            // One object for each thing the plan includes; the copy beside it names them.
            <ObjectRow
              ids={planObjects[p.slug as PlanId]}
              className="h-8 w-auto self-start"
            />
          ) : null}
          <p className="text-body">
            {p.bestFor}
            {p.slug === "trailhead" && yourClub ? (
              <span className="mt-1 block text-muted-foreground">
                Your club: {yourClub}.
              </span>
            ) : null}
          </p>
          <ul className="mt-2 hidden flex-col gap-2 text-body text-muted-foreground lg:flex">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check
                  className="mt-1 size-4 shrink-0 text-foreground"
                  aria-hidden="true"
                />
                {f}
              </li>
            ))}
          </ul>
          <LinkButton
            href={`/join/plan?plan=${p.slug}`}
            variant={p.badge ? "primary" : "outline"}
            className="mt-auto max-lg:hidden"
          >
            Join {p.name}
          </LinkButton>
          <Link
            href={`/join/plan?plan=${p.slug}`}
            className="inline-flex min-h-11 items-center text-label text-link underline-offset-4 hover:underline lg:hidden"
          >
            Join {p.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
