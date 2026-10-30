import type { Metadata } from "next"
import ChangePlan from "@/components/membership/change-plan"

export const metadata: Metadata = { title: "Change plan" }
export default function Page() {
  return <ChangePlan />
}
