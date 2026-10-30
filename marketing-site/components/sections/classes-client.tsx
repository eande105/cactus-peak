"use client"

import { useEffect, useMemo, useState } from "react"
import { SectionHead } from "@/components/brand/atoms"
import { CategoryIcon } from "@/components/brand/icons"
import { RibMeter } from "@/components/brand/meters"
import { Toggle } from "@/components/graphical"
import { useCatalog } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { CheckRow } from "@/components/ui/controls"
import { LEVEL_WORD } from "@/lib/labels"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClubClassTable } from "./club-class-table"
import { Band, EmptyState } from "./common"

const guide = [
  "You can chat. Mobility 30, Aqua Fit.",
  "A gentle sweat. Desert Flow Yoga.",
  "You can say a short sentence. Rhythm Ride.",
  "Words are hard. Climb Cycle.",
  "Short bursts, big rest. Switchback HIIT.",
]

export function ClassesExplorer({
  initialFirstTimer,
}: {
  initialFirstTimer: boolean
}) {
  const { categories, classTypes } = useCatalog()
  const [cat, setCat] = useState<CategoryId | "all">("all")
  const [lvl, setLvl] = useState<number | null>(null)
  const [first, setFirst] = useState(initialFirstTimer)
  // Keeps the URL in step with the first-timer filter. The URL is an external system.
  useEffect(() => {
    const u = new URL(window.location.href)
    if (first) u.searchParams.set("firstTimer", "1")
    else u.searchParams.delete("firstTimer")
    window.history.replaceState(null, "", u)
  }, [first])
  const list = useMemo(
    () =>
      classTypes.filter(
        (c) =>
          (cat === "all" || c.category === cat) &&
          (!first || c.firstTimer) &&
          (lvl === null || (c.intensity[0] <= lvl && c.intensity[1] >= lvl))
      ),
    [classTypes, cat, lvl, first]
  )
  const tabs: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ]
  return (
    <>
      <Band
        tone="muted"
        id="intensity"
        className="hidden py-10 md:block lg:py-14"
      >
        <SectionHead size="quiet" title="How hard is it?" className="mb-6" />
        {/* biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout */}
        <div
          role="group"
          aria-label="Filter by intensity"
          className="grid grid-cols-1 sm:grid-cols-5 sm:divide-x sm:divide-border-strong"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={lvl === n}
              onClick={() => setLvl(lvl === n ? null : n)}
              className={cn(
                "flex min-h-16 items-center gap-4 border-t border-border-strong p-4 text-left transition-colors duration-150 sm:min-h-24 sm:flex-col sm:items-start sm:border-t-2",
                lvl === n ? "bg-accent" : "hover:bg-card"
              )}
            >
              <RibMeter
                value={n}
                tone="neutral"
                size="xl"
                profile="flat"
                label="Intensity"
                valueText={`${LEVEL_WORD[n]}, ${n} of 5`}
                decorative
              />
              <span>
                <span className="font-display-wide block text-h3">
                  {n} {LEVEL_WORD[n]}
                </span>
                <span className="hidden text-body text-muted-foreground sm:block">
                  {guide[n - 1]}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-body text-muted-foreground">
          Not sure? Start at 2 or 3. Your coach will adjust.
        </p>
      </Band>
      <Band id="all-classes" className="lg:py-16">
        <SectionHead title="All 28 classes." className="mb-6" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout */}
          <div
            role="group"
            aria-label="Category"
            className="-mx-4 flex scrollbar-none gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {/* One category at a time. Pressing the current chip again keeps it on, as before. */}
            {tabs.map((t) => (
              <Toggle
                key={t.id}
                pressed={cat === t.id}
                onPressedChange={() => setCat(t.id)}
                className="min-h-11 shrink-0"
              >
                {t.id !== "all" ? (
                  <CategoryIcon id={t.id} className="size-4" />
                ) : null}
                {t.label}
              </Toggle>
            ))}
          </div>
          <CheckRow checked={first} onChange={setFirst}>
            Good for first-timers
          </CheckRow>
          {lvl ? (
            <button
              type="button"
              onClick={() => setLvl(null)}
              className="min-h-11 text-label text-link underline-offset-4 hover:underline"
            >
              Clear intensity {lvl}
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-body text-muted-foreground" aria-live="polite">
          {list.length} {list.length === 1 ? "class" : "classes"}
        </p>
        <div className="mt-4">
          {list.length ? (
            <ClubClassTable items={list} grouped={cat === "all"} />
          ) : (
            <EmptyState
              title="No classes match."
              text="Try intensity 3 or remove 'first-timers'."
            >
              <Button
                variant="outline"
                onClick={() => {
                  setCat("all")
                  setLvl(null)
                  setFirst(false)
                }}
              >
                Clear filters
              </Button>
            </EmptyState>
          )}
        </div>
      </Band>
    </>
  )
}
