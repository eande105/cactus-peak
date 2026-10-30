# Cactus Peak Athletic iOS app — 01 Navigation and architecture

Platform: iOS 27, SwiftUI, iPhone first, iPad supported. Brand: fictional (university senior project).
Business facts come from `../00-foundation.md`. Do not change them here.
Sibling files: `02-user-flows.md`, `03-screens.md`, `04-components-and-branding.md`, `05-accessibility-and-quality.md`.
Shared brand components are named in `../01-shared-brand-components.md` (in progress). This file uses their exact names.

## 0. How to read this spec

### 0.1 Citation tags
Every decision that comes from research carries a tag.

| Tag | Meaning |
|---|---|
| `[apple §N]` | `../research/apple-ios-guidelines.md`, section N. Primary platform rules. |
| `[mobbin-ios §5 rN]` | `../research/mobbin-ios.md`, section 5, rule N. Primary pattern rules. |
| `[gaps rN]` | `../research/mobbin-gaps.md`, "Design rules", rule N (only `[iOS]` rules are used). |
| `[skill:NAME]` | A rule from the Apple Xcode skill NAME (`swiftui-specialist`, `swiftui-whats-new-27`, `accessibility-dynamic-type-specialist`, `accessibility-sufficient-contrast-specialist`, `accessibility-voiceover-specialist`, `app-intents-specialist`, `app-intents-whats-new-27`). |
| `[found §N]` | `../00-foundation.md`, section N. |
| `[verified]` | I checked the API page with Sosumi on 2026-10-27. |
| `[UNVERIFIED]` | I did not check it. Check in Xcode before you build. |
| `[PROPOSAL]` | My design choice. It is not an Apple rule. |

### 0.2 Sample data
Club names, class names, plans and rules are real in the foundation file. Coach and instructor names, member numbers and times are sample data.
The foundation file has no lane counts for Mesa – Red Mountain and Gilbert – Val Vista. Sample data only uses the 8 lanes at Mesa – Dobson. Add other counts to the foundation file first.

### 0.3 The 5:40 a.m. test
A member stands in a parking lot with one hand free. Every release must pass these tap budgets from a cold launch.

| Task | Budget |
|---|---|
| Show the pass | 1 tap (Today), 0 taps from Lock Screen widget, Control Center or Action button |
| See my next class and where it is | 0 taps (Today) |
| See how busy my club is | 0 taps (Today) |
| Book a class that has spots | 2 taps from Today (Book tab, "Book" in the row), 3 via the detail page |
| Join a waitlist | 3 taps (Book tab, "Join waitlist" in the row, tick the consent box and confirm) |

## 1. Tab structure

### 1.1 Decision
Use a system `TabView` with four content tabs and one search tab. Total five items. [apple §2 tab bar]

| # | Label | SF Symbol (filled when selected) | Content | Root screen |
|---|---|---|---|---|
| 1 | Today | `sun.horizon` (custom `cp.today` is not needed) | Pass entry, next class, club busyness, upcoming bookings, streak | Today |
| 2 | Book | `calendar` | Classes, courts, lanes, kids club. One shared `ScheduleDayStrip` | Book |
| 3 | Clubs | `mappin.and.ellipse` | Five clubs, map and list, club detail | Clubs |
| 4 | You | `person.crop.circle` | Membership, progress, family, guest passes, settings, inbox | You |
| 5 | Search | `magnifyingglass` (role `.search`) | Search for classes, coaches, clubs, help | Search |

Rules for the tab bar:
- Use one-word labels. [apple §2 tab bar]
- Never hide, disable or reorder a tab for user state. Empty tabs explain themselves with `ContentUnavailableView`. [apple §2 "Other navigation rules"]
- Never show a tab badge. A badge means "critical". Nothing in this app is critical enough. Use a dot in a toolbar button for unread inbox instead. [apple §2 tab bar]
- Keep the system tab bar. Do not build a floating pill or a custom bar. [mobbin-ios §6 a1, a9]
- Do not add a floating round action button over the tab bar. [mobbin-ios §6 a2]
- Apply `.tabBarMinimizeBehavior(.onScrollDown)` on iPhone. The bar shrinks on scroll and returns on scroll up. `[verified]` iOS 26.0+. [apple §2]
- Why four plus search? Two options fit: Google Health uses four tabs and ClassPass five. [mobbin-ios §2] The brief needs Today, Book, Clubs and account. Search is a trailing role tab, so it adds no label weight to the main four. [apple §2 tab bar]

