import type { Metadata } from "next"
import { LinkButton } from "@/components/brand/atoms"
import { JobList } from "@/components/sections/careers-client"
import {
  Breadcrumbs,
  Container,
  DenseSection,
  QuietSection,
  SplitSection,
  TourTimeline,
} from "@/components/sections/common"

export const metadata: Metadata = {
  title:
    "Careers at Cactus Peak — coaches, lifeguards, kids club and front desk",
  description: "Open roles at five clubs in Mesa and Gilbert.",
}
export default function Careers() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Careers" }]} />
      <Container className="grid items-center gap-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h1 className="display-lead">Help people climb.</h1>
          <p className="lede mt-4">
            We hire coaches, lifeguards, kids club staff and front desk teams
            for five clubs in Mesa and Gilbert.
          </p>
          <LinkButton href="#roles" size="lg" className="mt-6">
            See open roles
          </LinkButton>
        </div>
        <div className="lg:col-span-6">
          <div className="flex aspect-[3/2] flex-col justify-end rounded-lg bg-night p-6 text-night-foreground">
            <p className="tabular font-data text-[3.5rem] leading-none font-bold">
              5:50
            </p>
            <p className="text-body text-night-muted">
              a.m. Front desk huddle, before the doors open at 6:00.
            </p>
          </div>
        </div>
      </Container>
      <QuietSection>
        <h2 className="sr-only">Why work here</h2>
        <ul className="font-display-wide flex flex-col gap-2 text-h3">
          {[
            "Free membership for you and your family.",
            "Schedules that fit a life: shifts from 4:30 a.m. to 10 p.m.",
            "Training and certifications paid.",
          ].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </QuietSection>
      <DenseSection label="Open roles" id="roles">
        <JobList />
      </DenseSection>
      <SplitSection label="How we hire">
        <TourTimeline
          steps={[
            {
              title: "Apply.",
              text: "Send an application through our applicant system.",
            },
            {
              title: "Phone chat.",
              text: "A short call with the club's manager.",
            },
            { title: "Visit a club.", text: "Meet the team. Try the work." },
            {
              title: "Offer.",
              text: "A written offer within 3 business days.",
            },
          ]}
        />
        <p className="mt-8 text-body text-muted-foreground">
          Cactus Peak is an equal opportunity employer. To ask for an
          accommodation, call (480) 555-0100.
        </p>
      </SplitSection>
    </>
  )
}
