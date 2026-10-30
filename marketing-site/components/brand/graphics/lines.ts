import type { El } from "./types"

/*
 * Line subjects for the space and class graphics: one collection, drawn together.
 * - Each subject sits in a 48 × 48 box centred on the origin (y grows down), so every piece has the
 *   same optical size. One view per object: a clean side view, front view or three-quarter view.
 * - Duotone in one hue: outlines and small solid parts (plates, handles, hubs, holes) in the strong tone
 *   (f5); main surfaces filled with the mid tint (`mid`). Fills use the same path as their outline, so
 *   they always sit inside it. No second hue, no cut-outs.
 * - Proportions come from real products. See references.md next to this file.
 * - `simple` drops secondary lines (ticks, slats, louvres) for 96 px and smaller; fills stay.
 */

export type LineSubject = { build: (simple: boolean) => El[] }

const SQ3 = Math.sqrt(3)
const r2 = (v: number) => Math.round(v * 100) / 100

/** Line only. */
const L = (d: string): El => ({
  k: "path",
  d,
  fill: "none",
  stroke: "f5",
  hair: true,
})
/** Surface: mid fill under its outline. */
const F = (d: string, rule?: "evenodd"): El => ({
  k: "path",
  d,
  fill: "mid",
  stroke: "f5",
  hair: true,
  rule,
})
/** Small solid part: strong fill with the same outline, so its edge matches the line weight. */
const S = (d: string): El => ({
  k: "path",
  d,
  fill: "f5",
  stroke: "f5",
  hair: true,
})
const FR = (x: number, y: number, w: number, h: number, rx = 0): El => ({
  k: "rect",
  x,
  y,
  w,
  h,
  rx,
  fill: "mid",
  stroke: "f5",
  hair: true,
})
const SR = (x: number, y: number, w: number, h: number, rx = 0): El => ({
  k: "rect",
  x,
  y,
  w,
  h,
  rx,
  fill: "f5",
  stroke: "f5",
  hair: true,
})
const FO = (cx: number, cy: number, r: number): El => ({
  k: "circle",
  cx,
  cy,
  r,
  fill: "mid",
  stroke: "f5",
  hair: true,
})
const O = (cx: number, cy: number, r: number): El => ({
  k: "circle",
  cx,
  cy,
  r,
  fill: "none",
  stroke: "f5",
  hair: true,
})
const dot = (cx: number, cy: number, r: number): El => ({
  k: "circle",
  cx,
  cy,
  r,
  fill: "f5",
})
const shift = (x: number, y: number, ch: El[]): El[] => [{ k: "g", x, y, ch }]
const steps = (from: number, to: number, step: number) => {
  const out: number[] = []
  for (let v = from; v <= to + 0.01; v += step) out.push(r2(v))
  return out
}
/** A closed water body: wavy top from x0 to x1 at y, flat bottom at yb. */
const water = (
  x0: number,
  x1: number,
  y: number,
  yb: number,
  p = 8,
  a = 1.2
) => {
  let d = `M${x0} ${y}`
  for (let x = x0, i = 0; x < x1 - 0.01; x += p / 2, i++)
    d += `q${p / 4} ${i % 2 ? a * 2 : -a * 2} ${p / 2} 0`
  return `${d}V${yb}H${x0}Z`
}

// ---------- Space subjects: the place or its equipment ----------

/** Squat rack, front view (Rogue R-3: 90" tall, 47" wide) with a loaded bar on the J-hooks. */
export const rack: LineSubject = {
  build: (simple) => {
    // Bumper plates (450 mm) hang outside the uprights on the sleeves; the bar sits on the J-hooks.
    const plates = (sd: 1 | -1): El[] => {
      const x = (v: number, w: number) => (sd === 1 ? v : -v - w)
      return [
        FR(x(14, 2.8), -11, 2.8, 12, 0.8),
        FR(x(17.2, 2.8), -11, 2.8, 12, 0.8),
        ...(simple ? [] : [FR(x(20.4, 1.8), -8.5, 1.8, 7, 0.6)]),
        SR(x(12.6, 1), -6.8, 1, 3.6, 0.3),
      ]
    }
    return [
      SR(-12, -23, 2.2, 44, 0.4),
      SR(9.8, -23, 2.2, 44, 0.4),
      SR(-12, -23, 24, 2, 0.4),
      SR(-15, 20, 9, 2.4, 0.6),
      SR(6, 20, 9, 2.4, 0.6),
      SR(-13.6, -4.2, 1.8, 2.4, 0.4),
      SR(11.8, -4.2, 1.8, 2.4, 0.4),
      L("M-24 -5H24"),
      ...plates(1),
      ...plates(-1),
    ]
  },
}

