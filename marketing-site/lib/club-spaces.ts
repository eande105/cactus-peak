import type { SpaceGraphicId } from "@/components/brand/graphics"
import type { Club, ClubSlug } from "./types"

/**
 * The spaces of a club, derived from the club's own data.
 * The web page and the future iOS app read this one mapping.
 * `graphic` is a `SpaceGraphic` id. The app can map it to its own asset.
 */
export type ClubSpace = {
  id: string
  graphic: SpaceGraphicId
  name: string
  /** One line. */
  line: string
  /** The amenities in this space. */
  amenities: string[]
  /** An optional page that explains the space. */
  link?: { href: string; label: string }
}

/** An amenity that applies to the whole club. */
export type ClubAmenity = {
  id: string
  graphic: SpaceGraphicId
  name: string
  link?: { href: string; label: string }
}

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
const ORDER: Record<ClubSlug, SpaceId[] | undefined> = {
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

function build(id: SpaceId, c: Club): ClubSpace | null {
  const s = c.slug
  switch (id) {
    case "pool":
      if (!c.has.pool) return null
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
          `${c.lanes} lap lanes`,
          ...(s === "mesa-dobson" ? ["Warm-water pool, 90 to 92°F"] : []),
          ...(s === "gilbert-val-vista"
            ? ["Splash pad", "Swim school, levels 1–5"]
            : []),
          ...(s === "mesa-red-mountain" ? ["Shade sails", "Aqua Fit"] : []),
          "Lane reservations",
          "Warm showers",
        ],
        link: { href: "/aquatics", label: "About aquatics" },
      }
    case "courts": {
      if (!c.has.courts) return null
      const k = c.courts ?? {}
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
        link: { href: "/courts", label: "About courts" },
      }
    }
    case "recovery":
      if (!c.has.recovery) return null
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
        link: { href: "/recovery", label: "About recovery" },
      }
    case "strength":
      return {
        id,
        graphic: "strength-floor",
        name: "Strength floor",
        line:
          c.type === "Studio club"
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
        line: `${plural(c.studios, "studio")} and a cycle studio.`,
        amenities: [`${plural(c.studios, "group studio")}`, "Cycle studio"],
        link: { href: "/classes", label: "See classes" },
      }
    case "kids":
      if (!c.has.kids) return null
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
        link: { href: "/kids", label: "About kids club" },
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
  // A club that is not in ORDER gets the spaces its facility flags allow, in a default order.
  const all = (
    ORDER[club.slug] ?? [
      "pool",
      "courts",
      "strength",
      "studios",
      "recovery",
      "kids",
    ]
  )
    .map((id) => build(id, club))
    .filter((x): x is ClubSpace => x !== null)
  const primary = all.slice(0, 4)
  const rest = all.slice(4)
  const amenities: ClubAmenity[] = rest.map((r) => ({
    id: r.id,
    graphic: r.graphic,
    name: r.id === "studios" ? "Studios and cycle" : r.name,
    link: r.link && r.id !== "studios" ? r.link : undefined,
  }))
  if (club.slug === "mesa-red-mountain") {
    amenities.unshift({ id: "deck", graphic: "deck", name: "Cardio deck" })
  }
  if (club.has.pool)
    amenities.push({
      id: "changing",
      graphic: "lockers",
      name: "Changing rooms",
    })
  if (club.slug === "mesa-dobson")
    amenities.push({ id: "cafe", graphic: "lounge", name: "Café" })
  return { primary, amenities }
}
