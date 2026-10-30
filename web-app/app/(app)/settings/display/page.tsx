import type { Metadata } from "next"
import { DisplaySettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Display and accessibility" }
export default function Page() {
  return <DisplaySettings />
}
