"use client"
import type { ReactNode } from "react"
import { AlertDialog, Dialog, Drawer } from "@/components/graphical"
import { X } from "@/components/icons"
import { useMedia } from "@/hooks/use-media"
import { cn } from "@/lib/utils"

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
  className,
  hideTitle,
  initialFocus,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  wide?: boolean
  className?: string
  hideTitle?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup
          className={cn(wide && "wide-modal", "gap-4", className)}
          initialFocus={initialFocus}
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title
              className={cn(
                "font-heading text-h2 display-stretch",
                hideTitle && "sr-only"
              )}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="-mt-3 -mr-3 grid size-11 shrink-0 place-items-center rounded-md hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="text-body text-muted-foreground">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">
              {typeof title === "string" ? title : "Dialog"}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Confirm({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  const wide = useMedia("(min-width: 768px)")
  if (!wide) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <span
                  aria-hidden="true"
                  className="mx-auto h-1 w-10 rounded-full bg-input"
                />
                <Drawer.Title className="font-heading text-h2 display-stretch">
                  {title}
                </Drawer.Title>
                {description ? (
                  <Drawer.Description className="text-body text-muted-foreground">
                    {description}
                  </Drawer.Description>
                ) : null}
                <div className={cn("flex flex-col gap-4", className)}>
                  {children}
                </div>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup className={cn("gap-4", className)}>
          <AlertDialog.Title className="font-heading text-h2 display-stretch">
            {title}
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="text-body text-muted-foreground">
              {description}
            </AlertDialog.Description>
          ) : null}
          {children}
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// Right-docked sheet from 768px, bottom sheet below. Used for class detail and filters.
export function SideSheet({
  open,
  onOpenChange,
  title,
  children,
  label,
  onClosed,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title?: ReactNode
  label: string
  children: ReactNode
  onClosed?: () => void
}) {
  const wide = useMedia("(min-width: 768px)")
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={wide ? "right" : "down"}
      onOpenChangeComplete={(o) => {
        if (!o) onClosed?.()
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport className="side-drawer-viewport">
          <Drawer.Popup className="side-drawer !gap-0 !p-0" aria-label={label}>
            <Drawer.Content className="min-h-full !gap-0">
              <Drawer.Title className={title ? "sr-only" : "sr-only"}>
                {title ?? label}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                {label}
              </Drawer.Description>
              {children}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
export { Drawer }
