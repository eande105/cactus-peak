# Cactus Peak Athletic marketing site: build notes

Stack: Next.js 16.4.3 (App Router), React 19.3.1, TypeScript 7, Tailwind v4, Base UI, Graphical theme runtime, lucide-react, pnpm.

## Run it
```
pnpm install
pnpm dev --port 3110      # port 3100 was already in use by the older cactus-peak-athletic server, so I used 3110
pnpm typecheck
pnpm lint
pnpm build && pnpm start
```
Result at hand-over: `pnpm typecheck` passes, `pnpm lint` has 0 errors (3 warnings, all in the copied Graphical runtime), `pnpm build` passes (107 static pages). That was with ESLint; see Tooling below for the current setup.

## Tooling (Oct 29, 2026)
The setup follows the shadcn/ui `next-app` template (`shadcn-ui/ui/templates/next-app`) and create-next-app's `app-tw` template at `v16.4.2`, with Biome in place of ESLint and Prettier.

- Node comes from vite-plus (`vp`). The global default is `lts`, which is Node 26.13.0 today. The project has no `devEngines`, `engines` or `.node-version` pin, so it uses that default. Next.js 16.4.3 needs Node 20.9.0 or later. Do not set the default to `latest`: it resolves to a Node 27 prerelease that breaks Next.js.
- TypeScript 7 and `@types/node` 26. `next build` type-checks with the project's own `tsc` CLI, which TypeScript 7 needs (see `node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`). The Next.js TypeScript editor plugin in `tsconfig.json` needs the TypeScript JavaScript API, which TypeScript 7 does not have yet.
- `next.config.ts`, `.gitignore` and `pnpm-workspace.yaml` (`allowBuilds: sharp`) come from the templates.
- Biome 2.6.4 lints and formats: `pnpm lint` runs `biome check`, and `pnpm format` runs `biome format --write`. `biome.json` is create-next-app's config, plus:
  - formatter settings that match the shadcn template's Prettier settings (no semicolons, ES5 trailing commas, 80 columns);
  - `useTailwindSortedClasses` with the `tailwind` block (stylesheet `app/globals.css`, functions `cn` and `cva`) in place of `prettier-plugin-tailwindcss`;
  - `style/noNonNullAssertion` off, because lookups into the typed sample data use `!` on purpose;
  - the Markdown formatter off, so these notes keep their layout.
- Biome skips vendored code: `components/graphical/` (installed by the Graphical tool) and `.claude/`.
- Suppressions use `biome-ignore` with a reason. The old `eslint-disable` comments are gone.
- `AGENTS.md` holds the Next.js agent rules block from create-next-app (`helpers/generate-agent-files.ts` at `v16.4.3`). `next dev` re-adds it if it is removed. It points agents at the version-matched docs in `node_modules/next/dist/docs/`.
- Agent skills for Claude Code live in `.claude/skills/`, pinned in `skills-lock.json`. From `vercel/next.js`: `next-dev-loop`, `next-bundle-optimizer`, `next-cache-components-adoption`, `next-cache-components-optimizer`, `next-partial-prefetching-adoption`, `next-partial-prefetching-optimizer`. From `vercel-labs/agent-skills`: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`. Restore them with `npx skills experimental_install`. `next-dev-loop` also needs the `agent-browser` CLI (0.31.1 or later).

## Backend (Supabase, Oct 29, 2026)
The site reads and writes the shared Supabase project. Schema, seed and policies: `../supabase/README.md`.

- **Env.** `.env.local` holds `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_MEMBER_APP_URL` (the member web app, `http://localhost:3200` in dev; "Member sign in" goes to `<url>/sign-in`). No secret key.
- **Reads.** `lib/catalog/server.ts` `getCatalog()` loads every catalog table in one parallel batch through a cookie-less client (`lib/supabase/public.ts`). Each request sits in the Next.js data cache for 1 hour with the tag `catalog` (previous caching model, no `cacheComponents`). React `cache` shares one load per render. `lib/catalog/map.ts` maps rows to the types in `lib/types.ts`.
- **Client data.** The root layout passes a trimmed copy (`toClientData`, no article bodies) to `CatalogProvider` (`components/site/catalog-context.tsx`). Client components call `useCatalog()`. Server pages call `await getCatalog()`.
- **Static pages.** 112 pages prerender at build and revalidate hourly. Dynamic routes use `generateStaticParams` from the database and `dynamicParams = false`, so an unknown slug is a 404. `/clubs`, `/classes`, `/coaches`, `/contact` and `/schedule` read `searchParams`, so they render per request (they did before too).
- **Sessions.** Class times come from `class_schedules` (weekly rows). `buildSessions()` makes dated sessions for the next 7 days with the member apps' id format. Live spots come from the `session_counts` RPC, fetched once per page in the browser. Until it answers, rows show no spot count.
- **Clock.** `lib/time.ts` uses real Arizona time (UTC-7, no DST). `useClubNow()` renders the build-time clock first, then the live clock, so hydration matches. Open, closing soon (last hour) and closed use the hours in `00-foundation.md` §2, which live in `lib/time.ts` because the database has no hours table.
- **Forms.** `lib/forms/actions.ts` holds the server actions: tour, 3-day pass, join, contact, newsletter and job alerts. Each validates again on the server, drops posts that fill the hidden `company` honeypot, and inserts without `.select()` (anon can insert, not read). Codes and refs are made on the server. Personal data stays out of URLs. The confirmation pages read from sessionStorage in the same tab.
- **Join payment** is still a demo. The card is checked in the browser (a number ending in 0002 is declined) and is never sent. Only the plan, club and people go to `join_requests`.
- **States.** Data routes have `loading.tsx` and `error.tsx` (with `retry`). `app/global-error.tsx` covers a failed catalog load in the root layout. Club, class and coach slugs have their own `not-found.tsx`.
- **Still fixed or fake.** Busyness meters (`clubs.demo_busyness`), tour availability (a stable pattern in `tour-flow.tsx`, not a table), the Fall climb dates, and the club hours.

