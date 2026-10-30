// Converts between the household rows in Supabase and the in-memory AppState the rules engine uses.
// The app keeps epoch milliseconds; the database keeps timestamptz. The conversion happens only here.
import type { AppState } from "@/lib/data/state"
import type { Json, Tables, TablesInsert } from "@/lib/supabase/database.types"
import { DEMO_START } from "@/lib/time"
import type {
  Booking,
  CategoryId,
  GuestPass,
  Household,
  Invoice,
  Member,
  MemberPrefs,
  Notice,
  PlanId,
  Strike,
  TeenRequest,
  Thread,
  Visit,
} from "@/lib/types"

// Parents before children, so inserts never break a foreign key. Deletes run in reverse.
export const HOUSEHOLD_TABLES = [
  "households",
  "members",
  "invoices",
  "bookings",
  "strikes",
  "notices",
  "message_threads",
  "teen_requests",
  "guest_passes",
  "visits",
] as const
export type HouseholdTable = (typeof HOUSEHOLD_TABLES)[number]

export type DbRows = { [K in HouseholdTable]: Tables<K>[] }
// What the app writes: insert rows keyed by their primary key (visits: member and time).
export type WriteRows = {
  [K in HouseholdTable]: Record<string, TablesInsert<K>>
}

const ts = (ms: number | undefined | null) =>
  ms == null ? null : new Date(ms).toISOString()
const ms = (v: string | null | undefined) =>
  v == null ? undefined : Date.parse(v)
const opt = <T>(v: T | null | undefined) => (v == null ? undefined : v)
const json = (v: unknown) => (v === undefined ? null : (v as Json))

// JSON with sorted keys, so two rows with the same content compare equal.
export function stableStringify(v: unknown): string {
  if (v === undefined) return "null"
  if (v === null || typeof v !== "object") return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`)
    .join(",")}}`
}

export function rowKey(table: HouseholdTable, row: Record<string, unknown>) {
  return table === "visits" ? `${row.member_id}|${row.at}` : String(row.id)
}

// Age on the demo calendar, which starts Oct 27, 2026.
export function ageOn(dob: string, at = DEMO_START) {
  const [y, m, d] = dob.split("-").map(Number)
  const now = new Date(at - 7 * 3600_000)
  let age = now.getUTCFullYear() - y
  const mm = now.getUTCMonth() + 1
  if (mm < m || (mm === m && now.getUTCDate() < d)) age--
  return age
}

const ROLE_ORDER = { primary: 0, adult: 1, teen: 2, child: 3 } as const

// ---------- database → state

