"use client"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { useApp } from "@/components/app/use-app"
import { CompactClass } from "@/components/booking/class-row"
import { GymObject, spaceObjects } from "@/components/brand/graphics"
import { ClubMap } from "@/components/clubs/club-map"
import { PopularTimesChart } from "@/components/clubs/popular-times"
import { Copy, MapPin, Phone } from "@/components/icons"
import { ArtFrame, ClubArt, CoachArt } from "@/components/kit/brand-art"
import { BusynessMeter } from "@/components/kit/ribs"
import { LoadingBlock, PageHeader, SectionTitle } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { setPrefs } from "@/lib/actions"
import { CLUB_BY_SLUG, COACHES } from "@/lib/data/catalog"
import { clubSpaces } from "@/lib/data/club-spaces"
import { sessionsForDay } from "@/lib/data/sessions"
import {
  busyHint,
  clubOpen,
  courtBlocks,
  courtCount,
  gridSlots,
  KIDS_BLOCKS,
  kidsLeft,
  laneSwimmers,
  liveBusyness,
} from "@/lib/engine"
import {
  atTime,
  dayStart,
  fmtDowTime,
  fmtRange,
  fmtTime,
  MIN,
  parts,
} from "@/lib/time"
import { toast } from "@/lib/toast"
import { useOffline } from "@/lib/ui-state"
import { cn } from "@/lib/utils"

const SECTIONS = [
  ["now", "Now"],
  ["classes", "Today's classes"],
  ["hours", "Hours"],
  ["amenities", "Amenities"],
  ["facilities", "Courts and pool"],
  ["kids", "Kids club"],
  ["coaches", "Coaches"],
  ["map", "Getting here"],
] as const