/** Cable column, front view (Life Fitness single stack: frame, top pulley, guide rods, plate stack, adjustable pulley). */
export const cableStack: LineSubject = {
  build: (simple) => {
    // The stack rides on two guide rods from the top beam to the base, offset left of centre.
    const sx = -10,
      sw = 14,
      cx = sx + sw / 2,
      top = 3,
      bottom = 17,
      n = simple ? 5 : 8,
      ph = (bottom - top) / n
    return [
      FR(-18, 19, 36, 3, 0.6),
      FR(-16, -22, 3, 41),
      FR(13, -22, 3, 41),
      FR(-17, -23.4, 34, 3.8, 0.6),
      L(`M${cx - 4} -19.6V19M${cx + 4} -19.6V19`),
      SR(cx - 5.2, 17, 2.4, 2, 0.4),
      SR(cx + 2.8, 17, 2.4, 2, 0.4),
      ...Array.from({ length: n }, (_, i) =>
        FR(sx, r2(top + i * ph), sw, r2(ph), 0.3)
      ),
      // Headplate, lift bracket and the selector pin in the fifth plate.
      SR(sx, 0.6, sw, 2.4, 0.6),
      SR(cx - 1.6, -2, 3.2, 2.6, 0.4),
      SR(-13, r2(top + 4.5 * ph - 0.6), 3, 1.2, 0.4),
      dot(-13.2, r2(top + 4.5 * ph), 1),
      // One cable: up from the bracket, over the top pulley, across to the corner pulley, down the
      // right upright to the adjustable pulley, and out to a stirrup handle.
      SR(-0.6, -19.6, 1.2, 4.6),
      SR(8.4, -19.6, 1.2, 4.6),
      L(`M${cx} -2V-15A3 3 0 0 1 0 -18H9A3 3 0 0 1 12 -15V6`),
      FO(0, -15, 3),
      dot(0, -15, 0.9),
      FO(9, -15, 3),
      dot(9, -15, 0.9),
      SR(11.6, 4.4, 1.6, 3.2, 0.4),
      FO(9, 6, 3),
      dot(9, 6, 0.9),
      L("M6 6V12"),
      L("M6 12L3 16.4H9Z"),
      SR(2.8, 15.6, 6.4, 1.8, 0.8),
    ]
  },
}

/** Treadmill, side view (82" long, deck step-up ~8", console ~55"); the runner faces right. */
export const treadmillLine: LineSubject = {
  build: (simple) => [
    // Deck with rollers at both ends, sitting on a rear foot; the motor hood at the front has its own foot.
    F("M-19.5 12H14V17H-19.5a2.5 2.5 0 0 1 0-5Z"),
    ...(simple ? [] : [L("M-18 13.6H12.6")]),
    dot(-19.5, 14.5, 1),
    SR(-21, 17, 4.4, 1.8, 0.6),
    // The upright rises from the hood to the console; the side rail runs back from the console at hip height.
    F("M16.4 7.4H20L17.6 -12H14Z"),
    FR(12, 7, 11, 10, 2),
    SR(17.6, 17, 4.4, 1.8, 0.6),
    F("M8 -12H22.4L21 -19.4H9.4Z"),
    ...(simple ? [] : [SR(11.2, -17.8, 7.4, 3, 0.6)]),
    L("M10.4 -12L6.4 -5H-4"),
    dot(-4.2, -5, 1.2),
  ],
}

/** Yoga mat and foam block, three-quarter view (mat 68" × 24", block 9" × 6" × 4" standing). */
export const matAndBlock: LineSubject = {
  build: (simple) => {
    // Depth runs up and to the right at 60°; d is one unit of depth.
    const dx = 0.5,
      dy = -SQ3 / 2
    const D = 11,
      r = 4.2
    const ax = -24,
      ay = 12,
      bx = 8
    const mat = `M${ax} ${ay}H${bx}L${r2(bx + dx * D)} ${r2(ay + dy * D)}H${r2(ax + dx * D)}Z`
    // Roll: a cylinder along the depth axis at the right edge of the mat.
    const fx = bx + 2.6,
      fy = ay - r,
      nx = (SQ3 / 2) * r,
      ny = 0.5 * r
    const bxr = fx + dx * D,
      byr = fy + dy * D
    const roll = `M${r2(fx - nx)} ${r2(fy - ny)}L${r2(bxr - nx)} ${r2(byr - ny)}A${r} ${r} 0 0 1 ${r2(bxr + nx)} ${r2(byr + ny)}L${r2(fx + nx)} ${r2(fy + ny)}Z`
    // Block: front face, top face and right face (oblique, depth 3).
    const k = 3.4,
      x0 = -15,
      x1 = -8,
      yt = -2,
      yb = 9.4
    const bdx = dx * k,
      bdy = dy * k
    return shift(0, 1, [
      F(mat),
      ...(simple ? [] : [L(`M${ax + 3} ${ay - 2}H${bx - 3}`)]),
      F(roll),
      FO(fx, fy, r),
      O(fx, fy, r * 0.55),
      dot(fx, fy, 0.9),
      F(
        `M${x1} ${yt}L${r2(x1 + bdx)} ${r2(yt + bdy)}V${r2(yb + bdy)}L${x1} ${yb}Z`
      ),
      F(
        `M${x0} ${yt}L${r2(x0 + bdx)} ${r2(yt + bdy)}H${r2(x1 + bdx)}L${x1} ${yt}Z`
      ),
      FR(x0, yt, x1 - x0, yb - yt, 0.6),
    ])
  },
}

