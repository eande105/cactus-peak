# Marketing site 03 — Page templates

Tags (`MM §3 r6`, `MG r28`, `FD §4`, `BG §7`) are explained in `01-strategy-and-ia.md` §0. Navigation, header, footer and breadcrumbs are in `02-navigation.md`. Component props, motion and photo specs are in `04-components.md`. Copy rules and accessibility are in `05-content-and-accessibility.md`.
Shared brand components keep the exact names from `../01-shared-brand-components.md`. This file states only page-specific variants and usage.
Names of people, quotes, phone numbers and the items listed in `01-strategy-and-ia.md` §9 are **proposed** content. Replace them before launch.

## Contents
§0 Global conventions · §1 Home · §2 Clubs index · §3 Club detail (Gilbert – Val Vista) · §4 Classes index and category landing · §5 Class type detail (Climb Cycle) · §6 Schedule · §7 Membership · §8 Join flow · §9 Free trial pass · §10 Book a tour · §11 Kids & family · §12 Aquatics · §13 Courts · §14 Recovery · §15 Personal training, Coaches, Coach profile · §16 About · §17 FAQ · §18 Contact · §19 Journal · §20 Promo landing · §21 Careers · §22 App · §23 Search · §24 Error pages · §25 Legal

---

## 0. Global conventions

### 0.1 Page shell
Every page is built in this order: skip links → promo bar → utility bar → sticky header → breadcrumbs → `main#main` (sections) → `TourCTABand` (unless the page says otherwise) → `SiteFooter` → mobile `BottomActionBar`. Details: `02-navigation.md`.

### 0.2 Grid and breakpoints

| Breakpoint | Width | Columns | Gutter | Side margin | Notes |
|---|---|---|---|---|---|
| `base` | 0–639 | 4 | 16 | 16 | Single column stack |
| `sm` | 640–767 | 4 | 16 | 24 | |
| `md` | 768–1023 | 8 | 16 | 24 | Two-column layouts begin |
| `lg` | 1024–1279 | 12 | 24 | 32 | Full 12-column layouts |
| `xl` | 1280–1535 | 12 | 24 | auto | Content max 1200 px, centred. Desktop nav begins. |
| `2xl` | 1536+ | 12 | 24 | auto | Content stays 1200 px. Full-bleed backgrounds continue. |

In this file "span 7 / 5" means 7 of 12 columns on `lg`+, then 4 / 4 of 8 on `md`, then full width on `base`/`sm`, unless the section says otherwise.
Tailwind: container `mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8`; grid `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 lg:gap-6`.

### 0.3 Surfaces and rhythm
- Page background: `background` (Sand `#F6F1E8`). Cards: `surface` (white) with a 1 px `border` (Caliche) and radius `m` (14 px). Muted bands: `surface-muted` (`#EFE7DA`). One brand-weight band per page at most: `secondary` (Saguaro Night), used by `TourCTABand` and the footer. Copper (`primary`) appears only on actions and the active state.
- No gradients, no glow, no tinted shadow (`BG §9`). Flat surfaces carry structure through borders. `shadow.m` is allowed only on popovers and mega panels (`TH shadow`).
- Section vertical padding: 48 px at `base`–`md` (`space.xxl`), 96 px at `lg`+ (2 × `space.xxl`). Space between a section heading block and content: 32 px (`space.xl`). Card gap: 16 px at `base`, 24 px at `lg`+.
- Section background alternates `background` → `surface-muted` → `background`. Never two `surface-muted` bands in a row.

### 0.4 Type roles for sections
| Role | Token | Notes |
|---|---|---|
| Page title (H1) on Home | `xxl` Archivo 800 48/52, −3% | At `base`–`md`: `xl` 36/40 |
| Page title (H1) elsewhere | `xl` Archivo 800 36/40 | At `base`: `l` 24/30 |
| Section title (H2) | `xl` at `lg`+; `l` at `base`–`md` | Sentence case (`BG §5`) |
| Card title (H3) | `l` Archivo 600 24/30 for feature cards; `s` Inter 600 for compact cards | |
| Eyebrow | `eyebrow` Archivo 600 uppercase 12/16, +0.24em | Above H2; text colour `link` on Sand |
| Lede and body | `m` Inter 400 16/24 | No 18 px size exists in the scale; do not add one |
| Labels, meta, UI | `s` Inter 14/20 | Minimum 14 px for day labels (`MM §4`) |
| Prices, times, counts | `data` Archivo 500 16/24 (tabular); big numbers `data-l` 700 36/40 | |
Maximum line length for prose: 68 characters (about 640 px).

### 0.5 Default states (used unless a section says otherwise)
| State | Rule |
|---|---|
| Loading (server content) | Content is server-rendered. No loading state. |
| Loading (live data) | Skeleton with the exact final size (no layout shift): grey bars in `surface-muted`; 1.2 s opacity pulse 0.6 → 1; reduced motion: static. Spinners appear only inside buttons. |
| Empty | `EmptyState` with a plain sentence, one cause, and one or two actions (`05` §3). |
| Error (live data) | Inline message with `AlertCircle`, what happened, what to do, and a "Try again" ghost button. Static fallback content stays visible. |
| Offline | Toast: "You're offline. Some times may be out of date." Static content stays. |
| Hover (cards) | Border goes from `border` to `border-strong`. No lift, no zoom. 150 ms. |
| Press | Scale 0.98 (`TH motion.press-scale`), 150 ms. |
| Focus | 2 px Monsoon Sky ring (`focus`), 2 px offset, on every focusable part. |
| Disabled | Sand/Stone treatment from the theme; the reason is written next to the control. |

### 0.6 Responsive defaults
1. Two-column sections stack at `base`/`sm`; the image goes first when it carries the story, the text first when the text carries the action.
2. Horizontal rails scroll with `scroll-snap`; cards show 1.2 per view at `base`, 2.2 at `sm`, 3 at `md`, 4 at `lg`+.
3. Tables become stacked key-value cards or scroll with a sticky first column (stated per table).
4. Targets are 44 px or more. Gaps between targets are 8 px or more.
5. Hover-only information is also reachable by focus and by tap.

### 0.7 Live data rules
- Busyness: `BusynessMeter` always pairs the five-rib meter with a text label (Quiet, Light, Steady, Busy, Packed). Updated every 5 min (`FD §2`).
- Spots left text appears only when five or fewer remain (`MM §3 r15`). Otherwise `CapacityIndicator` shows no number on public pages.
- Status line: "Open · until 10 p.m." / "Closed · opens 4:30 a.m." with icon and words (`MM §3 r4`).
- Time zone: all times are Arizona time (no daylight saving). A small line says so where times are shown (`MG` web rule 23).

### 0.8 Section anatomy used in this file
Each section lists: **Grid**, **Copy**, **Imagery**, **Components**, **Interaction**, **States**, **Responsive**, then an ASCII wireframe. Imagery IDs (for example `IMG-HOME-HERO`) point to the shot list in `04-components.md` §5.

### 0.9 Exceptions to "one filled button per section"
`ClubCard` carries its own filled "Tour this club" button (`MM §3 r3`). `PlanCard` carries one button each; only the highlighted plan is filled (`MM P1`). All other sections have one filled copper button at most.

---

## 1. Home `/`

**Purpose:** Show the whole club in one scroll and move the visitor to a tour or pass.
**Primary question:** "Is there a club near me, what does it have, and can I try it?"
**Conversion:** `tour_booked` (primary), `trial_pass_issued` (secondary), `join_started`.
**Section order:** 1.1 Hero · 1.2 Your club strip · 1.3 Club finder · 1.4 Amenities · 1.5 Class categories · 1.6 Schedule teaser · 1.7 Families · 1.8 Plans · 1.9 Coaches · 1.10 Testimonials · 1.11 Your first visit · 1.12 FAQ · 1.13 Tour band.

### 1.1 Hero (`HeroSplit`)
- **Grid:** `lg`+: text span 6, photo span 6. `md`: text above photo, both full 8 columns. Hero section padding 48 px top, 48 px bottom (`lg`: 96 px bottom). Minimum height at `lg`+: 560 px.
- **Copy:**
  - Eyebrow: "Mesa and Gilbert, Arizona"
  - H1 (5 words, `MM §3 r39`): "Climb at your own pace."
  - Support (17 words, `MM §3 r39`): "Five clubs with pools, courts, classes and recovery. Come see one. It's free."
  - Primary button: "Book a free tour" → `/tour` (club prefilled if set)
  - Secondary action (ghost text link with `ArrowRight`, not a second button of equal weight, `mobbin-standard-pass §2 rule 3`): "Try a free 3-day pass" → `/trial`
  - Trust row (`MM H2`, `MM §3 r41`), three items with `Check` icons: "5 clubs. Open 4:30 a.m. on weekdays." · "Month to month. Cancel with 30 days' notice." · "No card for tours or passes."
- **Imagery:** `IMG-HOME-HERO` 4:5 (mobile 4:3), radius `xl` 28 px. Two members at sunrise on the Mesa – Red Mountain cardio deck, Superstition skyline soft behind. One member is in their 60s. Warm light, no overlay text (`MM H5`, `MM §4` busy photo). The H1 sits beside the photo on Sand, not over it. Logo does not appear on the photo.
- **Components:** Graphical `Button` (primary, ghost link); Lucide `Check`; `HeroSplit`; `next/image` with `priority`.
- **Research:** split hero with text left and photo right (`mobbin-standard-pass §2 rule 2`); H1 stays within three lines at every width and the section has one visible button in the main CTA colour (`mobbin-standard-pass §2 rules 1 and 3`).
- **Interaction:** Buttons only. Photo is static. No autoplay video (`MM §3 r40`).
- **States:** Static. If the visitor has a club cookie, the primary button link carries `?club=slug`; the label does not change.
- **Responsive:** `base`: H1 `xl`, photo under text, primary button full width (44 px) with the ghost link under it, trust row stacks.

```
lg+ (12 col)
+------------------------------------------------------------------------------------------+
| MESA AND GILBERT, ARIZONA                                +-----------------------------+ |
| Climb at your                                            |                             | |
| own pace.                    (H1 xxl)                    |      IMG-HOME-HERO          | |
| Five clubs with pools, courts, classes                   |      4:5, radius 28         | |
| and recovery. Come see one. It's free.                   |                             | |
|                                                          |                             | |
| [ Book a free tour ]   Try a free 3-day pass ->         |                             | |
|                                                          |                             | |
| (v) 5 clubs, open 4:30 a.m.  (v) Month to month          |                             | |
| (v) No card for tours or passes                          +-----------------------------+ |
+------------------------------------------------------------------------------------------+
base:  eyebrow / H1 / support / [Book a free tour] / Try a free 3-day pass -> / trust x3 / photo 4:3
```

### 1.2 Your club strip (`ClubFinderSection` variant `strip`)
- **Grid:** Full-width card, span 12, `surface`, radius `m`, padding 24 px. Overlaps the hero bottom edge by 32 px at `lg`+ (negative margin) so it reads as a bridge. Reserve height 96 px to avoid layout shift.
- **Copy (club known):** Label "Your club" · name "Gilbert – Val Vista" · status "Open · until 10 p.m." · `BusynessMeter` "Steady" · next class "Next: Climb Cycle, 6:00 a.m., 4 bikes left" · button "Tour this club" · link "Change".
- **Copy (club not set):** "Find your club." Field label "ZIP code", button "Find", ghost button "Use my location". Helper: "Your browser asks first. We do not store your location."
- **Imagery:** 56×42 px club thumb (4:3) on the left (club known).
- **Components:** `ClubSwitcher` (inline), `ClubCard` variant `compact`, `BusynessMeter`, `ClassCard` variant `compact`, Graphical `Field`, `Input`, `Button`.
- **Interaction:** "Find" sets the cookie and replaces the strip with the club-known state (150 ms crossfade). "Change" opens the `ClubSwitcher` panel (`02-navigation.md` §5).
- **States:** Loading: skeleton for status and next class (club name shows at once from the cookie). Error: omit the next-class line; keep the rest. Not set (server render): shows the ZIP form so there is no layout shift after hydration.
- **Responsive:** `base`: stacks; thumb 48 px; button full width; no negative overlap.

```
+------------------------------------------------------------------------------------------+
| [pic] YOUR CLUB   Gilbert - Val Vista   * Open until 10 p.m.   |||..  Steady              |
|       Next: Climb Cycle, 6:00 a.m. - 4 bikes left         [ Tour this club ]   Change    |
+------------------------------------------------------------------------------------------+
not set:   Find your club.   ZIP code [ _____ ] [Find]   (o) Use my location
```

### 1.3 Club finder (`ClubFinderSection`)
- **Grid:** Eyebrow + H2 + lede span 12. Below: `lg`+ flagship `ClubCard` `feature` span 6 (two rows tall), four `ClubCard` `compact`-body cards in a 2×2 grid, each span 3 (`MM L6` headquarters called out). `md`: flagship span 8, four cards 2×2 spans 4. `base`: one column.
- **Copy:**
  - Eyebrow: "Five clubs"
  - H2: "Find the club that fits your week."
  - Lede: "Pick a club by what it has. Every club shares one membership."
  - Filter chips (6, `MM §3 r9`): "Pool" · "Courts" · "Cycling" · "Kids club" · "Recovery" · "Group classes"
  - Card line example (Mesa – Downtown): personality line "In and out before your 8 a.m." · address "Main St & Center St, Mesa" · chips "Strength floor" "Cycle studio" "Recovery lounge" · status with today's hours "Open · until 10 p.m. (4:30 a.m.–10 p.m. today)" · button "Tour this club" (shared `ClubCard` finder cards show address and today's hours, `mobbin-standard-pass §2 rule 4`)
  - Link below grid: "See all clubs and the map" → `/clubs`
- **Imagery:** `IMG-CLUB-{slug}-CARD` 4:3 real photo per club (`MM §3 r1`, `r45`).
- **Components:** `ClubCard` (`feature` for Dobson, `compact` for the rest; three `AmenityChip`s each), Graphical `ToggleGroup` (multiple) of `AmenityChip`s, Graphical `Button`.
- **Interaction:** Toggling a chip dims clubs that lack the amenity (opacity 0.5, `aria-disabled` description "No pool at this club"), it does not remove them. Hovering or focusing a card highlights nothing else (no map on Home). Chips: `aria-pressed`.
- **States:** All chips off = all clubs full colour. All clubs dimmed (cannot happen with the six chips, since Group classes is in all clubs). Live status loads after paint.
- **Responsive:** `base`: cards 1 per row, feature card photo 4:3.

```
+------------------------------------------------------------------------------------------+
| FIVE CLUBS                                                                               |
| Find the club that fits your week.                                                       |
| [Pool] [Courts] [Cycling] [Kids club] [Recovery] [Group classes]                         |
| +---------------------------------+  +----------------------+ +----------------------+   |
| | [IMG 4:3 Mesa - Dobson]         |  | [IMG] Mesa - Red Mtn | | [IMG] Mesa-Downtown  |   |
| | FLAGSHIP . 68,000 sq ft         |  | chips  status        | | chips  status        |   |
| | "The big one. Bring the whole   |  | [Tour this club]     | | [Tour this club]     |   |
| |  family."                       |  +----------------------+ +----------------------+   |
| | chips: Pool Courts Kids Recov.  |  | [IMG] Gilbert-Val V. | | [IMG] Gilbert-Herit. |   |
| | * Open  |||.. Steady            |  | chips  status        | | chips  status        |   |
| | [ Tour this club ]              |  | [Tour this club]     | | [Tour this club]     |   |
| +---------------------------------+  +----------------------+ +----------------------+   |
|                                       See all clubs and the map ->                       |
+------------------------------------------------------------------------------------------+
```

### 1.4 Amenities (`AmenityBento`)
- **Grid:** `lg`+: three columns (span 4 each), two rows; the first tile (Pools) spans two rows (`MM §3 r42`). `md`: two columns. `base`: one column. Tile = photo on top (3:2), body below.
- **Copy:**
  - Eyebrow: "What's inside"
  - H2: "More than a gym floor."
  - Tiles (icon in a 48 px circle `surface-muted`, two-line heading, one line text, "where" chip row):
    1. Pools — "Lap lanes, warm water and a splash pad." — "At 3 clubs" → `/aquatics`
    2. Courts — "Pickleball, tennis and hoops." — "At 3 clubs" → `/courts`
    3. Recovery — "Sauna, cold plunge and compression." — "At 4 clubs" → `/recovery`
    4. Kids club — "Trusted care while you train." — "At 3 clubs" → `/kids`
    5. Studios — "Yoga, HIIT, strength and cycling." — "At all 5 clubs" → `/classes`
    6. Strength floor — "Racks, platforms and a spotter's hand." — "At all 5 clubs" → `/classes/category/strength`
  - Counts follow `FD §2`: pools at Dobson, Red Mountain, Val Vista; courts at Dobson, Red Mountain, Val Vista; kids club at the same three; recovery at Dobson (suite), Val Vista (suite), Downtown and Heritage (lounge).
- **Imagery:** `IMG-AMEN-POOL`, `-COURTS`, `-RECOVERY`, `-KIDS`, `-STUDIO`, `-STRENGTH`. Real rooms, real people, natural light (`BG §7`).
- **Components:** `AmenityBento` composite; shared `AmenityChip` (club names as read-only chips); Graphical `Button` `variant="ghost"` text link with `ArrowRight`.
- **Interaction:** Entire tile is a link with one accessible name ("Pools, at 3 clubs"). Hover: border `border-strong`.
- **States:** Static.
- **Responsive:** As grid above. Tile photos keep 3:2.

```
+--------------------------+ +--------------------------+ +--------------------------+
| [IMG tall 3:4  Pools]    | | [IMG 3:2 Courts]         | | [IMG 3:2 Recovery]       |
|  (o~) Pools              | |  (c) Courts              | |  (*) Recovery            |
|  Lap lanes, warm water   | |  Pickleball, tennis,     | |  Sauna, cold plunge,     |
|  and a splash pad.       | |  hoops.                  | |  compression.            |
|  At 3 clubs ->           | |  At 3 clubs ->           | |  At 4 clubs ->           |
|                          | +--------------------------+ +--------------------------+
|                          | | [IMG Kids club]          | | [IMG Studios]            |
|                          | | ...                      | | ...                      |
+--------------------------+ +--------------------------+ +--------------------------+
(sixth tile: Strength floor, row 3 or merged per breakpoint)
```

### 1.5 Class categories (`ClassCategoryRail`)
- **Grid:** Heading row span 12. Row of **six** `ClassPhotoTile` `category` tiles plus a "More" tile (`mobbin-standard-pass §2 rule 9`: a row of six photo tiles with one-word labels). `lg`+: seven tiles in one row, each about span 12/7 (use a 7-column grid, 16 px gap, not a carousel). `md`: 4 + 3 in two rows. `base`: horizontal scroll-snap rail, 1.4 tiles in view. Tile order: Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, More. The "More" tile opens a `Dialog`/inline panel with Recovery and Youth tiles (both stay in the DOM and the sitemap).
- **Copy:**
  - Eyebrow: "Classes"
  - H2: "Eight ways to move."
  - Tile label (one word under the photo, `mobbin-standard-pass §2 rule 9`): "Strength" · "Cycle" · "Conditioning" · "Mind & Body" · "Aqua" · "Court" · "More". The caption band (shared `ClassPhotoTile` `category`) shows the category icon and name in `l`, and "12 classes this week".
  - Youth tile (inside More): age chip in capitals "AGES 6 MO–17" (`mobbin-standard-pass §2 rule 17`).
  - Link: "Browse all classes" → `/classes`
- **Imagery:** `IMG-CAT-{category}` 4:5 portrait, real class photo; the shared tile adds a `CategoryBadge` `solid` top-left and the solid Saguaro Night caption band at 80% (no gradient). Category colour appears only in the badge and icon.
- **Components:** `ClassPhotoTile` (variant `category`), `CategoryBadge`, Graphical `Dialog` (More), shadcn `carousel` (only at `base`), Graphical `Button`.
- **Interaction:** Tiles link to `/classes/category/[slug]`. "More" is a button with `aria-haspopup="dialog"`. At `base` the rail swipes and has no arrows; arrow keys move focus.
- **States:** Static; class counts from the CMS.
- **Responsive:** As above.

```
 CLASSES                                                             Browse all classes ->
 Eight ways to move.
 +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+
 |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |  More  |
 |(b)     | |(bike)  | |(timer) | |(flower)| |(waves) | |(court) | |  +2    |
 |========| |========| |========| |========| |========| |========| |Recovery|
 |12 cl.  | |...     | |...     | |...     | |...     | |...     | |& Youth |
 +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+
  Strength   Cycle     Condition. Mind&Body   Aqua      Court       More
```

### 1.6 Schedule teaser (`ScheduleTeaser`)
- **Grid:** Surface-muted band. Header row span 12: eyebrow, H2, club switcher on the right. `lg`+: `ScheduleDayStrip` span 12, then list span 8 and a side card span 4 ("First time? Try a class free" with the pass CTA). `base`: strip scrolls horizontally; list full width; side card below.
- **Copy:**
  - Eyebrow: "This week"
  - H2: "Classes at Gilbert – Val Vista"
  - Day strip: seven days, today selected, labels "Tue 27". Day labels 14 px or larger (`MM §4`).
  - Rows (at most six, `MM §3 r16`): "6:00 a.m. · 45 min · Climb Cycle · Marisol V. · Cycle studio · ||||. Hard · 4 bikes left · [Book]"
  - Link: "See full schedule" → `/schedule?club=gilbert-val-vista&date=…`
  - Side card: "First time? Try the class free." "Get a 3-day pass. No card." [Get my free pass]
  - Footnote: "All times are Arizona time."
- **Imagery:** Instructor avatars 40 px round (`MM §3 r14`). No row photos (density). The side card has a 4:3 photo `IMG-TEASER-FIRSTTIME`.
- **Components:** `ScheduleDayStrip`, `ClassCard` variant `schedule-row`, `InstructorChip`, `IntensityRibs`, `CapacityIndicator`, `CategoryBadge` (icon-only compact form with `aria-label` and a visible name in the row on `lg`+), `BookingStateButton`, `ClubSwitcher` inline, Graphical `Button`, `Skeleton` (shadcn).
- **Interaction:** Choosing a day refetches that day (30 s cache). "Book" runs the handoff (`01` §6.5): signed in goes to the app; signed out opens a `Dialog` with "Sign in", "Try a free 3-day pass" and "Join". Row opens `ClassDetailPanel` when the class name is clicked. Past classes today are hidden. Full classes show `BookingStateButton` "Join waitlist".
- **States:** Loading: 6 row skeletons. Empty (no classes left today): `EmptyState` "No more classes today at Gilbert – Val Vista. The club is open until 10 p.m." + button "See tomorrow" (auto-selects next day with classes). Error: "We could not load today's classes. Try again or call (480) 555-0142." (club phone).
- **Responsive:** `base`: row becomes two lines: line 1 time + class + button; line 2 instructor + ribs + spots. Strip: 7 chips 56 px wide, scrollable.

