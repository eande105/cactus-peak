# Cactus Peak iOS member app: design review 1

Reviewer: senior iOS design critic. No code was changed. Build: Debug, iPhone 18 Pro simulator, iOS 27.2, own derived data `/tmp/cp-ios-review`.
Screenshots: `screenshots/review-1/light/` (all 26 screens, many states), `dark/` (10 screens), `ax/` (15 screens at Accessibility XXXL).
Flows walked by hand: waitlist join (sheet, tick, success, notification prompt). Others were checked by debug launch arguments and `-state` flags.
Paths below are relative to `ios/CactusPeak/` unless they start with `CactusPeakWidgets/`.
Simulator was reset to light appearance and `large` text size at the end.

## Verdict (5 lines)
1. The app is far more complete than most builds: every spec screen opens, the booking rules work, states are designed, and the brand (rib meter, Archivo times, category colour, Saguaro Night pass) is real.
2. It is still 60 percent from a designer-made club app. Today, Book, Class detail and the success views are the "everything in a rounded white card on a sand background" look that DESIGN-DIRECTION lists as a defect.
3. The schedule is not dense: one class row is about 190 pt tall, so a 6.1 inch screen shows 1.5 classes. Apple Calendar shows 8 events in the same space.
4. Bottom chrome is crowded and hides content: the always-on "Show pass" accessory, the tab bar, and a sticky action bar stack three layers on several screens. At AX XXXL the accessory reads "Show..." and the Club detail hero is clipped on the left.
5. Native structure is mostly right (TabView, List, Form, sheets, system search tab). The gap is custom card, button and chip drawing on top of it, a few real bugs (double periods, a broken guest-pass card, a fake "1/4" photo pager) and no loading or error states.

---

## Systemic issues (fix once, fixes many)

### S1 P1. Everything is a card: `cardStyle`, `nightCard`, `Banner`, `HoldCard`
- What: Today is a `ScrollView` + `LazyVStack` of 8 white rounded cards with 1 pt strokes and a 14 pt radius (`Components/Style.swift:6-12`, `Views/TodayView.swift:13-27`). Cards sit inside cards (Progress, Membership, Plans, Class detail "Before you book", Pass "more" list). One 14 pt radius is used for every object (`Style.swift`, `TodayView.swift:132,191,345`, `ClassCards.swift:136`). This is the DESIGN-DIRECTION "Avoid" list, nearly line by line.
- Why: nothing leads, nothing groups. The member cannot see "what is next" faster than "how busy is the club".
- Fix:
  1. Rebuild Today as a `List` with `.listStyle(.insetGrouped)` or `.plain`, one `Section` per idea (Next up, Club now, Coming up, This week, For you). Use system rows. Remove `.cardStyle()` from `ClubNowCard`, `WeekCard`, `UpcomingSection`, `noticeCard`, `FeedbackCard`.
  2. Keep a bordered object only for things the member picks (a club, a class, a plan, a slot). That is `ClassFeatureCard`, `ClubCard`, `PlanCard`.
  3. Replace the single `cardStyle(radius: 14)` with a radius scale by size: 4 for chips and tags, 10 for rows and thumbnails, 20 for hero objects. Use `ConcentricRectangle` or `.containerShape` where an object sits in a sheet or list so corners nest with the system.
  4. The paid-for hierarchy comes from type: Archivo 44 for the time, rules (`Divider`) between rows, and whitespace.

### S2 P1. Custom buttons imitate system buttons
- What: `AccentButtonStyle`, `OutlineButtonStyle` (capsule, 1.5 pt stroke, forced 48 pt) in `Style.swift:22-60`, plus hand-drawn circle `Menu` labels (`TodayView.swift:209`, `ClassDetailView.swift:219`) and hand-drawn capsule chips (`ClubsView` chips, `BookView.swift:218-222` club chip, `FilterChip`).
- Why: on iOS 27 these sit next to real Liquid Glass buttons (toolbar, tab bar, accessory). The two families do not match: the copper pill blob bleeds as a glow through the glass tab bar (`light/book.png`, `light/family.png`, `dark/book.png`).
- Fix: use `.buttonStyle(.glassProminent).tint(.brandAccent)` for the single primary action and `.buttonStyle(.glass)` for the secondary one (the spec itself says this at 03 section 3 "Next up card"). Use `.buttonStyle(.borderedProminent)` / `.bordered` with `.buttonBorderShape(.capsule)` inside `List` rows and sheets. For the "more" button use `Menu { } label: { Label("More", systemImage: "ellipsis") }.labelStyle(.iconOnly).buttonStyle(.glass)`. Keep `BookingStateButton` as the only custom label logic, but draw it with those styles. Group adjacent glass buttons in a `GlassEffectContainer`.

### S3 P1. Bottom chrome stacks and hides content
- What: `RootView.swift:36-44` shows `tabViewBottomAccessory` on every tab, every pushed screen, and over every sticky bar whenever a class starts within 90 min. Result: accessory + tab bar + `ClassDetailView.bottomBar` + `ClubDetailView` action bar (see `light/classDetail.png`, `light/clubDetail.png`, `light/freeze.png`). The accessory also hides rows (Family "Add a family member" button is under it, `light/family.png`).
- Why: the spec's own rejection table says an always-on accessory takes 52 pt on every screen. The build made it conditional, but "conditional" is true all morning for a member with a class.
- Fix:
  1. Show the accessory only on Today and Book roots, and hide it on pushed screens: read the path in `RootView` and set `isEnabled: shouldOfferPass && router.paths[router.selection]?.isEmpty != false`.
  2. Move the sticky bars into `.safeAreaBar(edge: .bottom)` (iOS 26+) so the system blends them with the tab bar and applies the scroll edge effect, and hide the tab bar on the class detail screen with `.toolbarVisibility(.hidden, for: .tabBar)`. The booking button then replaces the tab bar, as in Apple Fitness+ and Apple TV.
  3. At accessibility sizes set `isEnabled: false` (see S6).

