"use client"
import type { ReactNode } from "react"
import { Menu } from "@/components/graphical"
import { CalendarPlus } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { type CalEvent, downloadIcs, googleUrl } from "@/lib/ics"
import { fmtDayTime, fmtRange } from "@/lib/time"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

export function AddToCalendar({
  event,
  children,
  variant = "outline",
  className,
}: {
  event: CalEvent
  children?: ReactNode
  variant?: "primary" | "outline" | "ghost"
  className?: string
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          buttonVariants({ variant, size: "md" }),
          "!bg-clip-padding",
          className
        )}
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        {children ?? "Add to calendar"}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={6}>
          <Menu.Popup className="!min-w-56">
            <Menu.Item
              render={
                <a href={googleUrl(event)} target="_blank" rel="noreferrer" />
              }
            >
              Google Calendar
            </Menu.Item>
            <Menu.Item onClick={() => downloadIcs(event)}>
              Apple Calendar (.ics)
            </Menu.Item>
            <Menu.Item onClick={() => downloadIcs(event)}>
              Outlook (.ics)
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                void navigator.clipboard?.writeText(
                  `${event.title}\n${fmtDayTime(event.start)} to ${fmtRange(event.start, event.end).split("–")[1]}\n${event.location ?? ""}`
                )
                toast({ title: "Details copied" })
              }}
            >
              Copy details
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
