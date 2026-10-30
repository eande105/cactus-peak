import { sessionById } from "@/lib/data/sessions"
import type { AppState } from "@/lib/data/state"
import { householdMembers, outsideWaitlist, sessionLeft } from "@/lib/engine"
import { fmtDowTime, HOUR, MIN } from "@/lib/time"

// True when something stored needs to change because time passed.
export function needsAdvance(s: AppState, now: number) {
  for (const b of s.bookings) {
    if (b.status === "held" && (b.holdExpiresAt ?? 0) <= now) return true
    if (b.status === "booked" && b.end <= now) return true
    if (
      b.status === "pending_approval" &&
      s.requests.every((r) => r.status !== "pending")
    )
      return true
  }
  for (const h of Object.values(s.households)) {
    if (h.status === "freeze_scheduled" && h.freeze && h.freeze.start <= now)
      return true
    if (h.status === "frozen" && h.freeze && h.freeze.resume <= now) return true
    if (h.pendingPlan && h.pendingPlan.on <= now) return true
    if (h.status === "cancel_scheduled" && h.cancelOn && h.cancelOn <= now)
      return true
  }
  return false
}

let nid = 0
export const newId = (p: string) =>
  `${p}${Date.now().toString(36)}${(nid++).toString(36)}`

export function advance(d: AppState, now: number) {
  for (const b of d.bookings) {
    if (b.status === "held" && (b.holdExpiresAt ?? 0) <= now) {
      b.status = "cancelled"
      b.noStrike = true
      if (b.sessionId) d.opened[b.sessionId] = (d.opened[b.sessionId] ?? 0) - 1
      d.notices.unshift({
        id: newId("n"),
        memberId: b.memberId,
        type: "hold",
        title: "Your hold ended",
        body: `We offered the spot in ${b.title} to the next person.`,
        at: now,
        filter: "bookings",
      })
      const n = d.notices.find((x) => x.bookingId === b.id && x.needsAction)
      if (n) {
        n.needsAction = false
        n.done = "This offer ended."
      }
    }
    if (b.status === "booked" && b.end <= now && b.kind !== "kids") {
      b.status = "attended"
      d.visits.push({
        memberId: b.memberId,
        clubSlug: b.clubSlug,
        at: b.start,
        category: b.category,
      })
      d.notices.unshift({
        id: newId("n"),
        memberId: b.memberId,
        type: "feedback",
        title: `How was ${b.title}?`,
        body: "Private note for the club. No stars, no public rating.",
        at: now,
        needsAction: true,
        actionLabel: "Give feedback",
        bookingId: b.id,
        filter: "bookings",
      })
    } else if (b.status === "booked" && b.end <= now) b.status = "attended"
  }
  for (const h of Object.values(d.households)) {
    if (h.status === "freeze_scheduled" && h.freeze && h.freeze.start <= now) {
      h.status = "frozen"
      for (const b of d.bookings) {
        if (
          householdMembers(d, h.id).some((m) => m.id === b.memberId) &&
          ["booked", "waitlisted", "held"].includes(b.status) &&
          b.start >= h.freeze.start &&
          b.start < h.freeze.resume
        ) {
          b.status = "cancelled"
          b.noStrike = true
        }
      }
    } else if (h.status === "frozen" && h.freeze && h.freeze.resume <= now) {
      h.status = "active"
      delete h.freeze
    }
    if (h.pendingPlan && h.pendingPlan.on <= now) {
      const pp = h.pendingPlan
      h.plan = pp.plan
      delete h.pendingPlan
      if (pp.plan === "trailhead" && pp.homeClub) {
        for (const m of householdMembers(d, h.id)) m.homeClub = pp.homeClub
        for (const b of d.bookings) {
          if (
            householdMembers(d, h.id).some((m) => m.id === b.memberId) &&
            ["booked", "waitlisted"].includes(b.status) &&
            b.start > now &&
            (b.clubSlug !== pp.homeClub || b.kind === "court")
          ) {
            b.status = "cancelled"
            b.noStrike = true
          }
        }
      }
    }
  }
}

// Gives open spots to the first waiting member in this store. Anonymous members ahead in line get spots first,
// so this runs only when the session has no one else waiting, or when the demo tool forces it.
export function promote(
  d: AppState,
  sessionId: string,
  now: number,
  force = false
) {
  const se = sessionById(sessionId)
  if (!se || se.start - now <= HOUR) return 0
  let count = 0
  for (;;) {
    if (sessionLeft(d, se) <= 0) break
    if (!force && outsideWaitlist(d, se) > 0) break
    const w = d.bookings
      .filter((b) => b.sessionId === sessionId && b.status === "waitlisted")
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))[0]
    if (!w) break
    const conflict = d.bookings.find(
      (o) =>
        o.id !== w.id &&
        o.memberId === w.memberId &&
        ["booked", "held"].includes(o.status) &&
        o.start < se.end &&
        o.end > se.start
    )
    if (conflict) {
      w.status = "cancelled"
      d.notices.unshift({
        id: newId("n"),
        memberId: w.memberId,
        type: "waitlist",
        title: "We skipped your waitlist spot",
        body: `You're booked at that time, so ${se.name} went to the next person.`,
        at: now,
        filter: "bookings",
      })
      continue
    }
    w.status = "held"
    w.holdExpiresAt = now + 30 * MIN
    count++
    d.notices.unshift({
      id: newId("n"),
      memberId: w.memberId,
      type: "hold",
      title: `Spot held: ${se.name}, ${fmtDowTime(se.start)}`,
      body: "A spot opened. It's yours for 30 minutes. Tap Confirm spot.",
      at: now,
      needsAction: true,
      actionLabel: "Confirm spot",
      bookingId: w.id,
      filter: "bookings",
    })
  }
  return count
}
