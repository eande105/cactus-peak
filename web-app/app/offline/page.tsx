import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Offline() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-start justify-center gap-4 px-4"
    >
      <h1 className="font-heading text-h1 display-stretch">
        You&apos;re offline.
      </h1>
      <p className="text-muted-foreground">
        These still work: your pass and your bookings. We will update everything
        when you reconnect.
      </p>
      <ul className="flex gap-2">
        <li>
          <Button variant="outline" render={<Link href="/pass" />}>
            Pass
          </Button>
        </li>
        <li>
          <Button variant="outline" render={<Link href="/bookings" />}>
            Bookings
          </Button>
        </li>
      </ul>
      <Button render={<Link href="/today" />}>Try again</Button>
    </main>
  )
}
