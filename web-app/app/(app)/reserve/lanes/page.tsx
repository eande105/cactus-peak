import type { Metadata } from "next"
import LanesPage from "@/components/reserve/lanes-page"

export const metadata: Metadata = { title: "Lap lanes" }
export default function Page() {
  return <LanesPage />
}