```
+------------------------------------------------------------------------------------------+
| THIS WEEK                                              (o) Gilbert - Val Vista  v        |
| Classes at Gilbert - Val Vista                                                           |
| [Tue 27][Wed 28][Thu 29][Fri 30][Sat 31][Sun 1][Mon 2]      (Tue selected)               |
| +-------------------------------------------------------------+ +----------------------+ |
| | 6:00 am 45m (bike) Climb Cycle (MV) |||.. Hard  4 left [Book]| | First time?          | |
| | 7:15 am 60m (flower) Desert Flow Yoga (IB) |.... Easy [Book]| | Try a class free.    | |
| | 9:30 am 45m (waves) Aqua Fit (LO) ||... Light      [Book]    | | [Get my free pass]   | |
| | 12:00 pm ...                                                | +----------------------+ |
| +-------------------------------------------------------------+                          |
| See full schedule ->                    All times are Arizona time.                      |
+------------------------------------------------------------------------------------------+
```

### 1.7 Families (`FamilySplit`)
- **Grid:** `lg`+: photo span 6 (left), text span 5 offset 1 (right). `base`: photo first.
- **Copy:** (`mobbin-standard-pass §2 rule 18`: a short headline, a short line, one outline button.)
  - Eyebrow / age chip in capitals (`mobbin-standard-pass §2 rule 17`): "AGES 6 MO–17"
  - H2: "Train. The kids are fine." (sentence case: `BG §5` outranks the capitals in the evidence)
  - Body: "Kids club is open Monday to Saturday in 2-hour blocks, from 8:00 a.m. to 12:00 p.m. and 4:00 to 8:00 p.m. Add the family from $19 a month."
  - Facts (3 `data-l` numbers): "3 clubs with kids club" · "2-hour blocks" · "6 mo–12 yr"
  - One outline button: "See kids and family" → `/kids`
- **Imagery:** `IMG-HOME-FAMILY` 3:2 (mobile 4:3): parent at the kids club door, child with a wristband tag, natural light. Faces visible and happy, no posed stock look.
- **Components:** `HeroSplit` variant `split-content`; Graphical `Button` (outline).
- **Interaction:** none beyond the button.
- **States / Responsive:** Static. Numbers stack in a row of three at `lg`, a column at `base`.

```
+------------------------------------------------------------------------------------------+
| +------------------------------+   AGES 6 MO-17                                           |
| |   IMG-HOME-FAMILY 3:2        |   Train. The kids are fine.                              |
| |                              |   Kids club is open Monday to Saturday ...               |
| |                              |   3 clubs | 2-hour blocks | 6 mo-12 yr                   |
| +------------------------------+   [ See kids and family ]                                |
+------------------------------------------------------------------------------------------+
```

### 1.8 Plans (`PlanCardsSection`)
- **Grid:** `lg`+: three `PlanCard`s, span 4 each; the middle card is raised (translate −8 px, 2 px `primary` border) and has the badge "Most popular" (`MM §3 r18`, `MM P1`). `md`: cards stack; Ridge first. `base`: Ridge first, then Trailhead, then Summit.
- **Copy:**
  - Eyebrow: "Membership"
  - H2: "Pick your pace."
  - Cards: **Trailhead** $54/mo — "Best for: one club, close to home." — "Classes and pools at your home club" · "Book in the app 7 days ahead" (2 to 3 items). **Ridge** $79/mo — badge "Most popular" — "Best for: using every club." — "All 5 clubs" · "All classes" · "Courts, book 3 days ahead" · "1 guest pass a month". **Summit** $129/mo — "Best for: recovery and coaching." — "Everything in Ridge" · "Recovery suite" · "Book 9 days ahead" · "4 guest passes a month" · "Towel service" · "1 PT intro a quarter". (Six features or fewer per card, `MM §3 r20`.)
  - Buttons: Ridge "Join Ridge" (primary); Trailhead "Join Trailhead" and Summit "Join Summit" (outline).
  - Under cards: "Month to month. Cancel or freeze with 30 days' notice." · "Enrollment is $0 through Nov 30 (otherwise $49). $49 annual facility fee in March." (Fees stay visible in 14 px text, `MM §4`.) · Link "Compare every detail" → `/membership#compare` · Link "Family add-on: +$39 adult, +$19 child" · "Not sure? Try a free 3-day pass" → `/trial` (`MM P7`).
- **Imagery:** none on cards. A small `RibMeter` (static, 1/3/5 ribs filled) on each card as a plan-level icon: Trailhead 1 rib, Ridge 3, Summit 5. Always with the plan name, never alone.
- **Components:** `PlanCard` (variants: `default`, `highlighted`), Graphical `Button`, `Separator`.
- **Research:** three cards with one "Most popular" badge on the middle card (`mobbin-standard-pass §2 rule 10`); price as one large `data-l` number with "/mo" smaller beside it (`mobbin-standard-pass §2 rule 12`; no "billed annually" line because there is no annual price, and no toggle, so `mobbin-standard-pass §2 rule 11` is not used).
- **Interaction:** Each button goes to `/join/plan?plan=slug`. Cards have no hover lift.
- **States:** Prices come from the CMS and carry `priceValidUntil` for promos. If billing is down, the join flow shows its own error; the marketing page does not change.
- **Responsive:** As grid.

```
+------------------------------------------------------------------------------------------+
| MEMBERSHIP     Pick your pace.                                                           |
| +--------------------+ +==========================+ +--------------------+               |
| | Trailhead          | | MOST POPULAR             | | Summit             |               |
| | |....               | | Ridge          |||..    | | |||||             |               |
| | $54 /mo            | | $79 /mo                  | | $129 /mo           |               |
| | Best for: one club | | Best for: every club     | | Best for: recovery |               |
| | (v) classes + pools| | (v) All 5 clubs          | | (v) Ridge + suite  |               |
| | (v) 7-day booking  | | (v) All classes          | | (v) 9-day booking  |               |
| | [Join Trailhead]   | | (v) Courts, 3 days ahead | | [Join Summit]     |               |
| |                    | | [   Join Ridge   ]       | |                    |               |
| +--------------------+ +==========================+ +--------------------+               |
| Month to month. Enrollment $0 through Nov 30.  Compare every detail ->                   |
+------------------------------------------------------------------------------------------+
```

### 1.9 Coaches strip
- **Grid:** A row of four `CoachCard` `headshot` items (`mobbin-standard-pass §2 rule 16`: square or round headshots in a row of four or five, bold name, role line). Span 3 each at `lg`+; 2 per row at `md`; 2 per row at `base` (headshot 120 px).
- **Copy:** Eyebrow "Coaches" · H2 "People who know your name." Under each headshot: name (bold) and a role line. Examples: "Marisol Vega · Cycle coach" · "Devon Hart · Strength coach" · "Imani Brooks · Yoga and mobility" · "Luis Ortega · Swim coach". Link: "Meet all coaches" → `/coaches`. (Credential line, favourite class and clubs appear on the full `card` variant in 15.2.)
- **Imagery:** `IMG-COACH-{slug}` 1:1 headshot crop (160 px, round or radius `m`), natural light, eye contact.
- **Components:** `CoachCard` (variant `headshot`), Graphical `Button` (ghost link).
- **Interaction:** Each headshot is a link to `/coaches/[slug]`.
- **States / Responsive:** Static.

```
 COACHES   People who know your name.                       Meet all coaches ->
   (  o  )       (  o  )       (  o  )       (  o  )
 Marisol Vega   Devon Hart   Imani Brooks   Luis Ortega
 Cycle coach    Strength     Yoga+mobility  Swim coach
```

### 1.10 Testimonials (`TestimonialRail`)
- **Grid:** Surface-muted band. `lg`+: quote card span 6 beside a large member photo span 6 (4:5), arrows at the sides and a dot pager under the card (`mobbin-standard-pass §2 rule 15`). One quote at a time (`MM SP2`, `MM §3 r29`). `base`: photo above the card.
- **Copy:** Eyebrow "Members" · H2 "Steady beats loud." Quotes (30 words or fewer, `MM §3 r29`), with first name, last initial and goal (`MM §3 r28`). Examples (placeholders):
  1. "I came back after knee surgery. Imani set me up in the warm pool and never rushed me." — Daniel K., back to walking two miles
  2. "Swim school for my nine-year-old, a 6:00 a.m. class for me. Same building." — Maya T., Gilbert – Val Vista
  3. "Four mornings of pickleball a week. Linda books the courts. I book the coffee." — Ron P., Mesa – Red Mountain
  4. "Platforms free at 6 p.m. most nights. That is why I joined." — Priya S., Mesa – Downtown
  Show at least three (`MM §3 r28`).
- **Imagery:** `IMG-TESTI-{n}` 1:1 circle 96 px (quote carousel) or 4:5 still for video variant. Each quote has consent on file.
- **Components:** `TestimonialRail` composite, shadcn `carousel`, Lucide `Quote`, Graphical `Button` (icon arrows), shadcn `badge` for the club.
- **Interaction:** Arrows, dots (`role="tablist"`), swipe, left/right keys. No autoplay. Quote text is in the DOM for all slides (screen readers read one with `aria-live="off"`; slide change announces "Quote 2 of 4").
- **States:** If fewer than three consented quotes exist, hide the section (the CMS validates).
- **Responsive:** Full width at `base`; photo above text.

```
+------------------------------------------------------------------------------------------+
| MEMBERS                          Steady beats loud.                                      |
|  (<)  +------------------+  +--------------------------------------+               (>)  |
|       |  member photo    |  | "I came back after knee surgery.     |                      |
|       |  4:5 large       |  |  Imani set me up in the warm pool..."|                      |
|       +------------------+  | Daniel K. - back to walking 2 miles  |                      |
|                             +--------------------------------------+   o  .  .  .         |
+------------------------------------------------------------------------------------------+
```

### 1.11 Your first visit (`TourTimeline`)
- **Grid:** Left: heading span 5. Right: vertical timeline span 7 (`MM TC4`).
- **Copy:** Eyebrow "Your first visit" · H2 "What a tour looks like." Steps with a number in a 32 px circle: 1 "Book a time. Pick a club and a 30-minute slot. No card." · 2 "Walk the club. A coach shows you the floor, the pool and the classes you asked about." · 3 "Try it, or go home and think. Take a free 3-day pass if you want to try a class." Button: "Book a free tour". Small line: "Tours run Monday to Saturday, 9:00 a.m. to 7:00 p.m., and Sunday 10:00 a.m. to 4:00 p.m." (proposed).
- **Imagery:** none (typographic section). A `RibMeter` of three ribs ties the steps (decorative).
- **Components:** `TourTimeline` composite, Graphical `Button` (primary).
- **Interaction:** Button → `/tour`.
- **States / Responsive:** Static. `base`: stacks.

```
 YOUR FIRST VISIT                 (1) Book a time. Pick a club and a 30-minute slot.
 What a tour looks like.          |
 [ Book a free tour ]             (2) Walk the club. A coach shows you the floor...
                                  |
                                  (3) Try it, or go home and think...
```

### 1.12 FAQ (`FAQAccordionSection`)
- **Grid:** Heading left span 4, accordion right span 8 (`MM F3`). Five questions; the first is open (`MM F2`).
- **Copy:** Eyebrow "Questions" · H2 "Good questions." Q&A: "Do I need a card for a tour or a pass?" / "No. Tours and the 3-day pass are free and need no card." · "Is there a contract?" / "No. Memberships are month to month. Cancel or freeze with 30 days' notice." · "Can I use more than one club?" / "Ridge and Summit work at all 5 clubs. Trailhead works at your home club." · "Is there something for my kids?" / "Yes. Kids club at Mesa – Dobson, Mesa – Red Mountain and Gilbert – Val Vista." · "I am new or coming back from an injury. Where do I start?" / "Book a tour and tell us. We will match you with a coach and an easy class." Escape route (`MM F5`, `MM §3 r32`): "Still have a question? See all questions or call your club." → `/faq`, `tel:`.
- **Components:** Graphical `Accordion`, `FAQAccordionSection`, Graphical `Button` (ghost links).
- **Interaction:** One open at a time; `Enter`/`Space` toggle; 150 ms height animation. Deep link `/#faq-contract` opens that item.
- **States / Responsive:** Static. `base`: heading above.

```
 QUESTIONS            (v) Do I need a card for a tour or a pass?
 Good questions.          No. Tours and the 3-day pass are free and need no card.
                      (>) Is there a contract?
 Still have a         (>) Can I use more than one club?
 question?            (>) Is there something for my kids?
 See all -> / call    (>) I am new or coming back from an injury...
```

### 1.13 Tour band (`TourCTABand`)
- **Grid:** Full-bleed `secondary` (Saguaro Night). Content span 8 offset 2, centered. One brand-weight band on Home.
- **Copy:** H2 (Sand): "Come see the club." Support: "A 30-minute tour. A coach, not a salesperson. No card." Primary button on dark: Graphical `Button` primary (Dawn Copper in dark contexts via `primary` dark token `#E0804F`, label `#121A16`; use the reversed treatment). Secondary: "Try a free 3-day pass" (outline, Sand). Phone: "Or call your club: (480) 555-0142".
- **Imagery:** None. The reversed Rib Peak symbol in Dawn Copper at 96 px sits above the H2, with full clear space (`BG §2`, `§4`).
- **Components:** `TourCTABand`, `PromoBand` variant `band`, Graphical `Button`.
- **Pass email row (`PromoBand` `band` with `form`, `mobbin-standard-pass §2 rule 14`):** Under the buttons on Home and Club detail, one row: an email field and a button side by side, label "Email", button "Get a 3-day pass", and under it "No credit card required." Submit posts to `/api/trial/start`. The email is held in a server-side session (never in the URL) and `/trial` opens with it filled in. The tour flow keeps its own form (shared `PromoBand` rule).
- **Interaction:** Links and the email row. **States / Responsive:** Static; the email row stacks at `base`; invalid email shows the field error from `05` §2.3.

```
+==========================================================================================+
|                                      /\  (symbol)                                        |
|                              Come see the club.                                          |
|            A 30-minute tour. A coach, not a salesperson. No card.                        |
|                [ Book a free tour ]   [ Try a free 3-day pass ]                          |
|                        Or call your club: (480) 555-0142                                 |
+==========================================================================================+
```

---

## 2. Clubs index `/clubs`

**Purpose:** Let a visitor see all five clubs on a map and in a list, filter by what matters, and start a tour.
**Primary question:** "Which club is near me, and does it have what I need?"
**Conversion:** `club_card_tour_click`, `club_detail_open`, `tour_started`.
**Section order:** 2.1 Page header · 2.2 Filters · 2.3 Split map and list · 2.4 Compare table · 2.5 Tour band.

### 2.1 Page header
- **Grid:** Span 12; text span 7, location search span 5 at `lg`+. Padding 32 px top and bottom.
- **Copy:** H1 "Find your club." Lede "Five clubs in Mesa and Gilbert. All open at 4:30 a.m. on weekdays." Search: label "ZIP code", button "Find", ghost button "Use my location". Helper: "We show distance only after you give a ZIP code or allow location." (`MM §3 r5`).
- **Components:** Graphical `Field`, `Input`, `Button`; `ClubSwitcher` logic reused for ZIP/geo (no popover).
- **Interaction:** "Find" sorts the list by distance, shows "1.7 mi" on each card and re-centres the map. Deviation: no distance stepper (`MM L4`, `MM §3 r5` context). A stepper helps in large networks. This site has five clubs, so the map and the sorted list are enough.
- **States:** ZIP errors as in `02-navigation.md` §5.3.
- **Responsive:** `base`: stacked.

```
 Home > Clubs
 Find your club.                                   ZIP code [_____] [Find]
 Five clubs in Mesa and Gilbert. All open          (o) Use my location
 at 4:30 a.m. on weekdays.
```

### 2.2 Filters (`ScheduleFilters`-style chip row, `ClubFilters`)
- **Grid:** Sticky row under the header (top 72 px), span 12, `background`, 1 px bottom border.
- **Copy:** Chips (six, `MM §3 r9`): Pool · Courts · Cycling · Kids club · Recovery · Group classes. Toggle "Open now". Sort select "Sort: Distance / Size / A–Z" (Distance disabled until ZIP/location with the helper "Add a ZIP code to sort by distance"). Result line: "5 clubs" (live: `aria-live="polite"`).
- **Components:** Graphical `ToggleGroup` (multiple) with `AmenityChip` content; Graphical `Toggle` ("Open now"); Graphical `Select` (sort); `ClubFilters` composite.
- **Interaction:** Filters apply with AND logic. Non-matching clubs are removed from the list and their pins fade to 30% (a `ClubPin` state). URL updates `?amenity=pool,kids` and is shareable. "Clear filters" appears when any is on.
- **States:** Zero matches (for example Pool + Recovery + Kids club can match; Pool + Group classes matches 3): `EmptyState` "No club has all of that. Remove 'Recovery' to see 3 clubs." with a button per removable chip.
- **Responsive:** `base`: chips scroll horizontally, "Filters" is not a sheet because there are only six chips.

```
 [Pool] [Courts] [Cycling] [Kids club] [Recovery] [Group classes]  |  [ ] Open now   Sort v
 5 clubs                                                              Clear filters
```

