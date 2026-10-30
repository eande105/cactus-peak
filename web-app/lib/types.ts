export type CategoryId =
  | "strength"
  | "cycle"
  | "conditioning"
  | "mind-body"
  | "aqua"
  | "court"
  | "recovery"
  | "youth"
export type PlanId = "trailhead" | "ridge" | "summit"
export type Role = "primary" | "adult" | "teen" | "child"
export type Scene =
  | "portrait"
  | "dawn"
  | "pool"
  | "studio"
  | "court"
  | "lift"
  | "deck"
  | "kids"
  | "recovery"
  | "outdoor-pool"
  | "rooftop"

export interface Club {
  id: string
  slug: string
  name: string
  city: "Mesa" | "Gilbert"
  neighborhood: string
  address: string
  type: string
  sqft: number
  personality: string
  phone: string
  zip: string
  amenities: string[]
  pool: null | {
    label: string
    lanes: number
    unit: "yd" | "m"
    outdoor?: boolean
    therapy?: boolean
  }
  courts: { sport: "pickleball" | "tennis" | "basketball"; count: number }[]
  kidsClub: boolean
  recovery: "suite" | "lounge" | "none"
  scene: Scene
  photo: string
  parking: string
  lat: number
  lng: number
  typical: number[] // levels 1-5 for 4 a.m. through 9 p.m. (18 values), weekdays
  weekend: number[]
  studios: string[]
}

export interface Instructor {
  id: string
  name: string
  role: string
  years: number
  clubs: string[]
}

export interface Coach {
  id: string
  slug: string
  name: string
  specialties: string[]
  tags: string[]
  clubs: string[]
  since: number
  about: string
  goodFor: string[]
  firstSession: string[]
  openTimes: { dow: number; time: string }[]
}

export interface ClassType {
  key: string
  name: string
  category: CategoryId
  duration: number
  intensity: number
  capacity: number
  unit: "bikes" | "spots" | "mats" | "lanes"
  firstTimerOk: boolean
  teenOk: boolean
  minAge: number
  about: string
  bring: string[]
  equipmentNote?: string
}

export interface Session {
  id: string
  clubSlug: string
  typeKey: string
  name: string
  category: CategoryId
  studio: string
  start: number
  end: number
  duration: number
  instructorId: string
  intensity: number
  capacity: number
  baseBooked: number
  baseWaitlist: number
  unit: ClassType["unit"]
  firstTimerOk: boolean
  teenOk: boolean
  minAge: number
  about: string
  bring: string[]
  seriesKey: string
}

export type BookingKind = "class" | "court" | "lane" | "kids" | "pt"
export type BookingStatus =
  | "booked"
  | "held"
  | "waitlisted"
  | "cancelled"
  | "late_cancelled"
  | "attended"
  | "no_show"
  | "pending_approval"

export interface Booking {
  id: string
  kind: BookingKind
  memberId: string // who the booking is for (class) or owner (reservation)
  ownerId: string // who made it
  status: BookingStatus
  createdAt: number
  ref: string
  clubSlug: string
  start: number
  end: number
  title: string
  category: CategoryId
  place: string
  // class
  sessionId?: string
  spot?: string
  position?: number
  holdExpiresAt?: number
  // reservations
  resource?: string // "Court 3", "Lane 3"
  sport?: string
  players?: {
    name: string
    memberId?: string
    status: "confirmed" | "invited" | "guest"
  }[]
  children?: string[] // kids club member ids
  coachSlug?: string
  payment?: string
  feedbackDone?: boolean
  cancelledAt?: number
  noStrike?: boolean
}

export interface Member {
  id: string
  householdId: string
  role: Role
  firstName: string
  lastName: string
  dob: string
  age: number
  email: string
  memberNumber: string
  homeClub: string
  parentId?: string
  allergyNotes?: string
  status: "active" | "invited" | "invite_expired"
  endsOn?: number
  invitedAt?: number
  permissions?: {
    classes: boolean
    courts: boolean
    lanes: boolean
    coachMessages: boolean
  }
  pickup?: string[]
  hue: number
}

export interface Strike {
  id: string
  memberId: string
  at: number
  bookingId?: string
  title: string
}

export interface Invoice {
  id: string
  date: number
  desc: string
  kind: "membership" | "training" | "guest" | "fee"
  amount: number
  status: "paid" | "open" | "failed" | "refunded"
  lines: { label: string; amount: number }[]
}

export interface Household {
  id: string
  primaryId: string
  plan: PlanId
  billingDay: number
  memberSince: number
  status:
    | "active"
    | "frozen"
    | "freeze_scheduled"
    | "payment_failed"
    | "cancel_scheduled"
  freeze?: { start: number; months: 1 | 2 | 3; end: number; resume: number }
  cancelOn?: number
  pendingPlan?: { plan: PlanId; on: number; homeClub?: string }
  card: {
    brand: "visa" | "mastercard" | "amex" | "discover"
    last4: string
    expMonth: number
    expYear: number
  }
  backupCard?: {
    brand: "visa" | "mastercard" | "amex" | "discover"
    last4: string
    expMonth: number
    expYear: number
  }
  paymentFailedAt?: number
  invoices: Invoice[]
  ptPack?: {
    total: number
    used: number
    expiresOn: number
    coachSlug?: string
  }
  ptIntroLeft: number
  guestPassesBought: number
  billingName: string
  billingAddress: string
  receiptEmail: string
  homeClubChangedAt?: number
}

export interface GuestPass {
  id: string
  householdId: string
  guestName: string
  contact: string
  clubSlug: string
  visitDate: number
  validUntil: number
  status: "sent" | "opened" | "used" | "expired" | "cancelled"
  bought: boolean
  usedOn?: number
  message?: string
  sentAt: number
}

export interface Notice {
  id: string
  memberId: string
  type:
    | "hold"
    | "booked"
    | "card"
    | "coach"
    | "teen_request"
    | "late_cancel"
    | "feedback"
    | "club"
    | "court_invite"
    | "billing"
    | "waitlist"
  title: string
  body: string
  at: number
  readAt?: number
  needsAction?: boolean
  actionLabel?: string
  bookingId?: string
  requestId?: string
  threadId?: string
  filter: "bookings" | "billing" | "news" | "training"
  done?: string
}

export interface Thread {
  id: string
  memberId: string
  with: string
  subject: string
  messages: { from: "me" | "them"; text: string; at: number }[]
  isMessage: true
}

export interface TeenRequest {
  id: string
  teenId: string
  parentId: string
  sessionId?: string
  title: string
  note?: string
  at: number
  status: "pending" | "approved" | "declined"
  expiresAt: number
}

export interface Visit {
  memberId: string
  clubSlug: string
  at: number
  category?: CategoryId
}

export interface MemberPrefs {
  viewingClub: string
  interests: CategoryId[]
  firstTimersFirst: boolean
  goal: string
  weeklyTarget: number
  onboardingStep: number // 6 = done
  notif: Record<string, { push: boolean; email: boolean; text: boolean }>
  reminderMin: 30 | 60 | 120
  quietHours: boolean
  calendarToken: string
  calIncludeHousehold: boolean
  calIncludeKids: boolean
  theme: "system" | "light" | "dark"
  motion: "system" | "reduce"
  textSize: "default" | "large"
  savedFilters?: string
  passkeys: string[]
  phone: string
  preferredName: string
  emergency: string
  marketing: boolean
  remindWindows: string[]
}

export interface Dismissals {
  promo: number // sim ms when dismissed
  passkeyCard: boolean
  onboardingBanner: boolean
}