/** Indoor studio bike, side view, flywheel at the front (Peloton-style: 59" long, 53" tall); the rider faces right. */
export const studioBikeLine: LineSubject = {
  build: (simple) => [
    SR(-22, 18.4, 13, 2.2, 1.1),
    SR(7, 18.4, 15, 2.2, 1.1),
    // Frame: rear leg, main beam to the front post, front leg to the flywheel.
    L("M-15.5 18.4L-9 0L9 -3"),
    L("M15 18.4L12.5 8"),
    L("M12.5 8L8.2 -15"),
    // Lower tube from the rear leg through the bottom bracket to the flywheel hub (belt guard line).
    L("M-12.6 10.2L12.5 8"),
    // Flywheel with its guard, crank and pedal.
    FO(12.5, 8, 8.6),
    O(12.5, 8, 5.6),
    dot(12.5, 8, 1.4),
    FO(-3, 9.36, 2.4),
    L("M-3 9.36l2.4 4.6"),
    SR(-2.4, 13.6, 3.6, 1.4, 0.5),
    // Seat post at 73° and saddle; handlebar and console.
    L("M-9 0L-13.6 -15"),
    S("M-19.5 -16.6h8.2a1.6 1.6 0 0 1 0 3.2h-5.2Z"),
    L("M8.9 -11H14a3 3 0 0 1 3 3V-6"),
    ...(simple ? [] : [F("M7.4 -15L5.6 -21.2H12.6L14.4 -15Z")]),
  ],
}

/** Court net, front view: posts, a top tape, a mesh that sags, the centre strap and the court line. */
export const net: LineSubject = {
  build: (simple) => {
    const top = -9,
      low = 5,
      sag = 2.6,
      hw = 21
    const bottom = (x: number) => low + sag * (1 - (x / hw) ** 2)
    const rows = simple ? [0.5] : [0.33, 0.66]
    const cols = steps(
      -hw + (simple ? 7 : 4.2),
      hw - (simple ? 7 : 4.2),
      simple ? 7 : 4.2
    )
    return [
      F(`M${-hw} ${top}H${hw}V${low}Q0 ${low + 2 * sag} ${-hw} ${low}Z`),
      ...rows.map((t) =>
        L(
          `M${-hw} ${r2(top + t * (low - top))}Q0 ${r2(top + t * (low + 2 * sag - top))} ${hw} ${r2(top + t * (low - top))}`
        )
      ),
      ...cols
        .filter((x) => Math.abs(x) > 1.5)
        .map((x) => L(`M${x} ${top}V${r2(bottom(x))}`)),
      SR(-1, top, 2, bottom(0) - top, 0.4),
      SR(-hw, top - 1.2, 2 * hw, 2.4, 1.2),
      SR(-hw - 2.4, -12, 2.4, 28, 0.6),
      SR(hw, -12, 2.4, 28, 0.6),
      L("M-24 20H24"),
    ]
  },
}

/** Pool ladder, front view from the water: two rails hooked over the deck edge, three treads, the water. */
export const ladder: LineSubject = {
  build: (simple) => {
    // Side view with a little depth: the deck and coping on the left, the pool wall, the water below the coping.
    // Each rail is anchored in the deck, arches over the coping and runs down the wall into the water.
    const rail = (dx: number, dy: number) =>
      `M${-11 + dx} ${-4 + dy}V${-11 + dy}a6 6 0 0 1 12 0V${16 + dy}`
    // Treads run from the near rail to the far rail; their depth points back toward the wall.
    const tread = (y: number): El => F(`M-2.4 ${y}H1L4 ${y - 2}H0.6Z`)
    return [
      F(water(-6, 22, 0, 20)),
      L(rail(3, -2)),
      ...(simple ? [2, 10] : [2, 8, 14]).map(tread),
      L(rail(0, 0)),
      L("M-22 -4H-6V20"),
      SR(-8.4, -4.6, 3.2, 2, 1),
      SR(-13.2, -5, 4.4, 1.2, 0.4),
      SR(-10.2, -7, 4.4, 1.2, 0.4),
    ]
  },
}

/** Glass pool thermometer in the water: bulb submerged, scale ticks, solid column. */
export const thermometerLine: LineSubject = {
  build: (simple) => [
    F(water(-22, 22, 8, 20)),
    F("M-3.4 7.4V-19a3.4 3.4 0 0 1 6.8 0V7.4A6.4 6.4 0 1 1 -3.4 7.4Z"),
    S("M-1 8V-11a1 1 0 0 1 2 0V8Z"),
    dot(0, 12.6, 3.6),
    ...(simple
      ? []
      : steps(-17, 4, 3).map((y, i) => L(`M3.4 ${y}h${i % 2 ? 2 : 3.4}`))),
  ],
}

