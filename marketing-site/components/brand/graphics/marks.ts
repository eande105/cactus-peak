import { place, rect } from "./engine"
import { kit } from "./lines"
import type { Drawing, El, Tone } from "./types"

/*
 * Coach marks: one square emblem per coach, made for a circle crop from 40 to 200 px.
 * Same style as the space and class graphics (tint field, strong outlines, mid fills, one hue), with more
 * solids: the largest shapes are filled in the strong tone or the mid tint, so each mark reads as a bold,
 * compact emblem at 40 px. Subjects come from each coach's data. No figures, heads or silhouettes.
 * Each subject sits in a 48-unit box centred on the origin; the box takes 60 % of the mark, so it stays
 * well inside the circle with an even margin.
 */

const { L, F, S, FR, SR, FO, dot, r2 } = kit
const SQ3 = Math.sqrt(3)
const S64 = 64

/** A gear: eight teeth on a solid ring, with a mid-tint hub. */
function gear(cx: number, cy: number, r: number): El[] {
  let d = ""
  for (let i = 0; i < 16; i++) {
    const a0 = (i * Math.PI) / 8,
      a1 = ((i + 1) * Math.PI) / 8,
      rr = i % 2 ? r : r + 2.4
    d += `${i ? "L" : "M"}${r2(cx + rr * Math.cos(a0))} ${r2(cy + rr * Math.sin(a0))}L${r2(cx + rr * Math.cos(a1))} ${r2(cy + rr * Math.sin(a1))}`
  }
  return [S(`${d}Z`), FO(cx, cy, r * 0.42)]
}

/** A crescent: the outer circle minus an offset circle, as one closed path. */
function crescent(
  cx: number,
  cy: number,
  R: number,
  ox: number,
  oy: number,
  r: number
): string {
  const dx = ox - cx,
    dy = oy - cy,
    d = Math.hypot(dx, dy)
  const a = (R * R - r * r + d * d) / (2 * d),
    h = Math.sqrt(R * R - a * a)
  const mx = cx + (a * dx) / d,
    my = cy + (a * dy) / d
  const p1 = [r2(mx + (h * dy) / d), r2(my - (h * dx) / d)],
    p2 = [r2(mx - (h * dy) / d), r2(my + (h * dx) / d)]
  return `M${p1[0]} ${p1[1]}A${R} ${R} 0 1 0 ${p2[0]} ${p2[1]}A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}Z`
}

