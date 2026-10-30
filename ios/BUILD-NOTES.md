# Cactus Peak Athletic iOS member app: build notes (build 1)

Native SwiftUI, iOS 27 SDK (Xcode 27.2), Swift 6, bundle id `com.cactuspeak.member`. Data and sign-in come from Supabase (see Backend). The `@Observable` model enforces the booking rules on the device.

## Generate, build, run
```
cd cactus-peak-build/ios
python3 tools/gen_assets.py          # only if colours or logos change (writes Shared/Colors.xcassets and the app asset catalog)
/opt/homebrew/bin/xcodegen generate  # writes CactusPeak.xcodeproj from project.yml
xcodebuild -project CactusPeak.xcodeproj -scheme CactusPeak -destination 'id=37174F32-2137-46DA-8FAA-5B6763052243' -derivedDataPath /tmp/cpa-dd build
xcrun simctl install booted /tmp/cpa-dd/Build/Products/Debug-iphonesimulator/CactusPeak.app
xcrun simctl launch booted com.cactuspeak.member
```
Result: BUILD SUCCEEDED (app + widget extension), 0 errors, 2 deprecation/Sendable warnings (`Text +` in `PlanCard`, one closure in `FamilyMemberView`).
Targets: `CactusPeak` (app, App Intents inside), `CactusPeakWidgets` (widgets, control, Live Activity). `Shared/` is compiled into both (colours, rib meter, Archivo helpers, snapshot and activity types).

## Sample world and demo controls
Superseded by "Backend" below. Virtual clock starts Tue Oct 27, 2026, 5:40 a.m. Arizona time and runs live. Settings > Demo controls (DEBUG) signs in as a demo account, forces offline, stale busyness, failed payment (day 2, 9, 16), strikes and pause, a waitlist spot opening (30-minute hold), resets the household on the server and moves the clock. The pass sheet has a "Demo: simulate a desk scan" row.

## Debug launch arguments (DEBUG builds)
`-screen <name>` today, book, bookToday, filters, classDetail, classDetailFull, classDetailBooked, waitlistSheet, confirmed, bookings, cancelSheet, courts, lanes, kids, reserveCourt, reserveKids, clubs, clubDetail, hours, pass, progress, coach, you, membership, plans, compare, freeze, family, familyMember, addFamily, guest, guestShare, inbox, settings, search, switcher, welcome, onboarding1..5.
`-persona maya|chris|alicia|jordan|daniel|ron|linda` (signs in with the demo password), `-state paymentFailed|paymentPaused|seeDesk|strikes2|paused|frozen|hold|offline|stale|checkedIn|empty`, `-clock HH:mm`, `-frozenClock`, `-signedOut`. Cold start in the debug simulator takes about 5 s before the screen opens.
Screenshots: `screenshots/build-1/` (light), `dark/`, `ax5/` (Accessibility XXXL). Some root-level files are from earlier runs of the same screens.

## Screens (spec 03)
| # | Screen | Status |
|---|---|---|
| 1 | Welcome | complete (Apple button is the system control; sign in is mocked) |
| 2 | Onboarding 5 steps | complete (location button picks the closest sample club) |
| 3 | Today (hold, next up, club now, week, coming up, for you, notice, feedback, frozen/payment/pause cards) | complete |
| 4 | Book: Classes | complete |
| 5 | Filters | complete |
| 6 | Class detail | complete (photo is one slot, no pager) |
| 7 | Success views (booking, waitlist, court, lane, kids, PT; freeze reuses pattern) | complete |
| 8 | My bookings (+ Strikes explainer) | complete |
| 9 | Clubs map and list | partial: map plus list split instead of a persistent bottom sheet; ZIP/city search is local, no geocoder |
| 10 | Club detail | complete |
| 11 | Hours sheet | complete |
| 12 | Reserve: courts, lanes, kids club | complete |
| 13 | Reserve, cancel, waitlist sheets | complete |
| 14 | Check-in pass | complete (all pass states; Wallet is a stub) |
| 15 | Progress | complete (HealthKit card not built, as the spec allows) |
| 16 | Coach profile and PT picker | complete |
| 17 | You | complete |
| 18 | Membership (biometric gate, billing, failed payment, wallet stub) | complete |
| 19 | Plans, compare, upgrade/downgrade quote | complete |
| 20 | Freeze (+ resume early) | complete |
| 21 | Family, family member (teen controls) | complete |
| 22 | Add family member | complete |
| 23 | Guest passes and share | complete |
| 24 | Inbox | complete |
| 25 | Settings | partial: no alternate app icons |
| 26 | Search (scopes, tokens, recents, suggestions) | complete |

