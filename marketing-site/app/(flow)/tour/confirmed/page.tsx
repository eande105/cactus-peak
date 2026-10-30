import type { Metadata } from "next"
import { TourConfirmed } from "@/components/sections/tour-flow"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
export const metadata: Metadata = {
  title: "Tour booked — Cactus Peak Athletic",
  robots: { index: false },
}
export default function Page() {
  return (
    <>
      <MinimalCheckoutHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <TourConfirmed />
      </main>
    </>
  )
}
