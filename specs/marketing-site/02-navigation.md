# Marketing site 02 — Navigation

Tags (`MM §3 r6`, `MG r28`, `CL §2`, `FD §4`, `BG §7`, `TH radius.m`) are explained in `01-strategy-and-ia.md` §0.
Shared brand components keep their exact names from `../01-shared-brand-components.md`. This file defines only their page-specific use.
Site composites (new names in this spec) are defined in `04-components.md` §3.

## 1. Principles

1. **One way to start, always in the same place.** The header always shows "Book a free tour" and "Join" (`MM N1`, `MM TC1`, `MM §3 r22`).
2. **Five top-level items or fewer** (`MM §3 r36`): Clubs, Classes, Membership, Personal training, Kids & family.
3. **Mega menus only for Clubs and Classes** (`MM §3 r37`). Each menu has four columns and a feature card, with 20 links or fewer (`MM §3 r37`, `MM §4` "30 or more links"; `MG r28`).
4. **Show the range in the menu.** A menu shows photos, live status and intensity ribs, so a visitor can tell choices apart without opening a page (`FD §6` principle 1).
5. **Club is context.** The visitor's club is a lasting choice. It shows in the header, the footer and the defaults (`01-strategy-and-ia.md` §7).
6. **The footer repeats the answer to "where and when"** with five club links and hours (`MM §3 r33`, `r34`; `MM §4` "long city wall").
7. **Touch targets are 44 px or more** (`TH size.control`; `MM §3 r38`).

## 2. Breakpoints used by navigation

| Name | Width | Header mode | Grid |
|---|---|---|---|
| `base` | 0–639 | Mobile: drawer + bottom bar | 4 columns, 16 px gutter, 16 px margin |
| `sm` | 640–767 | Mobile: drawer + bottom bar | 4 columns, 16 px gutter, 24 px margin |
| `md` | 768–1023 | Tablet: drawer, header shows "Book a free tour" | 8 columns, 16 px gutter, 24 px margin |
| `lg` | 1024–1279 | Laptop: drawer, header shows both CTAs | 12 columns, 24 px gutter, 32 px margin |
| `xl` | 1280–1535 | Desktop: full nav + mega menus | 12 columns, 24 px gutter, content max 1200 px, centred |
| `2xl` | 1536+ | Desktop, same as `xl`; content stays 1200 px | 12 columns |

Reason for the `xl` switch: at 1024 px the logo (200 px minimum), five labels and two CTAs do not fit in one row. A drawer at `lg` avoids a crowded bar (`MM §4` icon-heavy items).

---

## 3. Header (desktop, `xl` and above)

### 3.1 Stack of bars

| Layer | Height | Content | Scrolls away? |
|---|---|---|---|
| 1. Promo bar (`PromoBand` variant `bar`) | 44 px | One line of offer text and one text link. Dismiss button. Shown only when a `Promo` with `placement: top-bar` is active. | Yes |
| 2. Utility bar | 44 px | Left: `ClubSwitcher` (inline). Right: Schedule · About · Journal · FAQ · Contact · club phone · Member login | Yes |
| 3. Main header | 72 px (64 px compact) | Logo · primary nav · Search · Join · Book a free tour | **No — sticky** |

Colours: promo bar `secondary` (Saguaro Night) with `secondary-foreground` text. Utility bar `surface-muted`. Main header `surface` (white) with a 1 px `border` (Caliche) bottom line that appears after 8 px of scroll. No shadow. No gradient (`BG §9`).

### 3.2 Desktop wireframe (promo bar + utility + main header, `xl`)

```
+--------------------------------------------------------------------------------------------------+
| Fall climb: $0 enrollment through Nov 30.  Join now ->                                        [x]|  44 px  secondary
+--------------------------------------------------------------------------------------------------+
| (o) Gilbert - Val Vista  Open until 10 p.m.  v     Schedule  About  Journal  FAQ  Contact        |
|                                          (480) 555-0100     [ (u) Member login ]                 |  44 px  surface-muted
+--------------------------------------------------------------------------------------------------+
|  /\ CACTUS PEAK    Clubs v   Classes v   Membership   Personal training   Kids & family            |
|  ATHLETIC                                                    (Q)   [ Join ]  [ Book a free tour ]|  72 px  surface, sticky
+--------------------------------------------------------------------------------------------------+
 |<-------------------------------------- 1200 px content, centred ----------------------------->|
```

### 3.3 Main header specification

| Part | Spec |
|---|---|
| Logo | `cpa-horizontal-color.svg`, 220 px wide (minimum 200 px, `BG §3`). Link to `/`. `aria-label="Cactus Peak Athletic, home"`. Clear space of one summit rib on all sides (`BG §2`). |
| Nav list | Graphical `NavigationMenu` (`List`, `Item`, `Trigger`, `Link`). Labels use `type.s` (Inter 14/20, 600 via `button` style). Item hit area 44 px high, 12 px horizontal padding. Active page: `text` colour plus a 2 px `primary` underline (copper means active state, `BG §6`). |
| Trigger icon | Lucide `ChevronDown`, 16 px, rotates 180° when open (150 ms). |
| Search | Graphical `Button` `variant="ghost"`, icon-only `Search` (24 px icon, 44×44 target), `aria-label="Search clubs and classes"`. Opens the search dialog (§9). Shortcut: `/` or `Cmd/Ctrl+K`. |
| Join | Graphical `Button` `variant="outline"`. Label "Join". Link to `/join`. |
| Book a free tour | Graphical `Button` `variant="primary"`. Label "Book a free tour". Link to `/tour` with `?club=` when "my club" is set. Always the same label and position on every page (`MM §3 r22`). |
| Gap | 8 px between buttons, 16 px between search and Join. |

