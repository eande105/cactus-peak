"use client"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-start justify-center gap-4 px-4"
    >
      <h1 className="font-heading text-h1 display-stretch">
        Something went wrong on our side.
      </h1>
      <p className="text-muted-foreground">
        Your bookings are safe. Try again, or call{" "}
        <a className="text-link num underline" href="tel:4805550142">
          (480) 555-0142
        </a>
        .
      </p>
      <p className="num text-detail text-muted-foreground">
        Error id: {error.digest ?? "client"}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<a href="/help" />}>
          Message the front desk
        </Button>
      </div>
    </main>
  )
}