### S4 P1. Schedule rows are cards, not a timetable
- What: `ClassRow` (`Components/ClassCards.swift:21-95`) stacks time block, name, tag row, coach row, then a trailing row with capacity and the Book button. Each row is about 190 pt (`light/book.png`). The `List` is `.insetGrouped` on a hidden background with a white rounded section.
- Why: the DESIGN-DIRECTION says a schedule is a dense timetable. This is the screen members use most.
- Fix: a 2-line row, about 64-72 pt:
  - Line 1: leading `6:00` in Archivo SemiBold 20 (tabular) with `a.m.` and `45 min` under it (fixed 64 pt column), then `Climb Cycle` `.headline`, then trailing `Book` as `.buttonStyle(.bordered).controlSize(.small).buttonBorderShape(.capsule)` (44 pt hit area with `.contentShape` and padding).
  - Line 2: `Marisol V. · Cycle studio` `.subheadline` secondary, then 5-rib meter (size sm), then `4 bikes left`. Drop the avatar (24 pt monogram) and the category badge: the 4 pt stripe plus the category SF Symbol on line 1 already say it. Show "First-timers" and "Teen OK" only in the detail and as a filter result.
  - Use `.listStyle(.plain)` with section headers `Early morning` etc. as pinned `Section` headers. Remove `.listRowBackground(Color.surface)`.
  - Keep swipe actions (they are right). Add `.swipeActions(edge: .leading)` for Favourite.
- Target: 7 or more classes on the first screen.

### S5 P1. No loading and error states
- What: spec 03 requires redacted placeholders (Today, Book) and "Can't load classes" with "Try again". `grep redacted` and `grep "Can't load"` find nothing. `.refreshable` only sleeps (`TodayView.swift:29`, `BookView.swift:147`).
- Fix: add a `LoadState` to `AppModel`; render skeletons with `.redacted(reason: .placeholder)` on the real row layout (not generic boxes); add `ContentUnavailableView("Can't load classes", systemImage: "wifi.exclamationmark", description:)` with a retry `Button`. Demo control "Force error".

### S6 P0. Accessibility XXXL breaks several screens
Screenshots: `ax/*.png`.
- Pass accessory shows "Show…" with a huge icon and a huge X on every screen (`RootView.swift:84-100`). Fix: `@Environment(\.dynamicTypeSize)`, and at `isAccessibilitySize` disable the accessory, since Today already has "Show pass" in the toolbar and the next-up card.
- Club detail hero is clipped on the left edge, text starts mid-word ("ert – Val Vista", `ax/clubDetail.png`). Cause: a fixed-width overlay inside `ClubHero` that is wider than the screen. Fix: `.frame(maxWidth: .infinity, alignment: .leading)`, `.fixedSize(horizontal: false, vertical: true)` and use the same `ViewThatFits` as the class hero.
- Membership "Ridg e $79/mo" breaks mid-word (`ax/membership.png`). Fix: `ViewThatFits(in: .horizontal) { HStack{…}; VStack{…} }` for name + price, and use `AnyLayout` as the rest of the app does.
- Kids reserve sheet: "Holdi ng this bloc k for 4:57" (`ax/reserveKids.png`). Fix: stack the hold text over the "Add 5 minutes" button at AX sizes and drop `.lineLimit` on the timer line.
- Book pinned header (menu picker + day strip) takes more than half of the screen at AX (`ax/book.png`, `ax/courts.png`). Fix: make the header scroll with the list at AX sizes (move it into the `List` as a first `Section`) or replace the day strip by a `Menu` day picker.
- Cancel sheet opens at `.medium` and shows only the title at AX (`ax/cancelSheet.png`). Fix: `.presentationDetents(dts.isAccessibilitySize ? [.large] : [.medium])`. Same for the waitlist sheet and the reserve sheets.
- Bookings: `Picker` (Upcoming/Past) does not grow. Fix: `.pickerStyle(.menu)` at AX like Book does.

### S7 P1. Copy defects that repeat
- "Free cancel until 4:00 a.m.." (double period) at `Views/SuccessView.swift:101` and `Views/Sheets.swift:287,296`: `cpTime` ends with a period and the sentence adds one. Seen in `light/confirmed.png`.
- "Usually busiest 5 to 7 p.m.. Quietest around 2 p.m.." at `Components/Meters.swift:158`, shown on Today, Club detail and the stale card (`light/stale.png`, `light/empty.png`).
- Fix: add `Date.cpSentenceTime` that trims a trailing "." or write times as `a.m` ... simplest: a helper `func endingSentence(_ s: String) -> String { s.hasSuffix(".") ? s : s + "." }` and use it in all copy builders. Then grep for `\.\.` in the string output in a unit test.
- "Let's hit pause." on Freeze (`Views/YouViews`/`Freeze`, `light/freeze.png`) is chatty hype. Replace with "Freeze your membership".
- "Done. Nice work." in the Live Activity (`CactusPeakWidgets.swift`, `thirdValue`). Replace with "Class finished".

### S8 P1. Photo slots and fake pager
- What: `ClassDetailView.swift:78-83` draws a "1/4" pill and the VoiceOver label says "Photo 1 of 4", but the build notes say there is one photo and no pager. The caption band under the photo repeats the date and coach ("with Marisol Vega · Thu, 6:00 a.m.", line 73) instead of naming the intended shot as DESIGN-DIRECTION asks. The same Rib Peak scene is used in every club and category, so two clubs differ only by hue (`light/clubs.png`).
- Fix: remove the pill and the "of 4" label until a pager exists. Set the caption to the intended shot ("Cycle studio, 6 a.m., bikes lit, low sun"), which `PhotoSlot` already supports (`Components/Photo.swift`, `showCaption`). Give each club a different composition (Dobson: pool lanes in a horizontal band; Red Mountain: courts with a net line; Heritage: palm row), not only a different tone. Use `.backgroundExtensionEffect()` on the hero so it runs under the nav bar like Apple apps do, and `.scrollEdgeEffectStyle(.soft, for: .top)`.

