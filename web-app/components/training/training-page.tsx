"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { Toggle } from "@/components/graphical"
import { CoachArt } from "@/components/kit/brand-art"
import { Modal } from "@/components/kit/overlays"
import { RibMeter } from "@/components/kit/ribs"
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  RadioList,
  SectionTitle,
  SelectBox,
} from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import {
  CLUB_BY_SLUG,
  CLUBS,
  COACH_FILTERS,
  COACHES,
  PT_PACKS,
  PT_PRICE,
} from "@/lib/data/catalog"
import { ptCreditsLeft, ptOpenSlots } from "@/lib/engine"
import { buyPack } from "@/lib/purchases"
import { fmtDateFull, fmtDay, fmtDowTime, fmtMoney, fmtTime } from "@/lib/time"
import { toast } from "@/lib/toast"
import type { Coach } from "@/lib/types"

export function CoachCard({
  c,
  s,
  now,
}: {
  c: Coach
  s: Parameters<typeof ptOpenSlots>[0]
  now: number
}) {
  const next = ptOpenSlots(s, c.slug, now)[0]
  return (
    <Link
      href={`/training/coaches/${c.slug}`}
      className="group grid min-h-20 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 py-4"
    >
      <CoachArt name={c.name} roles={c.specialties} size={64} />
      <span className="min-w-0">
        <span className="block text-body-strong group-hover:underline">
          {c.name}
        </span>
        <span className="block text-caption text-muted-foreground">
          {c.specialties.join(" · ")} ·{" "}
          {c.clubs.map((x) => CLUB_BY_SLUG[x].name.split(" – ")[1]).join(", ")}
        </span>
      </span>
      <span className="text-right num text-caption">
        {next ? (
          <>
            Next open
            <br />
            {fmtDowTime(next)}
          </>
        ) : (
          "No open times"
        )}
      </span>
    </Link>
  )
}

