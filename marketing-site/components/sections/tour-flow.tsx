"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClubArt } from "@/components/brand/club-art"
import { Check, CircleCheck, Plus } from "@/components/icons"
import { useCatalog, useClubNow } from "@/components/site/catalog-context"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
import { useMyClub } from "@/components/site/club-context"
import { Button } from "@/components/ui/button"
import { CheckRow, Textarea } from "@/components/ui/controls"
import { submitTour } from "@/lib/forms/actions"
import { isEmailOrPhone, isPhone, useSessionState } from "@/lib/store"
import { fmtTime } from "@/lib/time"
import type { ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Container, EmptyState } from "./common"
import {
  ErrorSummary,
  Field,
  focusErrors,
  Honeypot,
  honeypotOf,
  StepBar,
  serverErrors,
  TextField,
} from "./flow-ui"

const DAY_MS = 86_400_000
/** Lead time before a same-day tour, so the desk can find a coach. */
const LEAD_MIN = 60

/**
 * Tour times for a club on an Arizona day number. There is no tour calendar in the database yet, so availability is
 * a stable pattern: every 30 minutes in staffed hours, with some slots taken. Times that have passed are left out.
 */
export function slotsFor(
  club: string,
  dayNum: number,
  now: { dayNum: number; min: number }
): number[] {
  if (dayNum < now.dayNum || dayNum > now.dayNum + 30) return []
  const sun = (dayNum + 4) % 7 === 0
  const out: number[] = []
  for (let m = sun ? 600 : 540; m <= (sun ? 930 : 1110); m += 30) {
    if (dayNum === now.dayNum && m < now.min + LEAD_MIN) continue
    let h = 3
    for (const ch of `${club}${dayNum}${m}`)
      h = (h * 31 + ch.charCodeAt(0)) >>> 0
    if (h % 7 !== 0) out.push(m)
  }
  return out
}
/** "Thu, Oct 29" (or "Thursday, Oct 29") for an Arizona day number. */
export const dateLabel = (dayNum: number, long = false) => {
  const d = new Date(dayNum * DAY_MS)
  return `${d.toLocaleDateString("en-US", { weekday: long ? "long" : "short", timeZone: "UTC" })}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`
}
/** The tour start as an instant. Arizona is UTC-7 all year. */
const slotInstant = (dayNum: number, min: number) =>
  new Date(dayNum * DAY_MS + (min + 7 * 60) * 60_000)

type Tour = {
  club: string
  /** Arizona day number (days since 1970-01-01). */
  day: number | null
  time: number | null
  first: string
  contact: string
  note: string
  remind: boolean
  id: string
  coach: string
}
const INIT: Tour = {
  club: "",
  day: null,
  time: null,
  first: "",
  contact: "",
  note: "",
  remind: false,
  id: "",
  coach: "",
}
export const useTour = () => useSessionState<Tour>("cpa_tour", INIT)

