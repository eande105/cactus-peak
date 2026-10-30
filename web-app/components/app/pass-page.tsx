"use client"
import { useEffect, useState } from "react"
import { CheckInPass } from "@/components/app/check-in-pass"
import { useApp } from "@/components/app/use-app"
import { Apple, SunMedium } from "@/components/icons"
import { LoadingBlock, PageHeader, SelectBox } from "@/components/kit/ui"
import { Button } from "@/components/ui/button"
import { householdMembers } from "@/lib/engine"

export default function PassPage() {
  const { s, me, hh, now } = useApp()
  const [who, setWho] = useState(me.id)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    // Keep the screen on while the pass is showing. Unsupported browsers skip this silently.
    let lock: { release: () => Promise<void> } | null = null
    ;(
      navigator as unknown as {
        wakeLock?: { request: (t: string) => Promise<typeof lock> }
      }
    ).wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l
      })
      .catch(() => {})
    return () => {
      void lock?.release()
    }
  }, [])
  const people =
    me.role === "teen"
      ? [me]
      : householdMembers(s, hh.id).filter((m) => m.status !== "invite_expired")
  const m = s.members[people.some((p) => p.id === who) ? who : me.id]
  const apple =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
  if (loading) return <LoadingBlock text="Getting your pass…" rows={3} />
  return (
    <div className="mx-auto flex max-w-[420px] flex-col gap-5">
      <PageHeader
        title="Check-in pass"
        description="Show this at the front desk."
      />
      {people.length > 1 ? (
        <SelectBox
          label="Showing"
          value={m.id}
          onChange={setWho}
          options={people.map((p) => ({
            value: p.id,
            label:
              p.id === me.id
                ? `${p.firstName} ${p.lastName} (you)`
                : `${p.firstName} ${p.lastName}`,
          }))}
        />
      ) : null}
      <CheckInPass s={s} member={m} now={now} />
      <Button variant="outline" disabled aria-disabled="true">
        <Apple aria-hidden="true" data-icon="inline-start" />
        {apple ? "Add to Apple Wallet" : "Add to Google Wallet"} · Coming soon
      </Button>
      <p className="flex items-center gap-2 text-caption text-muted-foreground">
        <SunMedium className="size-4" aria-hidden="true" />
        Turn your screen brightness up.
      </p>
    </div>
  )
}
