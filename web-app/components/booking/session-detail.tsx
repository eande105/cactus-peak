"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { calEventFor, SessionAction } from "@/components/booking/session-action"
import { SuccessPanel } from "@/components/booking/success-panel"
import {
  categoryObject,
  categoryRelated,
  ObjectRack,
} from "@/components/brand/graphics"
import { Menu } from "@/components/graphical"
import {
  Calendar,
  ChevronDown,
  Clock3,
  Lock,
  MapPin,
  TriangleAlert,
  X,
} from "@/components/icons"
import { ArtFrame, CoachArt } from "@/components/kit/brand-art"
import { CategoryBadge } from "@/components/kit/category"
import { Modal } from "@/components/kit/overlays"
import { BusynessMeter, IntensityRibs } from "@/components/kit/ribs"
import {
  EmptyState,
  PersonAvatar,
  SelectBox,
  StatusPill,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CLUB_BY_SLUG, INSTRUCTOR_BY_ID, PLANS } from "@/lib/data/catalog"
import { sessionById, sessionsRange } from "@/lib/data/sessions"
import {
  activeStrikes,
  bookingState,
  capacityText,
  guestPassesLeft,
  householdMembers,
  liveBusyness,
  sessionLeft,
  waitCount,
} from "@/lib/engine"
import { downloadIcs, googleUrl } from "@/lib/ics"
import {
  dayStart,
  fmtCountdown,
  fmtDay,
  fmtDayLong,
  fmtDowTime,
  fmtRange,
  fmtTime,
  HOUR,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking, Session } from "@/lib/types"
import { cn } from "@/lib/utils"

function useDelay(ms: number) {
  void ms
  return true
}

function InviteDialog({
  open,
  onOpenChange,
  se,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  se: Session
}) {
  const { s, hh, now } = useApp()
  const { left } = guestPassesLeft(s, hh.id, now)
  const link = `https://my.cactuspeakathletic.example/g/${se.id.split("~")[3]}-${se.id.split("~")[1]}`
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite a friend"
      description={`Share ${se.name}, ${fmtDowTime(se.start)} Friends need a guest pass to get in.`}
    >
      <div className="flex gap-2">
        <Input
          readOnly
          aria-label="Invite link"
          value={link}
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button
          onClick={() => {
            void navigator.clipboard?.writeText(link)
            toast({ title: "Link copied" })
          }}
        >
          Copy link
        </Button>
      </div>
      <p className="text-caption text-muted-foreground">
        {left > 0
          ? `Guest passes left this month: ${left}`
          : "Guest passes: 0 left this month. A day pass is $20."}{" "}
        <Link href="/guest-passes" className="text-link underline">
          Send a guest pass
        </Link>
      </p>
    </Modal>
  )
}

