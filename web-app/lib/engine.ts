import { CLUB_BY_SLUG, CLUBS, COACH_BY_SLUG, PLANS } from "@/lib/data/catalog"
import { hash } from "@/lib/data/sessions"
import type { AppState } from "@/lib/data/state"
import {
  addDays,
  atTime,
  DAY,
  DEMO_START,
  dateKey,
  dayStart,
  endSentence,
  fmtDay,
  fmtDayTime,
  fmtTime,
  HOUR,
  MIN,
  parts,
} from "@/lib/time"
import type { Booking, Household, Member, PlanId, Session } from "@/lib/types"

export const nowOf = (s: AppState) =>
  DEMO_START + (Date.now() - s.clock.realStart) + s.clock.skew
export const me = (s: AppState) => s.members[s.currentMemberId]
export const householdOf = (s: AppState, memberId: string): Household =>
  s.households[s.members[memberId].householdId]
export const planOf = (s: AppState, memberId: string): PlanId =>
  householdOf(s, memberId).plan
export const householdMembers = (s: AppState, hhId: string) =>
  Object.values(s.members).filter((m) => m.householdId === hhId)
export const fullName = (m: Member) => `${m.firstName} ${m.lastName}`
export const primaryOf = (s: AppState, memberId: string) =>
  s.members[householdOf(s, memberId).primaryId]
export const windowDays = (plan: PlanId) => PLANS[plan].window

export function householdMonthly(
  s: AppState,
  hh: Household,
  planOverride?: PlanId
) {
  const people = householdMembers(s, hh.id).filter(
    (m) => m.status !== "invite_expired"
  )
  const adults = people.filter((m) => m.role === "adult").length
  const kids = people.filter(
    (m) => m.role === "child" || m.role === "teen"
  ).length
  const base = PLANS[planOverride ?? hh.plan].price
  return {
    base,
    adults,
    kids,
    adultTotal: adults * 39,
    kidTotal: kids * 19,
    total: base + adults * 39 + kids * 19,
  }
}

export function nextBillingDate(hh: Household, now: number) {
  const p = parts(now)
  let y = p.y
  let m = p.m
  if (p.d >= hh.billingDay) {
    m += 1
    if (m > 11) {
      m = 0
      y += 1
    }
  }
  return Date.UTC(y, m, hh.billingDay, 0, 0) + 7 * HOUR
}
export function billingDatesFrom(hh: Household, from: number, count: number) {
  const out: number[] = []
  let cur = nextBillingDate(hh, from - DAY)
  while (out.length < count) {
    if (cur >= dayStart(from)) out.push(cur)
    const p = parts(cur + 1)
    const next = Date.UTC(p.y, p.m + 1, hh.billingDay, 0, 0) + 7 * HOUR
    cur = next
  }
  return out
}
export function daysInCycle(hh: Household, now: number) {
  const next = nextBillingDate(hh, now)
  const pn = parts(next)
  const prev = Date.UTC(pn.y, pn.m - 1, hh.billingDay, 0, 0) + 7 * HOUR
  return {
    prev,
    next,
    days: Math.round((next - prev) / DAY),
    left: Math.round((dayStart(next) - dayStart(now)) / DAY),
  }
}

// ---- strikes and pauses
export function activeStrikes(s: AppState, memberId: string, now: number) {
  return s.strikes
    .filter((k) => k.memberId === memberId && now - k.at < 30 * DAY)
    .sort((a, b) => a.at - b.at)
}
export function pausedUntil(s: AppState, memberId: string, now: number) {
  const u = s.pauses[memberId]
  return u && u > now ? u : 0
}
export function paymentDaysLate(s: AppState, memberId: string, now: number) {
  const h = householdOf(s, memberId)
  if (h.status !== "payment_failed" || !h.paymentFailedAt) return -1
  return Math.floor((now - h.paymentFailedAt) / DAY)
}

