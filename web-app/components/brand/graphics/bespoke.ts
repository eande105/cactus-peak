import {
  circle,
  parseRatio,
  peakTri,
  poly,
  rect,
  repeatX,
  ribRidge,
  SQRT3,
} from "./engine"
import type { Drawing, El, Tone } from "./types"

/*
 * Bespoke graphics: decorative compositions for sections with no matching space, class or coach.
 * Each one is built for the container's real ratio. Four container shapes are named below, but any
 * ratio works. `simple` (the tile shape) drops fine detail so a small tile stays calm.
 */

type Ctx = { W: number; H: number; simple: boolean }

export const containerShapes = {
  band: { label: "Wide band", ratio: 4, exportWidth: 1600 },
  square: { label: "Square", ratio: 1, exportWidth: 640 },
  tall: { label: "Tall card", ratio: 3 / 4, exportWidth: 600 },
  tile: { label: "Small tile", ratio: 1, exportWidth: 128 },
} as const
export type ContainerShape = keyof typeof containerShapes
export const containerShapeIds = Object.keys(
  containerShapes
) as ContainerShape[]

/** Ribs that climb from left to right, each top cut at 60°. The last rib is the summit. */
function ribRise({ W, H, simple }: Ctx): El[] {
  const rib = simple ? 14 : 9,
    pleat = simple ? 6 : 4.5
  const n = Math.max(3, Math.floor((W - 8) / (rib + pleat)))
  const x0 = (W - (n * rib + (n - 1) * pleat)) / 2
  const els: El[] = [rect(0, 0, W, H, "f0")]
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (rib + pleat)
    const top = H * (0.82 - (0.62 * i) / (n - 1))
    els.push(
      poly(
        [
          [x, H],
          [x, top + rib * SQRT3],
          [x + rib, top],
          [x + rib, H],
        ],
        i === n - 1 ? "f5" : i % 2 ? "f2" : "f1"
      )
    )
  }
  return els
}

/** An empty-state peak with a switchback trail and a pennant at the top. */
function switchback({ W, H, simple }: Ctx): El[] {
  const hw = Math.min(W * 0.4, (H * 0.72) / SQRT3)
  const cx = W > H * 2 ? W * 0.7 : W / 2
  const base = H * 0.9,
    apex = base - hw * SQRT3
  const els: El[] = [
    rect(0, 0, W, H, "f0"),
    rect(0, base, W, H - base, "f1"),
    peakTri(cx, base, hw, "f2"),
  ]
  // The trail zigzags inside the peak: legs alternate direction and shrink with the slope.
  const legs = simple ? 3 : 5
  let d = `M${cx - hw * 0.5} ${base - 1}`
  for (let i = 1; i <= legs; i++) {
    const y = base - ((base - apex) * 0.86 * i) / legs
    const half = (base - y) / SQRT3
    const reach = (hw - half) * 0.62
    d += `L${cx + (i % 2 ? reach : -reach)} ${y}`
  }
  els.push({
    k: "path",
    d,
    fill: "none",
    stroke: "paper",
    sw: Math.max(1.2, hw * 0.035),
    cap: "round",
    join: "round",
  })
  const ph = hw * 0.32
  els.push(
    rect(cx - 0.8, apex - ph, 1.6, ph, "ink"),
    poly(
      [
        [cx + 0.8, apex - ph],
        [cx + 0.8, apex - ph * 0.55],
        [cx + 0.8 + ph * 0.39, apex - ph * 0.775],
      ],
      "f5"
    )
  )
  return els
}

/** A bold call-to-action field of 60° chevrons that point up. One leads in paper. */
function chevronClimb({ W, H, simple }: Ctx): El[] {
  const els: El[] = [rect(0, 0, W, H, "f5")]
  const hw = simple ? 18 : 12,
    t = simple ? 6 : 4
  const rowH = hw * SQRT3 * 0.9
  const rows = Math.ceil(H / rowH) + 1
  const lead = {
    col: Math.round((W / 2 - hw) / (hw * 2.6)),
    row: Math.floor(rows / 2),
  }
  for (let r = 0; r < rows; r++) {
    const y = H + hw - r * rowH
    els.push(
      ...repeatX(-hw, W + hw, hw * 2.6, (x, c) => {
        const off = r % 2 ? hw * 1.3 : 0
        const cx = x + off,
          isLead = c === lead.col && r === lead.row
        const top = y - hw * SQRT3
        return [
          poly(
            [
              [cx - hw, y],
              [cx, top],
              [cx + hw, y],
              [cx + hw - t, y],
              [cx, top + t * SQRT3],
              [cx - hw + t, y],
            ],
            isLead ? "paper" : "f4"
          ),
        ]
      })
    )
  }
  return els
}

