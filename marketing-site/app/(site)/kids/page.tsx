import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
import { RibMeter } from "@/components/brand/meters"
import { Clock, ShieldCheck, Smartphone } from "@/components/icons"
import {
  Band,
  Breadcrumbs,
  FaqSection,
  HeroSplit,
  TourCTABand,
  TourTimeline,
} from "@/components/sections/common"
import { ShareButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Kids club and family at Cactus Peak — ages 6 months to 17",
  description:
    "Kids club for ages 6 months to 12, swim school, junior pickleball and Teen Strength. Add the family from $19 a month.",
}
const levels = [
  ["Splash", "Water comfort and floating. Ages 3–5."],
  ["Float", "Back and front float, short glide."],
  ["Kick", "Kick with a board, breathe to the side."],
  ["Stroke", "Freestyle and backstroke across the pool."],
  ["Lap-ready", "Swim 100 yards without stopping."],
]
const faq = [
  {
    id: "k1",
    q: "What ages can use kids club?",
    a: "Ages 6 months to 12 years.",
  },
  {
    id: "k2",
    q: "Can my teen train without me?",
    a: "In Teen Strength, yes. In the gym, a parent needs to sign the waiver and the teen stays on the teen floor area.",
  },
  {
    id: "k3",
    q: "What if my child is sick?",
    a: "Please keep them home. Kids with a fever or vomiting cannot check in.",
  },
  {
    id: "k4",
    q: "Is there a time limit?",
    a: "Yes. 2-hour blocks. You stay in the building.",
  },
]
export default async function Kids() {
  const { classBySlug, clubs } = await getCatalog()
  const groups = [
    [
      "kids-club",
      "AGES 6 MO–12 YR",
      "Play, crafts and games. 2-hour blocks.",
      "At 3 clubs",
    ],
    [
      "swim-school",
      "AGES 3–12",
      "Five levels. Taught by Red Cross-certified coaches.",
      "At Gilbert – Val Vista",
    ],
    [
      "junior-pickleball",
      "AGES 8–14",
      "Clinic format, Saturdays.",
      "At 3 clubs",
    ],
    [
      "teen-strength",
      "AGES 13–17",
      "Coached barbell and bodyweight basics. Teen OK.",
      "At 2 clubs",
    ],
  ]
  return (
    <>
      <Breadcrumbs trail={[{ label: "Kids & family" }]} />
      <HeroSplit
        title="Kids club, for the whole workout."
        support="Kids club for ages 6 months to 12 years. Swim school. Junior Pickleball. Teen Strength for ages 13 to 17."
        actions={
          <>
            <LinkButton
              href="/tour?note=kids"
              size="lg"
              className="rounded-full"
            >
              Tour with the kids (ages 6 mo–17)
            </LinkButton>
            <TextLink href="#hours">See kids club hours</TextLink>
          </>
        }
        fact={{
          icon: "playground",
          value: "6 mo–12 yr",
          label: "Ages in kids club, in 2-hour blocks, Monday to Saturday",
        }}
      />
      <Band tone="muted" className="py-10 lg:py-14">
        <h2 className="sr-only">Programs by age</h2>
        <ul className="border-t-2 border-foreground">
          {groups.map(([s, age, line, where]) => {
            const c = classBySlug(s)!
            return (
              <li
                key={s}
                className="grid items-baseline gap-x-8 gap-y-1 border-b border-border py-5 md:grid-cols-[220px_minmax(0,1fr)_200px]"
              >
                <p className="font-display-wide text-h2">
                  {age
                    .replace("AGES ", "Ages ")
                    .toLowerCase()
                    .replace("mo", "mo")
                    .replace("ages", "Ages")}
                </p>
                <div>
                  <Link
                    href={`/classes/${c.slug}`}
                    className="font-display-wide text-h3 hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="text-body text-muted-foreground">{line}</p>
                </div>
                <p className="text-body text-muted-foreground">{where}</p>
              </li>
            )
          })}
        </ul>
      </Band>
      <Band id="hours">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead title="When kids club is open." className="mb-6" />
            <ol className="grid grid-cols-2 border-t-2 border-foreground sm:grid-cols-4 sm:divide-x sm:divide-border">
              {["8–10 a.m.", "10 a.m.–12 p.m.", "4–6 p.m.", "6–8 p.m."].map(
                (h) => (
                  <li
                    key={h}
                    className="py-4 whitespace-nowrap sm:px-3 first:sm:pl-0"
                  >
                    <p className="tabular font-data text-h3 font-bold">{h}</p>
                    <p className="text-caption text-muted-foreground">
                      2-hour block
                    </p>
                  </li>
                )
              )}
            </ol>
            <p className="tabular mt-3 text-body">
              Monday to Saturday. Sunday: closed.
            </p>
            <TextLink href="/membership#family" className="mt-2">
              What a family costs
            </TextLink>
            <p className="mt-4 max-w-[52ch] text-body text-muted-foreground">
              Ages 6 months to 12 years. Up to 2 blocks per child per day. A
              parent checks in and stays in the building.
            </p>
          </div>
          <div className="lg:col-span-6">
            <h3 className="font-display-wide mb-4 text-h3">Which clubs</h3>
            <table className="w-full border-t-2 border-foreground text-left text-body">
              <caption className="sr-only">Kids club by club</caption>
              <thead className="sr-only">
                <tr>
                  <th>Club</th>
                  <th>Kids club</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((c) => (
                  <tr key={c.slug} className="border-b border-border">
                    <th scope="row" className="font-display-wide py-3 text-h3">
                      <Link
                        className="hover:underline"
                        href={`/clubs/${c.slug}`}
                      >
                        {c.name}
                      </Link>
                    </th>
                    <td className="py-3 text-right text-caption">
                      {c.has.kids ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="mr-2 inline-block size-2 rounded-full bg-foreground align-middle"
                          />
                          Kids club, 8 a.m.–8 p.m.
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          No kids club
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Band>
      <Band tone="muted">
        <SectionHead title="How kids club works." className="mb-8" />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TourTimeline
              steps={[
                {
                  title: "Check in.",
                  text: "You sign your child in at the kids club door with the app, at the same club. An unclaimed block is released 15 minutes after it starts.",
                },
                {
                  title: "Play.",
                  text: "Staff run games, crafts and quiet time. Ratios stay at 1 adult to 8 children.",
                },
                {
                  title: "Pick up.",
                  text: "Come back within 2 hours. We text you at 1 hour 45 minutes.",
                },
              ]}
            />
          </div>
          <ul className="flex flex-col gap-3 text-caption lg:col-span-5">
            {[
              [ShieldCheck, "Staff pass a background check"],
              [ShieldCheck, "Staff hold CPR and first aid training"],
              [Clock, "Allergy notes on file"],
              [Smartphone, "Parents stay in the building"],
            ].map(([I, t]) => {
              const Icon = I as typeof ShieldCheck
              return (
                <li
                  key={t as string}
                  className="flex items-center gap-3 border-b border-border pb-3"
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {t as string}
                </li>
              )
            })}
          </ul>
        </div>
      </Band>
      <Band>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead
              title="Swim school levels."
              lede="Five levels, taught by Red Cross-certified coaches."
            />
            <TextLink href="/schedule?class=swim-school" className="mt-4">
              See swim school times
            </TextLink>
          </div>
          <ol className="flex flex-col lg:col-span-7">
            {levels.map(([n, t], i) => (
              <li
                key={n}
                className="flex items-center gap-4 border-b border-border py-4 first:border-t"
              >
                <RibMeter
                  value={i + 1}
                  tone="category"
                  categoryId="aqua"
                  size="md"
                  profile="flat"
                  label="Level"
                  valueText={`Level ${i + 1} of 5`}
                  decorative
                />
                <div>
                  <p className="font-display-wide text-h3">
                    Level {i + 1} {n}
                  </p>
                  <p className="text-body text-muted-foreground">{t}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Band>
      <Band tone="muted">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {/* Teen Strength: a climb from the first light bar to the barbell, form first. */}
            <ObjectRack
              ratio="4/5"
              layout="climb"
              scheme="copper"
              focus="barbell"
              ids={["water-bottle", "jump-rope", "kettlebell", "plate"]}
              className="max-w-sm rounded-lg"
            />
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-display-wide text-h2 lg:text-h1">
              For teens, a place that is not a screen.
            </h2>
            <p className="mt-4 max-w-[56ch] text-body">
              Teen Strength is for ages 13 to 17. A coach teaches form first.
              Teens train in the class or with a parent. A parent signs the
              waiver. Teens can book classes in the app once a parent adds them
              to the plan.
            </p>
            <p className="mt-3 text-caption font-semibold">
              Ages 13–17 · Teen OK · Coached
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ShareButton />
              <LinkButton href="/tour?note=kids">Book a free tour</LinkButton>
              <TextLink href="/legal/kids-club-policy">Teen rules</TextLink>
            </div>
          </div>
        </div>
      </Band>
      <FaqSection items={faq} title="Kids and teens." />
      <TourCTABand
        title="Bring the kids on your tour."
        support="They can see the room. You can ask the staff anything."
        primary="Tour with the kids"
      />
    </>
  )
}