export function stateFromRows(
  db: DbRows,
  currentMemberId: string
): Omit<AppState, "clock" | "others"> {
  const hh = db.households[0]
  if (!hh) throw new Error("No household for this member.")
  const members: AppState["members"] = {}
  const prefs: AppState["prefs"] = {}
  const stats: AppState["stats"] = {}
  const pauses: AppState["pauses"] = {}
  const sorted = [...db.members].sort(
    (a, b) =>
      ROLE_ORDER[a.role as Member["role"]] -
        ROLE_ORDER[b.role as Member["role"]] || a.dob.localeCompare(b.dob)
  )
  for (const m of sorted) {
    members[m.id] = {
      id: m.id,
      householdId: m.household_id,
      role: m.role as Member["role"],
      firstName: m.first_name,
      lastName: m.last_name,
      dob: m.dob,
      age: ageOn(m.dob),
      email: m.email,
      memberNumber: m.member_number,
      homeClub: m.home_club,
      parentId: opt(m.parent_id),
      allergyNotes: opt(m.allergy_notes),
      status: m.status as Member["status"],
      endsOn: ms(m.ends_on),
      invitedAt: ms(m.invited_at),
      permissions: opt(m.permissions) as Member["permissions"],
      pickup: opt(m.pickup),
      hue: m.hue,
    }
    prefs[m.id] = m.prefs as unknown as MemberPrefs
    stats[m.id] = {
      streakWeeks: m.streak_weeks,
      lifetime: m.lifetime_visits,
      longest: m.longest_streak,
    }
    const p = ms(m.paused_until)
    if (p) pauses[m.id] = p
  }

  const invoices: Invoice[] = db.invoices
    .map((v) => ({
      id: v.id,
      date: Date.parse(v.issued_at),
      desc: v.description,
      kind: v.kind as Invoice["kind"],
      amount: Number(v.amount),
      status: v.status as Invoice["status"],
      lines: v.lines as Invoice["lines"],
    }))
    .sort((a, b) => b.date - a.date)

  const household: Household = {
    id: hh.id,
    primaryId: hh.primary_member_id,
    plan: hh.plan_id as PlanId,
    billingDay: hh.billing_day,
    memberSince: Date.parse(hh.member_since),
    status: hh.status as Household["status"],
    freeze: opt(hh.freeze_window) as Household["freeze"],
    cancelOn: ms(hh.cancel_on),
    pendingPlan: opt(hh.pending_plan) as Household["pendingPlan"],
    card: hh.card as unknown as Household["card"],
    backupCard: opt(hh.backup_card) as Household["backupCard"],
    paymentFailedAt: ms(hh.payment_failed_at),
    invoices,
    ptPack: opt(hh.pt_pack) as Household["ptPack"],
    ptIntroLeft: hh.pt_intro_left,
    guestPassesBought: hh.guest_passes_bought,
    billingName: hh.billing_name,
    billingAddress: hh.billing_address,
    receiptEmail: hh.receipt_email,
    homeClubChangedAt: ms(hh.home_club_changed_at),
  }

  const bookings: Booking[] = db.bookings
    .map((b) => ({
      id: b.id,
      kind: b.kind as Booking["kind"],
      memberId: b.member_id,
      ownerId: b.owner_id,
      status: b.status as Booking["status"],
      createdAt: Date.parse(b.created_at),
      ref: b.ref,
      clubSlug: b.club_slug,
      start: Date.parse(b.starts_at),
      end: Date.parse(b.ends_at),
      title: b.title,
      category: b.category_id as CategoryId,
      place: b.place,
      sessionId: opt(b.session_id),
      spot: opt(b.spot),
      position: opt(b.waitlist_position),
      holdExpiresAt: ms(b.hold_expires_at),
      resource: opt(b.resource),
      sport: opt(b.sport),
      players: opt(b.players) as Booking["players"],
      children: opt(b.children),
      coachSlug: opt(b.coach_slug),
      payment: opt(b.payment),
      feedbackDone: b.feedback_done || undefined,
      cancelledAt: ms(b.cancelled_at),
      noStrike: b.no_strike || undefined,
    }))
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))

  const strikes: Strike[] = db.strikes
    .map((s) => ({
      id: s.id,
      memberId: s.member_id,
      at: Date.parse(s.at),
      bookingId: opt(s.booking_id),
      title: s.title,
    }))
    .sort((a, b) => a.at - b.at)

  const notices: Notice[] = db.notices
    .map((n) => ({
      id: n.id,
      memberId: n.member_id,
      type: n.type as Notice["type"],
      title: n.title,
      body: n.body,
      at: Date.parse(n.at),
      readAt: ms(n.read_at),
      needsAction: n.needs_action || undefined,
      actionLabel: opt(n.action_label),
      bookingId: opt(n.booking_id),
      requestId: opt(n.request_id),
      threadId: opt(n.thread_id),
      filter: n.filter as Notice["filter"],
      done: opt(n.done),
    }))
    .sort((a, b) => b.at - a.at || b.id.localeCompare(a.id))

  const threads: Thread[] = db.message_threads.map((t) => ({
    id: t.id,
    memberId: t.member_id,
    with: t.with_name,
    subject: t.subject,
    messages: t.messages as Thread["messages"],
    isMessage: true,
  }))

  const requests: TeenRequest[] = db.teen_requests
    .map((r) => ({
      id: r.id,
      teenId: r.teen_id,
      parentId: r.parent_id,
      sessionId: opt(r.session_id),
      title: r.title,
      note: opt(r.note),
      at: Date.parse(r.at),
      status: r.status as TeenRequest["status"],
      expiresAt: Date.parse(r.expires_at),
    }))
    .sort((a, b) => b.at - a.at)

  const guestPasses: GuestPass[] = db.guest_passes
    .map((g) => ({
      id: g.id,
      householdId: g.household_id,
      guestName: g.guest_name,
      contact: g.contact,
      clubSlug: g.club_slug,
      visitDate: Date.parse(g.visit_date),
      validUntil: Date.parse(g.valid_until),
      status: g.status as GuestPass["status"],
      bought: g.bought,
      usedOn: ms(g.used_on),
      message: opt(g.message),
      sentAt: Date.parse(g.sent_at),
    }))
    .sort((a, b) => b.sentAt - a.sentAt)

  const visits: Visit[] = db.visits
    .map((v) => ({
      memberId: v.member_id,
      clubSlug: v.club_slug,
      at: Date.parse(v.at),
      category: opt(v.category_id) as CategoryId | undefined,
    }))
    .sort((a, b) => a.at - b.at)

  return {
    v: 5,
    signedIn: true,
    currentMemberId,
    members,
    households: { [hh.id]: household },
    bookings,
    strikes,
    pauses,
    notices,
    threads,
    requests,
    guestPasses,
    visits,
    prefs,
    stats,
    dismissed: hh.dismissed as unknown as AppState["dismissed"],
    remind: hh.remind,
    opened: hh.opened as AppState["opened"],
    seq: hh.seq,
  }
}