// ---- classes
export const activeStatuses: Booking["status"][] = ["booked", "held"]
// Spots in a class come from three places: the schedule's base numbers (members outside the demo),
// other households in the database (session_counts, in s.others) and this household's own bookings.
export function othersIn(s: AppState, sessionId: string) {
  return s.others?.[sessionId] ?? { booked: 0, waitlisted: 0 }
}
// People ahead in line who are not in this household.
export function outsideWaitlist(s: AppState, se: Session) {
  return se.baseWaitlist + othersIn(s, se.id).waitlisted
}
export function sessionLeft(s: AppState, se: Session) {
  const taken = s.bookings.filter(
    (b) => b.sessionId === se.id && activeStatuses.includes(b.status)
  ).length
  return Math.max(
    0,
    se.capacity -
      se.baseBooked -
      othersIn(s, se.id).booked -
      taken +
      (s.opened[se.id] ?? 0)
  )
}
export function waitCount(s: AppState, se: Session) {
  return (
    outsideWaitlist(s, se) +
    s.bookings.filter((b) => b.sessionId === se.id && b.status === "waitlisted")
      .length
  )
}
export function bookingOf(s: AppState, memberId: string, sessionId: string) {
  return s.bookings.find(
    (b) =>
      b.sessionId === sessionId &&
      b.memberId === memberId &&
      ["booked", "held", "waitlisted", "pending_approval"].includes(b.status)
  )
}
export function opensAt(startMs: number, days: number) {
  return dayStart(startMs) - days * DAY + 6 * HOUR
}
export function activeWaitlists(s: AppState, memberId: string) {
  return s.bookings.filter(
    (b) => b.memberId === memberId && b.status === "waitlisted"
  ).length
}

export type BState =
  | "book"
  | "booking"
  | "booked"
  | "waitlist"
  | "waitlisted"
  | "hold"
  | "full"
  | "late-cancel"
  | "paused"
  | "restricted"
  | "started"
  | "error"
export interface BookingState {
  state: BState
  label: string
  reason?: string
  link?: {
    label: string
    href?: string
    action?: "remind" | "resume" | "update-card" | "ask-parent"
  }
  booking?: Booking
  dropIn?: boolean
  opens?: number
  tone?: "default" | "warning"
}

