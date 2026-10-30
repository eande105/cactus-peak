"use client"
import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import { NumberField } from "@/components/graphical"
import { Lock, Minus, Plus } from "@/components/icons"
import { Modal } from "@/components/kit/overlays"
import { Button } from "@/components/ui/button"
import { fmtCountdown, MIN } from "@/lib/time"
import { cn } from "@/lib/utils"

export function SlotHoldTimer({
  holdUntil,
  now,
  onExpire,
  onExtend,
  canExtend,
  what,
}: {
  holdUntil: number
  now: number
  onExpire: () => void
  onExtend: () => void
  canExtend: boolean
  what: string
}) {
  const left = holdUntil - now
  const fired = useRef(false)
  const [dismissed, setDismissed] = useState(0)
  const warn =
    left > 0 && left <= 60_000 && canExtend && dismissed !== holdUntil
  // biome-ignore lint/correctness/useExhaustiveDependencies: holdUntil re-arms the expiry flag when a new hold starts
  useEffect(() => {
    fired.current = false
  }, [holdUntil])
  // biome-ignore lint/correctness/useExhaustiveDependencies: fire the expiry once per hold, onExpire changes identity on every render
  useEffect(() => {
    if (left <= 0 && !fired.current) {
      fired.current = true
      onExpire()
    }
  }, [left])
  const pct = Math.max(0, Math.min(100, (left / (5 * MIN)) * 100))
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-center justify-between text-caption">
        <span>Holding {what}</span>
        <span
          className="num font-semibold"
          role="timer"
          aria-label={`Hold time left ${fmtCountdown(left)}`}
        >
          {fmtCountdown(left)}
        </span>
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-night dark:bg-on-night"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Modal
        open={warn}
        onOpenChange={(o) => !o && setDismissed(holdUntil)}
        title="1 minute left"
        description={`We're holding ${what} for you.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDismissed(holdUntil)}>
            Let it go
          </Button>
          <Button
            onClick={() => {
              onExtend()
            }}
          >
            Add 5 minutes
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  help,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  help?: string
}) {
  const id = useId()
  return (
    <NumberField.Root
      id={id}
      value={value}
      min={min}
      max={max}
      step={1}
      onValueChange={(v) => {
        // The field reports null while the input is empty. Keep the last whole count in range.
        if (v === null) return
        const n = Math.min(max, Math.max(min, Math.round(v)))
        if (n !== value) onChange(n)
      }}
    >
      <NumberField.Label htmlFor={id}>{label}</NumberField.Label>
      <NumberField.Group>
        <NumberField.Decrement
          aria-label={`Fewer: ${label}`}
          className="max-md:size-11"
        >
          <Minus aria-hidden="true" />
        </NumberField.Decrement>
        <NumberField.Input
          aria-describedby={help ? `${id}-h` : undefined}
          className="max-md:min-h-11"
        />
        <NumberField.Increment
          aria-label={`More: ${label}`}
          className="max-md:size-11"
        >
          <Plus aria-hidden="true" />
        </NumberField.Increment>
      </NumberField.Group>
      {/* The stepper buttons keep focus, so the new count is read out here. */}
      <span className="sr-only" aria-live="polite">
        {value}
      </span>
      {help ? (
        <p id={`${id}-h`} className="text-caption text-muted-foreground">
          {help}
        </p>
      ) : null}
    </NumberField.Root>
  )
}

export function LockedCard({
  title,
  body,
  cta = "Compare plans",
  href = "/membership/change-plan",
}: {
  title: string
  body: string
  cta?: string
  href?: string
}) {
  return (
    <div className="flex max-w-[560px] flex-col items-start gap-3 py-6">
      <Lock className="size-7 text-muted-foreground" aria-hidden="true" />
      <h2 className="font-heading text-h3 display-stretch">{title}</h2>
      <p className="text-muted-foreground">{body}</p>
      <Button render={<Link href={href} />}>{cta}</Button>
    </div>
  )
}

export function StickyBar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:left-[var(--sb,264px)]",
        className
      )}
    >
      {children}
    </div>
  )
}
