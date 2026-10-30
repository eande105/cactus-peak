"use client"
import type { ReactNode } from "react"
import { FlowSkeleton, HouseholdGate } from "@/components/app/household-gate"

export function FlowShell({ children }: { children: ReactNode }) {
  return (
    <HouseholdGate skeleton={<FlowSkeleton />}>
      <main
        id="main"
        className="mx-auto min-h-dvh w-full max-w-[640px] px-4 pt-8 pb-32"
      >
        {children}
        <div
          id="live-status"
          role="status"
          aria-live="polite"
          className="sr-only"
        />
      </main>
    </HouseholdGate>
  )
}
