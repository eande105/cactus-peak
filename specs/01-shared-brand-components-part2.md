# Cactus Peak Athletic — Shared brand component spec (part 2 of 2)

Part 1 (`01-shared-brand-components.md`) holds the principles, category colours, data model, shared rules (section 4) and the primitives and club components (sections 5 and 6). This file holds sections 7 to 11. Source keys (MKT, WEB, IOS, GAP, APL, LIB, FND, BRD, THM) are defined in part 1, section 0.2. The revision pass cites the file `mobbin-standard-pass.md` in full ("mobbin-standard-pass §2 rule N"). The Revision log is at the end of this file (section 12).

All components here use the shared rules in part 1 section 4: tokens, shape and type, the state matrix, photo rules, accessibility baseline, formatters.

## 7. Class and schedule components

### 7.1 `ClassCard`

**Purpose and question.** "What is this class, when is it, who teaches it, how hard is it, and can I get in?" One component shows a session in four shapes.

**Shared data.**

```ts
interface ClassCardProps {
  session: ClassSession;
  instructor: Instructor;
  club: Pick<Club,'id'|'displayName'|'shortName'>;
  booking?: Booking;                  // the member's booking, if any
  variant: 'schedule-row'|'card'|'featured'|'compact';
  showClub?: boolean;                 // true when the list spans several clubs
  selected?: boolean;                 // row open in the detail panel
  surface: 'marketing'|'app'|'ios'|'widget';
  onOpen?: () => void;
}
```

**Variants.**

| Variant | Use | Photo | Height / size |
|---|---|---|---|
| `schedule-row` | One row per class in a day list (WEB §4 r2–r3, IOS §5 r2) | Optional 56 × 56 thumbnail on wide screens | 80 web, 72 iOS minimum |
| `card` | Browse grids, "Classes at this club", marketing preview (MKT §3 r14) | 16:9 at the top (WEB §4 r1) | Width 280–360 |
| `featured` | One highlighted class: "Starting soon", "Try this first" (MKT §2 H3, C1) | 4:3 on the left half (web wide), 16:9 on top (narrow) | Full content width |
| `compact` | Today tab, home cards, widgets, Live Activity summaries | Icon disc; widget tiles may add a small photo (see below) | Web 320 × 88. iOS small widget fills its container |

#### `schedule-row` anatomy (ordered, left to right)

1. Stripe: 4 px, category fill, full row height, radius XS on its outer edge.
2. Time block, width 72: start time in `data` Archivo 700 16/24 ("6:00 a.m."); under it, duration in `xs` `text-muted` ("45 min").
3. Main block (flexible), in this reading order:
   - Line 1: class name, Inter 600 `m` 16/24 (one line on web, up to two lines on iOS). If `rating` exists, `RatingLine` follows on line 2 (part 1, section 4.8).
   - Line 2: `CategoryBadge` `sm` + `IntensityRibs` `sm` (word shown at 640 px and wider) + "First-timers welcome" tag when `firstTimerFriendly` (icon `sprout`, success text) + age chip when `ageNote` exists (see "Age chip" below).
   - Line 3 (narrow screens and iOS): instructor line, "Dana T. · Cycle studio" and, when `showClub`, "· Gilbert – Val Vista".
4. Instructor column (web, 640 px and wider): `InstructorChip` `md` (40 px avatar, MKT §3 r14) with the short name. On narrow web and iOS this column is the instructor line in the main block and the avatar is 24 px (iOS: 32 pt) at the start of that line.
5. Trailing block: `CapacityIndicator` `ribs` (this is the "price or credit" slot; plans include classes, so spots left stands here), then `BookingStateButton` (medium, 44 high, min width 96). On narrow web and on iOS the button sits under the capacity text, right-aligned.

**Reading order (shared by web and iOS).** Time, title, instructor, spots, action (mobbin-standard-pass §2 rule 61; also mobbin-standard-pass §2 rule 38 and rule 24). The old order put the avatar before the title. The avatar now follows the title. I did not set the instructor name in all capitals (rule 38 shows capitals); capitals hurt reading of names, so the name keeps sentence case.

Padding: 12 vertical, 16 horizontal. Gap between blocks: 12. Divider: 1 px `border` between rows, inset 16.

**Wireframe: `schedule-row`, 720 px wide (web app).**

```
+----------------------------------------------------------------------------+
|#| 6:00 a.m.  Climb Cycle                     (O) Dana T.  [###..] 4 bikes left |
|#|   45 min   [bike CYCLE] [####.] Hard          Cycle studio   [   Book   ]       |
|#|            Gilbert - Val Vista  (only when showClub)                          |
+----------------------------------------------------------------------------+
 #  = 4 px category stripe        (O) = 40 px instructor face (third column)
 order: time | title | instructor | spots | action
 [###..] = CapacityIndicator ribs (warning tone: 4 or fewer left of 5)
```

**Wireframe: `schedule-row`, iOS (390 pt wide).**

```
+--------------------------------------+
|#  6:00 a.m.   Climb Cycle           |
|#  45 min      [bike CYCLE]  Hard    |
|#  (o) Dana T. - Cycle studio         |
|#              4 bikes left [###..]   |
|#                       [   Book   ]  |
+--------------------------------------+
 swipe left on the row: Book (copper) or Join waitlist
```

#### `card` anatomy (ordered)

1. Photo, 16:9, radius M on the top corners. On the photo: `CategoryBadge` `solid` top-left; `CapacityIndicator` `badge-on-photo` top-right (only when low or full); duration chip bottom-right ("45 min", `surface` fill) (WEB §4 r1).
2. Body, padding 16, gap 8:
   - Time line: "TODAY · 6:00 A.M." in `eyebrow` style with tabular digits, `text-muted`.
   - Title: class name, Archivo 600 `l` 24/30, two lines maximum.
   - Instructor: `InstructorChip` `md` (40 px avatar + name).
   - Meta: club short name · room (`s`, `text-muted`).
   - `IntensityRibs` `md` with word.
3. Footer: `BookingStateButton`, full width, 44 high.
4. Left edge: 4 px category stripe over the full card height, inside the radius.

**Wireframe: `card`, 320 px wide.**

```
+------------------------------------------+
|#+--------------------------------------+ |
|#| [bike CYCLE]            (4 bikes left)| |
|#|                                      | |
|#|     PHOTO 16:9 (cycle studio)        | |
|#|                          (45 min)    | |
|#+--------------------------------------+ |
|#  TODAY - 6:00 A.M.                       |
|#  Climb Cycle                             |
|#  (O) Dana Torres                         |
|#  Val Vista - Cycle studio                |
|#  [####.] Hard                            |
|#  [ ============ Book ============ ]      |
+------------------------------------------+
```

**Marketing `card` layout `thumb-left`.** In a three-column marketing grid, the card may use a square 96 × 96 thumbnail (radius S) at the left instead of the 16:9 photo: class name bold, club line, `RatingLine` (when `rating` exists) and `IntensityRibs` (mobbin-standard-pass §2 rule 8). Use it for "Classes at this club" lists. The `card` 16:9 layout stays the default.

**Age chip.** When the session's class type has `ageNote`, show it as a static chip in capitals: "AGES 13–17", "AGES 3–17", `eyebrow` style, radius XS, `surface-muted` fill, `text` colour. Youth sessions always show it (mobbin-standard-pass §2 rule 17).

#### `featured` anatomy

Two columns on wide screens: photo left (4:3, radius M), content right. Content: category badge, eyebrow time, title in Archivo 800 `xl` 36/40, a two-line editorial note (`m`), instructor row (`lg`), `IntensityRibs` `lg`, `CapacityIndicator` `large`, and one filled button plus a "Class details" link. Radius of the container: XL 28 on marketing, M 14 in the app. On narrow screens it becomes the `card` layout with the `xl` title.

#### `compact` anatomy

Icon disc (40 px `CategoryBadge` `icon-disc`), class name Inter 600 `m`, "6:00 a.m. · Val Vista" in `s`, and `CapacityIndicator` `text`. One tap opens the detail. No button on the card; the detail holds the action. **Widget tile (small).** A 2 × 2 widget grid tile has a small photo (or the icon disc when the photo is missing), a bold title, and a progress or status label in capitals, for example "NEXT: 6:00 A.M. CLIMB CYCLE" (mobbin-standard-pass §2 rule 55). The weekly-goal tile uses `ProgressRibs` `widget` (section 9.5).

**Live Activity layout (iOS, one per active booking).** Lock Screen card (mobbin-standard-pass §2 rule 54; layout from the WHOOP/Bevel/BitePal/Nike Live Activity screens in mobbin-standard-pass §1 search 19):
- Top right: a timer chip "Starts in 38 min" (`data`, tabular; uses a system timer text style so it counts without updates).
- Main: the class name large (Archivo 600 at 22 pt is allowed here because it is a display title; otherwise SF Pro) with the start time under it.
- Bottom row, three values: club short name · room · spots or "Check in open". For example "Val Vista · Cycle studio · Booked".
- Colours: Lock Screen allows a custom background. Use the night surface with Sand text. The category icon disc sits at the left.
- Dynamic Island compact: category icon on the leading side, timer on the trailing side. The compact view fits a 28 pt circle (APL §5). Expanded view repeats the three values. Minimal view: the category icon.
- Rules: end the activity when the class ends, dismissal 15 to 30 minutes later; show an innocuous summary on the Lock Screen ("Class in 10 min"), not the member's name; no promotions (APL §5). One Live Activity per booking, never for busyness.
Widget rules: read-only content that opens the app; does not depend on colour (tinted widgets remove colour, APL §5), so the icon and the words carry the meaning.

**States.**

| State | Rule |
|---|---|
| default / hover / focus / pressed | Section 4.3 of part 1. Row hover fills `surface-muted`. |
| selected (open in detail panel) | Row fill `primary-subtle`, `aria-current="true"`. Text keeps 13.4:1. |
| booked | Button shows "Booked". A small `success` check icon appears next to the time. Row does not change fill. |
| waitlisted | Button shows "On waitlist #3". |
| full | `CapacityIndicator` shows "Full · Waitlist 3". Button shows "Join waitlist". |
| cancelled by the club | Title and time in `text-muted`. A `danger` text line with the triangle icon: "Cancelled by the club." The button is replaced with the link "See similar classes". |
| substitute | A `warning` text line with the triangle icon: "Sub: Dana T. for Marcus L." |
| in progress | Time shows "Started 6:00 a.m."; button disabled "Started". |
| ended (history) | All text `text-muted`; no button. |
| loading | Skeleton: stripe, two time bars, avatar circle, three text bars, button block. |
| error (capacity unknown) | `CapacityIndicator` shows "Spots unavailable"; button disabled with the reason. |

**Light and dark.** Row and card fill `surface`. Stripe, icon: category fill. Badge text: category text token. Photo untouched. See part 1 section 2.2.

**Content rules.**
- One-line summary (used for list text, notifications and alt text): "Climb Cycle · 6:00 a.m. · 45 min · Gilbert – Val Vista · 4 bikes left".
- Sample titles from FND §3: Rib Rack Strength, Climb Cycle, Switchback HIIT, Desert Flow Yoga, Aqua Fit.
- Instructor name format on rows: "Dana T." On cards and detail: "Dana Torres".
- "First-timers welcome" is the only phrase for `firstTimerFriendly`.
- Never write "Sold out". Write "Full".
- Marketing shows spots left only at five or fewer (part 1, section 5.4).
- Marketing `schedule-row` button: "Book" for signed-in members is not possible on the marketing site. Use "Try this class" (links to the trial or tour flow). The preview shows at most six classes before "See full schedule" (MKT §3 r16).

**Accessibility.**
- Accessible name for the row: "Climb Cycle, 6:00 to 6:45 a.m., Gilbert – Val Vista, Cycle studio, with Dana T., Intensity Hard 4 of 5, 4 bikes left." Then the button name: "Book Climb Cycle, 6:00 a.m."
- The row is one link to the detail. The button is a separate tab stop. On iOS, combine the text children (`.accessibilityElement(children: .combine)`) and expose "Book", "Join waitlist" and "Cancel booking" as `.accessibilityAction(named:)` custom actions. Swipe actions also exist as visible buttons (APL §6).
- Keyboard (web): Tab to the row link, Tab to the button. Enter opens. Space triggers the button.
- Dynamic Type at AX sizes: the row becomes a vertical stack in this order: time, class name, badge, intensity, instructor, spots, button. Nothing truncates. The stripe stays at the left edge. The avatar drops to 32 pt.
- The category is read once (badge text). The stripe is hidden from assistive tech.

**Web build.**
- Row base: shadcn `item` (list row item), restyled. Card base: shadcn `card` (local `.cp-card`). Photo: shadcn `aspect-ratio`. Avatar: Graphical `Avatar` (image, fallback). Tag: shadcn `badge`. Button: `BookingStateButton` (Graphical `Button`). Skeleton: shadcn `skeleton`. Tooltip for ribs: Graphical `Tooltip`.
- Custom parts: stripe, time block, `CapacityIndicator`, row-to-detail selection logic, the stretched link.

**iOS build.**
- `schedule-row`: a `List` row. `HStack` with a 4 pt `Rectangle` stripe, a time `VStack` (SF Pro, `.monospacedDigit()`), `AsyncImage` avatar clipped to `Circle`, and a text `VStack`. `NavigationLink` pushes the detail. `.swipeActions(edge: .trailing)` gives Book or Join waitlist. In a `ScrollView` use `swipeActionsContainer()` (iOS 27, APL §1).
- `card`: a `VStack` in a `RoundedRectangle(cornerRadius: 14)` with `Color("Surface")`. Not glass (APL §3).
- `compact`: a widget view. Use `ContainerRelativeShape` for corners. Use `.widgetAccentable()` on the icon only [unverified, APL §5].
- Brand shows through: the stripe and icon colour, `.tint` on the button, and Archivo only for the title in `featured` (28 pt `relativeTo: .title`). Times and names use SF Pro. Native: List, NavigationLink, swipe actions, `Label`, `Button`.

**Research basis.** mobbin-standard-pass §2 rule 61 (same row order on web and iOS), rule 38 (time bold, duration grey, title, instructor under), rule 24 (booking row with one button), rule 8 (thumbnail class grid), rule 17 (age chip), rule 41 (rating line, optional), rules 54–55 (Live Activity and widget layouts). WEB §4 r1 (16:9 card, duration badge, instructor name), r2–r3 (time, duration and name in one row; one row per class), r9 (seats-left badge on photo), r35 (coloured stripe). MKT §3 r14 (card shows 40 px avatar, time, duration, intensity label, Book), r15, r16, r17. IOS §5 r2–r3 (same row layout; spots at the trailing edge; "Full" in place of the number), IOS §6 #3, #7. IOS §4.3 (no photo or colour in the observed rows: so thumbnails and stripe are new here). APL §6 (custom actions, combine, swipe backup). LIB §4 (class card is a gap: card surface plus Button).

