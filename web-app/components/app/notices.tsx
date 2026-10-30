"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Popover, Tabs } from "@/components/graphical"
import {
  Bell,
  CalendarCheck,
  Clock3,
  CreditCard,
  Dumbbell,
  MessageSquare,
  Newspaper,
  ShieldAlert,
  Smile,
  Users,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  confirmHold,
  deleteNotice,
  markAllRead,
  markNoticeRead,
  resolveRequest,
  unreadNotices,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { fmtCountdown, fmtRelative } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Notice } from "@/lib/types"
import { openDialog } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const ICON: Record<Notice["type"], typeof Bell> = {
  hold: Clock3,
  booked: CalendarCheck,
  card: CreditCard,
  coach: MessageSquare,
  teen_request: Users,
  late_cancel: ShieldAlert,
  feedback: Smile,
  club: Newspaper,
  court_invite: Dumbbell,
  billing: CreditCard,
  waitlist: Clock3,
}

export function useNoticeAction() {
  const { s, now } = useApp()
  const router = useRouter()
  return (n: Notice) => {
    if (n.type === "hold" && n.bookingId) {
      const r = confirmHold(n.bookingId)
      if (r.ok) announce("Spot confirmed. You're booked.")
      else toast({ type: "error", title: r.message })
    } else if (n.type === "card") openDialog("card")
    else if (n.type === "feedback" && n.bookingId)
      openDialog("feedback", n.bookingId)
    else if (n.type === "teen_request" && n.requestId) {
      openDialog("approve", n.requestId)
    }
    void s
    void now
    void router
  }
}

export function NoticeRow({
  n,
  variant,
  selected,
  onOpen,
}: {
  n: Notice
  variant: "popover" | "list"
  selected?: boolean
  onOpen?: () => void
}) {
  const { s, now } = useApp()
  const act = useNoticeAction()
  const Icon = ICON[n.type] ?? Bell
  const hold =
    n.type === "hold" && n.bookingId
      ? s.bookings.find((b) => b.id === n.bookingId)
      : undefined
  const holdLeft =
    hold?.status === "held" && hold.holdExpiresAt ? hold.holdExpiresAt - now : 0
  const warm = n.type === "hold" || n.type === "late_cancel"
  return (
    <li
      className={cn(
        "relative flex gap-3 px-4 py-3",
        selected && "bg-accent",
        warm && "border-l-[3px] border-warning"
      )}
    >
      <Icon
        className={cn(
          "mt-1 size-4 shrink-0",
          warm ? "text-warning" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => {
            markNoticeRead(n.id)
            onOpen?.()
          }}
          className="block min-h-11 w-full py-1 text-left"
        >
          <span className="flex items-start justify-between gap-2">
            <span className={cn("text-label", n.readAt && "font-normal")}>
              {!n.readAt ? (
                <span
                  className="mr-2 inline-block size-2 rounded-full bg-destructive align-middle"
                  aria-hidden="true"
                />
              ) : null}
              {!n.readAt ? <span className="sr-only">Unread. </span> : null}
              {n.title}
            </span>
            <span className="shrink-0 num text-detail text-muted-foreground">
              {fmtRelative(n.at, now)}
            </span>
          </span>
          <span className="block text-caption text-muted-foreground">
            {n.done ??
              (holdLeft > 0 ? `Confirm in ${fmtCountdown(holdLeft)}.` : n.body)}
          </span>
        </button>
        {n.needsAction &&
        !n.done &&
        n.actionLabel &&
        !(n.type === "hold" && holdLeft <= 0) ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={n.type === "hold" ? "primary" : "outline"}
              onClick={() => act(n)}
            >
              {n.type === "hold" && holdLeft > 0
                ? `Confirm spot · ${fmtCountdown(holdLeft)}`
                : n.actionLabel}
            </Button>
            {n.type === "teen_request" && n.requestId ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resolveRequest(n.requestId!, false)
                }}
              >
                Decline
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      {variant === "list" ? (
        <button
          type="button"
          className="sr-only"
          onClick={() => deleteNotice(n.id)}
        >
          Delete notification
        </button>
      ) : null}
    </li>
  )
}

export function NotificationsPopover() {
  const { s, me } = useApp()
  const [tab, setTab] = useState<"all" | "action">("all")
  const mine = s.notices
    .filter(
      (n) => n.memberId === me.id && s.threads.every((t) => t.id !== n.threadId)
    )
    .sort((a, b) => b.at - a.at)
  const unread = mine.filter((n) => !n.readAt).length
  const list = (
    tab === "all" ? mine : mine.filter((n) => n.needsAction && !n.done)
  ).slice(0, 6)
  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        className="relative !grid !size-11 !place-items-center !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-muted"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread ? (
          <span
            className="font-bold absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-badge-danger px-1 num text-detail text-badge-danger-fg"
            aria-hidden="true"
          >
            {unread}
          </span>
        ) : null}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="end" sideOffset={8}>
          <Popover.Popup className="!w-[min(400px,calc(100vw-24px))] !gap-0 !p-0">
            <div className="flex items-center justify-between gap-2 px-4 pt-4">
              <Popover.Title className="font-heading text-h3">
                Notifications
              </Popover.Title>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const ids = markAllRead()
                  announce("All caught up.")
                  toast({
                    title: "All caught up",
                    action: {
                      label: "Undo",
                      onClick: () => unreadNotices(ids),
                    },
                  })
                }}
              >
                Mark all read
              </Button>
            </div>
            <Tabs.Root
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
              className="px-4 pb-2"
            >
              <Tabs.List aria-label="Filter">
                {(["all", "action"] as const).map((t) => (
                  <Tabs.Tab
                    key={t}
                    value={t}
                    id={`notices-tab-${t}`}
                    aria-controls="notices-panel"
                    className="max-md:min-h-11"
                  >
                    {t === "all" ? "All" : "Needs action"}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>
            {/* One panel follows the active tab. It stays outside Tabs.Panel so the panel part's spacing and text
                styles do not reach the notice rows. */}
            <div
              id="notices-panel"
              role="tabpanel"
              aria-labelledby={`notices-tab-${tab}`}
            >
              {list.length ? (
                <ul className="max-h-[60vh] overflow-y-auto rule-rows rule-t">
                  {list.map((n) => (
                    <NoticeRow key={n.id} n={n} variant="popover" />
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 rule-t">
                  <p className="text-label">You&apos;re all caught up.</p>
                  <p className="text-caption text-muted-foreground">
                    New alerts show here.
                  </p>
                </div>
              )}
            </div>
            <div className="px-4 py-2 rule-t">
              <Link
                href="/inbox"
                className="text-link inline-flex min-h-11 items-center text-label hover:underline"
              >
                Open inbox
              </Link>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
