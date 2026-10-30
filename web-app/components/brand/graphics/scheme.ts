import type { CategoryId } from "./objects"
import { categoryTone, mixHex, toneVar } from "./paint"
import type { ObjPaint } from "./types"

/*
 * Colour schemes for the gym objects (VISUAL-IDENTITY.md, section 5).
 * Three brand fields for compositions, plus one scheme per class category for Tiles.
 * The root of a drawing sets --o-f (field), --o-a (body) and --o-b (detail); OBJECT_CSS sets the
 * per-theme brand values, so Saguaro Night stays dark in both themes.
 */

/** "mono": both tones from the text colour (the detail at 45 %), for icons set inline with text. */
export type BrandScheme = "sand" | "night" | "copper" | "mono"
export type Scheme = BrandScheme | { category: CategoryId }

export const OBJECT_CSS =
  ".cpo{--o-paper:var(--neutral-3);--o-ink:var(--night);--o-night:var(--night);--o-copper:var(--cat-strength);--o-dawn:color-mix(in oklab, var(--cat-strength) 78%, var(--neutral-1))}" +
  ".dark .cpo{--o-paper:var(--neutral-10);--o-ink:var(--neutral-10);--o-night:color-mix(in oklab, var(--night) 40%, var(--neutral-1));--o-copper:color-mix(in oklab, var(--cat-strength) 78%, var(--neutral-1));--o-dawn:var(--cat-strength)}"

const brand: Record<BrandScheme, { f: string; a: string; b: string }> = {
  sand: { f: "var(--neutral-3)", a: "var(--o-ink)", b: "var(--cat-strength)" },
  night: { f: "var(--o-night)", a: "var(--o-paper)", b: "var(--o-dawn)" },
  copper: { f: "var(--o-copper)", a: "var(--o-paper)", b: "var(--o-night)" },
  mono: {
    f: "transparent",
    a: "currentColor",
    b: "color-mix(in oklab, currentColor 45%, transparent)",
  },
}

/** Custom properties for the root of an object drawing. */
export function schemeStyle(scheme: Scheme): Record<string, string> {
  if (typeof scheme === "string") {
    const s = brand[scheme]
    return { "--o-f": s.f, "--o-a": s.a, "--o-b": s.b }
  }
  const cat = `var(${toneVar[categoryTone[scheme.category]]})`
  return {
    "--o-f": `color-mix(in oklab, ${cat} 12%, var(--neutral-3))`,
    "--o-a": cat,
    "--o-b": "var(--neutral-10)",
  }
}

/** An object paint as CSS (the root sets the scheme variables). */
export function objPaintCss(p: ObjPaint): string {
  if (p === "none") return "none"
  if (p === "a") return "var(--o-a)"
  if (p === "b" || p === "accent") return "var(--o-b)"
  if (p === "field") return "var(--o-f)"
  return "color-mix(in oklab, var(--o-a) 12%, var(--o-f))"
}

/** An object paint as hex for one colour mode (export script and native apps). Mirrors OBJECT_CSS. */
export function objPaintHex(
  p: ObjPaint,
  scheme: Scheme,
  t: Record<string, string>,
  dark: boolean
): string {
  if (p === "none") return "none"
  const paper = dark ? t["--neutral-10"] : t["--neutral-3"]
  const ink = dark ? t["--neutral-10"] : t["--night"]
  const night = dark ? mixHex(t["--night"], t["--neutral-1"], 40) : t["--night"]
  const copper = dark
    ? mixHex(t["--cat-strength"], t["--neutral-1"], 78)
    : t["--cat-strength"]
  const dawn = dark
    ? t["--cat-strength"]
    : mixHex(t["--cat-strength"], t["--neutral-1"], 78)
  let f: string, a: string, b: string
  if (scheme === "sand" || scheme === "mono")
    [f, a, b] = [t["--neutral-3"], ink, t["--cat-strength"]]
  else if (scheme === "night") [f, a, b] = [night, paper, dawn]
  else if (scheme === "copper") [f, a, b] = [copper, paper, night]
  else {
    const cat = t[toneVar[categoryTone[scheme.category]]]
    ;[f, a, b] = [mixHex(cat, t["--neutral-3"], 12), cat, t["--neutral-10"]]
  }
  if (p === "a") return a
  if (p === "b" || p === "accent") return b
  if (p === "field") return f
  return mixHex(a, f, 12)
}
