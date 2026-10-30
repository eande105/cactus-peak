import type { Metadata } from "next"
import { PreferencesSettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Home club and interests" }
export default function Page() {
  return <PreferencesSettings />
}
