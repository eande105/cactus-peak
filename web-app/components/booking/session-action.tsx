"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { AddToCalendar } from "@/components/booking/calendar-menu"
import { CancelDialog } from "@/components/booking/cancel-dialog"
import { Menu } from "@/components/graphical"
import { Check, Loader2, Lock, TriangleAlert, X } from "@/components/icons"
import { Modal } from "@/components/kit/overlays"
import { Tip } from "@/components/kit/tip"
import { CheckRow } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  addRemind,
  bookClass,
  cancelBooking,
  confirmHold,
  joinWaitlist,
  leaveWaitlist,
  ordinal,
  rejoinWaitlist,
  releaseHold,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, INSTRUCTOR_BY_ID } from "@/lib/data/catalog"
import { bookingState, waitCount } from "@/lib/engine"
import { downloadIcs, googleUrl } from "@/lib/ics"
import {
  fmtCountdown,
  fmtDay,
  fmtDowTime,
  fmtRange,
  fmtTime,
  HOUR,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking, Session } from "@/lib/types"
import { openDialog, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

export function calEventFor(se: Session) {
  const club = CLUB_BY_SLUG[se.clubSlug]
  return {
    title: `${se.name}`,
    start: se.start,
    end: se.end,
    uid: se.id,
    location: `${club.name}, ${club.address}`,
    description: `${se.studio} with ${INSTRUCTOR_BY_ID[se.instructorId]?.name}. Arizona time (no daylight saving).`,
  }
}

export function WaitlistDialog({
  se,
  forId,
  open,
  onOpenChange,
}: {
  se: Session
  forId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { s } = useApp()
  const [ok, setOk] = useState(false)
  const pos = waitCount(s, se) + 1
  const stop = fmtTime(se.start - HOUR)
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setOk(false)
      }}
      title={`Join the waitlist for ${se.name}`}
      description={`You are ${ordinal(pos)} in line. If a spot opens, we hold it for you. You get a push and 30 minutes to confirm. We stop moving people up 1 hour before class (${stop}). Late cancels count as strikes.`}
    >
      <CheckRow checked={ok} onChange={setOk}>
        I understand the late-cancel rule.
      </CheckRow>
      <p className="text-caption text-muted-foreground">
        Notify me by: Push, Email.{" "}
        <Link href="/settings/notifications" className="text-link underline">
          Change
        </Link>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          className="text-link min-h-11 text-label underline-offset-4 hover:underline"
          onClick={() => onOpenChange(false)}
        >
          Pick another class
        </button>
        <Button
          disabled={!ok}
          aria-disabled={!ok}
          onClick={() => {
            const r = joinWaitlist(se.id, forId)
            onOpenChange(false)
            setOk(false)
            if (r.ok) {
              toast({
                title: `You're ${ordinal(r.position)} on the waitlist`,
                description: "We'll tell you if a spot opens.",
              })
              announce(
                `You are ${ordinal(r.position)} on the waitlist for ${se.name}.`
              )
            } else toast({ type: "error", title: r.message })
          }}
        >
          Join waitlist
        </Button>
      </div>
    </Modal>
  )
}

function ConflictDialog({
  se,
  clash,
  open,
  onOpenChange,
  onReplace,
}: {
  se: Session
  clash?: Booking
  open: boolean
  onOpenChange: (o: boolean) => void
  onReplace: () => void
}) {
  if (!clash) return null
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Replace your booking?"
      description={`You're booked for ${clash.title} at ${fmtTime(clash.start)} ${se.name} starts at ${fmtTime(se.start)} and ends at ${fmtTime(se.end)} Replace it?`}
    >
      <p className="text-caption text-muted-foreground">
        Replacing cancels the first booking with no strike if it is more than 2
        hours away.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Keep {clash.title.split(" ").pop()}
        </Button>
        <Button onClick={onReplace}>Book {se.name} instead</Button>
      </div>
    </Modal>
  )
}

