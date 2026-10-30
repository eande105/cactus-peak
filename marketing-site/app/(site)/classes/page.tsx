import type { Metadata } from "next"
import { LinkButton, SectionHead } from "@/components/brand/atoms"
import { ClassCard } from "@/components/brand/class-parts"
import { CategoryIndex } from "@/components/sections/category-index"
import { ClassesExplorer } from "@/components/sections/classes-client"
import { Band, PageHead, TourCTABand } from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Classes in Mesa and Gilbert — Cactus Peak",
  description: "28 classes, from intensity 1 to 5. See times at all 5 clubs.",
}

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ firstTimer?: string }>
}) {
  const sp = await searchParams
  const { classBySlug, firstTimerShelf, categories } = await getCatalog()
  return (
    <>
      <PageHead
        trail={[{ label: "Classes" }]}
        title="Eight ways to climb."
        lede="28 classes, from intensity 1 to 5. Pick by how you want to feel when you leave."
      />
      <Band className="hidden !pt-0 md:block lg:!pb-12">
        <h2 className="sr-only">Class types</h2>
        <CategoryIndex categories={categories} />
      </Band>
      <ClassesExplorer initialFirstTimer={sp.firstTimer === "1"} />
      <Band tone="muted">
        <SectionHead
          title="Start here."
          lede="These classes say hello first."
          action={
            <LinkButton href="/trial" variant="outline">
              Try one with a free 3-day pass
            </LinkButton>
          }
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {firstTimerShelf.map((s) => (
            <li key={s}>
              <ClassCard ct={classBySlug(s)!} variant="compact" />
            </li>
          ))}
        </ul>
      </Band>
      <TourCTABand
        title="See a class before you sign up."
        support="A tour includes a look into a live class. Ask the coach anything."
      />
    </>
  )
}