### S9 P2. Haptics and motion are thin
- 20 `sensoryFeedback`/`symbolEffect` uses, none on the primary actions. Add `.sensoryFeedback(.success, trigger:)` on booking confirmed, `.sensoryFeedback(.impact(weight: .light), trigger:)` on a rib meter change, `.warning` on a late cancel, and `.selection` on the day strip (already on the segment picker). Add `.contentTransition(.numericText())` to the hold countdown and to spot counts. Use `matchedTransitionSource` + `.navigationTransition(.zoom(sourceID:in:))` from a `ClassFeatureCard` to Class detail. Keep all of it behind `accessibilityReduceMotion` (only the bounce and pass ring do that now).

### S10 P2. Dark mode and contrast are good, with three catches
- Dark is well done (`dark/*.png`). Copper on night passes. Catches: the "Hold" card (`dark/hold.png`) uses a brown subtle fill with white text, fine, but `StatusPill` `.info` and `.neutral` are the same colour, so "info" has no identity. The muted caption text on cards (`Color.textMuted` at `.caption`) is about 4.1:1 on `Surface` in light mode in several places (`light/today.png` "Updated 5:40 a.m."). Check with Xcode's Accessibility Inspector and raise `textMuted` to at least 4.5:1 at 12 pt. Check Increased Contrast with `-AppleAccessibilityEnhanceContrast`; it was not tested.

---

## Per screen and flow

Legend: P0 broken or wrong rule or fact. P1 LLM look, non-native pattern, spec miss. P2 polish.

### 1 Welcome (`light/welcome.png`) and 2 Onboarding (`light/onboarding1-5.png`)
- P1 Interests step is a 2 x 3 grid of tinted rounded tiles with an icon and a check (`Views/WelcomeFlow.swift`). This is the "icon in tinted square grid" pattern. Fix: a `List` with `Toggle`-style rows or `.selection` multi-select `List(selection:)` with `Label(category.title, systemImage: category.symbol)` tinted by category; or a plain text flow of capsule `Toggle`s with `.toggleStyle(.button)`.
- P1 Home club step: "Closest" badge wraps as "Clos-est" (`onboarding1.png`). Fix: `.fixedSize()` on the badge, and show it as a trailing word in the row instead.
- P1 Step 1 progress uses `RibMeter` (nice, keep) but the five ribs read as 1/5 of a battery. Add `.accessibilityValue("Step 1 of 5")` (present as text only).
- P2 Welcome: full-bleed copper top is a strong choice (keep). The "Email me a code" button is low contrast on the dark band; use `.glass` with white label.
- P2 "Your pass, ready" has an empty lower half. Move "Add to Apple Wallet" under the card and put the explainer in a `Text` footer, centre vertically with `Spacer`.

### 3 Today (`light/today.png`, `dark/today.png`, `ax/today.png`, states: `hold`, `frozen`, `offline`, `stale`, `empty`, `paymentFailed`)
- P0 After a freeze starts, Today still shows the booked class, "Show pass" and "Directions" (`light/frozen.png`). Spec: bookings inside the freeze are cancelled with no strike, and the member cannot check in. Fix: in `AppModel.applyFreeze`, cancel bookings in the window (also in the debug state), and hide `NextUpCard` actions when `model.isFrozen`. Also hide the pass accessory (`RootView.shouldOfferPass`) and the toolbar pass button's primary state.
- P0 Double periods in the Club now caption (S7).
- P1 The screen starts with a large "Today" title, then the eyebrow, then "Morning, Maya." (`TodayView.swift:32,61-68`). Three headings for one idea. Fix: use `.navigationTitle("Morning, Maya.")` with the Archivo font via `UINavigationBar` appearance, or drop the nav title and keep the greeting as `.toolbarTitleDisplayMode(.inlineLarge)`. Put the date as the nav subtitle: `.navigationSubtitle("Tuesday, Oct 27")`.
- P1 What is next: the Next up card is good in content (45 pt time, class, coach, buttons), but it is a card with a left stripe drawn by `Rectangle().clipShape(UnevenRoundedRectangle)` (`TodayView.swift:192`) that does not follow the 14 pt corner (visible as a notch in `light/today.png`). Fix: drop the stripe; colour only the category symbol and the eyebrow. Put time and class on one line, `6:00 a.m. Climb Cycle`, remove the duplicate line "Val Vista · Cycle studio · Booked" (the room appears twice, lines 178 and 180). Use `Text(b.start, style: .relative)` or `Text(timerInterval:)` for "starts in 19 min" so it counts without a refresh.
- P1 Club now card puts a 5-rib meter, a word, a title, a line and a bar chart in one card (about 300 pt). Fix: one row: ribs + "Steady now" + "Val Vista · open until 10 p.m." with the sparkline as a 28 pt `Chart` trailing. The full chart belongs on Club detail only. This also fixes the stale card repeating "Busyness unavailable" twice (`light/stale.png`).
- P1 Order: club busyness is above the member's week and "Coming up". For a member with a class in 19 minutes the order should be: Next up, Hold (if any), Pass, Coming up, Club now, This week, For you. Hold card stays first by the spec.
- P1 `ForYouSection` is a horizontal strip of 252 pt photo cards with the same stock scene. Keep, but give the cards the new per-category photo composition (S8) and cap at 3.
- P1 Notice card "Pool's 82°..." is a card with an Aqua icon in a tinted square. Make it a plain footer `Text` with `Label(…, systemImage: "sun.max")` in a `Section` footer.
- P1 Hold card (`TodayView.swift:117-135`) is a warning-yellow card with bell icon. The state is right and the 29:53 countdown on the button is good. Fix: use `Text(timerInterval:)` instead of a custom timer in `BookingStateButton`, and add `.sensoryFeedback(.warning)` only when it first appears (now it fires on `booking.id` change only, fine).
- P1 Empty state (`light/empty.png`): "NOTHING BOOKED TODAY" eyebrow plus "Nothing booked today." repeats itself. Remove the eyebrow. The "Your usual" suggestion is the right idea. The suggestion says "Tue 6:00 a.m." while today is Tuesday and the time is 5:40: show "Today 6:00 a.m." or "Tomorrow".
- P2 Toolbar: leading club switcher and trailing bell + pass are correct (`.topBarPinnedTrailing` plus `visibilityPriority(.high)`). Keep. Add a `ToolbarSpacer(.fixed)` between bell and pass so the two glass items are separate, not one pill (now they merge into one capsule).
- P2 Payment failed card sits above the greeting (`light/paymentFailed` / `dark/paymentFailed.png`). Correct for severity. Keep.
- Keep: offline banner copy, frozen copy, "Busyness unavailable" dashed ribs, hold countdown.

