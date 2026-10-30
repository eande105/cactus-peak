# Cactus Peak Athletic — Member web app: component inventory

Citation tags are defined in `01-product-and-ia.md`. Pages that use each component are in `03-pages.md`. Shared brand components are defined in `../01-shared-brand-components.md` (sections 2–6) and `../01-shared-brand-components-part2.md` (sections 7–12). This file lists how the web app uses them and never redefines them. If this file and the shared spec differ, the shared spec wins.
Rule from the research: **use Graphical first, then shadcn/ui, then a shared brand component, then an app composite** (CL §2). App code uses role names and never hex values; hex values live only in the theme files (CL "Colour roles").

## 0. Tokens (exact values from `theme.json`)

### 0.1 Colour roles
| Role (Tailwind name) | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F6F1E8` Sand | `#121A16` | Page canvas |
| `surface` | `#FFFFFF` | `#1A241F` | Cards, sheets, inputs |
| `surface-muted` | `#EFE7DA` | `#24302A` | Table stripes, chips, skeleton base, "Taken" cells |
| `text` | `#1D1B17` Ink | `#F2ECE2` | Body, headings |
| `text-muted` | `#6B6457` Stone | `#A69F92` | Secondary text |
| `border` | `#DDD2C1` Caliche | `#34423A` | Card edges, dividers (decorative) |
| `border-strong` | `#8C7F6B` | `#6E7F74` | Input and control outlines (3:1) |
| `border-hover` | `#4A443A` | `#CFC8BB` | Hovered control edges |
| `primary` | `#B5532C` Arizona Copper | `#E0804F` Dawn Copper | Primary action, active nav, selection |
| `primary-foreground` | `#FFFFFF` | `#121A16` | Label on primary |
| `primary-hover` | `#9E4522` | `#EE9A6E` | Primary hover |
| `primary-subtle` | `#F6DFD3` | `#3A2418` | Selected rows, selected slot fill |
| `link` | `#9E4522` Copper Deep | `#EE9A6E` | Links and copper text |
| `secondary` / `-foreground` | `#1C3328` / `#F6F1E8` | `#F2ECE2` / `#1C3328` | Dark brand bands (PromoBand, pass header) |
| `success` / `-subtle` | `#2A7047` / `#E3F0E6` | `#6FCB94` / `#1D3527` | Booked, paid, free slot dot |
| `warning` / `-subtle` | `#8A5300` / `#FBEBCB` | `#F2B14C` / `#3A2E14` | Low spots, held, expiring |
| `danger` / `-subtle` | `#B42318` / `#FBE4E1` | `#F28B7C` / `#3D1F1B` | Destructive buttons, failed payment |
| `danger-hover` | `#8F1C13` | `#F5A396` | Danger hover |
| `focus` | `#2E6DB4` Monsoon Sky | `#7FB0E8` | Focus ring only (2 px) |

Rules: copper only for action, selection and the active state. Never use `focus` colour for decoration. Dark mode follows the OS and can be set in Settings; `data-theme` on `<html>` overrides. Shadow tokens: `shadow-s/m/l` apply to popovers, dialogs, drawers only; cards are flat.
**Category colours** are owned by the shared spec (part 1, section 2.2; checked for contrast). Use the tokens; do not copy hex values into pages. Add them to `theme.json` as `color.light.category.<id>` and `color.dark.category.<id>` with `fill`, `text`, `tint`. CSS names: `--cp-cat-<id>`, `--cp-cat-<id>-text`, `--cp-cat-<id>-tint`. Final light values (changed from the foundation proposal): Strength fill `#B5532C` with **text token `#9E4522`** (Copper Deep); Cycle `#2F5A45`; Conditioning `#8A5300`; Mind & Body **`#52684A`** (was Sage `#5E7352`); Aqua `#1F6E7A`; Court **`#7F6019`** (was `#8C6A1F`); Recovery `#5F4E86`; Youth `#9C3D6B`. Dark values are unchanged from the foundation. Tint strength: 10 % light, 14 % dark.
Rules the app follows (shared part 1, sections 2.3–2.4):
1. Category-coloured text is allowed only on `surface`, `background` and tints over them. It is **not** allowed on `surface-muted` (it fails for Strength, Mind & Body and Court). Do not put a category badge in a muted table stripe, a "Taken" cell or a muted chip row.
2. Strength shows copper only as a 4 px stripe, a 16 px icon and a 10 % tint. A solid Strength badge is allowed only on photos. A filled copper shape with a label is always a button.
3. Conditioning shares its colour with `warning`. A warning always has the triangle icon and a sentence. A Conditioning badge always has the `activity` icon and the word.
4. Category order everywhere: Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, Recovery, Youth.

### 0.2 Type, radius, space, size, motion
| Token | Value |
|---|---|
| XXS | 11/14, Inter 500, +2 % — tab bar labels only |
| XS | 12/16, Inter 500, +1 % — help text, badges |
| S | 14/20, Inter 400, +1 % — dense lists, labels |
| M | 16/24, Inter 400, 0 — body |
| L | 24/30, Archivo 600, −2 % — section titles |
| XL | 36/40, Archivo 800, −2 % — page titles |
| XXL | 48/52, Archivo 800, −3 % — sign-in heading on wide screens only; no heroes in the app |
| Data | Archivo 500, 16/24, tabular — times, prices, counts |
| Data-L | Archivo 700, 36/40, −2 % — big numbers |
| Eyebrow | Archivo 600, uppercase, 12/16, +0.24em |
| Button, Label | Inter 600, 14/20, +1 % |
| Input | Inter 400, 16/20 (16 px stops iOS zoom) |
| Radius | xs 4 · s 10 (buttons, inputs, tabs) · m 14 (cards) · l 20 (sheets) · xl 28 (hero panels) · full (badges, avatars) |
| Space | 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Controls | 44 px height, 24 px checkbox, 32 px avatar (56 px in family cards, 72 px in pass) |
| Motion | Small 150 ms `cubic-bezier(0.2,0.8,0.2,1)`; large 300 ms `cubic-bezier(0.16,1,0.3,1)`; press scale 0.98; popup scale 0.96 |
| Focus | 2 px ring, `focus` colour, offset 2 px, on every focusable part (Scroll area ring set in local CSS) |

