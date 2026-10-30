# Cactus Peak iOS member app: design review 2

Reviewer: senior iOS design critic. No project file was changed. Build: Debug, iPhone 18 Pro simulator, iOS 27.2, derived data `/tmp/cp-ios-review2`.
Screenshots: `screenshots/review-2/light/` (screens and `flow-*.png`), `dark/`, `ax/` (Accessibility XXXL), `contrast/` (Increased Contrast on).
Paths are relative to `ios/CactusPeak/` unless they start with `CactusPeakWidgets/` or `Shared/`.
Simulator reset at the end: light, `large`, Increased Contrast off.
Not done: widgets were not rendered (there is no `#Preview` and I did not edit the project to add one). They are reviewed from code only. `-screen pass` and `-screen membership` with other flags did not open their screen in my runs, so `light/pass.png` and `dark/pass.png` show Today. The pass was reached by tapping (`flow-pass-checkedin.png`, `pass-seeDesk.png`). Haptics were read from code, not felt.

## Verdict (5 lines)
1. Build 2 fixed the real defects of build 1: Book is a true 2-line timetable, Today is a `List`, the freeze, guest pass, Jordan row, success page, waitlist consent and desk number bugs are gone, and AX XXXL works on most screens.
2. It is now a good native app, about 75 percent of the way to designer-made. The remaining LLM tells are the copper capsule button used for everything, the white rounded card behind every grouped section, the pastel tinted-tile onboarding grid, and one flat Rib Peak silhouette reused for every class and club photo slot.
3. Three things still read as broken to a member: the time-clash alert says "5:30 a.m.. Book both?"; closing the court sheet after a successful reserve flashes a red "Your hold ended" banner and fires the error haptic; the late-cancel toast has no Undo and the free-cancel flow still opens a three-button stacked sheet.
4. Chrome is still crowded on root tabs: the "Show pass" accessory sits over rows on Today, Book, Courts, Lanes, Kids and You, duplicates the "Show pass" button right above it on Today, and stacks with the toast and the tab bar. Courts and Lanes spend 700 pt of header before the first slot.
5. Loading and error states exist only on Today and Book; the checked-in pass, Clubs split, Membership, Freeze, Coach, onboarding grid, widgets and Live Activity are unchanged from review 1, and the onboarding grid now breaks into one letter per line at AX XXXL.

---

## REVIEW-1 items: verification

Status is the builder's claim in BUILD-NOTES "Review 1, response". "Verified" means I saw it in my own screenshot.

