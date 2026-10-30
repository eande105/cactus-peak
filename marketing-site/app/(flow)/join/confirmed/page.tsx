import type { Metadata } from "next"
import { JoinConfirmed } from "@/components/sections/join-flow"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
export const metadata: Metadata = {
  title: "Welcome — Cactus Peak Athletic",
  robots: { index: false },
}
export default function Page() {
  return (
    <>
      <MinimalCheckoutHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <JoinConfirmed />
      </main>
    </>
  )
}