Tailwind mapping: import `theme.css` (`--cp-*` variables) and map in `@theme` (for example `--color-background: var(--cp-background)`, `--radius-s: var(--cp-radius-s)`). Fonts `Archivo` and `Inter` are self-hosted with `next/font`. Alias note: Graphical GUI.md uses `"Sidebar Inter"`; confirm the `font-family` alias in the loader (CL "Source notes").

---

## A. Graphical components (`@/components/graphical`)

All 38 exports are available. Part names follow Base UI (Root, Trigger, Popup, etc.); confirm each part in `components/graphical/components/library/consumer.tsx` before use, because the research could not verify every part name (CL §1).

| Graphical export | Variants / key parts | Where used in this app |
|---|---|---|
| `Button` | `variant`: primary (default), secondary, outline, ghost, danger; `small`; `ButtonLabel`, `ButtonContent`. 44 px high. | Everywhere. **Primary**: one per view (Book class, Reserve court, Save). **Secondary**: dark brand band actions. **Outline**: Details, Cancel booking, Change plan, Freeze. **Ghost**: Skip, Release, toolbar icons. **Danger**: Cancel anyway, Cancel membership, Remove member. |
| `Input` (+ `InputLabel`) | Size M (16 px) | Email, names, search, notes (single-line) |
| `Field` | Label, Control, Description, Error | Every form field; error text under control; description for help |
| `Fieldset` | Legend, Content | Radio/checkbox groups (Who are you adding?, Notification channels) |
| `Form` | Content, Label, Control, Error, Action | Sign in, add member, guest pass, PT notes. Submit with Enter. Validation by Zod; errors map to `Field.Error`. |
| `Checkbox` / `CheckboxGroup` | 24 px; indeterminate | Filters, consent (waitlist), children selection (kids club), allergy confirmation |
| `Radio` / `RadioGroup` | Row, Label | Home club, goals, who-are-you-adding, cancel reasons, theme |
| `Switch` | Track off = Neutral 6 | Notification matrix, "Open spots only", teen permissions, Any lane |
| `Select` (`SelectField`) | | Who (household), Club in setup bars, start date (freeze), invoice filter, sort |
| `Combobox` (`ComboboxField`) | Input, list | Member search for partners, instructor filter, home club (long lists) |
| `Autocomplete` | Input | Help search suggestions |
| `NumberField` | Increment, decrement, input | Players stepper, guests stepper (W §4 r42) |
| `OTPField` | 6 inputs | Sign-in code, step-up auth |
| `Slider` | Thumb, track | Intensity range (with +/- buttons as non-drag alternative) |
| `Toggle` / `ToggleGroup` | | View (Week/List), progress range, freeze length (1/2/3 months), day-of-week in popular times, sport. The court duration control is the shared `DurationChips`, built on `ToggleGroup`. |
| `Tabs` | List, Trigger, Panel | Inbox tabs, Bookings calendar/list (as anchors elsewhere) |
| `Accordion` | Trigger, Panel | Rules, help, FAQ, plan details on mobile |
| `Collapsible` | Trigger, Panel | Cancel membership, Remove member, filter groups |
| `Dialog` | Popup, Title, Description, Close, Action | Waitlist join (shared dialog), guest pass, payment method, add member, command menu container, `CheckInPass` dialog |
| `AlertDialog` | | LateCancelDialog, cancel confirmation, remove member, sign out everywhere |
| `Drawer` (`Viewport`, `Content`, `Action`) | Side right / bottom | `ClassDetailPanel` `sheet`, `ScheduleFilters` `drawer`, ClubSwitcher (narrow), players panel (mobile), sidebar (mobile). If `side` is not supported, add it in the Graphical wrapper; fallback shadcn `sheet`. |
| `Popover` | | ClubSwitcher (wide screens), notifications, calendar |
| `PreviewCard` | | Instructor preview, class hover preview |
| `Menu` | Item, Group, Separator, RadioItem | Account menu, row actions, add-to-calendar |
| `ContextMenu` | | Right-click on schedule row |
| `Tooltip` | | Icon buttons, disabled reasons |
| `Toast` | Provider, Viewport, Root, Title, Description, Action, Close; states Default/Open/Invalid/Loading | All feedback (section D) |
| `Avatar` | Image, Fallback | Instructors, members, coaches |
| `Progress` | Track, Value | Onboarding, wizard steps, hold timer |
| `Meter` | Track, Value | Strike meter (3 segments), capacity bars where numeric |
| `ScrollArea` | Viewport, Scrollbar | Court grid, week grid, comparison table, horizontal lists |
| `Separator` | | Dividers, "or" |
| `Toolbar` | | Schedule toolbar, sticky action bar |
| `Menubar`, `NavigationMenu` | — | **Not used.** Desktop navigation is the shadcn `sidebar`. |

Graphical-integration helpers: `GraphicalProvider` wraps the app; `ThemedIcon`/`IconRendererProvider` supply Lucide; `AnimatedValue` is used for count changes only when reduced motion is off.

### A.1 Button decision table
| Intent | Variant | Example |
|---|---|---|
| The one thing to do now | primary | "Book", "Reserve Court 3", "Confirm spot", "Keep my spot" (cancel dialog) |
| Alternative in the same view | outline | "Details", "Change plan" |
| Low-weight or dismissive | ghost / text | "Skip for now", "Release", "Share" |
| On dark bands | secondary | PromoBand button |
| Irreversible or costly | danger | "Cancel booking" (quiet text button at the bottom of the cancel dialog), "Cancel membership" (full button, equal size to "Keep my membership") |
Two primaries never share a view. In the cancel-booking dialog the buttons are stacked: filled "Keep my spot", outline "Reschedule instead", quiet danger "Cancel booking" (shared §7.2; mobbin-standard-pass §2 rules 27–28). In plan-change footers the safe action is outline on the left and the change is filled on the right ("Keep Ridge" / "Switch to Summit"; G r5). Cancel membership uses two full buttons of equal size (Flow 14).

