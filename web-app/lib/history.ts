import { hash } from "@/lib/data/sessions"
import type { AppState } from "@/lib/data/state"
import { DAY, dayStart, fromKey, parts } from "@/lib/time"
import type { CategoryId, Visit } from "@/lib/types"

// Older visits are generated from the member's habits so the 12-week and year views have something to show.
// Real visits in the saved data always win for the dates they cover.
export function visitHistory(
  s: AppState,
  memberId: string,
  now: number
): Visit[] {
  const real = s.visits.filter((v) => v.memberId === memberId)
  const oldest = real.length ? Math.min(...real.map((v) => v.at)) : now
  const out: Visit[] = [...real]
  const mix: CategoryId[] =
    memberId === "ron" || memberId === "linda"
      ? ["court", "court", "aqua"]
      : memberId === "jordan"
        ? ["youth", "youth", "strength"]
        : [
            "strength",
            "cycle",
            "strength",
            "mind-body",
            "cycle",
            "conditioning",
          ]
  const prefDays = memberId === "maya" ? [2, 4, 1] : [1, 3, 5]
  const startDay = fromKey("2026-01-05")
  for (let d = startDay; d < dayStart(oldest); d += DAY) {
    const dow = parts(d).dow
    const r = hash(`${memberId}${d}`)
    const p = prefDays.includes(dow) ? 0.62 : dow === 6 ? 0.25 : 0.08
    if (r < p)
      out.push({
        memberId,
        clubSlug: s.members[memberId].homeClub,
        at: d + 6 * 3600_000 + Math.floor(hash(`${d}h`) * 3) * 3600_000,
        category: mix[Math.floor(hash(`${memberId}${d}c`) * mix.length)],
      })
  }
  return out.sort((a, b) => a.at - b.at)
}
