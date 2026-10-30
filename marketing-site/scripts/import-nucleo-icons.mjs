#!/usr/bin/env node
/**
 * Generate the interface icon module for the marketing site and the web app from Nucleo.
 *
 *   node scripts/import-nucleo-icons.mjs            (from marketing-site/)
 *
 * Source: the Nucleo Pro "ui" family, outline style, 18 px, from the local Nucleo Skills install
 * (`npx @nucleoicons/skills setup`). Set NUCLEO_SKILLS_ROOT to use another install folder.
 * Output (generated; do not edit by hand):
 *   marketing-site/components/icons/nucleo.tsx and web-app/components/icons/nucleo.tsx
 *
 * Two maps:
 * - ICONS: app icon components, named after the Lucide icons they replace, so a file swaps
 *   `from "lucide-react"` for `from "@/components/icons"` and keeps its JSX.
 * - THEME: the Graphical runtime's icon names (components/graphical/components/library/icon.tsx), used by the
 *   IconRendererProvider in graphical-theme-provider.tsx. Names without a Nucleo match keep the bundled Lucide.
 * Each entry lists Nucleo labels in order of preference; the first one that exists is used.
 * The icons are licensed to the project owner's Nucleo account. Ship them inside the products only.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ICONS = {
  Accessibility: ["accessibility"],
  Activity: ["chart-activity", "heart-pulse"],
  AlertCircle: ["circle-warning"],
  Apple: ["apple"],
  ArrowLeft: ["arrow-left"],
  ArrowRight: ["arrow-right"],
  Bell: ["bell"],
  Bike: ["bicycle"],
  Briefcase: ["suitcase"],
  Calendar: ["calendar"],
  CalendarCheck: ["calendar-check"],
  CalendarDays: ["calendar-days", "calendar"],
  CalendarPlus: ["calendar-plus"],
  Check: ["check"],
  CheckCircle2: ["circle-check"],
  ChevronDown: ["chevron-down"],
  ChevronLeft: ["chevron-left"],
  ChevronRight: ["chevron-right"],
  ChevronsUpDown: ["chevron-expand-y", "sort-vertical"],
  CircleCheck: ["circle-check"],
  CircleHelp: ["circle-question"],
  Clock: ["clock"],
  Clock3: ["clock"],
  Copy: ["copy"],
  CreditCard: ["credit-card"],
  Download: ["download"],
  Dumbbell: ["dumbbell"],
  Eye: ["eye"],
  Flame: ["flame"],
  Flower2: ["flower-lotus", "flower"],
  Footprints: ["shoe-sneakers"],
  Gift: ["gift"],
  Grid2x2: ["grid-2x2", "grid"],
  HeartPulse: ["heart-pulse"],
  IdCard: ["id-badge"],
  Inbox: ["inbox"],
  Info: ["circle-info"],
  KeyRound: ["key"],
  Laptop: ["laptop"],
  LayoutGrid: ["grid-2x2", "grid"],
  ListFilter: ["filter"],
  Loader2: ["loader"],
  LocateFixed: ["crosshairs"],
  Lock: ["lock"],
  MapPin: ["map-pin", "pin"],
  Menu: ["menu"],
  MessageSquare: ["message"],
  Minus: ["minus"],
  MonitorSmartphone: ["laptop-mobile"],
  Moon: ["moon"],
  MoreHorizontal: ["dots"],
  Newspaper: ["newspaper"],
  OctagonAlert: ["octagon-warning"],
  PanelLeft: ["sidebar-left", "layout-sidebar"],
  Pause: ["media-pause", "circle-pause"],
  Phone: ["phone"],
  Plus: ["plus"],
  QrCode: ["qrcode"],
  RotateCcw: ["refresh", "arrow-rotate"],
  Search: ["magnifier"],
  Settings: ["gear"],
  Share2: ["share-right", "share-left"],
  ShieldAlert: ["shield-alert"],
  ShieldCheck: ["shield-check"],
  Smartphone: ["mobile"],
  Smile: ["face-smile"],
  Snowflake: ["snowflake"],
  Sparkles: ["sparkle"],
  Sun: ["sun"],
  SunMedium: ["sun"],
  Sunrise: ["sunrise"],
  Sunset: ["sunset"],
  Ticket: ["ticket"],
  TrendingUp: ["arrow-trend-up", "chart-line"],
  TriangleAlert: ["triangle-warning"],
  User: ["user"],
  Users: ["users"],
  Wallet: ["wallet"],
  Waves: ["water-wave"],
  WifiOff: ["wifi-off"],
  X: ["xmark"],
  XCircle: ["circle-xmark"],
}

const THEME = {
  home: ["house", "home"],
  folder: ["folder"],
  team: ["users"],
  settings: ["gear"],
  inboxTray: ["inbox"],
  shoppingBag: ["shopping-bag", "bag"],
  gift: ["gift"],
  creditCard: ["credit-card"],
  award: ["award", "medal"],
  pause: ["media-pause"],
  play: ["media-play"],
  bookmark: ["bookmark"],
  arrowRight: ["arrow-right"],
  archive: ["archive", "box-archive"],
  inbox: ["inbox-arrow-down"],
  adjust: ["sliders", "slider"],
  document: ["file", "file-text"],
  search: ["magnifier"],
  paperclip: ["paperclip"],
  bell: ["bell"],
  trash: ["trash"],
  stamp: ["stamp"],
  globe: ["globe"],
  pencil: ["pen", "pencil"],
  mailbox: ["mailbox"],
  panelLeft: ["sidebar-left", "layout-sidebar"],
  check: ["check"],
  chevronDown: ["chevron-down"],
  chevronLeft: ["chevron-left"],
  chevronRight: ["chevron-right"],
  minus: ["minus"],
  plus: ["plus"],
  close: ["xmark"],
  info: ["circle-info"],
  bold: ["text-bold", "bold"],
  italic: ["text-italic", "italic"],
  underline: ["text-underline", "underline"],
  copy: ["copy"],
  download: ["download"],
  filePlus: ["file-plus"],
  folderOpen: ["folder-open"],
  printer: ["printer"],
  save: ["floppy-disk"],
  undo: ["undo", "arrow-undo"],
  redo: ["redo", "arrow-redo"],
  arrowUp: ["arrow-up"],
  calendarPlus: ["calendar-plus"],
  calendarDays: ["calendar-days", "calendar"],
  mapPin: ["map-pin", "pin"],
  tag: ["tag"],
  package: ["box"],
  truck: ["truck"],
  listOrdered: ["list-ordered", "numbered-list"],
  loader: ["loader"],
  timer: ["timer", "stopwatch"],
  bookOpen: ["book-open"],
  checkCheck: ["check-double", "double-check"],
  shieldCheck: ["shield-check"],
  trendingUp: ["arrow-trend-up", "chart-line"],
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const nucleo =
  process.env.NUCLEO_SKILLS_ROOT ?? join(homedir(), ".nucleo", "skills")
const OUT = [
  join(root, "components/icons/nucleo.tsx"),
  join(root, "../web-app/components/icons/nucleo.tsx"),
]

function main() {
  const index = JSON.parse(
    readFileSync(join(nucleo, "ui", "icons.json"), "utf8")
  )
  const byLabel = new Map()
  for (const icon of index.icons)
    if (
      icon.fills.length === 1 &&
      icon.fills[0] === "outline" &&
      icon.sizes.length === 1 &&
      icon.sizes[0] === "18px" &&
      !byLabel.has(icon.label)
    )
      byLabel.set(icon.label, icon)
  const pick = (labels) => labels.find((l) => byLabel.has(l))
  const art = new Map()
  const use = (label) => {
    if (!art.has(label))
      art.set(label, byLabel.get(label).svg.replace(/\s+/g, " ").trim())
    return label
  }
  const missing = []
  const icons = []
  for (const [name, labels] of Object.entries(ICONS)) {
    const label = pick(labels)
    if (!label) {
      missing.push(name)
      continue
    }
    icons.push([name, use(label)])
  }
  const theme = []
  const themeMissing = []
  for (const [name, labels] of Object.entries(THEME)) {
    const label = pick(labels)
    if (label) theme.push([name, use(label)])
    else themeMissing.push(name)
  }
  if (missing.length)
    throw new Error(`No Nucleo ui outline icon for: ${missing.join(", ")}`)

  // Camel-case keys, so the generated file uses dot access ("chart-activity" → chartActivity).
  const key = (l) => l.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
  const out = `// Generated by marketing-site/scripts/import-nucleo-icons.mjs from the Nucleo "ui" family (outline, 18 px).
// Do not edit by hand. Interface icons for app code; the Graphical components keep their own icons, routed to these
// through IconRendererProvider (graphical-theme-provider.tsx).
import type { CSSProperties, JSX, SVGProps } from "react"

/** Props match the Lucide icons these replace: size and stroke width are optional, className sets the size. */
export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
}
export type IconComponent = (props: IconProps) => JSX.Element