---

## B. shadcn/ui (style `base-nova`, Lucide icons)

Install commands use `npx shadcn@latest add <name>` (CL §2). Prefer Graphical when it exists.

### B.1 Blocks
| Block | Command | Use |
|---|---|---|
| `sidebar-07` | `npx shadcn@latest add sidebar-07` | Source of `AppShell`: collapsible-to-icons sidebar, header, footer user menu. Restyle with theme tokens. |
| `login-03` | `npx shadcn@latest add login-03` | Sign-in layout (form + image). Only the layout; use Graphical `Field`, `Input`, `Button`. |
| `dashboard-01` | `npx shadcn@latest add dashboard-01` | **Reference only** for Today's stat cells and chart cards. Not installed into the app. |

### B.2 Components to install
| shadcn name | Command | Used for | Notes |
|---|---|---|---|
| `sidebar` | `npx shadcn@latest add sidebar` | AppShell (`SidebarProvider`, `Sidebar`, `SidebarGroup`, `SidebarMenu`, `SidebarTrigger`, `SidebarInset`) | `collapsible="icon"` at ≥1024; hidden + Drawer below |
| `calendar` | `npx shadcn@latest add calendar` | Choose date, month grids, PT picker, bookings calendar | Disable past and out-of-window days; dot modifiers |
| `chart` | `npx shadcn@latest add chart` | PopularTimesChart, class mix, weekday bars, progress trends | Wraps Recharts; always add a table alternative |
| `data-table` | `npx shadcn@latest add data-table` | InvoiceTable, strike history | Uses TanStack Table. Member-facing use only (not staff). |
| `table` | `npx shadcn@latest add table` | PlanComparisonTable, simple tables | |
| `command` | `npx shadcn@latest add command` | CommandMenu (`cmdk`) | Inside Graphical `Dialog` |
| `skeleton` | `npx shadcn@latest add skeleton` | Loading shapes | |
| `spinner` | `npx shadcn@latest add spinner` | Button pending, "Checking availability…" | |
| `badge` | `npx shadcn@latest add badge` | Chips: Teen OK, First-timers, Home, Default | Graphical has no badge (CL §2) |
| `card` | `npx shadcn@latest add card` | All surfaces | Flat style from theme |
| `alert` | `npx shadcn@latest add alert` | Inline banners (payment, paused, offline) | Role `status` or `alert` by severity |
| `breadcrumb` | `npx shadcn@latest add breadcrumb` | Membership sub-pages, Coach profile | |
| `pagination` | `npx shadcn@latest add pagination` | Invoices, past bookings | |
| `carousel` | `npx shadcn@latest add carousel` | "This week" and "Suggested" lists on mobile | Arrow buttons 44 px; swipe optional |
| `empty` | `npx shadcn@latest add empty` | Base of `EmptyState` | |
| `kbd` | `npx shadcn@latest add kbd` | ⌘K hint, shortcut help | |
| `item` | `npx shadcn@latest add item` | Base for NotificationItem, list rows | |
| `textarea` | `npx shadcn@latest add textarea` | Notes to coach, cancel reason Other, messages | Inside Graphical `Field` |
| `input-group` | `npx shadcn@latest add input-group` | Search with icon and ⌘K hint | |
| `button-group` | `npx shadcn@latest add button-group` | Joined month nav buttons | |
| `aspect-ratio` | `npx shadcn@latest add aspect-ratio` | 16:9 class photos, 4:5 coach photos | |
| `date-picker` | `npx shadcn@latest add date-picker` | Visit date in guest pass dialog | Composed from `calendar` + Graphical `Popover` |
| `native-select` | `npx shadcn@latest add native-select` | Optional mobile fallback for long selects | Only if Graphical `Select` fails on small screens |

Not installed on purpose: `toast`/`sonner` (use Graphical `Toast`; `sonner` is not in the shadcn docs index, CL §2), `sheet` (use Graphical `Drawer`), `dialog`, `alert-dialog`, `dropdown-menu`, `popover`, `tabs`, `select`, `checkbox`, `switch`, `slider`, `input-otp`, `progress`, `scroll-area`, `tooltip`, `hover-card` (all covered by Graphical), `resizable`, `code-block`, `bubble`, `message`, `marker`, `questionnaire` (unverified purpose).
`input-otp`: Graphical `OTPField` covers it; the user list names `input-otp`, so keep it as an optional fallback only if `OTPField` lacks paste support (test first).

### B.3 Other packages
| Package | Use |
|---|---|
| `@tanstack/react-query` | Client data cache, polling, optimistic updates |
| `@tanstack/react-table` | Behind `data-table` |
| `nuqs` | Typed URL query state for Schedule filters |
| `zod`, Base UI `Form` | Validation |
| `date-fns`, `date-fns-tz` | Dates in `America/Phoenix` |
| `maplibre-gl` | ClubMap (tiles from a vector provider; static-image fallback) |
| `qrcode` (or `uqr`) | Client-side QR render of signed pass tokens |
| `ics` | Server-side `.ics` generation |
| `recharts` | Installed by `chart` |
| `lucide-react` | Icons |
| `next/font`, `next/image` | Fonts, photos (`sizes` set per card) |
| Payment provider hosted fields | Card entry; no raw card data in our code |

---

## C. Shared brand components: app-specific usage

Defined in the shared spec. Variant names below are the shared names. This table says only how the web app uses each one. Section numbers point into the shared spec.

