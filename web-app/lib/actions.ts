"use client"
import { advance, newId, promote } from "@/lib/advance"
import {
  ADULT_ADDON,
  CHILD_ADDON,
  CLUB_BY_SLUG,
  COACH_BY_SLUG,
  PLANS,
  PT_PACKS,
  PT_PRICE,
} from "@/lib/data/catalog"
import { sessionById } from "@/lib/data/sessions"
import { type AppState, refFor } from "@/lib/data/state"
import {
  activeStrikes,
  activeWaitlists,
  billingDatesFrom,
  bookingState,
  courtBlocks,
  courtCount,
  daysInCycle,
  guestPassesLeft,
  householdMembers,
  householdMonthly,
  householdOf,
  KIDS_BLOCKS,
  kidsLeft,
  laneSwimmers,
  nextBillingDate,
  outsideWaitlist,
  overlaps,
  planOf,
  primaryOf,
  ptCreditsLeft,
  ptOpenSlots,
  sessionLeft,
} from "@/lib/engine"
import { mutate, resetDemoData, setLocal, teardownStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import {
  atTime,
  DAY,
  dayStart,
  fmtDay,
  fmtDayShort,
  fmtDowTime,
  fmtRange,
  fmtTime,
  fromKey,
  HOUR,
  MIN,
  parts,
} from "@/lib/time"
import type { Booking, Household, Member, PlanId, Session } from "@/lib/types"

export type Result<T = object> =
  | ({ ok: true } & T)
  | { ok: false; code: string; message: string; conflict?: Booking }
const fail = (
  code: string,
  message: string,
  extra: object = {}
): Result<never> => ({ ok: false, code, message, ...extra }) as never

function addNotice(
  d: AppState,
  n: Omit<AppState["notices"][number], "id" | "at"> & { at?: number },
  now: number
) {
  d.notices.unshift({
    id: newId("n"),
    at: n.at ?? now,
    ...n,
  } as AppState["notices"][number])
}
function bike(d: AppState, se: Session) {
  const taken = new Set(
    d.bookings.filter((b) => b.sessionId === se.id && b.spot).map((b) => b.spot)
  )
  if (se.unit !== "bikes") return undefined
  for (let i = 1; i <= se.capacity; i++)
    if (!taken.has(`Bike ${i}`) && (i + se.baseBooked) % 3 !== 0)
      return `Bike ${i}`
  return `Bike ${se.capacity}`
}
const lateWindow = (start: number, now: number) => start - now < 2 * HOUR

// ---------- auth and members
// Sign-in happens on the sign-in page with Supabase Auth. This ends the session in every tab of this browser.
export async function signOut(scope: "local" | "global" = "local") {
  const { error } = await createClient().auth.signOut({ scope })
  teardownStore()
  if (error) throw new Error(error.message)
}
// Views the app as another member of the signed-in household. Row level security limits the app to this
// household, so other demo people need their own sign-in. Nothing is saved.
export function switchMember(id: string) {
  setLocal((d) => {
    if (d.members[id]) d.currentMemberId = id
  })
}
export function setPrefs(
  memberId: string,
  patch: Partial<AppState["prefs"][string]>
) {
  mutate((d) => {
    Object.assign(d.prefs[memberId], patch)
  })
}
export function setNotifCell(
  memberId: string,
  topic: string,
  channel: "push" | "email" | "text",
  on: boolean
) {
  mutate((d) => {
    d.prefs[memberId].notif[topic][channel] = on
  })
}
export function dismiss(key: "promo" | "passkeyCard" | "onboardingBanner") {
  mutate((d, now) => {
    if (key === "promo") d.dismissed.promo = now
    else d.dismissed[key] = true
  })
}
export function addRemind(key: string) {
  mutate((d) => {
    if (!d.remind.includes(key)) d.remind.push(key)
  })
}
export function updateMember(id: string, patch: Partial<Member>) {
  mutate((d) => {
    Object.assign(d.members[id], patch)
  })
}

// ---------- class booking
export function bookClass(
  sessionId: string,
  forId: string,
  opts: { replaceId?: string } = {}
): Result<{ booking: Booking }> {
  return mutate((d, now) => {
    const se = sessionById(sessionId)
    if (!se) return fail("NOT_FOUND", "That class has ended.")
    if (opts.replaceId) {
      const old = d.bookings.find((b) => b.id === opts.replaceId)
      if (old) {
        old.status = "cancelled"
        old.noStrike = true
        old.cancelledAt = now
      }
    }
    const st = bookingState(d, forId, se, now)
    if (st.state === "waitlist")
      return fail(
        "CLASS_FULL",
        "That class is full. Join the waitlist, or see other times."
      )
    if (st.state !== "book")
      return fail(
        st.state === "paused" ? "BOOKING_PAUSED" : "RESTRICTED",
        st.reason ?? "You can't book this class right now."
      )
    const clash = overlaps(d, forId, se.start, se.end)
    if (clash && !opts.replaceId)
      return fail(
        "CONFLICT_OVERLAP",
        `You're booked for ${clash.title} at ${fmtTime(clash.start)}`,
        { conflict: clash }
      )
    const me = d.currentMemberId
    const b: Booking = {
      id: newId("b"),
      kind: "class",
      memberId: forId,
      ownerId: me,
      status: "booked",
      createdAt: now,
      ref: refFor(`${sessionId}${forId}${d.seq++}`),
      clubSlug: se.clubSlug,
      start: se.start,
      end: se.end,
      title: se.name,
      category: se.category,
      place: se.studio,
      sessionId,
      spot: bike(d, se),
    }
    d.bookings.push(b)
    addNotice(
      d,
      {
        memberId: forId,
        type: "booked",
        title: `Booked: ${se.name}, ${fmtDowTime(se.start)}`,
        body: `${se.studio} · ${CLUB_BY_SLUG[se.clubSlug].name}`,
        filter: "bookings",
      },
      now
    )
    return { ok: true, booking: b } as const
  })
}

export interface CancelOutcome {
  late: boolean
  strikeCount: number
  paused: boolean
  pauseUntil?: number
  clears?: number
}
export function cancelBooking(
  bookingId: string,
  opts: { reason?: string; undoWindow?: boolean } = {}
): Result<CancelOutcome> {
  return mutate((d, now) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (!b) return fail("NOT_FOUND", "We couldn't find that booking.")
    const wasHeld = b.status === "held"
    const free =
      b.kind === "kids" ||
      opts.undoWindow ||
      wasHeld ||
      b.status === "waitlisted" ||
      !lateWindow(b.start, now) ||
      b.kind === "pt"
    const out: CancelOutcome = {
      late: !free,
      strikeCount: activeStrikes(d, b.memberId, now).length,
      paused: false,
    }
    if (
      b.kind === "pt" &&
      lateWindow24(b.start, now) &&
      b.status === "booked"
    ) {
      b.status = "late_cancelled"
      const h = householdOf(d, b.memberId)
      if (h.ptPack) h.ptPack.used += 0
    } else b.status = free ? "cancelled" : "late_cancelled"
    b.cancelledAt = now
    if (opts.undoWindow) b.noStrike = true
    if (!free) {
      d.strikes.push({
        id: newId("s"),
        memberId: b.memberId,
        at: now,
        bookingId: b.id,
        title: `${b.title}, ${fmtDay(b.start)}`,
      })
      const list = activeStrikes(d, b.memberId, now)
      out.strikeCount = list.length
      out.clears = list[0].at + 30 * DAY
      if (list.length >= 3) {
        d.pauses[b.memberId] = now + 3 * DAY
        out.paused = true
        out.pauseUntil = now + 3 * DAY
      }
      addNotice(
        d,
        {
          memberId: b.memberId,
          type: "late_cancel",
          title: `Late cancel on ${fmtDay(b.start)}`,
          body: `That's ${list.length} of 3. It clears ${fmtDayShort(out.clears)}.${out.paused ? ` Booking is paused until ${fmtDay(out.pauseUntil!)}.` : ""}`,
          filter: "bookings",
        },
        now
      )
    }
    if (b.sessionId) {
      if (wasHeld) d.opened[b.sessionId] = (d.opened[b.sessionId] ?? 0) - 1
      promote(d, b.sessionId, now)
    }
    const n = d.notices.find((x) => x.bookingId === b.id && x.needsAction)
    if (n) {
      n.needsAction = false
      n.done = "Cancelled."
    }
    return { ok: true, ...out } as const
  })
}
const lateWindow24 = (start: number, now: number) => start - now < 24 * HOUR

