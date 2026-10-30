# Marketing site 04 — Components, motion and imagery

Tags (`MM §3 r6`, `MG r28`, `CL §2`, `FD §3`, `BG §7`, `TH`) are explained in `01-strategy-and-ia.md` §0.
This file lists every library component the site uses, every shadcn install, every site-specific composite section, the motion spec and the photo spec.
Shared brand components keep the exact names from `../01-shared-brand-components.md`. Those components are **not** redefined here.

## 0. Setup and tokens

### 0.1 Install order
1. Create the app: `npx create-next-app@latest` (App Router, TypeScript, Tailwind, `src/` not used, import alias `@/*`).
2. Initialise shadcn with the Base UI style: `npx shadcn@latest init` and pick style `base-nova`, icon library `lucide` (`CL §2`).
3. Install the Graphical theme and all Base UI components: `npx shadcn@latest add https://www.graphicalui.com/r/s8bexxclgkuo.json` (current registry revision, `ui-theme/README.md`). Components land in `components/graphical/`; import from `@/components/graphical`.
4. Add the shadcn pieces in §2 of this file.
5. Copy `ui-theme/theme.css` tokens (`--cp-*`) into `app/globals.css`, or import the Graphical token block. Local `--cp-*` names are used for site code; Graphical `--cte-*` tokens stay inside Graphical components.
Rule: app code uses role names, never hex values (`CL §5`). Hex values appear only in the theme files.

### 0.2 Tailwind v4 theme mapping (`app/globals.css`)
Map the role tokens once. Utilities then read `bg-background`, `text-muted`, and so on.

```css
@import "tailwindcss";

@theme inline {
  /* colour roles (light and dark are switched by the --cp-* variables in theme.css) */
  --color-background: var(--cp-background);
  --color-surface: var(--cp-surface);
  --color-surface-muted: var(--cp-surface-muted);
  --color-text: var(--cp-text);
  --color-muted: var(--cp-text-muted);
  --color-border: var(--cp-border);
  --color-border-strong: var(--cp-border-strong);
  --color-border-hover: var(--cp-border-hover);
  --color-primary: var(--cp-primary);
  --color-primary-foreground: var(--cp-primary-foreground);
  --color-primary-hover: var(--cp-primary-hover);
  --color-primary-subtle: var(--cp-primary-subtle);
  --color-link: var(--cp-link);
  --color-secondary: var(--cp-secondary);
  --color-secondary-foreground: var(--cp-secondary-foreground);
  --color-success: var(--cp-success);  --color-success-subtle: var(--cp-success-subtle);
  --color-warning: var(--cp-warning);  --color-warning-subtle: var(--cp-warning-subtle);
  --color-danger: var(--cp-danger);    --color-danger-subtle: var(--cp-danger-subtle);
  --color-focus: var(--cp-focus);

  /* radius */
  --radius-xs: var(--cp-radius-xs);  --radius-s: var(--cp-radius-s);  --radius-m: var(--cp-radius-m);
  --radius-l: var(--cp-radius-l);    --radius-xl: var(--cp-radius-xl); --radius-full: var(--cp-radius-full);

  /* spacing scale additions (4 8 12 16 24 32 48) */
  --spacing-xxs: var(--cp-space-xxs); --spacing-xs: var(--cp-space-xs); --spacing-s: var(--cp-space-s);
  --spacing-m: var(--cp-space-m);     --spacing-l: var(--cp-space-l);   --spacing-xl: var(--cp-space-xl);
  --spacing-xxl: var(--cp-space-xxl);

  /* fonts */
  --font-display: var(--cp-font-display);  --font-ui: var(--cp-font-ui);
  --font-editorial: var(--cp-font-editorial); --font-data: var(--cp-font-data);

  /* breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (Tailwind defaults, kept) */
}

/* Type scale utilities: .type-xxl .type-xl .type-l .type-m .type-s .type-xs .type-xxs
   .type-eyebrow .type-data .type-data-l .type-button .type-label .type-input
   Each sets font-family, size, line-height, tracking, weight from --cp-size-*, --cp-line-*,
   --cp-tracking-*, --cp-weight-* (see theme.css). Archivo headings add:
   font-variation-settings: "wdth" 112;   (expanded, BG §5) */
```

Use: `<h1 className="type-xxl text-text">`. Prices: `<span className="type-data">$79</span>`.
Focus ring utility `.focus-ring`: `outline: 2px solid var(--cp-focus); outline-offset: 2px;` on `:focus-visible` for every interactive element that Graphical does not already style. Scroll area gets this class by CSS because Graphical exposes no ring control (`README` "Focus rings").
Dark mode: `prefers-color-scheme: dark` with `[data-theme]` override, as `theme.css` already does. The footer and `TourCTABand` keep Saguaro Night in both modes.

### 0.3 Fonts
Load with `next/font`: Archivo (variable, axes `wght` 100–900, `wdth` 62–125, subsets latin) and Inter (variable, `wght` 400/500/600 used). `display: swap` with `adjustFontFallback` so the fallback metrics match (CLS). Preload only the hero weight files. Total font payload ≤ 120 KB (file 05 §6). Never more than these two families (`BG §5`).

---

## 1. Graphical components used (`@/components/graphical`)

Names are the Base UI exports in Graphical (`CL §1`). The "Parts" column lists only the parts the site uses. Part names come from the Graphical source; check against the Base UI docs before build (`CL` note 5).

