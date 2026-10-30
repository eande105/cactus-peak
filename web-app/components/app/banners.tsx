"use client"
import Link from "next/link"
import { useApp } from "@/components/app/use-app"
import { Pause, WifiOff } from "@/components/icons"
import { Collapse } from "@/components/kit/collapse"
import { Banner } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  cancelFreeze,
  keepMembership,
  retryPayment,
  undoPlanChange,
} from "@/lib/actions"
import { PLANS } from "@/lib/data/catalog"
import { householdMonthly, pausedUntil, paymentDaysLate } from "@/lib/engine"
import {
  DAY,
  fmtDay,
  fmtDayShort,
  fmtDayTime,
  fmtMoney,
  fmtTime,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import { openDialog, setOfflineDemo } from "@/lib/ui-state"

// One banner at a time, highest priority first (payment, pause, freeze, offline, ending, plan change).
export function PaymentBanners({
  offline,
  path = "",
}: {
  offline: boolean
  path?: string
}) {
  const node = useBannerNode(offline, path)
  return <Collapse show={!!node}>{node}</Collapse>
}

function useBannerNode(offline: boolean, path: string) {
  const { s, me, hh, now } = useApp()
  const wrap = (node: React.ReactNode) => (
    <div className="px-4 pt-2 md:px-6 md:pt-3 lg:px-8">{node}</div>
  )
  const late = paymentDaysLate(s, me.id, now)
  const ownsPayment =
    path.startsWith("/billing") || path === "/membership/freeze"
  if (late >= 0 && !ownsPayment) {
    const due = hh.paymentFailedAt ?? now
    if (me.role !== "primary")
      return wrap(
        <Banner
          tone="danger"
          title={`${s.members[hh.primaryId].firstName} needs to update the payment card.`}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast({
                  title: `Reminder sent to ${s.members[hh.primaryId].firstName}`,
                })
              }
            >
              Remind {s.members[hh.primaryId].firstName}
            </Button>
          }
        />
      )
    const left = Math.max(0, 7 - late)
    return wrap(
      <Banner
        tone={late >= 6 ? "danger" : "warning"}
        title={`Your ${fmtDayShort(due)} payment didn't go through.`}
        actions={
          <>
            <Button size="sm" onClick={() => openDialog("card")}>
              Update card
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="max-md:hidden"
              onClick={() => {
                const r = retryPayment()
                if (r.ok)
                  toast({
                    title: "Paid. Your membership is active.",
                    description: `${fmtMoney(r.amount)} · Visa ending ${hh.card.last4}`,
                  })
              }}
            >
              Try card again
            </Button>
          </>
        }
      >
        Update your card to keep booking.{" "}
        {late >= 8
          ? "New bookings are paused. Your bookings are safe."
          : `You have ${left} ${left === 1 ? "day" : "days"} of full access left.`}
      </Banner>
    )
  }
  if (late >= 0 && ownsPayment) return null
  const pu = pausedUntil(s, me.id, now)
  if (pu)
    return wrap(
      <Banner
        tone="warning"
        title={`Booking is paused until ${fmtDayTime(pu)}`}
      >
        You have 3 late cancels in 30 days. You can still check in and cancel.{" "}
        <Link href="/help" className="underline">
          How late cancels work
        </Link>
      </Banner>
    )
  if (hh.status === "freeze_scheduled" && hh.freeze && me.role === "primary")
    return wrap(
      <Banner
        tone="neutral"
        icon={Pause}
        title={`Freeze scheduled: ${fmtDayShort(hh.freeze.start)} – ${fmtDayShort(hh.freeze.end)}`}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              cancelFreeze()
              toast({
                title: "Freeze cancelled",
                description: "You're active as usual.",
              })
            }}
          >
            Cancel freeze
          </Button>
        }
      />
    )
  if (hh.status === "frozen" && hh.freeze)
    return wrap(
      <Banner
        tone="neutral"
        icon={Pause}
        title={`Your membership is frozen until ${fmtDay(hh.freeze.resume - DAY)}. See you ${fmtDay(hh.freeze.resume)}.`}
        actions={
          me.role === "primary" ? (
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/membership" />}
            >
              Manage freeze
            </Button>
          ) : undefined
        }
      />
    )
  if (offline)
    return wrap(
      <Banner
        tone="neutral"
        icon={WifiOff}
        title="You're offline. Showing what we saved. Booking is off until you're back."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOfflineDemo(false)}
          >
            Try again
          </Button>
        }
      >
        Saved {fmtTime(now)}
      </Banner>
    )
  if (hh.status === "cancel_scheduled" && hh.cancelOn && me.role === "primary")
    return wrap(
      <Banner
        tone="warning"
        title={`Membership ends ${fmtDay(hh.cancelOn)}.`}
        actions={
          <Button
            size="sm"
            onClick={() => {
              keepMembership()
              toast({
                title: "Welcome back",
                description: "Your membership continues.",
              })
            }}
          >
            Keep membership
          </Button>
        }
      >
        You keep full access until then.
      </Banner>
    )
  if (hh.pendingPlan && me.role === "primary")
    return wrap(
      <Banner
        tone="neutral"
        title={`Changing to ${PLANS[hh.pendingPlan.plan].name} on ${fmtDayShort(hh.pendingPlan.on)}.`}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              undoPlanChange()
              toast({
                title: "Change undone",
                description: `You stay on ${PLANS[hh.plan].name}.`,
              })
            }}
          >
            Undo change
          </Button>
        }
      >
        Next charge{" "}
        {fmtMoney(householdMonthly(s, hh, hh.pendingPlan.plan).total)}.
      </Banner>
    )
  return null
}