export function undoCancel(bookingId: string): Result {
  return mutate((d, now) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (!b) return fail("NOT_FOUND", "We couldn't find that booking.")
    if (b.sessionId) {
      const se = sessionById(b.sessionId)
      if (se && sessionLeft(d, se) <= 0)
        return fail("CLASS_FULL", "That spot was taken. Join the waitlist?")
    }
    if (b.status === "late_cancelled") {
      const i = d.strikes.findIndex((s) => s.bookingId === b.id)
      if (i >= 0) d.strikes.splice(i, 1)
    }
    b.status = b.noStrike && b.sessionId === undefined ? "booked" : "booked"
    b.cancelledAt = undefined
    void now
    return { ok: true } as const
  })
}

export function joinWaitlist(
  sessionId: string,
  forId: string
): Result<{ position: number; booking: Booking }> {
  return mutate((d, now) => {
    const se = sessionById(sessionId)
    if (!se) return fail("NOT_FOUND", "That class has ended.")
    if (activeWaitlists(d, forId) >= 5)
      return fail(
        "LIMIT_REACHED",
        "You're on 5 waitlists. Leave one to join another."
      )
    const position =
      outsideWaitlist(d, se) +
      d.bookings.filter(
        (b) => b.sessionId === sessionId && b.status === "waitlisted"
      ).length +
      1
    const b: Booking = {
      id: newId("b"),
      kind: "class",
      memberId: forId,
      ownerId: d.currentMemberId,
      status: "waitlisted",
      createdAt: now,
      ref: refFor(`w${sessionId}${forId}`),
      clubSlug: se.clubSlug,
      start: se.start,
      end: se.end,
      title: se.name,
      category: se.category,
      place: se.studio,
      sessionId,
      position,
    }
    d.bookings.push(b)
    addNotice(
      d,
      {
        memberId: forId,
        type: "waitlist",
        title: `You're ${ordinal(position)} on the waitlist for ${se.name}, ${fmtDowTime(se.start)}`,
        body: "We'll tell you if a spot opens.",
        filter: "bookings",
      },
      now
    )
    return { ok: true, position, booking: b } as const
  })
}
export const ordinal = (n: number) =>
  `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`

