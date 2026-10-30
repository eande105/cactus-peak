import Link from "next/link"
import { EmptyState } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <EmptyState
      title="You don't have access to this page."
      body="Your role on the plan can't open it."
      action={<Button render={<Link href="/today" />}>Back to Today</Button>}
    />
  )
}
