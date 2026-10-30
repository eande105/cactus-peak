import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { ClubMap } from "@/components/brand/club-map"
import { HoursTable, StatusLine } from "@/components/brand/club-parts"
import {
  type ClubId,
  clubObjects,
  GymObject,
  generalObjects,
  ObjectRack,
  spaceObjects,
} from "@/components/brand/graphics"
import { PlanColumns } from "@/components/brand/plan-parts"
import { MapPin, Phone } from "@/components/icons"
import {
  PopularTimesChart,
  SectionNav,
} from "@/components/sections/club-detail-client"
import {
  Band,
  Breadcrumbs,
  Container,
  JsonLd,
  LeadSection,
  TourCTABand,
} from "@/components/sections/common"
import { ScheduleTeaser } from "@/components/sections/schedule-parts"
import { getCatalog } from "@/lib/catalog/server"
import { clubSpaces } from "@/lib/club-spaces"
import type { Club } from "@/lib/types"

// One page per row in `clubs`, built at deploy and refreshed hourly. Any other slug is a 404.
export const dynamicParams = false
export async function generateStaticParams() {
  const { clubs } = await getCatalog()
  return clubs.map((c) => ({ slug: c.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const c = (await getCatalog()).clubBySlug((await params).slug)
  if (!c) return {}
  return {
    title: `${c.name} — Gym, pool and classes in ${c.city}, AZ`,
    description: `${c.personality} ${c.sqFt.toLocaleString("en-US")} sq ft. ${c.signature.join(", ")}. Open 4:30 a.m.–10 p.m. weekdays. Book a free tour.`,
  }
}

/** The club's spotlight: its lead object lit, its Set and the general objects around it. */
function ClubSpotlight({ slug, ratio }: { slug: string; ratio: string }) {
  if (!(slug in clubObjects)) return null
  const [lead, ...rest] = clubObjects[slug as ClubId]
  return (
    <ObjectRack
      ratio={ratio}
      layout="spotlight"
      focus={lead}
      ids={[...rest, ...generalObjects.filter((id) => id !== lead)]}
    />
  )
}

const facts = (c: Club) => {
  const courts =
    (c.courts?.pickleball ?? 0) +
    (c.courts?.tennis ?? 0) +
    (c.courts?.basketball ?? 0)
  return [
    { v: c.sqFt.toLocaleString("en-US"), l: "sq ft", href: "#spaces" },
    c.pool
      ? {
          v: `25 ${c.pool.unit}`,
          l: c.amenities.some((a) => /splash/i.test(a))
            ? "pool + splash pad"
            : "lap pool",
          href: "#spaces",
        }
      : {
          v: String(c.studios + 1),
          l: "studios incl. cycle",
          href: "#classes",
        },
    courts
      ? {
          v: String(courts),
          l: `courts (${[c.courts?.basketball && `${c.courts.basketball} basketball`, c.courts?.pickleball && `${c.courts.pickleball} pickleball`, c.courts?.tennis && `${c.courts.tennis} tennis`].filter(Boolean).join(", ")})`,
          href: "#spaces",
        }
      : { v: "No", l: "pool, courts or kids club", href: "#spaces" },
    { v: "4:30 a.m.", l: "weekday open", href: "#hours" },
  ]
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { clubBySlug, profileCoaches, slots, clubQuotes, plans } =
    await getCatalog()
  const club = clubBySlug((await params).slug)
  if (!club) notFound()
  const clubCoaches = profileCoaches
    .filter((c) => c.clubs.includes(club.slug))
    .slice(0, 4)
  // Classes a week at this club, from the weekly timetable.
  const weekCount = slots
    .filter((s) => s.club === club.slug)
    .reduce((n, s) => n + s.days.length, 0)
  const spaces = clubSpaces(club)
  const prices = plans.map((p) => p.price)
  const from = Math.min(...prices)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HealthClub",
          name: `Cactus Peak Athletic — ${club.name}`,
          telephone: club.phone,
          priceRange: `$${from}–$${Math.max(...prices)}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: club.cross,
            addressLocality: club.city,
            addressRegion: "AZ",
            postalCode: club.zip,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "04:30",
              closes: "22:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday"],
              opens: "06:00",
              closes: "20:00",
            },
          ],
        }}
      />
      <Breadcrumbs
        trail={[{ label: "Clubs", href: "/clubs" }, { label: club.name }]}
      />
      <Container className="grid gap-8 pt-2 pb-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="display-hero !text-[clamp(2.5rem,6vw,4.5rem)]">
            {club.name}
          </h1>
          <p className="font-display-wide mt-4 max-w-[34ch] text-h2">
            {club.personality}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <StatusLine showHours />
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 text-body">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {club.cross}, {club.city}, AZ {club.zip}
            </span>
            <a
              className="inline-flex min-h-11 items-center font-semibold text-link underline-offset-4 hover:underline"
              href="https://maps.apple.com/"
              target="_blank"
              rel="noopener"
            >
              Get directions
            </a>
          </p>
        </div>
        <aside className="hidden md:block lg:col-span-5">
          <div className="flex flex-col gap-3 rounded-lg bg-card p-5 edge ring-border lg:sticky lg:top-24">
            <LinkButton href={`/tour?club=${club.slug}`} size="lg">
              Tour this club
            </LinkButton>
            <LinkButton href={`tel:${club.tel}`} variant="outline">
              <Phone aria-hidden="true" />
              Call the club {club.phone}
            </LinkButton>
            <TextLink href={`/trial?club=${club.slug}`}>
              Try a free 3-day pass
            </TextLink>
          </div>
        </aside>
        <div className="lg:col-span-12">
          {/* A spotlight row led by the club's lead object (VISUAL-IDENTITY.md, section 8). Phones get 4:3, so the row stays large. */}
          <div className="overflow-hidden rounded-lg sm:hidden">
            <ClubSpotlight slug={club.slug} ratio="4/3" />
          </div>
          <div className="hidden overflow-hidden rounded-lg sm:block">
            <ClubSpotlight slug={club.slug} ratio="21/9" />
          </div>
        </div>
      </Container>
      <Container>
        {/* Each fact links to its section, and a <dl> cannot hold links around its groups, so this is a list. */}
        <ul
          id="quick-facts"
          className="grid grid-cols-2 gap-6 pb-12 lg:grid-cols-4 lg:pb-16"
        >
          {facts(club).map((f) => (
            <li key={f.l}>
              <a
                href={f.href}
                className="flex flex-col gap-1 border-t-2 border-foreground pt-3 hover:underline"
              >
                <span className="tabular font-data text-h1 leading-none font-bold">
                  {f.v}
                </span>
                <span className="text-caption text-muted-foreground">
                  {f.l}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
      <SectionNav
        items={[
          { id: "classes", label: "Classes" },
          { id: "spaces", label: "Spaces" },
          { id: "hours", label: "Hours and map" },
          { id: "people", label: "People" },
        ]}
        cta={{ href: `/tour?club=${club.slug}`, label: "Tour this club" }}
      />

      <Band id="classes">
        <SectionHead
          title={`Classes at ${club.short}.`}
          lede={`${club.studios} studios and a cycle studio. ${weekCount} classes this week.`}
          action={<TextLink href="/classes">All 28 classes</TextLink>}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <ScheduleTeaser club={club.slug} />
          </div>
        </div>
      </Band>

      <Band tone="muted" id="spaces">
        <SectionHead title={`Spaces at ${club.short}.`} />
        <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {spaces.primary.map((sp) => (
            <section
              key={sp.id}
              id={`am-${sp.id}`}
              aria-labelledby={`sp-${sp.id}`}
              className="scroll-mt-32"
            >
              {/* A hub: the space's object, lit, with what the space includes around it. */}
              <ObjectRack
                ratio="4/3"
                layout="hub"
                scheme="sand"
                focus={spaceObjects[sp.graphic].lead}
                ids={spaceObjects[sp.graphic].around}
                className="rounded-lg edge ring-border"
              />
              <h3 id={`sp-${sp.id}`} className="font-display-wide mt-5 text-h3">
                {sp.name}
              </h3>
              <p className="mt-1 text-body">{sp.line}</p>
              <ul className="mt-3 flex flex-col gap-1 text-body text-muted-foreground">
                {sp.amenities.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {sp.link ? (
                <TextLink href={sp.link.href} className="mt-1">
                  {sp.link.label}
                </TextLink>
              ) : null}
            </section>
          ))}
        </div>
        {spaces.amenities.length ? (
          <div className="mt-16">
            <h3 className="font-display-wide text-h3">Also at {club.short}.</h3>
            <ul className="mt-6 grid border-t border-border sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
              {spaces.amenities.map((am) => {
                const tile = (
                  <span className="flex min-h-14 items-center gap-3 py-2">
                    <GymObject
                      id={spaceObjects[am.graphic].lead}
                      className="size-8 shrink-0"
                    />
                    <span className="text-body font-semibold">{am.name}</span>
                  </span>
                )
                return (
                  <li
                    key={am.id}
                    id={`am-${am.id}`}
                    className="scroll-mt-32 border-b border-border"
                  >
                    {am.link ? (
                      <Link
                        href={am.link.href}
                        className="block no-underline hover:underline"
                      >
                        {tile}
                      </Link>
                    ) : (
                      tile
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </Band>

      <LeadSection
        id="hours"
        title="Hours and map."
        fact="4:30 a.m."
        factLabel="First doors, Monday to Friday. Saturday and Sunday 6:00 a.m."
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h3 className="eyebrow mb-3">Hours</h3>
            <HoursTable kids={club.has.kids} />
            <p className="mt-2 text-body text-muted-foreground">
              Pool closes 30 min before the club. Thanksgiving Day: 6:00
              a.m.–12:00 p.m.
            </p>
            <div className="mt-8 hidden md:block">
              <PopularTimesChart club={club} />
            </div>
            <dl className="mt-8 grid gap-3 text-caption">
              <div>
                <dt className="font-semibold">Parking</dt>
                <dd className="text-muted-foreground">{club.parking}</dd>
              </div>
              <div>
                <dt className="font-semibold">Access</dt>
                <dd className="text-muted-foreground">{club.access}</dd>
              </div>
            </dl>
            <LinkButton href={`/tour?club=${club.slug}`} className="mt-6">
              Tour this club
            </LinkButton>
          </div>
          <div className="lg:col-span-6">
            <ClubMap
              only={club.slug}
              className="aspect-[4/3] w-full"
              interactive={false}
            />
            <p className="mt-2 text-caption">
              {club.cross}, {club.city}, AZ {club.zip} ·{" "}
              <a
                className="text-link underline-offset-4 hover:underline"
                href="https://maps.apple.com/"
                target="_blank"
                rel="noopener"
              >
                Get directions
              </a>
            </p>
          </div>
        </div>
      </LeadSection>

      {/* Coaches and member quotes are one section about people. The FAQ answers repeated "What this club has", so it lives on /faq. */}
      <Band tone="muted" id="people">
        <SectionHead
          title={`People at ${club.short}.`}
          action={
            <TextLink href={`/coaches?club=${club.slug}`}>
              Meet all coaches
            </TextLink>
          }
        />
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <ul className="border-t border-border lg:col-span-5">
            {clubCoaches.map((c) => (
              <li key={c.slug} className="border-b border-border py-4">
                <Link
                  className="font-display-wide text-h3 hover:underline"
                  href={`/coaches/${c.slug}`}
                >
                  {c.name}
                </Link>
                <p className="text-body text-muted-foreground">
                  {c.specialties.slice(0, 2).join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-10 lg:col-span-6 lg:col-start-7">
            {clubQuotes.slice(0, 2).map((q) => (
              <li key={q.who}>
                <blockquote className="font-display-wide text-h2 text-balance">
                  “{q.quote}”
                </blockquote>
                <p className="mt-3 text-body">
                  <span className="font-semibold">{q.who}</span>{" "}
                  <span className="text-muted-foreground">· {q.goal}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      <Band>
        <SectionHead
          title={`Plans that work at ${club.short}.`}
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        <div className="hidden md:block">
          <PlanColumns yourClub={club.name} className="mt-10" />
        </div>
        <p className="mt-4 text-body md:hidden">
          From ${from} a month. Month to month.
        </p>
      </Band>

      <TourCTABand
        title={`Come see ${club.short}.`}
        support={
          club.has.kids
            ? "Bring the kids. They can see the room."
            : "Bring a workout bag. Try the floor."
        }
        club={club.slug}
        phone={club.phone}
        tel={club.tel}
        primary="Tour this club"
        passEmail
      />
    </>
  )
}
