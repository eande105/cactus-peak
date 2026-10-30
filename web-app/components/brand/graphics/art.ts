import {
  byClass,
  parseRatio,
  place,
  type RatioClass,
  ratioClass,
  rect,
} from "./engine"
import * as LS from "./lines"
import type { Drawing, El, Tone } from "./types"

/*
 * Space art: scene illustrations in the line style of the space and class graphics.
 * - Field: one flat tint of the tone. No skyline, ridges or tonal bands.
 * - Place: a wall line, a floor line and floor seams in one-point perspective, all as lines.
 * - Objects: strong outlines, mid-tint surfaces, small solid parts, drawn from real references
 *   (see references.md). The main object sits on the visual centre; secondary objects add depth.
 * - Ratio: the canvas is 100 units high and 100 × ratio wide. Repeats (windows, panels, lanes, bikes)
 *   are counted from the width, objects keep their proportions, and side objects drop out when the
 *   frame is too narrow. `simple` drops small objects and fine repeats for thumbnails.
 */

const { L, F, S, FR, SR, FO, dot, r2 } = LS.kit
const SQ3 = Math.sqrt(3)

export type ArtCtx = {
  W: number
  H: number
  r: number
  c: RatioClass
  simple: boolean
}

// ---------- Perspective ----------

/** One-point perspective for a floor that runs from the bottom edge (t = 0) back to the wall line (t = 1). */
function floorOf(x: ArtCtx, hz: number) {
  const vx = x.W / 2,
    vy = hz - (x.H - hz) * 1.6
  const f = (hz - vy) / (x.H - vy)
  const scale = (t: number) => 1 / (1 + t * (1 / f - 1))
  /** Screen point for lateral offset X (units at the bottom edge) and depth t. */
  const p = (X: number, t: number) =>
    [r2(vx + X * scale(t)), r2(vy + (x.H - vy) * scale(t))] as const
  return { p, scale, vx, f }
}
const line = (a: readonly [number, number], b: readonly [number, number]) =>
  L(`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`)
/** Evenly spaced positions across [x0, x1], centred, every `step`. */
function across(x0: number, x1: number, step: number): number[] {
  const n = Math.max(1, Math.floor((x1 - x0) / step))
  const start = x0 + (x1 - x0 - (n - 1) * step) / 2
  return Array.from({ length: n }, (_, i) => r2(start + i * step))
}
const hzOf = (c: RatioClass) =>
  byClass(c, { wide: 58, land: 58, square: 56, tall: 54 })
/** Uniform scale for a 48-unit subject so it is `h` units tall. */
const sz = (h: number) => h / 48

// ---------- Shared objects ----------

/** A window: frame, a mid-tint pane and a mullion cross. */
const windowAt = (
  x: number,
  y: number,
  w: number,
  h: number,
  simple: boolean
): El[] => [
  FR(x, y, w, h, 0.6),
  ...(simple
    ? []
    : [
        L(
          `M${r2(x + w / 2)} ${y}V${r2(y + h)}M${x} ${r2(y + h * 0.42)}H${r2(x + w)}`
        ),
      ]),
]

/** A palo verde: a short trunk forking upward, an airy mid-tint canopy. */
const tree = (h: number): El[] => [
  F(
    `M${r2(-h * 0.34)} ${r2(-h * 0.62)}a${r2(h * 0.2)} ${r2(h * 0.16)} 0 0 1 ${r2(h * 0.3)} ${r2(-h * 0.14)}a${r2(h * 0.2)} ${r2(h * 0.17)} 0 0 1 ${r2(h * 0.36)} ${r2(h * 0.04)}a${r2(h * 0.16)} ${r2(h * 0.14)} 0 0 1 ${r2(h * 0.04)} ${r2(h * 0.26)}c${r2(-h * 0.2)} ${r2(h * 0.07)} ${r2(-h * 0.5)} ${r2(h * 0.07)} ${r2(-h * 0.7)} ${r2(-h * 0.16)}Z`
  ),
  L(
    `M0 0V${r2(-h * 0.3)}L${r2(-h * 0.14)} ${r2(-h * 0.52)}M0 ${r2(-h * 0.3)}L${r2(h * 0.16)} ${r2(-h * 0.5)}`
  ),
]

// ---------- Interior scenes ----------