### 1.2 Why "Book" holds courts, lanes and kids club
The member's verb is "book". Classes, courts, lanes and kids club share one date strip, one filter model and one confirmation pattern. [mobbin-ios §5 r1, r11]
A segmented `Picker` under the strip switches the object type: Classes, Courts, Lanes, Kids club. The four segments do not fit at AX sizes. At `dynamicTypeSize.isAccessibilitySize` the picker becomes `.pickerStyle(.menu)`. [skill:accessibility-dynamic-type-specialist]

### 1.3 Where the check-in pass lives
I compared three options.

| Option | Verdict | Reason |
|---|---|---|
| A tab called "Pass" | Rejected | A tab is a section you browse. The pass is an action you perform. A tab costs one of five slots. [apple §2 tab bar: "not for actions"] |
| `tabViewBottomAccessory` always on | Rejected as default | An always-on accessory takes 52 pt on every screen and competes with the tab bar. It also shows "Show pass" when the member is at home. |
| Toolbar button on Today plus a contextual bottom accessory plus system surfaces | **Chosen** | One tap on Today. Zero taps on system surfaces. The accessory appears only when the pass is likely needed. [mobbin-ios §5 r22, r23] [apple §2 proposal] |

Chosen design `[PROPOSAL]`:
1. **Today toolbar:** a `qrcode` button with `.topBarPinnedTrailing` so it never goes to the overflow menu. `[skill:swiftui-whats-new-27]` (iOS 27 API; see toolbar reference.)
2. **Arrival accessory:** `tabViewBottomAccessory(isEnabled: router.shouldOfferPass) { PassAccessory() }`. `[verified]` iOS 26.1+. It shows on every tab. It reads `tabViewBottomAccessoryPlacement` to switch between expanded and inline content.
   `shouldOfferPass` is true when any rule holds:
   - A booking starts within 90 min or ended within 15 min, and the member has not checked in.
   - The device is within 500 m of any club (checked in the foreground only; no background location).
   - The setting "Keep pass shortcut on" is on (Settings, Pass).
   The accessory hides at once after a check-in scan succeeds, and when the member taps the close control in the accessory (hides for 4 h).
3. **System surfaces:** Lock Screen widget (accessory circular), Control Center control, Action button, Siri "Show my pass", and an Apple Wallet pass. Full specs are in `04` section 6 to 8.
4. **You tab:** a "Check-in pass" card as the first row, for completeness.

The pass is presented from one place: `AppRouter.presentedPass`. Any entry point sets it. The root view owns the sheet. See section 3.4.

### 1.4 Launch behaviour
- Cold launch always opens Today. [PROPOSAL] Today is the answer to "what is my day".
- Warm launch within 30 min restores the last tab and its stack. After 30 min, go to Today and reset stacks. See section 6.
- A deep link wins over restoration.

## 2. Navigation stacks and typed paths

### 2.1 One route enum, four stacks
Each tab owns one `NavigationStack` with a typed array path. Use one shared `AppRoute` enum so Class detail, Club detail and Coach profile open from any tab with one `navigationDestination(for:)`. `[skill:swiftui-specialist]` (use `NavigationStack`, not `NavigationView`.) `NavigationPath` and `navigationDestination(for:destination:)` `[verified]`.

```swift
// IDs are stable strings. They also feed App Intents entity IDs.
struct ClubID: Hashable, Codable, Sendable { var rawValue: String }     // "club_mesa_dobson"
struct ClassSessionID: Hashable, Codable, Sendable { var rawValue: String }
struct BookingID: Hashable, Codable, Sendable { var rawValue: String }
struct CoachID: Hashable, Codable, Sendable { var rawValue: String }

enum AppRoute: Hashable, Codable {
    // Today / shared
    case classSession(ClassSessionID)           // Class detail (pushed; shared spec 11.1)
    case bookingConfirmed(BookingID)            // success view, back hidden
    case myBookings
    case booking(BookingID)
    case progress
    case notifications
    // Clubs
    case club(ClubID)
    case coach(CoachID)
    case coachList(ClubID?)
    // Book
    case reserve(ReserveKind, ClubID?)          // courts, lanes, kids
    // You
    case membership
    case plans
    case freeze
    case family
    case familyMember(MemberID)
    case guestPasses
    case settings(SettingsPage?)                // nil = settings root
}

enum ReserveKind: String, Hashable, Codable { case court, lane, kidsClub }
enum SettingsPage: String, Hashable, Codable {
    case notifications, pass, homeClub, privacy, appearance, accessibility, about
}
```

