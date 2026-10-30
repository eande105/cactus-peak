"use client"

import { LinkButton } from "@/components/brand/atoms"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8"
    >
      <h1 className="font-display-wide text-h1 lg:text-display">
        Something broke on our side.
      </h1>
      <p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
        We are fixing it. Try again in a minute, or call member services at
        (480) 555-0100.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()} size="lg">
          Try again
        </Button>
        <LinkButton href="/" variant="outline" size="lg">
          Go home
        </LinkButton>
      </div>
      {error.digest ? (
        <p className="mt-6 text-caption text-muted-foreground">
          Request ID {error.digest}
        </p>
      ) : null}
    </main>
  )
}