| Component | Variants / props used | Where used |
|---|---|---|
| `Button` (+ `ButtonLabel`, `ButtonContent`) | `variant`: `primary` (copper, one per section), `secondary` (Saguaro Night, dark-surface actions only), `outline`, `ghost`, `danger` (cancel flows only: not on the marketing site); `small` (never below 44 px height: used only inside dense table rows with 44 px hit area from padding) | Header CTAs, hero buttons, cards, forms, dialogs |
| `Input` (+ `InputLabel`) | Text, email, tel, search; 44 px high, 16 px text | ZIP search, tour/trial/join forms, contact form, search |
| `Field` | label, control, description, error | Every form field |
| `Fieldset` | legend, error | Radio groups, DOB group, family member blocks |
| `Form` | group-level error, field errors | Join, tour, trial, contact |
| `Checkbox`, `CheckboxGroup` | 24 px (local override) | Consent, agreements, filter lists |
| `Switch` | label left | First-timer filter, open now, preferences |
| `RadioGroup`, `Radio` | Card-style rows (custom row layout) | Plan select, club select, tour club |
| `Select` | Single choice | Sort, club select, topic, specialty |
| `Combobox` | Searchable list | Coach filter, class filter |
| `Autocomplete` | Optional | ZIP suggestions (Phase 2) |
| `NumberField` | min/max, step | Family calculator |
| `OTPField` | 6 digits | Reserved: passwordless sign-in if enabled (not used at launch) |
| `Slider` | Range (two thumbs) | Intensity range filter |
| `Tabs` | List, Trigger, Panel | Category filters, day tabs (popular times), list/map toggle, Journal categories |
| `ToggleGroup`, `Toggle` | single / multiple | Amenity chips, view toggle, intensity guide |
| `Accordion` | single open | FAQ, mobile footer, drawer |
| `Collapsible` | Trigger, Panel | Order summary, emergency contact, optional note |
| `NavigationMenu` | List, Item, Trigger, Content, Link, Positioner, Popup, Viewport | Desktop primary nav and mega menus |
| `Menu` | Items | Signed-in menu, add to calendar, "More" categories |
| `Menubar` | — | Not used |
| `Popover` | anchored | `ClubSwitcher` on desktop |
| `PreviewCard` | hover/focus preview | Class name preview in week grid (optional) |
| `Tooltip` | short text | Disabled calendar days, icon-only buttons |
| `Dialog` | modal | Search, booking handoff, lightbox, plan comparison, save-and-exit |
| `AlertDialog` | — | Not used on the marketing site |
| `Drawer` | full-screen overlay (two levels), side right, bottom | Mobile menu, filters, `ClassDetailPanel`, `ClubSwitcher` on mobile |
| `Toast` | default, invalid | Saved, copied, offline |
| `Progress` | segments | `JoinStepper` |
| `Meter` | — | Not used. `RibMeter` is the meter. |
| `Avatar` | image, fallback | Coaches, instructors, signed-in user |
| `Separator` | horizontal, vertical | Dividers |
| `ScrollArea` | viewport, scrollbar | Tables, long lists |
| `Toolbar`, `ContextMenu` | — | Not used |

Graphical has no Card, Badge, Table or Skeleton. Surfaces use the local card class (`bg-surface border border-border rounded-m`) and the shadcn pieces below (`CL §1`, `§4`).

---

## 2. shadcn/ui components to install (style `base-nova`, Lucide icons)

Run once, after the Graphical install, with the Graphical files kept (answer "skip" if asked to overwrite):

```bash
npx shadcn@latest add breadcrumb calendar carousel chart command table textarea pagination \
  skeleton badge card aspect-ratio empty item input-group native-select alert spinner kbd
```

| Install name | Used for | Where |
|---|---|---|
| `breadcrumb` | Trail on every inner page | `SiteBreadcrumbs` |
| `calendar` | Tour day picker (dot on days with slots) | `/tour` step 1 |
| `carousel` | Rails and lightbox (Embla) | `ClassCategoryRail`, `TestimonialRail`, `CoachCard` rails, gallery |
| `chart` | `PopularTimesChart` base (Recharts wrapper) | Club detail |
| `command` | Search results list inside a Graphical `Dialog` | `SearchDialog` |
| `table` | Static tables | `ClubComparisonTable`, court table, `PlanComparisonTable` base |
| `textarea` | Notes and messages | Tour, contact, family medical note |
| `pagination` | Journal index | `/journal` |
| `skeleton` | Loading placeholders with exact size | Live data blocks |
| `badge` | Small labels ("Your club", "Most popular" base) | Cards |
| `card` | Surface container themed with tokens | Cards, summaries |
| `aspect-ratio` | Fixed-ratio photo boxes | All photos |
| `empty` | Base for `EmptyState` | Empty and error views |
| `item` | List rows | Search rows, job rows, contact rows |
| `input-group` | Search field with an icon | FAQ search, ZIP input |
| `native-select` | Month/day selects, mobile pickers | Join DOB |
| `alert` | Inline alerts (info, warning, error) | Banners in flows |
| `spinner` | Button busy state | Submit buttons |
| `kbd` | Shortcut hint "/" in search | Header search tooltip |

