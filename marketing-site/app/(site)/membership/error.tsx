"use client"

import { RouteError } from "@/components/sections/route-states"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="Plans and prices did not load."
    />
  )
}
