"use client"

import { useEffect } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Container } from "./common"

/**
 * The body of an error.tsx file. Next.js 16 passes `retry`, which fetches the segment again
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md).
 */
export function RouteError({
  error,
  retry,
  title = "This page did not load.",
}: {
  error: Error & { digest?: string }
  retry: () => void
  /** Names what failed, for example "The schedule did not load." */
  title?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <Container className="py-16 lg:py-24">
      <h1 className="font-display-wide text-h1 lg:text-display">{title}</h1>
      <p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
        We could not reach our club data. Try again, or call member services at
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
    </Container>
  )
}

/** A still placeholder in the shape of a page head and a ruled list, so the layout does not jump when data lands. */
export function RouteLoading({
  label = "Loading",
  rows = 6,
  className,
}: {
  label?: string
  rows?: number
  className?: string
}) {
  return (
    <Container className={cn("pt-4 pb-16", className)}>
      <p role="status" className="sr-only">
        {label}
      </p>
      <div aria-hidden="true">
        <div className="h-4 w-40 rounded-sm bg-muted" />
        <div className="mt-6 h-12 w-3/4 max-w-[640px] rounded-md bg-muted lg:h-16" />
        <div className="mt-4 h-5 w-2/3 max-w-[520px] rounded-sm bg-muted" />
        <ul className="mt-12 border-t border-border">
          {Array.from({ length: rows }, (_, i) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder rows that never reorder
              key={i}
              className="flex items-center gap-4 border-b border-border py-5"
            >
              <span className="h-5 w-16 rounded-sm bg-muted" />
              <span className="h-5 flex-1 rounded-sm bg-muted" />
              <span className="h-5 w-24 rounded-sm bg-muted" />
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
