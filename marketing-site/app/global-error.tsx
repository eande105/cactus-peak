"use client"

import "./globals.css"

// Shown when the root layout fails, for example when the catalog cannot load from Supabase.
// It replaces the root layout, so it brings its own <html> and <body>.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en-US">
      <body>
        <main className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display-wide text-h1">This page did not load.</h1>
          <p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
            We could not reach our club data. Try again, or call member services
            at (480) 555-0100.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-label text-primary-foreground"
          >
            Try again
          </button>
          {error.digest ? (
            <p className="mt-6 text-caption text-muted-foreground">
              Request ID {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
