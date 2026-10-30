import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import { ObjectRack, spaceObjects } from "@/components/brand/graphics"
import { ClubClassTable } from "@/components/sections/club-class-table"
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
  title:
    "Recovery at Cactus Peak — sauna, cold plunge and compression at 4 clubs",
  description:
    "Sauna, cold plunge and compression at 4 clubs. A Summit benefit you can try on a tour.",
}
const faq = [
  {
    id: "r1",
    q: "Is the recovery suite included?",
    a: "It is part of Summit. Ask for a tour to try it.",
  },
  { id: "r2", q: "How long can I stay?", a: "Slots are 30 minutes." },
  { id: "r3", q: "Do I need a towel?", a: "Summit includes towel service." },
  {
    id: "r4",
    q: "Is this good after surgery?",
    a: "Ask your doctor first. A coach can help you plan.",
  },
]
export default async function Recovery() {
  const { classBySlug, clubBySlug } = await getCatalog()
  return (
    <>
      <Breadcrumbs trail={[{ label: "Recovery" }]} />
      <HeroSplit
        title="Rest is a skill."
        support="Sauna, cold plunge and compression at 4 clubs. A Summit benefit you can try on a tour."
        actions={
          <>
            <LinkButton href="/tour" size="lg">
              Book a free tour
            </LinkButton>
            <LinkButton href="/membership#plans" variant="outline" size="lg">
              See Summit
            </LinkButton>
          </>
        }
        fact={{
          icon: "spa-stones",
          value: "4 clubs",
          label: "With a sauna and compression. Two also have a cold plunge.",
        }}
      />
      <SplitSection
        label="What's in the suite"
        graphic={
          <ObjectRack
            ratio="4/3"
            layout="hub"
            scheme="sand"
            focus={spaceObjects.recovery.lead}
            ids={spaceObjects.recovery.around}
          />
        }
      >
        <dl className="border-t-2 border-foreground">
          {[
            ["Sauna", "Dry heat. Sit for 10 to 15 minutes."],
            ["Cold plunge", "Short, cold, controlled. 1 to 3 minutes."],
            ["Compression", "Air boots for tired legs. 20 minutes."],
            ["Stretch area", "Foam rollers, bands and a coach nearby."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="grid gap-x-8 border-b border-border py-4 md:grid-cols-[180px_1fr]"
            >
              <dt className="font-display-wide text-h3">{t}</dt>
              <dd className="text-body text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </SplitSection>
      <DenseSection label="Recovery by club" icon="towel">
        <div className="relative overflow-x-auto border-y-2 border-foreground">
          <table className="w-full min-w-[680px] text-left text-body">
            <caption className="sr-only">Recovery by club</caption>
            <thead className="text-caption text-muted-foreground">
              <tr>
                {["Club", "Space", "Sauna", "Cold plunge", "Compression"].map(
                  (h) => (
                    <th key={h} scope="col" className="p-3 font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ["mesa-dobson", "Full suite", "Yes", "Yes", "Yes"],
                ["gilbert-val-vista", "Suite", "Yes", "Yes", "Yes"],
                ["mesa-downtown", "Lounge", "Yes", "–", "Yes"],
                [
                  "gilbert-heritage",
                  "Lounge + rooftop deck",
                  "Yes",
                  "–",
                  "Yes",
                ],
                [
                  "mesa-red-mountain",
                  "No suite. Stretch & Release class",
                  "–",
                  "–",
                  "–",
                ],
              ].map(([s, sp, a, b, c]) => (
                <tr key={s} className="border-t border-border">
                  <th scope="row" className="font-display-wide p-3 text-h3">
                    <Link
                      className="hover:underline"
                      href={`/clubs/${s}#am-recovery`}
                    >
                      {clubBySlug(s)!.name}
                    </Link>
                  </th>
                  <td className="p-3">{sp}</td>
                  <td className="p-3">{a}</td>
                  <td className="p-3">{b}</td>
                  <td className="p-3">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DenseSection>
      <LeadSection
        title="Included with Summit."
        fact="$129"
        icon="spa-stones"
        factLabel="a month. Trailhead and Ridge members book Stretch & Release classes. Everyone can try the suite on a tour."
      >
        <LinkButton href="/membership#compare" variant="outline">
          Compare plans
        </LinkButton>
      </LeadSection>
      <DenseSection label="Recovery classes" icon="resistance-band">
        <ClubClassTable
          items={["stretch-and-release", "sauna-plunge", "compression"].map(
            (x) => classBySlug(x)!
          )}
          grouped={false}
        />
      </DenseSection>
      <SplitSection
        label="How a visit goes"
        graphic={
          <ObjectRack
            ratio="4/3"
            layout="climb"
            focus="spa-stones"
            ids={["key", "towel", "wave", "resistance-band"]}
          />
        }
      >
        <TourTimeline
          steps={[
            { title: "Book a slot in the app.", text: "Slots are 30 minutes." },
            {
              title: "Shower, then enter.",
              text: "Towels are at the door. Summit includes towel service.",
            },
            {
              title: "Warm, then cool, then rest.",
              text: "Leave when you feel done.",
            },
          ]}
        />
        <ul className="mt-8 flex flex-col text-body">
          {[
            "Ages 18 and up",
            "Talk to your doctor if you have a heart condition, are pregnant, or take medicines that affect heat or cold",
            "Do not use alone if you feel unwell",
            "Phones stay in lockers",
          ].map((t) => (
            <li key={t} className="border-t border-border py-3">
              {t}
            </li>
          ))}
        </ul>
      </SplitSection>
      <FaqSection items={faq} title="Recovery questions." />
      <TourCTABand title="Try the suite on a tour." />
    </>
  )
}
