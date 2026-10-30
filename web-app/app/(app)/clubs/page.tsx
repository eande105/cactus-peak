import type { Metadata } from "next"
import ClubsPage from "@/components/clubs/clubs-page"

export const metadata: Metadata = { title: "Clubs" }
export default function Page() {
  return <ClubsPage />
}