| Component | Shared variants used by the web app | App-specific usage and rules |
|---|---|---|
| `RibMeter` (§5.1) | tones `neutral`, `success`, `warning`, `danger`, `brand`, `category` | Base for ribs and for `PackMeter` and the strike meter. Always paired with a text value. |
| `IntensityRibs` (§5.2) | `with-label` (default), `ribs-only` (rows under 640 px) | Word follows the ribs (Easy…All-out). In `ribs-only` the word is in the accessible name. |
| `BusynessMeter` (§5.3) | `compact` (ClubSwitcher rows, `ClubPin`), `inline` (list rows, Club cards), `card` (`ClubStatusCard` on Today), `hero` (club detail) | Level word always visible. Stale data greys the ribs. Levels only, no head count. |
| `CapacityIndicator` (§5.4) | `ribs` (schedule rows), `text`, `badge-on-photo` (suggested cards), `large` (`ClassDetailPanel` stats row) | The member app always shows the count; low = 5 or fewer (warning tone). "Full · 3 waiting" at 0. Lane slots read "1 of 2 swimmers". |
| `CategoryBadge` (§5.5) | `sm`, `md`; filter/toggle form for onboarding and filters | Icon + name, never colour alone. Colour rules in section 0.1. |
| `AmenityChip` (§5.6) | static, `filter` | Club amenities, "What to bring". |
| `ClubCard` (§6.1) | `feature` (onboarding list, Clubs list on wide screens), `compact`, `list-row` (ClubSwitcher, Clubs list), `map-callout` | Adds "Home" tag and lock tag for Trailhead. |
| `ClubHero` (§6.2) | `app` | Adds "Set as my club". Text on a solid Saguaro band. |
| `ClubSwitcher` (§6.3) | mode `single` (top bar), `multi` (schedule club filter) | Popover on wide screens, Drawer on narrow. Trailhead rows locked with "Ridge unlocks all 5 clubs". Writes `cp_club` cookie. |
| `HoursTable` (§6.4) | `week` (club detail), `grouped` (cards), `today` (hero line) | Highlights today. |
| `PopularTimesChart` (§6.5) | chart + table alternative | Uses `chart`. Typical hours, live marker hidden when stale. |
| `ClubMap` / `ClubPin` (§6.6) | split view | Always paired with a list (W §5 a11). |
| `ClassCard` (§7.1) | `schedule-row` (Schedule, Bookings with a booking row mode), `card` (Suggested), `compact` (week grid, agenda, club page), `featured` (top suggestion) | Reading order time, title, instructor, spots, action. Age chip when an age rule exists. |
| `ClassDetailPanel` (§7.2) | `sheet` (default, Drawer 480 px), `panel` (≥1536 px, List view), `page` | Confirmed view, cancel dialog and rules block as in the shared spec. |
| `InstructorChip` (§7.3) | `inline`, `stacked`, `stack`, `sub`; sizes `md`, `lg`; `choice` (PT coach picker) | `choice` shows a ring and check on the selected coach. |
| `CoachCard` (§7.4) | `card` (Training grid), `feature` (profile header), `compact` (club page) | |
| `ScheduleDayStrip` (§7.5) | window-based | Props: booking window days (7; Summit 9; courts 3), opens-at text. Selected chip = Saguaro fill. |
| `ScheduleWeekGrid` (§7.6) | wide screens | Keyboard grid (file 05 §6). |
| `ScheduleFilters` (§7.7) | `sidebar` (List ≥1280), `drawer` | URL state. |
| `ClassPhotoTile` (§7.8) | — | **Not used in v1.** Photos in this app come from `ClassCard` `card`, `ClassDetailPanel` and plain `aspect-ratio` images. |
| `BookingStateButton` (§8.1) | all 12 states; sizes `md`, `lg` | See "Shared: booking states" in `02-flows.md`. Reasons for the app cases are passed as `reason`. |
| `DurationChips` (§8.2) | 60 min \| 90 min (courts); 45 min fixed for lanes (no control) | Segmented chips, selected chip filled. Built on Graphical `ToggleGroup`. |
| `ReservationSlotGrid` (§8.2) | `matrix` (courts, lap lanes), `blocks` (kids club), `list` (PT times, recovery slots) | Slot statuses `open`, `selected`, `mine`, `taken`, `closed`, `past`, `low`. App additions are listed in `03-pages.md` §8. |
| `PlanCard` (§9.1) | `current`, `change`, `select` (add-member radio cards) | `change` has the "Before you switch" list and the summary block. Frozen = neutral pill. |
| `PlanComparisonTable` (§9.2) | change-plan flow | Check icon + text. |
| `CheckInPass` (§9.3) | `full` (page and Dialog), `compact` (Today), `guest`, `teen`; states `valid`, `frozen`, `past-due`, `trial`, `guest` | Signed QR rotates every 60 s. |
| `VisitStreak` (§9.4) | `strip` (Today), `month` (Progress) | No X on missed days; no shame. |
| `ProgressRibs` (§9.5) | `inline` (Today stat row), `hero` (Progress); weekly goal | Month totals are plain numbers. |
| `EmptyState` (§10.1) | `block`, `inline`, `compact`; ids `no-bookings`, `no-past`, `no-waitlist`, `no-results`, `empty-day`, `club-closed`, `no-reservations`, `no-visits`, `frozen`, `offline`, `error`, `no-coaches` | Page copy in file 05 §3 uses the shared ids and sample copy where they exist. |
| `PromoBand` (§10.2) | `card` (Today, Membership) | Hidden for 7 days after dismiss, stored per device. One per page. |

**Requests to the shared spec owner** (not redefined here): (1) a `reason`-driven label for `BookingStateButton` `restricted` and, if wanted, a `not-open` state; (2) a `Release` secondary on the `hold` state; (3) a pack variant for `PlanCard`, or confirmation that `PackCard` stays an app composite; (4) confirmation that `ProgressRibs` stays weekly-goal only.

---

## D. App composites

Types are TypeScript sketches. All components accept `className` and forward `ref`. All support light and dark through role tokens.

