"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StepUp } from "@/components/app/step-up"
import { useApp } from "@/components/app/use-app"
import { SuccessPanel } from "@/components/booking/success-panel"
import { Pause } from "@/components/icons"
import {
  Banner,
  EmptyState,
  LoadingBlock,
  PageHeader,
  Segmented,
  SelectBox,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { cancelFreeze, scheduleFreeze } from "@/lib/actions"
import { announce } from "@/lib/announce"
import {
  billingDatesFrom,
  householdMembers,
  householdMonthly,
  paymentDaysLate,
} from "@/lib/engine"
import {
  DAY,
  fmtDay,
  fmtDayShort,
  fmtDowTime,
  fmtMoney,
  parts,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import { openDialog } from "@/lib/ui-state"

export default function FreezePage() {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [months, setMonths] = useState<1 | 2 | 3>(1)
  const dates = billingDatesFrom(hh, now + 30 * DAY, 4)
  const [start, setStart] = useState(String(dates[0]))
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  if (me.role !== "primary") return null
  if (loading) return <LoadingBlock text="Loading…" rows={3} />
  const st = Number(start)
  const p = parts(st)
  const resume = Date.UTC(p.y, p.m + months, p.d, 7, 0)
  const end = resume - DAY
  const total = householdMonthly(s, hh).total
  const ids = householdMembers(s, hh.id).map((m) => m.id)
  const affected = s.bookings.filter(
    (b) =>
      ids.includes(b.memberId) &&
      ["booked", "waitlisted"].includes(b.status) &&
      b.start >= st &&
      b.start < resume
  )
  if (hh.status === "freeze_scheduled" && hh.freeze && !done)
    return (
      <div>
        <PageHeader
          backHref="/membership"
          backLabel="Membership"
          title="Freeze membership"
        />
        <Banner
          tone="neutral"
          icon={Pause}
          title={`You already have a freeze scheduled: ${fmtDayShort(hh.freeze.start)} – ${fmtDayShort(hh.freeze.end)}`}
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
      </div>
    )
  if (hh.status === "frozen" && !done)
    return (
      <div>
        <PageHeader
          backHref="/membership"
          backLabel="Membership"
          title="Freeze membership"
        />
        <EmptyState
          object="key"
          title="You're frozen right now."
          body="Resume from Membership if you want to book again."
          action={
            <Button render={<Link href="/membership" />}>
              Back to Membership
            </Button>
          }
        />
      </div>
    )
  const blocked = paymentDaysLate(s, me.id, now) >= 0
  const confirm = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    const r = scheduleFreeze(months, st)
    setBusy(false)
    if (r.ok) {
      setDone(true)
      announce(`Freeze set: ${fmtDayShort(st)} to ${fmtDayShort(end)}.`)
    } else setError(r.message)
  }
  if (done)
    return (
      <div className="max-w-[560px]">
        <SuccessPanel
          headline={`Freeze set: ${fmtDayShort(st)} – ${fmtDayShort(end)}`}
          pill="Freeze scheduled"
          summary={[
            {
              label: "Length",
              value: `${months} ${months === 1 ? "month" : "months"} · ${fmtMoney(10 * months)}`,
            },
            { label: "Starts", value: fmtDay(st) },
            { label: "Resumes", value: fmtDay(resume) },
            {
              label: "Normal price after",
              value: `${fmtMoney(total)} per month`,
            },
          ]}
          rows={[{ label: "Back to membership", href: "/membership" }]}
          extra={
            <p className="text-caption text-muted-foreground">
              You can cancel it any time before {fmtDay(st)}.{" "}
              <button
                type="button"
                className="text-link underline"
                onClick={() => {
                  cancelFreeze()
                  toast({
                    title: "Freeze cancelled",
                    description: "You're active as usual.",
                  })
                  router.push("/membership")
                }}
              >
                Cancel freeze
              </button>
            </p>
          }
          onDone={() => router.push("/membership")}
        />
      </div>
    )
  const summary = (
    <aside
      aria-label="Freeze summary"
      className="flex flex-col gap-1 rounded-lg bg-muted p-4 text-caption"
    >
      <p className="eyebrow text-muted-foreground">Freeze summary</p>
      <p className="num text-body-strong">
        {months} {months === 1 ? "month" : "months"} · {fmtMoney(10 * months)}
      </p>
      <p className="num">
        Starts {fmtDayShort(st)} · resumes {fmtDayShort(resume)}
      </p>
      <p className="num text-muted-foreground">
        Normal price after: {fmtMoney(total)} per month
      </p>
    </aside>
  )
  return (
    <div className="flex flex-col gap-6">
      <StepUp />
      <PageHeader
        backHref="/membership"
        backLabel="Membership"
        title="Freeze membership"
        description="Pause for 1 to 3 months at $10 per month."
      />
      {blocked ? (
        <p role="status" className="text-caption font-semibold text-warning">
          Card declined. Update your card to freeze.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => openDialog("card")}
          >
            Update card
          </button>
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,640px)_320px]">
        <div className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-label">How long?</p>
                <Segmented
                  label="Length"
                  value={months}
                  onChange={setMonths}
                  options={[
                    { value: 1, label: "1 month" },
                    { value: 2, label: "2 months" },
                    { value: 3, label: "3 months" },
                  ]}
                />
              </div>
              <SelectBox
                label="Start on"
                value={start}
                onChange={setStart}
                options={dates.map((d) => ({
                  value: String(d),
                  label: fmtDay(d),
                }))}
                className="max-w-xs"
              />
              <p className="text-caption text-muted-foreground">
                We need 30 days&apos; notice, so the earliest start is{" "}
                {fmtDayShort(dates[0])}.
              </p>
              <p className="rounded-md bg-muted px-4 py-3 num text-body">
                Frozen {fmtDayShort(st)} – {fmtDayShort(end)}. Resumes{" "}
                {fmtDayShort(resume)}. You pay $10 per month while frozen.
              </p>
              <p className="text-caption text-muted-foreground">
                Need to freeze sooner?{" "}
                <Link href="/inbox" className="text-link underline">
                  Message the front desk
                </Link>
                .
              </p>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-h3 display-stretch">
                What changes
              </h2>
              <dl className="rule-rows">
                {[
                  ["Pass", "Your pass pauses for everyone on your plan."],
                  [
                    "Bookings",
                    affected.length
                      ? "Bookings inside the freeze are cancelled with no late-cancel strike."
                      : "You have no bookings in this time.",
                  ],
                  [
                    "Kids club, courts, lanes",
                    "Reservations in this time are cancelled.",
                  ],
                  [
                    "Guest passes",
                    "Guest passes pause. Passes you sent for these dates are cancelled and returned.",
                  ],
                  [
                    "Training",
                    "Sessions in this time are cancelled. Your credits come back and your pack dates move out by the length of the freeze.",
                  ],
                  [
                    "Billing",
                    `You pay $10.00 on ${fmtDayShort(st)}. Your normal price of ${fmtMoney(total)} returns on ${fmtDayShort(resume)}.`,
                  ],
                  ["Family", "The freeze applies to everyone on your plan."],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]"
                  >
                    <dt className="text-label">{k}</dt>
                    <dd className="text-body text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              {affected.length ? (
                <ul className="rounded-md bg-muted p-3 text-caption">
                  {affected.slice(0, 6).map((b) => (
                    <li key={b.id} className="py-0.5 num">
                      {fmtDowTime(b.start)} · {b.title} ·{" "}
                      {s.members[b.memberId].firstName} (will be cancelled)
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {step === 3 ? (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-h3 display-stretch">
                Freeze your membership?
              </h2>
              <p className="text-caption text-muted-foreground">
                {hh.card.brand[0].toUpperCase() + hh.card.brand.slice(1)} ending{" "}
                {hh.card.last4}
              </p>
              <p className="num text-body">
                Your plan pauses {fmtDayShort(st)} and returns{" "}
                {fmtDayShort(resume)} at {fmtMoney(total)} per month.
              </p>
              {error ? (
                <p
                  role="alert"
                  className="text-caption font-semibold text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <Button
                size="lg"
                className="w-full"
                loading={busy}
                disabled={blocked}
                onClick={() => void confirm()}
              >
                Freeze membership
              </Button>
              <Button
                variant="link"
                className="self-start"
                render={<Link href="/membership" />}
              >
                Not now
              </Button>
            </div>
          ) : null}
          {step < 3 ? (
            <div className="flex gap-3 pt-4 rule-t">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <Button variant="outline" render={<Link href="/membership" />}>
                  Cancel
                </Button>
              )}
              <Button disabled={blocked} onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            </div>
          ) : (
            <div className="pt-4 rule-t">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
            </div>
          )}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">{summary}</div>
      </div>
    </div>
  )
}
