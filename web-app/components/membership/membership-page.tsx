"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Collapsible } from "@/components/graphical"
import { Check, ChevronDown, Pause, X } from "@/components/icons"
import { Confirm } from "@/components/kit/overlays"
import {
  Banner,
  LoadingBlock,
  PageHeader,
  SectionTitle,
  StatusPill,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  cancelFreeze,
  keepMembership,
  resumeCost,
  resumeEarly,
  undoPlanChange,
} from "@/lib/actions"
import { CLUB_BY_SLUG, PLANS } from "@/lib/data/catalog"
import {
  householdMonthly,
  nextBillingDate,
  paymentDaysLate,
} from "@/lib/engine"
import { DAY, fmtDateFull, fmtDay, fmtDayShort, fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"

export default function MembershipPage() {
  const { s, me, hh, now } = useApp()
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  if (loading) return <LoadingBlock text="Loading your membership…" rows={4} />
  const plan = PLANS[hh.plan]
  const money = householdMonthly(s, hh)
  const next = nextBillingDate(hh, now)
  const primary = me.role === "primary"
  const late = paymentDaysLate(s, me.id, now)
  const pill =
    hh.status === "frozen" ? (
      <StatusPill tone="neutral" icon={Pause}>
        Frozen
      </StatusPill>
    ) : hh.status === "freeze_scheduled" ? (
      <StatusPill tone="neutral" icon={Pause}>
        Freeze scheduled
      </StatusPill>
    ) : late >= 0 ? (
      <StatusPill tone="danger">Payment failed</StatusPill>
    ) : hh.status === "cancel_scheduled" ? (
      <StatusPill tone="warning">Ends {fmtDayShort(hh.cancelOn!)}</StatusPill>
    ) : hh.pendingPlan ? (
      <StatusPill tone="neutral">
        Changing on {fmtDayShort(hh.pendingPlan.on)}
      </StatusPill>
    ) : (
      <StatusPill tone="success" icon={Check}>
        Active
      </StatusPill>
    )
  const rc = resumeCost(s, hh, now)
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Membership"
        description={
          primary
            ? "One view of your plan, status and every plan action."
            : `Managed by ${s.members[hh.primaryId].firstName}.`
        }
      />
      {hh.status === "freeze_scheduled" && hh.freeze && primary ? (
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
        >
          Resumes {fmtDayShort(hh.freeze.resume)}.
        </Banner>
      ) : null}
      {hh.status === "frozen" && hh.freeze && primary ? (
        <Banner
          tone="neutral"
          icon={Pause}
          title={`Frozen until ${fmtDay(hh.freeze.resume - DAY)}`}
          actions={
            <Button size="sm" onClick={() => setResume(true)}>
              Resume early
            </Button>
          }
        >
          Your pass and bookings pause until {fmtDay(hh.freeze.resume)}.
        </Banner>
      ) : null}
      {hh.status === "cancel_scheduled" && hh.cancelOn && primary ? (
        <Banner
          tone="warning"
          title={`Membership ends ${fmtDay(hh.cancelOn)}`}
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
              Keep my membership
            </Button>
          }
        >
          You keep full access until then.
        </Banner>
      ) : null}
      {hh.pendingPlan && primary ? (
        <Banner
          tone="neutral"
          title={`Changing to ${PLANS[hh.pendingPlan.plan].name} on ${fmtDayShort(hh.pendingPlan.on)}`}
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                undoPlanChange()
                toast({ title: "Change undone" })
              }}
            >
              Undo change
            </Button>
          }
        />
      ) : null}
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="yp" className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p id="yp" className="eyebrow text-muted-foreground">
              Your plan
            </p>
            {pill}
          </div>
          <h2 className="font-heading text-display leading-none display-stretch">
            {plan.name}
          </h2>
          <p className="num text-body">
            <span className="text-body-strong">
              {fmtMoney(plan.price, false)} per month
            </span>
            {primary && money.adults + money.kids > 0 ? (
              <>
                {" "}
                + family add-ons{" "}
                {fmtMoney(money.adultTotal + money.kidTotal, false)} per month
              </>
            ) : null}
          </p>
          {primary ? (
            <p className="num text-body">
              Next charge: {fmtDayShort(next)} · {fmtMoney(money.total)}
            </p>
          ) : (
            <p className="num text-body">Renews {fmtDayShort(next)}</p>
          )}
          <p className="text-caption text-muted-foreground">
            Home club: {CLUB_BY_SLUG[me.homeClub].name} · Member since{" "}
            {fmtDateFull(hh.memberSince)}
          </p>
          {primary ? (
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/membership/change-plan" />}>
                Change plan
              </Button>
              <Button
                variant="outline"
                render={<Link href="/membership/freeze" />}
              >
                Freeze membership
              </Button>
            </div>
          ) : null}
        </section>
        <section
          aria-labelledby="inc"
          className="flex flex-col gap-3 lg:border-l lg:border-border lg:pl-10"
        >
          <h2 id="inc" className="eyebrow text-muted-foreground">
            Included
          </h2>
          <ul className="flex flex-col rule-rows">
            {plan.perks.map((p) => (
              <li key={p} className="flex items-center gap-3 py-2.5 text-body">
                <Check className="size-4 text-success" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </section>
      </div>
      {primary ? (
        <section aria-labelledby="fees">
          <SectionTitle id="fees">Fees</SectionTitle>
          <ul className="mt-2 max-w-xl text-body rule-rows">
            {[
              "Annual facility fee: $49, charged in March.",
              "Enrollment: $0 during Fall climb.",
              "Freeze: $10 per month, 1–3 months.",
              "Cancel: 30 days' notice.",
            ].map((x) => (
              <li key={x} className="py-2.5">
                {x}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {hh.plan !== "summit" && primary ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-night px-6 py-5 text-on-night">
          <p className="max-w-[48ch] font-heading text-h3 display-stretch">
            Summit adds the recovery suite, 9-day booking and 4 guest passes.
          </p>
          <Button
            className="!bg-dawn !text-night hover:!bg-on-night"
            render={<Link href="/membership/change-plan" />}
          >
            Compare plans
          </Button>
        </section>
      ) : null}
      {primary && hh.status !== "cancel_scheduled" ? (
        <Collapsible.Root className="max-w-xl pt-4 rule-t">
          <Collapsible.Trigger className="group flex min-h-11 w-full items-center justify-between !bg-transparent !p-0 text-label text-destructive !shadow-none">
            Cancel membership
            <ChevronDown
              className="size-4 transition-transform group-data-[panel-open]:rotate-180"
              aria-hidden="true"
            />
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-2">
            <p className="mb-3 text-body">
              Cancel with 30 days&apos; notice. You keep full access until your
              end date.
            </p>
            <Button
              variant="outline"
              className="!text-destructive"
              render={<Link href="/membership/cancel" />}
            >
              Cancel membership
            </Button>
          </Collapsible.Content>
        </Collapsible.Root>
      ) : null}
      <Confirm
        open={resume}
        onOpenChange={setResume}
        title="Resume today?"
        description={`You'll pay ${fmtMoney(rc.amount)} for the rest of this cycle. Your pass works right away.`}
      >
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => {
              const r = resumeEarly()
              setResume(false)
              if (r.ok)
                toast({
                  title: "Welcome back",
                  description: "Your pass works again.",
                })
            }}
          >
            Resume membership
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setResume(false)}
          >
            Not now
          </Button>
        </div>
      </Confirm>
      <span className="sr-only">
        <X />
      </span>
    </div>
  )
}
