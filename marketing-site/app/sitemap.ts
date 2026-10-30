import type { MetadataRoute } from "next"
import { getCatalog } from "@/lib/catalog/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {
    clubs,
    categories,
    classTypes,
    profileCoaches,
    journal,
    jobs,
    legalPages,
  } = await getCatalog()
  const base = "https://www.cactuspeakathletic.com"
  const paths = [
    "/",
    "/clubs",
    "/classes",
    "/schedule",
    "/membership",
    "/trial",
    "/tour",
    "/kids",
    "/aquatics",
    "/courts",
    "/recovery",
    "/personal-training",
    "/coaches",
    "/about",
    "/careers",
    "/faq",
    "/contact",
    "/journal",
    "/offers/fall-climb",
    "/app",
    ...clubs.map((c) => `/clubs/${c.slug}`),
    ...categories.map((c) => `/classes/category/${c.id}`),
    ...classTypes.map((c) => `/classes/${c.slug}`),
    ...profileCoaches.map((c) => `/coaches/${c.slug}`),
    ...journal.map((j) => `/journal/${j.slug}`),
    ...jobs.map((j) => `/careers/${j.slug}`),
    ...legalPages.map((l) => `/legal/${l.slug}`),
  ]
  return paths.map((p) => ({ url: base + p }))
}