export const coachMarks = {
  "marisol-vega": {
    label: "Marisol Vega",
    tone: "copper",
    idea: "Climb Cycle and a racer's past: a solid chainring rising behind a 60° climb with a switchback road.",
    build: (): El[] => [
      ...gear(0, -9, 8.6),
      F(`M-19 18L0 ${r2(18 - 19 * SQ3)}L19 18Z`),
      L("M-7 16L7 11L-3 6L3 1.6"),
      L("M-22 18H22"),
    ],
  },
  "devon-hart": {
    label: "Devon Hart",
    tone: "night",
    idea: "Olympic platforms: a loaded bar, solid bumper plates seen edge-on, on a lifting platform.",
    build: (): El[] => [
      FR(-21, 14, 42, 5, 0.8),
      L("M-9 14V19M9 14V19"),
      L("M-23 0H23"),
      SR(-13, -12, 4.4, 24, 1),
      SR(8.6, -12, 4.4, 24, 1),
      SR(-17.6, -8.5, 3.6, 17, 1),
      SR(14, -8.5, 3.6, 17, 1),
      SR(-8.2, -2.6, 1.6, 5.2, 0.4),
      SR(6.6, -2.6, 1.6, 5.2, 0.4),
    ],
  },
  "imani-brooks": {
    label: "Imani Brooks",
    tone: "sage",
    idea: "Breathwork and slow flow: two rings of breath open around a low sun on a calm horizon.",
    build: (): El[] => [
      F("M-22 10a22 22 0 0 1 44 0h-5a17 17 0 0 0-34 0Z"),
      F("M-13 10a13 13 0 0 1 26 0h-5a8 8 0 0 0-16 0Z"),
      S("M-5.6 10a5.6 5.6 0 0 1 11.2 0Z"),
      L("M-23 10H23"),
      L("M-15 15.5H15M-8 20.5H8"),
    ],
  },
  "luis-ortega": {
    label: "Luis Ortega",
    tone: "teal",
    idea: "Swim school: a float ring riding the water, half under the surface. Every kid floats.",
    build: (): El[] => {
      const cx = 0,
        cy = -3,
        R = 15,
        r = 7.5
      const p = (a: number, rr: number) =>
        `${r2(cx + Math.cos(a) * rr)} ${r2(cy + Math.sin(a) * rr)}`
      const seg = (i: number): El => {
        const a0 = -Math.PI / 4 + (i * Math.PI) / 2,
          a1 = a0 + Math.PI / 2
        const d = `M${p(a0, R)}A${R} ${R} 0 0 1 ${p(a1, R)}L${p(a1, r)}A${r} ${r} 0 0 0 ${p(a0, r)}Z`
        return i % 2 ? F(d) : S(d)
      }
      return [
        seg(0),
        seg(1),
        seg(2),
        seg(3),
        F(
          "M-21 6c3.5 0 3.5-2.4 7-2.4s3.5 2.4 7 2.4 3.5-2.4 7-2.4 3.5 2.4 7 2.4 3.5-2.4 7-2.4 3.5 2.4 7 2.4V18H-21Z"
        ),
        L(
          "M-14 12c2.3 0 2.3-1.6 4.6-1.6s2.3 1.6 4.6 1.6M5 12c2.3 0 2.3-1.6 4.6-1.6s2.3 1.6 4.6 1.6"
        ),
      ]
    },
  },
  "sam-okafor": {
    label: "Sam Okafor",
    tone: "gold",
    idea: "Teen Strength: a plan you can see. Steps up to a pennant, one level at a time.",
    build: (): El[] => [
      FR(-20, 10, 9, 9, 0.6),
      SR(-11, 3, 9, 16, 0.6),
      FR(-2, -4, 9, 23, 0.6),
      SR(7, -11, 9, 30, 0.6),
      L("M13.4 -11V-23"),
      S("M13.4 -23L22 -19.6L13.4 -16.2Z"),
      L("M-23 19H23"),
    ],
  },
  "tess-nakamura": {
    label: "Tess Nakamura",
    tone: "rose",
    idea: "The 5:45 a.m. ride and the Saturday canal run: the sun rising at the end of a straight canal.",
    build: (): El[] => [
      S("M-11 0a11 11 0 0 1 22 0Z"),
      L("M-14 -16l2 3M14 -16l-2 3M0 -21v3.6M-21 -7l3.4 1.2M21 -7l-3.4 1.2"),
      L("M-23 0H23"),
      F("M-2.6 0H2.6L14 19H-14Z"),
      L("M-2.6 0L-20 19M2.6 0L20 19"),
      L("M-1 6h2M-2.4 12h4.8"),
    ],
  },
  "ray-delgado": {
    label: "Ray Delgado",
    tone: "sand",
    idea: "Pickleball four mornings a week: a paddle and a ball, its holes on a 60° ring.",
    build: (): El[] => [
      F(
        "M-21 -16a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v16a5 5 0 0 1-5 5h-12a5 5 0 0 1-5-5Z"
      ),
      SR(-12.4, 5, 4.8, 14, 1.6),
      S("M1 9a10 10 0 1 0 20 0a10 10 0 1 0 -20 0Z"),
      ...[0, 1, 2, 3, 4, 5].map((i) => ({
        k: "circle" as const,
        cx: r2(11 + 5.4 * Math.cos((i * Math.PI) / 3)),
        cy: r2(9 + 5.4 * Math.sin((i * Math.PI) / 3)),
        r: 1.3,
        fill: "mid" as const,
      })),
      { k: "circle", cx: 11, cy: 9, r: 1.3, fill: "mid" },
    ],
  },
  "nadia-kowalski": {
    label: "Nadia Kowalski",
    tone: "plum",
    idea: "Recovery spaces and a planned week back: a crescent moon over a sauna bench. Rest is part of the plan.",
    build: (): El[] => [
      S(crescent(-2, -7, 12, 4, -11, 10.4)),
      dot(14, -16, 1.4),
      dot(18.5, -6, 1),
      dot(11, -2, 0.9),
      FR(-21, 9, 42, 4.4, 0.8),
      L("M-21 11.2H21"),
      FR(-21, 15, 42, 3.4, 0.6),
      L("M-17 13.4V15M17 13.4V15M-17 18.4V21M17 18.4V21"),
    ],
  },
} as const satisfies Record<
  string,
  { label: string; tone: Tone; idea: string; build: () => El[] }
>

export type CoachMarkId = keyof typeof coachMarks
export const coachMarkIds = Object.keys(coachMarks) as CoachMarkId[]
export function buildCoachMark(id: CoachMarkId): Drawing {
  const s = (S64 * 0.6) / 48
  return {
    w: S64,
    h: S64,
    line: true,
    els: [
      rect(0, 0, S64, S64, "tint"),
      place(S64 / 2, S64 / 2, s, coachMarks[id].build()),
    ],
  }
}