export function bookingState(
  s: AppState,
  forId: string,
  se: Session,
  now: number
): BookingState {
  const m = s.members[forId]
  const hh = householdOf(s, forId)
  const mine = bookingOf(s, forId, se.id)
  const left = sessionLeft(s, se)
  if (mine?.status === "held") {
    if ((mine.holdExpiresAt ?? 0) > now)
      return {
        state: "hold",
        label: "Confirm spot",
        booking: mine,
        reason: "A spot opened. It is yours until you run out of time.",
      }
  }
  if (mine?.status === "booked") {
    const late = se.start - now < 2 * HOUR
    return {
      state: late ? "late-cancel" : "booked",
      label: "Booked",
      booking: mine,
      reason: late
        ? "Cancelling now counts as a late cancel."
        : `Free to cancel until ${fmtTime(se.start - 2 * HOUR)}`,
    }
  }
  if (mine?.status === "waitlisted")
    return {
      state: "waitlisted",
      label: `On waitlist #${mine.position ?? waitCount(s, se)}`,
      booking: mine,
    }
  if (mine?.status === "pending_approval")
    return {
      state: "restricted",
      label: "Waiting for parent",
      reason: "Your request is with your parent.",
      booking: mine,
    }
  if (se.start <= now)
    return { state: "started", label: "Started", reason: "Class has started." }
  if (hh.status === "frozen")
    return {
      state: "restricted",
      label: "Membership frozen",
      reason: `Your membership is frozen until ${fmtDay((hh.freeze?.resume ?? 0) - DAY)}.`,
      link: { label: "Resume early", action: "resume" },
    }
  const late = paymentDaysLate(s, forId, now)
  if (late >= 8)
    return {
      state: "restricted",
      label: "Update card",
      reason: "Update your card to book. Your bookings are safe.",
      link: { label: "Update card", action: "update-card" },
    }
  const pu = pausedUntil(s, forId, now)
  if (pu)
    return {
      state: "paused",
      label: "Booking paused",
      reason: `Back on ${fmtDay(pu)}`,
    }
  const plan = hh.plan
  if (plan === "trailhead" && se.clubSlug !== m.homeClub)
    return {
      state: "restricted",
      label: "Ridge or Summit",
      reason: `Trailhead books at ${CLUB_BY_SLUG[m.homeClub].name} only.`,
      link: { label: "See plans", href: "/membership/change-plan" },
    }
  if (m.age < se.minAge)
    return {
      state: "restricted",
      label: `${se.minAge}+ only`,
      reason:
        se.minAge >= 18
          ? "For ages 18 and over."
          : `${se.name} is for ages ${se.minAge} and up.`,
    }
  if (m.role === "teen" && !se.teenOk) {
    const parent = m.parentId ? s.members[m.parentId] : undefined
    return {
      state: "restricted",
      label: "Needs parent OK",
      reason: `This class needs ${parent?.firstName ?? "your parent"}'s OK.`,
      link: {
        label: `Ask ${parent?.firstName ?? "parent"}`,
        action: "ask-parent",
      },
    }
  }
  const opens = opensAt(se.start, windowDays(plan))
  if (now < opens)
    return {
      state: "restricted",
      label: `Opens ${fmtDay(opens).split(",")[0]} ${fmtTime(opens)}`,
      reason: `Opens ${fmtDay(opens)} at ${fmtTime(opens)}`,
      link: { label: "Remind me", action: "remind" },
      opens,
    }
  if (left > 0) {
    const dropIn =
      se.start - now < HOUR && se.baseWaitlist + 0 >= 0 && sessionWasFull(se)
    return {
      state: "book",
      label: "Book",
      reason: dropIn ? "Drop-in spot. The waitlist is closed." : undefined,
      dropIn,
    }
  }
  if (se.start - now < HOUR)
    return {
      state: "full",
      label: "Full",
      reason: "Waitlist closed 1 hour before start",
    }
  return {
    state: "waitlist",
    label: "Join waitlist",
    reason: `Full. ${waitCount(s, se)} ${waitCount(s, se) === 1 ? "person" : "people"} waiting.`,
  }
}
function sessionWasFull(se: Session) {
  return se.baseBooked >= se.capacity
}

export function capacityText(s: AppState, se: Session, now: number) {
  const left = sessionLeft(s, se)
  if (se.start <= now) return "Started"
  if (left === 0) return `Full · ${waitCount(s, se)} waiting`
  const u =
    se.unit === "bikes"
      ? left === 1
        ? "bike"
        : "bikes"
      : left === 1
        ? "spot"
        : "spots"
  return `${left} ${u} left`
}