/** A quote background: an open quote built from two 60° slanted ribs, top left, on a quiet field. */
function quoteRibs({ W, H, simple }: Ctx): El[] {
  const s = Math.min(W, H) * (simple ? 0.5 : 0.34)
  const x = Math.min(W, H) * 0.12,
    y = Math.min(W, H) * 0.12
  const rib = (ox: number): El =>
    poly(
      [
        [ox + s * 0.2, y],
        [ox + s * 0.42, y],
        [ox + s * 0.22, y + s * 0.62],
        [ox, y + s * 0.62],
      ],
      "f3"
    )
  const els: El[] = [rect(0, 0, W, H, "f1")]
  if (!simple)
    els.push(
      ...ribRidge({
        x0: W * 0.5,
        x1: W,
        base: H,
        bottom: H,
        peaks: [{ x: W * 0.92, h: H * 0.34, flat: W * 0.04 }],
        rib: 5,
        pleat: 2.4,
        fill: "f2",
      })
    )
  els.push(rib(x), rib(x + s * 0.5))
  return els
}

/** Topographic contours of two 60° peaks, drawn as rings. */
function contour({ W, H, simple }: Ctx): El[] {
  const els: El[] = [rect(0, 0, W, H, "f0")]
  const sw = simple ? 2.4 : 1.4
  const ring = (cx: number, base: number, hw: number) =>
    `M${cx - hw} ${base}L${cx} ${base - hw * SQRT3}L${cx + hw} ${base}`
  const peaks =
    W > H * 1.5
      ? [
          [W * 0.68, H * 1.05, H * 0.7],
          [W * 0.2, H * 1.05, H * 0.45],
        ]
      : [[W * 0.6, H * 1.02, Math.min(W, H) * 0.62]]
  for (const [cx, base, hw] of peaks) {
    const step = simple ? hw / 3 : hw / 6
    let d = ""
    for (let k = hw; k > step * 0.8; k -= step) d += ring(cx, base, k)
    els.push({ k: "path", d, fill: "none", stroke: "f2", sw, join: "round" })
  }
  return els
}

/** Monsoon rain at 60° over a low rib horizon. */
function monsoon({ W, H, simple }: Ctx): El[] {
  const els: El[] = [rect(0, 0, W, H, "f0")]
  const len = simple ? 12 : 7,
    gap = simple ? 14 : 9
  let d = ""
  for (let r = 0, y = 4; y < H * 0.78; r++, y += gap * 0.9) {
    for (let x = (r % 2) * gap * 0.5 - len; x < W + len; x += gap)
      d += `M${x} ${y}l${-len / 2} ${(len / 2) * SQRT3}`
  }
  els.push({ k: "path", d, fill: "none", stroke: "f2", sw: simple ? 2 : 1.2 })
  els.push(
    ...ribRidge({
      x0: 0,
      x1: W,
      base: H,
      bottom: H,
      peaks: [
        { x: W * 0.3, h: H * 0.22 },
        { x: W * 0.75, h: H * 0.3, flat: W * 0.05 },
      ],
      rib: simple ? 8 : 5,
      pleat: simple ? 4 : 2.4,
      fill: "f3",
    })
  )
  return els
}