Class detail is a pushed page (`.classSession`), as the shared spec requires (`../01-shared-brand-components-part2.md` section 11.1: `ClassDetailPanel` is a pushed page on iOS). Revision 1 used a sheet; that is removed. The cancel sheet, waitlist sheet, club switcher, hours and filters are sheets. See section 3.

### 2.2 Router
One `@Observable @MainActor` router. It holds selection, four paths and presented items. [skill:swiftui-specialist] ("Prefer `@Observable`; keep it `@MainActor`.")

```swift
@Observable @MainActor
final class AppRouter {
    enum Tab: String, Hashable, Codable { case today, book, clubs, you, search }

    var selection: Tab = .today
    var paths: [Tab: [AppRoute]] = [:]          // one array per tab
    var presentedCancel: CancelRequest?         // sheet(item:), cancel sheet (booking, court, lane, kids, PT)
    var presentedWaitlist: ClassSessionID?      // sheet(item:), waitlist consent sheet
    var presentedClubSwitcher: SwitcherContext? // sheet(item:), ClubSwitcher (single or multi)
    var presentedHours: ClubID?                 // sheet(item:), HoursTable
    var presentedInvite: ClassSessionID?        // sheet(item:), "Invite a friend" link sheet
    var presentedFeedback: BookingID?           // sheet(item:), private feedback
    var presentedPass: PassPresentation?        // sheet(item:)
    var presentedReserve: ReserveRequest?       // sheet(item:)
    var presentedFilters: FilterContext?        // sheet(item:)
    var presentedGuestShare: GuestPassID?       // sheet(item:)
    var presentedWelcome: Bool = false          // fullScreenCover

    func open(_ url: URL) { /* section 5 */ }
    func dismissAllSheets() { /* one sheet at a time */ }
}
```

Rules:
- Use `sheet(item:)` for every item-based sheet. `[verified]` (`sheet(item:onDismiss:content:)` is named in [apple §7].)
- `dismissAllSheets()` runs before any new sheet opens from a deep link, a notification or an intent. Only one sheet shows at a time. [apple §2 push vs sheet]
- Paths hold small `Codable` values, never view models. Views load data by ID. [PROPOSAL]

### 2.3 Per-tab stacks

#### Today
`NavigationStack(path: $router.paths[.today])`
Root: `TodayView`.
Destinations: `.classSession`, `.bookingConfirmed`, `.booking`, `.myBookings`, `.club`, `.coach`, `.progress`, `.notifications`, `.reserve`.
Pushed from this stack: Class detail (`.classSession`). Sheets: Pass, Cancel, Reserve confirm, ClubSwitcher, Feedback.

#### Book
`NavigationStack(path: $router.paths[.book])`
Root: `BookView` (segments Classes, Courts, Lanes, Kids club).
Destinations: `.classSession`, `.bookingConfirmed`, `.myBookings`, `.booking`, `.club`, `.coach`, `.reserve(kind, club)`.
Sheets: Filters, Waitlist, Cancel, Invite, Reserve confirm, ClubSwitcher, Pass.
On iPad regular width the Book tab becomes a `NavigationSplitView`: list column, detail column shows `ClassDetailPanel`. No sheet. See section 8.

#### Clubs
`NavigationStack(path: $router.paths[.clubs])`
Root: `ClubsView` (map plus list).
Destinations: `.club`, `.classSession`, `.coach`, `.coachList`, `.reserve`.
Sheets: Hours, ClubSwitcher, Reserve confirm, Pass. The map screen also keeps a persistent bottom sheet (section 3.5).

#### You
`NavigationStack(path: $router.paths[.you])`
Root: `YouView`.
Destinations: `.membership`, `.plans`, `.freeze`, `.family`, `.familyMember`, `.guestPasses`, `.progress`, `.notifications`, `.settings`, `.myBookings`.
Sheets: Guest share, Pass, Add family member.

