import type {
  CategoryId,
  ClassType,
  Club,
  Coach,
  Instructor,
  PlanId,
} from "@/lib/types"

// The catalog comes from Supabase (see lib/data/catalog-server.ts). The rules engine reads it synchronously,
// so the objects below start empty and hydrateCatalog() fills them in place before any client component renders
// (CatalogBoundary in the root layout). Importers keep their references, so engine and action code stays as it was.

export type Category = { id: CategoryId; name: string; blurb: string }
export type Plan = {
  id: PlanId
  name: string
  price: number
  window: number
  guestPasses: number
  blurb: string
  perks: string[]
}
export type PtPack = { sessions: number; price: number }
// [typeKey, start "HH:MM", days (JS getDay digits), studio, instructorId, intensity override]
export type ScheduleRow = [string, string, string, string, string, number?]
export type FaqGroup = { group: string; items: { q: string; a: string }[] }

export interface CatalogData {
  categories: Category[]
  plans: Record<PlanId, Plan>
  ptPacks: PtPack[]
  prices: { adultAddon: number; childAddon: number; ptSingle: number }
  clubs: Club[]
  instructors: Instructor[]
  coaches: Coach[]
  classTypes: Record<string, ClassType>
  schedules: Record<string, ScheduleRow[]>
  faq: FaqGroup[]
}

// UI words, not catalog data.
export const LEVEL_WORDS = ["", "Easy", "Light", "Moderate", "Hard", "All-out"]
export const BUSY_WORDS = ["", "Quiet", "Light", "Steady", "Busy", "Packed"]
export const COACH_FILTERS = [
  "Return to training",
  "Strength",
  "Olympic lifting",
  "Swim",
  "Mobility",
  "Pickleball",
  "Youth and teen",
]

export const CATEGORIES: Category[] = []
export const CATEGORY_BY_ID = {} as Record<CategoryId, Category>
export const PLANS = {} as Record<PlanId, Plan>
export let ADULT_ADDON = 0
export let CHILD_ADDON = 0
export let PT_PRICE = 0
export const PT_PACKS: PtPack[] = []
export const CLUBS: Club[] = []
export const CLUB_BY_SLUG: Record<string, Club> = {}
export const INSTRUCTORS: Instructor[] = []
export const INSTRUCTOR_BY_ID: Record<string, Instructor> = {}
export const COACHES: Coach[] = []
export const COACH_BY_SLUG: Record<string, Coach> = {}
export const CLASS_TYPES: Record<string, ClassType> = {}
export const SCHEDULES: Record<string, ScheduleRow[]> = {}
export const FAQ: FaqGroup[] = []

let loaded: CatalogData | null = null
const listeners = new Set<() => void>()
export const onCatalogChange = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const catalogReady = () => loaded !== null

const refill = <T>(target: T[], items: T[]) => {
  target.splice(0, target.length, ...items)
}
const refillMap = <T>(target: Record<string, T>, entries: [string, T][]) => {
  for (const k of Object.keys(target)) delete target[k]
  for (const [k, v] of entries) target[k] = v
}

// Fills the module objects. Calling it again with the same object does nothing.
export function hydrateCatalog(data: CatalogData) {
  if (loaded === data) return
  loaded = data
  refill(CATEGORIES, data.categories)
  refillMap(
    CATEGORY_BY_ID,
    data.categories.map((c) => [c.id, c])
  )
  refillMap(PLANS, Object.entries(data.plans))
  ADULT_ADDON = data.prices.adultAddon
  CHILD_ADDON = data.prices.childAddon
  PT_PRICE = data.prices.ptSingle
  refill(PT_PACKS, data.ptPacks)
  refill(CLUBS, data.clubs)
  refillMap(
    CLUB_BY_SLUG,
    data.clubs.map((c) => [c.slug, c])
  )
  refill(INSTRUCTORS, data.instructors)
  refillMap(
    INSTRUCTOR_BY_ID,
    data.instructors.map((i) => [i.id, i])
  )
  refill(COACHES, data.coaches)
  refillMap(
    COACH_BY_SLUG,
    data.coaches.map((c) => [c.slug, c])
  )
  refillMap(CLASS_TYPES, Object.entries(data.classTypes))
  refillMap(SCHEDULES, Object.entries(data.schedules))
  refill(FAQ, data.faq)
  for (const l of listeners) l()
}
