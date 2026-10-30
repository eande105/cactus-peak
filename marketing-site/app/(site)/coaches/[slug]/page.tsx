import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { CoachAvatar, CoachCard } from "@/components/brand/class-parts"
import {
  Band,
  Breadcrumbs,
  Container,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import { ScheduleTeaser } from "@/components/sections/schedule-parts"
import { getCatalog } from "@/lib/catalog/server"

// Only coaches with a bio have a page. The other rows in `coaches` lead classes in the member app.
export const dynamicParams = false
export async function generateStaticParams() {
  const { profileCoaches } = await getCatalog()
  return profileCoaches.map((c) => ({ slug: c.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { coachBySlug, clubBySlug } = await getCatalog()
  const c = coachBySlug((await params).slug)
  if (!c?.profile) return {}
  const what = (c.specialties[0] ?? "fitness").toLowerCase()
  return {
    title: `${c.name}, ${what} coach — Cactus Peak`,
    description: `${c.name} coaches ${what} at ${c.clubs
      .map((s) => clubBySlug(s)?.name)
      .filter(Boolean)
      .join(
        " and "
      )}. ${c.credential ? `${c.credential}. ` : ""}Book an intro session.`,
  }
}
export default async function CoachPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { coachBySlug, clubBySlug, profileCoaches, slots, packs } =
    await getCatalog()
  const c = coachBySlug((await params).slug)
  if (!c?.profile) notFound()
  const leadsClasses = slots.some((s) => s.coachId === c.id)
  const fromEach = Math.min(...packs.map((p) => p.each))
  const others = profileCoaches
    .filter(
      (x) => x.slug !== c.slug && x.clubs.some((s) => c.clubs.includes(s))
    )
    .slice(0, 3)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: c.name,
          jobTitle: `${c.specialties[0] ?? "Fitness"} coach`,
          worksFor: c.clubs.map((s) => clubBySlug(s)?.name).filter(Boolean),
        }}
      />
      <Breadcrumbs
        trail={[{ label: "Coaches", href: "/coaches" }, { label: c.name }]}
      />
      <Container className="grid gap-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-12">
        <div className="max-w-60 lg:col-span-4 lg:max-w-none">
          <CoachAvatar
            slug={c.slug}
            name={c.name}
            className="aspect-square w-full text-h1"
          />
        </div>
        <div className="lg:col-span-8">
          {/* Name, one line, two actions. Chips, badges, stat tiles and the reply note were labels on labels (REDESIGN.md goals 2 and 4). */}
          <h1 className="font-display-wide text-h1 lg:text-display">
            {c.name}
          </h1>
          <p className="lede mt-4 text-pretty text-muted-foreground">
            {[
              c.credential,
              c.specialties.join(", "),
              c.years ? `${c.years} years coaching` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton
              href={`/tour?coach=${c.slug}&club=${c.clubs[0]}`}
              size="lg"
            >
              Meet {c.first} on a free tour
            </LinkButton>
            <LinkButton
              href={`/contact?topic=coach&coach=${c.slug}`}
              variant="outline"
              size="lg"
            >
              Send a message
            </LinkButton>
          </div>
        </div>
      </Container>
      <Band tone="muted">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="max-w-[56ch] text-body lg:col-span-6">{c.bio}</p>
          {c.quote ? (
            <blockquote className="font-display-wide border-l-4 border-primary pl-5 text-h2 lg:col-span-6">
              “{c.quote}”
            </blockquote>
          ) : null}
        </div>
      </Band>
      {leadsClasses ? (
        <Band>
          <SectionHead
            title={`Classes with ${c.first}.`}
            className="mb-6"
            action={
              <TextLink href={`/schedule?coach=${c.slug}`}>
                See all of {c.first}&apos;s classes
              </TextLink>
            }
          />
          <ScheduleTeaser
            coach={c.name}
            club="all"
            switcher={false}
            limit={4}
          />
        </Band>
      ) : null}
      <Band tone="muted">
        <SectionHead title={`Where ${c.first} coaches.`} />
        <ul className="mt-8 border-t border-border">
          {c.clubs.map((s) => {
            const k = clubBySlug(s)
            if (!k) return null
            return (
              <li key={s} className="border-b border-border">
                <Link
                  href={`/clubs/${s}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 py-5"
                >
                  <span className="font-display-wide text-h2 group-hover:underline">
                    {k.name}
                  </span>
                  <span className="text-body text-muted-foreground">
                    {k.cross}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Band>
      <Band>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead title={`Training with ${c.first}.`} />
            <p className="mt-3 text-body">
              {c.pt
                ? "One-on-one sessions: packs"
                : `${c.first} does not take personal training clients. Our trainers sell packs`}{" "}
              of{" "}
              {packs
                .map((p) => p.n)
                .join(", ")
                .replace(/, (\d+)$/, " or $1")}
              , from ${fromEach} a session.
            </p>
            <TextLink href="/personal-training#packs">See packs</TextLink>
          </div>
          <div className="lg:col-span-7">
            <h3 className="font-display-wide mb-4 text-h3">Other coaches</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {others.map((o) => (
                <CoachCard key={o.slug} coach={o} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </Band>
      <TourCTABand title={`Come meet ${c.first}.`} />
    </>
  )
}
