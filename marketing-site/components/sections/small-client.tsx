"use client"

import Link from "next/link"
import { useState } from "react"
import { Tabs } from "@/components/graphical"
import { Check, Share2 } from "@/components/icons"
import { useBooking } from "@/components/site/booking"
import { useCatalog, useClubNow } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { SelectControl, Textarea } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitContact, submitSignup } from "@/lib/forms/actions"
import { isEmail } from "@/lib/store"
import { dayInfo } from "@/lib/time"
import type { ClubSlug, Session } from "@/lib/types"
import {
  ErrorSummary,
  Field,
  focusErrors,
  Honeypot,
  honeypotOf,
  serverErrors,
  TextField,
} from "./flow-ui"

export function HandoffButton({
  label,
  classSlug,
  club,
  start,
  day = 0,
  variant = "outline",
}: {
  label: string
  classSlug: string
  club: ClubSlug
  start: number
  day?: number
  variant?: "outline" | "primary"
}) {
  const { open } = useBooking()
  const { classBySlug, clubBySlug } = useCatalog()
  const now = useClubNow()
  const ct = classBySlug(classSlug)
  const c = clubBySlug(club)
  if (!ct || !c) return null
  // A stand-in session for the sign-in hand-off dialog. Reservations (courts, lanes) are not in the class timetable.
  const session: Session = {
    id: `handoff-${club}-${classSlug}`,
    classSlug,
    className: ct.name,
    category: ct.category,
    categoryName: ct.categoryName,
    duration: ct.duration,
    level: ct.level,
    unit: ct.unit,
    clubSlug: club,
    clubName: c.name,
    clubShort: c.short,
    day,
    date: dayInfo(day, now.dayNum).iso,
    start,
    room: "",
    coach: null,
    coachSlug: null,
    capacity: ct.capacity,
    left: ct.capacity,
    waitlist: 0,
  }
  return (
    <Button variant={variant} onClick={() => open(session, "book")}>
      {label}
    </Button>
  )
}

export function ShareButton({
  label = "Send this to a parent",
}: {
  label?: string
}) {
  const [msg, setMsg] = useState("")
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          const url = window.location.href
          try {
            if (navigator.share)
              await navigator.share({ title: "Cactus Peak Athletic", url })
            else {
              await navigator.clipboard.writeText(url)
              setMsg("Link copied.")
            }
          } catch {
            setMsg("")
          }
        }}
      >
        <Share2 aria-hidden="true" />
        {label}
      </Button>
      <span role="status" className="text-caption text-muted-foreground">
        {msg}
      </span>
    </>
  )
}

