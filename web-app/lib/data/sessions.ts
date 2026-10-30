import { CLASS_TYPES, SCHEDULES } from "@/lib/data/catalog"
import { addDays, atTime, dateKey, fromKey, MIN, parts } from "@/lib/time"
import type { Session } from "@/lib/types"

export function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

// Story sessions: the numbers in the written spec (Val Vista, Oct 27 to Nov 1).
const STORY: Record<string, { booked: number; waitlist?: number }> = {
  "gilbert-val-vista|2026-10-27|05:30|rrs": { booked: 8 },
  "gilbert-val-vista|2026-10-27|06:00|cc": { booked: 15 },
  "gilbert-val-vista|2026-10-27|07:00|cc": { booked: 9 },
  "gilbert-val-vista|2026-10-27|09:00|af": { booked: 7 },
  "gilbert-val-vista|2026-10-27|09:30|dfy": { booked: 6 },
  "gilbert-val-vista|2026-10-27|12:00|sbh": { booked: 19, waitlist: 3 },
  "gilbert-val-vista|2026-10-27|16:30|dfy": { booked: 8 },
  "gilbert-val-vista|2026-10-27|16:30|ts": { booked: 7 },
  "gilbert-val-vista|2026-10-27|17:30|m30": { booked: 6 },
  "gilbert-val-vista|2026-10-28|06:00|cc": { booked: 12 },
  "gilbert-val-vista|2026-10-29|06:00|rrs": { booked: 14, waitlist: 3 },
  "gilbert-val-vista|2026-10-30|12:00|dfy": { booked: 12 },
  "gilbert-val-vista|2026-10-31|08:00|sbh": { booked: 16 },
  "gilbert-val-vista|2026-10-31|08:00|cc": { booked: 17 },
  "gilbert-val-vista|2026-11-01|09:00|m30": { booked: 9 },
  "mesa-dobson|2026-10-31|08:00|e60": { booked: 15 },
}

const cache = new Map<string, Session[]>()
let cacheFor: unknown = null
// Sessions are built from the catalog. Drop them when a different catalog arrives.
export function clearSessionCache(catalog: unknown) {
  if (cacheFor === catalog) return
  cacheFor = catalog
  cache.clear()
}

export function sessionsForDay(clubSlug: string, dayMs: number): Session[] {
  const key = `${clubSlug}|${dateKey(dayMs)}`
  const hit = cache.get(key)
  if (hit) return hit
  const dow = parts(dayMs).dow
  const rows = SCHEDULES[clubSlug] ?? []
  const out: Session[] = []
  for (const [typeKey, hhmm, days, studio, instructorId, intensity] of rows) {
    if (!days.includes(String(dow))) continue
    const t = CLASS_TYPES[typeKey]
    if (!t) continue
    const start = atTime(dayMs, hhmm)
    const dk = dateKey(dayMs)
    const sk = `${clubSlug}|${dk}|${hhmm}|${typeKey}`
    const story = STORY[sk]
    const r = hash(sk)
    let booked: number
    let waitlist = 0
    if (story) {
      booked = story.booked
      waitlist = story.waitlist ?? 0
    } else {
      booked = Math.round(t.capacity * (0.3 + r * 0.62))
      if (r > 0.93) {
        booked = t.capacity
        waitlist = 1 + Math.floor(hash(`${sk}w`) * 5)
      }
    }
    out.push({
      id: `${clubSlug}~${dk}~${hhmm.replace(":", "")}~${typeKey}`,
      clubSlug,
      typeKey,
      name: t.name,
      category: t.category,
      studio,
      start,
      end: start + t.duration * MIN,
      duration: t.duration,
      instructorId,
      intensity: intensity ?? t.intensity,
      capacity: t.capacity,
      baseBooked: booked,
      baseWaitlist: waitlist,
      unit: t.unit,
      firstTimerOk: t.firstTimerOk,
      teenOk: t.teenOk,
      minAge: t.minAge,
      about: t.about,
      bring: t.bring,
      seriesKey: `${clubSlug}|${typeKey}`,
    })
  }
  out.sort((a, b) => a.start - b.start || a.name.localeCompare(b.name))
  cache.set(key, out)
  return out
}

export function sessionById(id: string): Session | undefined {
  const [slug, dk] = id.split("~")
  if (!slug || !dk) return undefined
  const day = fromKey(dk)
  if (Number.isNaN(day)) return undefined
  return sessionsForDay(slug, day).find((s) => s.id === id)
}

export function sessionsRange(clubSlug: string, fromDay: number, days: number) {
  const out: Session[] = []
  for (let i = 0; i < days; i++)
    out.push(...sessionsForDay(clubSlug, addDays(fromDay, i)))
  return out
}
