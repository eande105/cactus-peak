#!/usr/bin/env node
/**
 * Copy the Cactus Peak graphics module from the marketing site into the web app.
 *
 *   node scripts/sync-brand-graphics.mjs          copy
 *   node scripts/sync-brand-graphics.mjs --check  report differences, exit 1 if any
 *
 * The marketing site module is the source of truth (see components/brand/graphics/SYNC.md).
 */
import { copyFileSync, existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const src = resolve(root, "../marketing-site/components/brand/graphics")
const dst = join(root, "components/brand/graphics")
const check = process.argv.includes("--check")

const files = readdirSync(src).filter((f) => f !== "SYNC.md")
const stale = files.filter(
  (f) =>
    !existsSync(join(dst, f)) ||
    readFileSync(join(src, f), "utf8") !== readFileSync(join(dst, f), "utf8")
)
const extra = readdirSync(dst).filter(
  (f) => f !== "SYNC.md" && !files.includes(f)
)

if (check) {
  for (const f of [...stale, ...extra]) console.log(`differs: ${f}`)
  process.exit(stale.length || extra.length ? 1 : 0)
}
for (const f of stale) copyFileSync(join(src, f), join(dst, f))
console.log(
  stale.length
    ? `copied ${stale.length} file(s): ${stale.join(", ")}`
    : "already in sync"
)
if (extra.length)
  console.log(`not in the source (remove by hand): ${extra.join(", ")}`)