| ID | Builder status | Verified | Note |
|---|---|---|---|
| Frozen state (P0) | Fixed | Yes | `light/state-frozen.png`: Today shows a frozen row, no Next up, no Show pass; accessory off. Demo copy says "restarts on Feb 20" while the Freeze screen says "ends Feb 11, restarts Feb 12". Both are demo data, but make one date source. |
| Fake "1/4" pager (Class detail) | Fixed | Yes | `light/classDetail.png`. Pill gone. New: Club detail still shows "1/4" plus 6 dots of different size (`light/clubDetail.png`). See N9. |
| Double periods | Fixed | **No** | `flow-clash-alert.png`: "You have Rib Rack Strength at 5:30 a.m.. Book both?" Source `App/RootView.swift:56`. Success copy and Club caption are fixed. |
| "Fri." header | Changed | Yes | "Friday, Oct 30" in `flow-late-cancel-toast.png`. |
| Two desk numbers | Fixed | Yes | Pass desk state shows (480) 555-0142, the club number (`pass-seeDesk.png`). |
| "Let's hit pause." | Fixed | Yes | `light/freeze.png`: "Freeze your membership". Live Activity copy "Class finished" confirmed in code. |
| Guest-pass card | Fixed | Yes | `light/guest.png`: now `List` rows. Still 70 percent empty; see N14. |
| Jordan row gap | Fixed | Yes | `light/jordan.png`: no gap. |
| S1 Today as List | Fixed | Partly | Order and one heading are right (`light/today.png`). It is still a white rounded card for Next up, a second white card for Coming up, a third for Club now, with a 1 pt stroke look. See N3. |
| S2 System buttons | Fixed | Partly | Glass toolbar and `.glassProminent` on Next up work. Book rows, Reserve, Freeze, Share guest pass and Add family member are still large copper capsules. See N4. |
| S3 Chrome | Fixed | Partly | Accessory is off on pushed screens and at AX. It still sits over content on every root tab. See N2. |
| S4 Book timetable | Fixed | Yes | `light/book.png`, `light/jordan.png`: about 68 pt rows. Only 4 rows show on first screen because the header is still about 330 pt. See N5. |
| S5 Loading and error | Partly | Yes | Redaction only in `Views/TodayView.swift:43` and `Views/BookView.swift:149`. Nothing else. |
| S6 AX XXXL | Fixed | Mostly | Today, Book, Class detail, Bookings, You are fine. New breaks: onboarding interests, Club detail hero, Membership check rows, Freeze sticky button, Courts club picker, Clubs map. See N6. |
| S7 Copy | Fixed | No | Clash alert still has the double period. |
| S8 Photo slots | Partly | Yes | Clubs differ by composition. Class slots still share one silhouette per category. "Photo to come:" prefix is shown to members. See N10. |
| S9 Haptics, motion | Partly | Yes (code) | 10 `sensoryFeedback` uses. No zoom transition, no `.warning` on late cancel. See N8. |
| S10 Contrast | Not changed | Checked | Not a defect. `TextMuted` is 5.9:1 on white and 5.2:1 on Background. Colour sets have contrast variants and Increased Contrast renders correctly (`contrast/*.png`). Only the Welcome orange fails (N11). |
| Success page replaced | Fixed | Yes | `flow-book-toast.png`: inline Booked state plus toast "Add to calendar". Works. |
| Waitlist consent Toggle | Fixed | Not re-tested | Seen in code. Not walked again. |
| Late cancel dialog | Fixed | Yes | `flow-late-cancel-dialog.png`. Works. Free cancel still opens a sheet (N7). |
| Widget timeline | Fixed in code | Code only | Per-boundary entries exist in `CactusPeakWidgets.swift:36-56`. Not rendered. |
| Book toolbar spacers | Fixed | Yes | Filter and tickets are separate glass items. Today bell and QR are still one merged pill (`light/today.png`). |
| Count and filter row only when filters active | Fixed | Partly | "19 classes · Gilbert – Val Vista" still shows with no filter. |
| Sport, duration segmented | Fixed | Yes | `light/courts.png`. |
| Bookings strike copy and link | Fixed | Yes | Still an amber card. |
| Family strip removed | Fixed | Yes | `light/family.png`. |
| Plans no longer highlight current | Fixed | Partly | Current plan has a copper outline and a "Current plan" pill plus a "Your plan" row inside; three redundant markers. |
| Progress streak not repeated | Fixed | Yes | `light/progress.png`. |
| Class detail dedupe, one Booked button | Fixed | Yes | `light/classDetailBooked.png`. |
| "Closest" no longer wraps | Fixed | Partly | Badge fixed, but "2.1 mi" now wraps to "2.1 / mi" (`light/onboarding1.png`). |
| Demo rows in DEBUG only | Fixed | Yes (code) | |
| Search suggestions with icons | Fixed | Yes | `light/search.png`. |
| Widget compact timer width | Fixed | Code only | |
| Not fixed: onboarding grid, Clubs sheet, Membership List, Coach header, Freeze Form, Add member Picker, per-screen loading, checked-in pass, widget config/tint, Live Activity icon/button, swipeActionsContainer, reduce-motion wrapper | Not fixed | Confirmed | All still as in review 1. |

---

## Flow walks (by tapping)