export function leaveWaitlist(bookingId: string): Result {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (!b) return fail("NOT_FOUND", "We couldn't find that waitlist spot.")
    b.status = "cancelled"
    b.noStrike = true
    return { ok: true } as const
  })
}
export function rejoinWaitlist(bookingId: string): Result {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (!b?.sessionId)
      return fail("NOT_FOUND", "We couldn't find that waitlist spot.")
    const se = sessionById(b.sessionId)!
    b.status = "waitlisted"
    b.position =
      outsideWaitlist(d, se) +
      d.bookings.filter(
        (x) => x.sessionId === b.sessionId && x.status === "waitlisted"
      ).length
    return { ok: true } as const
  })
}
export function confirmHold(bookingId: string): Result<{ lateNow: boolean }> {
  return mutate((d, now) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (b?.status !== "held")
      return fail(
        "HOLD_EXPIRED",
        "Your hold ended. We offered the spot to the next person."
      )
    if ((b.holdExpiresAt ?? 0) <= now) {
      advance(d, now)
      return fail(
        "HOLD_EXPIRED",
        "Your hold ended. We offered the spot to the next person."
      )
    }
    const clash = overlaps(d, b.memberId, b.start, b.end, b.id)
    if (clash)
      return fail(
        "CONFLICT_OVERLAP",
        `You're booked for ${clash.title} at ${fmtTime(clash.start)}`,
        { conflict: clash }
      )
    b.status = "booked"
    b.holdExpiresAt = undefined
    const se = b.sessionId ? sessionById(b.sessionId) : undefined
    if (se) b.spot = bike(d, se)
    const n = d.notices.find((x) => x.bookingId === b.id && x.needsAction)
    if (n) {
      n.needsAction = false
      n.done = "Kept. You're booked."
    }
    return { ok: true, lateNow: lateWindow(b.start, now) } as const
  })
}
export function releaseHold(bookingId: string): Result {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (b?.status !== "held")
      return fail(
        "HOLD_EXPIRED",
        "Your hold ended. We offered the spot to the next person."
      )
    b.status = "cancelled"
    b.noStrike = true
    if (b.sessionId) d.opened[b.sessionId] = (d.opened[b.sessionId] ?? 0) - 1
    const n = d.notices.find((x) => x.bookingId === b.id && x.needsAction)
    if (n) {
      n.needsAction = false
      n.done = "Released."
    }
    return { ok: true } as const
  })
}

// ---------- court, lane, kids club, PT
export interface CourtInput {
  clubSlug: string
  sport: string
  court: number
  start: number
  duration: 60 | 90
  players: { name: string; memberId?: string; kind: "member" | "guest" }[]
}
export function reserveCourt(
  input: CourtInput
): Result<{ booking: Booking; guestPassesUsed: number }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.plan === "trailhead")
      return fail(
        "PLAN_REQUIRED",
        "Courts come with Ridge and Summit. Compare plans."
      )
    if (hh.status === "frozen")
      return fail("FROZEN", "Your membership is frozen. Resume to book.")
    if (d.pauses[me.id] && d.pauses[me.id] > now)
      return fail(
        "BOOKING_PAUSED",
        `Booking is paused until ${fmtDay(d.pauses[me.id])}.`
      )
    const end = input.start + input.duration * MIN
    const { blocks } = courtBlocks(
      d,
      input.clubSlug,
      input.sport,
      input.court,
      input.start
    )
    if (blocks.some((b) => b.from < end && b.to > input.start))
      return fail(
        "SLOT_TAKEN",
        `Court ${input.court} was just booked. Pick another time.`
      )
    const sameDay = d.bookings.find(
      (b) =>
        b.kind === "court" &&
        b.ownerId === me.id &&
        b.status === "booked" &&
        dayStart(b.start) === dayStart(input.start)
    )
    if (sameDay)
      return fail(
        "LIMIT_REACHED",
        `You already have a court on ${fmtDay(input.start)}. You can have one per day.`
      )
    if (
      d.bookings.filter(
        (b) =>
          b.kind === "court" &&
          b.ownerId === me.id &&
          b.status === "booked" &&
          b.start > now
      ).length >= 2
    )
      return fail(
        "LIMIT_REACHED",
        "You have 2 active court reservations. Cancel one to book another."
      )
    const guests = input.players.filter((p) => p.kind === "guest").length
    const { left } = guestPassesLeft(d, hh.id, now)
    const fromIncluded = Math.min(left, guests)
    const paid = guests - fromIncluded
    if (paid > 0) hh.guestPassesBought += paid
    if (paid > 0)
      hh.invoices.unshift({
        id: newId("INV"),
        date: now,
        desc: `Guest pass × ${paid}`,
        kind: "guest",
        amount: 20 * paid,
        status: "paid",
        lines: [{ label: `Guest pass × ${paid}`, amount: 20 * paid }],
      })
    for (const p of input.players.filter((x) => x.kind === "guest"))
      d.guestPasses.push({
        id: newId("g"),
        householdId: hh.id,
        guestName: p.name,
        contact: "",
        clubSlug: input.clubSlug,
        visitDate: dayStart(input.start),
        validUntil: input.start + 14 * DAY,
        status: "sent",
        bought:
          paid > 0 &&
          p === input.players.filter((x) => x.kind === "guest").at(-1),
        sentAt: now,
      })
    const b: Booking = {
      id: newId("b"),
      kind: "court",
      memberId: me.id,
      ownerId: me.id,
      status: "booked",
      createdAt: now,
      ref: refFor(`c${input.start}${input.court}${d.seq++}`),
      clubSlug: input.clubSlug,
      start: input.start,
      end,
      title: `${cap(input.sport)}, Court ${input.court}`,
      category: "court",
      place: `${CLUB_BY_SLUG[input.clubSlug].name}`,
      resource: `Court ${input.court}`,
      sport: input.sport,
      players: [
        {
          name: `${me.firstName} ${me.lastName}`,
          memberId: me.id,
          status: "confirmed",
        },
        ...input.players.map((p) => ({
          name: p.name,
          memberId: p.memberId,
          status: (p.kind === "guest" ? "guest" : "invited") as
            | "guest"
            | "invited",
        })),
      ],
    }
    d.bookings.push(b)
    for (const p of input.players)
      if (p.memberId && d.members[p.memberId])
        addNotice(
          d,
          {
            memberId: p.memberId,
            type: "court_invite",
            title: `${me.firstName} invited you to ${input.sport}`,
            body: `${fmtDowTime(input.start)}, ${CLUB_BY_SLUG[input.clubSlug].name}, Court ${input.court}.`,
            filter: "bookings",
          },
          now
        )
    return { ok: true, booking: b, guestPassesUsed: fromIncluded } as const
  })
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function reserveLane(input: {
  clubSlug: string
  lane: number
  start: number
  partnerName?: string
}): Result<{ booking: Booking }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.status === "frozen")
      return fail("FROZEN", "Your membership is frozen. Resume to book.")
    if (d.pauses[me.id] && d.pauses[me.id] > now)
      return fail(
        "BOOKING_PAUSED",
        `Booking is paused until ${fmtDay(d.pauses[me.id])}.`
      )
    if (
      me.role === "teen" &&
      (!d.members[me.id].permissions?.lanes || me.age < 14)
    )
      return fail("TEEN_APPROVAL", "Lap lanes need a parent's OK.")
    const { swimmers } = laneSwimmers(
      d,
      input.clubSlug,
      input.lane,
      input.start
    )
    if (swimmers >= 2)
      return fail(
        "SLOT_TAKEN",
        "That lane just filled. Pick another lane or time."
      )
    const clash = overlaps(d, me.id, input.start, input.start + 45 * MIN)
    if (clash)
      return fail(
        "CONFLICT_OVERLAP",
        `You're booked for ${clash.title} at ${fmtTime(clash.start)}`,
        { conflict: clash }
      )
    const b: Booking = {
      id: newId("b"),
      kind: "lane",
      memberId: me.id,
      ownerId: me.id,
      status: "booked",
      createdAt: now,
      ref: refFor(`l${input.start}${input.lane}${d.seq++}`),
      clubSlug: input.clubSlug,
      start: input.start,
      end: input.start + 45 * MIN,
      title: `Lane ${input.lane}`,
      category: "aqua",
      place: `${CLUB_BY_SLUG[input.clubSlug].name} · ${CLUB_BY_SLUG[input.clubSlug].pool?.label}`,
      resource: `Lane ${input.lane}`,
      players: input.partnerName
        ? [{ name: input.partnerName, status: "invited" }]
        : undefined,
    }
    d.bookings.push(b)
    return { ok: true, booking: b } as const
  })
}