export function TourFlow() {
  const sp = useSearchParams()
  const router = useRouter()
  const { club: mine } = useMyClub()
  const { clubs, clubBySlug, profileCoaches: coaches } = useCatalog()
  const now = useClubNow()
  const [t, setT] = useTour()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [coachOn, setCoachOn] = useState(true)
  const [noteOpen, setNoteOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const head = useRef<HTMLHeadingElement>(null)
  const club = (t.club || sp.get("club") || mine?.slug || "") as ClubSlug | ""
  const coach = coaches.find((c) => c.slug === sp.get("coach"))
  const c = club ? clubBySlug(club) : null
  // biome-ignore lint/correctness/useExhaustiveDependencies: step is the trigger; move focus to the heading on each step change
  useEffect(() => {
    head.current?.focus()
  }, [step])
  const go = (n: number) => {
    setErrors({})
    setStep(n)
  }
  const noteDefault =
    sp.get("note") === "kids"
      ? "I'd like to see the pool and the kids club."
      : sp.get("note") === "warm-pool"
        ? "I'd like to see the warm-water pool."
        : "I'd like to see the pool and the kids club."

  const submit = async (form: HTMLFormElement) => {
    const e: Record<string, string> = {}
    if (!t.first.trim()) e.first = "Enter your first name."
    if (!isEmailOrPhone(t.contact))
      e.contact = "Enter an email or a 10-digit mobile number."
    setErrors(e)
    if (Object.keys(e).length || t.day === null || t.time === null) {
      focusErrors()
      return
    }
    setBusy(true)
    const withCoach = coach && coachOn ? coach.name : ""
    const r = await submitTour({
      club,
      slotAt: slotInstant(t.day, t.time).toISOString(),
      firstName: t.first,
      contact: t.contact,
      note: noteOpen ? t.note || noteDefault : "",
      remind: t.remind,
      withCoach,
      company: honeypotOf(form),
    }).catch(() => null)
    if (!r?.ok) {
      setBusy(false)
      setErrors(
        r
          ? serverErrors(r)
          : { form: "We could not send that. Check your connection." }
      )
      focusErrors()
      return
    }
    // The confirmation page reads the booking from this tab's sessionStorage. Nothing personal goes in the URL.
    setT((p) => ({ ...p, club: club as string, id: r.ref, coach: withCoach }))
    router.push("/tour/confirmed")
  }
  const slots = t.day !== null && club ? slotsFor(club, t.day, now) : []
  const groups = [
    ["Morning", slots.filter((m) => m < 720)],
    ["Afternoon", slots.filter((m) => m >= 720 && m < 1020)],
    ["Evening", slots.filter((m) => m >= 1020)],
  ] as const

  return (
    <>
      <MinimalCheckoutHeader phone={c?.phone} tel={c?.tel}>
        <div className="mx-auto max-w-sm">
          <StepBar
            step={step}
            total={3}
            label={["Club and day", "Time", "Confirm"][step - 1]}
          />
        </div>
      </MinimalCheckoutHeader>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Container className="grid gap-8 py-8 lg:grid-cols-12 lg:py-12">
          <div className="md:hidden lg:col-span-12">
            <StepBar
              step={step}
              total={3}
              label={["Club and day", "Time", "Confirm"][step - 1]}
            />
          </div>
          <div className="lg:col-span-7 lg:col-start-2">
            {step === 1 ? (
              <section aria-labelledby="t1">
                <h1
                  id="t1"
                  ref={head}
                  tabIndex={-1}
                  className="font-display-wide text-h1 outline-none"
                >
                  Book a free tour.
                </h1>
                <p className="mt-2 text-body text-muted-foreground">
                  30 minutes. A coach, not a salesperson. No card.
                </p>
                {coach ? (
                  <div className="mt-6 flex items-center justify-between gap-4 rounded-lg bg-card p-4 edge ring-border">
                    <p className="text-body">
                      You asked to meet {coach.name}. We will try to have{" "}
                      {coach.first} join.
                    </p>
                    <CheckRow checked={coachOn} onChange={setCoachOn}>
                      Yes
                    </CheckRow>
                  </div>
                ) : null}
                <fieldset className="mt-8">
                  <legend className="text-label">Club</legend>
                  <div className="mt-2 flex flex-col gap-2" role="radiogroup">
                    {clubs.map((x) => {
                      const on = club === x.slug
                      return (
                        // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
                        <button
                          key={x.slug}
                          role="radio"
                          aria-checked={on}
                          type="button"
                          onClick={() =>
                            setT((p) => ({ ...p, club: x.slug, time: null }))
                          }
                          className={cn(
                            "flex min-h-16 items-center gap-3 rounded-lg px-3 py-2 text-left edge",
                            on
                              ? "bg-accent ring-2 ring-primary"
                              : "bg-card ring-border hover:ring-border-strong"
                          )}
                        >
                          <ClubArt
                            slug={x.slug}
                            ratio="4/3"
                            detail="simple"
                            className="w-14 shrink-0 overflow-hidden rounded-sm"
                          />
                          <span className="flex-1">
                            <span className="block text-body-strong">
                              {x.name}
                            </span>
                            <span className="block text-body text-muted-foreground">
                              {x.cross}
                            </span>
                          </span>
                          {on ? (
                            <Check
                              className="size-4 text-link"
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
                <fieldset className="mt-8">
                  <legend className="text-label">Day</legend>
                  <div
                    className="-mx-4 mt-2 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
                    role="radiogroup"
                    aria-label="Choose a day"
                    tabIndex={club ? undefined : 0}
                  >
                    {Array.from({ length: 14 }, (_, i) => now.dayNum + i).map(
                      (i) => {
                        const has = !!club && slotsFor(club, i, now).length > 0
                        const on = t.day === i
                        const d = new Date(i * DAY_MS)
                        return (
                          // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
                          <button
                            key={i}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            disabled={!has}
                            onClick={() =>
                              setT((p) => ({ ...p, day: i, time: null }))
                            }
                            aria-label={`${dateLabel(i, true)}${has ? "" : ", no tours"}`}
                            className={cn(
                              "tabular flex min-h-16 min-w-[76px] shrink-0 flex-col items-start justify-center rounded-lg px-3 text-left edge",
                              on
                                ? "bg-night text-night-foreground ring-night"
                                : has
                                  ? "bg-card ring-border hover:ring-border-strong"
                                  : "bg-muted text-disabled-foreground ring-border"
                            )}
                          >
                            <span className="text-label">
                              {i === now.dayNum
                                ? "Today"
                                : d.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    timeZone: "UTC",
                                  })}
                            </span>
                            <span
                              className={cn(
                                "text-caption",
                                on
                                  ? "text-night-muted"
                                  : "text-muted-foreground"
                              )}
                            >
                              {d.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              })}
                            </span>
                          </button>
                        )
                      }
                    )}
                  </div>
                  <p className="mt-2 text-caption text-muted-foreground">
                    {club
                      ? "Tours run every 30 minutes. All times are Arizona time."
                      : "Pick a club first. All times are Arizona time."}
                  </p>
                </fieldset>
                <div className="mt-8 flex items-center gap-4">
                  <Button
                    disabled={!club || t.day === null}
                    onClick={() => {
                      setT((p) => ({ ...p, club }))
                      go(2)
                    }}
                  >
                    Next
                  </Button>
                  <span
                    className="text-caption text-muted-foreground"
                    aria-live="polite"
                  >
                    {!club
                      ? "Pick a club to continue."
                      : t.day === null
                        ? "Pick a day to continue."
                        : ""}
                  </span>
                </div>
              </section>
            ) : null}
            {step === 2 && t.day !== null ? (
              <section aria-labelledby="t2">
                <h1
                  id="t2"
                  ref={head}
                  tabIndex={-1}
                  className="font-display-wide text-h1 outline-none"
                >
                  Pick a time on {dateLabel(t.day, true)}.
                </h1>
                {slots.length ? (
                  groups.map(([g, list]) =>
                    list.length ? (
                      <fieldset key={g} className="mt-6">
                        <legend className="eyebrow mb-2">{g}</legend>
                        <div
                          className="grid grid-cols-2 gap-2 lg:grid-cols-3"
                          role="radiogroup"
                        >
                          {list.map((m) => {
                            const on = t.time === m
                            return (
                              // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
                              <button
                                key={m}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => setT((p) => ({ ...p, time: m }))}
                                className={cn(
                                  "tabular inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md text-label edge",
                                  on
                                    ? "bg-accent ring-2 ring-primary"
                                    : "bg-card ring-border hover:ring-border-strong"
                                )}
                              >
                                {on ? (
                                  <Check
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                ) : null}
                                {fmtTime(m)}
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>
                    ) : null
                  )
                ) : (
                  <EmptyState
                    className="mt-6"
                    title={`No times left on ${dateLabel(t.day, true).split(",")[0]}.`}
                  >
                    <Button variant="outline" onClick={() => go(1)}>
                      Pick another day
                    </Button>
                  </EmptyState>
                )}
                <div className="mt-8 flex items-center gap-4">
                  <Button variant="ghost" onClick={() => go(1)}>
                    Back
                  </Button>
                  <Button disabled={t.time === null} onClick={() => go(3)}>
                    Next
                  </Button>
                  <span className="text-caption text-muted-foreground">
                    {t.time === null ? "Pick a time to continue." : ""}
                  </span>
                </div>
              </section>
            ) : null}
            {step === 3 && c && t.day !== null && t.time !== null ? (
              <section aria-labelledby="t3">
                <h1
                  id="t3"
                  ref={head}
                  tabIndex={-1}
                  className="font-display-wide text-h1 outline-none"
                >
                  Confirm your tour.
                </h1>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card p-4 edge ring-border">
                  <p className="tabular text-body">
                    <span className="font-semibold">{c.name}</span> ·{" "}
                    {dateLabel(t.day, true)} · {fmtTime(t.time)} · 30 minutes
                  </p>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="min-h-11 text-label text-link underline-offset-4 hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <form
                  noValidate
                  className="relative mt-6 flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit(e.currentTarget)
                  }}
                >
                  <ErrorSummary errors={errors} />
                  <Honeypot />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="First name"
                      value={t.first}
                      onChange={(v) => setT((p) => ({ ...p, first: v }))}
                      error={errors.first}
                      autoComplete="given-name"
                    />
                    <TextField
                      label="Email or mobile number"
                      value={t.contact}
                      onChange={(v) =>
                        setT((p) => ({
                          ...p,
                          contact: v,
                          remind: isPhone(v) ? p.remind : false,
                        }))
                      }
                      error={errors.contact}
                      help="We send your tour details here."
                      autoComplete="email"
                    />
                  </div>
                  {noteOpen ? (
                    <Field label="Note (300 characters)">
                      {(p) => (
                        <Textarea
                          {...p}
                          maxLength={300}
                          rows={3}
                          value={t.note || noteDefault}
                          onChange={(e) =>
                            setT((q) => ({ ...q, note: e.target.value }))
                          }
                          className="min-h-24"
                        />
                      )}
                    </Field>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-1.5 self-start text-label text-link"
                      onClick={() => setNoteOpen(true)}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Add a note
                    </button>
                  )}
                  <CheckRow
                    disabled={!isPhone(t.contact)}
                    checked={t.remind}
                    onChange={(c) => setT((p) => ({ ...p, remind: c }))}
                  >
                    Text me a reminder 24 hours and 2 hours before
                    {!isPhone(t.contact) ? (
                      <span className="text-muted-foreground">
                        {" "}
                        (enter a mobile number to use this)
                      </span>
                    ) : null}
                  </CheckRow>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button type="button" variant="ghost" onClick={() => go(2)}>
                      Back
                    </Button>
                    <Button type="submit" loading={busy}>
                      Book my tour
                    </Button>
                    <TextLink href="/contact?topic=tour">
                      Request info instead
                    </TextLink>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Free. No card. We use your details only to book this tour.{" "}
                    <Link href="/legal/privacy" className="underline">
                      Privacy policy
                    </Link>
                    .
                  </p>
                </form>
              </section>
            ) : null}
          </div>
          {c ? (
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-8 rounded-lg bg-muted p-4 text-body">
                <h2 className="text-body-strong">Your tour</h2>
                <p className="mt-2 font-semibold">{c.name}</p>
                {t.day !== null ? (
                  <p className="tabular">{dateLabel(t.day, true)}</p>
                ) : (
                  <p className="text-muted-foreground">Pick a day</p>
                )}
                {t.time !== null ? (
                  <p className="tabular">{fmtTime(t.time)}</p>
                ) : null}
              </div>
            </aside>
          ) : null}
        </Container>
      </main>
    </>
  )
}

export function TourConfirmed() {
  const [t, , ready] = useTour()
  const { clubBySlug } = useCatalog()
  const c = t.club ? clubBySlug(t.club) : null
  if (!ready) return null
  if (!c || t.day === null || t.time === null || !t.id)
    return (
      <Container className="py-16">
        <EmptyState
          title="We could not find a booking."
          text="Start a new one. It takes about a minute."
        >
          <LinkButton href="/tour">Book a free tour</LinkButton>
        </EmptyState>
      </Container>
    )
  const rows = [
    ["Get directions", "https://maps.apple.com/"],
    ["Message the club", `/contact?topic=tour&club=${c.slug}`],
    ["Club details", `/clubs/${c.slug}`],
    ["Reschedule or cancel", "/tour"],
  ]
  return (
    <Container className="grid gap-8 py-10 lg:grid-cols-12 lg:py-16">
      <div className="lg:col-span-7 lg:col-start-2">
        <CircleCheck className="size-12 text-success" aria-hidden="true" />
        <h1
          className="font-display-wide mt-3 text-h1 lg:text-display"
          tabIndex={-1}
          id="confirmed-title"
        >
          You&apos;re booked{t.first ? `, ${t.first}` : ""}.
        </h1>
        <p className="tabular mt-2 text-body">
          {dateLabel(t.day, true)} at {fmtTime(t.time)} · {c.name}
        </p>
        <div className="mt-6 rounded-lg bg-card p-5 text-body edge ring-border">
          <p>
            {c.cross}, {c.city}, AZ {c.zip}
          </p>
          <p className="mt-1 text-muted-foreground">
            {c.parking} Ask for a coach at the front desk.
          </p>
          <p className="mt-1">
            <a
              className="font-semibold text-link underline-offset-4 hover:underline"
              href={`tel:${c.tel}`}
            >
              {c.phone}
            </a>
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <LinkButton
            href="/tour/confirmed#cal"
            onClick={(e) => {
              e.preventDefault()
              const stamp = (d: Date) =>
                d
                  .toISOString()
                  .replace(/[-:]/g, "")
                  .replace(/\.\d{3}/, "")
              if (t.day === null || t.time === null) return
              const start = slotInstant(t.day, t.time)
              const end = new Date(start.getTime() + 30 * 60_000)
              const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Cactus Peak Athletic//Tour//EN\nBEGIN:VEVENT\nUID:${t.id}@cactuspeakathletic.com\nDTSTAMP:${stamp(new Date())}\nDTSTART:${stamp(start)}\nDTEND:${stamp(end)}\nSUMMARY:Tour at ${c.name}\nLOCATION:${c.cross}, ${c.city} AZ\nEND:VEVENT\nEND:VCALENDAR`
              const a = document.createElement("a")
              a.href = URL.createObjectURL(
                new Blob([ics], { type: "text/calendar" })
              )
              a.download = "cactus-peak-tour.ics"
              a.click()
            }}
            size="lg"
          >
            Add to calendar
          </LinkButton>
        </div>
        <ul className="mt-6 border-t border-border">
          {rows.map(([l, h]) => (
            <li key={l}>
              <a
                href={h}
                className="flex min-h-12 items-center justify-between border-b border-border text-label hover:underline"
              >
                <span>{l}</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
        <h2 className="font-display-wide mt-10 text-h3">What to bring</h2>
        <p className="mt-2 text-body">
          Photo ID if you want a 3-day pass. Workout clothes if you want to try
          a class. Your questions for the coach.
        </p>
        <p className="mt-6 text-body">
          Want to try a class too?{" "}
          <TextLink href="/trial" className="inline-flex">
            Get a free 3-day pass
          </TextLink>
        </p>
        <LinkButton href="/" variant="outline" className="mt-4">
          Done
        </LinkButton>
        {t.remind ? (
          <p className="mt-4 text-caption text-muted-foreground">
            We will text you 24 hours and 2 hours before.
          </p>
        ) : null}
      </div>
    </Container>
  )
}
