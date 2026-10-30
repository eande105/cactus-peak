import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs, Container } from "@/components/sections/common"
import { CookiePrefs } from "@/components/sections/cookie-prefs"
import { PrintButton } from "@/components/sections/print-button"
import { getCatalog } from "@/lib/catalog/server"

export const dynamicParams = false
export async function generateStaticParams() {
  const { legalPages } = await getCatalog()
  return legalPages.map((p) => ({ slug: p.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = (await getCatalog()).legalPages.find((x) => x.slug === slug)
  return p ? { title: `${p.title} — Cactus Peak Athletic` } : {}
}
const short: Record<string, string[]> = {
  privacy: [
    "We collect what we need to book your tour, pass or membership.",
    "We do not sell your information.",
    "Text messages only if you say yes.",
    "You can ask us to delete your data.",
    "Cookies: analytics is off until you turn it on.",
  ],
  terms: [
    "Use the site for your own club decisions.",
    "Prices and times can change. The app is the source for live data.",
    "Do not copy our photos or logo.",
    "We may update these terms. The date is at the top.",
    "Arizona law applies.",
  ],
  "membership-agreement": [
    "Month to month. No contract.",
    "Cancel or freeze with 30 days' notice.",
    "Enrollment $49 ($0 during Fall climb). $49 annual facility fee in March.",
    "Freeze costs $10 a month for 1 to 3 months.",
    "Late cancels count as strikes. Three strikes in 30 days pause booking for 3 days.",
  ],
}
const sections = [
  "Who we are",
  "What this covers",
  "Your choices",
  "How long we keep things",
  "Changes to this page",
  "Contact us",
]
export default async function Legal({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = (await getCatalog()).legalPages.find((x) => x.slug === slug)
  if (!p) notFound()
  return (
    <>
      <Breadcrumbs
        trail={[{ label: "Legal", href: "/legal/privacy" }, { label: p.title }]}
      />
      <Container className="pt-4 pb-16 print:py-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display-lead">{p.title}</h1>
            <p className="mt-2 text-body text-muted-foreground">
              Last updated Oct 1, 2026 · Version 3
            </p>
          </div>
          <PrintButton />
        </div>
        <p
          role="note"
          className="mt-6 max-w-[680px] rounded-md bg-muted p-3 text-caption"
        >
          Sample text for a fictional brand made for a university project. A
          lawyer must write the real page before launch.
        </p>
        {short[slug] ? (
          <div className="mt-8 max-w-[680px] rounded-lg bg-muted p-5">
            <h2 className="eyebrow mb-2">The short version</h2>
            <ul className="list-disc pl-5 text-caption">
              {short[slug].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <nav
            aria-label="On this page"
            className="hidden lg:col-span-3 lg:block"
          >
            <ol className="sticky top-24 flex flex-col gap-2 text-caption">
              {sections.map((s, i) => (
                <li key={s}>
                  <a className="hover:underline" href={`#l${i + 1}`}>
                    {i + 1}. {s}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-[680px] lg:col-span-7 lg:col-start-5">
            {sections.map((s, i) => (
              <section key={s} id={`l${i + 1}`} className="scroll-mt-24 pb-8">
                <h2 className="font-display-wide mb-2 text-h3">
                  {i + 1}. {s}
                </h2>
                {i === 0 ? (
                  <p className="text-body">
                    It states in plain words what we do, what you can choose,
                    and who to ask.
                  </p>
                ) : (
                  <p className="text-body text-muted-foreground">
                    Sample section.
                  </p>
                )}
                {slug === "membership-agreement" && i === 2 ? (
                  <div className="mt-4 overflow-x-auto rounded-lg bg-card edge ring-border">
                    <table className="w-full text-caption">
                      <caption className="sr-only">Fees</caption>
                      <tbody>
                        {[
                          ["Enrollment", "$49 ($0 with Fall climb)"],
                          ["Annual facility fee", "$49, charged in March"],
                          ["Freeze", "$10 a month for 1 to 3 months"],
                          [
                            "Late cancel",
                            "Strike. Three in 30 days pause booking for 3 days",
                          ],
                        ].map(([a, b]) => (
                          <tr
                            key={a}
                            className="border-t border-border first:border-t-0"
                          >
                            <th
                              scope="row"
                              className="p-3 text-left font-semibold"
                            >
                              {a}
                            </th>
                            <td className="tabular p-3">{b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {slug === "cookies" && i === 2 ? <CookiePrefs /> : null}
              </section>
            ))}
            <p className="text-body text-muted-foreground">
              Questions about this page? Email privacy@cactuspeakathletic.com
              (placeholder).
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}
