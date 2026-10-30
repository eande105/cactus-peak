"use client"

import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { type ComponentProps, createContext, useContext } from "react"
import { Dialog, Drawer } from "@/components/graphical"
import { useMedia } from "@/lib/use-media"
import { cn } from "@/lib/utils"

// Shared overlay on the Graphical Dialog and Drawer (gui/components/cactus-peak-athletic/dialog.md, drawer.md).
// The runtime owns the popup surface, padding, gap, radius, shadow, backdrop fill, title and description type, the
// ghost close button and the Large enter and exit motion. This file keeps the site's own placements and layering:
// backdrop at z 80 and popup at z 90, above the site menu (z 70), so the club switcher can open from the menu.
// center, top and full are dialogs. bottom and right are drawers. Set those two on `Overlay`, because a drawer needs
// its own root for swipe-to-close.

type DialogPlacement = "center" | "top" | "full"
type DrawerPlacement = "bottom" | "right"

// The Graphical modal is 400 px and centered; these keep the site's widths and the full-screen phone layout.
// max-w-none lifts the 420 px popup cap so the wider sizes apply.
const place: Record<DialogPlacement, string> = {
  center:
    "left-1/2 top-1/2 w-[min(440px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] -translate-x-1/2 -translate-y-1/2 max-sm:inset-0 max-sm:left-0 max-sm:top-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none",
  top: "left-1/2 top-24 w-[min(640px,calc(100vw-32px))] max-h-[calc(100dvh-8rem)] -translate-x-1/2 translate-y-0 max-sm:top-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:rounded-none",
  full: "inset-0 h-dvh max-h-none w-screen translate-x-0 translate-y-0 rounded-none",
}

const OverlayKind = createContext<DrawerPlacement | null>(null)

export function Overlay({
  placement,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  placement?: DialogPlacement | DrawerPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const wide = useMedia("(min-width: 768px)")
  const root = {
    open,
    defaultOpen,
    onOpenChange: (o: boolean) => onOpenChange?.(o),
  }
  if (placement === "bottom" || placement === "right") {
    return (
      <OverlayKind value={placement}>
        <Drawer.Root
          {...root}
          // The bottom sheet docks to the right edge from 768 px, so it swipes right there.
          swipeDirection={placement === "right" || wide ? "right" : "down"}
        >
          {children}
        </Drawer.Root>
      </OverlayKind>
    )
  }
  return (
    <OverlayKind value={null}>
      <Dialog.Root {...root}>{children}</Dialog.Root>
    </OverlayKind>
  )
}

// Triggers stay unthemed. The two in use are a header club pill and a text link, each with its own look.
export const OverlayTrigger = BaseDialog.Trigger
export const OverlayClose = BaseDialog.Close

export function OverlayPopup({
  placement = "center",
  className,
  children,
  label,
  hideClose,
  closeClassName,
}: {
  /** Only for dialogs. Set bottom and right on `Overlay`. */
  placement?: DialogPlacement
  className?: string
  children: React.ReactNode
  label: string
  hideClose?: boolean
  closeClassName?: string
}) {
  const drawer = useContext(OverlayKind)
  const Close = drawer ? Drawer.Close : Dialog.Close
  const close = hideClose ? null : (
    <Close
      aria-label="Close"
      // S spacing from the corner (dialog.md). The 44 px minimum is the site's touch target.
      className={cn(
        "absolute top-3 right-3 z-10 min-h-11 min-w-11",
        closeClassName
      )}
    >
      <X aria-hidden="true" />
    </Close>
  )
  if (drawer) {
    return (
      <Drawer.Portal>
        <Drawer.Backdrop className="z-[80]" />
        <Drawer.Viewport
          className={cn(
            "z-[90]",
            drawer === "right"
              ? "overlay-side-viewport"
              : "overlay-sheet-viewport"
          )}
        >
          <Drawer.Popup
            aria-label={label}
            className={cn(
              "relative flex flex-col outline-none",
              drawer === "right" ? "overlay-side" : "overlay-sheet",
              className
            )}
          >
            <Drawer.Content className="flex min-h-0 flex-1 flex-col">
              {children}
            </Drawer.Content>
            {close}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    )
  }
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="z-[80]" />
      <Dialog.Popup
        aria-label={label}
        className={cn(
          "z-[90] flex max-w-none flex-col overflow-hidden outline-none",
          place[placement],
          className
        )}
      >
        {children}
        {close}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

export function OverlayTitle(props: ComponentProps<typeof Dialog.Title>) {
  const drawer = useContext(OverlayKind)
  return drawer ? <Drawer.Title {...props} /> : <Dialog.Title {...props} />
}

export function OverlayDescription(
  props: ComponentProps<typeof Dialog.Description>
) {
  const drawer = useContext(OverlayKind)
  return drawer ? (
    <Drawer.Description {...props} />
  ) : (
    <Dialog.Description {...props} />
  )
}