#### Search
`NavigationStack(path: $router.paths[.search])`
Root: `SearchView`. The `Tab(role: .search)` content. Destinations: `.club`, `.coach`, plus class results push `.classSession`.

### 2.4 Destination wiring
Register destinations once, on each stack root, through a shared modifier.

```swift
extension View {
    func appDestinations() -> some View {
        navigationDestination(for: AppRoute.self) { route in
            RouteView(route: route)          // one switch; each case returns its screen
        }
    }
}
```

### 2.5 TabView skeleton

```swift
TabView(selection: $router.selection) {
    Tab("Today", systemImage: "sun.horizon", value: .today) {
        NavigationStack(path: router.binding(for: .today)) { TodayView().appDestinations() }
    }
    Tab("Book", systemImage: "calendar", value: .book) { BookRoot() }
    Tab("Clubs", systemImage: "mappin.and.ellipse", value: .clubs) { ClubsRoot() }
    Tab("You", systemImage: "person.crop.circle", value: .you) { YouRoot() }
    Tab(value: Tab.search, role: .search) { SearchRoot() }
}
.tabViewStyle(.sidebarAdaptable)                                  // [verified] iOS 18+
.tabBarMinimizeBehavior(.onScrollDown)                            // [verified] iOS 26+
.tabViewBottomAccessory(isEnabled: router.shouldOfferPass) {      // [verified] iOS 26.1+
    PassAccessory()
}
.tint(Color.accentColor)                                          // AccentColor asset; see 04 section 2
```

`Tab(_:systemImage:value:role:content:)` `[verified]` iOS 18+. The `Tab(value:role:)` form without a title for the search role `[UNVERIFIED]`; the search tab can use `Tab("Search", systemImage: "magnifyingglass", value: .search, role: .search)`, which `[verified]` exists.

## 3. Modal policy

### 3.1 Push or sheet or cover
Rule: push for hierarchy, sheet for a scoped task, cover for media or a long flow. [apple §2 push vs sheet]

| Screen | Presentation | Detents | Why |
|---|---|---|---|
| Class detail | Push (`.classSession`) | n/a | Hierarchy: list to detail. Matches the shared spec and ClassPass. [shared §11.1] [mobbin-ios §2] |
| Booking confirmation (success view) | Push (`.bookingConfirmed`), back hidden, trailing "Done" | n/a | One success pattern: green check, headline, "Confirmed" pill, summary, buttons. [shared §7.2] [mobbin-standard-pass §2 rule 62] |
| Cancel sheet | `sheet(item:)` | `.medium` | Consequence list needs room: filled "Keep my spot", outline "Reschedule instead", quiet "Cancel booking". Replaces `confirmationDialog` for booking cancels. [shared §7.2] [mobbin-standard-pass §2 rules 27, 28, 43] |
| Waitlist sheet | `sheet(item:)` | `.medium` | Consent checkbox always shown; "Join waitlist" stays disabled until ticked. [shared §8.1] [mobbin-standard-pass §2 rule 47] |
| ClubSwitcher | `sheet(item:)` | `.medium`, `.large` | Toolbar button opens a list sheet with checkmarks; searchable. [shared §6.3] |
| Hours | `sheet(item:)` | `.medium` | `HoursTable` sheet from the "Open until 10 p.m." button. [shared §6.4] |
| Invite a friend | `sheet(item:)` | `.medium` | Link field, "Copy link", guest passes left. [shared §7.2] |
| Private feedback | `sheet(item:)` | `.medium` | Three choices and an optional note. No stars. [found §4] |
| Reserve confirm (court, lane, kids) | `sheet(item:)` | `.medium`, `.large` | Duration, partner and total fit in medium. [apple §2 detents proposal] [mobbin-ios §5 r10] |
| Filters | `sheet(item:)` | `.medium`, `.large` | A short pick list. [apple §2 detents] |
| Check-in pass | `sheet(item:)` | `.large` only. Drag indicator hidden. | Needs room for the code. Swipe down still dismisses. No auto-dismiss. [apple §2 detents, §6 time limits] |
| Guest pass share | `sheet(item:)` | `.medium` | Wraps `ShareLink`. |
| Add family member | `sheet(item:)` | `.large`, form | Compose-style form stays full height. [apple §2 detents] |
| Other destructive actions (sign out, remove member, revoke pass) | `confirmationDialog(_:item:)` | n/a | iOS 27 `item:` overload. `[skill:swiftui-whats-new-27]` [mobbin-ios §6 a12] |
| Freeze membership | Push to `FreezeView`, then a `.medium` bottom sheet (pause icon, bold question, full-width button, "Not now") | `.medium` | [mobbin-standard-pass §2 rule 48] |
| Welcome and sign in | `fullScreenCover(isPresented:)` | n/a | A prolonged flow. `[verified]` iOS 14+. [apple §2] |
| Wallet add | `PKAddPassesViewController` via `UIViewControllerRepresentable` | system | System UI. [apple §5 Wallet] |
| Calendar add | `EKEventEditViewController` via representable | system | System UI. [apple §5 Calendar] |