### D.1 `AppShell`
**Purpose:** frame for all `(app)` pages. Built from shadcn `sidebar-07`.
```ts
type AppShellProps = {
  member: SessionMember;            // role, name, plan, photo
  viewingClub: ClubSummary;
  household: SessionMember[];
  banners: GlobalBanner[];          // sorted by priority
  children: React.ReactNode;
};
```
**Anatomy:** skip link → `Sidebar` (logo, groups, footer) → `SidebarInset` → top bar (SidebarTrigger, ClubSwitcher, CommandMenu trigger, Pass button, bell Popover, Help Menu, Account Menu) → banner stack → `<main id="main" tabIndex={-1}>` → bottom tab bar (<768) → Toast viewport → offline detector.
**States:** `collapsed` (icons + tooltips), `expanded`, `mobile` (Drawer), `offline`, `blocked` (role without access: item hidden). Sidebar width cookie `sidebar_state`.
**Composition:** `GraphicalProvider` → `QueryClientProvider` → `RealtimeProvider` → `Toast.Provider` → `SidebarProvider` → AppShell.
**Behaviour:** the skip link is the first focus stop ("Skip to main content"). Route change moves focus to `<main>` heading (`h1`) and updates `document.title` and a polite live region ("Schedule page loaded").

### D.2 `PageHeader`
```ts
type PageHeaderProps = { eyebrow?: string; title: string; description?: string;
  actions?: React.ReactNode; backHref?: string; };
```
Anatomy: optional back link, eyebrow, `h1`, description, actions slot. <768: actions wrap below; primary becomes full width.

### D.3 `NextUpCard`
```ts
type NextUpCardProps = { booking: BookingWithSession; now: Date; canCancelFree: boolean;
  onShowPass(): void; onCancel(): void; };
```
**Anatomy:** category stripe (6 px left) · eyebrow ("NEXT UP · IN 20 MIN") · title · meta line · `InstructorChip` · `IntensityRibs` · spot/bike · cancel-rule line · actions.
**States:** `upcoming` (default), `starting` (< 15 min: eyebrow becomes "STARTS SOON"), `in-progress` ("IN PROGRESS · 30 MIN LEFT"), `none` (empty variant with suggestions), `hold` (shows the hold countdown and the shared "Confirm spot" button), `frozen`.
**Rules:** the cancel-rule line is computed from `now` and says either "Free to cancel until 4:00 a.m." or "Cancelling now counts as a late cancel." (never both). The eyebrow time updates every 30 s (not every second).

### D.4 `TodayAgendaCard`
```ts
type TodayAgendaCardProps = { items: AgendaItem[]; who: 'me'|'household'; onRefresh(): void; };
type AgendaItem = { id: string; startsAt: Date; endsAt: Date; kind: 'class'|'court'|'lane'|'kids'|'pt';
  title: string; place: string; category: CategoryId; status: BookingStatus; people?: Member[]; };
```
**Anatomy:** header (title "Today", `Select` who, refresh icon button) → vertical timeline list (time column, stripe, title/place, status chip, chevron) → footer link.
**States:** loading, empty ("Nothing booked today." + button), populated, error, partial (one source failed).
**Composition:** rows are `ClassCard` `schedule-row` (compact, `booking` mode). Timeline is a `<ol>`.

### D.5 `ClubStatusCard`
```ts
type ClubStatusCardProps = { club: ClubSummary; busyness: { level: 1|2|3|4|5; label: Label; updatedAt: Date } | null;
  hoursToday: { opensAt: string; closesAt: string }; typical: HourlyLevels; };
```
**Anatomy:** photo strip → name → open status line → `BusynessMeter` (m) → updated time → one-sentence hint from `typical` → link "Popular times".
**States:** `live`, `stale` (> 15 min: grey + text "Live count unavailable. Showing typical hours."), `closed` ("Closed now · opens 4:30 a.m."), `loading`, `error`.
**Rules:** shows level only, never a head count. Updates every 5 minutes.

### D.6 `WaitlistBanner`
```ts
type WaitlistBannerProps = { entry: WaitlistEntry; variant: 'page'|'inline'|'row'; onConfirm(): void; onRelease(): void; };
// entry: { session, position?: number, status: 'waiting'|'hold'|'closed', holdExpiresAt?: Date }
```
Wraps the shared `BookingStateButton` states `waitlisted` and `hold`; it adds the message around them.
**States:**
| State | Look | Copy |
|---|---|---|
| `waiting` | Neutral row | "On waitlist #2. We stop moving people up 1 hour before class." |
| `hold` | Warning-subtle band, clock icon, countdown | "Spot held: Switchback HIIT, today 12:00 p.m. Confirm by 6:05 a.m." with the shared button "Confirm spot · 28:41" |
| `closing` (≤ 1 min) | Same + bold countdown | "1 minute left to confirm this spot." |
| `expired` | Neutral | "Your hold ended. We offered the spot to the next person." |
| `closed` | Neutral | "The waitlist is closed. Open spots show as drop-in spots." |
**Behaviour:** countdown uses server time offset; `aria-live` polite announcements at the start, at 5 minutes and at 1 minute (shared §8.1). Buttons: "Confirm spot" (primary, the shared `hold` button), "Release" (ghost, app addition). Keyboard focus is not stolen when the banner appears; a polite announcement is made.

### D.7 `LateCancelDialog` (and the on-time cancel dialog)
```ts
type CancelBookingDialogProps = { booking: BookingWithSession; late: boolean;
  strikes: { count: number; clearsOn: Date[] }; willPause: boolean; pauseUntil?: Date;
  alternatives: Session[];                  // other sessions of the same class this week
  onKeep(): void; onReschedule(): void; onCancel(reason?: CancelReason): Promise<void>; };
```
**Built from:** Graphical `AlertDialog`; bottom sheet under 768 px. Implements the shared cancel flow (shared §7.2). `LateCancelDialog` is the `late: true` form.
**Anatomy:** title → first line (consequence) → (on time) optional reason `RadioGroup` or (late) red-X consequence lines plus a 3-segment strike meter with "Strike 2 of 3" and the clearing date → stacked buttons.
**Buttons, top to bottom:** filled **"Keep my spot"** (initial focus) · outline **"Reschedule instead"** (rendered only if `alternatives.length > 0`) · quiet danger text button **"Cancel booking"** (or "Cancel and pause booking" when `willPause`).
**States:** `default`, `final-strike` (extra X line with the pause date), `pending` (button "Cancelling…"), `error` ("We couldn't cancel. Nothing changed. Try again.").
**Rules:** the first line states the consequence (G r18). The destructive action is quiet but is a visible, labelled button (mobbin-standard-pass §2 rules 27–28). The red X on each consequence line is always paired with words.

