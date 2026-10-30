// Turns Supabase catalog rows into the app shapes in lib/types.ts. Pure functions, no I/O.
import type { Json, Tables } from "@/lib/supabase/database.types"
import { fmtDateOnly, timeToMinutes } from "@/lib/time"
import type {
  AmenityKey,
  Category,
  CategoryId,
  ClassType,
  Club,
  ClubQuote,
  Coach,
  Faq,
  Job,
  JournalEntry,
  LegalPage,
  Level,
  Pack,
  PhotoTone,
  Plan,
  Prices,
  Slot,
  Testimonial,
} from "@/lib/types"

const TONES: PhotoTone[] = [
  "copper",
  "night",
  "sage",
  "teal",
  "gold",
  "plum",
  "sand",
  "rose",
]
const tone = (t: string, fallback: PhotoTone = "sand"): PhotoTone =>
  (TONES as string[]).includes(t) ? (t as PhotoTone) : fallback
const level = (n: number | null | undefined, fallback: Level = 1): Level =>
  n && n >= 1 && n <= 5 ? (n as Level) : fallback

export function mapClub(r: Tables<"clubs">, index: number): Club {
  const pool = r.pool as Club["pool"] | null
  const courts: Club["courts"] = {}
  for (const c of (r.courts as { sport: string; count: number }[]) ?? [])
    if (
      c.sport === "pickleball" ||
      c.sport === "tennis" ||
      c.sport === "basketball"
    )
      courts[c.sport] = c.count
  return {
    slug: r.slug,
    n: index + 1,
    name: r.name,
    short: r.short_name,
    city: r.city,
    type: r.club_type as Club["type"],
    sqFt: r.sqft,
    cross: r.cross_streets,
    zip: r.zip,
    phone: r.phone,
    tel: r.tel,
    personality: r.personality,
    intro: r.intro,
    amenities: r.site_amenities,
    signature: r.signature,
    has: r.has as Record<AmenityKey, boolean>,
    map: { x: r.map_x ?? 50, y: r.map_y ?? 50 },
    lat: r.lat,
    lng: r.lng,
    miles: r.demo_miles ?? 0,
    photo: r.photo_caption,
    tone: tone(r.tone),
    opened: r.opened ?? 0,
    parking: r.parking,
    access: r.access_notes,
    lanes: pool?.lanes,
    pool: pool ?? undefined,
    recovery: r.recovery as Club["recovery"],
    courts: Object.keys(courts).length ? courts : undefined,
    studios: r.studio_count,
    busyness: level(r.demo_busyness, 3),
    extras: r.extras || "—",
    typicalWeekday: r.typical_weekday,
    typicalWeekend: r.typical_weekend,
  }
}

/** The member app sets capacity. Copy like "Up to 12" must not contradict it, so it follows the capacity. */
function groupLabel(label: string, capacity: number, unit: string) {
  const m = /^Up to (\d+)( riders)?$/.exec(label)
  if (!m || unit === "lanes") return label
  return `Up to ${capacity}${m[2] ?? ""}`
}

export function mapClassType(
  r: Tables<"class_types">,
  categoryName: string
): ClassType {
  return {
    key: r.key,
    slug: r.slug,
    name: r.name,
    category: r.category_id as CategoryId,
    categoryName,
    blurb: r.blurb,
    description: r.about || r.blurb,
    duration: r.duration,
    intensity: [level(r.intensity_min), level(r.intensity_max)],
    level: level(r.intensity, 3),
    capacity: r.capacity,
    unit: r.unit as ClassType["unit"],
    bookable: r.bookable,
    firstTimer: r.first_timer_ok,
    group: groupLabel(r.group_label, r.capacity, r.unit),
    gear: r.gear || "Water bottle, towel, shoes you can move in.",
    bring: r.bring,
    clubs: r.club_slugs ?? "all",
    teen: r.teen_ok,
    caption: r.caption,
    pick: r.pick,
  }
}

export function mapCategory(r: Tables<"categories">, count: number): Category {
  return {
    id: r.id as CategoryId,
    name: r.name,
    tagline: r.tagline,
    count,
    intensity: [level(r.intensity_min), level(r.intensity_max)],
    examples: r.examples,
    lede: r.lede,
    heroCaption: r.hero_caption,
  }
}

