import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
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
import { CourtGrid } from "@/components/sections/slot-grid"
import { HandoffButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Courts at Cactus Peak — 18 courts at 3 clubs",
  description:
    "Pickleball, tennis and basketball at three clubs. Book 3 days ahead in the app or call the desk.",
}
const faq = [
  {
    id: "c1",
    q: "Do I need my own paddle?",
    a: "No. Loaner paddles are at the desk.",
  },
  {
    id: "c2",
    q: "Is open play for beginners?",
    a: "Yes. Ask a coach for a beginner court.",
  },
  {
    id: "c3",
    q: "Can Trailhead members book courts?",
    a: "Courts come with Ridge and Summit.",
  },
  {
    id: "c4",
    q: "Can I book for a group?",
    a: "Yes. Book each court as a slot.",
  },
]
export default async function Courts() {
  const { classBySlug, clubBySlug } = await getCatalog()
  const rows = [
    ["mesa-dobson", "4", "2", "—", ""],
    ["mesa-red-mountain", "6", "—", "—", "Turf lane, Superstition-view deck"],
    ["gilbert-val-vista", "4", "—", "2", ""],
  ]
  return (
    <>
      <Breadcrumbs trail={[{ label: "Courts" }]} />
      <HeroSplit
        title="Play more than you plan."
        support="18 courts at 3 clubs. Pickleball, tennis and basketball. Book in the app or call the desk."
        actions={
          <>
            <LinkButton href="/tour" size="lg">
              Book a free tour
            </LinkButton>
            <LinkButton href="tel:+14805550127" variant="outline" size="lg">
              Call Mesa – Red Mountain (480) 555-0127
            </LinkButton>
          </>
        }
        fact={{
          icon: "paddle",
          value: "18 courts",
          label: "At Dobson, Red Mountain and Val Vista",
        }}
      />
      <DenseSection label="Courts by club" icon="tennis-ball">
        <div className="hidden overflow-x-auto rounded-lg bg-card edge ring-border lg:block">
          <table className="w-full text-body">
            <caption className="sr-only">Courts at each club</caption>
            <thead>
              <tr className="text-left text-caption text-muted-foreground">
                <th scope="col" className="p-4">
                  Club
                </th>
                <th scope="col" className="p-4">
                  Pickleball
                </th>
                <th scope="col" className="p-4">
                  Tennis
                </th>
                <th scope="col" className="p-4">
                  Basketball
                </th>
                <th scope="col" className="p-4">
                  Extras
                </th>
                <th scope="col" className="p-4">
                  <span className="sr-only">Book</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([s, p, t, b, x]) => (
                <tr key={s} className="border-t border-border">
                  <th scope="row" className="p-4 text-left">
                    <Link className="hover:underline" href={`/clubs/${s}`}>
                      {clubBySlug(s)!.name}
                    </Link>
                  </th>
                  <td className="tabular p-4">{p}</td>
                  <td className="tabular p-4">{t}</td>
                  <td className="tabular p-4">{b}</td>
                  <td className="p-4 text-caption">{x || "—"}</td>
                  <td className="p-4">
                    <HandoffButton
                      label="Book a court"
                      classSlug="pickleball-open-play"
                      club={s as "mesa-dobson"}
                      start={420}
                    />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border">
                <th scope="row" className="p-4 text-left text-muted-foreground">
                  Downtown, Heritage
                </th>
                <td colSpan={5} className="p-4 text-muted-foreground">
                  No courts.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="border-t-2 border-foreground lg:hidden">
          {rows.map(([s, p, t, b, x]) => (
            <li key={s} className="border-b border-border py-4">
              <Link
                href={`/clubs/${s}`}
                className="font-display-wide text-h3 hover:underline"
              >
                {clubBySlug(s)!.name}
              </Link>
              <p className="tabular text-body">
                {[
                  p !== "—" && `${p} pickleball`,
                  t !== "—" && `${t} tennis`,
                  b !== "—" && `${b} basketball`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {x ? (
                <p className="text-body text-muted-foreground">{x}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </DenseSection>
      <SplitSection
        label="How booking works"
        graphic={
          <ObjectRack
            ratio="4/3"
            layout="spotlight"
            focus="schedule"
            ids={[
              "paddle",
              "tennis-ball",
              "stopwatch",
              "key",
              "sneaker",
              "water-bottle",
            ]}
          />
        }
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mb-4 text-caption">
              Prefer to call?{" "}
              <a
                className="tabular font-semibold text-link underline underline-offset-4"
                href="tel:+14805550127"
              >
                (480) 555-0127
              </a>
              . The desk is staffed 6:00 a.m. to 8:00 p.m.
            </p>
            <HandoffButton
              label="Book a court"
              classSlug="pickleball-open-play"
              club="mesa-red-mountain"
              start={420}
              variant="primary"
            />
          </div>
          <div className="lg:col-span-7">
            <TourTimeline
              steps={[
                {
                  title: "Pick a time.",
                  text: "Courts are 60- or 90-minute slots.",
                },
                {
                  title: "Book 3 days ahead.",
                  text: "The window opens at 6:00 a.m. Arizona time. Ridge and Summit include courts. One court reservation a day, at most 2 active. Cancel free up to 2 hours before.",
                },
                {
                  title: "Show up.",
                  text: "Check in at the desk or with the app.",
                },
              ]}
            />
          </div>
        </div>
      </SplitSection>
      <DenseSection label="Four ways to play" icon="basketball">
        <ul className="border-t-2 border-foreground">
          {[
            "pickleball-open-play",
            "pickleball-clinic",
            "tennis-drills",
            "hoops-run",
          ].map((s) => {
            const c = classBySlug(s)!
            return (
              <li
                key={s}
                className="grid items-baseline gap-x-6 border-b border-border py-4 md:grid-cols-[260px_90px_minmax(0,1fr)]"
              >
                <Link
                  href={`/classes/${s}`}
                  className="font-display-wide text-h3 hover:underline"
                >
                  {c.name}
                </Link>
                <span className="tabular text-body">{c.duration} min</span>
                <span className="text-body text-muted-foreground">
                  {c.blurb}
                  {c.firstTimer ? " Good for first-timers." : ""}
                </span>
              </li>
            )
          })}
        </ul>
      </DenseSection>
      <LeadSection title="Courts open today.">
        <p className="mb-4 text-body text-muted-foreground">
          Mesa – Red Mountain. A sample of today&apos;s slots.
        </p>
        <CourtGrid />
        <div className="mt-4">
          <HandoffButton
            label="Book a court"
            classSlug="pickleball-open-play"
            club="mesa-red-mountain"
            start={480}
          />
        </div>
      </LeadSection>
      <div className="border-t border-border">
        <FaqSection
          items={faq}
          title="Court questions."
          phone="(480) 555-0127"
          tel="+14805550127"
        />
      </div>
      <TourCTABand title="Meet your court." />
    </>
  )
}