### 7.2 `ClassDetailPanel`

**Purpose and question.** "Is this the right class for me, and what happens if I book or cancel?" It shows everything about one session and holds the main booking action.

**Anatomy (ordered).**
1. Hero: photo, 16:9 on web (inside the panel), about 40 % of the screen height on iOS, with a pager when there is more than one photo (IOS §5 r4). Top bar: back or close, share, favourite. A solid Saguaro Night band (80 %) across the bottom of the hero carries the instructor name and the start time in Sand text, for example "with Dana Torres · Wed, 6:00 a.m." (mobbin-standard-pass §2 rule 39). No text sits on the photo outside the band. The page title stays below the hero.
2. Status chip above the title when there is an entry rule: "Ages 13 to 17", "Under 16 with adult", "Waiver required" (IOS §5 r7). Uses `info` style: `surface-muted` fill, `text`.
3. Category badge + title (`xl` Archivo 800 36/40 on web; Title 1 28 pt on iOS).
4. Instructor row: `InstructorChip` `lg` (56 px) with "with Dana Torres" under the title (IOS §5 r6). Tapping opens the `CoachCard` view.
5. Stats row of three (mobbin-standard-pass §2 rule 56): Duration ("45 min"), Intensity (`IntensityRibs` `lg` + "Hard"), Spots (`CapacityIndicator` `large`: "4" with "bikes left"). Value on top, a small-capitals label under it ("DURATION", "INTENSITY", "SPOTS", `eyebrow` style, `text-muted`). Under the stats row, two tappable fact rows with icons: Date and time ("Wed, Oct 28 · 6:00–6:45 a.m.") and Club and room (chevron: opens the club page). Icons come from Lucide: `calendar-days`, `map-pin`. If `rating` exists, `RatingLine` sits directly under the title (mobbin-standard-pass §2 rule 41).
6. Two secondary buttons: "Add to calendar" and "Invite a friend" (IOS §5 r8). The second is hidden if the plan has no guest passes left; then show "Guest passes: 0 left this month". "Invite a friend" opens a small sheet: a link field, a "Copy link" button, and the line "Guest passes left this month: 1" (mobbin-standard-pass §2 rule 36; the three numbered steps of the referral pages are cut to one sentence, because a guest pass is not a referral program).
7. About: description (`m`, Inter 400, left aligned, 60 words maximum), "Good for first-timers" line when true, "What to bring" list from `equipment`.
8. Rules block, placed next to the action (IOS §6 #5):
   - Cancellation: "Cancel free until 4:00 a.m. (2 hours before). After that, it counts as a late cancel."
   - Waitlist: "If this class is full, the waitlist moves you up automatically until 5:00 a.m. (1 hour before). You get a push and 30 minutes to confirm."
   - Strike status, only if `strikes.count` ≥ 1: "You have 1 late cancel in the last 30 days. 3 in 30 days pauses booking for 3 days."
   The times are computed from `bookingWindow`.
9. Action bar, sticky at the bottom: left side shows what it costs ("Included with Ridge") and spots (`CapacityIndicator` `text`); right side shows `BookingStateButton` (IOS §5 r5, WEB §4 r11). After booking, the left side reads "Booked" with a check icon, and the right side shows a grey outline "Cancel" button next to a "Manage" menu (mobbin-standard-pass §2 rule 40). The status "Booked" is text, not colour.

**Wireframe: `ClassDetailPanel`, iOS (390 pt).**

```
+--------------------------------------+
| <            share  heart           |
| +----------------------------------+ |
| |        HERO PHOTO  (~40% screen) | |
| |                          1/4     | |
| +----------------------------------+ |
| (Ages 13 to 17)                      |
| Climb Cycle                          |
| (O) with Dana Torres              >  |
| [bike CYCLE]                         |
| Wed, Oct 28 - 6:00-6:45 a.m.         |
| Gilbert - Val Vista, Cycle studio >  |
| Intensity [####.] Hard               |
| [Add to calendar] [Invite a friend]  |
| About ...                            |
| What to bring ...                    |
| Cancel free until 4:00 a.m. ...      |
| Waitlist moves you up until 5:00 ... |
+--------------------------------------+
| Included with Ridge  |  [  Book  ]   |  sticky bar
| 4 bikes left         |               |
+--------------------------------------+
```

**Variants.** `panel` (web wide, right column of a two-pane layout, 480 px wide), `page` (web narrow and iOS push), `sheet` (iPad `inspector` and web `Drawer`). Marketing uses a read-only `page` variant: the action bar shows "Try this class" and "Book a tour".

**States.**
- Default; booked (hero gets a `success` banner "You're booked" with the date; the action bar shows "Booked" and a "Manage" menu); waitlisted ("You're #3 on the waitlist"); promoted-hold (banner "A spot opened. Confirm in 28:41."); full; cancelled by the club; ended.
- Loading: a "Checking availability" state with the words, a spinner and skeleton blocks (WEB §4 r7, WEB §5 #1). On iOS use a small sheet or inline `ProgressView`, not a full-screen loader (IOS §6 #4).
- Confirmed view (one pattern on web and iOS, mobbin-standard-pass §2 rule 62 and rule 45): one green check, the headline "You're booked", a green "Confirmed" pill (check icon plus word) above the date, and a summary card (date, time, club, room, instructor). Then one full-width filled button "Add to calendar" with the text link "Share" under it (mobbin-standard-pass §2 rule 46), and four action rows: Add to calendar, Get directions, Call the club, Club details (mobbin-standard-pass §2 rule 44). A single "Done" closes the view. When guests are included, add "Share guest link" (WEB §4 r16–r17). The check is `success` colour and is paired with the headline text.
- Error: "We could not load this class. Try again." with a retry button.
- Cancel flow: a dialog with the consequence first. Free cancel: "Cancel your spot in Climb Cycle? You can rebook until it fills." Late cancel: "This is a late cancel. It counts as a strike (2 of 3 in 30 days). 3 strikes pause booking for 3 days." Stacked buttons, in this order (mobbin-standard-pass §2 rules 27–28): filled "Keep my spot" (`primary`), outline "Reschedule instead" (only when other sessions of the same class exist this week), and a `danger` text button "Cancel booking" at the bottom. This changes the earlier side-by-side layout (destructive on the right, GAP r19): the keep action is now the filled one and the destructive action is quiet. For a late cancel, list what happens with a red X icon on each line, each line also in words: "Counts as a strike (2 of 3 in 30 days)", "Your spot goes to the next person on the waitlist" (mobbin-standard-pass §2 rule 28; the X is paired with text). For a free cancel, show an optional radio list "Why are you cancelling?" (Schedule changed, Feeling unwell, Booked by mistake, Other reason with a text box; mobbin-standard-pass §2 rule 26). On iOS the dialog is a bottom sheet: a bold question ("Cancel Climb Cycle?"), the class name in small capitals, a full-width primary button "Keep my spot", and the text button "Cancel booking" (mobbin-standard-pass §2 rule 43; this sheet replaces `confirmationDialog` for this one case, because the consequence list needs room). Reasons are optional and never block the cancel.

**Data contract.**

```ts
interface ClassDetailPanelProps {
  session: ClassSession;
  classType: ClassType;
  instructor: Instructor;
  club: Club;
  booking?: Booking;
  member: Pick<Member,'planId'|'strikes'|'guestPassesLeft'|'status'>;
  variant: 'panel'|'page'|'sheet';
  surface: 'marketing'|'app'|'ios';
  state: 'ready'|'loading'|'error'|'confirmed';
}
```

**Content rules.** Facts in a fixed order: when, where, who, how hard, how full. Rules in plain sentences, with times in the member's local format. Do not hide the cancel policy in a menu. Description starts with what you do, not with hype. Sample description: "Seated climbs and steady sprints on a 45-minute ride. Bring a towel. Cycling shoes are available to rent." (sample copy).

**Accessibility.** Heading levels: title is `h1` (page) or `h2` (panel). The dialog traps focus and returns it to the trigger on close. The sticky bar must not cover focused elements: add bottom scroll padding equal to the bar height. On iOS the bar is `.safeAreaInset(edge: .bottom)`. The hero pager has accessible "Photo 1 of 4" labels. At AX sizes the facts row becomes a list of label–value pairs, and the sticky bar stacks (cost above button) and scrolls with the page if it exceeds 30 % of the screen.

**Web build.** Graphical `Drawer` (narrow) or an inline column (wide). `Dialog` and `AlertDialog` for the cancel flow. `Menu` for "Manage". `Button` for actions. `Toast` for "Added to calendar". `Separator` between sections. shadcn `carousel` for the pager, `aspect-ratio`, `skeleton`, `spinner`. Custom: key-facts row, rules block with computed times, confirmed view.

**iOS build.** A pushed `ScrollView` inside `NavigationStack`. Hero with `TabView(.page)` or `ScrollView(.horizontal)` and a "1/4" overlay. `.safeAreaInset(edge: .bottom)` bar with `.buttonStyle(.glassProminent)` for the one primary action (floating functional layer; APL §3). Cancel: `confirmationDialog(item:)` (iOS 27) with a destructive-role button; the consequence is the message text. "Add to calendar": `EKEventEditViewController` (APL §5). Venue row is a `NavigationLink`. Dynamic Type: standard text styles. Stays native: navigation bar, share sheet, confirmation dialog.

**Research basis.** mobbin-standard-pass §2 rules 26–28, 39–46, 56, 62 (cancel dialog, hero band, booking bar states, confirmed view, stats row). IOS §5 r4–r9 (hero at about 40 %, sticky bar with cost left, instructor under title, status chip, two secondary buttons, cancel confirmation as a sheet). IOS §6 #5–#6 (put the policy near the action; the primary action is not only at the top). WEB §4 r7, r11, r16, r17 and WEB §3.5 (loading text, sticky bar, confirmation, share link). WEB §5 #5, #10 (sticky action, left-aligned text). GAP r18–r21 (consequence first; destructive on the right; reschedule first). GAP r1–r4 (waitlist screen, notice, consent). FND §3 (booking rules).

### 7.3 `InstructorChip`

**Purpose and question.** "Who teaches this?" It shows a face and a name.

**Anatomy.** Avatar (circle) + text. The avatar is a square crop of the 4:5 portrait around `focal`.

| Size | Avatar | Text | Use |
|---|---|---|---|
| `sm` | 24 | name, `xs` | Dense widgets, week-grid blocks |
| `md` | 40 | name `s` 600; optional second line `xs` muted | Cards (MKT §3 r14) |
| `lg` | 56 | name `m` 600; credential line `s` muted | Detail panel |
| `avatar-only` | 40 | none; the name is in the accessible name | Schedule rows |

**Variants.** `inline` (avatar + name), `stacked` (name + credential line), `stack` (up to three overlapping avatars, +N count, for co-teachers and subs), `sub` (adds the label "Sub" in `warning` text with the triangle icon).

**Variant `choice`.** For picking a trainer or coach (personal-training intro, `ReservationSlotGrid` `list`): round avatars in a row, 56 px, name under each; the selected avatar has a 3 px `focus`-independent ring in `secondary` and a check badge (mobbin-standard-pass §2 rule 37). It is a `radiogroup`. The ring is paired with the check icon and `aria-checked`.

**States.** Default. Interactive (when it links to the coach profile): hover underlines the name; focus ring around the whole chip; 44 px hit area. Fallback: initials in Archivo 600 on `surface-muted` when the photo fails. Loading: circle + one bar.

**Data contract.**

```ts
interface InstructorChipProps {
  instructor: Pick<Instructor,'id'|'name'|'shortName'|'portrait'|'credentialLine'>;
  size: 'sm'|'md'|'lg'|'avatar-only';
  variant?: 'inline'|'stacked'|'stack'|'sub'|'choice';
  extra?: Pick<Instructor,'id'|'name'|'portrait'>[];  // for 'stack'
  href?: string;
  nameFormat?: 'short'|'full';
}
```

**Content rules.** Rows use the short name ("Dana T."). Detail uses the full name. A sub shows "Sub: Dana T." Do not show a rating.

**Accessibility.** The avatar alt text is empty when the name is visible. For `avatar-only`, the accessible name is "Instructor Dana T." A link chip is named "Dana Torres, instructor. View profile." Stack: "Dana T. and 2 more".

**Web build.** Graphical `Avatar` (image, fallback). Text: plain. Link: a normal anchor. `stack`: custom overlap with a 2 px `surface` ring between avatars.

**iOS build.** `AsyncImage` clipped to `Circle`, with a placeholder `Circle().fill(Color("SurfaceMuted"))` and initials. `.accessibilityElement(children: .combine)`. Avatar size uses `@ScaledMetric(relativeTo: .body)`, capped at 1.5×.

**Research basis.** MKT §3 r14 (40 px round avatar with name), r26 (instructor profile data). WEB §4 r1 (instructor name under the title). WEB §3.4 notes that instructor avatars on class cards were not observed. This is partly a new pattern, drawn from Open (MKT §2 C1, an avatar at the top right of the card).

### 7.4 `CoachCard`

**Purpose and question.** "Who are the coaches, and who fits me?" It profiles an instructor or personal trainer.

**Anatomy (variant `card`).**
1. Portrait, 4:5, radius M on the top corners (MKT §3 r26).
2. Name, Archivo 600 `l`.
3. Credential line, one line, `eyebrow` style (uppercase, +0.24em), `text-muted`. Example: "CYCLE COACH · RYT-200" (sample).
4. "Favourite class: Climb Cycle" in `s` (MKT §3 r26).
5. Bio, `s`, 25 words or fewer.
6. Clubs where they teach: small `AmenityChip` `info` pills with the club short names (MKT §3 r27).
7. Category badges for specialties (up to three).
8. Actions: for a personal trainer, filled "Book an intro session" and a text link "See their classes"; for a class instructor, only the link.
9. PT packs line: "Packs of 4, 8 or 12 sessions." (FND §4), only for personal trainers.

**Variants.** `card` (grid of four on wide screens, MKT §2 T5), `feature` (two columns: photo left, details right, with a name list beside it on desktop; MKT §2 T6), `row` (iOS list: 56 pt avatar, name, credential, chevron), `compact` (inside `ClassDetailPanel` bottom section), `headshot` (a row of four or five square or round headshots, 160 px, with the bold name and a role line under each; used for team strips on marketing pages and the home page; mobbin-standard-pass §2 rule 16).

**States.** Default, hover (edge `border-hover`), focus, pressed, selected (in the name list: dark `secondary` fill with Sand text, like T6), loading (4:5 block + bars), error (photo placeholder), empty (no coaches at this club: `EmptyState` compact "Coach profiles for this club are coming soon.").

**Data contract.**

```ts
interface CoachCardProps {
  instructor: Instructor;
  clubs: Pick<Club,'id'|'shortName'>[];
  variant: 'card'|'feature'|'row'|'compact'|'headshot';
  selected?: boolean;
  onBookIntro?: () => void;
  href?: string;
}
```

**Content rules.** Bio is 25 words or fewer. Write it in first person plural or third person, concrete and warm. Sample: "Dana coaches steady climbs and helps first-timers clip in without fear." (sample copy, 12 words). No "world-class". No before-and-after claims.

**Accessibility.** The card is one link to the profile. The portrait alt text is empty when the name is visible next to it. Credential line is plain text. At AX sizes the `feature` layout stacks and the portrait drops to 4:3.

**Web build.** shadcn `card`, `aspect-ratio`, `badge`; Graphical `Avatar` (row variant), `Button`, `Tabs` or `ToggleGroup` for the name list in `feature` (selected profile). shadcn `carousel` for a swipeable team strip on narrow screens.

**iOS build.** `List` row with `Label`-style content; detail is a pushed `ScrollView`. Portrait `AsyncImage` with `.aspectRatio(4/5, contentMode: .fill)`. Buttons: `.borderedProminent` with the brand tint. Archivo only for the name in the detail header (`relativeTo: .title2`).

**Research basis.** MKT §3 r26–r27 (4:5 portrait, credential line, favourite class, 25-word bio, clubs where they teach). MKT §2 T2, T5, T6 (profile card, four-card row, name list with selected profile). MKT §2 T4 (trial action next to proof). FND §4 (PT packs, coach profiles).

### 7.5 `ScheduleDayStrip`

**Purpose and question.** "Which day am I looking at, and how many classes are on it?"

**Anatomy.** A horizontal row of day chips and a trailing calendar button.

| Part | Spec |
|---|---|
| Chip | 56 wide × 64 high, radius S 10. Weekday on top (`s` Inter 600, 14/20 minimum, MKT §4), date number under it (`data` Archivo 500 16/24). Optional class count under that (`xs`, `text-muted`) |
| Today | Weekday text is "Today". A 4 px dot sits under the number. |
| Selected | Fill `secondary` (Saguaro Night; Sand in dark mode), text `secondary-foreground`. 1 px outline in `focus` is not used; focus uses the standard ring. |
| Unselected | Fill `surface`, 1 px `border` edge. |
| Disabled (past, or beyond the booking window) | Fill `surface-muted`, text `text-muted`. Stays visible and is not hidden (IOS §5 r13). |
| Calendar button | 44 × 44 icon button (`calendar`) that opens a date picker. Days beyond the window are disabled in it. |

Number of chips: seven visible, with horizontal scroll to the member's booking window (today plus 7 days for Trailhead and Ridge, today plus 9 days for Summit). Marketing shows exactly seven chips (MKT §3 r16).

**Wireframe.**

```
+------------------------------------------------------------------+
| Today   Thu    Fri    Sat    Sun    Mon    Tue    [cal]          |
| [ 27 ]   28     29     30     31      1      2                   |
| *        12     14      9      7     11     13                    |
+------------------------------------------------------------------+
  [ ] = selected (filled Saguaro Night)    * = today dot
  Under each date: class count for the chosen club(s)
```

**States.** Default, hover (`surface-muted`), focus ring, pressed, selected, disabled, loading (seven skeleton chips), empty day. For an empty day, show the muted dot and the count "0". Show one empty state in the list below, not "Unavailable" on every chip (MKT §4).

**Data contract.**

```ts
interface ScheduleDayStripProps {
  startDate: ISODate;
  days: { date: ISODate; classCount?: number; disabled?: boolean; reason?: string }[];
  selected: ISODate;
  onSelect: (d: ISODate) => void;
  windowDays: 7 | 9;
  surface: 'marketing'|'app'|'ios';
}
```

**Content rules.** "Today", then three-letter weekdays. Count format: "12" with the word "classes" in the accessible name. A day beyond the window says in its tooltip: "You can book 7 days ahead. Summit members can book 9."

**Accessibility.** `role="tablist"` with `role="tab"` chips, and the schedule list is the `tabpanel`. Left and Right arrows move and select; Home and End jump. Accessible name: "Wednesday, October 28, 12 classes" and "Today" for the first. Selected uses `aria-selected`. Dynamic Type: weekday labels may wrap; at AX sizes switch to a `Menu` picker listing the days.

**Web build.** Graphical `Tabs` (trigger, list, panel) with custom trigger styling, inside Graphical `ScrollArea` for overflow. Date picker: shadcn `calendar` inside Graphical `Popover` (shadcn `date-picker`). Custom: chip layout, count line, window logic.

**iOS build.** A horizontal `ScrollView` + `ScrollViewReader` with `Button` chips; `scrollTargetBehavior(.viewAligned)`. Each chip: `VStack` with `Text(weekday)` and `Text(day).monospacedDigit()`. Calendar button opens a `.sheet` at `.medium` with `DatePicker(.graphical)` and `in:` range limiting the window. Selected: `.accessibilityAddTraits(.isSelected)`. Native: DatePicker, ScrollView.

**Research basis.** IOS §5 r1 (today first, seven days), r11 (date strip with calendar button for court dates), r13 (greyed, not hidden). WEB §4 r4 (date chips Today, Tomorrow, weekdays, Choose date). MKT §3 r16 (seven-day strip, today selected), MKT §2 S-1, MKT §4 (tiny day labels, repeated "Unavailable"). GAP r8 (date strip, gray unavailable). WEB §5 #3 (past dates not active).

### 7.6 `ScheduleWeekGrid`

**Purpose and question.** "What does my whole week look like at this club?" Web only, at 1024 px and wider. It shows one club's sessions on a time axis.

**Anatomy.**
1. Toolbar: week range with previous and next buttons ("Oct 26 – Nov 1"), `ClubSwitcher` (single), `ScheduleFilters` button, view `ToggleGroup` (List | Week), "Today" button. Primary action is not in the toolbar (the cards hold it).
2. Time zone chip above the day headers: "Arizona time" (GAP r26).
3. Day headers: weekday + date number. Today's number sits in a filled `secondary` circle. Sticky at the top.
4. Time rail at the left: hour labels (`xs`, tabular), sticky at the left. The range matches the club hours: 4:00 a.m. to 10:00 p.m. on weekdays.
5. Day columns: 7 columns of equal width (minimum 132 px). Hour lines in `border`.
6. Session blocks: positioned by start time; height = duration × 72 px per hour (45 min = 54 px; 60 min = 72 px; 30 min = 36 px). Minimum block height is 36 px, which exceeds the WCAG 2.5.8 minimum target of 24 × 24 px.
7. "Now" line in today's column: 2 px `primary`, with a dot.

**Session block (inside the grid).** 4 px category stripe; start time (`data`, 12/16 bold); class name (Inter 600 `s`, up to two lines); `InstructorChip` `sm` and spots ("4 left") when the block is 54 px or taller; at 36 px only name and time. Fill `surface`, 1 px `border`, radius S 10. Full: text `text-muted` and a "Full" label. Booked: `success` check and `primary-subtle` fill. Overlaps (two rooms at the same time): split the column into lanes, up to three. For four or more, show a "+2 more" button that opens a `Popover` list.

**Wireframe: `ScheduleWeekGrid` (3 of 7 columns shown).**

```
[<] Oct 26 - Nov 1 [>]  [Gilbert - Val Vista v] [Filters 2] [List|WEEK] [Today]
                      Arizona time
        |  Mon 26      |  Tue (27)    |  Wed 28      |
 -------+--------------+--------------+--------------+----
 5 a.m. |              |              |              |
 -------+--------------+--------------+--------------+----
 6 a.m. |#6:00 Climb   |#6:00 Rib Rack|#6:00 Climb   |
        |#Cycle  4 left|#Strength     |#Cycle  Full  |
 -------+#(O)----------+#(O)----------+#(O)----------+----
 7 a.m. |#7:00 Desert  |              |#7:15 Mobility|
        |#Flow Yoga    |    ---- now -|#30           |
 -------+--------------+--------------+--------------+----
 # = category stripe   (O) = instructor avatar   ---- now = copper line
```

**Modes.** `timeline` (default for one club). `stack` (default when several clubs are selected, or below 1024 px): each day is a column of `ClassCard` `schedule-row`-style mini cards in time order, with time headers instead of a time axis. Below 1024 px the page uses the day strip and list instead of the grid.

**States.** Default, hover (block edge `border-hover`, a `PreviewCard` shows the mini detail), focus, selected (block opens the `ClassDetailPanel`), loading (skeleton columns with six blocks each), empty week (one `EmptyState` over the grid: "No classes this week at this club."), empty day (muted column background, a single "No classes" label at the top of the column, not in every cell).

**Data contract.**

```ts
interface ScheduleWeekGridProps {
  weekStart: ISODate;
  sessions: ClassSession[];
  instructors: Record<string, Instructor>;
  bookings: Record<string, Booking>;
  club: Club;
  pxPerHour?: 56 | 72;                // 'compact' | default
  mode: 'timeline'|'stack';
  selectedId?: string;
  onSelect: (sessionId: string) => void;
  onWeekChange: (weekStart: ISODate) => void;
}
```

**Content rules.** Weekday names in full on wide columns, three letters when narrow. One time zone label. Show "Full" and "4 left"; do not show counts above 5 in blocks (keep blocks calm; the number appears in the panel). Block text never hides the class name.

**Accessibility.** Do not use `role="grid"` (hard to use). Each day is a `section` with a heading ("Wednesday, October 28") and an ordered list of session links in time order, positioned with CSS grid. Reading order and Tab order are chronological, day by day. Each block link has the same full name as a `schedule-row`. A "Skip to next day" link sits at the start of each day. The List view toggle is one control away and has the same data. "Now" line is `aria-hidden`; the text "Now" appears in the day heading for today. Keyboard: Tab through blocks; Enter opens the panel; Escape closes it.

**Web build.** Custom CSS grid. Graphical `ScrollArea` (the grid scrolls inside a fixed-height region with a sticky header and rail), `ToggleGroup` (view), `Button` (toolbar), `Popover` ("+2 more"), `PreviewCard` (hover mini detail), `Tooltip` (truncated text), `Toggle`. shadcn `calendar` + `popover` for the date jump. shadcn `skeleton` for loading.

**iOS build.** Not part of the iPhone app (it uses `ScheduleDayStrip` + list). Optional on iPad in regular width: a custom `Layout` or a `Grid` inside a `ScrollView([.horizontal, .vertical])`, with `ClassCard` `compact` blocks. Keep the List as the default on iPad compact width.

**Research basis.** GAP r25–r27 (hour rows left, day columns across; time zone chip above the day headers; primary button top right is not used here). GAP search 9 sources: Sweatpals, Klaviyo, Square, Calendly, Buffer. WEB §4 r5 (view toggle), WEB §3.3, WEB §4 r35 (stripe). MKT §2 S-3 (weekly grid with time, name, instructor, duration, spots left; copy is placeholder, structure only), MKT §4 (placeholder copy, repeated "Unavailable"). LIB §4 (schedule week grid is a gap: no primitive).

### 7.7 `ScheduleFilters`

**Purpose and question.** "Show me only what fits me." It narrows the schedule.

**Filters (in order).**

| Group | Control | Notes |
|---|---|---|
| Club | `ClubSwitcher` `multi` | Hidden on a single-club page. |
| Category | Checkboxes with the category icon (8) | App sidebar shows all eight. Marketing tab row shows "All" plus five categories plus a "More" menu, six items in all (MKT §3 r17). |
| Time of day | `ToggleGroup`: Early (before 7 a.m.), Morning, Midday, Evening | Multiple selection. |
| Intensity | Five-rib selector: tap a rib to set a maximum | Uses `RibMeter` as an input; labelled "Up to Hard". |
| Instructor | `Combobox` | Search by name. |
| Options | Switches: "Good for first-timers", "Spots open only", "My bookings" | |

**Anatomy: web wide.** A left sidebar, 280 wide. Groups are collapsible sections with labels (WEB §4 r6, WEB §5 #6). Result count line at the top of the list: "23 classes" in an `aria-live="polite"` region. Active filters appear as removable chips above the list with a "Clear all" link.

**Anatomy: web narrow.** A "Filters" button with the active count ("Filters · 2"). It opens a `Drawer` with the same groups. Footer has "Clear" (left) and "Show 23 classes" (right, primary).

**Anatomy: marketing.** A single tab row (`Tabs`) of category tabs plus a club `Select`. No sidebar.

**Anatomy: iOS.** A horizontal row of filter chips under the day strip (Category, Time, Intensity, Club). Tapping a chip opens a sheet (`.medium`). A "Filters" button at the end opens a full `Form` sheet. Sheet toolbar: "Reset" (leading), "Show 23 classes" (primary, trailing).

**States.** Default; active (count badge); loading (skeleton rows); error ("We could not update the list. Try again."); empty results use `EmptyState` `no-results`; Preserve filters when the day changes; reset filters when the club changes only if the filter does not apply.

**Data contract.**

```ts
interface ScheduleFilterState {
  clubIds: ClubId[];
  categories: CategoryId[];
  timeOfDay: ('early'|'morning'|'midday'|'evening')[];
  maxIntensity?: Level;
  instructorId?: string;
  firstTimersOnly: boolean;
  openSpotsOnly: boolean;
  mineOnly: boolean;
}
interface ScheduleFiltersProps {
  value: ScheduleFilterState;
  onChange: (next: ScheduleFilterState) => void;
  resultCount: number;
  layout: 'sidebar'|'drawer'|'marketing-tabs'|'ios-sheet';
  categoriesVisible?: CategoryId[];
}
```

**Content rules.** Count text: "23 classes", "1 class". Chip text: "Cycle", "Early", "Up to Hard". Clear label: "Clear all". Empty result copy lives in `EmptyState`.

**Accessibility.** Each group is a `fieldset` with a legend. Filter changes update the count in a polite live region. Focus does not move when a filter changes. In the drawer, focus is trapped and returns to the button on close. Each active chip has a remove button named "Remove filter: Cycle". iOS: toggles have clear labels; the reset action is reachable by VoiceOver.

**Web build.** Graphical `Accordion` (groups), `CheckboxGroup` + `Checkbox`, `ToggleGroup`, `Switch`, `Combobox`, `Slider` or the rib selector for intensity (custom, built on `RadioGroup` semantics), `Drawer`, `Button`, `Tabs` (marketing), `Select` (club in marketing), `Fieldset` and `Field`. Custom: rib selector, active-chip row.

**iOS build.** `ScrollView(.horizontal)` of `Toggle`-style chips, `.sheet` with `Form`, `Section`, `Toggle`, `Picker`, `.presentationDetents([.medium, .large])`. `Menu` for single-choice groups. Stays native: Form, Picker, Toggle.

**Research basis.** WEB §4 r6 (left sidebar with grouped checkboxes; single Filters button when narrow), WEB §5 #6 (group filters in collapsible sections). MKT §3 r17 (six or fewer category tabs). IOS §5 r19 (chips above the list). WEB §3.3 (date chips and filters). WEB "Coverage gaps": "empty state for no class results after a filter: not observed", so the no-results state is designed from first principles.

### 7.8 `ClassPhotoTile`

**Purpose and question.** "What kinds of classes does the club offer?" It shows a class type as a photo tile and leads to its schedule.

**Anatomy.** A photo tile with a caption band.
1. Photo: 4:5 (marketing grids of four) or 1:1 (iOS two-up). Radius M.
2. `CategoryBadge` `solid`, top-left, 12 px inset.
3. Caption band at the bottom: solid Saguaro Night at 80 %, padding 12. Class name in Archivo 600 `m` 16/24, Sand. Under it, `IntensityRibs` `range` (neutral tone, Sand ribs) and one line: "Next: today 6:00 a.m. · Val Vista" in `xs` Sand.
   Sand on the band is at least 6.35:1 (part 1, section 2.6).
4. The whole tile is a link to the class-type page or a filtered schedule.

**Variants.** `grid` (4:5, four across on wide screens), `square` (1:1, iOS two-up), `carousel` (4:5, 200 wide, in a scroller), `category` (no class name; the category name and icon in `l`, used for "Browse by category"; band shows "12 classes this week"). Marketing shows a row of six `category` tiles with a one-word label under the photo (Strength, Cycle, Conditioning, Mind & Body, Aqua, Court; the other two sit behind a "More" tile) (mobbin-standard-pass §2 rule 9). A youth tile adds the age chip ("AGES 3–17").

**States.** Default; hover (edge `border-hover`, caption band does not move); focus; pressed; loading (photo block + band); error (placeholder photo with the category icon at 48 px on `surface-muted`); empty `nextSession` ("No class this week" replaces the "Next:" line).

**Data contract.**

```ts
interface ClassPhotoTileProps {
  classType: ClassType;
  nextSession?: Pick<ClassSession,'startsAt'|'clubId'>;
  club?: Pick<Club,'shortName'>;
  variant: 'grid'|'square'|'carousel'|'category';
  href: string;
}
```

**Content rules.** Name the class. Say when the next one is. No "NEW!" stickers. Photos follow BRD §7: real members, effort not punishment.

**Accessibility.** One link named "Climb Cycle, Cycle, Light to moderate. Next: today 6:00 a.m. at Val Vista." The photo alt text is empty (name is in the link). Contrast on the band as above.

**Web build.** shadcn `card`, `aspect-ratio`, `badge`, `carousel` (for the scroller). Band: plain `div`. Link: stretched.

**iOS build.** `NavigationLink` with a `ZStack(alignment: .bottom)`: `AsyncImage` + a `Rectangle` filled with `Color("NightSurface").opacity(0.8)` for the band. Use `LazyVGrid` with two flexible columns. Text uses SF Pro at `.headline`. Archivo only for the tile title if it is larger than 22 pt.

**Research basis.** mobbin-standard-pass §2 rules 9, 17 (six photo tiles, age chip). WEB §3.4 and WEB §1 (ClassPass category tiles with photo; "Top classes" carousel). MKT §2 A1, L5 (photo cards with a name below or over the photo). BRD §7 (photography). The caption band replaces text over a gradient (BRD §9: no gradients).

## 8. Booking components

### 8.1 `BookingStateButton`

**Purpose and question.** "What is my status for this class, and what can I do next?" One button covers every booking state. It is the only booking action on a card or row.

**States and labels.**

| State id | Label | Look | Action | Aria / VoiceOver |
|---|---|---|---|---|
| `book` | "Book" | Filled `primary` (white label on copper 4.95:1; dark mode `#121A16` on Dawn Copper 6.22:1) | Book the spot | "Book Climb Cycle, 6:00 a.m." |
| `booking` | "Booking…" | Same fill at 100 %, spinner + word, not clickable | None | `aria-busy`, "Booking Climb Cycle" |
| `booked` | "Booked" with check icon | Outline `border-strong`, `success` icon and `text` label. In a sticky bar it is a status text "Booked" beside a grey outline "Cancel" button | Opens "Manage" menu: Add to calendar, Cancel booking | "Booked. Climb Cycle, 6:00 a.m. Manage booking" |
| `waitlist` | "Join waitlist" | Outline `primary` (1 px copper edge is decorative; label in `link` colour, 5.61:1 on Sand) | Opens a waitlist dialog (see below) | "Join waitlist for Climb Cycle, 3 people ahead" |
| `waitlisted` | "On waitlist #3" | Outline `border-strong`, `text` label, tabular number | Opens menu: Leave waitlist | "On waitlist, position 3. Manage" |
| `hold` | "Confirm spot · 28:41" | Filled `primary`, tabular timer | Confirms the spot | "A spot opened. Confirm within 28 minutes 41 seconds." |
| `full` | "Full" | Disabled: `text-muted` on `surface-muted` (4.77:1) | None; a reason line shows "Waitlist closed 1 hour before start" | "Full. Waitlist closed" |
| `late-cancel` | "Booked" plus `LateCancelNotice` | Same as `booked`, with a `warning` triangle icon on the button and the menu item "Cancel (late)" in `warning` text | Cancel opens the late-cancel dialog | "Booked. Cancelling now counts as a late cancel" |
| `paused` | "Booking paused" | Disabled; reason line "Back on Oct 30" | None | "Booking paused until October 30" |
| `restricted` | "Ridge only" | Outline; reason line | Opens plan page | "This club needs a Ridge plan. See plans" |
| `started` | "Started" | Disabled | None | |
| `error` | "Try again" | Outline `danger` with triangle icon, message under the button | Retries | |

Extra states are needed beyond the six named ones. `hold` is the 30-minute promotion window (FND §3). `late-cancel` is the warning that applies after the cutoff (2 hours before start). `paused` is the 3-day pause after 3 strikes in 30 days. `restricted` covers Trailhead members at a club that is not their home club.

**`LateCancelNotice`.** A text block under or beside the button. It appears from 2 hours before the start and in the cancel dialog: "Cancel free until 4:00 a.m. Cancelling later counts as a late cancel (strike 2 of 3 in 30 days)." It uses the `warning` text role with the triangle icon. Before the cutoff, a quieter version shows in the detail panel only: "Cancel free until 4:00 a.m."

**Waitlist dialog.** Title "Join the waitlist for Climb Cycle". Body in short sentences: "You are 4th in line. If a spot opens, we book you automatically until 5:00 a.m. (1 hour before). You get a push and 30 minutes to confirm. Late cancels count as strikes." One checkbox: "I understand the late-cancel rule." (GAP r4). Primary "Join waitlist" (full width, sticky on iOS; GAP r3), disabled and grey until the checkbox is ticked (mobbin-standard-pass §2 rule 47; the Fresha waitlist keeps "Continue" grey until each choice is valid). Secondary text link: "Pick another class" (GAP r2 offers "Book now" if a spot opens while the dialog is open).

**Sizes.** All sizes are 44 high (`md`). Minimum width 96. `lg` (48 high, full width) in the sticky action bar and in `card`. A compact schedule-row on a narrow screen puts the button on its own line, right-aligned.

**Wireframe: the states in a row (web).**

```
[   Book   ]  [ Booking...  ]  [ v Booked ]  [ Join waitlist ]  [ On waitlist #3 ]
   copper        copper+spin     outline        copper edge        outline

[ Confirm spot - 28:41 ]  [ Full ]  [ ! Booked ]  [ Booking paused ]  [ Ridge only ]
      copper               greyed     warning icon       greyed             outline
```

**State rules.** Optimistic update: the button switches to `booking`, then to `booked` when the server confirms. On failure, restore the previous state and show the error text below: "We could not book that class. Check your connection and try again." On a race: "That class just filled. Join the waitlist or pick the 7:00 a.m. class." (the brand error pattern: what happened and what to do; BRD §8). Success: a `Toast` "You're booked: Climb Cycle, 6:00 a.m." Loading and success announce in a polite live region. The button never changes position when its label changes: keep the width at the larger of the two labels.

**Light and dark.** Light: `primary` `#B5532C` + white. Dark: `primary` `#E0804F` + `#121A16`. Hover fill: `primary-hover` (`#9E4522`, label 6.31:1 / dark `#EE9A6E`). Disabled: `surface-muted` + `text-muted`. Focus: Monsoon Sky ring.

**Data contract.**

```ts
type BookingButtonState =
  | 'book'|'booking'|'booked'|'waitlist'|'waitlisted'|'hold'
  | 'full'|'late-cancel'|'paused'|'restricted'|'started'|'error';

interface BookingStateButtonProps {
  state: BookingButtonState;
  session: Pick<ClassSession,'id'|'name'|'startsAt'|'bookingWindow'|'spotsLeft'|'waitlistCount'>;
  booking?: Pick<Booking,'state'|'waitlistPosition'|'holdExpiresAt'>;
  strikes?: Member['strikes'];
  reason?: string;                    // shown for disabled states
  size?: 'md'|'lg';
  fullWidth?: boolean;
  onBook: () => Promise<void>;
  onCancel: () => Promise<void>;
  onJoinWaitlist: () => Promise<void>;
  onLeaveWaitlist: () => Promise<void>;
  onConfirmHold: () => Promise<void>;
}
```

The surface (web, iOS) computes `state` from `session`, `booking`, `member` and `now` in one shared function, `deriveBookingState`, so both clients agree.

**Content rules.** Verbs first, three words or fewer: "Book", "Join waitlist". Use "Booked", not "Reserved". Show position as "#3". Never guilt: "Cancelling now counts as a late cancel" states the fact. Do not hide the cutoff behind a menu (IOS §6 #5).

**Accessibility.** `aria-live="polite"` announces state changes: "You're booked", "You're on the waitlist, position 3", "A spot opened. Confirm within 30 minutes." Disabled buttons use `aria-disabled="true"`, stay in the tab order, and have the reason in text linked with `aria-describedby`. The `hold` timer is announced at the start and at 5 minutes and 1 minute left, not every second. Do not auto-dismiss any dialog. iOS: `.accessibilityAction(named:)` on rows; `confirmationDialog` for cancel; haptic `.sensoryFeedback(.success, trigger:)` on booked, `.warning` on late cancel; announce with `AccessibilityNotification.Announcement`. Dynamic Type: the button grows in height; the label wraps; never clamp.

**Web build.** Graphical `Button` (variants primary, outline, ghost, danger; label weight 600; 44 high; focus ring Color 5). `Menu` for "Manage" (booked, waitlisted). `AlertDialog` for cancel and late-cancel. `Dialog` for the waitlist consent, with Graphical `Checkbox` and `Field`. `Toast` for outcomes. shadcn `spinner` for the loading state. Custom: the state machine (`deriveBookingState`), the countdown, the width lock, `LateCancelNotice`.

**iOS build.** `Button` with `.buttonStyle(.borderedProminent)`, `.tint(Color("BrandAccent"))` for `book` and `hold` in rows and cards (content layer, no glass). In the sticky detail bar use `.buttonStyle(.glassProminent)` for the one primary action (APL §3). `.bordered` for `waitlist`, `booked` and `waitlisted`. `Menu` for manage actions. `confirmationDialog(item:)` for cancel (iOS 27). `ProgressView` inside the label for `booking`. Label text stays SF Pro (APL §4: button labels stay in the system font). App Intents: "Book next class" and "Cancel booking" call `requestConfirmation` before they cancel (APL §5, §1). Stays native: Button, Menu, confirmation dialog.

**Research basis.** mobbin-standard-pass §2 rules 40, 47, 62 (booked bar state with Cancel; waitlist button disabled until valid). mobbin-standard-pass §3 correction 5: the earlier files said the waitlist was not observed; a Fresha waitlist screen was found, and it matches GAP r1–r7. GAP r1–r7 (waitlist screen with notice, sticky full-width button, consent checkbox, effective date in plain text). GAP r18–r20 (consequence first; destructive on the right; reschedule first). WEB §4 r7, r16 (checking availability text; confirmation). The waitlist and cancel dialogs are now supported by mobbin-standard-pass §1 search 12 and W2 (corrections 3 and 5 in that file). WEB §4 r21 (current plan: disabled button). IOS §5 r9 (cancel as a sheet with the refund in plain words; here the consequence is the strike), IOS §6 #4 (no full-screen loader), #12 (confirm destructive action). APL §3 (glass only for the one primary action in the functional layer), APL §6 (destructive confirmation; no auto-dismiss). FND §3 (booking, cancel, strike, waitlist, hold rules).

### 8.2 `ReservationSlotGrid`

**Purpose and question.** "Which court, lane or block can I take, and when?" It lets a member pick a bookable resource and time for courts, lap lanes, and kids club blocks. It also serves personal-training intro sessions and recovery slots through its `list` layout.

**Rules from the foundation.** Courts: 60- or 90-minute slots, book 3 days ahead. Lap lanes: 45-minute slots. Kids club: 2-hour blocks, check-in by a parent. Pools close 30 minutes before the club. Kids club hours: Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m. (FND §2–§3).

**Layouts.**

| Layout | Used for | Structure |
|---|---|---|
| `matrix` | Courts, lap lanes | Rows are resources (Court 1…6, Lane 1…8). Columns are start times. Cells are slots. |
| `blocks` | Kids club | Up to four large cards per day: 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. Each shows spots left. |
| `list` | PT intro, recovery slots | A vertical list of time tiles in AM and PM groups, with a green availability dot (WEB §4 r13–r14, GAP r24). For personal training, a coach picker (`InstructorChip` `choice`) sits above the list, and each coach shows an availability range like "Available 8 a.m.–8 p.m." in `success` text with a check icon (mobbin-standard-pass §2 rules 23, 37). |

**Anatomy: web, two panes (WEB §4 r12).**
- Left pane: summary. Resource type switcher (`Tabs`: Courts, Lanes, Kids club); club (`ClubSwitcher` single); sport (`Select`: Pickleball, Tennis, Basketball; courts only); duration (`DurationChips`: a segmented row of chips "60 min | 90 min"; the selected chip is filled `secondary`; courts only; mobbin-standard-pass §2 rule 60); party size (`NumberField`; courts); child (`RadioGroup`; kids club); the summary card with the chosen slot and the line "Included with Ridge" (no price unless FND adds one).
- Right pane: `ScheduleDayStrip` (3-day window for courts; the class window for lanes and kids club: see decisions in section 11), the slot area, "Arizona time" caption below the date strip (GAP r23), and the sticky confirm bar.

**Slot cell (matrix).** Width 72 minimum, height 44. Content: start time in `data` Archivo 500 14/20 ("7:00"). The period (a.m. or p.m.) sits in the column group header, not in each cell.

| Slot status | Look | Non-colour signal | Interaction |
|---|---|---|---|
| `open` | `surface`, 1 px `border-strong` edge, `success` dot at the left | Dot + outline + time | Selectable |
| `selected` | `secondary` fill, `secondary-foreground` text, check icon | Fill + check | Press again to clear |
| `mine` | `primary-subtle` fill, "Yours" label | Label + check | Opens manage menu |
| `taken` | `surface-muted`, diagonal hatch, `text-muted` time, lock icon | Hatch + lock + word in accessible name | Disabled, stays visible (IOS §5 r13) |
| `closed` | Same as `taken` plus the label "Closed" in the row header (for example, a pool after hours) | Hatch + word | Disabled |
| `past` | `surface-muted`, `text-muted`, no icon | Muted | Disabled |
| `low` (kids blocks) | Normal fill; spots text in `warning` with triangle icon | Text | Selectable |

**Wireframe: courts, matrix, web right pane (Mesa – Dobson, pickleball).**

```
 Wed, Oct 28    (Thu 29)   Fri 30   [cal]          Arizona time
 Duration: [ 60 min | 90 min ]     Party: [-] 4 [+]
          AM                                   PM
          6:00  6:30  7:00  7:30  8:00 ...    4:00  4:30  5:00
 Court 1  [o 6:00][o 6:30][XX    ][XX    ][o 8:00]  ...  [o 4:00]
 Court 2  [o 6:00][XX    ][o 7:00][o 7:30][o 8:00]  ...  [XX    ]
 Court 3  [o 6:00][o 6:30][#7:00v][o 7:30][o 8:00]  ...  [o 4:00]
 Court 4  [XX    ][XX    ][o 7:00][o 7:30][o 8:00]  ...  [o 4:00]

  [o] = open (green dot)   [#..v] = selected   [XX] = taken (hatch + lock)

+------------------------------------------------------------------+
| Court 3 - Wed, Oct 28 - 7:00-8:00 a.m.     [ Reserve Court 3 ]    |  sticky bar
+------------------------------------------------------------------+
```

**Wireframe: kids club, `blocks`.**

```
 Kids Club - Gilbert - Val Vista            Child: (o) Mia  ( ) Leo
 +--------------------+  +--------------------+  +------------------+
 | 8:00-10:00 a.m.    |  | 10:00 a.m.-12:00   |  | 4:00-6:00 p.m.   |
 | o 6 spots left     |  | ! 2 spots left     |  | Full             |
 | [ Select ]         |  | [ Select ]         |  | [Join waitlist]  |
 +--------------------+  +--------------------+  +------------------+
 Check-in is by a parent. Show your pass at the kids club desk.
```

**Anatomy: iOS.** `ScheduleDayStrip` on top (3-day window for courts). A segmented duration control, "60 min | 90 min", as `Picker(.segmented)` or chips, selected chip filled (mobbin-standard-pass §2 rule 60; GAP source: Structured). Under it, a vertical `List` of slot rows, one row per start time: time on the left, the resources that are free as a count and names ("Courts 1, 3, 4 open"), chevron. Tapping a row opens a `.medium` sheet with a court `Picker` (`.inline`) and the summary, then the full-width primary "Reserve Court 3" button (IOS §5 r12; GAP r9, r11). A wrapping chip grid of four columns is allowed when there are many slots and each label is short ("7:00"); the selected chip is outlined and a total line sits under the grid: "Court 3 · 60 min · Included with Ridge" (mobbin-standard-pass §2 rule 59; IOS §5 r12, IOS §6 #11 limit this to short labels). Taken slots are greyed and disabled, not removed (IOS §5 r13). If the member picks a time that is not allowed (for example four days ahead for a court), show an inline `danger` message under the picker: "Courts can be booked 3 days ahead." (IOS §5 r14).

**States.** Default; loading ("Checking availability" with a spinner and skeleton cells; WEB §5 #1); empty day (a single `EmptyState` compact: "No courts open on this day. Try Thursday."); error (a banner above the grid: "We could not load courts. Try again."); selection error (inline `danger` text); pending confirm (button shows spinner + "Reserving…"); conflict ("That court was just taken. Courts 1 and 4 are open at 7:00 a.m." with the open cells highlighted).

**Data contract.**

```ts
interface ReservationSlotGridProps {
  kind: 'court'|'lap-lane'|'kids-club'|'pt'|'recovery-slot';
  layout: 'matrix'|'blocks'|'list';
  club: Pick<Club,'id'|'displayName'>;
  date: ISODate;
  dateWindowDays: number;             // 3 for courts
  resources: ReservationResource[];
  slots: Slot[];
  durationMin: Minutes;               // 60 | 90 | 45 | 120
  partySize?: number;
  childId?: string;
  selected?: { resourceId: string; startsAt: ISODateTime };
  onSelect: (s: { resourceId: string; startsAt: ISODateTime } | null) => void;
  onDateChange: (d: ISODate) => void;
  onDurationChange?: (m: Minutes) => void;
  onConfirm: () => Promise<void>;
  surface: 'app'|'ios';
}
```

**Content rules.** "Court 3 · Wed, Oct 28 · 7:00–8:00 a.m." The confirm button names the choice: "Reserve Court 3". The button is disabled until a slot is chosen (GAP r9). Booking limits appear as text near the date strip: "Courts: book up to 3 days ahead." Lap lane text: "Lane 5 · 45 min". Kids club copy: "Check-in is by a parent." Do not repeat "Unavailable" in every cell; hatch plus lock plus accessible name is enough (MKT §4).

**Accessibility.** The slot area is one `radiogroup` named "Choose a court and start time". Each cell is a `radio` with the name "Court 3, 7:00 to 8:00 a.m., available". Taken cells are `aria-disabled` radios with "taken". Arrow keys move through cells in reading order (row by row); Tab leaves the group. A selected slot announces "Court 3, 7:00 a.m., selected". The date strip follows `ScheduleDayStrip` rules. Hatch pattern is a background image; the accessible name carries the status. Minimum cell size 72 × 44 px. Contrast: open cell edge `border-strong` 3.48:1 on Sand and 3.92:1 on white; selected text 12.0:1; taken text on `surface-muted` 4.77:1. iOS: each row reads "7:00 a.m., 3 courts open". Dynamic Type at AX: the matrix becomes the vertical list. Reduce Motion: no cell animation.

**Web build.** Graphical `Tabs` (resource type), `RadioGroup` + `Radio` (slot selection and child choice), `ToggleGroup` (duration), `NumberField` (party size), `Select` (sport), `Popover` + shadcn `calendar` (date jump), `ScrollArea` (the matrix scrolls horizontally with a sticky first column), `Button`, `Toast`, shadcn `skeleton`, `spinner`, `empty`. Custom: matrix layout, hatch style, kids-block cards, the summary pane, conflict handling. The Calendly two-pane layout is the reference (WEB §4 r12).

**iOS build.** `List` with `Section("Morning")` and `Section("Afternoon")` (AM/PM headers; GAP source; WEB §4 r13), `Picker(.segmented)` for duration, `.sheet` with `.presentationDetents([.medium, .large])` for the court choice, and `.safeAreaInset(edge: .bottom)` for the confirm button (`.glassProminent`). Kids club blocks: `LazyVGrid` of cards. Native: List, Picker, sheet, DatePicker.

**Research basis.** WEB §4 r12–r15 (two-pane picker; AM and PM groups; green dot; time zone caption). WEB §3.7 (reservation grid) and WEB §2.4 (closest patterns; Playtomic was not returned, so the court matrix is new). IOS §5 r11–r14 (date strip with calendar; vertical list of slots; greyed not hidden; inline error). GAP r8–r11 (date strip; button disabled until a time is chosen; three-column grid when many; total line). GAP r22–r24 (dot on available dates; time zone under the calendar; vertical list of tiles with green dot). WEB §5 #1, #3, #7 (explicit loading text; past dates greyed; close one popover before opening another). MKT §4 (repeated "Unavailable"). IOS §6 #11 (no dense grid with long labels). mobbin-standard-pass §2 rules 22–23, 25, 59–60 (resources as rows, availability ranges, outlined slot cards with a green dot, four-column chips with a total line, segmented duration chips); mobbin-standard-pass §1 search W6 again found no court grid with courts as columns. Mobbin sources show Square's availability grid (admin view), which the matrix adapts for members. FND §3 (slot rules).

## 9. Plan and membership components

### 9.1 `PlanCard`

**Purpose and question.** "Which plan fits me, and what does it cost?" One card describes one plan.

**Shared data.**

```ts
interface PlanCardProps {
  plan: Plan;
  addOns?: PlanAddOns;
  variant: 'marketing'|'current'|'change'|'select';
  currentPlanId?: PlanId;
  highlighted?: boolean;              // Ridge
  effectiveDate?: ISODate;            // for 'change'
  priceDeltaUsd?: number;             // for 'change'
  onSelect?: (id: PlanId) => void;
  cta?: { label: string; href?: string };
}
```

**Anatomy (ordered).**
1. Badge row (top): "Most popular" on Ridge, "Current plan" on the member's plan. Badge style: shadcn `badge`, XS radius.
2. Plan name: Archivo 800 `xl` 36/40 ("Ridge"). On a night surface: Sand.
3. "Best for" line, one sentence, `s`, `text-muted` (MKT §3 r21). Sample copy:
   - Trailhead: "Best for: one home club, close to home."
   - Ridge: "Best for: all five clubs, courts and a guest pass."
   - Summit: "Best for: recovery, longer booking and more guest passes."
4. Price: `data-l` Archivo 700 36/40 ("$79") + "/mo" in `s`. Tabular figures. One line under it: "Month to month. Cancel with 30 days' notice." (FND §4).
5. **Club access line**: a `RibMeter` `md`, tone `brand`, with the number of lit ribs equal to the clubs included, and the words "1 home club" or "All 5 clubs". Here the five ribs mean the five clubs (BRD §6). This is the only place a rib meter stands for clubs.
6. Feature list: six items or fewer (MKT §3 r20), each with a check icon.
   - Trailhead: "One home club"; "Classes and pools at your club"; "Book classes 7 days ahead"; "App booking and check-in".
   - Ridge: "All 5 clubs"; "All classes"; "Courts, book 3 days ahead"; "Book classes 7 days ahead"; "1 guest pass per month".
   - Summit: "Everything in Ridge"; "Recovery suite"; "Book classes 9 days ahead"; "4 guest passes per month"; "Towel service"; "1 personal-training intro each quarter".
7. One button (MKT §3 r3). Marketing: "Join Trailhead", "Join Ridge", "Join Summit". Under it a text link: "Or tour a club first" (the free tour is the main marketing action; MKT §3 r22).
8. Fine print, `xs`: "$0 enrollment during Fall climb (otherwise $49). $49 annual facility fee in March." Shown once under the three cards, not on each card. A trial note sits under the button: "Try a 3-day pass first. No card needed." (FND §4, MKT §3 r23).

**No yearly toggle.** The foundation defines month-to-month billing and no yearly price. The Monthly/Yearly toggle from the research (MKT §3 r19, WEB §4 r22) is not used. If a yearly price is added to FND, add the toggle then.

**Wireframe: `PlanCard` Ridge, marketing, highlighted (320 px).**

```
+----------------------------------------+
|  (MOST POPULAR)                        |   night surface (Saguaro Night)
|                                        |
|  Ridge                                 |   xl, Archivo 800, Sand
|  Best for: all five clubs, courts      |
|  and a guest pass.                     |
|                                        |
|  $79 /mo                               |   data-l
|  Month to month. Cancel with 30 days'  |
|  notice.                               |
|                                        |
|  [#####]  All 5 clubs                  |   RibMeter brand, 5 of 5
|                                        |
|  v All 5 clubs                         |
|  v All classes                         |
|  v Courts, book 3 days ahead           |
|  v Book classes 7 days ahead           |
|  v 1 guest pass per month              |
|                                        |
|  [   Join Ridge   ]                    |   Dawn Copper button
|  Or tour a club first                  |
|  Try a 3-day pass. No card needed.     |
+----------------------------------------+
```

**Variants.**

| Variant | Use | Differences |
|---|---|---|
| `marketing` | Pricing page, home | Three cards. The middle one (Ridge) is raised: night surface, "Most popular" badge, 8 px taller, same width. Button "Join {plan}". |
| `current` | Member web app and iOS billing | Shows the "Current plan" badge. The button is disabled and reads "Your plan" (WEB §4 r21). Shows next renewal date and amount under the price (GAP r7). |
| `change` | Change plan | Adds a "Before you switch" list and a summary block (see below). Shows the delta ("+$25/mo"), the effective date in plain text ("Starts Nov 27, your next renewal."; GAP r6), and a summary line "Your new total: $79/mo" (WEB §4 r23). Buttons: outline "Keep Trailhead" (left) and filled "Switch to Ridge" (right) (GAP r5). |
| `select` | Add-family flow, onboarding | Radio card. Whole card is a `radio`. Selected: 2 px `primary` outline + check. |

**`change` variant: before-you-switch list and summary.** Below the plan card, a list titled "Before you switch" names what changes: lost features ("Courts: not included in Trailhead"), changed limits ("Book classes 7 days ahead, same as now"), and anything that ends ("Your 2 guest passes this month"). Each lost item has a red X icon and words (mobbin-standard-pass §2 rule 31). A summary block follows with lines Subtotal, Today's total, and a plain note on when the new charge starts: "Your new price starts Nov 27, at your next renewal." (mobbin-standard-pass §2 rule 32). Tax lines appear only if the billing system returns them. Buttons: outline "Stay on Ridge" and filled "Next". The member app uses a dialog or page for this flow; the marketing site still avoids plan modals (MKT §4).

**Frozen state (variant `current`).** When `Member.status` is `frozen`, the card shows a neutral pill with a pause icon and the words "Frozen until Dec 1" (mobbin-standard-pass §2 rule 49; the pill is neutral, not green, because a freeze is not a reward). The freeze flow itself (a plain headline "Let's hit pause.", a duration select, the renewal date and the pause window in one sentence above one filled button, and on iOS a bottom sheet with a bold question, a full-width "Pause" button and a "Not now" link) belongs to the member web app and iOS specs (mobbin-standard-pass §2 rules 29, 30, 48). Freeze costs $10/mo for 1 to 3 months with 30 days' notice (FND §4).

**Highlighted card colours.** Night surface (part 1, section 4.1): background `#1C3328`, text Sand `#F6F1E8` (12.0:1), muted text `#CFC8BB`, button Dawn Copper `#E0804F` with `#121A16` label (6.22:1). "Most popular" badge: Dawn Copper fill, `#121A16` text. Non-highlighted cards: `surface`, 1 px `border`.

**States.** Default; hover (edge to `border-hover` on light cards; on the night card the edge brightens to Sand at 40 %); focus ring (Monsoon Sky `#7FB0E8` on the night card, 4.7:1 or better); pressed; selected (`select` variant); disabled (`current`); loading (skeleton: name bar, price block, five line bars, button); error (price missing: "Prices did not load. Try again." with retry); empty n/a.

**Content rules.** Numerals for money: "$79/mo". Always with the unit. Features start with a noun or number, not a verb. Six or fewer. No "unlimited" unless true. Family add-on and day pass appear in `PlanComparisonTable` and a line under the cards: "Add family: +$39 per adult, +$19 per child (ages 3–17). Day pass: $20." (FND §4).

**Accessibility.** Each card is a `section` with the plan name as an `h3`. The badge text is inside the heading's description (`aria-describedby`). Price is read as "$79 per month". The rib line reads "Club access: all 5 clubs" (the ribs are `decorative` with that text beside them). The check icons are `aria-hidden`; the list is a real `ul`. The highlighted card is not announced as "recommended" by colour; the badge text says it. On narrow screens the cards stack in order Trailhead, Ridge, Summit, and Ridge keeps its badge (not reordered first, so reading order matches price order). iOS: a `List` section per plan, or vertical cards; the "Current plan" state is in the accessibility label.

**Web build.** shadcn `card` for the container; shadcn `badge`; Graphical `Button`; Graphical `RadioGroup` and `Radio` for the `select` variant; `RibMeter` (Graphical `Meter` semantics); Graphical `AlertDialog` for the confirm step in `change`; `Separator`. Custom: night-surface theming (local `data-theme="dark"` scope on the card), delta and date lines. Plan modal is avoided: use a page (MKT §4).

**iOS build.** A `VStack` card with `RoundedRectangle(cornerRadius: 14)`; highlighted card uses `Color("NightSurface")`. Price in Archivo (`data-l`, `relativeTo: .largeTitle`, 36 pt bold); everything else in SF Pro. Buttons: `.borderedProminent` with `.tint`. Change plan runs as a pushed screen with a summary `Section` and a confirmation `.sheet` at `.medium`. Wallet or Apple Pay is out of scope here. Native: List/Form for the billing summary, confirmationDialog.

**Research basis.** mobbin-standard-pass §2 rules 10, 31, 32, 49 (middle-card badge, before-you-switch list, payment summary, paused pill). I did not use mobbin-standard-pass §2 rules 11–12 (monthly or annual toggle, "billed annually") because FND §4 has no yearly price. MKT §3 r18–r21 (three tiers, middle "Most popular", six or fewer features, "Best for"). MKT §3 r22–r23 (tour main action; tour request without card). MKT §2 P1–P3, P7. MKT §4 (plan modal, long compare table). WEB §4 r21–r23 (current plan badge, billing toggle, new total before confirm), WEB §3.8. GAP r5–r7 (two buttons, effective date, renewal line). FND §4 (prices, fees, month to month, trial). BRD §6 (five ribs may show club count).

### 9.2 `PlanComparisonTable`

**Purpose and question.** "What exactly do I get in each plan?" It compares Trailhead, Ridge and Summit feature by feature. It sits below the cards (MKT §2 P4).

**Rows (ten maximum; MKT §4 warns against 15 or more).**

| Group | Feature | Trailhead | Ridge | Summit |
|---|---|---|---|---|
| Access | Clubs | 1 home club | All 5 clubs | All 5 clubs |
| Access | Classes and pools | At your home club | At all clubs | At all clubs |
| Access | Courts | Not included | Included, book 3 days ahead | Included, book 3 days ahead |
| Access | Recovery suite | Not included | Not included | Included |
| Booking | Book classes ahead | 7 days | 7 days | 9 days |
| Perks | Guest passes | Not included | 1 per month | 4 per month |
| Perks | Towel service | Not included | Not included | Included |
| Perks | Personal-training intro session | Not included | Not included | 1 per quarter |

Below the table, a second block "Add-ons and fees": Family add-on (+$39 per adult, +$19 per child ages 6 months–17; kids club included for children 12 and under), Day pass ($20), Enrollment ($0 during Fall climb, otherwise $49), Annual facility fee ($49, charged in March), Freeze ($10/mo, 1–3 months, 30 days' notice). All values come from FND §4. The Ridge and Summit rows for "Courts" and "Recovery suite" use only the facts in FND §4; check any other cell with the owner before launch.

**Cell format.** Never an icon alone. Included = check icon + short qualifier ("Included, book 3 days ahead"). Not included = dash icon + visible text "Not included" at `xs`, or hidden text for screen readers only when space is tight (the dash is `aria-hidden`; the text "Not included" is visually hidden). The qualifier text is always visible for numbers.

**Anatomy.** Sticky header row: plan name, price (`data`), and the plan button (outline; the filled button is on the cards above). Column for the highlighted plan has a `primary-subtle` background tint (not a border colour only). The member's plan column carries "Your plan" in the header (WEB §2.7, QuickBooks and Neon "Current plan" patterns). Group header rows ("Access", "Booking", "Perks") use `eyebrow`.

**Wireframe: `PlanComparisonTable` (web).**

```
                     | Trailhead   | RIDGE        | Summit
                     | $54/mo      | $79/mo       | $129/mo
                     | [Join]      | [Join]       | [Join]
 --------------------+-------------+--------------+-------------
 ACCESS
 Clubs               | 1 home club | All 5 clubs  | All 5 clubs
 Classes and pools   | Home club   | All clubs    | All clubs
 Courts              | - Not incl. | v 3 days     | v 3 days
 Recovery suite      | - Not incl. | - Not incl.  | v Included
 BOOKING
 Book classes ahead  | 7 days      | 7 days       | 9 days
 PERKS
 Guest passes        | - Not incl. | 1 per month  | 4 per month
 Towel service       | - Not incl. | - Not incl.  | v Included
 PT intro session    | - Not incl. | - Not incl.  | 1 per quarter
```

**Responsive.** Below 768 px, show one stacked list per feature group. Each row is a definition: the feature name, then three small label–value pairs ("Trailhead: Not included · Ridge: 1 per month · Summit: 4 per month"). No horizontal scroll for the main reading path. The table is wrapped in a `Collapsible` titled "Compare all features" on the marketing pricing page.

**States.** Default, hover (row fill `surface-muted`), focus (only on the header buttons), loading (skeleton rows), error (as `PlanCard`), highlighted column, "Your plan" column.

**Data contract.**

```ts
interface PlanComparisonTableProps {
  plans: Plan[];
  rows: { group: string; label: string; values: Record<PlanId, { included: boolean; text: string }> }[];
  addOns: PlanAddOns;
  currentPlanId?: PlanId;
  highlightedPlanId?: PlanId;
  surface: 'marketing'|'app';
  collapsible?: boolean;
}
```

**Content rules.** Rows are noun phrases. Qualifiers are numbers with units. No row says "Premium" or "Exclusive". Ten rows or fewer.

**Accessibility.** A semantic `<table>` with `<caption>` ("Compare plans"), column `<th scope="col">` with plan name and price, row `<th scope="row">`, group headers as `<tbody>` with `<th colspan>`. Check and dash icons are `aria-hidden`; the cell text carries the meaning. The sticky header must not cover focused buttons: add `scroll-padding-top`. iOS: use a `Grid` for default sizes and a `List` with one `Section` per plan at AX sizes (`ViewThatFits`).

**Web build.** shadcn `table` (restyled), Graphical `Collapsible`, `Button`, `Accordion` (alternative on narrow screens), `Separator`. Custom: sticky header, highlighted column tint, responsive reflow. Do not use shadcn `data-table`; this table is static (LIB §2).

**iOS build.** Not a table. A "Compare plans" `.sheet` with a `Grid` (four columns: feature, then three plans) inside a `ScrollView`, `GridRow` per feature, `Image(systemName: "checkmark")` with a visible text qualifier. At AX sizes: `List` with `Section(plan.name)`. Plans are `Text` with `.font(.headline)`. Native: Grid, List, sheet.

**Research basis.** MKT §3 r20 (full comparison below cards), MKT §2 P4 (check, dash, qualifiers), MKT §4 (15+ row tables; plan modals). WEB §4 r24 (feature matrix with check marks for three or more plans), WEB §4 r21 (current plan tag), WEB §3.8. GAP r5, WEB §2.7 (change plan flow). FND §4 (plan facts).

### 9.3 `CheckInPass`

**Purpose and question.** "How do I get in?" It shows the member's check-in code and number, ready to scan.

**Anatomy: `full` (a large sheet or full-screen view).**
1. Close button (top-left on iOS, top-right on web). No auto-dismiss timer (APL §6).
2. Night-surface pass card, radius XL 28, padding 24 (never a glass surface):
   - Header: small reversed wordmark (Sand) and the plan name badge ("Ridge") in Dawn Copper text.
   - Member name: Archivo 600 `l` 24/30, Sand ("Maya Lopez", sample).
   - Label "MEMBER NUMBER" in `eyebrow` style, Sand at 80 %. Number in `data-l` Archivo 700 36/40, tabular, Sand ("0042 1187", sample) (GAP r12).
   - QR code on a **pure white** rounded square (radius S 10) with at least a 16 px quiet zone, QR size at least 240 × 240 (as large as the card allows, to 280). The white square keeps the code scannable in dark mode (IOS §6 #8: do not dim the pass).
   - Caption under the code: "Scan at the front desk" and the club line: "Checking in at Gilbert – Val Vista" with a "Change" link (opens `ClubSwitcher`).
3. State strip (only when not valid): a pause-icon pill "Frozen until Dec 1" (neutral, mobbin-standard-pass §2 rule 49) with the line "Ask the front desk." (`warning` text for the instruction) or "Payment is past due. Update your card to check in." (`danger`), with a button.
4. Actions: iOS "Add to Apple Wallet" (`PKAddPassButton`, full width pill, placed directly below the pass card; use the system black style in light mode and the white style in dark mode; GAP r13 and mobbin-standard-pass §1 search 9: Luma puts it below the ticket QR, Zip under the number block). A "Maybe later" text link under the button is allowed on the first visit only (seen on Neo, mobbin-standard-pass §1 search 9). These are non-gym passes; do not cite them as gym patterns (mobbin-standard-pass §3 correction 4). Web: "Add to Apple Wallet" appears only on iPhone Safari; elsewhere "Open the app for Wallet". Secondary "Show my member number" to the front desk when the scan fails.
5. Kids club section (only when the member has a kids-club reservation today): "Kids club today: Mia · 4:00–6:00 p.m." with a "Show to the kids club desk" note (FND §3: check-in by parent).

**Variants.**

| Variant | Use | Content |
|---|---|---|
| `full` | The pass sheet or screen | All parts above |
| `compact` | Today tab card, web dashboard | Name, number, club, and a "Show pass" button (no QR) |
| `wallet-preview` | Membership screen | Mini card + Wallet button |
| `guest` | Guest pass | Title "Guest pass", guest name, host member, "Valid for one visit at {club}", QR |
| `teen` | Jordan, 16 | Same as `full`; the parent sees the same pass in the family list with "Teen pass" |

**Wireframe: `CheckInPass` `full`, iOS (390 pt).**

```
+--------------------------------------+
| (x)                                  |
| +----------------------------------+ |
| |  CACTUS PEAK ATHLETIC     [Ridge]| |   night surface
| |                                  | |
| |  Maya Lopez                      | |
| |  MEMBER NUMBER                   | |
| |  0042 1187                       | |   data-l, tabular
| |                                  | |
| |   +--------------------------+   | |
| |   |  [QR CODE on white,      |   | |
| |   |   >= 240 x 240,         |   | |
| |   |   16 pt quiet zone]     |   | |
| |   +--------------------------+   | |
| |   Scan at the front desk         | |
| |   Checking in at Val Vista  Change| |
| +----------------------------------+ |
|  [  Add to Apple Wallet  ]           |
|  Kids club today: Mia 4:00-6:00 p.m. |
+--------------------------------------+
```

**States.** Default `valid`. `frozen`, `past-due`, `trial` ("3-day pass · 2 days left"), `guest`. Loading: the card with a QR-sized skeleton and the member number visible if cached. Refreshing: the QR dims to 60 % for under one second and shows "Updating"; never blank. Error: "We could not refresh your code. The last code still works at the desk if it scans. Show your member number if it does not." Offline: same as error, with the cached code. Expired: "This code expired. Pull down to refresh." with a visible "Refresh code" button (also available as a gesture).

**Light and dark.** Same card in both modes (night surface). The QR square is always `#FFFFFF` with black modules, regardless of mode. Outside the card: `background`.

**Brightness.** On iOS, raise the screen brightness while the pass is visible and restore it on dismiss. This is a Proposal; the research did not observe it (IOS §7 "brightness boost not observed").

**Data contract.**

```ts
interface CheckInPassProps {
  pass: CheckInPass;
  member: Pick<Member,'firstName'|'lastName'|'avatar'>;
  club: Pick<Club,'id'|'displayName'>;
  kidsToday?: { childName: string; startsAt: ISODateTime; endsAt: ISODateTime }[];
  variant: 'full'|'compact'|'wallet-preview'|'guest'|'teen';
  onRefresh: () => Promise<void>;
  onChangeClub?: () => void;
  onAddToWallet?: () => void;
}
```

**Content rules.** One action: scan. Plain words: "Scan at the front desk." Do not show the plan price. The member number is real text so a front-desk worker can read it. Never show a countdown that pressures the member.

**Accessibility.** The QR image has `alt="Check-in code for Maya Lopez. Show it to the scanner at the front desk."`. The member number is selectable text. The whole pass is a `dialog` on web with a focus trap and Escape to close. The pass never closes on a timer. Contrast: Sand on Saguaro Night 12.0:1; Dawn Copper plan text on night 4.74:1 (at `s` size, 14 px, weight 600 this passes 4.5:1). Dynamic Type: the card scrolls; the QR keeps its size (never below 240) because a smaller code stops scanning. Name and number scale. iOS VoiceOver: the card reads name, plan, member number, club; the QR is an image with the label above; "Add to Apple Wallet" is a native button.

**Web build.** Graphical `Dialog` (wide) or `Drawer` (narrow). Custom card on the night surface, with a QR code generated on the client as SVG by any QR library (library choice not researched; require error-correction level M and the quiet zone). Graphical `Button` for the actions; `Toast` for "Code updated". LIB §4: the QR pass is a gap; use a QR image on a surface card.

**iOS build.** Present with a `.sheet` at the `.large` detent or a full-screen cover (APL §2 proposal; `fullScreenCover` signature unverified). QR from Core Image `CIFilter.qrCodeGenerator` rendered with `.interpolation(.none)` (framework not in the research list; verify). Wallet: `PKAddPassButton` in a `UIViewRepresentable` and `PKAddPassesViewController`, after `canAddPasses()` (APL §5). Put the same QR in the Wallet pass (APL §5 proposal). Entry points: a header button on Today (IOS §5 r23) and the tab bottom accessory when a booking starts soon (APL §2 proposal). Widget: accessory circular opens the pass (APL §5). App Intent: "Show my pass" (APL §5). Archivo is used only for the member name and number in this card. Stays native: sheet, PKAddPassButton, brightness APIs.

**Research basis.** mobbin-standard-pass §1 search 8–9 and §3 correction 4 (member cards; Wallet button placement; no gym card found), mobbin-standard-pass §2 rule 49. IOS §5 r22–r23 (full-screen pass with large QR on a light card; membership number in large type; pass action in the Home header). IOS §6 #8 (do not dim the pass; test at full brightness). GAP r12–r14 (member number in large bold with a small label; Wallet button; QR in a white rounded square with a caption). IOS §4.8 (pass patterns: Jomo, CLEAR, Chick-fil-A, American Airlines). APL §2, §5, §6 (large detent, Wallet, no auto-dismiss). WEB §2.10 notes digital check-in is "not observed" on web, and the staff check-in view must not be copied. FND §3, §5 (kids club check-in by parent; Jordan's pass).

### 9.4 `VisitStreak`

**Purpose and question.** "Have I been showing up?" It shows this week's visit days and the number of weeks in a row that the member met the weekly goal.

**Anatomy.**
1. Count: a small sprout icon (Lucide `sprout`, SF `leaf`) + "4-week streak" in `data` (web) or `.headline` with `.monospacedDigit()` (iOS). No flame icon (BRD §6).
2. Week strip: seven day dots, Monday to Sunday. Each dot is a 32 px circle with a one-letter weekday label above (`xs`) and a 44 px hit area when interactive.
   - Visited: `secondary` fill, Sand check icon inside.
   - Today, not yet visited: 2 px `secondary` ring.
   - Future day: 1 px `border-strong` ring.
   - Past day with no visit: 1 px `border` ring, empty.
3. Caption under the strip: "3 visits this week".

**Variants.** `strip` (Today tab and dashboard), `month` (with a streak hero: the count large in `data-l`, "4 weeks", above the calendar, mobbin-standard-pass §2 rule 53), (a month calendar with visited days; shown in the member web app on the profile page; WEB §3.2 streak calendar), `badge` (count only, in the iOS top bar; IOS §5 r24).

**States.** Default; first week ("Start your streak: visit once this week."); streak broken ("Last week was 2 of 4. This week is a fresh climb." — no red, no shame); goal met this week (all-success tone and "Goal met"); milestone (4, 8, 12 weeks: a `Toast` once, "4 weeks in a row. Steady."); loading (seven grey circles); error ("We could not load your visits." with retry); empty (no visits yet: `EmptyState` compact).

**Data contract.**

```ts
interface VisitStreakProps {
  progress: WeekProgress;
  variant: 'strip'|'month'|'badge';
  today: ISODate;
  visits?: Pick<Visit,'checkedInAt'|'clubId'>[];     // for 'month'
  onDayPress?: (d: ISODate) => void;                 // opens that day's visit
}
```

**Content rules.** Count in weeks. "4-week streak". Privacy: the streak is private to the member and the family guardian. No leaderboard. Tone: steady, never scolding.

**Accessibility.** The strip is a group with the name "Visits this week: 3 of 4 goal". Each dot: "Monday, visited" / "Tuesday, not visited" / "Today, Wednesday, not yet". The check icon is not the only signal: the label states it. Streak count is real text. Reduce Motion: no pop animation on a new dot.

**Web build.** Custom dots with `Progress`-free markup; `Tooltip` (Graphical) for the visit detail on hover; shadcn `calendar` (read-only) for the `month` variant; `Toast` for milestones. Part of the stat row on the dashboard (WEB §4 r29).

**iOS build.** `HStack` of seven `Circle` views with `Image(systemName: "checkmark")`. The count uses a `Label("4 weeks", systemImage: "leaf.fill")`. Month: `Grid`. `.accessibilityElement(children: .combine)` on each dot. Widgets: the strip fits a small widget (read-only).

**Research basis.** mobbin-standard-pass §2 rules 52–53 (seven day circles; hero number plus month calendar). I took the seven circles and the hero number. I did not draw an X on missed days (rule 52) or a flame; a missed day stays an empty ring, because the brand does not shame (BRD §8, §6). IOS §5 r24–r25 (streak count in the top bar; seven-dot weekly strip). IOS §4.1 and §4.9 (Insight Timer strip, WHOOP count; flame is not used because BRD §6 bans it). WEB §4 r30 (streak as a row of day dots with a reward at the end; the end reward is not used), WEB §3.2 (Emergent streak calendar). FND §5 (Priya: progress streaks). IOS §6 #13 (no mascots).

### 9.5 `ProgressRibs` (weekly goal)

**Purpose and question.** "Am I on track for my weekly goal?" It shows visits this week against the member's goal.

**Anatomy.** A `RibMeter` with tone `brand` and a text value.
- Lit ribs = visits done (up to 5).
- The goal is a visible marker: ribs up to the goal are normal outlines; a short tick sits under the goal rib. Ribs beyond the goal use a dashed outline ("bonus").
- If the goal is met: tone changes to `success` and the text says "Goal met".
- Value text: "3 of 4 visits" in `data`. Under it: "1 more to reach your goal."
- Size: `lg` (inside cards) or `xl` (iOS Today header, with the number `data-l` under the ribs: "3 of 4"; GAP r15 puts the main number in the centre of a ring, here under the ribs).

Goal range is 1 to 5 visits per week, so five ribs always cover it.

**Variants.** `inline` (`md` ribs + text on one line, in the stat row), `hero` (`xl`, Today header), `widget` (small widget tile, ribs + a capitals label such as "3 OF 4 VISITS", mobbin-standard-pass §2 rule 55).

**States.** Default; goal met; over goal (more than the goal: bonus ribs fill; text "4 of 3 visits"); no goal set ("Set a weekly goal." with a button); loading; error.

**Data contract.**

```ts
interface ProgressRibsProps {
  done: number;                       // >= 0; display caps at 5 ribs, text shows true number
  goal: 1 | 2 | 3 | 4 | 5;
  variant: 'inline'|'hero'|'widget';
  onEditGoal?: () => void;
}
```

**Content rules.** "3 of 4 visits". "1 more to reach your goal." "Goal met." Never "behind" or "failed".

**Accessibility.** `role="meter"`, `aria-valuemin=0`, `aria-valuemax=5` (or the goal), `aria-valuenow`, `aria-valuetext="3 of 4 weekly visits"`. VoiceOver: "Weekly goal, 3 of 4 visits." The goal tick and dashed ribs are `aria-hidden`; the text carries the meaning. Dynamic Type: text wraps under the ribs.

**Web build.** `RibMeter` with Graphical `Meter` semantics. Custom: goal tick, dashed bonus ribs. Goal edit: Graphical `Slider` or `NumberField` in a `Popover`.

**iOS build.** `Gauge` with `RibGaugeStyle` plus a `Text("3 of 4")` in Archivo `data-l` (`relativeTo: .largeTitle`). Edit goal: `Stepper` in a sheet. A small widget uses the same view.

**Research basis.** IOS §5 r26 (progress as rings, one per metric); this spec uses ribs instead, to carry the five-rib system (FND §6 principle 5). GAP r15–r16 (main number with the goal under it; quick-action pills under the summary). WEB §4 r29, r31 (stat row; tier progress bar with the amount left). IOS §4.9, §4.1 (WHOOP, Google Health rings). APL §6 (do not use colour alone).

## 10. Support components

### 10.1 `EmptyState`

**Purpose and question.** "Why is nothing here, and what can I do?" Every empty state has a next action (IOS §6 #14).

**Anatomy.** Centred stack, padding 32 (block) or 16 (inline).
1. Mark (optional): a hollow `RibMeter` `xl` (five outline ribs, value 0) in `text-muted`. This is the brand "empty" picture. Or a 48 px circle with a category icon.
2. Title: Archivo 600 `l` (block) or Inter 600 `m` (inline).
3. Body: `m` or `s`, `text-muted`, two lines maximum, left-aligned when it is longer than one line (WEB §5 #10).
4. Actions: one primary `Button`, optionally one text link.

**Variants and sample copy.**

| Id | Where | Title | Body | Action |
|---|---|---|---|---|
| `no-bookings` | My classes, Upcoming | "No classes booked yet" | "Pick a class and we'll save your spot." | "Book a class" |
| `no-past` | My classes, Past | "No past classes yet" | "Your finished classes will show here." | none |
| `no-waitlist` | Waitlist | "You are not on any waitlists" | "Full class? Join its waitlist and we will book you if a spot opens." | "Browse today's classes" |
| `no-results` | Filtered schedule | "No classes match" | "Try removing 'Hard' or pick another day." | "Clear filters" |
| `empty-day` | Schedule | "No classes on Sunday" | "Try Monday. 11 classes start at 5:00 a.m." | "See Monday" |
| `club-closed` | Schedule today | "Gilbert – Heritage is closed" | "Opens 4:30 a.m." | "See tomorrow" |
| `no-reservations` | Courts and lanes | "No court reservations" | "Courts open for booking 3 days ahead." | "Reserve a court" |
| `no-visits` | Streak | "Your first visit starts the streak" | "Show your pass at the front desk." | "Show my pass" |
| `frozen` | Membership frozen | "Your membership is frozen until Dec 1" | "Booking opens again then." | "Manage freeze" |
| `offline` | Any list | "You are offline" | "We will update this list when you reconnect." | "Try again" |
| `error` | Any list | "We could not load this" | "Check your connection and try again." | "Try again" |
| `no-coaches` | Club page | "Coach profiles are coming soon" | none | none (Informational; the only state without an action) |

Sample copy is invented for this spec. The tone follows BRD §8.

**Sizes.** `block` (fills a page area), `inline` (inside a card), `compact` (inside a list row or a chart area, mark omitted).

**States.** It has a loading counterpart (skeleton of the parent list), not its own loading state. Error variants use `danger` only for the triangle icon and keep the text in `text`.

**Data contract.**

```ts
interface EmptyStateProps {
  kind: 'no-bookings'|'no-past'|'no-waitlist'|'no-results'|'empty-day'|'club-closed'
      | 'no-reservations'|'no-visits'|'frozen'|'offline'|'error'|'no-coaches';
  size?: 'block'|'inline'|'compact';
  title?: string; body?: string;      // override the default copy
  primaryAction?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; href?: string };
  mark?: 'ribs'|'category'|'none';
  categoryId?: CategoryId;
}
```

**Content rules.** Say what is empty, then what to do. No illustrations of mascots (IOS §6 #13). No "Oops". The primary action is a verb phrase.

**Accessibility.** Title is a heading at the correct level. When a filter produces the empty state, announce it politely: "No classes match." The mark is `aria-hidden`. Focus moves to the title only when the user caused the change by navigating (not when a filter updates). iOS: `ContentUnavailableView`, which gives the right traits.

**Web build.** shadcn `empty` (empty-state block), Graphical `Button`. Custom: the hollow-rib mark (a `RibMeter` with value 0 and `decorative`). LIB §4 lists empty and loading states as a gap covered by shadcn `empty` and `skeleton`.

**iOS build.** `ContentUnavailableView { Label("No classes booked yet", image: "cp.ribs.empty") } description: { Text("Pick a class and we'll save your spot.") } actions: { Button("Book a class") { } .buttonStyle(.borderedProminent) }`. For search and filter results use `ContentUnavailableView.search` where it fits. Custom symbol `cp.ribs.empty` is the hollow-rib image. Native: ContentUnavailableView.

**Research basis.** WEB §3.9 and WEB §4 r37 (separate empty lines for Upcoming and Past; Customer.io and Sprig single-action empty lists). IOS §6 #14 (empty states need a clear primary action). IOS §1 row 3 (ClassPass empty state with "Time to book!"). WEB "Coverage gaps" and §3.9: "error state with retry, offline state, and empty state for no class results after a filter: not observed", so those are first-principles designs. MKT §4 (single empty state, not repeated "Unavailable"). LIB §4.

### 10.2 `PromoBand`

**Purpose and question.** "Is there an offer or a notice I should know about?" It carries one message and one action.

**Variants.**

| Variant | Where | Anatomy |
|---|---|---|
| `top-bar` | Above the marketing header (MKT §2 N5) | Height 40. One line of text (`s`) + one small button (outline, Dawn Copper edge) + dismiss `x`. Night surface. |
| `band` | Between marketing sections | Full-width night-surface band, padding 48 vertical. Eyebrow, headline in Archivo 800 `xl`, one line of body, one filled Dawn Copper button, optional photo on the right (4:3, radius M). |
| `band` with `form` | Marketing trial or tour band | Same band with one row: an email field and a button side by side, and under it the line "No credit card required". The button names the offer: "Get a 3-day pass" (mobbin-standard-pass §2 rule 14). Fields: email only. Tour requests keep their own form (MKT §3 r23). |
| `card` | Today tab and dashboard | A card (`surface`, radius M) with the message, a `RibMeter` or icon, and one button. Used for trial and notice messages ("3-day pass: 2 days left"; WEB §4 r28). |

**Look.** Night surface (part 1, section 4.1): Saguaro Night background, Sand text (12.0:1), Dawn Copper button with `#121A16` label (6.22:1). No gradient, no pattern. A subtle 1 px `border` on the dark-mode band edge helps separate it from the dark page.

**States.** Default; hover and focus on the button and the dismiss control; dismissed (hidden for 7 days; stored per device); loading n/a (it renders from static content); error n/a; empty (no promo: do not render).

**Data contract.**

```ts
interface PromoBandProps {
  promo: Promo;
  variant: 'top-bar'|'band'|'card';
  photo?: Photo;
  eyebrow?: string;
  onDismiss?: () => void;
}
```

**Content rules.**
- Top bar: one line, 60 characters or fewer. Sample: "Fall climb: $0 enrollment. Tour a club to start." (`endsOn` is optional; the foundation gives no end date.)
- Band: headline eight words or fewer (MKT §3 r39); body 20 words or fewer; one button. Sample: "Try Cactus Peak for 3 days" / "Come in with a 3-day pass. No card needed." / "Get a 3-day pass".
- No countdown clocks, no "LAST CHANCE". No stacked promos: show one at a time.
- Do not use a promo band for safety or legal notices. Use `Alert`-style inline messages (shadcn `alert`) or `Toast`.
- Never put a promo in a Live Activity (APL §5).

**Accessibility.** A `section` or `aside` with `aria-label="Announcement"`. The dismiss control is a button with `aria-label="Dismiss announcement"`, 44 px hit area. The band has no auto-advance or marquee. The text is real text (not an image). Contrast as above. iOS: a `Section` header card; the dismiss is a `Button` with a label. Dynamic Type: the button moves below the text.

**Web build.** Custom band with Graphical `Button` (the "primary" variant re-themed for the night surface via a `data-theme="dark"` scope) and `Button` ghost for dismiss. Photo: shadcn `aspect-ratio`. The top bar sits above Graphical `NavigationMenu`. For safety notices use shadcn `alert` (LIB §2: Graphical has no alert; messages use Toast or AlertDialog).

**iOS build.** `card` only: a `VStack` in a rounded `Color("NightSurface")` background with `.buttonStyle(.borderedProminent)` and `.tint(Color("BrandDawn"))`. Keep promos rare; one at a time. Not in widgets or Live Activities.

**Research basis.** mobbin-standard-pass §2 rules 13–14 (trial card, email-only row). MKT §2 N5 (top promo bar above the header: Hers, Hims), MKT §3 r39 (headline eight words or fewer, support 20 words or fewer), MKT §3 r44 (copper for primary buttons, Sand for alternate sections). WEB §4 r28 (trial banner with days left and CTA: Buffer). MKT §4 (cookie banner over hero copy; neon gradient hero). APL §5 (Live Activity: no ads). BRD §9.

## 11. Cross-surface use, build order and open decisions

### 11.1 Where each component appears

"M" = marketing website. "W" = member web app. "I" = iOS app. A dash means the component is not used there.

| Component | M | W | I | Notes |
|---|---|---|---|---|
| `RibMeter` | yes | yes | yes | Base primitive |
| `IntensityRibs` | yes | yes | yes | |
| `BusynessMeter` | yes (no counts) | yes | yes | Medium widget |
| `CapacityIndicator` | only at 5 or fewer | always | always | |
| `CategoryBadge` | yes | yes | yes | |
| `AmenityChip` | yes | yes | yes | Filters on M and I |
| `ClubCard` | feature, map-callout | feature, list-row, compact | compact, list-row, map-callout | |
| `ClubHero` | page | app | ios | |
| `ClubSwitcher` | compare mode | single and multi | single and multi | |
| `HoursTable` | week, grouped, all-clubs | week, today | week (sheet) | |
| `PopularTimesChart` | yes | yes | yes | |
| `ClubMap` / `ClubPin` | split view | split view | map + sheet | |
| `ClassCard` | card, schedule-row (preview), featured | all but compact widget | schedule-row, card, compact | |
| `ClassDetailPanel` | read-only page | panel | pushed page | |
| `InstructorChip` | yes | yes | yes | |
| `CoachCard` | card, feature | card, row | row, detail | |
| `ScheduleDayStrip` | 7 fixed chips | window-based | window-based | |
| `ScheduleWeekGrid` | yes (wide) | yes (wide) | iPad optional | |
| `ScheduleFilters` | marketing tabs | sidebar, drawer | chips + sheet | |
| `ClassPhotoTile` | grid | category | square, carousel | |
| `BookingStateButton` | "Try this class" only (state `book` renamed by content) | all states | all states | |
| `ReservationSlotGrid` | — | yes | yes | |
| `PlanCard` | marketing | current, change, select | current, change | |
| `PlanComparisonTable` | yes | yes (change flow) | sheet | |
| `CheckInPass` | — | dialog | primary | Wallet on iOS |
| `VisitStreak` | — | yes | yes | |
| `ProgressRibs` | — | yes | yes | |
| `EmptyState` | rare | yes | yes | |
| `PromoBand` | top-bar, band | card | card | |

### 11.2 Suggested build order

1. Tokens: add category tokens (`--cp-cat-*`), night-surface alias, `theme.json` updates (part 1, section 2.3).
2. `RibMeter` and the shared formatters (part 1, section 4.7). Everything else depends on them.
3. `CategoryBadge`, `CapacityIndicator`, `IntensityRibs`, `InstructorChip`, `AmenityChip`, `BusynessMeter`.
4. `BookingStateButton` with `deriveBookingState`.
5. `ClassCard` (schedule-row and card), `ClassDetailPanel`, `ScheduleDayStrip`, `ScheduleFilters`.
6. `ClubCard`, `HoursTable`, `ClubSwitcher`, `ClubHero`, `ClubMap`.
7. `PlanCard`, `PlanComparisonTable`, `CheckInPass`, `VisitStreak`, `ProgressRibs`.
8. `ReservationSlotGrid`, `ScheduleWeekGrid`, `PopularTimesChart`, `CoachCard`, `ClassPhotoTile`, `EmptyState`, `PromoBand`.

### 11.3 Open decisions and assumptions (owner action needed)

| # | Item | What I assumed | Who decides |
|---|---|---|---|
| 1 | Web map renderer | None chosen. `ClubMap` hides it behind a `MapRenderer` interface. LIB §4 says "none; unverified choice". | Web lead |
| 2 | Booking window for lap lanes and kids club | Foundation gives only courts (3 days). I assumed lanes and kids club follow the class window (7 days; Summit 9). | Product |
| 3 | Slot start step | Courts every 30 minutes; lanes every 45 minutes; kids club four fixed blocks. Foundation gives durations only. | Product |
| 4 | Ridge class booking window | Foundation says "book up to 7 days ahead (Summit: 9)". I read Ridge as 7. | Product |
| 5 | Busyness thresholds | The server maps check-in counts to five levels. This spec does not set the cut-offs. | Operations |
| 6 | Publishing head-counts | `Busyness.checkIns` is optional, member-only, off by default. | Operations |
| 7 | Reviews and ratings | No rating data exists in the foundation. `rating` is optional in the data model and `RatingLine` renders only when it exists (part 1, section 4.8; mobbin-standard-pass §2 rule 41). A "Reviews" tab on the marketing club page is optional (MKT §3 r10). | Coordinator / marketing |
| 8 | Yearly billing toggle | Omitted; foundation has month-to-month billing only. | Product |
| 9 | Plan cell facts | Plan table uses only facts in FND §4. Cells for Trailhead courts and Ridge recovery use "Not included" because FND does not list them. Confirm. | Product |
| 10 | Rotating QR payload | Short-lived token with refresh; offline falls back to the last code and the member number. | Platform |
| 11 | Screen brightness boost on the pass | Proposal; not observed in research. | iOS lead |
| 12 | Archivo font names on iOS | PostScript names are unverified. Confirm from the bundled file before `Font.custom` (APL §4). `Font.custom(_:size:relativeTo:)` signature unverified (APL §7). | iOS lead |
| 13 | `Gauge`, `GaugeStyle`, `Annotation`, `widgetAccentable()` | Used in this spec but not in `apple-ios-guidelines.md`. Check the APIs in Xcode. | iOS lead |
| 14 | SF Symbol and Lucide names | Listed as fallbacks. Verify each name before use. | Design |
| 15 | Custom icons | `rib-barbell`, `court`, `cp.conditioning`, and `cp.ribs.empty` need to be drawn (24 px grid, 2 px stroke). | Design |
| 16 | Strength colour near the primary button | Kept as Arizona Copper per the foundation. Rules in part 1, section 2.4 reduce confusion. Test with real members; consider a distinct Strength hue if confusion shows. | Design |
| 17 | Sample copy and names | Instructor names, member names, promo text and bios in this spec are invented samples. | Content |
| 18 | Hex values in app code | Spec shows hex only for review. App code uses role names (LIB §5). | All |

## 12. Revision log

### Revision 2 (applies `research/mobbin-standard-pass.md`)

Applied in full: the three [Shared components] rules, 60, 61 and 62. Applied where a rule changes a shared component: 8, 9, 14, 16, 17, 19, 22–28, 31–32, 36–41, 43–46, 47, 49, 53–57, 59 (see the table). Not applied: rules 11–12, 52 (X on missed days), 58, and rules that belong to other specs (1–3, 5, 13, 15, 18, 20–21, 29–30, 33–35, 42, 48, 50–51; 29–30 and 48 are only pointed to from `PlanCard`).

| Rule(s) | Component changed | Change |
|---|---|---|
| 61, 38, 24 | `ClassCard` `schedule-row` | New reading order on web and iOS: time, title, instructor, spots, action. Avatar moved after the title. Wireframes redrawn. |
| 60 | `ReservationSlotGrid` | Duration control is now `DurationChips` (segmented chips, selected filled). |
| 62, 45, 46, 44 | `ClassDetailPanel` confirmed view | One green check, one headline, "Confirmed" pill, summary card, filled "Add to calendar", "Share" link, four action rows, "Done". |
| 39, 56, 41 | `ClassDetailPanel` | Hero band with instructor and time (solid band, no gradient). Stats row of three with small-capitals labels. Optional rating line. |
| 40 | `ClassDetailPanel` bar, `BookingStateButton` | After booking, the bar shows "Booked" and a grey "Cancel". |
| 26–28, 43 | Cancel dialog | Stacked: filled "Keep my spot", outline "Reschedule instead", quiet "Cancel booking". Red X consequence lines (with words). Optional reasons. iOS bottom sheet. This replaces the side-by-side layout from revision 1. |
| 47 | `BookingStateButton` waitlist dialog | "Join waitlist" stays disabled until the consent box is ticked. |
| 41, 8 | Data model, new `RatingLine` | Optional `rating` on Club, ClassType and Instructor. Nothing renders until the foundation adds ratings. |
| 4, 6, 7 | `ClubCard`, `HoursTable` | Marketing finder cards show address and today's hours. Hours group days left, times right. |
| 57 | `ClubMap` iOS | Search pill and "5 clubs in map area" count line. |
| 54, 55 | `ClassCard` `compact`, `ProgressRibs` | Live Activity layout (timer chip, big title, three values, Dynamic Island) and 2 × 2 widget tiles with capitals labels. |
| 8, 9, 16, 17 | `ClassCard`, `ClassPhotoTile`, `CoachCard` | `thumb-left` marketing card, six category tiles, `headshot` variant, age chip for Youth. |
| 37, 22, 23, 25, 59 | `InstructorChip`, `ReservationSlotGrid` | `choice` variant with ring and check; availability ranges; four-column chips with a total line. |
| 31, 32, 49 | `PlanCard` `change`, `current` | "Before you switch" list, summary block with charge start date, neutral "Frozen until" pill. Freeze flow handed to the app specs. |
| 53, 52 | `VisitStreak` | Hero number on the month variant. |
| 13, 14 | `PromoBand` | `band` with an email-and-button row. |
| 36 | `ClassDetailPanel` | "Invite a friend" sheet with link field and "Copy link". |
| Search 9, correction 4 | `CheckInPass` | Wallet button below the pass, system black or white style, optional "Maybe later". Noted as non-gym evidence. |
| 19 | `AmenityChip` `detail` | Also used as a sidebar list beside an amenity photo. |
| Corrections 1–5 | Research notes | Waitlist, cancel, pause and Live Activity are now supported by Mobbin evidence. Busyness chart and sport-court grid are still new patterns. |

Decisions where the new rules conflict with the foundation or the brand:
- Rules 11–12 (monthly or annual toggle, "billed annually"): not used. The foundation has no yearly price.
- Rule 52 (X on missed days) and the flame in rule 52: not used. The brand does not shame (BRD §6, §8).
- Rule 58 (YES/NO crowd prompt in place of the chart): not used. The foundation requires the typical-hours chart.
- Rule 38 (instructor name in capitals): not used. Names keep sentence case.
- Rule 49 (green paused pill): the freeze pill is neutral.
- Rule 41 (rating): built as optional, because the foundation has no rating data.

## 13. Decisions from the cross-spec review

These answer the requests in `web-app/04-components.md` §C. They apply to the web app and the iOS app.

1. **`BookingStateButton` `restricted` takes a `reason`.** The reason sets the label and a one-line note under the button.
   Reasons and labels: `notOpen` "Opens Tue 6:00 a.m." · `frozen` "Membership frozen" · `paused` "Booking paused to Oct 30" ·
   `age` "18+ only" · `teenApproval` "Needs parent OK" · `plan` "Ridge or Summit". The button is disabled. The note says what to do.
   No separate `not-open` state.
2. **`hold` gets a secondary action "Release spot".** The primary action stays "Confirm spot". "Release spot" gives the spot
   to the next person and shows no strike.
3. **`PackCard` stays an app composite** (web app and iOS). `PlanCard` is for membership plans only.
4. **`ProgressRibs` shows the weekly visit goal only.** Other progress uses Swift Charts on iOS and shadcn `chart` on web.
