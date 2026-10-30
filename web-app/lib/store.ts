"use client"
// The signed-in household lives in memory so the rules engine can stay synchronous.
// Supabase is the source of truth:
//   - loadStore() reads the household's rows (row level security limits them to this household).
//   - mutate() changes the memory copy, then flush() diffs it against the last saved rows and writes
//     only the changed rows. If a write fails, the store reloads from Supabase and tells the member.
//   - A realtime channel on bookings and notices reloads the store when another tab or device changes them.
// Only the demo clock and a sidebar flag stay in localStorage.
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useSyncExternalStore } from "react"
import { advance, needsAdvance } from "@/lib/advance"
import {
  type DbRows,
  diffRows,
  HOUSEHOLD_TABLES,
  type HouseholdTable,
  isEmptyDiff,
  rowKey,
  rowsFromState,
  stateFromRows,
  type WriteRows,
} from "@/lib/data/rows"
import type { AppState } from "@/lib/data/state"
import { nowOf } from "@/lib/engine"
import { createClient } from "@/lib/supabase/client"
import { DAY, dayStart } from "@/lib/time"
import { toast } from "@/lib/toast"

export type StoreStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "signed-out" }
  | { kind: "error"; message: string }

let state: AppState | null = null
let status: StoreStatus = { kind: "idle" }
// The rows Supabase has, as far as this tab knows. Diffs are taken against this.
let saved: WriteRows | null = null
let householdId = ""
let authMemberId = ""
let version = 0
let flushing = false
let flushQueued = false
let reloadAfterFlush = false
let scheduleAgain = false
let channel: RealtimeChannel | null = null
let timers: ReturnType<typeof setInterval>[] = []
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}
function setStatus(s: StoreStatus) {
  status = s
  emit()
}

// ---------- demo clock (shared by every device of the household)

// demo_clock() restarts a clock that is missing or older than 3 hours. server_now corrects this device's clock offset.
async function fetchClock(): Promise<AppState["clock"]> {
  const { data, error } = await createClient().rpc("demo_clock")
  if (error) throw new Error(error.message)
  const row = data?.[0]
  if (!row) throw new Error("The demo clock is missing.")
  const offset = Date.now() - Date.parse(row.server_now)
  return {
    realStart: Date.parse(row.started_at) + offset,
    skew: Number(row.skew_ms) || 0,
  }
}
async function saveSkew(skew: number) {
  const { data, error } = await createClient()
    .from("households")
    .update({ demo_clock_skew_ms: skew })
    .eq("id", householdId)
    .select("id")
  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error("The demo clock was not saved.")
}

// ---------- reads

async function fetchRows(hh: string): Promise<DbRows> {
  const db = createClient()
  const child = (t: Exclude<HouseholdTable, "households">) =>
    db.from(t).select("*").eq("household_id", hh)
  const [households, ...rest] = await Promise.all([
    db.from("households").select("*").eq("id", hh),
    child("members"),
    child("invoices"),
    child("bookings"),
    child("strikes"),
    child("notices"),
    child("message_threads"),
    child("teen_requests"),
    child("guest_passes"),
    child("visits"),
  ])
  const all = [households, ...rest]
  const failed = all.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
  const out = {} as Record<HouseholdTable, unknown[]>
  HOUSEHOLD_TABLES.forEach((t, i) => {
    out[t] = all[i].data ?? []
  })
  return out as DbRows
}

// Spots that other households hold. session_counts() counts every household, so this household's own
// saved bookings are taken off; the engine counts those from memory.
async function fetchOthers(
  s: AppState,
  rows: WriteRows
): Promise<AppState["others"]> {
  const now = nowOf(s)
  const { data, error } = await createClient().rpc("session_counts", {
    p_from: new Date(dayStart(now) - 2 * DAY).toISOString(),
    p_to: new Date(dayStart(now) + 14 * DAY).toISOString(),
  })
  if (error) throw new Error(error.message)
  const own: Record<string, { booked: number; waitlisted: number }> = {}
  for (const b of Object.values(rows.bookings)) {
    if (b.kind !== "class" || !b.session_id) continue
    if (!own[b.session_id]) own[b.session_id] = { booked: 0, waitlisted: 0 }
    const o = own[b.session_id]
    if (["booked", "held", "attended"].includes(b.status)) o.booked++
    if (b.status === "waitlisted") o.waitlisted++
  }
  const out: NonNullable<AppState["others"]> = {}
  for (const r of data ?? []) {
    const o = own[r.session_id]
    const booked = Math.max(0, r.booked - (o?.booked ?? 0))
    const waitlisted = Math.max(0, r.waitlisted - (o?.waitlisted ?? 0))
    if (booked || waitlisted) out[r.session_id] = { booked, waitlisted }
  }
  return out
}

