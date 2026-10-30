import type { Metadata } from "next"
import { Suspense } from "react"
import { TourFlow } from "@/components/sections/tour-flow"
export const metadata: Metadata = {
  title: "Book a free tour — Cactus Peak Athletic",
  description: "A free 30-minute tour at any of our five clubs. No card.",
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <TourFlow />
    </Suspense>
  )
}