function lapPool(x: ArtCtx): El[] {
  const hz = hzOf(x.c),
    fl = floorOf(x, hz)
  const els: El[] = []
  // Far wall: tall windows and the pace clock above the centre lane.
  if (!x.simple)
    for (const wx of across(2, x.W - 2, 24))
      if (Math.abs(wx - x.W / 2) > 9)
        els.push(...windowAt(wx - 5.5, hz - 38, 11, 28, false))
  const cy = x.simple ? hz - 22 : 11,
    cr = x.simple ? 10 : 6.4
  els.push(
    FO(x.W / 2, cy, cr),
    L(
      `M${x.W / 2} ${cy}V${r2(cy - cr * 0.62)}M${x.W / 2} ${cy}l${r2(cr * 0.46)} ${r2(cr * 0.25)}`
    ),
    dot(x.W / 2, cy, 0.8)
  )
  els.push(L(`M0 ${hz}H${x.W}`), L(`M0 ${hz + 2.4}H${x.W}`))
  // Lanes converge on the vanishing point; lane ropes are rows of floats.
  const half = x.W * 0.62,
    laneW = x.simple ? 44 : 30,
    n = Math.max(3, Math.round((2 * half) / laneW))
  const lanes = Array.from(
    { length: n + 1 },
    (_, i) => -half + (i * 2 * half) / n
  )
  for (const [i, X] of lanes.entries()) {
    const near = fl.p(X, 0),
      far = fl.p(X, 1)
    if (i === 0 || i === n) {
      els.push(line(near, far))
      continue
    }
    if (x.simple) {
      els.push(line(near, far))
      continue
    }
    for (let k = 0; k < 14; k++) {
      const t = k / 14,
        [px, py] = fl.p(X, t),
        sc = fl.scale(t)
      els.push(
        k % 3 === 0
          ? SR(
              r2(px - 0.9 * sc),
              r2(py - 0.6 * sc),
              r2(1.8 * sc),
              r2(1.2 * sc),
              0.5
            )
          : {
              k: "rect",
              x: r2(px - 0.9 * sc),
              y: r2(py - 0.6 * sc),
              w: r2(1.8 * sc),
              h: r2(1.2 * sc),
              rx: 0.5,
              fill: "mid",
              stroke: "f5",
              hair: true,
            }
      )
    }
  }
  // Starting blocks on the far coping, one per lane.
  if (!x.simple)
    for (let i = 0; i < n; i++) {
      const cx = (lanes[i] + lanes[i + 1]) / 2,
        [bx] = fl.p(cx, 1)
      els.push(
        SR(r2(bx - 1.6), hz - 3, 3.2, 3, 0.4),
        L(`M${r2(bx + 1.2)} ${hz - 3}v-2`)
      )
    }
  // A pool ladder on the near side wall, right of centre.
  const lx = x.W / 2 + Math.min(x.W * 0.32, 40)
  if (!x.simple)
    els.push(
      L(
        `M${r2(lx)} ${x.H}V${x.H - 22}a5 5 0 0 1 10 0V${x.H - 18}M${r2(lx + 7)} ${x.H}V${x.H - 20}a5 5 0 0 1 10 0V${x.H - 16}`
      )
    )
  if (!x.simple)
    els.push(
      FR(r2(lx - 0.4), x.H - 12, 7.8, 2, 0.6),
      FR(r2(lx - 0.4), x.H - 5, 7.8, 2, 0.6)
    )
  if (!x.simple)
    els.push(
      L(
        `M${r2(x.W * 0.2)} ${hz + 14}c2 0 2-1.2 4-1.2s2 1.2 4 1.2M${r2(x.W * 0.62)} ${hz + 26}c2.4 0 2.4-1.4 4.8-1.4s2.4 1.4 4.8 1.4`
      )
    )
  return els
}

function strengthFloor(x: ArtCtx): El[] {
  const hz = hzOf(x.c),
    fl = floorOf(x, hz)
  const els: El[] = []
  // Mirror wall with a few glints.
  for (const [i, mx] of across(1, x.W - 1, x.simple ? 24 : 17).entries()) {
    els.push(FR(r2(mx - 7.8), hz - 38, 15.6, 34, 0.4))
    if (!x.simple && i % 2 === 0)
      els.push(
        L(`M${r2(mx - 4)} ${hz - 14}l5 -8M${r2(mx - 1)} ${hz - 12}l2.6 -4`)
      )
  }
  els.push(L(`M0 ${hz}H${x.W}`))
  // Rubber floor seams in perspective.
  if (!x.simple)
    for (const X of across(-x.W, x.W, 22))
      els.push(line(fl.p(X, 0), fl.p(X, 1)))
  if (!x.simple) els.push(L(`M0 ${fl.p(0, 0.45)[1]}H${x.W}`))
  // The rack and loaded bar on the centre; a flat bench in front left; a plate tree on the right.
  const rs = sz(48),
    ry = hz + 18 - 22 * rs
  els.push(place(x.W / 2, ry, rs, LS.rack.build(x.simple)))
  const side = Math.min(x.W * 0.3, 44)
  if (x.c !== "tall" && !x.simple) {
    const bx = x.W / 2 - side,
      by = x.H - 9
    els.push(
      FR(r2(bx - 12), by - 9, 24, 3.4, 1.4),
      L(`M${r2(bx - 8)} ${by - 5.6}V${by}M${r2(bx + 8)} ${by - 5.6}V${by}`),
      SR(r2(bx - 10.5), by, 5, 1.6, 0.6),
      SR(r2(bx + 5.5), by, 5, 1.6, 0.6)
    )
    const tx = x.W / 2 + side,
      ty = hz + 22
    els.push(
      SR(r2(tx - 0.9), ty - 26, 1.8, 26, 0.4),
      SR(r2(tx - 6), ty, 12, 2, 0.6)
    )
    for (const [k, [dx, dy, r]] of (
      [
        [-4.4, -20, 4.4],
        [4.4, -15, 4.4],
        [-4.4, -8, 5.4],
        [4.4, -6, 5.4],
      ] as const
    ).entries()) {
      if (x.simple && k % 2) continue
      els.push(FO(r2(tx + dx), ty + dy, r), dot(r2(tx + dx), ty + dy, 0.8))
    }
  }
  return els
}