| Flow | Result | Screenshot |
|---|---|---|
| Book a class | Works. Tap Book, the row flips to "Booked" in place with `.success` haptic. Toast "Booked · Thu 5:30 a.m." and "Add to calendar". The toast sits over the Show pass accessory and the last row (hard-coded `padding(.bottom, 96)`). A booked row still shows a warning triangle with "5 spots left", which makes a successful state look like an alert. | `flow-book-toast.png` |
| Add to calendar | Works. System `EKEventEditViewController` opens, title "Rib Rack Strength · Gilbert – Val Vista", location, 30 min alert. First 1 to 2 seconds show a blank grey sheet before the editor draws (the `EKEventStore` is created in `makeUIViewController`, `Support/PlatformViews.swift:37`). | `flow-calendar.png` |
| Time clash | Alert works (Cancel, Keep both). **Bug: "5:30 a.m.. Book both?"** | `flow-clash-alert.png` |
| Waitlist, hold, Confirm spot | Hold card, countdown "Confirm spot · 29:57", Confirm flips the Coming up row to Booked with a toast. Works. Toast "Booked · Wed 5:30 p.m." again stacks over the accessory. | `light/state-hold.png`, `flow-waitlist-confirmed.png` |
| Late cancel | `confirmationDialog` shows "This is a late cancel. It counts as strike 2 of 3 in 30 days." with a red "Cancel booking". Strike banner updates to "2 late cancels". Toast "Cancelled. That counts as a late cancel." has no Undo (correct by spec, but there is no `.warning` haptic). The dialog is a floating popover with no visible "Keep my spot"; users must tap outside. | `flow-late-cancel-dialog.png`, `flow-late-cancel-toast.png` |
| Free cancel and Undo | Swipe, red "Cancel" action, then the custom sheet: Close pill, centred "Keep my spot" (copper), "Reschedule instead", red "Cancel booking", then a reason list. Cancel gives the toast "Cancelled. Undo". Undo works but the toast floats mid-screen over a row. | `flow-free-cancel-sheet.png`, `flow-undo-toast.png` |
| Reserve court | Sheet with 5-minute hold banner, duration, six court rows (five "Taken"), "Reserve court" at the end of the scroll. **Bug: after a successful reserve the sheet shows a red "Your hold ended. Pick the time again. Hold again" banner while it dismisses, and fires `.error` haptic.** Cause: `AppModel.reserveCourt` sets `hold = nil`, and `holdBanner` treats `hold == nil` as expired (`Views/Sheets.swift:264`). Slot then correctly reads "Full". | `flow-court-reserve.png`, `flow-court-hold-ended.png` |
| Reserve lane, kids club | Same sheet. Lane rows say "1 of 8 lanes open · 1 lane with 1 of 2 swimmers" still (`light/lanes.png`). Kids rows fine (`light/kids.png`). Not re-walked to the end because the court bug is shared. | `light/lanes.png`, `light/kids.png` |
| Check-in pass | Opens from the toolbar QR or Next up button. Saguaro Night card, Archivo number. Checked-in state still replaces the QR by a big white square with a green check, still shows "Code refreshes every minute" and "Checking in at ... Change". On Today after check-in the QR toolbar item dims with no reason and Next up still reads "Starts in 19:56" with "Show pass". | `flow-pass-checkedin.png`, `light/state-checkedIn.png` |
| Freeze | Segmented months, dates and price are right. Confirmation is a custom sheet with a hero pause circle and two stacked buttons (should be a `confirmationDialog`). A copper blur from the sticky button bleeds through the sheet glass at the bottom. | `light/freeze.png`, `flow-freeze-confirm.png` |
| Plan change | Quote sheet is accurate ("Takes effect on Nov 12", three losses). Losses are red X rows; the confirm button wraps to two lines ("Switch to / Trailhead") and the two buttons have unequal widths. | `flow-plan-quote.png` |
| Guest pass | Screen is `List` rows plus a copper capsule in empty space. Share sheet says "Valid 14 days from today (until Nov 10)" (good, dated), the screen behind says "from the day you send it". | `light/guest.png`, `light/guestShare.png` |

---

## New issues, ranked

### P0 (wrong or broken)

**N1. Clash alert double period.** `App/RootView.swift:56`. `existingTime` already ends in a period. Fix: end the first sentence with the time's own period and start a new sentence: `Text("You are already booked in \(c.existing) at \(c.existingTime) Book both?")`. Then add a unit test that formats every message builder and asserts `!s.contains("..")`. Screenshot `flow-clash-alert.png`.

**N2. Success reserve flashes "Your hold ended" and fires an error haptic.** `Views/Sheets.swift:261-266` and the `reserveCourt`, `reserveLane`, `reserveKids` functions in `Model/AppModel+Reserve.swift` (`hold = nil` on success). Fix: add `@State private var reserved = false` (it exists: `reserved`); in `holdBanner` branch on it: `if reserved { EmptyView() } else if let h = model.hold ... else Banner(...)`. Move `.sensoryFeedback(.error, trigger: model.hold == nil)` to fire only when `model.hold == nil && !reserved`: `.sensoryFeedback(.error, trigger: holdExpired)` where `holdExpired` is set by `model.tick()` on expiry. Also dismiss the sheet before clearing the hold (`router.dismissSheet(); model.hold = nil`). Screenshot `flow-court-hold-ended.png`.

### P1 (LLM look, non-native pattern, spec miss)

**N3. Today is still three white rounded cards.** `Views/TodayView.swift` (Next up card ~line 170-210, Coming up, Club now). Fix: make Next up a flat first row, not a card: `Section { NextUpRow }` with `.listRowBackground(Color.clear)` and `.listRowSeparator(.hidden)`; draw the 6:00 in Archivo 56 `.tracking(-1)` on the page background. Keep one grouped `Section` for "Coming up". Use `.listStyle(.insetGrouped)` with `.scrollContentBackground(.hidden)` once, not custom card fills. Use `ConcentricRectangle` for the row corners so they nest with the screen corner radius: `.listRowBackground(ConcentricRectangle().fill(Color.surface))` with `.containerShape(.rect(cornerRadius: 28))` on the list. Next up title "Climb Cycle" wraps to two lines next to the glyph; stack the glyph with the eyebrow instead: `Label("Starts in", systemImage: category.symbol)` then time, then name on one line.

