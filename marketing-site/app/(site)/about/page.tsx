import type { Metadata } from "next"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { RibMeter } from "@/components/brand/meters"
import {
  Breadcrumbs,
  Container,
  StatTile,
  TourCTABand,
} from "@/components/sections/common"

export const metadata: Metadata = {
  title: "About Cactus Peak — built for the East Valley",
  description:
    "Five clubs in Mesa and Gilbert. One idea: every member climbs at their own pace.",
}
const years = [
  ["2014", "Mesa – Dobson"],
  ["2017", "Mesa – Red Mountain"],
  ["2020", "Mesa – Downtown"],
  ["2022", "Gilbert – Val Vista"],
  ["2024", "Gilbert – Heritage"],
]
export default function About() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "About" }]} />
      <Container className="pt-4 pb-10">
        <h1 className="display-hero max-w-4xl">Built for the East Valley.</h1>
        <p className="lede mt-5 text-muted-foreground">
          Five clubs in Mesa and Gilbert. One idea: every member climbs at their
          own pace.
        </p>
        <TextLink href="/coaches" className="mt-3">
          Meet the coaches
        </TextLink>
      </Container>

      <Container className="grid gap-10 pb-16 lg:grid-cols-12 lg:gap-12 lg:pb-20">
        <div className="lg:col-span-5">
          <h2 className="display-quiet">Our story</h2>
          <p className="mt-4 max-w-[56ch] text-body">
            We opened Mesa – Dobson in 2014 with a pool, a few courts and a
            rule: nobody gets shamed. People came for the water and stayed for
            the people. We opened a club at a time, each one built for its
            neighborhood, and we kept the rule. A first visit is free, the
            coaches know your name, and progress is a long climb, so we do not
            sell shortcuts.
          </p>
        </div>
        <ol className="border-t-2 border-foreground lg:col-span-7">
          {years.map(([y, n]) => (
            <li
              key={y}
              className="flex items-baseline gap-6 border-b border-border py-4"
            >
              <span className="tabular font-data text-[3.5rem] leading-none font-bold">
                {y}
              </span>
              <span className="font-display-wide text-h3">{n}</span>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="grid items-center gap-8 border-t border-border pt-12 pb-16 lg:grid-cols-12 lg:gap-12 lg:pb-20">
        <svg
          viewBox="0 0 256 256"
          className="size-48 lg:col-span-4 lg:size-64"
          role="img"
          aria-label="Rib Peak symbol"
        >
          <path
            fill="var(--color-1)"
            d="M12.53,230L12.53,222L42,170.96L42,230ZM58,230L58,143.24L88,91.28L88,230ZM104,230L104,63.57L128,22L152,63.57L152,230ZM168,230L168,91.28L198,143.24L198,230ZM214,230L214,170.96L243.47,222L243.47,230Z"
          />
        </svg>
        <div className="lg:col-span-7">
          <h2 className="display-quiet">
            The mark has five ribs, one for each club.
          </h2>
          <p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
            Our symbol is a desert peak cut into five upright ribs. Together
            they make one summit.
          </p>
          <div className="mt-4 flex items-center gap-3 text-caption">
            <RibMeter
              value={5}
              tone="brand"
              size="md"
              label="Five clubs"
              valueText="Five clubs"
              decorative
            />
            5 clubs
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <dl className="grid gap-4 border-t-2 border-foreground pt-6 sm:grid-cols-3 sm:gap-6">
          <StatTile phoneRow value="5" label="clubs" icon="key" />
          <StatTile phoneRow value="28" label="class types" icon="schedule" />
          <StatTile phoneRow value="4:30 a.m." label="first doors" icon="sun" />
        </dl>
      </Container>

      <Container className="grid gap-10 border-t border-border py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-5">
          <h2 className="display-quiet">Part of the neighborhood</h2>
          <p className="mt-3 max-w-[44ch] text-body">
            School swim programs, a local running group (Canal Run Club), a
            senior center and physical therapy clinics.
          </p>
        </div>
        <div className="lg:col-span-7">
          <h3 className="eyebrow mb-4">Who runs it</h3>
          <ul className="grid gap-6 sm:grid-cols-3">
            {[
              [
                "Renata Alvarez",
                "Owner-operator",
                "Desert Flow Yoga",
                "Mesa – Dobson",
                "I swam here before I owned it.",
              ],
              [
                "Tom Becker",
                "Operations lead",
                "Endurance 60",
                "Gilbert – Val Vista",
                "Open the doors on time. Everything follows.",
              ],
              [
                "Priyanka Shah",
                "Head of coaching",
                "Rib Rack Strength",
                "Gilbert – Heritage",
                "A good coach asks before telling.",
              ],
            ].map(([n, r, f, c, q]) => (
              <li key={n} className="border-t-2 border-foreground pt-3">
                <p className="font-display-wide text-h3">{n}</p>
                <p className="text-caption">{r}</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  Favorite class: {f} · {c}
                </p>
                <p className="mt-2 text-caption">“{q}”</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground py-6">
          <h2 className="font-display-wide text-h2">Join the team.</h2>
          <LinkButton href="/careers" variant="outline">
            See open roles
          </LinkButton>
        </div>
      </Container>
      <TourCTABand />
    </>
  )
}