### 3.4 Sticky behaviour
1. `position: sticky; top: 0` on the main header. `z-index: 50`.
2. Promo bar and utility bar scroll away with the page.
3. A sentinel element above the main header uses `IntersectionObserver`. When the sentinel leaves the viewport the header enters "compact" state: height 72 → 64 px over 150 ms (`TH motion.duration`), bottom border shows. No scroll listener (performance, file 05 §6).
4. The header does **not** hide on scroll down. The CTA stays reachable (`MM TC1`).
5. In-page anchors use `scroll-margin-top: 88px` (header 64 px + 24 px gap) so headings are not covered (WCAG 2.2 2.4.11 Focus Not Obscured).
6. Pages with their own sticky tab bar (Club detail) stack it under the header at `top: 64px`.
7. Checkout routes (`/join/*`, `/tour`, `/trial`) swap to the **minimal header** (§3.8).

### 3.5 Desktop mega menu — Clubs

Open: hover (100 ms intent delay) or click or keyboard. Close: pointer leaves the trigger and panel (150 ms delay), `Esc`, or click outside.
Panel: full content width (1200 px), `surface`, radius `l` (20 px) on the bottom corners, `shadow.m` (documented popover exception in `TH shadow`), padding 32 px. A scrim (`secondary` at 30%) covers the page below the header. It is a solid tint, not a gradient. Panel opens with 150 ms opacity + 4 px upward move. Reduced motion: opacity only, 0 ms.

Grid inside the panel: 12 columns, 24 px gutter. Four link columns take 2 columns each (8). The feature card takes 4.

```
+----------------------------------------------------------------------------------------------------+
| MESA CLUBS               GILBERT CLUBS          FACILITIES              PLAN A VISIT     +----------+ |
| Three clubs, flagship    Swim school, courts    What each club has.     Try it before    | [photo ] | |
| to downtown studio.      and a rooftop.                                 you join.        | 4:3      | |
|                                                                                          | YOUR CLUB| |
| [pic] Mesa - Dobson  ->  [pic] Gilbert -        Aquatics  ->            Book a free tour | Gilbert -| |
|       Flagship  Open          Val Vista  Open   Courts  ->               ->              | Val Vista| |
| [pic] Mesa - Red Mtn ->        Full club        Recovery suite ->        Free 3-day pass | Swim     | |
|       Full club  Open    [pic] Gilbert -        Kids club  ->            ->              | school,  | |
| [pic] Mesa - Downtown->        Heritage  Open   Cycle studios ->         Day pass $20 -> | courts...| |
|       Studio club Open         Studio club                               Contact a club  | Open     | |
|                          All clubs and map ->                            ->              | until    | |
|                                                                                          | 10 p.m.  | |
|                                                                                          | [Tour    | |
|                                                                                          |  this    | |
|                                                                                          |  club]   | |
|                                                                                          +----------+ |
+----------------------------------------------------------------------------------------------------+
```

Contents, column by column (15 links, `MM §4` limit of about 20):

| Column | Heading (Archivo, eyebrow style) | One-line description (`type.s`, `text-muted`) | Links |
|---|---|---|---|
| A | Mesa clubs | "Three clubs, from the flagship to the downtown studio." | Mesa – Dobson · Mesa – Red Mountain · Mesa – Downtown. Each row: 56×42 px photo thumb (4:3), club name (`type.s` 600), type label ("Flagship", "Full club", "Studio club"), status line ("Open · until 10 p.m."), arrow icon. Component: `ClubCard` variant `compact`. |
| B | Gilbert clubs | "Swim school, courts and a rooftop." | Gilbert – Val Vista · Gilbert – Heritage (same row format) · "All clubs and map" (text link with `ArrowRight`) |
| C | Facilities | "What each club has." | Aquatics (`/aquatics`) · Courts (`/courts`) · Recovery suite (`/recovery`) · Kids club (`/kids`) · Cycle studios (`/classes/category/cycle`). Each row has a Lucide icon in a 32 px circle on `surface-muted` (`MM A1`) and a count line ("3 clubs"). |
| D | Plan a visit | "Try it before you join." | Book a free tour (`/tour`) · Free 3-day pass (`/trial`) · Day pass $20 (`/membership#day-pass`) · Contact a club (`/contact`) |
| Feature card | "Your club" (or "The flagship" when no club is set) | — | `ClubCard` variant `feature` (compact photo): 4:3 photo, club name, personality line, status line, `BusynessMeter` (mini), one filled Graphical `Button` "Tour this club". One filled button only (`MM §3 r3`). |

Each club row uses live status from the platform API. While loading, the row shows a 12-character skeleton. If the call fails, the row shows the static line "Open 4:30 a.m.–10 p.m." for weekdays and no colour (file 05 §3 errors).
Status copy: "Open · until 10 p.m." in `success` text with a dot icon, "Closed · opens 4:30 a.m." in `warning` text with a clock icon. Colour is never the only signal (`MM §3 r4`).

