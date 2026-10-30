import type { Metadata } from "next"
import { CoachGrid } from "@/components/sections/coaches-client"
import {
  Breadcrumbs,
  Container,
  TourCTABand,
} from "@/components/sections/common"

export const metadata: Metadata = {
  title: "Meet the coaches — Cactus Peak",
  description: "Coaches at 5 clubs. Pick by club or by what you want to do.",
}
export default async function Coaches({
  searchParams,
}: {
  searchParams: Promise<{ club?: string; specialty?: string }>
}) {
  const sp = await searchParams
  return (
    <>
      <Breadcrumbs trail={[{ label: "Coaches" }]} />
      <Container className="pt-4 pb-12">
        <h1 className="display-lead">Meet the coaches.</h1>
        <p className="mt-4 max-w-[52ch] text-body text-muted-foreground">
          Coaches at 5 clubs. Pick by club or by what you want to do.
        </p>
        <div className="mt-8">
          <CoachGrid init={sp} />
        </div>
      </Container>
      <TourCTABand title="Meet a coach on a free tour." />
    </>
  )
}
