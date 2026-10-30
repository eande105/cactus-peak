"use client"
import "./globals.css"
import { Button } from "@/components/ui/button"

// Shows when the root layout fails, for example when the club catalog cannot load from the server.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  const digest =
    error instanceof Error && "digest" in error
      ? String((error as Error & { digest?: string }).digest ?? "")
      : ""
  return (
    <html lang="en-US">
      <body>
        <title>We couldn't load Cactus Peak</title>
        <main
          id="main"
          className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-start justify-center gap-4 px-4"
        >
          <h1 className="font-heading text-h1">
            We couldn&apos;t load the club schedule.
          </h1>
          <p className="text-muted-foreground">
            Check your connection, then try again. Your bookings are safe. Need
            help now? Call{" "}
            <a className="text-link num underline" href="tel:4805550142">
              (480) 555-0142
            </a>
            .
          </p>
          {digest ? (
            <p className="num text-detail text-muted-foreground">
              Error id: {digest}
            </p>
          ) : null}
          <Button onClick={() => retry()}>Try again</Button>
        </main>
      </body>
    </html>
  )
}