export function bookKidsClub(input: {
  clubSlug: string
  childIds: string[]
  day: number
  blocks: string[]
}): Result<{ bookings: Booking[]; ref: string }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.status === "frozen")
      return fail("FROZEN", "Your membership is frozen. Resume to book.")
    const ref = refFor(`k${input.day}${input.childIds.join("")}${d.seq++}`)
    const out: Booking[] = []
    for (const bid of input.blocks) {
      const blk = KIDS_BLOCKS.find((k) => k.id === bid)!
      if (kidsLeft(d, input.clubSlug, input.day, blk) < input.childIds.length)
        return fail("SLOT_TAKEN", "That block just filled. Pick another time.")
      const start = atTime(input.day, blk.from)
      const end = atTime(input.day, blk.to)
      for (const cid of input.childIds) {
        if (
          d.bookings.filter(
            (b) =>
              b.kind === "kids" &&
              b.memberId === cid &&
              b.status === "booked" &&
              dayStart(b.start) === dayStart(start)
          ).length >= 2
        )
          return fail(
            "LIMIT_REACHED",
            `${d.members[cid].firstName} already has 2 blocks that day.`
          )
        const clash = overlaps(d, cid, start, end)
        if (clash)
          return fail(
            "CONFLICT_OVERLAP",
            `${d.members[cid].firstName} is booked for ${clash.title} at ${fmtTime(clash.start)}`,
            { conflict: clash }
          )
      }
      for (const cid of input.childIds) {
        const b: Booking = {
          id: newId("b"),
          kind: "kids",
          memberId: cid,
          ownerId: me.id,
          status: "booked",
          createdAt: now,
          ref,
          clubSlug: input.clubSlug,
          start,
          end,
          title: "Kids club",
          category: "youth",
          place: CLUB_BY_SLUG[input.clubSlug].name,
        }
        d.bookings.push(b)
        out.push(b)
      }
    }
    return { ok: true, bookings: out, ref } as const
  })
}
export function joinKidsWaitlist(input: {
  clubSlug: string
  childIds: string[]
  day: number
  blockId: string
}): Result {
  return mutate((d, now) => {
    const blk = KIDS_BLOCKS.find((k) => k.id === input.blockId)!
    for (const cid of input.childIds) {
      d.bookings.push({
        id: newId("b"),
        kind: "kids",
        memberId: cid,
        ownerId: d.currentMemberId,
        status: "waitlisted",
        createdAt: now,
        ref: refFor(`kw${cid}${input.day}`),
        clubSlug: input.clubSlug,
        start: atTime(input.day, blk.from),
        end: atTime(input.day, blk.to),
        title: "Kids club",
        category: "youth",
        place: CLUB_BY_SLUG[input.clubSlug].name,
        position: 1,
      })
    }
    return { ok: true } as const
  })
}