### D.8 `PlanChangePreview`
```ts
type PlanChangePreviewProps = { from: PlanId; to: PlanId | null; direction: 'upgrade'|'downgrade'|null;
  household: { adults: number; children: number };
  proration?: { daysLeft: number; cycleDays: number; planDiffMonthly: number; amountToday: number };
  nextCharge: { date: Date; amount: number; lines: Line[] };
  losses?: string[]; affectedBookings?: Booking[]; homeClubRequired?: boolean;
  paymentMethod: PaymentMethodSummary; onConfirm(): Promise<void>; onKeep(): void; };
```
**Anatomy:** header (plan + price with unit) → start line → lines table → Subtotal and bold "Today's total" (upgrade) with the line "The new monthly charge starts Nov 12." → next charge block with itemised lines → "Before you switch" list (red X + words) → affected bookings → payment line → buttons.
**States:** `empty` (no plan chosen), `upgrade`, `downgrade`, `same` (current plan; button disabled), `pending`, `error`, `frozen-blocked`.
**Formula:** `amountToday = round(planDiffMonthly × daysLeft ÷ cycleDays, 2)`. Example: `50 × 16 ÷ 31 = 25.81`. `daysLeft` counts today.
**Buttons (both directions):** outline "Keep Ridge" on the left, filled "Switch to Summit" or "Switch to Trailhead" on the right (shared `PlanCard` `change`; G r5). The "Before you switch" list uses a red X plus words on each lost item (mobbin-standard-pass §2 rule 31). The summary shows Subtotal, "Today's total" and when the new charge starts (rule 32).

### D.9 `FreezeWizard`
```ts
type FreezeWizardProps = { billingDates: Date[]; earliest: Date; householdMonthlyPrice: number;
  bookingsInRange: (months: 1|2|3, start: Date) => Promise<Booking[]>;
  onSubmit(v: { months: 1|2|3; start: Date }): Promise<void>; };
```
**Steps:** 1 Length and start · 2 What changes · 3 Confirm. `Progress` + "Step n of 3".
**States:** `step-1`…`step-3`, `submitting`, `done`, `blocked` (payment failing; already frozen; freeze scheduled), `error`.
**Derived text:** `end = start + months − 1 day`; `resume = start + months`. Example: Dec 12 + 1 month → "Frozen Dec 12 – Jan 11. Resumes Jan 12."
**Rules:** no pre-ticked box; Back preserves values; "Not now" returns to Membership without saving.

### D.10 `PaymentMethodCard`
```ts
type PaymentMethodCardProps = { method: { brand: 'visa'|'mastercard'|'amex'|'discover'; last4: string;
  expMonth: number; expYear: number; isDefault: boolean };
  status?: 'ok'|'expiring'|'expired'|'failed'; variant: 'full'|'compact'; onUpdate(): void; };
```
**Anatomy:** brand icon, "Visa ending 4821", "Expires 11/26", `Badge` Default, status pill, button "Update payment method", link "Add a backup card".
**States:** `ok`, `expiring` (< 60 days; warning pill "Expires next month"), `expired`, `failed` (danger pill "Payment failed" + "Try card again"), `none` ("No card on file" + "Add a card").

### D.11 `InvoiceTable`
```ts
type InvoiceTableProps = { data: Invoice[]; pageSize?: 10; filter?: InvoiceKind | 'all'; onOpen(id: string): void; };
```
Built from shadcn `data-table`. Columns: Date (sortable, default desc), Description, Amount (right-aligned, Archivo tabular, `$156.00`), Status pill, Download (icon button, `aria-label="Download invoice for Oct 12 (PDF)"`). Row click opens detail. <768: card list. Empty: "Your invoices will show here after your first charge." Loading skeleton rows. Pagination below.

### D.12 `FamilyMemberCard`
```ts
type FamilyMemberCardProps = { member: HouseholdMember; viewerRole: Role; variant: 'full'|'compact';
  onEdit(): void; onPermissions(): void; onShowPass(): void; onRemove(): void; };
```
Anatomy: avatar 56 px, name, role label (Primary, Adult, Teen, Child), age, status pill (Active, Invited, Add allergy notes), quick facts, actions `Menu`. Teen variant adds a permission summary line. States: `active`, `invited`, `invite-expired`, `incomplete` (warning), `removing` (ends Nov 12), `loading`. Viewer adult sees no menu except "Show pass" for self.

### D.13 `GuestPassCard`
```ts
type GuestPassCardProps = { pass: GuestPass; variant: 'balance'|'row'; onResend(): void; onCancel(): void; onCopyLink(): void; };
```
`balance`: big count ("1 of 1 left"), reset date, buttons. `row`: guest name, club, valid until, status pill (Sent, Opened, Used, Expired, Cancelled), actions menu. States by status.

### D.14 `NotificationItem`
```ts
type NotificationItemProps = { n: Notification; variant: 'popover'|'list'; selected?: boolean;
  onOpen(): void; onAction?(a: NotificationAction): Promise<void>; };
```
Anatomy: icon circle, bold title, one-line text, relative time, unread dot (with `sr-only` "Unread"), optional action buttons. States: `unread`, `read`, `needs-action`, `acting` (spinner), `done` (action succeeded: "Kept. You're booked."), `expired` (action no longer valid: "This offer ended."). Rows are `<li>` in a list; the whole row is a button except the inline actions.

### D.15 `CommandMenu`
```ts
type CommandMenuProps = { open: boolean; onOpenChange(o: boolean): void; role: Role; };
```
Built from shadcn `command` in Graphical `Dialog`. Groups: Suggestions, Sessions, Clubs, Coaches, Pages, Actions, Help. Search debounce 120 ms; sessions come from `GET /api/search?q=` (top 8). Result item: icon, label, secondary, trailing hint. Empty: "No results for 'cyle'. Try 'cycle'." (did-you-mean). States: `idle`, `loading` (spinner at right of input), `results`, `empty`, `error`. Role filters hide billing/membership for teens. Focus returns to the trigger on close.