### 4 Book: Classes (`light/book.png`, `light/bookToday.png`, `ax/book.png`)
- P1 Row density: see S4.
- P1 Header is three stacked controls (segmented picker, day strip with 56 x 64 bordered chips, then a separate row of four filter chips, then a count line). It uses about 330 pt before the first class (`light/book.png`). Fix:
  - Put the day strip in the toolbar area as a `.safeAreaBar(edge: .top)` with `.scrollEdgeEffectStyle(.soft, for: .top)`; draw days as plain text (weekday over number) with a selected capsule, no outlines on the other days.
  - Replace the four filter chips by one `Menu` in the toolbar plus a single dismissible chip row only when filters are active. `Filters` already exists as a sheet.
  - The segmented `Picker` for Classes / Courts / Lanes / Kids club is fine (system).
- P1 Large nav title is replaced by an inline "Book" with the filter and tickets buttons merged into one glass capsule (`BookView.swift:21-34`). Use `ToolbarSpacer` to separate them and give the tickets button a label "My bookings" with `.labelStyle(.iconOnly)`.
- P1 Filter chips are 48 pt tall and the last one ("Club") is cut by the screen edge with no scroll hint. Chips need `.scrollTargetBehavior(.viewAligned)` or fewer chips.
- P2 The "Book" copper pill under the glass tab bar shows as a glow (`light/book.png` y=1650). Solved by S2/S3.
- Courts (`light/courts.png`): P1 rows read "4:30 a.m. Court 2 open" with only one court name per row. A court row should show the time range and all open courts as a compact set ("Courts 1 2 4"), as the foundation says courts are distinct. P1 "Duration" is a text row above two outline pill buttons: use a `Picker("Duration", selection:)` with `.pickerStyle(.segmented)`. P1 `Pickleball` single chip is a lone dark pill: use a segmented `Picker` for sport only if the club has 2 or more sports, otherwise a label. P2 "Arizona time" caption floats alone.
- Lanes (`light/lanes.png`): P1 rows read "1 of 8 lanes open · 1 lane with 1 of 2 swimmers" (two numbers in one sentence). Replace with `1 lane open` and `+1 lane to share`. Show lane numbers as 8 small rib-style cells per slot (one per lane: empty, one swimmer, full). This is the clearest way to make lanes "distinct".
- Kids club (`light/kids.png`): P1 rows are fine (block, spots) but the "Blocks" section has the same stripe in magenta for every row; OK. P2 "Ages 6 months to 12 years" rule line: use a `Section` footer.
- Paused state (`light/paused.png`): P1 button reads "Booking paused to Oct 30", a wide outline capsule. Fix: show a disabled `Book` with a one-line reason under the time, or hide buttons and use the banner only. P0 (Jordan, `light/jordan.png`): the "Desert Flow Yoga" row has a 200 pt empty gap between the tags and the instructor, with a stray leaf icon. `FlowLayout` in `Style.swift:25-45` sizes children with `.unspecified` and does not cache, so "First-timers" and "Teen OK" labels get wrong sizes in one pass. Fix: replace `FlowLayout` here by a single `Text` line of tags, or `ViewThatFits`, and add a unit snapshot at 3 sizes. I did not find the exact cause.

### 5 Filters sheet (`light/filters.png`)
- P1 Sheet shows "Reset | Filters | Show 19 classes" as a custom bar: use `ToolbarItem(.cancellationAction)` Reset, `.confirmationAction` "Show 19 classes" and a `.navigationTitle`. P1 `Form` inside is correct; the club list is a plain `List` section with no selection indicator at the top (check is only on the selected one). P2 Open at `[.medium, .large]` with `.presentationBackgroundInteraction(.enabled(upThrough: .medium))` so the list updates visibly behind.

### 6 Class detail (`light/classDetail.png`, `classDetailFull`, `classDetailBooked`, `ax/classDetail.png`)
- P0 Fake "1/4" pager and VoiceOver "Photo 1 of 4" (S8).
- P1 The same facts appear three times: hero overlay (`with Marisol Vega · Thu, 6:00 a.m.`), coach row, and `facts` ("Thursday, Oct 29 · 6:00–6:45"), then the sticky bar repeats "4 bikes left" and the stats row repeats it as "Spots 4 bikes left". Fix: hero has the intended-shot caption only; one title block (`Climb Cycle`, then `Thu Oct 29 · 6:00–6:45 a.m.` in Archivo SemiBold, then `Cycle studio · Gilbert – Val Vista`); stats row only has Intensity and Spots; sticky bar has price/plan line and button only.
- P1 Booked state shows a green "You're booked" banner AND "Booked" in the sticky bar AND a "Cancel" outline button AND an ellipsis menu that also has "Cancel booking" (`light/classDetailBooked.png`). Fix: sticky bar button `Booked` (disabled glass, check icon) with the menu as the only way to cancel; remove the banner.
- P1 "Before you book" is a card with sub-rules and an amber triangle (`ClassDetailView.swift:171-182`). Fix: `DisclosureGroup("Cancellation and waitlist")` closed by default, with the one sentence that matters ("Free cancel until 4:00 a.m.") visible in the sticky bar caption.
- P1 Sticky bar: use `.safeAreaBar` (S3). The bottom bar is a `.bar` background with a hairline; on iOS 27 use the scroll edge effect instead.
- P1 "Also this week" uses `ClassCompactCard` with a 4 pt top stripe drawn with `UnevenRoundedRectangle` over a rounded card. Replace with a plain `List`-like row group of 3 times (`Thu 6:00 · 11 bikes left`).
- P2 Share and favourite are merged into one glass pill; use `ToolbarSpacer`.
- Keep: coach row with credential, 3-fact strip in Archivo, tabular numerals.

