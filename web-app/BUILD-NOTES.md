# Cactus Peak Athletic member web app: build notes

Next.js 16.4.3 (App Router, Turbopack), React 19.3, TypeScript 7, Tailwind v4, Base UI through the Graphical theme runtime, lucide-react. Package manager: pnpm.

## Run and sign in
```
pnpm install
pnpm dev --port 3200      # http://localhost:3200
pnpm build && pnpm typecheck && pnpm lint
```
- Sign in with a demo login (`maya@`, `chris@`, `alicia@`, `jordan@`, `daniel@`, `ron@`, `linda@example.com`) and the shared `DEMO_PASSWORD` from `../.env.local`. See `../supabase/README.md`.
- The account menu can view the app as another member of the signed-in household, and has **Demo tools**: open a spot on my waitlist, move the clock forward 1 hour, fail my payment (day 0 or day 9), clear the payment failure, go offline, reset demo data.
- The demo clock starts at **Tue Oct 27, 2026, 5:40 a.m. Arizona time** and runs in real time. Holds expire, classes start and end, and booking windows open as time passes. The clock is shared by every device of the household (web and iOS show the same demo time). It restarts after 3 hours, or when you reset the demo data.
- Business rules live in `lib/engine.ts` (derived state) and `lib/actions.ts` (writes), so every state is real: 7/9-day windows opening at 6:00 a.m., 2-hour cancel and strikes, 3 strikes = 3-day pause, waitlist with 5 limit, 30-minute hold, 1-hour waitlist close and drop-in spots, court limits (one per day, two active, Ridge or Summit), lane sharing (2 swimmers), kids club blocks (2 per child per day), age and teen rules, freeze dates, plan proration, failed payment days 0/3/6/8/15, guest pass balance.

## Backend (Supabase)
The schema, row level security, functions and demo logins are in `../supabase/README.md`.