// ---------- state → database

export function rowsFromState(s: AppState): WriteRows {
  const out: WriteRows = {
    households: {},
    members: {},
    invoices: {},
    bookings: {},
    strikes: {},
    notices: {},
    message_threads: {},
    teen_requests: {},
    guest_passes: {},
    visits: {},
  }
  const hhOf = (memberId: string) => s.members[memberId]?.householdId
  const put = <K extends HouseholdTable>(t: K, row: TablesInsert<K>) => {
    ;(out[t] as Record<string, TablesInsert<K>>)[
      rowKey(t, row as Record<string, unknown>)
    ] = row
  }

  for (const h of Object.values(s.households)) {
    put("households", {
      id: h.id,
      primary_member_id: h.primaryId,
      plan_id: h.plan,
      billing_day: h.billingDay,
      member_since: ts(h.memberSince)!,
      status: h.status,
      freeze_window: json(h.freeze),
      cancel_on: ts(h.cancelOn),
      pending_plan: json(h.pendingPlan),
      card: json(h.card)!,
      backup_card: json(h.backupCard),
      payment_failed_at: ts(h.paymentFailedAt),
      pt_pack: json(h.ptPack),
      pt_intro_left: h.ptIntroLeft,
      guest_passes_bought: h.guestPassesBought,
      billing_name: h.billingName,
      billing_address: h.billingAddress,
      receipt_email: h.receiptEmail,
      home_club_changed_at: ts(h.homeClubChangedAt),
      dismissed: json(s.dismissed)!,
      remind: s.remind,
      opened: json(s.opened)!,
      seq: s.seq,
    })
    for (const v of h.invoices)
      put("invoices", {
        id: v.id,
        household_id: h.id,
        issued_at: ts(v.date)!,
        description: v.desc,
        kind: v.kind,
        amount: v.amount,
        status: v.status,
        lines: json(v.lines)!,
      })
  }

  // auth_user_id is never written from the app. The database guards it too.
  for (const m of Object.values(s.members)) {
    const st = s.stats[m.id]
    put("members", {
      id: m.id,
      household_id: m.householdId,
      role: m.role,
      first_name: m.firstName,
      last_name: m.lastName,
      dob: m.dob,
      email: m.email,
      member_number: m.memberNumber,
      home_club: m.homeClub,
      parent_id: m.parentId ?? null,
      allergy_notes: m.allergyNotes ?? null,
      status: m.status,
      ends_on: ts(m.endsOn),
      invited_at: ts(m.invitedAt),
      permissions: json(m.permissions),
      pickup: m.pickup ?? null,
      hue: m.hue,
      paused_until: ts(s.pauses[m.id]),
      streak_weeks: st?.streakWeeks ?? 0,
      lifetime_visits: st?.lifetime ?? 0,
      longest_streak: st?.longest ?? 0,
      prefs: json(s.prefs[m.id] ?? {})!,
    })
  }

  for (const b of s.bookings)
    put("bookings", {
      id: b.id,
      household_id: hhOf(b.ownerId) ?? hhOf(b.memberId),
      kind: b.kind,
      member_id: b.memberId,
      owner_id: b.ownerId,
      status: b.status,
      ref: b.ref,
      club_slug: b.clubSlug,
      starts_at: ts(b.start)!,
      ends_at: ts(b.end)!,
      title: b.title,
      category_id: b.category,
      place: b.place,
      session_id: b.sessionId ?? null,
      spot: b.spot ?? null,
      waitlist_position: b.position ?? null,
      hold_expires_at: ts(b.holdExpiresAt),
      resource: b.resource ?? null,
      sport: b.sport ?? null,
      players: json(b.players),
      children: b.children ?? null,
      coach_slug: b.coachSlug ?? null,
      payment: b.payment ?? null,
      feedback_done: !!b.feedbackDone,
      cancelled_at: ts(b.cancelledAt),
      no_strike: !!b.noStrike,
      created_at: ts(b.createdAt)!,
    })

  for (const k of s.strikes)
    put("strikes", {
      id: k.id,
      household_id: hhOf(k.memberId),
      member_id: k.memberId,
      at: ts(k.at)!,
      booking_id: k.bookingId ?? null,
      title: k.title,
    })

  for (const n of s.notices)
    put("notices", {
      id: n.id,
      household_id: hhOf(n.memberId),
      member_id: n.memberId,
      type: n.type,
      title: n.title,
      body: n.body,
      at: ts(n.at)!,
      read_at: ts(n.readAt),
      needs_action: !!n.needsAction,
      action_label: n.actionLabel ?? null,
      booking_id: n.bookingId ?? null,
      request_id: n.requestId ?? null,
      thread_id: n.threadId ?? null,
      filter: n.filter,
      done: n.done ?? null,
    })

  for (const t of s.threads)
    put("message_threads", {
      id: t.id,
      household_id: hhOf(t.memberId),
      member_id: t.memberId,
      with_name: t.with,
      subject: t.subject,
      messages: json(t.messages)!,
    })

  for (const r of s.requests)
    put("teen_requests", {
      id: r.id,
      household_id: hhOf(r.teenId),
      teen_id: r.teenId,
      parent_id: r.parentId,
      session_id: r.sessionId ?? null,
      title: r.title,
      note: r.note ?? null,
      at: ts(r.at)!,
      status: r.status,
      expires_at: ts(r.expiresAt)!,
    })

  for (const g of s.guestPasses)
    put("guest_passes", {
      id: g.id,
      household_id: g.householdId,
      guest_name: g.guestName,
      contact: g.contact,
      club_slug: g.clubSlug,
      visit_date: ts(g.visitDate)!,
      valid_until: ts(g.validUntil)!,
      status: g.status,
      bought: g.bought,
      used_on: ts(g.usedOn),
      message: g.message ?? null,
      sent_at: ts(g.sentAt)!,
    })

  for (const v of s.visits)
    put("visits", {
      household_id: hhOf(v.memberId),
      member_id: v.memberId,
      club_slug: v.clubSlug,
      at: ts(v.at)!,
      category_id: v.category ?? null,
    })

  return out
}

export type TableDiff<K extends HouseholdTable> = {
  upserts: TablesInsert<K>[]
  deletes: string[]
}
export type RowDiff = { [K in HouseholdTable]: TableDiff<K> }

// Rows that changed or appeared, and keys that went away.
export function diffRows(before: WriteRows, after: WriteRows): RowDiff {
  const out = {} as RowDiff
  for (const t of HOUSEHOLD_TABLES) {
    const a = before[t] as Record<string, unknown>
    const b = after[t] as Record<string, unknown>
    const upserts: unknown[] = []
    const deletes: string[] = []
    for (const [k, row] of Object.entries(b))
      if (!(k in a) || stableStringify(a[k]) !== stableStringify(row))
        upserts.push(row)
    for (const k of Object.keys(a)) if (!(k in b)) deletes.push(k)
    ;(out as Record<string, unknown>)[t] = { upserts, deletes }
  }
  return out
}

export const isEmptyDiff = (d: RowDiff) =>
  HOUSEHOLD_TABLES.every(
    (t) => d[t].upserts.length === 0 && d[t].deletes.length === 0
  )
