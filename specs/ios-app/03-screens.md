# Cactus Peak Athletic iOS app — 03 Screens (revision 2)

Read `01` (routes, sheets, toolbars) and `02` (flows) first. Component specs are in `04`; the shared brand components are final in `../01-shared-brand-components.md` and `../01-shared-brand-components-part2.md` ("shared spec"). Accessibility checks are in `05`.
Tag key is in `01` section 0.1. `[found §N]` = `../00-foundation.md`. `[mobbin-standard-pass §2 rule N]` = `../research/mobbin-standard-pass.md`. Sample "today" is Tuesday 27 October 2026, 5:40 a.m.

## Screen index

| # | Screen | Tab / presentation | Route or sheet |
|---|---|---|---|
| 1 | Welcome | `fullScreenCover` | `presentedWelcome` |
| 2 | Onboarding (5 steps) | `fullScreenCover` stack | n/a |
| 3 | Today | Today root | n/a |
| 4 | Book: Classes (Schedule) | Book root, segment 1 | n/a |
| 5 | Filters | sheet | `presentedFilters` |
| 6 | Class detail | push | `.classSession` |
| 7 | Booking confirmation (success view; waitlist variant) | push, back hidden | `.bookingConfirmed` |
| 8 | My bookings | push | `.myBookings` |
| 9 | Clubs: map and list | Clubs root | n/a |
| 10 | Club detail | push | `.club` |
| 11 | Club hours | sheet (`.medium`) | `presentedHours` |
| 12 | Reserve: courts, lanes, kids club | Book root, segments 2 to 4 | `.reserve` |
| 13 | Reserve sheet, cancel sheet, waitlist sheet and Reservation confirmation | sheets | `presentedReserve`, `presentedCancel`, `presentedWaitlist` |
| 14 | Check-in pass | sheet | `presentedPass` |
| 15 | Progress | push | `.progress` |
| 16 | Coach profile | push | `.coach` |
| 17 | You | You root | n/a |
| 18 | Membership | push | `.membership` |
| 19 | Plans (change plan) | push | `.plans` |
| 20 | Freeze | push | `.freeze` |
| 21 | Family and Family member | push | `.family`, `.familyMember` |
| 22 | Add family member | sheet | n/a |
| 23 | Guest passes and Guest share | push and sheet | `.guestPasses`, `presentedGuestShare` |
| 24 | Notifications (Inbox) | push | `.notifications` |
| 25 | Settings | push | `.settings` |
| 26 | Search | Search root | n/a |

## Global conventions (apply to every screen unless a screen says otherwise)

### G1 Layout and spacing
- Page margin 16 pt. Use the system list inset on `List`. Use `.padding(.horizontal, 16)` on `ScrollView` content.
- Section gap 24 pt. Gap inside a section 8 to 12 pt. Card padding 16 pt. Theme spacing: 4, 8, 12, 16, 24, 32, 48. [theme `space`]
- Card = `Surface` fill, `RoundedRectangle(cornerRadius: 14, style: .continuous)`, 1 pt `Border` stroke, no shadow. No Liquid Glass on cards. Only floating things (sheets, map callout) use a shadow. [shared §1 principle 7] [apple §3] [theme `radius.m`]
- Shape tells meaning: rectangles with a 4 pt corner are static labels (badges, tags). Capsules are controls (chips, buttons). [shared §4.2]
- One filled button per card. [shared §1 principle 6]
- Root screens set `.background(Color.appBackground)` and `.scrollContentBackground(.hidden)` on `List`. Sheets keep the system background. [apple §3]
- Use `List` when rows are uniform and text-heavy (schedule, bookings, settings). Use `ScrollView` + `LazyVStack` when the page is made of mixed cards (Today, Club detail, Progress). [apple §2 lists]
- In a `ScrollView`, swipe actions need `.swipeActionsContainer()` on the container (iOS 27). [skill:swiftui-whats-new-27]
- Large title on root screens. Inline title on pushed screens. Titles stay under 15 characters. [apple §2 toolbars]
- Tap targets: 44 x 44 pt minimum. Whole row is the target. [apple §6 touch targets]

### G2 Type
- System text styles for all text: `.largeTitle`, `.title`, `.title2`, `.title3`, `.headline`, `.body`, `.callout`, `.subheadline`, `.footnote`, `.caption`. [skill:accessibility-dynamic-type-specialist]
- Archivo is allowed only for: eyebrow labels, big numerals (time on the next-class card, streak, member number, price on `PlanCard`, spots-left number on the featured card), and display titles inside content (not the navigation title). Always `Font.custom(_:size:relativeTo:)`. `[verified]` signature. See `04` section 3.
- Times in rows: SF with `.monospacedDigit()`.
- Never use `.font(.system(size:))`. Never use `.minimumScaleFactor` as the main strategy. Never fix a height around text. [skill:accessibility-dynamic-type-specialist]

### G3 States (every screen)
| State | Pattern |
|---|---|
| Loading, first load | Same layout with `.redacted(reason: .placeholder)`. Shows for 300 ms or longer only. Label "Loading" for VoiceOver. No shimmer. |
| Loading, refresh | `.refreshable` on `ScrollView` and `List`. System spinner. |
| Empty | `ContentUnavailableView` with a title, one sentence, and a button that does the obvious next thing. `[verified]` [mobbin-ios §6 a14] |
| Error with no cache | `ContentUnavailableView` with `wifi.exclamationmark`, title "Can't load X", description with what to do, button "Try again". |
| Error with cache | Keep the cached content. Show an `OfflineBanner` at the top: "Showing saved info from 5:12 a.m." |
| Offline | `OfflineBanner` "You're offline." Booking buttons disable with the label "Offline". The pass, bookings list and club info still work. |
| Partial failure | Inline red text under the control that failed. [gaps r14] |

### G4 Dynamic Type at AX5
- At `dynamicTypeSize.isAccessibilitySize`, horizontal groups switch to vertical with `ViewThatFits` or `AnyLayout`. [skill:accessibility-dynamic-type-specialist]
- Two-column grids become one column. Chips wrap with `FlowLayout`. Segmented pickers become menu pickers.
- Icons and spacing use `@ScaledMetric(relativeTo:)`.
- Bottom bars grow in height. They never clip text.
- Hero photos shrink from 220 pt to 160 pt so text gets room.

### G5 Dark mode
- Use asset colours only. Light and dark values are in `04` section 2.
- Text on a photo sits on a **solid Saguaro Night band at 80 %**, in Sand text. No gradients. No text over faces. [shared §4.4] [brand guide §9] White or Sand text on that band measures 7.15:1 or 6.35:1 even over a white photo. [shared §2.6] (Revision 1 used a gradient scrim; removed.)
- Night-surface things look the same in both modes: the pass card, the highlighted `PlanCard`, the Live Activity, text bands on photos. [shared §4.1]
- No pure black backgrounds. Background is `#121A16` in dark.

### G6 VoiceOver
- One element per row. Use `.accessibilityElement(children: .combine)` and a clear label. Do not combine when children are separate buttons. [skill:accessibility-voiceover-specialist]
- Meters give a label and a value. Charts get `accessibilityChartDescriptor`.
- Swipe actions are repeated as `.accessibilityAction(named:)`.
- Section titles have `.accessibilityAddTraits(.isHeader)`.
- Decorative images are `.accessibilityHidden(true)`.

### G7 Sample data used across screens
| Item | Value |
|---|---|
| Member (primary persona on Today) | Maya Lopez, Ridge, home club Gilbert – Val Vista, member number 0042 1187, billing day the 12th, children Mia (9) and Eli (6) |
| Clubs | Mesa – Dobson, Mesa – Red Mountain, Mesa – Downtown, Gilbert – Val Vista, Gilbert – Heritage |
| Club IDs | `club_mesa_dobson`, `club_mesa_red_mountain`, `club_mesa_downtown`, `club_gilbert_val_vista`, `club_gilbert_heritage` |
| Sample coordinates (approximate, not surveyed) | Dobson 33.394, -111.875 · Red Mountain 33.451, -111.687 · Downtown 33.415, -111.832 · Val Vista 33.334, -111.760 · Heritage 33.348, -111.789 |
| Instructors and coaches (sample) | Marisol Vega "Marisol V." (Cycle), Dev Patel "Dev P." (Strength), Tess Okafor (Mind & Body), Luis Ortega (Aqua), Hannah Brooks (Court), Andre Whitfield (Conditioning), Priyanka Rao (Recovery), Sam Keller (Youth). Rows use the short name. |
| Busyness levels | 1 Quiet, 2 Light, 3 Steady, 4 Busy, 5 Packed. Tones: success, success, neutral, warning, danger. [shared §5.3] |
| Front desk | (480) 555-0142 (fictional) |

---

## 1. Welcome

- **Purpose:** Sign in without a form. Say who we are in one line.
- **Question:** "How do I get in?"
- **Presentation:** `fullScreenCover`, no toolbar. [apple §2]

### Layout (top to bottom)
1. Photo: Mesa – Red Mountain at sunrise, full bleed. A solid Saguaro Night band at 80 % across the bottom 45 % carries all text. No gradient. [shared §4.4]
2. Reversed Rib Peak symbol (Dawn Copper and Sand), 56 pt, 32 pt from the top safe area.
3. Eyebrow "CACTUS PEAK ATHLETIC" (Archivo, tracked, white).
4. Title "Climb at your own pace." Archivo ExtraBold 34 pt relative to `.largeTitle`, white, leading.
5. Buttons stack, 12 pt gap, 16 pt margin, above the safe area:
   - "Sign in with a passkey" `.buttonStyle(.glassProminent)` with `.tint(Color.brandAccent)` and forced `BrandOnAccent` label.
   - `SignInWithAppleButton` (system, `.white` style) "Continue with Apple". `[UNVERIFIED]` modifier names.
   - "Email me a code" `.buttonStyle(.glass)`.
   - Footer text button "Not a member yet? Try a 3-day pass" (white, underlined).

### SwiftUI
`ZStack { AsyncImage ... ; Rectangle().fill(Color.nightSurface.opacity(0.8)) band ; VStack }`, `.ignoresSafeArea()` on the image only. Buttons are real `Button`s, not images.

### States
- Loading photo: Saguaro Night solid.
- Offline: buttons stay; failure shows an inline message.

### AX5 / Dark / VoiceOver
- AX5: scroll view; photo behind. Title wraps. Buttons grow.
- Dark: no change (the screen is always dark).
- VoiceOver: photo hidden; title is a header; buttons read their labels.

```
+--------------------------------------+
|  [photo: sunrise over Superstitions] |
|                                      |
|   /\  (Rib Peak)                     |
|   CACTUS PEAK ATHLETIC               |
|                                      |
|   Climb at your                      |
|   own pace.                          |
|  ------------------------------------|
|  [ Sign in with a passkey      ]     |
|  [  Continue with Apple        ]     |
|  [ Email me a code             ]     |
|      Not a member yet? Try a         |
|      3-day pass                      |
+--------------------------------------+
```

---

## 2. Onboarding (5 steps)

Flow is in `02` flow 2. Shared chrome:
- A `NavigationStack` inside the cover. Inline title empty. Leading Back (steps 2 to 5). No trailing items.
- `ProgressRibs` (5 ribs) under the safe area: filled = current step. Label "Step 2 of 5".
- Bottom bar via `.safeAreaInset(edge: .bottom)`: primary `.glassProminent` button, 52 pt tall, plus a text "Skip" under it (not on step 1).
- Content scrolls. 24 pt gap between heading and content.

### 2.1 Home club (step 1)
- Title "Pick your home club" (Archivo, `.title` relative). Sub: "You can change this any time."
- Top row: "Use my location" button (`location` symbol, `.buttonStyle(.bordered)`).
- Five `ClubCard` `list-row` (88 pt) in a `List`. Selected: `checkmark` and 2 pt `BrandAccent` outline, trait `.isSelected`. Nearest gets the chip "Closest". [shared §6.1]
- Trailhead note below: "Trailhead covers one home club. You can change it once per billing cycle. Ridge and Summit cover all 5." [found §4]
- Primary label: "Continue" (disabled until a club is selected).

