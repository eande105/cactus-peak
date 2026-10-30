import {
  Activity,
  Bike,
  Dumbbell,
  Flower2,
  HeartPulse,
  type IconComponent,
  Smile,
  Waves,
} from "@/components/icons"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { categoryObject, GymObject } from "./graphics"

/** Custom court icon: lines and net, 2 px stroke, round caps (brand guide section 6). */
export function CourtIcon({ className, ...p }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...p}
    >
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M12 5v14M3 12h18" />
    </svg>
  )
}

export const categoryIcon: Record<
  CategoryId,
  IconComponent | typeof CourtIcon
> = {
  strength: Dumbbell,
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
export const catColor = (id: CategoryId) => `var(--cat-${id})`
export const catText = (id: CategoryId) => `var(--cat-${id}-text)`
export const catTint = (id: CategoryId) =>
  `color-mix(in oklab, var(--cat-${id}) 10%, transparent)`
