import type { Metadata } from "next"
import { SectionHead } from "@/components/brand/atoms"
import {
  ClubComparisonTable,
  ClubFinderSplit,
  ClubsHeaderSearch,
} from "@/components/sections/clubs-client"
import {
  Band,
  Breadcrumbs,
  Container,
  TourCTABand,
} from "@/components/sections/common"
import type { AmenityKey } from "@/lib/types"

export const metadata: Metadata = {
  title: "Gym locations in Mesa and Gilbert, AZ — Cactus Peak",
  description:
    "Find the club near you. 5 clubs, hours, pools, courts and kids club. Open 4:30 a.m. weekdays.",
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ amenity?: string }>
}) {
  const sp = await searchParams
  const initial = (sp.amenity?.split(",") ?? []).filter((k): k is AmenityKey =>
    ["pool", "courts", "cycling", "kids", "recovery", "classes"].includes(k)
  )
  return (
    <>
      <Breadcrumbs trail={[{ label: "Clubs" }]} />
      <Container className="grid gap-6 pt-4 pb-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display-lead">Find your club.</h1>
          <p className="lede mt-3 text-muted-foreground">
            Five clubs in Mesa and Gilbert. All open at 4:30 a.m. on weekdays.
          </p>
        </div>
        <div className="lg:col-span-5">
          <ClubsHeaderSearch />
        </div>
      </Container>
      <ClubFinderSplit initial={initial} />
      <Band tone="muted" id="compare">
        <SectionHead title="Which club has what." className="mb-8" />
        <ClubComparisonTable />
      </Band>
      <TourCTABand
        title="Not sure which club? Tour two."
        support="Book one tour. Ask your coach to walk you to the club that fits."
      />
    </>
  )
}
