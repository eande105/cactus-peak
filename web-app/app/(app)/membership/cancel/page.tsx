import type { Metadata } from "next"
import CancelPage from "@/components/membership/cancel"

export const metadata: Metadata = { title: "Cancel membership" }
export default function Page() {
  return <CancelPage />
}