/** Ground-level splash pad fountain: a flush grate in perspective, a centre column and two arcs, falling drops. */
export const fountain: LineSubject = {
  build: (simple) => [
    F("M-20 16a20 5 0 1 0 40 0a20 5 0 1 0 -40 0Z"),
    ...(simple ? [] : [L("M-12 16h24M-8 13h16M-8 19h16")]),
    FO(0, 16, 2.6),
    L("M0 13V-16"),
    L("M-2.4 14C-6 0-12-8-20-10"),
    L("M2.4 14C6 0 12-8 20-10"),
    dot(0, -19.5, 1.8),
    dot(-21.5, -6.5, 1.5),
    dot(21.5, -6.5, 1.5),
    ...(simple
      ? []
      : [dot(-3.5, -22, 1), dot(3.5, -22, 1), dot(-19, -2, 1), dot(19, -2, 1)]),
  ],
}

/** Sauna bucket and ladle, side view (bucket 26 cm across, 20 cm tall; ladle 40 cm) with staves and two bands. */
export const bucket: LineSubject = {
  build: (simple) => [
    // The ladle rests in the bucket, its handle out at 60°.
    L(`M3 -4L${r2(3 + 11.5)} ${r2(-4 - 11.5 * SQ3)}`),
    SR(13.4, -24.4, 3.2, 4.6, 1.4),
    F("M-13 -4H13L10.6 20H-10.6Z"),
    ...(simple ? [] : [-6.5, 0, 6.5].map((x) => L(`M${x} -4V20`))),
    SR(-12.7, 0, 25.4, 2, 0.4),
    SR(-11.4, 13, 22.8, 2, 0.4),
    L("M-13 -4a3 3 0 0 1-3-3"),
    L("M13 -4a3 3 0 0 0 3-3"),
  ],
}

/** Climbing frame (Pikler-style A-frame), front view: two legs at 60°, rungs, a slide board hooked on one side. */
export const climbingFrame: LineSubject = {
  build: (simple) => {
    // A children's slide from the side, all feet on the ground line y = 20.
    const g = 20,
      py = -6,
      k = Math.tan((18 * Math.PI) / 180)
    const rail = (x: number) => `M${x} ${g}L${r2(x + (g - py) * k)} ${py}`
    const rung = (t: number) => {
      const y = r2(g - (g - py) * t),
        off = r2((g - py) * t * k)
      return L(`M${r2(-23.4 + off)} ${y}H${r2(-18.4 + off)}`)
    }
    // Handrails continue the ladder rails up, then curve over to the top of the chute.
    const hand = (dx: number, dy: number) =>
      `M${r2(-18.4 + (g - py) * k + dx)} ${py + dy}L${r2(-16.4 + (g - py) * k + dx)} ${-14 + dy}Q${r2(-15.4 + (g - py) * k + dx)} ${-17 + dy} ${r2(-12 + (g - py) * k + dx)} ${-17 + dy}H${-1 + dx}Q${1 + dx} ${-17 + dy} ${1 + dx} ${-14 + dy}V${py + dy}`
    const chuteTop = "M1 -6C9 -6 10 5 15 11.4C17.4 14.6 19.4 16 24 16"
    return [
      L(hand(2, -1.6)),
      L(`${rail(-23.4)}${rail(-18.4)}`),
      ...(simple ? [0.33, 0.66] : [0.2, 0.4, 0.6, 0.8]).map(rung),
      L(hand(0, 0)),
      SR(
        r2(-18.4 + (g - py) * k - 0.4),
        py,
        r2(1.4 - (-18.4 + (g - py) * k) + 0.4),
        2.4,
        0.6
      ),
      L(`M${r2(-17.4 + (g - py) * k)} ${py + 2.4}V${g}M-1 ${py + 2.4}V${g}`),
      // Chute: a filled bed with a raised side rail, curving into a flat run-out with a lip.
      F(
        `${chuteTop}V18.6C18.6 18.6 16.4 17.4 13.6 13.6C8.6 7.2 7.6 -3.4 1 -3.4Z`
      ),
      L("M1 -9C9.4 -9 10.6 2.6 15.6 9C18 12.2 20 13.4 24 13.4V16"),
      ...(simple ? [] : [L("M7.6 -6.6V-3.8M12.6 2.4V5.6M18.6 13.2V15.2")]),
      L("M20.6 18.4V20"),
      SR(-24.4, 19, 3, 1.6, 0.6),
      SR(-19.4, 19, 3, 1.6, 0.6),
      SR(19.2, 19.4, 3, 1.6, 0.6),
      SR(r2(-18.9 + (g - py) * k), 19.4, 3, 1.6, 0.6),
      SR(-2.5, 19.4, 3, 1.6, 0.6),
    ]
  },
}

