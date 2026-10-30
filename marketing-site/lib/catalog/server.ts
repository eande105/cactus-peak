import "server-only"

import { cache } from "react"
import { getCatalogClient } from "@/lib/supabase/public"
import {
  type Catalog,
  type CatalogData,
  makeLookups,
  toClientData,
} from "./index"
import {
  mapCategory,
  mapClassType,
  mapClub,
  mapCoach,
  mapComparison,
  mapFaq,
  mapJob,
  mapJournal,
  mapPack,
  mapPlan,
  mapPrices,
  mapSiteContent,
  mapSlot,
} from "./map"

function rows<T>(label: string, res: { data: T[] | null; error: unknown }) {
  if (res.error || !res.data)
    throw new Error(`Could not load ${label} from Supabase`, {
      cause: res.error,
    })
  return res.data
}

async function load(): Promise<CatalogData> {
  const db = getCatalogClient()
  const [
    clubs,
    categories,
    classTypes,
    coaches,
    slots,
    plans,
    packs,
    comparison,
    prices,
    faqs,
    journal,
    jobs,
    content,
  ] = await Promise.all([
    db.from("clubs").select("*").order("sort"),
    db.from("categories").select("*").order("sort"),
    db.from("class_types").select("*").order("sort"),
    db.from("coaches").select("*").order("name"),
    db.from("class_schedules").select("*").order("start_time"),
    db.from("plans").select("*").order("sort"),
    db.from("pt_packs").select("*").order("sessions"),
    db.from("plan_comparison").select("*").order("sort"),
    db.from("price_constants").select("*"),
    db.from("faqs").select("*").in("audience", ["site", "home"]).order("sort"),
    db
      .from("journal_posts")
      .select("*")
      .order("published_on", { ascending: false }),
    db.from("jobs").select("*").order("sort"),
    db.from("site_content").select("*"),
  ])

  const catRows = rows("categories", categories)
  const typeRows = rows("class types", classTypes)
  const catName = new Map(catRows.map((c) => [c.id, c.name]))
  const faqRows = rows("FAQs", faqs)
  const year = new Date().getFullYear()

  return {
    clubs: rows("clubs", clubs).map(mapClub),
    categories: catRows.map((c) =>
      mapCategory(c, typeRows.filter((t) => t.category_id === c.id).length)
    ),
    classTypes: typeRows.map((t) =>
      mapClassType(t, catName.get(t.category_id) ?? t.category_id)
    ),
    coaches: rows("coaches", coaches).map((c) => mapCoach(c, year)),
    slots: rows("class schedules", slots).map(mapSlot),
    plans: rows("plans", plans).map(mapPlan),
    packs: rows("PT packs", packs).map(mapPack),
    comparison: rows("plan comparison", comparison).map(mapComparison),
    prices: mapPrices(rows("prices", prices)),
    faqs: faqRows.filter((f) => f.audience === "site").map(mapFaq),
    homeFaqs: faqRows.filter((f) => f.audience === "home").map(mapFaq),
    journal: rows("journal", journal).map(mapJournal),
    jobs: rows("jobs", jobs).map(mapJob),
    ...mapSiteContent(rows("site content", content)),
  }
}

/**
 * The whole public catalog. Each Supabase request is in the Next.js data cache for an hour (lib/supabase/public.ts),
 * and React `cache` makes one load per render, so a layout and its page share it.
 */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const data = await load()
  return { ...data, ...makeLookups(data) }
})

/** The plain-data part the browser needs (no functions, no long bodies). */
export async function getClientCatalog() {
  return toClientData(await getCatalog())
}
