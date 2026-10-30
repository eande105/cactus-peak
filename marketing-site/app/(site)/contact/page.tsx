import type { Metadata } from "next"
import Link from "next/link"
import { Accessibility, Briefcase, Newspaper } from "@/components/icons"
import {
  Breadcrumbs,
  Container,
  SplitSection,
} from "@/components/sections/common"
import { ContactForm } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Contact Cactus Peak — call a club or send a message",
  description:
    "Call the club for the fastest answer. The desk is staffed 6:00 a.m. to 8:00 p.m.",
}
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; club?: string }>
}) {
  const sp = await searchParams
  const { clubs } = await getCatalog()
  const topics: Record<string, string> = {
    tour: "Tour or pass",
    accessibility: "Something else",
    coach: "Something else",
    orientation: "Membership",
  }
  return (
    <>
      <Breadcrumbs trail={[{ label: "Contact" }]} />
      <Container className="pt-4 pb-10">
        <h1 className="display-lead">Talk to a person.</h1>
        <p className="lede mt-4 text-muted-foreground">
          Call the club for the fastest answer. The desk is staffed 6:00 a.m. to
          8:00 p.m. For a medical emergency, call 911.
        </p>
      </Container>
      <Container className="pb-12">
        <h2 className="sr-only">Club phone numbers and hours</h2>
        <div className="relative overflow-x-auto border-y-2 border-foreground">
          <table className="w-full min-w-[760px] text-left text-body">
            <caption className="sr-only">Clubs</caption>
            <thead className="text-caption text-muted-foreground">
              <tr>
                {["Club", "Address", "Phone", "Hours today", "Directions"].map(
                  (h) => (
                    <th key={h} scope="col" className="p-3 font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c.slug} className="border-t border-border">
                  <th scope="row" className="font-display-wide p-3 text-h3">
                    {c.name}
                  </th>
                  <td className="p-3">
                    {c.cross}, {c.city}, AZ {c.zip}
                  </td>
                  <td className="tabular p-3">
                    <a
                      className="inline-flex min-h-11 items-center font-semibold text-link underline-offset-4 hover:underline"
                      href={`tel:${c.tel}`}
                    >
                      {c.phone}
                    </a>
                  </td>
                  <td className="tabular p-3">4:30 a.m.–10 p.m.</td>
                  <td className="p-3">
                    <a
                      className="inline-flex min-h-11 items-center text-link underline-offset-4 hover:underline"
                      href="https://maps.apple.com/"
                      target="_blank"
                      rel="noopener"
                    >
                      Directions
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-body text-muted-foreground">
          Member services:{" "}
          <a
            className="tabular font-semibold text-link underline underline-offset-4"
            href="tel:+14805550100"
          >
            (480) 555-0100
          </a>
          . Mon–Fri 4:30 a.m.–10 p.m., Sat–Sun 6 a.m.–8 p.m. Staffed 6 a.m.–8
          p.m.
        </p>
      </Container>
      <SplitSection label="Send a message">
        <ContactForm
          defaults={{ topic: topics[sp.topic ?? ""], club: sp.club }}
        />
        <p className="mt-6 text-body font-semibold">
          We reply within 1 business day.
        </p>
        <ul className="mt-3 flex flex-col divide-y divide-border border-y border-border text-body">
          <li>
            <Link
              href="/legal/accessibility"
              className="flex min-h-14 items-center gap-3 hover:underline"
            >
              <Accessibility className="size-5" aria-hidden="true" />
              Accessibility feedback
            </Link>
          </li>
          <li>
            <a
              href="mailto:press@cactuspeakathletic.com"
              className="flex min-h-14 items-center gap-3 hover:underline"
            >
              <Newspaper className="size-5" aria-hidden="true" />
              Press: press@cactuspeakathletic.com
            </a>
          </li>
          <li>
            <Link
              href="/careers"
              className="flex min-h-14 items-center gap-3 hover:underline"
            >
              <Briefcase className="size-5" aria-hidden="true" />
              Careers
            </Link>
          </li>
        </ul>
      </SplitSection>
    </>
  )
}