export function SessionAction({
  se,
  forId,
  size = "md",
  bar,
  showReason,
  className,
  onBooked,
  featured,
}: {
  featured?: boolean
  se: Session
  forId?: string
  size?: "md" | "lg"
  bar?: boolean
  showReason?: boolean
  className?: string
  onBooked?: (b: Booking) => void
}) {
  const { s, me, now } = useApp()
  const router = useRouter()
  const offline = useOffline()
  const who = forId ?? me.id
  const st = bookingState(s, who, se, now)
  const [pending, setPending] = useState(false)
  const [wl, setWl] = useState(false)
  const [cancel, setCancel] = useState(false)
  const [clash, setClash] = useState<Booking | undefined>()
  const name = `${se.name}, ${fmtTime(se.start)}`
  const btn = cn(
    "min-w-[8.5rem] justify-center",
    size === "lg" && "min-h-12 px-8",
    className
  )

  const doBook = async (replaceId?: string) => {
    setPending(true)
    await new Promise((r) => setTimeout(r, 280))
    const r = bookClass(se.id, who, { replaceId })
    setPending(false)
    setClash(undefined)
    if (r.ok) {
      toast({
        title: `Booked: ${se.name}, ${fmtDowTime(se.start)}`,
        action: {
          label: "Undo",
          onClick: () => {
            cancelBooking(r.booking.id, { undoWindow: true })
            announce("Booking undone.")
          },
        },
      })
      announce(`Booked ${se.name}, ${fmtDowTime(se.start)}`)
      onBooked?.(r.booking)
    } else if (r.code === "CONFLICT_OVERLAP") setClash(r.conflict)
    else if (r.code === "CLASS_FULL") {
      toast({
        type: "error",
        title: r.message,
        action: { label: "Join waitlist", onClick: () => setWl(true) },
      })
      announce(r.message)
    } else {
      toast({ type: "error", title: r.message })
      announce(r.message)
    }
  }
  const dialogs = (
    <>
      <WaitlistDialog se={se} forId={who} open={wl} onOpenChange={setWl} />
      <ConflictDialog
        se={se}
        clash={clash}
        open={!!clash}
        onOpenChange={(o) => !o && setClash(undefined)}
        onReplace={() => void doBook(clash!.id)}
      />
      {st.booking ? (
        <CancelDialog
          booking={st.booking}
          open={cancel}
          onOpenChange={setCancel}
        />
      ) : null}
    </>
  )
  const reason =
    (showReason || bar) &&
    st.reason &&
    !["booked", "late-cancel", "book"].includes(st.state)
      ? st.reason
      : null
  const note = st.state === "book" && st.dropIn ? st.reason : null
  const linkEl = st.link ? (
    st.link.href ? (
      <Link href={st.link.href} className="text-link text-detail underline">
        {st.link.label}
      </Link>
    ) : (
      <button
        type="button"
        className="text-link min-h-6 text-detail underline"
        onClick={() => {
          if (st.link?.action === "remind") {
            addRemind(se.id)
            toast({
              title: "We'll remind you",
              description: `A push at 5:55 a.m. on ${fmtDay(st.opens ?? now)}.`,
            })
          } else if (st.link?.action === "resume") router.push("/membership")
          else if (st.link?.action === "update-card") openDialog("card")
          else if (st.link?.action === "ask-parent")
            openDialog("askParent", se.id)
        }}
      >
        {st.link.label}
      </button>
    )
  ) : null
  const wrapReason = (btnEl: React.ReactNode) => (
    <div
      className={cn(
        "flex flex-col gap-1",
        bar ? "items-end text-right" : "items-stretch"
      )}
    >
      {btnEl}
      {reason || note ? (
        <p className="text-detail text-muted-foreground">{reason ?? note}</p>
      ) : null}
      {linkEl}
      {dialogs}
    </div>
  )

  if (pending)
    return wrapReason(
      <Button className={btn} disabled aria-busy aria-label={`Booking ${name}`}>
        <Loader2
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
          data-icon="inline-start"
        />
        Booking…
      </Button>
    )
  switch (st.state) {
    case "book":
      return wrapReason(
        // Offline, the button stays focusable so keyboard and pointer users can reach the hint.
        <Tip content={offline ? "Reconnect to do this" : undefined}>
          <Button
            variant={featured ? "primary" : "outline"}
            className={btn}
            aria-label={`Book ${name}`}
            disabled={offline}
            focusableWhenDisabled={offline}
            onClick={() => void doBook()}
          >
            Book
          </Button>
        </Tip>
      )
    case "waitlist":
      return wrapReason(
        <Button
          variant="outline"
          className={cn(btn, "text-link")}
          aria-label={`Join waitlist for ${name}, ${waitCount(s, se)} waiting`}
          disabled={offline}
          onClick={() => setWl(true)}
        >
          Join waitlist
        </Button>
      )
    case "hold": {
      const left = (st.booking?.holdExpiresAt ?? 0) - now
      return wrapReason(
        <div className="flex flex-col gap-1">
          <Button
            className={btn}
            aria-label={`Confirm spot, ${Math.ceil(left / 60000)} minutes left`}
            onClick={() => {
              const r = confirmHold(st.booking!.id)
              if (r.ok) announce("Spot confirmed. You're booked.")
              else toast({ type: "error", title: r.message })
            }}
          >
            Confirm spot · <span className="num">{fmtCountdown(left)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              releaseHold(st.booking!.id)
              toast({
                title: "Released",
                description: "You're off the waitlist for this class.",
              })
            }}
          >
            Release
          </Button>
        </div>
      )
    }
    case "booked":
    case "late-cancel": {
      const late = st.state === "late-cancel"
      if (bar)
        return (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-label">
              <Check className="size-5 text-success" aria-hidden="true" />
              Booked
            </span>
            <Button
              variant="outline"
              className="min-h-12"
              onClick={() => setCancel(true)}
            >
              {late ? "Cancel (late)" : "Cancel"}
            </Button>
            {dialogs}
          </div>
        )
      return wrapReason(
        <Menu.Root>
          <Menu.Trigger
            aria-label={`Booked. ${name}. Manage booking`}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-card px-4 text-label edge ring-input hover:ring-input-hover",
              btn
            )}
          >
            {late ? (
              <TriangleAlert
                className="size-4 text-warning"
                aria-hidden="true"
              />
            ) : (
              <Check className="size-4 text-success" aria-hidden="true" />
            )}
            Booked
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={6}>
              <Menu.Popup className="!min-w-52">
                <Menu.Item render={<Link href={`/schedule/${se.id}`} />}>
                  Details
                </Menu.Item>
                <Menu.Item
                  render={
                    <a
                      href={googleUrl(calEventFor(se))}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  Add to Google Calendar
                </Menu.Item>
                <Menu.Item onClick={() => downloadIcs(calEventFor(se))}>
                  Add to Apple or Outlook (.ics)
                </Menu.Item>
                <Menu.Item
                  className={late ? "!text-warning" : ""}
                  onClick={() => setCancel(true)}
                >
                  {late ? "Cancel (late)" : "Cancel booking"}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )
    }
    case "waitlisted":
      return wrapReason(
        <Menu.Root>
          <Menu.Trigger
            aria-label={`On waitlist, position ${st.booking?.position}. ${name}. Manage`}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-md bg-card px-4 text-label edge ring-input hover:ring-input-hover",
              btn
            )}
          >
            On waitlist{" "}
            <span className="ml-1 num">#{st.booking?.position}</span>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={6}>
              <Menu.Popup>
                <Menu.Item
                  onClick={() => {
                    const id = st.booking!.id
                    leaveWaitlist(id)
                    toast({
                      title: "You left the waitlist",
                      action: {
                        label: "Undo",
                        onClick: () => rejoinWaitlist(id),
                      },
                    })
                  }}
                >
                  Leave waitlist
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      )
    case "full":
    case "paused":
    case "started":
    case "restricted": {
      const lock = st.state === "restricted"
      return wrapReason(
        <Button
          variant="outline"
          aria-disabled="true"
          className={cn(
            btn,
            "cursor-not-allowed bg-muted !text-muted-foreground opacity-90 hover:!bg-muted"
          )}
          aria-label={`${st.label}. ${name}. ${st.reason ?? ""}`}
          onClick={(e) => e.preventDefault()}
        >
          {lock ? <Lock aria-hidden="true" data-icon="inline-start" /> : null}
          {st.label}
        </Button>
      )
    }
    default:
      return wrapReason(
        <Button variant="outline" className={btn} onClick={() => void doBook()}>
          <X aria-hidden="true" data-icon="inline-start" />
          Try again
        </Button>
      )
  }
}
void AddToCalendar
void fmtRange