export function Tabs2<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  // Graphical Tabs. The callers filter one list below, so there are no tab panels; the props stay as they were.
  return (
    <Tabs.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <Tabs.List aria-label={label} className="scrollbar-none overflow-x-auto">
        {items.map((t) => (
          <Tabs.Tab key={t.id} value={t.id} className="min-h-11 shrink-0">
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}

export function ContactForm({
  defaults,
}: {
  defaults: { topic?: string; club?: string }
}) {
  const [v, setV] = useState({
    first: "",
    email: "",
    topic: defaults.topic ?? "",
    club: defaults.club ?? "",
    message: "",
    hp: "",
  })
  const { clubs } = useCatalog()
  const now = useClubNow()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // We answer by the next weekday.
  const replyBy = (() => {
    for (let i = 1; i < 4; i++) {
      const d = dayInfo(i, now.dayNum)
      if (!d.weekend) return `${d.short}, ${d.month} ${d.dom}`
    }
    return "Monday"
  })()
  const submit = async () => {
    const e: Record<string, string> = {}
    if (!v.first.trim()) e.first = "Enter your first name."
    if (!isEmail(v.email)) e.email = "Enter an email like name@example.com."
    if (v.message.trim().length < 10)
      e.message = "Write at least 10 characters so we can help."
    setErrors(e)
    if (Object.keys(e).length) {
      focusErrors()
      return
    }
    setBusy(true)
    const r = await submitContact({
      first: v.first,
      email: v.email,
      topic: v.topic,
      club: v.club,
      message: v.message,
      company: v.hp,
    }).catch(() => null)
    setBusy(false)
    if (!r?.ok) {
      setErrors(
        r
          ? serverErrors(r)
          : { form: "We could not send that. Check your connection." }
      )
      focusErrors()
      return
    }
    setSent(v.first)
    setV((x) => ({ ...x, message: "" }))
  }
  if (sent)
    return (
      <div role="status" className="rounded-lg bg-card p-6 edge ring-border">
        <Check className="size-8 text-success" aria-hidden="true" />
        <h3 className="font-display-wide mt-2 text-h2">Thanks, {sent}.</h3>
        <p className="mt-1 text-body">We will reply by {replyBy}.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSent(null)}
        >
          Send another
        </Button>
      </div>
    )
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="relative flex flex-col gap-5 rounded-lg bg-card p-6 edge ring-border"
    >
      <ErrorSummary errors={errors} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          value={v.first}
          onChange={(x) => setV({ ...v, first: x })}
          error={errors.first}
          autoComplete="given-name"
        />
        <TextField
          label="Email"
          type="email"
          value={v.email}
          onChange={(x) => setV({ ...v, email: x })}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Topic">
          {(p) => (
            <SelectControl
              {...p}
              value={v.topic}
              onChange={(topic) => setV({ ...v, topic })}
              options={[
                { value: "", label: "Choose a topic" },
                ...[
                  "Tour or pass",
                  "Membership",
                  "Billing",
                  "Kids club",
                  "Press",
                  "Something else",
                ].map((t) => ({ value: t, label: t })),
              ]}
            />
          )}
        </Field>
        <Field label="Club (optional)">
          {(p) => (
            <SelectControl
              {...p}
              value={v.club}
              onChange={(club) => setV({ ...v, club })}
              options={[
                { value: "", label: "Any club" },
                ...clubs.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
          )}
        </Field>
      </div>
      <Field label="Message" help="How can we help?" error={errors.message}>
        {(p) => (
          <Textarea
            {...p}
            rows={5}
            maxLength={1000}
            value={v.message}
            onChange={(e) => setV({ ...v, message: e.target.value })}
          />
        )}
      </Field>
      {v.message.length >= 900 ? (
        <p className="tabular text-caption">{v.message.length} of 1000</p>
      ) : null}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="contact-hp">
          Leave empty
          <Input
            id="contact-hp"
            tabIndex={-1}
            autoComplete="off"
            value={v.hp}
            onChange={(e) => setV({ ...v, hp: e.target.value })}
          />
        </label>
      </div>
      <Button type="submit" className="self-start" loading={busy}>
        Send message
      </Button>
      <p className="text-caption text-muted-foreground">
        We use this to answer you.{" "}
        <Link href="/legal/privacy" className="underline">
          Privacy policy
        </Link>
        .
      </p>
    </form>
  )
}

export function NewsletterStrip() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<
    "idle" | "error" | "ok" | "busy" | "failed"
  >("idle")
  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault()
        if (state === "busy") return
        if (!isEmail(email)) return setState("error")
        setState("busy")
        const r = await submitSignup({
          email,
          source: "newsletter",
          company: honeypotOf(e.currentTarget),
        }).catch(() => null)
        setState(r?.ok ? "ok" : r && !r.ok && r.fields ? "error" : "failed")
      }}
      className="relative flex flex-col gap-2"
    >
      <Honeypot />
      <label htmlFor="nl" className="text-label">
        Email
      </label>
      <div className="flex gap-2">
        <Input
          id="nl"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setState("idle")
          }}
          aria-invalid={state === "error"}
          className="bg-card"
        />
        <Button type="submit" variant="outline" loading={state === "busy"}>
          Subscribe
        </Button>
      </div>
      <p role="status" className="text-caption text-muted-foreground">
        {state === "ok"
          ? "Subscribed. One note a month."
          : state === "error"
            ? "Enter an email like name@example.com."
            : state === "failed"
              ? "We could not subscribe you. Try again in a minute."
              : "One note a month. No spam."}
      </p>
    </form>
  )
}