**N4. Copper capsule on every action.** Book rows (`Components/BookingButton.swift`), "Reserve court", "Share a guest pass", "Add a family member", "Freeze membership", "Switch to Trailhead", onboarding "Continue", "Book a session". In a list this is the "button on everything" look. Fix by role:
- In list rows use a quiet text action: `Button("Book") {...}.buttonStyle(.bordered).buttonBorderShape(.capsule).controlSize(.small).tint(.brandAccent)` (tinted light fill, not solid). Keep the solid copper `.borderedProminent` for one primary action per screen.
- Sticky bottom primary actions: `.buttonStyle(.glassProminent).tint(.brandAccent).controlSize(.large)` inside `.safeAreaBar`. In a `Form` use `Section { Button("Freeze membership") {...}.frame(maxWidth: .infinity) }.listRowBackground(Color.brandAccent)` with white label, which is the native full-width row button.
- "Add a family member", "Share a guest pass": use `Label` rows (`Button { } label: { Label("Add a family member", systemImage: "plus") }`) as the last row of the section.
Files: `Views/FamilyViews.swift`, `Views/YouViews.swift` (guest), `Views/Sheets2.swift`, `Views/WelcomeFlow.swift`.

**N5. Header still takes about 330 pt on Book; Courts and Lanes take 700 pt.** `Views/BookView.swift`. `light/book.png`, `light/courts.png`, `light/lanes.png`. Day strip has big empty space above and below, "19 classes" row and "EARLY MORNING" with 40 pt gap, and a clipped "S" at the right edge next to the calendar button. Fix: (a) reduce the strip to one 56 pt line: weekday letter over number, selected state as a capsule, no per-day counts unless filtered; (b) drop the "N classes · club" row (club goes in the nav subtitle: `.navigationSubtitle(club.shortName)`); (c) make the strip `.scrollTargetBehavior(.viewAligned)` and `.contentMargins(.horizontal, 16, for: .scrollContent)` so the last chip never clips; (d) in Courts/Lanes move club menu, sport and duration into one toolbar `Menu` or a single compact `HStack` and put the rules text in the list `Section` footer. Courts should list slots from y=330, not y=700. Also show a court row as "4:30 a.m.  Court 2" with the time in Archivo SemiBold and drop the "Arizona time" caption floating alone (put it in the footer once).

**N6. AX XXXL breaks that remain.**
- Onboarding interests: tiles break into one letter per line ("S / tr"), `ax/onboarding2.png`. `Views/WelcomeFlow.swift:172`, `LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))])`. Fix: `let cols = dts.isAccessibilitySize ? [GridItem(.flexible())] : [GridItem(.adaptive(minimum: 150), spacing: 12)]`. Better, replace the grid (N7b).
- Club detail hero: tagline clipped ("for." cut), photo dots overlap the dark band (`ax/clubDetail.png`, `Components/ClubViews.swift` `ClubHero`). Fix: put name and tagline under the photo at AX with `.fixedSize(horizontal: false, vertical: true)`, and hide the dots.
- Membership: check rows hang under the check ("Courts, 3 / days ahead" wraps below the icon, `ax/membership.png`). Fix: `Label { Text(f) } icon: { Image(systemName: "checkmark") }` inside a `List` row (`Label` gives a hanging indent), and the "Current plan" pill wraps to two lines, so use `Text("Current plan")` with `.fixedSize()` or drop the pill (see N12).
- Freeze: the sticky 150 pt "Freeze membership" button covers the month picker (`ax/freeze.png`). Fix: `if dts.isAccessibilitySize { button in scroll content } else { safeAreaBar }`.
- Courts: the club menu becomes a five-line ellipse (`ax/courts.png`). Fix: `.lineLimit(2)`, `.fixedSize(horizontal: false, vertical: true)`, and `.buttonBorderShape(.roundedRectangle(radius: 12))` at AX instead of capsule.
- Clubs: map pins and chips overlap the search field, list is unreachable (`ax/clubs.png`). See N13.
- You: profile row is 6 lines with a hyphenated "Mem-ber" (`ax/you.png`). Fix: `LabeledContent` or two rows; remove `.hyphenationFactor` effects by writing "Ridge" and "Since March 2025" as separate lines.

