"use client"
import Link from "next/link"
import { SessionDetail } from "@/components/booking/session-detail"
import { ArrowLeft } from "@/components/icons"

export function SessionPage({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/schedule"
        className="text-link inline-flex min-h-8 w-fit items-center gap-1 text-caption hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Schedule
      </Link>
      <SessionDetail id={id} mode="page" />
    </div>
  )
}
