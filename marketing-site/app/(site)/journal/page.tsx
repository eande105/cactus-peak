import type { Metadata } from "next"
import {
  Breadcrumbs,
  ClosingRow,
  Container,
  SplitSection,
} from "@/components/sections/common"
import { JournalIndex } from "@/components/sections/journal-parts"
import { NewsletterStrip } from "@/components/sections/small-client"

export const metadata: Metadata = {
  title: "The Journal — Cactus Peak",
  description:
    "Training notes from our coaches. Written in Mesa and Gilbert, in the heat.",
}
export default function Journal() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Journal" }]} />
      <Container className="pt-4 pb-10">
        <h1 className="display-lead">The Journal.</h1>
        <p className="lede mt-4 text-muted-foreground">
          Training notes from our coaches. Written in Mesa and Gilbert, in the
          heat.
        </p>
      </Container>
      <Container className="pb-16">
        <JournalIndex />
      </Container>
      <SplitSection label="One note a month">
        <div className="max-w-md">
          <NewsletterStrip />
        </div>
      </SplitSection>
      <ClosingRow title="Come see the club." />
    </>
  )
}
