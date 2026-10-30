import { type ObjectId, objects } from "./objects"
import type { Drawing, El, ObjPaint } from "./types"

/*
 * The five object compositions (VISUAL-IDENTITY.md, section 4): Rack, Set, Row, Crop and Tile.
 * Objects never float at random; every placement goes through one of these.
 * The canvas is 100 units high and 100 × ratio wide, so each composition is drawn for its real
 * ratio and nothing stretches.
 */

type D = Drawing<ObjPaint>
type E = El<ObjPaint>

const r2 = (v: number) => Math.round(v * 100) / 100

/** One object placed at x, y with a side of `size` units. */
export const placeObject = (
  id: ObjectId,
  x: number,
  y: number,
  size: number
): E => ({
  k: "g",
  x: r2(x),
  y: r2(y),
  s: r2(size / 100),
  ch: [...objects[id].els],
})

/** Small seeded generator, so a Rack is the same on every render and in every export. */
function rng(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The layouts of a Rack (VISUAL-IDENTITY.md, section 4). */
export type RackLayout =
  | "wall"
  | "fade"
  | "cluster"
  | "arc"
  | "orbit"
  | "spotlight"
  | "hub"
  | "stagger"
  | "frame"
  | "climb"

export type RackOptions = {
  /** Objects to use, in no order. The Rack uses each once before it repeats any. */
  ids: readonly ObjectId[]
  /** Wall and fade only: visible tile rows; the tile size follows from the height. Default 3.2 / 4.2. */
  rows?: number
  seed?: number
  /**
   * wall: even tiles across the frame. fade: a grid that fades out from a lit centre.
   * cluster: tiles of three sizes packed around a large lit tile. arc: tiles on a rising arc.
   * orbit: rings around a lit centre. spotlight: one row that grows toward a lit centre.
   * hub: a lit centre with spokes to six tiles. stagger: offset rows. frame: tiles around the
   * edges, with the middle left clear for copy. climb: tiles that step up to a lit summit.
   */
  layout?: RackLayout
  /** The object in the lit tile (a club's lead object). Default: the first id. */
  focus?: ObjectId
  /** Tile shape. Default: disc for orbit, spotlight, hub and frame; square for the others. */
  shape?: "square" | "disc"
}

/** Recolour an object for a lit tile: the body takes the field colour and the detail takes the body colour. */
const onAccent = (e: E): E => {
  if (e.k === "g") return { ...e, ch: e.ch.map(onAccent) }
  const swap = (p?: ObjPaint): ObjPaint | undefined =>
    p === "a" ? "field" : p === "b" ? "a" : p
  return { ...e, fill: swap(e.fill), stroke: swap(e.stroke) }
}

/**
 * The Rack: square tiles in a regular grid, like a storage wall or an app catalogue
 * (references: Jasper, Charma, Perplexity Health and Clay on Mobbin). Every cell is a tile in the
 * block colour with one object at 56 % of the tile. One or two tiles are lit in the accent colour.
 * The grid is centred, so the edges crop the outer tiles evenly and it never reads as a picture of a place.
 */
export function rack(ratio: number, o: RackOptions): D {
  const layout = o.layout ?? "wall"
  if (layout !== "wall" && layout !== "fade")
    return freeLayouts[layout](100 * ratio, 100, o)
  const H = 100,
    W = 100 * ratio
  const cluster = layout === "fade"
  const cell = H / (o.rows ?? (cluster ? 4.2 : 3.2)),
    gap = cell * 0.18,
    step = cell + gap,
    icon = cell * 0.56,
    pad = (cell - icon) / 2,
    rx = r2(cell * 0.16)
  const cols = Math.ceil(W / step) + 1,
    rowsN = Math.ceil(H / step) + 1
  // Centre the grid on the frame, so the crop is the same on both sides.
  const ox = (W - (cols * step - gap)) / 2,
    oy = (H - (rowsN * step - gap)) / 2
  const rand = rng(o.seed ?? 1)
  let pool: ObjectId[] = []
  const next = (): ObjectId => {
    if (!pool.length) {
      pool = [...o.ids]
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
    }
    return pool.pop() as ObjectId
  }
  // Lit tiles: the centre tile in a fade; in a wall, one tile per 14 cells (at least one), chosen
  // among tiles that are fully inside the frame.
  const lit = new Set<string>()
  const ci = Math.floor(cols / 2),
    cj = Math.floor(rowsN / 2)
  if (cluster) lit.add(`${ci},${cj}`)
  else {
    const inside: [number, number][] = []
    for (let j = 0; j < rowsN; j++)
      for (let i = 0; i < cols; i++) {
        const x = ox + i * step,
          y = oy + j * step
        if (x >= 0 && y >= 0 && x + cell <= W && y + cell <= H)
          inside.push([i, j])
      }
    const n = Math.max(1, Math.round((cols * rowsN) / 14))
    for (let k = 0; k < n && inside.length; k++) {
      const [i, j] = inside.splice(Math.floor(rand() * inside.length), 1)[0]
      lit.add(`${i},${j}`)
      // Two lit tiles never touch, so each one reads as its own accent.
      for (let q = inside.length - 1; q >= 0; q--)
        if (Math.abs(inside[q][0] - i) <= 1 && Math.abs(inside[q][1] - j) <= 1)
          inside.splice(q, 1)
    }
  }
  const els: E[] = [{ k: "rect", x: 0, y: 0, w: W, h: H, fill: "field" }]
  const maxD = Math.hypot(W / 2, H / 2)
  for (let j = 0; j < rowsN; j++)
    for (let i = 0; i < cols; i++) {
      const x = ox + i * step,
        y = oy + j * step
      const on = lit.has(`${i},${j}`)
      const id = on && cluster ? (o.focus ?? o.ids[0]) : next()
      const obj = placeObject(id, x + pad, y + pad, icon)
      const tileEls: E[] = [
        {
          k: "rect",
          x: r2(x),
          y: r2(y),
          w: r2(cell),
          h: r2(cell),
          rx,
          fill: on ? "accent" : "block",
        },
        on ? onAccent(obj) : obj,
      ]
      if (!cluster) {
        els.push(...tileEls)
        continue
      }
      // Fade: tiles fade in three steps with distance from the centre; the farthest drop out.
      const d = Math.hypot(x + cell / 2 - W / 2, y + cell / 2 - H / 2) / maxD
      const opacity = d < 0.3 ? 1 : d < 0.55 ? 0.6 : d < 0.8 ? 0.28 : 0
      if (opacity === 0) continue
      els.push(
        opacity === 1
          ? { k: "g", ch: tileEls }
          : { k: "g", opacity, ch: tileEls }
      )
    }
  return { w: W, h: H, els }
}

// ---------- Free layouts for section cards (references: Clay, Linear, Apollo, monday.com, Front) ----------

/** A seeded picker that uses each object once before it repeats any. */
function picker(ids: readonly ObjectId[], seed: number) {
  const rand = rng(seed)
  let pool: ObjectId[] = []
  const next = (): ObjectId => {
    if (!pool.length) {
      pool = [...ids]
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
    }
    return pool.pop() as ObjectId
  }
  return { next, rand }
}

type TileOpts = { lit?: boolean; opacity?: number; disc?: boolean }

/** One tile centred on cx, cy: a block (or the accent when lit) with the object at 56 % of the tile. */
function tileAt(
  id: ObjectId,
  cx: number,
  cy: number,
  size: number,
  t: TileOpts = {}
): E {
  const half = size / 2,
    icon = size * 0.56
  const box: E = t.disc
    ? {
        k: "circle",
        cx: r2(cx),
        cy: r2(cy),
        r: r2(half),
        fill: t.lit ? "accent" : "block",
      }
    : {
        k: "rect",
        x: r2(cx - half),
        y: r2(cy - half),
        w: r2(size),
        h: r2(size),
        rx: r2(size * 0.16),
        fill: t.lit ? "accent" : "block",
      }
  const obj = placeObject(id, cx - icon / 2, cy - icon / 2, icon)
  const ch = [box, t.lit ? onAccent(obj) : obj]
  return t.opacity !== undefined && t.opacity < 1
    ? { k: "g", opacity: r2(t.opacity), ch }
    : { k: "g", ch }
}

const ring = (cx: number, cy: number, r: number, sw: number): E => ({
  k: "circle",
  cx: r2(cx),
  cy: r2(cy),
  r: r2(r),
  fill: "none",
  stroke: "block",
  sw: r2(sw),
})

const field = (W: number, H: number): E => ({
  k: "rect",
  x: 0,
  y: 0,
  w: r2(W),
  h: r2(H),
  fill: "field",
})

type Free = (W: number, H: number, o: RackOptions) => D

const freeLayouts: Record<Exclude<RackLayout, "wall" | "fade">, Free> = {
  /** Three tile sizes packed around a large lit tile (OpenPhone). The outer ring fades and crops. */
  cluster(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape === "disc"
    // Tall frames crop the outer ring at the sides, so the centre stays large.
    const u = Math.min(H * 0.17, W / 7)
    const cx = W / 2,
      cy = H / 2
    // [x, y, size] in units of u, around the centre. Gaps are at least 0.15 u, so no tiles touch.
    const pattern: [number, number, number][] = [
      [-2.05, -0.75, 1.3],
      [2.0, -0.95, 1.5],
      [-1.9, 1.15, 1.1],
      [1.85, 1.25, 1.2],
      [-0.05, -2.05, 1.15],
      [0.15, 2.05, 1.0],
      [-3.6, 0.15, 1.0],
      [3.65, 0.2, 0.95],
      [-3.3, -1.75, 0.7],
      [3.4, -2.2, 0.75],
      [-3.2, 1.95, 0.75],
      [3.5, 2.1, 0.7],
      [-5, -0.9, 0.6],
      [5.1, -0.8, 0.6],
      [-5, 1.1, 0.55],
      [5, 1.2, 0.6],
    ]
    const els: E[] = [field(W, H)]
    for (const [x, y, s] of pattern) {
      const d = Math.abs(x)
      els.push(
        tileAt(next(), cx + x * u, cy + y * u, s * u, {
          disc,
          opacity: d > 4.5 ? 0.45 : d > 3 ? 0.75 : 1,
        })
      )
    }
    els.push(tileAt(o.focus ?? o.ids[0], cx, cy, 2.2 * u, { lit: true, disc }))
    return { w: W, h: H, els }
  },

  /** Tiles on an arc that rises from the lower corners to a lit apex (Clay). Ends shrink and fade. */
  arc(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape === "disc"
    // The arc runs from the lower corners (which crop the end tiles) up to an apex at 30 % height.
    const a = 0.5 * W,
      top = 0.3 * H,
      end = 0.92 * H
    const R = ((end - top) ** 2 + a ** 2) / (2 * (end - top)),
      yc = top + R
    const span = Math.asin(Math.min(1, a / R))
    const s0 = 0.27 * H
    // Count the tiles from the arc length, so neighbours keep a gap of about 15 % of a tile.
    const n = Math.max(5, Math.round((R * 2 * span) / (s0 * 1.02)) | 1)
    const els: E[] = [field(W, H)]
    const mid = (n - 1) / 2
    for (let i = 0; i < n; i++) {
      if (i === mid) continue
      const t = (i - mid) / mid,
        th = t * span
      els.push(
        tileAt(
          next(),
          W / 2 + R * Math.sin(th),
          yc - R * Math.cos(th),
          s0 * (1 - 0.25 * Math.abs(t)),
          { disc, opacity: 1 - 0.4 * Math.abs(t) ** 1.5 }
        )
      )
    }
    els.push(
      tileAt(o.focus ?? o.ids[0], W / 2, top, s0 * 1.2, { lit: true, disc })
    )
    return { w: W, h: H, els }
  },

  /** A lit centre with tiles on three rings, six at 60° on the middle ring (Linear, Perplexity Health). */
  orbit(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape !== "square"
    const m = Math.min(W, H),
      cx = W / 2,
      cy = H / 2
    const radii = [0.27 * m, 0.46 * m, 0.68 * m]
    const els: E[] = [field(W, H)]
    for (const r of radii) els.push(ring(cx, cy, r, m * 0.006))
    const rings: [number, number, number, number, number][] = [
      // [radius index, count, start angle (deg), size, opacity]
      [0, 3, 30, 0.15, 1],
      [1, 6, 0, 0.12, 0.85],
      [2, 8, 22.5, 0.1, 0.5],
    ]
    for (const [ri, count, start, size, opacity] of rings)
      for (let k = 0; k < count; k++) {
        const th = ((start + (k * 360) / count) * Math.PI) / 180
        els.push(
          tileAt(
            next(),
            cx + radii[ri] * Math.cos(th),
            cy + radii[ri] * Math.sin(th),
            size * m,
            {
              disc,
              opacity,
            }
          )
        )
      }
    els.push(tileAt(o.focus ?? o.ids[0], cx, cy, 0.26 * m, { lit: true, disc }))
    return { w: W, h: H, els }
  },

  /** One row that grows toward a lit centre inside two halo rings (Linear integrations). */
  spotlight(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape !== "square"
    const cx = W / 2,
      cy = H / 2,
      s0 = 0.4 * H
    const els: E[] = [
      field(W, H),
      ring(cx, cy, 0.34 * H, 0.5),
      ring(cx, cy, 0.48 * H, 0.4),
    ]
    for (const side of [-1, 1]) {
      let x = cx,
        prev = s0
      for (let k = 1; k < 9; k++) {
        const s = s0 * 0.78 ** k
        x += side * (prev / 2 + 0.14 * prev + s / 2)
        if (Math.abs(x - cx) - s / 2 > W / 2) break
        els.push(
          tileAt(next(), x, cy, s, {
            disc,
            opacity: Math.max(0.25, 1 - 0.17 * k),
          })
        )
        prev = s
      }
    }
    els.push(tileAt(o.focus ?? o.ids[0], cx, cy, s0, { lit: true, disc }))
    return { w: W, h: H, els }
  },

  /** A lit centre with spokes at 60° to six tiles (Apollo). Wide frames stretch the spokes. */
  hub(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape !== "square"
    const cx = W / 2,
      cy = H / 2
    const rx = Math.min(0.36 * W, 0.62 * H),
      ry = 0.33 * H
    const els: E[] = [field(W, H)]
    const sats: [number, number][] = []
    for (let k = 0; k < 6; k++) {
      const th = ((30 + k * 60) * Math.PI) / 180
      sats.push([cx + rx * Math.cos(th), cy + ry * Math.sin(th)])
    }
    // Extra pair on the horizontal axis when the frame is wide.
    if (W / H > 1.5) sats.push([cx - rx * 1.25, cy], [cx + rx * 1.25, cy])
    for (const [x, y] of sats)
      els.push({
        k: "path",
        d: `M${r2(cx)} ${r2(cy)}L${r2(x)} ${r2(y)}`,
        fill: "none",
        stroke: "block",
        sw: 0.8,
      })
    for (const [x, y] of sats)
      els.push(tileAt(next(), x, y, 0.17 * H, { disc }))
    els.push(tileAt(o.focus ?? o.ids[0], cx, cy, 0.3 * H, { lit: true, disc }))
    return { w: W, h: H, els }
  },

  /** Two or three rows offset by half a tile, cropped at the sides (monday.com). */
  stagger(W, H, o) {
    const { next, rand } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape === "disc"
    const rowsN = W / H < 1.6 ? 3 : 2
    const cell = H / (rowsN + 0.55),
      gap = cell * 0.2,
      step = cell + gap
    const oy = (H - (rowsN * step - gap)) / 2
    const els: E[] = [field(W, H)]
    const litRow = Math.floor(rand() * rowsN)
    for (let j = 0; j < rowsN; j++) {
      const shift = (j % 2) * (step / 2)
      const cols = Math.ceil(W / step) + 2
      const ox = (W - (cols * step - gap)) / 2 + shift - step / 4
      const litCol = Math.floor(cols / 2) + (j === litRow ? 0 : 99)
      for (let i = 0; i < cols; i++)
        els.push(
          tileAt(
            next(),
            ox + i * step + cell / 2,
            oy + j * step + cell / 2,
            cell,
            {
              disc,
              lit: i === litCol,
            }
          )
        )
    }
    return { w: W, h: H, els }
  },

  /** Tiles around the edges with the middle left clear for a heading (Front, Circle). */
  frame(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape !== "square"
    const u = Math.min(0.2 * H, 0.12 * W)
    // [x, y, size, opacity] as shares of the frame; the middle 40 % stays empty.
    const spots: [number, number, number, number][] = [
      [0.09, 0.24, 1, 1],
      [0.23, 0.74, 0.85, 1],
      [0.05, 0.86, 0.6, 0.6],
      [0.3, 0.13, 0.55, 0.6],
      [0.9, 0.22, 0.9, 1],
      [0.77, 0.7, 1.05, 1],
      [0.96, 0.62, 0.6, 0.6],
      [0.69, 0.14, 0.6, 0.6],
    ]
    const els: E[] = [field(W, H)]
    spots.forEach(([x, y, s, opacity], i) => {
      els.push(
        tileAt(i === 5 ? (o.focus ?? o.ids[0]) : next(), x * W, y * H, s * u, {
          disc,
          opacity,
          lit: i === 5,
        })
      )
    })
    return { w: W, h: H, els }
  },

  /** Tiles that step up to a lit summit tile, on a stair line ("Climb at your own pace"). */
  climb(W, H, o) {
    const { next } = picker(o.ids, o.seed ?? 1)
    const disc = o.shape === "disc"
    const n = Math.max(4, Math.min(7, Math.round(W / (0.3 * H))))
    // Sizes grow toward the summit; in narrow frames they shrink together so the row fits 90 % of the width.
    const raw = Array.from(
      { length: n },
      (_, i) => H * (0.17 + (0.15 * i) / (n - 1))
    )
    const fit = Math.min(
      1,
      (0.9 * W) / (raw.reduce((a, b) => a + b, 0) + 0.06 * H * (n - 1))
    )
    const sizes = raw.map((s) => s * fit)
    const total = sizes.reduce((a, b) => a + b, 0)
    const gap = 0.06 * H * fit
    let x = (W - (total + gap * (n - 1))) / 2
    const rise = (0.46 * H) / (n - 1)
    const els: E[] = [field(W, H)]
    const stair: string[] = []
    const tiles: E[] = []
    sizes.forEach((s, i) => {
      const bottom = 0.92 * H - i * rise
      // The stair runs under each tile and rises between tiles, 2.5 units below the tile bottoms.
      const y = r2(bottom + 2.5)
      stair.push(i === 0 ? `M${r2(x)} ${y}` : `V${y}`)
      stair.push(`H${r2(x + s + (i < n - 1 ? gap : 0))}`)
      tiles.push(
        tileAt(
          i === n - 1 ? (o.focus ?? o.ids[0]) : next(),
          x + s / 2,
          bottom - s / 2,
          s,
          {
            disc,
            lit: i === n - 1,
            opacity: 0.55 + (0.45 * i) / (n - 1),
          }
        )
      )
      x += s + gap
    })
    els.push(
      { k: "path", d: stair.join(""), fill: "none", stroke: "block", sw: 0.8 },
      ...tiles
    )
    return { w: W, h: H, els }
  },
}

/** The Row: one object for each item, in cells with quarter-cell gaps. The Set is a Row of three. */
export function row(ids: readonly ObjectId[]): D {
  const gap = 25
  return {
    w: ids.length * 100 + (ids.length - 1) * gap,
    h: 100,
    els: ids.map((id, i) => placeObject(id, i * 125 + 8, 8, 84)),
  }
}

export type CropOptions = {
  /** Object size as a share of the width. Default 0.9. */
  scale?: number
  /** Top-left corner of the object, as shares of width and height. Defaults 0.45 and 0.3. */
  x?: number
  y?: number
}

/** The Crop: one object, large, cut by the frame. Pair it with a real figure set beside or over the field. */
export function crop(id: ObjectId, ratio: number, o: CropOptions = {}): D {
  const H = 100,
    W = 100 * ratio
  const size = W * (o.scale ?? 0.9)
  return {
    w: W,
    h: H,
    els: [
      { k: "rect", x: 0, y: 0, w: W, h: H, fill: "field" },
      placeObject(id, W * (o.x ?? 0.45), H * (o.y ?? 0.3), size),
    ],
  }
}

/**
 * The Tile: one object alone. With `cut`, it sits in a tint square whose top-left corner is cut at
 * 60° (depth 25 %); never a rounded tinted square.
 */
export function tile(id: ObjectId, cut = false): D {
  if (!cut) return { w: 100, h: 100, els: [...objects[id].els] }
  return {
    w: 100,
    h: 100,
    els: [
      {
        k: "poly",
        // 25 / √3 = 14.43: the cut runs at 60° from the left edge to the top edge.
        pts: [
          [0, 25],
          [14.43, 0],
          [100, 0],
          [100, 100],
          [0, 100],
        ],
        fill: "field",
      },
      placeObject(id, 12, 12, 76),
    ],
  }
}
