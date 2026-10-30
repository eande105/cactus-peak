"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import {
  buildSessions,
  type ClientCatalog,
  type ClientCatalogData,
  makeLookups,
  type SessionCounts,
} from "@/lib/catalog"
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/env"
import { azNowKey, type ClubNow, clubNowFromKey } from "@/lib/time"

type Ctx = { catalog: ClientCatalog; serverNowKey: number }
const C = createContext<Ctx | null>(null)

/**
 * The root layout (a server component) loads the catalog from Supabase and hands it to the client
 * components here, once per page load. `serverNowKey` is the Arizona clock when the page was rendered.
 */
export function CatalogProvider({
  data,
  serverNowKey,
  children,
}: {
  data: ClientCatalogData
  serverNowKey: number
  children: ReactNode
}) {
  const value = useMemo<Ctx>(
    () => ({ catalog: { ...data, ...makeLookups(data) }, serverNowKey }),
    [data, serverNowKey]
  )
  return <C.Provider value={value}>{children}</C.Provider>
}

function useCtx() {
  const v = useContext(C)
  if (!v) throw new Error("CatalogProvider missing")
  return v
}
export function useCatalog() {
  return useCtx().catalog
}

const REFRESH_MS = 30_000
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, REFRESH_MS)
  return () => window.clearInterval(id)
}
const snapshot = () => azNowKey()

/**
 * The day and minute in Arizona. Pages are static and regenerate hourly, so the server value can be old.
 * React renders the server value first (no hydration mismatch), then the live clock.
 */
export function useClubNow(): ClubNow {
  const { serverNowKey } = useCtx()
  const key = useSyncExternalStore(subscribe, snapshot, () => serverNowKey)
  return clubNowFromKey(key)
}

// One request per day window, shared by every component on the page. It calls the `session_counts` RPC through
// PostgREST with the publishable key, so the browser does not need the Supabase client library.
const countsCache = new Map<number, Promise<SessionCounts>>()
function loadCounts(today: number, days: number): Promise<SessionCounts> {
  const hit = countsCache.get(today)
  if (hit) return hit
  if (!isSupabaseConfigured) return Promise.resolve({})
  const dayMs = 86_400_000
  // Arizona midnight is 07:00 UTC.
  const from = new Date(today * dayMs + 7 * 3_600_000)
  const to = new Date(from.getTime() + days * dayMs)
  const p = fetch(`${supabaseUrl}/rest/v1/rpc/session_counts`, {
    method: "POST",
    headers: {
      apikey: supabasePublishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }),
  })
    .then((r) => (r.ok ? r.json() : []))
    .then(
      (rows: { session_id: string; booked: number; waitlisted: number }[]) => {
        const out: SessionCounts = {}
        for (const r of rows)
          out[r.session_id] = { booked: r.booked, waitlisted: r.waitlisted }
        return out
      }
    )
  p.catch(() => countsCache.delete(today))
  countsCache.set(today, p)
  return p
}

/** Live booked and waitlisted counts for the next `days` days. Undefined until they load. */
function useSessionCounts(today: number, days: number) {
  const [state, setState] = useState<{
    today: number
    counts: SessionCounts
  } | null>(null)
  useEffect(() => {
    let live = true
    loadCounts(today, days)
      .then((counts) => {
        if (live) setState({ today, counts })
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [today, days])
  return state?.today === today ? state.counts : undefined
}

/** Dated sessions for the next 7 days from the weekly timetable, with live spot counts once they load. */
export function useSessions(days = 7) {
  const catalog = useCatalog()
  const now = useClubNow()
  const counts = useSessionCounts(now.dayNum, days)
  const sessions = useMemo(
    () => buildSessions(catalog, now.dayNum, counts, days),
    [catalog, now.dayNum, counts, days]
  )
  return { sessions, now, countsLoaded: counts !== undefined }
}