### 3.2 Sheet rules
- Add `.presentationDragIndicator(.visible)` on every resizable sheet. `[verified]` iOS 16+. [apple §2 detents]
- Cancel goes leading. Done goes trailing. Never show Cancel, Done and Back together. [apple §2 push vs sheet]
- A sheet with unsaved input confirms before swipe-dismiss. Use `interactiveDismissDisabled(isDirty)` plus a `confirmationDialog`.
- Use `.presentationBackgroundInteraction(.enabled(upThrough: .medium))` on the Reserve sheet so the member can scroll the slot grid behind it. [apple §2]
- Reserve sheets hold the slot for 5 minutes (one 5-minute extension) and show the countdown. [found §4]
- Do not set `presentationBackground`. Keep the system glass sheet material. [apple §3]

### 3.3 Dialogs and alerts
- Use `confirmationDialog(_:item:)` and `alert(_:item:)` with an `Optional` item for non-booking confirmations. `[skill:swiftui-whats-new-27]`
- Booking cancels use the cancel sheet, not a dialog. The destructive action is the quiet text button "Cancel booking"; the safe action is the filled "Keep my spot". [shared §7.2]
- Every destructive action also has a visible control, not only a swipe. [apple §6 other inputs] Swipe actions on booking rows use `swipeActions`; the same action sits in the row's `contextMenu` and in the detail screen. `[skill:swiftui-whats-new-27]` (use `swipeActionsContainer()` only when the list is a `ScrollView` plus `LazyVStack`.)

### 3.5 Clubs map sheet
The Clubs root is a full-bleed `Map` plus a persistent bottom sheet with detents collapsed (`.height(56)`), `.medium`, `.large`, `presentationBackgroundInteraction(.enabled)` and `interactiveDismissDisabled()`. It is presented when the Clubs tab is selected and dismissed on tab change. [shared §6.6] [mobbin-ios §5 r20] `[UNVERIFIED]` Whether the tab bar stays reachable under a persistent sheet on iOS 27. Fallback: a paged carousel of `ClubCard` `compact` over the map.

### 3.4 Pass presentation
```swift
.sheet(item: $router.presentedPass) { p in
    CheckInPassView(presentation: p)           // large detent, no auto-dismiss
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
}
```
- Pass opens at the root `TabView`. All tabs, deep links and intents use the same sheet.
- If another sheet is open, `dismissAllSheets()` closes it first.
- The pass raises brightness while visible and restores it on dismiss or when the app goes to the background. Details in `03` (Check-in pass) and `02` flow 3.

## 4. Toolbar layout per screen

Rules `[apple §2 toolbars]`:
- Titles stay under 15 characters. Large title on root screens.
- One prominent action at most, trailing.
- Toolbar items are SF Symbols without borders. Text buttons only for Edit, Cancel, Done.
- Every toolbar action is reachable another way.
- Use `visibilityPriority(.high)` on the items that must stay. Use `ToolbarOverflowMenu` for rare commands. `[skill:swiftui-whats-new-27]`