// ---- club hours and busyness
export function hoursFor(dow: number) {
  const weekend = dow === 0 || dow === 6
  return weekend
    ? { open: 6 * 60, close: 20 * 60 }
    : { open: 4.5 * 60, close: 22 * 60 }
}
export function clubOpen(now: number) {
  const p = parts(now)
  const h = hoursFor(p.dow)
  const mins = p.h * 60 + p.min
  const open = mins >= h.open && mins < h.close
  const closeAt = atTime(now, `${Math.floor(h.close / 60)}:00`)
  const openAt = (() => {
    const next = mins < h.open ? now : addDays(now, 1)
    const hh = hoursFor(parts(next).dow)
    return atTime(
      next,
      `${Math.floor(hh.open / 60)}:${String(hh.open % 60).padStart(2, "0")}`
    )
  })()
  return { open, closeAt, openAt }
}
export function liveBusyness(slug: string, now: number) {
  const club = CLUB_BY_SLUG[slug]
  const p = parts(now)
  const o = clubOpen(now)
  const arr = p.dow === 0 || p.dow === 6 ? club.weekend : club.typical
  const idx = Math.min(17, Math.max(0, p.h - 4))
  const level = arr[idx]
  const updated = now - (now % (5 * MIN))
  return {
    level,
    open: o.open,
    updatedAt: updated,
    stale: false,
    label: ["", "Quiet", "Light", "Steady", "Busy", "Packed"][level],
  }
}
export function typicalFor(slug: string, dow: number) {
  const club = CLUB_BY_SLUG[slug]
  return dow === 0 || dow === 6 ? club.weekend : club.typical
}
export function busyHint(slug: string, now: number) {
  const p = parts(now)
  const arr = typicalFor(slug, p.dow)
  const idx = Math.max(0, p.h - 4)
  const ap = (h: number) => (h < 12 ? "a.m." : "p.m.")
  const bare = (h: number) => `${h % 12 || 12}`
  let start = -1
  for (let i = idx; i < arr.length; i++)
    if (arr[i] >= 4) {
      start = i
      break
    }
  if (start < 0) return "Quiet for the rest of the day."
  let end = start
  while (end + 1 < arr.length && arr[end + 1] >= 4) end++
  const sh = start + 4
  const eh = end + 5
  const range = `${bare(sh)}${ap(sh) !== ap(eh) ? ` ${ap(sh)}` : ""} to ${bare(eh)} ${ap(eh)}`
  let q = -1
  for (let i = end + 1; i < arr.length; i++)
    if (arr[i] <= 2) {
      q = i + 4
      break
    }
  return `Busier ${range}${q > 0 ? ` Quieter after ${bare(q)} ${ap(q)}` : ""}`
}

