import type { Metadata } from "next"

import { SectionHead, TextLink } from "@/components/brand/atoms"
import { PlanColumns } from "@/components/brand/plan-parts"
import { Band, JsonLd, TourCTABand } from "@/components/sections/common"
import { HomeClasses } from "@/components/sections/home-classes"
import { ClubFinderGrid, ClubStrip } from "@/components/sections/home-client"
import { HomeHero } from "@/components/sections/home-hero"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Cactus Peak Athletic — Five clubs in Mesa and Gilbert",
  description:
    "Pools, courts, classes and recovery at five East Valley clubs. Climb at your own pace. Book a free tour or a 3-day pass.",
}

// Six sections, one job each (REDESIGN.md goal 3). Schedule, kids club, coaches, the tour steps and the FAQ have their own pages.
export default async function Home() {
  const { clubs, testimonials } = await getCatalog()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Cactus Peak Athletic",
          url: "https://www.cactuspeakathletic.com",
          department: clubs.map((c) => ({
            "@type": "HealthClub",
            name: c.name,
            telephone: c.phone,
          })),
        }}
      />
      <HomeHero />

      {/* The first tinted band. Its colour shows below the hero at the fold, as the cue to scroll. */}
      <Band tone="tint">
        <ClubStrip className="mb-12 lg:mb-16" />
        <SectionHead
          size="lead"
          title="Five clubs. One membership."
          action={<TextLink href="/clubs">Compare the clubs</TextLink>}
        />
        <div className="mt-12">
          <ClubFinderGrid />
        </div>
      </Band>

      <Band>
        <SectionHead
          size="lead"
          title="Eight ways to move."
          action={<TextLink href="/classes">All 28 classes</TextLink>}
        />
        <HomeClasses className="mt-12" />
      </Band>

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title="Pick your pace."
          lede="Month to month. $0 enrollment through Nov 30."
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        <PlanColumns className="mt-12" />
      </Band>

      <Band>
        <SectionHead size="lead" title="Steady beats loud." />
        <ul className="mt-12 grid gap-x-16 gap-y-12 md:grid-cols-2">
          {testimonials.slice(0, 2).map((t) => (
            <li key={t.who}>
              <blockquote className="font-display-wide text-h2 text-balance lg:text-h1">
                “{t.quote}”
              </blockquote>
              <p className="mt-6 text-body">
                <span className="font-semibold">{t.who}</span>{" "}
                <span className="text-muted-foreground">· {t.club}</span>
              </p>
            </li>
          ))}
        </ul>
      </Band>

      <TourCTABand passEmail night />
    </>
  )
}