## Flows (spec 02)
| Flow | Status |
|---|---|
| 1 Sign in | partial (passkey/Apple/email code are mocks; Link membership step skipped) |
| 2 Onboarding | complete (alerts step asks for real notification permission) |
| 3 Check in (pass, brightness, accessory, states) | complete (Lock Screen widget and control build; scan is simulated) |
| 4 Book a class (all 12 button states, clash prompt, drop-in) | complete |
| 5 Waitlist and promotion (consent, 5-list cap, 30-min hold, Confirm spot, Release spot, expiry) | complete (promotion is triggered from Demo controls) |
| 6 Cancel and late cancel (2 h rule, strikes, 3-strike pause, undo toast, no-show = late cancel) | complete |
| 7 Add to calendar (`EKEventEditViewController`) | complete |
| 8 Courts (3-day window, 1/day, 2 active, 5-min hold + extension, partner invite share link) | complete |
| 9 Lanes (45-min slots, 1 of 2 swimmers, no waitlist) | complete |
| 10 Kids club (4 blocks, max 2 per child, kids waitlist, no strikes) | complete |
| 11 Find a club | partial (see screen 9) |
| 12 Freeze, plan change, cancel membership, failed payment | complete |
| 13 Family and teen account (Teen OK filter, parent toggles, PT approval message) | complete |
| 14 Guest pass | complete |
| 15 Live Activity | partial: local start from the running app, UI built; no push-to-start |
| 16 Siri and App Shortcuts | complete: 7 shortcuts; `ReserveCourtIntent`, `JoinWaitlistIntent`, `ConfirmWaitlistSpotIntent` exist but are not shortcuts |

## Components (all in `CactusPeak/Components`, previews not added to every one)
RibMeter, IntensityRibs, BusynessMeter (inline, compact, card, hero), CapacityIndicator, ProgressRibs, PopularTimesChart (Swift Charts + audio descriptor), CategoryBadge, AmenityChip, FilterChip, InstructorChip, Avatar (monogram), OpenStatus, LateCancelNotice, ClubCard (listRow, compact, feature, mapCallout), ClubPin, ClubHero, HoursTable, ClassRow, ClassCompactCard, ClassFeatureCard, BookingRow, CoachCard, BookingStateButton (book, booking, booked, late, waitlist, waitlisted, hold, full, drop-in, started, restricted with reasons, error), ScheduleDayStrip, DurationChips, SlotRow / ChoiceList (slot grid in list form), CheckInPassCard, CheckInPassCompact, VisitStreakStrip, VisitMonthGrid, PlanCard, EmptyState, Banner, StatusPill, OfflineBanner, ToastView, PhotoSlot, ClassPhotoTile, ClubSwitcher sheet.
Previews: a `#Preview` pass was not completed. Verified by simulator screenshots instead.
Photos: none exist. `PhotoSlot` is a flat three-tone composition per club or category with the Rib Peak shape and a caption of the intended shot, no gradients.

## Widgets, Live Activity, intents, Wallet
Widgets: Next class (small, lock rectangular, inline), Club now (medium, lock circular gauge), Next + pass (medium), Today (large), Weekly goal (small), Kids club (small), Pass (lock circular), Control Center "Show pass" (opens `cactuspeak://pass`), Class Live Activity (Lock Screen + Dynamic Island). Data comes from a JSON snapshot in the App Group `group.com.cactuspeak.member`; widgets fall back to sample data. Not rendered in the simulator in this pass (builds only). Widgets are not configurable with a club parameter.
Wallet: `WalletButton` wraps the system `PKAddPassButton`. A pass cannot be signed here, so tapping shows an explanatory alert. Entry points: Pass, Membership, onboarding step 4.

