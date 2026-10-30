"use client"
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { type ReactElement, type ReactNode, useMemo } from "react"
import { Tooltip, useGraphicalTheme } from "@/components/graphical"
import { resolveComponentPartStyle } from "@/components/graphical/lib/component-parts"

export const TipProvider = Tooltip.Provider

// A short hint on an existing control. The control keeps its own look and its own accessible name, so the trigger is
// the plain Base UI trigger: the Graphical trigger would paint a tooltip button over it. The popup is the Graphical one.
// When there is no content the tooltip is off, but the tree stays the same, so the control does not remount or lose focus.
export function Tip({
  content,
  children,
  side = "top",
}: {
  content?: ReactNode
  children: ReactElement
  side?: "top" | "right" | "bottom" | "left"
}) {
  const { document, colorMode } = useGraphicalTheme()
  // The theme sets the gap between the control and the popup.
  const offset = useMemo(
    () =>
      resolveComponentPartStyle(document, colorMode, "tooltip", "popover").gap,
    [document, colorMode]
  )
  return (
    <Tooltip.Root disabled={!content}>
      <BaseTooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={offset}>
          <Tooltip.Popup>{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