const ART = {
${[...art].map(([l, svg]) => `  /** ${l} */\n  ${key(l)}: ${JSON.stringify(svg)},`).join("\n")}
} as const

/** One Nucleo icon. The SVG markup is the in-repo Nucleo artwork, never user input. */
export function NucleoIcon({
  body,
  size = 24,
  strokeWidth,
  absoluteStrokeWidth: _absolute,
  style,
  ...props
}: IconProps & { body: string }) {
  // Lucide stroke widths are on a 24-unit grid; Nucleo ui icons are on an 18-unit grid.
  const sw =
    strokeWidth === undefined ? undefined : Number(strokeWidth) * 0.75
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      width={size}
      height={size}
      fill="none"
      aria-hidden={props["aria-label"] ? undefined : true}
      focusable="false"
      data-icon-source="nucleo"
      style={
        sw === undefined
          ? style
          : ({ ...style, "--nucleo-stroke-width": sw } as CSSProperties)
      }
      {...props}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: generated from the licensed Nucleo artwork in this file
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}

${icons.map(([n, l]) => `export function ${n}(props: IconProps) {\n  return <NucleoIcon body={ART.${key(l)}} {...props} />\n}`).join("\n")}

/** Graphical runtime icon names → Nucleo artwork. Names not listed keep the bundled Lucide icon. */
export const THEME_ICON_ART: Record<string, string> = {
${theme.map(([n, l]) => `  ${n}: ART.${key(l)},`).join("\n")}
}
`
  for (const file of OUT) {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, out)
    writeFileSync(
      join(dirname(file), "index.ts"),
      `// Interface icons (Nucleo ui, outline). Use these instead of lucide-react outside components/graphical and components/ui.\nexport * from "./nucleo"\n`
    )
  }
  console.log(
    `Wrote ${icons.length} icons and ${theme.length} theme icons (${art.size} artworks) to ${OUT.length} apps.`
  )
  if (themeMissing.length)
    console.log(`Theme names left on Lucide: ${themeMissing.join(", ")}`)
}

if (import.meta.main) main()
