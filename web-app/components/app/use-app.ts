"use client"
import type { AppState } from "@/lib/data/state"
import { householdOf, nowOf } from "@/lib/engine"
import { useStore, useTick } from "@/lib/store"

// Convenience for pages: the saved state is non-null inside the signed-in layout.
export function useApp() {
  const s = useStore() as AppState
  useTick()
  const now = nowOf(s)
  const me = s.members[s.currentMemberId]
  const hh = householdOf(s, me.id)
  const prefs = s.prefs[me.id]
  return { s, now, me, hh, prefs, club: prefs.viewingClub }
}