**Not installed (Graphical covers it):** `accordion`, `alert-dialog`, `avatar`, `button`, `checkbox`, `collapsible`, `combobox`, `context-menu`, `dialog`, `drawer`, `dropdown-menu` (use `Menu`), `field`, `hover-card` (use `PreviewCard`), `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `slider`, `switch`, `tabs`, `toast`, `toggle`, `toggle-group`, `tooltip` (`CL §2`, rule "prefer Graphical when both exist").
**Evaluated and not installed:**
- `sheet`: Graphical `Drawer` already provides side and bottom sheets (`CL §2` "Partial").
- `form` (react-hook-form wrapper): Graphical `Form` and `Field` own the structure. Use `react-hook-form` and `zod` directly with `Field` for validation (see below).
- `sonner`: not in the shadcn docs index (`CL §2`); use Graphical `Toast`.
- `date-picker`, `sidebar`, `resizable`, `data-table`, `code-block`, `message*`, `bubble`: not needed.
**Blocks:** none for the marketing site. The blocks page has no marketing blocks (`CL §3`). Sections are built from components. `login-03`/`login-04` are not used (sign-in lives in the app).

**npm packages beyond the two libraries**

| Package | Purpose |
|---|---|
| `react-hook-form`, `@hookform/resolvers`, `zod` | Form state and validation (client and server share the zod schemas) |
| `date-fns` (+ `date-fns-tz` set to `America/Phoenix`) | Dates for calendar and schedule. Arizona has no daylight saving. |
| `maplibre-gl` | Map renderer for `ClubMap` (self-styled with brand tokens) |
| `embla-carousel-react` | Pulled in by shadcn `carousel` |
| `recharts` | Pulled in by shadcn `chart` |
| `minisearch` | Client search index |
| `swr` | Live data fetching with revalidation |
| A payment SDK (for example `@stripe/react-stripe-js`) | Hosted payment fields in the join flow |
| `qrcode` (server only) | QR code on the pass confirmation and `/app` |
| `ics` (server only) | Calendar files for tours |

---

## 3. Site-specific composite sections

Each composite is a client or server component in `components/site/`. Props are given as TypeScript. "Composes" lists shared brand components and library parts. Every composite follows the global states in `03-pages.md` §0.5 unless it says more.

### 3.1 `SiteHeader` (with `UtilityBar`)
```ts
type SiteHeaderProps = {
  clubSlug?: string;               // from cookie, resolved on the client
  promo?: Promo | null;            // top-bar promo
  session?: { signedIn: boolean; firstName?: string };
  navigation: NavConfig;           // from CMS or static config
}
```
- **Anatomy:** `PromoBand`(bar) → `UtilityBar` (ClubSwitcher inline, text links, phone, Member login) → main bar (logo, `NavigationMenu`, Search, Join, Book a free tour). Sentinel `div` for the compact state.
- **States:** default; compact (after 8 px scroll); mega open; drawer mode (below 1280); signed in; promo dismissed (`sessionStorage`).
- **Composes:** `PromoBand`, `ClubSwitcher`, Graphical `NavigationMenu`, `Button`, `Menu`, `Avatar`.
- **Spec:** `02-navigation.md` §3.

### 3.2 `MegaMenuClubs` / 3.3 `MegaMenuClasses`
```ts
type MegaMenuClubsProps = { clubs: ClubSummary[]; yourClub?: string; statuses: Record<string, ClubStatus> }
type MegaMenuClassesProps = { categories: CategorySummary[]; popular: ClassTypeSummary[]; next?: SessionSummary }
```
- **Anatomy:** four link columns + feature card in a 12-column grid inside `NavigationMenu.Content`. Column heading uses `eyebrow`.
- **States:** statuses loading (skeleton text), statuses failed (static hours), `yourClub` set (tag), no next class (card shows "See the schedule").
- **Composes:** `ClubCard` (`compact`, `feature`), `ClassCard` (`compact`, `featured`), `CategoryBadge`, `IntensityRibs`, `BusynessMeter`, `CapacityIndicator`, `InstructorChip`.
- **Spec:** `02-navigation.md` §3.5–3.6.

### 3.4 `MobileDrawer`
```ts
type MobileDrawerProps = { open: boolean; onOpenChange(o: boolean): void; session; clubs: ClubSummary[]; categories: CategorySummary[]; popular: ClassTypeSummary[] }
```
- **Anatomy:** full-screen overlay with two levels (`mobbin-standard-pass §2 rules 20 and 21`). Level 1: bar (close top-left, logo centred, search top-right), `ClubSwitcher` (block, holds the ZIP "find a club" field), large primary links (Archivo `l`) beside a smaller secondary-link column, account row, card row, sticky footer with two CTAs and the App Store badge. Level 2: back/title/close bar and a panel for Clubs or Classes. Prop `level: 'root' | 'clubs' | 'classes'`.
- **States:** closed; open level 1; level 2 (clubs or classes); signed in; keyboard open (footer hides); short viewport (card row hides).
- **Composes:** Graphical `Drawer`, `Button`; `ClubSwitcher`, `ClubCard` (`compact`), `ClassCard` (`compact`), `CategoryBadge`.

### 3.5 `BottomActionBar`
```ts
type BottomActionBarProps = {
  primary: { label: string; href: string; event: string };
  secondary?: { label: string; href: string; event: string; kind?: 'link' | 'tel' };
  showAfter?: 'hero-cta-hidden' | 'always';
}
```
- **Anatomy:** two buttons, 44 px high, safe-area padding. **States:** hidden (hero CTA visible), shown, hidden (keyboard open, flows, drawer). Page templates pass props (table in `02-navigation.md` §6.3).
- **Composes:** Graphical `Button`.

### 3.6 `SiteFooter`
```ts
type SiteFooterProps = { clubs: ClubFooter[]; hours: HoursSummary; legalLinks: Link[]; yourClub?: string }
```
- **Anatomy:** brand block, 4 link columns (Clubs list with phone and live status, Classes, Membership, About), hours band, legal row. Mobile: accordions.
- **States:** live status loading/failed (static hours), club closed, holiday hours.
- **Composes:** `HoursTable` (footer variant), Graphical `Accordion`, `Button` (ghost link), `Separator`. Spec: `02-navigation.md` §7.

### 3.7 `SearchDialog`
```ts
type SearchDialogProps = { open: boolean; onOpenChange(o: boolean): void; indexUrl: string; initialQuery?: string }
```
- **Anatomy:** Graphical `Dialog` → shadcn `command` (input + list). Groups: Clubs, Classes, Coaches, Pages and FAQ, Journal.
- **States:** index loading; empty query (popular); results; no results (`EmptyState`); error.
- **Composes:** `ClubCard` (`compact`), `IntensityRibs`, `CategoryBadge`, `EmptyState`. Spec: `02-navigation.md` §9.

### 3.8 `SiteBreadcrumbs`, `SkipLinks`, `MinimalCheckoutHeader`
```ts
type SiteBreadcrumbsProps = { trail: { label: string; href?: string }[] }
type MinimalCheckoutHeaderProps = { flow: 'join' | 'tour' | 'trial'; step?: number; steps?: number; showSaveAndExit?: boolean }
```
- `SiteBreadcrumbs` wraps shadcn `breadcrumb`; mobile shows a back link. Emits JSON-LD.
- `SkipLinks`: three links, visible on focus.
- `MinimalCheckoutHeader`: logo, step indicator slot, help phone, Save and exit.

### 3.9 `HeroSplit`
```ts
type HeroSplitProps = {
  eyebrow?: string; title: string; support: string;
  primary: CTA; secondary?: CTA;   // secondary renders as a ghost text link (mobbin-standard-pass §2 rule 3)
  trust?: string[];                 // up to 3 items with Check icons
  image: { src: string; alt: string; ratio: '4:5' | '4:3' | '16:9' | '3:2'; priority?: boolean };
  align?: 'text-left' | 'text-right';
  variant?: 'home' | 'page' | 'split-content';
}
```
- **Anatomy:** text column (eyebrow, H1, support, buttons, trust row) + photo (radius `xl`, aspect-ratio box with `next/image`).
- **Rules:** H1 ≤ 8 words, support ≤ 20 words (`MM §3 r39`); one primary + one secondary button; no autoplay media (`r40`); text never overlays the photo (`MM H5`).
- **States:** image loading (blurred placeholder in Caliche tone); image error (`surface-muted` box). **Composes:** Graphical `Button`, `AspectRatio`.

### 3.10 `ClubFinderSection`
```ts
type ClubFinderSectionProps =
  | { variant: 'strip'; club?: ClubSummary }                             // Home 1.2
  | { variant: 'grid'; clubs: ClubSummary[]; filters: AmenityKey[] }     // Home 1.3
  | { variant: 'split'; clubs: ClubSummary[]; initial?: { zip?: string; coords?: [number, number] } } // /clubs 2.3