**N7. Free-cancel flow is still a stacked three-button sheet.** `Views/Sheets.swift` `CancelSheet` (`flow-free-cancel-sheet.png`): centred copper "Keep my spot" as the primary action on a cancel flow, plus "Reschedule instead", plus red "Cancel booking", plus a reason list, all centred. Fix: use the same `confirmationDialog(item:)` as late cancel with message "Free cancel. You can rebook until it fills." and buttons "Cancel booking" (destructive), "Reschedule" and the system Cancel. Ask the reason after, as an optional `Menu` in the toast or in the Bookings row, not before. The late-cancel dialog also needs a visible keep option: `Button("Keep booking", role: .cancel) {}` is in code but the iOS 27 popover hides it; set `.dialogSeverity(.critical)` or anchor the dialog to the swiped row with `.confirmationDialog(..., item:)` on the row view rather than the root view (`App/RootView.swift:57`) so it anchors to the row.
**N7b. Onboarding interests grid still a rainbow of tinted tiles** (`light/onboarding2.png`): eight pastel tinted rounded tiles, each with an icon, a heavy outline and a black check circle when on. This is the "icon in tinted square grid" pattern. Fix: `List(Category.allCases, selection: $interests) { c in Label(c.title, systemImage: c.symbol).tint(c.color) }.environment(\.editMode, .constant(.active))`, which gives native multi-select, 44 pt rows, AX reflow and VoiceOver "selected" for free. Or a single `FlowLayout` of `Toggle(c.title, systemImage: c.symbol).toggleStyle(.button).tint(c.color)` (no pastel fill).

**N8. Haptics and motion are thin.** Only 10 `sensoryFeedback` uses and no `navigationTransition`. Add:
- Late cancel: `.sensoryFeedback(.warning, trigger: model.lastLateCancelID)` (add the property in `AppModel+Booking.swift:159`).
- Waitlist hold appears: `.sensoryFeedback(.impact(weight: .medium), trigger: hold?.id)` on Today.
- Day strip change: has `.selection` (keep).
- Pass check-in: `.sensoryFeedback(.success, trigger: model.checkedInAt)`.
- Zoom transition from Today "Coming up" row and Book row to Class detail: in the list `@Namespace private var ns`, row `.matchedTransitionSource(id: s.id, in: ns)`, destination `.navigationTransition(.zoom(sourceID: s.id, in: ns))`. Files: `Views/BookView.swift`, `Components/ClassCards.swift`, `Views/ClassDetailView.swift`.
- Replace the ad hoc `Animation` calls by one helper `@Environment(\.accessibilityReduceMotion) var rm` and `.animation(rm ? nil : .snappy(duration: 0.3), value:)` (`ToastView` transition, chips, `ScheduleDayStrip.scrollTo`).

**N9. Club detail pager is fake.** `light/clubDetail.png`. Says "1/4" but shows six dots of different sizes in a dark strip. The dots look like a bug. Fix: `TabView { ... }.tabViewStyle(.page(indexDisplayMode: .always))` with exactly 4 pages and system dots, or remove pager and dots until there are photos. Remove the "1/4" pill (`Components/ClubViews.swift`). Also replace the tagline "Swim school, courts, and a kids club that kids ask for." with a fact line ("Lap pool, courts, kids club.") as review 1 asked.

**N10. Photo slots.** "Photo to come:" prefix is shown to members (`Views/ClassDetailView.swift:75`). The caption should read as the intended shot only: "Cycle studio, 6 a.m., bikes lit, low sun" with a small `camera` symbol; move the "to come" meaning to a DEBUG flag. All Cycle classes use the same silhouette; all strength the same. Fix in `Components/Photo.swift`: add a `variant: Int` derived from `sessionID.hashValue % 3` that changes the composition (bike row, spin wheel arc, studio window) and swaps the sun position; cap at 3 variants per category. Add `.scrollEdgeEffectStyle(.soft, for: .top)` on the Class detail scroll view.

**N11. Welcome contrast.** `light/welcome.png`. The passkey button is white text on orange (2.8:1). `Views/WelcomeFlow.swift` welcome button: use `.foregroundStyle(Color.nightSurface)` (5.7:1) as the Increased Contrast screenshot already shows, or use `.buttonStyle(.glassProminent)` with `.tint(.nightSurface)`. Hero has a flat circle plus peak (keep) but the "Email me a code" secondary is a grey translucent capsule that reads disabled; use `.buttonStyle(.glass)` with white label.

**N12. Membership and Plans are still cards in cards.** `light/membership.png`: copper-outlined card with a "Current plan" pill, five green check rows, "Your plan" row, then "Next renewal Nov 12 · $117.00" inside, then outside "Next bill: Nov 12 · $117.00" again. Fix as in review 1: `List { Section("Plan") { LabeledContent("Plan", value: "Ridge · $79/mo"); LabeledContent("Next bill", value: "Nov 12 · $117.00"); NavigationLink("Change plan") } Section("Included") { ForEach(features) { Label($0, systemImage: "checkmark").symbolRenderingMode(.monochrome) } } }`. Plans (`light/plans.png`): green check on every line, three plans of equal weight. Use a segmented `Picker` for Trailhead, Ridge, Summit with one detail section under it, and make the switch button `.borderedProminent` only for the plan that differs. "Switch to Trailhead" is a grey capsule that reads disabled; use `.bordered`.