Column A and B show the club the visitor chose with a small "Your club" tag (`xs`, `primary-subtle` background, `link` text) and move it to the first row of its column.

### 3.6 Desktop mega menu — Classes

```
+----------------------------------------------------------------------------------------------------+
| CLASS TYPES (8)                                 POPULAR NOW             PLAN YOUR WEEK    +--------+ |
| Find the effort that fits you.                  Start here.             Pick a day.       |NEXT UP | |
|                                                                                           |[photo] | |
| [dumbbell] Strength        [flower] Mind & Body Climb Cycle  ||||.        Full schedule ->  |Climb   | |
| [bike]     Cycle           [waves]  Aqua        Desert Flow  ||...        Good for first-   |Cycle   | |
| [timer]    Conditioning    [court]  Court         Yoga                    timers ->       |6:00 am| |
|                            [snow]   Recovery    Rib Rack     |||..        Early birds       |Val     | |
| (Category icon + name, colour chip on left)     Strength                  (before 7 a.m.)->|Vista   | |
|                            [smile]  Youth       Aqua Fit     ||...        Meet the coaches ->|4 bikes | |
|                                                 Pickleball   ||...                         |left    | |
|                                                 Open Play                                  |[Book]  | |
+----------------------------------------------------------------------------------------------------+
```

| Column | Heading | Description | Links |
|---|---|---|---|
| A (span 4, two sub-columns of 4) | Class types | "Find the effort that fits you." | 8 category links: Strength · Cycle · Conditioning · Mind & Body · Aqua · Court · Recovery · Youth. Each row: 32 px `CategoryBadge` icon tile (category colour at a 10% tint with the category icon in the category colour) + category name (`type.s` 600) + class count ("5 classes"). Never colour only: icon and name always show (`FD §3`). Links go to `/classes/category/[slug]`. |
| B (span 2) | Popular now | "Start here." | Climb Cycle · Desert Flow Yoga · Rib Rack Strength · Aqua Fit · Pickleball Open Play. Each row has the class name and `IntensityRibs` (compact, with `aria-label="Intensity 4 of 5, Hard"`). Component: `ClassCard` variant `compact`. |
| C (span 2) | Plan your week | "Pick a day." | Full schedule (`/schedule`) · Good for first-timers (`/schedule?firstTimer=1`) · Early birds, before 7 a.m. (`/schedule?time=early`) · Meet the coaches (`/coaches`) |
| Feature card (span 4) | "Next up at your club" | — | `ClassCard` variant `featured` (compact size): photo, `CategoryBadge`, class name, time, `InstructorChip`, `CapacityIndicator` ("4 bikes left"), button "Book" → schedule handoff (§6.5 in file 01). Shows the next class today at the visitor's club that is "good for first-timers". Fallback when closed: tomorrow's first class. |

Column widths: A = 4, B = 2, C = 2, feature = 4 (total 12). Links total 8 + 5 + 4 = 17.

### 3.7 Plain links (no panel)
| Label | URL | Notes |
|---|---|---|
| Membership | `/membership` | Plain link (`MM §3 r37`) |
| Personal training | `/personal-training` | Coaches are reached from the page |
| Kids & family | `/kids` | Plain link |