## Route table
| Route | Spec template | Status |
|---|---|---|
| `/` | 03 §1 Home (13 sections) | complete |
| `/clubs` | §2 Clubs index (filters, SVG map + list split, compare table) | complete |
| `/clubs/[slug]` (5) | §3 Club detail | complete |
| `/classes` | §4 Classes index | complete |
| `/classes/category/[category]` (8) | §4.7 Category landing | complete |
| `/classes/[slug]` (28) | §5 Class detail | complete |
| `/schedule` | §6 Schedule (filters, day strip, list, week grid, detail panel, sign-in hand-off) | complete |
| `/membership` | §7 Membership (plans, family calculator, comparison) | complete |
| `/join`, `/join/plan`, `/club`, `/details`, `/family`, `/payment`, `/confirmed` | §8 Join flow | complete (sample payment, no processor) |
| `/trial`, `/trial/confirmed` | §9 Free pass | complete |
| `/tour`, `/tour/confirmed` | §10 Tour booking (3 steps) | complete |
| `/kids` | §11 | complete |
| `/aquatics`, `/courts`, `/recovery` | §12, §13, §14 | complete |
| `/personal-training`, `/coaches`, `/coaches/[slug]` (8) | §15 | complete |
| `/about` | §16 | complete |
| `/faq` | §17 | complete |
| `/contact` | §18 | complete |
| `/journal`, `/journal/[slug]` (6) | §19 | complete (article body is shared sample text) |
| `/offers/fall-climb` | §20 | complete |
| `/careers`, `/careers/[slug]` (7) | §21 | complete |
| `/app` | §22 | partial (one screen slot, no carousel) |
| `/search` | §23 | complete (client index) |
| 404, 500 | §24 (`not-found.tsx`, `error.tsx`) | complete |
| `/legal/[slug]` (9) | §25 | complete (sample text, fee table, cookie switches) |
| `robots.txt`, `sitemap.xml` | 01 §5.6 | complete (single sitemap) |

