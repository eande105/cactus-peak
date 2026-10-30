import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton, SectionHead } from "@/components/brand/atoms"
import { HoursTable } from "@/components/brand/club-parts"
import { ObjectRack, spaceObjects } from "@/components/brand/graphics"
import { Minus } from "@/components/icons"
import { ClubClassTable } from "@/components/sections/club-class-table"
import {
  Band,
  Breadcrumbs,
  ClosingRow,
  FaqSection,
  HeroSplit,
} from "@/components/sections/common"
import { LaneGrid } from "@/components/sections/slot-grid"
import { HandoffButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Aquatics at Cactus Peak — 3 pools, lanes and a warm-water pool",
  description:
    "Lap lanes, a warm-water pool, a splash pad and swim school at three clubs. Pools close 30 min before the club.",
}
const faq = [
  {
    id: "a1",
    q: "Do I need to book a lane?",
    a: "Yes for lap lanes in the app. Not for the splash pad.",
  },
  {
    id: "a2",
    q: "Is the pool heated?",
    a: "Yes. The lap pools stay at 80 to 82°F; the therapy pool at 90 to 92°F.",
  },
  {
    id: "a3",
    q: "Can my child swim alone?",
    a: "Children under 12 need a parent at the pool.",
  },
]
export default async function Aquatics() {
  const { classBySlug, clubBySlug } = await getCatalog()
  return (
    <>
      <Breadcrumbs trail={[{ label: "Aquatics" }]} />
      <HeroSplit
        title="Water at any pace."
        support="Three clubs with pools. Lap lanes, warm water, a splash pad and swim school."
        actions={
          <>
            <LinkButton href="/tour" size="lg">
              Book a free tour
            </LinkButton>
            <LinkButton
              href="/schedule?category=aqua"
              variant="outline"
              size="lg"
            >
              See swim times
            </LinkButton>
          </>
        }
        fact={{
          icon: "pool",
          value: "3 pools",
          label: "25 yd and 25 m lap lanes, a warm-water pool, a splash pad",
        }}
      />
      <Band tone="muted">
        <SectionHead title="Pools by club." className="mb-6" />
        <div className="relative overflow-x-auto border-y-2 border-foreground">
          <table className="w-full min-w-[720px] text-left text-body">
            <caption className="sr-only">Pools at each club</caption>
            <thead className="text-caption text-muted-foreground">
              <tr>
                {[
                  "Club",
                  "Pool",
                  "Lanes",
                  "Water",
                  "Lap lane booking",
                  "Pool hours (weekday)",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="p-3 font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "mesa-dobson",
                  "25-yd + warm-water",
                  "8",
                  "80–82°F, therapy pool 90–92°F",
                  "45-min slots",
                  "4:30 a.m.–9:30 p.m.",
                ],
                [
                  "mesa-red-mountain",
                  "Outdoor 25-m, shade sails",
                  "8",
                  "80–82°F",
                  "45-min slots",
                  "4:30 a.m.–9:30 p.m.",
                ],
                [
                  "gilbert-val-vista",
                  "25-yd + splash pad",
                  "6",
                  "80–82°F",
                  "45-min slots",
                  "4:30 a.m.–9:30 p.m.",
                ],
              ].map(([s, a, b, c, d, e]) => (
                <tr key={s} className="border-t border-border">
                  <th scope="row" className="font-display-wide p-3 text-h3">
                    <Link className="hover:underline" href={`/clubs/${s}`}>
                      {clubBySlug(s)!.name}
                    </Link>
                  </th>
                  <td className="p-3">{a}</td>
                  <td className="tabular p-3">{b}</td>
                  <td className="tabular p-3">{c}</td>
                  <td className="p-3">{d}</td>
                  <td className="tabular p-3">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex items-center gap-2 text-caption text-muted-foreground">
          <Minus className="size-4" aria-hidden="true" />
          No pool at Mesa – Downtown or Gilbert – Heritage. Ridge and Summit
          members can swim at the other three.
        </p>
      </Band>
      <Band>
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            {/* A hub around warm water: what the therapy pool is for. */}
            <ObjectRack
              ratio="3/2"
              layout="hub"
              scheme="sand"
              focus={spaceObjects["warm-pool"].lead}
              ids={spaceObjects["warm-pool"].around}
              className="rounded-lg edge ring-border"
            />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="font-display-wide text-h2 lg:text-h1">
              A warm pool for stiff joints.
            </h2>
            <p className="mt-4 text-body">
              The warm-water therapy pool at Mesa – Dobson stays at 90 to 92°F.
              The water holds you up. Many members use it after surgery or on
              sore days. Ask your doctor first. Our coaches can help you plan a
              first week.
            </p>
            <LinkButton
              href="/tour?club=mesa-dobson&note=warm-pool"
              className="mt-6"
            >
              Ask about the warm pool
            </LinkButton>
          </div>
        </div>
      </Band>
      <Band className="py-10 lg:py-14">
        <SectionHead size="quiet" title="Four swim classes." className="mb-4" />
        <ClubClassTable
          items={["lap-swim", "aqua-fit", "swim-school", "masters-swim"].map(
            (x) => classBySlug(x)!
          )}
          grouped={false}
        />
      </Band>
      <Band>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead
              title="Lanes in 45-minute slots."
              lede="Members book a lane in the app. Up to 2 swimmers share a lane."
              className="mb-6"
            />
            <LaneGrid />
            <div className="mt-4">
              <HandoffButton
                label="Book a lane"
                classSlug="lap-swim"
                club="gilbert-val-vista"
                start={360}
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <h3 className="font-display-wide mb-4 text-h3">Pool hours</h3>
            <HoursTable pool />
            <p className="mt-1 text-caption text-muted-foreground">
              Pools close 30 minutes before the club.
            </p>
            <p className="mt-6 max-w-[48ch] text-body text-muted-foreground">
              Shower first. Wear a swim cap if your hair is long. No glass. Kids
              swim with a parent. A lifeguard is always on duty.
            </p>
          </div>
        </div>
      </Band>
      <div className="border-t border-border">
        <FaqSection items={faq} title="Pool questions." />
      </div>
      <ClosingRow title="Test the water." />
    </>
  )
}
