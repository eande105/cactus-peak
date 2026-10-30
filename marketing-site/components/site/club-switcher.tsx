"use client"

import { useId, useMemo, useState } from "react"
import { StatusLine } from "@/components/brand/club-parts"
import { BusynessMeter } from "@/components/brand/meters"
import {
  AlertCircle,
  Check,
  ChevronDown,
  LocateFixed,
  MapPin,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Overlay,
  OverlayClose,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
  OverlayTrigger,
} from "@/components/ui/overlay"
import { distancesFrom } from "@/lib/geo"
import { clubStatus } from "@/lib/time"
import type { ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCatalog, useClubNow } from "./catalog-context"
import { lookupZip, useMyClub } from "./club-context"

/** ZIP + location + sorted club list. Shared by the switcher dialog and the /clubs finder header. */
export function useFinder() {
  const { distances, setDistances } = useMyClub()
  const { clubs } = useCatalog()
  const [zip, setZip] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const find = () => {
    const r = lookupZip(zip.trim(), clubs)
    if (!r.ok) {
      setError(r.error)
      setNotice("")
      return false
    }
    setError("")
    setNotice("")
    setDistances(r.d)
    return true
  }
  const locate = () => {
    setError("")
    setNotice("")
    if (!("geolocation" in navigator)) {
      setError("Location is not available here. Enter your ZIP code instead.")
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false)
        setDistances(
          distancesFrom([p.coords.latitude, p.coords.longitude], clubs)
        )
      },
      (e) => {
        setBusy(false)
        setError(
          e.code === 1
            ? "Location is off for this site. Enter your ZIP code instead."
            : "We could not find you in time. Enter your ZIP code instead."
        )
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    )
  }
  return {
    zip,
    setZip,
    error,
    notice,
    busy,
    find,
    locate,
    distances,
    clear: () => setDistances(undefined),
  }
}

export function ZipFinder({
  f,
  className,
  idPrefix,
}: {
  f: ReturnType<typeof useFinder>
  className?: string
  idPrefix: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          f.find()
        }}
        className="flex items-end gap-2"
      >
        <div className="flex-1">
          <label htmlFor={`${idPrefix}${id}`} className="mb-1 block text-label">
            ZIP code
          </label>
          <Input
            id={`${idPrefix}${id}`}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={f.zip}
            onChange={(e) => f.setZip(e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!f.error}
            aria-describedby={`${idPrefix}${id}-e`}
            className="bg-card"
          />
        </div>
        <Button type="submit" variant="secondary">
          Find
        </Button>
      </form>
      <div id={`${idPrefix}${id}-e`} aria-live="polite" className="min-h-5">
        {f.error ? (
          <p className="mt-2 flex items-start gap-1.5 text-caption font-medium text-destructive">
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {f.error}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={f.locate}
        loading={f.busy}
        className="mt-1 -ml-2"
      >
        <LocateFixed aria-hidden="true" />
        Use my location
      </Button>
      <p className="text-caption text-muted-foreground">
        Your browser asks first. We use it once and do not store it.
      </p>
    </div>
  )
}

export function ClubSwitcher({
  placement = "utility",
  className,
}: {
  placement?: "utility" | "mobile-row" | "block"
  className?: string
}) {
  const { club, setClub, clear } = useMyClub()
  const f = useFinder()
  const { clubs } = useCatalog()
  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState<ClubSlug | "">("")
  const list = useMemo(() => {
    const d = f.distances
    return [...clubs].sort((a, b) =>
      d ? (d[a.slug] ?? 99) - (d[b.slug] ?? 99) : 0
    )
  }, [clubs, f.distances])
  const selected = pick || club?.slug || ""
  const s = clubStatus(useClubNow())
  const label = club ? club.name : "Find your club"
  return (
    <Overlay
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setPick("")
      }}
    >
      <OverlayTrigger
        aria-label={
          club
            ? `Your club: ${club.name}. ${s.short}. Change club`
            : "Find your club"
        }
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-caption font-medium hover:bg-secondary-hover",
          placement === "mobile-row" && "w-full bg-muted px-4",
          placement === "block" &&
            "w-full justify-between rounded-lg bg-card px-4 py-3 edge ring-border",
          className
        )}
      >
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{label}</span>
        {club ? (
          <span className="hidden items-center gap-1.5 font-normal text-muted-foreground sm:inline-flex">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-success"
            />
            {s.short}
          </span>
        ) : null}
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </OverlayTrigger>
      <OverlayPopup label="Choose your club" className="md:w-[460px]">
        {/* The title keeps XL space at its end for the corner close (dialog.md). */}
        <OverlayTitle className="pr-8">Choose your club</OverlayTitle>
        <OverlayDescription>
          We use this to show your hours and classes.
        </OverlayDescription>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <ZipFinder f={f} idPrefix="sw" />
          <fieldset className="mt-4">
            <legend className="sr-only">Clubs</legend>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label="Clubs"
            >
              {list.map((c) => {
                const on = selected === c.slug
                return (
                  // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
                  <button
                    key={c.slug}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPick(c.slug)}
                    className={cn(
                      "relative flex min-h-16 w-full flex-col gap-0.5 rounded-lg bg-card px-4 py-3 text-left edge ring-border hover:ring-border-strong",
                      on && "bg-accent ring-2 ring-primary"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2 text-label">
                      {c.name}
                      {f.distances ? (
                        <span className="tabular">
                          {f.distances[c.slug].toFixed(1)} mi
                        </span>
                      ) : null}
                      {on ? (
                        <Check
                          className="size-4 text-link"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {c.cross}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3">
                      <StatusLine />
                      <BusynessMeter level={c.busyness} />
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <OverlayClose
            render={
              <Button
                disabled={!selected}
                onClick={() => {
                  if (selected) setClub(selected as ClubSlug)
                }}
              />
            }
          >
            Use this club
          </OverlayClose>
          <Button
            variant="ghost"
            onClick={() => {
              clear()
              setPick("")
            }}
          >
            Clear my club
          </Button>
        </div>
      </OverlayPopup>
    </Overlay>
  )
}