## Unverified APIs (spec 05 §11): what I checked
Checked in the iOS 27.2 SDK swiftinterface and by compiling: `tabViewBottomAccessory(isEnabled:)` (ok), `TabViewBottomAccessoryPlacement` (.inline/.expanded), `Tab(value:role:)` and `Tab(_:systemImage:value:role:)` (ok), `tabViewSearchActivation(.searchTabSelection)` (ok), `.topBarPinnedTrailing` and `visibilityPriority` (ok, applied to the ToolbarItem), `tabBarMinimizeBehavior` (ok), `.sidebarAdaptable` (ok), `presentationSizing` and `tabViewCustomization` exist but are not used, `confirmationDialog(_:item:)` (ok), `IntentModes` / `supportedModes` (ok), `requestChoice(between: [IntentChoiceOption])` (ok), `OpenURLIntent` in `ControlWidgetButton` (ok), `Map(selection:)`/`Annotation`/`UserAnnotation` (ok), Swift Charts `accessibilityChartDescriptor` (ok), `Gauge` (used on lock-screen circular only; no custom `GaugeStyle`; `RibMeter` is plain views). Archivo-VF named instances resolve by PostScript name (`ArchivoRoman-ExtraBold`, `ArchivoRoman-Bold`, `Archivo-SemiBold`); an assert at launch checks registration. Not verified: Time Sensitive notifications (no capability), passkey `ASAuthorizationController` (mocked), HealthKit (not built), screen brightness on iOS 27 (uses `UIWindowScene.screen.brightness`, works in the simulator), Wallet signing, Live Activity push-to-start.

## Deviations and known gaps
- Clubs tab uses a split (map above, list below) instead of a persistent bottom sheet, so the tab bar stays reachable. Spec lists this as the fallback.
- One `AppSheet` enum and one `sheet(item:)` at the root replace the many `presentedX` properties in spec 01. Only one sheet shows at a time.
- Archivo uses the normal width (named instances). The brand's expanded width 112 to 125 needs a variation descriptor and was not applied.
- Strength uses `figure.strengthtraining.traditional` (SF Symbols); the custom `cp.*` symbols are not exported.
- Book uses an inline title ("Book") because a large title collided with the pinned header.
- Time Sensitive delivery, alternate app icons, widget club configuration, push-to-start, Spotlight indexing, iPad split layouts and the Face ID `LAContext` flow beyond a simple gate are not built. iPad runs the iPhone layout in `.sidebarAdaptable`.
- Reduced-motion handling: bounce symbol effect and pass ring respect it; other animations use system defaults.
- State restoration saves the tab and per-tab path for 30 minutes; Book day and filters are not restored.
- Cold start in a debug simulator build is slow (about 5 s). Not profiled in Release.
- Not verified: VoiceOver on device, AX5 on every screen (checked Today, Book, Class detail, Pass), contrast with Increased Contrast on (colour sets contain the values).

## Review 1 — response
Build: BUILD SUCCEEDED, 0 errors. New screenshots in `screenshots/build-2/` (light), `dark/`, `ax5/`. Simulator reset to light and `large` text. Statuses: Fixed (seen in a screenshot), Partly, Not fixed.

**P0 and wrong facts**
- Frozen state: Fixed. A freeze now cancels bookings in its window (`startFreezeNow`, also used by `-state frozen`). Today shows a frozen row (no Next up, no Show pass), the pass accessory is off while frozen, the pass hides its code (`build-2/frozen.png`, `frozenPass.png`).
- Fake "1/4" pager and "Photo 1 of 4": Fixed on Class detail (pill and label removed; caption names the intended shot, one photo slot). Club detail keeps a real 4-slot pager with a working VoiceOver adjustable label.
- Double periods: Fixed. Cause: `cpTime` already ends with a period. Sentences no longer add a second one, and `String.endingSentence` is used where text is composed (`popularCaption`). Grepped all Swift files for `cpTime…).` and `opensText…).`. Not covered by a unit test.
- "Fri." header: Changed to `EEEE, MMM d` ("Friday, Oct 30"). I could not reproduce the period in the code, so this is a formatter change, not a confirmed cause.
- Two desk numbers: Fixed. Front desk now always uses the club's own number from the foundation. "Member services (480) 555-0100" is labelled as such in You and Settings.
- "Let's hit pause": Now "Freeze your membership". Live Activity "Done. Nice work." is now "Class finished".
- Guest-pass card: Fixed (List rows: Passes left, Resets; button in its own section). Screenshot `build-2/guest.png`.
- Jordan row gap: Real cause was `FlowLayout`: it measured with an unbounded width when the parent proposed none, then placed with the real width, so reported height and drawn height differed. It now uses one width rule for both. The row also no longer uses it. Confirmed in `build-2/jordan.png` (no gap).