export default function TrainingPage() {
  const { s, me, hh, now } = useApp()
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("")
  const [club, setClub] = useState("all")
  const [packOpen, setPackOpen] = useState(false)
  const [pack, setPack] = useState("8")
  const [match, setMatch] = useState(false)
  const [goal, setGoal] = useState("return")
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])
  const left = ptCreditsLeft(hh)
  const nextPt = s.bookings
    .filter(
      (b) =>
        b.kind === "pt" &&
        b.memberId === me.id &&
        b.status === "booked" &&
        b.start > now
    )
    .sort((a, b) => a.start - b.start)[0]
  const list = COACHES.filter(
    (c) =>
      (!filter ||
        c.tags.includes(filter) ||
        c.specialties.some((x) =>
          x.toLowerCase().includes(filter.toLowerCase())
        )) &&
      (club === "all" || c.clubs.includes(club))
  ).sort(
    (a, b) =>
      (ptOpenSlots(s, a.slug, now)[0] ?? 1e15) -
      (ptOpenSlots(s, b.slug, now)[0] ?? 1e15)
  )
  const canBuy = me.role === "primary" || me.role === "adult"
  if (loading) return <LoadingBlock text="Finding coaches…" rows={4} />
  const goalMap: Record<string, string> = {
    return: "Return to training",
    strength: "Olympic lifting",
    swim: "Swim",
    mobility: "Mobility",
    teen: "Youth and teen",
  }
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Training"
        description="One-to-one coaching, 45 minutes."
        actions={
          <Button variant="outline" onClick={() => setMatch(true)}>
            Match me to a coach
          </Button>
        }
      />
      <section
        aria-labelledby="yt"
        className="grid gap-6 pt-6 rule-t md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="flex flex-col gap-3">
          <h2 id="yt" className="eyebrow text-muted-foreground">
            Your training
          </h2>
          {hh.ptPack ? (
            <>
              <div className="flex items-center gap-4">
                <RibMeter
                  value={Math.max(
                    left ? 1 : 0,
                    Math.round((left / hh.ptPack.total) * 5)
                  )}
                  tone="brand"
                  size="xl"
                  label="Training sessions left"
                  valueText={`${left} of ${hh.ptPack.total} sessions left`}
                  decorative
                />
                <div>
                  <p className="font-heading text-h1 leading-none display-stretch">
                    <span className="num">{left}</span>{" "}
                    <span className="text-h3">left</span>
                  </p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {hh.ptPack.total}-pack · valid until{" "}
                    {fmtDateFull(hh.ptPack.expiresOn)}
                  </p>
                </div>
              </div>
              <p className="text-detail text-muted-foreground">
                Packs last 12 months and pause during a freeze.
              </p>
            </>
          ) : (
            <EmptyState
              object="whistle"
              title="No sessions yet."
              body="Pick a coach to start."
              className="py-0"
            />
          )}
          {hh.plan === "summit" ? (
            <p className="text-caption">
              Summit intro session:{" "}
              <span className="num">{hh.ptIntroLeft}</span> left this quarter.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 md:border-l md:border-border md:pl-6">
          <p className="eyebrow text-muted-foreground">Next session</p>
          {nextPt ? (
            <>
              <p className="num font-heading text-h3 display-stretch">
                {fmtDay(nextPt.start)} · {fmtTime(nextPt.start)}
              </p>
              <p className="text-body">
                {nextPt.title.replace("Training with ", "Coach ")} ·{" "}
                {nextPt.place}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/bookings" />}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <Link
                      href={`/training/coaches/${nextPt.coachSlug}/book?move=${nextPt.id}`}
                    />
                  }
                >
                  Move
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Nothing booked yet.</p>
          )}
        </div>
      </section>
      <section aria-labelledby="fc" className="flex flex-col gap-4">
        <SectionTitle id="fc">Find a coach</SectionTitle>
        <div className="flex flex-wrap items-end gap-3">
          <ul className="flex flex-wrap gap-2" aria-label="Specialty">
            {COACH_FILTERS.map((x) => (
              <li key={x}>
                <Toggle
                  pressed={filter === x}
                  onPressedChange={() => setFilter(filter === x ? "" : x)}
                  className="max-md:min-h-11"
                >
                  {x}
                </Toggle>
              </li>
            ))}
          </ul>
          <SelectBox
            label="Club"
            value={club}
            onChange={setClub}
            options={[
              { value: "all", label: "All clubs" },
              ...CLUBS.map((c) => ({ value: c.slug, label: c.name })),
            ]}
            className="w-52"
          />
        </div>
        {list.length ? (
          <ul className="max-w-3xl rule-rows">
            {list.map((c) => (
              <li key={c.id}>
                <CoachCard c={c} s={s} now={now} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No coach matches."
            body="Clear a filter."
            action={
              <Button
                onClick={() => {
                  setFilter("")
                  setClub("all")
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </section>
      <section aria-labelledby="pk" className="flex flex-col gap-3">
        <SectionTitle id="pk">Packs</SectionTitle>
        <ul className="grid gap-x-8 rule-t sm:grid-cols-3">
          {PT_PACKS.map((p) => (
            <li
              key={p.sessions}
              className="flex flex-col gap-1 py-4 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-6"
            >
              <p className="num font-heading text-h2 leading-none">
                {p.sessions}{" "}
                <span className="text-body font-normal">sessions</span>
              </p>
              <p className="num text-body-strong">{fmtMoney(p.price, false)}</p>
              <p className="text-caption text-muted-foreground">
                {fmtMoney(p.price / p.sessions, false)} each
              </p>
            </li>
          ))}
        </ul>
        <p className="text-caption text-muted-foreground">
          Single session:{" "}
          <span className="num">{fmtMoney(PT_PRICE, false)}</span>. Packs last
          12 months and pause during a freeze.
        </p>
        {canBuy ? (
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => setPackOpen(true)}
          >
            Buy a pack
          </Button>
        ) : null}
      </section>
      <section aria-labelledby="hw" className="pt-6 rule-t">
        <h2 id="hw" className="eyebrow text-muted-foreground">
          How it works
        </h2>
        <ol className="mt-3 grid gap-4 sm:grid-cols-3">
          {["Pick a coach", "Choose a time", "Show your pass"].map((x, i) => (
            <li key={x} className="flex gap-3">
              <span className="num font-heading text-h2 leading-none text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-body">{x}.</span>
            </li>
          ))}
        </ol>
      </section>
      {hh.plan !== "summit" && canBuy ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-night px-6 py-5 text-on-night">
          <p className="font-heading text-h3 display-stretch">
            Summit includes a PT intro session every quarter.
          </p>
          <Button
            className="!bg-dawn !text-night hover:!bg-on-night"
            render={<Link href="/membership/change-plan" />}
          >
            Compare plans
          </Button>
        </section>
      ) : null}
      <Modal
        open={packOpen}
        onOpenChange={setPackOpen}
        title="Buy a training pack"
        description="Pick a pack now and a coach later. Charged to your card on file."
      >
        <RadioList
          label="Pack"
          value={pack}
          onChange={setPack}
          options={PT_PACKS.map((p) => ({
            value: String(p.sessions),
            label: `${p.sessions} sessions · ${fmtMoney(p.price, false)}`,
            help: `${fmtMoney(p.price / p.sessions, false)} each`,
          }))}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPackOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const r = buyPack(Number(pack))
              setPackOpen(false)
              if (r)
                toast({
                  title: `Training pack added: ${pack} sessions`,
                  description: `${fmtMoney(r)} · ${hh.card.brand} ending ${hh.card.last4}`,
                })
            }}
          >
            Pay{" "}
            {fmtMoney(PT_PACKS.find((p) => String(p.sessions) === pack)!.price)}{" "}
            and buy
          </Button>
        </div>
      </Modal>
      <Modal
        open={match}
        onOpenChange={setMatch}
        title="Match me to a coach"
        description="One question. We'll filter coaches for you."
      >
        <RadioList
          label="What do you want help with?"
          value={goal}
          onChange={setGoal}
          options={[
            {
              value: "return",
              label: "Coming back after an injury or a break",
            },
            { value: "strength", label: "Lifting and barbell technique" },
            { value: "swim", label: "Swimming" },
            { value: "mobility", label: "Mobility and pickleball" },
            { value: "teen", label: "Youth and teen training" },
          ]}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setMatch(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setFilter(goalMap[goal])
              setMatch(false)
            }}
          >
            Show matches
          </Button>
        </div>
      </Modal>
    </div>
  )
}