export function mapCoach(r: Tables<"coaches">, year: number): Coach {
  const specialties = r.specialties.length
    ? r.specialties
    : r.discipline
      ? [r.discipline]
      : []
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    first: r.first_name,
    credential: r.credential,
    specialties,
    clubs: r.clubs,
    teaches: r.teaches,
    favorite: r.favorite,
    bio: r.about,
    quote: r.quote,
    years: r.years ?? (r.since ? year - r.since : null),
    pt: r.personal_trainer,
    tone: tone(r.tone),
    profile: r.about.trim().length > 0,
  }
}

export function mapSlot(r: Tables<"class_schedules">): Slot {
  return {
    club: r.club_slug,
    classKey: r.class_key,
    start: timeToMinutes(r.start_time),
    days: r.days,
    studio: r.studio,
    coachId: r.coach_id,
    level: r.intensity ? level(r.intensity) : null,
  }
}

export function mapPlan(r: Tables<"plans">): Plan {
  return {
    slug: r.id as Plan["slug"],
    name: r.name,
    price: Number(r.price),
    ribs: level(r.ribs),
    badge: r.badge ?? undefined,
    bestFor: r.best_for,
    features: r.features,
    compact: r.compact,
  }
}

export function mapPack(r: Tables<"pt_packs">): Pack {
  const price = Number(r.price)
  return { n: r.sessions, price, each: Math.round(price / r.sessions) }
}

export function mapComparison(r: Tables<"plan_comparison">) {
  return {
    row: r.row_label,
    vals: [r.trailhead, r.ridge, r.summit] as [string, string, string],
  }
}

export function mapPrices(rows: Tables<"price_constants">[]): Prices {
  const get = (k: string) => {
    const row = rows.find((r) => r.key === k)
    if (!row) throw new Error(`price_constants is missing "${k}"`)
    return Number(row.amount)
  }
  return {
    adult: get("adult_addon"),
    child: get("child_addon"),
    ptSingle: get("pt_single"),
    dayPass: get("day_pass"),
    enrollment: get("enrollment"),
    facilityFee: get("facility_fee"),
    freeze: get("freeze_monthly"),
  }
}

/** FAQ ids carry an audience prefix in the table ("site-card"). The page anchors use the bare id. */
export function mapFaq(r: Tables<"faqs">): Faq {
  return {
    id: r.id.replace(/^(site|home)-/, ""),
    group: r.group_name,
    q: r.question,
    a: r.answer,
  }
}

export function mapJournal(r: Tables<"journal_posts">): JournalEntry {
  return {
    slug: r.slug,
    title: r.title,
    dek: r.dek,
    cat: r.category,
    author: r.author_slug ?? "",
    date: fmtDateOnly(r.published_on),
    iso: r.published_on,
    min: r.read_minutes ?? 5,
    tone: tone(r.tone, "sage"),
    caption: r.caption,
    cls: r.class_slug ?? "",
    sections: (r.sections as [string, string][]) ?? [],
  }
}

export function mapJob(r: Tables<"jobs">): Job {
  return {
    slug: r.slug,
    title: r.title,
    club: r.club,
    dept: r.dept,
    type: r.job_type,
    pay: r.pay,
  }
}

export type SiteContent = {
  testimonials: Testimonial[]
  clubQuotes: ClubQuote[]
  legalPages: LegalPage[]
  firstTimerShelf: string[]
  popularNow: string[]
  amenityFilters: { key: AmenityKey; label: string }[]
  journalCats: string[]
}
export function mapSiteContent(rows: Tables<"site_content">[]): SiteContent {
  const get = <T>(k: string, fallback: T): T => {
    const row = rows.find((r) => r.key === k)
    return row ? (row.data as Json as T) : fallback
  }
  return {
    testimonials: get("testimonials", []),
    clubQuotes: get("club_quotes", []),
    legalPages: get("legal_pages", []),
    firstTimerShelf: get("first_timer_shelf", []),
    popularNow: get("popular_now", []),
    amenityFilters: get("amenity_filters", []),
    journalCats: get("journal_categories", ["All"]),
  }
}
