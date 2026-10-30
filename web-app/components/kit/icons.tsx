import type { ComponentProps } from "react"
import { categoryObject, GymObject } from "@/components/brand/graphics"
import {
  Activity,
  Bike,
  Flower2,
  HeartPulse,
  type IconComponent,
  Smile,
  Waves,
} from "@/components/icons"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"

type SvgProps = ComponentProps<"svg">
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

// Barbell drawn as upright ribs: a bar with plates seen edge-on.
export function RibBarbell(props: SvgProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M3 12h18" />
      <path d="M6 7v10M9 9v6M15 9v6M18 7v10" />
    </svg>
  )
}
export function CourtIcon(props: SvgProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M12 5v14M3 12h18" />
    </svg>
  )
}
// Five upright ribs. Used for the sidebar mark when collapsed and for the Rib Peak motif.
export const CATEGORY_ICON: Record<
  CategoryId,
  IconComponent | ((p: SvgProps) => React.JSX.Element)
> = {
  strength: RibBarbell,
  cycle: Bike,
  conditioning: Activity,
  "mind-body": Flower2,
  aqua: Waves,
  court: CourtIcon,
  recovery: HeartPulse,
  youth: Smile,
}
export function CategoryIcon({
  id,
  className,
}: {
  id: CategoryId
  className?: string
}) {
  // The category's gym object (Nucleo core glyph) in the text colour, so it sits inline with labels.
  return (
    <GymObject
      id={categoryObject[id]}
      scheme="mono"
      className={cn("inline-block shrink-0", className ?? "size-4")}
    />
  )
}
