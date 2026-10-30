"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import { distancesFrom } from "@/lib/geo"
import type { Club, ClubSlug } from "@/lib/types"
import { useCatalog } from "./catalog-context"

// "My club" lives in the first-party cookie cpa_club (12 months). Distances live in sessionStorage only (spec 02 section 5.2).
const EVT = "cpa-club-change"
const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener(EVT, cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener(EVT, cb)
  }
}
function readCookie(): string {
  try {
    return (
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("cpa_club="))
        ?.split("=")[1] ?? ""
    )
  } catch {
    return ""
  }
}
function readDist(): string {
  try {
    return sessionStorage.getItem("cpa_dist") ?? ""
  } catch {
    return ""
  }
}
const emit = () => window.dispatchEvent(new Event(EVT))

type Ctx = {
  club: Club | undefined
  distances: Record<string, number> | undefined
  setClub: (s: ClubSlug) => void
  clear: () => void
  setDistances: (d: Record<string, number> | undefined) => void
}
const C = createContext<Ctx | null>(null)

export function ClubProvider({ children }: { children: ReactNode }) {
  const { clubs } = useCatalog()
  const slug = useSyncExternalStore(subscribe, readCookie, () => "")
  const dist = useSyncExternalStore(subscribe, readDist, () => "")
  const setClub = useCallback((s: ClubSlug) => {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is missing in Safari and Firefox
    document.cookie = `cpa_club=${s}; max-age=31536000; path=/; samesite=lax`
    emit()
  }, [])
  const clear = useCallback(() => {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is missing in Safari and Firefox
    document.cookie = "cpa_club=; max-age=0; path=/; samesite=lax"
    emit()
  }, [])
  const setDistances = useCallback((d: Record<string, number> | undefined) => {
    try {
      if (d) sessionStorage.setItem("cpa_dist", JSON.stringify(d))
      else sessionStorage.removeItem("cpa_dist")
    } catch {}
    emit()
  }, [])
  const value = useMemo<Ctx>(
    () => ({
      club: clubs.find((c) => c.slug === slug),
      distances: dist
        ? (JSON.parse(dist) as Record<string, number>)
        : undefined,
      setClub,
      clear,
      setDistances,
    }),
    [clubs, slug, dist, setClub, clear, setDistances]
  )
  return <C.Provider value={value}>{children}</C.Provider>
}
export function useMyClub() {
  const v = useContext(C)
  if (!v) throw new Error("ClubProvider missing")
  return v
}

/** Approximate ZIP centroids for the East Valley. Distances come from lib/geo.ts miles(). A live build would call a geocoder. */
const ZIP_CENTER: Record<string, [number, number]> = {
  "85201": [33.4352, -111.8369],
  "85202": [33.385, -111.87],
  "85203": [33.46, -111.823],
  "85204": [33.398, -111.785],
  "85205": [33.436, -111.757],
  "85206": [33.399, -111.716],
  "85207": [33.45, -111.69],
  "85208": [33.401, -111.634],
  "85209": [33.38, -111.658],
  "85210": [33.379, -111.835],
  "85212": [33.35, -111.613],
  "85213": [33.438, -111.779],
  "85215": [33.473, -111.709],
  "85224": [33.317, -111.87],
  "85225": [33.311, -111.825],
  "85226": [33.29, -111.95],
  "85233": [33.345, -111.77],
  "85234": [33.357, -111.795],
  "85286": [33.28, -111.83],
  "85295": [33.306, -111.734],
  "85296": [33.355, -111.727],
  "85297": [33.28, -111.74],
}
export function lookupZip(
  zip: string,
  clubs: Pick<Club, "slug" | "lat" | "lng">[]
): { ok: true; d: Record<ClubSlug, number> } | { ok: false; error: string } {
  if (!/^\d{5}$/.test(zip))
    return { ok: false, error: "Enter a 5-digit ZIP code." }
  const c = ZIP_CENTER[zip]
  if (c) return { ok: true, d: distancesFrom(c, clubs) }
  return {
    ok: false,
    error: "We do not have that ZIP yet. Try the map or call (480) 555-0100.",
  }
}
