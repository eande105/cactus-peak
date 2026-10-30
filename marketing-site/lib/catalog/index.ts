// The catalog shape and pure helpers. Safe to import from server and client code.
import { dayInfo } from "@/lib/time"
import type {
  AmenityKey,
  Category,
  ClassType,
  Club,
  ClubQuote,
  ClubSlug,
  Coach,
  Faq,
  Job,
  JournalEntry,
  LegalPage,
  Pack,
  Plan,
  Prices,
  Session,
  Slot,
  Testimonial,
} from "@/lib/types"

export type CatalogData = {
  clubs: Club[]
  categories: Category[]
  classTypes: ClassType[]
  coaches: Coach[]
  slots: Slot[]
  plans: Plan[]
  packs: Pack[]
  comparison: { row: string; vals: [string, string, string] }[]
  prices: Prices
  faqs: Faq[]
  homeFaqs: Faq[]
  journal: JournalEntry[]
  jobs: Job[]
  legalPages: LegalPage[]
  testimonials: Testimonial[]
  clubQuotes: ClubQuote[]
  firstTimerShelf: string[]
  popularNow: string[]
  amenityFilters: { key: AmenityKey; label: string }[]
  journalCats: string[]
}

/** What the browser gets: the catalog without long article bodies, legal text and quotes. */
export type ClientCatalogData = Omit<
  CatalogData,
  "testimonials" | "clubQuotes" | "legalPages" | "homeFaqs" | "packs"
>
export function toClientData(d: CatalogData): ClientCatalogData {
  // Pick fields one by one: `d` can be a full Catalog, and its lookup functions cannot go to the browser.
  return {
    clubs: d.clubs,
    categories: d.categories,
    classTypes: d.classTypes,
    coaches: d.coaches,
    slots: d.slots,
    plans: d.plans,
    comparison: d.comparison,
    prices: d.prices,
    faqs: d.faqs,
    journal: d.journal.map((j) => ({ ...j, sections: [] })),
    jobs: d.jobs,
    firstTimerShelf: d.firstTimerShelf,
    popularNow: d.popularNow,
    amenityFilters: d.amenityFilters,
    journalCats: d.journalCats,
  }
}

export const runsAt = (c: ClassType, club: ClubSlug) =>
  c.clubs === "all" || c.clubs.includes(club)

export const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")

export type Lookups = ReturnType<typeof makeLookups>
export function makeLookups(
  d: Pick<
    CatalogData,
    "clubs" | "classTypes" | "coaches" | "categories" | "plans"
  >
) {
  const by = <T, K extends keyof T>(list: T[], key: K) =>
    new Map(list.map((x) => [x[key] as unknown as string, x]))
  const clubs = by(d.clubs, "slug")
  const classes = by(d.classTypes, "slug")
  const classKeys = by(d.classTypes, "key")
  const coachSlugs = by(d.coaches, "slug")
  const coachIds = by(d.coaches, "id")
  const coachNames = by(d.coaches, "name")
  const cats = by(d.categories, "id")
  const plans = by(d.plans, "slug")
  return {
    clubBySlug: (s: string | null | undefined) =>
      s ? clubs.get(s) : undefined,
    classBySlug: (s: string | null | undefined) =>
      s ? classes.get(s) : undefined,
    classByKey: (k: string) => classKeys.get(k),
    coachBySlug: (s: string | null | undefined) =>
      s ? coachSlugs.get(s) : undefined,
    coachById: (id: string) => coachIds.get(id),
    coachByName: (n: string | null | undefined) =>
      n ? coachNames.get(n) : undefined,
    categoryById: (id: string) => cats.get(id),
    planBySlug: (s: string | null | undefined) =>
      s ? plans.get(s) : undefined,
    classesIn: (cat: string) => d.classTypes.filter((c) => c.category === cat),
    /** Coaches with a public profile page. */
    profileCoaches: d.coaches.filter((c) => c.profile),
  }
}

export type Catalog = CatalogData & Lookups
export type ClientCatalog = ClientCatalogData & Lookups

/** Spot counts from the `session_counts` RPC, keyed by session id. */
export type SessionCounts = Record<
  string,
  { booked: number; waitlisted: number }
>

/** Dated sessions for `days` days from `today` (an Arizona day number), made from the weekly timetable. */
export function buildSessions(
  cat: Pick<Catalog, "slots" | "clubBySlug" | "classByKey" | "coachById">,
  today: number,
  counts?: SessionCounts,
  days = 7
): Session[] {
  const out: Session[] = []
  for (let i = 0; i < days; i++) {
    const d = dayInfo(i, today)
    for (const slot of cat.slots) {
      if (!slot.days.includes(d.weekday)) continue
      const ct = cat.classByKey(slot.classKey)
      const club = cat.clubBySlug(slot.club)
      if (!ct || !club) continue
      const coach = cat.coachById(slot.coachId)
      const hhmm = `${String(Math.floor(slot.start / 60)).padStart(2, "0")}${String(slot.start % 60).padStart(2, "0")}`
      const id = `${club.slug}~${d.iso}~${hhmm}~${ct.key}`
      const c = counts?.[id]
      out.push({
        id,
        classSlug: ct.slug,
        className: ct.name,
        category: ct.category,
        categoryName: ct.categoryName,
        duration: ct.duration,
        level: slot.level ?? ct.level,
        unit: ct.unit,
        clubSlug: club.slug,
        clubName: club.name,
        clubShort: club.short,
        day: i,
        date: d.iso,
        start: slot.start,
        room: slot.studio,
        coach: coach?.name ?? null,
        coachSlug: coach?.slug ?? null,
        capacity: ct.capacity,
        left: Math.max(0, ct.capacity - (c?.booked ?? 0)),
        waitlist: c?.waitlisted ?? 0,
      })
    }
  }
  return out.sort(
    (a, b) =>
      a.day - b.day || a.start - b.start || a.clubSlug.localeCompare(b.clubSlug)
  )
}

export function filterSessions(
  sessions: Session[],
  opts: {
    club?: ClubSlug | "all"
    day?: number
    category?: string
    classSlug?: string
    coach?: string
  }
) {
  return sessions.filter(
    (s) =>
      (!opts.club || opts.club === "all" || s.clubSlug === opts.club) &&
      (opts.day === undefined || s.day === opts.day) &&
      (!opts.classSlug || s.classSlug === opts.classSlug) &&
      (!opts.coach || s.coach === opts.coach) &&
      (!opts.category || s.category === opts.category)
  )
}
