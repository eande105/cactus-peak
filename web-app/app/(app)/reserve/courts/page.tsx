import type { Metadata } from "next"
import CourtsPage from "@/components/reserve/courts-page"

export const metadata: Metadata = { title: "Courts" }
export default function Page() {
  return <CourtsPage />
}