// One place for the cancel rule line. Past the free window it says so, with the strike count.
export function cancelNote(
  s: AppState,
  memberId: string,
  start: number,
  now: number,
  kind: Booking["kind"] = "class"
) {
  if (kind === "kids")
    return {
      late: false,
      started: now >= start,
      text:
        now >= start
          ? "In progress."
          : "Free to cancel. Please give 2 hours' notice.",
    }
  const win = (kind === "pt" ? 24 : 2) * HOUR
  const n = Math.min(3, activeStrikes(s, memberId, now).length + 1)
  if (now >= start)
    return {
      late: true,
      started: true,
      text:
        kind === "pt"
          ? "Started. The session is used."
          : `Started. Cancelling now counts as a late cancel (strike ${n} of 3).`,
    }
  if (start - now < win) {
    const mins = Math.max(1, Math.round((start - now) / MIN))
    const left =
      mins >= 60
        ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ""}`
        : `${mins} min`
    return {
      late: true,
      started: false,
      text:
        kind === "pt"
          ? `This starts in ${left}. Moving or cancelling now uses the session.`
          : `This starts in ${left}. Cancelling now counts as a late cancel (strike ${n} of 3).`,
    }
  }
  const day =
    dayStart(start - win) !== dayStart(now) ? ` on ${fmtDay(start - win)}` : ""
  return {
    late: false,
    started: false,
    text: endSentence(
      `Free to cancel${kind === "pt" ? " or move" : ""} until ${fmtTime(start - win)}${day}`
    ),
  }
}

// ---- reservations: courts
export interface Block {
  from: number
  to: number
  kind: "taken" | "closed"
}
const SAT_RM_STORY = (day: number): Record<number, Block[]> => ({
  1: [
    { from: atTime(day, "07:30"), to: atTime(day, "09:00"), kind: "taken" },
    { from: atTime(day, "13:00"), to: atTime(day, "14:30"), kind: "taken" },
  ],
  2: [
    { from: atTime(day, "07:00"), to: atTime(day, "08:30"), kind: "taken" },
    { from: atTime(day, "11:30"), to: atTime(day, "13:00"), kind: "taken" },
  ],
  3: [
    { from: atTime(day, "06:00"), to: atTime(day, "08:00"), kind: "taken" },
    { from: atTime(day, "10:30"), to: atTime(day, "12:00"), kind: "taken" },
  ],
  4: [{ from: atTime(day, "06:00"), to: atTime(day, "10:00"), kind: "taken" }],
  5: [{ from: atTime(day, "09:00"), to: atTime(day, "10:00"), kind: "closed" }],
  6: [],
})
export function courtCount(slug: string, sport: string) {
  return CLUB_BY_SLUG[slug].courts.find((c) => c.sport === sport)?.count ?? 0
}
export function baseCourtBlocks(
  slug: string,
  sport: string,
  court: number,
  dayMs: number
): Block[] {
  if (
    slug === "mesa-red-mountain" &&
    sport === "pickleball" &&
    dateKey(dayMs) === "2026-10-31"
  )
    return SAT_RM_STORY(dayMs)[court] ?? []
  const wk = parts(dayMs).dow
  const open = wk === 0 || wk === 6 ? 6 * 60 : 6 * 60
  const close = wk === 0 || wk === 6 ? 20 * 60 : 21 * 60
  const blocks: Block[] = []
  let t =
    open +
    Math.floor(hash(`${slug}${sport}${court}${dateKey(dayMs)}s`) * 4) * 30
  let i = 0
  while (t < close - 60) {
    const r = hash(`${slug}${sport}${court}${dateKey(dayMs)}${i++}`)
    const len = r > 0.5 ? 90 : 60
    if (r < 0.5) {
      const from = atTime(
        dayMs,
        `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
      )
      blocks.push({ from, to: from + len * MIN, kind: "taken" })
      t += len + 30 * Math.floor(hash(`${i}${court}${slug}`) * 3)
    } else t += 30 * (1 + Math.floor(hash(`${i}g${court}${slug}`) * 3))
  }
  return blocks
}
export function courtBlocks(
  s: AppState,
  slug: string,
  sport: string,
  court: number,
  dayMs: number
) {
  const blocks = [...baseCourtBlocks(slug, sport, court, dayMs)]
  const hhId = s.members[s.currentMemberId].householdId
  const mineIds: string[] = []
  for (const b of s.bookings) {
    if (
      b.kind === "court" &&
      b.status === "booked" &&
      b.clubSlug === slug &&
      b.sport === sport &&
      b.resource === `Court ${court}` &&
      dayStart(b.start) === dayStart(dayMs)
    ) {
      blocks.push({ from: b.start, to: b.end, kind: "taken" })
      if (s.members[b.memberId].householdId === hhId) mineIds.push(b.id)
    }
  }
  return { blocks, mineIds }
}
export function courtWindow(plan: PlanId) {
  void plan
  return 3
}
export function gridSlots(dayMs: number, kind: "court" | "lane") {
  const dow = parts(dayMs).dow
  const weekend = dow === 0 || dow === 6
  if (kind === "court") {
    const start = 6 * 60
    const lastStart = (weekend ? 20 * 60 : 21 * 60) - 60
    const out: number[] = []
    for (let t = start; t <= lastStart; t += 30)
      out.push(
        atTime(
          dayMs,
          `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`
        )
      )
    return out
  }
  const open = weekend ? 6 * 60 : 4.5 * 60
  const close = (weekend ? 20 * 60 : 22 * 60) - 30
  const out: number[] = []
  for (let t = open; t + 45 <= close; t += 45)
    out.push(
      atTime(
        dayMs,
        `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`
      )
    )
  return out
}
export function laneSwimmers(
  s: AppState,
  slug: string,
  lane: number,
  start: number
) {
  const dk = dateKey(start)
  let base: number
  if (
    slug === "mesa-dobson" &&
    dk === "2026-10-28" &&
    Math.round((start - dayStart(start)) / MIN) === 360
  )
    base = [1, 2, 5].includes(lane) ? 2 : lane === 3 ? 1 : 0
  else {
    const r = hash(`${slug}${lane}${start}`)
    base = r < 0.5 ? 0 : r < 0.82 ? 1 : 2
  }
  const hhId = s.members[s.currentMemberId].householdId
  let mine = false
  let add = 0
  for (const b of s.bookings) {
    if (
      b.kind === "lane" &&
      b.status === "booked" &&
      b.clubSlug === slug &&
      b.resource === `Lane ${lane}` &&
      b.start === start
    ) {
      add += 1
      if (s.members[b.memberId].householdId === hhId) mine = true
    }
  }
  return { swimmers: Math.min(2, base + add), mine }
}
export const KIDS_BLOCKS = [
  { id: "k1", from: "08:00", to: "10:00" },
  { id: "k2", from: "10:00", to: "12:00" },
  { id: "k3", from: "16:00", to: "18:00" },
  { id: "k4", from: "18:00", to: "20:00" },
]
export function kidsLeft(
  s: AppState,
  slug: string,
  dayMs: number,
  block: { from: string }
) {
  const dk = dateKey(dayMs)
  const cap = 16
  let booked: number
  if (slug === "gilbert-val-vista" && dk === "2026-10-31")
    booked =
      { "08:00": 10, "10:00": 13, "16:00": 15, "18:00": 8 }[block.from] ?? 6
  else
    booked = Math.round(cap * (0.25 + hash(`${slug}${dk}${block.from}`) * 0.6))
  const start = atTime(dayMs, block.from)
  const store = s.bookings.filter(
    (b) =>
      b.kind === "kids" &&
      b.status === "booked" &&
      b.clubSlug === slug &&
      b.start === start
  ).length
  return Math.max(0, cap - booked - store)
}