export function SessionDetail({
  id,
  mode,
  onClose,
}: {
  id: string
  mode: "sheet" | "page"
  onClose?: () => void
}) {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const ready = useDelay(mode === "sheet" ? 260 : 120)
  const se = sessionById(id)
  useEffect(() => {
    if (!se) return
    const t = setTimeout(() => {
      document.title = `${se.name}, ${fmtDowTime(se.start)} · Cactus Peak Athletic`
    }, 150)
    return () => clearTimeout(t)
  }, [se])
  const [forId, setForId] = useState(me.id)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const [invite, setInvite] = useState(false)
  if (!ready)
    return (
      <div className="flex flex-col gap-4 p-4" aria-busy="true">
        <p role="status" className="text-caption text-muted-foreground">
          Checking availability…
        </p>
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  if (!se || se.end < now - 12 * HOUR)
    return (
      <div className="p-6">
        <EmptyState
          title="That class has ended."
          body="See what's on today."
          action={
            <Button
              onClick={() => {
                onClose?.()
                router.push("/schedule")
              }}
            >
              See today&apos;s schedule
            </Button>
          }
        />
      </div>
    )
  const club = CLUB_BY_SLUG[se.clubSlug]
  const inst = INSTRUCTOR_BY_ID[se.instructorId]
  const people = householdMembers(s, hh.id).filter(
    (m) =>
      (me.role === "teen"
        ? m.id === me.id
        : m.id === me.id || me.role === "primary" || me.role === "adult") &&
      m.status !== "invite_expired"
  )
  const who = s.members[people.some((p) => p.id === forId) ? forId : me.id]
  const st = bookingState(s, who.id, se, now)
  const left = sessionLeft(s, se)
  const strikes = activeStrikes(s, who.id, now)
  const others = s.bookings.filter(
    (b) =>
      b.sessionId === se.id &&
      b.memberId !== who.id &&
      b.status === "booked" &&
      s.members[b.memberId].householdId === hh.id
  )
  const plan = PLANS[hh.plan]
  const same = sessionsRange(se.clubSlug, dayStart(now), 8)
    .filter((x) => x.typeKey === se.typeKey && x.id !== se.id && x.start > now)
    .slice(0, 4)
  const rule =
    se.minAge >= 18
      ? "Ages 18 and over"
      : se.minAge > 4
        ? `Ages ${se.minAge} and up`
        : null
  const justBooked = confirmed && st.booking?.id === confirmed.id
  const ev = calEventFor(se)
  const Title = (mode === "page" ? "h1" : "h2") as "h1"
  const b = liveBusyness(club.slug, now)

  const options = people.map((p) => {
    const ps = bookingState(s, p.id, se, now)
    const blocked =
      ps.state === "restricted" && /ages|18/i.test(ps.reason ?? "")
    return {
      value: p.id,
      label: `${p.id === me.id ? `${p.firstName} (you)` : p.firstName}${blocked ? ` — ${ps.reason}` : ""}`,
      disabled: blocked,
    }
  })

  const confirmedView = justBooked ? (
    <div className="p-4 sm:p-6">
      <SuccessPanel
        pill="Booked"
        headline={`${se.name}, ${fmtDowTime(se.start)}`}
        summary={[
          {
            label: "When",
            value: `${fmtDay(se.start)} · ${fmtRange(se.start, se.end)}`,
          },
          { label: "Where", value: `${se.studio} · ${club.name}` },
          { label: "Instructor", value: inst?.name },
          ...(confirmed?.spot
            ? [{ label: "Spot", value: confirmed.spot }]
            : []),
          { label: "Reference", value: confirmed?.ref },
        ]}
        event={ev}
        shareText={`https://my.cactuspeakathletic.example/schedule/${se.id}`}
        rows={[
          {
            label: "Get directions",
            href: `https://maps.google.com/?q=${encodeURIComponent(club.address)}`,
          },
          {
            label: "Call the club",
            href: `tel:${club.phone.replace(/\D/g, "")}`,
          },
          { label: "Club details", href: `/clubs/${club.slug}` },
        ]}
        onDone={() => setConfirmed(null)}
      />
    </div>
  ) : null

  const body = (
    <div className={cn("flex flex-col gap-6", mode === "page" && "min-w-0")}>
      <ArtFrame
        className={cn("aspect-[16/9]", mode === "page" && "rounded-lg")}
        art={
          <ObjectRack
            ratio="16/9"
            layout="spotlight"
            focus={categoryObject[se.category]}
            ids={categoryRelated[se.category]}
            fill
          />
        }
      >
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-photo-band px-4 py-2.5 text-on-night">
          <span className="text-label">
            with {inst?.name} ·{" "}
            {fmtDowTime(se.start)
              .replace(" ", ", ")
              .replace(/^(\w+),/, "$1,")}
          </span>
          <span className="rounded-sm border border-on-night/40 px-2 num text-detail">
            {se.duration} min
          </span>
        </div>
      </ArtFrame>
      <div
        className={cn(
          "flex flex-col gap-6",
          mode === "sheet" && "px-4 sm:px-6"
        )}
      >
        {st.state === "hold" ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-caption"
          >
            <Clock3 className="size-4 text-warning" aria-hidden="true" />A spot
            opened. Confirm in{" "}
            <span className="num font-semibold">
              {fmtCountdown((st.booking?.holdExpiresAt ?? 0) - now)}
            </span>
            .
          </div>
        ) : null}
        {st.state === "waitlisted" ? (
          <div
            role="status"
            className="rounded-md bg-muted px-3 py-2 text-caption"
          >
            You&apos;re #{st.booking?.position} on the waitlist. We stop moving
            people up 1 hour before class.
          </div>
        ) : null}
        {rule ? (
          <p className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-caption">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            {rule}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <CategoryBadge id={se.category} size="md" className="w-fit" />
          <Title
            id="page-title"
            tabIndex={-1}
            className={cn(
              "font-heading display-stretch outline-none",
              mode === "page" ? "text-h1 md:text-display" : "text-h2"
            )}
          >
            {se.name}
          </Title>
          <p className="flex items-center gap-2 text-body">
            <Calendar
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="num">
              {fmtDayLong(se.start)} · {fmtRange(se.start, se.end)}
            </span>
          </p>
          <p className="flex items-center gap-2 text-body">
            <MapPin
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Link href={`/clubs/${club.slug}`} className="hover:underline">
              {club.name}, {se.studio}
            </Link>
          </p>
          <p className="text-detail text-muted-foreground">
            Arizona time (no daylight saving)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CoachArt
            name={inst?.name ?? ""}
            roles={[inst?.role ?? se.category]}
            size={56}
          />
          <div>
            <p className="text-label">with {inst?.name}</p>
            <p className="text-caption text-muted-foreground">
              {inst?.role} · <span className="num">{inst?.years}</span> years at
              Cactus Peak
            </p>
          </div>
        </div>
        <dl className="grid max-w-sm grid-cols-[7rem_1fr] text-body rule-rows [&>*]:py-2.5">
          <dt className="text-caption text-muted-foreground">Length</dt>
          <dd className="num">{se.duration} min</dd>
          <dt className="text-caption text-muted-foreground">Intensity</dt>
          <dd>
            <IntensityRibs
              level={se.intensity}
              category={se.category}
              size="md"
            />
          </dd>
          <dt className="text-caption text-muted-foreground">Spots</dt>
          <dd className={cn("num", left > 0 && left < 5 && "text-warning")}>
            {left === 0
              ? `Full, ${waitCount(s, se)} waiting`
              : `${left} ${se.unit} left`}
          </dd>
        </dl>
        <div className="flex max-w-[66ch] flex-col gap-2">
          <p className="text-body">{se.about}</p>
          {se.firstTimerOk ? (
            <p className="text-body-strong">Good for first-timers.</p>
          ) : null}
        </div>
        <div>
          <p className="mb-2 eyebrow text-muted-foreground">What to bring</p>
          <ul className="flex flex-wrap gap-2">
            {se.bring.map((x) => (
              <li
                key={x}
                className="rounded-sm bg-muted px-2 py-1 text-caption"
              >
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1 pt-4 text-caption rule-t">
          <p>
            <span className="text-label">Cancellation.</span> Cancel free until{" "}
            {fmtTime(se.start - 2 * HOUR)} (2 hours before). After that, it
            counts as a late cancel.
          </p>
          <p>
            <span className="text-label">Waitlist.</span> If this class is full,
            the waitlist moves you up until {fmtTime(se.start - HOUR)} (1 hour
            before). You get a push and 30 minutes to confirm.
          </p>
          {strikes.length ? (
            <p className="text-warning">
              <TriangleAlert
                className="mr-1 inline size-4"
                aria-hidden="true"
              />
              You have {strikes.length} late{" "}
              {strikes.length === 1 ? "cancel" : "cancels"} in the last 30 days.
            </p>
          ) : null}
        </div>
        {same.length ? (
          <div>
            <p className="mb-2 eyebrow text-muted-foreground">Other times</p>
            <ul className="flex flex-wrap gap-2">
              {same.map((x) => (
                <li key={x.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.replace(`/schedule/${x.id}`)}
                  >
                    {fmtDowTime(x.start)}
                    <span className="ml-1 num text-muted-foreground">
                      · {capacityText(s, x, now)}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 rounded-md bg-muted p-3">
          <p className="text-label">{club.name}</p>
          <p className="text-caption text-muted-foreground">{club.address}</p>
          <div className="flex flex-wrap items-center gap-3">
            <BusynessMeter level={b.level} variant="inline" />
            <a
              className="text-link text-caption underline"
              href={`https://maps.google.com/?q=${encodeURIComponent(club.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps
            </a>
          </div>
        </div>
        {others.length ? (
          <p className="flex items-center gap-2 text-caption text-muted-foreground">
            <PersonAvatar
              name={s.members[others[0].memberId].firstName}
              hue={s.members[others[0].memberId].hue}
              size={24}
            />
            {others.map((o) => s.members[o.memberId].firstName).join(" and ")}{" "}
            {others.length > 1 ? "are" : "is"} also booked.
          </p>
        ) : null}
      </div>
    </div>
  )

  const actionBar = (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-3",
        mode === "page" && "flex-col items-stretch"
      )}
    >
      <div className="min-w-0">
        <p className="text-label">{plan.name}</p>
        <p className="num text-caption text-muted-foreground">
          {capacityText(s, se, now)}
        </p>
      </div>
      {people.length > 1 ? (
        <div className="min-w-44">
          <SelectBox
            label="Booking for"
            value={who.id}
            onChange={setForId}
            options={options}
          />
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Menu.Root>
          <Menu.Trigger
            aria-label="More actions"
            className="!inline-flex !min-h-12 !items-center !gap-1 !px-3"
          >
            More
            <ChevronDown className="size-4" aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" side="top" sideOffset={6}>
              <Menu.Popup className="!min-w-56">
                <Menu.Item
                  render={
                    <a href={googleUrl(ev)} target="_blank" rel="noreferrer" />
                  }
                >
                  Add to Google Calendar
                </Menu.Item>
                <Menu.Item onClick={() => downloadIcs(ev)}>
                  Add to Apple or Outlook (.ics)
                </Menu.Item>
                {me.role !== "teen" ? (
                  <Menu.Item onClick={() => setInvite(true)}>
                    Invite a friend
                  </Menu.Item>
                ) : null}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <SessionAction
          featured
          se={se}
          forId={who.id}
          size="lg"
          bar
          showReason
          onBooked={(bk) => setConfirmed(bk)}
        />
      </div>
    </div>
  )

  if (mode === "page")
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0">{justBooked ? confirmedView : body}</div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg bg-card p-4 edge">{actionBar}</div>
        </aside>
        <InviteDialog open={invite} onOpenChange={setInvite} se={se} />
      </div>
    )
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex justify-end p-2">
        <button
          type="button"
          aria-label="Close class details"
          onClick={onClose}
          className="grid size-11 place-items-center rounded-md hover:bg-muted"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="-mt-13 flex-1 pb-4">
        {justBooked ? <div className="pt-14">{confirmedView}</div> : body}
      </div>
      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6">
        {actionBar}
      </div>
      <InviteDialog open={invite} onOpenChange={setInvite} se={se} />
    </div>
  )
}
void StatusPill
void Lock