**Systemic**
- S4 Book timetable: Fixed. Plain `List`, 2-line rows about 68 pt, Archivo time, category stripe and symbol, coach, room, ribs, spots and button on the row, past rows sink and dim. The first screen shows about 6 classes (7 at the smallest rows was not reached).
- S1 Today as `List`: Fixed. Order: hold, Next up, Coming up, Club now, This week, For you. One heading ("Morning, Maya." with the date as subtitle). Club now is one row.
- S3 Chrome: Fixed. Accessory only on root screens, not at accessibility sizes, not when frozen. Class detail, Club detail, Coach and Freeze use `safeAreaBar` and hide the tab bar.
- S2 System buttons: Fixed for primary, secondary, links, Next up (`.glassProminent` / `.glass` in a `GlassEffectContainer`) and `BookingStateButton` (`.borderedProminent` / `.bordered`, `.glass` at large). Forced label colour keeps contrast in dark. `ClubPin`, `AmenityChip` and the day strip are still custom.
- S6 Largest text: Fixed in screenshots for Today (eyebrow stacks), Book (header scrolls in the list, menu pickers), Class detail (bar scrolls, hero caption hidden), Club detail (name under photo, bar stacks), Membership and Plans (name and price stack), Bookings (menu picker), reserve and cancel sheets (large detent, hold line stacks). Accessory off at accessibility sizes.
- S5 Loading and error: Partly. Today and Book show redacted rows for 0.3 s; Book shows "Can't load classes" with Try again (Settings > Demo controls > Force a load error). Other screens have none.
- S8 Photos: Partly. Each club has its own composition (pool lanes, court net, brick, splash dots, rooftop rail). Class photo tiles still share one scene per category.
- S7 Copy: see above.
- S9 haptics: `.success` on booking, numeric content transition on spot counts and the hold timer (`Text(timerInterval:)`). No zoom transitions. Not done.
- S10 contrast: Not changed. Increased Contrast not tested.

**Third group**
- Success page replaced: Fixed. Booking confirms inline (haptic plus a toast "Booked · Thu 6:00 a.m." with Add to calendar). `bookingDetail` is now a plain List. Freeze uses a small hierarchical check, not a hero.
- Waitlist consent: Fixed (`Toggle`, nav title, Join in toolbar, clearer copy).
- Late cancel: Fixed (`confirmationDialog(item:)`, `router.requestCancel`). A free cancel still opens the sheet.
- Widget timeline: Fixed in code. One entry per class start-1h, start and end; each entry picks its own next class; `TimelineEntryRelevance` added; `policy: .atEnd`. Not rendered in the simulator.

**Remaining P1 and P2**
- Fixed: Book toolbar spacer, ToolbarSpacer on Today and Class detail, count and filter row only when filters are active, sport and duration use segmented `Picker`s, Bookings strike copy and link, Family avatar strip removed and info moved to a footer, Plans no longer highlight the current plan, Progress streak not repeated, Class detail de-duplicated with a `DisclosureGroup` and one Booked button, "Closest" no longer wraps, Settings and pass Demo rows only in DEBUG, search suggestions have icons, widget compact timer width.
- Not fixed: onboarding interest grid, Clubs persistent bottom sheet (still the split), Membership as full `LabeledContent` List, Coach header size, Freeze as `Form`, Add member `Picker`, per-screen loading states beyond Today and Book, Checked-in pass layout, widget club configuration and tinted-mode fills, Live Activity icon style and interactive button, `swipeActionsContainer`, reduce-motion wrapper for all animations, unit test for double periods.

## Review 2 — response
Build: BUILD SUCCEEDED, 0 errors. Unit tests: new `CactusPeakTests` target, 3 tests pass (`xcodebuild test`). Screenshots: `screenshots/build-3/` (light), `dark/`, `ax5/`; I looked at each before marking it fixed. Simulator reset to light and `large`.

**Admission:** in build 2 I said double periods were fixed. They were not (the clash alert). The fix and a test are now in. I had also not tested Increased Contrast. The reviewer did, and found only the Welcome button (fixed below).

**P0**
- Clash alert: Fixed. `ClashPrompt.message` ends the time with its own period and starts a new sentence. Test `testNoDoublePeriods` covers rules text, club captions, free-cancel lines and the clash text. `testEndingSentence` and `testTimeFormatter` cover the helper and formatter.
- False "Your hold ended" and error haptic: Fixed. Cause: a successful reserve clears `hold` in the model, and the banner treated `hold == nil` as an expiry. The banner now stays hidden once `reserved` is set, and the `.error` haptic fires only from a new `holdExpiredCount` that `tick()` raises on a real expiry. Checked by code and test only; I did not walk it by tapping.
- `-screen pass`: Fixed. Launch args now wait for `router.rootReady` before opening anything. `build-3/pass.png` shows the pass.

