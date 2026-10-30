import { BUSY_WORD, LEVEL_WORD } from "@/lib/labels"
import type { CategoryId, Level } from "@/lib/types"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "success" | "warning" | "danger" | "brand" | "category"
const toneClass: Record<Exclude<Tone, "category">, string> = {
  neutral: "bg-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  brand: "bg-night",
}
const SIZES = {
  sm: { w: 4, g: 2, h: 16 },
  md: { w: 6, g: 3, h: 24 },
  lg: { w: 8, g: 4, h: 32 },
  xl: { w: 12, g: 6, h: 48 },
}
const PEAK = [0.6, 0.8, 1, 0.8, 0.6]

/** Five upright ribs, filled left to right. Filled rib = solid, empty rib = outline, so shape carries the value. */
export function RibMeter({
  value,
  tone = "neutral",
  categoryId,
  size = "md",
  profile = "peak",
  label,
  valueText,
  decorative = false,
  className,
}: {
  value: number
  tone?: Tone
  categoryId?: CategoryId
  size?: keyof typeof SIZES
  profile?: "peak" | "flat"
  label: string
  valueText: string
  decorative?: boolean
  className?: string
}) {
  const s = SIZES[size]
  const flat = size === "sm" || profile === "flat"
  const a11y = decorative
    ? { "aria-hidden": true }
    : {
        role: "meter",
        "aria-valuemin": 0,
        "aria-valuemax": 5,
        "aria-valuenow": value,
        "aria-valuetext": valueText,
        "aria-label": label,
      }
  return (
    <span
      {...a11y}
      className={cn("inline-flex shrink-0 items-end", className)}
      style={{ gap: s.g, height: s.h }}
    >
      {PEAK.map((p, i) => {
        const on = i < value
        const bg =
          tone === "category" && categoryId
            ? `var(--cat-${categoryId})`
            : undefined
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length ribs never reorder
            key={i}
            className={cn(
              "block",
              on
                ? tone === "category"
                  ? ""
                  : toneClass[tone]
                : "bg-transparent"
            )}
            style={{
              width: s.w,
              height: `${(flat ? 1 : p) * 100}%`,
              borderRadius:
                Math.min(4, s.w / 2) +
                "px " +
                Math.min(4, s.w / 2) +
                "px 1px 1px",
              background: on ? bg : undefined,
              boxShadow: on
                ? undefined
                : "inset 0 0 0 1.5px var(--border-strong)",
            }}
          />
        )
      })}
    </span>
  )
}

export function IntensityRibs({
  level,
  categoryId,
  size = "sm",
  showLabel = true,
  wordOnly = true,
  className,
}: {
  level: Level | [Level, Level]
  categoryId: CategoryId
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  wordOnly?: boolean
  className?: string
}) {
  const hi = Array.isArray(level) ? level[1] : level
  const lo = Array.isArray(level) ? level[0] : level
  const word =
    lo === hi
      ? wordOnly
        ? LEVEL_WORD[hi]
        : `${LEVEL_WORD[hi]} · ${hi} of 5`
      : `${LEVEL_WORD[lo]} to ${LEVEL_WORD[hi].toLowerCase()}`
  const name =
    lo === hi
      ? `Intensity, ${LEVEL_WORD[hi]}, ${hi} of 5`
      : `Intensity, ${LEVEL_WORD[lo]} to ${LEVEL_WORD[hi].toLowerCase()}, ${lo} to ${hi} of 5`
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title="Intensity: 1 Easy, 2 Light, 3 Moderate, 4 Hard, 5 All-out"
    >
      <RibMeter
        value={hi}
        tone="category"
        categoryId={categoryId}
        size={size}
        profile="flat"
        label="Intensity"
        valueText={name}
        decorative={showLabel}
      />
      {showLabel ? (
        <span className="text-caption font-medium text-foreground">
          {word}
          <span className="sr-only">. {name}</span>
        </span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </span>
  )
}

const busyTone = [
  "neutral",
  "success",
  "success",
  "neutral",
  "warning",
  "danger",
] as const
export function BusynessMeter({
  level,
  variant = "inline",
  className,
}: {
  level: Level
  variant?: "compact" | "inline" | "card"
  className?: string
}) {
  const word = BUSY_WORD[level]
  const text = `${word}, ${level} of 5`
  if (variant === "compact")
    return (
      <RibMeter
        value={level}
        tone={busyTone[level]}
        size="sm"
        label="Busyness"
        valueText={text}
        className={className}
      />
    )
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <RibMeter
        value={level}
        tone={busyTone[level]}
        size={variant === "card" ? "md" : "sm"}
        label="Busyness"
        valueText={text}
        decorative
      />
      <span className="text-caption font-medium text-foreground">
        {variant === "card" ? `Right now: ${word}` : word}
        <span className="sr-only"> busyness, {level} of 5</span>
      </span>
    </span>
  )
}

/** Spots-left text only when five or fewer remain (public pages). */
export function CapacityIndicator({
  left,
  capacity,
  noun = "spots",
  className,
}: {
  left: number
  capacity: number
  noun?: string
  className?: string
}) {
  if (left === 0)
    return (
      <span
        className={cn("text-caption font-semibold text-foreground", className)}
      >
        Full
      </span>
    )
  if (left > 5)
    return (
      <span className={cn("text-caption text-muted-foreground", className)}>
        Open
      </span>
    )
  const tone = left <= 2 ? "danger" : "warning"
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-2 text-caption font-semibold text-foreground",
        className
      )}
    >
      <RibMeter
        value={Math.max(1, Math.round((left / capacity) * 5))}
        tone={tone}
        size="sm"
        label="Spots left"
        valueText={`${left} ${noun} left`}
        decorative
      />
      {left} {left === 1 ? noun.replace(/s$/, "") : noun} left
    </span>
  )
}
