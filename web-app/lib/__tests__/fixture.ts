// Test fixture: the demo world from the seed source (../supabase/seed-data/web-app.json), the same data the
// database was seeded with. Tests use it instead of a live database.
import * as fs from "node:fs"
import * as path from "node:path"
import { type CatalogData, hydrateCatalog } from "@/lib/data/catalog"
import type { AppState } from "@/lib/data/state"

const file = path.resolve(
  import.meta.dirname,
  "../../../supabase/seed-data/web-app.json"
)
const raw = JSON.parse(fs.readFileSync(file, "utf8"))

export const catalog: CatalogData = {
  categories: raw.categories,
  plans: raw.plans,
  ptPacks: raw.ptPacks,
  prices: { adultAddon: 39, childAddon: 19, ptSingle: 75 },
  clubs: raw.clubs,
  instructors: raw.instructors,
  coaches: raw.coaches,
  classTypes: raw.classTypes,
  schedules: raw.schedules,
  faq: raw.faq,
}
hydrateCatalog(catalog)

export function seedState(): AppState {
  return structuredClone(raw.state) as AppState
}
