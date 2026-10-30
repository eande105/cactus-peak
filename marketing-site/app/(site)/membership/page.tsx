import type { Metadata } from "next"
import Link from "next/link"
import { TextLink } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
import { PlanColumns, PlanComparisonTable } from "@/components/brand/plan-parts"
import {
  Breadcrumbs,
  Container,
  DenseSection,
  FaqSection,
  JsonLd,
  LeadSection,
  SplitSection,
  TourCTABand,
} from "@/components/sections/common"
import { FamilyCalculator } from "@/components/sections/family-calculator"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Membership plans and prices — Cactus Peak",
  description:
    "Trailhead $54, Ridge $79, Summit $129 per month. Month to month. Family add-ons from $19.",
}
const faq = [
  {
    id: "m1",
    q: "Can I cancel any time?",
    a: "Yes, with 30 days' notice. There is no contract.",
  },
  {
    id: "m2",
    q: "What is the facility fee?",
    a: "$49 once a year, charged in March.",
  },
  {
    id: "m3",
    q: "What does freeze cost?",
    a: "$10 a month for 1 to 3 months.",
  },
  {
    id: "m4",
    q: "Can I switch plans?",
    a: "Yes. Change in the app. An upgrade starts now, prorated by day. A downgrade starts on your next bill.",
  },
  {
    id: "m5",
    q: "Do kids need their own plan?",
    a: "No. Add children for $19 a month each.",
  },
]

export default async function MembershipPage() {
  const { plans } = await getCatalog()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": plans.map((p) => ({
            "@type": "Product",
            name: `Cactus Peak ${p.name}`,
            offers: { "@type": "Offer", price: p.price, priceCurrency: "USD" },
          })),
        }}
      />
      <Breadcrumbs trail={[{ label: "Membership" }]} />
      <Container className="pt-4 pb-4">
        <h1 className="display-lead">Three plans. One price each month.</h1>
        <p className="lede mt-4 text-muted-foreground">
          Month to month. No contract. Cancel or freeze with 30 days&apos;
          notice.
        </p>
        <p className="mt-4 max-w-[68ch] text-body">
          {/* The fall offer's only link on desktop, now that the header has no offer bar. */}
          <Link
            className="text-link underline underline-offset-4"
            href="/offers/fall-climb"
          >
            $0 enrollment through Nov 30
          </Link>{" "}
          (otherwise $49). A $49 facility fee is charged each March.{" "}
          <Link
            className="text-link underline underline-offset-4"
            href="/legal/membership-agreement"
          >
            Read the membership agreement
          </Link>
        </p>
      </Container>
      <Container id="plans" className="pt-6 pb-6">
        <h2 className="sr-only">Plans</h2>
        <PlanColumns />
        <TextLink href="/trial" className="mt-6">
          Not sure? Try a free 3-day pass
        </TextLink>
      </Container>
      <div className="mt-12">
        <SplitSection
          label="Add the whole family"
          id="family"
          graphic={
            <ObjectRack
              ratio="4/3"
              layout="cluster"
              scheme="copper"
              focus="playground"
              ids={[
                "pool",
                "cone",
                "tennis-ball",
                "basketball",
                "whistle",
                "water-bottle",
                "gym-bag",
                "sneaker",
                "jump-rope",
                "towel",
              ]}
            />
          }
        >
          <p className="mb-6 max-w-[56ch] text-body">
            Family members get the same access as the main member&apos;s plan.
            Kids club is included for children 12 and under. Teens 13 to 17
            follow the teen rules.
          </p>
          <FamilyCalculator />
        </SplitSection>
      </div>
      <LeadSection
        id="day-pass"
        title="Just visiting?"
        fact="$20"
        icon="water-bottle"
        factLabel="A day pass. One visit, one club. Pay at the desk or online."
      >
        <p className="max-w-[62ch] text-body">
          Bringing a friend? Ridge includes 1 guest pass a month, and Summit
          includes 4.{" "}
          <TextLink href="/legal/guest-policy" className="inline-flex">
            Guest policy
          </TextLink>
        </p>
      </LeadSection>
      <DenseSection label="Every detail" id="compare" icon="gym-bag">
        <PlanComparisonTable stickyTop />
      </DenseSection>
      <div className="border-t border-border">
        <FaqSection title="Money questions." items={faq} />
      </div>
      <TourCTABand title="Still deciding? Come see it." />
    </>
  )
}
