"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useApp } from "@/components/app/use-app"
import { SuccessPanel } from "@/components/booking/success-panel"
import { Toggle } from "@/components/graphical"
import {
  Check,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  TriangleAlert,
} from "@/components/icons"
import { Modal } from "@/components/kit/overlays"
import {
  Banner,
  CheckRow,
  EmptyState,
  PageHeader,
  PersonAvatar,
  RadioList,
} from "@/components/kit/ui"
import { StickyBar } from "@/components/reserve/common"
import { DayStrip } from "@/components/schedule/day-strip"
import { Button } from "@/components/ui/button"
import { bookKidsClub, joinKidsWaitlist } from "@/lib/actions"
import { announce } from "@/lib/announce"
import { CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import {
  householdMembers,
  KIDS_BLOCKS,
  kidsLeft,
  opensAt,
  windowDays,
} from "@/lib/engine"
import {
  addDays,
  atTime,
  dateKey,
  dayStart,
  fmtDay,
  fmtDayLong,
  fmtRange,
  fmtTime,
  HOUR,
  parts,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Booking } from "@/lib/types"
import { useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const blockLabel = (from: string, to: string) =>
  fmtRange(atTime(0, from), atTime(0, to)).replace(/\s?([ap])\.m\./, " $1.m.")

const BLOCK_ICON = { k1: Sunrise, k2: Sun, k3: Sunset, k4: Moon } as const
function BlockIcon({ id }: { id: string }) {
  const I = BLOCK_ICON[id as keyof typeof BLOCK_ICON]
  return <I className="size-5 shrink-0" aria-hidden="true" />
}

export default function KidsClubPage() {
  const { s, hh, now, club: viewing } = useApp()
  const router = useRouter()
  const offline = useOffline()
  const kidsClubs = CLUBS.filter((c) => c.kidsClub)
  const [clubSlug, setClubSlug] = useState(
    CLUB_BY_SLUG[viewing].kidsClub ? viewing : kidsClubs[0].slug
  )
  const members = householdMembers(s, hh.id)
  const children = members.filter((m) => m.role === "child")
  const teens = members.filter((m) => m.role === "teen")
  const [kids, setKids] = useState<string[]>(
    children.filter((c) => !!c.allergyNotes).map((c) => c.id)
  )
  const today = dayStart(now)
  const [day, setDay] = useState(today)
  const [blocks, setBlocks] = useState<string[]>([])
  const [pickup, setPickup] = useState<string[]>(
    members
      .filter((m) => m.role === "primary" || m.role === "adult")
      .map((m) => m.id)
  )
  const [notesOk, setNotesOk] = useState(false)
  const [wl, setWl] = useState<string | null>(null)
  const [wlOk, setWlOk] = useState(false)
  const [done, setDone] = useState<{ bookings: Booking[]; ref: string } | null>(
    null
  )
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const win = windowDays(hh.plan)
  const sunday = parts(day).dow === 0
  const opens = opensAt(day + 9 * HOUR, win)
  const notOpen = now < opens
  const club = CLUB_BY_SLUG[clubSlug]
  if (!children.length)
    return (
      <div>
        <PageHeader
          eyebrow="Reserve"
          title="Kids club"
          backHref="/reserve"
          backLabel="Reserve"
        />
        <EmptyState
          object="playground"
          title="No children on your plan yet."
          body="Add a child to book kids club."
          action={
            <Button render={<Link href="/family/add" />}>Add a child</Button>
          }
        />
      </div>
    )
  const chosen = children.filter((c) => kids.includes(c.id))
  const toggleBlock = (id: string) =>
    setBlocks((b) =>
      b.includes(id)
        ? b.filter((x) => x !== id)
        : b.length >= 2
          ? b
          : [...b, id]
    )
  const book = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 450))
    const r = bookKidsClub({ clubSlug, childIds: kids, day, blocks })
    setBusy(false)
    if (r.ok) {
      setDone({ bookings: r.bookings, ref: r.ref })
      announce(
        `${chosen.map((c) => c.firstName).join(" and ")} ${chosen.length > 1 ? "are" : "is"} booked.`
      )
    } else {
      setError(r.message)
      announce(r.message)
    }
  }
  if (done) {
    const first = done.bookings[0]
    return (
      <div className="max-w-[560px]">
        <SuccessPanel
          pill="Kids club booked"
          headline={`${chosen.map((c) => c.firstName).join(" and ")}, ${fmtDay(first.start)}`}
          summary={[
            {
              label: "When",
              value: `${fmtDay(first.start)} · ${blocks
                .map((b) => {
                  const k = KIDS_BLOCKS.find((x) => x.id === b)!
                  return fmtRange(atTime(day, k.from), atTime(day, k.to))
                })
                .join(", ")}`,
            },
            { label: "Where", value: club.name },
            {
              label: "Children",
              value: chosen.map((c) => c.firstName).join(", "),
            },
            { label: "Reference", value: done.ref },
          ]}
          event={{
            title: `Kids club: ${chosen.map((c) => c.firstName).join(", ")}`,
            start: first.start,
            end: first.end,
            location: club.address,
          }}
          extra={
            <p className="text-caption text-muted-foreground">
              Check in at {club.name} before drop-off and stay in the club. An
              unclaimed block is released 15 minutes after it starts.
            </p>
          }
          rows={[
            { label: "Show passes", href: "/pass" },
            {
              label: "Call the club",
              href: `tel:${club.phone.replace(/\D/g, "")}`,
            },
          ]}
          onDone={() => router.push("/bookings")}
          doneLabel="See my bookings"
        />
      </div>
    )
  }
  const sum = (n: number, text: string, edit: () => void) => (
    <div className="flex items-center justify-between gap-3 py-3 rule-t">
      <p className="text-body">
        <span className="mr-3 num text-body text-muted-foreground">{n}</span>
        {text}
      </p>
      <Button variant="ghost" size="sm" onClick={edit}>
        Change
      </Button>
    </div>
  )
  return (
    <div className="flex flex-col gap-6 pb-28">
      <PageHeader
        eyebrow="Reserve"
        title="Kids club"
        description="2-hour blocks, Monday to Saturday. Ages 6 months to 12 years. You check in at the same club."
        backHref="/reserve"
        backLabel="Reserve"
      />
      {/* 1 Club */}
      <section aria-labelledby="k1">
        {step > 1 ? (
          sum(1, `Club: ${club.name}`, () => setStep(1))
        ) : (
          <div className="flex flex-col gap-3">
            <h2 id="k1" className="font-heading text-h3 display-stretch">
              <span className="mr-3 num text-body text-muted-foreground">
                1
              </span>
              Which club?
            </h2>
            {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: list markup and divider styling are kept, the role names the widget */}
            <ul className="rule-rows" role="radiogroup" aria-label="Club">
              {CLUBS.map((c) => (
                <li key={c.slug}>
                  {/* biome-ignore lint/a11y/useSemanticElements: radio row with custom layout, a native radio input cannot wrap this content */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={clubSlug === c.slug}
                    disabled={!c.kidsClub}
                    onClick={() => setClubSlug(c.slug)}
                    className={cn(
                      "flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left",
                      !c.kidsClub && "opacity-60"
                    )}
                  >
                    <span>
                      <span className="block text-label">{c.name}</span>
                      <span className="block text-caption text-muted-foreground">
                        {c.kidsClub
                          ? `Kids club here · ${kidsLeft(s, c.slug, day, KIDS_BLOCKS[0])} spots left ${fmtTime(atTime(day, "08:00"))}`
                          : "No kids club here"}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-5 place-items-center rounded-full border-2 border-input",
                        clubSlug === c.slug && "border-foreground"
                      )}
                    >
                      {clubSlug === c.slug ? (
                        <span className="size-2.5 rounded-full bg-foreground" />
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Button className="w-fit" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}
      </section>
      {/* 2 Children */}
      {step >= 2 ? (
        <section aria-labelledby="k2">
          {step > 2 ? (
            sum(
              2,
              `Children: ${chosen.map((c) => `${c.firstName} (${c.age})`).join(", ")}`,
              () => setStep(2)
            )
          ) : (
            <div className="flex flex-col gap-3">
              <h2 id="k2" className="font-heading text-h3 display-stretch">
                <span className="mr-3 num text-body text-muted-foreground">
                  2
                </span>
                Who is going?
              </h2>
              <ul className="flex flex-col rule-rows">
                {children.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-3">
                    <CheckRow
                      checked={kids.includes(c.id)}
                      disabled={!c.allergyNotes}
                      onChange={(on) =>
                        setKids((k) =>
                          on ? [...k, c.id] : k.filter((x) => x !== c.id)
                        )
                      }
                    >
                      <span className="flex items-center gap-3">
                        <PersonAvatar
                          name={c.firstName}
                          hue={c.hue}
                          size={40}
                        />
                        <span>
                          <span className="block text-label">
                            {c.firstName}, {c.age}
                          </span>
                          <span className="block text-caption text-muted-foreground">
                            {c.allergyNotes ? (
                              "Ready"
                            ) : (
                              <>
                                Add allergy notes first.{" "}
                                <Link
                                  href={`/family/${c.id}`}
                                  className="text-link underline"
                                >
                                  Add notes
                                </Link>
                              </>
                            )}
                          </span>
                        </span>
                      </span>
                    </CheckRow>
                  </li>
                ))}
              </ul>
              {teens.map((t) => (
                <p key={t.id} className="text-caption text-muted-foreground">
                  {t.firstName}, {t.age}, can book Teen Strength instead.
                </p>
              ))}
              <Button
                className="w-fit"
                disabled={!kids.length}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          )}
        </section>
      ) : null}
      {/* 3 Day and block */}
      {step >= 3 ? (
        <section aria-labelledby="k3">
          {step > 3 ? (
            sum(
              3,
              `${fmtDayLong(day)} · ${blocks
                .map((b) => {
                  const k = KIDS_BLOCKS.find((x) => x.id === b)!
                  return fmtRange(atTime(day, k.from), atTime(day, k.to))
                })
                .join(", ")}`,
              () => setStep(3)
            )
          ) : (
            <div className="flex flex-col gap-3">
              <h2 id="k3" className="font-heading text-h3 display-stretch">
                <span className="mr-3 num text-body text-muted-foreground">
                  3
                </span>
                Day and block
              </h2>
              <DayStrip
                selected={day}
                onSelect={(d) => {
                  setDay(d)
                  setBlocks([])
                }}
                now={now}
                windowDays={win}
                label="Choose a day"
              />
              <p className="text-detail text-muted-foreground">
                <span className="rounded-xs bg-muted px-2 py-0.5">
                  Arizona time (no daylight saving)
                </span>
              </p>
              {sunday ? (
                <Banner tone="neutral" title="Closed Sundays">
                  Kids club runs Monday to Saturday. Pick another day.
                </Banner>
              ) : notOpen ? (
                <Banner
                  tone="neutral"
                  title={`${fmtDay(day)} kids club opens ${fmtDay(opens)} at ${fmtTime(opens)}`}
                />
              ) : (
                // biome-ignore lint/a11y/useSemanticElements: labelled list of toggle cards, a fieldset would change the list markup and styles
                <ul
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  role="group"
                  aria-label="Kids club blocks"
                >
                  {KIDS_BLOCKS.map((k) => {
                    const left = kidsLeft(s, clubSlug, day, k)
                    const start = atTime(day, k.from)
                    const past = start < now
                    const need = kids.length
                    const short = left < need
                    const on = blocks.includes(k.id)
                    return (
                      <li key={k.id}>
                        <Toggle
                          pressed={on}
                          disabled={past}
                          onPressedChange={() =>
                            short ? setWl(k.id) : toggleBlock(k.id)
                          }
                          className="flex min-h-24 w-full flex-col items-start justify-between gap-2 text-left whitespace-normal"
                        >
                          <span className="flex items-center gap-2">
                            <BlockIcon id={k.id} />
                            <span className="num text-body-strong">
                              {fmtRange(atTime(day, k.from), atTime(day, k.to))}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "text-caption",
                              left < 3 && !on && "text-warning"
                            )}
                          >
                            {left === 0 ? (
                              "Full"
                            ) : short ? (
                              `${left} left. Need ${need}.`
                            ) : left < 3 ? (
                              <span className="inline-flex items-center gap-1">
                                <TriangleAlert
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                Only {left} left
                              </span>
                            ) : (
                              `${left} spots left`
                            )}
                            {on ? (
                              <Check
                                className="ml-2 inline size-4"
                                aria-label="Selected"
                              />
                            ) : null}
                          </span>
                          {short ? (
                            <span className="text-detail underline">
                              Join waitlist
                            </span>
                          ) : null}
                        </Toggle>
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="text-detail text-muted-foreground">
                Up to 2 blocks per child per day.
              </p>
              <Button
                className="w-fit"
                disabled={!blocks.length}
                onClick={() => setStep(4)}
              >
                Continue
              </Button>
            </div>
          )}
        </section>
      ) : null}
      {step >= 4 ? (
        <section aria-labelledby="k4" className="flex flex-col gap-4">
          <h2 id="k4" className="font-heading text-h3 display-stretch">
            <span className="mr-3 num text-body text-muted-foreground">4</span>
            Review
          </h2>
          <ul className="rule-rows">
            {chosen.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="flex items-center gap-3">
                  <PersonAvatar name={c.firstName} hue={c.hue} size={32} />
                  <span className="text-label">
                    {c.firstName}, {c.age}
                  </span>
                </span>
                <span className="num text-caption text-muted-foreground">
                  {blocks
                    .map((b) => {
                      const k = KIDS_BLOCKS.find((x) => x.id === b)!
                      return fmtRange(atTime(day, k.from), atTime(day, k.to))
                    })
                    .join(" and ")}
                </span>
              </li>
            ))}
          </ul>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label">Authorised pick-up adults</legend>
            {members
              .filter((m) => m.role === "primary" || m.role === "adult")
              .map((m) => (
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
          <CheckRow checked={notesOk} onChange={setNotesOk}>
            Allergy and medical notes are up to date
          </CheckRow>
          <p className="text-caption text-muted-foreground">
            You check in at {club.name} before drop-off and stay in the club.
            Free to cancel. Please give 2 hours&apos; notice. Included with your
            membership.
          </p>
          {error ? (
            <p
              role="alert"
              className="text-caption font-semibold text-destructive"
            >
              {error}
            </p>
          ) : null}
        </section>
      ) : null}
      {step >= 4 ? (
        <StickyBar>
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 lg:px-8">
            <p className="min-w-0 flex-1 basis-64 text-caption">
              {chosen.map((c) => c.firstName).join(", ")} ·{" "}
              <span className="num">{fmtDay(day)}</span> · {club.name}
            </p>
            <Button
              size="lg"
              disabled={!notesOk || !pickup.length || offline}
              loading={busy}
              onClick={() => void book()}
            >
              Book kids club
            </Button>
          </div>
        </StickyBar>
      ) : null}
      <Modal
        open={!!wl}
        onOpenChange={(o) => {
          if (!o) {
            setWl(null)
            setWlOk(false)
          }
        }}
        title="Join the kids club waitlist"
        description="Not enough spots for everyone. If spots open, we hold them for 30 minutes and you tap Confirm spot. We stop moving people up 1 hour before the block."
      >
        <CheckRow checked={wlOk} onChange={setWlOk}>
          I understand the hold lasts 30 minutes.
        </CheckRow>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setWl(null)}>
            Pick another block
          </Button>
          <Button
            disabled={!wlOk}
            onClick={() => {
              joinKidsWaitlist({ clubSlug, childIds: kids, day, blockId: wl! })
              setWl(null)
              setWlOk(false)
              toast({
                title: "You're on the waitlist",
                description: "We'll tell you if a spot opens.",
              })
            }}
          >
            Join waitlist
          </Button>
        </div>
      </Modal>
      <RadioList
        label=""
        value=""
        onChange={() => {}}
        options={[]}
        className="hidden"
      />
    </div>
  )
}
void blockLabel
void addDays
void dateKey
