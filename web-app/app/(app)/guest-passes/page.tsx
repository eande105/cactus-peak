import type { Metadata } from "next"
import GuestPasses from "@/components/guest/guest-passes"

export const metadata: Metadata = { title: "Guest passes" }
export default function Page() {
  return <GuestPasses />
}