## Components
Brand (`components/brand/`): RibMeter, IntensityRibs, BusynessMeter, CapacityIndicator, CategoryBadge, AmenityChip, ClubCard (compact, feature, grid, list-row, map-callout), HoursTable, StatusLine, ClubContact, ClubMap + pins (SVG), ClassCard (card, compact), ScheduleRow, ClassPhotoTile, InstructorChip, CoachCard (headshot, card, compact), PlanCard, PlanComparisonTable, PhotoSlot, PhotoThumb, LinkButton, TextLink, SectionHead, YesNo.
Sections (`components/sections/`): HeroSplit, PageHead, Band, Breadcrumbs, TourCTABand (with pass email row), TourTimeline, FaqList/FaqSection, StatTile, EmptyState, AmenityBento, CategoryRail, ClubFinderGrid, ClubStrip, TestimonialRail, ScheduleTeaser, ScheduleDayStrip, ScheduleBoard (filters, week grid, class panel), PopularTimesChart, SectionNav (scroll-spy), Gallery (lightbox), FamilyCalculator, ClubFinderSplit, ClubComparisonTable, flows (TourFlow, TrialFlow, JoinFlow), ContactForm, CoachGrid, JournalIndex, FaqExplorer, JobList, SearchResults.
Site shell (`components/site/`): SiteHeader (promo bar, utility bar, sticky header, Clubs and Classes mega menus), MobileDrawer (two-level full-screen), BottomActionBar, SiteFooter, SearchDialog, ClubSwitcher, MinimalCheckoutHeader, SkipLinks, BookingProvider (sign-in hand-off dialog).
Graphical first: the converted Graphical `Button`, `Input`, `Accordion`, `Separator` from `components/ui/`, the Graphical theme runtime and tokens. Where Graphical has no part (cards, tables, badges, chips, meters) I built on theme tokens.

## Deviations from the spec, and why
- **Port.** 3100 was held by the older project's server. I did not stop it. Dev ran on 3110.
- **Overlays use Base UI Dialog directly**, not the Graphical Drawer/Popover wrappers. The club switcher is a dialog on all widths (spec: popover on desktop). The class detail panel is a bottom sheet below `md` and a right panel from `md`.
- **Mega menus, tabs, toggle chips, switches** are custom, token-styled controls with the right ARIA, not Graphical NavigationMenu/Tabs/ToggleGroup. This avoided API risk in Graphical parts that are not verified.
- **No maplibre, recharts, embla, react-hook-form, zod, date-fns, swr, minisearch.** The map, popular-times chart, calendar, rails, form validation and search are small custom components over sample data. This keeps the bundle small.
- **Selects** are native `<select>` (reliable on touch), styled with tokens.
- **Photos.** None exist. `PhotoSlot` draws a flat tonal fill from the palette, a horizon band, a faint Rib Peak watermark, the shot ID and ratio, and the art-direction brief as a caption. No gradients, no stock.
- **Page background is Sand and cards are white** (spec 03 §0.3). I remapped the Graphical `background`/`card`/`muted`/`border` roles in `app/globals.css` for this.
- **Category colour tokens** are defined in `app/globals.css` (light and dark), from spec 01 §2.2.
- **Dark mode.** Tokens exist and the theme runtime supports it, but the site is locked to light (`enableSystem={false}`) and shows no toggle. The footer, tour band and About band use Saguaro Night via the theme's `color-2`.
- **Club page.** The sticky booking card sticks only beside the hero and quick facts, not through all tab sections. The sections below use the full width so the schedule list and its side card fit.
- **Classes index.** The "first-timers" switch lives in the filter row, not the page header.
- **Class intensity** on schedule rows shows the middle of the class range.
- **Schedule teaser default** is Gilbert – Val Vista when no club is set (spec copy is written for it).
- **Tour confirmation** downloads a minimal `.ics`. The Google and Outlook items are not built.

## Known gaps
- The join payment step is a sample: client-side checks only, no processor. The card is never sent. The plan and people go to `join_requests` (see Backend). A card number ending in 0002 shows the declined state.
- No auth session, analytics events, JSON-LD for every template (Home, club, class, membership, coach, FAQ, article and job have it), OG images, or print stylesheet beyond a Print button.
- Search is a simple substring and synonym filter, not MiniSearch.
- Map is stylised and fixed. "Use my location" uses real geolocation for distances.
- Keyboard roving on the mega menus is partial (Tab, Enter, Escape, Down arrow; no Left/Right between triggers).
- `/app` has one screen slot, no carousel and no QR code.
- No automated accessibility run. I did manual checks only: landmarks, skip links, labels, focus ring (Monsoon Sky from the theme), reduced-motion CSS, 44 px targets on main controls, no horizontal page scroll at 375 px on the pages I opened.
- Visual review covered Home, club detail, clubs finder, schedule and the mobile menu at 375 and 1440 px. Other pages were checked for HTTP 200 and layout overflow only on a subset.

