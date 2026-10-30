import type { Paint, Tone } from "./types"

/** The palette variable for each tone. Same mapping as the photo slots in components/brand/atoms.tsx. */
export const toneVar: Record<Tone, string> = {
  copper: "--cat-strength",
  night: "--night",
  sage: "--cat-mind-body",
  teal: "--cat-aqua",
  gold: "--cat-court",
  plum: "--cat-recovery",
  sand: "--neutral-7",
  rose: "--cat-youth",
  pine: "--cat-cycle",
  amber: "--cat-conditioning",
}

/** The tone of each class category, so class graphics match the category colour used on badges. */
export const categoryTone = {
  strength: "copper",
  cycle: "pine",
  conditioning: "amber",
  "mind-body": "sage",
  aqua: "teal",
  court: "gold",
  recovery: "plum",
  youth: "rose",
} as const satisfies Record<string, Tone>
export const tones = Object.keys(toneVar) as Tone[]

/**
 * `--g-p` is the paper colour: a light surface in both themes (--neutral-1 in light, --neutral-10 in dark),
 * so cut-outs, lit windows and highlights stay light on dark fields. PAPER_CSS sets it per theme.
 */
export const PAPER_CSS =
  ".cpg{--g-p:var(--neutral-1);--g-mp:32%;--g-night:var(--night)}.dark .cpg{--g-p:var(--neutral-10);--g-mp:56%;--g-night:color-mix(in oklab, var(--night) 45%, var(--neutral-10))}"

/**
 * Each tone is a two-ended ramp: a base surface and an accent. f0 … f5 mix the accent into the base.
 * Normal tones run from the card surface (--neutral-1) to the tone. Night runs from Saguaro Night to paper, so a night piece is a dark block with light shapes, like the site's night bands.
 * In dark mode the variables flip, so the ramp flips with them and contrast holds.
 */
export const RAMP: Record<"f0" | "f1" | "f2" | "f3" | "f4" | "f5", number> = {
  f0: 10,
  f1: 25,
  f2: 38,
  f3: 56,
  f4: 76,
  f5: 100,
}

export function rampEnds(
  tone: Tone,
  line = false
): { base: string; accent: string } {
  // In the line style, night draws in Saguaro Night itself (lightened in dark mode) on the light field.
  if (tone === "night" && line)
    return { base: "--neutral-1", accent: "--g-night" }
  return tone === "night"
    ? { base: "--night", accent: "--g-p" }
    : { base: "--neutral-1", accent: toneVar[tone] }
}

/** A paint as CSS. The SVG root sets --g-a (accent) and --g-b (base); see rampStyle. */
export function paintCss(p: Paint, tone: Tone): string {
  if (p === "none") return "none"
  if (p === "paper") return "var(--g-p)"
  if (p === "tint")
    return "color-mix(in oklab, var(--g-a) 10%, var(--neutral-3))"
  // The mid tint is stronger in dark mode (--g-mp), so field, fill and line stay three clear steps.
  if (p === "mid")
    return "color-mix(in oklab, var(--g-a) var(--g-mp, 32%), var(--neutral-3))"
  if (p === "ink")
    return tone === "night"
      ? "var(--g-a)"
      : "color-mix(in oklab, var(--g-a) 74%, var(--neutral-10))"
  return `color-mix(in oklab, var(--g-a) ${RAMP[p]}%, var(--g-b))`
}

/** Custom properties for the root of a drawing in a given tone. */
export function rampStyle(tone: Tone, line = false): Record<string, string> {
  const { base, accent } = rampEnds(tone, line)
  return { "--g-a": `var(${accent})`, "--g-b": `var(${base})` }
}

// ---------- Hex resolution (export script and native apps) ----------

const lin = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const gam = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
function toOklab(hex: string): [number, number, number] {
  const v = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) =>
    lin(parseInt(v.slice(i, i + 2), 16) / 255)
  )
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
function fromOklab([L, A, B]: [number, number, number]): string {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return (
    "#" +
    rgb
      .map((c) =>
        Math.round(Math.min(1, Math.max(0, gam(c))) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  )
}
/** color-mix(in oklab, a pct%, b) as hex. */
export function mixHex(a: string, b: string, pct: number): string {
  const x = toOklab(a),
    y = toOklab(b),
    t = pct / 100
  return fromOklab([
    x[0] * t + y[0] * (1 - t),
    x[1] * t + y[1] * (1 - t),
    x[2] * t + y[2] * (1 - t),
  ])
}
/** Resolve a paint to hex with a token table for one colour mode (variable name → hex). */
export function paintHex(
  p: Paint,
  tone: Tone,
  tokens: Record<string, string>,
  line = false
): string {
  if (p === "none") return "none"
  const { base, accent } = rampEnds(tone, line)
  const A = tokens[accent],
    B = tokens[base]
  if (p === "paper") return tokens["--g-p"]
  if (p === "tint") return mixHex(A, tokens["--neutral-3"], 10)
  if (p === "mid")
    return mixHex(A, tokens["--neutral-3"], Number(tokens["--g-mp"] ?? 32))
  if (p === "ink")
    return tone === "night" ? A : mixHex(A, tokens["--neutral-10"], 74)
  return mixHex(A, B, RAMP[p])
}
