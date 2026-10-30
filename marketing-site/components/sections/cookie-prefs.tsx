"use client"

import { useState } from "react"
import { Switch } from "@/components/graphical"
import { Button } from "@/components/ui/button"

export function CookiePrefs() {
  const [a, setA] = useState(false)
  const [m, setM] = useState(false)
  const [saved, setSaved] = useState(false)
  const row = (
    label: string,
    desc: string,
    on: boolean,
    set?: (v: boolean) => void
  ) => (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <div>
        <p className="text-label">{label}</p>
        <p className="text-body text-muted-foreground">{desc}</p>
      </div>
      {/* Graphical Switch. The label and description sit to its left, so it takes its name from aria-label. */}
      <Switch.Root
        aria-label={label}
        checked={on}
        disabled={!set}
        onCheckedChange={(c) => {
          set?.(c)
          setSaved(false)
        }}
      >
        <Switch.Thumb />
      </Switch.Root>
    </div>
  )
  return (
    <div className="mt-6 rounded-lg bg-card p-5 edge ring-border">
      {row("Necessary", "Keeps the site working. Always on.", true)}
      {row(
        "Analytics",
        "Counts visits so we can fix what is confusing. Off by default.",
        a,
        setA
      )}
      {row("Marketing", "Not used at launch.", m, setM)}
      <Button className="mt-4" onClick={() => setSaved(true)}>
        Save choices
      </Button>
      <p role="status" className="mt-2 text-caption">
        {saved ? "Choices saved." : ""}
      </p>
    </div>
  )
}
