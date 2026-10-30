"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ClubMap } from "@/components/brand/club-map"
import { ClubCard } from "@/components/brand/club-parts"
import { Tabs, Toggle } from "@/components/graphical"
import { Check } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { useFinder, ZipFinder } from "@/components/site/club-switcher"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectBox } from "@/components/ui/controls"
import type { AmenityKey, ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EmptyState } from "./common"

export function ClubFinderSplit({ initial }: { initial: AmenityKey[] }) {
  const { distances } = useMyClub()
  const { clubs, amenityFilters } = useCatalog()
  const f = useFinder()
  const [on, setOn] = useState<AmenityKey[]>(initial)
  const [open, setOpen] = useState(false)
  const [sortPick, setSort] = useState<"distance" | "size" | "az" | null>(null)
  const [active, setActive] = useState<ClubSlug | null>(null)
  const [view, setView] = useState<"list" | "map">("list")
  const refs = useRef<Record<string, HTMLDivElement | null>>({})
  useEffect(() => {
    const u = new URL(window.location.href)
    if (on.length) u.searchParams.set("amenity", on.join(","))
    else u.searchParams.delete("amenity")
    window.history.replaceState(null, "", u)
  }, [on])
  const d = distances
  const sort = sortPick ?? (d ? "distance" : "size")
  const visible = useMemo(() => {
    const l = clubs.filter((c) => on.every((k) => c.has[k]) && (!open || true))
    return l.sort((a, b) =>
      sort === "distance" && d
        ? d[a.slug] - d[b.slug]
        : sort === "az"
          ? a.name.localeCompare(b.name)
          : sort === "size"
            ? b.sqFt - a.sqFt
            : 0
    )
  }, [clubs, on, sort, d, open])
  const hidden = clubs.filter((c) => !visible.includes(c)).map((c) => c.slug)
  const toggle = (k: AmenityKey) =>
    setOn((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]))
  const pick = (s: ClubSlug) => {
    setActive(s)
    setView("list")
    refs.current[s]?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    refs.current[s]?.querySelector<HTMLElement>("a,button")?.focus()
  }
  const removable = on.filter((k) =>
    clubs.some((c) => on.filter((x) => x !== k).every((x) => c.has[x]))
  )
  return (
    <>
      <div className="border-b border-border bg-background lg:sticky lg:top-16 lg:z-30">
        <div className="mx-auto max-w-[1200px] px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout */}
            <div
              role="group"
              aria-label="Filter clubs"
              className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {amenityFilters.map((a) => (
                <Toggle
                  key={a.key}
                  pressed={on.includes(a.key)}
                  onPressedChange={() => toggle(a.key)}
                  className="min-h-11 shrink-0"
                >
                  {on.includes(a.key) ? <Check aria-hidden="true" /> : null}
                  {a.label}
                </Toggle>
              ))}
            </div>
            <CheckRow checked={open} onChange={setOpen}>
              Open now
            </CheckRow>
            <SelectBox
              inline
              className="ml-auto"
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "size", label: "Size" },
                { value: "az", label: "A–Z" },
                {
                  value: "distance",
                  label: d ? "Distance" : "Distance (add a ZIP)",
                  disabled: !d,
                },
              ]}
            />
          </div>
          <div
            className="flex items-center justify-between text-caption"
            aria-live="polite"
          >
            <span>
              {visible.length} {visible.length === 1 ? "club" : "clubs"}
              {!d ? (
                <span className="text-muted-foreground">
                  {" "}
                  · Add a ZIP code to sort by distance
                </span>
              ) : null}
            </span>
            {on.length ? (
              <button
                type="button"
                className="min-h-11 text-link underline-offset-4 hover:underline"
                onClick={() => setOn([])}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="sr-only">Clubs</h2>
        {/* The tabs only pick which column shows below lg. Both columns show from lg, so there are no tab panels. */}
        <Tabs.Root
          value={view}
          onValueChange={(v) => setView(v as "list" | "map")}
          className="mb-4 lg:hidden"
        >
          <Tabs.List aria-label="View" className="w-full max-w-none">
            {(["list", "map"] as const).map((v) => (
              <Tabs.Tab key={v} value={v} className="min-h-11 flex-1">
                {v === "list" ? "List" : "Map"}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
        <div className="grid gap-6 lg:grid-cols-12">
          <div
            className={cn(
              "flex flex-col gap-3 lg:col-span-5",
              view === "map" && "max-lg:hidden"
            )}
          >
            <a
              href="#compare"
              className="sr-only focus:not-sr-only focus:text-link"
            >
              Skip map and list to the comparison table
            </a>
            {visible.length ? (
              visible.map((c) => (
                // biome-ignore lint/a11y/noStaticElementInteractions: hover and focus bubbling from the ClubCard links sync the map pin; ClubCard takes no handlers
                <div
                  key={c.slug}
                  ref={(el) => {
                    refs.current[c.slug] = el
                  }}
                  onMouseEnter={() => setActive(c.slug)}
                  onFocus={() => setActive(c.slug)}
                  className="scroll-mt-40"
                >
                  <ClubCard
                    club={c}
                    variant="list-row"
                    distance={d?.[c.slug]}
                    active={active === c.slug}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                title="No club has all of that."
                text={
                  removable.length
                    ? `Remove '${amenityFilters.find((a) => a.key === removable[0])!.label}' to see more clubs.`
                    : "Clear the filters to see all 5."
                }
              >
                {removable.map((k) => (
                  <Button key={k} variant="outline" onClick={() => toggle(k)}>
                    Remove {amenityFilters.find((a) => a.key === k)!.label}
                  </Button>
                ))}
              </EmptyState>
            )}
          </div>
          <div
            className={cn("lg:col-span-7", view === "list" && "max-lg:hidden")}
          >
            <div className="lg:sticky lg:top-32">
              <ClubMap
                className="h-[420px] lg:h-[560px]"
                activeSlug={active}
                onSelect={pick}
                hidden={hidden}
              />
              {active && view === "map" ? (
                <div className="mt-3">
                  <ClubCard
                    club={clubs.find((c) => c.slug === active)!}
                    variant="map-callout"
                  />
                </div>
              ) : null}
              <p className="mt-2 text-caption text-muted-foreground">
                Stylised map. Get exact directions from each club page.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {f.error}
      </div>
    </>
  )
}

export function ClubsHeaderSearch() {
  const f = useFinder()
  return (
    <div>
      <ZipFinder f={f} idPrefix="clubs" />
      <p className="text-caption text-muted-foreground">
        We show distance only after you give a ZIP code or allow location.
      </p>
    </div>
  )
}

export function ClubComparisonTable() {
  const { clubs } = useCatalog()
  const row = (label: string, vals: React.ReactNode[]) => (
    <tr className="border-t border-border">
      <th
        scope="row"
        className="sticky left-0 bg-background p-3 text-left text-caption font-semibold"
      >
        {label}
      </th>
      {vals.map((v, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: cells line up with the static club columns
        <td key={i} className="p-3 align-top text-caption">
          {v}
        </td>
      ))}
    </tr>
  )
  const yes = (t: string) => (
    <span>
      {t === "Yes" ? (
        <>
          <span
            aria-hidden="true"
            className="mr-1.5 inline-block size-2 rounded-full bg-foreground align-middle"
          />
          Yes
        </>
      ) : (
        t
      )}
    </span>
  )
  const no = (t = "—") => (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      {t === "—" ? <span className="sr-only">No</span> : t}
    </span>
  )
  return (
    <section
      className="relative overflow-x-auto border-y border-foreground"
      aria-label="Club comparison. Swipe to compare."
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs a tab stop so keyboard users can scroll it
      tabIndex={0}
    >
      <table className="w-full min-w-[860px] border-collapse">
        <caption className="sr-only">Which club has what</caption>
        <thead className="sticky top-16 z-10 bg-background">
          <tr>
            <td className="sticky left-0 bg-background p-3" />
            {clubs.map((c) => (
              <th
                key={c.slug}
                scope="col"
                className="p-3 text-left align-bottom"
              >
                <Link
                  href={`/clubs/${c.slug}`}
                  className="font-display-wide text-h3 hover:underline"
                >
                  {c.short}
                </Link>
                <div className="text-caption font-normal text-muted-foreground">
                  {c.city}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {row(
            "Size",
            clubs.map((c) => `${c.sqFt.toLocaleString("en-US")} sq ft`)
          )}
          {row(
            "Lap pool",
            clubs.map((c) =>
              c.pool
                ? yes(
                    `${c.pool.outdoor ? "Outdoor " : ""}25-${c.pool.unit}, ${c.pool.lanes} lanes`
                  )
                : no()
            )
          )}
          {row(
            "Warm-water or splash",
            clubs.map((c) => {
              const extra = [
                c.pool?.therapy ? "Warm-water therapy pool" : null,
                c.amenities.some((a) => /splash/i.test(a))
                  ? "Splash pad"
                  : null,
                c.amenities.some((a) => /swim school/i.test(a))
                  ? "swim school"
                  : null,
              ].filter(Boolean)
              return extra.length ? yes(extra.join(", ")) : no()
            })
          )}
          {row(
            "Courts",
            clubs.map((c) => {
              const k = c.courts ?? {}
              const parts = [
                k.pickleball && `${k.pickleball} pickleball`,
                k.tennis && `${k.tennis} tennis`,
                k.basketball && `${k.basketball} basketball`,
              ].filter(Boolean)
              return parts.length ? yes(parts.join(", ")) : no()
            })
          )}
          {row(
            "Kids club",
            clubs.map((c) => (c.has.kids ? yes("Yes") : no("No")))
          )}
          {row(
            "Recovery",
            clubs.map((c) =>
              c.recovery === "suite"
                ? yes("Suite")
                : c.recovery === "lounge"
                  ? yes("Lounge (sauna, compression)")
                  : no()
            )
          )}
          {row(
            "Cycle studio",
            clubs.map(() => yes("Yes"))
          )}
          {row(
            "Studios",
            clubs.map((c) => String(c.studios))
          )}
          {row(
            "Lifting platforms",
            clubs.map((c) =>
              c.amenities.some((a) => /platform/i.test(a))
                ? yes("Olympic platforms")
                : no()
            )
          )}
          {row(
            "Extras",
            clubs.map((c) => (c.extras && c.extras !== "—" ? c.extras : no()))
          )}
          <tr className="border-t border-border">
            <th
              scope="row"
              className="sticky left-0 bg-background p-3 text-left text-caption font-semibold"
            >
              Tour
            </th>
            {clubs.map((c) => (
              <td key={c.slug} className="p-3">
                <Link
                  className="inline-flex min-h-11 items-center text-label text-link underline-offset-4 hover:underline"
                  href={`/tour?club=${c.slug}`}
                >
                  Tour {c.short}
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  )
}
