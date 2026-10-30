import type { Metadata } from "next"
import ReserveHub from "@/components/reserve/hub-page"

export const metadata: Metadata = { title: "Reserve" }
export default function Page() {
  return <ReserveHub />
}