**N13. Clubs tab unchanged.** `light/clubs.png`, `Views/ClubsView.swift:31-43`. Search pill and chips hide the pins ("Red Mountain", "Downtown" under the chips); the list sits in a white panel with a "5 clubs in map area" pill. Fix: full-screen `Map` and a bottom sheet from a `.sheet(isPresented: .constant(true))` with `.presentationDetents([.height(180), .medium, .large])`, `.presentationBackgroundInteraction(.enabled)`, `.interactiveDismissDisabled()`, `.presentationBackground(.regularMaterial)`; `.searchable(text: $query)` inside the sheet's `NavigationStack` and chips as `.searchScopes`. Keep `ClubPin` but only the selected club shows ribs. Clubs list rows keep a thumbnail, but give each a different composition (already done) and drop the white panel by `listStyle(.plain)`. Dark mode has the same layout.

**N14. Guest passes, Family, Freeze, Coach, Add member: empty or large.**
- Guest (`light/guest.png`): top rows are fine, then a centred copper capsule and a paragraph in an empty screen. Fix: a `Form` with Section "Passes" (LabeledContent Left 1 of 1, Resets Nov 12), a `Section { Button("Share a guest pass") }`, and the rules as `Section` footer. The rib-battery glyph in "Passes left" is not a rib meter; use `RibMeter(value: left, ...)` or text.
- Family (`light/family.png`): "Add a family member" centred capsule floating between a list and a footer; make it the last row of the People section.
- Freeze (`light/freeze.png`): half the screen empty, three paragraphs, a bordered card and three check lines. Use `Form { Section { Picker("Length", selection:).pickerStyle(.segmented) } Section("Dates") { LabeledContent("Starts", value: "Dec 12"); LabeledContent("Ends", value: "Feb 11"); LabeledContent("Billing restarts", value: "Feb 12"); LabeledContent("Cost", value: "$10/mo · $20 total") } Section { Label("Personal training packs pause", systemImage: "pause.circle"); Label("You cannot check in", systemImage: "qrcode") } footer: { Text("Your first billing date is at least 30 days from today.") } }`. The sentence "Your freeze starts Dec 12, your first billing date at least 30 days from today." is a comma splice that does not say what it means. Confirm with `confirmationDialog("Freeze from Dec 12?", ...)`.
- Coach (`light/coach.png`): 340 pt photo block, chips in pills, a "This week" list whose time wraps to two lines ("Tue 6:00 / a.m."). Use a 96 pt avatar header, text separated by `·`, and a fixed-width Archivo time column.
- Add member (`light/addFamily.png`): not re-checked; review 1 item still open.

**N15. Show pass accessory duplicates and covers.** `App/RootView.swift:31`. On Today the accessory "Show pass · Val Vista" sits right under the Next up "Show pass" button and a toolbar QR icon: three entry points. It covers the last visible row on Book, Courts, Lanes, Kids and You. Fix: `isEnabled: shouldOfferPass && router.selection == .book && onRoot ...` (only where a member is about to scan, not Today and not You), and make `.tabBarMinimizeBehavior(.onScrollDown)` collapse it. Also set `.tabViewBottomAccessory` content to `Text("Climb Cycle in 19 min")` plus the QR so it carries new information (the next class), not a duplicate label.

**N16. Toast placement.** `App/RootView.swift:42-47`, `Components/Style.swift:157-176`. `.padding(.bottom, 96)` puts the toast mid-list over the last row and over the accessory. Fix: show it at the top under the nav bar: `.overlay(alignment: .top)` with `.safeAreaPadding(.top, 8)` and `.glassEffect(.regular, in: .capsule)` instead of a night fill and a manual shadow; keep Undo and Add to calendar as text buttons with `.buttonStyle(.plain)`. Auto-dismiss at 8 s stays. Post `AccessibilityNotification.Announcement("Booked, Thursday 5:30 a.m.")`.

**N17. Booked row looks like a warning.** `Components/BookingButton.swift`, `light/book.png` row 1 after booking: "Booked" capsule next to a warning triangle and "5 spots left". For a booked class show the state only ("Booked") and put capacity in the detail. Fix: in `ClassRow`, `if booked { Text("Booked").foregroundStyle(.green) } else { spotsLabel }`.

