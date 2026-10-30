import type { Metadata } from "next"
import { Suspense } from "react"
import { TrialFlow } from "@/components/sections/trial-flow"
export const metadata: Metadata = {
  title: "Free 3-day pass — Cactus Peak Athletic",
  description:
    "Try one club for 3 days. No card. One pass per person every 12 months.",
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrialFlow />
    </Suspense>
  )
}
