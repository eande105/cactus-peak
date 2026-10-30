import type {
  Booking,
  Dismissals,
  GuestPass,
  Household,
  Member,
  MemberPrefs,
  Notice,
  Strike,
  TeenRequest,
  Thread,
  Visit,
} from "@/lib/types"

export interface Stats {
  streakWeeks: number
  lifetime: number
  longest: number
}

// The signed-in household, loaded from Supabase (lib/data/rows.ts) and saved back by lib/store.ts.
export interface AppState {
  v: number
  // Demo clock, shared by every device of the household (households.demo_clock_*, see lib/store.ts).
  clock: { realStart: number; skew: number }
  signedIn: boolean
  currentMemberId: string
  members: Record<string, Member>
  households: Record<string, Household>
  bookings: Booking[]
  strikes: Strike[]
  pauses: Record<string, number>
  notices: Notice[]
  threads: Thread[]
  requests: TeenRequest[]
  guestPasses: GuestPass[]
  visits: Visit[]
  prefs: Record<string, MemberPrefs>
  stats: Record<string, Stats>
  dismissed: Dismissals
  remind: string[]
  opened: Record<string, number>
  seq: number
  // Class spots that other households hold, from the session_counts() RPC. Not saved.
  others?: Record<string, { booked: number; waitlisted: number }>
}

export const STATE_VERSION = 5

export function refFor(seed: string) {
  let h = 7
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const A = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  let out = ""
  for (let i = 0; i < 5; i++) {
    out += A[h % A.length]
    h = Math.floor(h / A.length) + i * 7919
  }
  return `CP-${out}`
}
