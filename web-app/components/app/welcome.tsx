"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { CheckInPass } from "@/components/app/check-in-pass"
import { useApp } from "@/components/app/use-app"
import { CategoryTile } from "@/components/brand/graphics"
import { Switch, Toggle } from "@/components/graphical"
import { Check } from "@/components/icons"
import { ClubArt } from "@/components/kit/brand-art"
import { CategoryBadge } from "@/components/kit/category"
import { BusynessMeter } from "@/components/kit/ribs"
import { Banner, RadioList, Segmented, SwitchRow } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  addPasskey,
  changeHomeClub,
  setNotifCell,
  setPrefs,
} from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CATEGORIES, CLUBS } from "@/lib/data/catalog"
import { liveBusyness } from "@/lib/engine"
import { toast } from "@/lib/toast"
import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"

const GOALS = [
  [
    "build-strength",
    "Build strength",
    "Barbells, kettlebells, progress you can see.",
  ],
  ["move-more", "Move more", "Classes and pool time that fit your week."],
  ["event", "Train for an event", "A race, a tournament, a trip."],
  ["stay-consistent", "Stay consistent", "Show up on the days you plan to."],
  ["recover", "Recover well", "Mobility, recovery and easy days."],
] as const
const TOPICS = [
  ["reminders", "Class reminders (60 min before)"],
  ["waitlist", "Waitlist and held spots"],
  ["changes", "Booking changes"],
  ["news", "Club news"],
  ["billing", "Billing (email always on)"],
  ["coach", "Coach messages"],
] as const

