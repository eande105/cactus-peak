import type { Metadata } from "next"
import Welcome from "@/components/app/welcome"

export const metadata: Metadata = { title: "Welcome" }
export default function Page() {
  return <Welcome />
}