| Screen | Title | Leading | Trailing | Notes |
|---|---|---|---|---|
| Today | "Today" (large) | `ClubSwitcher` button (club short name + chevron; opens the ClubSwitcher sheet) | Notifications `bell` (dot if unread), then Pass `qrcode` with `.topBarPinnedTrailing` | Pass is `.high` priority. |
| Book | "Book" (large) | none | Filters `line.3.horizontal.decrease.circle`, My bookings `ticket` | Segmented picker is in content. Filters shows a count in its accessibility value. |
| Class detail | none (inline) | Back | Share `square.and.arrow.up`, Favourite `heart` | Booking action is in the sticky bottom bar. [mobbin-ios §5 r5] |
| Booking confirmation | "Confirmed" inline | none (back hidden) | Done | |
| Cancel / Waitlist / Hours / Invite sheets | inline | Close | none (actions in the sheet body) | |
| My bookings | "Bookings" | none | Edit (reorder is not used; Edit toggles delete mode) | Segmented Upcoming, Past in content. |
| Clubs | none (map is full bleed) | none | none | Search pill, filter chips and `MapUserLocationButton` sit on the map. [mobbin-standard-pass §2 rule 57] |
| Club detail | Club name (inline, truncates) | Back | Share, Favourite (set as home club) | Sticky bottom bar: Directions plus Reserve. |
| Reserve sheet | "Reserve court" inline | Cancel | none | Confirm button in the bottom bar; hold countdown above it. |
| Check-in pass | none | none | Done | Done is `.confirmationAction`. |
| Progress | "Progress" | Back | Range menu (`Menu` with 4W, 12W, 1Y) | |
| Coach profile | Coach name | Back | Share | Bottom bar: "Book intro session" (Summit) or "Book a session". |
| Membership | "Membership" | Back | none | |
| Freeze | "Freeze" | Back | none | |
| Family | "Family" | Back | Add `plus` | Also an "Add a family member" button in content. [mobbin-ios §5 r31] |
| Guest passes | "Guest passes" | Back | none | |
| Notifications | "Inbox" | Back | Filter menu, Mark all read | |
| Settings | "Settings" | Back | none | |
| You | "You" (large) | none | Settings `gearshape` | |
| Search | system search field | none | none | |

## 5. Search

### 5.1 Search tab
- `Tab(role: .search)` with `.searchable(text:tokens:)` on the root. `[verified]` search role names `[apple §2 tab bar]`.
- Set `tabViewSearchActivation(.searchTabSelection)` so tapping the tab focuses the field. `[UNVERIFIED]` (case name; API `tabViewSearchActivation(_:)` is named in [apple §2]).
- Scopes: `All`, `Classes`, `Clubs`, `Coaches`, `Help`. Use `.searchScopes($scope, activation: .onSearchPresentation)`. `[verified]` iOS 16.4+.
- Tokens: club tokens ("Mesa – Dobson") and category tokens ("Strength"). A token narrows results. Use `searchable(text:tokens:)`.
- Suggestions: before typing, show "Recent" (last 8), then "Try" chips: "Climb Cycle 6 a.m.", "Pickleball Open Play", "Kids club", "Sauna".
- Empty results: `ContentUnavailableView.search(text:)` `[verified]`, with a "Clear filters" action when tokens exist.
- Ranking: exact class name, then club, then coach, then help.

### 5.2 In-tab search
- Clubs: a `searchable` field accepts a place name or ZIP. It geocodes and moves the map. It does not search content. Placeholder: "City or ZIP".
- Book: no search field. Use the Filters sheet. A 7-day schedule is short enough to scan. [mobbin-ios §5 r1]

## 6. State restoration

| State | Stored in | Restored when |
|---|---|---|
| Selected tab | `@SceneStorage("tab")` | Warm launch under 30 min |
| Per-tab path | `@SceneStorage("path.<tab>")` as JSON of `[AppRoute]` | Warm launch under 30 min |
| Book segment, selected day | `@SceneStorage("book.segment")`, `"book.day"` | Day resets to today after midnight |
| Filters | `@AppStorage` (per member) | Always; shown as a chip row |
| Home club, last club | Account store (synced) | Always |
| Open sheets | Not stored | Never. Sheets are tasks. |
| Draft family member form | `@SceneStorage` per field | Until the form submits |
| Pass brightness | Not stored | Reset on dismiss |

- Use `@State` correctly under the iOS 27 macro: do not assign `@State` inside `init` before other stored properties. `[skill:swiftui-whats-new-27]` (`references/state-macro.md`.)
- If a stored route fails to decode, drop the whole path and go to the tab root. Never crash.
- If a stored route points to a deleted booking, show `ContentUnavailableView("Booking not found")` with "Back to bookings".

