import type { Metadata } from "next"
import FreezePage from "@/components/membership/freeze"

export const metadata: Metadata = { title: "Freeze membership" }
export default function Page() {
  return <FreezePage />
}
