import { BUSY_WORDS, LEVEL_WORDS } from "@/lib/data/catalog"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "success" | "warning" | "danger" | "brand" | "category"
const TONE: Record<Tone, string> = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  brand: "text-night dark:text-on-night",
  category: "text-cat",
}
const SIZE = {
  sm: { w: 4, g: 2, h: 16 },
  md: { w: 6, g: 3, h: 24 },
  lg: { w: 8, g: 4, h: 32 },
  xl: { w: 12, g: 6, h: 48 },
} as const
const PEAK = [0.6, 0.8, 1, 0.8, 0.6]

export function RibMeter({
  value,
  tone = "neutral",
  category,
  size = "md",
  label,
  valueText,
  decorative,
  className,
  unavailable,
}: {
  value: number
  tone?: Tone
  category?: CategoryId
  size?: keyof typeof SIZE
  label: string
  valueText: string
  decorative?: boolean
  className?: string
  unavailable?: boolean
}) {
  const { w, g, h } = SIZE[size]
  const width = w * 5 + g * 4
  const flat = size === "sm"
  return (
    <span
      className={cn(
        "inline-flex shrink-0",
        TONE[tone],
        category && `cat-${category}`,
        className
      )}
      {...(decorative
        ? { "aria-hidden": true }
        : {
            role: "meter",
            "aria-valuemin": 0,
            "aria-valuemax": 5,
            "aria-valuenow": value,
            "aria-valuetext": valueText,
            "aria-label": label,
          })}
    >
      <svg
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        aria-hidden="true"
      >
        {PEAK.map((p, i) => {
          const rh = flat ? h : Math.round(h * p)
          const filled = !unavailable && i < value
          return (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed bars that never reorder
              key={i}
              x={i * (w + g) + (filled ? 0 : 0.75)}
              y={h - rh + (filled ? 0 : 0.75)}
              width={filled ? w : w - 1.5}
              height={filled ? rh : rh - 1.5}
              rx={Math.min(4, w / 2)}
              fill={filled ? "currentColor" : "none"}
              stroke={filled ? "none" : "var(--input)"}
              strokeWidth={1.5}
              strokeDasharray={unavailable ? "2 2" : undefined}
            />
          )
        })}
      </svg>
    </span>
  )
}

export function IntensityRibs({
  level,
  category,
  size = "sm",
  showWord = true,
  className,
}: {
  level: number
  category: CategoryId
  size?: "sm" | "md"
  showWord?: boolean
  className?: string
}) {
  const word = LEVEL_WORDS[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-detail text-muted-foreground",
        className
      )}
      title={`Intensity: 1 Easy, 2 Light, 3 Moderate, 4 Hard, 5 All-out`}
    >
      <RibMeter
        value={level}
        tone="category"
        category={category}
        size={size}
        label="Intensity"
        valueText={`${word}, ${level} of 5`}
        decorative={showWord}
      />
      {showWord ? (
        <span className="text-foreground">
          <span className="sr-only">Intensity </span>
          {word}
        </span>
      ) : null}
    </span>
  )
}

export function busyTone(level: number): Tone {
  return level <= 2
    ? "success"
    : level === 3
      ? "neutral"
      : level === 4
        ? "warning"
        : "danger"
}
export function BusynessMeter({
  level,
  variant = "inline",
  updated,
  stale,
  closed,
  hint,
  className,
}: {
  level: number
  variant?: "compact" | "inline" | "card" | "hero"
  updated?: string
  stale?: boolean
  closed?: string
  hint?: string
  className?: string
}) {
  const word = BUSY_WORDS[level]
  if (closed)
    return (
      <span className={cn("text-detail text-muted-foreground", className)}>
        {closed}
      </span>
    )
  if (stale)
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-detail text-muted-foreground",
          className
        )}
      >
        <RibMeter
          value={0}
          unavailable
          size="sm"
          label="Busyness"
          valueText="Unavailable"
        />{" "}
        Live count unavailable. Showing typical hours.
      </span>
    )
  const valueText = `${word}, ${level} of 5${updated ? `. Updated ${updated}` : ""}`
  if (variant === "compact")
    return (
      <RibMeter
        value={level}
        tone={busyTone(level)}
        size="sm"
        label="Busyness"
        valueText={valueText}
        className={className}
      />
    )
  if (variant === "inline")
    return (
      <span
        className={cn("inline-flex items-center gap-2 text-detail", className)}
      >
        <RibMeter
          value={level}
          tone={busyTone(level)}
          size="sm"
          label="Busyness"
          valueText={valueText}
          decorative
        />
        <span className="text-foreground">
          <span className="sr-only">Busyness </span>
          {word} · <span className="num">{level}</span> of 5
        </span>
      </span>
    )
  if (variant === "card")
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-center gap-3">
          <RibMeter
            value={level}
            tone={busyTone(level)}
            size="md"
            label="Busyness"
            valueText={valueText}
            decorative
          />
          <span className="font-heading text-h3 leading-none">
            {word}{" "}
            <span className="num text-body text-muted-foreground">
              · {level} of 5
            </span>
          </span>
        </div>
        {updated ? (
          <p className="text-detail text-muted-foreground">Updated {updated}</p>
        ) : null}
        {hint ? <p className="text-caption">{hint}</p> : null}
      </div>
    )
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-end gap-4">
        <RibMeter
          value={level}
          tone={busyTone(level)}
          size="xl"
          label="Busyness"
          valueText={valueText}
          decorative
        />
        <p className="font-heading text-h1 leading-none display-stretch">
          <span className="sr-only">Busyness </span>
          {word}
          <span className="ml-2 num text-h3 text-muted-foreground">
            {level} of 5
          </span>
        </p>
      </div>
      {updated ? (
        <p className="text-caption text-muted-foreground">Updated {updated}</p>
      ) : null}
      {hint ? <p className="text-body">{hint}</p> : null}
    </div>
  )
}

export function CapacityIndicator({
  left,
  capacity,
  unit = "spots",
  waiting,
  variant = "ribs",
  className,
}: {
  left: number
  capacity: number
  unit?: string
  waiting?: number
  variant?: "ribs" | "text" | "large" | "badge"
  className?: string
}) {
  const frac = capacity ? left / capacity : 0
  const ribs = left === 0 ? 0 : Math.max(1, Math.ceil(frac * 5))
  const low = left > 0 && left <= 5
  const u = left === 1 ? unit.replace(/s$/, "") : unit
  const text =
    left === 0 ? `Full · ${waiting ?? 0} waiting` : `${left} ${u} left`
  if (variant === "large")
    return (
      <span className={cn("flex flex-col gap-1", className)} aria-live="polite">
        <span className={cn("num text-h1 leading-none", low && "text-warning")}>
          {left === 0 ? "Full" : left}
        </span>
      </span>
    )
  if (variant === "badge")
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-sm bg-photo-band px-2 py-1 text-detail font-semibold text-on-night",
          className
        )}
      >
        {text}
      </span>
    )
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {variant === "ribs" ? (
        <RibMeter
          value={ribs}
          tone={left === 0 ? "neutral" : low ? "warning" : "success"}
          size="sm"
          label="Spots"
          valueText={text}
          decorative
        />
      ) : null}
      <span
        className={cn(
          "num text-caption whitespace-nowrap",
          low && "text-warning",
          left === 0 && "text-muted-foreground"
        )}
      >
        {low ? <span className="sr-only">Low. </span> : null}
        {text}
      </span>
    </span>
  )
}
