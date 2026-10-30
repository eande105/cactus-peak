"use client"

import type { ComponentProps } from "react"

import { Separator as GraphicalSeparator } from "@/components/graphical"

// Separator on the Graphical Separator (gui/components/cactus-peak-athletic/separator.md): XXS spacing tall,
// transparent, with a top inset edge (a leading edge when vertical).
function Separator(props: ComponentProps<typeof GraphicalSeparator>) {
  return <GraphicalSeparator data-slot="separator" {...props} />
}

export { Separator }