export function bookPT(input: {
  coachSlug: string
  start: number
  clubSlug: string
  pay: "credit" | "intro" | "single" | "pack"
  packSessions?: number
  note?: string
}): Result<{ booking: Booking; packLeft: number }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    const coach = COACH_BY_SLUG[input.coachSlug]
    if (!ptOpenSlots(d, input.coachSlug, now).includes(input.start))
      return fail("SLOT_TAKEN", "That time was just booked. Pick another time.")
    let payment = "Single session"
    if (input.pay === "credit") {
      if (!hh.ptPack || ptCreditsLeft(hh) <= 0)
        return fail("NO_CREDIT", "You have no pack credits left.")
      hh.ptPack.used += 1
      payment = `${hh.ptPack.total}-pack`
    } else if (input.pay === "intro") {
      if (hh.ptIntroLeft <= 0)
        return fail("NO_CREDIT", "No intro session is left this quarter.")
      hh.ptIntroLeft -= 1
      payment = "Summit intro session"
    } else if (input.pay === "single") {
      hh.invoices.unshift({
        id: newId("INV"),
        date: now,
        desc: `Training session with ${coach.name}`,
        kind: "training",
        amount: PT_PRICE,
        status: "paid",
        lines: [{ label: "Single session", amount: PT_PRICE }],
      })
    } else {
      const pack = PT_PACKS.find((p) => p.sessions === input.packSessions)
      if (!pack) return fail("UNKNOWN", "Pick a pack.")
      hh.invoices.unshift({
        id: newId("INV"),
        date: now,
        desc: `Training pack, ${pack.sessions} sessions`,
        kind: "training",
        amount: pack.price,
        status: "paid",
        lines: [
          {
            label: `Training pack, ${pack.sessions} sessions`,
            amount: pack.price,
          },
        ],
      })
      const carry = hh.ptPack ? ptCreditsLeft(hh) : 0
      hh.ptPack = {
        total: pack.sessions + carry,
        used: 1,
        expiresOn: now + 365 * DAY,
        coachSlug: input.coachSlug,
      }
      payment = `${pack.sessions}-pack`
    }
    const status: Booking["status"] =
      me.role === "teen" ? "pending_approval" : "booked"
    const b: Booking = {
      id: newId("b"),
      kind: "pt",
      memberId: me.id,
      ownerId: me.id,
      status,
      createdAt: now,
      ref: refFor(`p${input.start}${d.seq++}`),
      clubSlug: input.clubSlug,
      start: input.start,
      end: input.start + 45 * MIN,
      title: `Training with ${coach.name}`,
      category: "strength",
      place: CLUB_BY_SLUG[input.clubSlug].name,
      coachSlug: input.coachSlug,
      payment,
    }
    d.bookings.push(b)
    if (input.note) {
      let t = d.threads.find(
        (x) => x.memberId === me.id && x.with === `Coach ${coach.name}`
      )
      if (!t) {
        t = {
          id: newId("t"),
          memberId: me.id,
          with: `Coach ${coach.name}`,
          subject: `Your first session`,
          isMessage: true,
          messages: [],
        }
        d.threads.unshift(t)
      }
      t.messages.push({ from: "me", text: input.note, at: now })
    }
    if (status === "pending_approval" && me.parentId) {
      const id = newId("r")
      d.requests.push({
        id,
        teenId: me.id,
        parentId: me.parentId,
        title: `${b.title}, ${fmtDowTime(b.start)}`,
        at: now,
        status: "pending",
        expiresAt: now + 24 * HOUR,
      })
      addNotice(
        d,
        {
          memberId: me.parentId,
          type: "teen_request",
          title: `${me.firstName} asked to book ${b.title}`,
          body: `${fmtDowTime(b.start)} Approve?`,
          needsAction: true,
          actionLabel: "Approve",
          requestId: id,
          filter: "training",
        },
        now
      )
    }
    return {
      ok: true,
      booking: b,
      packLeft: hh.ptPack ? ptCreditsLeft(hh) : 0,
    } as const
  })
}

export function createTeenRequest(sessionId: string, note?: string): Result {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const se = sessionById(sessionId)
    if (!se || !me.parentId)
      return fail("NOT_FOUND", "We couldn't send that request.")
    const id = newId("r")
    d.requests.push({
      id,
      teenId: me.id,
      parentId: me.parentId,
      sessionId,
      title: `${se.name}, ${fmtDowTime(se.start)}`,
      note,
      at: now,
      status: "pending",
      expiresAt: now + 24 * HOUR,
    })
    d.bookings.push({
      id: newId("b"),
      kind: "class",
      memberId: me.id,
      ownerId: me.id,
      status: "pending_approval",
      createdAt: now,
      ref: refFor(`r${id}`),
      clubSlug: se.clubSlug,
      start: se.start,
      end: se.end,
      title: se.name,
      category: se.category,
      place: se.studio,
      sessionId,
    })
    addNotice(
      d,
      {
        memberId: me.parentId,
        type: "teen_request",
        title: `${me.firstName} asked to join ${se.name}`,
        body: `${fmtDowTime(se.start)} Approve?`,
        needsAction: true,
        actionLabel: "Approve",
        requestId: id,
        filter: "bookings",
      },
      now
    )
    return { ok: true } as const
  })
}
export function createTeenTitleRequest(title: string, note?: string): Result {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    if (!me.parentId) return fail("NOT_FOUND", "We couldn't send that request.")
    const id = newId("r")
    d.requests.push({
      id,
      teenId: me.id,
      parentId: me.parentId,
      title,
      note,
      at: now,
      status: "pending",
      expiresAt: now + 24 * HOUR,
    })
    addNotice(
      d,
      {
        memberId: me.parentId,
        type: "teen_request",
        title: `${me.firstName} asked to book ${title}`,
        body: "Approve?",
        needsAction: true,
        actionLabel: "Approve",
        requestId: id,
        filter: "bookings",
      },
      now
    )
    return { ok: true } as const
  })
}
export function resolveRequest(id: string, approve: boolean): Result {
  return mutate((d, now) => {
    const r = d.requests.find((x) => x.id === id)
    if (r?.status !== "pending")
      return fail("NOT_FOUND", "That request is no longer open.")
    r.status = approve ? "approved" : "declined"
    const pending = d.bookings.find(
      (b) =>
        b.memberId === r.teenId &&
        b.status === "pending_approval" &&
        (b.sessionId === r.sessionId ||
          (b.title && r.title.startsWith(b.title)))
    )
    if (pending) {
      if (approve) pending.status = "booked"
      else {
        pending.status = "cancelled"
        pending.noStrike = true
      }
    }
    const parent = d.members[r.parentId]
    addNotice(
      d,
      {
        memberId: r.teenId,
        type: "teen_request",
        title: approve
          ? `${parent.firstName} approved ${r.title}`
          : `${parent.firstName} said not this time.`,
        body: approve
          ? "You're booked."
          : "You can ask again for another class.",
        filter: "bookings",
      },
      now
    )
    for (const n of d.notices)
      if (n.requestId === id && n.needsAction) {
        n.needsAction = false
        n.done = approve ? "Approved." : "Declined."
      }
    return { ok: true } as const
  })
}
export function giveFeedback(
  bookingId: string,
  rating: "great" | "fine" | "not-for-me",
  note?: string
) {
  void note
  mutate((d) => {
    const b = d.bookings.find((x) => x.id === bookingId)
    if (b) b.feedbackDone = true
    for (const n of d.notices)
      if (n.bookingId === bookingId && n.type === "feedback") {
        n.needsAction = false
        n.done = `Thanks. We read every note. (${rating})`
      }
  })
}