### D.16 More composites

| Component | Props (short) | Notes |
|---|---|---|
| `StatRow` / `StatCell` | `cells: {label, value, hint?, icon?}[]` | 4 cells with 1 px dividers (W §4 r29). Under 768: 2×2, dividers kept. `value` uses `data-l` or `data` size by `emphasis`. |
| `StatusPill` | `status: 'active'|'freeze_scheduled'|'frozen'|'payment_failed'|'cancel_scheduled'|'changing'|'paid'|'pending'|'failed'|'invited'; label?` | Icon + text always. Colours: success, neutral, warning, danger (W §4 r25, a9). |
| `PaymentStatusBanner` | `status`, `dueOn`, `amount`, `daysLeft` | `Alert` danger-subtle; actions "Update card", "Try card again". |
| `BookingForSelect` | `members`, `value`, `eligibility(memberId)` | Shows reasons for disabled people. |
| `AttentionList` | `items: Attention[]` (max 3) | Held spot, unfinished onboarding, passkey, expiring card. |
| `PackMeter` | `used`, `total`, `expiresOn` | Built on `RibMeter` with "5 left" text (shared `ProgressRibs` is weekly-goal only). |
| `PackCard` | `sessions: 4|8|12`, `price`, `perSession` | Training pack card ("8 sessions $520 · $65 each"). The shared `PlanCard` has no pack variant. |
| `LateCancelMeter` | `count`, `max=3`, `clearsOn[]` | 3 segments + text. |
| `SlotHoldTimer` | `expiresAt`, `canExtend`, `onExtend` | `Progress` + text; warns at 1:00; one extension of 5:00; `aria-live` announcements at 1:00 and 0:00. |
| `StepProgress` | `step`, `total`, `labels?` | `Progress` + "Step 2 of 5". |
| `SessionRouteShell` | `sessionId`, `mode: 'panel'|'page'` | Picks Drawer vs page; shares `ClassDetailPanel`. Handles focus return. |
| `ReservationSummaryCard` | `reservation`, `showReference` | Used on confirmation pages. Reference block (W §4 r36). |
| `SuccessPanel` | `headline`, `pill?`, `summary`, `primary` (default "Add to calendar"), `shareHref?`, `rows?`, `onDone` | The shared confirmed view (shared §7.2; mobbin-standard-pass §2 rules 44–46, 62): one green check, one headline, "Confirmed" pill, summary card, filled button, "Share" text link, action rows, "Done". Used for booking, reservation, kids club, PT, guest pass (primary = "Copy link"), freeze, plan change. |
| `AddToCalendarMenu` | `event`, `variant` | Google, Apple/Outlook .ics, copy. |
| `OfflineBanner` | — | `navigator.onLine` + failed fetch heuristics. |
| `RealtimeProvider` | `clubIds`, `dateRange` | Opens SSE; exposes `useSession(id)`, `useBusyness(clubId)`. |

### D.17 Slot statuses for `ReservationSlotGrid`
The statuses are the shared ones (shared §8.2): `open`, `selected`, `mine`, `taken`, `closed`, `past`, `low`. The web app does not redefine their look. Two app-only additions:

| Addition | Look | `aria-label` pattern |
|---|---|---|
| Not enough time for the chosen duration | `open` look dimmed, no dot | "Court 3, 9:00 a.m., not enough time for 90 minutes" |
| Not yet open | Muted, label "Opens Wed 6:00 a.m." | "Opens Wednesday at 6:00 a.m." |
Accessible names for all statuses follow the shared pattern "Court 3, 7:00 to 8:00 a.m., available". Each slot is a `radio` inside one `radiogroup` (shared §8.2 Accessibility), with arrow-key movement as in file 05 §6.

---

## E. Motion and feedback

### E.1 Motion rules (Theme: Snappy)
| Interaction | Duration / easing | Notes |
|---|---|---|
| Hover, press, focus, toggle, chip select | 150 ms, `cubic-bezier(0.2,0.8,0.2,1)` | press scale 0.98 on buttons and tiles |
| Popover, menu, tooltip open | 150 ms, opacity + scale 0.96 → 1 | origin at trigger |
| Dialog, drawer, bottom sheet | 300 ms, `cubic-bezier(0.16,1,0.3,1)` | drawer slides from its edge; dialog fades + scale 0.96 |
| Route panel (session) | 300 ms | content mounts after the first frame; skeleton until data |
| Accordion, collapsible | 150 ms height | |
| Spot-left change | 150 ms count swap (`AnimatedValue`); row background flashes `primary-subtle` 600 ms | |
| RibMeter fill | 300 ms from left | only on first view |
| Skeleton shimmer | 1.2 s linear loop | |
| Page route change | No page transition | Calm, no slide |
No bounce, no spring, no parallax, no confetti. Success is a check icon and text.
**Reduced motion** (`prefers-reduced-motion: reduce` or Settings > Display > Motion = Reduce): remove transforms and slides; keep opacity changes at 100 ms or none; no skeleton shimmer (static fill); no row flash (use a static "Updated" marker for 3 s); no animated counters; auto-scroll uses `behavior: 'auto'`; carousels do not auto-advance (they never auto-advance anyway).

### E.2 Toasts (Graphical `Toast`)
| Rule | Value |
|---|---|
| Position | Bottom-right (≥1024). Bottom-centre above the tab bar (<1024; offset 80 px). |
| Max stacked | 3; older ones collapse |
| Duration | Success 5 s · Undo 10 s · Info 5 s · Error: stays until closed |
| Content | Title (verb + object) and optional one-line description; action button (Undo, View); close button 44 px |
| Role | Success/info: `role="status"` polite. Error: `role="alert"`. |
| Pause | Timer pauses on hover and on focus within |
| Keyboard | `F6` moves focus to the toast region; Esc closes the focused toast (verify Base UI Toast behaviour; fallback: add a global handler) |
| Never | A toast is not the only place an error shows: form errors stay inline; booking failures also update the control state |
Examples: "Booked: Climb Cycle, Tue 6:00 a.m." [Undo] · "Cancelled. 2 late cancels in 30 days." · "Card updated: Mastercard ending 0937." · error "That class is full. Join the waitlist or pick the 7:00 a.m. class." [Join waitlist].