## Review 1 — response
Skills loaded: better-interface, make-responsive, web-design-guidelines. I did not fetch the web-design-guidelines rule list from the network, so that self-check is by hand. Verified in my own tab at 1440 and 375 px: Home, Schedule (list), Clubs (ZIP lookup), club detail, Membership, Classes, join steps 2 to 5 (validation, decline with a card ending 0002, success), `/join/confirmed`, `/trial` and `/trial/confirmed`, club switcher, cookie switches, 500 page (forced with a temporary throwing route, since removed). Not re-checked visually after the last edits: Kids, Aquatics, Recovery, Courts, About, Contact, Journal, Careers, App, Offer, Coaches, week grid, schedule panel at 1440. These pass typecheck, lint and build only.

Status key: fixed / partly / not fixed.
- S1 photo slots: fixed. Chip hidden unless `NEXT_PUBLIC_SHOW_SLOT_IDS=1`; captions only on large slots; watermark only on heroes; per-subject compositions (water, court, wheels, bar, person); default radius 14, hero 28.
- S2 section recipe: partly. Eyebrows removed from all `SectionHead`s (kept on hero heads and a few labels); three H2 sizes (`display-lead`, 36/40, `display-quiet`); padding varies; `ClosingRow` replaces the Night band on six pages. Some inner pages still end FAQ then band.
- S3 type scale: partly. `text-detail` is now 14 px; new `.lede` 20/28; hero H1 `clamp(2.75rem, 7.4vw, 6rem)`. Many content lines still use the 14 px `text-caption` role.
- S4 cards to rules/tables: fixed for Home plans/amenities/coaches list/finder, classes (one grouped table), category pages, intensity guide, kids, aquatics, recovery, contact, coaches index, journal list, about, careers, app, club "Popular here", "Other clubs". Kept cards for clubs, plans, slots, panels.
- S5 chrome: fixed. Utility bar merged into the promo strip (108 px, was 144). Schedule has one 56 px toolbar; band headings pinned under it.
- S6 ScheduleRow: fixed. Fixed tracks, container query at 620 px, one word for intensity, spots only at 5 or fewer or "Full · N waiting", time printed once per group, class column replaced by club on class pages, ribs and spots on mobile, 44 px actions ("Waitlist" label in the row).
- S7 focus on Night: fixed (Sand ring on `.bg-night` and footer, 2 px offset).
- S8 copper: fixed for eyebrows (now muted).
- S9 wrong facts: fixed (ZIP, search, intensity, journal, spelling). Also fixed Sauna + Plunge running at clubs with no plunge.
- Shell P1 Clubs mega menu: fixed. Classes menu tint squares: fixed. `typicalLevel` in the menu: fixed. Left/Right keys: not fixed. Utility-bar "Find your club": kept as the only header one. Footer small line and hours alignment: fixed.
- Home: hero (bigger H1, bleeding photo): fixed. Trust row as one line: fixed. ClubStrip only with a club: fixed. Finder as rows with one photo: fixed. Amenities as table: fixed. Category rail as text index: fixed. Teaser heading: fixed. Plans as columns: fixed. Coaches: partly (kept a 4-up row without chips). Testimonials as 2 x 2 list: fixed. Families H2: fixed. Tour band symbol removed: fixed. Mobile page height: partly (about 14,200 px, was 17,080; target 9,000 not met).
- Clubs: ZIP table and sort: fixed. Header and list density, map pins numbered and US 60/canal labels: fixed. Compare table (single dash, rules, sticky head): fixed.
- Club detail: H1 first, photo as 21:9 band: fixed. Amenities as list: fixed. Popular here, other clubs (4 rows with distance), coaches list: fixed. Gallery chips: fixed via S1.
- Classes, category, class page: fixed (table, one line per category, "Try it free" primary, club list). Facts row icons removed. Recovery range label: not fixed.
- Schedule: week grid (min 168 px columns, 3 lanes, "N classes · day list"): fixed, not re-checked visually. Panel with filled "Book in the app", no photo: fixed. Mobile intensity/spots: fixed. Count wording: fixed. Week toggle reason as text: fixed.
- Membership: fixed (new H1, columns, one-line calculator, no notice box, table without card).
- Flows: join guards: fixed (redirect to first incomplete step). Payment duplicate summary and divider: fixed. Tour step 1 (stacked clubs, 14-day strip, summary from step 1): fixed. Confirmed pill/share/fragment: fixed. Focus to error summary: fixed. Calendar past days: fixed (calendar removed).
- Kids, Aquatics, Courts, Recovery, PT: fixed (tables, strips, H1 change, closers). 
- Coaches/profile: fixed (list; breadcrumb). About: fixed (values as plain lines, one Sand symbol band, stats). FAQ: fixed. Contact: fixed (table; one filled button remains in the message form only). Journal: fixed (bodies, list, JSON-LD date). Offer, Careers, App: fixed; App departs from spec 22.2 icon columns on purpose (numbered lines) and has a QR placeholder box, not a real QR. Search index: fixed (search list to retest: pool, courts, kids, sauna, yoga, swim, cycle, Gilbert, 85202). 404 title: fixed. Legal: fixed (sample banner).
- Accessibility: focus ring, 44 px targets (Button `sm` and `icon` now 44 px; promo link 44 px), heading jumps on `/clubs`, `/membership`, `/trial`, FAQ and journal list: fixed with H2s.
- Not reviewed by the reviewer, checked by me: 500 page has no header or footer (not fixed; it renders inside the root layout only).

