"use client"

import { useState } from "react"
import { Minus, Plus } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import type { Club, ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"

const [LAT0, LAT1, LNG0, LNG1] = [33.31, 33.47, -111.9, -111.66]
const pos = ({ lat: la, lng: ln }: Pick<Club, "lat" | "lng">) => {
  return {
    x: 8 + ((ln - LNG0) / (LNG1 - LNG0)) * 84,
    y: 8 + ((LAT1 - la) / (LAT1 - LAT0)) * 84,
  }
}

/** Stylised SVG map of Mesa and Gilbert. Sand land, Caliche roads, Canal Teal water. No tiles, no paid API. */
export function ClubMap({
  activeSlug,
  onSelect,
  hidden = [],
  only,
  className,
  interactive = true,
}: {
  activeSlug?: ClubSlug | null
  onSelect?: (s: ClubSlug) => void
  hidden?: ClubSlug[]
  only?: ClubSlug
  className?: string
  interactive?: boolean
}) {
  const { clubs, clubBySlug } = useCatalog()
  const [zoom, setZoom] = useState(1)
  const list = clubs.filter((c) => (only ? c.slug === only : true))
  const onlyClub = clubBySlug(only)
  const focus = onlyClub ? pos(onlyClub) : { x: 50, y: 50 }
  const scale = zoom === 2 ? 1.6 : 1
  const mesa = list.filter((c) => c.city === "Mesa" && !hidden.includes(c.slug))
  const gil = list.filter(
    (c) => c.city === "Gilbert" && !hidden.includes(c.slug)
  )
  const cluster = zoom === 0 && !only
  const avg = (a: typeof list) => ({
    x: a.reduce((s, c) => s + pos(c).x, 0) / (a.length || 1),
    y: a.reduce((s, c) => s + pos(c).y, 0) / (a.length || 1),
  })
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-muted edge ring-border",
        className
      )}
    >
      <div
        className="absolute inset-0 origin-center transition-transform duration-300 motion-reduce:transition-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${focus.x}% ${focus.y}%`,
        }}
      >
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Map of Mesa and Gilbert showing the five clubs"
        >
          <rect width="100" height="100" style={{ fill: "var(--neutral-3)" }} />
          {/* section-line roads */}
          {[14, 28, 42, 56, 70, 84].map((v) => (
            <path
              key={`h${v}`}
              d={`M0 ${v}H100`}
              style={{ stroke: "var(--neutral-5)" }}
              strokeWidth="0.5"
            />
          ))}
          {[12, 26, 40, 54, 68, 82].map((v) => (
            <path
              key={`v${v}`}
              d={`M${v} 0V100`}
              style={{ stroke: "var(--neutral-5)" }}
              strokeWidth="0.5"
            />
          ))}
          {/* freeways */}
          <path
            d="M0 38 C 30 40, 55 30, 100 22"
            fill="none"
            style={{ stroke: "var(--neutral-6)" }}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M70 0 C 66 30, 72 60, 64 100"
            fill="none"
            style={{ stroke: "var(--neutral-6)" }}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* canal */}
          <path
            d="M0 62 C 25 58, 45 66, 70 58 S 92 52, 100 54"
            fill="none"
            style={{ stroke: "var(--cat-aqua)" }}
            strokeWidth="0.9"
            opacity="0.7"
          />
          <text
            x="6"
            y="12"
            style={{ fill: "var(--neutral-7)" }}
            fontSize="3.2"
            letterSpacing="1.4"
            fontWeight="600"
          >
            MESA
          </text>
          <text
            x="58"
            y="24.5"
            transform="rotate(-9 58 24.5)"
            style={{ fill: "var(--neutral-8)" }}
            fontSize="2.6"
            letterSpacing="0.6"
            fontWeight="700"
          >
            US 60
          </text>
          <text
            x="6"
            y="57"
            style={{ fill: "var(--cat-aqua)" }}
            fontSize="2.4"
            letterSpacing="0.4"
            fontWeight="700"
          >
            CONSOLIDATED CANAL
          </text>
          <text
            x="6"
            y="94"
            style={{ fill: "var(--neutral-7)" }}
            fontSize="3.2"
            letterSpacing="1.4"
            fontWeight="600"
          >
            GILBERT
          </text>
        </svg>
        {cluster
          ? (
              [
                ["Mesa", mesa],
                ["Gilbert", gil],
              ] as const
            ).map(([n, a]) =>
              a.length ? (
                <button
                  key={n}
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label={`${a.length} clubs in ${n}. Zoom in`}
                  className="absolute inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-night font-data text-label text-night-foreground"
                  style={{ left: `${avg(a).x}%`, top: `${avg(a).y}%` }}
                >
                  {a.length}
                </button>
              ) : null
            )
          : list.map((c) => {
              if (hidden.includes(c.slug)) return null
              const p = pos(c)
              const on = activeSlug === c.slug
              return (
                <button
                  key={c.slug}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onSelect?.(c.slug)}
                  aria-pressed={on}
                  aria-label={`${c.name} on the map`}
                  className={cn(
                    "group absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center",
                    on && "z-20"
                  )}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <span
                    className={cn(
                      "mb-1 rounded-sm px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap",
                      on
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground edge ring-border"
                    )}
                    style={{ transform: `scale(${1 / scale})` }}
                  >
                    {c.short}
                  </span>
                  <span
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full text-night-foreground transition-colors duration-150",
                      on
                        ? "bg-primary ring-4 ring-primary/30"
                        : "bg-night group-hover:bg-night/80"
                    )}
                    style={{ transform: `scale(${1 / scale})` }}
                  >
                    <span className="tabular font-data text-label font-bold">
                      {c.n}
                    </span>
                  </span>
                </button>
              )
            })}
      </div>
      {interactive && !only ? (
        <div className="absolute right-3 bottom-3 z-30 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(2, z + 1))}
            className="inline-flex size-11 items-center justify-center rounded-md bg-card edge ring-border-strong hover:bg-muted"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0, z - 1))}
            className="inline-flex size-11 items-center justify-center rounded-md bg-card edge ring-border-strong hover:bg-muted"
          >
            <Minus className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