**P1**
- Show pass accessory: only on Book root, label carries the next class ("Climb Cycle 6 a.m."), off on Today, You and at accessibility sizes. Toast: now a glass capsule inserted under the status bar with `safeAreaInset` (no hard-coded padding), reduce-motion aware.
- Book header: day strip one line, club in the nav subtitle, count row removed. Courts and Lanes: one compact control row (club `Menu`, sport, duration), rules in the section footer. First slot starts near y 430 instead of 700. Lane rows read "1 lane open · +1 to share".
- Buttons: Book rows are tinted `.bordered`; solid copper only for the main action; Freeze uses `.glassProminent` in a `safeAreaBar`; Family and Guest actions are list label rows; Switch plan is `.bordered`.
- Today: Next up is flat on the page (Archivo 56, glyph in the eyebrow, title on its own line). Coming up and Club now remain native grouped sections.
- Largest text: onboarding interests are a list (icon stacks above the name; no mid-word break, checked), Club detail hero stacks under the photo, Freeze button sits in the form at accessibility sizes, Courts club control is a `Menu` with a rounded-rectangle shape.
- Cancel: every cancel is now a `confirmationDialog` (Cancel booking, Reschedule, Keep booking as `.cancel`). Not fixed: on iPhone the system shows it as a popover without a visible Keep button; tapping outside keeps the booking. Added a `.warning` haptic on late cancel.
- Clubs tab: Partly. Chosen alternative: map above a plain list (no white panel), search in the nav bar, filters in a toolbar menu, pins no longer covered. I did not build the persistent sheet, because it would cover the tab bar. Ribs show only on the selected pin.
- Photos: "Photo to come" removed. Each class category has its own composition with 3 variants. Club detail pager has four real slots with system dots, no pill; hero shows a fact line ("Lap pool · Courts · Kids club").
- Widgets: rendering-mode background, `ContainerRelativeShape`, `.secondary` text, Live Activity without the tinted circle, `Text` interpolation instead of `Text + Text`, "Show pass" link. 9 `#Preview`s added. Not rendered: Xcode's preview tool needed approval I could not get, so there are no widget screenshots.

**Remaining**
- Fixed: Welcome button contrast (Night label), checked-in Next up and pass layout, QR toolbar value, weekday picker uses Mon to Sun, Membership as list rows, You profile row, Freeze as a `Form` with a dialog confirm and one date source for the frozen demo, Coach time column, booked rows show state only, lanes copy.
- Not fixed: zoom transitions, per-screen loading and error states beyond Today and Book, widget club configuration, interactive Live Activity button, calendar sheet blank flash, plan quote button wrap, Add member picker, `swipeActionsContainer`, sheet nav-bar titles for the remaining custom sheets.

## Brand graphics (2026-10-28)

Placeholder photo slots and coach monograms are replaced with the Cactus Peak graphics (same art as the web app and
the marketing site).

- `Shared/BrandGraphics.xcassets`: 93 image sets with "Any" and "Dark" SVGs and "Preserve Vector Data". Written by
  `python3 tools/import-brand-graphics.py` from `../brand-graphics/svg`. Do not edit the catalog by hand. The script
  escapes a bare `&` in the exported `mind-body` titles, which actool rejects ("zero width/height canvas").
- `Shared/BrandGraphics.swift`: `ClassGraphic`, `SpaceGraphic`, `ClubExteriorArt`, `CoachImage`, `BrandImage` names.
  It is in both targets (app and widgets).
- `CactusPeak/Model/ClubSpaces.swift`: Swift port of `marketing-site/lib/data/club-spaces.ts` (`Club.spaces`).
- Replaced: welcome background (Red Mountain exterior, dark appearance), club cards (all variants), club hero pager
  (exterior plus primary space art), club "Spaces and amenities" (was SF Symbol chips), class detail hero and
  For-you cards (class graphics), coach rows, cards, instructor chips and profile header (coach marks), next-class
  and kids widgets, Live Activity lock screen and expanded island.
- Kept: SF Symbols for interface glyphs (category badge, compact and minimal island, accessory widgets).
  Member monograms stay (`Avatar` is for members only).
- Only Marisol Vega and Luis Ortega in the iOS seed have coach marks. Other coaches show their category's class graphic.
- Screenshots: `screenshots/brand-graphics/{light,dark}/`.

## Backend (Supabase, 2026-10-29)

