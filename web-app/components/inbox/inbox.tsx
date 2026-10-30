"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { NoticeRow, useNoticeAction } from "@/components/app/notices"
import { useApp } from "@/components/app/use-app"
import { Tabs } from "@/components/graphical"
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  SelectBox,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMedia } from "@/hooks/use-media"
import {
  deleteNotice,
  markAllRead,
  markNoticeRead,
  resolveRequest,
  sendMessage,
  unreadNotices,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { fmtCountdown, fmtDayTime, fmtRelative } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Notice, Thread } from "@/lib/types"
import { cn } from "@/lib/utils"

type Item =
  | { kind: "notice"; n: Notice; at: number }
  | { kind: "thread"; t: Thread; at: number }

export function Detail({
  item,
  onBack,
}: {
  item: Item | undefined
  onBack?: () => void
}) {
  const { s, now } = useApp()
  const act = useNoticeAction()
  const [text, setText] = useState("")
  const id = item ? (item.kind === "notice" ? item.n.id : item.t.id) : ""
  // biome-ignore lint/correctness/useExhaustiveDependencies: the timer must restart only when the open notice changes, not on every store update
  useEffect(() => {
    if (item?.kind !== "notice" || item.n.readAt) return
    const t = setTimeout(() => markNoticeRead(item.n.id), 2000)
    return () => clearTimeout(t)
  }, [id])
  if (!item)
    return (
      <div className="p-6">
        <EmptyState
          title="Pick a message"
          body="Select something from the list to read it."
          className="py-0"
        />
      </div>
    )
  if (item.kind === "thread") {
    const t = s.threads.find((x) => x.id === item.t.id)!
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        {onBack ? (
          <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
            Back
          </Button>
        ) : null}
        <div>
          <h2 className="font-heading text-h3 display-stretch">{t.with}</h2>
          <p className="text-caption text-muted-foreground">{t.subject}</p>
        </div>
        <ul className="flex flex-1 flex-col gap-3" aria-label="Messages">
          {t.messages.map((m, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: messages have no id and the thread only appends
              key={i}
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2.5 text-body",
                m.from === "me"
                  ? "self-end bg-night text-on-night"
                  : "self-start bg-muted"
              )}
            >
              <p>{m.text}</p>
              <p
                className={cn(
                  "mt-1 num text-detail",
                  m.from === "me" ? "text-on-night/80" : "text-muted-foreground"
                )}
              >
                {fmtDayTime(m.at)}
              </p>
            </li>
          ))}
          {!t.messages.length ? (
            <li className="text-muted-foreground">
              No messages yet. Say hello.
            </li>
          ) : null}
        </ul>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!text.trim()) return
            sendMessage(t.id, text.trim())
            setText("")
            announce("Message sent.")
          }}
        >
          <label htmlFor="composer" className="sr-only">
            Message
          </label>
          <Textarea
            id="composer"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${t.with.replace("Coach ", "")}`}
          />
          <Button type="submit" className="self-end" disabled={!text.trim()}>
            Send
          </Button>
        </form>
      </div>
    )
  }
  const n = item.n
  const hold = n.bookingId
    ? s.bookings.find((b) => b.id === n.bookingId)
    : undefined
  const left = hold?.status === "held" ? (hold.holdExpiresAt ?? 0) - now : 0
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {onBack ? (
        <Button variant="ghost" size="sm" className="w-fit" onClick={onBack}>
          Back
        </Button>
      ) : null}
      <h2 className="font-heading text-h3 display-stretch">{n.title}</h2>
      <p className="text-body">
        {n.done ?? n.body}
        {left > 0 ? ` Confirm by ${fmtCountdown(left)} left.` : ""}
      </p>
      <p className="num text-caption text-muted-foreground">
        {fmtDayTime(n.at)}
      </p>
      <div className="flex flex-wrap gap-2">
        {n.needsAction &&
        !n.done &&
        n.actionLabel &&
        !(n.type === "hold" && left <= 0) ? (
          <Button onClick={() => act(n)}>
            {n.type === "hold"
              ? `Confirm spot · ${fmtCountdown(left)}`
              : n.actionLabel}
          </Button>
        ) : null}
        {n.type === "teen_request" &&
        n.requestId &&
        n.needsAction &&
        !n.done ? (
          <Button
            variant="outline"
            onClick={() => {
              resolveRequest(n.requestId!, false)
            }}
          >
            Decline
          </Button>
        ) : null}
        {!n.readAt ? (
          <Button variant="outline" onClick={() => markNoticeRead(n.id)}>
            Mark as read
          </Button>
        ) : null}
        <Button
          variant="ghost"
          onClick={() => {
            deleteNotice(n.id)
            onBack?.()
          }}
        >
          Delete
        </Button>
      </div>
      {n.type === "late_cancel" ? (
        <p className="text-caption">
          <Link href="/bookings" className="text-link underline">
            See my bookings
          </Link>{" "}
          ·{" "}
          <Link href="/help" className="text-link underline">
            How late cancels work
          </Link>
        </p>
      ) : null}
    </div>
  )
}

export function useInboxItems() {
  const { s, me } = useApp()
  return useMemo(() => {
    const mine = s.notices
      .filter((n) => n.memberId === me.id)
      .map<Item>((n) => ({ kind: "notice", n, at: n.at }))
    const threads = s.threads
      .filter((t) => t.memberId === me.id)
      .map<Item>((t) => ({ kind: "thread", t, at: t.messages.at(-1)?.at ?? 0 }))
    return [...mine, ...threads].sort((a, b) => b.at - a.at)
  }, [s.notices, s.threads, me.id])
}

export default function InboxPage() {
  const { s, me, now } = useApp()
  const router = useRouter()
  const wide = useMedia("(min-width: 1024px)")
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"all" | "action" | "messages">("all")
  const [filter, setFilter] = useState("all")
  const [sel, setSel] = useState<string | null>(null)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const items = useInboxItems()
  const list = items.filter(
    (i) =>
      (tab === "all"
        ? true
        : tab === "messages"
          ? i.kind === "thread"
          : i.kind === "notice" && i.n.needsAction && !i.n.done) &&
      (filter === "all" ||
        (i.kind === "notice" ? i.n.filter === filter : filter === "training"))
  )
  const current =
    list.find((i) => (i.kind === "notice" ? i.n.id : i.t.id) === sel) ??
    (wide ? list[0] : undefined)
  if (loading) return <LoadingBlock text="Loading your inbox…" rows={5} />
  const unread = items.filter((i) => i.kind === "notice" && !i.n.readAt).length
  const action = items.filter(
    (i) => i.kind === "notice" && i.n.needsAction && !i.n.done
  ).length
  const empty =
    tab === "all"
      ? "You're all caught up."
      : tab === "action"
        ? "Nothing needs you right now."
        : "No messages yet. Message a coach from their profile."
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inbox"
        description="Everything the club tells you, plus messages with coaches and the front desk."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                const ids = markAllRead()
                toast({
                  title: "All caught up",
                  action: { label: "Undo", onClick: () => unreadNotices(ids) },
                })
              }}
            >
              Mark all read
            </Button>
            <SelectBox
              label="Filter"
              hideLabel
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All topics" },
                { value: "bookings", label: "Bookings" },
                { value: "billing", label: "Billing" },
                { value: "news", label: "Club news" },
                { value: "training", label: "Training" },
              ]}
              className="w-44"
            />
          </>
        }
      />
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <Tabs.List aria-label="Inbox">
          {(
            [
              ["all", `All ${unread ? unread : ""}`],
              ["action", `Needs action ${action || ""}`],
              ["messages", "Messages"],
            ] as const
          ).map(([k, l]) => (
            <Tabs.Tab
              key={k}
              value={k}
              id={`inbox-tab-${k}`}
              aria-controls="inbox-panel"
              className="max-md:min-h-11"
            >
              {l.trim()}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
      {/* The tabs filter one shared list, so one panel follows the active tab. It stays outside Tabs.Panel so the panel
          part's text styles do not reach the list and the reading pane. */}
      <div
        id="inbox-panel"
        role="tabpanel"
        aria-labelledby={`inbox-tab-${tab}`}
        className="grid min-h-[28rem] grid-cols-[minmax(0,1fr)] gap-0 lg:grid-cols-[380px_minmax(0,1fr)] lg:rounded-lg lg:bg-card lg:edge lg:ring-border"
      >
        <div className="min-w-0 lg:border-r lg:border-border">
          {list.length ? (
            <ul className="rule-rows" aria-label="Notifications">
              {list.map((i) =>
                i.kind === "notice" ? (
                  <NoticeRow
                    key={i.n.id}
                    n={i.n}
                    variant="list"
                    selected={wide && current === i}
                    onOpen={() =>
                      wide ? setSel(i.n.id) : router.push(`/inbox/${i.n.id}`)
                    }
                  />
                ) : (
                  <li
                    key={i.t.id}
                    className={cn(
                      "px-4 py-3",
                      wide && current === i && "bg-accent"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        wide ? setSel(i.t.id) : router.push(`/inbox/${i.t.id}`)
                      }
                      className="block w-full text-left"
                    >
                      <span className="flex justify-between gap-2">
                        <span className="text-label">{i.t.with}</span>
                        <span className="num text-detail text-muted-foreground">
                          {fmtRelative(i.at, now)}
                        </span>
                      </span>
                      <span className="block truncate text-caption text-muted-foreground">
                        {i.t.messages.at(-1)?.text ?? i.t.subject}
                      </span>
                    </button>
                  </li>
                )
              )}
            </ul>
          ) : (
            <div className="p-6">
              <EmptyState
                title={empty}
                body={tab === "messages" ? undefined : undefined}
                action={
                  tab === "messages" ? (
                    <Button render={<Link href="/training" />}>
                      Find a coach
                    </Button>
                  ) : undefined
                }
                className="py-0"
              />
            </div>
          )}
        </div>
        {wide ? (
          <div className="min-w-0">
            <Detail item={current} />
          </div>
        ) : null}
      </div>
      <span className="sr-only">
        {s.threads.length}
        {me.id}
      </span>
    </div>
  )
}
