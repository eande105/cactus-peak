import type { Metadata } from "next"
import KidsClubPage from "@/components/reserve/kids-page"

export const metadata: Metadata = { title: "Kids club" }
export default function Page() {
  return <KidsClubPage />
}