### 3.8 Minimal header for flows (`/join/*`, `/tour`, `/trial`)
- Left: logo (symbol + wordmark, link to `/` with confirm if the form is dirty).
- Centre: step indicator for the flow (file 03 §8–§10).
- Right: "Need help? (480) 555-0100" (member services; in the tour flow the chosen club's phone replaces it once a club is picked) and "Save and exit" (join flow only).
- No nav, no search, no bottom bar. This removes exits during checkout (`MM TC2`).

### 3.9 Keyboard and screen reader behaviour (desktop)
| Key | Behaviour |
|---|---|
| `Tab` | Moves through logo, nav triggers, Search, Join, Book a free tour. Skip link first. |
| `Enter` / `Space` / `ArrowDown` on a trigger | Opens the panel; focus moves to the first link. |
| `ArrowLeft` / `ArrowRight` | Moves between top-level items. |
| `Esc` | Closes the panel; focus returns to the trigger. |
| `Tab` out of the last link | Closes the panel and moves on. |
Each trigger has `aria-expanded`. The nav has `aria-label="Primary"`. The skip link "Skip to main content" is the first focusable element and targets `#main`.

---

## 4. Member login entry and signed-in state

| State | Where | UI |
|---|---|---|
| Signed out | Utility bar right (desktop); drawer row 3 (mobile); footer "Member login" | Graphical `Button` `variant="ghost"`, `User` icon + "Member login". Links to `https://app.cactuspeakathletic.com/login`. |
| Signed in | Same places | `Avatar` (initials, 32 px) + "Hi, Maya" opening a Graphical `Menu`: "Open the app" (`app…/`), "My bookings" (`app…/bookings`), "Book a class" (`/schedule`), "Sign out" |
| Checking | Same places | 96 × 20 px skeleton in the utility bar. No layout shift: the slot width is reserved. |
| Error (session call fails) | Same places | Fall back to the signed-out state. No error shown. |

The marketing site does not host any sign-in form. It links to the web app. A signed-in member sees the same site, with these changes: the "Join" button is replaced by "Open the app" (outline); "Book a free tour" stays (members bring friends: label stays identical, `MM §3 r22`); the Home hero module shows "Your club".

---

## 5. Club selector and "my club" personalisation

Component: `ClubSwitcher` (shared). Page-specific use below. Full state logic is in `04-components.md` §3.12.

### 5.1 Triggers
| Place | Variant | Label |
|---|---|---|
| Utility bar (desktop) | inline | `MapPin` icon + "Gilbert – Val Vista" + status ("Open until 10 p.m.") + `ChevronDown`. With no club: "Find your club". |
| Mobile sub-header row | inline chip, 44 px high | Same text, truncated with ellipsis after one line; `aria-label` has the full text |
| Drawer row 4 | block | "Your club: Gilbert – Val Vista. Change" |
| Home hero | "Your club" strip | See file 03 §1 |
| `/tour`, `/trial`, `/join/club` | step field | Prefilled; "Change" link |

### 5.2 Selector panel
Desktop: Graphical `Popover` anchored under the trigger, 420 px wide. Mobile: Graphical `Drawer` from the bottom, 85% height.

```
+------------------------------------------------+
| Choose your club                          [x]  |
| We use this to show your hours and classes.    |
|                                                |
| ZIP code                                       |
| [ 85233          ]  [ Find ]                   |
| [ (o) Use my location ]                        |
|  Your browser will ask first. We use it once   |
|  and do not store it.                          |
|                                                |
| ( ) Gilbert - Val Vista             1.7 mi     |
|     Val Vista Dr & Warner Rd                   |
|     Open - until 10 p.m.   |||..  Steady        |
| ( ) Gilbert - Heritage              4.2 mi     |
|     ...                                        |
| ( ) Mesa - Downtown                 9.8 mi     |
| ( ) Mesa - Dobson                  11.3 mi     |
| ( ) Mesa - Red Mountain            13.0 mi     |
|                                                |
| [ Use this club ]   Clear my club              |
+------------------------------------------------+
```

| Element | Spec |
|---|---|
| ZIP field | Graphical `Field` + `Input`, `inputmode="numeric"`, `autocomplete="postal-code"`, `maxlength=5`, label "ZIP code". Validates 5 digits on blur and on Find. |
| Find | Graphical `Button` `variant="secondary"` 44 px. |
| Use my location | Graphical `Button` `variant="ghost"` with `LocateFixed`. Calls `navigator.geolocation.getCurrentPosition` only on click, timeout 8 s, `maximumAge` 5 min, `enableHighAccuracy` false. |
| Club rows | Graphical `RadioGroup` with each `Radio` row drawn as a `ClubCard` variant `list-row` (marketing finder card: address under the name and today's hours next to the status, `mobbin-standard-pass §2 rule 4`): 56×42 px thumb, name, address, status line with today's hours, `BusynessMeter` (compact), distance. Selected row: `primary-subtle` fill, `primary` 2 px edge, check icon. |
| Distance | Shown with one decimal ("1.7 mi") **only** after a ZIP or location was given this session (`MM §3 r5`). Rows sort by distance then. Without it, rows sort Mesa – Dobson, Mesa – Red Mountain, Mesa – Downtown, Gilbert – Val Vista, Gilbert – Heritage. |
| Primary action | Graphical `Button` `variant="primary"` "Use this club". Disabled until a row is chosen. Choosing a row from the panel also saves on click of the button only (no surprise change). |
| Clear | Text button "Clear my club". Deletes cookie `cpa_club`. |
| Storage | Cookie `cpa_club=<slug>`, 12 months, first-party, `SameSite=Lax`. Distance data stays in `sessionStorage` only. |

### 5.3 Error and edge states
| Case | Message | Action |
|---|---|---|
| ZIP is not 5 digits | "Enter a 5-digit ZIP code." (inline, `danger` text with `AlertCircle`) | Focus stays in field |
| ZIP unknown | "We can't find that ZIP code. Check it and try again." | — |
| ZIP far away (> 60 mi from all clubs) | "We don't have a club near {ZIP} yet. Here are all 5, nearest first." | List still shown with distances |
| Location denied | "Location is off for this site. Enter your ZIP code instead." | Focus moves to ZIP field |
| Location timeout | "We could not find you in time. Enter your ZIP code instead." | — |
| Distance service down | Rows show without distance. A line reads "Distances are not available right now." | — |
| Cookies blocked | Selection works for this page view only. Line: "Your choice will not be saved on this browser." | — |

### 5.4 What "my club" changes

| Surface | Change |
|---|---|
| Header utility bar | Shows the club name + live status |
| Clubs mega menu | "Your club" tag; feature card shows this club |
| Classes mega menu | Feature card shows next class at this club |
| Home | "Your club" strip under the hero; schedule teaser defaults to this club |
| `/clubs` | List scrolls to the club card; the club is highlighted on the map |
| `/schedule` | Club filter defaults to this club (visitor can switch to "All clubs") |
| `/tour`, `/trial`, `/join/club` | Club prefilled |
| `/membership` | Trailhead card shows "Home club: Gilbert – Val Vista" |
| Footer | Club row is highlighted (`primary-subtle` ring) and sorted first |
| Phone link | Utility bar and sticky bar use this club's phone |

Bots and first visits get no personalisation. The server renders the neutral page. The client adds personalisation after hydration. Content that depends on the club must reserve its space to avoid layout shift (file 05 §6, CLS ≤ 0.1).

---

## 6. Mobile navigation (`base`, `sm`, `md`)

Revision: this section applies `mobbin-standard-pass §2 rules 20 and 21` (full-screen overlay; close top-left, logo centred, search top-right; large links with a smaller secondary column). Evidence is one web capture (ZARA), so it must be tested at 375 px with real users before launch.

### 6.1 Mobile header (menu closed)
Height 56 px, `surface`, 1 px `border` bottom, sticky. Layout follows the overlay: menu button left, logo centred, search right (`mobbin-standard-pass §2 rule 20`).

```
+-----------------------------------------+
| [=]        /\ CACTUS PEAK          (Q)  |  56 px  sticky
|               ATHLETIC                  |
+-----------------------------------------+
| (o) Gilbert - Val Vista  Open until 10 v |  44 px  scrolls away
+-----------------------------------------+
```

| Part | Spec |
|---|---|
| Menu | Icon button 44×44 at the left, `Menu` icon, `aria-label="Open menu"`, `aria-expanded`. Opens the overlay. |
| Logo | `cpa-horizontal-color.svg` centred, 200 px wide (the minimum, `BG §3`). The header needs 200 + 2 × 44 + 2 × 16 = 320 px, which fits at 375. Below 360 px the symbol alone (40 px) replaces the lockup. |
| Search | Icon button 44×44 at the right, opens the search dialog full screen (§9). |
| Club chip row | `ClubSwitcher` inline, 44 px high, `surface-muted`, scrolls away. |

At `md` (768–1023) the header adds "Book a free tour" (primary) between the logo and the search button. The bottom bar is hidden from 768 px wide, because the header shows the CTA.

### 6.2 Full-screen overlay menu (two levels)
Component: `MobileDrawer`, built on Graphical `Drawer` set to full viewport (100dvh, 100vw, no side gap) at `base`, `sm` and `md`. At `lg` (1024–1279) the same menu opens as a 420 px side panel from the right. Scrim is not needed at full screen. Focus is trapped; `Esc` closes; focus returns to the Menu button. Body scroll locks. Open and close: 300 ms (opacity + 8 px upward move; reduced motion: opacity only).

**Level 1 (root panel).** Header bar: close `X` top-left, logo centred, search top-right (`mobbin-standard-pass §2 rule 20`). Below, in order:

```
+-----------------------------------------+
| [x]        /\ CACTUS PEAK          (Q)  |  1. bar: close | logo | search
+-----------------------------------------+
| (o) Your club: Gilbert - Val Vista      |  2. ClubSwitcher (block): ZIP field
|     Open until 10 p.m.        Change    |     = the "Find a club" field
+-----------------------------------------+
| Clubs                  >  | Schedule    |  3. Large links (left) +
| Classes                >  | About       |     smaller secondary column (right)
| Membership             >  | Journal     |
| Personal training      >  | FAQ         |
| Kids & family          >  | Contact     |
|                           | Careers     |
+-----------------------------------------+
| (u) Member login                    ->  |  4. Account row
+-----------------------------------------+
| Popular this week          (scroll ->)  |  5. Card row (scroll-snap)
| [ClassCard compact][ClassCard compact]  |
+-----------------------------------------+
| [ Join ]        [ Book a free tour ]    |  6. Sticky footer
| Download on the App Store               |
+-----------------------------------------+
```

| Part | Spec |
|---|---|
| Primary links | Archivo 600 `l` (24/30), 56 px rows, left column ~62% of the width. "Clubs" and "Classes" show a `ChevronRight` and open level 2. "Membership", "Personal training" and "Kids & family" are plain links (no chevron). (`mobbin-standard-pass §2 rule 21`: large links.) |
| Secondary links | Inter 600 `s` (14/20), 44 px rows, right column ~38%, divided by a 1 px `border`: Schedule, About, Journal, FAQ, Contact, Careers. (`mobbin-standard-pass §2 rule 21`: smaller column beside the large links.) |
| Find a club | The `ClubSwitcher` block holds the ZIP field and "Use my location". This keeps the "Find a club" field at the top (`MM §3 r38`) while the search icon sits top-right (rule 20). |
| Account row | "Member login" ghost row, or "Hi, Maya · Open the app" when signed in. |
| Card row | Weak evidence (`MM N4`, one capture). Hidden when the viewport height is under 640 px so the sticky footer never covers content. |
| Footer | Sticky inside the overlay: "Join" (outline) and "Book a free tour" (primary), 44 px, then the App Store badge only (`MM §3 r35`). |

**Level 2 (sub-panel).** Slides in from the right (300 ms). Header bar: back arrow top-left (`ArrowLeft`, 44×44, label "Back to menu"), panel title centred ("Clubs"), close `X` top-right. Focus moves to the panel title. Back returns focus to the row that opened it.

```
+-----------------------------------------+        +-----------------------------------------+
| [<]          Clubs                 [x]  |        | [<]         Classes                [x]  |
+-----------------------------------------+        +-----------------------------------------+
| [pic] Mesa - Dobson       Open until 10 |        | [Strength]   [Mind & Body]              |
| [pic] Mesa - Red Mountain Open until 10 |        | [Cycle]      [Aqua]                     |
| [pic] Mesa - Downtown     Open until 10 |        | [Conditioning][Court]                   |
| [pic] Gilbert - Val Vista Open until 10 |        | [Recovery]   [Youth]                    |
| [pic] Gilbert - Heritage  Open until 10 |        | Full schedule ->  First-timers ->       |
| All clubs and map ->                    |        | Popular: Climb Cycle, Desert Flow...    |
| FACILITIES                              |        +-----------------------------------------+
| Aquatics . Courts . Recovery . Kids club|
+-----------------------------------------+
```

| Item | Spec |
|---|---|
| Clubs panel | Five `ClubCard` `compact` rows (56×42 px thumb, name, status), 64 px high; "All clubs and map"; Facilities row of four links (44 px high chips); "Book a free tour" is in the sticky footer. |
| Classes panel | Eight category rows in a 2-column grid (icon tile + name, 56 px); "Full schedule" and "Good for first-timers" links; three popular classes with `IntensityRibs`. |
| Motion | Level change: 300 ms slide; reduced motion: instant swap. |
| Announcements | On entering level 2 a live region announces "Clubs, 5 items". |

**Testing note.** The evidence is a single web capture (`mobbin-standard-pass §2 rule 20` says "test the rule at 375 px"). Test at 375 and 390 px widths and with 200% text size: the two-column layout at level 1 must not wrap "Personal training" onto more than two lines. If it does, the secondary column moves below the primary links.

### 6.3 Bottom sticky CTA bar (`base`, `sm`)
Component: `BottomActionBar` (site composite). Fixed to the bottom, `surface`, 1 px `border` top, padding 12 px 16 px + `env(safe-area-inset-bottom)`. Two buttons, 44 px high, 12 px gap.

```
+-----------------------------------------+
|  [   Book a free tour   ] [   Join    ] |   primary (flex 1.5)  outline (flex 1)
+-----------------------------------------+
```

| Page | Left button (primary) | Right button (outline) | Source |
|---|---|---|---|
| Default (Home, Classes, Membership, Programs, About, Journal) | Book a free tour | Join | `MM §3 r22` |
| Club detail | Tour this club | Call the club | `MM §3 r11`, `r12` |
| Class type detail | Book a free tour | See times | — |
| Schedule | Book a free tour | Join | The row `BookingStateButton` is the main action in the page |
| Membership | Join {highlighted plan} | Book a free tour | — |
| Coach profile | Book an intro with {first name} | Book a free tour | `MM T4` |
| Hidden | Join flow, tour flow, trial flow, search dialog, drawer, 404, legal, when the soft keyboard is open | — | — |

Behaviour: The bar slides in 300 ms (`TH motion.duration-large`) after the hero CTA leaves the viewport; before that, the hero buttons serve. This avoids two sets of identical buttons on one screen. On pages without a hero CTA (Schedule, FAQ), it shows at once. Page bottom padding includes the bar height so no content is hidden (WCAG 1.4.10, 2.4.11). The cookie banner stacks above the bar (§10).

### 6.4 Tablet (`md`)
Header: logo · "Book a free tour" · Search · Menu. Drawer is 420 px wide from the right. No bottom bar.

---

## 7. Footer

Component: `SiteFooter`. Background `secondary` (Saguaro Night `#1C3328`), text `secondary-foreground` (Sand), links Sand, underlined on hover. Secondary text uses Caliche (`border` colour `#DDD2C1`), 9.1:1 on Saguaro Night. Dark mode: footer stays Saguaro Night; Sand text.
Patterns: `MM FT1`, `FT2`, `FT3`; `MM §3 r33`, `r34`; `MG r30`, `r33`.

### 7.1 Desktop footer

```
+----------------------------------------------------------------------------------------------------+
|  /\ CACTUS PEAK         CLUBS                      CLASSES        MEMBERSHIP       ABOUT            |
|  ATHLETIC               Mesa - Dobson              Strength       Plans & prices   Our story        |
|  Climb at your own      Dobson Rd & Southern Ave   Cycle          Family plans     Careers          |
|  pace.                  (480) 555-0114             Conditioning   Free 3-day pass  Journal          |
|                         * Open - until 10 p.m.     Mind & Body    Book a free tour FAQ              |
|  [ig] [fb] [yt]         Mesa - Red Mountain  ...   Aqua           Day pass         Contact          |
|                         Mesa - Downtown      ...   Court         Personal         Get the app      |
|  [App Store badge]      Gilbert - Val Vista  ...   Recovery       training         Accessibility    |
|                         Gilbert - Heritage   ...   Youth          Coaches          Member login     |
|                                                    Schedule       Kids & family                     |
+----------------------------------------------------------------------------------------------------+
|  HOURS AT EVERY CLUB                                                                               |
|  Mon-Fri 4:30 a.m.-10:00 p.m.  |  Sat-Sun 6:00 a.m.-8:00 p.m.  |  Staffed 6:00 a.m.-8:00 p.m.      |
|  Kids club Mon-Sat 8 a.m.-12 p.m. and 4-8 p.m.  |  Pools close 30 minutes before the club.         |
|  Holiday hours: Thanksgiving Day 6:00 a.m.-12:00 p.m.  (shown only when set in the CMS)            |
+----------------------------------------------------------------------------------------------------+
|  (c) 2026 Cactus Peak Athletic . Privacy . Terms . Membership agreement . Cookies . Accessibility  |
|  . SMS terms . [Your privacy choices]            Fictional brand made for a university project.     |
+----------------------------------------------------------------------------------------------------+
```

| Block | Grid (12 columns) | Contents |
|---|---|---|
| Brand | span 3 | `cpa-horizontal-reversed.svg` (Dawn Copper + Sand on Saguaro Night, `BG §4`), 220 px; tagline "Climb at your own pace." (Archivo 600, `type.l` 24/30 → at footer use `type.s` 14/20 in Sand); social icons (Instagram, Facebook, YouTube; Lucide, 24 px in 44 px targets); App Store badge |
| Clubs | span 3 | Five club entries. Each: name (link, 600), cross streets (`xs` 12/16, Caliche), phone (tel link), status line ("Open · until 10 p.m." with dot icon). 12 px between entries. Visitor's club first with "Your club" tag. This is the club list with hours (`MM FT3`, `MM §3 r34`). |
| Classes | span 2 | 8 category links, Schedule |
| Membership | span 2 | Plans & prices · Family plans · Free 3-day pass · Book a free tour · Day pass · Personal training · Coaches · Kids & family |
| About | span 2 | Our story · Careers · Journal · FAQ · Contact · Get the app · Accessibility · Member login |
| Hours band | span 12 | Two-column hours in the format `MG r30` (weekdays left, weekend right) plus kids club and pool note. Today's row bold (`MM §3 r13`). |
| Legal row | span 12 | Links at 14 px. "Your privacy choices" opens the cookie preference centre. |

Footer has 4 link columns as `MM §3 r33` requires (Clubs, Classes, Membership, About) plus the brand block. No city wall (`MM §4`).

### 7.2 Mobile footer
Single column. Order: brand + tagline → App Store badge → social → **Clubs** (accordion section "Clubs and hours", open by default) → Classes (accordion) → Membership (accordion) → About (accordion) → Hours band (as a definition list) → legal links (stacked, 44 px rows). Accordion uses Graphical `Accordion`. Each trigger 56 px high.

### 7.3 Footer states
| State | Behaviour |
|---|---|
| Live status loading | Static hours text "Open 4:30 a.m.–10 p.m." for weekdays; no colour |
| Live status fails | Same static text |
| Club closed now | "Closed · opens 4:30 a.m." with clock icon in Sand-dark `warning` tint (`warning` dark token `#F2B14C` on Saguaro Night passes 7:1) |
| Holiday hours present | One line under the hours band |

---

## 8. Breadcrumbs

Component: shadcn `breadcrumb` (`npx shadcn@latest add breadcrumb`) styled with theme tokens. `type.s`, separator Lucide `ChevronRight` 16 px. Current page is plain text with `aria-current="page"`. Links use `link` colour (`#9E4522`), underline on hover. Row height 44 px. Sits on the Sand page background above the hero, never on a photo (contrast).

| Template | Trail |
|---|---|
| Home, Join flow, Search, 404 | none |
| Clubs index | Home › Clubs |
| Club detail | Home › Clubs › Gilbert – Val Vista |
| Classes index | Home › Classes |
| Category landing | Home › Classes › Cycle |
| Class type | Home › Classes › Cycle › Climb Cycle |
| Schedule | Home › Schedule |
| Membership | Home › Membership |
| Trial / Tour | Home › Free 3-day pass / Home › Book a tour |
| Kids, Aquatics, Courts, Recovery | Home › Kids & family (and so on) |
| Personal training | Home › Personal training |
| Coaches index | Home › Personal training › Coaches |
| Coach profile | Home › Personal training › Coaches › Marisol Vega |
| About | Home › About |
| FAQ, Contact, Careers | Home › FAQ (and so on) |
| Careers detail | Home › Careers › {role} |
| Journal | Home › Journal; Home › Journal › {title truncated at 40 chars} |
| Legal | Home › Legal › Privacy policy |

Mobile (`base`, `sm`): the trail collapses to one back link: `ArrowLeft` + parent name ("Clubs"), 44 px high. Each template emits `BreadcrumbList` JSON-LD with the full trail.
If a class sits in two categories, the trail uses its primary category.

---

## 9. Search

### 9.1 Entry points
Header icon button (desktop and mobile), drawer search field, `/` key, `Cmd/Ctrl+K`, and the 404 and empty-state pages.

### 9.2 Dialog
Components: Graphical `Dialog` containing shadcn `command` (`npx shadcn@latest add command`). Desktop: 640 px wide, centred, 96 px from the top. Mobile: full screen.

```
+---------------------------------------------------------+
| (Q) [ Search clubs, classes, coaches...        ]   Esc  |
+---------------------------------------------------------+
| CLUBS                                                   |
|  [pic] Gilbert - Val Vista     Swim school, courts...   |
| CLASSES                                                 |
|  [bike] Climb Cycle            Cycle . 45 min . ||||.   |
|  [bike] Rhythm Ride            Cycle . 45 min . |||..   |
| COACHES                                                 |
|  (face) Marisol Vega           Cycle coach              |
| PAGES AND FAQ                                           |
|  Kids club hours               FAQ                      |
+---------------------------------------------------------+
| See all results for "cycle"                         ->  |
+---------------------------------------------------------+
```

| Element | Spec |
|---|---|
| Empty query | Group "Popular": 5 clubs (compact rows), "Classes starting soon at your club" (3 rows with time), "Quick links" (Free 3-day pass, Book a free tour, Prices, Kids club hours). Icon rows with one-line subtitles (`MM N3`). |
| Typeahead | Debounce 120 ms. Client index (MiniSearch, ~150 entries built from CMS at build time, lazy-loaded on first open, ≤ 40 KB gzip). Groups: Clubs, Classes, Coaches, Pages and FAQ, Journal. Max 4 results per group. |
| Synonyms | spin → Cycle, Climb Cycle; pool/swim/lap → Aquatics, Lap Swim; childcare/daycare/babysitting → Kids club; weights/lifting/powerlifting → Strength, Olympic Lifting Club; sauna/cold plunge/ice bath → Recovery; pickle ball → Pickleball; yoga/pilates/stretch → Mind & Body; personal trainer → Personal training |
| Row anatomy | 56 px high. 40 px leading visual (club photo, category icon tile, coach avatar). Title (`type.s` 600), subtitle (`xs`, `text-muted`), trailing mini `IntensityRibs` for classes. |
| Keyboard | `ArrowUp/Down` moves the active row; `Enter` opens; `Esc` closes; `Tab` leaves the dialog. Active row uses `surface-muted` fill and a 2 px Monsoon Sky focus ring. |
| Full results | "See all results for …" opens `/search?q=…` (SSR from the CMS search index). |
| Loading | Skeleton rows (3) for the full results page. The dialog is instant (client index). |
| No results | `EmptyState`: "We found nothing for 'zumba'." Next line: "Try 'cycle', 'pool' or 'kids club'." Buttons: "See all classes" (outline), "Ask a person" (links to `/contact`). Event `search_no_results`. |
| Error | Index failed to load: "Search is not working right now. Browse the schedule or call your club." with two links. |
| Privacy | Queries are sent to analytics as `search_query` only after removal of text that looks like an email or phone number. |

---

## 10. Overlays, layering and global bars

| Layer | z-index | Notes |
|---|---|---|
| Page content | 0 | |
| Sticky tab bar (Club detail) | 40 | Sits under the header |
| Cookie banner | 45 | Bottom of viewport, small (max 360 px wide on desktop, full width on mobile), never over the hero copy (`MM §4`). On mobile it sits above the bottom bar. |
| Header | 50 | |
| Mega menu scrim | 55 | |
| Mega menu popup | 60 | |
| Bottom action bar | 50 | |
| Drawer | 70 | |
| Dialog / Search | 80 | |
| Toast | 90 | `Toast` region bottom-left on desktop, top on mobile so it does not hide the bar |

Skip links: "Skip to main content" (first), "Skip to club hours" (on club pages, second), "Skip to footer" (third on long pages). They show on focus with a 2 px Monsoon Sky ring.
Landmarks: `header` (banner), `nav aria-label="Primary"`, `nav aria-label="Breadcrumb"`, `main#main`, `footer` (contentinfo), `nav aria-label="Footer"` per link column group.

## 11. Components used by navigation

| Role | Component | Library |
|---|---|---|
| Desktop nav and mega panels | `NavigationMenu` (`List`, `Item`, `Trigger`, `Content`, `Link`, `Positioner`, `Popup`, `Viewport`) | Graphical |
| Mobile menu (full-screen overlay, two levels) | `Drawer` | Graphical |
| Footer sections (mobile) | `Accordion` | Graphical |
| Club selector (desktop) | `Popover` | Graphical |
| Club selector (mobile), search (mobile) | `Drawer`, `Dialog` | Graphical |
| Search shell | `Dialog` + `command` | Graphical + shadcn |
| Buttons | `Button` (`primary`, `outline`, `ghost`, `secondary`) | Graphical |
| Fields | `Field`, `Input` | Graphical |
| Club options | `RadioGroup`, `Radio` | Graphical |
| Signed-in menu | `Menu`, `Avatar` | Graphical |
| Footer sections (mobile) | `Accordion` | Graphical |
| Dividers | `Separator` | Graphical |
| Breadcrumbs | `breadcrumb` | shadcn |
| Toasts | `Toast` | Graphical |
| Brand objects | `ClubSwitcher`, `ClubCard` (`compact`, `list-row`, `feature`), `ClassCard` (`compact`, `featured`), `CategoryBadge`, `IntensityRibs`, `BusynessMeter`, `CapacityIndicator`, `InstructorChip`, `EmptyState`, `PromoBand` | Shared brand |
| Site composites | `SiteHeader`, `UtilityBar`, `MegaMenuClubs`, `MegaMenuClasses`, `MobileDrawer`, `BottomActionBar`, `SiteFooter`, `SearchDialog`, `SiteBreadcrumbs`, `SkipLinks`, `MinimalCheckoutHeader` | Site (`04-components.md` §3) |