function studio(x: ArtCtx): El[] {
  const hz = hzOf(x.c),
    fl = floorOf(x, hz)
  const els: El[] = []
  // Mirror wall with a barre; one window when there is room. The floor itself is plain.
  const panels = across(1, x.W - 1, x.simple ? 30 : 17)
  const winI =
    x.simple || panels.length < 4 ? -1 : Math.floor(panels.length * 0.15)
  for (const [i, mx] of panels.entries()) {
    const w = x.simple ? 27 : 15.6
    if (i === winI) els.push(...windowAt(r2(mx - w / 2), hz - 40, w, 30, false))
    else els.push(FR(r2(mx - w / 2), hz - 38, w, 34, 0.4))
  }
  if (!x.simple)
    els.push(
      L(`M0 ${hz - 14}H${x.W}`),
      ...across(4, x.W - 4, 30).map((bx) => L(`M${bx} ${hz - 14}v4`))
    )
  els.push(L(`M0 ${hz}H${x.W}`))
  // Four or five yoga mats laid lengthwise into the room with clear gaps. Each is long with rounded
  // corners; some have a rolled-up far end, a foam block or a strap.
  const n = x.simple
    ? x.c === "tall"
      ? 1
      : 2
    : byClass(x.c, { wide: 5, land: 4, square: 3, tall: 2 })
  const pitch = Math.min(34, (x.W * 0.95) / n)
  const mw = Math.min(17, pitch * 0.58)
  const cols = Array.from({ length: n }, (_, i) =>
    r2((i - (n - 1) / 2) * pitch)
  )
  const t0 = 0.08,
    t1 = 0.7
  for (const [i, X] of cols.entries()) {
    const a = fl.p(X - mw / 2, t0),
      b = fl.p(X + mw / 2, t0),
      c = fl.p(X + mw / 2, t1),
      d = fl.p(X - mw / 2, t1)
    els.push({
      k: "path",
      d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${d[0]} ${d[1]}Z`,
      fill: "mid",
      stroke: "f5",
      hair: true,
      join: "round",
    })
    if (x.simple) continue
    const roll = i % 2 === 0
    if (roll) {
      // The rolled end: a short cylinder across the far end of the mat.
      const sc = fl.scale(t1),
        [rx0, ry] = fl.p(X - mw / 2, t1),
        [rx1] = fl.p(X + mw / 2, t1),
        rr = r2(2.6 * sc)
      els.push(FR(rx0, r2(ry - 2 * rr), r2(rx1 - rx0), r2(2 * rr), rr), {
        k: "ellipse",
        cx: r2(rx1 - rr * 0.5),
        cy: r2(ry - rr),
        rx: r2(rr * 0.5),
        ry: rr,
        fill: "f5",
        stroke: "f5",
        hair: true,
      })
    } else {
      // A strap lying across the mat.
      els.push(line(fl.p(X - mw / 2 + 2, 0.42), fl.p(X + mw / 2 - 2, 0.5)))
    }
    if (i % 2 === 1 || n <= 2) {
      // A foam block standing on the near half of the mat.
      const [bx, by] = fl.p(X, 0.22),
        sc = fl.scale(0.22),
        bw = r2(5 * sc),
        bh = r2(7 * sc),
        k = r2(1.8 * sc)
      els.push(
        FR(r2(bx - bw / 2), r2(by - bh), bw, bh, 0.4),
        F(`M${r2(bx - bw / 2)} ${r2(by - bh)}l${k} ${-k}h${bw}l${-k} ${k}Z`)
      )
    }
  }
  return els
}

function cycleStudio(x: ArtCtx): El[] {
  const hz = hzOf(x.c),
    fl = floorOf(x, hz)
  const els: El[] = []
  if (!x.simple)
    els.push(
      FR(4, 8, x.W - 8, 9, 0.6),
      ...across(4, x.W - 4, 16).map((wx) => L(`M${wx} 8v9`))
    )
  els.push(L(`M0 ${hz}H${x.W}`))
  // Rows of identical bikes recede from the front; every row is centred, evenly spaced and staggered
  // half a pitch from the row in front, so no bike covers another. The centre of each row stays clear
  // for the instructor's view line.
  const bike = (cx: number, base: number, h: number, flip = false): El => ({
    k: "g",
    x: r2(cx),
    y: r2(base - 20.6 * sz(h)),
    s: r2(sz(h)),
    ch: [{ k: "g", flipX: flip, ch: LS.studioBikeLine.build(x.simple) }],
  })
  const rows = x.simple ? [0.45] : x.c === "tall" ? [0.42] : [0.3, 0.72]
  const pitch = x.simple ? 56 : x.c === "tall" ? 34 : 44,
    h = x.simple ? 30 : 22
  for (const [ri, t] of [...rows].reverse().entries()) {
    const sc = fl.scale(t),
      [, base] = fl.p(0, t)
    const half = x.W / 2 / sc - 12
    const off = (rows.length - 1 - ri) % 2 ? pitch / 2 : 0
    for (
      let X = off - Math.floor((half + off) / pitch) * pitch;
      X <= half;
      X += pitch
    ) {
      if (Math.abs(X) < pitch * 0.45) continue
      els.push(bike(fl.p(X, t)[0], base, h * sc))
    }
  }
  // The instructor's bike on its raised platform at the front, facing the rows (mirrored).
  const [, pb] = fl.p(0, 0),
    pw = x.simple ? 40 : 34
  els.push(FR(r2(x.W / 2 - pw / 2), r2(pb - 7), pw, 6, 0.6))
  els.push(bike(x.W / 2, pb - 7, x.simple ? 40 : 30, true))
  return els
}

function courts(x: ArtCtx): El[] {
  const hz = hzOf(x.c) - 6,
    fl = floorOf(x, hz)
  const els: El[] = []
  // Fence behind the far baseline: posts, top rail and a chain-link lattice.
  const ft = hz - 26
  if (!x.simple) {
    let d = ""
    for (let sx = -26; sx < x.W + 26; sx += 6)
      d += `M${sx} ${hz}L${r2(sx + 26 / SQ3)} ${ft}M${sx} ${ft}L${r2(sx + 26 / SQ3)} ${hz}`
    els.push({ k: "path", d, fill: "none", stroke: "mid", hair: true })
  }
  els.push(
    L(`M0 ${ft}H${x.W}`),
    ...across(2, x.W - 2, 24).map((px) =>
      SR(r2(px - 0.8), ft, 1.6, hz - ft, 0.4)
    ),
    L(`M0 ${hz}H${x.W}`)
  )
  // Court lines in perspective: baselines, sidelines, kitchen lines and centre lines.
  const hw = Math.min(x.W * 0.44, 70)
  els.push(
    L(
      `M${fl.p(-hw, 0.02).join(" ")}L${fl.p(hw, 0.02).join(" ")}L${fl.p(hw, 0.96).join(" ")}L${fl.p(-hw, 0.96).join(" ")}Z`
    )
  )
  els.push(
    line(fl.p(-hw, 0.36), fl.p(hw, 0.36)),
    line(fl.p(-hw, 0.64), fl.p(hw, 0.64))
  )
  els.push(
    line(fl.p(0, 0.02), fl.p(0, 0.36)),
    line(fl.p(0, 0.64), fl.p(0, 0.96))
  )
  // The net across the middle.
  const sc = fl.scale(0.5),
    [lx, ny] = fl.p(-hw - 2, 0.5),
    [rx2] = fl.p(hw + 2, 0.5),
    nh = 11 * sc
  els.push(FR(lx, r2(ny - nh), r2(rx2 - lx), r2(nh * 0.8), 0.2))
  if (!x.simple)
    for (const mx of across(lx + 1, rx2 - 1, 3))
      els.push(L(`M${mx} ${r2(ny - nh)}v${r2(nh * 0.8)}`))
  els.push(
    SR(lx, r2(ny - nh - 1), r2(rx2 - lx), 1.6, 0.6),
    SR(r2(lx - 1.6), r2(ny - nh - 2), 1.8, r2(nh + 2), 0.4),
    SR(r2(rx2 - 0.2), r2(ny - nh - 2), 1.8, r2(nh + 2), 0.4)
  )
  // A paddle and ball in the near right corner.
  if (!x.simple)
    els.push(
      place(
        x.W / 2 + Math.min(x.W * 0.3, 40),
        x.H - 16,
        sz(30),
        LS.paddleAndBall.build(x.simple)
      )
    )
  return els
}

function recovery(x: ArtCtx): El[] {
  const hz = hzOf(x.c)
  const els: El[] = []
  // Sauna wall of vertical boards and a two-tier bench across the room.
  if (!x.simple)
    for (const bx of across(0, x.W, 5)) els.push(L(`M${bx} 4V${hz - 18}`))
  const x0 = Math.max(4, x.W * 0.06),
    x1 = x.W - x0
  els.push(
    FR(r2(x0), hz - 18, r2(x1 - x0), 3.2, 0.6),
    FR(r2(x0), hz - 14.8, r2(x1 - x0), 9, 0.2)
  )
  els.push(
    FR(r2(x0), hz - 5.8, r2(x1 - x0), 3.2, 0.6),
    FR(r2(x0), hz - 2.6, r2(x1 - x0), 9, 0.2)
  )
  if (!x.simple)
    els.push(
      L(`M${r2(x0)} ${hz - 10.3}H${r2(x1)}M${r2(x0)} ${hz + 1.9}H${r2(x1)}`)
    )
  els.push(L(`M0 ${hz + 6.4}H${x.W}`))
  // The bucket and ladle on the lower bench.
  els.push(
    place(
      x.W / 2,
      hz - 5.8 - 23 * sz(x.simple ? 30 : 22),
      sz(x.simple ? 30 : 22),
      LS.bucket.build(true)
    )
  )
  if (x.c === "tall" || x.simple) return els
  const gy = x.H - 6
  // Heater (Harvia Cilindro type): a tall cage of stones on short legs, with a wooden guard rail around it.
  const hx = x.W / 2 - Math.min(x.W * 0.3, 42)
  els.push(
    FR(r2(hx - 6), gy - 30, 12, 26, 2),
    L(`M${r2(hx - 4)} ${gy - 4}V${gy}M${r2(hx + 4)} ${gy - 4}V${gy}`)
  )
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 3; col++) {
      els.push({
        k: "ellipse",
        cx: r2(
          hx -
            3.4 +
            col * 3.4 +
            (row % 2 ? 1.7 : 0) -
            (row % 2 && col === 2 ? 3.4 : 0)
        ),
        cy: gy - 26 + row * 4.4,
        rx: 1.4,
        ry: 1.1,
        fill: "f5",
      })
    }
  els.push(
    FR(r2(hx - 11), gy - 22, 22, 2, 0.8),
    L(`M${r2(hx - 10)} ${gy - 20}V${gy}M${r2(hx + 10)} ${gy - 20}V${gy}`)
  )
  // Cold plunge: a round wooden tub with staves and two hoops, water at the top, a short step beside it.
  const tx = x.W / 2 + Math.min(x.W * 0.3, 42),
    tw = 22,
    th = 20
  els.push(
    F(
      `M${r2(tx - tw / 2)} ${gy - th}V${gy - 2}a2 2 0 0 0 2 2H${r2(tx + tw / 2 - 2)}a2 2 0 0 0 2-2V${gy - th}Z`
    )
  )
  els.push(
    L(
      across(tx - tw / 2 + 3, tx + tw / 2 - 3, 4)
        .map((sx) => `M${sx} ${gy - th}V${gy}`)
        .join("")
    )
  )
  els.push(
    SR(r2(tx - tw / 2 - 0.4), gy - th + 4, tw + 0.8, 1.6, 0.4),
    SR(r2(tx - tw / 2 - 0.4), gy - 5, tw + 0.8, 1.6, 0.4)
  )
  els.push(
    F(
      `M${r2(tx - tw / 2)} ${gy - th}a${tw / 2} 2.6 0 0 1 ${tw} 0a${tw / 2} 2.6 0 0 1 ${-tw} 0Z`
    )
  )
  els.push(
    L(
      `M${r2(tx - tw / 2 + 3)} ${gy - th + 0.4}c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1`
    )
  )
  els.push(
    FR(r2(tx - tw / 2 - 9), gy - 9, 8, 9, 0.6),
    L(`M${r2(tx - tw / 2 - 9)} ${gy - 4.5}h8`)
  )
  return els
}

function kidsClub(x: ArtCtx): El[] {
  const hz = hzOf(x.c)
  const els: El[] = []
  // Two windows on the wall.
  for (const wx of [
    x.W / 2 - Math.min(x.W * 0.3, 44),
    x.W / 2 + Math.min(x.W * 0.3, 44),
  ])
    els.push(...windowAt(r2(wx - 9), hz - 40, 18, 22, x.simple))
  const gy = hz + 18
  els.push(L(`M0 ${hz}H${x.W}`), L(`M0 ${gy + 0.6}H${x.W}`))
  // The slide on the centre.
  els.push(
    place(
      x.W / 2 + 2,
      gy - 20.6 * sz(54),
      sz(54),
      LS.climbingFrame.build(x.simple)
    )
  )
  if (x.c !== "tall" && !x.simple) {
    // Soft-play blocks on the left: a cube, a wedge and a cylinder.
    const bx = x.W / 2 - Math.min(x.W * 0.36, 52)
    els.push(
      FR(r2(bx - 10), gy - 9, 9, 9, 1),
      L(
        `M${r2(bx - 10)} ${gy - 9}l2.4 -2.4h9l-2.4 2.4M${r2(bx + 1.4)} ${gy - 11.4}v9l-2.4 2.4`
      )
    )
    els.push(F(`M${r2(bx + 3)} ${gy}h11l-11 -8Z`))
    if (!x.simple)
      els.push(
        F(`M${r2(bx - 6)} ${gy - 9}v-6a4 1.4 0 0 1 8 0v6a4 1.4 0 0 1-8 0Z`),
        L(`M${r2(bx - 6)} ${gy - 15}a4 1.4 0 0 0 8 0`)
      )
    // A low table with two stools on the right.
    const tx = x.W / 2 + Math.min(x.W * 0.36, 52)
    els.push(
      FR(r2(tx - 10), gy - 10, 20, 2.4, 0.8),
      L(`M${r2(tx - 8)} ${gy - 7.6}V${gy}M${r2(tx + 8)} ${gy - 7.6}V${gy}`)
    )
    if (!x.simple)
      els.push(
        FR(r2(tx - 15), gy - 6, 5, 1.8, 0.6),
        L(`M${r2(tx - 12.5)} ${gy - 4.2}V${gy}`),
        FR(r2(tx + 10), gy - 6, 5, 1.8, 0.6),
        L(`M${r2(tx + 12.5)} ${gy - 4.2}V${gy}`)
      )
  }
  return els
}

function deck(x: ArtCtx): El[] {
  const hz = hzOf(x.c) + 2,
    fl = floorOf(x, hz)
  const els: El[] = []
  // The sun with 60° rays, and a shade sail on posts.
  const sx = x.W / 2 + Math.min(x.W * 0.28, 36)
  els.push(S(`M${r2(sx - 7)} 18a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z`))
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2
    els.push(
      L(
        `M${r2(sx + 10 * Math.cos(a))} ${r2(18 + 10 * Math.sin(a))}L${r2(sx + 13 * Math.cos(a))} ${r2(18 + 13 * Math.sin(a))}`
      )
    )
  }
  const ax = x.W / 2 - Math.min(x.W * 0.34, 46),
    bx = x.W / 2 + Math.min(x.W * 0.08, 10)
  if (!x.simple)
    els.push(
      F(`M${r2(ax)} 12L${r2(bx)} 20L${r2((ax + bx) / 2 - 4)} 30Z`),
      L(`M${r2(ax)} 12V${hz}M${r2(bx)} 20V${hz}`)
    )
  // The rail along the deck edge.
  els.push(
    FR(0, hz - 16, x.W, 2.6, 0.8),
    ...across(1, x.W - 1, x.simple ? 9 : 4.5).map((px) =>
      L(`M${px} ${hz - 13.4}V${hz}`)
    ),
    L(`M0 ${hz}H${x.W}`)
  )
  // Deck boards in perspective.
  if (!x.simple)
    for (const X of across(-x.W, x.W, 16))
      els.push(line(fl.p(X, 0), fl.p(X, 1)))
  // Two loungers on the deck, side view: frame, cushion and a raised back.
  const lounger = (cx: number, by: number, s: number): El[] => [
    F(
      `M${r2(cx - 14 * s)} ${r2(by - 6 * s)}H${r2(cx + 6 * s)}L${r2(cx + 13 * s)} ${r2(by - 15 * s)}l${r2(2.4 * s)} ${r2(1.6 * s)}L${r2(cx + 8 * s)} ${r2(by - 3.4 * s)}H${r2(cx - 14 * s)}Z`
    ),
    L(
      `M${r2(cx - 12 * s)} ${r2(by - 3.4 * s)}V${by}M${r2(cx + 6 * s)} ${r2(by - 3.4 * s)}V${by}`
    ),
  ]
  const ly = x.H - 8
  if (x.c === "tall") els.push(...lounger(x.W / 2, ly, 1.5))
  else
    els.push(
      ...lounger(x.W / 2 - 24, ly, 1.5),
      ...lounger(x.W / 2 + 24, ly, 1.5)
    )
  return els
}

// ---------- Club exteriors ----------

type Building = { w: number; h: number; els: (simple: boolean) => El[] }

/** A row of windows with mid-tint panes. */
const winRow = (
  x0: number,
  x1: number,
  y: number,
  w: number,
  h: number,
  step: number,
  simple: boolean
): El[] =>
  across(x0, x1, simple ? step * 1.5 : step).map((wx) =>
    FR(r2(wx - w / 2), y, w, h, 0.4)
  )

const buildings: Record<string, Building> = {
  "mesa-dobson": {
    w: 120,
    h: 40,
    els: (simple) => [
      // The long flagship: two wings and a tall glass entrance hall with a canopy and a sign bar.
      FR(-60, -22, 46, 22, 0.4),
      FR(14, -22, 46, 22, 0.4),
      ...winRow(-58, -16, -16, 4, 10, 7, simple),
      ...winRow(16, 58, -16, 4, 10, 7, simple),
      FR(-14, -40, 28, 40, 0.4),
      ...(simple ? [] : [L("M-7 -34V-6M0 -34V-6M7 -34V-6M-14 -20H14")]),
      SR(-10, -38.4, 20, 3, 0.6),
      SR(-18, -8, 36, 2.4, 0.6),
      FR(-4, -5.6, 8, 5.6, 0.2),
    ],
  },
  "mesa-red-mountain": {
    w: 112,
    h: 30,
    els: (simple) => [
      // A low club building on the left and the outdoor pool under shade sails on the right.
      FR(-56, -20, 50, 20, 0.4),
      ...winRow(-54, -22, -14, 4, 9, 7, simple),
      SR(-20, -10, 10, 2, 0.6),
      FR(-18, -8, 6, 8, 0.2),
      SR(-50, -24, 22, 2.4, 0.6),
      L("M2 0V-24M30 0V-28M56 0V-24"),
      F("M2 -24L30 -28L18 -18Z"),
      F("M30 -28L56 -24L42 -17Z"),
      F(
        "M0 0V-4c3 0 3-1.4 6-1.4s3 1.4 6 1.4 3-1.4 6-1.4 3 1.4 6 1.4 3-1.4 6-1.4 3 1.4 6 1.4 3-1.4 6-1.4 3 1.4 6 1.4 3-1.4 6-1.4V0Z"
      ),
      ...(simple ? [] : [L("M0 -7.4H58")]),
    ],
  },
  "mesa-downtown": {
    w: 72,
    h: 48,
    els: (simple) => [
      // A two-storey brick block: courses on the upper floor, lit studio windows, a shopfront and door.
      FR(-34, -44, 68, 44, 0.4),
      SR(-36, -46, 72, 2.4, 0.6),
      ...(simple
        ? []
        : [-40, -36, -32, -28, -24].map((y) => L(`M-34 ${y}H34`))),
      ...winRow(-30, 30, -38, 7, 12, 11, simple),
      SR(-34, -22, 68, 2, 0.4),
      ...winRow(-30, -8, -17, 8, 11, 11, simple),
      ...winRow(8, 30, -17, 8, 11, 11, simple),
      FR(-4.4, -15, 8.8, 15, 0.2),
      SR(-8, -18, 16, 2.4, 0.6),
    ],
  },
  "gilbert-val-vista": {
    w: 112,
    h: 32,
    els: (simple) => [
      // The club with its splash pad in front and a court fence to the left.
      FR(-36, -24, 64, 24, 0.4),
      ...winRow(-34, 0, -18, 4, 10, 7, simple),
      FR(6, -14, 12, 14, 0.2),
      SR(2, -17, 20, 2.4, 0.6),
      SR(-30, -28, 26, 2.4, 0.6),
      L("M-56 0V-14M-46 0V-14M-40 0V-14M-56 -14H-40"),
      ...(simple
        ? []
        : [
            L(
              "M-56 -10l4 -4M-52 -10l4 -4M-48 -10l4 -4M-56 -4l10 -10M-50 0l10 -10"
            ),
          ]),
      { k: "g", x: 44, y: -8, s: 0.36, ch: LS.fountain.build(true) },
    ],
  },
  "gilbert-heritage": {
    w: 104,
    h: 48,
    els: (simple) => [
      // The Gilbert water tower behind on the left; the club with a rooftop deck and pergola.
      L("M-48 0L-44 -26M-34 0L-38 -26"),
      ...(simple ? [] : [L("M-47 -8L-35 -16M-35 -8L-47 -16")]),
      F("M-49 -26V-36a8 4 0 0 1 16 0V-26Z"),
      F("M-49 -36L-41 -44L-33 -36Z"),
      FR(-26, -28, 78, 28, 0.4),
      ...winRow(-22, 48, -22, 5, 10, 8.6, simple),
      FR(-8, -11, 9, 11, 0.2),
      SR(-12, -14, 17, 2.4, 0.6),
      // Rooftop deck: rail with balusters and a pergola.
      FR(6, -34, 44, 1.8, 0.4),
      ...(simple
        ? []
        : [10, 14, 18, 22, 26, 30, 34, 38, 42, 46].map((bx) =>
            L(`M${bx} -32.2V-28`)
          )),
      L("M10 -28V-42M44 -28V-42"),
      SR(8, -43.6, 38, 2, 0.6),
    ],
  },
}

/** The part of each building to keep on the centre when a tall frame crops it (local x). */
const focusX: Record<string, number> = {
  "mesa-dobson": 0,
  "mesa-red-mountain": 16,
  "mesa-downtown": 0,
  "gilbert-val-vista": 0,
  "gilbert-heritage": 2,
}

function exterior(slug: string) {
  return (x: ArtCtx): El[] => {
    const b = buildings[slug]
    const tall = x.c === "tall"
    // Tall frames bring the viewpoint closer: the ground sits in the lower third, the building is scaled
    // up (its ends may crop), and the sun and trees rise into the upper half.
    const gy = tall
      ? 72
      : x.H - byClass(x.c, { wide: 18, land: 18, square: 20, tall: 22 })
    const els: El[] = [L(`M0 ${gy}H${x.W}`), L(`M0 ${gy + 7}H${x.W}`)]
    if (!x.simple)
      els.push(
        ...across(4, x.W - 4, 14).map((dx) => L(`M${r2(dx - 3)} ${gy + 13}h6`))
      )
    const target = tall
      ? 44
      : byClass(x.c, { wide: 50, land: 48, square: 44, tall: 40 })
    const s = Math.min(target / b.h, (x.W * (tall ? 1.9 : 0.82)) / b.w)
    const bx = x.W / 2 - (tall ? (focusX[slug] ?? 0) * s : 0)
    if (tall && !x.simple) {
      const sx = x.W * 0.78,
        sy = 14
      els.push(
        S(`M${r2(sx - 5.6)} ${sy}a5.6 5.6 0 1 0 11.2 0a5.6 5.6 0 1 0 -11.2 0Z`)
      )
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2
        els.push(
          L(
            `M${r2(sx + 8 * Math.cos(a))} ${r2(sy + 8 * Math.sin(a))}L${r2(sx + 10.4 * Math.cos(a))} ${r2(sy + 10.4 * Math.sin(a))}`
          )
        )
      }
    }
    els.push(place(r2(bx), gy, s, b.els(x.simple)))
    // Palo verdes at the sides when there is room (in front, tall and cropped in tall frames), a street lamp for Downtown.
    const edge = (b.w / 2) * s
    if (tall && !x.simple) {
      els.push(place(4, gy + 4, 1, tree(50)))
    } else if (!x.simple && x.W / 2 - edge > 14) {
      els.push(
        place(r2(bx - edge - 9), gy, 1, tree(30)),
        place(r2(bx + edge + 9), gy, 1, tree(26))
      )
    }
    if (
      slug === "mesa-downtown" &&
      !x.simple &&
      (tall || x.W / 2 - edge > 10)
    ) {
      const lx = tall ? r2(x.W - 8) : r2(bx + edge + (x.W / 2 - edge) / 2)
      els.push(
        L(`M${lx} ${gy}V${gy - 40}h4`),
        S(`M${r2(lx + 2)} ${gy - 40}h5l-1 2.4h-3Z`)
      )
      if (!tall)
        els.push(
          L(
            `M${r2(bx - edge - 10)} ${gy}v-5a2.6 2.6 0 0 1 5.2 0v5M${r2(bx - edge - 3)} ${gy}v-5a2.6 2.6 0 0 1 5.2 0v5`
          )
        )
    }
    return els
  }
}

export const spaceArt = {
  "lap-pool": {
    label: "Lap pool",
    tone: "teal",
    build: lapPool,
    brief:
      "Lanes with float ropes converging on the far wall, starting blocks, the pace clock, tall windows and a ladder.",
  },
  "strength-floor": {
    label: "Strength floor",
    tone: "copper",
    build: strengthFloor,
    brief:
      "A loaded rack on the centre, a flat bench, a plate tree, the mirror wall and rubber floor seams.",
  },
  studio: {
    label: "Studio",
    tone: "sage",
    build: studio,
    brief:
      "Mats in two rows with blocks, a mirror wall with a barre, a window and a rolled mat.",
  },
  "cycle-studio": {
    label: "Cycle studio",
    tone: "night",
    build: cycleStudio,
    brief:
      "A podium bike on its platform, two rows of studio bikes, a ribbon window.",
  },
  courts: {
    label: "Courts",
    tone: "gold",
    build: courts,
    brief:
      "Court lines in perspective, the net, a chain-link fence, a paddle and ball in front.",
  },
  recovery: {
    label: "Recovery",
    tone: "plum",
    build: recovery,
    brief:
      "Sauna boards, a two-tier bench with the bucket, the stove with stones and a cold plunge tub.",
  },
  "kids-club": {
    label: "Kids club",
    tone: "rose",
    build: kidsClub,
    brief:
      "The slide on the centre, soft-play blocks, a low table with stools, two windows.",
  },
  deck: {
    label: "Outdoor deck",
    tone: "copper",
    build: deck,
    brief: "The deck rail, two loungers, a shade sail on posts and the sun.",
  },
  "exterior-mesa-dobson": {
    label: "Mesa – Dobson exterior",
    tone: "teal",
    build: exterior("mesa-dobson"),
    brief:
      "The long flagship with a tall glass entrance hall, canopy and sign bar.",
  },
  "exterior-mesa-red-mountain": {
    label: "Mesa – Red Mountain exterior",
    tone: "copper",
    build: exterior("mesa-red-mountain"),
    brief: "A low building beside the outdoor pool under two shade sails.",
  },
  "exterior-mesa-downtown": {
    label: "Mesa – Downtown exterior",
    tone: "night",
    build: exterior("mesa-downtown"),
    brief:
      "A two-storey brick block with lit studios, a shopfront, bike racks and a street lamp.",
  },
  "exterior-gilbert-val-vista": {
    label: "Gilbert – Val Vista exterior",
    tone: "gold",
    build: exterior("gilbert-val-vista"),
    brief:
      "The club with its splash pad in front and a court fence to the side.",
  },
  "exterior-gilbert-heritage": {
    label: "Gilbert – Heritage exterior",
    tone: "plum",
    build: exterior("gilbert-heritage"),
    brief:
      "A rooftop deck with rail and pergola, the Gilbert water tower behind.",
  },
} as const satisfies Record<
  string,
  { label: string; tone: Tone; build: (x: ArtCtx) => El[]; brief: string }
>

export type SpaceArtId = keyof typeof spaceArt
export const spaceArtIds = Object.keys(spaceArt) as SpaceArtId[]

/** Compose a scene for a ratio. `simple` drops small objects and fine repeats for thumbnails. */
export function buildSpaceArt(
  id: SpaceArtId,
  ratio: string | number,
  simple = false
): Drawing {
  const r = parseRatio(ratio)
  const H = 100,
    W = H * r
  return {
    w: W,
    h: H,
    line: true,
    els: [
      rect(0, 0, W, H, "tint"),
      ...spaceArt[id].build({ W, H, r, c: ratioClass(r), simple }),
    ],
  }
}