```
+--------------------------------------+
| <            |||||  (step 1 of 5)     |
| Pick your home club                  |
| [ (o) Use my location ]              |
| +----------------------------------+ |
| | [img] Gilbert – Val Vista   (/)  | |
| |       Closest · 2.1 mi · Steady  | |
| +----------------------------------+ |
| | [img] Gilbert – Heritage         | |
| |       3.4 mi · Quiet             | |
| +----------------------------------+ |
| | ... 3 more                       | |
| [          Continue               ]  |
+--------------------------------------+
```

### 2.2 Interests (step 2)
- 8 tiles, 2 columns (`LazyVGrid` with `GridItem(.adaptive(minimum: 150))`). Each tile: category icon, name, `CategoryBadge` `tint` fill at 10 % (14 % in dark). Selected: filled badge, check, `isSelected` trait.
- Copy: "What do you like? Pick as many as you want."
- Primary "Continue". Skip allowed.

### 2.3 Alerts (step 3)
- `Form`-style `List` with three `Toggle` rows: "Waitlist spots" (on), "Class reminders · 60 min before" (on), "Club news" (off). A fourth row "Show next class on Lock Screen" (on).
- Footnote: "Waitlist spot? You get 30 minutes to confirm."
- Primary "Turn on alerts". Skip: "Not now".

### 2.4 Wallet (step 4)
- Preview of the pass. `PKAddPassButton` below in the system black style (white in dark mode), then a "Maybe later" text link. [shared §9.3] [mobbin-standard-pass §1 search 9] Text "Open your pass from the Lock Screen. No app needed."
- Hidden if `PKAddPassesViewController.canAddPasses()` is false. `[verified]` name in [apple §5].

### 2.5 Ready (step 5)
- Summary rows: Home club, Interests, Alerts. Featured `ClassCard` (card): suggested class at the home club for tomorrow.
- Primary "Go to Today".

States: Loading clubs (redacted cards). Error: inline "Can't load clubs" with Retry. VoiceOver: step header "Step 2 of 5. What do you like?".

---

## 3. Today

- **Purpose:** Show the day in one scroll.
- **Question:** What am I doing today, can I get in, how busy is it, where is my pass? [found §6 p2]
- **Route:** Today root. Toolbar in `01` section 4.

### Layout (order matters)
| # | Block | Component | Height / spacing |
|---|---|---|---|
| 0 | Hold card (only when a waitlist hold is active) | Card on `StatusWarningSubtle`: "A spot opened in Rib Rack Strength" + `BookingStateButton` `hold` "Confirm spot · 24:10" | 96 pt. Always first. |
| 1 | Header | Eyebrow "TUESDAY, OCT 27" (Archivo 12 pt tracked, `TextMuted`). Greeting "Morning, Maya." (Archivo ExtraBold 28 relative `.title`). | 8 pt gap |
| 2 | Next up | `ClassCard` (featured) | 16 pt below header |
| 3 | Club now | `BusynessMeter` card with `PopularTimesChart` (compact sparkline) | 16 pt |
| 4 | This week | One card: `VisitStreak` `strip` (leaf + "6-week streak", seven day dots Mon to Sun, "2 visits this week") and `ProgressRibs` `hero` ("2 of 3 visits") | 16 pt |
| 5 | Coming up | Header "Coming up" + "See all" (`NavigationLink(value: AppRoute.myBookings)`), then up to 3 `ClassCard` (schedule-row) in one card with dividers | 24 pt above |
| 6 | For you | Header "For you" + horizontal `ScrollView` of `ClassCard` (card) 260 pt wide, `.scrollTargetBehavior(.viewAligned)`, `.scrollIndicators(.hidden)` | 24 pt above |
| 7 | Club notice | One dry line from the club, e.g. "Pool's 82° and the shade sails are up." Card with `CategoryBadge` (Aqua) | 24 pt above |
| 8 | Feedback (after class only) | Card "How was Climb Cycle?" with "Great", "Okay", "Not for me" and "Add a note". Text "Only the club sees this." No stars. [found §4] | Shown for 24 h after a class |

Tab bar clearance: bottom padding 24 pt plus the safe area (the accessory adds its own inset).

### Next up card (featured)
Example (booked):
- Eyebrow: "NEXT UP · STARTS IN 20 MIN" (relative `Text(date, style: .relative)` in the suffix).
- Time: "6:00" Archivo ExtraBold 44 pt (relative `.largeTitle`) + "a.m." `.title3`.
- Title: "Climb Cycle" `.title2.bold`. `CategoryBadge` (Cycle). `IntensityRibs` 4 with "Hard".
- Row: `InstructorChip` "Marisol V." · "Cycle studio · Gilbert – Val Vista".
- Third value row (shared Live Activity pattern): "Val Vista · Cycle studio · Booked".
- Buttons (HStack, 12 pt): "Show pass" `.glassProminent` (tint `BrandAccent`, `qrcode`) is the one filled button. "Directions" `.glass`. Ellipsis `Menu` (Add to calendar, Cancel booking). [shared §1 principle 6]

Example (nothing booked):
- Title "Nothing booked today."
- Line "Your usual: Climb Cycle, Thu 6:00 a.m. · 4 bikes left"
- `BookingStateButton` "Book" (state from `deriveBookingState`); link "Browse classes".

### Club now card
- `BusynessMeter` `hero` on iOS Today: `RibMeter` `xl` (84 x 48 pt, peak profile) + the word "Steady now" in Archivo `data-l` + "About usual" + "Updated 5:35 a.m." [shared §5.3]
- Title "Gilbert – Val Vista" (`.headline`). Line "Open until 10:00 p.m. · Desk staffed from 6:00 a.m." (`.subheadline`, `TextMuted`).
- `PopularTimesChart` compact: 18 hourly bars from 4 a.m. to 10 p.m., current hour highlighted, height 56 pt. Caption "Usually quiet until 7 a.m. Updated 5:35 a.m." (`.caption`).
- Tap: push `.club(id)`.
- Updates: poll every 60 s while visible (server counts update every 5 min). [found §2] Haptic `levelChange` when the level changes while visible.

### This week cards
- `VisitStreak` `strip`: `Label("6-week streak", systemImage: "leaf.fill")` with `.monospacedDigit()`, seven 32 pt dots Monday to Sunday: visited = filled `NightSurface` with a check, today not visited = 2 pt ring, future = thin ring, past empty = faint ring. No flame. No X on missed days. [shared §9.4]
- Rule: a streak week meets the member's weekly visit target (default 3). One rest week is forgiven per 10 weeks. [found §4]
- `ProgressRibs` `hero`: `RibMeter` tone `brand`, ribs lit = visits, tick under the goal rib, "2 of 3 visits" in Archivo `data-l`, "1 more to reach your goal." Goal 1 to 5, set in Progress. [shared §9.5]

### SwiftUI composition
```swift
ScrollView {
    LazyVStack(alignment: .leading, spacing: 16) {
        if let hold = vm.activeHold { HoldCard(hold: hold) }
        TodayHeader(date: vm.now, name: vm.firstName)
        NextUpCard(booking: vm.nextBooking, usual: vm.usual)
        ClubNowCard(club: vm.homeClub, busyness: vm.busyness)
        WeekCard(streak: vm.streak, visits: vm.weekVisits, goal: vm.goal)
        UpcomingSection(bookings: vm.upcoming)
        ForYouSection(classes: vm.suggestions)
        ClubNoticeCard(notice: vm.notice)
        if let f = vm.feedbackPrompt { FeedbackCard(prompt: f) }
    }
    .padding(.horizontal, 16)
}
.background(Color.appBackground)
.refreshable { await vm.reload() }
.swipeActionsContainer()                        // iOS 27, for UpcomingSection rows
.navigationTitle("Today")
.toolbar { TodayToolbar() }
.sensoryFeedback(.levelChange, trigger: vm.busyness.level)
```

### Toolbar
Leading: `ClubSwitcher` button (short name "Val Vista" + chevron; opens the ClubSwitcher sheet, `.medium`, single choice, checkmark row, searchable). [shared §6.3] At accessibility sizes it moves into the first content row. Trailing group: Inbox `bell` (dot if unread), then Pass `qrcode` in `ToolbarItem(placement: .topBarPinnedTrailing)`. `[skill:swiftui-whats-new-27]` Pass has `.visibilityPriority(.high)`.

### States
- Loading: redacted placeholders for blocks 2 to 5.
- Empty (new member, no bookings, no visits): block 2 uses the "nothing booked" copy. Block 4 shows "Your first visit starts the streak." Block 5 hidden.
- Error: blocks keep cached values; `OfflineBanner` at top.
- Offline: pass button works; booking buttons disabled.
- Hold active: block 0 shown; Live Activity not used (see `02` flow 5).
- Club closed: ribs hidden; text "Closed · opens 4:30 a.m." Never "Quiet". Stale data (older than 15 min): five dashed outline ribs and "Busyness unavailable. Last update 22 min ago." [shared §5.3]
- Frozen: block 0 variant with the neutral pill "Frozen until Feb 19" and button "View freeze". [shared §9.1]
- Payment failed: day 1 to 7 card "We could not charge your card. Retrying on day 3 and day 6." with "Update payment"; day 8 to 14 card "New bookings are paused until you pay."; from day 15 "See the front desk." with a call button. [found §4]
- Booking pause (3 strikes): card "New bookings are paused until Sat Oct 31. Kids club, check-in and cancelling still work."

### AX5
- Next-up card stacks: time above title; buttons full width, vertical.
- Two-up cards become single column.
- Horizontal "For you" row stays horizontal but cards widen to 85 % of screen width.
- Toolbar items move to overflow as needed; `Pass` stays.

### Dark mode
Cards use `Surface` dark (`#1A241F`). Filled buttons use Dawn Copper with a `#121A16` label (6.22:1). See `04` section 2.

### VoiceOver
- Next-up card: "Next up. Climb Cycle, 6:00 a.m., starts in 20 minutes, Marisol V., Cycle studio, Gilbert – Val Vista. Intensity 4 of 5." Actions: "Show pass", "Directions", "Cancel booking".
- Club now: "Gilbert – Val Vista. Steady. 3 of 5. Open until 10 p.m." Trait `.updatesFrequently`.
- Greeting is a header.

```
+--------------------------------------+
| (Val Vista v)             (bell)(QR) |
| Today                                |
| TUESDAY, OCT 27                      |
| Morning, Maya.                       |
| +----------------------------------+ |
| | NEXT UP · STARTS IN 20 MIN       | |
| | 6:00 a.m.   [Cycle] ||||. Hard   | |
| | Climb Cycle                      | |
| | (MV) Marisol V. · Cycle studio   | |
| | Val Vista · Cycle studio · Booked| |
| | [ Show pass ] [Directions] [...] | |
| +----------------------------------+ |
| +----------------------------------+ |
| | Gilbert – Val Vista              | |
| | ▮▮▮▯▯  Steady now · About usual  | |
| | Open until 10 p.m. · desk 6 a.m. | |
| | ▁▁▂▅▇█▆▅▃▃▂▂▁  (now ▲)           | |
| +----------------------------------+ |
| +----------------------------------+ |
| | leaf 6-week streak               | |
| |  M  T  W  T  F  S  S             | |
| |  ●  ●  ○  ·  ·  ·  ·             | |
| | ▮▮▯▯▯  2 of 3 visits             | |
| +----------------------------------+ |
| Coming up                  See all   |
| Thu 6:00a Climb Cycle         >      |
| Sat 8:00a Kids club (2)       >      |
| For you ->                           |
+--------------------------------------+
| (Today)(Book)(Clubs)(You)   (Search) |
+--------------------------------------+
```

---

## 4. Book: Classes (Schedule)

- **Purpose:** Find a class and book it fast.
- **Question:** "What is on, and can I get in?" [mobbin-ios §4.2]
- **Route:** Book root, segment "Classes".

### Layout
Pinned header (via `.safeAreaInset(edge: .top, spacing: 0)`), then a `List`.