## 7. Deep links and universal links

Associated domain: `applinks:app.cactuspeak.example` (fictional placeholder). Custom scheme: `cactuspeak://` for widgets and Live Activities.

| URL path | Opens | Notes |
|---|---|---|
| `/pass` | Pass sheet | From Wallet, widget, Control, intents |
| `/book/class/{sessionID}` | Class detail (push on Book tab) | Notification, share, calendar |
| `/book/class/{sessionID}?action=confirm` | Class detail with the 30-min hold: "Confirm spot" | Waitlist notification |
| `/book/courts?club={slug}&date=YYYY-MM-DD` | Book tab, Courts segment | |
| `/book/lanes?club={slug}` | Book tab, Lanes segment | |
| `/book/kids?club={slug}` | Book tab, Kids club segment | |
| `/clubs` | Clubs tab | |
| `/clubs/{slug}` | Club detail | `mesa-dobson`, `mesa-red-mountain`, `mesa-downtown`, `gilbert-val-vista`, `gilbert-heritage` |
| `/clubs/{slug}/hours` | Club detail with the Hours sheet open | |
| `/bookings` , `/bookings/{id}` | My bookings, Booking detail | |
| `/coaches/{id}` | Coach profile | |
| `/progress` | Progress | |
| `/inbox` | Notifications | |
| `/membership`, `/membership/freeze`, `/membership/plans` | Membership screens | Face ID gate for billing |
| `/family`, `/family/join/{token}` | Family, accept invite | Teen accounts |
| `/guest/{token}` | Guest pass landing (opens the app, or web fallback) | |
| `/invite/court/{reservationID}` | Partner invite screen | See flow 8 |

Handlers:
- `.onOpenURL { router.open($0) }` for custom scheme and universal links.
- `.onContinueUserActivity(NSUserActivityTypeBrowsingWeb)` for universal links.
- `.onContinueUserActivity(CSSearchableItemActionType)` for Spotlight results (clubs, classes).
- Notification response: map `userInfo["route"]` to the same URL string, then call `router.open`.
- Widgets and Live Activities use `widgetURL(_:)` or `Link`.
- App Intents `OpenIntent` use `URLRepresentableEntity`. `[skill:app-intents-specialist]` (`references/url-representation.md`.) Keep the URL map stable like an ID. [skill:app-intents-specialist]
- Unknown URL: open Today and show a toast "That link does not match anything in the app."
- Signed-out state: save the URL, run sign-in, then open it.

## 8. iPad behaviour

- Apply `.tabViewStyle(.sidebarAdaptable)`. On iPad the tab bar is at the top and can become a sidebar. `[verified]` [apple §2]
- Keep five items or fewer in the default list so compact and regular match. [apple §2]
- Group the sidebar with `TabSection`:
  - "My day": Today, Book.
  - "Explore": Clubs.
  - "Account": You (sub-pages as sidebar children: Membership, Progress, Family, Guest passes, Settings).
  - Search stays as the trailing search item.
- `tabViewCustomization` lets members hide Clubs or reorder. Today and You cannot be hidden. `[UNVERIFIED]` (API `tabViewCustomization(_:)` is named in [apple §2]; the "cannot hide" option needs a check.)
- Book tab at regular width: `NavigationSplitView` with list column (day strip, segments, rows) and a detail column that shows `ClassDetailPanel`. Use `ClassDetailPanel` as the same view that fills the iPhone sheet.
- Clubs tab at regular width: map in the detail area and the club list in a leading column. No map-over-sheet. The list is always present. [mobbin-ios §6 a10]
- Today at regular width: two columns with `Grid`. Left: next class, busyness. Right: bookings, streak. Cap content width at 720 pt per column.
- Use `.inspector` for Class detail on Clubs and Search only, if a split view is not present. `[apple §2 inspector]`
- Pass sheet on iPad: `.presentationSizing(.form)` `[UNVERIFIED]`, centered code at 320 pt.
- Support Stage Manager and Split View. Minimum width 320 pt. Test every screen at 1/3 width. Use `ViewThatFits` over fixed breakpoints. `[skill:app-resizability]` was not applied in this pass; see section 11.
- Keyboard: ⌘1 to ⌘4 select tabs, ⌘F focuses search, ⌘P shows the pass. Do not override system shortcuts. [apple §6 other inputs]
- Pointer: rows get `.hoverEffect(.highlight)`. Context menus on class rows and club cards.

