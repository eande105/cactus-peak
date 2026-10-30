"use client"
import { useState } from "react"
import { Minus, Plus, RotateCcw } from "@/components/icons"
import { BusynessMeter } from "@/components/kit/ribs"
import { Button } from "@/components/ui/button"
import { CLUBS } from "@/lib/data/catalog"
import { liveBusyness } from "@/lib/engine"
import { cn } from "@/lib/utils"

// A schematic map of the East Valley. The real map tiles are not wired up in this build, so this draws the five clubs
// from their coordinates over the main roads. Pins are buttons in the tab order, after the list.
const MIN_LNG = -111.92,
  MAX_LNG = -111.64,
  MIN_LAT = 33.3,
  MAX_LAT = 33.48
const project = (lat: number, lng: number) => ({
  x: ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100,
  y: (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100,
})

export function ClubMap({
  now,
  selected,
  hover,
  onSelect,
  onHover,
  only,
  className,
  ratio = "16/11",
}: {
  now: number
  selected?: string
  hover?: string
  onSelect?: (slug: string) => void
  onHover?: (slug: string | null) => void
  only?: string
  className?: string
  ratio?: string
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const list = only ? CLUBS.filter((c) => c.slug === only) : CLUBS
  const center = only ? project(list[0].lat, list[0].lng) : { x: 50, y: 50 }
  return (
    // biome-ignore lint/a11y/useSemanticElements: pannable map region, not a form group, so a fieldset does not fit
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-lg bg-muted edge ring-border",
        className
      )}
      style={{ aspectRatio: ratio }}
      role="group"
      aria-label="Map of the clubs. Use arrow keys to move."
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the map must take focus so arrow keys can pan it
      tabIndex={0}
      onKeyDown={(e) => {
        const d = 6
        if (e.key === "ArrowLeft") setPan((p) => ({ ...p, x: p.x + d }))
        else if (e.key === "ArrowRight") setPan((p) => ({ ...p, x: p.x - d }))
        else if (e.key === "ArrowUp") setPan((p) => ({ ...p, y: p.y + d }))
        else if (e.key === "ArrowDown") setPan((p) => ({ ...p, y: p.y - d }))
        else return
        e.preventDefault()
      }}
    >
      <div
        className="absolute inset-0 origin-center transition-transform"
        style={{
          transform: `translate(${pan.x}%, ${pan.y}%) scale(${zoom})`,
          transformOrigin: `${center.x}% ${center.y}%`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <g
            className="stroke-border"
            strokeWidth="0.5"
            fill="none"
            vectorEffect="non-scaling-stroke"
          >
            {[18, 38, 58, 78].map((x) => (
              <path
                key={x}
                d={`M${x} 0 V100`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {[22, 44, 66, 88].map((y) => (
              <path
                key={y}
                d={`M0 ${y} H100`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <path
            d="M0 78 C30 70 52 60 100 52"
            className="stroke-input"
            strokeWidth="2.2"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M62 0 C60 40 64 70 70 100"
            className="stroke-input"
            strokeWidth="2.2"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 30 C40 36 70 32 100 38"
            className="stroke-input"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {!only ? (
          <>
            <span className="absolute top-[70%] left-[4%] text-tab text-muted-foreground">
              US-60
            </span>
            <span className="absolute top-[6%] left-[63%] text-tab text-muted-foreground">
              Power Rd
            </span>
            <span className="absolute top-[26%] left-[4%] text-tab text-muted-foreground">
              Warner Rd
            </span>
          </>
        ) : null}
        {list.map((c) => {
          const p = project(c.lat, c.lng)
          const b = liveBusyness(c.slug, now)
          const on = selected === c.slug || hover === c.slug
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelect?.(c.slug)}
              onMouseEnter={() => onHover?.(c.slug)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(c.slug)}
              onBlur={() => onHover?.(null)}
              aria-label={`${c.name}, busyness ${b.label}`}
              aria-pressed={selected === c.slug}
              className={cn(
                "absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center gap-0.5 rounded-md bg-card px-2 py-1 shadow-(--shadow-s) edge ring-border hover:z-20",
                on && "z-20 !bg-night text-on-night"
              )}
              style={{ left: `${p.x}%`, top: `${p.y}%`, scale: 1 / zoom }}
            >
              <span className="text-detail font-semibold whitespace-nowrap">
                {c.neighborhood}
              </span>
              <BusynessMeter level={b.level} variant="compact" />
            </button>
          )
        })}
      </div>
      <div className="absolute right-3 bottom-3 z-30 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(2.4, z + 0.4))}
        >
          <Plus aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(1, z - 0.4))}
        >
          <Minus aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Reset view"
          onClick={() => {
            setZoom(1)
            setPan({ x: 0, y: 0 })
          }}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
      <p className="absolute bottom-2 left-3 z-30 text-tab text-muted-foreground">
        Schematic map
      </p>
    </div>
  )
}