/** Locker bank, front view: three full-height doors with louvres, handles and number plates, a plinth. */
export const lockers: LineSubject = {
  build: (simple) => [
    FR(-19, -22, 12.4, 40, 0.6),
    FR(-6.2, -22, 12.4, 40, 0.6),
    FR(6.6, -22, 12.4, 40, 0.6),
    ...[-12.8, 0, 12.8].flatMap((x) => [
      ...(simple
        ? [L(`M${x - 3.5} -17h7`)]
        : [
            L(`M${x - 3.5} -18h7M${x - 3.5} -16h7M${x - 3.5} -14h7`),
            L(`M${x - 3.5} 11h7M${x - 3.5} 13h7`),
          ]),
      SR(x + 3.4, -2.6, 1.6, 5, 0.6),
      ...(simple ? [] : [SR(x - 2, -9.6, 4, 2, 0.4)]),
    ]),
    SR(-20, 18, 40, 3, 0.4),
  ],
}

/** Deck rail and the sun, front view: a capped top rail, posts, balusters, a bottom rail and a low sun. */
export const deckRail: LineSubject = {
  build: (simple) => [
    FO(10, -13, 6),
    ...(simple ? [0, 2, 4] : [0, 1, 2, 3, 4, 5]).map((i) => {
      const a = (i * Math.PI) / 3 - Math.PI / 2,
        c = Math.cos(a),
        s = Math.sin(a)
      return L(
        `M${r2(10 + 8.6 * c)} ${r2(-13 + 8.6 * s)}L${r2(10 + 11 * c)} ${r2(-13 + 11 * s)}`
      )
    }),
    ...steps(-15, 15, simple ? 10 : 5)
      .filter((x) => Math.abs(x) > 0.1)
      .map((x) => L(`M${x} 3V17`)),
    FR(-22, 0, 44, 3, 0.8),
    FR(-22, 16, 44, 2, 0.4),
    FR(-21, 0, 3.2, 21, 0.4),
    FR(-1.6, 0, 3.2, 21, 0.4),
    FR(17.8, 0, 3.2, 21, 0.4),
  ],
}

/** Push sled, side view (Rogue-style: 40" base, uprights at the back, plates on a centre horn) on a dashed turf line. */
export const sled: LineSubject = {
  build: (simple) => {
    // An agility ladder laid flat, receding toward a vanishing point above the frame, with two cones.
    const near = 17,
      far = -5,
      wn = 14,
      wf = 7
    const xAt = (y: number, sd: 1 | -1) =>
      r2(sd * (wf + ((wn - wf) * (y - far)) / (near - far)))
    const rungs = (
      simple ? [0, 0.45, 0.78, 1] : [0, 0.3, 0.54, 0.73, 0.88, 1]
    ).map((t) => r2(near - (near - far) * t))
    const cone = (cx: number, by: number, h: number): El[] => {
      const w = h * 0.42
      return [
        F(
          `M${r2(cx - w)} ${by}L${r2(cx - w * 0.22)} ${r2(by - h)}H${r2(cx + w * 0.22)}L${r2(cx + w)} ${by}Z`
        ),
        SR(r2(cx - w * 1.35), by, r2(w * 2.7), r2(h * 0.14), 0.4),
        L(`M${r2(cx - w * 0.62)} ${r2(by - h * 0.45)}H${r2(cx + w * 0.62)}`),
      ]
    }
    return [
      L(
        `M${xAt(near, -1)} ${near}L${xAt(far, -1)} ${far}M${xAt(near, 1)} ${near}L${xAt(far, 1)} ${far}`
      ),
      ...rungs.map((y) => L(`M${xAt(y, -1)} ${y}H${xAt(y, 1)}`)),
      ...cone(-20, 6, 12),
      ...cone(17, -2, 9),
      ...steps(-23, 19, simple ? 10.5 : 7).map((x) =>
        L(`M${x} 21h${simple ? 5 : 3.6}`)
      ),
    ]
  },
}

/** Coffee cup and saucer, slight three-quarter view: tapered cup, loop handle, coffee surface, steam. */
export const cup: LineSubject = {
  build: (simple) => [
    // The cup stands on the saucer: the saucer top line is the cup's base line (y = 13).
    F("M-21 13a20 4.5 0 0 0 40 0Z"),
    L("M-15 -4a12 3 0 0 0 24 0"),
    F("M-15 -4L-12.6 10a3.6 3.6 0 0 0 3.6 3h12a3.6 3.6 0 0 0 3.6-3L9 -4Z"),
    F("M-15 -4a12 3 0 0 1 24 0a12 3 0 0 1-24 0Z"),
    L("M8.4 -0.4h2.4a4.6 4.6 0 0 1 0 9.2H7.6"),
    L("M-7 -11c-2.4-3 2.4-5.4 0-8.4"),
    ...(simple ? [] : [L("M1 -11c-2.4-3 2.4-5.4 0-8.4")]),
  ],
}

// ---------- Class subjects: the activity or its signature tool ----------

