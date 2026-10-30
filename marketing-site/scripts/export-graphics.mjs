#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
/**
 * Export the Cactus Peak graphics to standalone SVG files for the web app and the iOS app.
 *
 *   node scripts/export-graphics.mjs            (from marketing-site/)
 *
 * Source of truth: components/brand/graphics/*.ts. Node loads those files with its built-in type
 * stripping (Node 22.18+ / 23.6+); the resolve hook below adds the ".ts" extension that the
 * bundler-style imports leave out.
 *
 * Output: ../brand-graphics/svg/<set>/<id>[-<variant>]-<mode>.svg with colours resolved to hex for the
 * light and dark themes, because native renderers and <img> tags cannot read CSS variables.
 * The token values come from components/graphical/theme.ts (neutrals, Saguaro Night) and
 * app/globals.css (category colours), so a palette change flows through on the next export.
 */
import { registerHooks } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (err) {
      if (specifier.startsWith(".")) return next(`${specifier}.ts`, context)
      throw err
    }
  },
})

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const load = (p) => import(pathToFileURL(join(root, p)).href)

/** Token tables (CSS variable name → hex) for light and dark. */
export async function loadTokens() {
  const { theme } = await load("components/graphical/theme.ts")
  const { mixHex } = await load("components/brand/graphics/paint.ts")
  const g_mix = (a, b) => mixHex(a, b, 45)
  const css = readFileSync(join(root, "app/globals.css"), "utf8")
  const block = (selector) => {
    const m = css.match(
      new RegExp(`${selector}\\s*\\{([^}]*--cat-strength[^}]*)\\}`)
    )
    const out = {}
    if (m)
      for (const [, k, v] of m[1].matchAll(
        /(--cat-[a-z-]+):\s*(#[0-9a-fA-F]{6})/g
      ))
        out[k] = v
    return out
  }
  const build = (mode, cat) => {
    const c = theme.theme.colors[mode]
    const t = { ...cat }
    for (const [k, v] of Object.entries(c))
      if (k.startsWith("neutral-")) t[`--${k}`] = v
    t["--night"] = c["color-2"]
    t["--night-foreground"] = c["neutral-3"]
    // Paper: light in both themes (see PAPER_CSS in paint.ts).
    t["--g-p"] = mode === "light" ? c["neutral-1"] : c["neutral-10"]
    // Mid-tint strength (see PAPER_CSS in paint.ts).
    t["--g-mp"] = mode === "light" ? "32" : "56"
    // Night in the line style (see PAPER_CSS in paint.ts).
    t["--g-night"] =
      mode === "light" ? c["color-2"] : g_mix(c["color-2"], c["neutral-10"])
    return t
  }
  return {
    light: build("light", block(":root")),
    dark: build("dark", block("\\.dark")),
  }
}

export async function loadGraphics() {
  const [paint, ser, sets, art, marks, bespoke, objects, compose, scheme] =
    await Promise.all([
      load("components/brand/graphics/paint.ts"),
      load("components/brand/graphics/serialize.ts"),
      load("components/brand/graphics/sets.ts"),
      load("components/brand/graphics/art.ts"),
      load("components/brand/graphics/marks.ts"),
      load("components/brand/graphics/bespoke.ts"),
      load("components/brand/graphics/objects.ts"),
      load("components/brand/graphics/compose.ts"),
      load("components/brand/graphics/scheme.ts"),
    ])
  return { paint, ser, sets, art, marks, bespoke, objects, compose, scheme }
}

/** SVG markup for a drawing in one tone and one mode. */
export function svgFor(g, tokens, drawing, tone, title, width) {
  // Hair strokes (space and class graphics) get the pixel width the HAIR rule gives at this file's width.
  return g.ser.drawingToSvg(
    drawing,
    (p) => g.paint.paintHex(p, tone, tokens, drawing.line),
    { title, width, hairPx: g.sets.hairPx(width) }
  )
}

async function main() {
  const out = resolve(root, "../brand-graphics/svg")
  rmSync(out, { recursive: true, force: true })
  const tokens = await loadTokens()
  const g = await loadGraphics()
  let count = 0
  const write = (rel, svg) => {
    const file = join(out, rel)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${svg}\n`)
    count++
  }
  const both = (rel, drawing, tone, title, width) => {
    for (const mode of ["light", "dark"])
      write(
        `${rel}-${mode}.svg`,
        svgFor(g, tokens[mode], drawing, tone, title, width)
      )
  }

  // Gym objects (the brand language). objects/: brand colours on a transparent ground, for any field.
  // category/: each class category's object in its colour, bare and in the 60° cut tile.
  const objectSvg = (drawing, scheme, mode, title, width) =>
    g.ser.drawingToSvg(
      drawing,
      (p) => g.scheme.objPaintHex(p, scheme, tokens[mode], mode === "dark"),
      { title, width }
    )
  for (const id of g.objects.objectIds)
    for (const mode of ["light", "dark"])
      write(
        `objects/${id}-${mode}.svg`,
        objectSvg(
          g.compose.tile(id),
          "sand",
          mode,
          g.objects.objects[id].label,
          256
        )
      )
  for (const [cat, id] of Object.entries(g.objects.categoryObject))
    for (const mode of ["light", "dark"])
      for (const cut of [false, true])
        write(
          `category/${cat}${cut ? "-cut" : ""}-${mode}.svg`,
          objectSvg(
            g.compose.tile(id, cut),
            { category: cat },
            mode,
            g.objects.objects[id].label,
            256
          )
        )

  // Retiring (VISUAL-IDENTITY.md, section 2): exported until the products stop using them.
  // Space and class graphics: a card ratio (4:3), a square tile and a wide slide.
  for (const id of g.sets.spaceGraphicIds) {
    const d = g.sets.spaceGraphics[id]
    both(
      `space/${id}-4x3`,
      g.sets.buildSpaceGraphic(id, 4 / 3),
      d.tone,
      d.label,
      640
    )
    both(
      `space/${id}-1x1`,
      g.sets.buildSpaceGraphic(id, 1),
      d.tone,
      d.label,
      320
    )
    both(
      `space/${id}-tile`,
      g.sets.buildSpaceGraphic(id, 1, true),
      d.tone,
      d.label,
      96
    )
  }
  for (const id of g.sets.classGraphicIds) {
    const d = g.sets.classGraphics[id]
    both(
      `class/${id}-16x9`,
      g.sets.buildClassGraphic(id, 16 / 9),
      d.tone,
      d.label,
      960
    )
    both(
      `class/${id}-4x3`,
      g.sets.buildClassGraphic(id, 4 / 3),
      d.tone,
      d.label,
      640
    )
    both(
      `class/${id}-1x1`,
      g.sets.buildClassGraphic(id, 1, true),
      d.tone,
      d.label,
      320
    )
  }
  // Coach marks: square, ready for a circle crop.
  for (const slug of g.marks.coachMarkIds) {
    const m = g.marks.coachMarks[slug]
    both(`coach/${slug}`, g.marks.buildCoachMark(slug), m.tone, m.label, 256)
  }
  // Space art: every scene at 16:9 and 4:5, plus 21:9 and a simple thumbnail.
  for (const id of g.art.spaceArtIds) {
    const a = g.art.spaceArt[id]
    both(
      `art/${id}-16x9`,
      g.art.buildSpaceArt(id, 16 / 9),
      a.tone,
      a.label,
      1280
    )
    both(`art/${id}-4x5`, g.art.buildSpaceArt(id, 4 / 5), a.tone, a.label, 800)
    both(
      `art/${id}-21x9`,
      g.art.buildSpaceArt(id, 21 / 9),
      a.tone,
      a.label,
      1680
    )
    both(
      `art/${id}-thumb`,
      g.art.buildSpaceArt(id, 4 / 3, true),
      a.tone,
      a.label,
      112
    )
  }
  // Bespoke graphics in each container shape.
  for (const id of g.bespoke.brandGraphicIds) {
    const b = g.bespoke.brandGraphics[id]
    for (const shape of g.bespoke.containerShapeIds) {
      const cs = g.bespoke.containerShapes[shape]
      both(
        `bespoke/${id}-${shape}`,
        g.bespoke.buildBrandGraphic(id, cs.ratio, shape === "tile"),
        b.tone,
        undefined,
        cs.exportWidth
      )
    }
  }
  console.log(`Wrote ${count} SVG files to ${out}`)
}

if (import.meta.main) await main()
