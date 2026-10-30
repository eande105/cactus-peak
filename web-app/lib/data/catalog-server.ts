import "server-only"
import { cache } from "react"
import type {
  CatalogData,
  FaqGroup,
  Plan,
  ScheduleRow,
} from "@/lib/data/catalog"
import { getPublicClient } from "@/lib/supabase/public"
import type {
  CategoryId,
  ClassType,
  Club,
  Coach,
  Instructor,
  PlanId,
} from "@/lib/types"

function must<T>(res: { data: T | null; error: { message: string } | null }) {
  if (res.error || !res.data)
    throw new Error(
      `Catalog read failed: ${res.error?.message ?? "no data returned"}`
    )
  return res.data
}

// Reads the public catalog with the cookie-less client. Each table read is a fetch that Next.js caches
// for an hour (lib/supabase/public.ts). React's cache() shares one result inside a render.
export const getCatalog = cache(async (): Promise<CatalogData> => {
  const db = getPublicClient()
  const [cats, plans, packs, prices, clubs, coaches, types, sched, faqs] =
    await Promise.all([
      db.from("categories").select("id, name, blurb").order("sort"),
      db
        .from("plans")
        .select(
          "id, name, price, booking_window_days, guest_passes, blurb, perks"
        )
        .order("sort"),
      db.from("pt_packs").select("sessions, price").order("sessions"),
      db.from("price_constants").select("key, amount"),
      db.from("clubs").select("*").order("sort"),
      db.from("coaches").select("*").order("name"),
      db.from("class_types").select("*").eq("bookable", true).order("sort"),
      db.from("class_schedules").select("*").order("id"),
      db
        .from("faqs")
        .select("group_name, question, answer")
        .eq("audience", "member")
        .order("sort"),
    ])

  const priceOf = (key: string) => {
    const row = must(prices).find((p) => p.key === key)
    if (!row) throw new Error(`Catalog read failed: no price ${key}`)
    return Number(row.amount)
  }

  const planMap = {} as Record<PlanId, Plan>
  for (const p of must(plans)) {
    const id = p.id as PlanId
    planMap[id] = {
      id,
      name: p.name,
      price: Number(p.price),
      window: p.booking_window_days,
      guestPasses: p.guest_passes,
      blurb: p.blurb,
      perks: p.perks,
    }
  }

  const clubList: Club[] = must(clubs).map((c) => ({
    id: c.legacy_id,
    slug: c.slug,
    name: c.name,
    city: c.city as Club["city"],
    neighborhood: c.neighborhood,
    address: c.address,
    type: c.type_label,
    sqft: c.sqft,
    personality: c.personality,
    phone: c.phone,
    zip: c.zip,
    amenities: c.amenities,
    pool: (c.pool as Club["pool"]) ?? null,
    courts: (c.courts as Club["courts"]) ?? [],
    kidsClub: c.kids_club,
    recovery: c.recovery as Club["recovery"],
    scene: c.scene as Club["scene"],
    photo: c.photo_caption,
    parking: c.parking,
    lat: c.lat,
    lng: c.lng,
    typical: c.typical_weekday,
    weekend: c.typical_weekend,
    studios: c.studios,
  }))

  // One coaches table holds group instructors and personal trainers. The member app shows trainers that
  // take bookings (they have open times).
  const coachRows = must(coaches)
  const instructors: Instructor[] = coachRows
    .filter((c) => c.teaches_classes)
    .map((c) => ({
      id: c.id,
      name: c.name,
      role: c.discipline,
      years: c.years ?? 0,
      clubs: c.clubs,
    }))
  const trainers: Coach[] = coachRows
    .filter(
      (c) =>
        c.personal_trainer &&
        Array.isArray(c.open_times) &&
        c.open_times.length > 0
    )
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      specialties: c.specialties,
      tags: c.tags,
      clubs: c.clubs,
      since: c.since ?? 0,
      about: c.about,
      goodFor: c.good_for,
      firstSession: c.first_session,
      openTimes: c.open_times as Coach["openTimes"],
    }))

  const classTypes: Record<string, ClassType> = {}
  for (const t of must(types))
    classTypes[t.key] = {
      key: t.key,
      name: t.name,
      category: t.category_id as CategoryId,
      duration: t.duration,
      intensity: t.intensity,
      capacity: t.capacity,
      unit: t.unit as ClassType["unit"],
      firstTimerOk: t.first_timer_ok,
      teenOk: t.teen_ok,
      minAge: t.min_age,
      about: t.about,
      bring: t.bring,
      ...(t.equipment_note ? { equipmentNote: t.equipment_note } : {}),
    }

  const schedules: Record<string, ScheduleRow[]> = {}
  for (const r of must(sched)) {
    if (!classTypes[r.class_key]) continue
    const row: ScheduleRow = [
      r.class_key,
      r.start_time.slice(0, 5),
      r.days.join(""),
      r.studio,
      r.coach_id,
    ]
    if (r.intensity != null) row.push(r.intensity)
    if (!schedules[r.club_slug]) schedules[r.club_slug] = []
    schedules[r.club_slug].push(row)
  }

  const faq: FaqGroup[] = []
  for (const f of must(faqs)) {
    let g = faq.find((x) => x.group === f.group_name)
    if (!g) {
      g = { group: f.group_name, items: [] }
      faq.push(g)
    }
    g.items.push({ q: f.question, a: f.answer })
  }

  return {
    categories: must(cats).map((c) => ({
      id: c.id as CategoryId,
      name: c.name,
      blurb: c.blurb,
    })),
    plans: planMap,
    ptPacks: must(packs).map((p) => ({
      sessions: p.sessions,
      price: Number(p.price),
    })),
    prices: {
      adultAddon: priceOf("adult_addon"),
      childAddon: priceOf("child_addon"),
      ptSingle: priceOf("pt_single"),
    },
    clubs: clubList,
    instructors,
    coaches: trainers,
    classTypes,
    schedules,
    faq,
  }
})