## Review 2 — response
Checked in my own tab (tab-4) at 1440 and 375 px: Home, Schedule (week table, panel close), Clubs (map, ZIP), all five club pages (heading, overflow, slot count), Classes, Kids, Aquatics, About, Coaches, App, a class page, a coach page, FAQ, legal, search "pool". Mobile heights now: Home 9,542, Classes 12,234 before the last cuts (not remeasured), Dobson 10,707 before the gallery cut (not remeasured), Kids 8,881, Aquatics 6,943, About 5,000, Coaches 5,657, App 3,184. No horizontal overflow at 375 on any of those. Join steps 2 to 5 were not re-run this pass (no change to that code since review 1 except the shared Button). Not looked at after the edits: Recovery, Courts, Careers, Offer, Journal, Membership.

- P0-1 close button on Night: fixed (`closeClassName`, Sand on Night; measured `rgb(246,241,232)`).
- P0-2 week grid: fixed. Hour x day table, one-line entries, 3 per cell and "+N more", entries open the panel, no lanes. Shown from `xl` only; below that the toggle is hidden and the note says to pick a club and use a wider screen.
- P0-3 search: fixed. Club text built from facility flags, amenities and signature only. "pool" gives Dobson, Red Mountain, Val Vista. "1 result" singular.
- P1-1 rhythm: partly. Muted bands no longer tint (rule only); one tint band on Home (plans); Home lead H2 at display size, quiet labels on tables. The four-section-type system is applied on Home, Classes and the program pages only, not site-wide.
- P1-2 row alignment: fixed (fixed tracks, 104 px action with full-width buttons, 148 px spots track, container breakpoint 780 px, list capped at 1040 px). Subgrid not used.
- P1-3 one-word intensity: fixed (`wordOnly` default).
- P1-4 hero treatment: fixed. Only Home has a hero photo, and it now bleeds to the right edge. Kids, Aquatics, Recovery, Courts, PT use a headline plus one big fact. Careers and App keep their own layouts.
- P1-5 photo slots: partly. Per-club compositions (lanes, ridge, brick, splash circles, rail), second bike slot, About hero, amenity slots and Recovery slots removed, Careers silhouette replaced by a Night time block, `/app` phone drawn in CSS from sample rows. Gallery still has a lead and two thumbs on desktop (hidden on mobile); article hero capped at 21:9.
- P1-6 Aquatics/Recovery cards: fixed (class tables, definition list for the suite).
- P1-7 Clubs list and map: fixed (rows, text links, map 560 px, "US 60" and "Consolidated Canal" labels). One filled button on the page remains in the ZIP form only.
- P1-8 Kids: fixed (hour blocks on one line, clubs as a table, new H1).
- P1-9 coaches: partly. 72 px monogram circles and a "Next:" line on the index; the profile keeps the head-and-shoulders slot. No photos exist.
- P1-10 stacked Night: fixed. `TourCTABand` is a sand closing block everywhere except Home (`night` prop).
- P1-11 mobile: partly. One-line promo, club bar removed from mobile (club switcher stays in the menu), Home cut list applied except the footer `<details>`. Classes and Dobson cuts added after the last measurement.
- P1-12 About: fixed (one container, years at 56 px, values folded into the story, slot removed).
- P1-13 category lede/H2: fixed. Column now "Next at Val Vista"; the club select for visitors with no club is not built.
- P1-14 "— —" cells: fixed (filled dot or empty cell).
- P1-15 Courts H1: fixed by the new hero layout (not rechecked at 1440).
- P2-1 duplicate count line and "Open" in the panel: fixed ("Plenty"). P2-2 duplicate club list and glyph: fixed. P2-3 journal: fixed (featured date, 18/28 body, 21:9 hero, promo after step 5). P2-4 tappable rows on mobile: not fixed. P2-5 tour summary from step 1: fixed in review 1. P2-6 mega menu line and Left/Right keys: fixed. P2-7 motion: unchanged. P2-8 14 px grey wall: not fixed. P2-9 footer line on its own row: fixed. P2-10 offer table: fixed.
- Recovery range label "Easy · 1 of 5": fixed by one-word default.

