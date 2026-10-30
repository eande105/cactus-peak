import type { SpaceGraphicId } from "@/components/brand/graphics"
import type { Club } from "@/lib/types"

/**
 * The spaces of a club, derived from the club's own data.
 * Port of marketing-site/lib/data/club-spaces.ts (the source of truth; the iOS app has a Swift port).
 * The marketing site keeps its facts in `has`, `lanes`, `courts` and `studios`. The member app reads the
 * same facts from its own Club shape, so only `facts()` below differs. Keep ORDER and the copy in sync.
 */
export type ClubSpace = {
  id: string
  graphic: SpaceGraphicId
  name: string
  /** One line. */
  line: string
  /** The amenities in this space. */
  amenities: string[]
}

/** An amenity that applies to the whole club. */
export type ClubAmenity = { id: string; graphic: SpaceGraphicId; name: string }

export type ClubSpaces = { primary: ClubSpace[]; amenities: ClubAmenity[] }

type SpaceId =
  | "pool"
  | "courts"
  | "recovery"
  | "strength"
  | "studios"
  | "kids"
  | "deck"

/** The order of the large spaces for each club. The first four become primary spaces. The rest become amenities. */
const ORDER: Record<string, SpaceId[]> = {
  "mesa-dobson": ["pool", "courts", "recovery", "strength", "studios", "kids"],
  "mesa-red-mountain": ["pool", "courts", "strength", "studios", "kids"],
  "mesa-downtown": ["strength", "studios", "recovery"],
  "gilbert-val-vista": [
    "pool",
    "kids",
    "courts",
    "strength",
    "studios",
    "recovery",
  ],
  "gilbert-heritage": ["strength", "studios", "recovery", "deck"],
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

/** The member app's Club in the marketing site's terms. */
function facts(c: Club) {
  const count = (sport: Club["courts"][number]["sport"]) =>
    c.courts.find((k) => k.sport === sport)?.count ?? 0
  const studios = Number(
    c.amenities.map((a) => /^(\d+) studios/.exec(a)?.[1]).find(Boolean) ?? 2
  )
  return {
    has: {
      pool: !!c.pool,
      courts: c.courts.length > 0,
      recovery: c.recovery !== "none",
      kids: c.kidsClub,
    },
    lanes: c.pool?.lanes ?? 0,
    courts: {
      pickleball: count("pickleball"),
      tennis: count("tennis"),
      basketball: count("basketball"),
    },
    studios,
    studioClub: c.type.startsWith("Studio club"),
  }
}

function build(id: SpaceId, c: Club): ClubSpace | null {
  const s = c.slug
  const f = facts(c)
  switch (id) {
    case "pool":
      if (!f.has.pool) return null
      return {
        id,
        graphic: "lap-pool",
        name:
          s === "gilbert-val-vista"
            ? "Pool and splash pad"
            : s === "mesa-dobson"
              ? "Pools"
              : "Pool",
        line:
          s === "mesa-red-mountain"
            ? "A 25-m outdoor pool under shade sails."
            : s === "mesa-dobson"
              ? "A 25-yd lap pool and a warm-water pool."
              : "A 25-yd lap pool, a splash pad and swim school.",
        amenities: [
          `${f.lanes} lap lanes`,
          ...(s === "mesa-dobson" ? ["Warm-water pool, 90 to 92°F"] : []),
          ...(s === "gilbert-val-vista"
            ? ["Splash pad", "Swim school, levels 1–5"]
            : []),
          ...(s === "mesa-red-mountain" ? ["Shade sails", "Aqua Fit"] : []),
          "Lane reservations",
          "Warm showers",
        ],
      }
    case "courts": {
      if (!f.has.courts) return null
      const k = f.courts
      const counts = [
        k.pickleball && plural(k.pickleball, "pickleball court"),
        k.tennis && plural(k.tennis, "tennis court"),
        k.basketball && plural(k.basketball, "basketball court"),
      ].filter(Boolean) as string[]
      return {
        id,
        graphic: "courts",
        name: "Courts",
        line: "Book a 60- or 90-minute slot up to 3 days ahead.",
        amenities: [
          ...counts,
          "Open play and clinics",
          "Loaner paddles at the desk",
        ],
      }
    }
    case "recovery":
      if (!f.has.recovery) return null
      return {
        id,
        graphic: "recovery",
        name:
          s === "mesa-dobson" || s === "gilbert-val-vista"
            ? "Recovery suite"
            : "Recovery lounge",
        line: "A Summit benefit.",
        amenities: [
          "Sauna",
          "Compression",
          s === "mesa-dobson" || s === "gilbert-val-vista"
            ? "Cold plunge"
            : "Stretch area",
        ],
      }
    case "strength":
      return {
        id,
        graphic: "strength-floor",
        name: "Strength floor",
        line: f.studioClub
          ? "Racks and a cardio floor, built for a short visit."
          : "Racks and a cardio floor with room to spread out.",
        amenities: [
          "Racks",
          "Cardio",
          ...(s === "gilbert-heritage" ? ["Olympic lifting platforms"] : []),
          ...(s === "mesa-red-mountain" ? ["Turf lane"] : []),
        ],
      }
    case "studios":
      return {
        id,
        graphic: "studio",
        name: "Studios",
        line: `${plural(f.studios, "studio")} and a cycle studio.`,
        amenities: [`${plural(f.studios, "group studio")}`, "Cycle studio"],
      }
    case "kids":
      if (!f.has.kids) return null
      return {
        id,
        graphic: "kids-club",
        name: "Kids club",
        line: "Ages 6 months to 12 years, while you train.",
        amenities: [
          "Monday to Saturday",
          "2-hour blocks",
          "Parent check-in",
          "Allergy notes",
        ],
      }
    case "deck":
      if (s !== "gilbert-heritage") return null
      return {
        id,
        graphic: "deck",
        name: "Rooftop mobility deck",
        line: "Stretch outdoors at golden hour.",
        amenities: ["Open-air mobility space", "Lift and stairs"],
      }
  }
}

/** The 3 or 4 spaces to feature, and the amenities for the whole club. */
export function clubSpaces(club: Club): ClubSpaces {
  const all = (ORDER[club.slug] ?? [])
    .map((id) => build(id, club))
    .filter((x): x is ClubSpace => x !== null)
  const primary = all.slice(0, 4)
  const rest = all.slice(4)
  const amenities: ClubAmenity[] = rest.map((r) => ({
    id: r.id,
    graphic: r.graphic,
    name: r.id === "studios" ? "Studios and cycle" : r.name,
  }))
  if (club.slug === "mesa-red-mountain")
    amenities.unshift({ id: "deck", graphic: "deck", name: "Cardio deck" })
  if (club.pool)
    amenities.push({
      id: "changing",
      graphic: "lockers",
      name: "Changing rooms",
    })
  if (club.slug === "mesa-dobson")
    amenities.push({ id: "cafe", graphic: "lounge", name: "Café" })
  return { primary, amenities }
}