- **Auth.** `@supabase/ssr`. `lib/supabase/client.ts` (browser), `server.ts` (per request, cookies), `user.ts` (`getSessionUser()` with `getClaims()`), `proxy.ts` and the root `proxy.ts`. The proxy refreshes the session cookie on each request and sends a signed-out request for any member page to `/sign-in?next=…` with a 307. `/sign-in` and `/offline` are public. The `(app)` and `(flow)` layouts check the session again. `lib/safe-next.ts` allows only same-origin paths in `next`. Sign-in is email and password only: the email code, magic link and passkey screens were removed because nothing behind them was real. The step-up dialog on billing and membership pages checks the password with Supabase.
- **Catalog.** `lib/data/catalog-server.ts` reads clubs, coaches, class types, timetable, plans, PT packs, prices and member FAQs with a cookie-less client (`lib/supabase/public.ts`); each fetch is cached for an hour with the `catalog` tag. The root layout passes the result to `CatalogBoundary`, which fills the objects in `lib/data/catalog.ts` before any client component renders, so the engine keeps its synchronous selectors. `clubs/[slug]` and the coach pages read the catalog on the server for `notFound()` and titles. Sessions are still generated from the timetable (`lib/data/sessions.ts`). If the catalog read fails, `app/global-error.tsx` shows.
- **Member state.** `lib/store.ts` loads the signed-in member's household rows (households, members, invoices, bookings, strikes, notices, message_threads, teen_requests, guest_passes, visits) and converts them with `lib/data/rows.ts` (timestamptz ↔ epoch ms). `currentMemberId` is the signed-in member. `mutate()` and every action are unchanged; after each mutation the store diffs the new rows against the last saved rows and upserts or deletes only what changed, parents first. `advance()` goes through `mutate()`, so its changes save too. If a write fails, the store reloads the household from Supabase and shows an error toast, so the screen never shows a change the database does not have. Member data is not kept in `localStorage`; only the sidebar state and the step-up time are. The demo clock lives on the household row (`demo_clock_started_at`, `demo_clock_skew_ms`): the store reads it with `demo_clock()`, saves a clock jump to `demo_clock_skew_ms`, and follows changes from other devices through realtime on `households`.
- **Spots left.** `session_counts()` gives booked and waitlisted counts for all households. The store takes the household's own saved bookings off and keeps the rest in `state.others`; `sessionLeft` and `waitCount` add them to the timetable's base numbers and the household's own bookings. The counts refresh every minute.
- **Realtime.** The store listens to `bookings` and `notices` for the household and reloads when another tab or device changes them.
- **Demo tools.** Reset calls `reset_demo_household()` and reloads the store with a fresh clock. Other demo people need their own sign-in.
- **Loading and errors.** The member layouts show a skeleton in the shape of the shell while the household loads, and an error with Try again if it fails.
- **Tests.** `lib/__tests__/fixture.ts` reads `../supabase/seed-data/web-app.json` (the seed source) in place of the old `seedState()`. `rows.test.ts` covers the row conversion, the diff and spots left with other households.

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
- Biome skips vendored and synced code: `components/graphical/` (installed by the Graphical tool), `components/brand/graphics/` (a copy of the marketing site module, linted there) and `.claude/`.
- Suppressions use `biome-ignore` with a reason. The old `eslint-disable` comments are gone.
- `AGENTS.md` holds the Next.js agent rules block from create-next-app (`helpers/generate-agent-files.ts` at `v16.4.3`). `next dev` re-adds it if it is removed. It points agents at the version-matched docs in `node_modules/next/dist/docs/`.
- Agent skills for Claude Code live in `.claude/skills/`, pinned in `skills-lock.json`. From `vercel/next.js`: `next-dev-loop`, `next-bundle-optimizer`, `next-cache-components-adoption`, `next-cache-components-optimizer`, `next-partial-prefetching-adoption`, `next-partial-prefetching-optimizer`. From `vercel-labs/agent-skills`: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`. Restore them with `npx skills experimental_install`. `next-dev-loop` also needs the `agent-browser` CLI (0.31.1 or later).

## Routes
| Route | Spec page | Status |
|---|---|---|
| `/sign-in` | 1 Sign in | email and password (Supabase Auth) |
| `/welcome` | 2 Welcome (5 steps) | complete |
| `/today` | 3 Today | complete |
| `/schedule` (week, list, filters, URL state) | 4 Schedule | complete |
| `/schedule/[sessionId]` (sheet via intercepted route, page on direct load) | 5 Session detail | complete |
| `/bookings` | 6 My bookings | complete |
| `/reserve` | 7 Reserve hub | complete |
| `/reserve/courts`, `/reserve/lanes`, `/reserve/kids-club`, `/reserve/confirmed/[id]` | 8, 9, 10 | complete |
| `/clubs`, `/clubs/[slug]` | 11, 12 | complete (map is schematic, see deviations) |
| `/training`, `/training/coaches/[slug]`, `.../book` | 13, 14 | complete |
| `/progress` | 15 Progress | complete |
| `/family`, `/family/add`, `/family/[memberId]` | 16 Family | complete (add is a page, not a dialog) |
| `/membership`, `/membership/change-plan`, `/membership/freeze`, `/membership/cancel` | 17 to 20 | complete |
| `/billing`, `/billing/invoices/[id]`, `/billing/payment-method` | 21 Billing | complete (card form is the global dialog) |
| `/guest-passes`, `/guest-passes/send` | 22 Guest passes | complete |
| `/inbox`, `/inbox/[threadId]` | 23 Inbox | complete |
| `/settings` and 7 sub-pages | 24 Settings | complete |
| `/pass` | 25 Check-in pass | complete |
| `/help`, `/403`, `/404`, `/offline`, `/error` (error boundary), `/maintenance` | 26 Utility | complete |

## Flows
| Flow | Status |
|---|---|
| 1 Sign in (email and password) | complete (Supabase Auth); code, link and passkey removed |
| 2 Onboarding | complete |
| 3 Book a class (conflict dialog, undo, confirmed view) | complete |
| 4 Waitlist, hold, Confirm spot, Release, expiry | complete |
| 5 Cancel (on time, late, final strike with pause, kids club) | complete |
| 6 Reserve a court (5-minute hold, extend once, players, guests, move) | complete |
| 7 Lap lane (Any lane, 1 of 2 swimmers, partner, undo) | complete |
| 8 Kids club (4 steps, waitlist) | complete |
| 9 Personal training (picker, pay options, pack, notes, approval for teens) | complete |
| 10 Guest passes (send, buy, cancel, edit, resend) | complete |
| 11 Add a family member (5 steps, proration) | complete |
| 12 Change plan (upgrade now, downgrade next billing date, undo) | complete |
| 13 Freeze (3 steps, cancel, resume early) | complete |
| 14 Cancel membership (3 steps, equal buttons, keep) | complete |
| 15 Update payment method (decline test card `4000 0000 0000 0002`) | complete |
| 16 Failed payment recovery (banner, retry, day 8 booking block, day 15 pass) | complete |
| 17 Add to calendar (Google link, .ics download, feed token) | complete |
| 18 Check-in pass (rotating QR, offline note, states) | complete |
| 19 Teen request and parent approval | complete |
| 20 Small flows (club switch, command menu, mark read, remind me, private feedback, home club) | complete |

## Components
Kit (`components/kit`): RibMeter, IntensityRibs, BusynessMeter, CapacityIndicator, CategoryBadge and category icons (custom rib-barbell and court), PhotoSlot (art-directed scenes), PageHeader, EmptyState, ErrorState, Banner, StatRow, StatusPill, Segmented, SelectBox, CheckRow, SwitchRow, RadioList, FormField, PersonAvatar, InstructorChip, LateCancelMeter, MiniCalendar, ProgressRibs, VisitStrip, VisitMonth, Modal, Confirm (dialog on desktop, bottom sheet on phones), SideSheet.
Booking (`components/booking`): SessionAction (all 12 BookingStateButton states with reasons), WaitlistDialog, CancelDialog (on time and late), conflict dialog, ScheduleRow, CompactClass, SuggestedCard, SessionDetail (sheet and page), SuccessPanel, AddToCalendar.
Schedule: DayStrip, ScheduleFilters (sidebar and drawer), WeekGrid (keyboard grid). Reserve: SlotGrid and SlotList (court and lane matrix, time-first list below 1024), SlotHoldTimer, Stepper. Clubs: ClubMap (schematic), PopularTimesChart (chart and table). App: AppShell, NavLinks, ClubSwitcher, command menu, notifications popover, account and help menus, CheckInPass, banners, StepUp.
Theme: `app/globals.css` holds the Graphical role map (restated for the Sand page and white surfaces), the eight category tokens (final values from the shared spec), `--night`, `--dawn`, and utilities (`eyebrow`, `num`, `hatch`). No hex values appear in components except the QR black and white.

## Deviations from the spec, and why
1. **Map**: no tile provider or `maplibre-gl` is wired. `ClubMap` draws the five clubs as pins on a schematic of the East Valley. The list always works without it.
2. **Realtime**: bookings and notices of the household come through Supabase Realtime. Spots held by other households refresh each minute. Holds and busyness update from a 1-second ticker. Busyness uses typical hours for the current hour.
3. **Late-cancel clear date**: computed as strike date plus 30 days (Oct 24 strike clears Nov 23). The spec text shows Nov 26.
4. **Seed**: Maya's lane reservation is Sat 10:30 a.m. at Dobson (weekend lane slots start at 6:00 a.m. and tile every 45 minutes, so 9:30 is not a slot). Maya's included guest pass is unused; Pat Lowe's pass is a bought pass so the balance reads "1 of 1 left".
5. **Add member** and **send guest pass** routes: add member is a full page at every width; send guest pass is a dialog (the `/guest-passes/send` route opens it).
6. **Payment form** is a local dialog with validation, not hosted provider fields.
7. **Shadcn blocks**: `sidebar-07` and `login-03` were rebuilt by hand with the same behaviour (collapse to icons, drawer below 1024, two-column sign-in). `chart`, `command`, `calendar` and `data-table` were replaced with small purpose-built components (no extra dependencies).
8. **Fonts**: Archivo is loaded with its width axis and set at 112% stretch for headings. Inter for UI.
9. **Photos**: there are none. PhotoSlot draws flat tonal scenes (dawn skyline, lane lines, bikes at a window, court lines, rack and bar, rooftop, kids club, recovery room, portrait) with a one-line caption for the intended shot.
10. **Step-up sign-in** asks for the password again (checked with Supabase) when the last check is older than 30 minutes. The time of the last check is in `localStorage`.

## Known gaps
- No service worker or PWA offline cache. `/offline` exists, and "Go offline" in Demo tools exercises the offline states (banner, disabled booking, cached views).
- Web push, Apple and Google Wallet, photo upload, PDF invoices (plain text download), and calendar feed URL are stubs.
- Drag and drop does not exist anywhere (by spec). The week grid and slot grids support arrow keys, Home and End, PageUp and PageDown.
- Search in the command menu covers the viewing club's next 9 days of classes, clubs, coaches, pages and a few actions.
- Not run: axe, screen reader passes, forced-colors check, 200% and 400% zoom pass. I checked light and dark at 1440 px and 375 px by eye for Today, Schedule, Bookings, Reserve, Lanes, Clubs, Club detail, Pass, Change plan and the teen 403.
- Next dev shows a small "N" tool badge in the bottom-left corner. It is not part of the app.

## Review 1 — response
Status: fixed / partly fixed / not fixed. All checks at port 3200 in my own tab; Today, Schedule, Lanes, Courts, Progress, account menu, teen lanes and the offline banner were viewed at 1440 and 375 (light and dark, not every pair on every page).

**Systemic**
- S1 copper once per view: **fixed** for Schedule rows, Today, Reserve hub (text rows), Training pack button. List "Book" is outline; copper stays on Confirm spot, Show pass and the one CTA in a view (`SessionAction featured` in the class sheet).
- S2 Today: **fixed**. One column, one live sentence ("Climb Cycle is on. 18 minutes left."), facts, Show pass and Details, one timeline with Kids club (Everyone by default for primary members with children), right rail with club status as text and attention list. No stat row, no photo cards, no promo band, no skeleton, no passkey item.
- S3 mobile layers: **partly fixed**. Banners are one line on phones, hidden on `/pass`, the tab bar hides on `/reserve/*` and the CTA bar sits at the bottom. The sticky header, banner and page still stack on other pages.
- S4 targets and text: **partly fixed**. Small and icon buttons are 44 px below `md`, 11 px text is now 12 px. Raw radios on cancel, add-member and welcome already use the kit `RadioList`; the filter chips and some header links were not re-audited.
- S5 toasts: **partly fixed**. Removed "Viewing X", agenda refresh, demo notices, held-spot confirm toast and Reset demo toast; Wallet and photo upload are disabled with "Coming soon". Cancel and booking toasts with Undo stay, and Settings still use toasts for some saves. In-place "Cancelled, Undo" rows are not built.
- S6 art: **fixed** for coaches (initials duotone, one tonal pair per coach), kids club step 1 (list, no photos), Reserve hub (no photos), Today suggestions (rows). Kids blocks have their own sun and moon glyphs. Captions are alt text only on cards. Class sheet hero still uses category scenes.
- S7 boxes and rules: **partly fixed**. Sheet stat strip is a two-column list, notification icon circles are gone (left rule for held), Segmented is unchanged apart from S8.
- S8 dark selection: **fixed** (selected = foreground fill with bold text).
- S9 badge contrast: **fixed** (`--badge-danger` tokens, white on Chili, pale on deep Chili, 12 px bold).
- S10 sticky sub-header: **fixed** (opaque, z-20, bottom rule, 44 px jump links on phones).

**P0**
- P0-1 account menu: **fixed** (Menu.Group wrappers; the menu opens and lists members, Appearance and Demo tools). Switching member by clicking a radio item was not confirmed through the browser tool; I switched by editing the saved store.
- P0-2 chart: **fixed**, with a table toggle. P0-3 partner validation: **fixed** (member must match a known name; error text). P0-4 stale cancel line: **fixed** (`cancelNote` helper in Today, courts, confirmed, kids copy). P0-5 teen reserve: **fixed** (pages open read-only, button reads "Ask Alicia", request is held 24 h and shows in the parent's inbox); the "Waiting for Alicia" pill on the booking row is not added.
- P0-6 copy ("1 week", countdown wording): **fixed** on Today and Progress. P0-7 double full stops: **fixed**. P0-8 week view: **partly fixed** (List is the default, week grid is wider, scrolls to the next class, low spots show "N left"; classes at the same time still split a column, and the intercepted route does not keep `?view`).

**P1**
- T-1 to T-8: **fixed** except T-4 height transition (banner leaves without one) and T-8 (day 0 to 5 is amber, day 6+ is red).
- SC-1 to SC-6: **fixed** (compact row, no triangle-only meaning, left rule not wash, zero-count categories hidden, one meta line, page title set). SC-7 right-click menu and hover preview: **not fixed**; day-chip tooltip existed already.
- B-1, B-2: **fixed**. B-3 clear date: **not fixed** (needs a product decision).
- R-1 hub: **fixed**. R-2 court names: **not fixed**. R-3 taken cells without lock: **fixed**. R-4 scroll cue and hiding past columns: **fixed**. R-5 60 min default: **fixed**. R-6 confirmation: **partly fixed** (title is the time, cancel rule up front). R-7 kids step 1: **fixed**. R-8 neutral "Any lane": **fixed**.
- C-1 to C-3, TR-2: **not fixed** except TR-2 (caption removed with the photo). TR-1: **fixed**.
- PR-1: **fixed**. PR-2: **fixed** (colour only on bars).
- M-1, M-2, M-3: **fixed**. M-4, F-1, BL-1, I-1, ST-1, PA-1 (banner hidden on pass), WL-1: PA-1 **fixed**; the others **not fixed**.
- AU-1: demo hint hidden unless `?demo=1` **fixed**; first-paint theme flash **not fixed**.

**P2**: P2-1 and P2-2 (borderless account trigger), P2-4 partly, P2-9, P2-10 (h2s on courts and lanes) **fixed**. P2-3, P2-5 to P2-8, P2-11 to P2-13 **not fixed** (time).

**Not verified items**: account menu opens and the offline banner is visible (checked). Not walked: waitlist after hold, PT booking, guest pass send, add-member steps, change-plan confirm, cancel steps 2 and 3, Alicia approvals, remaining settings pages.

## Review 2 — response
Checked in my own tab on port 3200 at 1440 and 375 (light and dark for Schedule, Week, Today, Bookings, Billing, Kids club; other routes by typecheck, lint and tests only).

**Wrong facts (all fixed, with tests in `lib/__tests__/rules.test.ts`, run with `pnpm test`)**
- N-P0-1 double full stops: `endSentence()` in `lib/time.ts`; `cancelNote`, Today headline and held banner no longer add a stop after a time; Today now reads "tomorrow at 9:30 a.m." Grep for `a.m..` and `p.m..` is empty.
- N-P0-2 PT rule: PT review and PT success use `cancelNote(..., "pt")` ("This starts in 7 h. Moving or cancelling now uses the session."); the lane confirmation uses `cancelNote` too.
- N-P0-5 next charge: confirmation uses `nextBillingDate` (test: equals the preview date, Nov 12). Plan deltas use `fmtDelta` ("−$25", "+$50").
- N-P0-6: `cancelNote` returns "Started. …" after start; Today shows "In progress. Show your pass at the desk."
- N-P0-3 week view: replaced by a 5-day by hour matrix (one line per class, no lanes, no nested scroll box, Now marked in the hour gutter). It shows at 1280 px and up; below that the list is used. `?view=week&date=` is kept when the sheet opens.
- N-P0-4 list row: one line on desktop (time, class, coach, studio, intensity, spots or state), no Book box and no category chip; the row opens the sheet where the action lives. Only a held spot keeps a (copper) button. Phone rows are two lines.

**P1**
- N-P1-1 one payment banner: the global banner hides on `/billing` and `/membership/freeze`, which show one inline line instead; tone is amber until day 5, red from day 6; phone banner is title plus one action (checked at day 9).
- N-P1-2 confirmations: `SuccessPanel` is now a plain page (eyebrow per flow, fact as title, the rule under it, hairline rows, copper only for the next step, text links, no check, pill, box, Done button or "Share" label). Family add primary is "Go to family".
- N-P1-3 time column 88 px, no wrap. N-P1-4 fake skeletons removed (loading flags off, Suspense fallbacks empty, sheet shows at once).
- N-P1-5 "Waiting for Alicia": courts and lanes show it in the bar (held until time), disable a second request, and Bookings lists the request with a "Waiting for Alicia" pill; related toasts removed.
- N-P1-6 demo tools: Offline is a checked item, reset clears it, member radios close the menu, demo toasts replaced by announcements.
- N-P1-7 copper: Show pass is copper only within 60 minutes with no hold and no payment problem; change-plan header buttons are outline; Copy link is outline; Inbox list Approve is outline (confirm sheet for Approve not built).
- N-P1-8 cancel summary has no red X bullets; Keep is outline, Cancel is solid destructive.
- N-P1-9 add member: not restructured (two-column layout and step merge not done).
- N-P1-10 verify hint removed. N-P1-11 titles set for the sheet, PT booking and confirmation; the sheet's Add to calendar and Invite are still below the fold at short heights.
- N-P1-12 Bookings keeps a 72 px time column on phones. N-P1-13 not changed.

**P2**: N-P2-2, N-P2-3, N-P2-4 (bell and help borderless), N-P2-5, N-P2-6, N-P2-7 (court rows say sport and indoor or outdoor), N-P2-9 done. N-P2-1 (banner height animation), N-P2-8, N-P2-10 not done. 44 px targets: segmented controls and small buttons are 44 px on phones; header links and some text links were not re-audited.

**Walked**: day-9 payment failure (Today, Billing), kids club steps 1 to 3, week view to sheet, demo tools menu. Not walked this round: kids review and booking, PT booking again, Inbox approval.

## Final pass

Checks: `pnpm build`, `pnpm typecheck`, `pnpm lint` (0 errors, 9 unused-variable warnings) and `pnpm test` (11 tests) all pass. The dev server on port 3200 is stopped.

| # | Item | Status | What I verified |
|---|------|--------|-----------------|
| 1 | Two-column Add member, merged steps | Done | 4 steps (Who, Details, Review, Done). Right column shows the new monthly total and charge line from `lg` up; on phones the same block sits under the form. Checked light and dark. |
| 2 | Approve confirm sheet in Inbox | Done | As Alicia, Approve opens a sheet with Approve, Decline and Not yet. Approve resolved the request and the row read "Approved." |
| 3 | Cancel step 2 saving copy | Done | Price reason shows the Trailhead and Freeze offers. Keep is outline, Cancel is destructive. |
| 4 | First-paint theme flash | Done | Cold load of `/sign-in` with dark colour scheme: `html.dark` and body `rgb(18, 26, 22)` at first read. `theme-variables.tsx` sets both modes under `.graphical-theme`. |
| 5 | Add to calendar and Invite at short heights | Done | Both live in a "More" menu beside the primary action in the sticky bar. Checked at 375 x 667: the action stays on screen. |
| 6 | 44 px targets on phones | Done | Fixed header logo, selects, segmented controls and text links on Schedule, Bookings, Clubs, Training, Family, Inbox. No page overflow on 8 routes at 375. |
| 7 | Banner height animation | Done | `Collapse` uses the large motion token (300 ms) and is off under reduced motion. |
| 8 | Click walks and theme checks | Done | PT booking, kids club booking and Inbox approval were walked by clicking. Changed routes were checked at 375 in light and dark, and at desktop widths in dark. |

Bugs found in the final walk and fixed:
- Inbox list was 578 px wide at 375 because the grid had an implicit auto column. It now uses `grid-cols-[minmax(0,1fr)]` with `min-w-0`.
- The header was about 7 px wider than 375 px. The club button is now tighter on phones, and long club names truncate.

Not done or limits:
- I did not check the 1440 px width in light mode for every route; I checked light at 375 and dark at desktop widths. The pane did not hold a 1440 px size after resets.
- The class sheet action bar takes about 40 percent of a 667 px tall phone screen when a class has started.

## Brand graphics (2026-10-28)

The placeholder photo slots and initials tiles for classes, spaces, clubs and coaches are gone. The app uses the
Cactus Peak graphics system, the same as the marketing site and the iOS app.

- `components/brand/graphics/`: a copy of the marketing site module (React components, live theming). Do not edit it.
  Sync with `node scripts/sync-brand-graphics.mjs` (`--check` reports drift). See `SYNC.md` in that folder.
- `components/kit/brand-art.tsx`: `ClubArt` (club exterior art), `CoachArt` (coach mark, or the class graphic of the
  coach's specialty when the coach has no mark yet), `ArtFrame` (a box for a graphic with overlays).
- `lib/data/club-spaces.ts`: port of `marketing-site/lib/data/club-spaces.ts`. Club detail "Amenities" now lists the
  primary spaces with space graphics and the club-wide amenities with tiles.
- Replaced: sign-in panel, club switcher, Clubs list, club detail hero, welcome step 1 (clubs) and step 2 (class
  graphics), class rows and class detail hero (class graphics), coach list, coach profile, club coach list, booking
  coach card, instructor chips. `photo-slot.tsx` and `booking/scenes.ts` are deleted.
- Kept: Lucide for interface icons, including the small glyph inside `CategoryBadge`. Member avatars (initials) stay,
  because members are not coaches.
- Only Marisol Vega, Devon Hart, Luis Ortega and Sam Okafor have coach marks. Other coaches show a class graphic.
- Screenshots: `screenshots/brand-graphics/`.

## Gym objects (2026-10-29)

The app moved from scenes, line graphics and coach marks to the gym objects (Nucleo core glyphs), as set out in
`../VISUAL-IDENTITY.md`. The synced module (`components/brand/graphics/`) now has `objects.ts`, `compose.ts` and
`scheme.ts`.

- `ClubArt` (`components/kit/brand-art.tsx`): a Rack around the club's lead object. Orbit by default; the club
  header and the club list cards pass `layout="spotlight"`. `detail="simple"` shows the lead object on a muted tile
  (club switcher, welcome picker). Same props as before, plus `layout`.
- `CoachArt`: initials on Night with the coach's discipline object as a badge (`coachObjects`, else the object of
  the main specialty's category). No more coach marks.
- `CategoryIcon` (`components/kit/icons.tsx`): the category object in the `mono` scheme, so every category chip,
  filter and badge uses the Nucleo icon.
- `EmptyState` takes `object`: the missing thing in a cut tile at 96 px. Used on 13 empty states (bookings,
  waitlists, past classes, progress, PT sessions, family, guest passes, courts, lanes, kids club, freeze, schedule).
  Error and access states keep their Lucide icon.
- Screens: sign-in panel (Night cluster), session detail (spotlight around the category object), class rows
  (category Crop), welcome interests (category Tiles), club detail amenities (cut tiles and bare objects), the
  check-in pass (the home club's Set under the logo).

Checked in the browser in dark mode at 1440 px: Today, Schedule, session detail, Clubs, club detail, Training,
Pass and Guest passes; no console errors. Not seen in the browser: the sign-in panel (the demo is signed in), the
welcome flow and the new empty states (the demo data has no empty lists on those screens).

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