```
- **Anatomy (`split`):** list column (`ClubCard` `list-row`, scroll) + sticky `ClubMap`. Hover/focus on a card sets `activeClub`; pin click scrolls and focuses the card (`MM §3 r7`). Mobile: `Tabs` List | Map; `map-callout` as a bottom card.
- **States:** map loading (static image + CSS pins), map blocked (list only + message), distance known/unknown, filter zero results, geolocation denied.
- **Composes:** `ClubCard` (`feature`, `compact`, `list-row`, `map-callout`), `ClubMap`, `ClubPin`, `AmenityChip`, `BusynessMeter`, Graphical `ToggleGroup`, `Tabs`, `Button`, `Input`, `Field`.
- **Rules:** one filled "Tour this club" button per card (`MM §3 r3`); distance only after ZIP/location (`r5`); map ≥ 58% of width on desktop (`r6`); cluster bubbles (`r8`); six filter chips (`r9`).

### 3.11 `ClassCategoryRail`
```ts
type ClassCategoryRailProps = { categories: CategoryTile[]; variant: 'row' | 'grid'; visible: 6 }  // six tiles + a "More" tile (mobbin-standard-pass §2 rule 9)
```
- **Anatomy:** six `ClassPhotoTile` `category` tiles plus a "More" tile that reveals Recovery and Youth. `row`: seven in one row at `lg`+, scroll-snap rail at `base`. `grid`: the same on `/classes` with a detail list under the row. Youth shows the age chip "AGES 6 MO–17".
- **States:** More collapsed/expanded; reduced motion removes scroll smoothing.

### 3.12 `ClubSwitcher` — page usage and state logic
`ClubSwitcher` is a shared component. This section states the site logic.
```ts
type ClubSwitcherProps = { mode: 'inline' | 'block' | 'field'; placement?: 'utility' | 'mobile-row' | 'drawer' | 'hero' | 'flow' }
type ClubContext = { slug?: string; source: 'member' | 'picked' | 'zip' | 'geo' | 'none'; distancesMi?: Record<string, number> }
```
- **State machine:** `none` → (pick) `picked` → (clear) `none`. `none` → (ZIP) `zip` → (choose) `picked`. `none` → (location) `geo` → (choose) `picked`. Session sign-in sets `member` (overrides all; user can still pick another club for browsing, which sets `picked` for the visit only).
- **Storage:** cookie `cpa_club` (slug), `sessionStorage` `cpa_dist` (distances). Never store ZIP or coordinates in a cookie.
- **Events:** `club_selected`, `club_zip_search`, `club_geo_request`, `club_geo_denied`, `club_cleared` (file 05 §8).
- **A11y:** The panel is a labelled dialog (popover on desktop, drawer on mobile). Radios announce name, address, status, distance. Result count changes use `aria-live="polite"`.
- **Server rendering:** The server renders the neutral state. A tiny inline script reads the cookie before paint and sets a `data-club` attribute on `<html>` so CSS reserves space (no layout shift).
- **Spec:** `02-navigation.md` §5.

### 3.13 `ScheduleTeaser`
```ts
type ScheduleTeaserProps = {
  club?: string | 'all'; category?: CategoryKey; classSlug?: string; coach?: string;
  limit?: 6; showClubSwitcher?: boolean; showSideCard?: boolean;
  variant: 'home' | 'club' | 'class' | 'category' | 'coach';
}
```
- **Anatomy:** header (H2, `ClubSwitcher` inline), `ScheduleDayStrip`, list of `ClassCard` `schedule-row` (max 6, `MM §3 r16`), link "See full schedule", side card.
- **Data:** `useSWR('/v1/sessions?…', { refreshInterval: 30000 })`.
- **States:** loading (6 skeleton rows), empty day (auto-advance), error with club phone, offline.
- **Rules:** spots-left text only at ≤5 (`r15`); labels ≥ 14 px; one "Book" per row; `BookingStateButton` handles the hand-off dialog (`03-pages.md` §6.6).
- **Composes:** `ScheduleDayStrip`, `ClassCard`, `InstructorChip`, `IntensityRibs`, `CapacityIndicator`, `CategoryBadge`, `BookingStateButton`, `EmptyState`, `ClubSwitcher`, shadcn `skeleton`.

### 3.14 `PlanCardsSection`
```ts
type PlanCardsSectionProps = { plans: Plan[]; highlight: 'ridge'; variant: 'full' | 'compact' | 'select' | 'pack'; showFees?: boolean; yourClub?: string }
```
- **Anatomy:** three `PlanCard`s, middle raised (translate −8 px, 2 px `primary` border, badge "Most popular"), fee line, links.
- **Rules:** three tiers (`MM §3 r18`); ≤ 6 features (`r20`); "Best for" line (`r21`); trial note (`MM P7`); no billing-period toggle.
- **States:** `select` variant has selected (2 px `primary` border + check icon) and focus states.
- **Composes:** `PlanCard`, `RibMeter`, Graphical `Button`, `RadioGroup` (select variant).

### 3.15 `AmenityBento`
```ts
type AmenityBentoProps = { items: AmenityTile[]; variant: 'bento' | 'rows' | 'tiles' }
type AmenityTile = { key: string; icon: LucideName | CustomIconName; title: string; text: string; href: string; image: ImageRef; whereCount: string; clubs?: string[] }
```
- **Anatomy:** `bento`: 3 columns, first tile spans 2 rows (desktop). Tile: photo, icon in 48 px circle, two-line heading, one-line text, where chip row. `rows`: alternating split rows. `tiles`: icon tiles without photos.
- **Rules:** 3 columns desktop, 1 mobile (`MM §3 r42`); whole tile is one link.
- **Composes:** `AmenityChip`, `ClassPhotoTile` (for studio photos), Lucide icons.

### 3.16 `TestimonialRail`
```ts
type TestimonialRailProps = { items: Testimonial[]; variant: 'carousel' | 'grid' | 'video' }
```
- **Anatomy:** `carousel`: one quote at a time, arrows, dots (`MM SP2`); `grid`: three cards; `video`: four portrait tiles with play button (`MM SP1`; opens `Dialog` with captions).
- **Rules:** ≥ 3 on Home (`r28`); first name + last initial + goal; ≤ 30 words (`r29`); consent flag required.
- **States:** < 3 items → hide on Home. Autoplay none. Video: poster + captions required.
- **Composes:** shadcn `carousel`, `badge`, Graphical `Dialog`, `Button`. Layout: quote card beside a large 4:5 member photo, arrows at the sides, dot pager under the card (`mobbin-standard-pass §2 rule 15`).

### 3.17 `TourCTABand`
```ts
type TourCTABandProps = { title: string; support: string; clubSlug?: string; secondary?: 'pass-link' | 'pass-email' | 'none'; variant?: 'default' | 'club' | 'kids' | 'coach' | 'compact' }  // 'pass-email' = PromoBand band+form (mobbin-standard-pass §2 rule 14)
```
- **Anatomy:** Saguaro Night band, reversed symbol (Dawn Copper), H2 in Sand, support text, one primary button, the pass link or the email row ("Email" field + "Get a 3-day pass" button + "No credit card required."), phone line.
- **Rules:** one per page, last block above the footer; uses the same labels as the header (`MM §3 r22`).
- **Composes:** `PromoBand` (variant `band`), Graphical `Button` (primary on dark uses the dark `primary` token `#E0804F` with `primary-foreground` `#121A16`; outline uses Sand edge `secondary-foreground`).

