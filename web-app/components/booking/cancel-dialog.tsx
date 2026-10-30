"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { XCircle } from "@/components/icons"
import { Confirm } from "@/components/kit/overlays"
import { FormField, LateCancelMeter, RadioList } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cancelBooking, undoCancel } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { sessionsForDay } from "@/lib/data/sessions"
import { activeStrikes } from "@/lib/engine"
import {
  addDays,
  DAY,
  fmtDay,
  fmtDayShort,
  fmtDayTime,
  fmtDowTime,
  fmtTime,
  HOUR,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking } from "@/lib/types"

const REASONS = [
  { value: "schedule", label: "Schedule changed" },
  { value: "unwell", label: "Feeling unwell" },
  { value: "injury", label: "Injury" },
  { value: "mistake", label: "Booked by mistake" },
  { value: "other", label: "Other" },
]

// On-time cancel and late cancel (strike) in one stacked dialog: consequence first, safe button first.
export function CancelDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { s, now } = useApp()
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [other, setOther] = useState("")
  const [busy, setBusy] = useState(false)
  const isKids = booking.kind === "kids"
  const late =
    !isKids && booking.start - now < (booking.kind === "pt" ? 24 : 2) * HOUR
  const strikes = activeStrikes(s, booking.memberId, now)
  const next = strikes.length + 1
  const willPause = late && booking.kind !== "pt" && next >= 3
  const freeUntil = booking.start - (booking.kind === "pt" ? 24 : 2) * HOUR
  const clears = (strikes[0]?.at ?? now) + 30 * DAY
  // other sessions of the same class this week, for "Reschedule instead"
  const alt = booking.sessionId
    ? Array.from({ length: 7 }, (_, i) =>
        sessionsForDay(booking.clubSlug, addDays(now, i + 0))
      )
        .flat()
        .filter(
          (x) =>
            x.name === booking.title &&
            x.start > now &&
            x.id !== booking.sessionId
        )
    : []
  const title = isKids
    ? `Cancel ${s.members[booking.memberId].firstName}'s kids club block?`
    : late
      ? "This is a late cancel"
      : `Cancel your spot in ${booking.title}?`
  const kidsSiblings = isKids
    ? s.bookings.filter(
        (b) =>
          b.kind === "kids" &&
          b.ref === booking.ref &&
          b.start === booking.start &&
          b.status === "booked"
      )
    : []
  const doCancel = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 250))
    const ids = isKids ? kidsSiblings.map((b) => b.id) : [booking.id]
    let last: ReturnType<typeof cancelBooking> | undefined
    for (const id of ids) last = cancelBooking(id, { reason })
    setBusy(false)
    onOpenChange(false)
    if (last?.ok) {
      if (last.late) {
        toast({
          title: `Cancelled. ${last.strikeCount} late ${last.strikeCount === 1 ? "cancel" : "cancels"} in 30 days.`,
          description: last.paused
            ? `Booking is paused until ${fmtDayTime(last.pauseUntil!)}`
            : `The next one clears on ${fmtDayShort(last.clears!)}.`,
        })
        announce(`Cancelled. ${last.strikeCount} late cancels in 30 days.`)
      } else {
        toast({
          title: `Cancelled: ${booking.title}, ${fmtDowTime(booking.start)}`,
          action: {
            label: "Undo",
            onClick: () => {
              const u = undoCancel(booking.id)
              if (!u.ok) toast({ type: "error", title: u.message })
            },
          },
        })
        announce(`Cancelled ${booking.title}.`)
      }
    }
  }
  return (
    <Confirm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        isKids
          ? "It's free. Please cancel at least 2 hours before so another family can use the spots."
          : late
            ? `Cancelling now adds 1 late cancel to your account. ${booking.title}, ${fmtDowTime(booking.start)}`
            : `${booking.title}, ${fmtDowTime(booking.start)} You can cancel for free until ${fmtTime(freeUntil)} You can rebook until it fills.`
      }
    >
      {late && !isKids ? (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2 text-body">
            {booking.kind === "pt" ? (
              <li className="flex gap-2">
                <XCircle
                  className="mt-0.5 size-5 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                This session counts as used (free to move until 24 hours
                before).
              </li>
            ) : (
              <>
                <li className="flex gap-2">
                  <XCircle
                    className="mt-0.5 size-5 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                  Counts as a strike ({next} of 3 in 30 days)
                </li>
                {booking.sessionId ? (
                  <li className="flex gap-2">
                    <XCircle
                      className="mt-0.5 size-5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    Your spot goes to the next person on the waitlist
                  </li>
                ) : null}
                <li className="flex gap-2">
                  <XCircle
                    className="mt-0.5 size-5 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                  3 strikes in 30 days pause booking for 3 days
                </li>
                {willPause ? (
                  <li className="flex gap-2">
                    <XCircle
                      className="mt-0.5 size-5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    This is your 3rd late cancel. Booking pauses until{" "}
                    {fmtDay(now + 3 * DAY)}. You can still cancel bookings and
                    check in.
                  </li>
                ) : null}
              </>
            )}
          </ul>
          {booking.kind !== "pt" ? (
            <div className="flex items-center gap-3">
              <LateCancelMeter count={Math.min(3, next)} />
              <span className="text-caption">
                Strike {next} of 3. This one clears on{" "}
                {fmtDayShort(strikes.length ? clears : now + 30 * DAY)}.
              </span>
            </div>
          ) : null}
        </div>
      ) : !isKids ? (
        <RadioList
          label="Why? (optional)"
          value={reason}
          onChange={setReason}
          options={REASONS}
        />
      ) : null}
      {!late && reason === "other" ? (
        <FormField label="Tell us more (optional)">
          {(p) => (
            <Input
              {...p}
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          )}
        </FormField>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          {isKids ? "Keep my spot" : "Keep my spot"}
        </Button>
        {alt.length ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onOpenChange(false)
              router.push(
                `/schedule?series=${booking.sessionId?.split("~")[3]}&club=${booking.clubSlug}`
              )
            }}
          >
            Reschedule instead
          </Button>
        ) : null}
        <Button
          variant="ghost"
          loading={busy}
          className="w-full !text-destructive hover:!bg-danger-subtle"
          onClick={() => void doCancel()}
        >
          {willPause ? "Cancel and pause booking" : "Cancel booking"}
        </Button>
      </div>
    </Confirm>
  )
}