The database is the source of truth. `SeedData.swift` and the personas are gone; `Model/Occupancy.swift` keeps only
simulated busyness, other people on courts and lanes, kids club places and PT openings for coaches without set times.

- Setup: copy `Config/Secrets.example.xcconfig` to `Config/Secrets.xcconfig` (gitignored) and fill in `SUPABASE_HOST`,
  `SUPABASE_PUBLISHABLE_KEY` and, for DEBUG demo sign-in, `DEMO_PASSWORD`. `Config/App.xcconfig` includes it and
  blanks `DEMO_PASSWORD` in Release. Info.plist carries `SupabaseURL`, `SupabasePublishableKey`, `DemoPassword`.
  Package: `supabase-swift` 2.55+ (`project.yml` packages). No service key in the app.
- Code: `CactusPeak/Backend/` — `Backend.swift` (one `SupabaseClient`, session in the keychain), `BackendAPI.swift`
  (PostgREST reads, writes, `session_counts`, `reset_demo_household`), `Rows.swift` (Codable rows), `CatalogMapping.swift`
  (rows → `Club`, `Coach`, `ClassSession`; `SessionKey`), `HouseholdMapping.swift` (rows → member, people, bookings,
  inbox, guest passes; booking inserts), `LocalCache.swift`, `BookingError.swift` (`BackendError`). `Model/AppModel+Sync.swift`
  holds auth, loading and `writeThrough`.
- Auth: email and password (Supabase Auth). A stored session goes straight in. Sign out in Settings removes the household
  cache. DEBUG: Welcome > Demo account and Settings > Demo controls sign in as a demo account.
- Catalog: clubs, categories, coaches, class types, schedules, plans, PT packs, member FAQs. Saved as JSON in
  Application Support and read in `AppModel.init`, before the first frame. Refreshed at launch and when the app becomes
  active after 5 minutes. Offline banners show the saved time (`savedDataText`).
- Sessions: made on the device from `class_schedules` for 8 days back to 11 days ahead of the demo day. Id
  `<club_slug>~YYYY-MM-DD~HHMM~<class_key>`, same as the web app. Spots left use the web app's formula
  (`engine.ts` `sessionLeft`): capacity − baseline − other households (`session_counts` minus this household's saved
  bookings) − this household's active bookings. The baseline (`Backend/SessionBaseline.swift`) is a bit-exact port of
  `sessions.ts` (`hash`, `STORY`, the 0.3 + r × 0.62 rule, full with a waitlist when r > 0.93); `SessionBaselineTests`
  checks it against values from running the web code.
- Household: loaded for the signed-in member and cached per user. Book buttons show `.checking` until bookings are known,
  and `.booking` while a book request runs (a second tap is rejected). Every write is optimistic; a failure restores the
  previous values, shows a toast with the reason and reloads the household. App Intents wait for the write
  (`writesSucceeded()`).
- Written through: book, cancel (with strike and pause), undo cancel, waitlist join and leave, holds (open, confirm,
  release, expiry), court, lane, kids club (one row per child), PT, freeze and resume, plan change, cancel and reinstate
  membership, home club, family add, remove and edit, guest pass share and cancel, inbox read, read all and delete,
  class feedback, check-in visits, app notices.
- Local only: no-show settlement against the demo clock (attended/missed and their strikes), onboarding progress, notification
  and pass preferences, favourites, payment-failure, offline and strike demo controls, Wallet, simulated occupancy.
- Verified (2026-10-29): `xcodegen generate`; clean build, 0 errors, 1 warning (the existing `FamilyViews.swift` one);
  31 unit tests pass. In the simulator: wrong password shows the error; Linda and Daniel load real data; Daniel booked
  Desert Flow Yoga Tue 9:30 at Dobson (row `b_…` in `bookings`, `session_counts` 1, 19 mats left), cancelled it (status
  `cancelled`, no strike, count 0), signed out. h3 and h4 reset afterwards. Screenshots: `screenshots/supabase/`.
- Test only with h3/h4 (daniel@, ron@, linda@example.com). The web app's tests use h1/h2.

### Shared demo clock
The demo clock belongs to the household, not the device: `households.demo_clock_started_at` and `demo_clock_skew_ms`.
`refreshClock()` reads it with `demo_clock()` before each household load and on every return to the foreground, so
iOS and the web app show the same demo time. The server restarts a clock older than 3 hours, and `reset_demo_household()`
restarts it too. Demo controls write a clock jump or restart to the household. `-clock HH:mm` and `-frozenClock` launches
keep a local clock for screenshots.
