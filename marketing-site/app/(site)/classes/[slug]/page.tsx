import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { ClassCard, CoachCard } from "@/components/brand/class-parts"
import {
  categoryObject,
  categoryRelated,
  ObjectRack,
} from "@/components/brand/graphics"
import { IntensityRibs } from "@/components/brand/meters"
import { Check } from "@/components/icons"
import {
  Band,
  Breadcrumbs,
  Container,
  FaqSection,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import { ScheduleTeaser } from "@/components/sections/schedule-parts"
import { runsAt } from "@/lib/catalog"
import { getCatalog } from "@/lib/catalog/server"
import type { ClassType } from "@/lib/types"

export const dynamicParams = false
export async function generateStaticParams() {
  const { classTypes } = await getCatalog()
  return classTypes.map((c) => ({ slug: c.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const c = (await getCatalog()).classBySlug((await params).slug)
  return c
    ? {
        title: `${c.name} — ${c.categoryName} class at Cactus Peak`,
        description: `${c.blurb} ${c.duration} min, intensity ${c.intensity[1]} of 5. Try it free with a 3-day pass.`,
      }
    : {}
}

const expect: Record<string, string[]> = {
  "climb-cycle": [
    "Arrive 10 minutes early. A coach sets your seat and handlebars.",
    "Warm up for 5 minutes. Easy spin, light load.",
    "Climb for 30 minutes. The coach calls out loads from 1 to 10. You pick yours.",
    "Cool down for 5 minutes. Stretch off the bike.",
    "Leave. Water is free at the studio door.",
  ],
}
const generic = (d: number) => [
  "Arrive 10 minutes early. Tell the coach if it is your first class.",
  "Warm up with easy movement. Nothing hard yet.",
  `Work for the main block. The coach gives you options, so you pick your load.`,
  "Cool down and stretch.",
  `Leave after ${d} minutes. Water is free at the studio door.`,
]
const faqFor = (c: ClassType) => [
  {
    id: "f1",
    q: `Is ${c.name} good for a first ${c.category === "cycle" ? "ride" : "class"}?`,
    a: c.firstTimer
      ? "Yes. Tell the coach it is your first class and pick a lighter load."
      : "It helps to have some experience. Ask for a tour and a coach will suggest a first step.",
  },
  {
    id: "f2",
    q: "Can I take it with a bad knee?",
    a: "Talk to a coach before class. Choose a lighter load and stay seated, or pick an easier class.",
  },
  {
    id: "f3",
    q: "How long is it?",
    a: `${c.duration} minutes. Arrive 10 minutes early.`,
  },
  {
    id: "f4",
    q: "Can I cancel?",
    a: "Free up to 2 hours before. After that it counts as a late cancel.",
  },
]

export default async function ClassPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const {
    classBySlug,
    categoryById,
    classTypes,
    clubs,
    profileCoaches,
    slots,
    coachById,
  } = await getCatalog()
  const ct = classBySlug((await params).slug)
  if (!ct) notFound()
  const cat = categoryById(ct.category)
  if (!cat) notFound()
  const where = clubs.filter((c) => runsAt(ct, c.slug))
  // Coaches with a profile who list the class, or who lead it in the timetable.
  const leads = new Set(
    slots
      .filter((s) => s.classKey === ct.key)
      .map((s) => coachById(s.coachId)?.slug)
  )
  const teach = profileCoaches
    .filter((c) => c.teaches.includes(ct.slug) || leads.has(c.slug))
    .slice(0, 3)
  const related = classTypes
    .filter((c) => c.category === ct.category && c.slug !== ct.slug)
    .concat(
      classTypes.filter(
        (c) =>
          c.category !== ct.category &&
          Math.abs(c.intensity[1] - ct.intensity[1]) <= 1
      )
    )
    .slice(0, 3)
  const steps = expect[ct.slug] ?? generic(ct.duration)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: ct.name,
          description: ct.blurb,
        }}
      />
      <Breadcrumbs
        trail={[
          { label: "Classes", href: "/classes" },
          { label: cat.name, href: `/classes/category/${cat.id}` },
          { label: ct.name },
        ]}
      />
      {/* Hero: the name, one line, one action. The breadcrumb names the category, so no badge (REDESIGN.md goals 1 and 3). */}
      <Container className="grid gap-8 pt-4 pb-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="display-lead text-balance">{ct.name}</h1>
          <p className="lede mt-6 text-pretty">{ct.blurb}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <LinkButton href="/trial" size="lg">
              Try it free
            </LinkButton>
            <TextLink href="#times">See times</TextLink>
          </div>
        </div>
        <div className="lg:col-span-5">
          {/* An orbit around the category's object: the class at the centre, its gear on the rings. */}
          <ObjectRack
            ratio="4/3"
            layout="orbit"
            focus={categoryObject[ct.category]}
            ids={categoryRelated[ct.category]}
            className="rounded-lg"
          />
        </div>
        {/* Three facts at body size. Group size and equipment move to "Is it for you?". */}
        <dl className="grid gap-6 border-t border-border pt-6 sm:grid-cols-3 lg:col-span-12">
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-caption text-muted-foreground">Length</dt>
            <dd className="font-display-wide tabular text-h2">
              {ct.duration} min
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-caption text-muted-foreground">Intensity</dt>
            <dd className="flex min-h-[30px] items-center">
              <IntensityRibs
                level={ct.intensity}
                categoryId={ct.category}
                size="md"
              />
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-caption text-muted-foreground">Level</dt>
            <dd className="font-display-wide text-h2">
              {ct.firstTimer ? "First-timers" : "Some experience"}
            </dd>
          </div>
        </dl>
      </Container>

      <Band tone="muted">
        <SectionHead title="What to expect." />
        <ol className="mt-10 flex max-w-[62ch] flex-col gap-6">
          {steps.map((s, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: steps are a static list that never reorders
            <li key={i} className="grid grid-cols-[2rem_1fr] gap-4">
              <span
                aria-hidden="true"
                className="tabular inline-flex size-8 items-center justify-center rounded-full bg-night text-label text-night-foreground"
              >
                {i + 1}
              </span>
              <p className="pt-1 text-body">{s}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="times">
        <SectionHead
          title="When it runs."
          lede={
            ct.clubs === "all"
              ? "All 5 clubs run it."
              : `${where.length} ${where.length === 1 ? "club runs" : "clubs run"} it.`
          }
          className="mb-8"
        />
        <ScheduleTeaser classSlug={ct.slug} allowAll hideClass />
      </Band>

      <Band>
        <SectionHead title="Is it for you?" />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <ul className="flex flex-col gap-3 text-body lg:col-span-7">
            {[
              ct.pick.replace("Pick this if ", "You ").replace(/\.$/, "."),
              ct.firstTimer
                ? "You are new and want a coach to set you up first."
                : "You already have some base fitness.",
              `You like a ${ct.duration}-minute class.`,
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <dl className="grid gap-5 text-body lg:col-span-5">
            <div>
              <dt className="font-semibold">Bring</dt>
              <dd className="text-muted-foreground">{ct.gear}</dd>
            </div>
            <div>
              <dt className="font-semibold">Group size</dt>
              <dd className="text-muted-foreground">{ct.group}</dd>
            </div>
            <div>
              <dt className="font-semibold">We provide</dt>
              <dd className="text-muted-foreground">
                Equipment, lockers, and towels for Summit members.
              </dd>
            </div>
          </dl>
        </div>
      </Band>

      {teach.length ? (
        <Band tone="muted">
          <SectionHead title="Your coaches." className="mb-6" />
          <div className="grid gap-3 sm:grid-cols-3">
            {teach.map((c) => (
              <CoachCard key={c.slug} coach={c} variant="compact" />
            ))}
          </div>
        </Band>
      ) : null}
      <FaqSection items={faqFor(ct)} />
      <Band tone="muted">
        <SectionHead title={`If you like ${ct.name}.`} className="mb-6" />
        <ul className="grid gap-3 sm:grid-cols-3">
          {related.map((c) => (
            <li key={c.slug}>
              <ClassCard ct={c} variant="compact" />
            </li>
          ))}
        </ul>
      </Band>
      <TourCTABand
        title={`Try ${ct.name} free.`}
        support="Book a tour or a 3-day pass. Tell the coach it is your first class."
      />
    </>
  )
}
