import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LinkButton } from "@/components/brand/atoms"
import { Check } from "@/components/icons"
import {
  Band,
  Breadcrumbs,
  Container,
  JsonLd,
} from "@/components/sections/common"
import { ShareButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const dynamicParams = false
export async function generateStaticParams() {
  const { jobs } = await getCatalog()
  return jobs.map((j) => ({ slug: j.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const j = (await getCatalog()).jobs.find((x) => x.slug === slug)
  return j
    ? {
        title: `${j.title}, ${j.club} — Cactus Peak careers`,
        description: `${j.type} ${j.title.toLowerCase()} at ${j.club}. ${j.pay}.`,
      }
    : {}
}
export default async function Job({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const j = (await getCatalog()).jobs.find((x) => x.slug === slug)
  if (!j) notFound()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: j.title,
          hiringOrganization: {
            "@type": "Organization",
            name: "Cactus Peak Athletic",
          },
          jobLocation: j.club,
          employmentType: j.type,
        }}
      />
      <Breadcrumbs
        trail={[{ label: "Careers", href: "/careers" }, { label: j.title }]}
      />
      <Container className="pt-4 pb-12">
        <h1 className="font-display-wide text-h1 lg:text-display">{j.title}</h1>
        <p className="tabular mt-3 text-body">
          {j.club} · {j.type} · {j.pay}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <LinkButton href="https://example.com/apply" external size="lg">
            Apply
          </LinkButton>
          <ShareButton label="Share" />
        </div>
      </Container>
      <Band tone="muted">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="max-w-[62ch] lg:col-span-7">
            <h2 className="font-display-wide text-h2">Overview</h2>
            <p className="mt-2 text-body">
              You will work with a small team at {j.club}. You will help members
              feel welcome from the first visit, and you will keep the club safe
              and clean.
            </p>
            <h2 className="font-display-wide mt-8 text-h2">What you will do</h2>
            <ul className="mt-2 flex flex-col gap-2 text-body">
              {[
                "Greet members by name",
                "Follow the club's safety routines",
                "Work with coaches and the desk",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check
                    className="mt-1 size-4 text-success"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="font-display-wide text-h2">What you bring</h2>
            <ul className="mt-2 flex flex-col gap-2 text-body">
              {[
                "Friendly and steady",
                "Reliable on early shifts",
                "Certifications for the role, or willing to earn them (paid)",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check
                    className="mt-1 size-4 text-success"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <h2 className="font-display-wide mt-8 text-h2">Benefits</h2>
            <p className="mt-2 text-body">
              Free membership for you and your family. Paid training.
            </p>
          </div>
        </div>
      </Band>
    </>
  )
}
