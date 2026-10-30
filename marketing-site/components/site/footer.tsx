import Link from "next/link"
import { getCatalog } from "@/lib/catalog/server"
import { MEMBER_SIGN_IN_URL } from "@/lib/links"
import type { Category, Club } from "@/lib/types"
import { FooterDisclosure, FooterNightScope } from "./footer-disclosure"
import { LiveClubStatus, TodayTag } from "./live-status"
import { Logo } from "./logo"

const membership = [
  ["/membership", "Plans & prices"],
  ["/membership#family", "Family plans"],
  ["/trial", "Free 3-day pass"],
  ["/tour", "Book a free tour"],
  ["/membership#day-pass", "Day pass"],
  ["/personal-training", "Personal training"],
  ["/coaches", "Coaches"],
  ["/kids", "Kids & family"],
]
const about = [
  ["/about", "Our story"],
  ["/careers", "Careers"],
  ["/journal", "Journal"],
  ["/faq", "FAQ"],
  ["/contact", "Contact"],
  ["/app", "Get the app"],
  ["/legal/accessibility", "Accessibility"],
  [MEMBER_SIGN_IN_URL, "Member sign in"],
]
const legal = [
  ["/legal/privacy", "Privacy"],
  ["/legal/terms", "Terms"],
  ["/legal/membership-agreement", "Membership agreement"],
  ["/legal/cookies", "Cookies"],
  ["/legal/accessibility", "Accessibility"],
  ["/legal/sms-terms", "SMS terms"],
]

const Instagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
)
const Facebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />
  </svg>
)
const Youtube = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="m10 9 5 3-5 3z" />
  </svg>
)
const L = ({ h, children }: { h: string; children: React.ReactNode }) =>
  h.startsWith("http") ? (
    <a
      href={h}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      {children}
    </a>
  ) : (
    <Link
      href={h}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
const links = (items: string[][]) => (
  <ul>
    {items.map(([h, l]) => (
      <li key={h + l}>
        <L h={h}>{l}</L>
      </li>
    ))}
  </ul>
)
const classLinksFor = (categories: Category[]) => [
  ...categories.map((c) => [`/classes/category/${c.id}`, c.name]),
  ["/schedule", "Schedule"],
]
const clubListFor = (clubs: Club[]) => (
  <ul className="flex flex-col gap-3">
    {clubs.map((c) => (
      <li key={c.slug}>
        <Link
          href={`/clubs/${c.slug}`}
          className="text-label underline-offset-4 hover:underline"
        >
          {c.name}
        </Link>
        <p className="text-caption text-night-muted">{c.cross}</p>
        <p className="text-caption">
          <a
            className="tabular underline underline-offset-4"
            href={`tel:${c.tel}`}
          >
            {c.phone}
          </a>
        </p>
        <p className="text-caption">
          <LiveClubStatus />
        </p>
      </li>
    ))}
  </ul>
)

export async function SiteFooter() {
  const { clubs, categories } = await getCatalog()
  const clubList = clubListFor(clubs)
  const classLinks = classLinksFor(categories)
  return (
    <footer className="bg-night text-night-foreground">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-3">
            <Logo reversed width={220} />
            <p className="font-display-wide mt-4 text-h3">
              Climb at your own pace.
            </p>
            {/* biome-ignore lint/a11y/useSemanticElements: link group, not form controls, so fieldset does not fit */}
            <div
              className="mt-4 flex gap-1"
              role="group"
              aria-label="Social media"
            >
              {[
                [Instagram, "Instagram"],
                [Facebook, "Facebook"],
                [Youtube, "YouTube"],
              ].map(([I, n]) => {
                const Icon = I as typeof Instagram
                return (
                  <a
                    key={n as string}
                    href="https://example.com"
                    aria-label={n as string}
                    className="inline-flex size-11 items-center justify-center rounded-md hover:bg-night-foreground/10"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                )
              })}
            </div>
            <a
              href="https://apps.apple.com/"
              className="mt-3 inline-flex min-h-11 items-center rounded-md bg-night-foreground px-4 text-label text-foreground"
            >
              Download on the App Store
            </a>
          </div>
          <nav
            aria-label="Footer"
            className="hidden gap-6 lg:col-span-9 lg:grid lg:grid-cols-9"
          >
            <div className="col-span-3">
              <h2 className="eyebrow mb-3 text-night-muted">Clubs</h2>
              {clubList}
            </div>
            <div className="col-span-2">
              <h2 className="eyebrow mb-1 text-night-muted">Classes</h2>
              {links(classLinks)}
            </div>
            <div className="col-span-2">
              <h2 className="eyebrow mb-1 text-night-muted">Membership</h2>
              {links(membership)}
            </div>
            <div className="col-span-2">
              <h2 className="eyebrow mb-1 text-night-muted">About</h2>
              {links(about)}
            </div>
          </nav>
          <nav aria-label="Footer, mobile" className="lg:hidden">
            <FooterNightScope>
              {[
                ["clubs", "Clubs and hours", clubList, true],
                ["classes", "Classes", links(classLinks), false],
                ["membership", "Membership", links(membership), false],
                ["about", "About", links(about), false],
              ].map(([v, t, c, open]) => (
                <div
                  key={v as string}
                  className="border-b border-night-foreground/20"
                >
                  <FooterDisclosure
                    title={t as string}
                    defaultOpen={open as boolean}
                  >
                    {c as React.ReactNode}
                  </FooterDisclosure>
                </div>
              ))}
            </FooterNightScope>
          </nav>
        </div>
        <div className="mt-10 border-t border-night-foreground/20 pt-4 lg:hidden">
          <FooterNightScope>
            <FooterDisclosure title="Hours at every club">
              <p className="tabular text-caption">
                Mon–Fri 4:30 a.m.–10:00 p.m. · Sat–Sun 6:00 a.m.–8:00 p.m. ·
                Staffed 6 a.m.–8 p.m. · Pools close 30 minutes before the club.
                All times are Arizona time.
              </p>
            </FooterDisclosure>
          </FooterNightScope>
        </div>
        <div className="mt-10 hidden gap-4 border-t border-night-foreground/20 pt-6 lg:grid lg:grid-cols-12 lg:gap-6">
          <h2 className="eyebrow lg:col-span-3">Hours at every club</h2>
          <div className="lg:col-span-9">
            <dl className="tabular grid gap-x-6 gap-y-2 text-caption sm:grid-cols-2 lg:grid-cols-9">
              <div className="lg:col-span-3">
                <dt className="inline font-semibold">Mon–Fri </dt>
                <dd className="inline">
                  4:30 a.m.–10:00 p.m.
                  <TodayTag
                    weekend={false}
                    className="ml-2 rounded-sm bg-night-foreground/15 px-1.5 text-caption"
                  />
                </dd>
              </div>
              <div className="lg:col-span-2">
                <dt className="inline">Sat–Sun </dt>
                <dd className="inline">
                  6:00 a.m.–8:00 p.m.
                  <TodayTag
                    weekend
                    className="ml-2 rounded-sm bg-night-foreground/15 px-1.5 text-caption"
                  />
                </dd>
              </div>
              <div className="lg:col-span-2">
                <dt className="inline">Staffed </dt>
                <dd className="inline">6 a.m.–8 p.m.</dd>
              </div>
              <div className="lg:col-span-2">
                <dt className="inline">Kids club </dt>
                <dd className="inline">8 a.m.–8 p.m.</dd>
              </div>
            </dl>
            <p className="mt-2 text-caption text-night-muted">
              Staffed 6:00 a.m.–8:00 p.m. Kids club Mon–Sat, 8 a.m.–12 p.m. and
              4–8 p.m. Pools close 30 minutes before the club. All times are
              Arizona time. Thanksgiving Day: 6:00 a.m.–12:00 p.m.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-night-foreground/20 pt-6 text-caption lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Cactus Peak Athletic</p>
          <ul className="flex flex-wrap gap-x-4">
            {legal.map(([h, l]) => (
              <li key={h}>
                <L h={h}>{l}</L>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-caption text-night-muted">
          Fictional brand made for a university project.
        </p>
      </div>
    </footer>
  )
}
