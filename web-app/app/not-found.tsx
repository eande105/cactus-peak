import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-start justify-center gap-4 px-4"
    >
      <p className="eyebrow text-muted-foreground">404</p>
      <h1 className="font-heading text-h1 display-stretch">
        We couldn&apos;t find that page.
      </h1>
      <p className="text-muted-foreground">
        Try the schedule, or go back to Today.
      </p>
      <div className="flex gap-2">
        <Button render={<Link href="/today" />}>Back to Today</Button>
        <Button variant="outline" render={<Link href="/schedule" />}>
          Open the schedule
        </Button>
      </div>
    </main>
  )
}
