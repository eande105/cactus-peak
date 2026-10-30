"use client"
import Link from "next/link"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { SuccessPanel } from "@/components/booking/success-panel"
import { Check } from "@/components/icons"
import { CoachArt } from "@/components/kit/brand-art"
import { MiniCalendar } from "@/components/kit/calendar"
import {
  Banner,
  EmptyState,
  FormField,
  LoadingBlock,
  PageHeader,
  RadioList,
  SelectBox,
} from "@/components/kit/ui"
import { SlotHoldTimer } from "@/components/reserve/common"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { bookPT, moveReservation } from "@/lib/actions"
import { announce } from "@/lib/announce"
import {
  CLUB_BY_SLUG,
  COACH_BY_SLUG,
  PT_PACKS,
  PT_PRICE,
} from "@/lib/data/catalog"
import { cancelNote, ptCreditsLeft, ptOpenSlots } from "@/lib/engine"
import {
  DAY,
  dateKey,
  dayStart,
  fmtDay,
  fmtDayLong,
  fmtDowTime,
  fmtMoney,
  fmtRange,
  fmtTime,
  MIN,
  parts,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking } from "@/lib/types"
import { openDialog, useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

function Inner({ slug }: { slug: string }) {
  const { s, me, hh, now } = useApp()
  const router = useRouter()
  const sp = useSearchParams()
  const offline = useOffline()
  const coach = COACH_BY_SLUG[slug]
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const moveId = sp.get("move")
  const moving = moveId ? s.bookings.find((b) => b.id === moveId) : undefined
  const slots = useMemo(() => ptOpenSlots(s, slug, now), [s, slug, now])
  const first = slots[0]
  const [club, setClub] = useState(moving?.clubSlug ?? coach?.clubs[0] ?? "")
  const [day, setDay] = useState<number>(
    sp.get("t")
      ? dayStart(Number(sp.get("t")))
      : first
        ? dayStart(first)
        : dayStart(now)
  )
  const [slot, setSlot] = useState<number | null>(
    sp.get("t") ? Number(sp.get("t")) : null
  )
  const [hold, setHold] = useState(() => (sp.get("t") ? now + 5 * MIN : 0))
  const [ext, setExt] = useState(false)
  const [pay, setPay] = useState<"credit" | "intro" | "single" | "pack">(
    ptCreditsLeft(hh) > 0
      ? "credit"
      : hh.plan === "summit" && hh.ptIntroLeft > 0
        ? "intro"
        : "single"
  )
  const [pack, setPack] = useState("8")
  const [note, setNote] = useState("")
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [done, setDone] = useState<{ b: Booking; packLeft: number } | null>(
    null
  )
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (coach) document.title = `Book ${coach.name} · Cactus Peak Athletic`
  }, [coach])
  if (!coach) notFound()
  const first1 = coach.name.split(" ")[0]
  const daySlots = slots.filter((x) => dayStart(x) === day)
  const marks = new Set(slots.map((x) => dateKey(x)))
  const am = daySlots.filter((x) => parts(x).h < 12)
  const pm = daySlots.filter((x) => parts(x).h >= 12)
  const choose = (t: number) => {
    setSlot(t)
    setHold(now + 5 * MIN)
    setExt(false)
    announce(`${fmtDowTime(t)} selected.`)
  }
  const payOptions = [
    ...(ptCreditsLeft(hh) > 0
      ? [
          {
            value: "credit",
            label: "Use a pack credit",
            help: `${ptCreditsLeft(hh)} left in your ${hh.ptPack?.total}-pack`,
          },
        ]
      : []),
    ...(hh.plan === "summit"
      ? [
          {
            value: "intro",
            label: "Summit intro session",
            help:
              hh.ptIntroLeft > 0
                ? `Free · ${hh.ptIntroLeft} left this quarter`
                : "None left this quarter",
            disabled: hh.ptIntroLeft <= 0,
          },
        ]
      : []),
    { value: "single", label: `Single session: ${fmtMoney(PT_PRICE, false)}` },
    {
      value: "pack",
      label: "Buy a pack",
      help: "4, 8 or 12 sessions. Packs last 12 months.",
    },
  ]
  const total =
    pay === "single"
      ? PT_PRICE
      : pay === "pack"
        ? PT_PACKS.find((p) => String(p.sessions) === pack)!.price
        : 0
  const confirm = async () => {
    if (!slot) return
    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    if (moving) {
      const r = moveReservation(moving.id, { start: slot })
      setBusy(false)
      if (r.ok) {
        toast({ title: "Session moved", description: fmtDowTime(slot) })
        router.push("/bookings")
      } else setError(r.message)
      return
    }
    const r = bookPT({
      coachSlug: slug,
      start: slot,
      clubSlug: club,
      pay,
      packSessions: Number(pack),
      note: note.trim() || undefined,
    })
    setBusy(false)
    if (r.ok) {
      setDone({ b: r.booking, packLeft: r.packLeft })
      announce(`You're booked with ${first1}.`)
    } else {
      setError(r.message)
      announce(r.message)
      if (r.code === "SLOT_TAKEN") {
        setSlot(null)
        setStep(1)
      }
    }
  }
  if (done)
    return (
      <div className="max-w-[560px]">
        <SuccessPanel
          pill={
            done.b.status === "pending_approval"
              ? "Waiting for a parent"
              : "Training booked"
          }
          headline={`${coach.name}, ${fmtDowTime(done.b.start)}`}
          summary={[
            {
              label: "When",
              value: `${fmtDay(done.b.start)} · ${fmtRange(done.b.start, done.b.end)}`,
            },
            { label: "Where", value: CLUB_BY_SLUG[done.b.clubSlug].name },
            { label: "Coach", value: coach.name },
            { label: "Payment", value: done.b.payment },
            ...(hh.ptPack
              ? [
                  {
                    label: `${hh.ptPack.total}-pack`,
                    value: `${done.packLeft} left`,
                  },
                ]
              : []),
            { label: "Reference", value: done.b.ref },
          ]}
          event={{
            title: `Training with ${coach.name}`,
            start: done.b.start,
            end: done.b.end,
            location: CLUB_BY_SLUG[done.b.clubSlug].address,
          }}
          extra={(() => {
            const c = cancelNote(s, me.id, done.b.start, now, "pt")
            return (
              <p
                className={
                  c.late
                    ? "text-caption text-warning"
                    : "text-caption text-muted-foreground"
                }
              >
                {c.text}
              </p>
            )
          })()}
          rows={[
            { label: `Message ${first1}`, href: "/inbox" },
            { label: "Club details", href: `/clubs/${done.b.clubSlug}` },
          ]}
          onDone={() => router.push("/training")}
        />
      </div>
    )
  if (loading)
    return <LoadingBlock text={`Checking ${first1}'s times…`} rows={4} />
  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        backHref={`/training/coaches/${slug}`}
        backLabel={coach.name}
        title={
          moving
            ? `Move your session with ${first1}`
            : `Book a session with ${first1}`
        }
        description="45 minutes. Free to move until 24 hours before."
      />
      {moving ? (
        <Banner
          tone="neutral"
          title={`Original selection: ${fmtDay(moving.start)}, ${fmtTime(moving.start)}`}
        />
      ) : null}
      <p className="text-caption text-muted-foreground" role="status">
        Step {step} of 3
      </p>
      {slot && step > 1 ? (
        <p className="num text-body-strong">
          {fmtDay(slot)} · {fmtRange(slot, slot + 45 * MIN)} ·{" "}
          {CLUB_BY_SLUG[club].name}
        </p>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-md p-3 ring-2 ring-primary">
              <CoachArt name={coach.name} roles={coach.specialties} size={56} />
              <div>
                <p className="text-label">
                  {coach.name}{" "}
                  <Check
                    className="inline size-4 text-success"
                    aria-label="Selected"
                  />
                </p>
                <p className="text-caption text-success">
                  Available 6 a.m.–6 p.m.
                </p>
              </div>
            </div>
            <p className="text-body-strong">45-minute session</p>
            {coach.clubs.length > 1 ? (
              <SelectBox
                label="Club"
                value={club}
                onChange={setClub}
                options={coach.clubs.map((c) => ({
                  value: c,
                  label: CLUB_BY_SLUG[c].name,
                }))}
              />
            ) : (
              <p className="text-caption">Club: {CLUB_BY_SLUG[club].name}</p>
            )}
            <p className="text-caption text-muted-foreground">
              Single <span className="num">{fmtMoney(PT_PRICE, false)}</span> ·
              Pack from <span className="num">{fmtMoney(61, false)}</span> each.
              Free to move until 24 hours before.
            </p>
          </div>
          <div className="flex flex-col gap-6 md:flex-row">
            <MiniCalendar
              today={now}
              selected={day}
              onSelect={(d) => {
                setDay(d)
                setSlot(null)
              }}
              marks={marks}
              disabled={(d) =>
                d < dayStart(now)
                  ? "Past"
                  : !marks.has(dateKey(d))
                    ? "No openings"
                    : false
              }
              label="Open days"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h2 className="font-heading text-h3 display-stretch">
                {fmtDayLong(day)}
              </h2>
              {daySlots.length ? (
                <div
                  role="radiogroup"
                  aria-label="Open times"
                  className="flex flex-col gap-3"
                >
                  {[
                    ["AM", am],
                    ["PM", pm],
                  ].map(([lab, list]) =>
                    (list as number[]).length ? (
                      <div key={lab as string}>
                        <p className="mb-2 eyebrow text-muted-foreground">
                          {lab as string}
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {(list as number[]).map((t) => (
                            <li key={t}>
                              {/* biome-ignore lint/a11y/useSemanticElements: time chips styled as buttons, a native radio input would change the markup and styling */}
                              <button
                                type="button"
                                role="radio"
                                aria-checked={slot === t}
                                onClick={() => choose(t)}
                                className={cn(
                                  "inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-label edge ring-input",
                                  slot === t
                                    ? "bg-night text-on-night"
                                    : "bg-card hover:bg-muted"
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-2 rounded-full",
                                    slot === t ? "bg-on-night" : "bg-success"
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="num">{fmtTime(t)}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <EmptyState
                  title={`No open times with ${first1} this day.`}
                  body="Pick a day with a dot, or try another coach."
                  action={
                    <Button
                      variant="outline"
                      render={<Link href="/training" />}
                    >
                      See other coaches
                    </Button>
                  }
                  className="py-0"
                />
              )}
              <p className="text-detail text-muted-foreground">
                Arizona time (no daylight saving). A dot on the calendar marks a
                day with open times.
              </p>
              {slot && hold ? (
                <div className="max-w-xs">
                  <SlotHoldTimer
                    holdUntil={hold}
                    now={now}
                    what="this time"
                    canExtend={!ext}
                    onExtend={() => {
                      setHold((h) => h + 5 * MIN)
                      setExt(true)
                    }}
                    onExpire={() => {
                      setSlot(null)
                      setHold(0)
                      toast({
                        type: "info",
                        title: "Your hold ended",
                        description:
                          "The time is open to others. Pick it again?",
                      })
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="flex max-w-xl flex-col gap-6">
          {!moving ? (
            <>
              <h2 className="font-heading text-h3 display-stretch">
                How do you want to pay?
              </h2>
              <RadioList
                label="Payment"
                value={pay}
                onChange={(v) => setPay(v as typeof pay)}
                options={payOptions}
              />
              {pay === "pack" ? (
                <RadioList
                  label="Pack size"
                  value={pack}
                  onChange={setPack}
                  options={PT_PACKS.map((p) => ({
                    value: String(p.sessions),
                    label: `${p.sessions} sessions · ${fmtMoney(p.price, false)}`,
                    help: `${fmtMoney(p.price / p.sessions, false)} each`,
                  }))}
                />
              ) : null}
            </>
          ) : null}
          <FormField
            label="Anything your coach should know?"
            help={`Injuries, goals, what to avoid. Only ${first1} and club staff see this.`}
            error={
              note.length > 500 ? "Keep notes under 500 characters." : undefined
            }
          >
            {(f) => (
              <Textarea
                {...f}
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
          </FormField>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="flex max-w-xl flex-col gap-4">
          <h2 className="font-heading text-h3 display-stretch">Review</h2>
          <dl className="rounded-md bg-muted px-4 rule-rows">
            {[
              ["Coach", coach.name],
              [
                "When",
                slot
                  ? `${fmtDay(slot)} · ${fmtRange(slot, slot + 45 * MIN)}`
                  : "",
              ],
              ["Where", CLUB_BY_SLUG[club].name],
              [
                "Payment",
                moving
                  ? "No charge to move"
                  : pay === "credit"
                    ? "Pack credit"
                    : pay === "intro"
                      ? "Summit intro session"
                      : pay === "single"
                        ? "Single session"
                        : `${pack}-session pack`,
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-4 py-2.5 text-caption"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right num">{v}</dd>
              </div>
            ))}
          </dl>
          {total ? (
            <p className="flex items-baseline justify-between text-body">
              <span>Today&apos;s total</span>
              <span className="num font-heading text-h2">
                {fmtMoney(total)}
              </span>
            </p>
          ) : null}
          {total ? (
            <p className="text-caption text-muted-foreground">
              {hh.card.brand[0].toUpperCase() + hh.card.brand.slice(1)} ending{" "}
              {hh.card.last4}{" "}
              <button
                type="button"
                className="text-link underline"
                onClick={() => openDialog("card")}
              >
                Change
              </button>
            </p>
          ) : null}
          {slot
            ? (() => {
                const c = cancelNote(s, me.id, slot, now, "pt")
                return (
                  <p
                    className={
                      c.late
                        ? "rounded-md bg-warning-subtle px-3 py-2 text-caption"
                        : "text-caption text-muted-foreground"
                    }
                  >
                    {c.text}
                  </p>
                )
              })()
            : null}
          {me.role === "teen" ? (
            <Banner tone="neutral" title="Your parent needs to approve this.">
              We send them a request. The time is held for 24 hours.
            </Banner>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="text-caption font-semibold text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 pt-4 rule-t">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((st) => (st - 1) as 1 | 2)}
          >
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button
            disabled={step === 1 ? !slot : note.length > 500}
            onClick={() => setStep((st) => (st + 1) as 2 | 3)}
          >
            Continue
          </Button>
        ) : (
          <Button
            size="lg"
            loading={busy}
            disabled={offline}
            onClick={() => void confirm()}
          >
            {moving
              ? "Move session"
              : me.role === "teen"
                ? "Send request"
                : pay === "pack"
                  ? "Book session and buy pack"
                  : "Book session"}
          </Button>
        )}
      </div>
      <span className="sr-only">{DAY}</span>
    </div>
  )
}
export default function BookPage({ slug }: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <Inner slug={slug} />
    </Suspense>
  )
}