// ---- training
export function ptOpenSlots(
  s: AppState,
  coachSlug: string,
  now: number,
  days = 14
) {
  const c = COACH_BY_SLUG[coachSlug]
  const out: number[] = []
  for (let i = 0; i < days; i++) {
    const day = addDays(now, i)
    const dow = parts(day).dow
    for (const o of c.openTimes) {
      if (o.dow !== dow) continue
      const start = atTime(day, o.time)
      if (start < now + 2 * HOUR) continue
      if (hash(`${coachSlug}${start}`) > 0.82) continue
      if (
        s.bookings.some(
          (b) =>
            b.kind === "pt" &&
            b.coachSlug === coachSlug &&
            b.start === start &&
            b.status === "booked"
        )
      )
        continue
      out.push(start)
    }
  }
  return out.sort((a, b) => a - b)
}
export function ptCreditsLeft(h: Household) {
  return h.ptPack ? h.ptPack.total - h.ptPack.used : 0
}

// ---- guest passes
export function guestPassesLeft(s: AppState, hhId: string, now: number) {
  const hh = s.households[hhId]
  const { prev } = daysInCycle(hh, now)
  const included = PLANS[hh.plan].guestPasses
  const used = s.guestPasses.filter(
    (g) =>
      g.householdId === hhId &&
      !g.bought &&
      g.status !== "cancelled" &&
      g.sentAt >= prev
  ).length
  return { included, left: Math.max(0, included - used) }
}

// ---- conflicts and visits
export function overlaps(
  s: AppState,
  memberId: string,
  start: number,
  end: number,
  ignoreId?: string
) {
  return s.bookings.find(
    (b) =>
      b.id !== ignoreId &&
      b.memberId === memberId &&
      ["booked", "held"].includes(b.status) &&
      b.start < end &&
      b.end > start
  )
}
export function visitsInRange(
  s: AppState,
  memberId: string,
  from: number,
  to: number
) {
  return s.visits.filter(
    (v) => v.memberId === memberId && v.at >= from && v.at < to
  )
}
export function weekStart(ms: number) {
  const p = parts(ms)
  return dayStart(ms) - ((p.dow + 6) % 7) * DAY
}
export const allClubs = CLUBS
export function describeSlot(b: Booking) {
  return `${fmtDayTime(b.start)} · ${b.title}`
}