// Loads the signed-in member's household. Safe to call more than once.
export function loadStore(): Promise<void> {
  if (status.kind === "ready" && state) return Promise.resolve()
  loading ??= (async () => {
    setStatus({ kind: "loading" })
    try {
      const db = createClient()
      const { data: auth, error: authError } = await db.auth.getUser()
      if (authError || !auth.user) {
        // A 4xx means no valid session. Anything else is a network problem.
        if (!authError || (authError.status ?? 500) < 500) {
          setStatus({ kind: "signed-out" })
          return
        }
        throw new Error(authError.message)
      }
      const { data: member, error } = await db
        .from("members")
        .select("id, household_id")
        .eq("auth_user_id", auth.user.id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!member) throw new Error("This login is not linked to a membership.")
      householdId = member.household_id
      authMemberId = member.id
      await replaceFromServer({})
      subscribeRealtime()
      startTimers()
      setStatus({ kind: "ready" })
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      })
    } finally {
      loading = null
    }
  })()
  return loading
}

// force: take the server copy even if a local change landed during the read.
async function replaceFromServer(opts: { force?: boolean }) {
  const startVersion = version
  const [db, clock] = await Promise.all([fetchRows(householdId), fetchClock()])
  const keepMember =
    state && db.members.some((m) => m.id === state?.currentMemberId)
      ? state.currentMemberId
      : authMemberId
  const next: AppState = {
    ...stateFromRows(db, keepMember),
    clock,
  }
  const rows = rowsFromState(next)
  next.others = await fetchOthers(next, rows).catch(() => state?.others ?? {})
  // A local change landed while we read. Keep it; the next flush saves it.
  if (version !== startVersion && !opts.force) return false
  state = next
  saved = rows
  version++
  emit()
  return true
}

// ---------- writes

function scheduleFlush() {
  if (flushQueued) return
  flushQueued = true
  queueMicrotask(() => {
    flushQueued = false
    void flush()
  })
}

async function writeTable<K extends HouseholdTable>(
  t: K,
  diff: ReturnType<typeof diffRows>[K]
) {
  if (!saved) return
  const db = createClient()
  const savedRows = saved[t] as Record<string, unknown>
  if (diff.upserts.length) {
    if (t === "households") {
      // Members cannot create households, only update their own.
      for (const row of diff.upserts as WriteRows["households"][string][]) {
        const { data, error } = await db
          .from("households")
          .update(row)
          .eq("id", row.id)
          .select("id")
        if (error) throw new Error(error.message)
        if (!data?.length) throw new Error("The household was not updated.")
        savedRows[row.id] = row
      }
    } else {
      const onConflict =
        t === "visits"
          ? "member_id,at"
          : t === "invoices"
            ? "household_id,id"
            : "id"
      const { data, error } = await db
        // biome-ignore lint/suspicious/noExplicitAny: one code path for every household table
        .from(t as any)
        .upsert(diff.upserts as never[], { onConflict })
        .select(t === "visits" ? "member_id, at" : "id")
      if (error) throw new Error(error.message)
      if ((data?.length ?? 0) !== diff.upserts.length)
        throw new Error(`Some ${t} rows were not saved.`)
      for (const row of diff.upserts)
        savedRows[rowKey(t, row as Record<string, unknown>)] = row
    }
  }
}

async function deleteRows(t: HouseholdTable, keys: string[]) {
  if (!saved || !keys.length) return
  const db = createClient()
  const savedRows = saved[t] as Record<string, unknown>
  if (t === "visits") {
    for (const k of keys) {
      const [memberId, at] = k.split("|")
      const { error } = await db
        .from("visits")
        .delete()
        .eq("member_id", memberId)
        .eq("at", at)
      if (error) throw new Error(error.message)
      delete savedRows[k]
    }
    return
  }
  if (t === "households") throw new Error("A household cannot be removed here.")
  const { error } = await db
    // biome-ignore lint/suspicious/noExplicitAny: one code path for every household table
    .from(t as any)
    .delete()
    .eq("household_id", householdId)
    .in("id", keys)
  if (error) throw new Error(error.message)
  for (const k of keys) delete savedRows[k]
}

