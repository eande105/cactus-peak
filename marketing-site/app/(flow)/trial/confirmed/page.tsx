import type { Metadata } from "next"
import { TrialConfirmed } from "@/components/sections/trial-flow"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
export const metadata: Metadata = {
  title: "Your pass — Cactus Peak Athletic",
  robots: { index: false },
}
export default function Page() {
  return (
    <>
      <MinimalCheckoutHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <TrialConfirmed />
      </main>
    </>
  )
}
