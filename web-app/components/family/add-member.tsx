"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { SuccessPanel } from "@/components/booking/success-panel"
import {
  Banner,
  CheckRow,
  FormField,
  LoadingBlock,
  PageHeader,
  RadioList,
  SwitchRow,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addFamilyMember, ageFrom } from "@/lib/actions"
import {
  daysInCycle,
  householdMembers,
  householdMonthly,
  nextBillingDate,
} from "@/lib/engine"
import { fmtDayShort, fmtMoney } from "@/lib/time"
import type { Member } from "@/lib/types"

function Inner() {
  const { s, me, hh, now } = useApp()
  const sp = useSearchParams()
  const [step, setStep] = useState(1)
  const [kind, setKind] = useState<"adult" | "child" | "visit">(
    sp.get("who") === "adult" ? "adult" : "child"
  )
  const [f, setF] = useState({
    first: "",
    last: me.lastName,
    dob: "",
    email: "",
    notes: "",
  })
  const [err, setErr] = useState<Record<string, string>>({})
  const [perm, setPerm] = useState({
    classes: true,
    courts: false,
    lanes: false,
    coachMessages: true,
  })
  const [pickup, setPickup] = useState<string[]>([hh.primaryId])
  const [sign, setSign] = useState("")
  const [created, setCreated] = useState<{ m: Member; today: number } | null>(
    null
  )
  const [busy, setBusy] = useState(false)
  const [serverErr, setServerErr] = useState("")
  if (me.role !== "primary") return null
  const age = /^\d{4}-\d{2}-\d{2}$/.test(f.dob) ? ageFrom(f.dob, now) : null
  const role =
    kind === "adult" ? "adult" : age !== null && age >= 13 ? "teen" : "child"
  const price = role === "adult" ? 39 : 19
  const { days, left } = daysInCycle(hh, now)
  const today = Math.round(((price * left) / days) * 100) / 100
  const newTotal = householdMonthly(s, hh).total + price
  const members = householdMembers(s, hh.id).filter(
    (m) => m.role === "primary" || m.role === "adult"
  )
  const validateDetails = () => {
    const e: Record<string, string> = {}
    if (!f.first.trim()) e.first = "Enter your first name."
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dob))
      e.dob = "Enter a date like 2015-03-14."
    else if (kind === "adult" && (age ?? 0) < 18)
      e.dob = `${f.first || "They"} is ${age}, so they join as a child. Adults are 18 and over.`
    else if (kind === "child" && (age ?? 99) >= 18)
      e.dob = "Adults are 18 and over. Pick Another adult."
    if (
      (kind === "adult" || (age ?? 0) >= 13) &&
      !/^\S+@\S+\.\S+$/.test(f.email)
    )
      e.email = "Check the email address. It should look like you@example.com."
    setErr(e)
    return !Object.keys(e).length
  }
  const submit = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 700))
    const r = addFamilyMember({
      first: f.first.trim(),
      last: f.last.trim(),
      dob: f.dob,
      email: f.email,
      notes: f.notes,
      kind: kind === "adult" ? "adult" : "child",
      permissions: perm,
      pickup,
    })
    setBusy(false)
    if (r.ok) {
      setCreated({ m: r.member, today: r.today })
      setStep(4)
    } else setServerErr(r.message)
  }
  if (kind === "visit" && step === 1)
    return (
      <div className="max-w-xl">
        <PageHeader
          title="Add to your plan"
          backHref="/family"
          backLabel="Family"
        />
        <Banner tone="neutral" title="Just visiting?">
          Send a guest pass instead. A guest pass covers one visit at one club.
        </Banner>
        <div className="mt-4 flex gap-2">
          <Button render={<Link href="/guest-passes" />}>
            Send a guest pass
          </Button>
          <Button variant="outline" onClick={() => setKind("child")}>
            Back
          </Button>
        </div>
      </div>
    )
  const progress = (step / 4) * 100
  return (
    <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add to your plan"
          backHref="/family"
          backLabel="Family"
        />
        <div className="flex flex-col gap-2">
          <p role="status" className="text-caption text-muted-foreground">
            Step {step} of 4
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-night transition-[width] dark:bg-on-night"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {step === 1 ? (
          <>
            <h2 className="font-heading text-h3 display-stretch">
              Who are you adding?
            </h2>
            <RadioList
              label="Who are you adding?"
              value={kind}
              onChange={setKind}
              options={[
                {
                  value: "adult",
                  label: (
                    <>
                      Another adult (18+){" "}
                      <span className="ml-2 num text-muted-foreground">
                        +$39 per month
                      </span>
                    </>
                  ),
                  help: "Gets their own login and pass.",
                },
                {
                  value: "child",
                  label: (
                    <>
                      A child or teen (6 months–17){" "}
                      <span className="ml-2 num text-muted-foreground">
                        +$19 per month
                      </span>
                    </>
                  ),
                  help: "Kids club is included. Teens get a login.",
                },
                {
                  value: "visit",
                  label: "Just visiting? Send a guest pass instead",
                  help: "One visit, one club.",
                },
              ]}
            />
          </>
        ) : null}
        {step === 2 ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (validateDetails()) setStep(3)
            }}
            noValidate
          >
            <h2 className="font-heading text-h3 display-stretch">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" error={err.first}>
                {(p) => (
                  <Input
                    {...p}
                    autoComplete="off"
                    value={f.first}
                    onChange={(e) => setF({ ...f, first: e.target.value })}
                  />
                )}
              </FormField>
              <FormField label="Last name">
                {(p) => (
                  <Input
                    {...p}
                    value={f.last}
                    onChange={(e) => setF({ ...f, last: e.target.value })}
                  />
                )}
              </FormField>
            </div>
            <FormField
              label="Date of birth"
              error={err.dob}
              help={
                kind === "adult" ? "Format: 1988-03-14" : "Format: 2015-03-14"
              }
            >
              {(p) => (
                <Input
                  {...p}
                  autoComplete="off"
                  placeholder="YYYY-MM-DD"
                  value={f.dob}
                  onChange={(e) => setF({ ...f, dob: e.target.value })}
                />
              )}
            </FormField>
            {age !== null && kind === "child" && age < 18 ? (
              <p className="text-caption text-muted-foreground">
                {f.first || "They"} is {age}, so they join as a{" "}
                {age >= 13 ? "teen" : "child"}. Adults are 18 and over.
              </p>
            ) : null}
            {kind === "adult" || (age ?? 0) >= 13 ? (
              <FormField label="Email" error={err.email}>
                {(p) => (
                  <Input
                    {...p}
                    type="email"
                    autoComplete="off"
                    placeholder="you@example.com"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                )}
              </FormField>
            ) : null}
            {kind === "child" ? (
              <FormField
                label="Allergies and medical notes"
                help="We share these with kids club staff."
              >
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={f.notes}
                    onChange={(e) => setF({ ...f, notes: e.target.value })}
                  />
                )}
              </FormField>
            ) : null}
            <div className="pt-4 rule-t">
              {role === "teen" ? (
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-h3 display-stretch">
                    What can {f.first || "they"} do?
                  </h2>
                  <SwitchRow
                    checked={perm.classes}
                    onChange={(c) => setPerm({ ...perm, classes: c })}
                  >
                    Classes (Teen OK)
                  </SwitchRow>
                  <SwitchRow
                    checked={perm.courts}
                    onChange={(c) => setPerm({ ...perm, courts: c })}
                  >
                    Court reservations
                  </SwitchRow>
                  <SwitchRow
                    checked={perm.lanes}
                    onChange={(c) => setPerm({ ...perm, lanes: c })}
                    disabled={(age ?? 0) < 14}
                  >
                    Lap lanes (14 and up)
                  </SwitchRow>
                  <SwitchRow
                    checked={perm.coachMessages}
                    onChange={(c) => setPerm({ ...perm, coachMessages: c })}
                  >
                    Teen can message coaches
                  </SwitchRow>
                </div>
              ) : role === "child" ? (
                <fieldset className="flex flex-col gap-3">
                  <legend className="font-heading text-h3 display-stretch">
                    Authorised pick-up adults
                  </legend>
                  {members.map((m) => (
                    <CheckRow
                      key={m.id}
                      checked={pickup.includes(m.id)}
                      onChange={(on) =>
                        setPickup((p) =>
                          on ? [...p, m.id] : p.filter((x) => x !== m.id)
                        )
                      }
                    >
                      {m.firstName} {m.lastName}
                    </CheckRow>
                  ))}
                </fieldset>
              ) : (
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-h3 display-stretch">
                    Invitation
                  </h2>
                  <p className="text-body">
                    We email {f.email} an invite. They set up their own login
                    and pass. The invite lasts 14 days.
                  </p>
                </div>
              )}
            </div>
            {kind === "child" ? (
              <p className="text-detail text-muted-foreground">
                Emergency contact is {me.firstName} {me.lastName}. You can
                change it on the profile.
              </p>
            ) : null}
            <button type="submit" className="sr-only">
              Continue
            </button>
          </form>
        ) : null}
        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-h3 display-stretch">Review</h2>
            <dl className="rounded-md bg-muted px-4 text-caption rule-rows">
              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Adds</dt>
                <dd className="num">{fmtMoney(price, false)} per month</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">
                  Charged today ({left} of {days} days)
                </dt>
                <dd className="num">{fmtMoney(today)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">
                  From {fmtDayShort(nextBillingDate(hh, now))}
                </dt>
                <dd className="num text-body-strong">
                  {fmtMoney(newTotal, false)} per month
                </dd>
              </div>
            </dl>
            <p className="text-caption text-muted-foreground">
              {hh.card.brand[0].toUpperCase() + hh.card.brand.slice(1)} ending{" "}
              {hh.card.last4}
            </p>
            {role !== "adult" ? (
              <FormField
                label="Guardian e-signature"
                help={`Type your full name to sign the waiver for ${f.first}.`}
              >
                {(p) => (
                  <Input
                    {...p}
                    value={sign}
                    onChange={(e) => setSign(e.target.value)}
                    placeholder={`${me.firstName} ${me.lastName}`}
                  />
                )}
              </FormField>
            ) : null}
            {serverErr ? (
              <p
                role="alert"
                className="text-caption font-semibold text-destructive"
              >
                {serverErr}
              </p>
            ) : null}
          </div>
        ) : null}
        {step === 4 && created ? (
          <SuccessPanel
            headline={
              created.m.role === "adult"
                ? `Invitation sent to ${created.m.firstName}`
                : `${created.m.firstName} is on your plan`
            }
            summary={[
              {
                label: "Role",
                value:
                  created.m.role === "adult"
                    ? "Adult"
                    : created.m.role === "teen"
                      ? "Teen"
                      : "Child",
              },
              { label: "Adds", value: `${fmtMoney(price, false)} per month` },
              { label: "Charged today", value: fmtMoney(created.today) },
            ]}
            pill={
              created.m.role === "adult"
                ? "Invitation sent"
                : "Added to your plan"
            }
            primary={
              <Button render={<Link href="/family" />}>Go to family</Button>
            }
            rows={
              created.m.role === "adult"
                ? []
                : [
                    {
                      label: `Set up ${created.m.firstName}'s pass`,
                      href: `/family/${created.m.id}`,
                    },
                  ]
            }
          />
        ) : null}
        {step < 4 ? (
          <div className="flex gap-3 pt-4 rule-t">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="outline" render={<Link href="/family" />}>
                Cancel
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 2 && !validateDetails()) return
                  setStep(step + 1)
                }}
                disabled={step === 1 && kind === "visit"}
              >
                Continue
              </Button>
            ) : (
              <Button
                loading={busy}
                disabled={role !== "adult" && sign.trim().length < 3}
                onClick={() => void submit()}
              >
                Add {f.first}
              </Button>
            )}
          </div>
        ) : null}
      </div>
      {step < 4 ? (
        <aside
          aria-label="New monthly total"
          className="flex flex-col gap-2 lg:sticky lg:top-24 lg:self-start lg:pt-12"
        >
          <p className="eyebrow text-muted-foreground">Your plan after this</p>
          <p className="num-l">
            {fmtMoney(newTotal, false)}{" "}
            <span className="font-sans text-body font-normal text-muted-foreground">
              per month
            </span>
          </p>
          <p className="num text-body">
            {kind === "visit"
              ? "No change."
              : `${f.first || "New member"} adds ${fmtMoney(price, false)} per month. Charged today: ${fmtMoney(today)} (${left} of ${days} days). Then ${fmtMoney(newTotal, false)} from ${fmtDayShort(nextBillingDate(hh, now))}.`}
          </p>
        </aside>
      ) : null}
    </div>
  )
}
export default function AddMember() {
  return (
    <Suspense fallback={<LoadingBlock text="Loading…" />}>
      <Inner />
    </Suspense>
  )
}
