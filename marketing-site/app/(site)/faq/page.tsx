import type { Metadata } from "next"
import { LinkButton } from "@/components/brand/atoms"
import {
  Band,
  Breadcrumbs,
  Container,
  JsonLd,
} from "@/components/sections/common"
import { FaqExplorer } from "@/components/sections/faq-client"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Questions about Cactus Peak — FAQ",
  description:
    "Short answers on tours, passes, fees, booking rules and kids club.",
}
export default async function FaqPage() {
  const { faqs } = await getCatalog()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Breadcrumbs trail={[{ label: "FAQ" }]} />
      <Container className="pt-4 pb-12">
        <h1 className="display-lead">Questions</h1>
        <p className="mt-4 max-w-[52ch] text-body text-muted-foreground">
          Short answers. If yours is not here, call us.
        </p>
        <div className="mt-8">
          <FaqExplorer />
        </div>
      </Container>
      <Band tone="muted">
        <div className="max-w-xl">
          <h2 className="font-display-wide text-h2">Still have a question?</h2>
          <p className="mt-2 text-body">
            Call your club or send us a message. We answer within 1 business
            day.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LinkButton href="tel:+14805550100">Call (480) 555-0100</LinkButton>
            <LinkButton href="/contact" variant="outline">
              Send a message
            </LinkButton>
          </div>
        </div>
      </Band>
    </>
  )
}