async function flush() {
  if (flushing) {
    scheduleAgain = true
    return
  }
  if (!state || !saved) return
  flushing = true
  try {
    for (;;) {
      scheduleAgain = false
      const diff = diffRows(saved, rowsFromState(state))
      if (isEmptyDiff(diff)) break
      for (const t of HOUSEHOLD_TABLES) await writeTable(t, diff[t])
      for (const t of [...HOUSEHOLD_TABLES].reverse())
        await deleteRows(t, diff[t].deletes)
      if (!scheduleAgain) break
    }
  } catch (e) {
    flushing = false
    await onWriteFailed(e)
    return
  }
  flushing = false
  if (reloadAfterFlush) {
    reloadAfterFlush = false
    void syncFromServer()
  }
}
async function onWriteFailed(e: unknown) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine
  console.error("Save failed", e)
  toast({
    type: "error",
    title: "We couldn't save your last change",
    description: offline
      ? "You're offline. We put your account back to its last saved state. Connect and try again."
      : "We put your account back to its last saved state. Try the change again.",
  })
  try {
    // Take the server copy over local changes: those are the ones that failed.
    await replaceFromServer({ force: true })
  } catch (err) {
    setStatus({
      kind: "error",
      message: err instanceof Error ? err.message : String(err),
    })
  }
}

// Reloads from Supabase when another tab or device changed the household. Skips while this tab is saving.
let syncTimer: ReturnType<typeof setTimeout> | null = null
function syncFromServer() {
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    syncTimer = null
    if (!state || !saved) return
    if (flushing || !isEmptyDiff(diffRows(saved, rowsFromState(state)))) {
      reloadAfterFlush = true
      return
    }
    try {
      const [db, clock] = await Promise.all([
        fetchRows(householdId),
        fetchClock(),
      ])
      if (!state) return
      // Another device jumped or restarted the demo clock. Small offset noise is ignored.
      if (
        clock.skew !== state.clock.skew ||
        Math.abs(clock.realStart - state.clock.realStart) > 5000
      ) {
        state = { ...state, clock }
        version++
        emit()
      }
      const fresh = rowsFromState({
        ...stateFromRows(db, state.currentMemberId),
        clock: state.clock,
      })
      if (isEmptyDiff(diffRows(saved, fresh))) return
      await replaceFromServer({})
    } catch {
      // The next realtime event or the counts timer tries again.
    }
  }, 600)
}

function subscribeRealtime() {
  if (channel) return
  const db = createClient()
  channel = db.channel(`household:${householdId}`)
  for (const table of ["bookings", "notices", "households"] as const)
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter:
          table === "households"
            ? `id=eq.${householdId}`
            : `household_id=eq.${householdId}`,
      },
      () => syncFromServer()
    )
  channel.subscribe()
}

let tick = 0
const tickListeners = new Set<() => void>()
function startTimers() {
  if (timers.length) return
  timers = [
    setInterval(() => {
      if (state && needsAdvance(state, nowOf(state)))
        mutate((d, now) => advance(d, now))
      tick++
      for (const l of tickListeners) l()
    }, 1000),
    // Other members book and cancel too. Refresh their counts each minute.
    setInterval(() => void refreshCounts(), 60_000),
  ]
}

async function refreshCounts() {
  if (!state || !saved) return
  try {
    const others = await fetchOthers(state, saved)
    if (!state) return
    state = { ...state, others }
    emit()
  } catch {}
}

// ---------- public API

export function getState() {
  return state
}
export function getStoreStatus() {
  return status
}
export function mutate<R>(fn: (draft: AppState, now: number) => R): R {
  if (!state) throw new Error("store not ready")
  const draft = structuredClone(state)
  const now = nowOf(draft)
  const r = fn(draft, now)
  if (draft.clock.skew !== state.clock.skew)
    saveSkew(draft.clock.skew).catch(onWriteFailed)
  state = draft
  version++
  emit()
  scheduleFlush()
  return r
}
// Changes only what this tab shows (who is viewing). Nothing is saved.
export function setLocal(fn: (draft: AppState) => void) {
  if (!state) return
  const draft = { ...state }
  fn(draft)
  state = draft
  emit()
}
// Puts the household back to its seeded demo state on the server. The reset also restarts the shared clock.
export async function resetDemoData() {
  const { error } = await createClient().rpc("reset_demo_household")
  if (error) throw new Error(error.message)
  await replaceFromServer({ force: true })
}
export async function retryLoad() {
  status = { kind: "idle" }
  await loadStore()
}
// Drops everything in memory. Call after sign-out.
export function teardownStore() {
  for (const t of timers) clearInterval(t)
  timers = []
  if (channel) void createClient().removeChannel(channel)
  channel = null
  state = null
  saved = null
  householdId = ""
  authMemberId = ""
  setStatus({ kind: "signed-out" })
}
export function peek() {
  return state
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function useStore(): AppState | null {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null
  )
}
export function useStoreStatus(): StoreStatus {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => status
  )
}
const subscribeTick = (l: () => void) => {
  tickListeners.add(l)
  return () => tickListeners.delete(l)
}
// Re-renders subscribers once per second. Components that show a clock read nowOf(state) after this.
export function useTick(): number {
  return useSyncExternalStore(
    subscribeTick,
    () => tick,
    () => 0
  )
}
export function useNow(): number {
  const s = useStore()
  useTick()
  return s ? nowOf(s) : 0
}