/** The offer graphic: a big sun rising in a valley between two rib shoulders, on horizon bands. */
function sunrise({ W, H, simple }: Ctx): El[] {
  const hz = H * 0.66
  // Narrow frames (square, tall, tile) get one shoulder on the left and the sun to the right of centre.
  const narrow = W < H * 1.5
  const r = narrow ? Math.min(H * 0.3, W * 0.26) : Math.min(H * 0.34, W * 0.26)
  const cx = W > H * 2 ? W * 0.66 : narrow ? W * 0.62 : W / 2
  const rib = simple ? 7 : 4.4,
    pleat = simple ? 3.5 : 2.2
  // The shoulders stand clear of the sun: each starts one rib-and-pleat beyond its edge.
  const gapL = cx - r - (rib + pleat),
    gapR = cx + r + (rib + pleat)
  // A shoulder next to the sun and, when the side is wide, a lower one further out. `room` is the side's width.
  const shoulders = (room: number, side: -1 | 1) => {
    const near =
      side === -1
        ? Math.max(room * 0.5, room - H * 0.16)
        : Math.min(room * 0.5, H * 0.16)
    const out = [{ x: near, h: H * 0.24, flat: H * 0.06 }]
    if (room > H * 0.7)
      out.push({
        x: side === -1 ? room - H * 0.6 : H * 0.6,
        h: H * 0.13,
        flat: H * 0.1,
      })
    return out
  }
  return [
    rect(0, 0, W, H, "f0"),
    circle(cx, hz, r, "f3"),
    ...(narrow
      ? ribRidge({
          x0: W * 0.08,
          x1: gapL,
          base: hz,
          bottom: hz,
          peaks: [
            {
              x: (W * 0.08 + gapL) / 2,
              h: H * 0.22,
              flat: Math.max(0, gapL - W * 0.08 - H * 0.16),
            },
          ],
          rib,
          pleat,
          fill: "f4",
        })
      : [
          ...ribRidge({
            x0: 0,
            x1: gapL,
            base: hz,
            bottom: hz,
            peaks: shoulders(gapL, -1),
            rib,
            pleat,
            fill: "f4",
          }),
          ...ribRidge({
            x0: gapR,
            x1: W,
            base: hz,
            bottom: hz,
            peaks: shoulders(W - gapR, 1).map((p) => ({
              ...p,
              x: gapR + p.x,
              h: p.h * 0.8,
            })),
            rib,
            pleat,
            fill: "f4",
          }),
        ]),
    rect(0, hz, W, H - hz, "f1"),
    ...(simple ? [] : [rect(0, hz + (H - hz) * 0.4, W, (H - hz) * 0.6, "f2")]),
  ]
}

/** The brand pattern: a staggered field of small 60° peaks. */
function peakPattern({ W, H, simple }: Ctx): El[] {
  const hw = simple ? 9 : 5.5
  const els: El[] = [rect(0, 0, W, H, "f0")]
  const rowH = hw * SQRT3 + hw * 0.9
  for (let r = 0, y = hw * SQRT3 + 4; y < H + rowH; r++, y += rowH) {
    els.push(
      ...repeatX(-hw, W + hw, hw * 3.2, (x, c) => [
        peakTri(
          x + (r % 2 ? hw * 1.6 : 0),
          y,
          hw,
          (r + c) % 7 === 3 ? "f4" : "f1"
        ),
      ])
    )
  }
  return els
}

export const brandGraphics = {
  "rib-rise": {
    label: "Rib rise",
    tone: "copper",
    build: ribRise,
    use: "Callout band, progress or 'climb at your own pace' moments.",
  },
  switchback: {
    label: "Switchback",
    tone: "sand",
    build: switchback,
    use: "Empty states: nothing booked yet, no results.",
  },
  "chevron-climb": {
    label: "Chevron climb",
    tone: "copper",
    build: chevronClimb,
    use: "A bold call to action band (join, book a tour).",
  },
  "quote-ribs": {
    label: "Quote ribs",
    tone: "sage",
    build: quoteRibs,
    use: "Behind a member or coach quote.",
  },
  contour: {
    label: "Contour",
    tone: "teal",
    build: contour,
    use: "Quiet background for a split section or a form.",
  },
  monsoon: {
    label: "Monsoon",
    tone: "night",
    build: monsoon,
    use: "Weather, hours and seasonal notices; a night band.",
  },
  sunrise: {
    label: "Sunrise",
    tone: "gold",
    build: sunrise,
    use: "Offers and early-morning messages.",
  },
  "peak-pattern": {
    label: "Peak pattern",
    tone: "copper",
    build: peakPattern,
    use: "Repeating pattern for small tiles, merch and app placeholders.",
  },
} as const satisfies Record<
  string,
  { label: string; tone: Tone; build: (c: Ctx) => El[]; use: string }
>

export type BrandGraphicId = keyof typeof brandGraphics
export const brandGraphicIds = Object.keys(brandGraphics) as BrandGraphicId[]

export function buildBrandGraphic(
  id: BrandGraphicId,
  ratio: string | number,
  simple = false
): Drawing {
  const r = parseRatio(ratio)
  const H = 100,
    W = H * r
  return { w: W, h: H, els: brandGraphics[id].build({ W, H, simple }) }
}
