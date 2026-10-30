/**
 * Shared types for the Cactus Peak graphics system.
 * This file holds types only, so Node can load the graphics modules with type stripping
 * (scripts/export-graphics.mjs) and Next can bundle them without a build step.
 */

/**
 * Tones. The first eight match `PhotoTone` in lib/types.ts; pine and amber add the cycle and conditioning
 * category colours. Each maps to one palette variable (see paint.ts).
 */
export type Tone =
  | "copper"
  | "night"
  | "sage"
  | "teal"
  | "gold"
  | "plum"
  | "sand"
  | "rose"
  | "pine"
  | "amber"

/**
 * A paint is a role, not a colour. The renderer turns it into CSS variables (React) or hex (export script).
 * f0 … f5: the tone ramp from the field (f0, faint) to the full tone (f5).
 * paper: a light surface in both themes (cut-outs, highlights). ink: deeper than f5, for small accents.
 * tint: a very light wash of the tone over the page sand (very dark in dark mode), the line graphics' field.
 * mid: 32 % of the tone over the page sand, the surface fill of the line graphics (duotone).
 */
export type Paint =
  | "f0"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "paper"
  | "ink"
  | "tint"
  | "mid"
  | "none"

/** `hair`: a line-graphic stroke. Its width follows the rendered size, not the viewBox (see sets.ts, HAIR). */
type Common<P extends string> = {
  fill?: P
  stroke?: P
  sw?: number
  cap?: "round" | "butt"
  join?: "round" | "miter"
  opacity?: number
  hair?: boolean
}
/**
 * Intermediate representation for every drawing. Coordinates are in viewBox units.
 * `P` is the paint vocabulary: `Paint` (tone ramp) for the line and bespoke sets, `ObjPaint` for the gym objects.
 */
export type El<P extends string = Paint> =
  | (Common<P> & {
      k: "rect"
      x: number
      y: number
      w: number
      h: number
      rx?: number
    })
  | (Common<P> & { k: "circle"; cx: number; cy: number; r: number })
  | (Common<P> & {
      k: "ellipse"
      cx: number
      cy: number
      rx: number
      ry: number
    })
  | (Common<P> & { k: "path"; d: string; rule?: "evenodd" })
  | (Common<P> & { k: "poly"; pts: ReadonlyArray<readonly [number, number]> })
  /** A group. x, y and s place it (translate then uniform scale), so a motif never distorts. */
  | {
      k: "g"
      ch: El<P>[]
      x?: number
      y?: number
      s?: number
      opacity?: number
      flipX?: boolean
    }

/** A finished drawing: a viewBox size plus the elements, back to front. */
/** `line`: drawn in the line style (tint field, strong outlines, mid fills); night then uses a readable line colour. */
export type Drawing<P extends string = Paint> = {
  w: number
  h: number
  els: El<P>[]
  line?: boolean
}

/**
 * Paint roles for the gym objects (objects.ts, compose.ts). A scheme resolves them (scheme.ts).
 * a: the object body. b: the object's one detail. field: the ground. block: a Rack colour block.
 * accent: the one accent block in a Rack.
 */
export type ObjPaint = "a" | "b" | "field" | "block" | "accent" | "none"