**N18. Checked-in pass unchanged.** `Components/PassViews.swift` (`flow-pass-checkedin.png`). Fix: keep the QR small (96 pt) at the top of the card; headline "Checked in 5:40 a.m." in Archivo 28 inside the Night card; remove "Code refreshes every minute" and "Checking in at ... Change" when checked in; on Today replace Next up's "Show pass" with "Checked in" (disabled `.glass` button with `checkmark`), and set the QR toolbar item accessibility value "Checked in".

**N19. Sheets use a custom "Close"/"Cancel" capsule and a large title in the body.** `Views/Sheets.swift`, `Sheets2.swift` (Cancel, Plan change, Freeze confirm, Share guest pass). Use `NavigationStack` + `.navigationTitle` + `ToolbarItem(.cancellationAction)`; reserve sheets already do. For two-choice questions (Cancel, Plan change, Freeze, Remove member) use `confirmationDialog`.

### P2 (polish)

- N20. Club picker on Book (`Mesa – Red Mountain` capsule) is a hand-drawn outline capsule. Use `Menu { Picker("Club", selection:) {...} } label: { Label(club.shortName, systemImage: "mappin") }.menuStyle(.button).buttonStyle(.bordered)` or the toolbar `.principal` slot.
- N21. Add-to-calendar flash: create the `EKEventStore` earlier and call `requestWriteOnlyAccessToEvents` before presenting (`Support/PlatformViews.swift:37`).
- N22. Lanes row text "1 of 8 lanes open · 1 lane with 1 of 2 swimmers" is unchanged. Show `1 lane open` and `+1 lane to share`; 8 small rib cells per slot.
- N23. Onboarding step 3 Alerts screen and the Continue button: the progress ribs are right; "Turn on alerts" is a centred pill with "Not now" below; OK, but use `.glassProminent`.
- N24. Date strip "S" clipped at the right edge on Book, Courts, Lanes and Kids (`light/book.png`). See N5.
- N25. Today: bell and QR are one merged glass pill. Add `ToolbarSpacer(.fixed, placement: .topBarTrailing)` (`Views/TodayView.swift` toolbar).
- N26. Club detail "Live now" weekday picker is a custom "T W T F S S M" row; use a `Picker(.segmented)` with `Mon`...`Sun`, `.pickerStyle(.segmented)`; mark today with `.bold`.
- N27. Settings and Inbox are good `Form` and list, but both use white inset cards over the sand background; set `.scrollContentBackground(.hidden)` consistently or use the system grouped background everywhere. Mixed backgrounds (`light/settings.png` is cool grey, Inbox is sand) look like two apps.
- N28. Search tab field floats without a nav bar and the keyboard covers the suggestions (`light/search.png`). Use `.searchable` with `.searchSuggestions`.
- N29. Frozen demo state ends Feb 19 while the Freeze screen computes Feb 11. Use one `FreezeCalculator`.
- N30. Dark mode: good. Only issue: hold card brown fill with copper button (`dark/hold.png`) has low edge definition; add the `statusWarning` border at 1 pt.

---

## Loading, error, haptics and motion

- Loading: `.redacted(reason: .placeholder)` exists on Today and Book only. Add it to Class detail (hero, coach row, spots), Clubs (list rows), Club detail (chart), Bookings, Progress, Membership. Implement as one modifier `.loadable(model.state(.clubs))` that applies `.redacted` and `.allowsHitTesting(false)`.
- Error: "Can't load classes" exists for Book only. Add the same `ContentUnavailableView("Can't load clubs", systemImage: "wifi.exclamationmark", description: Text("Check your connection."))` with a `Button("Try again")` for Clubs, Bookings, Membership, Progress. Add Demo control "Force error" per screen.
- Reduced motion: only `PassViews` reads `accessibilityReduceMotion`. See N8.
- Haptics: see N8 and N2 (the wrong `.error` on success).

## Increased Contrast
`contrast/today.png`, `book.png`, `classDetail.png`, `welcome.png`. Colour sets carry high-contrast variants. Cards lose the white and become flat lines; copper darkens; text is readable. Passes. The only fix is N11 (Welcome).

