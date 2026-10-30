import type { Metadata } from "next"
import MembershipPage from "@/components/membership/membership-page"

export const metadata: Metadata = { title: "Membership" }
export default function Page() {
  return <MembershipPage />
}
