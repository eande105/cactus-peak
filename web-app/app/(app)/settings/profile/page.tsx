import type { Metadata } from "next"
import { ProfileSettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Profile" }
export default function Page() {
  return <ProfileSettings />
}
