"use client"

import { useId, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { NumberField } from "@/components/graphical"
import { Minus, Plus } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import type { Plan } from "@/lib/types"
import { cn } from "@/lib/utils"

function Stepper({
  label,
  hint,
  value,
  set,
  max,
}: {
  label: string
  hint: string
  value: number
  set: (n: number) => void
  max: number
}) {
  const id = useId()
  // Graphical NumberField. The input is a spinbutton, so screen readers hear each new value without a live region.
  // Base UI keeps the value between 0 and max, and the steppers turn off at either end.
  return (
    <div>
      <NumberField.Root
        id={id}
        value={value}
        min={0}
        max={max}
        onValueChange={(v) => set(v ?? 0)}
      >
        <NumberField.Label htmlFor={id}>
          {label}{" "}
          <span className="font-normal text-muted-foreground">{hint}</span>
        </NumberField.Label>
        <NumberField.Group>
          <NumberField.Decrement
            aria-label={`Fewer: ${label}`}
            className="min-h-11 min-w-11"
          >
            <Minus aria-hidden="true" />
          </NumberField.Decrement>
          <NumberField.Input />
          <NumberField.Increment
            aria-label={`More: ${label}`}
            className="min-h-11 min-w-11"
          >
            <Plus aria-hidden="true" />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
      {value >= max ? (
        <p className="mt-1 text-caption text-muted-foreground">
          Need more than {max}? Call us.
        </p>
      ) : null}
    </div>
  )
}

export function FamilyCalculator({
  compact,
  preset,
}: {
  compact?: boolean
  preset?: { plan: "ridge"; adults: number; children: number }
}) {
  const {
    plans,
    prices: { adult: ADULT, child: CHILD },
  } = useCatalog()
  const [plan, setPlan] = useState<Plan["slug"]>(preset?.plan ?? "ridge")
  const [adults, setAdults] = useState(preset?.adults ?? 0)
  const [kids, setKids] = useState(preset?.children ?? 0)
  const p = plans.find((x) => x.slug === plan)!
  const total = p.price + adults * ADULT + kids * CHILD
  const parts = [
    `$${p.price}`,
    ...(adults ? [`$${adults * ADULT}`] : []),
    ...(kids ? [`$${kids * CHILD}`] : []),
  ].join(" + ")
  const name = `${p.name}${adults ? ` + ${adults} adult${adults > 1 ? "s" : ""}` : ""}${kids ? ` + ${kids} ${kids > 1 ? "children" : "child"}` : ""}`
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div
        className={cn(
          "flex flex-col gap-6",
          compact ? "lg:col-span-7" : "lg:col-span-6"
        )}
      >
        <fieldset>
          <legend className="text-label">Base plan</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
            {plans.map((x) => (
              // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
              <button
                key={x.slug}
                type="button"
                role="radio"
                aria-checked={plan === x.slug}
                onClick={() => setPlan(x.slug)}
                className={cn(
                  "min-h-11 rounded-md px-4 text-label edge",
                  plan === x.slug
                    ? "bg-accent ring-2 ring-primary"
                    : "bg-card ring-border hover:ring-border-strong"
                )}
              >
                {x.name}{" "}
                <span className="tabular font-normal text-muted-foreground">
                  ${x.price}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <Stepper
          label="Adults to add"
          hint={`($${ADULT} each)`}
          value={adults}
          set={setAdults}
          max={4}
        />
        <Stepper
          label="Children, 6 months–17"
          hint={`($${CHILD} each)`}
          value={kids}
          set={setKids}
          max={6}
        />
      </div>
      <div
        className={cn(
          "border-t-2 border-foreground pt-4",
          compact ? "lg:col-span-5" : "lg:col-span-6"
        )}
        aria-live="polite"
      >
        <p className="text-body">
          {name} ={" "}
          <span className="tabular font-data text-h2 font-bold">
            ${total} a month
          </span>
        </p>
        {adults || kids ? (
          <p className="tabular mt-1 text-caption text-muted-foreground">
            {parts}. Month to month.
          </p>
        ) : (
          <p className="mt-1 text-body text-muted-foreground">
            Month to month.
          </p>
        )}
        <LinkButton
          href={`/join/plan?plan=${plan}&adults=${adults}&children=${kids}`}
          className="mt-4"
        >
          Join with this family
        </LinkButton>
      </div>
    </div>
  )
}