export default function ClubDetail({ slug }: { slug: string }) {
  const { s, me, now, club: viewing } = useApp()
  const offline = useOffline()
  const club = CLUB_BY_SLUG[slug]
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState("now")
  // biome-ignore lint/correctness/useExhaustiveDependencies: slug restarts the fake load delay when the club changes
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [slug])
  // biome-ignore lint/correctness/useExhaustiveDependencies: loading re-runs the observer once the section elements exist
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[]
    const io = new IntersectionObserver(
      (es) => {
        const v = es
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
        if (v) setActive(v.target.id)
      },
      { rootMargin: "-120px 0px -60% 0px" }
    )
    els.forEach((e) => {
      io.observe(e)
    })
    return () => io.disconnect()
  }, [loading])
  if (!club) notFound()
  if (loading) return <LoadingBlock text="Loading club…" rows={5} />
  const o = clubOpen(now)
  const b = liveBusyness(slug, now)
  const today = dayStart(now)
  const p = parts(now)
  const classes = sessionsForDay(slug, today)
    .filter((x) => x.start > now)
    .slice(0, 6)
  const coaches = COACHES.filter((c) => c.clubs.includes(slug))
  const spaces = clubSpaces(club)
  const isViewing = viewing === slug
  const courtSport = club.courts[0]?.sport
  let nextCourt = ""
  if (courtSport) {
    outer: for (const d of [0, 1, 2, 3]) {
      const day = today + d * 86400000
      for (const sl of gridSlots(day, "court")) {
        if (sl < now) continue
        for (let n = 1; n <= courtCount(slug, courtSport); n++) {
          if (
            !courtBlocks(s, slug, courtSport, n, day).blocks.some(
              (x) => x.from < sl + 60 * MIN && x.to > sl
            )
          ) {
            nextCourt = `Court ${n}, ${fmtDowTime(sl)}`
            break outer
          }
        }
      }
    }
  }
  let nextLane = ""
  if (club.pool) {
    for (const sl of gridSlots(today, "lane").filter((x) => x > now)) {
      const l = Array.from({ length: club.pool.lanes }, (_, i) => i + 1).find(
        (x) => laneSwimmers(s, slug, x, sl).swimmers < 2
      )
      if (l) {
        nextLane = `Lane ${l} free at ${fmtTime(sl)}`
        break
      }
    }
  }
  const hoursRows = [
    ["Mon–Fri", "4:30 a.m.–10:00 p.m.", p.dow >= 1 && p.dow <= 5],
    ["Sat–Sun", "6:00 a.m.–8:00 p.m.", p.dow === 0 || p.dow === 6],
    ["Staffed hours", "6:00 a.m.–8:00 p.m.", false],
    [
      "Kids club",
      club.kidsClub
        ? "Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m."
        : "No kids club at this club",
      false,
    ],
    [
      "Pools",
      club.pool ? "Close 30 minutes before the club" : "No pool at this club",
      false,
    ],
  ] as const
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        backHref="/clubs"
        backLabel="Clubs"
        title={club.name}
        className="sr-only"
      />
      <header className="relative">
        <ArtFrame
          className="aspect-[16/6] rounded-lg max-md:aspect-[4/3]"
          art={
            <>
              <ClubArt
                slug={club.slug}
                ratio="16/6"
                layout="spotlight"
                fill
                className="max-md:hidden"
              />
              <ClubArt
                slug={club.slug}
                ratio="4/3"
                layout="spotlight"
                fill
                className="md:hidden"
              />
            </>
          }
        >
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-photo-band p-4 text-on-night md:p-6">
            <div className="flex min-w-0 flex-col gap-1">
              <h1
                id="page-title"
                tabIndex={-1}
                className="font-heading text-h2 display-stretch outline-none md:text-h1"
              >
                {club.name}
              </h1>
              <p className="max-w-[48ch]">{club.personality}</p>
              <p className="num text-caption text-on-night/90">
                {club.address} ·{" "}
                {o.open
                  ? `Open now · closes ${fmtTime(o.closeAt)}`
                  : `Closed now · opens ${fmtTime(o.openAt)}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isViewing ? (
                <span className="inline-flex min-h-11 items-center rounded-md border border-on-night/50 px-4 text-label">
                  Viewing this club
                </span>
              ) : (
                <Button
                  className="!bg-dawn !text-night hover:!bg-on-night"
                  onClick={() => {
                    setPrefs(me.id, { viewingClub: slug })
                  }}
                >
                  Set as my club
                </Button>
              )}
              <Button
                variant="outline"
                className="!border-on-night/60 !text-on-night hover:!bg-on-night/10"
                render={
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(club.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <MapPin aria-hidden="true" data-icon="inline-start" />
                Directions
              </Button>
              <Button
                variant="outline"
                className="!border-on-night/60 !text-on-night hover:!bg-on-night/10"
                render={<a href={`tel:${club.phone.replace(/\D/g, "")}`} />}
              >
                <Phone aria-hidden="true" data-icon="inline-start" />
                Call
              </Button>
            </div>
          </div>
        </ArtFrame>
      </header>
      <nav
        aria-label="On this page"
        className="sticky top-14 z-20 -mx-4 overflow-x-auto bg-background px-4 md:top-16 md:mx-0 md:px-0"
      >
        <ul className="flex gap-1 border-b border-border">
          {SECTIONS.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center border-b-2 px-3 text-label whitespace-nowrap",
                  active === id
                    ? "border-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section id="now" className="scroll-mt-32" aria-labelledby="now-h">
          <p id="now-h" className="mb-3 eyebrow text-muted-foreground">
            Now
          </p>
          {!o.open ? (
            <p className="font-heading text-h2 display-stretch">
              Closed now · opens {fmtTime(o.openAt)}
            </p>
          ) : offline ? (
            <p className="text-body">
              Offline: live count unavailable. Showing typical hours.
            </p>
          ) : (
            <BusynessMeter
              level={b.level}
              variant="hero"
              updated={fmtTime(b.updatedAt)}
              hint={busyHint(slug, now)}
            />
          )}
          <p className="mt-3 text-detail text-muted-foreground">
            Updates every 5 minutes. Levels only, no head count.
          </p>
        </section>
        <section id="popular" className="scroll-mt-32" aria-labelledby="pop-h">
          <p id="pop-h" className="mb-3 eyebrow text-muted-foreground">
            Popular times
          </p>
          <PopularTimesChart
            slug={slug}
            nowDow={p.dow}
            nowHour={p.h}
            live={o.open && !offline}
          />
        </section>
      </div>
      <section id="classes" className="scroll-mt-32" aria-labelledby="cl-h">
        <SectionTitle
          id="cl-h"
          action={
            <Link
              href={`/schedule?club=${slug}`}
              className="text-link text-label hover:underline"
            >
              Full schedule
            </Link>
          }
        >
          Today&apos;s classes
        </SectionTitle>
        {classes.length ? (
          <ul className="-mx-4 mt-3 flex snap-x gap-6 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {classes.map((x) => (
              <li key={x.id} className="snap-start">
                <CompactClass se={x} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted-foreground">
            No more classes today.{" "}
            <Link
              className="text-link underline"
              href={`/schedule?club=${slug}`}
            >
              See the full schedule
            </Link>
          </p>
        )}
      </section>
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
        <section id="hours" className="scroll-mt-32" aria-labelledby="h-h">
          <SectionTitle id="h-h">Hours</SectionTitle>
          <dl className="mt-3 rule-rows">
            {hoursRows.map(([k, v, today]) => (
              <div
                key={k}
                className="grid grid-cols-[8rem_1fr] gap-3 py-2.5 text-body"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="num">
                  {v}
                  {today ? (
                    <span className="rounded-xs ml-2 bg-accent px-1.5 text-detail font-semibold">
                      Today
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-detail text-muted-foreground">
            Arizona time (no daylight saving). Main desk{" "}
            <a
              href={`tel:${club.phone.replace(/\D/g, "")}`}
              className="text-link num underline"
            >
              {club.phone}
            </a>
          </p>
        </section>
        <section id="amenities" className="scroll-mt-32" aria-labelledby="a-h">
          <SectionTitle id="a-h">Amenities</SectionTitle>
          <ul className="mt-3 flex flex-col gap-4">
            {spaces.primary.map((sp) => (
              <li
                key={sp.id}
                className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-4"
              >
                {/* The space's object in a cut tile; a hub is too busy at this size. */}
                <GymObject
                  id={spaceObjects[sp.graphic].lead}
                  cut
                  className="size-24"
                />
                <div className="min-w-0">
                  <h3 className="text-label">{sp.name}</h3>
                  <p className="text-caption text-muted-foreground">
                    {sp.line}
                  </p>
                  <p className="mt-1 text-detail text-muted-foreground">
                    {sp.amenities.join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {spaces.amenities.length ? (
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-4">
              {spaces.amenities.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-body">
                  <GymObject
                    id={spaceObjects[a.graphic].lead}
                    className="size-8 shrink-0"
                  />
                  {a.name}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
      <section id="facilities" className="scroll-mt-32" aria-labelledby="f-h">
        <SectionTitle id="f-h">Courts and pool</SectionTitle>
        {club.courts.length || club.pool ? (
          <div className="mt-3 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {club.courts.length ? (
              <div className="flex flex-col items-start gap-2 pt-3 rule-t">
                <h3 className="text-body-strong">Courts</h3>
                <p className="text-caption text-muted-foreground">
                  {club.courts.map((c) => `${c.count} ${c.sport}`).join(", ")}
                </p>
                <p className="num text-body">
                  Next open: {nextCourt || "see the grid"}
                </p>
                <Button
                  variant="outline"
                  render={<Link href={`/reserve/courts?club=${slug}`} />}
                >
                  Reserve a court
                </Button>
              </div>
            ) : null}
            {club.pool ? (
              <div className="flex flex-col items-start gap-2 pt-3 rule-t">
                <h3 className="text-body-strong">Lap pool</h3>
                <p className="text-caption text-muted-foreground">
                  {club.pool.label} · {club.pool.lanes} lanes
                  {club.pool.therapy
                    ? " · warm-water therapy pool, 90–92°F"
                    : ""}
                </p>
                <p className="num text-body">
                  {nextLane || "Lanes open tomorrow"}
                </p>
                <Button
                  variant="outline"
                  render={<Link href={`/reserve/lanes?club=${slug}`} />}
                >
                  Reserve a lane
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground">
            No pool or courts at this club.
          </p>
        )}
      </section>
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
        <section id="kids" className="scroll-mt-32" aria-labelledby="k-h">
          <SectionTitle id="k-h">Kids club</SectionTitle>
          {club.kidsClub ? (
            <div className="mt-3 flex flex-col items-start gap-3">
              <p className="text-body">
                Ages 6 months to 12 years. Mon–Sat 8:00 a.m.–12:00 p.m. and
                4:00–8:00 p.m. Parents check in at the club and stay in the
                building.
              </p>
              <ul className="w-full rule-rows">
                {KIDS_BLOCKS.map((k) => {
                  const l = kidsLeft(s, slug, today, k)
                  const past = atTime(today, k.from) < now
                  return (
                    <li
                      key={k.id}
                      className="flex justify-between py-2 text-caption"
                    >
                      <span className="num">
                        {fmtRange(atTime(today, k.from), atTime(today, k.to))}
                      </span>
                      <span
                        className={cn(
                          "num",
                          past
                            ? "text-muted-foreground"
                            : l < 3 && "text-warning"
                        )}
                      >
                        {p.dow === 0
                          ? "Closed Sundays"
                          : past
                            ? "Started"
                            : l === 0
                              ? "Full"
                              : `${l} spots left`}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <Button render={<Link href="/reserve/kids-club" />}>
                Book kids club
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground">
              No kids club at this club.
            </p>
          )}
        </section>
        <section id="coaches" className="scroll-mt-32" aria-labelledby="c-h">
          <SectionTitle id="c-h">Coaches</SectionTitle>
          {coaches.length ? (
            <ul className="mt-3 rule-rows">
              {coaches.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/training/coaches/${c.slug}`}
                    className="hover:text-link flex items-center gap-3 py-3"
                  >
                    <CoachArt name={c.name} roles={c.specialties} size={48} />
                    <span>
                      <span className="block text-label">{c.name}</span>
                      <span className="block text-caption text-muted-foreground">
                        {c.specialties.join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">
              Coach profiles are coming soon.
            </p>
          )}
        </section>
      </div>
      <section id="map" className="scroll-mt-32" aria-labelledby="m-h">
        <SectionTitle id="m-h">Getting here</SectionTitle>
        <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-2">
            <p className="text-body-strong">{club.address}</p>
            <p className="text-caption text-muted-foreground">{club.parking}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                render={
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(club.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Open in Maps
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard?.writeText(club.address)
                  toast({ title: "Address copied" })
                }}
              >
                <Copy aria-hidden="true" data-icon="inline-start" />
                Copy address
              </Button>
            </div>
          </div>
          {offline ? (
            <p className="text-caption text-muted-foreground">
              Map unavailable offline.
            </p>
          ) : (
            <ClubMap now={now} only={slug} selected={slug} ratio="16/7" />
          )}
        </div>
      </section>
    </div>
  )
}