### 7 Success views (`light/confirmed.png`)
- P1 A 64 pt green check circle, a bold title, a green status pill "Confirmed", a card, a full-width copper button, "Share", and then a list that repeats "Add to calendar" (`Views/SuccessView.swift:19-35`). This is the textbook generated confirmation. Fix: no separate page. Dismiss to Class detail, which now shows `Booked`, and show a system-style confirmation: `.sensoryFeedback(.success)` plus a Dynamic Island / toast `Booked · Thu 6:00 a.m.` with Undo. If a page stays, use `ContentUnavailableView`-style: small `checkmark.circle` symbol in `.hierarchical` rendering, title `Booked`, then a `List` with the facts and rows (Add to calendar, Directions, Call). Delete the duplicate calendar button.
- P0 Double period (S7).
- P1 Waitlist success: same, plus the iOS notification prompt fires on top at the moment of joining (good timing, keep), but the page behind it says "Confirmed" in the nav title for a waitlist. Fix title: "Waitlist".

### 8 My bookings (`light/bookings.png`, `ax/bookings.png`)
- P1 Strike banner above the list is an amber card; the sentence "1 strike in 30 days. 3 pause new bookings for 3 days." is cryptic. Use "1 late cancel in the last 30 days. 3 late cancels pause new bookings for 3 days." in a `Section` header with a `NavigationLink("How strikes work")`.
- P1 "Fri. Oct 30" header has a stray period; the other headers use "Today". Fix the formatter.
- P1 Rows are white cards in an inset-grouped `List`: use the S4 row (time, title, club, status).
- P2 "Waitlists: 1 of 5" floats between sections; make it the `Waitlist` section header trailing text.
- Keep: grouped by Waitlist / Today / date, swipe to cancel, status text on each row.

### 9 Clubs (`light/clubs.png`, `ax/clubs.png`)
- P1 Map with a search pill and four filter capsules stacked on top of it hide pins ("Red Mountain" and "Downtown" labels are under the chips). The list below sits in a white rounded panel with a "5 clubs in map area" pill. Fix: use the native pattern: `Map` full screen, a bottom sheet `.sheet(isPresented: .constant(true))` with `.presentationDetents([.height(160), .medium, .large])`, `.presentationBackgroundInteraction(.enabled)`, `.interactiveDismissDisabled()` (spec 03 §9 asks for it; the builder chose a split). Search with `.searchable` on the stack and `.searchScopes`; filter chips become `searchScopes` or a `Menu`. The tab bar stays reachable because the sheet's top detent leaves it, as in Apple Maps.
- P1 Every club row uses the same thumbnail scene in a different tint. See S8: use five compositions.
- P1 Pins are hand-drawn capsules with name and ribs (`ClubPin`). They are legible, and the ribs are the brand, so keep, but use `.mapAnnotation` collision priority (`.annotationTitles(.hidden)`) and keep only the home pin expanded; show ribs only for the selected pin.
- P2 At AX the toolbar-less map takes the whole screen (`ax/clubs.png`); the list is unreachable. Fix with the sheet detents above.

### 10 Club detail (`light/clubDetail.png`, `ax/clubDetail.png`, `dark/clubDetail.png`)
- P0 AX clipping (S6).
- P1 Hero text block: club name in Archivo ExtraBold plus tagline plus photo caption in three sizes over a flat band. Tagline "Swim school, courts, and a kids club that kids ask for." is the kind of line DESIGN-DIRECTION flags as hype; use "Lap pool, courts, kids club."
- P1 "Live now" section wraps a chart in a card with a weekday segmented selector made of custom letters "T W T F S S M" (`ClubDetailView.swift:~85`). Fix: `Picker` with `.pickerStyle(.segmented)` and full weekday abbreviations, or tap-to-scrub with `chartXSelection`.
- P1 Sticky "Directions | Book here" bar: S3.
- Keep: Hours sheet (`light/hours.png`) is a clean `List` with today marked. Make the hours sheet `[.medium]` and the row for today bold only.

### 11 Reserve sheets (`light/reserveCourt.png`, `reserveKids.png`)
- Works: 5-minute hold with "Add 5 minutes", court list with "Taken" disabled. Good state design.
- P1 Hold timer is a warning-yellow banner for a normal state. Use `Text(timerInterval:)` in the sheet's nav subtitle and a toolbar `Button("Add 5 min")`. Reserve the amber for the last 60 seconds.
- P1 Kids club: children as `List` rows with empty circles: use `Toggle` rows or `List(selection:)` with the system multi-select checkmark. The "Reserve spots" button is disabled and copper-tinted-grey; at 14% contrast. Use `.disabled` on a `.borderedProminent` button so the system draws it.
- P1 "Cancel" at top-left plus the hold banner: fine. Add `.interactiveDismissDisabled(holding)` with a confirmation (check that it exists).

