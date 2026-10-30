import type { El, Paint } from "./types"

/*
 * Layout helpers shared by the space art and the bespoke graphics.
 * Every composition is drawn for its real aspect ratio: the canvas is always 100 units high and
 * 100 × ratio units wide. Bands span the width, repeats are counted from the width, and motifs are
 * placed with a uniform scale, so nothing is ever stretched.
 */

export const SQRT3 = Math.sqrt(3)

export type RatioClass = "wide" | "land" | "square" | "tall"
export function ratioClass(r: number): RatioClass {
  if (r >= 1.9) return "wide"
  if (r >= 1.2) return "land"
  if (r >= 0.9) return "square"
  return "tall"
}

/** Parse "16/9", "16:9" or a number. */
export function parseRatio(r: string | number): number {
  if (typeof r === "number") return r
  const [a, b] = r.split(/[/:]/).map(Number)
  return b ? a / b : a
}

/** Pick a value by ratio class. */
export const byClass = <T>(c: RatioClass, v: Record<RatioClass, T>): T => v[c]

/** A peak in a rib ridge: centre x, height above the base line, and an optional flat top width. */
export type Peak = { x: number; h: number; flat?: number }

/** Height of a ridge of 60° peaks at x. */
export function ridgeHeight(peaks: Peak[], x: number): number {
  let h = 0
  for (const p of peaks) {
    const d = Math.max(0, Math.abs(x - p.x) - (p.flat ?? 0) / 2)
    h = Math.max(h, p.h - d * SQRT3)
  }
  return h
}

/**
 * The rib ridge: the logo's construction (upright ribs, pleat gaps, tops cut on the 60° slope)
 * applied to a landscape. Ribs run across the full width from x0 to x1.
 */
export function ribRidge(o: {
  x0: number
  x1: number
  base: number
  peaks: Peak[]
  rib: number
  pleat: number
  fill: Paint
  min?: number
  phase?: number
  bottom?: number
}): El[] {
  const els: El[] = []
  const step = o.rib + o.pleat
  const bottom = o.bottom ?? o.base
  for (let x = o.x0 - (o.phase ?? 0); x < o.x1; x += step) {
    const a = Math.max(x, o.x0),
      b = Math.min(x + o.rib, o.x1)
    if (b - a < o.rib * 0.4) continue
    // Sample the profile at the rib edges and at any apex or shoulder inside the rib.
    const xs = new Set<number>([a, b])
    for (const p of o.peaks) {
      for (const k of [p.x - (p.flat ?? 0) / 2, p.x + (p.flat ?? 0) / 2])
        if (k > a && k < b) xs.add(k)
      for (const k of [
        p.x - (p.flat ?? 0) / 2 - p.h / SQRT3,
        p.x + (p.flat ?? 0) / 2 + p.h / SQRT3,
      ])
        if (k > a && k < b) xs.add(k)
    }
    const sorted = [...xs].sort((m, n) => m - n)
    const top = sorted.map(
      (sx) => [sx, o.base - ridgeHeight(o.peaks, sx)] as const
    )
    if (Math.max(...top.map(([, y]) => o.base - y)) < (o.min ?? 1.5)) continue
    els.push({
      k: "poly",
      pts: [[a, bottom], ...top, [b, bottom]],
      fill: o.fill,
    })
  }
  return els
}

/** Repeat a builder along x with a fixed step, centred on the canvas so both edges crop evenly. */
export function repeatX(
  x0: number,
  x1: number,
  step: number,
  fn: (x: number, i: number) => El[]
): El[] {
  const span = x1 - x0
  const count = Math.floor(span / step) + 1
  const start = x0 + (span - (count - 1) * step) / 2
  const out: El[] = []
  for (let i = 0; i < count; i++) out.push(...fn(start + i * step, i))
  return out
}

/** Place a motif drawn around a local origin (bottom centre) at x, y with uniform scale s. */
export const place = (x: number, y: number, s: number, ch: El[]): El => ({
  k: "g",
  x,
  y,
  s,
  ch,
})

export const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: Paint,
  rx?: number
): El => ({ k: "rect", x, y, w, h, fill, rx })
export const circle = (cx: number, cy: number, r: number, fill: Paint): El => ({
  k: "circle",
  cx,
  cy,
  r,
  fill,
})
export const poly = (
  pts: Array<readonly [number, number]>,
  fill: Paint
): El => ({ k: "poly", pts, fill })
export const line = (
  d: string,
  stroke: Paint,
  sw: number,
  cap: "round" | "butt" = "round"
): El => ({ k: "path", d, stroke, sw, cap, fill: "none" })

/** A 60° triangle (the peak) standing on y with half-width hw. */
export const peakTri = (cx: number, y: number, hw: number, fill: Paint): El =>
  poly(
    [
      [cx - hw, y],
      [cx, y - hw * SQRT3],
      [cx + hw, y],
    ],
    fill
  )
export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: Paint
): El => ({ k: "ellipse", cx, cy, rx, ry, fill })
