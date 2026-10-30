import type { Club, ClubSlug } from "./types"

export function miles(a: [number, number], b: [number, number]) {
  const R = 3958.8,
    rad = Math.PI / 180
  const dLat = (b[0] - a[0]) * rad,
    dLng = (b[1] - a[1]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
/** Miles from a point to each club, from the club coordinates in the `clubs` table. */
export function distancesFrom(
  p: [number, number],
  clubs: Pick<Club, "slug" | "lat" | "lng">[]
) {
  return Object.fromEntries(
    clubs.map((c) => [c.slug, miles(p, [c.lat, c.lng])])
  ) as Record<ClubSlug, number>
}