### 12 Cancel sheet and waitlist sheet (`light/cancelSheet.png`, `light/waitlistSheet.png`)
- P1 The late-cancel sheet uses red x-circle rows ("Counts as a strike (2 of 3 in 30 days)") plus three buttons stacked ("Keep my spot", "Reschedule instead", "Cancel booking"). A native `confirmationDialog(_:item:)` (SDK 27) with a destructive "Cancel booking" and a message "This is a late cancel. It counts as strike 2 of 3." matches the platform and halves the height. Use the sheet only when it is early (free) and needs no warning.
- P1 Waitlist consent uses a custom checkbox: `Image(systemName: agreed ? "checkmark.square.fill" : "square")` in a `Button` (`Views/Sheets.swift:165`). That is a hand-drawn control. Fix: `Toggle("I understand the late-cancel rule.", isOn: $agreed)`, which is also what spec 03 §13.3 says. The copy "we hold it for you until 5:15 a.m. (1 hour before)" is confusing: say "We add you until 5:15 a.m. (1 hour before class). When a spot opens, you get 30 minutes to confirm."
- P1 The sheet has a "Close" glass button but no nav title; the title is in the body. Use `NavigationStack` with `.navigationTitle("Join waitlist")`, and `Join waitlist` in the toolbar `.confirmationAction`.
- Flow check: waitlist join, notification prompt, #4 on success page: works. Hold, confirm and release: seen through `-state hold` (`light/hold` on Today): works. Late cancel: strike counts, undo toast not captured on screen.

### 14 Check-in pass (`light/pass.png` via `dark/pass.png`, `ax/pass.png`, `light/checkedIn.png`, `light/seeDesk.png`, `light/frozenPass.png`)
- Keep: Saguaro Night pass card, QR on white, big member number in Archivo, brightness boost with restore, hidden-code states, "Scan accepted".
- P1 Pass sheet is a full-height `.large` sheet. Make it `[.medium, .large]` with `.presentationDetents` and `presentationBackground` night so it comes up fast at the door.
- P1 Checked-in state replaces the QR with a white square and a green check (`light/checkedIn.png`). Keep the card, shrink the QR to a small token, show "Checked in 5:40 a.m." as the card's headline.
- P1 The "See the front desk" state shows a copper "Call the front desk" button (phone `(480) 555-0142`) while Today shows `(480) 555-0100` (`TodayView.swift:80` vs `PassView.swift:75`). Two different numbers for the same desk. Use one constant.
- P1 "Demo: simulate a desk scan" row is visible in the production list (`PassView.swift:118`). Hide it behind `#if DEBUG` or Settings > Demo controls.
- P2 `UIApplication.shared.isIdleTimerDisabled` and screen brightness are set (good). Add `ScenePhase` restore on `.background` (exists).

### 15 Progress (`light/progress.png`)
- P1 "6 weeks in a row", then "6-week streak" again two blocks later; "Weekly goal: 3" and "2 of 3 visits" say nearly the same. Merge into one block. This is the "stat tiles" pattern in disguise (one card with three metrics).
- P1 Visits per week bar chart: the "Goal 3" label overlaps a bar, and green/copper bars use colour alone for met/not met (`light/progress.png`). Fix: `RuleMark(y: .value("Goal", goal)).annotation(position: .top, alignment: .leading)`, bar `foregroundStyle` plus a check symbol on met weeks (present) and a pattern or text for unmet.
- P2 Add the `Show as table` toggle visibly (it hides under the accessory).

### 16 Coach profile (`light/coach.png`)
- P1 A 340 pt stock photo block for a coach. Make it a 120 pt avatar header (monogram is fine until photos exist) and move "Book a session" into a `safeAreaBar`. P1 Chips (specialities) use the pill style; plain `Text` with `·` separators would do. Keep the bio and the credential line.

### 17 You (`light/you.png`, `ax/you.png`)
- P1 The check-in pass row has "Check-in pass 0042 1187 · Val Vista" wrapped into 4 lines next to a copper "Show pass" capsule (`light/you.png`). Fix: `LabeledContent` row, "Pass" and "0042 1187" with the button in the row's swipe or as the whole row's tap.
- P1 Activity and Membership are in rounded sections with SF Symbols in tinted tiles? They are plain symbols (good), but the symbols vary in weight (`ticket` vs `chart.bar` vs `creditcard`): set `.symbolRenderingMode(.monochrome)` and `.fontWeight(.regular)` for all rows, and use `Label` so the system aligns icon columns.
- P1 At AX the profile row breaks into 6 lines (`ax/you.png`). Use `LabeledContent`, and drop "Member since March 2025" to a second line `.caption`.

### 18 Membership (`light/membership.png`)
- P1 The "Current plan" card with a check pill, a copper outline, a disabled "Your plan" button, then "Next bill: Nov 12 · $117.00" in a floating line, then "Next renewal Nov 12 · $117.00" again inside the card. Fix: a `List`: `LabeledContent("Plan", value: "Ridge $79/mo")`, `LabeledContent("Next bill", value: "Nov 12 · $117.00")`, and the family lines in "Billing" section. Remove the disabled "Your plan" button; put `Change plan` as a row.
- Fact check: next bill $117 = 79 + 19 + 19. Correct.

