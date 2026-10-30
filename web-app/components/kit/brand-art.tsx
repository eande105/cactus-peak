import {
  type ClubId,
  categoryObject,
  clubObjects,
  coachObjects,
  GymObject,
  generalObjects,
  ObjectRack,
  type RackLayout,
  type Ratio,
} from "@/components/brand/graphics"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"

// App-level wrappers for the brand graphics (components/brand/graphics, synced from the marketing site).
// They pick the objects from app data, so screens pass a club or a coach and never an object id.
// VISUAL-IDENTITY.md: gym objects in compositions, never scenes.

const isClubId = (slug: string): slug is ClubId => slug in clubObjects

/**
 * The club's graphic. Full: a Rack around the club's lead object (orbit by default; pass `layout`, for example
 * "spotlight" for a wide header), with its Set and the general objects. Simple: the lead object on a muted
 * tile, for pickers and thumbnails below 120 px.
 */
export function ClubArt({
  slug,
  ratio = "16/9",
  detail,
  layout = "orbit",
  fill,
  className,
  label,
}: {
  slug: string
  ratio?: Ratio
  detail?: "full" | "simple"
  layout?: RackLayout
  fill?: boolean
  className?: string
  label?: string
}) {
  if (!isClubId(slug)) return null
  const [lead, ...rest] = clubObjects[slug]
  if (detail === "simple")
    return (
      <span
        className={cn(
          "grid place-items-center bg-muted",
          fill && "absolute inset-0",
          className
        )}
        style={
          fill ? undefined : { aspectRatio: String(ratio).replace(":", "/") }
        }
      >
        <GymObject id={lead} label={label} className="h-3/4 w-auto" />
      </span>
    )
  return (
    <ObjectRack
      ratio={ratio}
      layout={layout}
      scheme={layout === "spotlight" ? "night" : "sand"}
      focus={lead}
      ids={[...rest, ...generalObjects.filter((id) => id !== lead)]}
      fill={fill}
      label={label}
      className={className}
    />
  )
}

/** "Tomás Reyes" → "tomas-reyes", the slug the coach data uses. */
export const personSlug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")

const ROLE_WORDS: [RegExp, CategoryId][] = [
  [/cycle|ride/i, "cycle"],
  [/youth|teen|kids/i, "youth"],
  [/aqua|swim/i, "aqua"],
  [/court|pickleball|tennis/i, "court"],
  [/mind|yoga|pilates/i, "mind-body"],
  [/recovery|mobility/i, "recovery"],
  [/conditioning|hiit|run/i, "conditioning"],
  [/strength|lift|barbell/i, "strength"],
]
/** The class category of a coach's first specialty that names one. */
export function roleCategory(roles: string[]): CategoryId {
  for (const r of roles)
    for (const [re, id] of ROLE_WORDS) if (re.test(r)) return id
  return "strength"
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

/**
 * A coach's avatar until headshots exist: initials on Night, with the coach's discipline object as a badge
 * (coachObjects, or the object of their main specialty's category).
 */
export function CoachArt({
  name,
  roles,
  shape = "circle",
  size,
  className,
}: {
  name: string
  roles: string[]
  shape?: "circle" | "square"
  size?: number
  className?: string
}) {
  const object =
    coachObjects[personSlug(name)] ?? categoryObject[roleCategory(roles)]
  // The badge shows from 40 px; below that the initials alone stay readable.
  const badge = (size ?? 48) >= 40
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center bg-night font-semibold text-on-night",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        (size ?? 48) >= 64 ? "text-label" : "text-caption",
        className
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      {initials(name)}
      {badge ? (
        <span className="absolute -right-1 -bottom-1 grid size-[45%] place-items-center rounded-full bg-card ring-2 ring-background">
          <GymObject id={object} className="size-[70%]" />
        </span>
      ) : null}
    </span>
  )
}

/**
 * A positioned box for a brand graphic with overlays (bands, badges). Pass the aspect ratio as a class
 * (`aspect-[16/9] max-md:aspect-[4/3]`) and the graphic with `fill`; render one graphic per ratio if the box
 * changes ratio a lot, because each piece is composed for one ratio.
 */
export function ArtFrame({
  art,
  className,
  children,
}: {
  art: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("relative isolate w-full overflow-hidden", className)}>
      {art}
      {children}
    </div>
  )
}
