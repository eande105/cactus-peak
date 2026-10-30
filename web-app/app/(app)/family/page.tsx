import type { Metadata } from "next"
import FamilyPage from "@/components/family/family-page"

export const metadata: Metadata = { title: "Family" }
export default function Page() {
  return <FamilyPage />
}