// ---------- reservations cancel / move
export function moveReservation(
  id: string,
  patch: { start: number; resource?: string }
): Result {
  return mutate((d) => {
    const b = d.bookings.find((x) => x.id === id)
    if (!b) return fail("NOT_FOUND", "We couldn't find that reservation.")
    const len = b.end - b.start
    b.start = patch.start
    b.end = patch.start + len
    if (patch.resource) {
      b.resource = patch.resource
      b.title =
        b.kind === "court"
          ? `${cap(b.sport ?? "")}, ${patch.resource}`
          : patch.resource
    }
    return { ok: true } as const
  })
}

// ---------- notices and threads
export function markNoticeRead(id: string) {
  mutate((d, now) => {
    const n = d.notices.find((x) => x.id === id)
    if (n && !n.readAt) n.readAt = now
  })
}
export function markAllRead(): string[] {
  return mutate((d, now) => {
    const ids: string[] = []
    for (const n of d.notices)
      if (n.memberId === d.currentMemberId && !n.readAt) {
        n.readAt = now
        ids.push(n.id)
      }
    return ids
  })
}
export function unreadNotices(ids: string[]) {
  mutate((d) => {
    for (const n of d.notices) if (ids.includes(n.id)) n.readAt = undefined
  })
}
export function deleteNotice(id: string) {
  mutate((d) => {
    d.notices = d.notices.filter((n) => n.id !== id)
  })
}
export function sendMessage(threadId: string, text: string) {
  mutate((d, now) => {
    const t = d.threads.find((x) => x.id === threadId)
    if (!t) return
    t.messages.push({ from: "me", text, at: now })
  })
}
export function ensureThread(withName: string, subject: string): string {
  return mutate((d) => {
    let t = d.threads.find(
      (x) => x.memberId === d.currentMemberId && x.with === withName
    )
    if (!t) {
      t = {
        id: newId("t"),
        memberId: d.currentMemberId,
        with: withName,
        subject,
        isMessage: true,
        messages: [],
      }
      d.threads.unshift(t)
    }
    return t.id
  })
}

// ---------- membership
export function previewUpgrade(
  s: AppState,
  hh: Household,
  to: PlanId,
  now: number
) {
  const diff = PLANS[to].price - PLANS[hh.plan].price
  const { days, left, next } = daysInCycle(hh, now)
  const today = Math.round(((diff * left) / days) * 100) / 100
  return {
    diff,
    left,
    days,
    today,
    next,
    nextTotal: householdMonthly(s, hh, to).total,
  }
}
export function changePlan(
  to: PlanId,
  homeClub?: string
): Result<{ today: number; scheduled: boolean }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.status === "frozen")
      return fail("FROZEN", "Resume your membership first.")
    if (hh.status === "payment_failed")
      return fail("PAYMENT_BLOCK", "Fix your payment first.")
    if (PLANS[to].price > PLANS[hh.plan].price) {
      const p = previewUpgrade(d, hh, to, now)
      hh.plan = to
      delete hh.pendingPlan
      if (to === "summit") hh.ptIntroLeft = 1
      hh.invoices.unshift({
        id: newId("INV"),
        date: now,
        desc: `Plan change to ${PLANS[to].name}, prorated`,
        kind: "membership",
        amount: p.today,
        status: "paid",
        lines: [{ label: "Plan difference, prorated", amount: p.today }],
      })
      return { ok: true, today: p.today, scheduled: false } as const
    }
    hh.pendingPlan = { plan: to, on: nextBillingDate(hh, now), homeClub }
    return { ok: true, today: 0, scheduled: true } as const
  })
}
export function undoPlanChange() {
  mutate((d) => {
    const hh = householdOf(d, d.currentMemberId)
    delete hh.pendingPlan
  })
}
export function downgradeImpact(
  s: AppState,
  hh: Household,
  homeClub: string,
  now: number
) {
  const on = nextBillingDate(hh, now)
  const ids = householdMembers(s, hh.id).map((m) => m.id)
  const mine = s.bookings.filter(
    (b) =>
      ids.includes(b.memberId) &&
      ["booked", "waitlisted"].includes(b.status) &&
      b.start > on
  )
  return {
    other: mine.filter((b) => b.clubSlug !== homeClub && b.kind !== "court")
      .length,
    courts: mine.filter((b) => b.kind === "court").length,
    on,
  }
}
export function scheduleFreeze(months: 1 | 2 | 3, start: number): Result {
  return mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    if (hh.status === "payment_failed")
      return fail("PAYMENT_BLOCK", "Fix your payment first.")
    if (hh.status === "freeze_scheduled" || hh.status === "frozen")
      return fail("DUPLICATE", "You already have a freeze scheduled.")
    const p = parts(start)
    const resume = Date.UTC(p.y, p.m + months, p.d, 7, 0)
    hh.freeze = { start, months, end: resume - DAY, resume }
    hh.status = "freeze_scheduled"
    addNotice(
      d,
      {
        memberId: hh.primaryId,
        type: "billing",
        title: `Freeze set: ${fmtDayShort(start)} – ${fmtDayShort(resume - DAY)}`,
        body: "You can cancel it any time before it starts.",
        filter: "billing",
      },
      now
    )
    return { ok: true } as const
  })
}
export function cancelFreeze() {
  mutate((d) => {
    const hh = householdOf(d, d.currentMemberId)
    hh.status = "active"
    delete hh.freeze
  })
}
export function resumeCost(s: AppState, hh: Household, now: number) {
  const { days, left } = daysInCycle(hh, now)
  const total = householdMonthly(s, hh).total
  return {
    amount: Math.round(((total * left) / days) * 100) / 100,
    left,
    days,
    total,
  }
}
export function resumeEarly(): Result<{ amount: number }> {
  return mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    const c = resumeCost(d, hh, now)
    hh.status = "active"
    delete hh.freeze
    hh.invoices.unshift({
      id: newId("INV"),
      date: now,
      desc: "Resume early, rest of cycle",
      kind: "membership",
      amount: c.amount,
      status: "paid",
      lines: [{ label: "Rest of cycle", amount: c.amount }],
    })
    return { ok: true, amount: c.amount } as const
  })
}
export function cancelDate(hh: Household, now: number) {
  return billingDatesFrom(hh, now + 30 * DAY, 1)[0]
}
export function scheduleCancel(reason?: string): Result<{ on: number }> {
  void reason
  return mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    const on = cancelDate(hh, now)
    hh.status = "cancel_scheduled"
    hh.cancelOn = on
    delete hh.pendingPlan
    delete hh.freeze
    return { ok: true, on } as const
  })
}
export function keepMembership() {
  mutate((d) => {
    const hh = householdOf(d, d.currentMemberId)
    hh.status = "active"
    delete hh.cancelOn
  })
}
export function updateCard(
  card: Household["card"]
): Result<{ recovered: boolean }> {
  return mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    if (card.last4 === "0002")
      return fail(
        "PAYMENT_DECLINED",
        "Your bank declined this card. Try another card or call your bank."
      )
    hh.backupCard = hh.card
    hh.card = card
    let recovered = false
    if (hh.status === "payment_failed") {
      recovered = true
      payOpen(d, hh, now)
    }
    return { ok: true, recovered } as const
  })
}
function payOpen(d: AppState, hh: Household, now: number) {
  const total = householdMonthly(d, hh).total
  hh.status = "active"
  delete hh.paymentFailedAt
  const open = hh.invoices.find(
    (i) => i.status === "failed" || i.status === "open"
  )
  if (open) open.status = "paid"
  else
    hh.invoices.unshift({
      id: newId("INV"),
      date: now,
      desc: "Membership, retried payment",
      kind: "membership",
      amount: total,
      status: "paid",
      lines: [{ label: "Membership", amount: total }],
    })
}
export function retryPayment(): Result<{ amount: number }> {
  return mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    if (hh.status !== "payment_failed")
      return fail("UNKNOWN", "Nothing to pay.")
    const amount = householdMonthly(d, hh).total
    payOpen(d, hh, now)
    return { ok: true, amount } as const
  })
}
export function makeDefaultCard() {
  mutate((d) => {
    const hh = householdOf(d, d.currentMemberId)
    if (hh.backupCard) {
      const c = hh.card
      hh.card = hh.backupCard
      hh.backupCard = c
    }
  })
}
export function setBillingField(
  field: "billingName" | "billingAddress" | "receiptEmail",
  value: string
) {
  mutate((d) => {
    householdOf(d, d.currentMemberId)[field] = value
  })
}
export function changeHomeClub(memberId: string, slug: string): Result {
  return mutate((d, now) => {
    const hh = householdOf(d, memberId)
    if (hh.plan === "trailhead") {
      const { prev } = daysInCycle(hh, now)
      if (hh.homeClubChangedAt && hh.homeClubChangedAt >= prev)
        return fail(
          "LIMIT_REACHED",
          "Trailhead members can change home club once per billing cycle."
        )
      hh.homeClubChangedAt = now
      for (const m of householdMembers(d, hh.id)) m.homeClub = slug
    } else d.members[memberId].homeClub = slug
    d.prefs[memberId].viewingClub = slug
    return { ok: true } as const
  })
}

