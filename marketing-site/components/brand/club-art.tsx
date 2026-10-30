import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import {
  type ClubId,
  clubObjects,
  GymObject,
  generalObjects,
  ObjectRack,
  type Ratio,
} from "./graphics"

type Props = {
  slug: string
  ratio?: Ratio
  /** "simple": a thumbnail for pickers, menus and search (the club's lead object only). */
  detail?: "full" | "simple"
  label?: string
  className?: string
  style?: CSSProperties
}

const isClubId = (slug: string): slug is ClubId => slug in clubObjects

/**
 * A club's graphic (VISUAL-IDENTITY.md, section 6). Full: an orbit around the club's lead object,
 * with its Set and the general objects on the rings. Simple: the lead object on a muted tile.
 */
export function ClubArt({
  slug,
  ratio = "4/3",
  detail = "full",
  label,
  className,
  style,
}: Props) {
  if (!isClubId(slug)) return null
  const [lead, ...rest] = clubObjects[slug]
  if (detail === "simple")
    return (
      <span
        className={cn("grid place-items-center bg-muted", className)}
        style={{ aspectRatio: String(ratio).replace(":", "/"), ...style }}
      >
        <GymObject id={lead} label={label} className="h-3/4 w-auto" />
      </span>
    )
  return (
    <ObjectRack
      ratio={ratio}
      layout="orbit"
      scheme="sand"
      focus={lead}
      ids={[...rest, ...generalObjects.filter((id) => id !== lead)]}
      label={label}
      className={className}
      style={style}
    />
  )
}
