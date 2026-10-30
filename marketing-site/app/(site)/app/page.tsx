import type { Metadata } from "next"
import { GymObject } from "@/components/brand/graphics"
import { AppPhone } from "@/components/sections/app-phone"
import { Band, Breadcrumbs, Container } from "@/components/sections/common"
import { MEMBER_APP_URL } from "@/lib/links"

export const metadata: Metadata = {
  title: "Get the Cactus Peak app",
  description:
    "Book classes, see how busy the club is, and scan in with one tap. iPhone app.",
}
export default function AppPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: "Get the app" }]} />
      <Container className="grid items-center gap-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="display-hero">Your club, in your pocket.</h1>
          <p className="lede mt-4">
            Book classes, see how busy the club is, and scan in with one tap.
          </p>
          <a
            href="https://apps.apple.com/"
            className="mt-6 inline-flex min-h-12 items-center rounded-md bg-night px-6 text-label text-night-foreground"
          >
            Download on the App Store
          </a>
          <div className="mt-6 hidden items-center gap-4 lg:flex">
            <span
              aria-hidden="true"
              className="grid size-24 place-items-center rounded-md border-2 border-foreground text-center text-caption font-semibold"
            >
              QR to App Store
            </span>
            <p className="max-w-[20ch] text-body text-muted-foreground">
              Scan with your phone camera to open the App Store.
            </p>
          </div>
          <p className="mt-2 text-body text-muted-foreground">
            The app is for iPhone. On Android, use the{" "}
            <a
              className="text-link underline underline-offset-4"
              href={MEMBER_APP_URL}
            >
              member site
            </a>
            .
          </p>
        </div>
        <div className="lg:col-span-5">
          <AppPhone />
        </div>
      </Container>
      <Band tone="muted" className="py-10 lg:py-14">
        <h2 className="sr-only">What the app does</h2>
        <ol className="grid gap-6 border-t-2 border-foreground pt-6 lg:grid-cols-3">
          {(
            [
              ["Book classes and join waitlists.", "schedule"],
              ["See how busy your club is, right now.", "heart-watch"],
              ["Check in with your pass.", "key"],
            ] as const
          ).map(([t, icon], i) => (
            <li key={t}>
              <span className="flex items-end justify-between gap-4">
                <span className="tabular font-data text-h1 font-bold">
                  {i + 1}
                </span>
                <GymObject id={icon} className="size-12" />
              </span>
              <p className="font-display-wide text-h3">{t}</p>
            </li>
          ))}
        </ol>
      </Band>
    </>
  )
}
