"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClubCard } from "@/components/brand/club-parts"
import { Check, CircleCheck } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
import { useMyClub } from "@/components/site/club-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectControl } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitTrial } from "@/lib/forms/actions"
import { isEmailOrPhone, useSessionState } from "@/lib/store"
import { Breadcrumbs, Container, TourTimeline } from "./common"
import {
  ErrorSummary,
  Field,
  focusErrors,
  Honeypot,
  honeypotOf,
  serverErrors,
  TextField,
} from "./flow-ui"

type Pass = {
  club: string
  first: string
  contact: string
  remind: boolean
  id: string
}
const INIT: Pass = { club: "", first: "", contact: "", remind: false, id: "" }
export const usePass = () => useSessionState<Pass>("cpa_pass", INIT)

export function TrialFlow() {
  const sp = useSearchParams()
  const router = useRouter()
  const { club: mine } = useMyClub()
  const { clubs } = useCatalog()
  const [p, setP] = usePass()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [club, setClub] = useState("")
  const [locked, setLocked] = useState(false)
  // Reads the email handed over from the Home band row (sessionStorage, never the URL) once after mount.
  useEffect(() => {
    try {
      const e = sessionStorage.getItem("cpa_trial_email")
      if (e) {
        setP((q) => ({ ...q, contact: q.contact || e }))
        setLocked(true)
      }
    } catch {}
  }, [setP])
  const val = club || sp.get("club") || mine?.slug || ""
  const submit = async (form: HTMLFormElement) => {
    const e: Record<string, string> = {}
    if (!val) e.club = "Pick a club."
    if (!p.first.trim()) e.first = "Enter your first name."
    if (!isEmailOrPhone(p.contact))
      e.contact =
        "Enter an email like name@example.com or a 10-digit mobile number."
    setErrors(e)
    if (Object.keys(e).length) {
      focusErrors()
      return
    }
    setBusy(true)
    const r = await submitTrial({
      club: val,
      firstName: p.first,
      contact: p.contact,
      remind: p.remind,
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
    // The pass code and the visitor's details stay in this tab's sessionStorage for the confirmation page.
    setP((q) => ({ ...q, club: val, id: r.code }))
    router.push("/trial/confirmed")
  }
  return (
    <>
      <MinimalCheckoutHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Breadcrumbs trail={[{ label: "Free 3-day pass" }]} />
        <Container className="grid gap-10 pt-4 pb-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="font-display-wide text-h1 lg:text-display">
              Try us for 3 days. Free.
            </h1>
            <p className="mt-4 max-w-[48ch] text-body">
              Use one club for 3 days. Take any class that has room. No card, no
              catch.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-body">
              {[
                "Classes and pools at one club",
                "Strength and cardio floor",
                "A coach to say hello",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="size-5 text-success" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-body text-muted-foreground">
              Courts and the recovery suite are not part of the pass. Ask about
              them on a tour.
            </p>
            <h2 className="sr-only">What happens next</h2>
            <div className="mt-10">
              <TourTimeline
                labels={["Today", "Your first visit", "Day 3"]}
                steps={[
                  { title: "Get your pass.", text: "We email it and text it." },
                  {
                    title: "Show it at the desk.",
                    text: "Bring photo ID. Your 3 days start now.",
                  },
                  {
                    title: "Your pass ends.",
                    text: "No charge. Nothing to cancel.",
                  },
                ]}
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                submit(e.currentTarget)
              }}
              className="relative flex flex-col gap-5 rounded-lg bg-card p-6 edge ring-border lg:sticky lg:top-8"
            >
              <h2 className="font-display-wide text-h2">Get my free pass.</h2>
              <ErrorSummary errors={errors} />
              <Honeypot />
              <Field label="Club" error={errors.club}>
                {(a) => (
                  <SelectControl
                    {...a}
                    value={val}
                    onChange={setClub}
                    options={[
                      { value: "", label: "Choose a club" },
                      ...clubs.map((c) => ({ value: c.slug, label: c.name })),
                    ]}
                  />
                )}
              </Field>
              <TextField
                label="First name"
                value={p.first}
                onChange={(v) => setP((q) => ({ ...q, first: v }))}
                error={errors.first}
                autoComplete="given-name"
              />
              <Field
                label="Email or mobile number"
                error={errors.contact}
                help="We send your pass here."
              >
                {(a) => (
                  <div className="flex gap-2">
                    <Input
                      {...a}
                      value={p.contact}
                      readOnly={locked}
                      onChange={(e) =>
                        setP((q) => ({ ...q, contact: e.target.value }))
                      }
                      className="bg-card"
                      autoComplete="email"
                    />
                    {locked ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLocked(false)}
                      >
                        Change
                      </Button>
                    ) : null}
                  </div>
                )}
              </Field>
              <CheckRow
                checked={p.remind}
                onChange={(c) => setP((q) => ({ ...q, remind: c }))}
              >
                Text me a reminder on day 2
              </CheckRow>
              <Button type="submit" size="lg" loading={busy}>
                Get my free pass
              </Button>
              <p className="text-caption text-muted-foreground">
                One pass per person every 12 months. Ages 18 and up. Your 3 days
                start at your first check-in. No card needed. By continuing you
                agree to our{" "}
                <Link className="underline" href="/legal/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link className="underline" href="/legal/privacy">
                  Privacy policy
                </Link>
                .
              </p>
              <TextLink href="/tour">
                Prefer a guided look? Book a free tour.
              </TextLink>
            </form>
          </div>
        </Container>
      </main>
    </>
  )
}

