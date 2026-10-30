import type { Metadata } from "next"
import { PrivacySettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Privacy and data" }
export default function Page() {
  return <PrivacySettings />
}