// ---------- family and guests
export function ageFrom(dob: string, now: number) {
  const [y, m, dd] = dob.split("-").map(Number)
  const p = parts(now)
  let a = p.y - y
  if (p.m + 1 < m || (p.m + 1 === m && p.d < dd)) a -= 1
  return a
}
export function addFamilyMember(input: {
  first: string
  last: string
  dob: string
  email?: string
  notes?: string
  kind: "adult" | "child"
  permissions?: Member["permissions"]
  pickup?: string[]
}): Result<{ member: Member; today: number; nextTotal: number }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.status === "frozen")
      return fail("FROZEN", "Resume your membership to add people.")
    const age = ageFrom(input.dob, now)
    const role = input.kind === "adult" ? "adult" : age >= 13 ? "teen" : "child"
    const id = newId("m")
    const price = role === "adult" ? ADULT_ADDON : CHILD_ADDON
    const { days, left } = daysInCycle(hh, now)
    const today = Math.round(((price * left) / days) * 100) / 100
    const m: Member = {
      id,
      householdId: hh.id,
      role,
      firstName: input.first,
      lastName: input.last,
      dob: input.dob,
      age,
      email: input.email ?? "",
      memberNumber: `CP-004-${((d.seq * 7) % 900) + 100}-${((d.seq * 13) % 900) + 100}`,
      homeClub: me.homeClub,
      status: role === "child" ? "active" : "invited",
      invitedAt: now,
      hue: (d.seq * 53) % 360,
      allergyNotes: input.notes,
      parentId: role === "teen" ? hh.primaryId : undefined,
      permissions:
        role === "teen"
          ? (input.permissions ?? {
              classes: true,
              courts: false,
              lanes: false,
              coachMessages: true,
            })
          : undefined,
      pickup: role === "child" ? (input.pickup ?? [hh.primaryId]) : undefined,
    }
    d.seq += 1
    d.members[id] = m
    d.prefs[id] = {
      ...structuredClone(d.prefs[me.id]),
      onboardingStep: role === "child" ? 6 : 1,
      passkeys: [],
      interests: [],
    }
    hh.invoices.unshift({
      id: newId("INV"),
      date: now,
      desc: `Add-on for ${input.first}, prorated`,
      kind: "membership",
      amount: today,
      status: "paid",
      lines: [
        {
          label: `${role === "adult" ? "Adult" : "Child"} add-on, ${left} of ${days} days`,
          amount: today,
        },
      ],
    })
    addNotice(
      d,
      {
        memberId: me.id,
        type: "club",
        title:
          role === "child"
            ? `${input.first} is on your plan`
            : `Invitation sent to ${input.first}`,
        body: `Adds $${price} per month.`,
        filter: "billing",
      },
      now
    )
    return {
      ok: true,
      member: m,
      today,
      nextTotal: householdMonthly(d, hh).total,
    } as const
  })
}
export function removeFamilyMember(id: string) {
  mutate((d, now) => {
    const m = d.members[id]
    const hh = householdOf(d, id)
    m.endsOn = nextBillingDate(hh, now)
    for (const b of d.bookings)
      if (
        b.memberId === id &&
        b.start > m.endsOn &&
        ["booked", "waitlisted"].includes(b.status)
      ) {
        b.status = "cancelled"
        b.noStrike = true
      }
  })
}
export function undoRemoveMember(id: string) {
  mutate((d) => {
    delete d.members[id].endsOn
  })
}
export function resendInvite(id: string) {
  mutate((d, now) => {
    d.members[id].status = "invited"
    d.members[id].invitedAt = now
  })
}
export function setTeenPermission(
  id: string,
  key: "classes" | "courts" | "lanes" | "coachMessages",
  on: boolean
) {
  mutate((d) => {
    const m = d.members[id]
    m.permissions = {
      classes: true,
      courts: false,
      lanes: false,
      coachMessages: true,
      ...m.permissions,
      [key]: on,
    }
  })
}
export function sendGuestPass(input: {
  name: string
  contact: string
  clubSlug: string
  visitDate: number
  message?: string
  count?: number
}): Result<{ passes: string[]; paid: number; validUntil: number }> {
  return mutate((d, now) => {
    const me = d.members[d.currentMemberId]
    const hh = householdOf(d, me.id)
    if (hh.status === "frozen")
      return fail("FROZEN", "Guest passes pause while frozen.")
    const isMember = Object.values(d.members).find(
      (m) =>
        (m.email && m.email === input.contact) ||
        `${m.firstName} ${m.lastName}`.toLowerCase() ===
          input.name.trim().toLowerCase()
    )
    if (isMember)
      return fail(
        "GUEST_IS_MEMBER",
        `${input.name} is already a member. They don't need a pass.`
      )
    const n = input.count ?? 1
    let { left } = guestPassesLeft(d, hh.id, now)
    let paid = 0
    const ids: string[] = []
    for (let i = 0; i < n; i++) {
      const bought = left <= 0
      if (bought) paid += 1
      else left -= 1
      const id = newId("g")
      ids.push(id)
      d.guestPasses.unshift({
        id,
        householdId: hh.id,
        guestName: input.name,
        contact: input.contact,
        clubSlug: input.clubSlug,
        visitDate: input.visitDate,
        validUntil: input.visitDate + 10 * DAY,
        status: "sent",
        bought,
        sentAt: now,
        message: input.message,
      })
    }
    if (paid) {
      hh.guestPassesBought += paid
      hh.invoices.unshift({
        id: newId("INV"),
        date: now,
        desc: "Guest pass",
        kind: "guest",
        amount: 20 * paid,
        status: "paid",
        lines: [{ label: `Guest pass × ${paid}`, amount: 20 * paid }],
      })
    }
    return {
      ok: true,
      passes: ids,
      paid,
      validUntil: input.visitDate + 10 * DAY,
    } as const
  })
}
export function cancelGuestPass(id: string) {
  mutate((d) => {
    const g = d.guestPasses.find((x) => x.id === id)
    if (g) g.status = "cancelled"
  })
}
export function editGuestContact(id: string, contact: string) {
  mutate((d) => {
    const g = d.guestPasses.find((x) => x.id === id)
    if (g) g.contact = contact
  })
}
export function resendGuestPass(id: string) {
  mutate((d, now) => {
    const g = d.guestPasses.find((x) => x.id === id)
    if (g) g.sentAt = now
  })
}

