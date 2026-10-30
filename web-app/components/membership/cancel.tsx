"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StepUp } from "@/components/app/step-up"
import { useApp } from "@/components/app/use-app"
import { CircleCheck } from "@/components/icons"
import {
  FormField,
  LoadingBlock,
  PageHeader,
  RadioList,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cancelDate, keepMembership, scheduleCancel } from "@/lib/actions"
import { announce } from "@/lib/announce"
import {
  householdMonthly,
  nextBillingDate,
  paymentDaysLate,
} from "@/lib/engine"
import { fmtDay, fmtDayShort, fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"

const REASONS = [
  { value: "price", label: "Too expensive" },
  { value: "moving", label: "Moving" },
  { value: "injury", label: "Injury or health" },
  { value: "unused", label: "I'm not using it" },
  { value: "schedule", label: "Schedule doesn't fit" },
  { value: "club", label: "Another club" },
  { value: "other", label: "Other" },
]
const OFFER: Record<string, string[]> = {
  price: [
    "Trailhead is $54 per month and covers one home club.",
    "Or freeze for $10 per month, 1 to 3 months.",
  ],
  injury: [
    "Freeze for $10 per month while you recover. Your streak and plan stay.",
  ],
  moving: ["Moving to another club? Ridge covers all 5 clubs."],
  unused: ["Freeze for $10 per month. We'll remind you 7 days before it ends."],
  schedule: [
    "Try a new time. These classes have spots this week: Climb Cycle, Desert Flow Yoga, Switchback HIIT.",
  ],
}

export default function CancelPage() {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState("")
  const [other, setOther] = useState("")
  const [done, setDone] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])
  if (me.role !== "primary") return null
  if (loading) return <LoadingBlock text="Loading…" rows={3} />
  const on = cancelDate(hh, now)
  const total = householdMonthly(s, hh).total
  const late = paymentDaysLate(s, me.id, now) >= 0
  const offer = OFFER[reason]
  const saving =
    householdMonthly(s, hh).total - householdMonthly(s, hh, "trailhead").total
  const next = nextBillingDate(hh, now)
  const doCancel = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    const r = scheduleCancel(reason)
    setBusy(false)
    if (r.ok) {
      setDone(r.on)
      announce(`Your membership ends ${fmtDay(r.on)}.`)
    }
  }
  if (done || hh.status === "cancel_scheduled")
    return (
      <div className="flex max-w-[640px] flex-col items-start gap-4">
        <CircleCheck className="size-10 text-success" aria-hidden="true" />
        <h1
          id="page-title"
          tabIndex={-1}
          className="font-heading text-h1 display-stretch outline-none"
        >
          Your membership ends {fmtDay(done ?? hh.cancelOn!)}
        </h1>
        <p className="text-body">
          You keep full access until then. We emailed your receipt.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Visit history downloaded",
                description: "visits.csv",
              })
            }
          >
            Download my visit history (CSV)
          </Button>
          <Button
            onClick={() => {
              keepMembership()
              toast({
                title: "Welcome back",
                description: "Your membership continues.",
              })
              router.push("/membership")
            }}
          >
            Changed your mind? Keep my membership
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">
          You can sign in for 90 days after to download invoices and reactivate.
        </p>
      </div>
    )
  return (
    <div className="flex max-w-[640px] flex-col gap-6">
      <StepUp />
      <PageHeader
        backHref="/membership"
        backLabel="Membership"
        title="Cancel membership"
      />
      <div className="flex flex-col gap-2">
        <p role="status" className="text-caption text-muted-foreground">
          Step {step} of 3
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-night dark:bg-on-night"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-h3 display-stretch">
            Before you go, tell us why. It&apos;s optional.
          </h2>
          <RadioList
            label="Why are you leaving?"
            value={reason}
            onChange={setReason}
            options={REASONS}
          />
          {reason === "other" ? (
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
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(offer ? 2 : 3)}>
              Skip
            </Button>
            <Button onClick={() => setStep(offer ? 2 : 3)}>Continue</Button>
          </div>
        </div>
      ) : null}
      {step === 2 && offer ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-h3 display-stretch">Options</h2>
          <ul className="flex flex-col rule-rows">
            {offer.map((o) => (
              <li key={o} className="py-3 text-body">
                {reason === "price" &&
                o.startsWith("Trailhead") &&
                hh.plan !== "trailhead" &&
                saving > 0
                  ? `Trailhead is $54 per month and covers one home club. That is ${fmtMoney(saving, false)} a month less than your ${fmtMoney(householdMonthly(s, hh).total, false)} today.`
                  : o}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {reason === "price" ? (
              <Button
                variant="outline"
                render={<Link href="/membership/change-plan" />}
              >
                Switch to Trailhead
              </Button>
            ) : null}
            {["price", "injury", "unused"].includes(reason) ? (
              <Button
                variant="outline"
                render={<Link href="/membership/freeze" />}
              >
                Freeze instead
              </Button>
            ) : null}
          </div>
          <p className="text-caption text-muted-foreground">
            No pressure. You can still cancel.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="w-full"
              render={<Link href="/membership" />}
            >
              Keep my membership
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setStep(3)}
            >
              Continue to cancel
            </Button>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-h2 display-stretch">
            Cancel your membership?
          </h2>
          <p className="text-body">
            Your membership ends on {fmtDay(on)}. You keep full access until
            then.
          </p>
          <ul className="flex flex-col text-body rule-rows">
            {[
              `Last charge: ${fmtDayShort(next)} · ${fmtMoney(total)}. No annual fee in March.`,
              "Family members end on the same date.",
              "Unused training sessions are refunded at the price you paid per session.",
              `Guest passes and bookings after ${fmtDayShort(on)} are cancelled with no late-cancel strike.`,
              "Your visit history is available to download.",
            ].map((x) => (
              <li key={x} className="py-2.5">
                {x}
              </li>
            ))}
          </ul>
          {late ? (
            <p className="rounded-md bg-warning-subtle p-3 text-caption">
              You owe {fmtMoney(total)} from{" "}
              {fmtDayShort(hh.paymentFailedAt ?? now)}. Pay it to close your
              account.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              render={<Link href="/membership" />}
            >
              Keep my membership
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="w-full"
              loading={busy}
              onClick={() => void doCancel()}
            >
              Cancel membership
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