## 9. Permissions timing

Ask for a permission only when the member sees why. Show a short pre-prompt screen we own, then the system prompt. Never ask at launch. [apple §6] [PROPOSAL]

| Permission | When | Our pre-prompt copy | If denied |
|---|---|---|---|
| Notifications (`UNUserNotificationCenter`) | Onboarding step 3 ("Alerts"), after the member picks which alerts they want. Second chance: first time they tap "Join waitlist". | "Waitlist spot opened? We'll tell you. You get 30 minutes to say yes." | Show an inline banner in Notifications settings. Waitlist still works; Today shows a "Check your spot" card. |
| Time Sensitive notifications | Same prompt. Used only for waitlist promotion and class-cancelled-by-club. | Capability needed in the target `[UNVERIFIED]` | Falls back to normal delivery. |
| Location, When In Use | First tap on "Use my location" in Clubs, or on "Nearest club" in onboarding step 2. | "Find the nearest club and show your pass when you arrive. We only use your location while the app is open." | Clubs uses a ZIP search. Arrival accessory uses booking time only. |
| Calendar (write-only) | First tap on "Add to calendar". Prefer `EKEventEditViewController`, which does not need full access. | None; the system sheet explains. | The button shows "Calendar off. Open Settings." |
| Face ID | First open of Membership billing or Freeze. | System prompt via `LocalAuthentication`. | Passcode fallback. |
| Live Activities | On the first booking, in the confirmation screen: toggle "Show on Lock Screen". | "See your class time and room on the Lock Screen." | Skip. Notification still fires. |
| HealthKit (optional) | Never in onboarding. A card at the bottom of Progress: "Add workouts from Apple Health". Read workouts only. | `[UNVERIFIED]` HealthKit was not researched. [apple §5 HealthKit] | Progress counts club visits only. |
| Photos | Profile photo uses `PhotosPicker`, which needs no permission. | n/a | n/a |
| Contacts | Not used. Partner and guest invites use `ShareLink` and the system share sheet. | n/a | n/a |
| Camera | Not used. | n/a | n/a |
| Tracking (ATT) | Not used. No cross-app tracking. | n/a | n/a |

## 10. Architecture notes for the build

- Modules: `CactusPeakKit` (models, API client, router types, App Intents entities), `CactusPeakUI` (brand components), app target, widget extension (widgets, controls, Live Activity), notification service extension.
- Data: `@Observable @MainActor` stores injected through `@Environment`. Pass only the fields a row needs. `[skill:swiftui-specialist]` (`dataflow.md`.)
- `ForEach` uses stable IDs (session ID, club ID). Never use indices. `[skill:swiftui-specialist]` (`foreach.md`.)
- Do not store closures or class types in `@Entry` environment defaults. `[skill:swiftui-specialist]` (`environment.md`.)
- Strings: use `LocalizedStringResource` for view-model text; `Text` with literals in views. `[skill:swiftui-specialist]` (`localization.md`.)
- Images: `AsyncImage` caches by default on iOS 27. Use `AsyncImage(request:)` with `.returnCacheDataElseLoad` for club photos. `[skill:swiftui-whats-new-27]`
- Offline: every list view reads from a local cache first, then refreshes. The pass never needs the network (cached for 24 h; see `02` flow 3).
- Live data: busyness polls every 60 s while Today is visible. The server updates counts every 5 min. [found §2] Do not poll faster.

## 11. Open questions and unverified items

- `[UNVERIFIED]` Persistent bottom sheet over the Clubs map and tab bar reachability (section 3.5).

- `[UNVERIFIED]` `Tab(value:role:)` title-less form; `tabViewSearchActivation(.searchTabSelection)` case name; `tabViewCustomization` hide rules; `presentationSizing(.form)`; Time Sensitive capability setup.
- The `app-resizability` skill was not read. Run it before the iPad release.
- The associated domain is a placeholder.
- Revision 2 settled the lane counts, hold meaning, freeze start, guest pass, age rules and ratings from the foundation. They are no longer open.
