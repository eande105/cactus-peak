import type { Metadata } from "next"
import { Breadcrumbs, Container } from "@/components/sections/common"
import { ScheduleBoard } from "@/components/sections/schedule-board"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Class schedule — Cactus Peak Athletic",
  description:
    "See this week's classes at all 5 clubs. Filter by club, category and intensity.",
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const { coaches } = await getCatalog()
  return (
    <>
      <Breadcrumbs trail={[{ label: "Schedule" }]} />
      <Container className="pt-4 pb-6">
        <h1 className="font-display-wide text-h1 lg:text-display">
          Class schedule.
        </h1>
        <p className="mt-3 max-w-[56ch] text-body text-muted-foreground">
          All 5 clubs, this week. Members book in the app. Not a member? Try a
          free 3-day pass.
        </p>
      </Container>
      <ScheduleBoard
        init={{
          club: sp.club,
          category: sp.category,
          classSlug: sp.class,
          coach: coaches.find((c) => c.slug === sp.coach)?.name,
          firstTimer: sp.firstTimer === "1",
          time: sp.time,
        }}
      />
    </>
  )
}