### 3.18 `FAQAccordionSection`
```ts
type FAQAccordionSectionProps = { items: FAQ[]; groups?: string[]; variant: 'simple' | 'grouped'; defaultOpen?: 0 | null; showEscape?: boolean; schema?: boolean }
```
- **Anatomy:** heading left, accordion right (`MM F3`); `grouped` adds the group list with counts (`MM F1`).
- **States:** first item open (`MM F2`); search filter with no match; deep-link open.
- **Composes:** Graphical `Accordion`, `Tabs`, `Input`/`InputGroup`.

### 3.19 `TourTimeline`
```ts
type TourTimelineProps = { steps: { title: string; text: string }[]; variant: 'tour' | 'pass' | 'steps'; note?: string }
```
- Vertical list with numbered 32 px circles (or "Today / First visit / Day 3" labels for `pass`, `MM TC4`). Connector line 2 px `border`. Decorative `RibMeter` optional.

### 3.20 `FamilyCalculator`
```ts
type FamilyCalculatorProps = { plans: Plan[]; adultPrice: 39; childPrice: 19; defaultPlan: 'ridge'; variant: 'full' | 'compact' }
```
- **Anatomy:** plan `RadioGroup`, two `NumberField`s, result card with line items and total (`data-l`).
- **Rules:** max 4 adults, 6 children; result `aria-live="polite"`; prices from `Plan` (no hard-coded values).
- **States:** default total; at limits (stepper disabled + help text).

### 3.21 `JoinStepper` and `JoinOrderSummary`
```ts
type JoinStepperProps = { steps: string[]; current: number; flow: 'join' | 'tour' }
type JoinOrderSummaryProps = { order: Order; editable: boolean; collapsed?: boolean }
```
- `JoinStepper`: Graphical `Progress` segments + `ProgressRibs`; `aria-label="Step 2 of 5: Home club"`; completed steps are links.
- `JoinOrderSummary`: lines, today's total, next bill, `Edit` links. Mobile: `Collapsible` + sticky bottom total bar.
- **States:** price changed banner, promo applied, error loading prices.

### 3.22 Page-specific composites
| Composite | Props (short) | Anatomy | Used on |
|---|---|---|---|
| `FamilySplit` | `image`, `title`, `text`, `facts[3]`, `cta` | Photo + text + three `data-l` numbers | Home 1.7 |
| `ClubComparisonTable` | `clubs[]`, `rows[10]` | `table` with sticky first column, Check/Minus cells with words, column header links | `/clubs` 2.4 |
| `ClubFilters` | `value`, `onChange`, `openNow` | `ToggleGroup` of six `AmenityChip`s + `Toggle` + `Select` | `/clubs` 2.2 |
| `ClassHero` | `classType`, `next?: Session` | Hero with overview icon row and side card | Class detail 5.1 |
| `ClassSteps` | `steps[]`, `image` | Numbered list with photo | Class detail 5.2 |
| `IntensityGuide` | `levels[5]`, `onSelect` | Five columns of large `IntensityRibs` with names and examples | `/classes` 4.3 |
| `LevelLadder` | `levels[]` | Vertical stack of level cards + `ProgressRibs` | Kids 11.5 |
| `ProgramCardGrid` | `programs[]` | Four `ClassCard`s with an age chip in capitals (`mobbin-standard-pass §2 rule 17`) | Kids 11.2 |
| `DurationChips` (shared sub-part) | `options: [60, 90]`, `value` | Segmented chips, selected filled (`mobbin-standard-pass §2 rule 60`) | Courts 13.5 |
| `SuccessSummary` | `title`, `summary`, `primary`, `shareLink`, `rows[]` | Green check + one headline + summary card + filled action + text link + "Done" (`mobbin-standard-pass §2 rules 44–46, 62`) | Join, pass and tour confirmations |
| `PoolCard` | `club`, `facts` | `ClubCard` `compact` + fact list | Aquatics 12.2 |
| `CourtTable` | `rows[]` | `table` → stacked cards | Courts 13.2 |
| `ContactForm` | `defaults`, `onSubmit` | `Form` with honeypot, counter, success panel | Contact 18.3 |
| `JournalCard` | `post`, `variant: feature | card | row` | Image, category chip, title, dek, author, read time | Journal |
| `JobRow` | `job` | `item` row: title, club, type, pay, Apply | Careers |
| `LegalLayout` | `toc[]`, `meta`, `children` | TOC + body (680 px) + print styles | Legal |
| `StatTile` | `value`, `label`, `icon?` | `data-l` number + label | Club facts, About |
| `PromoBand` use | See shared | `bar` (top), `band` (TourCTABand), `inline` (Journal) | All |

