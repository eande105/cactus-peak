"use client"
import Link from "next/link"
import { useApp } from "@/components/app/use-app"
import { ChevronRight, Lock } from "@/components/icons"
import { Banner, PageHeader, SectionTitle } from "@/components/kit/ui"
import { BookingList } from "@/components/reserve/booking-list"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CLUB_BY_SLUG, CLUBS } from "@/lib/data/catalog"
import {
  courtBlocks,
  courtCount,
  gridSlots,
  KIDS_BLOCKS,
  kidsLeft,
  laneSwimmers,
} from "@/lib/engine"
import {
  addDays,
  atTime,
  dayStart,
  fmtDay,
  fmtDowTime,
  fmtTime,
  HOUR,
  MIN,
  parts,
} from "@/lib/time"

export default function ReserveHub() {
  const { s, me, hh, now, club: viewing } = useApp()
  const c = CLUB_BY_SLUG[viewing]
  const hasCourts = c.courts.length > 0
  const courtClub = hasCourts ? c : CLUB_BY_SLUG["mesa-red-mountain"]
  const poolClub = c.pool ? c : CLUB_BY_SLUG["mesa-dobson"]
  const kidsClub = c.kidsClub ? c : CLUB_BY_SLUG["gilbert-val-vista"]
  const today = dayStart(now)
  const cDay = addDays(today, now < today + 6 * HOUR ? 2 : 3)
  const sport = courtClub.courts[0].sport
  const slots = gridSlots(cDay, "court").filter((x) => parts(x).h < 12)
  const total = slots.length * courtCount(courtClub.slug, sport)
  let open = 0
  for (let n = 1; n <= courtCount(courtClub.slug, sport); n++) {
    const bl = courtBlocks(s, courtClub.slug, sport, n, cDay).blocks
    for (const sl of slots)
      if (!bl.some((b) => b.from < sl + 60 * MIN && b.to > sl)) open++
  }
  const laneSlot =
    gridSlots(today, "lane").find(
      (x) =>
        x > now &&
        Array.from({ length: poolClub.pool!.lanes }, (_, i) => i + 1).some(
          (l) => laneSwimmers(s, poolClub.slug, l, x).swimmers < 2
        )
    ) ?? gridSlots(addDays(today, 1), "lane")[0]
  const laneFree =
    Array.from({ length: poolClub.pool!.lanes }, (_, i) => i + 1).find(
      (l) => laneSwimmers(s, poolClub.slug, l, laneSlot).swimmers < 2
    ) ?? 1
  const sat = (() => {
    let d = addDays(today, 1)
    while (parts(d).dow !== 6) d = addDays(d, 1)
    return d
  })()
  const kLeft = kidsLeft(s, kidsClub.slug, sat, KIDS_BLOCKS[0])
  const reservations = s.bookings.filter(
    (b) =>
      ["court", "lane", "kids"].includes(b.kind) &&
      b.status === "booked" &&
      b.end > now &&
      s.members[b.memberId].householdId === hh.id
  )
  const rows = [
    {
      key: "courts",
      title: "Courts",
      href: "/reserve/courts",
      cta: "Reserve a court",
      scene: "court" as const,
      rule: "Book 3 days ahead · 60 or 90 minutes · one court per day",
      locked:
        hh.plan === "trailhead"
          ? {
              text: "Courts come with Ridge and Summit.",
              cta: "Compare plans",
              href: "/membership/change-plan",
            }
          : null,
      none: !hasCourts
        ? `Not at ${c.name}. ${courtClub.name} has ${courtCount(courtClub.slug, courtClub.courts[0].sport)} ${courtClub.courts[0].sport} courts.`
        : null,
      snap: `${courtClub.name}: ${open} of ${total} morning slots open ${fmtDay(cDay).split(",")[0]}`,
      show: true,
    },
    {
      key: "lanes",
      title: "Lap lanes",
      href: "/reserve/lanes",
      cta: "Reserve a lane",
      scene: (poolClub.scene === "outdoor-pool"
        ? "outdoor-pool"
        : "pool") as "pool",
      rule: "45-minute slots · up to 2 swimmers share a lane · no waitlist",
      locked: null,
      none: !c.pool
        ? `Not at ${c.name}. ${poolClub.name} has a 25-yard lap pool.`
        : null,
      snap: `${poolClub.name}: Lane ${laneFree} free at ${fmtTime(laneSlot)}`,
      show: true,
    },
    {
      key: "kids",
      title: "Kids club",
      href: "/reserve/kids-club",
      cta: "Book kids club",
      scene: "kids" as const,
      rule: "2-hour blocks · Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m. · Ages 6 months–12 years",
      locked: null,
      none: !c.kidsClub
        ? `Not at ${c.name}. ${kidsClub.name} has a kids club.`
        : null,
      snap: `${kidsClub.name}: ${kLeft} spots left ${fmtDowTime(atTime(sat, "08:00"))}`,
      show: me.role === "primary" || me.role === "adult",
    },
  ].filter((r) => r.show)
  void CLUBS
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Reserve"
        description={`Courts, lanes and kids club at ${c.name}.`}
      />
      {reservations.length ? (
        <section aria-labelledby="yr">
          <SectionTitle
            id="yr"
            action={
              <Link
                href="/bookings"
                className="text-link inline-flex min-h-11 items-center text-label hover:underline"
              >
                All bookings
              </Link>
            }
          >
            Your reservations
          </SectionTitle>
          <BookingList list={reservations} />
        </section>
      ) : null}
      <section aria-label="Reserve">
        <ul className="rule-rows">
          {rows.map((r) => (
            <li key={r.key}>
              <Link
                href={r.locked ? r.locked.href : r.none ? "#" : r.href}
                onClick={(e) => {
                  if (r.none) {
                    e.preventDefault()
                    document
                      .querySelector<HTMLElement>(
                        '[aria-label^="Viewing club"]'
                      )
                      ?.click()
                  }
                }}
                className="group grid min-h-24 gap-x-8 gap-y-1 py-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] md:items-center"
              >
                <span className="font-heading text-h1 display-stretch group-hover:underline">
                  {r.title}
                </span>
                <span className="flex flex-col gap-1">
                  {r.locked ? (
                    <span className="flex items-center gap-2 text-body">
                      <Lock
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {r.locked.text}
                    </span>
                  ) : r.none ? (
                    <span className="text-body">{r.none}</span>
                  ) : (
                    <span className="num text-body">{r.snap}</span>
                  )}
                  <span className="text-caption text-muted-foreground">
                    {r.rule}
                  </span>
                </span>
                <span className="text-link inline-flex min-h-11 items-center gap-1 text-label">
                  {r.locked ? r.locked.cta : r.none ? "Switch club" : r.cta}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {me.role === "teen" ? (
        <Banner
          tone="neutral"
          title={`Courts and lanes need ${me.parentId ? s.members[me.parentId].firstName : "a parent"}'s OK.`}
        >
          Pick a time and ask. The request is held for 24 hours.
        </Banner>
      ) : null}
      <section aria-labelledby="rules">
        <SectionTitle id="rules">How reservations work</SectionTitle>
        <Accordion className="mt-2">
          <AccordionItem value="r">
            <AccordionTrigger>Cancelling and late cancels</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>
                  Cancel free until 2 hours before. Late cancels count as
                  strikes for courts and lanes.
                </li>
                <li>
                  Kids club has no strikes. Please give 2 hours&apos; notice.
                </li>
                <li>
                  Guests need a guest pass. You can have one court per day, two
                  active.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
