// App shapes for the catalog. lib/catalog/map.ts makes them from the Supabase rows.

export type CategoryId =
  | "strength"
  | "cycle"
  | "conditioning"
  | "mind-body"
  | "aqua"
  | "court"
  | "recovery"
  | "youth"
/** A club slug from the `clubs` table ("mesa-dobson"). */
export type ClubSlug = string
export type Level = 1 | 2 | 3 | 4 | 5
export type AmenityKey =
  | "pool"
  | "courts"
  | "cycling"
  | "kids"
  | "recovery"
  | "classes"

export type Club = {
  slug: ClubSlug
  /** 1-based position in the club list (map pin number). */
  n: number
  name: string
  short: string
  city: string
  type: "Flagship" | "Full club" | "Studio club"
  sqFt: number
  cross: string
  zip: string
  phone: string
  tel: string
  personality: string
  intro: string
  amenities: string[]
  signature: string[]
  has: Record<AmenityKey, boolean>
  /** position on the stylised SVG map, 0-100 */
  map: { x: number; y: number }
  lat: number
  lng: number
  /** Distance shown before the visitor shares a location. */
  miles: number
  photo: string
  tone: PhotoTone
  opened: number
  parking: string
  access: string
  lanes?: number
  pool?: {
    label: string
    lanes: number
    unit: "yd" | "m"
    outdoor?: boolean
    therapy?: boolean
  }
  recovery: "suite" | "lounge" | "none"
  courts?: { pickleball?: number; tennis?: number; basketball?: number }
  studios: number
  busyness: Level
  extras: string
  /** Typical busyness 1-5 by hour, 4 a.m. to 9 p.m. */
  typicalWeekday: number[]
  typicalWeekend: number[]
}

export type PhotoTone =
  | "copper"
  | "night"
  | "sage"
  | "teal"
  | "gold"
  | "plum"
  | "sand"
  | "rose"

export type Category = {
  id: CategoryId
  name: string
  tagline: string
  count: number
  intensity: [Level, Level]
  examples: string
  lede: string
  heroCaption: string
}

export type ClassType = {
  /** Short key the timetable uses ("rrs"). */
  key: string
  slug: string
  name: string
  category: CategoryId
  categoryName: string
  blurb: string
  description: string
  duration: number
  intensity: [Level, Level]
  /** One level for a single session. */
  level: Level
  capacity: number
  unit: "bikes" | "spots" | "mats" | "lanes"
  bookable: boolean
  firstTimer: boolean
  group: string
  gear: string
  bring: string[]
  clubs: ClubSlug[] | "all"
  teen?: boolean
  caption: string
  pick: string
}

export type Coach = {
  id: string
  slug: string
  name: string
  first: string
  credential: string
  specialties: string[]
  clubs: ClubSlug[]
  teaches: string[]
  favorite: string
  bio: string
  quote: string
  years: number | null
  pt: boolean
  tone: PhotoTone
  /** The coach has a public profile page (a bio). */
  profile: boolean
}

/** One weekly timetable row from `class_schedules`. */
export type Slot = {
  club: ClubSlug
  classKey: string
  /** Minutes after midnight, Arizona time. */
  start: number
  /** 0 = Sunday. */
  days: number[]
  studio: string
  coachId: string
  level: Level | null
}

/** A dated class from a Slot. */
export type Session = {
  /** "<club_slug>~YYYY-MM-DD~HHMM~<class_key>", the same id the member apps use. */
  id: string
  classSlug: string
  className: string
  category: CategoryId
  categoryName: string
  duration: number
  level: Level
  unit: ClassType["unit"]
  clubSlug: ClubSlug
  clubName: string
  clubShort: string
  /** Days from today (0 = today). */
  day: number
  /** "YYYY-MM-DD" in Arizona. */
  date: string
  start: number // minutes
  room: string
  coach: string | null
  coachSlug: string | null
  capacity: number
  /** Spots left. Equal to capacity until the live counts load. */
  left: number
  waitlist: number
}

export type Plan = {
  slug: "trailhead" | "ridge" | "summit"
  name: string
  price: number
  ribs: Level
  badge?: string
  bestFor: string
  features: string[]
  compact: string[]
}

export type Faq = {
  id: string
  q: string
  a: string
  group: string
}

export type JournalEntry = {
  slug: string
  title: string
  dek: string
  cat: string
  /** Author coach slug. */
  author: string
  /** "Oct 12, 2026" */
  date: string
  iso: string
  min: number
  tone: PhotoTone
  caption: string
  cls: string
  sections: [string, string][]
}

export type Job = {
  slug: string
  title: string
  club: string
  dept: string
  type: string
  pay: string
}

export type Testimonial = {
  quote: string
  who: string
  goal: string
  club: string
  caption: string
}
export type ClubQuote = { quote: string; who: string; goal: string }
export type LegalPage = { slug: string; title: string; short?: boolean }
export type Pack = { n: number; price: number; each: number }
export type Prices = {
  adult: number
  child: number
  ptSingle: number
  dayPass: number
  enrollment: number
  facilityFee: number
  freeze: number
}