### 3.23 Composition matrix (composite × shared component)
`●` = composes. Shared components not listed here (`RibMeter` aside) are used only inside the listed rows.

| Composite | ClubCard | ClassCard | CoachCard | PlanCard | CategoryBadge | IntensityRibs | BusynessMeter | CapacityIndicator | AmenityChip | InstructorChip | ScheduleDayStrip | BookingStateButton | HoursTable | PopularTimesChart | ClubMap | ClubSwitcher | CheckInPass | EmptyState | PromoBand | RibMeter | ClassPhotoTile |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SiteHeader | ● | ● | | | ● | ● | ● | ● | | ● | | | | | | ● | | | ● | | |
| SiteFooter | | | | | | | | | | | | | ● | | | | | | | | |
| ClubFinderSection | ● | | | | | | ● | | ● | | | | | | ● | ● | | ● | | | |
| ClassCategoryRail | | | | | ● | ● | | | | | | | | | | | | | | | ● |
| ScheduleTeaser | | ● | | | ● | ● | | ● | | ● | ● | ● | | | | ● | | ● | | | |
| PlanCardsSection | | | | ● | | | | | | | | | | | | | | | | ● | |
| AmenityBento | | | | | | | | | ● | | | | ● | | | | | | | | ● |
| TestimonialRail | | | | | | | | | | | | | | | | | | | | | |
| TourCTABand | | | | | | | | | | | | | | | | | | | ● | ● | |
| TourTimeline | | | | | | | | | | | | | | | | | | | | ● | |
| HeroSplit | | | | | | | | | ● | | | | | | | | | | | | |
| Join flow | ● | | | ● | | | | | ● | | | | | | ● | ● | ● | | | ● | |
| Tour flow | ● | | | | | | | | | | | | | | ● | ● | | ● | | ● | |

---

## 4. Motion spec

Source: Graphical motion "Snappy" (`TH motion`, `README`): small 150 ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, large 300 ms `cubic-bezier(0.16, 1, 0.3, 1)`, press scale 0.98, popup scale 0.96. No bounce, no spring, no parallax, no count-up numbers, no marquee.

