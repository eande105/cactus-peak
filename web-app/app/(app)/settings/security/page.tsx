import type { Metadata } from "next"
import { SecuritySettings } from "@/components/settings/pages"

export const metadata: Metadata = { title: "Sign-in and security" }
export default function Page() {
  return <SecuritySettings />
}
