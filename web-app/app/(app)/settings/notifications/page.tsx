import type { Metadata } from "next"
import { NotificationSettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Notifications" }
export default function Page() {
  return <NotificationSettings />
}