### 2.3 Split map and list (`ClubFinderSection` variant `split`)
- **Grid:** `lg`+: list span 5 (scrolls), map span 7 (sticky, height `calc(100vh - 160px)`, at least 58% of width, `MM §3 r6`). `md`: list above, map 360 px high above list (stacked, map first). `base`: segmented control "List | Map" (Graphical `Tabs`, 44 px) at the top; one view at a time, list default.
- **Copy:** Each list card (`ClubCard` variant `list-row`, marketing finder card with address and today's hours, `mobbin-standard-pass §2 rule 4`): 4:3 photo (176×132 px), name "Gilbert – Val Vista", city "Gilbert, AZ", address "Val Vista Dr & Warner Rd", status "Open · until 10 p.m." with today's hours "4:30 a.m.–10 p.m.", distance "1.7 mi" (only when known), three `AmenityChip`s (the club's three strongest for the active filters, else its signature three), `BusynessMeter` "Steady", button "Tour this club", link "See club" (`MM §3 r2`, `r3`). Map pin label: short name ("Val Vista"). Cluster bubbles at low zoom: "3" over Mesa, "2" over Gilbert (`MM §3 r8`). Pin callout (`ClubCard` variant `map-callout`): photo, name, hours, "Tour this club".
- **Imagery:** Club photos `IMG-CLUB-{slug}-CARD` 4:3. Map style: Sand land, Caliche roads, Canal Teal water, no POI clutter; pins are Saguaro Night with a white five-rib glyph; the selected pin is copper (the active state).
- **Components:** `ClubMap` + `ClubPin` (shared), `ClubCard` (`list-row`, `map-callout`), `BusynessMeter`, `AmenityChip`, Graphical `Button`, `Tabs`, `ScrollArea`.
- **Interaction:** Hover or focus on a card highlights its pin (`MM §3 r7`). Clicking a pin scrolls the list to its card and focuses it (`MM §3 r7`). Keyboard: the map has `role="application"` off; instead the list is the primary accessible control and the map is `aria-hidden` for pointer users with a "Skip map" link; pins are focusable buttons in DOM order after the list. Arrow keys pan only when the map has focus. Zoom buttons 44 px. "Get directions" opens Apple/Google Maps.
- **States:** Map loading: static image placeholder of the same size (no CLS) with five pins drawn as CSS. Map error/blocked: the list stays; a line reads "The map did not load. The list has all five clubs." Geolocation states as in `02` §5.3. Empty: see 2.2.
- **Responsive:** As grid. At `base`, tapping a pin opens the `map-callout` as a bottom card (not a popup).

```
lg+
+--------------------------------------------+ +----------------------------------------+
| [IMG 4:3] Mesa - Dobson     1.7 mi         | |   map (sticky)                          |
|  Mesa, AZ  * Open until 10 p.m. |||.. Steady| |        (3)  Mesa cluster                |
|  [Pool][Courts][Recovery]                  | |           \  [Dobson]  <- selected      |
|  [Tour this club]  See club                | |   (2) Gilbert                           |
+--------------------------------------------+ |        [Val Vista]                      |
| [IMG] Mesa - Red Mountain  ...             | |   +--------------------------+          |
+--------------------------------------------+ |   | callout: photo, hours,   |          |
| [IMG] Mesa - Downtown  ...                 | |   | [Tour this club]         |          |
+--------------------------------------------+ |   +--------------------------+          |
| ...                                        | |                         [+] [-]         |
+--------------------------------------------+ +----------------------------------------+
base:   [ List | Map ]   (one at a time)
```

### 2.4 Compare table (`ClubComparisonTable`)
- **Grid:** Span 12, `surface-muted` band. Table 6 columns (label + 5 clubs).
- **Copy:** Eyebrow "Side by side" · H2 "Which club has what." Rows (10 or fewer, `MM §4`): Size · Lap pool · Warm-water or splash · Courts · Kids club · Recovery · Cycle studio · Studios · Lifting platforms · Extras. Cells from `FD §2`: for example Dobson "68,000 sq ft · 25-yd, 8 lanes · Warm-water therapy pool · 4 pickleball, 2 tennis · Yes · Full suite · Yes · 3 · — · Café"; Red Mountain "52,000 sq ft · Outdoor 25-m, shade sails · — · 6 pickleball · Yes · — · Yes · 2 · — · Superstition-view cardio deck, turf lane"; Downtown "18,000 sq ft · — · — · — · No · Lounge (sauna, compression) · Yes · 2 · — · —"; Val Vista "60,000 sq ft · 25-yd · Splash pad, swim school · 2 basketball, 4 pickleball · Yes · Suite · Yes · 3 · — · —"; Heritage "22,000 sq ft · — · — · — · No · Lounge · Yes · 2 · Olympic platforms · Rooftop mobility deck".
  Yes = `Check` icon + the word "Yes" (visually hidden word allowed? No: icon + visible short text); No = a `Minus` icon + "No" in `text-muted` (4.77:1 or better on `surface`).
- **Components:** shadcn `table` (`npx shadcn@latest add table`), Lucide `Check`/`Minus`, `AmenityChip`, Graphical `Button` per column header ("Tour this club" ghost).
- **Interaction:** Column header links to the club page. Hover highlights the column with `primary-subtle` background at 40%; row header sticky at `lg`-.
- **States / Responsive:** Static. `base`/`md`: horizontal scroll with sticky first column and a visible scrollbar hint ("Swipe to compare"); `ScrollArea` focus ring set by CSS (Graphical Scroll area has no ring control, `README`).

```
                 Dobson     Red Mtn    Downtown   Val Vista  Heritage
 Size            68,000     52,000     18,000     60,000     22,000
 Lap pool        25-yd,8    25-m out   -          25-yd      -
 Courts          4pb+2t     6pb        -          4pb+2bb    -
 Kids club       Yes        Yes        No         Yes        No
 Recovery        Suite      -          Lounge     Suite      Lounge
 ...             [Tour]     [Tour]     [Tour]     [Tour]     [Tour]
```

### 2.5 Tour band
`TourCTABand` as §1.13. H2 "Not sure which club? Tour two." Support "Book one tour. Ask your coach to walk you to the club that fits." (Same buttons and phone line for the neutral number.)

---

## 3. Club detail `/clubs/gilbert-val-vista` (fully worked example)

All five club pages use this template. Everything below uses Gilbert – Val Vista (`FD §2`). Other clubs change only data (CMS `Club`).
**Purpose:** Answer "what does this club have, when is it open, how busy is it, and can I try it?"
**Primary question:** "Does this club fit my week and my family?"
**Persona focus:** Maya (kids club, swim school), Jordan (teen strength).
**Conversion:** `tour_booked`, `club_call_click`, `trial_pass_issued`.
**Section order:** 3.1 Club hero + sticky booking card · 3.2 Quick facts · 3.3 Gallery · 3.4 Sticky tab bar · 3.5 Classes · 3.6 Amenities · 3.7 Hours and map · 3.8 Coaches · 3.9 Reviews (member quotes) · 3.10 Plans · 3.11 Other clubs · 3.12 Club FAQ · 3.13 Tour band.

Tab order (`MM §3 r10`): **Classes · Amenities · Hours and map · Coaches · Reviews.**

### 3.1 Club hero (`ClubHero`) with booking card
- **Grid:** `lg`+: left column span 8 (photo, title block); right column span 4 (sticky booking card, `MM D3`, `MM §3 r11`) which sticks from the top of the hero to the end of the tab sections at `top: 88px`. `md`: card moves below the title block, not sticky. `base`: no card; the `BottomActionBar` carries "Tour this club" and "Call the club" (`MM §3 r12`).
- **Copy:**
  - Breadcrumb: Home › Clubs › Gilbert – Val Vista
  - Eyebrow: "Full club · 60,000 sq ft"
  - H1: "Gilbert – Val Vista"
  - Personality line (`l`, Archivo 600): "Swim school, courts, and a kids club that kids ask for."
  - Status line: "Open · until 10 p.m." with `BusynessMeter` "Steady" and "Updated 4 min ago."
  - Address: "Val Vista Dr & Warner Rd, Gilbert, AZ 85233" · "Get directions" link.
  - Amenity chips (`AmenityChip`, 7): "25-yd lap pool" · "Splash pad" · "Swim school" · "2 basketball courts" · "4 pickleball courts" · "Recovery suite" · "Kids club" (plus "3 studios + cycle studio" as the eighth, hidden behind "+1 more" at `base`).
  - Booking card: "Tour this club" (primary, full width) · "Call the club (480) 555-0142" (outline) · text link "Try a free 3-day pass" · line "From $54 a month. Month to month." · small "Free tour. 30 minutes. No card."
- **Imagery:** `IMG-CLUB-gilbert-val-vista-HERO` 16:9 (mobile 4:3), radius `xl` 28 px: kids at the splash pad edge with a parent and the pool behind, East Valley morning sun, warm 5200–5600 K (`BG §7`). Logo is not on the photo.
- **Components:** `ClubHero` (shared), `BusynessMeter`, `AmenityChip`, Graphical `Button`, `Separator`, Lucide `MapPin`, `Phone`.
- **Interaction:** "Tour this club" → `/tour?club=gilbert-val-vista`. "Call the club" → `tel:+14805550142`. Click on `BusynessMeter` jumps to the popular-times chart (3.7). "Get directions" → platform maps (new tab, `rel="noopener"`).
- **States:** Busyness loading: skeleton 5 ribs + "Checking…". Busyness unavailable: omit; show "Typical hours below." Club temporarily closed (CMS banner): red-free `warning` alert above hero with reason and reopening date; buttons stay.
- **Responsive:** `base`: stacked; amenity chips scroll horizontally in one row; sticky bar at the bottom.

```
lg+
+--------------------------------------------------------------+ +-----------------------+
| Home > Clubs > Gilbert - Val Vista                           | | * Open until 10 p.m.  |
| +----------------------------------------------------------+ | | |||.. Steady          |
| |  IMG-CLUB-gilbert-val-vista-HERO  16:9                   | | | Val Vista Dr &        |
| +----------------------------------------------------------+ | | Warner Rd, Gilbert    |
| FULL CLUB . 60,000 SQ FT                                     | | Get directions        |
| Gilbert - Val Vista                                          | | [ Tour this club ]    |
| Swim school, courts, and a kids club that kids ask for.      | | [ Call (480) 555-0142]|
| [25-yd lap pool][Splash pad][Swim school][2 basketball]      | | Try a free 3-day pass |
| [4 pickleball][Recovery suite][Kids club][+1]                | | From $54/mo.          |
+--------------------------------------------------------------+ +-----------------------+
base:  photo / title / personality / status / chips (scroll) / [sticky bar: Tour | Call]
```

### 3.2 Quick facts
- **Grid:** Row of four stat tiles, span 3 each (`md`: 2×2; `base`: 2×2).
- **Copy (`data-l` numbers):** "60,000" sq ft · "25 yd" lap pool + splash pad · "6" courts (2 basketball, 4 pickleball) · "4:30 a.m." weekday open.
- **Components:** Plain tiles on `surface` (`.cp-card` style) with `data-l` (Archivo 700 36/40) numbers and `s` labels; Lucide icons 24 px.
- **Interaction / States / Responsive:** Static; tiles link to the matching tab section.

```
 +------------+ +------------+ +------------+ +------------+
 |  60,000    | |   25 yd    | |     6      | |  4:30 a.m. |
 |  sq ft     | | pool+splash| |   courts   | | weekdays   |
 +------------+ +------------+ +------------+ +------------+
```

### 3.3 Gallery
- **Grid:** `lg`+: one large photo span 6 + four 3:2 photos in a 2×2, span 6 (`MM L6`-style hero tile). Button "See all 12 photos" opens a `Dialog` lightbox with arrows.
- **Copy:** Captions are specific: "Splash pad, Saturday 9:00 a.m." · "Swim school, Level 2" · "Studio B, Rhythm Ride" · "Basketball court 1" · "Kids club check-in".
- **Imagery:** `IMG-CLUB-gilbert-val-vista-G1…G12` 3:2. Real members, range of ages.
- **Components:** shadcn `carousel` (lightbox), Graphical `Dialog`, `ClassPhotoTile` for studio photos, shadcn `aspect-ratio`.
- **Interaction:** Lightbox: arrows, `Esc`, swipe; focus trapped; caption below image.
- **States:** Image fails: `surface-muted` box with the caption text. **Responsive:** `base`: a 3:2 carousel with a count "1 of 12".

```
 +------------------------------+ +-----------+ +-----------+
 |                              | | 3:2       | | 3:2       |
 |  large 3:2                   | +-----------+ +-----------+
 |                              | | 3:2       | | 3:2 +9    |
 +------------------------------+ +-----------+ +-----------+   [See all 12 photos]
```

### 3.4 Sticky tab bar
- **Grid:** Span 12, sticky at `top: 64px` (header height), `background` with a 1 px bottom `border`, height 56 px, `z-index` 40. Appears when the quick facts leave the viewport.
- **Copy:** Classes · Amenities · Hours and map · Coaches · Reviews. Right side at `lg`+: compact "Tour this club" button (appears once the hero card scrolls away).
- **Components:** Graphical `Tabs` used as anchor navigation (`role="tablist"` not used; `nav aria-label="On this page"` with links and `aria-current`), scroll-spy via `IntersectionObserver`. (Panels all render in the DOM for SEO.) Active item: `text` colour + 2 px `primary` underline.
- **Interaction:** Click scrolls to the section (`scroll-margin-top: 128px`) and updates the hash; reduced motion: instant jump.
- **States / Responsive:** `base`: horizontally scrollable, 44 px items, active item scrolls into view.

```
 | Classes | Amenities | Hours and map | Coaches | Reviews |            [ Tour this club ]
   ======
```

### 3.5 Classes (tab 1)
- **Grid:** Span 12. Header row: H2 left, "All 28 classes" link right. Below: `ScheduleDayStrip` span 12, rows span 8, side card span 4 (class types at this club).
- **Copy:** H2 "Classes at Val Vista." Lede "3 studios and a cycle studio. 41 classes this week." Row example: "6:00 a.m. · 45 min · Climb Cycle · Marisol V. · Cycle studio · Hard · 4 bikes left". Side card: "Popular here" list with `CategoryBadge`s: Swim School, Climb Cycle, Pickleball Clinic, Teen Strength, Desert Flow Yoga. Link: "Open the full schedule for this club" → `/schedule?club=gilbert-val-vista`.
- **Components:** As §1.6 (club fixed, no switcher), plus `ClassCard` variant `compact` for the side list.
- **Interaction / States / Responsive:** As §1.6. The club filter is locked.

```
 CLASSES AT VAL VISTA
 [Tue][Wed][Thu][Fri][Sat][Sun][Mon]
 6:00 am Climb Cycle ...... [Book]            | POPULAR HERE
 7:15 am Desert Flow Yoga . [Book]            | (waves) Swim School
 ...                                          | (bike) Climb Cycle
 Open the full schedule for this club ->      | (court) Pickleball Clinic
```

### 3.6 Amenities (tab 2)
- **Grid:** Sub-sections stacked, each a split row: photo span 5, text span 7, alternating sides. Sub-sections: Pool and swim school · Courts · Kids club · Recovery suite · Studios and strength floor.
- **Copy:**
  - Pool and swim school: H3 "A lap pool, a splash pad and swim school." "A 25-yd lap pool with 6 lanes, lane reservations in 45-minute slots, and a splash pad for the small ones. Swim school runs five levels, from Splash to Lap-ready." Facts: "25 yd · Lane slots 45 min · Pools close 30 min before the club (9:30 p.m. weekdays, 7:30 p.m. weekends)". Link: "About aquatics" → `/aquatics`.
  - Courts: "2 basketball courts and 4 pickleball courts. Book a 60- or 90-minute slot up to 3 days ahead with Ridge or Summit." Link → `/courts`.
  - Kids club: "Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m., in 2-hour blocks. Ages 6 months to 12 years. A parent checks in and stays in the building." Link → `/kids`.
  - Recovery suite: "Sauna, cold plunge and compression. A Summit benefit." Link → `/recovery`.
  - Studios and strength: "3 studios and a cycle studio. A strength and cardio floor with racks." Link → `/classes`.
- **Imagery:** `IMG-CLUB-gilbert-val-vista-AMEN-{pool|courts|kids|recovery|studios}` 3:2.
- **Sidebar list (`mobbin-standard-pass §2 rule 19`):** beside each amenity photo, a short list of related items as `AmenityChip` `detail` rows. Pool: "6 lap lanes · Splash pad · Swim school levels 1–5 · Warm showers". Courts: "4 pickleball · 2 basketball · Open play · Clinics". Kids club: "Ages 6 months–12 years · 2-hour blocks · Parent check-in · Allergy notes". Recovery: "Sauna · Cold plunge · Compression · Summit benefit".
- **Components:** `AmenityBento` variant `rows`; `AmenityChip`; Graphical `Button` (ghost links); `HoursTable` (compact, kids club hours) inside the Kids club row.
- **Interaction:** Links only.
- **States / Responsive:** Static. `base`: photo above text; alternate order removed.

```
 +----------------+   A lap pool, a splash pad and swim school.
 | IMG 3:2 pool   |   A 25-yd lap pool, lane reservations ...
 +----------------+   25 yd | 45-min lane slots | Pools close 30 min early   About aquatics ->
   Courts text      +----------------+
                    | IMG courts     |
                    +----------------+
 ... Kids club (with mini hours) / Recovery suite / Studios and strength
```

### 3.7 Hours and map (tab 3)
- **Grid:** `lg`+: left span 6 (hours + popular times), right span 6 (map). `base`: stacked, map after hours.
- **Copy:**
  - H2 "Hours and map."
  - `HoursTable` (two columns per `MG r30`): Weekdays "Mon–Fri 4:30 a.m.–10:00 p.m." · Weekend "Sat–Sun 6:00 a.m.–8:00 p.m." · "Staffed 6:00 a.m.–8:00 p.m." · "Kids club Mon–Sat 8:00 a.m.–12:00 p.m., 4:00–8:00 p.m." · "Pool closes 30 min before the club." Seven rows, today bold with a "Today" tag (`MM §3 r13`; Monday to Friday group in one row, `mobbin-standard-pass §2 rule 7`). Holiday line under the table: "Thanksgiving Day: 6:00 a.m.–12:00 p.m." (CMS).
  - `PopularTimesChart`: tabs by day (Mon…Sun), bars by hour, today's current hour marked "Now: Steady". Caption: "Typical busyness. Quietest: weekdays 1:00–3:00 p.m. and after 8:00 p.m."
  - Block order (`mobbin-standard-pass §2 rule 6`: city as the largest heading, then address, then hours, then one primary button): city heading "Gilbert" (`xl`), then the address block, then `HoursTable`, then the button "Tour this club". Address block: "Val Vista Dr & Warner Rd, Gilbert, AZ 85233" · Parking: "Free lot on the east side. Drop-off lane at the kids club door." (proposed) · Access: "Step-free entrance on the north side. Accessible changing rooms." (proposed) · Phone link · "Get directions".
- **Imagery:** `ClubMap` single pin, 4:3, same map style as §2.3. No photo.
- **Components:** `HoursTable`, `PopularTimesChart` (shadcn `chart` base, `npx shadcn@latest add chart`), `ClubMap`/`ClubPin`, Graphical `Tabs` (days), `BusynessMeter`.
- **Interaction:** Chart bars focusable; tooltip text on focus ("Tuesday 6:00 a.m.: Busy"). Day tabs default to today. Map: no scroll-zoom hijack (needs `Ctrl`/two fingers; message shown).
- **States:** Chart loading: skeleton bars. Chart error: text summary only ("Busiest: weekdays 5:30–7:00 a.m. and 5:00–7:00 p.m."). Map fails: static address block remains.
- **Responsive:** Chart height 160 px at `base`; bars 12 px wide minimum; the x-axis shows every 3rd hour label at `base`.

```
 HOURS AND MAP
 +---------------------------------+ +----------------------------------+
 | Weekdays          Weekend       | |   [ ClubMap, one pin ]           |
 | 4:30 a.m.-10 p.m. 6 a.m.-8 p.m. | |                                  |
 | Today (Tue) bold                | +----------------------------------+
 | Kids club ... Pool closes ...   |  Val Vista Dr & Warner Rd, Gilbert
 | POPULAR TIMES  [Mon][Tue]...    |  Parking: Free lot, east side...
 | |  ||  |||  ||||  |||  ||   Now: Steady                        Get directions
 +---------------------------------+
```

### 3.8 Coaches (tab 4)
- **Grid:** Row of four `CoachCard` `headshot` items (span 3 each at `lg`; `mobbin-standard-pass §2 rule 16`); the full `card` variant sits on `/coaches`.
- **Copy:** H2 "Coaches at Val Vista." Cards: "Marisol Vega — CSCS, Spinning instructor — Climb Cycle", "Luis Ortega — Swim coach, Red Cross lifeguard instructor — Swim School", "Sam Okafor — NASM-CPT, youth fitness — Teen Strength", "Imani Brooks — RYT-500 — Desert Flow Yoga". Link: "Meet all coaches" → `/coaches?club=gilbert-val-vista`.
- **Components:** `CoachCard` (`headshot`), `InstructorChip`.
- **States / Responsive:** As §1.9.

```
 COACHES AT VAL VISTA
 [Marisol V.] [Luis O.] [Sam O.] [Imani B.]          Meet all coaches ->
```

### 3.9 Reviews (tab 5)
- **Grid:** Quote cards, three per row (span 4), plus an overall line.
- **Copy:** H2 "What members say." Three consented quotes with goal (examples): "Swim school got my daughter from 'no' to Level 3 in one summer." — Maya T., family of four · "I lift at 5:00 a.m. and the cycle studio is full at 6:00. Both are good problems." — Jess R., Ridge · "Teen Strength gave my son a place that is not a screen." — Carlos M., parent. No star rating or rating line anywhere (foundation: no public star ratings at launch; `01` §10 issue 3).
- **Components:** `TestimonialRail` variant `grid`, shadcn `badge`.
- **States:** Fewer than three quotes: hide the tab and remove it from the tab bar. **Responsive:** Stacked at `base`.

```
 WHAT MEMBERS SAY
 +-------------------+ +-------------------+ +-------------------+
 | "Swim school got  | | "I lift at 5:00   | | "Teen Strength    |
 |  my daughter..."  | |  a.m. and ..."    | |  gave my son..."  |
 | Maya T. - family  | | Jess R. - Ridge   | | Carlos M. - parent|
 +-------------------+ +-------------------+ +-------------------+
```

### 3.10 Plans reminder
- **Grid:** `surface-muted` band; three compact `PlanCard`s (variant `compact`) span 4 each.
- **Copy:** H2 "Plans that work at Val Vista." Trailhead card note: "Trailhead gives you this club." Same prices and features as §1.8 but with three lines each. Link "Compare every detail" → `/membership#compare`.
- **Components:** `PlanCard` (`compact`), Graphical `Button`.
- **States / Responsive:** Static; stacked at `md`.

### 3.11 Other clubs nearby
- **Grid:** Two `ClubCard` variant `compact` (span 6 each). Nearest two other clubs by distance, else Gilbert – Heritage and Mesa – Downtown.
- **Copy:** H2 "Other clubs near you." Each card with a status line and "See club".
- **Components:** `ClubCard` (`compact`). **States / Responsive:** Static.

### 3.12 Club FAQ
- **Copy:** Five questions, specific to the club. "Can my kids come while I swim?" / "Yes. Kids club takes children from 6 months to 12 years in 2-hour blocks. A parent checks in at the same club and stays in the building." · "Is there a place to park a stroller?" / "Yes. A stroller bay stands by the kids club door." (proposed) · "Can I book a lane?" / "Yes. Lap lanes are 45-minute slots in the app." · "Are pickleball courts included?" / "Courts come with Ridge and Summit. Book 3 days ahead." · "Who can I call?" / "Call (480) 555-0142. The desk is staffed 6:00 a.m. to 8:00 p.m."
- **Components:** `FAQAccordionSection`. **Grid:** as §1.12.

### 3.13 Tour band
`TourCTABand` variant `club`: H2 "Come see Val Vista." Support "Bring the kids. They can see the splash pad." Buttons "Tour this club" and "Try a free 3-day pass". Phone line shows the Val Vista number. Includes the pass email row from §1.13.

Club page metadata, JSON-LD (`HealthClub`) and tab anchors: `#classes`, `#amenities`, `#hours`, `#coaches`, `#reviews`.

---

## 4. Classes index `/classes` and category landing `/classes/category/[category]`

**Purpose:** Let a visitor browse the range of classes by type, by effort and by first-timer fit.
**Primary question:** "What classes do you have, and which are right for me?"
**Conversion:** `class_type_open`, `schedule_open`, `tour_started`.
**Section order:** 4.1 Page header · 4.2 Category browse · 4.3 Intensity guide · 4.4 All classes grid · 4.5 First-timer shelf · 4.6 Tour band. Category landing (4.7) reuses 4.4 and adds coach and schedule blocks.

### 4.1 Page header
- **Grid:** Span 12; text span 7; search/filter toggle span 5 at `lg`+.
- **Copy:** H1 "Eight ways to climb." Lede "28 classes, from intensity 1 to 5. Pick by how you want to feel when you leave." Toggle (Graphical `Switch`): "Only classes good for first-timers". Search field: "Find a class" (opens the §9 search in `02-navigation.md`).
- **Components:** Graphical `Switch`, `Button`; `SearchDialog` trigger.
- **Interaction:** The switch filters 4.4 and the URL gets `?firstTimer=1`.
- **States / Responsive:** Static; stacked at `base`.

```
 Home > Classes
 Eight ways to climb.                         [ ] Only classes good for first-timers
 28 classes, from intensity 1 to 5.           [ (Q) Find a class ]
```

### 4.2 Category browse (`ClassCategoryRail` variant `grid`)
- **Grid:** Row of six `ClassPhotoTile` `category` tiles (`lg`+: 6 across plus a "More" tile; `md`: 4 + 3; `base`: 2 columns) (`mobbin-standard-pass §2 rule 9`). Order follows `FD §3`: Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, then "More" which expands in place (inline `Collapsible`) to show Recovery and Youth. All eight links stay in the DOM.
- **Copy per tile:** one-word label under the photo; inside the caption band: category icon + name, "12 classes this week". Below the row, the detail list (name · one line · count · intensity range · three example class names) appears as a text list for all eight so each tile has context:
  - Strength — "Build the base." · 4 classes · intensity 2–5 · "Rib Rack Strength, Barbell Basics, Kettlebell Flow"
  - Cycle — "Ride the hills." · 3 classes · intensity 2–5 · "Climb Cycle, Rhythm Ride, Endurance 60"
  - Conditioning — "Work hard, then stop." · 3 classes · intensity 3–5 · "Switchback HIIT, Canal Run Club, Bootcamp"
  - Mind & Body — "Move slow, breathe well." · 4 classes · intensity 1–3 · "Desert Flow Yoga, Mat Pilates, Mobility 30"
  - Aqua — "Water does half the work." · 4 classes · intensity 1–4 · "Lap Swim, Aqua Fit, Swim School"
  - Court — "Play more than you plan." · 4 classes · intensity 2–4 · "Pickleball Open Play, Clinic, Tennis Drills"
  - Recovery — "Rest is a skill." · 3 classes · intensity 1 · "Stretch & Release, Sauna + Plunge, Compression"
  - Youth — "AGES 6 MO–17" chip · 3 classes · intensity 1–4 · "Kids Club, Teen Strength, Junior Pickleball" (`mobbin-standard-pass §2 rule 17`)
- **Imagery:** `IMG-CAT-{slug}` 4:5. Shared tile: `CategoryBadge` `solid` top-left, solid Saguaro Night caption band at 80%. No tint over faces.
- **Components:** `ClassPhotoTile` (`category`), `CategoryBadge`, `IntensityRibs` (range), Graphical `Collapsible`.
- **Interaction:** Tile → category landing. "More" toggles and moves focus to the first revealed tile.
- **States / Responsive:** Static.

```
 +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+
 |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |[4:5]   | |  More  |
 |(b)     | |(bike)  | |(timer) | |(flower)| |(waves) | |(court) | |  +2    |
 |=band===| |=band===| |=band===| |=band===| |=band===| |=band===| |        |
 +--------+ +--------+ +--------+ +--------+ +--------+ +--------+ +--------+
  Strength   Cycle     Condition. Mind&Body   Aqua      Court       More
 (More opens: Recovery, Youth [AGES 6 MO-17])
```

### 4.3 Intensity guide (`IntensityGuide`)
- **Grid:** `surface-muted` band. Five columns (span 2 each plus gap) at `lg`+, a vertical list at `base`.
- **Copy:** Eyebrow "How hard is it?" · H2 "Five ribs. Five efforts." Row for each level with `IntensityRibs` (large) and name/example: 1 Easy — "You can chat. Mobility 30, Aqua Fit." · 2 Light — "A gentle sweat. Desert Flow Yoga." · 3 Moderate — "You can say a short sentence. Rhythm Ride." · 4 Hard — "Words are hard. Climb Cycle." · 5 All-out — "Short bursts, big rest. Switchback HIIT." Footnote: "Not sure? Start at 2 or 3. Your coach will adjust."
- **Components:** `IntensityRibs` (size `l`), `RibMeter` (decorative axis).
- **Interaction:** Each level is a button that filters 4.4 to that intensity (Graphical `Toggle`s in a `ToggleGroup`, single select). Pressed state: `primary-subtle` fill and `primary` border.
- **States / Responsive:** Static data. `base`: vertical list; ribs left, text right.

```
 HOW HARD IS IT?    Five ribs. Five efforts.
 |....   |||..   |||..   ||||.   |||||
 1 Easy  2 Light 3 Moderate 4 Hard 5 All-out
 You can chat ...                       [click to filter]
```

### 4.4 All classes grid (`ClassCard` variant `card`)
- **Grid:** Filter row span 12; grid of `ClassCard`s in the `thumb-left` marketing variant (square 96×96 photo at the left, bold class name, club or studio line, `IntensityRibs`; no rating line because there are no public ratings; `mobbin-standard-pass §2 rule 8`), 3 per row at `lg`+ (span 4), 2 at `md`, 1 at `base`. 12 cards first, then "Show all 28" (`Show more`, not pagination).
- **Filter row (`MM §3 r17`, six or fewer categories):** Graphical `Tabs` — "All" · Strength · Cycle · Conditioning · Mind & Body · Aqua · "More" (Graphical `Menu`: Court, Recovery, Youth). Plus `Select` "Intensity" (any, 1–2, 3, 4–5) and `Switch` "Good for first-timers".
- **Card copy:** `CategoryBadge`; class name (`l`); one-line description (≤120 chars); duration; `IntensityRibs` with label; "Good for first-timers" flag (icon + words); where it runs ("All 5 clubs" or club chips); next time at your club ("Next: Today 6:00 a.m.") if known. Button: ghost "See class". Example (Climb Cycle): "Cycle · Climb Cycle · Rolling hills on a bike. Heavy resistance, seated and standing. · 45 min · Hard (4 of 5) · Good for first-timers: Yes, with a bike set-up · All 5 clubs · Next: Today 6:00 a.m."
- **Imagery:** `IMG-CLASS-{slug}` 4:3, real class photo (`ClassPhotoTile` inside the card).
- **Components:** `ClassCard` (`card`), `CategoryBadge`, `IntensityRibs`, `InstructorChip` (lead coach, 40 px avatar), Graphical `Tabs`, `Menu`, `Select`, `Switch`.
- **Interaction:** Filters update the grid in place (no page load), keep scroll position, and update the URL. Tab arrow keys switch categories. Card → `/classes/[slug]`.
- **States:** Zero results: `EmptyState` "No classes match. Try intensity 3 or remove 'first-timers'." Button "Clear filters". Loading (client filter): none (client-side filter on static data). Next-time line loads later; space reserved.
- **Responsive:** `base`: tabs scroll; card photo 4:3 on top.

```
 [All][Strength][Cycle][Conditioning][Mind & Body][Aqua][More v]   Intensity v   [ ] First-timers
 +----------------------+ +----------------------+ +----------------------+
 | [4:3 photo]          | | [4:3 photo]          | | [4:3 photo]          |
 | (bike) Cycle         | | (flower) Mind & Body | | (waves) Aqua         |
 | Climb Cycle          | | Desert Flow Yoga     | | Aqua Fit             |
 | Rolling hills on a   | | ...                  | | ...                  |
 | 45 min  ||||.  Hard  | | 60 min |.... Easy    | | 45 min ||... Light   |
 | (v) First-timers ok  | | (v) First-timers ok  | | (v) First-timers ok  |
 | All 5 clubs          | | All 5 clubs          | | 3 clubs              |
 | Next: Today 6:00 am  | |                      | |                      |
 +----------------------+ +----------------------+ +----------------------+
 [Show all 28]
```

### 4.5 First-timer shelf
- **Grid:** Rail of `ClassCard` variant `compact` (six cards), `surface-muted` band.
- **Copy:** Eyebrow "First time?" · H2 "Start here." · Lede "These classes say hello first." Cards: Barbell Basics, Desert Flow Yoga, Mat Pilates, Aqua Fit, Mobility 30, Rhythm Ride. Button: "Try one with a free 3-day pass" → `/trial`.
- **Components:** shadcn `carousel`, `ClassCard` (`compact`), Graphical `Button`.
- **States / Responsive:** As §1.5.

### 4.6 Tour band
`TourCTABand`: H2 "See a class before you sign up." Support "A tour includes a look into a live class. Ask the coach anything."

### 4.7 Category landing `/classes/category/cycle` (example)
**Purpose:** Rank for "[category] classes in Mesa and Gilbert" and give an in-category browse.
**Section order:** hero → class list → this week → coaches → FAQ → tour band.
- **Hero (grid: text span 7, photo span 5):** Breadcrumb Home › Classes › Cycle. `CategoryBadge` large (icon + "Cycle" in `FD §3` Saguaro `#2F5A45` on Sand pass check required in `05` §5; dark `#6FB08F`). H1 "Cycle classes." Lede "Three rides, five cycle studios. Pick a hill, a beat or a long road." Photo `IMG-CAT-cycle-HERO` 4:3 (cycle studio, riders, morning light through windows). Button (primary) "Book a free tour"; link "See all cycle times" → `/schedule?category=cycle`.
- **Class list:** `ClassCard` `card` ×3 in a row, with a one-line "Pick this if…" phrase: "Climb Cycle — Pick this if you like to push." "Rhythm Ride — Pick this if you like music." "Endurance 60 — Pick this if you like to settle in."
- **This week:** `ScheduleTeaser` locked to category=cycle, club = my club.
- **Coaches:** three `CoachCard`s who teach cycle.
- **FAQ:** "Do I need cycling shoes?" / "No. Our bikes have flat pedals on one side and clips on the other." (proposed) · "How do I set up the bike?" / "Arrive 10 minutes early. A coach sets the seat and handlebars with you." · "Can I book a specific bike?" / "Yes. Pick your bike in the app after you join."
- **Responsive / states:** As §4.4 and §1.6.

```
 Home > Classes > Cycle
 (bike) CYCLE                         +----------------------+
 Cycle classes.                       | IMG-CAT-cycle-HERO   |
 Three rides, five cycle studios...   +----------------------+
 [ Book a free tour ]   See all cycle times ->
 [Climb Cycle card] [Rhythm Ride card] [Endurance 60 card]
 THIS WEEK (cycle, your club)  ...   COACHES ...   FAQ ...
```

---

## 5. Class type detail `/classes/climb-cycle`

All 28 class types use this template. Worked example: **Climb Cycle**.
**Purpose:** Explain one class well enough that a visitor tries it.
**Primary question:** "What is this class like, is it for me, and when is it?"
**Persona focus:** Priya (cycles Saturdays), Daniel (checks intensity and warm-up), Maya (6:00 a.m.).
**Conversion:** `class_detail_open`, `schedule_book_click`, `trial_pass_issued`, `tour_started`.
**Section order:** 5.1 Class hero + facts · 5.2 What to expect · 5.3 Next sessions · 5.4 Where it runs · 5.5 Who teaches it · 5.6 Ideal for · 5.7 What to bring · 5.8 FAQ · 5.9 Related classes · 5.10 Tour band.

### 5.1 Class hero and facts (`ClassHero`)
- **Grid:** `lg`+: text span 7, photo span 5; below, an overview row span 12; sticky side card span 4 from 5.2 to 5.8 (`MM D3`, `MM C4`). `md` and `base`: no side card; the `BottomActionBar` shows "Book a free tour" and "See times".
- **Copy:**
  - Breadcrumb: Home › Classes › Cycle › Climb Cycle
  - `CategoryBadge`: icon + "Cycle"
  - H1: "Climb Cycle"
  - Lede (≤25 words): "Rolling hills on a bike. Heavy resistance, seated and standing climbs, and a long final push. You set the load."
  - Overview row with icons (`MM A4`, `MM C4`): **Duration** 45 min · **Intensity** `IntensityRibs` ||||. "Hard (4 of 5)" · **Level** "Good for first-timers: yes, with a bike set-up" · **Group size** "Up to 24 riders" · **Equipment** "Bike, water bottle, towel. Shoes optional."
  - Buttons (hero): "Book a free tour" (primary) and "See times" (outline, anchors to 5.3). Tertiary link "Try it with a free 3-day pass".
  - Side card: "Climb Cycle at your club" with the next session ("Today 6:00 a.m., Gilbert – Val Vista, 4 bikes left") and "Book a free tour" / "Try a free 3-day pass".
- **Imagery:** `IMG-CLASS-climb-cycle-HERO` 4:3. Riders from behind and the side, a coach's cue visible, morning light across the cycle studio. No grimaces (`BG §7`).
- **Components:** `ClassHero` composite (wraps `ClassPhotoTile`), `CategoryBadge`, `IntensityRibs`, `CapacityIndicator`, Graphical `Button`.
- **Interaction:** "See times" smooth-scrolls to 5.3. The side card's next session loads from the API.
- **States:** Next session loading: skeleton. None in the next 7 days: "No sessions in the next 7 days at your club. Pick another club." with a `ClubSwitcher` link.
- **Responsive:** `base`: photo first at 4:3; overview row becomes a 2-column grid of five items.

```
lg+
+-------------------------------------------------+ +-------------------------+
| Home > Classes > Cycle > Climb Cycle            | | [Next session]          |
| (bike) CYCLE                                    | | Today 6:00 a.m.         |
| Climb Cycle                                     | | Gilbert - Val Vista     |
| Rolling hills on a bike. Heavy resistance...    | | 4 bikes left            |
| [ Book a free tour ] [ See times ]              | | [ Book a free tour ]    |
| 45 min | ||||. Hard | First-timers ok | 24 | gear| | Try a free 3-day pass   |
+-------------------------------------------------+ +-------------------------+
| [ IMG-CLASS-climb-cycle-HERO 4:3 ]  (right column on lg+)                      |
```

### 5.2 What to expect (`ClassSteps`)
- **Grid:** Steps list span 7 at `lg`+, photo span 5 (`IMG-CLASS-climb-cycle-02` 3:2).
- **Copy:** H2 "What to expect." Steps (3–5): 1 "Arrive 10 minutes early. A coach sets your seat and handlebars." 2 "Warm up for 5 minutes. Easy spin, light load." 3 "Climb for 30 minutes. The coach calls out loads from 1 to 10. You pick yours." 4 "Cool down for 5 minutes. Stretch off the bike." 5 "Leave. Water is free at the studio door."
- **Components:** Ordered list with numbered 32 px circles; `ProgressRibs` as a decorative step meter (five ribs, one per step) — decorative, hidden from assistive tech.
- **States / Responsive:** Static; stacked at `base`.

```
 WHAT TO EXPECT                                   +----------------+
 (1) Arrive 10 minutes early. A coach sets ...    | IMG 3:2       |
 (2) Warm up for 5 minutes ...                    +----------------+
 (3) Climb for 30 minutes ...
 (4) Cool down ...   (5) Leave ...
```

### 5.3 Next sessions (`ScheduleTeaser` variant `class`)
- **Grid:** `surface-muted` band. Filter row span 12 (club select, day strip). List span 8 at `lg`+ (rows), span 12 at `base`.
- **Copy:** H2 "When it runs." Lede "All 5 clubs have a cycle studio. Pick a club." Rows are `ClassCard` `schedule-row` with club name in each row when "All clubs": "Tue 6:00 a.m. · Gilbert – Val Vista · Marisol V. · Studio C · 4 bikes left [Book]". Link: "Open the full schedule for Climb Cycle" → `/schedule?class=climb-cycle`.
- **Components:** `ScheduleDayStrip`, `ClassCard` (`schedule-row`), `BookingStateButton`, `InstructorChip`, `CapacityIndicator`, `ClubSwitcher` (select form), `EmptyState`.
- **Interaction / States:** As §1.6. Empty day: "No Climb Cycle on Sunday at Mesa – Downtown. Try Saturday." Waitlist state when full.
- **Responsive:** As §1.6.

```
 WHEN IT RUNS            Club: [All clubs v]
 [Tue][Wed][Thu][Fri][Sat][Sun][Mon]
 6:00 am Gilbert-Val Vista  (MV) Studio C  4 bikes left   [Book]
 6:00 am Mesa-Dobson        (TN) Cycle     Open           [Book]
 ...
 Open the full schedule for Climb Cycle ->
```

### 5.4 Where it runs (`ClubChips` row)
- **Grid:** Row of five `ClubCard` `compact` (span 2.4 → use a 5-column strip at `lg`+, 2×3 grid at `md`, 1 column list at `base`).
- **Copy:** H2 "Five clubs, one class." Each card: club name, studio name ("Cycle studio"), next time ("Tomorrow 6:00 a.m."). Link: "Tour this club" ghost.
- **Components:** `ClubCard` (`compact`), `AmenityChip`.
- **States / Responsive:** Next time loads late; reserve space.

### 5.5 Who teaches it (coaches)
- **Grid:** Three `CoachCard` `compact` (span 4).
- **Copy:** H2 "Your coaches." Names: Marisol Vega (Val Vista, Dobson), Tess Nakamura (Red Mountain), Devon Hart (Heritage, Downtown). One line each: favourite song, or a cue they use: "Cue: 'Quiet hands, strong legs.'" (proposed).
- **Components:** `CoachCard` (`compact`), `InstructorChip`.
- **States / Responsive:** As §1.9.

### 5.6 Ideal for (`MM P6` pattern)
- **Grid:** Two cards, span 6 each.
- **Copy:** Card A "Good for you if…" — "You like to push against a load." "You want a leg day that is not a lift." "You like a coach calling the hills." Card B "Maybe pick another class if…" — "You want a quiet class. Try Mobility 30 or Desert Flow Yoga." "You have a knee or hip concern. Ask a coach first. Endurance 60 is lighter." "You want music-led rides. Try Rhythm Ride."
- **Components:** `.cp-card` surfaces; Lucide `Check`, `ArrowRight`; link chips `ClassCard` `compact`.
- **States / Responsive:** Stacked at `base`.

### 5.7 What to bring and what we provide
- **Grid:** Two-column definition list.
- **Copy:** Bring: "Water bottle, towel, shoes you can walk in." Provided: "Bikes, shoe rental with clips (free), towels for Summit members, lockers." (Shoe rental proposed.)
- **Components:** Lucide icon rows. **States:** static.

### 5.8 FAQ (class-specific)
- **Copy:** "Is Climb Cycle good for a first ride?" / "Yes. Tell the coach it is your first class. Pick a load of 3 or 4." · "Can I take it with a bad knee?" / "Talk to a coach before class. Choose a lighter load and stay seated." · "How long is it?" / "45 minutes. Arrive 10 minutes early." · "Can I cancel?" / "Free up to 2 hours before. After that it counts as a late cancel." (`FD §3`)
- **Components:** `FAQAccordionSection`.

### 5.9 Related classes
- **Grid:** Three `ClassCard` `compact`. **Copy:** H2 "If you like Climb Cycle." Cards: Rhythm Ride, Endurance 60, Switchback HIIT.

### 5.10 Tour band
`TourCTABand`: H2 "Try Climb Cycle free." Support "Book a tour or a 3-day pass. Ask for a bike set-up." Buttons as §1.13.

---

## 6. Schedule `/schedule` (public, filterable)

**Purpose:** Show every class at every club, this week, and hand the visitor to sign-in or a pass to book.
**Primary question:** "What classes are on, when, and can I get in?"
**Persona focus:** Maya (6:00 a.m.), Priya (waitlist), Ron and Linda (Aqua Fit, pickleball).
**Conversion:** `schedule_book_click`, `schedule_handoff_login`, `trial_pass_issued`.
**Section order:** 6.1 Header and club select · 6.2 Filters · 6.3 Day strip · 6.4 Class list or week grid · 6.5 Class detail panel · 6.6 Book handoff dialog · 6.7 Page footer notes.
Rendering: server-rendered shell with the filters and static copy; the list loads on the client (SSR shell, CSR data; SEO value comes from the class pages and club schedule landing text).

### 6.1 Header and club select
- **Grid:** Span 12; H1 left, view toggle right.
- **Copy:** H1 "Class schedule." Lede "All 5 clubs, this week. Members book in the app. Not a member? Try a free 3-day pass." Club select (Graphical `Select`): "All clubs" + five clubs (default: my club; `MM` n/a, from `01` §7). Time-zone chip above the list: "Arizona time (no daylight saving)" (`MG` web rule 26).
- **Components:** Graphical `Select`, `ToggleGroup` (single) "List | Week" (Week disabled on `base`–`md` and when "All clubs" is selected, helper "Pick one club to see the week grid"), `ClubSwitcher` (shared logic).
- **States:** Club unknown → "All clubs".

```
 Home > Schedule
 Class schedule.                                          Club [Gilbert - Val Vista v]
 All 5 clubs, this week. Members book in the app...       View [List|Week]  Arizona time
```

### 6.2 Filters (`ScheduleFilters`)
- **Grid:** Row below the header; sticky under the main header at `lg`+ (top 64 px), span 12.
- **Copy:** Chips and controls: **Category** (multi-select `ToggleGroup`: Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, Recovery, Youth — eight chips, each with icon; at `base` it opens a `Drawer` "Filters"), **Time** (Early before 7 a.m. · Morning · Midday · Evening), **Intensity** (`IntensityRibs` picker, range 1–5), **Coach** (`Combobox`), **Good for first-timers** (`Switch`), **Spots available** (`Switch`). Result count: "38 classes". "Clear filters".
- **Components:** `ScheduleFilters` (shared) composed of Graphical `ToggleGroup`, `Combobox`, `Switch`, `Drawer`, `Slider` (intensity range, two thumbs).
- **Interaction:** Filters apply instantly. URL sync (`01` §4). Keyboard: all controls tabbable; the intensity slider uses arrow keys with value text "Intensity 2 to 4".
- **States:** Zero results → 6.4 empty state. Combobox loading coaches: skeleton option.
- **Responsive:** `base`: one "Filters (2)" button opens a `Drawer` from the bottom; filter groups stack; "Show 12 classes" button at the bottom applies.

```
 [Cycle x][Aqua x]  Time v  Intensity |||..-||||. v  Coach v  [ ]First-timers [ ]Spots
 38 classes                                                                 Clear filters
```

### 6.3 Day strip (`ScheduleDayStrip`)
- **Grid:** Span 12, 7 chips (today selected by default, `MM §3 r16`). Chip: weekday over date (`MG` iOS rule 8, adapted), count of classes ("12 classes"). Past days are not shown. Labels 14 px or larger.
- **Copy:** "Tue 27" "12 classes". A note on the last chip: "Members book 7 days ahead. Summit: 9."
- **Interaction:** Click or arrow keys select a day; `aria-pressed`. Today stays labelled "Today".
- **States:** A day with no classes (holiday): chip shows "Closed hours" and selecting it shows one empty state. Do not repeat "Unavailable" in each cell (`MM §4`).

```
 [ Today 27 ][ Wed 28 ][ Thu 29 ][ Fri 30 ][ Sat 31 ][ Sun 1 ][ Mon 2 ]
   12 classes   14 classes ...
```

### 6.4 Class list (`ClassCard` variant `schedule-row`) and week grid (`ScheduleWeekGrid`)
**List view (default):**
- **Grid:** Rows span 12. Groups by time of day with sticky small headings ("Early · before 7 a.m.", "Morning", "Midday", "Evening"). Row columns at `lg`+ follow the shared reading order time, title, instructor, spots, action (`mobbin-standard-pass §2 rule 61`; time bold with duration in grey below, `rule 38`): time/duration (span 2), class + `CategoryBadge` + room (span 3), `InstructorChip` 40 px avatar + name (span 2), club (span 1, shown when "All clubs"), `IntensityRibs` + label (span 1), `CapacityIndicator` (span 1), `BookingStateButton` (span 2). The instructor name keeps sentence case (rule 38 capitals not used).
- **Row copy example:** "6:00 a.m. · 45 min | (bike) Climb Cycle · Cycle · Studio C | (MV) Marisol V. | Gilbert – Val Vista | ||||. Hard | 4 bikes left | [Book]". Spots-left text only when 5 or fewer (`MM §3 r15`); a full class shows "Full" with `BookingStateButton` "Join waitlist" and a line "3 on the waitlist" (when known).
- **BookingStateButton states for signed-out visitors:** `Book` (primary, only one primary per viewport row group? Each row carries an outline `Book` button; the page has no filled copper rows. Deviation from `MM C1` "Book pill": Book buttons are `outline` so that the filled copper stays rare; the dialog's first action is filled). States: `Book`, `Join waitlist`, `Full · waitlist closed` (disabled, within 1 hour of start), `Started` (disabled, hidden by default), `Booked` (signed-in members, check icon), `Waitlisted` (signed-in).
- **Week view:** `ScheduleWeekGrid`, `lg`+ only and a single club. Hour rows on the left (6 a.m.–9 p.m.), seven day columns (`MG` web rules 25, 26). Time-zone chip above day headers. Class block: 4 px left edge in category colour, category icon, class name, time, coach initials, spots only when ≤5. Block min height 48 px (45-minute class). Overlaps stack into sub-columns. Today's date in a filled circle. Click opens 6.5.
- **Imagery:** None in rows (density). Instructor avatar only (`MM S-2`). Photos appear in 6.5.
- **Components:** `ClassCard` (`schedule-row`), `ScheduleWeekGrid`, `BookingStateButton`, `CategoryBadge`, `InstructorChip`, `IntensityRibs`, `CapacityIndicator`, Graphical `Tooltip` (week block hover/focus), `ScrollArea`.
- **Interaction:** Row title opens 6.5. `BookingStateButton` → 6.6 (signed out) or handoff (signed in). Keyboard: rows are in a list (`role="list"`); each row's controls are tabbable in logical order.
- **States:**
  - Loading: six skeleton rows; day strip counts show a dash.
  - Empty (filters): `EmptyState` "No classes match those filters on Tuesday." Actions: "Clear filters" (outline), "See Wednesday" (ghost).
  - Empty (day): "No classes today. The club is open 6:00 a.m.–12:00 p.m." (holiday).
  - Error: "We couldn't load the schedule. Try again, or call your club at (480) 555-0142." Button "Try again". Static link list of class types stays visible.
  - Stale (no network): Toast "You're offline. Times may be out of date." with last updated time.
- **Responsive:** `base`: rows become two-line cards (time + class + button; then coach, ribs, spots). Week view hidden. `md`: columns drop club and `CategoryBadge` text (icon stays).

```
 TODAY
 EARLY - before 7 a.m.
 +--------------------------------------------------------------------------------------+
 | 6:00 am | (bike) Climb Cycle     | (MV) Marisol V. | Gilbert-Val V. | ||||. | 4 left   |
 | 45 min  | Cycle . Studio C       |                 |                | Hard  | [ Book ] |
 +--------------------------------------------------------------------------------------+
 | 6:00 am | (waves) Lap Swim       | Self-guided     | Gilbert-Val V. | |....| Open     |
 +--------------------------------------------------------------------------------------+
 | 6:15 am | (flower) Mat Pilates   | (IB) Imani B.   | Mesa-Dobson    | ||... | Full     |
 |         |                        |                 |                |       |[Waitlist]|
 +--------------------------------------------------------------------------------------+

 Week view (lg+, one club)
          Tue 27   Wed 28   Thu 29   Fri 30   Sat 31   Sun 1   Mon 2
 6 am   | [Climb] | [Lap]   | [Climb] | ...
 7 am   | [Yoga]  |         | ...
```

### 6.5 Class detail panel (`ClassDetailPanel`)
- **Grid:** Graphical `Drawer`, side `right` at `lg`+ (width 480 px), bottom sheet at `base`–`md` (85% height). Opens from a row or week block.
- **Copy:** Solid hero band with instructor and time, no gradient (`mobbin-standard-pass §2 rule 39`), then a stats row of three with small-capitals labels: DURATION · INTENSITY · SPOTS (`mobbin-standard-pass §2 rule 56`). Photo `IMG-CLASS-{slug}` 3:2 · `CategoryBadge` · class name · "Tue, Oct 27, 6:00–6:45 a.m." · club + room · `InstructorChip` with coach name and link to `/coaches/[slug]` · `IntensityRibs` "Hard (4 of 5)" · description (≤60 words) · "What to bring" · cancellation line "Cancel free up to 2 hours before." · `CapacityIndicator` · actions: `BookingStateButton` (filled in the panel), "View class page" (ghost) → `/classes/[slug]`, "Add to calendar" is not shown (needs booking).
- **Components:** `ClassDetailPanel` (shared), Graphical `Drawer`, `Button`.
- **Interaction:** Focus trapped; `Esc` closes; URL hash `#session=ID` makes it linkable and restores on load. Focus returns to the opening row.
- **States:** Session removed (cancelled class): panel text "This class was cancelled. See other times." with a link to the same class's next sessions.
- **Responsive:** Bottom sheet has a drag handle and a visible close button.

```
 +------------------------------+
 | [photo 3:2]                  [x]
 | (bike) CYCLE                 |
 | Climb Cycle                  |
 | Tue, Oct 27, 6:00-6:45 a.m.   |
 | Gilbert - Val Vista, Studio C|
 | (MV) Marisol Vega            |
 | ||||. Hard (4 of 5)          |
 | Rolling hills on a bike...   |
 | 4 bikes left                 |
 | [ Book ]   View class page   |
 +------------------------------+
```

### 6.6 Book handoff dialog
- **Grid:** Graphical `Dialog`, 440 px wide; full-screen sheet at `base`.
- **Copy:** Title "Sign in to book." Body (shows the chosen class): "Climb Cycle · Tue, Oct 27, 6:00 a.m. · Gilbert – Val Vista". Buttons: "Sign in" (primary, → `app…/login?next=/book/{sessionId}`) · "New here? Try a free 3-day pass" (outline, → `/trial?club=…&session=…`) · text link "Join Cactus Peak" (→ `/join?club=…`). Footer line: "Members book up to 7 days ahead. Summit members book 9."
  Waitlist variant: Title "Sign in to join the waitlist." Body adds "We will text you if a spot opens. You have 30 minutes to confirm."
- **Components:** `Dialog`, `BookingStateButton` (source), Graphical `Button`.
- **Interaction:** Choosing any button logs `schedule_handoff_*`. Focus lands on the title; `Esc` closes. The selected session is kept in `sessionStorage` so a return from sign-in restores the filters.
- **States:** Session no longer available: "That class just filled." + "See similar classes" (closes dialog and applies a filter).
- **Responsive:** Full screen at `base` with a sticky bottom action area.

```
 +-----------------------------------------+
 | Sign in to book.                    [x] |
 | Climb Cycle . Tue, Oct 27, 6:00 a.m.     |
 | Gilbert - Val Vista                     |
 | [        Sign in         ]              |
 | [ New here? Try a free 3-day pass ]     |
 | Join Cactus Peak                        |
 | Members book 7 days ahead. Summit: 9.   |
 +-----------------------------------------+
```

### 6.7 Notes under the list
- **Copy:** "Cancel free up to 2 hours before. Late cancels count as a strike. Three strikes in 30 days pause booking for 3 days." (`FD §3`). "Waitlists move up until 1 hour before class." Link: "Read the booking rules" → `/faq#booking`.
- **Components:** Plain text in `s`, `text-muted` (≥ 4.77:1).

---

## 7. Membership `/membership`

**Purpose:** Show plans and prices clearly and lead to a tour, a pass or a join.
**Primary question:** "What does it cost and which plan is mine?"
**Persona focus:** Priya (fast join), Maya (family), Ron and Linda (couple).
**Conversion:** `plan_card_join_click`, `join_started`, `tour_started`.
**Rules applied:** three tiers, middle raised with "Most popular" (`MM §3 r18`); six or fewer features per card (`r20`); "Best for" line (`r21`); the full comparison below the cards (`r20`, `MM P4`); a page, not a modal, for plan choice (`MM §4`); no monthly/yearly toggle (no yearly price, `01` §10 issue 2).
**Section order:** 7.1 Header and plan cards · 7.2 Fees and terms line · 7.3 Family calculator · 7.4 Day pass and guest strip · 7.5 Comparison table · 7.6 Add-ons (personal training, towel) · 7.7 FAQ · 7.8 Tour band.

### 7.1 Header and plan cards (`PlanCardsSection`)
- **Grid:** Header span 8. Cards as in §1.8 (span 4 each, Ridge raised). Padding top 32 px.
- **Copy:** H1 "Pick your pace." Lede "Month to month. No contract. Cancel or freeze with 30 days' notice." Cards as §1.8, with the "my club" line on Trailhead: "Your club: Gilbert – Val Vista." (if known, else "You pick one home club."). Under the cards: "Not sure? Try a free 3-day pass" (ghost) and "Book a free tour" (outline).
- **Components:** `PlanCard` (`highlighted`), `RibMeter` (static 1/3/5), Graphical `Button`.
- **Interaction:** Cards link to `/join/plan?plan=slug`. Anchors: `#plans`.
- **States:** Static (CMS). **Responsive:** Ridge first at `base`/`md`.

### 7.2 Fees and terms line
- **Grid:** Span 12 under the cards, `s` text, `surface` card with `Info` icon.
- **Copy:** "Enrollment is $0 through Nov 30 (otherwise $49). A $49 annual facility fee is charged in March. Cancel or freeze with 30 days' notice. Freeze costs $10 a month for 1 to 3 months." Link: "Read the membership agreement" → `/legal/membership-agreement`.
- **Why here:** Costs are visible next to the prices (trust). `MM TC5` terms in small text.

### 7.3 Family calculator (`FamilyCalculator`)
- **Grid:** `surface-muted` band; left (controls) span 6, right (result card) span 6. Anchor `#family`.
- **Copy:** Eyebrow "Family" · H2 "Add the whole family." Lede "Family members get the same access as the main member's plan. Kids club is included for children 12 and under. Teens 13 to 17 follow the teen rules." Controls: radio cards for base plan (Trailhead, Ridge, Summit); `NumberField` "Adults to add ($39 each)" 0–4; `NumberField` "Children, 6 months–17 ($19 each)" 0–6. Result card: "Ridge + 1 adult + 2 children" · line items "$79 + $39 + $38" · **"$156 a month"** (`data-l`) · "Month to month." · button "Join with this family" → `/join/plan?plan=ridge&adults=1&children=2`.
- **Components:** Graphical `RadioGroup`, `NumberField`, `Button`; `FamilyCalculator` composite (client).
- **Interaction:** Totals update live (`aria-live="polite"` on the result). Defaults: Ridge, 0 adults, 0 children = $79.
- **States:** Limits message: "Need more than 4 adults or 6 children? Call us." Error: none (pure client math).
- **Responsive:** Stacked at `base`; result card first on `base` (sticky bottom summary not needed).

```
 FAMILY   Add the whole family.
 Plan ( ) Trailhead (o) Ridge ( ) Summit        +--------------------------+
 Adults +$39   [-] 1 [+]                         | Ridge + 1 adult + 2 kids |
 Children 6mo-17 +$19 [-] 2 [+]                   | $79 + $39 + $38          |
                                                 | $156 a month             |
                                                 | [ Join with this family ]|
                                                 +--------------------------+
```

### 7.4 Day pass and guest strip
- **Grid:** Two bordered cards side by side (span 6). Anchor `#day-pass`.
- **Copy:** Card 1 "Just visiting? Day pass $20." "One visit, one club. Pay at the desk or online." Button (outline) "Buy a day pass" → app web checkout (handoff). Card 2 "Bringing a friend?" "Ridge includes 1 guest pass a month. Summit includes 4. A guest is 18 or older, or 16–17 with a guardian waiver. A pass is valid for 14 days, for one visit at one club." Link: "Guest policy" → `/legal/guest-policy`. Note: "Prefer a free try? Take the 3-day pass."
- **Pattern:** `MM P5` row below tiers for special needs.
- **Components:** `.cp-card`, Graphical `Button`.

### 7.5 Comparison table (`PlanComparisonTable`)
- **Grid:** Span 12. Anchor `#compare`. 12 rows or fewer (`MM §4` "15 or more").
- **Copy:** H2 "Every detail." Rows: Home club or all clubs · Group classes · Pools · Courts (3 days ahead) · Booking window · Guest passes a month · Recovery suite · Towel service · PT intro session · Family add-on · Kids club for children · Freeze option. Cells use check, dash and a short qualifier: Booking window "7 days / 7 days / 9 days". Guest passes "— / 1 / 4". Courts "— / Included / Included". Recovery "— / — / Included". PT intro "— / — / 1 a quarter". Freeze "$10/mo for 1–3 months" in all three.
- **Components:** `PlanComparisonTable` (shared; shadcn `table` base), Lucide `Check`/`Minus`, sticky header with plan names and price. Highlight column Ridge (`primary-subtle` at 40%).
- **Interaction / Responsive:** `lg`+: sticky thead below the header. `base`: the table turns into three `Accordion` sections, one per plan, listing only what is included, with a "Compare plans" toggle for the full table on `md`. Each check has an accessible name ("Included"), each dash "Not included".

```
                      Trailhead   Ridge (Most popular)   Summit
 Clubs                1 home      All 5                  All 5
 Group classes        At home     All                    All
 Courts (3 days)      -           Included               Included
 Booking window       7 days      7 days                 9 days
 Guest passes / mo    -           1                      4
 Recovery suite       -           -                      Included
 Towel service        -           -                      Included
 PT intro / quarter   -           -                      1
```

### 7.6 Add-ons
- **Grid:** Two cards: Personal training packs, Kids club. Span 6 each.
- **Copy:** PT: "Personal training. Packs of 4, 8 or 12 sessions with a coach you pick." "From $61 a session in a 12-pack. Single sessions $75." Link "See personal training" → `/personal-training`. Kids club: "Kids club is included for children on a family add-on." Link "See kids and family" → `/kids`.
- **Components:** `.cp-card`, `Button` ghost.

### 7.7 FAQ
`FAQAccordionSection` with the "Memberships" group: "Can I cancel any time?" / "Yes, with 30 days' notice. There is no contract." · "What is the facility fee?" / "$49 once a year, charged in March." · "What does freeze cost?" / "$10 a month for 1 to 3 months." · "Can I switch plans?" / "Yes. Change in the app. The new price starts on your next bill." (proposed) · "Do kids need their own plan?" / "No. Add children for $19 a month each."

### 7.8 Tour band
`TourCTABand`: H2 "Still deciding? Come see it." Buttons: "Book a free tour", "Try a free 3-day pass".

---

## 8. Join flow `/join` (six-step checkout)

**Purpose:** Let a visitor become a member in about three minutes, with no surprises.
**Primary question:** "How do I join, and what exactly will I pay today?"
**Conversion:** `join_started` → `join_step_complete` (×5) → `join_completed`.
**Steps:** 1 Plan → 2 Home club → 3 Member details → 4 Family → 5 Payment → 6 Confirmation.

### 8.0 Flow shell
- **Routes:** `/join` (redirects to the first incomplete step) · `/join/plan` · `/join/club` · `/join/details` · `/join/family` · `/join/payment` · `/join/confirmed`. Each step is its own URL (back button works; analytics per step). All are `noindex`.
- **Header:** `MinimalCheckoutHeader` (`02-navigation.md` §3.8): logo, "Need help? (480) 555-0100", "Save and exit".
- **Step indicator (`JoinStepper`):** Graphical `Progress` bar (5 segments; the confirmation is not a step) + text "Step 2 of 5: Home club". Completed steps are links (back only). Uses `ProgressRibs` as the segment motif (five ribs = five steps; filled left to right, copper for completed; each rib has an accessible text label).
- **Layout (`lg`+):** Form column span 7 (starts at column 1, max 640 px), order summary span 5 (sticky `top: 88px`, `surface` card). Page background `background`. `md`: summary above the form as a collapsed `Collapsible` ("Order summary · Ridge · $79 a month ▾"). `base`: the same collapsed summary at the top; the **Continue** button sits in a sticky bottom bar with the running total at the left ("$79 today").
- **Order summary (`JoinOrderSummary`):** Title "Your plan". Lines: plan name and price; home club; "Family add-ons" lines; "Enrollment" ($0 with "Fall climb" tag, or $49); "Today" total; below, a line "Then $79 a month on the 27th." and "Annual facility fee: $49 in March." The summary updates with each choice. Button "Edit" per line goes back to that step.
- **State:** Server-side cart (`cpa_join` cookie, 7 days, `HttpOnly`) stores plan, club, details, family. Card data never touches our servers (hosted fields, §8.5). "Save and exit" shows a `Dialog` "Save your progress?" asking for an email (if missing) and sends a resume link. Inactivity for 30 minutes: banner "Still there? Your plan is saved." (no data loss).
- **Global errors:** Network error: banner above the form "We could not save that step. Check your connection and try again." Form errors: summary at the top (`role="alert"`) with links to each field, plus inline messages. Messages say what happened and what to do (`BG §8`).
- **Promo handling:** If a `Promo` ends during the flow: banner "The Fall climb offer ended. Enrollment is now $49." Totals update. Never silently change the price.
- **No marketing distractions:** No promo bar, no nav, no footer links except legal.

### 8.1 Step 1 — Plan `/join/plan`
- **Question:** "Which plan?"
- **Copy:** H1 "Choose your plan." Lede "Month to month. Change it any time." Three selectable plan cards (`PlanCard` variant `select`) inside a Graphical `RadioGroup`: Trailhead $54, Ridge $79 (badge "Most popular", preselected unless `?plan=`), Summit $129. Each card shows "Best for" and four key points. Link under cards: "Compare every detail" opens a `Dialog` containing `PlanComparisonTable` (not a page change). Button: "Continue" (primary). Secondary: "Not ready? Book a free tour" and "Try a free 3-day pass".
- **Components:** Graphical `RadioGroup`/`Radio`, `PlanCard` (`select`), `Dialog`, `Button`.
- **Validation:** One plan must be chosen (default exists, so the error cannot occur except when JS fails; then the server returns to this step with "Choose a plan to continue.").
- **States:** Billing plan fetch fails: "We could not load prices. Try again, or call member services at (480) 555-0100." + Try again.
- **Responsive:** Cards stack; selected card has a 2 px `primary` border and a check icon (not colour alone).

```
 Step 1 of 5: Plan   [#][ ][ ][ ][ ]
 Choose your plan.                                   +------------------+
 ( ) Trailhead  $54/mo   Best for: one club          | Your plan        |
 (o) Ridge      $79/mo   MOST POPULAR                | Ridge     $79/mo |
 ( ) Summit     $129/mo  Best for: recovery          | Enrollment    $0 |
 Compare every detail                                | Today       $79  |
 [ Continue ]    Book a free tour                    +------------------+
```

### 8.2 Step 2 — Home club `/join/club`
- **Question:** "Which club will you start at?"
- **Copy:** H1 "Pick your home club." Lede for Ridge and Summit: "Your home club is where you start. You can train at all 5." Lede for Trailhead: "Trailhead works at one club. Pick the one that has what you need." Club options: `ClubCard` `list-row` radios (photo 4:3, name, address, status, amenity chips, distance if known). Prefilled with "my club". Warning chip (Trailhead only) on a club without a pool: "No pool at this club." (`warning` icon + text). Buttons: "Back" (ghost), "Continue" (primary).
- **Components:** Graphical `RadioGroup`, `ClubCard` (`list-row`), `ClubMap` (small, collapsible "Show map"), `AmenityChip`.
- **Validation:** One club required. "Pick a home club to continue."
- **Responsive:** List only; map hidden behind a toggle.

```
 Step 2 of 5: Home club
 Pick your home club.   Your home club is where you start. You can train at all 5.
 (o) [pic] Gilbert - Val Vista   1.7 mi  * Open  [Pool][Courts][Kids club]
 ( ) [pic] Gilbert - Heritage    4.2 mi  ...
 ...                                   [ Back ]  [ Continue ]
```

### 8.3 Step 3 — Member details `/join/details`
- **Question:** "Who are you?"
- **Fields (`Field` + `Input`; label above, help below, error below; 44 px; 16 px text):**

| Field | Type / autocomplete | Rules | Error text |
|---|---|---|---|
| First name | text, `given-name` | Required, 1–50 chars | "Enter your first name." |
| Last name | text, `family-name` | Required | "Enter your last name." |
| Email | email, `email` | Required, valid format | "Enter an email like name@example.com." |
| Mobile phone | tel, `tel` | Required, 10 US digits; formats on blur | "Enter a 10-digit mobile number." |
| Date of birth | three fields (month select, day, year) or `DateField`; `bday` | Required; age 18 or older | "Members must be 18 or older. Add younger family members in the next step." |
| ZIP code | text, `postal-code` | Required, 5 digits | "Enter a 5-digit ZIP code." |

  Optional, collapsed under "Add an emergency contact" (`Collapsible`): name and phone. "You can add this later in the app."
  Consent block: Checkbox "Text me reminders about my classes and tours" (unchecked by default), with link to `/legal/sms-terms`. Checkbox "Email me news and offers" (unchecked by default).
  Promo code: text link "Have a promo code?" opens a single `Input` + "Apply".
- **Copy:** H1 "Tell us about you." Lede "We use this to set up your membership. We do not sell your information." Link: "Privacy policy". Existing email: if the email already has an account, inline message "You already have an account with this email. Sign in to continue." + button "Sign in" (→ `app…/login?next=/join/resume`).
- **Components:** Graphical `Form`, `Field`, `Fieldset`, `Input`, `Checkbox`, `Collapsible`, `Button`. Phone masks use `inputmode="tel"`. Autocomplete attributes support WCAG 1.3.5.
- **Interaction:** Validation on blur and on submit. On submit with errors, focus moves to the error summary. Server checks the email for duplicates on blur (debounced).
- **States:** Saving: Continue shows a spinner and "Saving…". Server error: banner. Duplicate email: described above.
- **Responsive:** Single column; first and last name stack at `base`, side by side at `md`+.

```
 Step 3 of 5: Your details
 Tell us about you.
 First name [________]  Last name [________]
 Email [______________________]
 Mobile phone [__________]   (help: We text only if you say yes.)
 Date of birth [Month v][Day][Year]    ZIP [_____]
 > Add an emergency contact
 [ ] Text me reminders about my classes and tours
 [ ] Email me news and offers          Have a promo code?
 [ Back ]  [ Continue ]
```

### 8.4 Step 4 — Family `/join/family`
- **Question:** "Is anyone joining with you?"
- **Copy:** H1 "Add your family." Lede "Same access as your plan. Kids club is included for children 12 and under. Teens 13 to 17 follow the teen rules." Segmented choice (Graphical `ToggleGroup`, single): "Just me" (default) · "Add family". If "Add family": repeating `Fieldset` blocks. **Adult** (+$39 a month): first name, last name, email, date of birth (18+). **Child** (+$19 a month): first name, last name, date of birth (age 6 months–17), "Needs kids club?" (checkbox, shown for ages 12 and under only), photo consent for kids club (required if checked), allergy/medical note (optional, textarea, 300 chars, "Share anything the kids club team should know."). Buttons "Add an adult" and "Add a child" (outline, with `Plus`), "Remove" per block (ghost). Running line: "Family add-ons: +$38 a month." Buttons: "Back", "Continue".
- **Validation:** Child age 6 months–17 else "Children must be 6 months to 17. Anyone 18 or older joins as an adult." Teens 13–17 show the note "Teens book classes marked Teen OK. A parent manages billing and can allow courts and lap lanes (lanes from age 14)." Adult email unique and different from the main member.
- **Components:** `Fieldset`, `Field`, `Input`, `Textarea` (shadcn `textarea`), `Checkbox`, `ToggleGroup`, `Button`, `Collapsible`.
- **Interaction:** Adding a block sets focus to its first field and announces "Child 1 added. Family add-ons now $19 a month." (`aria-live`). Max 4 adults and 6 children; beyond that: "Need more? Call (480) 555-0142."
- **States:** Skip with "Just me" (zero family). Children shown a lock for Trailhead plan at a club without a kids club: "This club has no kids club. Kids can still use the pool and classes." (info alert)
- **Responsive:** Blocks stack; remove button at the block bottom.

```
 Step 4 of 5: Family
 Add your family.           ( Just me | [Add family] )
 +-- Child 1 ---------------------------------------- +$19/mo --+
 | First name [____] Last name [____]  Date of birth [__/__/____]|
 | [ ] Needs kids club   [ ] I agree to photo consent for kids club
 | Anything we should know? [_______________________]   Remove  |
 +-------------------------------------------------------------+
 [+ Add an adult]  [+ Add a child]     Family add-ons +$19/mo
 [ Back ]  [ Continue ]
```

### 8.5 Step 5 — Payment `/join/payment`
- **Question:** "What do I pay today, and is it safe?"
- **Copy:** H1 "Pay and join." Itemized card (also in the summary): "Ridge · $79", "Family add-ons · $38", "Enrollment · $0 (Fall climb)", **"Today · $117"** (`data-l`). Under it: "Then $117 a month on the 27th. Month to month. Cancel or freeze with 30 days' notice. A $49 annual facility fee is charged in March." Express checkout: "Apple Pay" / "Google Pay" buttons from the payment provider (native styles). Divider "or pay with card". Fields (provider-hosted iframes for number, expiry, CVC; styled with tokens): Card number, Expiry (MM/YY), CVC, Name on card, Billing ZIP. Checkboxes (both required, unchecked): "I agree to the Membership agreement" (link) and "I have read the Liability waiver" (link; full e-sign in the app). Submit: "Join and pay $117 today" (primary, full width at `base`). Under submit: lock icon + "Payments are processed by our payment provider. We never see your card number."
- **Components:** Graphical `Form`, `Field`, `Checkbox`, `Button`; provider hosted fields (e.g. Stripe Elements `PaymentElement`); `JoinOrderSummary`.
- **Validation:** Inline from the provider ("Your card number is incomplete."). Required agreements: "Check the box to agree before you pay." Billing ZIP 5 digits.
- **Interaction:** Submit disables the button and shows "Paying…". Idempotency key per attempt prevents double charges. 3-D Secure opens in a `Dialog` iframe. Back button after payment is blocked with a redirect to confirmation.
- **States:**
  - Declined: "Your bank declined this card. Try another card, or call your bank." Focus returns to the card field.
  - Processing delay (> 10 s): "Still working. Do not close this page." with a status role.
  - Network lost mid-payment: "We are checking your payment. Do not pay again. We will email you in a few minutes." The page polls the order status.
  - Provider down: "Payment is not available right now. Your plan is saved. Try again in a few minutes or call member services at (480) 555-0100."
  - Price drift: banner above the form (see 8.0).
- **Responsive:** Single column. Express buttons full width. The sticky bottom bar shows "$117 today" and the submit button.
- **Security:** Page served only over HTTPS; CSP allows only the provider's frames; no third-party trackers load on this route (analytics events only, no form values).

```
 Step 5 of 5: Payment
 Pay and join.
 Ridge $79 | Family add-ons $38 | Enrollment $0 (Fall climb)
 TODAY  $117        Then $117 a month on the 27th.
 [  Apple Pay  ] [  Google Pay  ]
 ------------- or pay with card -------------
 Card number [____________________]  Expiry [MM/YY]  CVC [___]
 Name on card [_______________]   Billing ZIP [_____]
 [ ] I agree to the Membership agreement   [ ] I have read the Liability waiver
 [        Join and pay $117 today        ]
 (lock) We never see your card number.
```

### 8.6 Step 6 — Confirmation `/join/confirmed`
- **Question:** "Am I in, and what do I do next?"
- **Success pattern (shared, `mobbin-standard-pass §2 rule 62`):** one green check (Lucide `CircleCheck`, 48 px, `success` colour) and one headline. Then a summary card, one filled primary action, a text link, and one "Done" button (`mobbin-standard-pass §2 rules 45 and 46`).
- **Copy:** Check icon · H1 "You're in, Maya." Lede "Welcome to Cactus Peak. Your membership starts today at Gilbert – Val Vista." Receipt line: "We emailed your receipt to maya@example.com." Summary card: plan, home club address and hours, family members, next bill date and amount ("Next bill $117 on the 12th"; billing day is fixed per household). Three next steps in cards (numbered):
  1. **Set up your sign-in.** "Create a password or a passkey to use the app." Inline form (`Input` password + show/hide, or "Use a passkey"). Button "Create sign-in".
  2. **Get the app.** App Store badge and QR code (desktop). "Your check-in pass is waiting."
  3. **Book your first class.** "Pick a class for this week." Button (primary, the one filled action) "See this week's classes" → app handoff to the schedule. Text link "Add a free orientation with a coach" (30 min).
  Final button: "Done" (outline) → `/`. Link: "Download receipt". `CheckInPass` (preview variant): "Your pass appears in the app. Add it to Apple Wallet there."
- **Components:** Lucide `CircleCheck`, `CheckInPass` (preview), Graphical `Button`, `Input`, `Field`; `JoinOrderSummary` (read-only).
- **Interaction:** Sign-in creation posts to the app API. Success: Toast "Sign-in created."
- **States:** Order still processing (webhook pending): "We are finishing your membership. This takes a minute." + polling every 3 s up to 60 s, then "We will email you when it is ready." Error creating sign-in: inline.
- **Responsive:** Cards stack; QR code hidden at `base` (App Store badge shown).
- **Analytics:** `join_completed` fires once (guard by order ID).

```
 (green check)
 You're in, Maya.
 Welcome to Cactus Peak. Your membership starts today at Gilbert - Val Vista.
 +--------------------------------------------------------+
 | Ridge + 1 adult + 2 children . Gilbert - Val Vista     |
 | Next bill $117 on the 12th              Download receipt|
 +--------------------------------------------------------+
 +-----------------+ +-----------------+ +-----------------------+
 | 1 Set up        | | 2 Get the app   | | 3 Book your first     |
 |   your sign-in  | |  [App Store]    | |   class               |
 | [ Create ]      | |  [QR]           | | [See this week's...]  |
 +-----------------+ +-----------------+ +-----------------------+
 [ Done ]
```

---

## 9. Free trial pass `/trial`

**Purpose:** Give a visitor a free 3-day pass with the least effort and no card.
**Primary question:** "Can I try it before I pay, and what happens after?"
**Conversion:** `trial_started` → `trial_pass_issued`.
**Rules:** No card (`MM §4`). Trial terms in small text under the button (`MM TC5`). Timeline of what happens (`MM TC4`). Three fields or fewer plus club.
**Section order:** 9.1 Pass page (form + explainer) · 9.2 Confirmation `/trial/confirmed`.

### 9.1 Pass page
- **Grid:** `lg`+: form card span 5 (right), explainer span 7 (left). `base`: explainer summary first (3 lines), form next, timeline below.
- **Copy:**
  - Breadcrumb: Home › Free 3-day pass
  - H1: "Try us for 3 days. Free."
  - Lede: "Use one club for 3 days. Take any class that has room. No card, no catch."
  - What's included (three benefit rows with icons and a trial line, `mobbin-standard-pass §2 rule 13`; the "Cancel anytime" line becomes "No card. Nothing to cancel."): "Classes and pools at one club" · "Strength and cardio floor" · "A coach to say hello" · Not included: "Courts and the recovery suite are not part of the pass. Ask about them on a tour." (neutral text, no scary styling).
  - Timeline (`TourTimeline` variant `pass`, `MM TC4`): **Today** "Get your pass. We email it and text it." · **Your first visit** "Show your pass at the desk. Bring photo ID. Your 3 days start now." · **Day 3** "Your pass ends. No charge. Nothing to cancel."
  - Form: H2 "Get my free pass." Fields: **Club** (`Select`, prefilled with my club), **First name**, **Email or mobile number** (one field; type detected; label "Email or mobile number"; help "We send your pass here."). Optional checkbox "Text me a reminder on day 2" (unchecked). Button: "Get my free pass" (primary, full width). Terms line under the button (`s`, `text-muted`): "One pass per person every 12 months. Ages 18 and up. Your 3 days start at your first check-in. No card needed. By continuing you agree to our Terms and Privacy policy."
  - Secondary link under: "Prefer a guided look? Book a free tour." → `/tour`.
- **Imagery:** `IMG-TRIAL-HERO` 4:3: a first-time member being welcomed by a coach at the desk, door open, morning light. Specific, not stock.
- **Components:** Graphical `Form`, `Field`, `Select`, `Input`, `Checkbox`, `Button`; `TourTimeline`; Lucide `Check`.
- **Validation:** Email or phone format; "Enter an email like name@example.com or a 10-digit mobile number." Already used a pass in 12 months: "You already used a pass on Mar 4. Book a tour instead." with a button.
- **Interaction:** Submit posts to `/api/trial`; on success redirect to 9.2.
- **States:** Sending: button spinner "Getting your pass…". Error: "We could not issue your pass. Try again, or call member services at (480) 555-0100." Email opened from the Home or Club band row (`/api/trial/start`): the email field is filled in and read-only until the visitor taps "Change".
- **Responsive:** As above.

```
lg+
 Home > Free 3-day pass
 Try us for 3 days. Free.                              +----------------------------+
 Use one club for 3 days. Take any class...            | Get my free pass.          |
 (v) Classes and pools at one club                     | Club [Gilbert - Val Vista v]|
 (v) Strength and cardio floor                         | First name [_____________] |
 (v) A coach to say hello                              | Email or mobile [________] |
 Not included: courts, recovery suite                  | [ ] Text me a reminder     |
 TODAY -> FIRST VISIT -> DAY 3 (timeline)              | [ Get my free pass ]       |
                                                       | One pass per person ...    |
                                                       +----------------------------+
```

### 9.2 Confirmation `/trial/confirmed`
- **Copy (shared success pattern: one green check and one headline, `mobbin-standard-pass §2 rule 62`):** Green check · H1 "Your pass is ready, {first name}." Lede "Show it at the Gilbert – Val Vista desk. Bring photo ID." `CheckInPass` (variant `trial`): QR code on a white rounded square, pass name "3-day pass", club, "Valid for 3 days from your first visit", pass ID in large `data-l` with a small label above (`MG` iOS rule 12, 14 adapted for web). Buttons: "Add to Apple Wallet" (iOS devices only, system black/white style below the pass, with an optional "Maybe later", shared `CheckInPass` rule; Wallet evidence is from non-gym passes), "Email it to me again" (ghost), "Done" (outline), "Add to Google Wallet" is not offered (no Google Wallet, `01` §9). Next: "Pick a class" → `/schedule?club=…&firstTimer=1`. "Add a tour" card (`MM TC6`): "Want a guided look? Book a free tour on your first day." Button (outline) "Book a free tour". Map block: address, hours, parking note.
- **Components:** `CheckInPass` (shared, variant `trial`), Graphical `Button`, `ClubCard` (`compact`), `TourTimeline`.
- **States:** QR service down: show the pass ID in large type and "Show this ID at the desk." **Responsive:** QR 240 px at `base`.

```
 Your pass is ready, Maya.
 +---------------------------+   Next: Pick a class ->
 |        [ QR code ]        |   Want a guided look? [ Book a free tour ]
 |  3-DAY PASS               |   Gilbert - Val Vista, Val Vista Dr & Warner Rd
 |  Gilbert - Val Vista      |   Open until 10 p.m.   Parking: free lot, east side
 |  PASS 4821 7730           |
 +---------------------------+
 [ Add to Apple Wallet ]  Email it to me again
```

---

## 10. Book a tour `/tour`

**Purpose:** Book a 30-minute guided tour in three short steps.
**Primary question:** "Can I see the club, and when?"
**Conversion:** `tour_started` → `tour_step_complete` → `tour_booked`.
**Rules:** three steps with a progress indicator (`MM §3 r24`, `MM TC2`); four fields or fewer (`MM §3 r23`); no card (`MM §4`); confirmation with address, parking and "Add to calendar" (`MM §3 r25`); a prefilled club (`MM TC3`).
**Routes:** `/tour` (query: `club`, `coach`, `date`) with steps held in client state and the URL hash `#step-2`, `#step-3`. Confirmation: `/tour/confirmed?id=…`.
**Layout:** Minimal header (`02` §3.8), step indicator (`JoinStepper` variant `tour`: "Step 1 of 3: Club and day"), centered column span 8 offset 2 at `lg`+ (content 760 px). Right summary strip appears from step 2 (club, day, time).

### 10.1 Step 1 — Choose club and day
- **Copy:** H1 "Book a free tour." Lede "30 minutes. A coach, not a salesperson. No card." **Club** (radio cards `ClubCard` `compact`, prefilled; "Not sure? Pick the nearest."). **Day:** shadcn `calendar` (month grid) with days that have slots marked by a dot and a legend "Dot = times available"; days with none are greyed and not focusable-skipped (still `aria-disabled` with reason in a tooltip: "No tours that day."). Under the calendar: time-zone line "All times are Arizona time." (`MG` web rule 23). Optional coach request when `?coach=` is set: card "You asked to meet Marisol Vega. We will try to have her join." (`Switch` default on).
- **Buttons:** "Next" (primary, disabled until club and day are chosen; the reason appears next to it: "Pick a day to continue.").
- **Components:** `ClubCard` (`compact`), Graphical `RadioGroup`; shadcn `calendar` (`npx shadcn@latest add calendar`); Graphical `Switch`, `Button`, `Tooltip`; `ReservationSlotGrid` is used in step 2.
- **Interaction:** Choosing a club refetches available days. Keyboard: calendar arrow keys; `PageUp/PageDown` for months. The first available day is pre-focused but not pre-selected.
- **States:** Loading slots: calendar skeleton. No slots in the next 30 days at this club: `EmptyState` "No tour times at {club} in the next 30 days. Pick another club or call the club." Error: "We could not load tour times. Try again."
- **Responsive:** Calendar full width (44 px day cells at `base`).

```
 Step 1 of 3: Club and day   [#][ ][ ]
 Book a free tour.   30 minutes. A coach, not a salesperson. No card.
 Club:  (o) Gilbert - Val Vista  ( ) Gilbert - Heritage ( ) Mesa - Dobson ...
 Day:   October 2026   <  >
        Su Mo Tu We Th Fr Sa
                 27. 28. 29. 30. 31
 All times are Arizona time.
                                            [ Next ]
```

### 10.2 Step 2 — Choose a time
- **Copy:** H2 "Pick a time on Wednesday, Oct 28." Time chips grouped under "Morning" and "Afternoon" and "Evening" headings (`MG` web: HoneyBook AM/PM). Chips are 3 columns at `lg`+ (`MG` iOS rule 10), 2 columns at `base`; each chip 44 px high: "9:00 a.m." Chips for booked times are removed, not shown as "Unavailable" (`MM §4`). Selected chip: filled `primary-subtle` with a `primary` 2 px border and a check. Tours Mon–Sat 9:00 a.m.–7:00 p.m., Sun 10:00 a.m.–4:00 p.m., every 30 minutes (proposed). Buttons: "Back" (ghost), "Next" (primary, disabled until a time is chosen; helper "Pick a time to continue.").
- **Components:** `ReservationSlotGrid` (shared; variant `tour`, chips), Graphical `ToggleGroup` (single), `Button`.
- **Interaction:** Choosing a time reserves it for 5 minutes (server hold) with a small timer line "Held for 5:00" only when 1 minute remains. Expired hold: "That time was released. Pick a time again."
- **States:** Slot taken between steps: "Someone just booked 9:30 a.m. Pick another time." and the grid refreshes. No slots left that day: "No times left on Wednesday." + button "Pick another day".
- **Responsive:** As above.

```
 Step 2 of 3: Time   [#][#][ ]
 Pick a time on Wednesday, Oct 28.
 MORNING     [9:00 a.m.] [9:30 a.m.] [10:00 a.m.]
             [10:30 a.m.] [11:00 a.m.] [11:30 a.m.]
 AFTERNOON   [12:00 p.m.] [12:30 p.m.] ...
 [ Back ]                                   [ Next ]
```

### 10.3 Step 3 — Confirm
- **Copy:** H2 "Confirm your tour." Summary card (read-only, with Edit links): "Gilbert – Val Vista · Wednesday, Oct 28 · 9:30 a.m. · 30 minutes". **Fields (four, `MM §3 r23`):** Club (prefilled, shown in summary), Preferred time (prefilled, shown in summary), **First name**, **Email or mobile number**. Optional: link "Add a note" opens a `Textarea` prefilled with "I'd like to see the pool and the kids club." (`MM TC3` prefilled message), 300 chars. Checkbox "Text me a reminder 24 hours and 2 hours before" (checked only if a mobile number was entered; never pre-checked for email). Button: "Book my tour" (primary). Terms (small): "Free. No card. We use your details only to book this tour. Privacy policy." Secondary: "Request info instead" (ghost, → `/contact?topic=tour`) (`MM TC6`).
- **Validation:** Name required. Contact required, valid. "Enter an email or a 10-digit mobile number."
- **Interaction:** Submit posts to `/api/tours`; the hold becomes a booking; redirect to confirmation.
- **States:** Sending: spinner "Booking…". Error: "We could not book that time. Try again, or call the club." Duplicate (same contact, same club, within 7 days): "You already have a tour on Oct 28. Reschedule it?" with a link.
- **Components:** Graphical `Form`, `Field`, `Input`, `Checkbox`, `Collapsible`, `Button`; shadcn `textarea`.
- **Responsive:** Single column.

```
 Step 3 of 3: Confirm   [#][#][#]
 Confirm your tour.
 +------------------------------------------------+
 | Gilbert - Val Vista | Wed, Oct 28 | 9:30 a.m.  |  Edit
 +------------------------------------------------+
 First name [________]  Email or mobile number [____________]
 + Add a note
 [ ] Text me a reminder 24 hours and 2 hours before
 [ Back ]  [ Book my tour ]      Request info instead
```

### 10.4 Confirmation `/tour/confirmed`
- **Success pattern (shared, `mobbin-standard-pass §2 rules 44, 45, 46, 62`):** one green check, one headline, a "Confirmed" pill, a summary card, a filled "Add to calendar" button, a "Share" text link, four action rows, and "Done".
- **Copy:** Green check · green pill "Confirmed" · H1 "You're booked." Lede "Wednesday, Oct 28 at 9:30 a.m. Gilbert – Val Vista." Summary card: date and time, club name, address (Val Vista Dr & Warner Rd, Gilbert, AZ 85233), parking note (free lot, east side), "Ask for a coach at the front desk" (proposed), phone. Filled button (primary): "Add to calendar" (Graphical `Menu`: Apple Calendar `.ics`, Google Calendar, Outlook). Text link under it: "Share this tour". Four action rows (`mobbin-standard-pass §2 rule 44`): Get directions · Message the club · Club details · Reschedule or cancel (signed link). "What to bring" list: "Photo ID if you want a 3-day pass. Workout clothes if you want to try a class. Questions." Tertiary: "Want to try a class too? Get a free 3-day pass." Button: "Done" (outline) → `/`. Reminder note: "We will text you 24 hours and 2 hours before." (if opted in).
- **Components:** Lucide `CircleCheck`, shadcn `badge`, `ClubCard` (`compact`), Graphical `Menu`, `Button`, `Item` rows, `ClubMap` (static).
- **States:** `.ics` fails: fall back to a plain text link. **Responsive:** Stacked.
- **Analytics:** `tour_booked` fires once (guard by tour ID).

```
 (green check)  [Confirmed]
 You're booked.   Wednesday, Oct 28 at 9:30 a.m. - Gilbert - Val Vista
 +-------------------------------------------------------------+
 | Val Vista Dr & Warner Rd, Gilbert, AZ 85233 . Free lot, east |
 | (480) 555-0142                                               |
 +-------------------------------------------------------------+
 [ Add to calendar v ]      Share this tour
 > Get directions  > Message the club  > Club details  > Reschedule or cancel
 What to bring: photo ID (for a pass), workout clothes (to try a class), questions
 Want to try a class too? Get a free 3-day pass.            [ Done ]
```

---

## 11. Kids & family `/kids`

**Purpose:** Earn a parent's trust and show what kids and teens can do.
**Primary question:** "Is it safe, what ages, when, and what does it cost?"
**Persona focus:** Maya, Jordan's parent.
**Conversion:** `tour_started` (bring the kids), `join_started` with family.
**Rule applied:** kids hero with a large headline and a pill button that names the ages (`MG r32`).
**Section order:** 11.1 Hero · 11.2 Age groups · 11.3 Kids club hours and clubs · 11.4 How kids club works · 11.5 Swim school levels · 11.6 Teens · 11.7 Family price · 11.8 Parent quotes · 11.9 FAQ · 11.10 Tour band.

```
 +-------------------------------------------------------------------+
 | 11.1 HERO  H1 + [ Tour with the kids (ages 6 mo-17) ]   photo         |
 +-------------------------------------------------------------------+
 | 11.2 AGE GROUPS  [Kids club 6mo-12][Swim school][Junior PB][Teen]   |
 | 11.3 KIDS CLUB HOURS TABLE   +   3 clubs                          |
 | 11.4 HOW IT WORKS  (1) check in (2) play (3) pick up              |
 | 11.5 SWIM SCHOOL LEVEL LADDER   | 11.6 TEENS (Teen Strength)      |
 | 11.7 FAMILY PRICE (calculator)  | 11.8 PARENT QUOTES              |
 | 11.9 FAQ        | 11.10 TOUR BAND                                 |
 +-------------------------------------------------------------------+
```

### 11.1 Hero
- **Grid:** Text span 6, photo span 6.
- **Copy:** Eyebrow "Kids and families" · H1 "Train. The kids are fine." · Support "Kids club for ages 6 months to 12 years. Swim school. Junior Pickleball. Teen Strength for ages 13 to 17." (one pill button names the ages, `MG r32`; one visible button, `mobbin-standard-pass §2 rule 3`) · Pill button: "Tour with the kids (ages 6 mo–17)" → `/tour?note=kids`. Secondary: "See kids club hours" (anchor 11.3).
- **Imagery:** `IMG-KIDS-HERO` 4:3: a staff member kneeling at a child's height, bright room, a parent at the door. No logo overlay.
- **Components:** `HeroSplit`, Graphical `Button` (pill via `radius.full` override), `AmenityChip`.
- **States / Responsive:** Static; photo under text at `base`.

### 11.2 Age groups (`ProgramCardGrid`)
- **Grid:** Four cards, span 3 each (`md` 2×2, `base` 1 col).
- **Copy:** **Kids Club** (`CategoryBadge` Youth; age chip in capitals "AGES 6 MO–12 YR", `mobbin-standard-pass §2 rule 17`; "Play, crafts and games. 2-hour blocks."; "At 3 clubs"). **Swim School** (Aqua; chip "AGES 3–12" in five levels; "Taught by Red Cross-certified coaches"; "At Gilbert – Val Vista"). **Junior Pickleball** (Court/Youth; chip "AGES 8–14"; "Clinic format, Saturdays" proposed). **Teen Strength** (Youth; chip "AGES 13–17"; Teen OK; "Coached barbell and bodyweight basics").
- **Components:** `ClassCard` (`card`), `CategoryBadge`, `IntensityRibs`.
- **Imagery:** `IMG-KIDS-{group}` 4:3.

### 11.3 Kids club hours and clubs
- **Grid:** Hours table span 6, club availability list span 6.
- **Copy:** H2 "When kids club is open." `HoursTable` (kids variant): "Mon–Sat in four 2-hour blocks: 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. · Sunday: closed". Note: "Ages 6 months to 12 years. Up to 2 blocks per child per day. Two-hour blocks. A parent checks in and stays in the building." (`FD §3`). Club list: Mesa – Dobson (yes), Mesa – Red Mountain (yes), Gilbert – Val Vista (yes), Mesa – Downtown (no kids club), Gilbert – Heritage (no kids club). Each row has `ClubCard` `list-row` compact with a `Check` or `Minus` and the words "Kids club" / "No kids club".
- **Components:** `HoursTable`, `ClubCard` (`list-row`), `AmenityChip`.
- **States:** Live "Open now" tag if within hours. **Responsive:** Stacked.

### 11.4 How kids club works (`TourTimeline` variant `steps`)
- **Copy:** 1 "Check in. You sign your child in at the kids club door with the app, at the same club. An unclaimed block is released 15 minutes after it starts." 2 "Play. Staff run games, crafts and quiet time. Ratios stay at 1 adult to 8 children." (proposed) 3 "Pick up. Come back within 2 hours. We text you at 1 hour 45 minutes." Safety list: "Staff pass a background check · Staff hold CPR and first aid training · Allergy notes on file · Parents stay in the building" (proposed).
- **Components:** Numbered steps, Lucide `ShieldCheck`, `Smartphone`, `Clock`.

### 11.5 Swim school levels (`LevelLadder`, `MM C3`)
- **Grid:** Vertical stack of five cards, span 8 offset 2.
- **Copy:** Level badge + title + one line: **Level 1 Splash** "Water comfort and floating. Ages 3–5." · **Level 2 Float** "Back and front float, short glide." · **Level 3 Kick** "Kick with a board, breathe to the side." · **Level 4 Stroke** "Freestyle and backstroke across the pool." · **Level 5 Lap-ready** "Swim 100 yards without stopping." Link: "See swim school times" → `/schedule?class=swim-school`. (Level names proposed.)
- **Components:** `ClassCard` (`compact`) variant level, `ProgressRibs` (levels 1–5 filled left to right, text label always present).

### 11.6 Teens
- **Grid:** Split: photo span 5, text span 7.
- **Copy:** H2 "For teens, a place that is not a screen." Body (≤60 words): "Teen Strength is for ages 13 to 17. A coach teaches form first. Teens train in the class or with a parent. A parent signs the waiver. Teens can book classes in the app once a parent adds them to the plan." Facts: "Ages 13–17 · Teen OK · Coached" . Button: "Send this to a parent" (native share via `navigator.share`, fallback copy link; label for teens) and "Book a free tour". Policy link: "Teen rules" → `/legal/kids-club-policy`.
- **Imagery:** `IMG-KIDS-TEEN` 4:5: teens in a coached group, focused, a coach's hand on a bar.
- **States:** Share unsupported: copies the link with a Toast "Link copied."

### 11.7 Family price
- **Copy:** H2 "What a family costs." `FamilyCalculator` (compact) preset: Ridge + 1 adult + 2 children = **$156 a month**. Link: "Open the full calculator" → `/membership#family`.
- **Components:** `FamilyCalculator`, `PlanCard` (`compact`).

### 11.8 Parent quotes
`TestimonialRail` variant `grid` with three parent quotes (placeholders): "My son asks to go to kids club. I do not know how this happened." — Maya T. · "Teen Strength gave my son a place that is not a screen." — Carlos M. · "Swim school in the morning, Aqua Fit for me. Same building." — Dee H.

### 11.9 FAQ (group "Kids and teens")
`FAQAccordionSection`: "What ages can use kids club?" / "Ages 6 months to 12 years." · "Can my teen train without me?" / "In Teen Strength, yes. In the gym, a parent needs to sign the waiver and the teen stays on the teen floor area." (proposed) · "What if my child is sick?" / "Please keep them home. Kids with a fever or vomiting cannot check in." · "Is there a time limit?" / "Yes. 2-hour blocks. You stay in the building."

### 11.10 Tour band
`TourCTABand` variant `kids`: H2 "Bring the kids on your tour." Support "They can see the room. You can ask the staff anything." Buttons: "Tour with the kids", "Try a free 3-day pass".

---

## 12. Aquatics `/aquatics`

**Purpose:** Show pools, lanes, swim programs and the warm-water pool.
**Primary question:** "Where is the pool, when can I swim, and is there a warm-water pool for my joints?"
**Persona focus:** Daniel (warm water), Ron and Linda (Aqua Fit), Maya (swim school).
**Rules applied:** `MM` §5 gap: no pool-only section exists in research; this page defines one from `FD §2`, `§3`.
**Section order:** 12.1 Hero · 12.2 Pools by club · 12.3 Warm-water pool · 12.4 Programs · 12.5 Lap lane reservations · 12.6 Hours and rules · 12.7 FAQ · 12.8 Tour band.

```
 12.1 HERO  Water, any pace.            [ photo 16:9 ]
 12.2 POOLS BY CLUB   [Dobson card][Red Mountain card][Val Vista card]   (Downtown, Heritage: no pool note)
 12.3 WARM-WATER POOL (split)   |  12.4 PROGRAMS  [Lap Swim][Aqua Fit][Swim School][Masters]
 12.5 LANE SLOTS preview (ReservationSlotGrid, read-only)  |  12.6 HOURS + RULES  |  12.7 FAQ  |  12.8 BAND
```

### 12.1 Hero
- **Copy:** Eyebrow "Aquatics" · H1 "Water at any pace." · Support "Three clubs with pools. Lap lanes, warm water, a splash pad and swim school." · Buttons: "Book a free tour" (primary), "See swim times" (outline, → `/schedule?category=aqua`). Trust row: "3 pools" · "Lanes in 45-minute slots" · "Pools close 30 min before the club".
- **Imagery:** `IMG-AQUA-HERO` 16:9: lap swimmers in morning light at Mesa – Red Mountain under shade sails. **Grid:** `HeroSplit` (text 6 / photo 6).

### 12.2 Pools by club (`PoolCard` = `ClubCard` `compact` + facts)
- **Grid:** Three cards, span 4 each. Two lines for clubs with no pool (a muted `Minus` row listing Mesa – Downtown and Gilbert – Heritage with the text "No pool at these clubs. Ridge and Summit members can swim at the other three.").
- **Copy:** Mesa – Dobson: "25-yd lap pool, 8 lanes. Warm-water therapy pool." · Mesa – Red Mountain: "Outdoor 25-m pool, 8 lanes, with shade sails." · Gilbert – Val Vista: "25-yd lap pool, 6 lanes. Splash pad. Swim school." Each card: photo 4:3, `BusynessMeter` for the pool (if the API provides; else club busyness), hours (pool closes 30 min before the club), button "Tour this club".
- **Imagery:** `IMG-AQUA-{slug}` 4:3.

### 12.3 Warm-water pool
- **Grid:** Split: photo span 6, text span 5 offset 1.
- **Copy:** Eyebrow "Mesa – Dobson" · H2 "A warm pool for stiff joints." Body: "The warm-water therapy pool stays at 90 to 92°F. The water holds you up. Many members use it after surgery or on sore days. Ask your doctor first. Our coaches can help you plan a first week." (proposed; no medical claims) Facts: "90–92°F · Lift access · Aqua Fit and Stretch & Release here". Button: "Ask about the warm pool" → `/tour?club=mesa-dobson&note=warm-pool`.
- **Imagery:** `IMG-AQUA-WARM` 3:2: an older member with a coach in waist-deep water, calm.
- **Sidebar list (`mobbin-standard-pass §2 rule 19`):** beside the photo, `AmenityChip` `detail` rows: "90–92°F · Step-in access · Aqua Fit here · Stretch & Release here".

### 12.4 Programs
- **Grid:** Four `ClassCard` `card` (span 3): Lap Swim (reservable lanes), Aqua Fit, Swim School, Masters Swim. Each shows `IntensityRibs`, clubs, next time at my club.
- **Copy:** H2 "Four ways to get wet." One-line "Pick this if…" under each.

### 12.5 Lap lane reservations
- **Copy:** H2 "Lanes in 45-minute slots." Body "Members book a lane in the app. Up to 2 swimmers share a lane (circle swim), and each slot shows '1 of 2 swimmers'. 'Any lane' is the default. Lap lanes have no waitlist. The splash pad needs no booking." Read-only `ReservationSlotGrid` for today at my club: slots "6:00 a.m. – 2 lanes left" (spots-left rule: only ≤5 shown). Button (outline): "Book a lane" → handoff dialog (§6.6) with lane context.
- **Components:** `ReservationSlotGrid` (variant `readonly`), `BookingStateButton`, `CapacityIndicator`. **States:** As §6.4.

### 12.6 Hours and rules
- **Copy:** `HoursTable` (pool variant: weekdays pool 4:30 a.m.–9:30 p.m., weekends 6:00 a.m.–7:30 p.m.; derived from "pools close 30 minutes before the club"). Rules list (icon grid, `MM A2`, labels of 1–3 words): "Shower first" · "Swim cap for long hair" · "Lane etiquette" · "Lifeguard on duty" · "No glass" · "Kids with a parent". 
- **Components:** `HoursTable`, icon grid (Lucide).

### 12.7 FAQ
`FAQAccordionSection` (aquatics): "Do I need to book a lane?" / "Yes for lap lanes in the app. Not for the splash pad." · "Is the pool heated?" / "Yes. The lap pools stay at 80 to 82°F; the therapy pool at 90 to 92°F." (proposed) · "Can my child swim alone?" / "Children under 12 need a parent at the pool." (proposed)

### 12.8 Tour band
`TourCTABand`: "Test the water." Buttons as §1.13.

---

## 13. Courts `/courts`

**Purpose:** Show where the courts are and how booking works.
**Primary question:** "How many courts, how do I book, and what is included?"
**Persona focus:** Ron and Linda (large text, phone), Priya (hoops).
**Section order:** 13.1 Hero · 13.2 Courts by club · 13.3 How booking works · 13.4 Play formats · 13.5 Live court preview · 13.6 FAQ · 13.7 Tour band.

```
 13.1 HERO "Play more than you plan."  [Book a free tour]  Call (480) 555-0127
 13.2 COURT TABLE (3 clubs)             13.3 HOW BOOKING WORKS (3 steps)
 13.4 FORMATS [Open Play][Clinic][Tennis Drills][Hoops Run]
 13.5 LIVE COURT PREVIEW (read-only)    13.6 FAQ      13.7 TOUR BAND
```

### 13.1 Hero
- **Copy:** H1 "Play more than you plan." Support "18 courts at 3 clubs. Pickleball, tennis and basketball. Book in the app or call the desk." (16 words; 6 at Dobson, 6 at Red Mountain, 6 at Val Vista.) Buttons: "Book a free tour", "Call Mesa – Red Mountain (480) 555-0127" (phone shown for the club nearest the visitor; default Red Mountain for the court page). 
- **Imagery:** `IMG-COURTS-HERO` 16:9: pickleball doubles, morning, older players laughing. Large type: hero text at least `xl`.
- **Large-text note:** Body copy on this page is `m` 16/24 and respects browser zoom to 200% (`05` §4). A "Text size" control is not added (use browser zoom).

### 13.2 Courts by club
- **Grid:** `shadcn table` at `lg`+, stacked cards at `base`. Rows: club; pickleball; tennis; basketball; extras; "Book a court" button (outline).
- **Copy:** Mesa – Dobson: 4 pickleball · 2 tennis · — . Mesa – Red Mountain: 6 pickleball · — · — · "Turf lane, Superstition-view deck". Gilbert – Val Vista: 4 pickleball · — · 2 basketball. Downtown and Heritage: "No courts."
- **Components:** shadcn `table`, `ClubCard` (`compact`) per row at `base`, Lucide custom court icon (`BG §6`), `AmenityChip`.

### 13.3 How booking works
- **Copy:** 1 "Pick a time. Courts are 60- or 90-minute slots." 2 "Book 3 days ahead; the window opens at 6:00 a.m. Arizona time. Ridge and Summit include courts. One court reservation a day, at most 2 active." 3 "Show up. Check in at the desk or with the app." Note: "Cancel free up to 2 hours before." (`FD §3`) Button: "Book a court" (handoff). Phone: "Prefer to call? (480) 555-0127. The desk is staffed 6:00 a.m. to 8:00 p.m."
- **Components:** `TourTimeline` (`steps`), Graphical `Button`.

### 13.4 Play formats
- **Grid:** Four `ClassCard` `compact`: Pickleball Open Play, Pickleball Clinic, Tennis Drills, Hoops Run, with `IntensityRibs` and "Good for first-timers". 

### 13.5 Live court preview
- **Copy:** H2 "Courts open today." `ReservationSlotGrid` (`readonly`, by court and time) for my club (default Red Mountain) with the shared `DurationChips` control (60 | 90) above the grid; the selected chip is filled (`mobbin-standard-pass §2 rule 60`). Cells: "Open" / "Booked", words plus icon. Button: "Book a court".
- **States:** Loading skeleton; error "We could not load courts. Call (480) 555-0127."

### 13.6 FAQ
"Do I need my own paddle?" / "No. Loaner paddles are at the desk." (proposed) · "Is open play for beginners?" / "Yes. Ask a coach for a beginner court." · "Can Trailhead members book courts?" / "Courts come with Ridge and Summit." · "Can I book for a group?" / "Yes. Book each court as a slot."

### 13.7 Tour band: "Meet your court."

---

## 14. Recovery `/recovery`

**Purpose:** Explain the recovery spaces and who gets access.
**Primary question:** "What is in the recovery suite, which clubs have it, and is it included?"
**Persona focus:** Daniel, Priya.
**Guard:** No medical claims. Include "Talk to your doctor if you have a heart condition, are pregnant, or take medicines that affect heat or cold." (`05` §5 legal copy).
**Section order:** 14.1 Hero · 14.2 What's in the suite · 14.3 By club · 14.4 Recovery classes · 14.5 Who gets access · 14.6 How a visit goes · 14.7 Safety notes · 14.8 FAQ · 14.9 Tour band.

```
 14.1 HERO "Rest is a skill."  [Book a free tour]  [See Summit]
 14.2 FOUR SPACES  [Sauna][Cold plunge][Compression][Stretch area]
 14.3 BY CLUB: Dobson (suite) | Val Vista (suite) | Downtown (lounge) | Heritage (lounge) | Red Mtn (class only)
 14.4 CLASSES [Stretch & Release][Sauna + Plunge slots][Compression]
 14.5 ACCESS (Summit)  | 14.6 HOW A VISIT GOES (3 steps) | 14.7 SAFETY | 14.8 FAQ | 14.9 BAND
```

### 14.1 Hero
- **Copy:** H1 "Rest is a skill." Support "Sauna, cold plunge and compression at 4 clubs. A Summit benefit you can try on a tour." (19 words) Buttons: "Book a free tour", "See Summit" (outline, → `/membership#plans`).
- **Imagery:** `IMG-REC-HERO` 16:9: warm wood sauna door open, soft light, one member relaxing. Quiet. No steam clichés or "ice bath" shock shots.

### 14.2 What's in the suite
- **Grid:** Four tiles (icon in circle `MM A1`, two-line heading, one line): Sauna "Dry heat. Sit for 10 to 15 minutes." · Cold plunge "Short, cold, controlled." · Compression "Air boots for tired legs." · Stretch area "Foam rollers, bands and a coach nearby." Components: `AmenityBento` variant `tiles`, `AmenityChip`.

### 14.3 By club (`ClubCard` `list-row` compact ×5)
- **Copy:** Mesa – Dobson "Full recovery suite: cold plunge, sauna, compression." · Gilbert – Val Vista "Recovery suite." · Mesa – Downtown "Recovery lounge: sauna and compression." · Gilbert – Heritage "Recovery lounge and rooftop mobility deck." · Mesa – Red Mountain "No suite. Stretch & Release class in the studio." Each row links to the club page `#amenities`.

### 14.4 Recovery classes
- **Grid:** Three `ClassCard` `card`: Stretch & Release, Sauna + Plunge slots, Compression. `CategoryBadge` Recovery (Dusk Violet `#5F4E86`, dark `#B6A6E0`). `IntensityRibs` 1. Slots are bookable in the app.

### 14.5 Who gets access
- **Copy:** H2 "Included with Summit." Body "Summit ($129 a month) includes the recovery suite and lounge at all clubs that have one. Trailhead and Ridge members book Stretch & Release classes. Everyone can try the suite on a tour." (proposed interpretation of `FD §4`). Mini `PlanCard` (`compact`) Summit. Button: "Compare plans" → `/membership#compare`.

### 14.6 How a visit goes (`TourTimeline` `steps`)
1 "Book a slot in the app. Slots are 30 minutes." (proposed) 2 "Shower, then enter. Towels are at the door; Summit includes towel service." 3 "Warm, then cool, then rest. Leave when you feel done."

### 14.7 Safety notes
Short list with `Info` icons: "Ages 18 and up" · "Talk to your doctor if you have a heart condition, are pregnant, or take medicines that affect heat or cold" · "Do not use alone if you feel unwell" · "Phones stay in lockers".

### 14.8 FAQ
"Is the recovery suite included?" / "It is part of Summit. Ask for a tour to try it." · "How long can I stay?" / "Slots are 30 minutes." (proposed) · "Do I need a towel?" / "Summit includes towel service." · "Is this good after surgery?" / "Ask your doctor first. A coach can help you plan."

### 14.9 Tour band: "Try the suite on a tour." Buttons as §1.13.

---

## 15. Personal training `/personal-training`, Coaches index `/coaches`, Coach profile `/coaches/[slug]`

### 15.1 Personal training `/personal-training`
**Purpose:** Explain coaching and packs and route the visitor to a coach.
**Primary question:** "Who will coach me, how does it work, and what does it cost?"
**Persona focus:** Daniel, Priya.
**Section order:** 15.1.1 Hero · 15.1.2 How it works · 15.1.3 Packs · 15.1.4 Find a coach strip · 15.1.5 Goals (Ideal for) · 15.1.6 FAQ · 15.1.7 Tour band.

- **15.1.1 Hero** — Copy: H1 "A coach who knows your name." Support "One-on-one sessions at all 5 clubs. Packs of 4, 8 or 12 (or a single session for $75). Start with a free tour and meet a coach." Buttons: "Meet a coach on a free tour" (primary → `/tour?coach=any`), "See all coaches" (outline). Imagery `IMG-PT-HERO` 4:5: coach and member at a rack, hand on the bar, calm.
- **15.1.2 How it works** — `TourTimeline` steps: 1 "Meet. Free tour or an intro session (Summit gets a 30-minute intro each quarter)." 2 "Plan. Your coach writes a plan for your goal, your joints and your week." 3 "Train. Sessions are 45 minutes. Book in the app." 4 "Review. Every 4 sessions, your coach checks the plan."
- **15.1.3 Packs** — Three `PlanCard` `pack` cards, none highlighted: 4 sessions $276 ($69 each) · 8 sessions $520 ($65 each) · 12 sessions $732 ($61 each). Below them: "Single session $75." Notes: "45 minutes. Packs last 12 months and pause during a freeze. Cancel or reschedule free up to 24 hours before. Summit includes a 30-minute intro each quarter." Button: "Book a free tour to start".
- **15.1.4 Find a coach strip** — Four `CoachCard` `headshot` items with a `Select` "Specialty" (Strength, Cycle, Mind & Body, Aqua, Return to training, Youth) and a link to `/coaches`.
- **15.1.5 Goals** — Cards in `MM P6` form: "Come back after an injury", "Build strength", "Prepare for pickleball", "Swim with confidence". Each links to coaches filtered by specialty.
- **15.1.6 FAQ** — "Do I have to buy a pack?" / "No. A single session is $75. Packs of 4, 8 or 12 cost less per session." · "Can I switch coaches?" / "Yes. Tell the front desk." · "Does Summit include PT?" / "Summit includes 1 intro session a quarter."
- **15.1.7 Tour band** — "Meet your coach."
- **Layout notes:** Hero `HeroSplit`; sections follow §0.3 rhythm. Responsive and states: static; coach `Select` filters client-side.

```
 HERO: A coach who knows your name.   [Meet a coach on a free tour] [See all coaches]  [IMG 4:5]
 HOW IT WORKS: (1) Meet -> (2) Plan -> (3) Train -> (4) Review
 PACKS:  [4 sessions $276][8 sessions $520][12 sessions $732]
 FIND A COACH: Specialty [v]   [Coach][Coach][Coach][Coach]
 GOALS (4 cards)   FAQ   TOUR BAND
```

### 15.2 Coaches index `/coaches`
**Purpose:** Browse all coaches by club and specialty.
**Primary question:** "Who are the coaches, and who is right for me?"
**Section order:** 15.2.1 Header and filters · 15.2.2 Coach grid · 15.2.3 Tour band.

- **15.2.1 Header and filters** — Grid: span 12. H1 "Meet the coaches." Lede "24 coaches at 5 clubs. Pick by club or by what you want to do." Filters: `Select` club, `Select` specialty, `Combobox` class they teach, `Switch` "Takes personal training clients". Components: Graphical `Select`, `Combobox`, `Switch`. URL sync. States: filters reset link.
- **15.2.2 Coach grid** — Grid: 4 per row at `lg`+ (`CoachCard` `card`, span 3), 2 at `md`, 1.2-rail at `base`? No: 1 per row stacked at `base`... Use 2 per row at `base` with 4:5 photos (smaller) for faster scanning. Card (rule `MM §3 r26`): 4:5 portrait, name, one credential line, "Favorite class", clubs, bio ≤25 words (visible at `md`+; hidden at `base`), button ghost "Meet {first name}". Example: "Marisol Vega — CSCS · Spinning instructor — Favorite class: Climb Cycle — Gilbert – Val Vista, Mesa – Dobson — 'Quiet hands, strong legs. She keeps the room kind.'" (≤25 words.)
  - Empty: `EmptyState` "No coaches match. Remove a filter." Loading: static (SSR); filtering is client-side.
- **15.2.3 Tour band** — H2 "Meet a coach on a free tour."

```
 Meet the coaches.     Club [v]  Specialty [v]  Class [v]  [ ] PT clients
 +--------+ +--------+ +--------+ +--------+
 | 4:5    | | 4:5    | | 4:5    | | 4:5    |
 | Name   | | Name   | | Name   | | Name   |
 | cred   | | cred   | | cred   | | cred   |
 | fav    | | fav    | | fav    | | fav    |
 | clubs  | | clubs  | | clubs  | | clubs  |
 +--------+ +--------+ +--------+ +--------+
```

### 15.3 Coach profile `/coaches/marisol-vega`
**Purpose:** Build trust in one coach and offer an intro.
**Primary question:** "Is this the person I want to train with?"
**Pattern:** `MM T4` stats row with a primary trial action; `MM T6` credentials line; `MM §3 r26`, `r27`.
**Section order:** 15.3.1 Profile hero · 15.3.2 About and quote · 15.3.3 Classes and next sessions · 15.3.4 Clubs · 15.3.5 Training with Marisol · 15.3.6 Other coaches · 15.3.7 Tour band.

- **15.3.1 Profile hero** — Grid: photo span 4 (4:5), text span 8; sticky card not used. Copy: Breadcrumb Home › Personal training › Coaches › Marisol Vega. H1 "Marisol Vega". Credential line (small caps style, `eyebrow`): "CSCS · SPINNING INSTRUCTOR". Specialty tags: Cycle, Strength basics, Return to training. Stats row (`data-l` numbers): "9 years coaching" · "2 clubs" · "6 classes". Favourite class: "Favorite class: Climb Cycle". Primary button: "Meet Marisol on a free tour" → `/tour?coach=marisol-vega&club=gilbert-val-vista`. Secondary buttons: "Send a message" (→ `/contact?topic=coach&coach=…`), "Share" (native share). Line: "Marisol replies within 1 business day." (proposed).
  Imagery: `IMG-COACH-marisol-vega` 4:5 portrait (natural light, club behind, direct eye contact). Components: `CoachCard` (variant `hero` - profile), Graphical `Button`, `CategoryBadge`s.
- **15.3.2 About and quote** — Body 60–90 words in `m`. Quote (≤30 words) in `l`: "Nobody climbs the same hill. I help you find your gear." Components: pull-quote style, Lucide `Quote`.
- **15.3.3 Classes and next sessions** — H2 "Classes with Marisol." `ClassCard` `schedule-row` ×4 (next sessions, live). Button "See all of Marisol's classes" → `/schedule?coach=marisol-vega`.
- **15.3.4 Clubs** — `ClubCard` `compact` ×2 (Gilbert – Val Vista, Mesa – Dobson).
- **15.3.5 Training with Marisol** — Pack summary: "One-on-one sessions: packs of 4, 8 or 12, from $61 a session." Button (outline) "See packs" → `/personal-training#packs`. Members (signed in) see "Book an intro in the app" — the CTA label is the same text for visitors (consistency); the destination handles state.
- **15.3.6 Other coaches** — `CoachCard` `compact` ×3 (same club or specialty).
- **15.3.7 Tour band** — `TourCTABand` variant `coach`: "Come meet Marisol."
- **States:** Coach on leave: `warning` note "Marisol is away until Nov 12. Other coaches can help." and the tour CTA changes to "Book a free tour". No classes in 7 days: `EmptyState` "No classes this week." Responsive: stack; photo 4:5 at 240 px wide at `base`.

```
 Home > Personal training > Coaches > Marisol Vega
 +---------+  MARISOL VEGA
 | 4:5     |  CSCS . SPINNING INSTRUCTOR
 | portrait|  [Cycle][Strength basics][Return to training]
 |         |  9 yrs coaching | 2 clubs | 6 classes
 +---------+  Favorite class: Climb Cycle
              [ Meet Marisol on a free tour ] [Send a message] [Share]
 ABOUT + QUOTE   |  CLASSES WITH MARISOL (rows)  |  CLUBS  |  PT PACKS  |  OTHER COACHES
```

---

## 16. About / Our story `/about`

**Purpose:** Explain who we are, why, and what we promise.
**Primary question:** "Will I feel welcome, and who runs this place?"
**Persona focus:** Daniel (welcome), Maya (trust).
**Section order:** 16.1 Hero · 16.2 Our story · 16.3 What we believe · 16.4 The five ribs · 16.5 Numbers · 16.6 Community · 16.7 Leadership · 16.8 Careers and tour band.

### 16.1 Hero
- **Copy:** H1 "Built for the East Valley." Support "Five clubs in Mesa and Gilbert. One idea: every member climbs at their own pace." Imagery `IMG-ABOUT-HERO` 16:9: a morning at Mesa – Dobson, members of different ages passing in a hallway, nods and smiles. **Components:** `HeroSplit` (full-bleed variant not used; legibility). No buttons except one ghost link "Meet the coaches".

### 16.2 Our story
- **Grid:** Text span 6 offset 1, timeline span 4. Body (≤120 words, plain): "We opened Mesa – Dobson in 2014 with a pool, a few courts and a rule: nobody gets shamed. People came for the water and stayed for the people. We opened a club at a time, each one built for its neighbourhood. The fifth club opened in 2024." (placeholder; `01` §9). Timeline items (`data` years): 2014 Mesa – Dobson · 2017 Mesa – Red Mountain · 2020 Mesa – Downtown · 2022 Gilbert – Val Vista · 2024 Gilbert – Heritage (proposed).

### 16.3 What we believe
- **Grid:** Three icon-in-circle columns (`MM A1`). **Copy:** "Steady. Progress is a long climb. We do not sell shortcuts." · "Welcoming. First visit? Ask for a free tour." · "Capable. Real coaches, real equipment, real water." (Brand voice, `BG §8`).

### 16.4 The five ribs
- **Grid:** Split: mark span 5 (symbol, 256 px, Arizona Copper on Sand with clear space), text span 6. **Copy:** H2 "Five ribs. One peak." Body "Our mark is a desert peak cut into five upright ribs. One rib for each club. Together they make one summit." Caption: "Rib Peak, our symbol." The mark appears unchanged (`BG §9`); never five ribs used as a decoration with a different meaning (`FD §1`).

### 16.5 Numbers
- **Grid:** Four stat tiles (`data-l`): "5 clubs" · "28 class types" · "4:30 a.m. first doors" · "1 promise". Static.

### 16.6 Community
- **Copy:** H2 "Part of the neighbourhood." Short list of partners (placeholders): school swim programs, local running group (Canal Run Club), senior center, physical therapy clinics. Logo wall `MM SP3` (3×2 of placeholder text chips; real logos need permission). **Components:** `.cp-card` tiles.

### 16.7 Leadership (`MM T2`)
- **Grid:** Three profile cards (span 4). **Copy:** name, role, "Favorite class", home club, 25-word bio. Example (placeholder): "Renata Alvarez — Owner-operator — Favorite class: Desert Flow Yoga — Mesa – Dobson — 'I swam here before I owned it.'"

### 16.8 Careers and tour band
- Two-card row: "Join the team" (→ `/careers`) and `TourCTABand` below.
- **States / Responsive:** Static; stacks at `base`.

```
 HERO  Built for the East Valley.              [photo 16:9]
 STORY text + timeline (2014..2024)
 BELIEVE: (o)Steady (o)Welcoming (o)Capable
 FIVE RIBS: [symbol]  Five ribs. One peak.
 NUMBERS: 5 | 28 | 4:30 a.m. | 1
 COMMUNITY  |  LEADERSHIP (3 cards)  |  CAREERS card  |  TOUR BAND
```

---

## 17. FAQ `/faq`

**Purpose:** Answer the questions that stop people from joining.
**Primary question:** "Can I find my answer fast, and who do I ask if not?"
**Rules applied:** categories with counts and the first question open (`MM F1`); 10 questions in three groups (`MM §3 r30`); an age-rule question (`MM §3 r31`); "Still have a question?" route (`MM §3 r32`, `MM F5`).
**Section order:** 17.1 Header and search · 17.2 Group list + questions · 17.3 Escape route.

### 17.1 Header
- **Copy:** H1 "Good questions." Lede "Short answers. If yours is not here, call us." Field "Search the questions" (client filter, `Input` with `Search` icon).
- **Components:** Graphical `Input`, `Field`.

### 17.2 Groups and questions (`FAQAccordionSection` variant `grouped`)
- **Grid:** `lg`+: group list span 4 (sticky), accordion span 8. `base`: group `Tabs` as a scrollable row; accordion below.
- **Group list rows:** "Getting started — 3 questions" · "Memberships — 4 questions" · "Kids and teens — 3 questions" (`MM F1`: name + count). Active group has a 2 px `primary` left bar and bold text.
- **Questions and answers (10):**
  **Getting started**
  1. *Do I need a card for a tour or a pass?* "No. Tours and the 3-day pass are free. We do not ask for a card." (open by default)
  2. *What should I bring on my first visit?* "Photo ID, if you want a 3-day pass. Wear what you move in. Bring a water bottle. We have towels for Summit members."
  3. *I am new or coming back from an injury. Where do I start?* "Book a tour and tell us. We match you with a coach and an easy class. Many members start with Mobility 30 or Aqua Fit."
  **Memberships**
  4. *Is there a contract?* "No. Memberships are month to month."
  5. *How do I cancel or freeze?* "Give 30 days' notice in the app or at the desk. A freeze costs $10 a month for 1 to 3 months."
  6. *What fees are there besides the monthly price?* "Enrollment is $0 during Fall climb (otherwise $49). A $49 annual facility fee is charged in March."
  7. *What are the booking rules?* (anchor `#booking`) "Book up to 7 days ahead (Summit: 9). Cancel free up to 2 hours before. Later is a late cancel. Three late cancels in 30 days pause booking for 3 days. Waitlists move up until 1 hour before class."
  **Kids and teens**
  8. *What ages can use kids club?* "Ages 6 months to 12 years, in 2-hour blocks. A parent checks in at the same club and stays in the building."
  9. *Can my teen train here?* "Yes. Teens 13 to 17 can book classes marked Teen OK, such as Teen Strength. A parent signs the waiver and manages billing. Strength floor use without a coach starts at age 16. Sauna and cold plunge are for ages 18 and up."
  10. *Is there an age limit for members?* "Adults of any age can join. We have easy classes, a warm-water pool and coaches who work with older members." (`MM §3 r31`)
- **Components:** Graphical `Accordion` (single open), `Tabs` (mobile groups), `Input`; JSON-LD `FAQPage`.
- **Interaction:** URL hash opens and scrolls to the question; opened item updates the hash (replaceState). Search filters questions by text and shows "No questions match 'zzz'." with the contact route.
- **States:** Static. **Responsive:** As above.

### 17.3 Escape route (`MM F5`)
- **Copy:** Card: "Still have a question?" "Call your club or send us a message. We answer within 1 business day." Buttons: "Call (480) 555-0100" (member services; club phone when a club is set), "Send a message" (→ `/contact`).

```
 Good questions.        [ (Q) Search the questions ]
 GETTING STARTED  3     (v) Do I need a card for a tour or a pass?
 MEMBERSHIPS      4         No. Tours and the 3-day pass are free...
 KIDS AND TEENS   3     (>) What should I bring on my first visit?
                        (>) I am new or coming back from an injury...
 +----------------------------------------------------+
 | Still have a question?  [Call ...] [Send a message]|
 +----------------------------------------------------+
```

---

## 18. Contact `/contact`

**Purpose:** Give a person a way to reach a human.
**Primary question:** "Who do I call or write to, and how fast?"
**Persona focus:** Ron and Linda (phone first).
**Section order:** 18.1 Header · 18.2 Club contact cards · 18.3 Message form · 18.4 Other ways.

### 18.1 Header
- **Copy:** H1 "Talk to a person." Lede "Call the club for the fastest answer. The desk is staffed 6:00 a.m. to 8:00 p.m." Note: "For a medical emergency, call 911."

### 18.2 Club contact cards (`ClubCard` variant `contact` = `list-row` + contact rows)
- **Grid:** Five cards, `lg`+ in a 3-column grid (3 + 2; each card shows the city as a bold heading with the address under it, `mobbin-standard-pass §2 rule 5`); `md` 2 + 2 + 1; `base` 1 col. Each: name, address with "Get directions", phone as a large tap link (44 px), hours (`HoursTable` compact: weekdays | weekend), status line, "Book a free tour" (primary). Large phone number in `data` style 16/24 600 underlined (`link`).
- **Components:** `ClubCard`, `HoursTable`, Graphical `Button`.

### 18.3 Message form (`ContactForm`)
- **Grid:** Form span 7, side note span 5.
- **Fields:** First name (required) · Email (required) · Topic `Select` (Tour or pass; Membership; Billing; Kids club; Press; Something else) · Club `Select` (optional, prefilled with my club) · Message `Textarea` (required, 10–1000 chars, counter shown at 900+) · Consent text: "We use this to answer you. Privacy policy." No checkbox needed for service replies. Submit: "Send message". Honeypot field and rate limit (no CAPTCHA, `05` §4).
- **Copy:** Response promise "We reply within 1 business day." Success: Toast + inline panel "Thanks, {first name}. We will reply by {date}." Errors: field-level; server error "We could not send that. Call (480) 555-0142 or try again." Prefill via `?topic=` and `?coach=`.
- **Components:** Graphical `Form`, `Field`, `Input`, `Select`, `Button`; shadcn `textarea`.
- **States:** Sending, success, error, and rate limit ("Too many messages. Try again in a few minutes.").

### 18.4 Other ways
- Three icon rows: "Accessibility feedback → `/legal/accessibility`" · "Press: press@cactuspeakathletic.com" (placeholder) · "Careers → `/careers`".

```
 Talk to a person.   Call the club for the fastest answer...
 [Dobson card] [Red Mountain card] [Downtown card]
 [Val Vista card] [Heritage card]
 +--------------------------------------+  We reply within 1 business day.
 | First name [__] Email [__]           |  Accessibility feedback ->
 | Topic [v] Club [v] Message [______]  |  Press ... Careers ...
 | [ Send message ]                     |
 +--------------------------------------+
```

---

## 19. Journal

### 19.1 Journal index `/journal`
**Purpose:** Give search visitors and members useful, local reading.
**Primary question:** "Is there good advice here?"
**Section order:** 19.1.1 Header and category tabs · 19.1.2 Featured post · 19.1.3 Post grid · 19.1.4 Newsletter strip · 19.1.5 Tour band.
- **19.1.1** — H1 "The Journal." Lede "Training notes from our coaches. Written in Mesa and Gilbert, in the heat." Tabs (five or fewer): All · Train · Eat and recover · Families · Club news (Graphical `Tabs`).
- **19.1.2 Featured post** — `JournalCard` variant `feature`: image 16:9 (span 7), title, dek, author `InstructorChip`, reading time, category. 
- **19.1.3 Post grid** — `JournalCard` ×9, 3 per row; numbered pagination (shadcn `pagination`, `npx shadcn@latest add pagination`), 9 per page. Card: image 3:2, category, title (`l`), dek (2 lines), author, "5 min read".
- **19.1.4 Newsletter strip** — "One note a month. No spam." `Field` email + "Subscribe" (outline). Consent text. Success toast.
- **States:** Empty category: `EmptyState` "Nothing here yet. Read the latest instead." Error on subscribe: inline.
- **Responsive:** 1 column at `base`, 2 at `md`.

### 19.2 Journal article `/journal/your-first-climb-cycle`
**Purpose:** Be useful and move the reader toward a class or a tour.
**Primary question:** "Does this answer my question, and what should I do next?"
**Section order:** 19.2.1 Article header · 19.2.2 Body · 19.2.3 Inline cards · 19.2.4 Author box · 19.2.5 Related posts · 19.2.6 Tour band.
- **19.2.1 Header** — Breadcrumb Home › Journal › Your first Climb Cycle. Category chip (shadcn `badge`). H1 `xl`: "Your first Climb Cycle: five things to know". Dek (one sentence, ≤25 words): "Heavy load, short hills and a coach calling the numbers. Here is how to get through your first 45 minutes." Meta: `InstructorChip` (Marisol Vega), "Oct 12, 2026 · 6 min read". Hero image `IMG-JRN-{slug}-HERO` 16:9, caption below.
- **19.2.2 Body** — Grid: article column span 8 offset 2 at `lg`+ (max 680 px, line length ≤68 characters); table of contents (sticky, span 2, `lg`+ for articles over 1,500 words) with `nav aria-label="In this article"`. Typography: Editorial role (Inter 400 16/24), H2 `l` Archivo 600, lists, pull quote (`l`, left rule 4 px `primary`), images 3:2 with captions, tables scroll. Links `link` colour underlined.
- **19.2.3 Inline cards** — Embedded `ClassCard` `compact` ("Try Climb Cycle · Today 6:00 a.m. · Val Vista") and `CoachCard` `compact` blocks, max 2 per article. A mid-article `PromoBand` variant `inline` ("Try a class free. Get a 3-day pass.") after the 3rd section.
- **19.2.4 Author box** — Avatar 64 px, name, credential line, "More from Marisol" and coach profile link.
- **19.2.5 Related** — Three `JournalCard`.
- **19.2.6 Tour band** — `TourCTABand` compact.
- **Share:** native share and copy link buttons at the top and bottom (`Button` ghost icon). 
- **States:** Missing image: no hero placeholder; layout adapts. Print stylesheet: body only.
- **Responsive:** Full width with 16 px margins at `base`; images bleed to margins.

```
 Home > Journal > Your first Climb Cycle
 [Train]
 Your first Climb Cycle: five things to know
 Heavy load, short hills and a coach calling ...
 (MV) Marisol Vega . Oct 12, 2026 . 6 min read       [Share]
 [ hero 16:9 ]
 In this article        Body column (68ch) ...
  1. Arrive early       [inline ClassCard: Try Climb Cycle]
  2. ...
 Author box | Related (3) | Tour band
```

---

## 20. Promo landing `/offers/fall-climb`

**Purpose:** Explain the Fall climb offer in plain terms and move to Join.
**Primary question:** "What is the offer, when does it end, and are there strings?"
**Section order:** 20.1 Hero · 20.2 Terms in plain words · 20.3 Plan cards · 20.4 Tour band.
- **20.1 Hero** — Eyebrow "Fall climb" · H1 "$0 enrollment through Nov 30." · Support "Join any plan by Nov 30 and skip the $49 enrollment fee." Buttons: "Join now" (primary → `/join/plan`), "Book a free tour" (outline). Photo `IMG-PROMO-HERO` 4:3. No countdown clock, no urgency styling (`BG §8`).
- **20.2 Terms in plain words** — List: "Applies to Trailhead, Ridge and Summit. · Month to month. Cancel or freeze with 30 days' notice. · The $49 annual facility fee is still charged in March. · Offer ends Nov 30, 2026 at 11:59 p.m. Arizona time." (proposed end date)
- **20.3 Plan cards** — `PlanCardsSection` as §1.8.
- **20.4 Tour band** — As §1.13.
- **States:** After the end date the page shows `EmptyState` "This offer ended Nov 30. See current plans." with a link to `/membership`; `PromoBand` entries for it are removed by the CMS. Page keeps `200` (not 404) for SEO.

---

## 21. Careers

### 21.1 Careers index `/careers`
**Purpose:** Attract coaches, desk staff, lifeguards and kids club staff.
**Primary question:** "Is this a good place to work, and what is open?"
**Section order:** 21.1.1 Hero · 21.1.2 Why work here · 21.1.3 Open roles · 21.1.4 How we hire · 21.1.5 Equal opportunity and contact.
- **21.1.1 Hero** — H1 "Help people climb." Support "We hire coaches, lifeguards, kids club staff and front desk teams for five clubs in Mesa and Gilbert." Button: "See open roles" (anchor). Image `IMG-CAREERS-HERO` 3:2: staff huddle before opening, coffee, morning light.
- **21.1.2 Why work here** — Three icon-in-circle columns: "Free membership for you and your family" (proposed) · "Schedules that fit a life — shifts from 4:30 a.m. to 10 p.m." · "Training and certifications paid." (proposed)
- **21.1.3 Open roles** — Filters: `Select` club, `Select` department (Coaching, Aquatics, Kids club, Front desk, Facilities), `Select` type (full-time, part-time, seasonal). Rows (`JobRow`): title, club, type, pay range, "Apply". Row example: "Group fitness coach · Mesa – Dobson · Part-time · $22–$30 an hour". Count text "7 open roles". Empty: `EmptyState` "No open roles match. Send us your name for the next opening." with an email field (talent list, consent text). Components: Graphical `Select`, shadcn `table`/list, `Button`. Responsive: rows stack.
- **21.1.4 How we hire** — `TourTimeline` steps: Apply · Phone chat · Visit a club · Offer.
- **21.1.5 Equal opportunity** — Statement and accommodation contact (placeholder).

### 21.2 Job detail `/careers/[slug]`
- **Sections:** Header (title, club, type, pay), Overview (rich text), What you will do (list), What you bring (list), Benefits, Apply button (primary, external ATS), Share. `JobPosting` JSON-LD. Closed role: banner "This role is closed" with link to open roles; keep page 200 for 30 days.

---

## 22. Get the app `/app`

**Purpose:** Send members to the iOS app.
**Primary question:** "What does the app do, and where do I get it?"
**Section order:** 22.1 Hero · 22.2 What it does · 22.3 Screens.
- **22.1 Hero** — H1 "Your club, in your pocket." Support "Book classes, see how busy the club is, and scan in with one tap." Button: App Store badge (official, 44 px+ height). Desktop: QR code (`aria-hidden`, with text "Scan with your phone camera"). No Google Play badge (`MM §3 r35`).
- **22.2 What it does** — Three icon-in-circle columns: "Book and join waitlists" · "See live busyness" · "Check in with your pass" (`CheckInPass`).
- **22.3 Screens** — Three iPhone screenshots in a carousel (`IMG-APP-{n}` 9:19.5 aspect, from the iOS spec when it exists). Captions are text, not baked into images. Components: shadcn `carousel`, `RibMeter` for decoration only.
- **States:** Non-iOS device: show QR and "The app is for iPhone. On Android, use the member site." with link to `app.cactuspeakathletic.com`.

---

## 23. Search results `/search?q=`

**Purpose:** Show all matches when the quick dialog is not enough.
- **Layout:** H1 `Results for "cycle"` + count. Groups: Clubs, Classes, Coaches, Pages and FAQ, Journal (each a `ClubCard`/`ClassCard` `compact`/`CoachCard` `compact`/text row). Left filter list on `lg`+ (group counts). Pagination at 10 per group view.
- **States:** Loading: skeleton rows. Empty: `EmptyState` "We found nothing for 'zumba'. Try 'cycle', 'pool' or 'kids club'." + buttons "See all classes", "Ask a person". Error: "Search is not working. Browse classes or call your club."
- **Meta:** `noindex, follow`.

---

## 24. Error pages

### 24.1 404 `/404`
- **Copy:** `EmptyState` with the Rib Peak symbol (static, 96 px): H1 "That page took a rest day." Body "We could not find it. Try one of these." Buttons: "Find a club" (primary → `/clubs`), "See the schedule" (outline), "Search" (ghost, opens search). A `ClubCard` `compact` for my club if set. Footer and header stay.
- **Behaviour:** Status 404. Logs the path. Suggests a closest-match link when a redirect map has a near match (for example a removed class slug → its category).
- **Components:** `EmptyState`, Graphical `Button`, `SearchDialog` trigger.

### 24.2 500 `/500`
- **Copy:** H1 "Something broke on our side." Body "We are fixing it. Try again in a minute, or call member services at (480) 555-0100." Buttons: "Try again" (reload), "Go home". Plain page with header and footer if possible. Request ID shown in small text for support.

```
 (symbol)
 That page took a rest day.
 We could not find it. Try one of these.
 [ Find a club ]  [ See the schedule ]  [ Search ]
```

---

## 25. Legal pages `/legal/*`

**Pages:** privacy, terms, membership-agreement, waiver, kids-club-policy, cookies, sms-terms, accessibility, guest-policy.
**Purpose:** Be readable, findable and current.
**Section order:** 25.1 Header · 25.2 Body with table of contents · 25.3 Footer meta.
- **25.1 Header** — Breadcrumb Home › Legal › Privacy policy. H1 `xl`. "Last updated Oct 1, 2026 · Version 3." Buttons: "Print" (ghost, `window.print()`), "Download PDF" (ghost; file download: only on user click). Plain-language summary box ("The short version", 5 bullets in `s`) at the top of Privacy, Terms and Membership agreement.
- **25.2 Body** — Grid: TOC span 3 (sticky, `nav aria-label="On this page"`), body span 7 offset 1 (max 680 px). Numbered headings (H2) with anchor links; defined terms in bold on first use; tables for fees (membership agreement shows the fee table: enrollment $49 / $0 promo, annual facility fee $49 in March, freeze $10 a month, late-cancel rules). Type: Editorial role, `m`.
- **25.3 Footer meta** — "Questions about this page? Email privacy@cactuspeakathletic.com" (placeholder) · link to version history.
- **Cookies page:** includes the preference centre (`Switch` per category: Necessary (on, locked), Analytics (off by default), Marketing (off; not used at launch)). Save button "Save choices". State toast "Choices saved."
- **Accessibility statement:** conformance target WCAG 2.2 AA, known gaps list, feedback form route `/contact?topic=accessibility`, date of last audit.
- **Print:** Black on white, no nav or footer, URLs after links.
- **States:** Static (ISR). Draft legal text never published without review.