### 4.1 Motion tokens
| Token | CSS variable | Value | Tailwind |
|---|---|---|---|
| Small duration | `--cp-motion-duration` | 150 ms | `duration-150` |
| Small easing | `--cp-motion-easing` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | `ease-[var(--cp-motion-easing)]` |
| Large duration | `--cp-motion-duration-large` | 300 ms | `duration-300` |
| Large easing | `--cp-motion-easing-large` | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-[var(--cp-motion-easing-large)]` |
| Press scale | — | 0.98 | `active:scale-[0.98]` |
| Popup scale | — | 0.96 → 1 | `data-[starting-style]:scale-[0.96]` |

### 4.2 Where each duration is used
| Interaction | Duration / easing | Properties | Notes |
|---|---|---|---|
| Button, link, chip hover/focus | 150 ms small | background, border-color, color | No movement |
| Button press | 150 ms small | transform scale 0.98 | |
| Card hover | 150 ms small | border-color only | No lift (`BG §9`: flat) |
| Header compact state | 150 ms small | height, border-color | Triggered by sentinel |
| Mega menu open/close | 150 ms small | opacity, translateY(−4px→0) | 100 ms open delay, 150 ms close delay |
| Menu, popover, tooltip | 150 ms small | opacity, scale 0.96→1 | |
| Accordion, collapsible | 150 ms small | height, opacity | |
| Dialog open | 300 ms large | opacity, scale 0.96→1 | Scrim opacity 150 ms |
| Drawer and bottom sheet | 300 ms large | translateX/Y | Scrim 150 ms |
| Bottom action bar show/hide | 300 ms large | translateY | |
| Carousel slide | 300 ms large | transform | Snap, no overshoot |
| Toast in/out | 150 ms in, 150 ms out | opacity, translateY(8px) | |
| Tab underline / segment | 150 ms small | transform/width | |
| Rib meters fill (`RibMeter`, `IntensityRibs`) | 150 ms each, 40 ms stagger, left to right | opacity/scale-y 0.6→1 | On first view only; once |
| Step change in flows | 150 ms small | content crossfade (opacity) | Focus moves to the step heading |
| Skeleton pulse | 1.2 s | opacity 0.6↔1 | Linear loop |
| Smooth scroll to anchor | 300 ms (browser `scroll-behavior`) | scroll | Off under reduced motion |

Only `transform` and `opacity` animate (plus `height` for accordions via the Base UI height variable). No layout-thrash properties.

### 4.3 Reduced motion
When `prefers-reduced-motion: reduce`:
1. All durations become 0.01 ms (`transition-duration`, `animation-duration`), except opacity changes up to 150 ms are allowed for fade-in of popups.
2. Mega menu, popover, tooltip, dialog: opacity only (no scale, no translate).
3. Drawer and sheet: appear at once (no slide).
4. Carousels: no animated slide, no `scroll-behavior: smooth`; arrows jump.
5. Rib meters render filled at once. Skeleton pulse is static.
6. Anchor jumps are instant.
7. No autoplay anywhere (carousels, video). Motion that starts on its own and lasts over 5 seconds is not used (WCAG 2.2.2).
Implementation: a single `@media (prefers-reduced-motion: reduce)` block in `globals.css` plus a `useReducedMotion()` hook for JS-driven carousels and maps (`MapLibre`: `flyTo` becomes `jumpTo`).

---

## 5. Imagery and photo spec

### 5.1 Global art direction (from `BG §7`)
1. **Real members, real light.** East Valley morning sun, long shadows, warm white balance 5200–5600 K. Indoors near windows or under warm practical lights.
2. **Effort, not punishment.** Focus, a steady breath, a spotter's hand, a coach's cue. No grimaces. No shirtless "transformation" shots.
3. **Range of bodies and ages.** Every page's photo set shows more than one age band. Teens in youth programs; members in their 60s in the pool and in recovery.
4. **Place.** The desert appears in small doses: a palo verde outside a window, the Superstition skyline from a deck at dawn, caliche tones in materials. No saguaro clip art, no sunset gradients.
5. **Treatment.** Natural colour, slightly warm, lifted blacks ≤ 3%. No duotone, no neon, no filters that change skin tone. Copper appears as a solid bar or crop frame, never a tint over faces (e.g. the category bar on `ClassPhotoTile`).
6. **Logo on photos.** Only the one-colour white or reversed version, on a calm dark area, with full clear space. The site avoids logos on photos; OG images are the one exception.
7. **Text on photos.** Not allowed for headlines (`MM H5`, `MM §4`). Captions sit below photos.
8. **Consent.** Every identifiable person has a signed release. Minors need a parent release. The `Testimonial` and `Coach` records link to the release ID.
9. **Honesty.** Photos show the actual club named in the caption (`MM §3 r1`, `r45`). No stock gym photos.
10. **Photographer brief:** shoot each club in the three light windows: 5:30–7:30 a.m., midday, 4:30–6:30 p.m. Capture 20% extra vertical frames for mobile crops.

### 5.2 Formats and delivery
| Item | Rule |
|---|---|
| Format | AVIF first, WebP fallback, JPEG last (`next/image` default `formats: ['image/avif','image/webp']`) |
| Width steps | 480, 768, 1080, 1280, 1600 (`deviceSizes` / `imageSizes` in `next.config.js`) |
| Quality | 70 for AVIF/WebP, 78 JPEG |
| Placeholder | `placeholder="blur"` with a 16 px blurDataURL generated at upload. Colour range stays in Caliche/Sand tones. |
| LCP image | Home hero, club hero, class hero: `priority`, `fetchPriority="high"`, no `loading="lazy"`; preload via `<link rel="preload" as="image">` in `generateMetadata`. |
| Lazy images | Everything below the first viewport: `loading="lazy"`, `decoding="async"` |
| Dimensions | Always set width/height or `aspect-ratio` (CLS ≤ 0.1) |
| Focal point | CMS field `focalPoint {x,y}`; `object-position` set from it per crop |
| Alt text | Required in CMS, ≤ 125 chars, describes what a visitor needs ("Two members stretch on the Red Mountain cardio deck at sunrise"). Decorative = empty `alt`. |
| Dark mode | Photos are not inverted or dimmed. Overlays are not added. |
| Max file weight (AVIF) | Hero ≤ 150 KB at 1280 w; card ≤ 60 KB at 480 w; avatar ≤ 12 KB |

### 5.3 `sizes` attributes
| Context | `sizes` |
|---|---|
| Hero (split, 6 of 12) | `(min-width:1280px) 580px, (min-width:1024px) 48vw, 100vw` |
| Club card (4:3) | `(min-width:1280px) 280px, (min-width:768px) 40vw, 92vw` |
| Feature club card | `(min-width:1280px) 590px, (min-width:768px) 66vw, 92vw` |
| Category tile (4:5) | `(min-width:1280px) 285px, (min-width:768px) 33vw, 80vw` |
| Coach card (4:5) | `(min-width:1280px) 285px, (min-width:768px) 33vw, 46vw` |
| Full-width gallery | `(min-width:1280px) 1200px, 100vw` |
| Avatar | fixed 40, 64 or 96 px |

### 5.4 Shot list (IDs used in `03-pages.md`)
Quantity × ratio. "Subject / direction" is the brief for the photographer.

| ID | Page / section | Qty | Ratio | Subject and direction |
|---|---|---|---|---|
| `IMG-HOME-HERO` | Home 1.1 | 1 | 4:5 (crop 4:3 mobile) | Two members at sunrise on the Mesa – Red Mountain cardio deck, Superstition skyline soft, one member in their 60s. Warm light. Leave sky clear of busy detail. |
| `IMG-CLUB-{slug}-CARD` | Home 1.3, Clubs 2.3, mega menu, footer | 5 | 4:3 | One signature scene per club: Dobson, family at the pool edge; Red Mountain, outdoor pool under shade sails; Downtown, strength floor at 7 a.m. with window light; Val Vista, splash pad and parent; Heritage, rooftop mobility deck at golden hour. |
| `IMG-CLUB-{slug}-HERO` | Club detail 3.1 | 5 | 16:9 (crop 4:3 mobile) | Wider version of the signature scene, people in action, 25% empty space left or right for crops. |
| `IMG-CLUB-{slug}-G1…G12` | Club detail 3.3 | 12 each | 3:2 | Range: studios, cycle studio, strength floor, pool, courts, kids club check-in, recovery, café, lobby, parking sign, exterior at dawn, a member smiling at the desk. |
| `IMG-CLUB-{slug}-AMEN-{pool\|courts\|kids\|recovery\|studios}` | Club detail 3.6 | up to 5 each | 3:2 | The specific room at that club. Only for amenities the club has. |
| `IMG-AMEN-{POOL\|COURTS\|RECOVERY\|KIDS\|STUDIO\|STRENGTH}` | Home 1.4 | 6 | 3:2 (Pools 3:4) | One generic hero per amenity from any club. |
| `IMG-CAT-{category}` | Home 1.5, Classes 4.2 | 8 | 4:5 | One class in progress per category; faces visible. The shared tile adds the `CategoryBadge` and a solid caption band; keep the bottom 25% of the frame calm. |
| `IMG-CAT-{category}-HERO` | Category landing | 8 | 4:3 | Wider class scene. |
| `IMG-CLASS-{slug}` | Classes 4.4, panels | 28 | 4:3 | One real photo per class type. |
| `IMG-CLASS-{slug}-HERO` | Class detail 5.1 | 28 | 4:3 | Second angle, coach cue visible. |
| `IMG-CLASS-{slug}-02` | Class detail 5.2 | 28 | 3:2 | Warm-up or cool-down moment. |
| `IMG-COACH-{slug}` | Coaches, cards, profile | 24 | 4:5 + 1:1 headshot crop | Portrait, natural light, club context behind, eye contact. Frame so a centred square crop (160 px, `headshot` variant) keeps the face and shoulders. |
| `IMG-TESTI-{n}` | Testimonials | 8 | 1:1 (96 px circle) | Member headshot, relaxed. |
| `IMG-TEASER-FIRSTTIME` | Home 1.6 side card | 1 | 4:3 | A first-time member being welcomed. |
| `IMG-HOME-FAMILY` | Home 1.7 | 1 | 3:2 (4:3 mobile) | Parent at the kids club door with a child. |
| `IMG-KIDS-HERO`, `IMG-KIDS-{group}`, `IMG-KIDS-TEEN` | Kids | 6 | 4:3 / 4:5 | Staff at child height; swim school; junior pickleball; teens coached. |
| `IMG-AQUA-HERO`, `IMG-AQUA-{slug}`, `IMG-AQUA-WARM` | Aquatics | 5 | 16:9 / 4:3 / 3:2 | Lap swimmers in morning light; warm-water pool with an older member and a coach. |
| `IMG-COURTS-HERO` | Courts | 1 | 16:9 | Pickleball doubles, morning, players laughing. |
| `IMG-REC-HERO` | Recovery | 1 | 16:9 | Sauna door open, soft light, one member resting. |
| `IMG-PT-HERO` | Personal training | 1 | 4:5 | Coach and member at a rack, hand on bar. |
| `IMG-TRIAL-HERO` | Trial | 1 | 4:3 | Coach welcoming a first-time member at the desk. |
| `IMG-ABOUT-HERO` | About | 1 | 16:9 | Members passing in a hallway at Mesa – Dobson. |
| `IMG-CAREERS-HERO` | Careers | 1 | 3:2 | Staff huddle before opening. |
| `IMG-PROMO-HERO` | Promo | 1 | 4:3 | Fall light on a studio floor, a member rolling a mat. |
| `IMG-JRN-{slug}-HERO` | Journal | per post | 16:9 | Real club moment that fits the story. |
| `IMG-APP-{n}` | App page | 3 | 9:19.5 (device frame optional) | Real screens from the iOS app. |
| OG image | All | per template | 1200×630 | Photo or tile, title in Archivo 800, reversed logo on a calm dark area. |

Total launch set: about 330 images. Phase the shoot: launch-critical (Home, 5 club cards and heroes, 8 category tiles, 12 top classes, 8 coaches, kids/aqua/courts/recovery heroes) = about 90 images.

### 5.5 Icons
- Lucide, outline, 2 px stroke, round caps, 24 px grid (`TH icon`, `BG §6`). Icons are `text` or `text-muted` by default; copper only for the active state.
- **Custom icons to draw** (follow the mark: upright strokes, 60° and 90° angles, 2 px stroke): `strength-ribs` (bar with two plates edge-on, drawn as ribs), `court` (lines and net), `youth` (smile-rib), `swim-lane`, `recovery-suite`, `kids-club`, `cycle` (if Lucide `bike` is too generic). Delivered as SVG components in `components/icons/`.
- Category icon map (`FD §3`): Strength `strength-ribs`; Cycle `bike`; Conditioning `activity`/`timer`; Mind & Body `flower` (lotus alt); Aqua `waves`; Court `court`; Recovery `heart-pulse` and `snowflake` (suite); Youth `smile`/custom.
- Do not use flexed arms, lightning bolts, flames or skull imagery (`BG §6`).

### 5.6 Category colour tokens
The shared components file owns these values (`../01-shared-brand-components.md` §2.2–2.4). It adjusted three foundation colours after a contrast check. The site uses the shared tokens and adds none.

| Category | Light fill | Light text token | Dark fill and text |
|---|---|---|---|
| Strength | `#B5532C` | `#9E4522` (Copper Deep) | `#E0804F` |
| Cycle | `#2F5A45` | `#2F5A45` | `#6FB08F` |
| Conditioning | `#8A5300` | `#8A5300` | `#F2B14C` |
| Mind & Body | `#52684A` (was `#5E7352`) | `#52684A` | `#A9C29A` |
| Aqua | `#1F6E7A` | `#1F6E7A` | `#6FC3CF` |
| Court | `#7F6019` (was `#8C6A1F`) | `#7F6019` | `#E0C27A` |
| Recovery | `#5F4E86` | `#5F4E86` | `#B6A6E0` |
| Youth | `#9C3D6B` | `#9C3D6B` | `#E59BC0` |

CSS variables: `--cp-cat-<id>`, `--cp-cat-<id>-text`, `--cp-cat-<id>-tint` (tint = 10% in light, 14% in dark, over the host surface).
Site rules:
1. Category colour appears as a 4 px stripe, an icon, an icon-tile tint or a `CategoryBadge`. The icon and the category name are always present.
2. Category-coloured **text** sits only on `surface`, `background` or a tint over them. Inside `surface-muted` bands, class and category items sit on white `surface` cards. Outside those hosts, the name uses `text` (Ink).
3. Strength shows copper only as a stripe, a 16 px icon and a 10% tint. A filled copper shape with a label is always a button (shared §2.4). Solid Strength badges appear only on photos.
4. Conditioning (Monsoon Amber) never marks a status; status uses the warning triangle and a sentence (shared §2.4).
