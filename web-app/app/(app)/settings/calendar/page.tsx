import type { Metadata } from "next"
import { CalendarSettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Calendar" }
export default function Page() {
  return <CalendarSettings />
}