/** Competition kettlebell, front view (282 mm tall, 210 mm bell, 140 mm base, 123 mm window, 33 mm handle). */
export const kettlebellLine: LineSubject = {
  build: (simple) => {
    const R = 16.5,
      cy = 6.44
    const yAt = (x: number) => r2(cy - Math.sqrt(R * R - x * x))
    return [
      F(`M-5.5 22H5.5A${R} ${R} 0 1 0 -5.5 22Z`),
      // The handle: one solid band from shoulder to shoulder around the window.
      S(
        `M-14.6 ${yAt(14.6)}V-15a7 7 0 0 1 7-7H7.6a7 7 0 0 1 7 7V${yAt(14.6)}A${R} ${R} 0 0 0 9.6 ${yAt(9.6)}V-13a4 4 0 0 0-4-4H-5.6a4 4 0 0 0-4 4V${yAt(9.6)}A${R} ${R} 0 0 0 -14.6 ${yAt(14.6)}Z`
      ),
      ...(simple ? [] : [SR(-7, 20.4, 14, 1.6, 0.6)]),
    ]
  },
}

/** Road bike, side view: 700c wheels, 990 mm wheelbase, 73° seat and head angles, drop bars; it rides right. */
export const roadBike: LineSubject = {
  build: (simple) => {
    const k = 0.0289,
      hy = 7,
      R = r2(335 * k),
      rear = -14.3,
      front = 14.3
    const rad = (d: number) => (d * Math.PI) / 180
    // Axis of the seat tube and head tube, pointing up and back at 73°.
    const up73 = [-Math.cos(rad(73)), -Math.sin(rad(73))] as const
    const along = (p: readonly [number, number], mm: number) =>
      [r2(p[0] + up73[0] * mm * k), r2(p[1] + up73[1] * mm * k)] as const
    const bb = [r2(rear + 405 * k), r2(hy + 70 * k)] as const
    const seat = along(bb, 540)
    const headTop = [r2(bb[0] + 395 * k), r2(bb[1] - 565 * k)] as const
    const headLow = along(headTop, -150)
    // Steerer with 40 mm of spacers and a 40 mm stem clamp; a 100 mm stem pointing 3° down.
    const spacerTop = along(headTop, 40),
      stemAxis = along(headTop, 60)
    const sa = rad(3),
      clamp = [
        r2(stemAxis[0] + 100 * k * Math.cos(sa)),
        r2(stemAxis[1] + 100 * k * Math.sin(sa)),
      ] as const
    // Drop bar as the reference icons draw it: one smooth stroke. Short tops run forward from the clamp,
    // the bend sweeps forward and down, and the drop ends in a short tail that points back to the rider.
    // About 1.3 × the real 70 mm reach and 128 mm drop, so the bend reads at 96 px. No hood or lever.
    const [cx, cy] = clamp,
      top = 1.4,
      drop = 4.8
    const bar = `M${cx} ${cy}h${top}C${r2(cx + top + 3.2)} ${cy} ${r2(cx + top + 3.7)} ${r2(cy + 3.3)} ${r2(cx + top + 1)} ${r2(cy + drop)}L${r2(cx + 0.4)} ${r2(cy + drop + 0.3)}`
    // Seatpost continues the seat tube; a small clamp at the cluster; a nearly level saddle on the rails.
    const post = along(seat, 200),
      clampLow = along(seat, -4)
    const [px, py] = post
    const saddle = `M${r2(px - 4.4)} ${r2(py - 0.9)}C${r2(px - 2.4)} ${r2(py - 1.5)} ${r2(px + 1)} ${r2(py - 1.1)} ${r2(px + 3.6)} ${r2(py - 0.7)}C${r2(px + 3.9)} ${r2(py - 0.4)} ${r2(px + 3.6)} ${r2(py - 0.1)} ${r2(px + 3.2)} ${r2(py - 0.1)}C${r2(px + 1)} ${r2(py + 0.1)} ${r2(px - 2.4)} ${r2(py + 0.3)} ${r2(px - 4.2)} ${r2(py - 0.1)}Z`
    const tyre = (x: number): El =>
      F(
        `M${x - R} ${hy}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0ZM${x - R + 1.6} ${hy}a${R - 1.6} ${R - 1.6} 0 1 1 ${2 * (R - 1.6)} 0a${R - 1.6} ${R - 1.6} 0 1 1 ${-2 * (R - 1.6)} 0Z`,
        "evenodd"
      )
    const ca = rad(60),
      crank = [
        r2(bb[0] + 170 * k * Math.sin(ca)),
        r2(bb[1] + 170 * k * Math.cos(ca)),
      ] as const
    const ht = (
      a: readonly [number, number],
      b: readonly [number, number],
      w: number
    ) => {
      const nx = r2(-up73[1] * w),
        ny = r2(up73[0] * w)
      return `M${r2(a[0] - nx)} ${r2(a[1] - ny)}L${r2(b[0] - nx)} ${r2(b[1] - ny)}L${r2(b[0] + nx)} ${r2(b[1] + ny)}L${r2(a[0] + nx)} ${r2(a[1] + ny)}Z`
    }
    return shift(0, -2, [
      tyre(rear),
      tyre(front),
      dot(rear, hy, 1.1),
      dot(front, hy, 1.1),
      // Chainstay, seat tube and seatstay; top tube and down tube meet the head tube.
      L(
        `M${rear} ${hy}L${bb[0]} ${bb[1]}M${bb[0]} ${bb[1]}L${seat[0]} ${seat[1]}M${seat[0]} ${seat[1]}L${rear} ${hy}`
      ),
      L(
        `M${seat[0]} ${seat[1]}L${along(headTop, -12)[0]} ${along(headTop, -12)[1]}M${along(headLow, 15)[0]} ${along(headLow, 15)[1]}L${bb[0]} ${bb[1]}`
      ),
      // Fork with rake below the head tube.
      L(
        `M${headLow[0]} ${headLow[1]}Q${r2(front - 1.4)} ${r2(hy - 2.6)} ${front} ${hy}`
      ),
      F(ht(headLow, headTop, 0.6)),
      S(ht(headTop, spacerTop, 0.45)),
      // Stem: a line from the spacers that runs straight into the bar.
      L(
        `M${spacerTop[0]} ${spacerTop[1]}L${stemAxis[0]} ${stemAxis[1]}L${cx} ${cy}`
      ),
      L(bar),
      L(`M${clampLow[0]} ${clampLow[1]}L${px} ${py}`),
      S(ht(clampLow, along(seat, 12), 0.5)),
      F(saddle),
      FO(bb[0], bb[1], 3.2),
      L(`M${bb[0]} ${bb[1]}L${crank[0]} ${crank[1]}`),
      SR(r2(crank[0] - 1.6), r2(crank[1] - 0.5), 3.2, 1, 0.4),
      ...(simple ? [] : [dot(bb[0], bb[1], 0.8)]),
    ])
  },
}