function Inner() {
  const { s, me, hh, prefs, now } = useApp()
  const router = useRouter()
  const sp = useSearchParams()
  const start = Math.min(5, Math.max(1, Number(sp.get("step")) || 1))
  const [step, setStep] = useState(start)
  const [club, setClub] = useState(me.homeClub)
  const [push, setPush] = useState("")
  useEffect(() => {
    announce(`Step ${step} of 5`)
  }, [step])
  const next = () => {
    setPrefs(me.id, {
      onboardingStep: Math.max(
        prefs.onboardingStep < 6 ? step + 1 : 6,
        step + 1
      ),
    })
    if (step === 1 && club !== me.homeClub) changeHomeClub(me.id, club)
    if (step === 5) {
      setPrefs(me.id, { onboardingStep: 6 })
      toast({ title: "You're set. Here's your first week." })
      router.replace("/today")
    } else setStep(step + 1)
  }
  const skip = () => {
    if (step === 5) {
      setPrefs(me.id, { onboardingStep: 6 })
      router.replace("/today")
    } else {
      setPrefs(me.id, { onboardingStep: step + 1 })
      setStep(step + 1)
    }
  }
  const teen = me.role === "teen"
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <p role="status" className="text-caption text-muted-foreground">
            Step {step} of 5
          </p>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-night transition-[width] dark:bg-on-night"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
      </div>
      {step === 1 ? (
        <section className="flex flex-col gap-4">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h1 display-stretch outline-none"
          >
            Where do you train most?
          </h1>
          {hh.plan === "trailhead" ? (
            <p className="text-caption text-muted-foreground">
              Trailhead books at one club. You can change it once per billing
              cycle.
            </p>
          ) : null}
          {(["Mesa", "Gilbert"] as const).map((city) => (
            <div key={city} role="radiogroup" aria-label={city}>
              <p className="mb-2 eyebrow text-muted-foreground">
                {city} · {CLUBS.filter((c) => c.city === city).length}
              </p>
              <ul className="flex flex-col gap-2">
                {CLUBS.filter((c) => c.city === city).map((c) => (
                  <li key={c.slug}>
                    {/* biome-ignore lint/a11y/useSemanticElements: card-style radio with image and text, a native input cannot wrap this layout */}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={club === c.slug}
                      onClick={() => setClub(c.slug)}
                      className={cn(
                        "grid w-full grid-cols-[88px_1fr] items-center gap-3 rounded-md bg-card p-2 text-left edge ring-border",
                        club === c.slug && "!ring-2 ring-primary"
                      )}
                    >
                      <ClubArt
                        slug={c.slug}
                        ratio="4/3"
                        detail="simple"
                        className="rounded-sm"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-label">
                          {c.name}
                          {club === c.slug ? (
                            <Check
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                          ) : null}
                        </span>
                        <span className="block text-caption text-muted-foreground">
                          {c.personality}
                        </span>
                        <BusynessMeter
                          level={liveBusyness(c.slug, now).level}
                          variant="inline"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
      {step === 2 ? (
        <section className="flex flex-col gap-4">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h1 display-stretch outline-none"
          >
            What do you like?
          </h1>
          <p className="text-muted-foreground">
            Pick as many as you want. We use it to suggest classes.
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Toggle
                  pressed={prefs.interests.includes(c.id as CategoryId)}
                  onPressedChange={() =>
                    setPrefs(me.id, {
                      interests: prefs.interests.includes(c.id as CategoryId)
                        ? prefs.interests.filter((x) => x !== c.id)
                        : [...prefs.interests, c.id as CategoryId],
                    })
                  }
                  className="flex w-full flex-col items-stretch gap-2 text-left whitespace-normal"
                >
                  <CategoryTile
                    category={c.id as CategoryId}
                    cut
                    className="size-16"
                  />
                  <CategoryBadge
                    id={c.id as CategoryId}
                    size="md"
                    nameOnly
                    className="w-fit"
                  />
                </Toggle>
              </li>
            ))}
          </ul>
          <SwitchRow
            checked={prefs.firstTimersFirst}
            onChange={(c) => setPrefs(me.id, { firstTimersFirst: c })}
          >
            Show first-timer classes first
          </SwitchRow>
        </section>
      ) : null}
      {step === 3 ? (
        <section className="flex flex-col gap-5">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h1 display-stretch outline-none"
          >
            What are you aiming for?
          </h1>
          <RadioList
            label="Goal"
            value={prefs.goal}
            onChange={(v) => setPrefs(me.id, { goal: v })}
            options={GOALS.map(([v, l, h]) => ({
              value: v,
              label: l,
              help: h,
            }))}
          />
          <div className="flex flex-col gap-2">
            <p className="text-label">Visits per week</p>
            <Segmented
              label="Visits per week"
              value={prefs.weeklyTarget}
              onChange={(v) => setPrefs(me.id, { weeklyTarget: v })}
              options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({
                value: n,
                label: String(n),
              }))}
            />
            <p className="text-detail text-muted-foreground">
              Rest days count too.
            </p>
          </div>
        </section>
      ) : null}
      {step === 4 ? (
        <section className="flex flex-col gap-4">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h1 display-stretch outline-none"
          >
            How should we reach you?
          </h1>
          {teen && me.parentId ? (
            <Banner
              tone="neutral"
              title={`${s.members[me.parentId].firstName} also gets booking alerts.`}
            />
          ) : null}
          <table className="w-full text-left">
            <caption className="sr-only">
              Notification topics and channels
            </caption>
            <thead>
              <tr className="text-caption text-muted-foreground">
                <th scope="col" className="py-2 font-normal">
                  Topic
                </th>
                {["Push", "Email", "Text"].map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="w-16 text-center font-normal"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOPICS.map(([t, l]) => (
                <tr key={t} className="rule-b">
                  <th scope="row" className="py-3 pr-2 text-body font-normal">
                    {l}
                  </th>
                  {(["push", "email", "text"] as const).map((c) => (
                    <td key={c} className="text-center">
                      <Switch.Root
                        aria-label={`${l}, ${c}`}
                        checked={
                          t === "billing" && c === "email"
                            ? true
                            : prefs.notif[t][c]
                        }
                        disabled={t === "billing" && c === "email"}
                        onCheckedChange={async (on) => {
                          if (
                            c === "push" &&
                            on &&
                            typeof Notification !== "undefined" &&
                            Notification.permission === "default"
                          ) {
                            const r = await Notification.requestPermission()
                            if (r === "denied")
                              setPush(
                                "Push is blocked in this browser. Use email or text."
                              )
                          }
                          setNotifCell(me.id, t, c, !!on)
                        }}
                      >
                        <Switch.Thumb />
                      </Switch.Root>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {push ? (
            <p role="status" className="text-caption text-muted-foreground">
              {push}
            </p>
          ) : null}
        </section>
      ) : null}
      {step === 5 ? (
        <section className="flex flex-col gap-5">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-heading text-h1 display-stretch outline-none"
          >
            Your pass and calendar
          </h1>
          <CheckInPass s={s} member={me} now={now} variant="compact" />
          <div className="flex flex-col gap-2 pt-4 rule-t">
            <p className="text-label">Add your bookings to your calendar</p>
            <p className="num text-caption break-all text-muted-foreground">
              webcal://my.cactuspeakathletic.example/api/calendar/
              {prefs.calendarToken}.ics
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    `webcal://my.cactuspeakathletic.example/api/calendar/${prefs.calendarToken}.ics`
                  )
                  toast({ title: "Link copied" })
                }}
              >
                Copy link
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href="https://calendar.google.com/calendar/r"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Open in Google Calendar
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-4 rule-t">
            <p className="text-label">Add a passkey</p>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => {
                addPasskey("This device")
                toast({ title: "Passkey added" })
              }}
            >
              Add a passkey
            </Button>
          </div>
        </section>
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-[640px] justify-end gap-2">
          {step > 1 ? (
            <Button variant="ghost" onClick={skip}>
              Skip for now
            </Button>
          ) : null}
          <Button onClick={next}>{step === 5 ? "Finish" : "Continue"}</Button>
        </div>
      </div>
    </div>
  )
}
export default function Welcome() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
