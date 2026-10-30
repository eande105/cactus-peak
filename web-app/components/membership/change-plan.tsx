"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { StepUp } from "@/components/app/step-up"
import { useApp } from "@/components/app/use-app"
import { SuccessPanel } from "@/components/booking/success-panel"
import { Check, Minus, X } from "@/components/icons"
import { SideSheet } from "@/components/kit/overlays"
import {
  Banner,
  EmptyState,
  LoadingBlock,
  PageHeader,
  SelectBox,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { useMedia } from "@/hooks/use-media"
import { changePlan, downgradeImpact, previewUpgrade } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUBS, PLANS } from "@/lib/data/catalog"
import {
  householdMonthly,
  nextBillingDate,
  paymentDaysLate,
} from "@/lib/engine"
import { fmtDay, fmtDayShort, fmtDelta, fmtMoney } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { PlanId } from "@/lib/types"
import { openDialog, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const ORDER: PlanId[] = ["trailhead", "ridge", "summit"]
const ROWS: { label: string; v: (p: PlanId) => React.ReactNode }[] = [
  {
    label: "Clubs",
    v: (p) => (p === "trailhead" ? "Home club only" : "All 5 clubs"),
  },
  {
    label: "Classes and pools",
    v: (p) => (p === "trailhead" ? "At your home club" : "At every club"),
  },
  { label: "Booking window", v: (p) => `${PLANS[p].window} days` },
  {
    label: "Courts, 3 days ahead",
    v: (p) => p !== "trailhead",
  },
  { label: "Guest passes", v: (p) => `${PLANS[p].guestPasses} per month` },
  { label: "Recovery suite", v: (p) => p === "summit" },
  { label: "Towel service", v: (p) => p === "summit" },
  {
    label: "PT intro session",
    v: (p) => (p === "summit" ? "1 per quarter" : false),
  },
  { label: "Kids club for children", v: () => true },
]

export default function ChangePlan() {
  const { s, me, hh, now } = useApp()
  const offline = useOffline()
  const desktop = useMedia("(min-width: 1024px)")
  const [loading, setLoading] = useState(false)
  const [to, setTo] = useState<PlanId | null>(null)
  const [club, setClub] = useState(me.homeClub)
  const [sheet, setSheet] = useState(false)
  const [done, setDone] = useState<{
    plan: PlanId
    scheduled: boolean
    today: number
  } | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  if (me.role !== "primary") return null
  if (loading) return <LoadingBlock text="Loading plans…" rows={4} />
  if (hh.status === "frozen")
    return (
      <div>
        <PageHeader
          backHref="/membership"
          backLabel="Membership"
          title="Change plan"
        />
        <EmptyState
          title="Resume your membership first."
          body="Plan changes start after you resume."
          action={
            <Button render={<Link href="/membership" />}>
              Back to Membership
            </Button>
          }
        />
      </div>
    )
  const cur = hh.plan
  const up = to && PLANS[to].price > PLANS[cur].price
  const pv = to && up ? previewUpgrade(s, hh, to, now) : null
  const imp = to && !up && to !== cur ? downgradeImpact(s, hh, club, now) : null
  const money = householdMonthly(s, hh)
  const nextTotal = to ? householdMonthly(s, hh, to).total : 0
  const card = hh.card.brand[0].toUpperCase() + hh.card.brand.slice(1)
  const confirm = async () => {
    if (!to) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 700))
    const r = changePlan(to, club)
    setBusy(false)
    if (r.ok) {
      setDone({ plan: to, scheduled: r.scheduled, today: r.today })
      announce(
        r.scheduled
          ? `Changing to ${PLANS[to].name} on ${fmtDayShort(imp!.on)}.`
          : `You're on ${PLANS[to].name}.`
      )
      if (!r.scheduled) toast({ title: "You can now book 9 days ahead." })
    } else setError(r.message)
  }
  if (done)
    return (
      <div className="max-w-[560px]">
        <SuccessPanel
          pill={done.scheduled ? "Plan change scheduled" : "Plan changed"}
          headline={
            done.scheduled
              ? `Changing to ${PLANS[done.plan].name} on ${fmtDayShort(imp?.on ?? now)}`
              : `You're on ${PLANS[done.plan].name}`
          }
          summary={[
            {
              label: "Plan",
              value: `${PLANS[done.plan].name} · ${fmtMoney(PLANS[done.plan].price, false)} per month`,
            },
            ...(done.scheduled
              ? []
              : [{ label: "Charged today", value: fmtMoney(done.today) }]),
            {
              label: "Next charge",
              value: `${fmtDayShort(nextBillingDate(hh, now))} · ${fmtMoney(householdMonthly(s, hh).total)}`,
            },
          ]}
          onDone={undefined}
          extra={
            done.scheduled ? (
              <p className="text-caption text-muted-foreground">
                You keep {PLANS[cur].name} until then. Undo from Membership any
                time before.
              </p>
            ) : (
              <p className="text-caption text-muted-foreground">
                Receipt emailed to {hh.receiptEmail}.{" "}
                {done.plan === "summit"
                  ? "New: recovery suite, 9-day booking, 4 guest passes per month."
                  : ""}
              </p>
            )
          }
          rows={[{ label: "Back to Membership", href: "/membership" }]}
        />
      </div>
    )
  const preview = (
    <div className="flex flex-col gap-4">
      {!to || to === cur ? (
        <p className="text-body text-muted-foreground">
          Pick a plan to see the cost.
        </p>
      ) : (
        <>
          <div>
            <p className="font-heading text-h2 display-stretch">
              {PLANS[to].name} ·{" "}
              <span className="num">{fmtMoney(PLANS[to].price, false)}</span>{" "}
              per month
            </p>
            <p className="text-caption text-muted-foreground">
              {up
                ? "Starts today."
                : `Starts ${fmtDayShort(imp!.on)}. You keep ${PLANS[cur].name} until then.`}
            </p>
          </div>
          {up && pv ? (
            <dl className="flex flex-col text-caption rule-rows">
              <div className="flex justify-between py-2">
                <dt>Plan difference</dt>
                <dd className="num">{fmtMoney(pv.diff, false)} per month</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt>
                  Prorated for {fmtDayShort(now)} to{" "}
                  {fmtDayShort(pv.next - 86400000)} ({pv.left} of {pv.days}{" "}
                  days)
                </dt>
                <dd className="num">{fmtMoney(pv.today)}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt>Subtotal</dt>
                <dd className="num">{fmtMoney(pv.today)}</dd>
              </div>
              <div className="flex justify-between py-2 text-body-strong">
                <dt>Today&apos;s total</dt>
                <dd className="num font-heading text-h3">
                  {fmtMoney(pv.today)}
                </dd>
              </div>
              <p className="py-2 text-detail text-muted-foreground">
                The new monthly charge starts {fmtDayShort(pv.next)}.
              </p>
            </dl>
          ) : null}
          <p className="num text-caption">
            Next charge {fmtDayShort(up ? pv!.next : imp!.on)} ·{" "}
            <span className="text-body-strong">{fmtMoney(nextTotal)}</span>
            <br />
            <span className="text-muted-foreground">
              {PLANS[to].name} {fmtMoney(PLANS[to].price, false)}
              {money.adults
                ? ` + ${money.adults} adult ${fmtMoney(money.adultTotal, false)}`
                : ""}
              {money.kids
                ? ` + ${money.kids} ${money.kids === 1 ? "child" : "children"} ${fmtMoney(19, false)} each`
                : ""}
            </span>
          </p>
          <div className="pt-3 rule-t">
            <p className="text-label">Before you switch</p>
            {up ? (
              <p className="text-caption">
                Nothing ends. You gain{" "}
                {to === "summit"
                  ? "the recovery suite, 9-day booking and 4 guest passes per month."
                  : "all 5 clubs, courts and 1 guest pass per month."}{" "}
                Everyone in your household gets {PLANS[to].name} access.
              </p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1.5 text-caption">
                {(to === "trailhead"
                  ? [
                      "Other clubs: not included in Trailhead",
                      "Courts: not included in Trailhead",
                      "1 guest pass per month ends",
                    ]
                  : [
                      "Recovery suite ends",
                      "9-day booking becomes 7 days",
                      "Guest passes drop to 1 per month",
                    ]
                ).map((x) => (
                  <li key={x} className="flex gap-2">
                    <X
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!up && to === "trailhead" ? (
            <>
              <SelectBox
                label="Home club (required)"
                value={club}
                onChange={setClub}
                options={CLUBS.map((c) => ({ value: c.slug, label: c.name }))}
              />
              {imp && (imp.other || imp.courts) ? (
                <p className="text-caption">
                  {imp.other} {imp.other === 1 ? "booking" : "bookings"} at
                  other clubs after {fmtDayShort(imp.on)}
                  {imp.courts
                    ? ` and ${imp.courts} court ${imp.courts === 1 ? "reservation" : "reservations"}`
                    : ""}{" "}
                  will be cancelled. No late-cancel strike.
                </p>
              ) : null}
            </>
          ) : null}
          <p className="text-caption text-muted-foreground">
            {card} ending {hh.card.last4}{" "}
            <button
              type="button"
              className="text-link underline"
              onClick={() => openDialog("card")}
            >
              Change
            </button>
          </p>
          {error ? (
            <p
              role="alert"
              className="text-caption font-semibold text-destructive"
            >
              {error}{" "}
              <button
                type="button"
                className="underline"
                onClick={() => openDialog("card")}
              >
                Update your card
              </button>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTo(null)
                setSheet(false)
              }}
            >
              Keep {PLANS[cur].name}
            </Button>
            <Button
              loading={busy}
              disabled={offline || paymentDaysLate(s, me.id, now) >= 0}
              onClick={() => void confirm()}
            >
              Switch to {PLANS[to].name}
            </Button>
          </div>
        </>
      )}
    </div>
  )
  return (
    <div className="flex flex-col gap-6 pb-24">
      <StepUp />
      <PageHeader
        backHref="/membership"
        backLabel="Membership"
        title="Change plan"
        description="Month to month. No contract."
      />
      {hh.pendingPlan ? (
        <Banner
          tone="neutral"
          title={`Already changing to ${PLANS[hh.pendingPlan.plan].name} on ${fmtDayShort(hh.pendingPlan.on)}`}
        >
          Undo that change from Membership first.
        </Banner>
      ) : null}
      {hh.status === "payment_failed" ? (
        <Banner tone="danger" title="Fix your payment first." />
      ) : null}
      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-body">
            <caption className="sr-only">
              Compare Trailhead, Ridge and Summit
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-40 pb-4 align-bottom text-caption font-normal text-muted-foreground"
                >
                  Feature
                </th>
                {ORDER.map((p) => (
                  <th
                    key={p}
                    scope="col"
                    className={cn(
                      "px-3 pb-4 align-bottom font-normal",
                      p === cur && "bg-accent",
                      to === p && "ring-2 ring-primary ring-inset"
                    )}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-h3 display-stretch">
                          {PLANS[p].name}
                        </span>
                        {p === "ridge" && cur !== "ridge" ? (
                          <span className="rounded-xs bg-night px-1.5 text-detail text-on-night">
                            Most popular
                          </span>
                        ) : null}
                      </span>
                      <span className="num text-body-strong">
                        {fmtMoney(PLANS[p].price, false)} per month
                      </span>
                      {p === cur ? (
                        <span className="text-detail font-semibold">
                          Current plan
                        </span>
                      ) : (
                        <span className="text-detail text-muted-foreground">
                          {PLANS[p].price > PLANS[cur].price
                            ? `${fmtDelta(PLANS[p].price - PLANS[cur].price)} a month, starts today`
                            : `${fmtDelta(PLANS[p].price - PLANS[cur].price)} a month, starts ${fmtDayShort(downgradeImpact(s, hh, club, now).on)}`}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          p === cur ||
                          !!hh.pendingPlan ||
                          hh.status === "payment_failed"
                        }
                        aria-disabled={p === cur}
                        onClick={() => {
                          setTo(p)
                          setSheet(true)
                          setError("")
                        }}
                        className="w-fit"
                      >
                        {p === cur ? "Your plan" : `Choose ${PLANS[p].name}`}
                      </Button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="rule-b">
                  <th
                    scope="row"
                    className="py-3 pr-3 text-caption font-normal text-muted-foreground"
                  >
                    {r.label}
                  </th>
                  {ORDER.map((p) => {
                    const v = r.v(p)
                    return (
                      <td
                        key={p}
                        className={cn("px-3 py-3", p === cur && "bg-accent/40")}
                      >
                        {v === true ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Check
                              className="size-4 text-success"
                              aria-hidden="true"
                            />
                            Included
                          </span>
                        ) : v === false ? (
                          <span className="text-muted-foreground">
                            <Minus
                              className="inline size-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Not included</span>
                          </span>
                        ) : (
                          <span className="num">{v}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-detail text-muted-foreground">
            Family members follow the main plan. Add-ons stay $39 per adult and
            $19 per child.
          </p>
        </div>
        <aside
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          aria-label="Change preview"
        >
          <div className="rounded-lg bg-card p-5 edge ring-border">
            {preview}
          </div>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card px-4 py-3 md:bottom-0 lg:hidden">
        <Button
          className="w-full"
          disabled={!to}
          onClick={() => setSheet(true)}
        >
          Review change
        </Button>
      </div>
      <div className="lg:hidden">
        <SideSheet
          open={sheet && !!to && !desktop}
          onOpenChange={setSheet}
          label="Review plan change"
        >
          <div className="p-4 sm:p-6">
            <h2 className="mb-3 font-heading text-h2 display-stretch">
              Review change
            </h2>
            {preview}
          </div>
        </SideSheet>
      </div>
      <span className="sr-only">{fmtDay(now)}</span>
    </div>
  )
}