/** Mechanical stopwatch, front view: case, crown with ring, a side pusher, dial with ticks, hand at 60°. */
export const stopwatchLine: LineSubject = {
  build: (simple) => {
    const cy = 4,
      r = 17,
      a = Math.PI / 3
    const tick = (i: number) => {
      const t = (i * Math.PI) / 6,
        len = i % 3 === 0 ? 3 : 1.8
      return L(
        `M${r2(Math.sin(t) * 13.4)} ${r2(cy - Math.cos(t) * 13.4)}L${r2(Math.sin(t) * (13.4 - len))} ${r2(cy - Math.cos(t) * (13.4 - len))}`
      )
    }
    return [
      O(0, -22, 2),
      SR(-2, -20.2, 4, 3.6, 0.8),
      SR(-3.6, -17.4, 7.2, 2.4, 0.8),
      // The pusher at 10:30: a short stem from inside the case out along the radius, with a cap.
      S(
        `M${r2(-Math.SQRT1_2 * 15.6 - 1.2 * Math.SQRT1_2)} ${r2(cy - Math.SQRT1_2 * 15.6 + 1.2 * Math.SQRT1_2)}L${r2(-Math.SQRT1_2 * 20 - 1.2 * Math.SQRT1_2)} ${r2(cy - Math.SQRT1_2 * 20 + 1.2 * Math.SQRT1_2)}L${r2(-Math.SQRT1_2 * 20 + 1.2 * Math.SQRT1_2)} ${r2(cy - Math.SQRT1_2 * 20 - 1.2 * Math.SQRT1_2)}L${r2(-Math.SQRT1_2 * 15.6 + 1.2 * Math.SQRT1_2)} ${r2(cy - Math.SQRT1_2 * 15.6 - 1.2 * Math.SQRT1_2)}Z`
      ),
      FO(0, cy, r),
      {
        k: "circle",
        cx: 0,
        cy,
        r: 14.2,
        fill: "tint",
        stroke: "f5",
        hair: true,
      },
      ...(simple ? [0, 3, 6, 9] : steps(0, 11, 1)).map(tick),
      L(`M0 ${cy}L${r2(10.6 * Math.sin(a))} ${r2(cy - 10.6 * Math.cos(a))}`),
      L(`M0 ${cy}L${r2(-3 * Math.sin(a))} ${r2(cy + 3 * Math.cos(a))}`),
      dot(0, cy, 1.6),
    ]
  },
}

