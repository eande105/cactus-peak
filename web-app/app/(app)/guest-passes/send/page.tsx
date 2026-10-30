import type { Metadata } from "next"
import GuestPasses from "@/components/guest/guest-passes"

export const metadata: Metadata = { title: "Send a guest pass" }
export default function Page() {
  return <GuestPasses openSend />
}