### 19 Plans and Compare (`light/plans.png`, `light/compare.png`)
- P1 Plan cards: Ridge is a Saguaro Night block, with a ghost "Your plan" button, in a stack of three same-shape cards with check lists. Plans are real picks, so cards are right, but the dark block makes the current plan the loudest item. Fix: current plan gets a thin accent border and a `Current` label; the plan the member can switch to gets the `.borderedProminent` button. Use a segmented `Picker` for Trailhead / Ridge / Summit with one detail panel under it (Apple's "Compare" pattern), and keep the compare table.
- Keep: compare table sheet: tight, scannable, tabular, correct rows.

### 20 Freeze (`light/freeze.png`)
- P0 Fact check passes: request Oct 27, first billing date at least 30 days out is Dec 12, 2 months, ends Feb 11, restart Feb 12, $10/mo = $20. Correct against the foundation.
- P1 "Let's hit pause." (S7). The segmented "1 month / 2 months / 3 months" is the right control. The summary card, three check rows, then a sticky "Freeze membership" button: use a `Form` with `Section` and a `Picker`, button as the last `Section` row with `.buttonStyle(.borderedProminent)`, as spec 03 §20 says (`Form`).

### 21 Family, Family member, 22 Add member (`light/family.png`, `familyMember.png`, `addFamily.png`)
- P1 Family top row: three 56 pt monogram circles "M M E" and a "+ Add member" dot (an avatar strip), then the same people listed again below. Duplicate. Remove the strip.
- P1 Info card at top of Family explains prices; use a `Section` footer.
- P1 Add member sheet: `Picker` rows use a hand-made checkmark list ("Adult +$39/mo / Child +$19/mo") instead of a segmented `Picker`; `Stepper` for age is correct. The guardian `Toggle` is correct.
- P2 Family member: "Remove from plan" is red text in a row, correct. Make it ask with `confirmationDialog`.

### 23 Guest passes (`light/guest.png`, `light/guestShare.png`)
- P0 The guest-pass card renders as a 20 pt dark bar at the top-left of a white box with the sentence below (`light/guest.png`). It looks broken, and 70 percent of the screen is empty. Fix: design the pass as a real object (a ticket shape with `1 guest pass left`, reset date, and the rules), or use a `List` with `LabeledContent("Passes left", value: "1")`, `LabeledContent("Resets", value: "Nov 12")` and the rules as a footer. The share sheet repeats the rule "Valid 14 days" twice (once in the screen, once in the sheet, with different wording: "from the day you send it" vs "from today (until Nov 10)"). Keep the dated one only.

### 24 Inbox, 25 Settings, 26 Search, club switcher
- Inbox (`light/inbox.png`): native enough. P2 unread dots are copper with no accessibility value beyond text; add `.accessibilityValue("unread")`.
- Settings (`light/settings.png`): `Form`, `Toggle`, `Picker`. Good. P1 A "Demo controls" section must be behind `#if DEBUG` before release. P2 Settings is reached under You; also add it as a gear in the toolbar (it is).
- Search (`light/search.png`): system search tab (`role: .search`). Good. P1 Suggestions render as copper link text lines with no icons; use `Label` rows with `magnifyingglass`, category symbols, and `.searchSuggestions` with `.searchCompletion`. The empty state with the keyboard up has a big blank area.
- Club switcher sheet (`light/switcher.png`): a blur blob of copper shows behind the "Club" title (the glass lens of a copper button under the sheet). P1 the "Club or city" search field overlaps the last row; use `.searchable(text:)` in the sheet's `NavigationStack` instead of a custom field.

### States checklist (Demo controls)
| State | Reached | Result |
|---|---|---|
| Held spot | `-state hold` | OK (`light/hold`; `dark/hold.png`) |
| Waitlist offered / joined | hand flow | OK |
| Paused (3 strikes) | `-state paused` | Banner OK; row button copy needs work (Book section) |
| Payment failed day 2, 9, 16 | `-state paymentFailed`, `paymentPaused`, `seeDesk` | Day 2 and day 16 pass shown; copy OK; phone numbers differ |
| Offline | `-state offline` | OK (banner, saved time) |
| Stale busyness | `-state stale` | OK, but duplicate sentence |
| Frozen | `-state frozen` | Today still shows the booking and "Show pass": bug |
| Teen restricted | `-persona jordan` | Filtered to Teen OK classes; row layout bug |
| Empty | `-state empty` | OK; copy repeats |
| Checked in | `-state checkedIn` | OK |

Not captured (not blocking): late-cancel undo toast, clash alert, Add to calendar, drop-in state rows, plan change quote.

---

## Widgets, Live Activity, intents

What I read (`CactusPeakWidgets/CactusPeakWidgets.swift`, `Support/LiveActivityManager.swift`). I did not render widgets in the simulator, and the build notes also say they were not rendered, so the layouts are unverified.

What a real member wants: (1) glance at the lock screen at 5:40 a.m. and see "Climb Cycle 6:00, Cycle studio, bike 7" with a live countdown; (2) one tap to the QR pass at the door; (3) club busyness before leaving home; (4) a kids club check-in time.

- P0 `SnapshotProvider.getTimeline` returns one entry and reloads in 15 min. The "next class" widget keeps showing a class that has started or ended until the app runs again. Fix: return one `SnapshotEntry` per boundary (booking start, start + 15 min, end) with `policy: .atEnd`, and make the entry compute "next" from its own `date`. Set `relevance` (`TimelineEntryRelevance(score:duration:)`) around the booking so the Smart Stack rotates it up 60 minutes before.
- P1 Countdown copy in widgets is static text ("Starts in 19 min" is not in widgets, but `n.start.cpTime` is). Use `Text(n.start, style: .relative)` or `Text(timerInterval:)` for the countdown, as the Live Activity does.
- P1 Widgets are not configurable. Move to `AppIntentConfiguration` with a `ClubEntity` parameter (App Intents already exist) for Club now, so Priya (Downtown) and Maya (Val Vista, plus Dobson on Saturdays) get their own club. `AppIntentTimelineProvider` is the API.
- P1 `NextAndPassWidget` hard-codes `Color.surface` and `Color.nightSurface` fills in a `RoundedRectangle(cornerRadius: 14)` (`CactusPeakWidgets.swift:~158`). On iOS 27 tinted and clear widget modes this loses contrast. Use `.containerBackground(for: .widget)` and `widgetRenderingMode` to switch fills; use `AccessoryWidgetBackground()` and `.widgetAccentable()` for the rib meter and time only.
- P1 The pass widget is a lock-screen qrcode circle that opens `cactuspeak://pass`. Good. Add a Control (already `ShowPassControl`) with `ControlWidgetButton(action: OpenURLIntent)`; add an Action Button intent and a "Show my pass" `AppShortcut` phrase (spec lists it; verify the phrase is in `AppShortcutsProvider`).
- P1 Live Activity Lock Screen view uses a 40 pt copper-tinted circle with a category symbol (`LockScreenActivity`, `.background(Color.dawnCopper.opacity(0.2), in: Circle())`): the tinted-circle-icon pattern. Replace with the symbol only (`.symbolRenderingMode(.hierarchical)`), and give the time the Archivo 28 treatment: `6:00 a.m.` big, countdown chip right, room and club under. Add a 'Show pass' `Button(intent:)` (iOS 17+ interactive) as the one action. Copy "Done. Nice work." is hype (S7).
- P1 Phase is only updated by the running app (`LiveActivityManager.sync`), so when the app is not running the countdown still works (timer text) but the phase label ("Check in open", "Ends 6:45") stays stale. Use `Text(timerInterval:)` for ends-in too, and set `staleDate` to the class end (set to end + 15 min now, fine). Push-to-start is not built (noted in build notes; fine for this build, required for production).
- P2 Dynamic Island compact trailing uses `.frame(width: 44)` for the timer: at `1:23:45` it truncates. Use `.frame(maxWidth: 60)` with `.minimumScaleFactor(0.8)`.
- P2 Large Today widget: 3 upcoming rows, club ribs, and a `Show pass` bar: good, dense, keep. Rows use the 4 pt category stripe (fine).

---

## Accessibility notes (code and screens)
- VoiceOver: 115 `accessibility*` modifiers. Good: combined next-up label, class row `accessibilityAction(named: "Book")`, `.updatesFrequently` on busyness, ribs hidden with text equivalents. Gaps: (1) fake "Photo 1 of 4" (S8); (2) `ClassRow` uses `.accessibilityElement(children: .contain)` and a nested `Button`, so VoiceOver reads time, name, badges and status as 6 stops per row. Fix: `.accessibilityElement(children: .combine)` on the text block and one custom label: "6:00 a.m., 45 minutes. Climb Cycle. Cycle. Intensity 4 of 5. Marisol V., Cycle studio. 4 bikes left." plus `.accessibilityAction(named: "Book")`. (3) Hold countdown: post `AccessibilityNotification.Announcement` at 5 min, 1 min, expiry.
- Targets: filter chips 44+ (ok), the pass accessory close button 44 (ok), small `Book` buttons in S4 need `.contentShape` and 44 pt padding.
- Reduced motion: only the bounce and pass ring honour it; `.animation(.snappy)` on toast and spring on chips do not. Add `@Environment(\.accessibilityReduceMotion)` wrapper `func motion<T>(_ a: Animation) -> Animation?`.
- Contrast: Increased Contrast not tested. Check `textMuted` on `surface` and `surfaceMuted` (S10).
- Dynamic Type: reflow works on Today, Class detail, Pass, You (good use of `AnyLayout`); fails on the items in S6.

---

## Missing from spec (not built, or built differently)
- Loading skeletons and "Can't load" error states (03 §3, §4, G3).
- Clubs persistent bottom sheet with detents (built as a split).
- Class detail photo pager (a pill shows without a pager).
- `swipeActionsContainer()` for Today "Coming up" rows (spec 03 §3 composition).
- Time Sensitive notifications, alternate app icons, widget club configuration, Live Activity push-to-start, Spotlight indexing, iPad split layouts, Face ID `LAContext` beyond a gate, HealthKit card (all listed in BUILD-NOTES).
- Custom `cp.*` symbols and Archivo expanded width 112-125 (headline big numbers are normal width).
- Link-membership step in sign-in.
- Today "Next up" uses a static string for "starts in N min" instead of a relative `Text` style (spec 03 §3).
- Next-up buttons: spec says `.glassProminent` / `.glass`; the build draws custom capsules (only Welcome uses `.glass*`).
- Frozen state must cancel bookings in the freeze window (foundation).

## Keep (do not lose these in the rework)
- Native skeleton: `TabView` with `Tab(role: .search)`, `.sidebarAdaptable`, `.tabBarMinimizeBehavior`, `NavigationStack` per tab with typed `AppRoute`, one `AppSheet` enum, `.topBarPinnedTrailing` pass button.
- The rib meter as the one brand device (busyness, intensity, capacity, weekly goal, step progress), with text equivalents.
- Archivo ExtraBold for the next-up time and the pass member number, tabular numerals everywhere.
- Category colour plus symbol plus word (never colour alone).
- Booking rule engine and its copy: 2-hour cancel, strikes, 5-list waitlist cap, 30-minute hold with countdown, clash prompt, court and lane windows, kids club "no strikes", freeze dates and price.
- Honest states in place: offline banner with saved time, dashed ribs for stale busyness, "Code hidden" pass states, payment-failed ladder by day.
- Flat, gradient-free, art-directed photo slot approach (extend it; do not remove it).
- Pass screen: brightness boost with restore, idle timer, announcement on check-in.
- Dark mode (tokens are well chosen; copper on night passes).
- Compare plans table; Hours sheet; Settings `Form`; Inbox; Search tab.
- Debug launch arguments and Demo controls (made review of every state possible; keep behind `#if DEBUG`).

## Top 10 (impact order)
1. S4 + Book: rows are about 190 pt, not a dense timetable (`ClassCards.swift:21-95`).
2. S1 + Today: stack of rounded white cards, three headings, wrong priority order (`TodayView.swift:13-27`).
3. S3: Show pass accessory, tab bar and sticky bars stack and hide content (`RootView.swift:36-44`, `ClassDetailView.swift:65`).
4. S6: AX XXXL breaks (accessory "Show…", Club detail hero clipped, "Ridg e", "Holdi ng", Book header fills the screen).
5. P0 Frozen state still shows the booking and Show pass on Today (spec: freeze cancels bookings, no check-in).
6. S2: custom capsule buttons and chips imitate glass buttons; copper glow bleeds through the tab bar.
7. P0 Fake "1/4" pager, VoiceOver "Photo 1 of 4", and the photo caption repeats facts (`ClassDetailView.swift:78-83`).
8. P0 Copy bugs: "4:00 a.m..", "p.m.. Quietest around 2 p.m..", "Fri. Oct 30"; two different desk phone numbers; "Let's hit pause." (S7).
9. P0 Guest pass card renders broken; Jordan's schedule row has a 200 pt gap (`FlowLayout`, `Style.swift:25-45`).
10. Success views and sheets: big green-check page, custom checkbox for the waitlist (`Sheets.swift:165`), late-cancel sheet instead of `confirmationDialog`; widgets with a one-entry timeline.
