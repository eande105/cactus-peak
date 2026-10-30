import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClassCard, InstructorChip } from "@/components/brand/class-parts"
import { JournalArt } from "@/components/brand/journal-art"
import {
  Band,
  Breadcrumbs,
  Container,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import { JournalCard } from "@/components/sections/journal-parts"
import { ShareButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const dynamicParams = false
export async function generateStaticParams() {
  const { journal } = await getCatalog()
  return journal.map((p) => ({ slug: p.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = (await getCatalog()).journal.find((x) => x.slug === slug)
  return p
    ? { title: `${p.title} — Cactus Peak Journal`, description: p.dek }
    : {}
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { journal, classBySlug, coachBySlug } = await getCatalog()
  const p = journal.find((x) => x.slug === slug)
  if (!p) notFound()
  const author = coachBySlug(p.author)
  const a = author ?? {
    name: "Cactus Peak coaches",
    slug: "",
    credential: "",
    profile: false,
  }
  const cls = classBySlug(p.cls)
  const sections = p.sections
  const related = journal.filter((x) => x.slug !== p.slug).slice(0, 3)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          author: { "@type": "Person", name: a.name },
          datePublished: p.iso,
        }}
      />
      <Breadcrumbs
        trail={[
          { label: "Journal", href: "/journal" },
          { label: p.title.length > 40 ? `${p.title.slice(0, 40)}…` : p.title },
        ]}
      />
      <Container className="pt-4 pb-8">
        <div className="max-w-3xl">
          <h1 className="font-display-wide text-h1 lg:text-display">
            {p.title}
          </h1>
          <p className="mt-4 text-body text-muted-foreground">{p.dek}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <InstructorChip name={a.name} slug={a.slug} size={40} />
            <span className="tabular text-caption text-muted-foreground">
              {p.date} · {p.min} min read
            </span>
            <ShareButton label="Share" />
          </div>
        </div>
        <div className="mt-8">
          <JournalArt
            slug={p.slug}
            ratio="21/9"
            className="max-w-[960px] overflow-hidden rounded-lg"
          />
        </div>
      </Container>
      <Container className="grid gap-8 pb-12 lg:grid-cols-12">
        <nav
          aria-label="In this article"
          className="hidden lg:col-span-2 lg:block"
        >
          <div className="sticky top-24">
            <p className="eyebrow mb-3 text-muted-foreground">
              In this article
            </p>
            <ol className="flex flex-col gap-2 text-caption">
              {sections.map(([h], i) => (
                <li key={h}>
                  <a className="hover:underline" href={`#s${i + 1}`}>
                    {i + 1}. {h}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <article className="max-w-[680px] lg:col-span-8 lg:col-start-4">
          {sections.map(([h, t], i) => (
            <section key={h} id={`s${i + 1}`} className="scroll-mt-24 pb-8">
              <h2 className="font-display-wide mb-3 text-h2">
                {i + 1}. {h}
              </h2>
              <p className="max-w-[62ch] text-[1.125rem] leading-[1.75rem]">
                {t}
              </p>
              {i === 1 && cls ? (
                <div className="mt-6 max-w-md">
                  <ClassCard ct={cls} variant="compact" />
                </div>
              ) : null}
              {i === sections.length - 1 ? (
                <div className="my-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground pt-4">
                  <p className="font-display-wide text-h3">
                    Try a class free. Get a 3-day pass.
                  </p>
                  <LinkButton href="/trial" variant="outline">
                    Get a 3-day pass
                  </LinkButton>
                </div>
              ) : null}
            </section>
          ))}
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-card p-5 edge ring-border">
            <InstructorChip
              name={a.name}
              slug={a.slug}
              size={64}
              showName={false}
            />
            <div>
              <p className="font-display-wide text-h3">{a.name}</p>
              <p className="text-body text-muted-foreground">{a.credential}</p>
              {a.profile ? (
                <TextLink href={`/coaches/${a.slug}`}>Coach profile</TextLink>
              ) : null}
            </div>
          </div>
        </article>
      </Container>
      <Band tone="muted">
        <h2 className="font-display-wide mb-6 text-h2">Keep reading.</h2>
        <ul className="grid gap-8 sm:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <JournalCard p={r} />
            </li>
          ))}
        </ul>
      </Band>
      <TourCTABand
        title={cls ? `Try ${cls.name} free.` : "Try a class free."}
        support="Book a tour or a 3-day pass. Tell the coach it is your first class."
      />
    </>
  )
}
