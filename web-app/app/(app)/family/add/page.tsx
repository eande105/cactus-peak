import type { Metadata } from "next"
import AddMember from "@/components/family/add-member"

export const metadata: Metadata = { title: "Add a member" }
export default function Page() {
  return <AddMember />
}