## Widgets and Live Activity (code only, not rendered)
All items from review 1 are still open except the timeline.
- P1 `CactusPeakWidgets.swift:78,140,176,200`: every widget uses `.containerBackground(Color.surface, for: .widget)`. On iOS 27 tinted and clear modes this loses the design. Use `@Environment(\.widgetRenderingMode)`: `.containerBackground(for: .widget) { rm == .fullColor ? Color.surface : Color.clear }`, and wrap the QR, time and ribs with `.widgetAccentable()` (ribs already do).
- P1 `NextAndPassWidget`: a night rounded square with `RoundedRectangle(cornerRadius: 14)` inside the widget. Use `ContainerRelativeShape()` for the corner (`.background(Color.nightSurface, in: ContainerRelativeShape())`) so it nests with the widget corner, and give it `.widgetAccentable()` only when `rm == .fullColor`.
- P1 Not configurable: change `StaticConfiguration` to `AppIntentConfiguration(kind:intent:provider:)` with `SelectClubIntent` (`ClubEntity` already exists in `Intents/AppIntents.swift`) and `AppIntentTimelineProvider`.
- P1 Live Activity: the Lock Screen view still draws a 40 pt copper-tinted circle behind the category symbol (`LockScreenActivity`, `.background(Color.dawnCopper.opacity(0.2), in: Circle())`). Remove the circle; use `.symbolRenderingMode(.hierarchical)`; show the time in `archivoExtraBold(34)` and the countdown as `Text(timerInterval:)` chip right; add `Button(intent: ShowPassIntent())` (iOS 17 interactive, `openAppWhenRun`) as the one action. `thirdValue` still uses `Text + Text` (deprecated); use `Text("Starts in \(Text(timerInterval: ...))")`.
- P1 `TodayWidgetView` and `ClubNowView` text: `.font(.caption)` with `Color.textMuted` on `Color.surface` is fine in light, but in tinted mode muted colours collapse. Use `.foregroundStyle(.secondary)`.
- P2 `PassLockWidget` and `ShowPassControl` are right. Add `.controlWidgetActionHint("Show pass")` and an App Shortcut phrase "Show my pass".
- P2 No `#Preview` for any widget. Add `#Preview(as: .systemSmall) { NextClassWidget() } timeline: { SnapshotEntry(date: .now, snap: .sample) }` for each family so a reviewer can render them.

## Accessibility notes
- VoiceOver: unchanged and good (combined labels, custom "Book" action). Add `.accessibilityValue("Checked in")` to the toolbar QR in the checked-in state; hide the 6 pager dots (`.accessibilityHidden(true)`).
- Targets: Book row button 44 pt OK. Toast buttons use `.frame(minHeight: 44)` OK.
- Dynamic Type: see N6.

## Keep
- Native skeleton: `TabView` with `Tab(role: .search)`, per-tab `NavigationStack`, one sheet enum, pinned trailing toolbar items, `.glassProminent` Next up pair.
- Book timetable rows (`Components/ClassCards.swift`): Archivo time column, category stripe and symbol, coach, ribs, button on the row. Past rows sink. Jordan's row layout.
- Rib meter everywhere (busyness, intensity, capacity, goal, onboarding progress) with text equivalents.
- Archivo ExtraBold for the 6:00 and the member number; tabular numerals.
- Booking engine and copy: late-cancel dialog text, strike numbers, 5-minute hold with extension, Confirm spot countdown, freeze dates and price, plan change quote.
- Honest states in place: frozen row, hold card, offline banner, dashed ribs for stale data, "Code hidden" pass states.
- Inline booking confirmation with haptic and toast (replaces the success page).
- Saguaro Night pass card, brightness boost, QR on white.
- Dark mode and Increased Contrast colour sets.
- Compare plans table, Hours sheet, Inbox, Settings `Form`, Search tab.
- Debug launch arguments and Demo controls (keep behind `#if DEBUG`).

## Top 10 open issues (impact order)
1. N2 Reserve success flashes "Your hold ended" and fires the error haptic (`Views/Sheets.swift:264`, `Model/AppModel+Reserve.swift`).
2. N1 Clash alert "a.m.. Book both?" (`App/RootView.swift:56`).
3. N15 and N16 Show pass accessory duplicates Show pass, covers rows on six tabs, and stacks with the toast (`App/RootView.swift:31,44`).
4. N5 Book header 330 pt, Courts and Lanes 700 pt before the first slot (`Views/BookView.swift`).
5. N4 Copper capsule on every action instead of `.bordered` rows and `.glassProminent` bars.
6. N3 Today is still three white cards; Next up title wraps beside the glyph.
7. N6 and N7b AX breaks: onboarding grid shows one letter per line; Club detail hero clipped; Freeze sticky button covers the picker.
8. N7 Free-cancel sheet is three stacked centred buttons; late-cancel dialog hides "Keep".
9. N13 Clubs tab: map under chips, white list panel, no persistent sheet.
10. N10 and N9 Photo slots: "Photo to come:" prefix shown, one silhouette per category, fake "1/4" pager with six dots on Club detail. Widgets and Live Activity are unrendered and unchanged.