| # | Block | Detail |
|---|---|---|
| 1 | Segment `Picker` | "Classes | Courts | Lanes | Kids club". `.pickerStyle(.segmented)`. Menu style at AX sizes. |
| 2 | `ScheduleDayStrip` | Seven chips visible, scroll to the member's window (today plus 7 days; Summit plus 9). Chip 56 x 64 pt: weekday ("Today", "Wed") over date number, class count under it ("14"). Selected = `NightSurface` fill with Sand text (Sand fill in dark). Past or beyond-window days stay visible, dimmed. Trailing 44 pt `calendar` button opens a `.medium` sheet with `DatePicker(.graphical)` limited to the window. [shared §7.5] [mobbin-ios §5 r1] |
| 3 | `ScheduleFilters` chip row | Chips: Category, Time, Intensity, Club. Each opens a `.medium` sheet. A "Filters" chip at the end opens the full `Form` sheet (section 5). [shared §7.7] |
| 4 | Count line | "14 classes · Gilbert – Val Vista" `.footnote`, `.updatesFrequently` not needed. [mobbin-ios §5 r19] |
| 5 | Sections | `Section("Early morning")` 4:30 to 7:59, "Morning" 8:00 to 11:59, "Midday" 12:00 to 3:59 p.m., "Evening" 4:00 p.m. on. Hide empty sections. |

Rows for classes that open later on the last window day read "Opens Tue 6:00 a.m." (bookings open at 6:00 a.m. on the opening day). [found §4]

### Row: `ClassCard` `schedule-row` (shared §7.1)
Reading order, left to right: time, title, instructor, spots, action. [mobbin-standard-pass §2 rule 61, rule 38, rule 24] Minimum height 72 pt.
1. **Stripe:** 4 pt, category fill, full row height.
2. **Time block**, 72 pt: "6:00 a.m." `.headline.monospacedDigit()`; "45 min" `.caption`, `TextMuted`.
3. **Main block:**
   - Line 1: class name `.headline` (up to 2 lines).
   - Line 2: `CategoryBadge` `sm` + `IntensityRibs` `sm` (tone `category`) + tag "First-timers welcome" (leaf icon, `StatusSuccess` text) when it applies + age chip "Teen OK" when it applies.
   - Line 3: instructor line: 32 pt avatar + "Marisol V. · Cycle studio" (+ " · Gilbert – Val Vista" when the list spans clubs). The avatar follows the title. [shared §7.1]
4. **Trailing block:** `CapacityIndicator` `ribs` ("4 bikes left"), then `BookingStateButton` (44 pt high, min width 96) under it, right-aligned. The spots text is the "price or credit" slot.
5. Row tap pushes Class detail. The button is a separate target. Swipe from the trailing edge: Book or Join waitlist. [shared §7.1]

### Examples (Gilbert – Val Vista, Thu Oct 29)
| Time | Class | Instructor | Room | Intensity | Spots | Button |
|---|---|---|---|---|---|---|
| 5:30 a.m. | Rib Rack Strength | Dev P. | Studio 2 | 4 | 6 spots left | Book |
| 6:00 a.m. | Climb Cycle | Marisol V. | Cycle studio | 4 | 4 bikes left | Book |
| 6:00 a.m. | Desert Flow Yoga | Tess O. | Studio 1 | 2 | 9 spots left | Book |
| 6:15 a.m. | Switchback HIIT | Andre W. | Studio 3 | 5 | Full · Waitlist 3 | Join waitlist |
| 7:00 a.m. | Climb Cycle | Marisol V. | Cycle studio | 4 | 11 bikes left | Book |
| 8:15 a.m. | Aqua Fit | Luis O. | Lap pool | 2 | 12 spots left | Book |
A class that is full but starts within 1 hour with a freed spot shows "Drop-in · 1 spot left" and "Book". [found §4]
Teen accounts see only classes flagged "Teen OK". Sauna + Plunge slots are hidden for under 18.

### SwiftUI composition
```swift
List {
    ForEach(vm.sections) { section in
        Section {
            ForEach(section.sessions) { s in
                NavigationLink(value: AppRoute.classSession(s.id)) {
                    ClassCard(session: s.summary, variant: .scheduleRow, surface: .ios)
                }
                .swipeActions(edge: .trailing) { RowPrimaryAction(s) }
                .accessibilityAction(named: "Book") { vm.book(s) }
            }
        } header: { Text(section.title) }
    }
}
.listStyle(.insetGrouped)
.scrollContentBackground(.hidden)
.background(Color.appBackground)
.safeAreaInset(edge: .top, spacing: 0) { BookHeader(...) }
.overlay { if vm.sections.isEmpty && !vm.isLoading { EmptyDay(...) } }
.refreshable { await vm.reload() }
```
Inside the row, the `BookingStateButton` uses `.buttonStyle(.borderless)` so the button and the link are separate targets. State comes from the shared `deriveBookingState`. [shared §8.1] The row is not a single `onTapGesture`. [skill:accessibility-voiceover-specialist]

### Toolbar
Trailing: Filters (`line.3.horizontal.decrease.circle`, filled when active, value "3 filters on"), My bookings (`ticket`).

### States
- Loading: 6 redacted rows.
- Empty day: `EmptyState` (`ContentUnavailableView`): "No classes Wed 28", "Gilbert – Val Vista has no classes that match. Try Thu 29." Buttons "Go to Thu 29", "Clear filters". [shared §10.1]
- Not yet open: rows dimmed, "Opens Tue 6:00 a.m.", button `notYetOpen` style disabled.
- Pause or failed payment: banner "New bookings are paused until Sat Oct 31. Kids club still works." Row buttons show `paused`.
- Frozen: buttons disabled "Frozen".
- Error: `ContentUnavailableView` "Can't load classes" + "Try again". Offline: cached list, banner "Showing saved schedule from 5:12 a.m."

### AX5
Time above name. Spots and button stack under the name, full width. Ribs hide visually; text "Intensity 4 of 5" shows. Day chips two lines (88 pt). Segments become a menu.

### Dark mode
Stripe colours use dark category fills. "Opens" and spots text use `TextMuted` / `StatusWarning` dark.

### VoiceOver
Row: "Climb Cycle, 6:00 a.m., 45 minutes, Marisol V., Cycle studio, intensity 4 of 5, 4 bikes left." Actions: Book, Join waitlist, Open details. Day strip chip: "Thursday October 29, 12 classes", `.isSelected`; adjustable.

```
+--------------------------------------+
| Book                  (filter)(ticket)|
| [Classes|Courts|Lanes|Kids club]     |
| Today Wed [Thu] Fri Sat Sun Mon (cal)|
|  27    28  [29]  30  31   1   2      |
|  9     12   14   11  7    8   10      |
| (Category)(Time)(Intensity)(Club)(F.)|
| 14 classes · Gilbert – Val Vista     |
| EARLY MORNING                        |
| ▌ 5:30 a.m. Rib Rack Strength        |
| ▌ 45 min   [Strength] ||||.          |
| ▌ (DP) Dev P. · Studio 2  6 spots left|
| ▌                         [  Book  ]  |
|--------------------------------------|
| ▌ 6:15 a.m. Switchback HIIT          |
| ▌ (AW) Andre W. · Studio 3   Full · 3 |
| ▌                   [Join waitlist]   |
+--------------------------------------+
```

---

## 5. Filters (sheet)

- **Purpose:** Narrow the schedule. [shared §7.7]
- **Presentation:** `sheet`, `.medium` for a single chip, `.large` for the full `Form`. Drag indicator visible.
- **Toolbar:** leading "Reset"; trailing primary "Show 14 classes" (live count, `.confirmationAction`). No Cancel: filters apply live. [shared §7.7] [apple §2]

### Full `Form`
| Section | Control |
|---|---|
| Club | `ClubSwitcher` `multi` (checkmark rows). Trailhead members see their home club; other clubs show a disabled row with the reason "Ridge only". |
| Category | 8 rows with category icon + name + check, in the fixed order Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, Recovery, Youth. |
| Time of day | Multiple toggles: Early (before 7 a.m.), Morning, Midday, Evening. |
| Intensity | Five-rib selector. Tap a rib to set a maximum. Label "Up to Hard". |
| Instructor | `NavigationLink` to a searchable list of `InstructorChip` rows. |
| Options | `Toggle` "Good for first-timers", `Toggle` "Spots open only", `Toggle` "My bookings". |
Filters stay when the day changes. They reset on a club change only if the filter does not apply to that club. States: results empty → footer "No classes match. Try fewer filters." VoiceOver: each toggle reads label and state; the live count is a polite announcement. AX5: standard `Form`.

---

## 6. Class detail (pushed page)

- **Purpose:** Decide and book in one place.
- **Question:** "Is this the right class for me, and what happens if I book or cancel?" [shared §7.2]
- **Presentation:** push (`.classSession`). Revision 1 used a sheet; the shared spec says the iOS variant is a pushed page, and ClassPass pushes it too. [shared §11.1] [mobbin-ios §2] On iPad regular width it fills the detail column of the Book split view.
- **View:** `ClassDetailPanel` variant `page`, plus the sticky bar.

### Layout (inside a `ScrollView`)
| # | Block | Detail |
|---|---|---|
| 1 | Hero | `ClassPhotoTile`, about 40 % of the screen height (min 220 pt, 160 pt at AX), pager "1/4" capsule. Top bar: back, share, favourite. A **solid Saguaro Night band at 80 %** across the bottom of the hero carries "with Marisol Vega · Thu, 6:00 a.m." in Sand. No other text on the photo. [shared §7.2] [mobbin-standard-pass §2 rule 39] |
| 2 | Status chip | Above the title, `info` style (`SurfaceMuted` fill, `TextPrimary`): "Teen OK", "Waiver required", "First-timers welcome", "Ages 16+" (strength floor without a coach). [mobbin-standard-pass §2 rule 42] |
| 3 | Title | `CategoryBadge` + "Climb Cycle" Archivo ExtraBold, 28 pt base, relative `.title`. No rating line (no public ratings). [found §4] |
| 4 | Instructor | `InstructorChip` `lg` (56 pt avatar) "with Marisol Vega" + credential "Cycle coach · RYT-200". Chevron → Coach profile. |
| 5 | Stats row | Three values with small-capitals labels: DURATION "45 min", INTENSITY `IntensityRibs` `lg` "Hard", SPOTS `CapacityIndicator` `large` "4" "bikes left". Labels use the eyebrow style, `TextMuted`. [mobbin-standard-pass §2 rule 56] |
| 6 | Facts | Two tappable rows: `calendar.badge.clock` "Thu, Oct 29 · 6:00–6:45 a.m."; `mappin` "Cycle studio · Gilbert – Val Vista" (chevron → Club detail). |
| 7 | Secondary buttons | "Add to calendar" and "Invite a friend" (`.bordered`, side by side; stacked at AX). "Invite a friend" opens a small sheet with a link field, "Copy link" and "Guest passes left this month: 1". If none left, the button is hidden and the text reads "Guest passes: 0 left this month". [shared §7.2] [mobbin-standard-pass §2 rule 36] |
| 8 | About | Description, SF `.body`, 60 words maximum: "Seated climbs and steady sprints on a 45-minute ride. Bring a towel. Cycling shoes are available to rent." Line "Good for first-timers". "What to bring" list. |
| 9 | Rules block | Next to the action. Cancellation: "Cancel free until 4:00 a.m. (2 hours before). After that, it counts as a late cancel." Waitlist: "If this class is full, the waitlist moves you up until 5:00 a.m. (1 hour before). You get a push and 30 minutes to confirm." Strike status when the member has 1 or more: "You have 1 late cancel in the last 30 days. 3 in 30 days pauses new bookings for 3 days." Times come from `bookingWindow`. [shared §7.2] [mobbin-ios §6 a5] |
| 10 | More | "Also this week": 3 `ClassCard` `compact` of the same class. |

### Sticky bar
`.safeAreaInset(edge: .bottom)`, height 64 pt plus safe area, `.background(.bar)`. Left cell: "Included with Ridge" over spots ("4 bikes left"). Right cell: `BookingStateButton` `lg` (`.glassProminent`, the one primary action). After booking: left reads "Booked ✓" (text, not colour only); right shows a grey outline "Cancel" and a "Manage" menu (Add to calendar, Cancel booking). [mobbin-standard-pass §2 rule 40] The label colour is forced to `BrandOnAccent`. [shared §8.1]