/** Balanced river stones: four smooth, flattened stones of different shapes, each resting on the one below. */
export const stones: LineSubject = {
  build: () => [
    F(
      "M-19 17.5c0-4 6-6.5 15-6.8 9.6-0.3 18 1.6 21.8 4.6 1.6 1.4 0.4 4.4-4 5.6-6 1.6-18 1.8-25 0.6-5-0.8-7.8-2.2-7.8-4Z"
    ),
    F(
      "M-13.6 7.2c0-3.6 5-5.8 12.4-6 7-0.2 13.6 1.6 14.6 4.2 0.8 2.4-2.4 4.8-9.4 5.4-8.2 0.6-17.6-0.2-17.6-3.6Z"
    ),
    F(
      "M-8 -3.4c0-3.2 3.4-5 8.2-5 5.4 0 9.4 1.8 9.4 4.4 0 2.6-3.6 4.4-9 4.4-5 0-8.6-1.4-8.6-3.8Z"
    ),
    F(
      "M-4.6 -12.4c0-2.6 2-4.2 4.8-4.2 3 0 5 1.4 5 3.8 0 2.4-2.2 3.8-5 3.8-2.8 0-4.8-1.2-4.8-3.4Z"
    ),
  ],
}

/** A water drop (tip at 60°) with two waves inside, the lower part filled as water. */
export const dropLine: LineSubject = {
  build: (simple) => [
    L("M0 -22L11.6 -2A13.4 13.4 0 1 1 -11.6 -2Z"),
    F(
      "M-13.2 6.4c3 0 3-2.2 6.6-2.2s3.6 2.2 6.6 2.2 3-2.2 6.6-2.2 3.6 2.2 6.6 2.2A13.4 13.4 0 0 1 -13.2 6.4Z"
    ),
    ...(simple
      ? []
      : [L("M-8 12c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6")]),
  ],
}

/** Pickleball paddle (16" × 7.75", 5" handle) and an outdoor ball (2.9", 40 holes; seven shown). */
export const paddleAndBall: LineSubject = {
  build: (simple) => [
    F(
      "M-17 -16a6 6 0 0 1 6-6h10a6 6 0 0 1 6 6v18a5 5 0 0 1-5 5h-12a5 5 0 0 1-5-5Z"
    ),
    ...(simple ? [] : [L("M-14.4 -15a4 4 0 0 1 4-4.4h8.8a4 4 0 0 1 4 4.4")]),
    SR(-8.4, 7, 4.8, 13, 1.6),
    SR(-9.2, 19.4, 6.4, 2.6, 1.2),
    FO(13.6, 14.6, 6.4),
    dot(13.6, 14.6, 1),
    ...(simple
      ? []
      : [0, 1, 2, 3, 4, 5].map((i) =>
          dot(
            r2(13.6 + 3.8 * Math.cos((i * Math.PI) / 3)),
            r2(14.6 + 3.8 * Math.sin((i * Math.PI) / 3)),
            0.85
          )
        )),
  ],
}

/** Foam roller (18" × 6"), lying, three-quarter view: the visible end with its hollow core, ridges on the body. */
export const roller: LineSubject = {
  build: (simple) => [
    F("M-15 -8H18a3.4 8 0 0 1 0 16H-15Z"),
    ...(simple ? [-3, 7] : [-8, -3, 2, 7, 12]).map((x) =>
      L(`M${x} -8a3.4 8 0 0 1 0 16`)
    ),
    F("M-18.4 0a3.4 8 0 1 0 6.8 0a3.4 8 0 1 0 -6.8 0Z"),
    S("M-16.4 0a1.4 3.4 0 1 0 2.8 0a1.4 3.4 0 1 0 -2.8 0Z"),
  ],
}

/** Diamond kite (spar at a third of the spine) with a long tail that flows away to the right, bows along it. */
export const kiteLine: LineSubject = {
  build: (simple) => {
    const kx = -8,
      top = -24,
      bot = 10,
      spar = top + (bot - top) / 3,
      hw = 11
    const p0 = [kx, bot] as const,
      c1 = [kx + 1, bot + 14] as const,
      c2 = [kx + 22, bot + 14] as const,
      p3 = [kx + 31, bot - 2] as const
    const at = (t: number) => {
      const u = 1 - t
      return [
        u ** 3 * p0[0] +
          3 * u * u * t * c1[0] +
          3 * u * t * t * c2[0] +
          t ** 3 * p3[0],
        u ** 3 * p0[1] +
          3 * u * u * t * c1[1] +
          3 * u * t * t * c2[1] +
          t ** 3 * p3[1],
      ] as const
    }
    const bow = ([x, y]: readonly [number, number]): El[] => [
      S(`M${r2(x)} ${r2(y)}l-3.4 -2v4Z`),
      S(`M${r2(x)} ${r2(y)}l3.4 -2v4Z`),
    ]
    return [
      F(`M${kx} ${top}L${kx + hw} ${spar}L${kx} ${bot}L${kx - hw} ${spar}Z`),
      L(`M${kx} ${top}V${bot}M${kx - hw} ${spar}H${kx + hw}`),
      L(
        `M${p0[0]} ${p0[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p3[0]} ${p3[1]}`
      ),
      ...(simple ? [0.55] : [0.25, 0.55, 0.85]).flatMap((t) => bow(at(t))),
    ]
  },
}

/** Drawing helpers shared with the scenes (art.ts) and coach marks (marks.ts). */
export const kit = { L, F, S, FR, SR, FO, O, dot, shift, steps, water, r2 }
