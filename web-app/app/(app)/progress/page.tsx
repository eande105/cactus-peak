import type { Metadata } from "next"
import ProgressPage from "@/components/progress/progress-page"

export const metadata: Metadata = { title: "Progress" }
export default function Page() {
  return <ProgressPage />
}
