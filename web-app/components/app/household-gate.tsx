"use client"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"
import { TriangleAlert } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { loadStore, retryLoad, useStore, useStoreStatus } from "@/lib/store"

// Loads the signed-in household from Supabase before member pages render.
// Shows a skeleton in the shape of the page while it loads, and a real error with a retry if it fails.
export function HouseholdGate({
  children,
  skeleton,
}: {
  children: ReactNode
  skeleton: ReactNode
}) {
  const s = useStore()
  const status = useStoreStatus()
  const router = useRouter()
  const path = usePathname()
  useEffect(() => {
    void loadStore()
  }, [])
  useEffect(() => {
    if (status.kind === "signed-out")
      router.replace(`/sign-in?next=${encodeURIComponent(path)}`)
  }, [status.kind, router, path])

  if (status.kind === "error" && !s)
    return <LoadError message={status.message} />
  if (!s) return skeleton
  return children
}

function LoadError({ message }: { message: string }) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-start justify-center gap-3 px-4"
    >
      <div role="alert" className="flex flex-col items-start gap-3">
        <TriangleAlert className="size-6 text-warning" aria-hidden="true" />
        <h1 className="font-heading text-h2">
          We couldn&apos;t load your account.
        </h1>
        <p className="text-muted-foreground">
          {offline
            ? "You're offline. Connect, then try again."
            : "Your bookings are safe. Try again in a moment."}
        </p>
        <Button onClick={() => void retryLoad()}>Try again</Button>
        <p className="text-detail text-muted-foreground">Error: {message}</p>
      </div>
    </main>
  )
}

// Same grid as the signed-in shell: sidebar, top bar, then the page column.
export function ShellSkeleton() {
  return (
    <div
      className="grid min-h-dvh lg:grid-cols-[264px_minmax(0,1fr)]"
      aria-busy="true"
    >
      <aside className="hidden h-dvh flex-col gap-2 border-r border-border bg-card p-4 lg:flex">
        <Skeleton className="mb-6 h-9 w-40" />
        {Array.from({ length: 9 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:h-16 lg:px-6">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="ml-auto size-9 rounded-full" />
        </div>
        <main
          id="main"
          className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 pt-6 md:px-6 md:pt-8 lg:px-8"
        >
          <p role="status" className="sr-only">
            Loading your day…
          </p>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <div className="grid gap-6 md:grid-cols-[5fr_7fr]">
            <Skeleton className="h-48" />
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 5 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// The onboarding flow is a single narrow column.
export function FlowSkeleton() {
  return (
    <main
      id="main"
      aria-busy="true"
      className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-4 px-4 pt-8"
    >
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-40 w-full" />
    </main>
  )
}
