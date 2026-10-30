import type { AppState } from "@/lib/data/state"
import { bookingOf, sessionLeft } from "@/lib/engine"
import { minutesOfDay } from "@/lib/time"
import type { CategoryId, Session } from "@/lib/types"

export type TimeBand = "early" | "morning" | "midday" | "evening"
export interface Filters {
  clubs: string[]
  cats: CategoryId[]
  times: TimeBand[]
  intMin: number
  intMax: number
  open: boolean
  first: boolean
  mine: boolean
  inst: string
  studio: string
  dur: string
  series: string
}
export const EMPTY: Omit<Filters, "clubs"> = {
  cats: [],
  times: [],
  intMin: 1,
  intMax: 5,
  open: false,
  first: false,
  mine: false,
  inst: "",
  studio: "",
  dur: "",
  series: "",
}

export function parseFilters(
  p: URLSearchParams,
  fallbackClub: string
): Filters {
  const list = (k: string) => (p.get(k) ?? "").split(",").filter(Boolean)
  const [a, b] = (p.get("int") ?? "1-5").split("-").map(Number)
  return {
    clubs: list("club").length ? list("club") : [fallbackClub],
    cats: list("cat") as CategoryId[],
    times: list("time") as TimeBand[],
    intMin: a || 1,
    intMax: b || 5,
    open: p.get("open") === "1",
    first: p.get("first") === "1",
    mine: p.get("mine") === "1",
    inst: p.get("inst") ?? "",
    studio: p.get("studio") ?? "",
    dur: p.get("dur") ?? "",
    series: p.get("series") ?? "",
  }
}
export function serializeFilters(
  f: Filters,
  base: URLSearchParams,
  fallbackClub: string
) {
  const p = new URLSearchParams(base)
  const set = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k))
  set(
    "club",
    f.clubs.length === 1 && f.clubs[0] === fallbackClub ? "" : f.clubs.join(",")
  )
  set("cat", f.cats.join(","))
  set("time", f.times.join(","))
  set("int", f.intMin === 1 && f.intMax === 5 ? "" : `${f.intMin}-${f.intMax}`)
  set("open", f.open ? "1" : "")
  set("first", f.first ? "1" : "")
  set("mine", f.mine ? "1" : "")
  set("inst", f.inst)
  set("studio", f.studio)
  set("dur", f.dur)
  set("series", f.series)
  return p
}
export function bandOf(ms: number): TimeBand {
  const m = minutesOfDay(ms)
  return m < 7 * 60
    ? "early"
    : m < 12 * 60
      ? "morning"
      : m < 16 * 60
        ? "midday"
        : "evening"
}
export function activeCount(f: Filters, fallbackClub: string) {
  return (
    (f.clubs.length === 1 && f.clubs[0] === fallbackClub ? 0 : 1) +
    (f.cats.length ? 1 : 0) +
    (f.times.length ? 1 : 0) +
    (f.intMin !== 1 || f.intMax !== 5 ? 1 : 0) +
    [f.open, f.first, f.mine].filter(Boolean).length +
    (f.inst ? 1 : 0) +
    (f.studio ? 1 : 0) +
    (f.dur ? 1 : 0) +
    (f.series ? 1 : 0)
  )
}
export function applyFilters(
  list: Session[],
  f: Filters,
  s: AppState,
  memberId: string
) {
  return list.filter((x) => {
    if (f.cats.length && !f.cats.includes(x.category)) return false
    if (f.times.length && !f.times.includes(bandOf(x.start))) return false
    if (x.intensity < f.intMin || x.intensity > f.intMax) return false
    if (f.open && sessionLeft(s, x) <= 0) return false
    if (f.first && !x.firstTimerOk) return false
    if (f.mine && !bookingOf(s, memberId, x.id)) return false
    if (f.inst && x.instructorId !== f.inst) return false
    if (f.studio && x.studio !== f.studio) return false
    if (f.series && x.typeKey !== f.series) return false
    if (f.dur === "30" && x.duration > 30) return false
    if (f.dur === "45" && x.duration !== 45) return false
    if (f.dur === "60" && x.duration < 60) return false
    return true
  })
}