### E.3 Optimistic updates
| Action | Optimistic change | Roll back when |
|---|---|---|
| Book | State `booking` → `booked`; spots −1 | 409 full, 403 paused/plan, network |
| Cancel booking | Row → `cancelled`; spots +1 | network, 409 changed |
| Join waitlist | State → `waitlisted` with position "…" then actual | 409, network |
| Confirm spot | `hold` → `booked` | hold expired (409) |
| Mark notification read | Dot removed | network (dot returns silently) |
| Court / lane / kids club reserve | **Not optimistic** (money/holds): show `pending` and wait for server | — |
| Payment, plan, freeze, cancel membership | **Not optimistic** | — |
The server is the authority. After every mutation, the client revalidates the affected keys. A rolled-back change shows an error toast and puts focus back on the control.

### E.4 Inline feedback
- Field validation runs on blur and on submit; messages are text under the field, linked by `aria-describedby`.
- Buttons in `pending` keep their width and show a `Spinner` with the original label hidden from sight but present for screen readers plus "…ing".
- Success after a form save: inline "Saved" with check for 3 s.

---

## F. Data loading and real-time rules

### F.1 Rendering strategy
| Page type | Strategy |
|---|---|
| Static shell (`AppShell`, nav) | Server Component, streamed |
| Page data (Today, Bookings, Membership, Billing) | Server Components fetch with the session; wrap in `Suspense` with skeletons; tag `bookings`, `membership`, `billing` for `revalidateTag` |
| Schedule, Reserve grids, Clubs | Initial data from the server; then TanStack Query takes over for live updates |
| Session panel | Prefetch on row hover/focus (200 ms intent); the intercepted route renders from the cache instantly |
| Images | `next/image` with `sizes`; blur placeholder; class photos 16:9, coach 4:5 |
| Fonts | `next/font` Archivo + Inter, `display: swap`, subset Latin |

### F.2 Live data
| Data | Mechanism | Interval / trigger | Stale handling |
|---|---|---|---|
| **Club busyness** (5 levels) | `GET /api/clubs/:id/busyness` (batched `?ids=`) | **Every 5 minutes**, aligned to the server's 5-minute boundary + up to 30 s jitter. Refetch on window focus if older than 5 minutes. Paused when the tab is hidden. | > 15 min old: grey meter + "Live count unavailable. Showing typical hours." |
| **Spots left, waitlist count, session state** | SSE `GET /api/stream/sessions?club=…&from=…&to=…` events `{sessionId, spotsLeft, waitlistCount, status, version}` | Live. Client throttles UI updates to 1 per second per row. | SSE drop: fall back to polling every 20 s and show "Reconnecting…" next to the Live dot; after 60 s offline show "Spots may be out of date." |
| **Court/lane grids** | Same SSE channel `resource:{clubId}:{date}` | Live | On conflict (409) refresh the grid |
| **My holds / waitlist position** | SSE user channel `user:{id}` | Live | Fallback poll 30 s |
| **Notifications** | SSE user channel | Live | Poll 60 s |
| **Pass token** | `POST /api/passes/token` | Every 60 s while `/pass` is visible; token valid 5 min | Keep last token 5 min on failure |
| **Server clock** | `GET /api/time` on load; offset kept in memory | On load and every 10 min | Used for countdowns and window opening |

Accessibility: spot-count changes are **not** announced one by one. A polite live region summarises "3 changes to this list" no more than once per 10 seconds, and announces changes to the item that has focus.

### F.3 Caching
| Key | `staleTime` | Notes |
|---|---|---|
| `['sessions', club, range]` | 30 s | Updated by SSE; refetch on reconnect |
| `['session', id]` | 30 s | Seeded from list |
| `['busyness', clubIds]` | 5 min | |
| `['bookings', who]` | 60 s | Invalidate after any booking mutation |
| `['membership']`, `['billing']` | 5 min | Invalidate after plan, freeze, card, invoice change |
| `['clubs']` | 1 h | Static info (hours, amenities) |
| `['coaches']` | 15 min | |
| `['progress', range]` | 10 min | |

### F.4 Errors, retries, offline
- Reads retry 2 times with 500 ms and 1.5 s back-off. Writes do not auto-retry; they show the error and a "Try again" button.
- Every write sends an `Idempotency-Key` header (UUID per user intent) so double clicks and retries cannot double book or double charge.
- Error codes the UI maps to copy: `CLASS_FULL`, `SLOT_TAKEN`, `WINDOW_CLOSED`, `BOOKING_PAUSED`, `PLAN_REQUIRED`, `AGE_RESTRICTED`, `CONFLICT_OVERLAP`, `HOLD_EXPIRED`, `PAYMENT_DECLINED`, `PAYMENT_REQUIRES_ACTION`, `RATE_LIMITED`, `NETWORK`, `UNKNOWN` (copy in file 05).
- Offline: a service worker (PWA manifest from `identity/export/symbol/site.webmanifest`) caches the shell, `/today`, `/bookings`, `/pass`, and the last club pages. Writes are disabled offline; nothing is queued, to avoid surprise bookings.
- Time: all durations use server time. UI timers re-sync when the tab becomes visible.

### F.5 Performance targets
Today: LCP ≤ 2.0 s on a mid-range phone on 4G; Time to Interactive ≤ 3.5 s; client JS for Today ≤ 180 KB gzip (charts and map are dynamically imported). Schedule rows: 60 rows render under 100 ms (virtualise above 60). CLS ≤ 0.05 (reserve space for banners and images). INP ≤ 200 ms.

### F.6 Privacy
- Location is read only after the member presses "Use my location" and is not stored.
- Busyness shows levels, not counts.
- Teen data is visible to the primary member and says so in Settings.
- Logs do not contain health notes or card data.
