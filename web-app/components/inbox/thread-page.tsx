"use client"
import { useRouter } from "next/navigation"
import { Detail, useInboxItems } from "@/components/inbox/inbox"
import { EmptyState } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"

export default function ThreadPage({ id }: { id: string }) {
  const router = useRouter()
  const items = useInboxItems()
  const item = items.find((i) => (i.kind === "notice" ? i.n.id : i.t.id) === id)
  if (!item)
    return (
      <EmptyState
        title="We couldn't find that message."
        action={
          <Button onClick={() => router.push("/inbox")}>Back to Inbox</Button>
        }
      />
    )
  return (
    <div className="-mx-4 md:mx-0">
      <Detail item={item} onBack={() => router.push("/inbox")} />
    </div>
  )
}
