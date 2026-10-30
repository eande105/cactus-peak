"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { ClubArt } from "@/components/brand/club-art"
import { CategoryIcon } from "@/components/brand/icons"
import { IntensityRibs } from "@/components/brand/meters"
import {
  CalendarDays,
  Dumbbell,
  Flame,
  Footprints,
  LayoutGrid,
  Search,
  Smile,
  Ticket,
  Wallet,
  Waves,
} from "@/components/icons"
import { EmptyState } from "@/components/sections/common"
import { Overlay, OverlayPopup, OverlayTitle } from "@/components/ui/overlay"
import type { ClientCatalogData } from "@/lib/catalog"
import { initials } from "@/lib/catalog"
import { cn } from "@/lib/utils"
import { useCatalog } from "./catalog-context"

type Hit = {
  group: string
  title: string
  sub: string
  href: string
  lead: React.ReactNode
  terms?: string
}
const SYN: [RegExp, string][] = [
  [/spin|cycl/, "cycle climb rhythm endurance"],
  [/pool|swim|lap/, "aquatics lap swim aqua"],
  [/child|daycare|babysit|kids/, "kids club"],
  [/weight|lift|powerlift/, "strength olympic lifting"],
  [/sauna|plunge|ice/, "recovery sauna plunge"],
  [/pickle|tennis|court/, "pickleball court"],
  [/yoga|pilates|stretch/, "mind body yoga pilates mobility stretch"],
  [/trainer|personal/, "personal training coaches"],
]
export function buildIndex(
  cat: Pick<
    ClientCatalogData,
    "clubs" | "classTypes" | "coaches" | "faqs" | "journal"
  >
): Hit[] {
  const { clubs, classTypes, coaches, faqs, journal } = cat
  return [
    ...clubs.map((c) => ({
      group: "Clubs",
      title: c.name,
      sub: c.personality,
      href: `/clubs/${c.slug}`,
      lead: (
        <ClubArt
          slug={c.slug}
          ratio="4/3"
          detail="simple"
          className="w-10 shrink-0 overflow-hidden rounded-sm"
        />
      ),
      terms: [
        c.amenities.join(" "),
        c.signature.join(" "),
        c.city,
        c.zip,
        c.cross,
        c.type,
        c.has.pool ? "pool swim lap lanes aquatics" : "",
        c.has.courts ? "courts pickleball tennis basketball" : "",
        c.has.kids ? "kids club childcare" : "",
        c.has.recovery ? "recovery sauna plunge compression" : "",
      ].join(" "),
    })),
    ...classTypes.map((c) => ({
      group: "Classes",
      title: c.name,
      sub: `${c.categoryName} · ${c.duration} min`,
      href: `/classes/${c.slug}`,
      lead: <CategoryIcon id={c.category} className="size-5" />,
      terms: `${c.categoryName} ${c.blurb}`,
    })),
    ...coaches
      .filter((c) => c.profile)
      .map((c) => ({
        group: "Coaches",
        title: c.name,
        sub: `${c.specialties[0]} coach`,
        href: `/coaches/${c.slug}`,
        lead: (
          <span
            aria-hidden="true"
            className="inline-flex size-8 items-center justify-center rounded-full bg-night text-caption text-night-foreground"
          >
            {initials(c.name)}
          </span>
        ),
      })),
    ...[
      [
        "Membership and prices",
        "/membership",
        Wallet,
        "plans trailhead ridge summit",
      ],
      ["Kids club hours", "/kids", Smile, "childcare ages swim school"],
      ["Free 3-day pass", "/trial", Ticket, "trial"],
      ["Book a free tour", "/tour", Footprints, "visit"],
      ["Aquatics", "/aquatics", Waves, "pool swim lap warm water"],
      ["Courts", "/courts", LayoutGrid, "pickleball tennis basketball"],
      ["Recovery", "/recovery", Flame, "sauna cold plunge compression"],
      ["Class schedule", "/schedule", CalendarDays, "times"],
      ["Personal training", "/personal-training", Dumbbell, "coach trainer"],
    ].map(([t, h, I, terms]) => {
      const Icon = I as typeof Wallet
      return {
        group: "Pages and FAQ",
        title: t as string,
        sub: "Page",
        href: h as string,
        terms: terms as string,
        lead: (
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        ),
      }
    }),
    ...faqs.map((f) => ({
      group: "Pages and FAQ",
      title: f.q,
      sub: "FAQ",
      href: `/faq#${f.id}`,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
    ...journal.map((j) => ({
      group: "Journal",
      title: j.title,
      sub: j.cat,
      href: `/journal/${j.slug}`,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
  ]
}
export function runSearch(q: string, index: Hit[]) {
  const t = q.trim().toLowerCase()
  if (!t) return []
  const extra = SYN.filter(([r]) => r.test(t))
    .map(([, s]) => s)
    .join(" ")
  const terms = [t, ...extra.split(" ")].filter(Boolean)
  return index.filter((h) => {
    const hay = `${h.title} ${h.sub} ${h.terms ?? ""}`.toLowerCase()
    return terms.some((w) => hay.includes(w))
  })
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()
  const catalog = useCatalog()
  const index = useMemo(() => buildIndex(catalog), [catalog])
  const hits = useMemo(() => runSearch(q, index), [q, index])
  const groups = useMemo(() => {
    const out: { name: string; items: Hit[] }[] = []
    for (const h of hits) {
      let g = out.find((x) => x.name === h.group)
      if (!g) {
        g = { name: h.group, items: [] }
        out.push(g)
      }
      if (g.items.length < 4) g.items.push(h)
    }
    return out
  }, [hits])
  const flat = groups.flatMap((g) => g.items)
  const popular: Hit[] = [
    ...index.filter((h) => h.group === "Clubs"),
    ...[
      ["Free 3-day pass", "/trial"],
      ["Book a free tour", "/tour"],
      ["Prices", "/membership"],
      ["Kids club hours", "/kids"],
    ].map(([t, h]) => ({
      group: "Quick links",
      title: t,
      sub: "Page",
      href: h,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
  ]
  const list = q.trim() ? flat : popular
  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }
  return (
    <Overlay
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setQ("")
          setActive(0)
        }
      }}
    >
      {/* No padding or gap: the search row and the result list run to the popup edges. */}
      <OverlayPopup
        label="Search"
        placement="top"
        hideClose
        className="gap-0 p-0"
      >
        <OverlayTitle className="sr-only">
          Search clubs, classes and coaches
        </OverlayTitle>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="site-search" className="sr-only">
            Search clubs, classes, coaches
          </label>
          <input
            id="site-search"
            // biome-ignore lint/a11y/noAutofocus: the search field is the dialog's first and only target, so focus it on open
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="search-list"
            aria-activedescendant={list[active] ? `sr-${active}` : undefined}
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, list.length - 1))
              }
              if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              }
              if (e.key === "Enter") {
                e.preventDefault()
                if (list[active]) go(list[active].href)
                else if (q) go(`/search?q=${encodeURIComponent(q)}`)
              }
            }}
            placeholder="Search clubs, classes, coaches…"
            className="h-14 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>
        <div
          id="search-list"
          role="listbox"
          aria-label="Results"
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          {q.trim() && !flat.length ? (
            <EmptyState
              title={`We found nothing for "${q}".`}
              text="Try 'cycle', 'pool' or 'kids club'."
            >
              <LinkButton
                href="/classes"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                See all classes
              </LinkButton>
              <LinkButton
                href="/contact"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Ask a person
              </LinkButton>
            </EmptyState>
          ) : (
            (q.trim() ? groups : [{ name: "Popular", items: popular }]).map(
              (g) => (
                // biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout
                <div key={g.name} role="group" aria-label={g.name}>
                  <p className="eyebrow px-3 pt-3 pb-1 text-muted-foreground">
                    {g.name}
                  </p>
                  {g.items.map((h) => {
                    const i = list.indexOf(h)
                    return (
                      <Link
                        key={h.href + h.title}
                        id={`sr-${i}`}
                        role="option"
                        aria-selected={i === active}
                        href={h.href}
                        onClick={() => onOpenChange(false)}
                        onMouseMove={() => setActive(i)}
                        className={cn(
                          "flex min-h-14 items-center gap-3 rounded-lg px-3 py-2",
                          i === active && "bg-muted ring-2 ring-ring"
                        )}
                      >
                        <span className="flex w-10 shrink-0 justify-center">
                          {h.lead}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-label">
                            {h.title}
                          </span>
                          <span className="block truncate text-caption text-muted-foreground">
                            {h.sub}
                          </span>
                        </span>
                        {h.group === "Classes" ? (
                          <ClassRibs catalog={catalog} title={h.title} />
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              )
            )
          )}
        </div>
        {q.trim() ? (
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            onClick={() => onOpenChange(false)}
            className="flex min-h-12 items-center justify-between border-t border-border px-4 text-label text-link"
          >
            See all results for &ldquo;{q}&rdquo;
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </OverlayPopup>
    </Overlay>
  )
}

function ClassRibs({
  catalog,
  title,
}: {
  catalog: Pick<ClientCatalogData, "classTypes">
  title: string
}) {
  const ct = catalog.classTypes.find((c) => c.name === title)
  if (!ct) return null
  return (
    <IntensityRibs
      level={ct.intensity[1]}
      categoryId={ct.category}
      showLabel={false}
    />
  )
}