### Toolbar
Back (leading). Trailing: Share (`ShareLink`), Favourite (`heart`, `.sensoryFeedback(.selection)`).

### States
Default; booked (hero gets a `success` banner "You're booked · Thu 6:00 a.m."); waitlisted ("You're #3 on the waitlist"); promoted hold (banner "A spot opened. Confirm in 28:41." and `hold` button); full; cancelled by the club ("Marisol is out. We cancelled this class. Try 7:00 a.m."); started; ended (button "Give feedback"). Loading: "Checking availability" with inline `ProgressView`, never a full-screen loader. [mobbin-ios §6 a4] Error: "We could not load this class. Try again." Offline: button `Offline`.
Confirmation after booking: push `.bookingConfirmed` (section 7).
Cancel: opens the cancel sheet (section 13).

### AX5
Hero 160 pt. Stats row becomes a list of label–value pairs. Secondary buttons stack. Sticky bar stacks (availability above button); if taller than 30 % of the screen it scrolls with the page. [shared §7.2]

### Dark mode
Band stays Saguaro Night. Chips use `SurfaceMuted`. Rules block uses `StatusWarningSubtle` only inside 2 h of the cancel cutoff.

### VoiceOver
Hero pager "Photo 1 of 4". Title is a header. "Intensity 4 of 5, Hard." "Spots: 4 bikes left of 24." Bar button reads label and state. Rules block is read before the bar.

```
+--------------------------------------+
| <                       (share)(♡)   |
| [ hero photo (~40%)         1/4 ]    |
| [▓ with Marisol Vega · Thu, 6:00 a.m.▓]
| (Teen OK)                            |
| [Cycle] Climb Cycle                  |
| (MV) with Marisol Vega            >  |
| DURATION    INTENSITY      SPOTS     |
| 45 min      ||||. Hard     4 bikes   |
| Thu, Oct 29 · 6:00–6:45 a.m.         |
| Cycle studio · Gilbert – Val Vista > |
| [Add to calendar] [Invite a friend]  |
| About ... What to bring ...          |
| Cancel free until 4:00 a.m. ...      |
| Waitlist moves you up until 5:00 ... |
|--------------------------------------|
| Included with Ridge   |  [  Book  ]  |
| 4 bikes left          |              |
+--------------------------------------+
```

---

## 7. Success views (booking, waitlist, reservation)

- **Purpose:** Prove it worked. Offer the next step. One pattern for every success screen. [shared §7.2] [shared §1 principle 12] [mobbin-standard-pass §2 rules 44, 45, 46, 62]
- **Presentation:** push `.bookingConfirmed(BookingID)` on top of Class detail. Back is hidden. Trailing "Done" pops to the list.

### Layout (24 pt gaps)
1. One green check (`checkmark.circle.fill`, 64 pt, `StatusSuccess`) with `.symbolEffect(.bounce)` (off under Reduce Motion).
2. Headline "You're booked" (`.title.bold`).
3. Green "Confirmed" pill (check icon + word) above the date.
4. Summary card: class name, date and time, club, room, instructor, `IntensityRibs`, line "Free cancel until 4:00 a.m."
5. One full-width filled button "Add to calendar" (`.glassProminent`). Under it a text link "Share". [mobbin-standard-pass §2 rule 46]
6. Four action rows: Add to calendar, Get directions, Call the club (`tel:` (480) 555-0142), Club details. [mobbin-standard-pass §2 rule 44] When a guest pass is used add "Share guest link".
7. Toggle row "Show on Lock Screen" (Live Activity) with "Appears 1 hour before class."
8. "Done" in the toolbar.

**Waitlist variant:** headline "You're on the waitlist, #4" (same green check); pill "On waitlist"; summary; lines "We'll tell you if a spot opens. We can offer you one until 4:30 p.m."; buttons "Done" (toolbar) and "Leave waitlist" as a text button; no calendar button.
**Reservation variant (court, lane, kids club):** headline "Court 3 is yours" / "Lane 4 is yours" / "Mia and Eli are booked"; rows add "Invite a partner" (courts) or "Show pass" (kids club).
**Freeze and guest pass** reuse items 1, 2, 3 and 8.

Haptic `booked` on appear (`waitlisted` for the waitlist variant). On appear, focus moves to the headline and VoiceOver announces "Booked. Climb Cycle, Thursday 6:00 a.m." AX5: scroll, buttons stack.

```
+--------------------------------------+
|  Confirmed                      Done |
|              (✓)                     |
|        You're booked                 |
|            [✓ Confirmed]             |
|  +--------------------------------+  |
|  | Climb Cycle           ||||.     |  |
|  | Thu, Oct 29 · 6:00–6:45 a.m.   |  |
|  | Cycle studio · Val Vista       |  |
|  | Free cancel until 4:00 a.m.    |  |
|  +--------------------------------+  |
|  [      Add to calendar         ]    |
|            Share                     |
|  Add to calendar              >      |
|  Get directions               >      |
|  Call the club                >      |
|  Club details                 >      |
|  Show on Lock Screen         (on)    |
+--------------------------------------+
```

---

## 8. My bookings

- **Purpose:** See, change and cancel everything I booked.
- **Question:** "What have I booked and what did I miss?"
- **Route:** `.myBookings` (push from Today, Book or You).

### Layout (`List`, `.insetGrouped`)
1. Segmented `Picker` in the first row (clear background): "Upcoming | Past".
2. Banner rows (only when relevant): hold card with `BookingStateButton` `hold`; strike banner "1 strike in the last 30 days. 3 strikes pause new bookings for 3 days."; line "Waitlists: 2 of 5".
3. Upcoming sections by day: "Today", "Thu, Oct 29", "Sat, Oct 31". A section "Waitlist" comes first when a hold exists.
4. Row: `ClassCard` (schedule-row) for classes; for courts, lanes and kids club a `ReservationRow` that uses the same grid: time column, category bar (Court gold / Aqua teal / Youth pink), title ("Pickleball · Court 3"), club, trailing status.
5. Trailing: the `BookingStateButton` state in compact form ("Booked ✓", "On waitlist #2", "Confirm spot · 24:10") or text ("With Linda", "Mia + Eli"). Personal training sessions show as 45-min rows (Summit intro 30 min).
6. Footer of the list: "Strikes" row with `info.circle` and detail push (explainer in plain text with the 2-h and 3-strike rules).

Past tab rows show a chip with icon and word: "Attended" (`StatusSuccess`), "Missed · late cancel" (`StatusWarning`; a no-show counts as a late cancel), "Cancelled" (`TextMuted`), "Late cancel" (`StatusWarning`). Swipe leading: "Book again". Row action "Give feedback" opens the private feedback sheet (three choices, optional note, "Only the club sees this."). No stars.

### Example
| Section | Row |
|---|---|
| Today | 6:00 a.m. Climb Cycle · Val Vista · Booked |
| Thu, Oct 29 | 6:00 a.m. Climb Cycle · Val Vista · Booked |
| Sat, Oct 31 | 8:00 a.m. Kids club · Val Vista · Mia + Eli |
| Waitlist | Wed 5:30 p.m. Rib Rack Strength · Downtown · On waitlist #3 |

### Actions
Swipe trailing: Cancel (opens the cancel sheet, section 13.2). Swipe leading: Add to calendar. Context menu: Open, Add to calendar, Share, Cancel. `.accessibilityAction(named: "Cancel booking")`. All of them also sit on the Class detail page. [apple §6 other inputs]

### SwiftUI
`List` with `.swipeActions`; swipe and menu call `router.presentedCancel = CancelRequest(booking:)`. The cancel sheet replaces `confirmationDialog` for booking cancels because it must list consequences. [shared §7.2] Use `Booking.id` for `ForEach`. [skill:swiftui-specialist]

### Toolbar
Trailing: "Edit" is not used. No toolbar items except Back.

### States
- Empty upcoming: `EmptyState` `no-bookings` (`ContentUnavailableView`, symbol `cp.ribs.empty`): "No classes booked yet" / "Pick a class and we'll save your spot." / "Book a class". [shared §10.1] [mobbin-ios §6 a14]
- Empty past: "No past visits yet."
- Loading: 4 redacted rows. Error and offline: cached list and banner.
- Paused: banner with the end date. Kids club, PT, check-in and cancelling still work.

### AX5 / Dark / VoiceOver
- AX5: time stacks above the title; status text moves under the title.
- VoiceOver row: "Climb Cycle, Thursday October 29, 6:00 a.m., Gilbert – Val Vista, booked." Actions: Cancel booking, Add to calendar.

```
+--------------------------------------+
| <  Bookings                          |
| [ Upcoming | Past ]                  |
| ! 1 strike in 30 days. 3 pause new   |
|   bookings for 3 days · Waitlists 2/5|
| WAITLIST                             |
| Wed 5:30p Rib Rack Strength   #3     |
| TODAY                                |
| 6:00a ▌Climb Cycle · Val Vista Booked|
| THU, OCT 29                          |
| 6:00a ▌Climb Cycle · Val Vista Booked|
| SAT, OCT 31                          |
| 8:00a ▌Kids club · Mia + Eli         |
| (i) How strikes work                 |
+--------------------------------------+
```

---

## 9. Clubs: map and list

- **Purpose:** Find the right club and see how busy it is.
- **Question:** "Which club is near me, what does it have, is it busy?" [found §6 p2]
- **Route:** Clubs root. Layout follows the shared `ClubMap` iOS anatomy. [shared §6.6]