// ---------- calendar token, security, demo tools
export function resetCalendarToken() {
  mutate((d) => {
    d.prefs[d.currentMemberId].calendarToken =
      `tok_${Math.random().toString(36).slice(2, 12)}`
  })
}
export function addPasskey(name: string) {
  mutate((d) => {
    d.prefs[d.currentMemberId].passkeys.push(name)
  })
}
export function removePasskey(name: string) {
  mutate((d) => {
    const p = d.prefs[d.currentMemberId]
    p.passkeys = p.passkeys.filter((x) => x !== name)
  })
}
export function demoOpenWaitlistSpot(): boolean {
  return mutate((d, now) => {
    const w = d.bookings
      .filter(
        (b) =>
          b.memberId === d.currentMemberId &&
          b.status === "waitlisted" &&
          b.start - now > HOUR
      )
      .sort((a, b) => a.start - b.start)[0]
    if (!w?.sessionId) return false
    d.opened[w.sessionId] = (d.opened[w.sessionId] ?? 0) + 1
    promote(d, w.sessionId, now, true)
    return true
  })
}
export function demoJumpClock(ms: number) {
  mutate((d, now) => {
    d.clock.skew += ms
    advance(d, now + ms)
  })
}
export function demoPaymentFailed(daysAgo: number | null) {
  mutate((d, now) => {
    const hh = householdOf(d, d.currentMemberId)
    if (daysAgo === null) {
      payOpen(d, hh, now)
      return
    }
    hh.status = "payment_failed"
    hh.paymentFailedAt = now - daysAgo * DAY
    if (!hh.invoices.some((i) => i.status === "failed"))
      hh.invoices.unshift({
        id: newId("INV"),
        date: now - daysAgo * DAY,
        desc: "Membership, payment declined",
        kind: "membership",
        amount: householdMonthly(d, hh).total,
        status: "failed",
        lines: [{ label: "Membership", amount: householdMonthly(d, hh).total }],
      })
  })
}
// Puts this household back to the seeded demo on the server and restarts the demo clock.
export function demoReset() {
  return resetDemoData()
}
export function primaryName(s: AppState, id: string) {
  return primaryOf(s, id).firstName
}
void planOf
void courtCount
void fromKey
void fmtRange