/** Sample QR: a deterministic pattern with the three finder squares. A real build renders a code from the pass ID server side. */
function SampleQR({ seed }: { seed: string }) {
  const N = 25
  const st = { h: 11 }
  for (const ch of seed) st.h = (st.h * 33 + ch.charCodeAt(0)) >>> 0
  const rnd = () => {
    st.h = (st.h * 1664525 + 1013904223) >>> 0
    return st.h / 2 ** 32
  }
  const cells: boolean[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => rnd() > 0.52)
  )
  const finder = (x: number, y: number) => {
    for (let i = -1; i < 8; i++)
      for (let j = -1; j < 8; j++) {
        const xx = x + i,
          yy = y + j
        if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue
        const edge = i === 0 || j === 0 || i === 6 || j === 6
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4
        cells[yy][xx] = i >= 0 && j >= 0 && i <= 6 && j <= 6 && (edge || core)
      }
  }
  finder(0, 0)
  finder(N - 7, 0)
  finder(0, N - 7)
  return (
    <svg
      viewBox={`0 0 ${N} ${N}`}
      className="size-full"
      role="img"
      aria-label="Sample QR code"
      shapeRendering="crispEdges"
    >
      {cells.flatMap((r, y) =>
        r.map((on, x) =>
          on ? (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: decorative QR cells are a static grid
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              style={{ fill: "var(--neutral-10)" }}
            />
          ) : null
        )
      )}
    </svg>
  )
}

export function TrialConfirmed() {
  const [p, , ready] = usePass()
  const { clubBySlug } = useCatalog()
  if (!ready) return null
  const c = clubBySlug(p.club)
  if (!c || !p.id)
    return (
      <Container className="py-16">
        <h1 className="font-display-wide text-h1">No pass yet.</h1>
        <LinkButton href="/trial" className="mt-4">
          Get my free pass
        </LinkButton>
      </Container>
    )
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-12 lg:py-16">
      <div className="lg:col-span-5 lg:col-start-2">
        <CircleCheck className="size-12 text-success" aria-hidden="true" />
        <h1 className="font-display-wide mt-3 text-h1">
          Your pass is ready{p.first ? `, ${p.first}` : ""}.
        </h1>
        <p className="mt-2 text-body">
          Show it at the {c.name} desk. Bring photo ID.
        </p>
        <div className="rounded-xl mt-6 bg-card p-6 edge ring-border">
          <div className="mx-auto size-60 rounded-lg bg-surface p-3 edge ring-border">
            <SampleQR seed={p.id} />
          </div>
          <p className="eyebrow mt-4 text-muted-foreground">3-day pass</p>
          <p className="font-display-wide text-h3">{c.name}</p>
          <p className="text-body text-muted-foreground">
            Valid for 3 days from your first visit
          </p>
          <p className="tabular mt-2 font-data text-h1 font-bold">
            PASS {p.id}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => window.print()}>
            Save a copy
          </Button>
          <button
            type="button"
            className="min-h-11 text-label text-link underline-offset-4 hover:underline"
          >
            Email it to me again
          </button>
          <LinkButton href="/" variant="outline">
            Done
          </LinkButton>
        </div>
      </div>
      <div className="lg:col-span-5">
        <TextLink href={`/schedule?club=${c.slug}&firstTimer=1`}>
          Next: pick a class
        </TextLink>
        <div className="mt-6 rounded-lg bg-muted p-5">
          <h2 className="font-display-wide text-h3">Want a guided look?</h2>
          <p className="mt-1 text-caption">
            Book a free tour on your first day.
          </p>
          <LinkButton
            href={`/tour?club=${c.slug}`}
            variant="outline"
            className="mt-3"
          >
            Book a free tour
          </LinkButton>
        </div>
        <div className="mt-6 rounded-lg bg-card edge ring-border">
          <ClubCard club={c} variant="compact" />
        </div>
        <p className="mt-4 text-body text-muted-foreground">
          {c.cross}, {c.city}. {c.parking}
        </p>
      </div>
    </Container>
  )
}