### Layout
1. Full-bleed `Map` with a **search pill** at the top ("City or ZIP") and a row of filter chips under it: "Open now", "Pool", "Courts", "Kids club", "Recovery" (`AmenityChip` `filter`, 44 pt targets). [mobbin-standard-pass §2 rule 57] [mobbin-ios §5 r19]
2. **Bottom sheet** (persistent) with three detents: collapsed (`.height(56)` grab strip with "5 clubs in map area"), `.medium` (list), `.large`. The map stays interactive at collapsed and medium (`presentationBackgroundInteraction(.enabled)`). Details in `01` section 3.5.
3. Sheet content: the count line "5 clubs in map area" (or "3 clubs in map area" with a filter), then `ClubCard` `list-row` rows (88 pt: 96 x 72 photo, name, `OpenStatus`, distance, `BusynessMeter` `compact`, chevron).
4. Pin tap: select the club, centre the map, raise the sheet to a `ClubCard` `map-callout` (280 wide: 2:1 photo, name, `OpenStatus`, today's hours, `BusynessMeter` `inline`, "Directions" and "Open club"). [mobbin-ios §5 r21]
5. Search pill: geocodes a place or ZIP and moves the map. It does not search content (that is the Search tab).
6. `MapUserLocationButton` in `.mapControls`.

### `ClubPin`
Rounded rectangle (radius 10, 32 pt high, 8 pt point) with the club short name (`.caption.weight(.semibold)`) and `BusynessMeter` `compact` (28 x 16). Default: `Surface` fill, 1 pt `BorderStrong` edge. Selected: `NightSurface` fill, Sand text, 2 pt `BrandAccent` outline. Home club: small `house` before the name. Closed: `TextMuted` text and "Closed" after the name, ribs hidden. Overlapping pins form a 40 pt cluster circle with a count. Target 44 x 44 pt. [shared §6.6] Use a calm, muted map style so the 3.48:1 pin edge stays visible. (The shared spec's iOS build note also allows a native `Marker` with busyness only in the sheet; the pin anatomy above is the primary choice.)

### SwiftUI
```swift
Map(position: $camera, selection: $selectedClub) {
    ForEach(vm.clubs) { club in
        Annotation(club.shortName, coordinate: club.coordinate, anchor: .bottom) {
            ClubPin(club: club, isSelected: club.id == selectedClub)
        }.tag(club.id)
    }
    UserAnnotation()
}
.mapControls { MapUserLocationButton() }
.sheet(isPresented: $showClubSheet) { ClubsSheet(...)
    .presentationDetents([.height(56), .medium, .large], selection: $detent)
    .presentationBackgroundInteraction(.enabled)
    .interactiveDismissDisabled() }
```
`Map`, `MapCameraPosition`, `MapUserLocationButton` named in [apple §5]. `Annotation`, `UserAnnotation`, `Map(selection:)` and custom detent heights are `[UNVERIFIED]`. `[UNVERIFIED]` tab bar reachability under a persistent sheet. Fallback: a paged `ClubCard` `compact` carousel above the tab bar.

### Toolbar
None. The nav bar is hidden over the map; controls sit on the map.

### States
- Loading: map shows; list redacted.
- Filter with no match: `EmptyState` "No club has all of those" + "Clear filters".
- Location denied: the location control shows "Location is off"; ZIP search works.
- Offline: map tiles may fail; the list works; banner.
- Never a map without a list. [mobbin-ios §6 a10]

### AX5
Chips wrap to two lines. Sheet opens at `.medium`. List rows stack photo above text. Pins keep size; labels scale.

### VoiceOver
Map element: "Map of 5 clubs. Use the club list." Pin: "Mesa – Dobson, Quiet, open until 10 p.m." The sheet list is the main path. Sheet detent change is announced by the system.

```
+--------------------------------------+
|  [ (Q) City or ZIP               ]   |
|  (Open now)(Pool)(Courts)(Kids)(Rec.)|
|   [map]                       (⌖)    |
|     [Red Mtn ▮▮▯▯▯]                  |
|   [Dobson ▮▯▯▯▯]    [Downtown ▮▮▮▯▯] |
|        [Val Vista ▮▮▮▯▯] [Heritage]  |
|======================================|
|  ———                                 |
|  5 clubs in map area                 |
|  [photo] Mesa – Dobson               |
|          Open until 10 p.m. · 2.1 mi |
|          ▮▯▯▯▯ Quiet            >    |
+--------------------------------------+
| (Today)(Book)(Clubs)(You)   (Search) |
+--------------------------------------+
```

---

## 10. Club detail

- **Purpose:** Show the club as a real place: photos, live busyness, hours, amenities, classes, coaches.
- **Question:** "Is this club right for me, and is it busy now?"
- **Route:** `.club(ClubID)`.

### Layout (`ScrollView` + `LazyVStack`, 24 pt gaps)
| # | Section | Component and content |
|---|---|---|
| 1 | Hero | `ClubHero`: photo pager (4 photos, pager dots, "1/4"), 260 pt (180 at AX). Club name Archivo ExtraBold 30 (relative `.largeTitle`) and personality line in Sand on a solid Saguaro Night band at 80 %. Chip: `BusynessMeter` `inline`. [shared §6.2] [mobbin-ios §4.6] |
| 2 | Quick facts | Row: "Open until 10:00 p.m." (green dot, `success`), "2.1 mi", "Desk staffed 6 a.m. to 8 p.m." Wraps at AX. [mobbin-ios §5 r16] |
| 3 | Live now | Card: `BusynessMeter` `card` (`RibMeter` `md` + "Steady now" + "Usually busier at 5:30 p.m." + "Updated 5:35 a.m."). `PopularTimesChart` full: day `Picker(.segmented)` with single-letter labels M T W T F S S and full-day accessibility labels (menu at AX), 18 bars, "Now" marker, caption "Usually quiet before 7 a.m. Busiest 5 to 7 p.m." [shared §6.5] |
| 4 | Hours | `HoursTable` `today` line "Open today · 4:30 a.m.–10 p.m."; the button "Open until 10 p.m." opens the Hours sheet (section 11). |
| 5 | Amenities | `AmenityChip` flow layout (`FlowLayout: Layout`). Val Vista: "25-yd lap pool", "Splash pad", "Swim school", "2 basketball courts", "4 pickleball courts", "Recovery suite", "3 studios", "Cycle studio", "Kids club". |
| 6 | Today at this club | Horizontal `ClassCard` (compact), 6 items, then "See full schedule" (switch to Book tab with this club). |
| 7 | Reserve | Rows only for what exists: "Courts" (pickleball, basketball), "Lap lanes" ("6 lanes" at Val Vista), "Kids club" ("Ages 6 months to 12 years"). Each → `.reserve(kind, club)`. Downtown and Heritage hide courts, lanes and kids club. [found §2, §4] |
| 8 | Coaches | Horizontal `CoachCard` (6), "See all" → `.coachList(club)`. |
| 9 | Location | `ClubMap` (static `Map` 180 pt, non-interactive), address "Val Vista Dr & Warner Rd, Gilbert", `Button("Directions")`. Phone and email rows. |
| 10 | Home club | Row "Set as home club" (checkmark if already). Trailhead: confirm text "You can change your home club once per billing cycle." [found §4] |

Bottom bar: "Directions" `.glass` and "Book here" `.glassProminent` (switches to Book tab with `club` filter).

### Toolbar
Back. Trailing: Share, Favourite (`heart`).

### Club data (sample, from foundation)
| Club | Hero line | Amenities highlight |
|---|---|---|
| Mesa – Dobson | "The big one. Bring the whole family." | 25-yd lap pool (8 lanes), warm-water therapy pool, 4 pickleball + 2 tennis, recovery suite, 3 studios + cycle, kids club, café |
| Mesa – Red Mountain | "Sunrise over the Superstitions, every morning." | Outdoor 25-m pool with shade sails, 6 pickleball, turf lane, 2 studios + cycle, kids club |
| Mesa – Downtown | "In and out before your 8 a.m." | Strength floor, 2 studios, cycle, recovery lounge. No pool, courts or kids club |
| Gilbert – Val Vista | "Swim school, courts, and a kids club that kids ask for." | Lap pool, splash pad, swim school, 2 basketball, 4 pickleball, recovery suite, 3 studios + cycle, kids club |
| Gilbert – Heritage | "Lifting platforms and a rooftop at golden hour." | Strength floor, Olympic lifting platforms, 2 studios, cycle, recovery lounge, rooftop mobility deck |

### States
Loading: hero grey, rest redacted. Error: `ContentUnavailableView("Can't load this club")`. Offline: cached club info stays; the "Live now" card shows "Offline. Last known level: Steady at 5:35 a.m." Closed: ribs hidden, "Closed · opens 4:30 a.m."; stale data: dashed outline ribs and "Busyness unavailable. Last update 22 min ago." [shared §5.3] Pool closed: Amenities chip "Pool closed today" (`warning`).

### AX5 / Dark / VoiceOver
- AX5: hero 180 pt; facts stack; chips wrap; horizontal rows keep scrolling.
- Dark: the Saguaro Night band stays; card surfaces dark.
- VoiceOver: hero "Photos of Gilbert – Val Vista, 4 photos, swipe up or down to change." Live card: "Busyness Steady, 3 of 5. Updated 5:35 a.m." Chart uses the descriptor (see `05`).

```
+--------------------------------------+
| <                           (share)(♡)|
| [ photo carousel         1/4 ]       |
| Gilbert – Val Vista        [|||.. Steady]
| Swim school, courts, and a kids ...  |
| ● Open until 10 p.m. · 2.1 mi        |
| +--- Live now ---------------------+ |
| | |||..  Steady   Updated 5:35 a.m.| |
| | ▁▁▂▅▇█▆▅▃▃▂▂▁  Now ▲             | |
| +----------------------------------+ |
| Hours  Mon–Fri 4:30a–10p   All hours>|
| [Lap pool][Splash pad][Swim school]..|
| Today at this club ->                |
| Reserve: Courts > Lap lanes > Kids >|
| Coaches ->                           |
| [map]  Val Vista Dr & Warner Rd      |
|--------------------------------------|
| [ Directions ]       [ Book here ]   |
+--------------------------------------+
```

---

## 11. Club hours (sheet)

- **Purpose:** Show all hours without guessing.
- **Question:** "When can I come, when is the desk open, when does the pool close?"
- **Presentation:** `sheet(item: $router.presentedHours)`, `.medium`, drag indicator visible, trailing "Done". Opened from the "Open until 10 p.m." button on Club detail and from the Clubs `map-callout`. [shared §6.4]

### Layout (`List`, `.insetGrouped`)
1. `Section("Hours")`: `HoursTable` `week`, seven `LabeledContent` rows (day, hours in SF `.monospacedDigit()`). Today row: semibold, "Today" tag, `StatusSuccess` dot before open days, plus "Open now" when open. Mon to Fri 4:30 a.m.–10:00 p.m.; Sat and Sun 6:00 a.m.–8:00 p.m. [mobbin-ios §5 r15, r16]
2. `Section("Desk staffed")`: "6:00 a.m.–8:00 p.m." Footnote "Door readers work whenever the club is open."
3. `Section("Kids club")` (clubs with one): "Mon–Sat 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m." and "Ages 6 months to 12 years." [found §4]
4. `Section("Pool")` (clubs with one): "Closes 30 minutes before the club."
5. `Section("Holiday hours")`: server rows, hidden when empty. Example "Thanksgiving, Nov 26: 6:00 a.m.–2:00 p.m."
6. Footer button "Call the club" (`tel:` (480) 555-0142).

States: Loading redacted. Error: "We could not load hours. Call the club." with the phone link. Closed now: "Closed · opens 4:30 a.m." VoiceOver: "Monday, 4:30 a.m. to 10 p.m." with "Today" on the current row. AX5: day above hours.

---

## 12. Reserve: courts, lanes, kids club

- **Purpose:** Pick a time and reserve a court, a lane or a kids club block.
- **Question:** "What is free, and when?"
- **Route:** Book root, segments 2 to 4. Also `.reserve(kind, club)` pushed from Club detail.
- **Component:** `ReservationSlotGrid` (iOS list form, `blocks` for kids club). [shared §8.2]

### Shared layout
1. Segment picker and `ScheduleDayStrip`. Courts: today plus 3 days. Lanes and kids club: the class window. Caption "Arizona time". [shared §8.2] [gaps r23]
2. Club chip (opens the ClubSwitcher sheet, `single`). Courts: Mesa – Dobson, Mesa – Red Mountain, Gilbert – Val Vista. Lanes: the same three. Kids club: the same three. Other clubs show a disabled row with the reason "No courts here". [found §2]
3. Object chips. Courts: "Pickleball", "Tennis" (Mesa – Dobson only), "Basketball" (Gilbert – Val Vista only). Lanes: "Lap pool", plus "Warm-water pool" at Mesa – Dobson (a class-like Aqua row, not a lane). Kids club: none.
4. **`DurationChips`** (courts only): "60 min | 90 min". Segmented chips, selected chip filled `NightSurface` with Sand text, 44 pt tall. [shared §8.2] [mobbin-standard-pass §2 rule 60] Lanes show "45 min" as fixed text. Kids club shows "2 hours".
5. Rule line (`.footnote`) always visible:
   - Courts: "60 or 90 minutes. Book up to 3 days ahead. 1 court a day, 2 active at most. Included with Ridge and Summit."
   - Lanes: "45-minute slots. Pool closes 30 minutes before the club. Up to 2 swimmers share a lane."
   - Kids club: "Ages 6 months to 12 years. 2-hour blocks. Up to 2 blocks per child a day. You check in at the same club."
6. Slot area, AM and PM `Section`s.

### Slot rows (courts and lanes)
One `List` row per start time (courts every 30 min, lanes every 45 min). Row: start time `.headline.monospacedDigit()`, then the free resources as text and count: courts "Courts 1, 3, 4 open"; lanes "5 of 8 lanes open". Chevron. Lane rows with room to share show "1 of 2 swimmers" on the lane name in the sheet. Taken rows stay visible: dimmed, "Full". Past rows: dimmed. Selected row: `.isSelected` and a `BrandAccent` outline. Tapping a row opens the Reserve sheet. [shared §8.2] [mobbin-ios §5 r12, r13]
Optional four-column chip grid for many slots with short labels ("8:00"): the selected chip is outlined and a total line sits under it ("Court 3 · 90 min · Included with Ridge"). [mobbin-standard-pass §2 rule 59] Do not use it with long labels. [mobbin-ios §6 a11]
Kids club `blocks`: four fixed 2-h cards: 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. Each card: `CapacityIndicator` (`ribs`), "6 spots left"; low = `StatusWarning` text with icon; full = "Full" and a "Join waitlist" button (kids club blocks have a waitlist). Sunday chip says "Closed".

### Examples
Courts at Mesa – Red Mountain, Thu Oct 29, pickleball, 6 courts, 90 min:
| Start | Row text |
|---|---|
| 7:00 a.m. | Court 2 open |
| 8:00 a.m. | Courts 1, 3, 4 open |
| 9:00 a.m. | Courts 1, 2, 3, 5, 6 open |
Lanes at Mesa – Dobson, Wed Oct 28: 9:15 a.m. "5 of 8 lanes open"; 10:00 a.m. "3 of 8 lanes open · 2 lanes with 1 of 2 swimmers".
Lane counts: Mesa – Dobson 8, Mesa – Red Mountain 8 (25 m outdoor), Gilbert – Val Vista 6. [found §4]
Kids club at Gilbert – Val Vista, Sat Oct 31: 8:00–10:00 a.m. 6 spots left; 10:00 a.m.–12:00 p.m. 11; 4:00–6:00 p.m. 14; 6:00–8:00 p.m. 14.

### Restricted and empty states
- Trailhead on Courts: the segment shows `BookingStateButton` `restricted` ("Ridge only") and an `EmptyState` "Courts come with Ridge" with "See plans". [shared §8.1]
- Club with no courts: `EmptyState` "No courts at Mesa – Downtown" with buttons to the three clubs that have them.
- Lap lanes full: row `full` with the reason "Lap lanes have no waitlist. Try 10:00 a.m." [found §4]
- Court limit: "You already have a court on Thu. One a day." / "You have 2 active court reservations."
- Pause: rows `paused`. Kids club is not paused.
- Teen: courts and lanes show `restricted` "Ask a parent to turn on courts" unless the parent toggle is on (lanes from age 14).
- Pool closed: `EmptyState` "Lap pool closed today".
- Loading: redacted rows "Checking availability". Error: banner "We could not load courts. Try again."
- Day beyond window: hint "Courts can be booked 3 days ahead." [mobbin-ios §5 r14]

### Toolbar / AX5 / VoiceOver
Same toolbar as Book (Filters hidden for these segments). AX5: rows stack; `DurationChips` become a menu. Row reads "8:00 a.m., courts 1, 3 and 4 open". `DurationChips` is adjustable.

```
+--------------------------------------+
| Book                          (ticket)|
| [Classes|[Courts]|Lanes|Kids club]    |
| Today Wed [Thu] Fri   (cal)  Arizona  |
| (Red Mountain v) (Pickleball)(Tennis) |
| Duration  [ 60 min |■90 min■ ]        |
| Courts: 60 or 90 min. Up to 3 days.   |
| MORNING                              |
| 7:00 a.m.   Court 2 open          >  |
| 8:00 a.m.   Courts 1, 3, 4 open   >  |
| 9:00 a.m.   Courts 1, 2, 3, 5, 6  >  |
| AFTERNOON ...                        |
+--------------------------------------+
```

---

## 13. Reserve sheet, cancel sheet, waitlist sheet

### 13.1 Reserve sheet
- `sheet(item: $router.presentedReserve)`, `.medium` and `.large`, `presentationBackgroundInteraction(.enabled(upThrough: .medium))`. Cancel leading. [apple §2]
- **Hold banner** at the top while the member checks out: "Holding Court 3 for 4:52" with a text button "Add 5 minutes" (once). When the hold ends: "Your hold ended. Pick the time again." Haptic `error`. The hold applies to courts and kids club slots. [found §4]

**Courts:** summary "Pickleball · Thu Oct 29 · Mesa – Red Mountain"; `DurationChips`; court `Picker` (`.pickerStyle(.inline)`) with "Any court" selected by default and only free courts enabled; line "Add a partner after you reserve"; line "Included with Ridge"; line "Free cancel until 6:00 a.m. Later is a late cancel." Button "Reserve Court 3" (`.glassProminent`).
**Lanes:** summary; lane `Picker` inline: "Any lane" (default), Lane 1 to 8 (Dobson), each with "1 of 2 swimmers" where it applies; fixed "45 min"; cancel line; button "Reserve lane".
**Kids club (`.large`):** child list with checkmarks (children aged 6 months to 12 years); optional allergies note (140 characters); line "Mia and Eli: 1 block each. Up to 2 blocks per child a day."; line "Check in at Gilbert – Val Vista by 8:15 a.m. or we release the block."; no strike text ("Kids club has no strikes"); button "Reserve 2 spots".
**PT intro (from Coach profile):** `ReservationSlotGrid` `list`, AM and PM groups, green dot; coach picker as `InstructorChip` `choice` row with availability "Available 8 a.m.–8 p.m." [shared §8.2] [mobbin-standard-pass §2 rules 23, 37]

Errors: slot taken "Someone just took that time. Courts 1 and 4 are open at 8:00 a.m." (open rows highlighted); court limit; teen not allowed. Offline: "Offline" disabled.
After success: push the success view (section 7, reservation variant).

### 13.2 Cancel sheet
- `sheet(item: $router.presentedCancel)`, `.medium`. Used for class, court, lane, kids club and PT cancels. [shared §7.2] [mobbin-standard-pass §2 rules 26, 27, 28, 43]
- Layout: bold question "Cancel Climb Cycle?" (`.title3.bold`); the class name and time in small capitals ("CLIMB CYCLE · THU 6:00 A.M."); consequence block; stacked buttons: **"Keep my spot"** (filled, `.glassProminent`, full width), **"Reschedule instead"** (outline, only when the same class runs again this week; opens the day list filtered to it), **"Cancel booking"** (quiet `StatusDanger` text button).
- Free cancel copy: "You can rebook until it fills." Then the optional "Why are you cancelling?" radio list: Schedule changed, Feeling unwell, Booked by mistake, Other reason (text box appears). Never required.
- Late cancel copy: lines with a red X icon and words: "Counts as a strike (2 of 3 in 30 days)", "Your spot goes to the next person on the waitlist", and on the third strike "New bookings pause for 3 days, until Sat Oct 31". (`xmark.circle.fill` is paired with the text.)
- Kids club: "Kids club has no late-cancel strikes." PT: "Free until Wed 8:00 a.m. (24 hours before)." No-show note on My bookings: "A no-show counts as a late cancel."
- Haptic `released` (free) or `lateCancel`. The sheet closes after the result; a toast confirms with Undo (8 s) for free cancels.

### 13.3 Waitlist sheet
- `sheet(item: $router.presentedWaitlist)`, `.medium`. Title "Join the waitlist for Rib Rack Strength". Body: "You are 4th in line. If a spot opens, we hold it for you until 4:30 p.m. (1 hour before). You get a push and 30 minutes to confirm. Late cancels count as strikes." One `Toggle`-style checkbox "I understand the late-cancel rule." Primary "Join waitlist" (full width, disabled and grey until ticked). Link "Pick another class". If the member has 5 active waitlists: replace the form with "You are on 5 waitlists. Leave one to join another." [shared §8.1] [found §4] [mobbin-standard-pass §2 rule 47] [gaps r3, r4]

---

## 14. Check-in pass

- **Purpose:** Get through the door fast.
- **Question:** "How do I get in?" [shared §9.3] [mobbin-ios §5 r22]
- **Presentation:** `sheet(item: $router.presentedPass)`, `.large` only, drag indicator hidden, trailing "Done". No timers. [apple §6]
- **Component:** `CheckInPass` `full`. Flow: `02` flow 3.

### Layout (`ScrollView`)
| # | Block | Detail |
|---|---|---|
| 1 | Pass card | **Night-surface** card (Saguaro Night, Sand text, same in light and dark), radius 28, padding 24, never glass. Header: reversed wordmark and a plan badge "Ridge" in Dawn Copper. Name "Maya Lopez" Archivo 600 24 pt (relative `.title2`). Eyebrow "MEMBER NUMBER". Number "0042 1187" Archivo Bold 36 pt (relative `.largeTitle`), tabular, real text. QR on a **pure white** rounded square (radius 10), 280 pt with a 16 pt quiet zone. Caption "Scan at the front desk". Line "Checking in at Gilbert – Val Vista" with a "Change" link (opens the ClubSwitcher sheet). [shared §9.3] [mobbin-ios §5 r22] [gaps r12, r14] |
| 2 | State strip | Only when not valid: neutral pill (pause icon) "Frozen until Feb 19"; or `StatusDanger` text "Payment failed. Update your card."; or "See the front desk." with a call button; or "3-day pass · 2 days left". Copy in `02` flow 3. |
| 3 | Wallet | `PKAddPassButton`, full width, directly below the card; system black style in light, white in dark. "Maybe later" text link on the first visit only. Hidden when the pass is in Wallet. [shared §9.3] [mobbin-standard-pass §1 search 9: non-gym evidence] |
| 4 | Kids club today | Only with a block today: "Kids club today: Mia · 4:00–6:00 p.m." and "Show this pass at the kids club desk." Parent checks in at the same club. [found §4] |
| 5 | Club | `BusynessMeter` `inline` "Gilbert – Val Vista · Steady". |
| 6 | More | Rows "Guest pass" and "Pass settings". |

The code ring (2 pt `TextMuted` ring that counts 60 s) is decorative. Reduce Motion: static ring with text "Refreshes every minute". Hidden from VoiceOver.

### Brightness
On appear: store the scene's screen brightness, set 1.0. On disappear and when `scenePhase != .active`: restore. `UIScreen.main` is deprecated; use the window scene's screen. `[UNVERIFIED]` exact API on iOS 27. Also `isIdleTimerDisabled = true` while visible. Brightness boost is a proposal; research did not observe it. [shared §11.3 item 11]

### Variants
`full` (this sheet), `compact` (Today shortcut: name, number, club, "Show pass", no QR), `wallet-preview` (Membership), `guest` (guest landing, web), `teen` (Jordan; the parent sees "Teen pass" in Family). [shared §9.3]

### States
Valid; checked in (green check, "Checked in · 5:43 a.m."); frozen; payment failed (day 1–7 works; day 8–14 works with banner; day 15+ "See the front desk"); closed; wrong club (Trailhead); trial; offline (cached code, "Offline code"); rejected; expired code ("This code expired. Pull down to refresh." plus a visible "Refresh code" button). Loading: card shows the cached code at once; no cache: redacted QR and "Getting your pass…". Error: "We could not refresh your code. The last code still works if it scans. Show your member number if it does not." [shared §9.3]

### AX5 / Dark / VoiceOver
- AX5: the QR stays 280 pt (never below 240). Name and number scale. Page scrolls.
- Dark: card unchanged (night surface). QR frame stays white.
- VoiceOver: "Check-in pass. Maya Lopez. Ridge. Member number 0 0 4 2, 1 1 8 7." QR: label "Check-in code for Maya Lopez. Show it to the scanner at the front desk." After a scan: "Checked in at 5:43 a.m."

```
+--------------------------------------+
|                                 Done |
| +----------------------------------+ |
| |  CACTUS PEAK ATHLETIC     [Ridge]| |  night surface
| |  Maya Lopez                      | |
| |  MEMBER NUMBER                   | |
| |  0042 1187                       | |
| |   +--------------------------+   | |
| |   |  ██ QR (white square) ██ |   | |
| |   +--------------------------+   | |
| |   Scan at the front desk         | |
| |   Checking in at Val Vista Change| |
| +----------------------------------+ |
|  [   Add to Apple Wallet   ]         |
|  Kids club today: Mia · 4:00–6:00 p.m|
|  Gilbert – Val Vista  ▮▮▮▯▯ Steady   |
+--------------------------------------+
```

---

## 15. Progress

- **Purpose:** Show that showing up adds up.
- **Question:** "Am I keeping my streak, and how am I doing this month?" [mobbin-ios §4.9]
- **Route:** `.progress`. Entry: Today week cards, You.
- **Charts:** Swift Charts. Split each chart into its own view to keep type-checking fast. [skill:swiftui-whats-new-27]

### Layout (`ScrollView`)
| # | Block | Detail |
|---|---|---|
| 1 | Summary | `VisitStreak` `month` hero: the count large in Archivo ("6") with "weeks in a row" and the leaf icon, above the month calendar. [mobbin-standard-pass §2 rule 53] Longest streak "Best: 11 weeks". `ProgressRibs` `hero` for this week: "2 of 3 visits", tick under the goal rib. Goal stepper "Weekly goal: 3" (`Stepper` in a sheet, 1 to 5). |
| 2 | Visits per week | `Chart` of `BarMark` (x: week start, y: visits), 12 weeks, `RuleMark(y: goal)` dashed with label "Goal 3". Bars in `BrandAccent`; bars at or above goal get a check annotation. Range `Menu` in the toolbar: 4 weeks, 12 weeks, 1 year. |
| 3 | What you do | Horizontal `BarMark` by category (classes attended, 12 weeks). Each bar: category colour + category icon + name + number label at the end (never colour only). Example: Cycle 14, Strength 9, Mind & Body 4. |
| 4 | Week strip and month calendar | `VisitStreak` week strip (seven dots Mon to Sun; check = visited; no X on missed days, no shame). Below it a month `Grid`: ring around days with a visit, dot for a class. Tapping a day lists that day's visits. [shared §9.4] |
| 5 | Totals | 2x2 stat tiles: "Visits 38", "Classes 31", "Favourite class: Climb Cycle", "Favourite club: Val Vista". (Hours in club are not shown because check-out is not tracked.) |
| 6 | Optional | Card "Add workouts from Apple Health" (HealthKit read of workouts). Shows only if not connected. `[UNVERIFIED]` HealthKit not researched. Not in v1 launch scope. |

Streak rule: a streak week meets the member's weekly visit target (default 3). One rest week is forgiven per 10 weeks. Weeks run Monday to Sunday. [found §4] No flame icon; the streak uses a leaf. [brand guide §6]

### SwiftUI
```swift
struct VisitsChart: View {
    let weeks: [WeekVisits]; let goal: Int
    var body: some View {
        Chart {
            ForEach(weeks) { w in BarMark(x: .value("Week", w.start, unit: .weekOfYear),
                                          y: .value("Visits", w.count))
                .foregroundStyle(Color.brandAccent) }
            RuleMark(y: .value("Goal", goal)).lineStyle(StrokeStyle(dash: [4,3]))
                .annotation(position: .top, alignment: .leading) { Text("Goal \(goal)").font(.caption) }
        }
        .chartYScale(domain: 0...7)
        .accessibilityChartDescriptor(VisitsDescriptor(weeks: weeks, goal: goal))
        .frame(height: 180)
    }
}
```
Chart height uses `@ScaledMetric` base 180 so it grows with text. `[verified]` `accessibilityChartDescriptor(_:)`.

### Toolbar
Back. Trailing: range `Menu` (`calendar`).

### States
- Loading: charts redacted rectangles.
- Empty (new member): `ContentUnavailableView("Your first visit starts the streak", systemImage: "figure.walk", description: Text("Check in once and this page fills in."))`; button "Book a class".
- Error and offline: cached.
- No goal set: default 3.

### AX5
Charts keep 220 pt min height; axis labels use `.font(.caption)` scaled; stat tiles single column. Provide "View as table" button under each chart (a `List` of values) at all sizes.

### Dark mode
Bars use Dawn Copper; grid lines `Border`.

### VoiceOver
Each chart has a descriptor: title "Visits per week", x axis "Week starting", y axis "Visits", series with 12 points, summary "Average 2.8 visits a week. Goal 3 met in 7 of 12 weeks." Audio graph works from the descriptor. [apple §5 Charts]

```
+--------------------------------------+
| <  Progress                  (range v)|
|  6  week streak        Best: 11      |
|  |||..  2 of 3 visits this week      |
|  Visits per week                     |
|  4|        ▇                         |
|  3|- - -▇- ▇- -▇- - - - - - - Goal 3 |
|  2| ▇  ▇ ▇  ▇ ▇ ▇  ▇ ▇               |
|    W1 ...                    W12     |
|  [View as table]                     |
|  What you do                         |
|  Cycle ▇▇▇▇▇▇▇▇▇▇▇▇ 14               |
|  Strength ▇▇▇▇▇▇▇ 9                  |
|  Month  M T W T F S S ...            |
+--------------------------------------+
```

---

## 16. Coach profile

- **Purpose:** Meet the coach. Book a session or a class they teach. [shared §7.4]
- **Route:** `.coach(CoachID)`. Entry: `InstructorChip`, `CoachCard` `row`, Search.
- **List form:** "Coaches" lists use `CoachCard` `row` (56 pt avatar, name, credential line, chevron). Horizontal strips on Club detail use `CoachCard` `card`.

### Layout (`ScrollView`)
1. Header: portrait (4:5), name `.title.bold` (Archivo only in the detail header, relative `.title2`), credential line "Cycle coach · RYT-200", clubs line "Gilbert – Val Vista · Gilbert – Heritage".
2. Specialties: `AmenityChip` `info` chips: "Climbing intervals", "Beginner form", "Low-impact".
3. Bio: at most 25 words. "Marisol coaches rhythm first. She has taught Cycle in the East Valley for 8 years and likes a hard hill on Thursdays."
4. "This week": up to 5 `ClassCard` `compact`, then "See all classes".
5. Personal training (only for coaches who train). Card with the foundation prices: single session $75; packs 4 for $276, 8 for $520, 12 for $732. Sessions are 45 min (Summit intro 30 min). "Free cancel or reschedule up to 24 hours before." "Packs last 12 months and pause during a freeze." Summit note "Your plan includes 1 intro session a quarter." [found §4]
6. Bottom bar: "Book intro session" (Summit) or "Book a session" (others). Opens the PT picker: `ReservationSlotGrid` `list` layout with AM and PM groups and a green availability dot; coach chosen with `InstructorChip` `choice` (ring and check) and a line "Available 8 a.m.–8 p.m." [shared §8.2] [mobbin-standard-pass §2 rules 23, 37]. Teen members: the request goes to the parent for approval first ("Needs a parent's OK"). A pause does not block PT. [found §4]

Toolbar: Back; Share.
States: Loading redacted; Error; no classes this week "Marisol has no classes this week."; Offline cached.
AX5: header stacks. VoiceOver: "Marisol Vega, Cycle coach"; chips read as a list.

```
+--------------------------------------+
| <                              (share)|
|            (photo 4:5)               |
|       Marisol Vega                   |
|       Cycle coach · RYT-200          |
|  [Climbing intervals][Beginner form] |
|  Marisol coaches rhythm first. ...   |
|  This week                           |
|  Thu 6:00a Climb Cycle  4 bikes left |
|  Personal training: $75 single       |
|   4 = $276 · 8 = $520 · 12 = $732    |
|--------------------------------------|
|  [   Book intro session          ]   |
+--------------------------------------+
```

---

## 17. You

- **Purpose:** Everything about me and my membership.
- **Route:** You root.

### Layout (`List`, `.insetGrouped`)
1. Profile row: photo 56 pt, "Maya Lopez", "Ridge · Member since March 2025", chevron → Edit profile (name, photo via `PhotosPicker`, phone).
2. Pass row: `CheckInPass` `compact` (name, number, club, "Show pass", no QR). [shared §9.3]
3. "Activity": "Bookings" (`ticket`, "2 upcoming"), "Progress" (`chart.bar`, "6-week streak").
4. "Membership": "Membership" (`creditcard`), "Family" (`person.2`, "3 people"), "Guest passes" (`person.badge.plus`, "1 left").
5. "Support": "Inbox" (`bell`), "Help and contact" (call the front desk, (480) 555-0142), "Give feedback".
6. Footer: version.

Toolbar: trailing Settings `gearshape`.
Teen accounts hide "Membership" and "Guest passes" and show a card "Your plan is managed by Mike." Under-13 profiles have no login.
States: none need the network. AX5: values move under labels. VoiceOver: "Bookings, 2 upcoming".

```
+--------------------------------------+
| You                              (⚙) |
| (photo) Maya Lopez                >  |
|         Ridge · Member since Mar 2025|
| Check-in pass 0042 1187 [Show pass]  |
| Bookings               2 upcoming >  |
| Progress             6-week streak >  |
| Membership                        >  |
| Family                    3 people >  |
| Guest passes               1 left >  |
| Inbox                             >  |
| Help and contact                  >  |
+--------------------------------------+
```

---

## 18. Membership

- **Purpose:** See what I pay and what I get. Change it safely.
- **Route:** `.membership`. Face ID gate on first open per session (passcode fallback).

### Layout (`List`, `.insetGrouped`)
1. `PlanCard` `current`: badge "Current plan", "Ridge", price Archivo Bold 36 pt (relative `.largeTitle`) "$79/mo", perks list ("All 5 clubs", "All classes", "Courts, 3 days ahead", "1 guest pass a month", "Book classes 7 days ahead"), disabled button "Your plan", and the next renewal date and amount under the price. Frozen: neutral pill with pause icon "Frozen until Feb 19". [shared §9.1] [mobbin-standard-pass §2 rule 49]
2. "Next bill": "Nov 12 · $117.00" with rows "Ridge $79.00", "Mia (child) $19.00", "Eli (child) $19.00". Billing day is fixed for the household (Maya's is the 12th). Footnote "$49 annual facility fee is charged in March." [found §4] [gaps r7]
3. Payment state (only when relevant): failed payment card with the day rules (retries on day 3 and 6; full access to day 7; new bookings paused from day 8; from day 15 the pass shows "See the front desk"). Button "Update payment".
4. "Manage": "Payment method" (Visa •• 4242), "Billing history" (list with status pill "Paid"/"Upcoming" and download), "Change plan" (→ `.plans`), "Freeze membership" (→ `.freeze`), "Family" (→ `.family`), "Personal training packs" (sessions left, expiry; packs last 12 months).
5. Wallet: `PKAddPassButton` or "In Wallet".
6. End: red text row "Cancel membership" → screen with two buttons, outline "Cancel membership" and filled "Keep my membership". Plain text: "You keep full access until Dec 12, the first billing date at least 30 days from today. You can reinstate with one tap until then." After confirm, a banner "Cancelling Dec 12" with "Reinstate". [found §4] [gaps r5, r6]

States: Loading redacted; Face ID failed → locked with "Unlock"; Past due → banner; Frozen → pill + "Resume early" (confirm: "Resuming early bills your plan price for the rest of this cycle."); Offline → cached, edits disabled.
AX5: `PlanCard` stacks; price under name. Dark: `PlanCard` `current` uses `Surface` with a 1 pt `BrandAccent` outline.
VoiceOver: "Current plan Ridge, 79 dollars a month. Next bill November 12, 117 dollars."

```
+--------------------------------------+
| <  Membership                        |
| +--------------------------------+   |
| | [Current plan]                 |   |
| | Ridge                 $79/mo   |   |
| | ✓ All 5 clubs  ✓ Courts 3 days |   |
| | [      Your plan (disabled)  ] |   |
| | Next renewal Nov 12 · $117.00  |   |
| +--------------------------------+   |
| Payment method          Visa 4242 >  |
| Billing history                   >  |
| Change plan · Freeze · Family     >  |
| [ Add to Apple Wallet ]              |
| Cancel membership   (red)            |
+--------------------------------------+
```

---

## 19. Plans (change plan)

- **Purpose:** Compare plans and switch. [shared §9.1, §9.2]
- **Route:** `.plans`. Also from upsell prompts (`restricted` buttons).

### Layout (`ScrollView`)
1. Three `PlanCard`: Trailhead $54/mo, Ridge $79/mo (highlighted, night surface, "Most popular"), Summit $129/mo. The member's plan shows variant `current` ("Current plan", disabled "Your plan"). Others show variant `change` with a delta ("+$50/mo") and the button "Switch to Summit".
2. "Compare plans" button → `.sheet` with `PlanComparisonTable` as a `Grid` (feature rows, three plan columns; check icons carry text qualifiers). At AX: `List` with `Section(plan.name)`. Cells for facts not in the foundation read "Not included". [shared §9.2]
3. Footer: "Family add-on +$39 per adult, +$19 per child (6 months to 17). Day pass $20."

### Change rules shown in the flow [found §4] [mobbin-standard-pass §2 rules 31, 32]
- **Upgrade:** now, prorated by day. "Before you switch" list; summary block: Subtotal, "Prorated by day for the rest of this cycle", Today's total, and when the new price starts.
- **Downgrade:** "Takes effect on your next billing date, Nov 12." Lost features have a red X icon and words ("Courts: not included in Trailhead").
- **Trailhead home club change:** once per cycle.
- Button pair: outline "Keep Ridge" and filled "Switch to Summit" in a `.medium` confirmation sheet. [gaps r5]
States: Loading, Error. AX5: cards stack. VoiceOver: card reads plan, price, perks.

---

## 20. Freeze

- **Purpose:** Pause billing for 1 to 3 months. [found §4]
- **Flow:** `02` flow 12a (Daniel, billing day the 20th). **Route:** `.freeze`.

### Layout (`Form`)
1. Headline "Let's hit pause." [mobbin-standard-pass §2 rule 29] Sub: "Freeze for 1 to 3 months. $10/mo for the account while frozen. It covers everyone on your plan."
2. `DurationChips` "1 month | 2 months | 3 months".
3. One sentence above the button (updates live): "Your freeze starts Dec 20, your first billing date at least 30 days from today. It ends Feb 19, and billing restarts Feb 20." [mobbin-standard-pass §2 rule 30] There is no date picker: the server sets the start date.
4. Summary card: "Freeze Dec 20 – Feb 19 · $20 total" (2 months).
5. Warnings: "Bookings inside the freeze are cancelled. No strikes." (first 3 listed, then "and 4 more"); "Personal training packs pause while frozen."; "You cannot check in while frozen."
6. Bottom button "Freeze membership" → `.medium` bottom sheet: pause icon, bold question "Freeze from Dec 20?", full-width "Freeze membership", text link "Not now". [mobbin-standard-pass §2 rule 48]
7. Success view (section 7 pattern): "Freeze set", "Confirmed" pill, summary, "Add to calendar", Done.

Frozen state on Membership: neutral pill "Frozen until Feb 19". "Resume early" bills the plan price for the rest of the cycle. [mobbin-standard-pass §2 rule 49]
Ineligible (past due, already frozen, not the owner): `EmptyState` with the reason. Footer shows next renewal date and amount. [gaps r7]
VoiceOver: summary posts an announcement on change. AX5: chips become a menu.

```
+--------------------------------------+
| <  Freeze                            |
| Let's hit pause.                     |
| [ 1 month |■ 2 months ■| 3 months ]  |
| Your freeze starts Dec 20 and ends   |
| Feb 19. Billing restarts Feb 20.     |
| +--------------------------------+   |
| | $10/mo while frozen · $20 total|   |
| +--------------------------------+   |
| ! 2 bookings cancelled, no strikes   |
|--------------------------------------|
| [       Freeze membership        ]   |
+--------------------------------------+
```

---

## 21. Family and Family member

- **Purpose:** Add people, see their plans, set teen controls. [mobbin-ios §4.10]
- **Route:** `.family`, `.familyMember(MemberID)`.

### Family (`List`)
1. Avatar row: circular avatars with names and a grey "+" circle "Add member". [mobbin-standard-pass §2 rule 50]
2. Info card: "Family add-ons: +$39 per adult, +$19 per child (6 months to 17). Same access as your plan. Kids club is included for children 12 and under. Teens 13 to 17 follow the teen rules." [found §4]
3. Members: avatar, name, role under the name ("Admin", "Adult", "Teen · 16", "Child · 9"), overflow `Menu`. Pending invite row: "Invite pending" with an accent link "Send a reminder?". [mobbin-standard-pass §2 rule 51] [mobbin-ios §5 r28, r29]
4. Button "Add a family member" (pill, full width). [mobbin-ios §5 r31]
5. "Billing": "Managed by you. Next bill Nov 12 · $117.00."
6. Red row at the bottom "Remove family plan" with a confirm. [mobbin-ios §5 r30]
Examples: Maya (Admin), Mia (Child · 9), Eli (Child · 6). Mike's household: Mike (Admin), Jordan (Teen · 16, invite pending).

### Family member (teen, ages 13 to 17)
- Header: avatar, "Jordan Hernandez", "Teen · 16 · Gilbert – Val Vista".
- Parent toggles: "Courts" (off), "Lap lanes" (off; from age 14), "Tell me when Jordan checks in" (off). Teen personal training shows "Needs a parent's OK"; approvals arrive in the Inbox. [found §4]
- Rows: "View bookings", "Show Jordan's pass" (`CheckInPass` `teen`).
- Teen classes: those flagged "Teen OK" (all Youth classes plus selected others, for example Teen Strength and Mind & Body).
- Buttons: "Pause Jordan's access" (confirm), red row "Remove from plan" (confirm with effective date).
- Child under 13: no login rows; "Show pass" only for kids club check-in by the parent, "Bookings", "Allergies and notes", remove.
- Turning 18: card "Jordan turns 18 on Apr 12. We'll move Jordan to the adult add-on, +$39/mo, with 30 days' notice." [found §4]

States: Loading, Error, Offline (read-only). Only the owner sees edit controls. Teens see their own row and "Ask Mike to change this."
AX5: avatar stacks above name. VoiceOver: "Jordan, teen, 16. Invite pending. Action: Send a reminder."

```
+--------------------------------------+
| <  Family                         (+)|
| (MA) (MI) (EL) (+ Add member)        |
| (i) +$39 adult, +$19 child (6 mo–17) |
| Maya Lopez               Admin    ⋯  |
| Mia                      Child · 9 ⋯ |
| Eli                      Child · 6 ⋯ |
| [      Add a family member       ]   |
| Billing  Managed by you  $117.00  >  |
| Remove family plan  (red)            |
+--------------------------------------+
```

---

## 22. Add family member (sheet)

- `sheet`, `.large`. Leading Cancel, trailing "Send invite" (or "Add").
- Step 1: `Picker` inline "Adult +$39/mo" or "Child +$19/mo (6 months to 17)".
- Step 2 (form): first name, last name, birth date (`DatePicker` compact), email (required for adults and teens 13 to 17; optional for children under 13), photo (`PhotosPicker`).
- Teen note (13 to 17): "Jordan can use the app and check in. You manage billing."
- Step 3: cost "+$19/mo from your next bill on Nov 5". Checkbox "I am this child's parent or guardian." Button "Send invite" (invite link valid 7 days).
- Draft kept in `@SceneStorage`. Dirty swipe-dismiss asks to discard. Errors inline. Age under 6 months: "Kids club starts at 6 months." Plan limits shown from the foundation only.
VoiceOver: field labels; errors announced.

---

## 23. Guest passes and Guest share

### Guest passes (push, `List`)
1. Header card: `ProgressRibs` for the monthly allowance (Ridge 1 of 1; Summit 4 of 4; Trailhead 0). Text "1 guest pass left. Resets Nov 12." Included passes reset on the billing date and do not roll over. [found §4]
2. Button "Share a guest pass" (`.glassProminent`). At 0 left: "Buy a day pass for a friend, $20".
3. "Shared passes": "Alex · Shared · Expires Nov 10". Status chip: Shared, Waiver signed, Used, Expired. Swipe "Revoke" (also context menu).
4. Footnote: "Valid 14 days from the day you send it. One visit, one club. Guests must be 18 or older, or 16 to 17 with a guardian waiver." [found §4]

### Guest share (sheet, `.medium`)
Guest name field (optional), the rules above, link field with "Copy link", and `ShareLink` primary "Share". [mobbin-standard-pass §2 rule 36] Result: success pattern lines (green check, "Pass sent", Done).
Empty (Trailhead): `EmptyState` "Guest passes come with Ridge" / "Ridge includes 1 guest pass a month." / "See plans".
States: Loading, Error, Offline (list cached; share disabled). The server enforces one guest-pass visit per guest per 30 days and shows the guest a clear message.
VoiceOver: "1 of 1 guest pass left."

---

## 24. Notifications (Inbox)

- **Purpose:** Keep a record of what we told the member.
- **Route:** `.notifications`.
- `List` grouped "Today", "Earlier". Row: icon in a category circle, title `.headline`, body `.subheadline` (2 lines, 3 at AX), time `.caption`, unread dot (`BrandAccent`) before the title.
- Types and examples:
  | Type | Example |
  |---|---|
  | Waitlist | "A spot opened in Rib Rack Strength. Confirm by 4:12 p.m." (row shows the `hold` button "Confirm spot · 24:10" until the hold ends) |
  | Reminder | "Climb Cycle starts at 6:00 a.m. Gilbert – Val Vista." |
  | Club | "Pool's 82° and the shade sails are up." |
  | Billing | "Your Nov 12 bill is $117.00." |
  | Family | "Jordan checked in at Gilbert – Val Vista." |
  | Coach | "Marisol confirmed your intro session, Thu 5:00 p.m." |
  | Teen approval | "Jordan asked for a personal training session. Approve?" |
- Toolbar: trailing filter `Menu` (All, Bookings, Club, Billing, Family) and "Mark all read".
- Swipe trailing: Delete. Swipe leading: Mark read/unread. Context menu too.
- Empty: `ContentUnavailableView("You're all caught up", systemImage: "bell.slash", description: Text("Waitlist spots and reminders show here."))` (use the `EmptyState` wrapper). [shared §10.1]
- Permission off: top banner "Alerts are off. Turn on alerts so you do not miss a waitlist spot." Button "Open Settings".
- AX5: body 3 lines; time moves under.
- VoiceOver row: "Unread. Waitlist. A spot opened in Rib Rack Strength. 3 minutes ago."

---

## 25. Settings

`Form` / `List`, `.insetGrouped`. Title "Settings".

| Section | Rows |
|---|---|
| Account | Name and email (detail), "Passkeys" (list, add, remove), "Sign out" (red; `confirmationDialog`) |
| Home club | Picker with the five clubs. Trailhead: "You can change your home club once per billing cycle." |
| Notifications | Toggles per category (Waitlist spots, Class reminders with lead time 30/60/120 min, Booking changes, Club news, Billing, Family). "Live Activities" toggle. "Quiet hours" (default none; waitlist stays time sensitive). Banner when system alerts are off. |
| Pass | "Keep pass shortcut on" toggle. "Reset my codes" (confirm). "Auto brightness boost" toggle (on). |
| Appearance | "App icon" (picker: Peak, Sand, Night, Copper; see `04` section 3), "Haptics" toggle, "Theme" is system (no custom). |
| Privacy | Location status (link to system Settings), "Share usage data" toggle (off by default), "Download my data". |
| Support | Help, Contact, Terms, Privacy policy (open web). |
| About | Version, licences (Archivo and Inter are OFL; Lucide is ISC). |

States: none needing network except notification toggles (offline → saved locally and synced).
AX5: standard Form behaviour.
VoiceOver: native.

---

## 26. Search

- **Route:** Search tab root (`Tab(role: .search)`). Details in `01` section 5.
- **Before typing:** "Recent" list (8), "Try" chips, and "Browse" rows: Classes by category (8 `CategoryBadge` rows), Clubs, Coaches.
- **Results (`List`)**, scope bar (`searchScopes`): All, Classes, Clubs, Coaches, Help.
  - Classes: `ClassCard` (schedule-row) with date; tapping pushes Class detail. Grouped by day.
  - Clubs: `ClubCard` (compact).
  - Coaches: `CoachCard` row.
  - Help: article rows (open web).
- **Empty:** `ContentUnavailableView.search(text: query)` + "Clear filters" if tokens exist. `[verified]`
- **Loading:** inline `ProgressView` in the toolbar area after 250 ms.
- **Offline:** search over cached classes and clubs only; banner.
- **AX5:** rows stack. VoiceOver: native search field; results announce "12 results" after typing stops (debounced 400 ms).
- Spotlight: index clubs and today's bookings with `CSSearchableItem` plus App Intents entities. [skill:app-intents-whats-new-27] `IndexedEntityQuery` iOS 27.

```
+--------------------------------------+
| (Q) Search classes, clubs, coaches   |
| [All][Classes][Clubs][Coaches][Help] |
| RECENT                               |
|  Climb Cycle                         |
|  Pickleball Open Play                |
| BROWSE                               |
|  [Strength][Cycle][Aqua] ...         |
+--------------------------------------+
```
