import type { Metadata } from "next"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
import { CoachFilter } from "@/components/sections/coaches-client"
import {
  Breadcrumbs,
  DenseSection,
  FaqSection,
  HeroSplit,
  LeadSection,
  SplitSection,
  TourCTABand,
  TourTimeline,
} from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Personal training at Cactus Peak — packs from $61 a session",
  description:
    "One-on-one sessions at all 5 clubs. Packs of 4, 8 or 12, or a single session for $75.",
}
const faq = [
  {
    id: "p1",
    q: "Do I have to buy a pack?",
    a: "No. A single session is $75. Packs of 4, 8 or 12 cost less per session.",
  },
  { id: "p2", q: "Can I switch coaches?", a: "Yes. Tell the front desk." },
  {
    id: "p3",
    q: "Does Summit include PT?",
    a: "Summit includes 1 intro session a quarter.",
  },
]
export default async function PT() {
  const { packs, prices } = await getCatalog()
  return (
    <>
      <Breadcrumbs trail={[{ label: "Personal training" }]} />
      <HeroSplit
        title="Your own coach, 45 minutes at a time."
        support={`One-on-one sessions at all 5 clubs. Packs of ${packs
          .map((p) => p.n)
          .join(", ")
          .replace(
            /, (\d+)$/,
            " or $1"
          )} (or a single session for $${prices.ptSingle}). Start with a free tour and meet a coach.`}
        actions={
          <>
            <LinkButton href="/tour?coach=any" size="lg">
              Meet a coach on a free tour
            </LinkButton>
            <LinkButton href="/coaches" variant="outline" size="lg">
              See all coaches
            </LinkButton>
          </>
        }
        fact={{
          icon: "whistle",
          value: "$61",
          label: "A session in a 12-pack. Single session $75.",
        }}
      />
      <SplitSection
        label="How it works"
        graphic={
          <ObjectRack
            ratio="4/3"
            layout="climb"
            scheme="copper"
            focus="whistle"
            ids={["schedule", "heart-watch", "kettlebell", "plate"]}
          />
        }
      >
        <TourTimeline
          steps={[
            {
              title: "Meet.",
              text: "Free tour or an intro session (Summit gets a 30-minute intro each quarter).",
            },
            {
              title: "Plan.",
              text: "Your coach writes a plan for your goal, your joints and your week.",
            },
            {
              title: "Train.",
              text: "Sessions are 45 minutes. Book in the app.",
            },
            {
              title: "Review.",
              text: "Every 4 sessions, your coach checks the plan.",
            },
          ]}
        />
      </SplitSection>
      <DenseSection label="Packs" id="packs" icon="schedule">
        <ul className="grid gap-0 border-y border-border sm:grid-cols-3">
          {packs.map((p) => (
            <li
              key={p.n}
              className="border-b border-border py-6 sm:border-r sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:border-r-0"
            >
              <p className="font-display-wide text-h3">{p.n} sessions</p>
              <p className="tabular font-data text-display font-bold">
                ${p.price}
              </p>
              <p className="text-body text-muted-foreground">${p.each} each</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-body">Single session $75.</p>
        <p className="mt-1 max-w-[62ch] text-body text-muted-foreground">
          45 minutes. Packs last 12 months and pause during a freeze. Cancel or
          reschedule free up to 24 hours before. Summit includes a 30-minute
          intro each quarter.
        </p>
        <LinkButton href="/tour" className="mt-6">
          Book a free tour to start
        </LinkButton>
      </DenseSection>
      <LeadSection title="Find a coach.">
        <p className="mb-4 text-body">
          <TextLink href="/coaches">See all coaches</TextLink>
        </p>
        <CoachFilter />
      </LeadSection>
      <SplitSection
        label="Pick a goal"
        graphic={
          <ObjectRack
            ratio="1/1"
            layout="orbit"
            scheme="sand"
            focus="whistle"
            ids={[
              "kettlebell",
              "spa-stones",
              "pool",
              "paddle",
              "resistance-band",
              "barbell",
              "heart-watch",
              "sneaker",
            ]}
          />
        }
      >
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {[
            ["Come back after an injury", "Return to training"],
            ["Build strength", "Strength"],
            ["Prepare for pickleball", "Court"],
            ["Swim with confidence", "Aqua"],
          ].map(([t, s]) => (
            <li key={t} className="border-t-2 border-foreground pt-3">
              <TextLink
                href={`/coaches?specialty=${encodeURIComponent(s)}`}
                className="font-display-wide text-h3 text-foreground no-underline"
              >
                {t}
              </TextLink>
            </li>
          ))}
        </ul>
      </SplitSection>
      <div className="border-t border-border">
        <FaqSection items={faq} title="Coaching questions." />
      </div>
      <TourCTABand title="Meet your coach." />
    </>
  )
}