## Final pass
Checked in my own tab (tab-4) at 1440 and 375 px: Recovery, Courts, Personal training, Careers, Membership, Dobson (gallery), Coaches, Schedule (tap row, panel), mobile footer, and heights and overflow for Offer and Journal (not looked at as screenshots). No horizontal overflow at 375 on any route measured.

1. Four section types (`LeadSection`, `DenseSection`, `SplitSection`, `QuietSection` in `components/sections/common.tsx`): applied to Recovery, Courts, Personal training, Careers, Offer, Membership, Contact, Journal (newsletter) and the club pages (hours as lead, reviews as split, other clubs as quiet). Coaches and FAQ already had one list/split layout each and were left as is. Adjacent sections differ on the pages I rewrote; a few inherited sections (club "Classes", "Amenities" bands) were not converted to the new components.
2. Mobile footer: `<details>` groups (Clubs open, Classes, Membership, About, Hours). Done. Fixed an unreadable Night eyebrow found while checking.
3. Mobile schedule rows: no per-row Book button below 780 px container width. The whole row opens the class panel, which now lives in `BookingProvider` and carries the filled "Book in the app". Schedule mobile height 13,716 to 4,955 px.
4. Grey text wall: muted text is now `neutral-8`; short paragraphs moved from 14 px to 16 px (22 files). No new weight scale.
5. Coaches: portrait compositions (head and shoulders on a cue for the coach's specialty: wheels, bar, water, court, rail and so on) on the index, cards and profile.
6. Club gallery: one slot per real space at the club (pool, courts, cycle studio, strength, kids, recovery), each with its own composition and a plain label; lightbox for the rest; hidden on mobile.
7. Category tables: club select ("Next times at"), defaulting to the visitor's club and saying so when none is set. Also on Classes, Aquatics and Recovery.
8. Mobile heights: Classes 12,234 to 9,577; Dobson 10,707 to 8,844; Home 9,542 earlier. Classes still about 600 px over the 9,000 goal.
9. Pages looked at: Recovery, Courts (duplicate headings found and fixed), Personal training, Careers, Membership, Coaches, Dobson, schedule. Offer and Journal measured only. Join steps 2 to 5 not re-run.

Not done: the four section types on Coaches, FAQ and the remaining club bands; Offer and Journal not visually reviewed after the changes.

## Interface icons: Nucleo (2026-10-29)

Lucide is replaced by Nucleo Pro (`ui` family, outline, 18 px) everywhere outside the component library.

- `components/icons/` (generated by `marketing-site/scripts/import-nucleo-icons.mjs` from `~/.nucleo/skills`; it
  writes both apps). Components keep the Lucide names (`Check`, `ChevronDown`, `MapPin`), so a file imports from
  `@/components/icons` instead of `lucide-react` and keeps its JSX. `IconComponent` replaces the `LucideIcon` type.
  `size`, `strokeWidth` and `className` work as before.
- Graphical components: their icon code is unchanged. `components/graphical-theme-provider.tsx` wraps the app in
  `IconRendererProvider`, which draws the Nucleo icon for each Graphical icon name (`THEME_ICON_ART`). `printer` and
  `listOrdered` have no Nucleo match and keep the bundled Lucide icon.
- `components/ui/` wrappers that import Lucide directly (for example the accordion chevron) are unchanged on purpose.
- The guides and skills (`GUI.md`, `gui/assets.md`, `gui/base-ui.md`, the theme file, the Graphical skills, the
  shadcn icon rule, `AGENTS.md`) carry the Nucleo override.
