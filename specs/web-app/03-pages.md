# Cactus Peak Athletic — Member web app: pages

Citation tags and rule IDs [P#] (now settled in `../00-foundation.md` §4) are defined in `01-product-and-ia.md`. Component names and variant names are the shared ones from `../01-shared-brand-components.md` and `-part2.md`; this file only says how the web app uses them. Flows are in `02-flows.md`. Component props are in `04-components.md`. Copy library and a11y are in `05-content-accessibility-and-states.md`.
Example data: member **Maya Brandt** (primary, Ridge, home club Gilbert – Val Vista), **today = Tuesday, Oct 27, 2026, 5:40 a.m.** (Arizona time). Household: Chris Brandt (adult), Theo (9), Ivy (6). Cast used in examples:

| Person | Role | Where |
|---|---|---|
| Marisol Vega | Cycle instructor | Gilbert – Val Vista |
| Tomás Reyes | Strength instructor | Mesa – Downtown, Gilbert – Heritage |
| Aisha Brooks | Mind & Body instructor | Gilbert – Val Vista |
| Kenji Ito | Conditioning instructor | Gilbert – Val Vista |
| Dana Whitfield | Aqua instructor | Mesa – Dobson |
| Luis Ortega | Court instructor (Pickleball Clinic) | Mesa – Red Mountain |
| Hannah Cole | Youth instructor (Teen Strength) | Gilbert – Val Vista |
| Ruth Nakamura | Recovery and mobility | Mesa – Dobson, Gilbert – Val Vista |
| Devon Hart | Cycle instructor | Gilbert – Val Vista |
| Coach Sam Okafor | PT: return to training | Mesa – Dobson, Mesa – Red Mountain |
| Coach Elena Duarte | PT: Olympic lifting | Gilbert – Heritage, Mesa – Downtown |
| Coach Marcus Hale | PT: swim technique | Gilbert – Val Vista, Mesa – Dobson |
| Coach Rosa Lindgren | PT: mobility, pickleball conditioning, older adults | Mesa – Red Mountain |
| Coach Jake Whitcomb | PT: youth and teen athletic development | Gilbert – Val Vista |

All names are fictional.

## 0. Global page conventions

### 0.1 Grid, spacing, type (from Theme)

| Item | Value |
|---|---|
| Breakpoints (Tailwind) | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536 |
| Content width | max 1200 px, centred; gutters 32 / 24 / 16 px (≥1024 / 768–1023 / <768) |
| Grid | 12 columns at ≥1024 (gap 24), 8 at 768–1023 (gap 16), 4 below (gap 16) |
| Section gap | 32 px (`space.xl`); inside card 24 px (`space.l`), 16 px below 768 |
| Card | `surface` fill, 1 px `border`, radius `m` (14 px), no shadow. Popovers, dialogs and drawers use `shadow-m` (documented exception in the Theme). |
| Controls | 44 px high (`size.control`), radius `s` (10 px) |
| Page title | Archivo 800 `xl` 36/40 (≥768), `l` 24/30 below |
| Eyebrow above title | Archivo 600 uppercase 12/16, +0.24em, `text-muted` |
| Section title | Archivo 600 `l` 24/30 |
| Card title | Inter 600 `m` 16/24 |
| Body / data | Inter `m` 16/24 · times, prices, counts in Archivo 500 tabular `data` 16/24 · big numbers Archivo 700 `data-l` 36/40 |
| Dense lists, labels | `s` 14/20 · help text `xs` 12/16 · tab-bar labels only `xxs` 11/14 |
| Colour use | Sand page, white cards. Copper (`primary`) only for primary action, active nav and selected state. Success for booked. Warning (amber) for low spots, held, expiring. Danger (Chili) only for destructive actions and failed payment. Focus ring Monsoon Sky 2 px. |
| Icons | Lucide outline, 2 px stroke, 20 px in controls, 24 px in headers |

### 0.2 Page header pattern (`PageHeader`)
Eyebrow (club or date context) · title · optional one-line description (max 70 characters) · right-aligned actions (max 1 primary + 2 secondary). Below 768 px the actions wrap under the title in a row; the primary action becomes full width.

### 0.3 Standard states (every page must implement all four)

| State | Pattern |
|---|---|
| **Loading** | Skeleton shapes that match the final layout (`Skeleton`), plus a visible line of text with `role="status"` (for example "Checking availability…", "Loading your bookings…") (W §4 r7; W §5 a1). Skeletons show after 200 ms and stay at least 300 ms to avoid flicker. Reduced motion: no shimmer. |
| **Empty** | `EmptyState`: icon or small line art, one-line headline, one line of help, one primary button, optional secondary link (W §3.9: Customer.io, Sprig). Never a blank panel. Page-specific copy is in file 05. |
| **Error** | Card with `TriangleAlert`, headline "We couldn't load {thing}.", help "Your bookings are safe. Try again.", buttons "Try again" and "Message the front desk". Error code in `xs` text. Partial failure: only the failed card shows the error; other cards render. |
| **Offline** | Offline banner under the top bar. Pages that have cached data show it with a label "Saved Oct 27, 5:12 a.m." Buttons that need the network are disabled with `Tooltip` "Reconnect to do this". Cached pages: Today, Bookings, Pass, Club detail (hours only). |

### 0.4 Wireframe legend
`[ ]` button · `( )` radio/toggle · `[x]` checked · `###` photo · `|||||` ribs · `o` dot · `<` `>` arrows. Wireframes show the content area inside `AppShell` unless the page says otherwise. Widths are approximate.

---

## 1. Sign in — `/sign-in`

- **Purpose:** get a member in with the least effort.
- **Question answered:** "How do I get in?"
- **Roles:** public.
- **Layout (≥1024):** `login-03` block. Two columns of equal width. Left: form card, 400 px max, vertically centred. Right: full-height photo (East Valley morning light, direction in brand guidelines §7), with the Rib Peak symbol reversed in the top-left. Below 1024: photo hidden; form card on `background` with the horizontal logo above.
- **Order:** logo (horizontal, min 200 px) → heading "Welcome back" (`xl`) → text "Sign in to book classes, courts and more." → `Field` "Email" (`Input`, 44 px, `autocomplete="username webauthn"`) → primary `Button` "Continue with email" (full width) → `Separator` "or" → outline `Button` "Sign in with a passkey" (icon `KeyRound`) → text link "Use a password instead" → footer "Not a member yet? See plans" and "Need help? Call (480) 555-0142".
- **Components:** shadcn block `login-03`; Graphical `Field`, `Input`, `Button`, `Separator`, `OTPField` (verify page), `Form`.
- **Interactions:** autofocus email; Enter submits; conditional passkey UI. After submit the card swaps to the verify state (OTP + "Resend in 0:30"). Paste is allowed everywhere (WCAG 3.3.8).
- **States:** loading = button "Sending…"; error = inline `Field.Error` text (never a toast); offline = banner inside card; success = redirect.
- **Responsive:** single column; card padding 16 px; buttons full width.

```
+--------------------------------------+--------------------------------------+
|                                      |                                      |
|        [Cactus Peak Athletic]        |   ################################   |
|                                      |   ################################   |
|        Welcome back                  |   ####   (Superstition dawn)  ####   |
|        Sign in to book classes,      |   ################################   |
|        courts and more.              |   ################################   |
|                                      |   ##  /|\  Rib Peak (reversed)  ##   |
|        Email                         |   ################################   |
|        [ maya@example.com        ]   |                                      |
|        [   Continue with email   ]   |                                      |
|        ----------- or -----------    |                                      |
|        [ (key) Sign in with a passkey]                                      |
|        Use a password instead        |                                      |
|        Not a member yet? See plans   |                                      |
+--------------------------------------+--------------------------------------+
```

## 2. Welcome (onboarding) — `/welcome`

- **Purpose:** collect only what improves the first week. Flow in `02-flows.md` Flow 2.
- **Question answered:** "What should I set up first?"
- **Layout:** single column, 640 px max, centred, on `background`. Top: `Progress` bar (value = step/5) + text "Step 2 of 5" (W §5 a12) + `Back` ghost button. Body card. Sticky footer bar (W §4 r11) with "Skip for now" (ghost) and "Continue" (primary).
- **Step content:**
  1. **Home club** — heading "Where do you train most?" — 5 `ClubCard` (compact) in a `RadioGroup`, grouped MESA / GILBERT with eyebrow labels.
  2. **Interests** — "What do you like?" — grid of 8 `CategoryBadge` toggle chips (2 columns on mobile, 4 on desktop), each icon + name. `Switch` "Show first-timer classes first".
  3. **Goals** — "What are you aiming for?" — 5 radio cards (icon, title, one line). Then "Visits per week" `ToggleGroup` 1–7. Help "Rest days count too."
  4. **Notifications** — table: rows = topics, columns = Push / Email / Text, `Switch` in each cell, 44 px targets. Row labels as `Field` labels.
  5. **Pass and calendar** — CheckInPass preview card + calendar feed card + passkey card.
- **States:** saving = footer button spinner; error = banner "We couldn't save that step. Try again."; push blocked = inline note (Flow 2).
- **Responsive:** same layout; table in step 4 becomes a stacked list (topic, then three switches in a row).

```
  Step 2 of 5                                                       [< Back]
  [=========================-------------------------]
  +------------------------------------------------------------------------+
  |  What do you like?                                                     |
  |  Pick as many as you want. We use it to suggest classes.               |
  |  [ (barbell) Strength ] [ (bike) Cycle ] [ (timer) Conditioning ]      |
  |  [ (lotus) Mind & Body ] [ (waves) Aqua ] [ (court) Court ]            |
  |  [ (heart) Recovery ] [ (smile) Youth ]                                |
  |  ( ) Show first-timer classes first                                    |
  +------------------------------------------------------------------------+
  --------------------------------------------------------------------------
                                          [ Skip for now ]   [ Continue ]
```

---

## 3. Today — `/today`

- **Purpose:** the start page. It shows what happens today and what needs attention.
- **Question answered:** "What am I doing today, can I get in, how busy is my club, where is my pass?" (F §6.2).
- **Roles:** all. Teen: no Billing/Membership cards. Adult: household items filtered by "Everyone / Me".
- **Research:** stat row with four cells and dividers (W §4 r29); streak as day dots (W §4 r30); overdue-then-today grouping (W §3.2 Zoho); trial banner for top-level status (W §4 r28); one row order for classes (mobbin-standard-pass §2 rule 61); iOS home summary pattern adapted (G r15–r16).

### 3.1 Layout (≥1280; 12-column grid)

| Order | Section | Columns (≥1024) | Content and example copy | Components |
|---|---|---|---|---|
| 0 | Global banners (if any) | 12 | Payment failed / booking paused / held spot (WaitlistBanner) | `PaymentStatusBanner`, `WaitlistBanner` |
| 1 | Page header | 12 | Eyebrow "TUESDAY, OCT 27" · title "Good morning, Maya" · description "You have 2 things on today." · actions: "Show pass" (primary, icon `QrCode`), "Book a class" (outline) | `PageHeader`, `Button` |
| 2 | Next up | 8 | **NextUpCard**: category stripe (Cycle, Saguaro) and icon; eyebrow "NEXT UP · IN 20 MIN"; title "Climb Cycle"; "6:00–6:45 a.m. · Cycle Studio · Gilbert – Val Vista"; `InstructorChip` Marisol Vega; `IntensityRibs` 4 "Hard"; "Bike 14"; line "Cancelling now counts as a late cancel." (it is past 4:00 a.m.); buttons: "Show pass" (primary), "Details" (outline), "Cancel booking" (ghost). | `NextUpCard` (composes `ClassCard` `compact`), `CategoryBadge`, `InstructorChip`, `IntensityRibs`, `BookingStateButton` |
| 2b | Club status | 4 | **ClubStatusCard**: club photo strip (16:5), "Gilbert – Val Vista", "Open now · closes 10:00 p.m.", `BusynessMeter` variant `card` "Light · 2 of 5" with "Updated 5:35 a.m.", hint "Busier 6:00–7:00 a.m. Quieter after 8:30 a.m.", link "Popular times" | `ClubStatusCard`, `BusynessMeter`, `PopularTimesChart` (sparkline, compact) |
| 3 | Stat row | 12 | 4 cells with dividers (W §4 r29): **This week** "2 of 3 visits" as `ProgressRibs` variant `inline` (weekly goal) with 7 day dots from `VisitStreak` variant `strip` (W §4 r30) · **Streak** "9 weeks" · **Guest passes** "1 left" · **Booking window** "Nov 3 classes open at 6:00 a.m." (live countdown "in 20 min") | `StatRow` (4 `StatCell`), `VisitStreak`, `ProgressRibs` |
| 4 | Today's agenda | 8 | **TodayAgendaCard** list ordered by time with a vertical timeline: "6:00 a.m. Climb Cycle · Booked" · "4:00 p.m. Kids club · Theo and Ivy · 4:00–6:00 p.m. · Gilbert – Val Vista" · "4:30 p.m. Desert Flow Yoga · Studio A · Aisha Brooks · Booked". Each row has a category stripe, status chip and a chevron to details. Footer: "Find a class" link. | `TodayAgendaCard`, `ClassCard` (schedule-row, compact) |
| 4b | Needs attention | 4 | Cards in priority order: held spot / waitlist ("On the waitlist: Rib Rack Strength, Thu 6:00 a.m. · 2nd"), onboarding unfinished, passkey suggestion, card expiring ("Visa ending 4821 expires 11/26"). Max 3 shown; "See all" → Inbox. | `AttentionList`, `WaitlistBanner` (inline variant) |
| 5 | This week | 12 | Section title "This week". Horizontal list (scroll-snap) of 5 `ClassCard` (compact) for Wed–Sat bookings and reservations: "Wed 6:00 a.m. Climb Cycle", "Thu 6:00 a.m. Rib Rack Strength · Waitlist 2nd", "Sat 8:00 a.m. Kids club", "Sat 9:30 a.m. Lane 3 · Mesa – Dobson"… Link "All bookings". | `ClassCard` (compact), `ScrollArea` |
| 6 | Suggested for you | 12 | Title "Suggested for you". 3 `ClassCard` (card): 16:9 photo (the `ClassCard` `card` photo), duration badge bottom-right (W §4 r1), "4 spots left" badge on photo when under 5 (W §4 r9), category badge, instructor, ribs. Examples: "Sat 8:00 a.m. Switchback HIIT · Kenji Ito · 5 ribs", "Sun 9:00 a.m. Mobility 30 · Ruth Nakamura · 1 rib · First-timers", "Fri 12:00 p.m. Desert Flow Yoga". | `ClassCard` (card) with `CapacityIndicator` variant `badge-on-photo`, `Carousel` (shadcn) at <1024 |
| 7 | Promo | 12 | **PromoBand** variant `card` (shared §10.2): "Fall climb. Bring a friend. Send a guest pass." + button "Send a guest pass" (primary on dark uses Dawn Copper). Dismissible; hidden for 7 days per device (shared §10.2). | `PromoBand` |

### 3.2 Interactions
- "Show pass" opens the `CheckInPass` `full` in a `Dialog` (≥1024) or goes to `/pass` (<1024).
- Row click on any agenda item opens the session panel (intercepted route).
- "Cancel booking" opens Flow 5 branch A or B, using the clock. This card shows the correct rule text live.
- Busyness refreshes every 5 minutes; "Updated" time changes; no layout shift.
- Countdown in the "Booking window" cell uses server time; at 6:00:00 a.m. the cell flips to "Nov 3 classes are open" and a link "Browse Nov 3".
- Held spot: WaitlistBanner sits above the page header with countdown.
- Pull: no pull-to-refresh on web. A "Refresh" icon button is in the agenda header (aria-label "Refresh agenda").

### 3.3 State variants
| State | What changes |
|---|---|
| **Nothing booked today** | Next-up card becomes "Nothing booked today." with three one-tap suggestions (classes still open today at the viewing club) and button "Browse today's schedule". Copy: "A quiet day? Gilbert – Val Vista has 14 classes today." |
| **Frozen** | Next-up replaced by calm card "Your membership is frozen until Jan 11. See you Jan 12." + "Resume early". Stat row shows "Frozen" cell. |
| **Payment failed** | Banner on top; booking-related cards disabled with `payment_failed` state. |
| **Teen (Jordan)** | No Billing cards. Agenda shows own classes only. Guest pass and plan cells hidden; replaced by "Next Teen Strength: Wed 4:30 p.m.". |
| **Loading** | Skeleton for header, one tall card, stat row, 3 rows; status text "Loading your day…". |
| **Error** | Per-card error; agenda still shows cached data if present. |
| **Offline** | Cached agenda with "Saved 5:12 a.m."; club status shows "Offline: live count unavailable". |
| **New member (no history)** | Stat row cells show "—" with help text; "Suggested for you" shows first-timer classes first. |

### 3.4 Responsive
- 1024–1279: same grid; ClubStatusCard moves under NextUpCard (full width) if width under 1100.
- 768–1023: 8-column grid; NextUp (8), ClubStatus (8), StatRow becomes 2×2 grid, agenda (8), attention list (8).
- <768: one column; order: banners, header (primary button full width), NextUp, agenda, ClubStatus, attention, stat row (2×2), this week (horizontal scroll), suggested (horizontal carousel), promo. Bottom tab bar visible.

```
+-------------------------------------------------------------------------------------------+
| [=] [Gilbert - Val Vista |||oo Light v]  [ Search classes, clubs, coaches   Ctrl K ] [Pass][bell(2)][?][MB v] |
+-----------+-------------------------------------------------------------------------------+
| Today  *  |  [!] Spot held: Switchback HIIT, today 12:00 p.m.  Confirm by 6:05 a.m.  24:10  |
| Schedule  |      [ Confirm spot - 24:10 ] [ Release ]                                     |
| Bookings  |  TUESDAY, OCT 27                                          [ Show pass ][Book a class]
| BOOK      |  Good morning, Maya                                                           |
| Reserve   |  +------------------------------------------+ +-----------------------------+ |
| Training  |  | | NEXT UP - IN 20 MIN                    | | | ### Gilbert - Val Vista ### | |
| EXPLORE   |  | | (bike) Climb Cycle         [Cycle]     | | | Open now - closes 10:00 p.m.| |
| Clubs     |  | | 6:00-6:45 a.m. - Cycle Studio          | | | |||oo  Light (2 of 5)       | |
| Progress  |  | | (face) Marisol Vega   Hard ||||o       | | | Updated 5:35 a.m.           | |
| ACCOUNT   |  | | Bike 14                                | | | Quieter after 8:30 a.m.     | |
| Family    |  | | Cancelling now counts as a late cancel.| | | Popular times >             | |
| Membership|  | | [Show pass] [Details]  Cancel booking  | | +-----------------------------+ |
| Billing   |  +------------------------------------------+                                 |
| Guest pass|  +----------------+----------------+----------------+-----------------------+ |
|           |  | This week      | Streak         | Guest passes   | Booking window        | |
| Inbox (3) |  | 2 of 3  o o . .| 9 weeks        | 1 left         | Nov 3 opens in 20 min | |
| Settings  |  +----------------+----------------+----------------+-----------------------+ |
| Help      |  Today                                      Needs attention                   |
| (MB) Ridge|  6:00 a.m.  | Climb Cycle        Booked      On the waitlist: Rib Rack ... 2nd|
|           |  4:00 p.m.  | Kids club: Theo, Ivy            Card expires 11/26. Update >    |
|           |  4:30 p.m.  | Desert Flow Yoga   Booked                                     |
+-----------+-------------------------------------------------------------------------------+
```

---

## 4. Schedule — `/schedule`

- **Purpose:** find a class and see if you can get in.
- **Question answered:** "What can I do, when, and is there room?"
- **Roles:** all (teen sees all classes, teen-eligible ones are bookable).
- **Research:** list grouped by date; row = time, duration, title, type chip, host, spots, action in the shared order (W §3.3, W §4 r2–r3, r8; mobbin-standard-pass §2 rules 24, 61); date chips (W §4 r4); view toggle (W §4 r5); grouped filters in left sidebar (W §4 r6; W §5 a6); week grid with hour rows left, day columns, time-zone chip above (G r25–r26); coloured left stripe per type (W §4 r35); toolbar primary at top right (G r27: we have no create action, so the top-right slot holds the view toggle and "Today").

### 4.1 Layout — common header

| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Page header | Eyebrow = club name with ClubSwitcher link ("Gilbert – Val Vista, change"); title "Schedule"; right: `ToggleGroup` **Week / List** (default Week at ≥1280, List below; remembered per device), `Button` "Today", `Button` outline "Filters (2)" (opens the `ScheduleFilters` `drawer` variant in Week view and below 1280; hidden in List view at ≥1280 because the `sidebar` variant shows) | `PageHeader`, `ToggleGroup`, `Button` |
| 2 | Day strip | ScheduleDayStrip: chips "Today", "Tomorrow", "Thu 29", "Fri 30", "Sat 31", "Sun Nov 1", "Mon 2", "Tue 3", "Choose date" (opens `Calendar` popover; only one popover open at a time, W §5 a7). Days beyond the booking window show greyed with a tooltip "Opens Wed, Oct 28 at 6:00 a.m." (W §5 a3). Dot under days with a booking. The selected chip is filled Saguaro Night (`secondary`), not copper (shared §7.5); the chip also shows the class count. | `ScheduleDayStrip`, `Calendar`, `Popover` |
| 3 | Time-zone note | `xs` text "Arizona time (no daylight saving)" — in List view under the strip; in Week view as a chip above the day headers (G r26) | `Badge` |
| 4 | Body | List or Week (below) | |
| 5 | Live line | "Live" dot + "Spots update as they change." (visible text for the `aria-live` region; see file 05) | |

### 4.2 List view
- **Grid (≥1280):** filters sidebar 260 px (sticky, `top: 80px`) + list column fluid (max 900 px).
- **Date group header** (sticky under the day strip): "Tuesday, Oct 27 · 14 classes". Sub-anchors: Early (4:30–7) · Morning · Midday · Afternoon · Evening as `Button` ghost small jump links.
- **Row (`ClassCard` `schedule-row`, shared §7.1):** reading order time, title, instructor, spots, action. Columns `4px stripe | 88px | 1fr | 200px | 128px | 144px`:
  1. Time: "6:00 a.m." (Archivo 500 `data`, bold) and "45 min" below in `xs` text-muted (W §4 r2).
  2. Category stripe (category fill).
  3. Main block: class name ("Climb Cycle"); under it `CategoryBadge` (icon + name), `IntensityRibs` with the word "Hard" (the word is `sr-only` under 640 px), a "First-timers welcome" tag, and an age chip when an age rule exists.
  4. `InstructorChip` `md`: face + "Marisol Vega".
  5. `CapacityIndicator` variant `ribs`: "4 bikes left" (warning tone under 5), "12 spots left" or "Full · 3 waiting". Live. The member app always shows the count.
  6. `BookingStateButton` (`md`).
  Flags: "First-timers welcome" small chip; "Teen OK" chip; "Booked" success chip replaces button label.
- **Rows per page:** all classes for the day (max ~30). No pagination. The list virtualises above 60 rows.
- **Example rows (Gilbert – Val Vista, Tue Oct 27):**

| Time | Class | Category | Studio | Instructor | Ribs | Spots | State |
|---|---|---|---|---|---|---|---|
| 5:30 a.m. · 60 min | Rib Rack Strength | Strength | Studio B | Tomás Reyes | 4 | 6 spots left | open |
| 6:00 a.m. · 45 min | Climb Cycle | Cycle | Cycle Studio | Marisol Vega | 4 | 4 bikes left | booked |
| 7:00 a.m. · 45 min | Climb Cycle | Cycle | Cycle Studio | Devon Hart | 3 | 11 bikes left | open |
| 9:00 a.m. · 45 min | Aqua Fit | Aqua | Pool | Dana Whitfield | 2 | 9 spots left | open |
| 9:30 a.m. · 60 min | Desert Flow Yoga | Mind & Body | Studio A | Aisha Brooks | 2 | 14 spots left | open |
| 12:00 p.m. · 30 min | Switchback HIIT | Conditioning | Studio B | Kenji Ito | 5 | Full · 3 waiting | held for Maya until 6:05 a.m. |
| 4:30 p.m. · 60 min | Teen Strength | Youth | Studio B | Hannah Cole | 3 | 5 spots left | teen OK |
| 5:30 p.m. · 30 min | Mobility 30 | Recovery | Studio A | Ruth Nakamura | 1 | 18 spots left | open, first-timers |

### 4.3 Filters (`ScheduleFilters`)
Shared variants `sidebar` (List view ≥1280) or `drawer` (Week view and narrower screens; right-side Graphical `Drawer`, bottom sheet under 768 px) (shared §7.7). Grouped, collapsible sections with labels (W §5 a6): 

| Group | Control | Notes |
|---|---|---|
| Club | `CheckboxGroup` of clubs (Ridge/Summit); Trailhead sees only home club + locked rows | multi-club schedule merges, each row shows club name |
| Category | `CheckboxGroup` with icon + name + count | 8 categories (F §3) |
| Time of day | `ToggleGroup`: Early 4:30–7 · Morning 7–12 · Midday 12–4 · Evening 4–10 | |
| Intensity | `Slider` range 1–5 with 5 ribs preview; help "1 Easy · 5 All-out" | keyboard arrows; stepper buttons for no-drag use (WCAG 2.5.7) |
| Open spots only | `Switch` | |
| Good for first-timers | `Checkbox` | |
| Instructor | `Combobox` with faces | |
| Studio / room | `Select` | |
| Duration | `ToggleGroup`: Up to 30 · 45 · 60 or more | |
| My bookings | `Checkbox` "Only my bookings" | |
Footer: "Clear all" (ghost) and result count "14 classes". Active filters appear as removable chips under the strip. Filters write to the URL. Saved default: "Save as my filters" (`Checkbox` in the Popover).

### 4.4 Week view
- **Grid:** time axis column 64 px (sticky left) + 7 day columns (Mon–Sun) equal width. Content width 1200 px → about 160 px per day. Header row sticky: weekday + date; today has a filled circle (G r25 Sweatpals) in Saguaro `secondary`, matching `ScheduleDayStrip`. Above the headers, the time-zone chip (G r26). Week navigation: `<` `>` buttons and range "Oct 26 – Nov 1".
- **Hours:** 4:30 a.m.–10:00 p.m. (club hours), 56 px per hour. On load the grid scrolls so the earliest booked class or 5:00 a.m. is at the top. Jump chips: Early · Morning · Midday · Evening.
- **Block (ClassCard compact):** absolute position by start and duration; 4 px category stripe, icon, name (2 lines), time range, 5 mini ribs (hidden under 45 min), status icon (check for booked, clock for waitlist, "!" for low). Minimum height 28 px: 30-minute classes show only "12:00 Switchback HIIT" in one line. Overlaps split the column evenly.
- **Now line:** 2 px `text` line with label "Now 5:40" on today's column. Not copper.
- **Booked:** `success-subtle` fill, check icon, `sr-only` "Booked". Selected block: the shared selected ring (2 px, offset 2 px; shared §4.3). Full: dimmed text with "Full" tag. Held: amber outline.
- **Keyboard:** the grid is a `grid` role with roving `tabindex`. Arrows move between blocks (Up/Down by time, Left/Right by day), Enter opens the panel, Esc returns. Home/End: first/last block of the day; PageUp/PageDown: previous/next week. See file 05.
- **Range:** 7 days; the grid never renders days outside the club's data. Days outside the window are tinted with a diagonal-free `surface-muted` fill and no blocks.
- **Small widths:** week view is replaced by List view below 1024.

### 4.5 Interactions
- Click a row or block → panel (Flow 3). Hover on a block shows a `PreviewCard` with instructor and description (delay 400 ms; also on focus).
- "Book" on the row works without opening the panel (optimistic, toast with Undo).
- Date change uses `push`; filter change uses `replace`.
- SSE updates spots left and state without re-render of the whole list; changed rows flash `primary-subtle` for 600 ms (disabled with reduced motion).
- Right-click row: `ContextMenu` with Details, Book, Add to calendar, Copy link.

### 4.6 States
| State | Pattern |
|---|---|
| Loading | 8 skeleton rows + status text "Checking availability…" (W §4 r7) |
| Empty (filters) | EmptyState "No classes match. Clear a filter or try tomorrow." buttons "Clear filters", "See tomorrow" |
| Empty (club closed, holiday) | "Gilbert – Val Vista is closed on Thu, Nov 26. Try Mesa – Dobson." (club hours differ on holidays) |
| Error | "We couldn't load the schedule." + Try again |
| Offline | Cached day shown; banner; Book buttons disabled |
| Not open | Day chip greyed; list shows a single notice "Nov 4 classes open Wed, Oct 28 at 6:00 a.m." + "Remind me" |
| Trailhead viewing another club | Read-only with banner "Trailhead books at Mesa – Dobson. See Ridge." |

### 4.7 Responsive
- ≥1280: List = filters left + list; Week = full width, filters in Popover.
- 1024–1279: List with Filters button; Week 7 columns at ≥ 1100 px content, else switches to List.
- 768–1023: List only; rows become two-line cards.
- <768: List only; row layout: line 1 time + class name + state chip; line 2 stripe/category, instructor, ribs, spots; button right-aligned in line 1. Filters open as bottom `Drawer`. Day strip scrolls horizontally with snap.

```
Gilbert - Val Vista (change)                                   ( Week | [List] ) [Today] [Filters(2)]
[Today][Tomorrow][Thu 29][Fri 30][Sat 31][Sun 1][Mon 2][Tue 3] [Choose date v]       Arizona time (no DST)
+------------------+  Tuesday, Oct 27 - 14 classes             o Live
| FILTERS          |  Early  Morning  Midday  Afternoon  Evening
| v Club           |  ------------------------------------------------------------------------------
|   [x] Val Vista  |  5:30 a.m. |#| Rib Rack Strength     (face) Tomas Reyes   ||||.  6 spots left  [   Book   ]
| v Category       |  60 min    |#| Strength - Studio B
|   [ ] Strength 4 |  6:00 a.m. |#| Climb Cycle           (face) Marisol Vega  ||||.  [4 bikes left] [v Booked ]
|   [x] Cycle   6  |  45 min    |#| Cycle - Cycle Studio
| v Time of day    |  7:00 a.m. |#| Climb Cycle           (face) Devon Hart    |||..  11 bikes left [   Book   ]
|   (Early)(Morn.) |  9:30 a.m. |#| Desert Flow Yoga      (face) Aisha Brooks  ||...  14 spots left [   Book   ]
| v Intensity      |  12:00 p.m.|#| Switchback HIIT       (face) Kenji Ito     |||||  Full - 3 waiting [Confirm spot 24:10]
|   1 o----o 5     |  5:30 p.m. |#| Mobility 30  First-timers (face) Ruth N.   |....  18 spots left [   Book   ]
| [ ] Open only    |
| [Clear all] 14   |
+------------------+
```

Week view wireframe:
```
                     [Arizona time (no daylight saving)]               < Oct 26 - Nov 1 >  [Filters v]
 hour  | Mon 26     | (27) Tue    | Wed 28     | Thu 29     | Fri 30     | Sat 31     | Sun Nov 1  |
 5 am  |            |#Rib Rack    |#Rib Rack   |            |#Rib Rack   |            |            |
 6 am  |            |#Climb [v]   |#Climb      |#Rib Rack W2|#Climb      |#Climb     |            |
 7 am  |            |#Climb Cycle |            |#Rib Rack   |            |            |#Flow       |
 ......|            |  ---- Now 5:40 ----                                                           |
 12 pm |#HIIT       |#HIIT Full   |#HIIT       |#HIIT       |#HIIT       |#HIIT       |            |
```

---

## 5. Session detail — sheet and page — `/schedule/[sessionId]`

- **Purpose:** show everything needed to decide, then book in one action.
- **Question answered:** "Is this right for me, and can I get in?"
- **Component:** shared `ClassDetailPanel` (shared §7.2). The web app uses its variants:
  1. `sheet` (intercepted route) over Schedule, Today, Bookings and Clubs: Graphical `Drawer`, side right, **480 px** wide at ≥1024 (the shared `panel` width); 60 % width at 768–1023; bottom sheet at 92 % height under 768 px with a grab handle. Focus trap, Esc closes, focus returns to the row.
  2. `panel` (inline right column, 480 px) only on screens 1536 px and wider in List view, where the filters sit in the `drawer` variant. On smaller screens the list has no room for a third column.
  3. `page` on direct load or share link: content 8 columns plus a sticky booking card 4 columns at ≥1024; single column with a sticky bottom bar under 768 px.
- **Research:** 16:9 hero with instructor and time over the photo on a solid band, stats row of three with small-capital labels, sticky bar with the cost at left and the state at right, "Booked" plus grey "Cancel" after booking (mobbin-standard-pass §2 rules 39–40, 56); one confirmed view (rules 44–46, 62); invite-a-friend sheet (rule 36); seats-left badge (W §4 r9); booking reference block (W §4 r36).

### 5.1 Sections (top to bottom; example: Climb Cycle, Tue Oct 27, 6:00 a.m.)

| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Hero | 16:9 photo (cycle studio at dawn). A solid Saguaro Night band (80 %, no gradient) across the bottom carries "with Marisol Vega · Tue, 6:00 a.m." in Sand text. Close button top-right (sheet). Duration badge "45 min" bottom-right (W §4 r1). | `ClassDetailPanel`, `next/image`, `aspect-ratio` |
| 2 | Entry-rule chip (only if a rule applies) | "Ages 13 and up", "Strength floor without a coach is 16 and up", "Sauna and cold plunge are 18 and up" | `AmenityChip`-style info chip |
| 3 | Title block | `CategoryBadge` "Cycle"; title "Climb Cycle" (`l` in sheet, `xl` on page); fact rows with icons: "Tue, Oct 27 · 6:00–6:45 a.m." and "Gilbert – Val Vista · Cycle Studio" (opens the club page); tz note "Arizona time (no daylight saving)" | |
| 4 | Instructor | `InstructorChip` `lg` (56 px) "with Marisol Vega", "Cycle · 8 years at Cactus Peak" | `InstructorChip` |
| 5 | Stats row of three | Value on top, small-capital label under (`eyebrow` style): **45 min** DURATION · `IntensityRibs` 4 "Hard" INTENSITY · **4** bikes left SPOTS (`CapacityIndicator` variant `large`, live) | `IntensityRibs`, `CapacityIndicator` |
| 6 | Buttons | "Add to calendar" and "Invite a friend". "Invite a friend" opens a small sheet: link field, "Copy link", and "Guest passes left this month: 1" (rule 36); hidden when no passes remain, replaced by "Guest passes: 0 left this month" | `Button`, `Dialog` |
| 7 | About | Editorial text, left aligned: "Hills, not hype. Climb Cycle follows a mountain profile: warm-up, three climbs, a long descent. Set your own resistance. Nobody checks." "Good for first-timers" line if flagged. No star rating (no public ratings at launch). | `m` Inter |
| 8 | What to bring | Chips: Water · Towel · Cycling shoes optional | `AmenityChip` |
| 9 | Rules block (next to the action) | Cancellation: "Cancel free until 4:00 a.m. (2 hours before). After that, it counts as a late cancel." Waitlist: "If this class is full, the waitlist moves you up until 5:00 a.m. (1 hour before). You get a push and 30 minutes to confirm." Strike status only if the member has one: "You have 1 late cancel in the last 30 days." | text with `LateCancelNotice` |
| 10 | Other times | Chips for the same class: "Wed 6:00 a.m." "Thu 7:00 a.m." "Sat 8:00 a.m." with live state; pressing swaps the sheet content. Same list feeds "Reschedule instead" in the cancel dialog. | `Button` small |
| 11 | Location | `ClubCard` `map-callout`-style mini card with address, "Open in Maps", `BusynessMeter` `inline` | `ClubCard` |
| 12 | Household | "Chris is also booked." (household only; privacy) | `Avatar` |
| Sticky | Action bar | Left: "Included with Ridge" (never a bare price) and `CapacityIndicator` text. Right: `BookingStateButton` `lg`. Above it, `BookingForSelect` if the household has other members. After booking: "Booked" text with a check at left; grey outline "Cancel" and a "Manage" menu at right (rule 40). | `BookingStateButton`, `BookingForSelect`, `Menu` |

### 5.2 Confirmed view (same container)
The shared confirmed view replaces the content after booking (shared §7.2): one green check, headline "You're booked", green "Confirmed" pill, summary card (date, time, club, studio, instructor, "Bike 14", reference "CP-9D3M1"), filled full-width "Add to calendar", "Share" text link, four action rows (Add to calendar, Get directions, Call the club, Club details) and "Done". "Done" returns to the full detail with the "Booked" bar.

### 5.3 States
| State | Pattern |
|---|---|
| Loading | Sheet skeleton: hero block, 3 lines, stats row; status text "Checking availability…" |
| Held spot | Banner "A spot opened. Confirm in 28:41." and `BookingStateButton` `hold` |
| Waitlisted | Banner "You're #3 on the waitlist" |
| Not found / past | "That class has ended." button "See today's schedule" |
| Changed | Banner "This class changed. Now 6:15 a.m." |
| Error | "We couldn't load this class." + Try again |
| Offline | Cached last view if opened before; Book disabled |
| Cancelled by club | Banner "This class was cancelled." + similar times |

### 5.4 Responsive
Bottom sheet under 768 px with a sticky bar (safe-area aware). The stats row stays a row of three at 375 px (labels wrap). At AX text sizes it becomes a list of label–value pairs (shared §7.2).

```
+----------------------------------------------+
| ##############################################|  [x]
| ##  (cycle studio at dawn)                    |
| ##[ with Marisol Vega . Tue, 6:00 a.m. ]###[45 min]
+----------------------------------------------+
| (Ages 13 and up)                              |
| [Cycle] Climb Cycle                           |
| Tue, Oct 27 - 6:00-6:45 a.m.                  |
| Gilbert - Val Vista, Cycle Studio          >  |
| (face) Marisol Vega                           |
| 45 min       |||||.        4                   |
| DURATION     INTENSITY     SPOTS (bikes left) |
| [Add to calendar] [Invite a friend]           |
| Hills, not hype. Climb Cycle follows ...      |
| What to bring: [Water] [Towel] [Cycling shoes]|
| Cancel free until 4:00 a.m. ...               |
| Other times: [Wed 6:00] [Thu 7:00] [Sat 8:00] |
+----------------------------------------------+
| Included with Ridge        Booking for: Maya v |
| 4 bikes left               [      Book      ] |
+----------------------------------------------+
```

---

## 6. My bookings — `/bookings`

- **Purpose:** one place for everything on the calendar: classes, courts, lanes, kids club, PT, guest visits.
- **Question answered:** "What have I booked, and what can I change?"
- **Research:** Upcoming and Past as separate blocks with their own empty lines (W §4 r37; W §3.9 GetYourGuide); booking reference block (W §4 r36); status pills (W §4 r25).

### 6.1 Layout
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Title "My bookings"; right: `ToggleGroup` List / Calendar; `Select` "Who: Everyone · Maya · Chris · Theo · Ivy" (adults only); button "Add to calendar feed" (outline) → `/settings/calendar` | `PageHeader`, `ToggleGroup`, `Select` |
| 2 | Strike summary card (only if strikes > 0 or paused) | `LateCancelMeter`: 3 segments, "1 late cancel in the last 30 days. It clears Nov 26. At 3, booking pauses for 3 days." Link "How late cancels work". | `Meter`, `Card` |
| 3 | **Upcoming** block | Title "Upcoming · 7". Grouped by day: "Today", "Wed, Oct 28", … Row (`ClassCard` schedule-row variant "booking"): time + duration, stripe + icon + name, kind chip (Class, Court, Lane, Kids club, Training), place ("Gilbert – Val Vista · Cycle Studio"), who (avatar), status pill (Booked, Held, Invited), actions: "Details", "Add to calendar", "Cancel" (opens Flow 5), "Move" (courts, PT). | `ClassCard`, `Badge`, `Menu` |
| 4 | **Waitlist and holds** block | Title "Waitlist · 2". Row: "Rib Rack Strength · Thu, Oct 29, 6:00 a.m. · On waitlist #2" with "Leave waitlist"; a held row shows the countdown and the `hold` button "Confirm spot · 24:10". | `WaitlistBanner` (row variant) |
| 5 | **Past and cancelled** block | Title "Past and cancelled". Rows: Attended (check, with a "Give feedback" link for 7 days: private, no stars), Missed (late cancel / no-show), Cancelled. Shows 10, "Show 10 more". `Select` filter: All · Attended · Cancelled. | `ClassCard`, `Badge` |
| 6 | Calendar view (alt to 3–5) | Month `Calendar` with dots per day; selecting a day lists that day's items to the right | `Calendar` |

Each block has its own empty line (W §4 r37):
- Upcoming empty (`EmptyState` id `no-bookings`): "No classes booked yet" · "Pick a class and we'll save your spot." · button "Book a class".
- Waitlist empty (`no-waitlist`): "You are not on any waitlists" · "Full class? Join its waitlist and we will book you if a spot opens." · button "Browse today's classes".
- Past empty (`no-past`): "No past classes yet" · "Your finished classes will show here."

### 6.2 Row detail (expand)
Expanding a row shows: address, studio, instructor, "Spot 14", booking reference "CP-9D3M1" in a bordered block (W §4 r36), cancel rule text ("Free to cancel until 4:00 a.m."), and buttons.

### 6.3 States and responsive
Loading: 5 skeleton rows + "Loading your bookings…". Error: card with Try again. Offline: cached list with "Saved" label and disabled Cancel. <768: rows become two-line cards; actions in a `Menu` ("…" icon button 44 px). Calendar view stacks: month then day list.

```
My bookings                                   ( [List] | Calendar )   Who: Everyone v   [Calendar feed]
+---------------------------------------------------------------------------------------------------+
| Late cancels   [#][ ][ ]   1 in the last 30 days. Clears Nov 26. At 3, booking pauses for 3 days. |
+---------------------------------------------------------------------------------------------------+
Upcoming - 7
 Today
  6:00 a.m. |#| Climb Cycle       [Class]  Gilbert - Val Vista - Cycle Studio  (MB)  Booked    [Details][Cancel]
  4:00 p.m. |#| Kids club         [Kids]   Theo, Ivy - Val Vista                     Booked    [Details][Cancel]
 Wed, Oct 28
  6:00 a.m. |#| Climb Cycle       [Class]  ...                                       Booked
 Sat, Oct 31
  8:00 a.m. |#| Kids club         [Kids]   Theo, Ivy                                 Booked
Waitlist - 2
  Thu, Oct 29  6:00 a.m. Rib Rack Strength   2nd of 4                              [Leave waitlist]
Past and cancelled                                                            [All v]
  Mon, Oct 26  5:30 a.m. Rib Rack Strength   Attended (v)
  Sat, Oct 24  9:30 a.m. Desert Flow Yoga    Late cancel
  [Show 10 more]
```

---

## 7. Reserve hub — `/reserve`

- **Purpose:** one entry for things you reserve by resource, not by class.
- **Question answered:** "Can I get a court, a lane, or kids club, and what are the rules?"
- **Roles:** primary and adult: all three. Teen: Lanes and Courts only if the parent allowed them [P8]; no Kids club. Child: none.

### 7.1 Layout
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Eyebrow = viewing club; title "Reserve"; description "Courts, lanes and kids club." | `PageHeader` |
| 2 | Three resource cards (3 columns ≥1024; 1 column <768) | Each card: photo (16:9 `next/image` in `aspect-ratio`), icon + title, one rule line, live snapshot, button. **Courts** — "Book 3 days ahead · 60 or 90 minutes" — snapshot "Mesa – Red Mountain: 9 of 18 morning slots open Saturday" — button "Reserve a court". **Lap lanes** — "45-minute slots" — "Mesa – Dobson: Lane 3 free at 6:00 a.m." — "Reserve a lane". **Kids club** — "2-hour blocks · Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m. · Ages 6 months–12 years" — "Val Vista: 6 spots left Saturday 8:00 a.m." — "Book kids club". | `Card`, `aspect-ratio`, `CapacityIndicator`, `Button` |
| 3 | Locked / not-here states | Trailhead on Courts: card shows lock + "Courts come with Ridge and Summit." + "Compare plans". Club has no such facility: "Not at Mesa – Downtown. Mesa – Red Mountain has 6 pickleball courts." + "Switch club". Never hide the card. | `EmptyState` (inline) |
| 4 | Your reservations | List of upcoming courts, lanes, kids club (3 items) with the same row as Bookings; link "All bookings" | `ClassCard` (booking row) |
| 5 | Rules strip | `Accordion` "How reservations work": cancel free until 2 hours before; late cancels count as strikes for courts and lanes; guests need a pass; one court per day. | `Accordion` |

### 7.2 States and responsive
Loading skeleton: three cards. Error per card. Offline: disabled buttons. <768: cards stack, photo on top at 16:9, button full width.

```
RESERVE   Gilbert - Val Vista                                   (change club)
+-------------------------+ +-------------------------+ +-------------------------+
| ####################### | | ####################### | | ####################### |
| (court) Courts          | | (waves) Lap lanes       | | (smile) Kids club       |
| 3 days ahead - 60/90 min| | 45-minute slots         | | 2-hour blocks, Mon-Sat  |
| Red Mtn: 9 of 18 open   | | Dobson: Lane 3 at 6:00  | | Val Vista: 6 left Sat   |
| [ Reserve a court ]     | | [ Reserve a lane ]      | | [ Book kids club ]      |
+-------------------------+ +-------------------------+ +-------------------------+
Your reservations
  Sat, Oct 31  8:00 a.m.  Kids club - Theo, Ivy           Booked      [Details]
How reservations work  v
```

---

## 8. Court grid — `/reserve/courts`

- **Purpose:** choose a court, time and players in one screen.
- **Question answered:** "Which court is free on Saturday, and can I bring my partners?"
- **Roles:** primary, adult (Ridge/Summit); teen per [P8].
- **Research:** a sport-court grid with courts as columns is still not in Mobbin (mobbin-standard-pass search W6). The shared `ReservationSlotGrid` `matrix` layout is new (shared §8.2). Built from the nearest patterns: Square resource rows with green time-range blocks (mobbin-standard-pass §2 rules 22–23), outlined time cards with a green dot (rule 25), segmented duration chips (rule 60), two-pane slot picker (W §4 r12), AM/PM groups (W §4 r13), green dot for free slots (W §4 r14), count-in-dropdown selector with "Done" (W §4 r20), time zone under the calendar (W §4 r15; G r23), sticky bottom bar (W §4 r11), stepper for guests (W §4 r42), confirmation with green check and share link (W §4 r16–r17).

### 8.1 Layout (≥1024)
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Eyebrow "RESERVE"; title "Courts" | `PageHeader` |
| 2 | Setup bar (sticky under top bar) | Club chip (ClubSwitcher limited to Dobson, Red Mountain, Val Vista) · Sport `ToggleGroup` Pickleball / Tennis / Basketball (only those the club has) · Court type `Select` "Pickleball · 6 courts" with radio options and "Done" (W §4 r20) · Duration `DurationChips` **60 min | 90 min** (selected chip filled; mobbin-standard-pass §2 rule 60) | `ScheduleDayStrip`, `DurationChips`, `ToggleGroup`, `Select` |
| 3 | Date strip | Today → +3 days enabled; later days show "Opens Wed, Oct 28 at 6:00 a.m."; `Calendar` for "Choose date" (disabled outside window; past dates greyed, W §5 a3). Time zone note under the strip. | `ScheduleDayStrip`, `Calendar` |
| 4 | Court grid | `ReservationSlotGrid` `matrix` (kind `court`). Rows: Court 1–6, label column 96 px (sticky). Columns: 30-minute start times from club open, grouped under "AM" and "PM" headers (W §4 r13). Column width 72 px. Horizontal scroll inside `ScrollArea`; row labels stay. | `ReservationSlotGrid`, `ScrollArea` |
| 5 | Legend | ● Free · ◆ Mine · Taken · Closed · Not enough time (each with icon and text) | |
| 6 | Players panel (right column 4/12 at ≥1280; below grid otherwise) | Appears after a slot is chosen. Stepper "How many players?" (2–4). Rows per extra player with `Combobox` member search or "Invite by email or phone (guest)". Guest cost line. Hold timer "Holding this court for 4:32". | `NumberField`, `Combobox`, `Field`, `Progress` (hold timer) |
| 7 | Sticky bar (bottom) | "Pickleball · Court 3 · Sat, Oct 31 · 8:00–9:30 a.m. · Mesa – Red Mountain" + primary "Reserve Court 3" (names the choice; shared §8.2). Disabled until a slot is chosen and every player row is valid. | sticky `Toolbar` |

**Grid cell states.** The slot statuses are the shared ones (shared §8.2): `open` (outline, green dot, time), `selected` (Saguaro `secondary` fill, `secondary-foreground` text, check), `mine` (`primary-subtle` fill, "Yours"), `taken` (`surface-muted`, diagonal hatch, lock), `closed` (hatch plus the word "Closed" in the row header), `past` (muted). Do not redefine them. App-only additions:

| Addition | Visual | Text for screen reader |
|---|---|---|
| Not enough time for the chosen duration | `open` look dimmed, no dot | "Court 3, 9:00 a.m., not enough time for 90 minutes" |
| Not yet open (column or day) | `past`-style muted with the label "Opens Wed 6:00 a.m." | "Opens Wednesday at 6:00 a.m." |

**Example data (Mesa – Red Mountain, Sat Oct 31, 90 min):** Court 1 free 6:00–7:30; Court 2 taken 7:00–8:30; Court 3 free 8:00, 8:30, 9:00; Court 4 free after 10:00; Court 5 closed 9:00–10:00 (wet-down); Court 6 free all morning. Open at 6:00 a.m. on weekends, last start 6:30 p.m. (club closes 8:00 p.m.).

### 8.2 Interactions
- Click or press Space/Enter on a free cell selects the 90-minute range. Click again or Esc clears. Starting a selection starts the 5-minute hold (shown as a progress bar) [P15].
- Keyboard: `grid` role, arrows move between cells, Home/End jump to first/last time of row, PageUp/PageDown jump 3 hours.
- Live: SSE `court` channel marks cells taken without page reload; if the member's selected cell becomes unavailable, the panel shows "Court 3 was just booked. Pick another time." and clears the selection (focus moves to the grid).
- Guest rows: if a guest pass is missing, inline "Add a guest pass ($20)" opens the Flow 10 dialog.
- After "Reserve court": navigate to `/reserve/confirmed/[reservationId]`.

### 8.3 Confirmation page `/reserve/confirmed/[reservationId]`
Centered 560 px card using the shared success pattern (mobbin-standard-pass §2 rules 45–46, 62): one green `CircleCheck`, headline "Court 3 is yours", "Confirmed" pill, summary card (sport, club, court, date, time, tz) with reference block "CP-7K2F4" (W §4 r36) and the players list with chips (Confirmed, Invited, Guest pass sent), filled "Add to calendar", "Share" text link (copies the invite link, W §4 r17), action rows (Get directions, Call the club, Club details), "Done", and a quiet "Cancel reservation" link with the rule line. One filled button only.

### 8.4 States and responsive
| State | Pattern |
|---|---|
| Loading | Grid skeleton, text "Checking availability…" |
| Empty | Club has no courts: EmptyState "No courts at Mesa – Downtown. Mesa – Red Mountain has 6 pickleball courts." + "Switch to Red Mountain" |
| All taken | Banner "Every court is taken on Sat, Oct 31. Try Sunday, or Mesa – Dobson." + two links |
| Plan locked | Whole page replaced by lock card + "Compare plans" |
| Error | "We couldn't load courts." + Try again |
| Offline | Disabled grid with "Reconnect to reserve." |
| <1024 | Setup bar collapses to a two-row stack; grid becomes a **time-first list**: for each start time, a row of court chips (Court 1…6) — this keeps targets 44 px and avoids horizontal scroll. Players panel opens as a bottom `Drawer` after a slot is chosen. |
| <768 | Sticky bar full width above the tab bar |

```
RESERVE > Courts
[Mesa - Red Mountain v] (Pickleball)(Tennis)   Court type: [Pickleball - 6 courts v]   Duration: (60)[90]
[Today][Wed 28][Thu 29][Fri 30][Sat 31]*  Sun Nov 1 (opens Thu 6:00 a.m.)    Arizona time (no daylight saving)
+----------+------------------------------------------------------------------------+  +----------------+
|          |  AM                                                  | PM              |  | Players        |
|          | 6:00 6:30 7:00 7:30 8:00 8:30 9:00 9:30 10:00 10:30  | 12:00 ...       |  | How many? [- 4 +]
| Court 1  |  o    o    o    .    o    o    o    o    o     o     |                 |  | Linda Park  (member)
| Court 2  |  o    o   Tkn  Tkn  Tkn   o    o    o    o     o     |                 |  | Pat Lowe    (member)
| Court 3  |  o    o    o    o   [####SELECTED 8:00-9:30####] o    |                 |  | Guest  Uses 1 pass
| Court 4  |  o    o    o    o    o    o    o    o    o     o     |                 |  | Holding 4:32 ======
| Court 5  |  o    o    o    o    o    o   Closed Closed o    o    |                 |  +----------------+
| Court 6  |  o    o    o    o    o    o    o    o    o     o     |
+----------+------------------------------------------------------------------------+
o Free  [#] Selected  Tkn Taken  Closed
-----------------------------------------------------------------------------------------------------
Pickleball - Court 3 - Sat, Oct 31 - 8:00-9:30 a.m. - Mesa - Red Mountain             [ Reserve Court 3 ]
```

---

## 9. Lane grid — `/reserve/lanes`

- **Purpose:** reserve a 45-minute lap lane.
- **Question answered:** "Is there a lane at 6:00 a.m., and can I just get any lane?"
- **Roles:** primary, adult; teen if parent toggled and age ≥ 14 [P8].
- **Layout:** same page skeleton as Courts (header, setup bar, date strip, grid, sticky bar).

| Order | Section | Content |
|---|---|---|
| 1 | Setup bar | Club chip (pool clubs only: Mesa – Dobson, Mesa – Red Mountain, Gilbert – Val Vista), pool name text ("25-yard lap pool · 8 lanes"; Val Vista "25-yard lap pool · 6 lanes"; Red Mountain "25-metre outdoor pool · 8 lanes") |
| 2 | Date strip | Same window as classes (7/9 days) |
| 3 | Quick action row | **Any lane** `ToggleGroup` item (default on), time-of-day anchors Early · Morning · Midday · Evening |
| 4 | Lane grid (`ReservationSlotGrid` `matrix`, kind `lap-lane`) | Rows Lane 1–8 (Mesa – Dobson, 25-yd; Mesa – Red Mountain, 25 m outdoor) or Lane 1–6 (Gilbert – Val Vista, 25-yd); columns 45-minute slots from opening (weekday 4:30, 5:15, 6:00, 6:45, 7:30 …; weekend from 6:00). Each cell shows two dots for the 2 swimmers (filled = taken) and the text "1 of 2 swimmers" when one place is taken [P6]. Header cells (time) are buttons that select "Any lane" for that time. Last slot ends 30 minutes before the club closes (F §2). |
| 5 | Partner row | "Swimming with someone? Add a lane partner" `Combobox` (optional) |
| 6 | Sticky bar | "Lane 3 · Wed, Oct 28 · 6:00–6:45 a.m. · Mesa – Dobson" + "Reserve lane" |

Cell statuses are the shared ones (`open`, `selected`, `mine`, `taken`, `closed`, `past`). A half-taken lane is `open` with the text "1 of 2 swimmers"; a full lane is `taken` ("Full"). Screen-reader text: "Lane 3, 6:00 a.m., 1 of 2 swimmers."
Example: Mesa – Dobson Wed Oct 28 at 6:00 a.m.: lanes 1, 2, 5 full; lane 3 "1 of 2 swimmers"; lanes 4, 6, 7, 8 open.
States: Loading skeleton; Empty "No pool at Mesa – Downtown. Mesa – Dobson has a 25-yard lap pool and a warm-water pool." ; Full day "All 8 lanes are taken at 6:00 a.m. Try 6:45 a.m." with two nearest slots as buttons. After confirm: inline success panel (no separate page) with Add to calendar and Undo toast.
Responsive: <1024 time-first list: each time shows lane chips with "1 of 2 swimmers" tags.

```
RESERVE > Lap lanes     [Mesa - Dobson v]   25-yard lap pool - 8 lanes                  [Any lane: on]
[Today][Wed 28]*[Thu 29]...                                   Arizona time (no daylight saving)
         | 4:30 | 5:15 | 6:00 | 6:45 | 7:30 | 8:15 | 9:00 |   <- tap a time for Any lane
 Lane 1  | oo   | oo   | ##   | oo   | oo   | oo   | oo   |
 Lane 2  | oo   | #o   | ##   | #o   | oo   | oo   | oo   |
 Lane 3  | oo   | oo   |[#o ] | oo   | oo   | oo   | oo   |    [ ] = selected, 1 of 2 swimmers
 Lane 4  | oo   | oo   | oo   | oo   | oo   | oo   | oo   |
 ...
Lane 3 - Wed, Oct 28 - 6:00-6:45 a.m. - Mesa - Dobson - 1 swimmer          [ Reserve lane ]
```

---

## 10. Kids club — `/reserve/kids-club`

- **Purpose:** book 2-hour kids club blocks for one or more children.
- **Question answered:** "Can both kids go Saturday morning, and what do I need to do?"
- **Roles:** primary, adult only.
- **Research:** no kids-club flow in Mobbin (still a gap). Uses the household list pattern (W §3 Care.com), block tiles from the Swiggy meal-period pattern (G §3), and a sticky bar (W §4 r11). Component: shared `ReservationSlotGrid` `blocks` layout (shared §8.2).

### 10.1 Layout: 4-step wizard on one page (steps collapse to summaries)
| Step | Content | Components |
|---|---|---|
| 1 Club | `RadioGroup` of ClubCard compact for the 3 clubs with kids club; the other 2 disabled with "No kids club here". Photo shows the kids club room. | `ClubCard` (compact), `RadioGroup` |
| 2 Children | `CheckboxGroup`: photo, name, age, status ("Ready" or "Add allergy notes first"). Theo (9), Ivy (6). Teens and adults not listed; note "Jordan, 14, can book Teen Strength." for teen members in the household | `CheckboxGroup`, `Avatar`, `FamilyMemberCard` (compact) |
| 3 Day and block | `ScheduleDayStrip` (Mon–Sat; Sunday greyed "Closed Sundays"), then four **block tiles** (`ReservationSlotGrid` `blocks`) — "8:00–10:00 a.m.", "10:00 a.m.–12:00 p.m.", "4:00–6:00 p.m.", "6:00–8:00 p.m." — each with spots left ("6 spots left"), with an amber "Only 2 left" under 3 spots. Up to 2 blocks per child per day. Tile that cannot fit all chosen children shows "1 left. Need 2." with link "Join waitlist" | `ToggleGroup`, `CapacityIndicator` |
| 4 Review | Summary per child, pick-up adults (default Maya, Chris) with "Change", `Checkbox` "Allergy and medical notes are up to date", rule text "You check in at Gilbert – Val Vista before drop-off and stay in the club." Price line "Included with your membership." | `Field`, `Checkbox`, `Card` |
| Sticky bar | Summary + "Book kids club" | |

### 10.2 States, edge cases and responsive
- Confirmation: inline success panel with green check, "Theo and Ivy are booked", summary card, buttons "Show passes" and "Add to calendar".
- Empty (no children on plan): "No children on your plan yet. Add a child to book kids club." → `/family/add`.
- Teen/child accounts: page redirects to `/403`.
- Block full: "Join waitlist" (Flow 4 rules).
- Loading: 4 tile skeletons + "Checking kids club spots…".
- <768: steps stack; block tiles are full width; sticky bar above the tab bar.

```
RESERVE > Kids club                                                Step 3 of 4
1 Club: Gilbert - Val Vista (change)    2 Children: Theo (9), Ivy (6) (change)
3 Day and block                                                   Arizona time (no daylight saving)
[Today][Wed 28][Thu 29][Fri 30][Sat 31]*  Sun (Closed Sundays)
 +----------------+ +----------------+ +----------------+ +----------------+
 | 8:00-10:00 a.m.| |10:00 a.m.-12:00| | 4:00-6:00 p.m. | | 6:00-8:00 p.m. |
 | 6 spots left   | | 3 spots left   | | 1 left. Need 2 | | 8 spots left   |
 | [ selected ]   | |                | | Join waitlist  | |                |
 +----------------+ +----------------+ +----------------+ +----------------+
4 Review (after step 3)
Theo, Ivy - Sat, Oct 31 - 8:00-10:00 a.m. - Gilbert - Val Vista                [ Book kids club ]
```

---

## 11. Clubs — `/clubs`

- **Purpose:** compare clubs, see live busyness, pick where to go.
- **Question answered:** "Which club has what I need, and which is quiet right now?"
- **Roles:** all.
- **Research:** list left, map right, count pins, never a map without a list (W §4 r18; W §5 a11); studio card with photo left, tags, trust badge (W §3.6 ClassPass); location search with "Use current location" (W §4 r19); region-grouped list (W §4 r34).

### 11.1 Layout (≥1024)
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Title "Clubs"; description "5 clubs. One climb." | `PageHeader` |
| 2 | Toolbar | Search `Input` "Search clubs", "Use my location" ghost button (permission asked on click), amenity filter `ToggleGroup` chips: Pool · Courts · Kids club · Recovery · Café · Open now, sort `Select`: Nearest · Quietest now · Name | `Input`, `ToggleGroup`, `Select` |
| 3 | Left column (5/12) | Eyebrow groups "MESA · 3" and "GILBERT · 2". Each club is a `ClubCard` (list-row): photo 25 % width (W §3.6), name "Mesa – Dobson", address "Dobson Rd & Southern Ave, Mesa", personality line "The big one. Bring the whole family.", `AmenityChip` row (Pool, Courts, Kids club, Recovery, Café), `BusynessMeter` variant `inline` "Steady · 3 of 5", status "Open now · closes 10:00 p.m.", distance "4.2 mi" (if location), "Home" tag, button "View club" (outline) and "Set as my club" (ghost). | `ClubCard` (list-row) |
| 4 | Right column (7/12, sticky) | `ClubMap` with 5 `ClubPin`: each pin shows 5-rib mini meter coloured by level, with club short name. Hover/focus pin ↔ highlights list row. Selecting a pin shows `ClubCard` (map-callout): photo, name, busyness, "View club". Controls: zoom `+ −`, "Reset view", "List only" toggle. | `ClubMap`, `ClubPin`, `ClubCard` (variant `map-callout`) |

Example list (live at 5:40 a.m.):
| Club | Level | Hours line |
|---|---|---|
| Mesa – Dobson | Light · 2 | Open now · closes 10:00 p.m. |
| Mesa – Red Mountain | Steady · 3 | Open now · closes 10:00 p.m. |
| Mesa – Downtown | Steady · 3 | Open now · closes 10:00 p.m. |
| Gilbert – Val Vista | Light · 2 | Open now · closes 10:00 p.m. |
| Gilbert – Heritage | Quiet · 1 | Open now · closes 10:00 p.m. |

### 11.2 Interactions
- Map and list sync (hover, focus, select). Map keyboard: pins are in tab order after the list; Enter selects; map pan with arrows when the map has focus ("Map. Use arrow keys to move.").
- "Use my location": browser prompt; on allow, distance shown and sort Nearest; on deny, a non-blocking note. Location is never sent unless granted and is not stored.
- Trailhead: non-home clubs show a lock tag "Ridge or Summit" but remain browsable.
- Busyness polls every 5 minutes in one batch request for all clubs.

### 11.3 States and responsive
Loading: 5 card skeletons + map placeholder "Loading map…". Empty (filters): "No club matches. Clear a filter." Error map: map area shows static image fallback and "Map unavailable. The list still works." Offline: list from cache, no map. <1024: `ToggleGroup` **List / Map** under the toolbar; List default; Map view shows the map with a bottom-sheet list (draggable not required; "Show list" button). <768: ClubCard list-row stacks photo on top.

```
Clubs   5 clubs. One climb.
[ Search clubs ] [Use my location] (Pool)(Courts)(Kids club)(Recovery)(Cafe)(Open now)  Sort: Nearest v
MESA - 3                                          +--------------------------------------------+
+---------------------------------------------+   |  ,  MAP                                    |
| ####### | Mesa - Dobson          [Home]     |   |        (3)Mesa - Red Mtn |||..              |
| ####### | Dobson Rd & Southern Ave          |   |   (2)Mesa - Dobson ||....                  |
| ####### | The big one. Bring the whole fam. |   |            (3)Downtown |||..               |
| ####### | [Pool][Courts][Kids club][Rec]... |   |                                            |
|         | |||oo Steady - Open now, to 10pm  |   |        (2)Val Vista     (1)Heritage        |
|         | [View club] Set as my club        |   |  [ + ][ - ]   [Reset view]                 |
+---------------------------------------------+   +--------------------------------------------+
| ... Mesa - Red Mountain ...                 |
GILBERT - 2
| ... Gilbert - Val Vista ...                 |
```

---

## 12. Club detail — `/clubs/[slug]`

- **Purpose:** everything about one club, with live data.
- **Question answered:** "How busy is it now, when is it quiet, what's here, and what's on today?"
- **Roles:** all.
- **Research:** popular times chart was not found in Mobbin (G §5; the shared spec also calls it new, and mobbin-standard-pass §2 rule 58 proposes a YES/NO crowd prompt instead, which the foundation rules out because it requires the typical-hours chart). Nearest patterns: day tabs over a bar chart with an average line (Insight Timer) and range pills (MacroFactor). Hours in two columns (G r30). Studio card layout (W §3.6).

### 12.1 Layout (example: `gilbert-val-vista`)
| Order | Section | Columns | Content | Components |
|---|---|---|---|---|
| 1 | **ClubHero** | 12 | Photo (16:6) with calm dark overlay on the bottom-left for text only (brand §7 logo-on-photo rule applies to logos; text overlay uses Saguaro Night 60 % solid band, not gradient). Name "Gilbert – Val Vista", personality line "Swim school, courts, and a kids club that kids ask for.", address "Val Vista Dr & Warner Rd, Gilbert" with copy/directions, "Open now · closes 10:00 p.m.", phone. Actions: "Set as my club" (primary if not viewing; becomes "Viewing this club" disabled chip), "Directions" (outline), "Call" (outline). | `ClubHero` (variant `app`: smaller, no gallery, adds "Set as my club"), `Button` |
| 2 | Anchor nav (sticky under top bar) | 12 | `Tabs`-style link row: Now · Today's classes · Hours · Amenities · Courts and pool · Kids club · Coaches · Getting here (scroll-spy) | `Tabs` (as anchors) |
| 3 | **Now** | 5 | `BusynessMeter` variant `hero`: five ribs, "Light · 2 of 5", "Updated 5:35 a.m.", level only (no head count), text "Busier 6:00–7:00 a.m. Quieter after 8:30 a.m." Footer "Updates every 5 minutes." | `BusynessMeter` (`hero`) |
| 3b | **Popular times** | 7 | `PopularTimesChart`: `ToggleGroup` Mon–Sun (default today), bar per hour (4:30 a.m.–10 p.m.), bars use 5 stepped heights, current hour marked "Now" with a text label and an outline (not copper), dashed line "Typical for today". Below: "Busiest 5:00–7:00 p.m. Quietest 9:00–10:00 a.m." `DataTable` toggle "Show as table" for accessibility. Sample Tue: 4a 1, 5a 2, 6a 4, 7a 4, 8a 3, 9a 3, 10a 2, 11a 2, 12p 3, 1p 2, 2p 2, 3p 3, 4p 4, 5p 5, 6p 5, 7p 3, 8p 2, 9p 1. | `PopularTimesChart`, `chart` (shadcn), `ToggleGroup` |
| 4 | **Today's classes** | 12 | 6 next `ClassCard` (compact) in a horizontal list for today at this club, link "Full schedule" → `/schedule?club=gilbert-val-vista` | `ClassCard` (compact) |
| 5 | **Hours** | 6 | `HoursTable` variant `week`: Mon–Fri 4:30 a.m.–10:00 p.m.; Sat–Sun 6:00 a.m.–8:00 p.m.; Staffed 6:00 a.m.–8:00 p.m.; Kids club Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m.; Pools close 30 minutes before the club. Today's row highlighted with "Today". Two-column layout weekdays/Saturday (G r30). | `HoursTable` (`week`; `today` in the hero) |
| 5b | **Amenities** | 6 | `AmenityChip` grid with icon + text: 25-yd lap pool, splash pad, swim school, 2 basketball courts, 4 pickleball courts, recovery suite, 3 studios + cycle studio, kids club | `AmenityChip` |
| 6 | **Courts and pool** | 12 | Two cards: "Courts" (4 pickleball, 2 basketball; "Next open: Court 2, Sat 8:00 a.m."; button "Reserve a court"); "Lap pool" (25-yd; "Lane 3 free at 6:45 a.m."; "Reserve a lane"). Hidden when the club has none (Downtown, Heritage show "No pool or courts at this club."). | `Card`, `ReservationSlotGrid` (mini) |
| 7 | **Kids club** | 6 | Hours, ages (6 months–12 years) [P7], spots left today by block, "Book kids club" | `CapacityIndicator`, `Button` |
| 8 | **Coaches** | 12 | 2–3 `CoachCard` (compact) for coaches who work here (Marcus Hale, Jake Whitcomb) | `CoachCard` |
| 9 | **Getting here** | 12 | `ClubMap` single pin, address, parking note ("Free lot on the north side."), "Open in Maps" | `ClubMap`, `ClubPin` |

### 12.2 States and responsive
| State | Pattern |
|---|---|
| Busyness stale (> 15 min) | Meter greys, text "Live count unavailable. Showing typical hours." |
| Club closed | Meter hidden; "Closed now · opens 4:30 a.m." |
| Loading | Hero image block, meter skeleton, chart skeleton, "Loading club…" |
| Error | Section-level errors |
| Offline | Hours and amenities from cache; "Offline: live count unavailable." |
| <1024 | Single column; Now and Popular times stack; anchor nav horizontally scrollable with 44 px chips |

```
+--------------------------------------------------------------------------------------------+
| ########################################################################################## |
| ## Gilbert - Val Vista                                         [Set as my club][Directions] |
| ## Swim school, courts, and a kids club that kids ask for.     [Call]                       |
| ## Val Vista Dr & Warner Rd, Gilbert  - Open now, closes 10:00 p.m.                        |
+--------------------------------------------------------------------------------------------+
 Now | Today's classes | Hours | Amenities | Courts and pool | Kids club | Coaches | Getting here
+----------------------------+  +----------------------------------------------------------+
| NOW                        |  | POPULAR TIMES  (Mon)(Tue)*(Wed)(Thu)(Fri)(Sat)(Sun)      |
| |||oo  Light - 2 of 5       |  |  5|          ##  ##                                      |
| Updated 5:35 a.m.          |  |  4|    ## ##          ##                                  |
| Busier 6:00-7:00 a.m.      |  |  3|             ## ##        ##  ##                      |
| Quieter after 8:30 a.m.    |  |  1|## ##                                    ## ## ##     |
| Updates every 5 minutes    |  |    4a 6a 8a 10 12p 2p 4p 6p 8p     ^ Now                 |
+----------------------------+  |  Busiest 5:00-7:00 p.m.   [Show as table]                |
                                +----------------------------------------------------------+
```

---

## 13. Training — `/training`

- **Purpose:** find a coach, see your sessions and credits, buy a pack.
- **Question answered:** "Who can help me with my goal, and what does it cost?"
- **Roles:** primary, adult. Teen: read-only browse, requests need approval (Flow 19).
- **Research:** PT booking not observed (W §2.5). Coach cards modelled on instructor-led cards (W §4 r1) and the Calendly person-led booking page (G §8).

### 13.1 Layout
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Title "Training"; description "One-to-one coaching, 45 minutes."; right: button "Match me to a coach" (outline) | `PageHeader` |
| 2 | Your training (card, 12) | Left: `PackMeter` (built on `RibMeter`; shared `ProgressRibs` is the weekly goal only) "8-pack · 5 sessions left · valid until Aug 3, 2027". Right: next session "Thu, Nov 5 · 10:15 a.m. · Coach Marcus Hale · Gilbert – Val Vista" with buttons "Details", "Move". Empty variant: "No sessions yet. Pick a coach to start." Summit: line "Summit intro session: 1 left this quarter." | `Card`, `PackMeter`, `Button` |
| 3 | Find a coach | Filter chips: Return to training · Strength · Olympic lifting · Swim · Mobility · Pickleball · Youth and teen; `Select` Club; sort Soonest open time. Grid of `CoachCard` variant `card` (3 columns ≥1280, 2 at ≥768, 1 below): photo (4:5), name, specialty chips, clubs, "Next open: Thu 10:15 a.m.", button "View profile" (outline). | `CoachCard`, `ToggleGroup`, `Select` |
| 4 | Packs | Three pack cards (`PackCard`, an app composite; the shared `PlanCard` has no pack variant): **4 sessions $276 · $69 each**, **8 sessions $520 · $65 each**, **12 sessions $732 · $61 each**, plus a line "Single session: $75." Button "Buy a pack" (opens a Dialog; pick coach later). Text "Packs last 12 months and pause during a freeze." [P10] | `PackCard` |
| 5 | How it works | 3-step list: Pick a coach → Choose a time → Show your pass | `Card` |
| 6 | Summit band | If not Summit: `PromoBand` "Summit includes a PT intro session every quarter." + "Compare plans" | `PromoBand` |

Example coaches:
| Coach | Specialty | Clubs | Next open |
|---|---|---|---|
| Sam Okafor | Return to training · knee and post-rehab · strength | Mesa – Dobson, Mesa – Red Mountain | Thu 10:15 a.m. |
| Elena Duarte | Olympic lifting · barbell strength | Gilbert – Heritage, Mesa – Downtown | Wed 6:30 a.m. |
| Marcus Hale | Swim technique · Masters swim | Gilbert – Val Vista, Mesa – Dobson | Fri 7:15 a.m. |
| Rosa Lindgren | Mobility · pickleball conditioning · older adults | Mesa – Red Mountain | Wed 9:00 a.m. |
| Jake Whitcomb | Youth and teen athletic development | Gilbert – Val Vista | Thu 4:00 p.m. |

States: Loading = card skeletons "Finding coaches…". Empty filter = "No coach matches. Clear a filter." Error = per section. Offline = cached list, booking disabled. Responsive: sections stack; "Your training" card stacks left then right.

```
Training   One-to-one coaching, 45 minutes.                               [Match me to a coach]
+-------------------------------------------------------------------------------------------+
| 8-pack  |||||  5 left - valid until Aug 3, 2027     |  NEXT: Thu, Nov 5 - 10:15 a.m.        |
|                                                      |  Coach Marcus Hale - Val Vista        |
|                                                      |  [Details] [Move]                     |
+-------------------------------------------------------------------------------------------+
Find a coach  (Return to training)(Strength)(Olympic lifting)(Swim)(Mobility)(Youth)  Club: All v
+--------------+ +--------------+ +--------------+
| ###########  | | ###########  | | ###########  |
| Sam Okafor   | | Elena Duarte | | Marcus Hale  |
| [Return][Str]| | [Oly][Str]   | | [Swim]       |
| Dobson, RedM | | Heritage, Dt | | Val Vista... |
| Next: Thu 10:15 | Next: Wed 6:30 | Next: Fri 7:15|
| [View profile]| | [View profile]| | [View profile]|
+--------------+ +--------------+ +--------------+
Packs:  [4 sessions $276 ($69 each)] [8 sessions $520 ($65 each)] [12 sessions $732 ($61 each)]
```

## 14. Coach profile — `/training/coaches/[coachSlug]`

- **Purpose:** decide on a coach and book.
- **Question answered:** "Is this coach right for me, and when can I start?"
- **Layout (≥1024):** 8 columns content + 4 columns sticky booking card.

| Order | Section | Content (Sam Okafor) | Components |
|---|---|---|---|
| 1 | Header | Large photo 4:5 (left on desktop), name, specialty chips, clubs, "Coaching since 2014" | `CoachCard` variant `feature`, `AmenityChip` |
| 2 | About | "I help people come back after surgery or a long break. We start with what your body can do today. No lectures." left aligned | `m` Inter |
| 3 | Good for | Chips: Returning after injury · Knee and hip · First-time training · Over 50 | `Badge` |
| 4 | A first session looks like | 3 bullets: 10 minutes talking · 25 minutes moving · 10 minutes plan | `Card` |
| 5 | Next open times | Next 6 open times as buttons grouped by day, green dot, time zone line | `Button`, `Calendar` mini |
| 6 | Classes Sam teaches | `ClassCard` (compact) 3 items | `ClassCard` |
| 7 | Booking card (sticky) | "45-minute session" · "Single $75 · Pack from $61 each" · "Free to move until 24 hours before" [P10] · button "Book a session" (primary) · "Message Sam" (outline) · Summit line "Use your Summit intro session" | `Card`, `Button` |

Mobile: booking card becomes a sticky bottom bar with the primary button. Book flow in `02-flows.md` Flow 9 (two-pane picker `/training/coaches/[slug]/book`).
Booking page wireframe:
```
Book a session with Sam Okafor
+-----------------------------+  +-------------------------------------------------------+
| (photo) Sam Okafor          |  |   November 2026            <  >                       |
| 45-minute session           |  |  Su Mo Tu We Th Fr Sa                                 |
| Club: [Mesa - Dobson v]     |  |   1  2  3  4 (5) 6  7     o = openings                |
| Single $75                  |  |                                                       |
| Pack from $61 each          |  |  Thu, Nov 5                         AM                |
| Free to move until 24 h     |  |  [o 9:30 a.m.] [o 10:15 a.m.]*                        |
|                             |  |                                     PM                |
|                             |  |  [o 1:00 p.m.] [o 4:30 p.m.]                          |
|                             |  |  Arizona time (no daylight saving)                    |
+-----------------------------+  +-------------------------------------------------------+
                                                                       [ Continue ]
```
States: Loading calendar skeleton + "Checking Sam's times…". No openings in 14 days: EmptyState with "Try Elena" link. Error, offline as standard.

---

## 15. Progress — `/progress`

- **Purpose:** show effort without pressure.
- **Question answered:** "How am I doing, and what do I do most?"
- **Roles:** all (own data). Parent sees a child's summary in `/family/[memberId]`, not here.
- **Research:** stat row with dividers (W §4 r29); streak dots with reward icon (W §4 r30); tier bar with "away from" amount (W §4 r31); month calendar with highlighted days (W §3.2 Emergent); range pills (G §5 MacroFactor).

### 15.1 Layout
| Order | Section | Columns | Content | Components |
|---|---|---|---|---|
| 1 | Header | 12 | Title "Progress"; range `ToggleGroup`: 4 weeks · 12 weeks · This year | `PageHeader`, `ToggleGroup` |
| 2 | Stat row | 12 | Four cells: **Visits** "14 this month" · **Weekly average** "3.2" · **Streak** "9 weeks" · **Favourite** "Cycle" (icon + name) | `StatRow` |
| 3 | Weekly goal | 6 | `ProgressRibs` variant `hero` (weekly goal, shared §9.5): "2 of 3 visits this week"; over goal shows bonus ribs ("4 of 3 visits"). The month total sits in the stat row ("14 this month"). Next milestone line (tier-style, W §4 r31): "6 visits to your 50th." | `ProgressRibs`, `Progress` |
| 4 | Streak | 6 | `VisitStreak` variant `month` (streak hero: the count large in `data-l`, "9 weeks", above the month calendar; mobbin-standard-pass §2 rule 53) and, above it, variant `strip`: this week as 7 dots Mon–Sun (visit = filled, planned = outline, rest = empty) with the goal marker, plus "9 weeks in a row at 3 or more visits." Help: "Rest days count too. One quiet week doesn't erase a streak: you get 1 rest week per 10 weeks." (rest-week rule is a proposed rule: add [P17]) | `VisitStreak` |
| 5 | Calendar | 6 | Month `Calendar` (part of `VisitStreak` `month`) with a filled dot on each visit day and a ring on booked future days; no X on missed days (the brand does not shame; shared revision log) | `Calendar` |
| 6 | Class mix | 6 | Horizontal bar chart by category (Strength 6, Cycle 5, Mind & Body 2, Conditioning 1), each bar with category icon and name and a count; legend not needed because labels sit on bars; `Button` "Show as table" | `chart` (shadcn), `CategoryBadge` |
| 7 | Visits by day and hour | 12 | Bars by weekday ("You usually come Tuesday and Thursday mornings") + best-time sentence | `chart` |
| 8 | Milestones | 12 | List: "50th visit — 6 to go", "10-week streak — 1 week to go", "First lap swim — done Oct 9" | `Card`, `Badge` |

[P17] Streak rule: a streak week = at least the weekly target visits (default 3, set in onboarding). One rest week is forgiven per 10 weeks. Add to foundation if kept.

### 15.2 States
Loading skeletons + "Loading your progress…". Empty (new member): EmptyState "Your first visit starts the count. Book something easy: here are 3 first-timer classes." (3 cards). Error per card. Offline: cached charts with "Saved". Reduced motion: ribs fill without animation.
Responsive: <1024 two columns → one; calendar and charts stack; stat row 2×2.

```
Progress                                                      (4 weeks)[12 weeks](This year)
+----------------+----------------+----------------+----------------+
| Visits         | Weekly average | Streak         | Favourite      |
| 14 this month  | 3.2            | 9 weeks        | (bike) Cycle   |
+----------------+----------------+----------------+----------------+
+----------------------------------+ +-------------------------------+
| MONTHLY GOAL   ||||| (5 of 5)    | | THIS WEEK  M T W T F S S      |
| 14 of 12 visits. Goal met.       | |            o o . . . . .      |
| 6 visits to your 50th.           | | 9 weeks at 3 or more visits   |
+----------------------------------+ | Rest days count too.          |
+----------------------------------+ +-------------------------------+
| CLASS MIX        [Show as table] | | OCTOBER   < >                 |
| (barbell) Strength  ######  6    | | Su Mo Tu We Th Fr Sa          |
| (bike) Cycle        #####   5    | |  .  .  .  .  1* 2  3          |
| (lotus) Mind&Body   ##      2    | |  ...                          |
+----------------------------------+ +-------------------------------+
```

---

## 16. Family — `/family`

- **Purpose:** manage the people on the plan.
- **Question answered:** "Who is on my plan, what can they do, and what does it cost?"
- **Roles:** primary: full. Family adult: read. Teen/child: none.
- **Research:** household sections with an "Add" link at each header (W §4 r41; Care.com); role labels (Instacart); relationship radio (W §4 r39); guest vs member (W §4 r33).

### 16.1 Layout
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Title "Family"; description "4 members · $156 per month." | `PageHeader` |
| 2 | Household summary | Card: plan "Ridge · $79", add-ons "1 adult $39 · 2 children $19 each = $77", total "$156 per month", next charge "Nov 12". Link "Billing" | `Card`, `StatCell` |
| 3 | **Adults** section | Header "Adults" with "Add" link (W §4 r41). `FamilyMemberCard` rows: Maya Brandt — Primary — Active; Chris Brandt — Adult — Active — passkey set | `FamilyMemberCard` |
| 4 | **Children and teens** section | Header "Children and teens" with "Add" link. Cards: Theo, 9 — Child — "Kids club ready"; Ivy, 6 — Child — "Add allergy notes" (warning pill) | `FamilyMemberCard` |
| 5 | Pending | Avatar row ends with a grey "+" circle "Add member" (mobbin-standard-pass §2 rule 50). "Invited" rows show "Invite pending" and a link "Send a reminder?" (rule 51); menu: Resend, Cancel invite | `Badge`, `Menu` |
| 6 | Help | Accordion: "How family pricing works" · "What teens can do" · "Moving to a new plan" | `Accordion` |

`FamilyMemberCard`: avatar 56 px, name, role label, age, status pill, quick facts (next booking, visits this month), actions menu (Edit profile, Permissions, Show pass, Remove). Teen variant shows permission switches summary: "Classes on · Courts off · Lanes off".

### 16.2 Add member (dialog or page)
5-step wizard in Flow 11. Wireframe of step 2:
```
Add to your plan                                              Step 2 of 5
[=========-----------------------------]
Who are you adding?
 ( ) Another adult (18+)                     +$39 per month
 (x) A child or teen (3-17)                  +$19 per month
 ( ) Just visiting? Send a guest pass instead >
                                    [ Back ]  [ Continue ]
```

### 16.3 Member profile `/family/[memberId]`
Sections: Profile (name, DOB, photo), Health notes (children), Authorised pick-up adults, Permissions (teen switches), Activity (visits this month, upcoming bookings), Pass, Remove member (collapsed, W §4 r27 pattern).

States: Loading "Loading your family…"; Empty: "It's just you for now. Add a partner or a child." + "Add a member" (primary); Error; Offline read-only. Responsive: cards one column <768, two columns ≥768.

---

## 17. Membership overview — `/membership`

- **Purpose:** one view of the plan, status and every plan action.
- **Question answered:** "What am I on, what does it include, and how do I change, pause or stop it?"
- **Roles:** primary: full. Family adult: read-only summary. Teen: `/403`.
- **Research:** plan name large + price + renewal date (W §3.8 Bloom, Base44, Canny); status pill with a second action (W §4 r25); "Danger zone" collapsed at the bottom (W §4 r27); renewal line (G r7); frozen state as a neutral pill with a pause icon, not a green one (mobbin-standard-pass §2 rule 49; shared `PlanCard` `current`).

### 17.1 Layout
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Status banner (conditional) | Freeze scheduled / Ends Dec 12 / Changing to Trailhead on Nov 12 — each with its second action ("Cancel freeze", "Keep my membership", "Undo change") | `StatusPill`, `Button` |
| 2 | Plan card (8) | Eyebrow "YOUR PLAN"; plan name "Ridge" (`data-l` Archivo 700 36/40); `StatusPill` "Active"; price "$79 per month"; "Family add-ons $77 per month"; "Next charge: Nov 12 · $156.00"; "Home club: Gilbert – Val Vista · Member since Mar 4, 2025". Buttons: "Change plan" (primary), "Freeze membership" (outline) | `PlanCard` variant `current` (disabled "Your plan" button where the card is shown on the change page), `StatusPill`, `Button` |
| 3 | Included (4) | Checklist: All 5 clubs · All classes · Courts, 3 days ahead · 1 guest pass per month · 7-day booking | `Card`, list |
| 4 | Usage (12, 3 cells) | Guest passes "1 of 1 left, resets Nov 12" · Booking window "through Nov 3" · Late cancels "1 in 30 days" | `StatRow` |
| 5 | Fees | Plain list: "Annual facility fee: $49, charged in March." · "Enrollment: $0 during Fall climb." · "Freeze: $10 per month, 1–3 months." · "Cancel: 30 days' notice." | `Card` |
| 6 | Upgrade hint (if not Summit) | `PromoBand`: "Summit adds the recovery suite, 9-day booking and 4 guest passes." + "Compare plans" | `PromoBand` |
| 7 | Cancel membership | `Collapsible` closed by default, red title "Cancel membership"; inside: consequence sentence and button "Cancel membership" (W §4 r27) | `Collapsible`, `Button` danger-outline |

Status pill vocabulary: Active · Freeze scheduled · Frozen · Payment failed · Changing on Nov 12 · Ends Dec 12. Each pill has icon + text.
States: Loading skeleton + "Loading your membership…". Error. Offline read-only. Family adult: sections 2 (name, status, renewal date only), 3, 4. Responsive: plan card full width, included below, buttons wrap.

```
Membership
+-------------------------------------------------------+ +---------------------------+
| YOUR PLAN                                  [Active]   | | Included                  |
| Ridge                                                 | | v All 5 clubs             |
| $79 per month + family add-ons $77 per month          | | v All classes             |
| Next charge Nov 12 - $156.00                          | | v Courts, 3 days ahead    |
| Home club: Gilbert - Val Vista                        | | v 1 guest pass per month  |
| [ Change plan ]  [ Freeze membership ]                | | v 7-day booking           |
+-------------------------------------------------------+ +---------------------------+
| Guest passes 1 of 1 | Booking window to Nov 3 | Late cancels 1 in 30 days |
> Cancel membership   (collapsed)
```

---

## 18. Change plan — `/membership/change-plan`

- **Purpose:** compare plans and see the exact money and date effect before confirming.
- **Question answered:** "What do I get or lose, what do I pay today, and when does it start?"
- **Roles:** primary.
- **Research:** a payment summary with Subtotal and "Today's total" and a note on when the new charge starts (Klaviyo; mobbin-standard-pass §2 rule 32; W §4 r23); a "Before you switch" list of fee changes and lost features (Square; rule 31); current-plan badge with disabled button (W §4 r21); feature matrix (W §4 r24); outline "Keep" left and filled "Switch" right (G r5–r7). No monthly/annual toggle: plans are month to month (F §4), so W §4 r22 and mobbin-standard-pass §2 rules 11–12 do not apply (the shared revision log makes the same decision).

### 18.1 Layout (≥1024: 8 + 4 columns)
| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Back link "Membership"; title "Change plan"; text "Month to month. No contract." | `PageHeader` |
| 2 | Plan cards (3 across, 8 columns) | **Trailhead $54 per month** — "One home club" · **Ridge $79 per month** — "Most popular" tag, **Current plan** badge, button disabled "Current plan" · **Summit $129 per month**. Each card is a shared `PlanCard`: variant `current` on Ridge (button disabled, "Your plan"), variant `change` on the others (price delta, effective date, button "Choose Summit" / "Choose Trailhead" that fills the preview). | `PlanCard` (`current`, `change`) ×3 |
| 3 | Comparison | `PlanComparisonTable`, rows: Clubs · Classes and pools · Booking window (7/7/9) · Courts · Guest passes (0 / 1 / 4 per month) · Recovery suite · Towel service · PT intro session (– / – / 1 per quarter) · Kids club for children. Check icon + text for yes, "—" with `sr-only` "not included" for no. Current column highlighted with a `primary-subtle` header. | `PlanComparisonTable` |
| 4 | Preview panel (4, sticky) | `PlanChangePreview` — empty state "Pick a plan to see the cost." After choice: upgrade or downgrade layout (Flow 12). | `PlanChangePreview` |
| 5 | Footnote | "Family members follow the main plan. Add-ons stay $39 per adult and $19 per child." | `xs` |

**PlanChangePreview — upgrade to Summit (example)**
```
Summit - $129 per month
Starts today
 Plan difference                       $50.00 per month
 Prorated Oct 27 to Nov 11 (16 of 31 days)   $25.81
 --------------------------------------------------
 Subtotal                              $25.81
 Today's total                         $25.81
 The new monthly charge starts Nov 12.
 Next charge  Nov 12                   $206.00
   Summit $129 + 1 adult $39 + 2 children $19 each
 Before you switch: nothing ends. You gain the recovery
   suite, 9-day booking and 4 guest passes per month.
 Everyone in your household gets Summit access.
 Visa ending 4821  [Change]
 [ Keep Ridge ]            [ Switch to Summit ]
```
**Switch to Trailhead (downgrade example)**
```
Trailhead - $54 per month
Starts Nov 12. You keep Ridge until then.
 Before you switch:
  (x) Other clubs: not included in Trailhead
  (x) Courts: not included in Trailhead
  (x) 1 guest pass per month ends
 Home club  [Gilbert - Val Vista v]   (required)
 3 bookings at other clubs after Nov 12 and 1 court reservation will be cancelled. No late-cancel strike.
 Next charge  Nov 12                   $131.00
   Trailhead $54 + 1 adult $39 + 2 children $19 each
 [ Keep Ridge ]           [ Switch to Trailhead ]
```
States: Loading skeleton + "Loading plans…"; Error; Offline read-only; Frozen: page replaced with "Resume your membership first." + button. Pending change: banner with "Undo change". Responsive: cards stack; preview panel becomes a bottom `Drawer` opened by a sticky bar "Review change"; comparison table scrolls horizontally inside `ScrollArea` with sticky first column (feature names), or switches to an `Accordion` per feature below 768.

---

## 19. Freeze — `/membership/freeze`

- **Purpose:** pause the membership for 1–3 months at $10 per month.
- **Question answered:** "How long, from when, what does it cost, and what happens to my bookings?"
- **Roles:** primary.
- **Research:** pause flows exist in Mobbin now (mobbin-standard-pass §2 rules 29–30, 48–49; §3 correction 3): plain headline, a duration select, one filled button, one sentence with the renewal date and the pause window above the button, a bottom sheet with a "Not now" text link on narrow screens, and a neutral paused pill.
- **Layout (≥1024):** wizard column 640 px + summary aside 320 px (sticky). Below: wizard full width, summary at top as a collapsible.

| Step | Content | Components |
|---|---|---|
| Progress | `Progress` + "Step 1 of 3" | |
| 1 Length and start | `ToggleGroup` "1 month / 2 months / 3 months" (44 px segments). `Select` "Start on" listing billing dates ≥ 30 days away (Dec 12, Jan 12, Feb 12, …). Help "We need 30 days' notice, so the earliest start is Dec 12." Live summary line: "Frozen Dec 12 – Jan 11. Resumes Jan 12." | `FreezeWizard`, `ToggleGroup`, `Select` |
| 2 What changes | Definition list: Pass · Bookings · Kids club, courts, lanes · Guest passes · Training packs · Billing · Family. Each line one sentence (copy in file 05). Bookings list: "No bookings in this time." or the actual list with "will be cancelled with no late-cancel strike". | `Card`, list |
| 3 Confirm | Payment method line; one summary sentence above the button: "Your plan pauses Dec 12 and returns Jan 12 at $156.00 per month." (rule 30); full-width filled "Freeze membership" with a "Not now" text link under it (rule 48). Under 768 px this is a bottom sheet with a pause icon. | `PaymentMethodCard` (compact) |
| Aside | `FreezeSummary` card: "1 month · $10.00 · starts Dec 12 · resumes Jan 12" and "Normal price after: $156.00 per month." | `Card` |
| Done | Shared success pattern: green check, headline "Freeze set: Dec 12 – Jan 11", neutral "Freeze scheduled" pill, summary card, filled "Back to membership", "Cancel freeze" text link, "Done" | |

During-freeze view lives on `/membership` and `/today` (see Flow 13). States: Loading; Error; Blocked variants ("Fix your payment first.", "You already have a freeze scheduled."). Offline: read-only.

```
Freeze membership                                            Step 1 of 3
[=========------------------------------]
 How long?   [ 1 month ] ( 2 months ) ( 3 months )
 Start on    [ Dec 12 v ]    We need 30 days' notice, so the earliest start is Dec 12.
 Frozen Dec 12 - Jan 11. Resumes Jan 12.            +--------------------------------+
                                                    | Freeze summary                 |
                                  [ Continue ]      | 1 month - $10.00               |
                                                    | Normal price after: $156.00/mo |
                                                    +--------------------------------+
```

## 20. Cancel membership — `/membership/cancel`

Single column, 640 px, three steps as in Flow 14 with progress bar. Header "Cancel membership". Step 3 text and buttons are in file 05. Layout rule: "Keep my membership" and "Cancel membership" are the same height and width, side by side, never one hidden. The list of what ends uses a red X icon plus words on every line (mobbin-standard-pass §2 rule 28). We do not copy that screen's text-link cancel. Done page: green check, end date, "Download my visit history (CSV)", "Keep my membership".

```
Cancel your membership?                                       Step 3 of 3
Your membership ends on Dec 12. You keep full access until then.
 (x) Last charge: Nov 12 - $156.00. No annual fee in March.
 (x) Family members end on the same date.
 (x) Unused training sessions are refunded at the price you paid per session.
 (x) Bookings after Dec 12 are cancelled with no late-cancel strike.
 [ Keep my membership ]                       [ Cancel membership ]
```

---

## 21. Billing — `/billing`

- **Purpose:** show what you pay, how, and the receipts.
- **Question answered:** "What is my next charge, which card pays, and where are my invoices?"
- **Roles:** primary only.
- **Research:** billing card with brand + last 4 and "Update payment details" (W §4 r26); invoices table with columns Invoice, Date, Amount, Status and a row action (mobbin-standard-pass §2 rule 33; Mercury), a light-green "Paid" pill and a grey "Open" pill, and a download action on each row (rule 34; Magnific); W §3.8; trial/status banner (W §4 r28); status pill with second action (W §4 r25).

### 21.1 Layout
| Order | Section | Columns | Content | Components |
|---|---|---|---|---|
| 1 | Header | 12 | Title "Billing" | |
| 2 | Failed payment banner (conditional) | 12 | "Your Nov 12 payment didn't go through. Update your card to keep booking." + buttons "Update card", "Try card again" | `PaymentStatusBanner` |
| 3 | Next charge | 7 | Eyebrow "NEXT CHARGE"; `data-l` "$156.00"; "Nov 12, 2026"; breakdown lines: Ridge $79.00 · Adult add-on $39.00 · Child add-ons 2 × $19.00 = $38.00; link "Annual facility fee $49 is charged in March." | `Card`, `StatCell` |
| 4 | Payment method | 5 | `PaymentMethodCard`: card brand icon + "Visa ending 4821" + "Expires 11/26" + `Badge` "Default" + warning pill "Expires next month" when under 60 days; button "Update payment method"; link "Add a backup card" | `PaymentMethodCard` |
| 5 | Billing details | 6 | Name, billing address, receipt email (all `Field` display with Edit) | `Card`, `Field` |
| 6 | Credits and packs | 6 | "Training: 5 sessions left" · "Guest passes bought: 0" | `Card` |
| 7 | Invoices | 12 | `InvoiceTable` (shadcn `data-table`): Invoice (number and description) · Date · Amount · Status · Download. Rows: Oct 12 — "Ridge + family, Oct 12–Nov 11" — $156.00 — Paid; Sep 20 — "Guest pass" — $20.00 — Paid; Sep 12 — $156.00 — Paid; Aug 12 — $156.00 — Paid; Aug 3 — "Training pack, 8 sessions" — $520.00 — Paid; Mar 1 — "Annual facility fee" — $49.00 — Paid. Sort by date; filter `Select` All · Membership · Training · Guest passes · Fees; pagination 10 per page. Click row → `/billing/invoices/[id]`. | `InvoiceTable`, `Badge`, `Pagination` |
| 8 | Receipts help | 12 | "Need a receipt for your employer? Download the PDF on any row." | `xs` |

Statuses: Paid (light-green tint, success) · Open (grey tint) · Failed (danger) · Refunded (neutral). Status always has an icon and text.
States: Loading "Loading your billing…"; Empty invoices "Your invoices will show here after your first charge."; Error; Offline: cached, actions disabled. Teen/adult: `/403`.
Responsive: next charge and payment method stack; `InvoiceTable` becomes a list of cards (date + amount on line 1; description and status on line 2; download button 44 px).

```
Billing
+--------------------------------------------+ +-----------------------------------+
| NEXT CHARGE                                | | Payment method                    |
| $156.00     Nov 12, 2026                   | | [VISA] Visa ending 4821  Default  |
| Ridge $79.00 - Adult $39.00 - 2 x $19.00   | | Expires 11/26 [Expires next month]|
| Annual facility fee $49 is in March.       | | [ Update payment method ]         |
+--------------------------------------------+ +-----------------------------------+
Invoices                                              Show: [All v]
 Date     | Description                         | Amount  | Status | 
 Oct 12   | Ridge + family, Oct 12 - Nov 11     | $156.00 | Paid   | [pdf]
 Sep 20   | Guest pass                          | $20.00  | Paid   | [pdf]
 Sep 12   | Ridge + family                      | $156.00 | Paid   | [pdf]
 Aug 3    | Training pack, 8 sessions           | $520.00 | Paid   | [pdf]
                                                        < 1 2 >
```

---

## 22. Guest passes — `/guest-passes`

- **Purpose:** send or buy passes and track them.
- **Question answered:** "How many do I have, who used one, and how do I send another?"
- **Roles:** primary, adult (Ridge/Summit pools). Teen: hidden.
- **Research:** share link after booking with guests (W §4 r17); success with a next step (W §3.9); status pills.

| Order | Section | Content | Components |
|---|---|---|---|
| 1 | Header | Title "Guest passes"; right: button "Send a guest pass" (primary) | `PageHeader` |
| 2 | Balance | Card: `data-l` "1 of 1 left"; text "Resets Nov 12. Unused passes don't roll over." ; one pass icon per included pass (1 for Ridge, 4 for Summit), filled when available. Also "Need more? A day pass is $20 per guest." with "Buy a guest pass" (outline) | `GuestPassCard` (balance), `Button` |
| 3 | Rules | 4 short lines: One visit, one club · Guests are 18 or older (16 and 17 with a parent) · Valid 14 days · Guests sign a waiver on their phone | `Card` |
| 4 | Sent passes ("Pending invites" style list, mobbin-standard-pass §2 rule 36) | List of `GuestPassCard` rows: guest name, club, "Valid until Nov 10", status pill Sent / Opened / Used / Expired, actions menu (Resend, Edit contact, Cancel pass, Copy link). Example: "Pat Lowe · Gilbert – Val Vista · Sat, Oct 31 · Sent"; "Dana K. · Mesa – Dobson · Used Oct 11" | `GuestPassCard`, `Badge`, `Menu` |

Send dialog fields and states: Flow 10. The done step shows a link field and a "Copy link" button (rule 36). Empty: "No guest passes sent yet. Bring a friend this month." + "Send a guest pass". Trailhead: balance "0 included" and primary button "Buy a guest pass: $20". Frozen: "Guest passes pause while frozen." Loading/Error/Offline standard. Responsive: balance above, list as cards.

```
Guest passes                                                   [ Send a guest pass ]
+-------------------------------+ +-------------------------------------------------+
| 1 of 1 left                   | | One visit, one club - 18 or older (16-17 with a  |
| Resets Nov 12. No rollover.   | | parent) - valid 14 days - waiver on phone        |
| Need more? $20 per guest.     | +-------------------------------------------------+
| [ Buy a guest pass ]          |
+-------------------------------+
Sent
 Pat Lowe   Gilbert - Val Vista  Sat, Oct 31  [Sent]    [Resend][...]
 Dana K.    Mesa - Dobson        Used Oct 11  [Used]
```

---

## 23. Inbox — `/inbox`

- **Purpose:** everything the club tells you, plus messages with coaches and the front desk.
- **Question answered:** "What needs me, and what did they say?"
- **Roles:** all.
- **Research:** bell dropdown with tabs and rows (W §3.10 Plane, Klaviyo); full list with unread dot and "mark all read" (W §4 r38); activity panel with tabs (Quo).

### 23.1 Layout (≥1024)
Two panes: list 380 px (left) + detail (right). Tabs: **All · Needs action · Messages**. Header: "Mark all read" (ghost), filter `Select` (Bookings, Billing, Club news, Training).
- Row (`NotificationItem`): icon (category-coloured circle with Lucide icon), bold title, one-line preview, relative time ("5:35 a.m."), unread dot (red = unread only, with `sr-only` "Unread"). Needs-action rows carry an inline button.
- Detail pane: full text, action buttons, timestamp, "Delete" (ghost). Message threads: bubble list (`Item`), composer `textarea` + "Send".
- Example rows:
  1. "Spot held: Switchback HIIT, today 12:00 p.m." — "Confirm by 6:05 a.m." — 5:35 a.m. — [Confirm spot]
  2. "Booked: Climb Cycle, Tue 6:00 a.m." — Yesterday
  3. "Card expires 11/26" — [Update card]
  4. "Coach Sam: See you Thursday" — Messages — Mon
  5. "Jordan asked to join Teen Strength" — [Approve] [Decline] (for parent)
  6. "Late cancel on Sat, Oct 24" — "That's 1 of 3. It clears Nov 26."
  7. "How was Climb Cycle?" — private feedback, no stars (Great / Fine / Not for me).
- <1024: single list; row opens `/inbox/[threadId]` as a page with Back.

States: Loading "Loading your inbox…"; Empty All: "You're all caught up." ; Empty Needs action: "Nothing needs you right now."; Empty Messages: "No messages yet. Message a coach from their profile."; Error; Offline: cached; actions disabled. Auto mark-as-read after the detail has been open 2 seconds (keyboard users: explicit "Mark as read" button also).

```
Inbox            (All 3)  Needs action 2  Messages            [Mark all read]  Filter: All v
+-------------------------------------+ +---------------------------------------------------+
| o (clock) Spot held: Switchback ... | | Spot held: Switchback HIIT, today 12:00 p.m.      |
|   Keep it by 6:05 a.m.   5:35 a.m.  | | A spot opened. It's yours for 30 minutes.         |
|   [Confirm spot]                    | | Confirm by 6:05 a.m. (24:10 left)                 |
|   (check) Booked: Climb Cycle  Tue  | | [ Confirm spot - 24:10 ] [ Release ]              |
| o (card) Card expires 11/26         | |                                                   |
|   (coach) Coach Sam: See you Thu    | |                                                   |
+-------------------------------------+ +---------------------------------------------------+
```

---

## 24. Settings — `/settings/*`

- **Purpose:** profile, preferences and security.
- **Question answered:** "How do I change how the app works for me?"
- **Layout (≥1024):** left list nav inside a card (240 px) + content card (fluid, max 720 px) (W §3.1 settings pattern: Meetup, Shopify, Base44). <1024: the list is a full-page index; each item opens its own page with Back.
- **Sections and fields**

| Page | Fields and controls |
|---|---|
| **Profile** `/settings/profile` | Photo (upload, crop; required for the pass), name, preferred name, date of birth (read-only after set), phone, email (verify on change), emergency contact. `autocomplete` attributes set. |
| **Home club and interests** `/settings/preferences` | Home club (`Select`; Trailhead once per billing cycle), interests (`CategoryBadge` toggles), goal, weekly target (`ToggleGroup`), booking filters saved |
| **Notifications** `/settings/notifications` | Matrix topics × channels (Push, Email, Text). Topics: Class reminders (time before: 30 / 60 / 120 min `Select`), Waitlist and held spots, Booking changes, Coach messages, Club news, Billing (email always on), Marketing (off). Quiet hours `Switch` + times (default 9:00 p.m.–5:00 a.m. except held-spot alerts). Test notification button. Browser push status line. |
| **Calendar** `/settings/calendar` | Feed URL with Reveal/Copy/Reset; include household / kids club |
| **Sign-in and security** `/settings/security` | Passkeys list (Add, Remove), password (Set/Change), signed-in devices (Sign out), "Sign out everywhere" |
| **Display and accessibility** `/settings/display` | Theme `RadioGroup` System / Light / Dark; Motion `RadioGroup` System / Reduce; Text size `RadioGroup` Default / Large (sets root font to 18 px; layout reflows); Time format 12-hour only (shown as info); Language English |
| **Privacy and data** `/settings/privacy` | Download my data, Delete my account (primary member: "Cancel membership first" link), Teen notice about parent visibility, marketing consent |

Each page saves per field with inline "Saved" text (`role="status"`) and a toast only on failure. Destructive actions use `AlertDialog`. States: loading skeleton + "Loading settings…"; error per field with retry; offline: read-only.

```
Settings
+--------------------+ +------------------------------------------------------+
| Profile        *   | | Notifications                                        |
| Home club          | |                       Push    Email    Text          |
| Notifications      | | Class reminders       [on]    [on]     [off]         |
| Calendar           | |  Time before: [60 min v]                             |
| Sign-in & security | | Waitlist and held     [on]    [on]     [on]          |
| Display            | | Booking changes       [on]    [on]     [off]         |
| Privacy and data   | | Billing               [on]    [on*]    [off]  *always|
+--------------------+ | Quiet hours 9:00 p.m. - 5:00 a.m. [on]  Held spots still come through |
                       +------------------------------------------------------+
```

---

## 25. Check-in pass — `/pass`

- **Purpose:** get through the door fast.
- **Question answered:** "Where is my pass?"
- **Roles:** all. Adults can switch to household members; teen own only.
- **Research:** large member number with a small label above (G r12); QR in a white rounded square (G r14); wallet button below the pass (G r13). A gym pass is still not in Mobbin; Wallet buttons exist only on non-gym passes and must not be cited as gym patterns (mobbin-standard-pass §3 correction 4).
- **Component:** shared `CheckInPass` (shared §9.3). Page uses variant `full`; the top-bar `Dialog` uses `full`; Today uses `compact`; a household adult sees `teen` and child passes in the member switcher.
- **Layout:** centred column 420 px max on `surface-muted` page area (light) or night green (dark). In light mode the QR panel is white; in dark mode it stays white (QR needs a light quiet zone).

| Order | Content | Components |
|---|---|---|
| 1 | Member switcher: `Select` "Showing: Maya (you)" with avatars; hidden for single-member accounts | `Select` |
| 2 | `CheckInPass`: top band Saguaro Night with Rib Peak symbol reversed and "Cactus Peak Athletic"; photo 72 px; name "Maya Brandt"; plan chip "Ridge"; eyebrow "MEMBER NUMBER" then "CP-004-182-337" in `data-l`; QR 240 px in white rounded square with 16 px quiet zone; caption "Scan at the front desk. Updates every 60 seconds."; status chip | `CheckInPass` |
| 3 | Buttons: "Add to Apple Wallet" (Apple devices) / "Add to Google Wallet"; "Brightness tip" text | `Button` |
| 4 | Footer line: "Home club: Gilbert – Val Vista · Open now" | |

Pass states (shared): `valid` (success), `frozen` ("Frozen until Jan 11", neutral), `past-due` ("Payment needed. See the front desk.", from day 15), `trial`, `guest` ("Guest pass · valid Oct 31"). "Membership ends Dec 12" is an info line on a `valid` pass. When not scannable, the QR is replaced by the text message and the member number stays visible.
Loading: skeleton QR + "Getting your pass…". Offline: cached QR plus warning line (Flow 18). Error: "We couldn't refresh your pass. Show your member number: CP-004-182-337." The top-bar `Dialog` shows the same `full` card at 360 px wide.

```
          Showing: [ Maya Brandt (you) v ]
   +----------------------------------------+
   |  /|\  Cactus Peak Athletic              |
   |----------------------------------------|
   |  (photo)  Maya Brandt     [Ridge]      |
   |                                        |
   |  MEMBER NUMBER                         |
   |  CP-004-182-337                        |
   |    +------------------------+          |
   |    |  [ QR CODE            ]|          |
   |    +------------------------+          |
   |  Scan at the front desk. Updates every |
   |  60 seconds.            [ Active ]     |
   +----------------------------------------+
          [ Add to Apple Wallet ]
```

---

## 26. Utility pages

| Page | Content |
|---|---|
| **Help** `/help` | Search field; groups: Booking and cancelling, Courts and lanes, Kids club, Billing, Membership, Guest passes; `Accordion` answers; contact card with club phones ("Gilbert – Val Vista (480) 555-0142"), "Message the front desk" (staffed 6:00 a.m.–8:00 p.m.), "Report a problem" |
| **No access** `/403` | `EmptyState`: "You don't have access to this page." + reason ("Your parent manages billing.") + button "Back to Today" + "Message Alicia" when it applies |
| **Not found** `/404` | "We couldn't find that page." + search + "Back to Today" |
| **Offline** `/offline` | "You're offline." + list of what still works (Pass, Bookings) + "Try again" |
| **Error** `/error` | "Something went wrong on our side." + error id + "Try again" + "Message the front desk" |
| **Maintenance** | "We're doing a short upgrade. Back by 6:00 a.m." |

All use `EmptyState` (icon, headline, line, button) left-aligned on content width 560 px.
