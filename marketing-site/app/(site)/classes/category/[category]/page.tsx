import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { CoachCard } from "@/components/brand/class-parts"
import {
  categoryObject,
  categoryRelated,
  ObjectRack,
} from "@/components/brand/graphics"
import { ClubClassTable } from "@/components/sections/club-class-table"
import {
  Band,
  Breadcrumbs,
  Container,
  FaqSection,
  TourCTABand,
} from "@/components/sections/common"
import { ScheduleTeaser } from "@/components/sections/schedule-parts"
import { getCatalog } from "@/lib/catalog/server"

export const dynamicParams = false
export async function generateStaticParams() {
  const { categories } = await getCatalog()
  return categories.map((c) => ({ category: c.id }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const c = (await getCatalog()).categoryById((await params).category)
  return c
    ? {
        title: `${c.name} classes in Mesa and Gilbert — Cactus Peak`,
        description: `${c.count} ${c.name.toLowerCase()} classes, from intensity ${c.intensity[0]} to ${c.intensity[1]}. See times at all 5 clubs.`,
      }
    : {}
}
const faqs: Record<string, { id: string; q: string; a: string }[]> = {
  cycle: [
    {
      id: "c1",
      q: "Do I need cycling shoes?",
      a: "No. Our bikes have flat pedals on one side and clips on the other.",
    },
    {
      id: "c2",
      q: "How do I set up the bike?",
      a: "Arrive 10 minutes early. A coach sets the seat and handlebars with you.",
    },
    {
      id: "c3",
      q: "Can I book a specific bike?",
      a: "Yes. Pick your bike in the app after you join.",
    },
  ],
}
const generic = (n: string) => [
  {
    id: "g1",
    q: `Is ${n} good for a first class?`,
    a: "Many classes are. Look for the first-timers tick on each class card, and tell the coach it is your first time.",
  },
  {
    id: "g2",
    q: "Can I cancel?",
    a: "Free up to 2 hours before. After that it counts as a late cancel.",
  },
  {
    id: "g3",
    q: "Do I need to bring anything?",
    a: "Water, a towel and shoes you can move in. We have loaners for most gear.",
  },
]

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const {
    categoryById,
    classesIn,
    profileCoaches: coaches,
  } = await getCatalog()
  const cat = categoryById((await params).category)
  if (!cat) notFound()
  const list = classesIn(cat.id)
  const cs = coaches
    .filter((c) => c.teaches.some((t) => list.some((l) => l.slug === t)))
    .slice(0, 3)
  return (
    <>
      <Breadcrumbs
        trail={[{ label: "Classes", href: "/classes" }, { label: cat.name }]}
      />
      <Container className="grid items-center gap-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-12 lg:pb-20">
        <div className="lg:col-span-7">
          <h1
            className="display-lead border-l-[6px] pl-4"
            style={{ borderColor: `var(--cat-${cat.id})` }}
          >
            {cat.name} classes.
          </h1>
          <p className="lede mt-4">{cat.lede}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6">
            <LinkButton href="/tour" size="lg">
              Book a free tour
            </LinkButton>
            <TextLink href={`/schedule?category=${cat.id}`}>
              See all {cat.name.toLowerCase()} times
            </TextLink>
          </div>
        </div>
        <div className="lg:col-span-5">
          {/* An arc of the category's gear rising to its object: the range of classes in it. */}
          <ObjectRack
            ratio="4/3"
            layout="arc"
            focus={categoryObject[cat.id]}
            ids={categoryRelated[cat.id]}
            className="rounded-lg"
          />
        </div>
      </Container>
      <Band tone="muted">
        <h2 className="display-quiet mb-4">Classes</h2>
        <ClubClassTable items={list} grouped={false} />
        <ul className="mt-6 grid gap-x-12 gap-y-1 text-body md:grid-cols-2">
          {list.map((c) => (
            <li key={c.slug}>
              <span className="font-semibold">{c.name}.</span>{" "}
              <span className="text-muted-foreground">{c.pick}</span>
            </li>
          ))}
        </ul>
      </Band>
      <Band>
        <SectionHead title={`${cat.name} this week.`} className="mb-8" />
        <ScheduleTeaser category={cat.id} allowAll />
      </Band>
      <Band tone="muted">
        <SectionHead title={`${cat.name} coaches.`} className="mb-8" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cs.map((c) => (
            <CoachCard key={c.slug} coach={c} variant="compact" />
          ))}
        </div>
      </Band>
      <FaqSection items={faqs[cat.id] ?? generic(cat.name)} />
      <TourCTABand
        title={`Try ${cat.name.toLowerCase()} free.`}
        support="Book a tour or a 3-day pass. Ask a coach to walk you through it."
      />
    </>
  )
}
