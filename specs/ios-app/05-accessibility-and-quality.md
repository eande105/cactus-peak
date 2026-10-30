# Cactus Peak Athletic iOS app — 05 Accessibility and quality (revision 2)

Read `01` to `04` first. Tags are defined in `01` section 0.1.
Target: WCAG 2.2 AA in spirit, and every Apple Accessibility Nutrition Label that applies: VoiceOver, Voice Control, Larger Text, Dark Interface, Differentiate Without Color Alone, Sufficient Contrast, Reduced Motion, Captions (not applicable: no video in v1). [apple §6] [found §6 p6]

## 1. Dynamic Type

### 1.1 Rules
- All text uses a text style. Custom fonts use `Font.custom(_:size:relativeTo:)`. `[verified]` [skill:accessibility-dynamic-type-specialist]
- Never use `.font(.system(size:))`, `Font.custom(_:fixedSize:)` or `.minimumScaleFactor` as the strategy. Never fix a `.frame(height:)` around text.
- Icons and spacing that sit beside text use `@ScaledMetric(relativeTo:)`.
- Do not clamp with `.dynamicTypeSize(...)`. The only candidate was the Archivo time on the Today card. It fits at AX5 (about 78 pt tall on a 390 pt wide screen), so no clamp is used. If a clamp is ever added, write the reason next to it. [skill:accessibility-dynamic-type-specialist]
- Support at least 200 % enlargement. Test at AX5: body 53 pt, large title 60 pt. [apple §6]
- Keep the visual order at every size. Stack text above secondary items. Cut columns. [apple §6]
- Switch layouts with `@Environment(\.dynamicTypeSize)` (`isAccessibilitySize`) or `ViewThatFits`.

```swift
@Environment(\.dynamicTypeSize) private var type
var body: some View {
    let layout = type.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 8))
                                          : AnyLayout(HStackLayout(alignment: .firstTextBaseline, spacing: 12))
    layout { time; details; spots }
}
```

### 1.2 Per-screen AX5 behaviour (test matrix)
| Screen | At AX5 |
|---|---|
| Welcome | Scroll. Title wraps. Buttons grow. |
| Onboarding | Tiles one column. Primary button stays pinned. |
| Today | Cards stack. Next-up buttons stack and fill width. Club switcher moves from toolbar to a content row. |
| Book | Segments become a menu. Day strip chips two lines (88 pt). Row: time above name, spots under name. |
| Filters | Standard `Form`. |
| Class detail (pushed page) | Hero 160 pt. Stats row becomes label–value pairs. Secondary buttons stack. Sticky bar stacks (availability above button). |
| Booking confirmation | Scroll. Buttons stack. |
| My bookings | Time above title, status under title. |
| Clubs | Chips wrap. Segment becomes a menu. Carousel cards 90 % width. |
| Club detail | Hero 180 pt. Facts stack. Chips wrap. |
| Reserve | One-column slot grid. |
| Check-in pass | QR stays 280 pt. Name and number scale. Page scrolls. |
| Progress | Charts min 220 pt tall. Tiles one column. "View as table" always present. |
| Membership, Plans, Freeze, Family, Guest passes, Inbox, Settings | Native `List` and `Form` behaviour. Price wraps under plan name. |
| Widgets | Use text styles. `ViewThatFits` to drop secondary lines. |
| Live Activity | System sizes the layout; keep two lines of text only. |

Exempt from scaling: tab bar labels and toolbar items (system, Large Content Viewer where the system provides it). The QR code is a graphic. [skill:accessibility-dynamic-type-specialist]

### 1.3 Checks
1. Run the Dynamic Type audit on every view file (pass criteria: text styles, `relativeTo:` for custom fonts, `ScaledMetric`, no fixed text heights).
2. Take screenshots at XS, Default, XXXL, AX1, AX3, AX5 for all 26 screens in `03`.
3. Check no truncation of the primary text (class name, time, club name, price). Secondary text may wrap to 3 lines. [apple §6]

## 2. VoiceOver

### 2.1 Rules
[skill:accessibility-voiceover-specialist]
- Every control has a readable label. Icon-only buttons have `.accessibilityLabel`. No identifiers like `btnBook`.
- Rows are one element: `.accessibilityElement(children: .combine)`. Do not combine when a row holds separate buttons (then use `.contain`).
- Section titles: `.accessibilityAddTraits(.isHeader)`.
- Custom tappable views: `Button` (best) or `.accessibilityAddTraits(.isButton)`.
- Decorative images: `.accessibilityHidden(true)`. Meaningful images have a label.
- Live values (`BusynessMeter`, countdown, hold timer): `.accessibilityAddTraits(.updatesFrequently)`.
- Swipe actions are repeated as `.accessibilityAction(named:)` and in the context menu.
- Use `.accessibilitySortPriority` only when visual order differs from reading order (the bottom booking bar reads after the content, which is correct; the hold card reads first, which matches its place).
- Adjustable controls (day strip, duration, goal stepper) use `.accessibilityAdjustableAction`.
- Never time out a screen. The pass has no auto-dismiss. [apple §6]

### 2.2 Labels for the custom components
| Component | Label | Value | Traits / actions |
|---|---|---|---|
| `RibMeter` (base) | Given by wrapper | "N of 5" | Hidden when the row has the text |
| `IntensityRibs` | "Intensity" | "4 of 5, Hard" | |
| `BusynessMeter` | "Club busyness" | "Steady, 3 of 5. Updated 5:35 a.m." | `.updatesFrequently` |
| `CapacityIndicator` | "Spots" | "4 of 24 bikes left" | |
| `CategoryBadge` | Category name | none | Icon is part of the label |
| `ClassCard` `schedule-row` | "Climb Cycle, 6:00 a.m., 45 minutes, Marisol V., Cycle studio, intensity 4 of 5, 4 bikes left" | State: "Booked" or "On waitlist 2" | Row opens details (hint "Opens class details"); the inner `BookingStateButton` is its own element. Actions: Book, Join waitlist, Cancel booking, Add to calendar |
| `ClassCard` (featured) | "Next up. Climb Cycle, 6:00 a.m., starts in 20 minutes ..." | | Actions: Show pass, Directions, Cancel booking |
| `ScheduleDayStrip` | "Day" | "Thursday October 29" | Adjustable. Each chip is a button, `.isSelected` when chosen |
| `ReservationSlotGrid` row (iOS list) | "8:00 a.m." | "Courts 1, 3 and 4 open" or "Full, unavailable" | Button, `.isSelected`. Lane rows: "5 of 8 lanes open"; swimmer count "1 of 2 swimmers" |
| `DurationChips` | "Duration" | "90 minutes" | Adjustable; each chip `.isSelected` |
| `BookingStateButton` | State label ("Book", "Booked", "Join waitlist", "On waitlist 3", "Confirm spot, 28 minutes 41 seconds", "Full", "Booking paused", "Ridge only", "Started", "Try again") | Spots in the neighbouring cell; the disabled reason is read as the hint | Button. `hold` timer announced at start, 5 min, 1 min. Disabled states stay in the focus order with the reason. |
| `CheckInPass` | "Check-in pass. Maya Lopez. Ridge." | "Member number 0 0 4 2, 1 1 8 7. Code refreshes every minute" | The QR image: label "Check-in code for Maya Lopez. Show it to the scanner at the front desk." Announce "Checked in at 5:43 a.m." on scan. Never closes on a timer. |
| `ClubCard` | "Gilbert – Val Vista. 2.1 miles. Steady. Open until 10 p.m." | | Button |
| `ClubPin` | Same as card | | Map container label "Map of 5 clubs. Use the list below." |
| `HoursTable` row | "Monday, 4:30 a.m. to 10 p.m." | "Today" on the current day | |
| `PopularTimesChart` | See section 2.3 | | |
| `VisitStreak` | "Visit streak" | "6-week streak. This week: 2 visits." | Each dot: "Monday, visited" |
| `ProgressRibs` | Given by context | "2 of 3 visits" | |
| `InstructorChip` | Name | | Avatar hidden |
| `CoachCard` (`row`, `card`) | "Marisol Vega, Cycle coach, Gilbert – Val Vista" | | Button |
| `InstructorChip` `choice` | Name | "Selected" / "Available 8 a.m. to 8 p.m." | `.isSelected` |
| Cancel sheet | "Cancel Climb Cycle?" | Consequence lines read as text ("Counts as a strike, 2 of 3 in 30 days") | The X icons are hidden; the words carry the meaning. Buttons: Keep my spot, Reschedule instead, Cancel booking. |
| Waitlist sheet | "Join the waitlist" | Consent checkbox: "I understand the late-cancel rule", not checked | The primary button is disabled and reads the reason ("Tick the box to join"). |
| `PlanCard` | "Plan Ridge, 79 dollars a month" | Perks as a list | Current plan: "Current plan. Your plan." Frozen: "Frozen until February 19." |
| `AmenityChip` | Amenity name | | Not a button |
| `EmptyState` | Title + description | | Action button reads its label |
| Toolbar `qrcode` | "Show check-in pass" | | |
| Toolbar `bell` | "Inbox" | "3 unread" or "No unread" | |
| Toolbar Filters | "Filters" | "3 filters on" | |

### 2.3 Charts: `accessibilityChartDescriptor`
`accessibilityChartDescriptor(_:)` `[verified]` and `AXChartDescriptorRepresentable` `[verified]` (both named in the Apple docs). The init parameter names of `AXChartDescriptor` and the axis descriptors are `[UNVERIFIED]`; check in Xcode.

Charts that need a descriptor:
| Chart | Title | X axis | Y axis | Summary |
|---|---|---|---|---|
| Visits per week | "Visits per week" | "Week starting" (categorical, 12 dates) | "Visits" (numeric 0 to 7) | "Average 2.8 visits a week. Goal of 3 met in 7 of 12 weeks." |
| Classes by category | "Classes by category" | "Category" | "Classes" | "Most attended: Cycle, 14." |
| Typical busyness | "Typical busyness, Thursday" | "Hour" (4 a.m. to 10 p.m.) | "Level" (1 to 5) | "Usually quiet before 7 a.m. Busiest 5 to 7 p.m." |
| Visit calendar | not a chart: a grid of buttons | | | Each day: "Oct 27, visited, 1 class" |

```swift
struct VisitsDescriptor: AXChartDescriptorRepresentable {
    let weeks: [WeekVisits]; let goal: Int
    func makeChartDescriptor() -> AXChartDescriptor {
        let x = AXCategoricalDataAxisDescriptor(title: "Week starting",
                                                categoryOrder: weeks.map { $0.label })
        let y = AXNumericDataAxisDescriptor(title: "Visits", range: 0...7,
                                            gridlinePositions: [goal.asDouble]) { "\(Int($0)) visits" }
        let series = AXDataSeriesDescriptor(name: "Visits", isContinuous: false,
                                            dataPoints: weeks.map { .init(x: $0.label, y: Double($0.count)) })
        return AXChartDescriptor(title: "Visits per week", summary: summary,
                                 xAxis: x, yAxis: y, additionalAxes: [], series: [series])
    }
    func updateChartDescriptor(_ d: AXChartDescriptor) {}
}
```
- Also add the "View as table" button under every chart. A table is the fallback for Voice Control and Switch Control users too.
- Audio graph comes from the descriptor. [apple §5 Charts]
- Individual marks may also use `.accessibilityLabel` and `.accessibilityValue`; hide decorative marks (`RuleMark` goal) with `.accessibilityHidden(true)` because the descriptor covers it.
- Keep chart content small and split into subviews (type-check cost). [skill:swiftui-whats-new-27]

### 2.4 Focus and announcements
- A sheet opens with focus on its title (`.accessibilityFocused`). A dismissed sheet returns focus to the row that opened it.
- After booking: announce "Booked. Climb Cycle, Thursday 6:00 a.m." (`AccessibilityNotification.Announcement`). `[UNVERIFIED]` exact SwiftUI type name; fallback `UIAccessibility.post(notification: .announcement, argument:)`.
- After scan success: "Checked in at 5:43 a.m."
- After a waitlist hold arrives while the app is open: announce "A spot opened in Rib Rack Strength. Hold ends 4:12 p.m."
- Level change in busyness: announce only if the user is on the Club detail "Live now" card. Not on Today (too noisy).
- Errors are announced and linked to the field. [gaps r14]

### 2.5 Voice Control, Switch Control, Full Keyboard Access
- Visible labels match accessibility labels so "Tap Book class" works. Use `.accessibilityInputLabels` for alternates ("Book", "Reserve").
- Every gesture has a button. Swipe actions have menu equivalents. [apple §6]
- Focus order is logical. iPad: ⌘1 to ⌘4, ⌘F, ⌘P. Do not override system shortcuts. [apple §6]
- Custom focus ring colour `BrandFocus` for custom views only (`focusEffect`).

### 2.6 Widgets and Live Activities
- Provide accessible descriptions for widget entries and Live Activity regions (labels on glyphs, combined elements, "Starts in 14 minutes" as text, not only a timer). [apple §5]
- No sensitive data on the Lock Screen: no name, no member number, no code. [apple §5]

## 3. Contrast

Method: WCAG formula. The numbers below are my hand calculation (Python), not a tool report. Colours come from asset catalogs, so automated audits mark them **NEEDS VERIFICATION**. Check each pair with the Digital Color Meter and the Accessibility Inspector in all four appearances. [skill:accessibility-sufficient-contrast-specialist]

### 3.1 Targets
Text under 18 pt regular (or 14 pt bold): 4.5:1. Large text: 3:1. UI boundaries and meaningful icons: 3:1. Composite opacity before measuring. [skill:accessibility-sufficient-contrast-specialist] [apple §6]

### 3.2 Results (light and dark, standard contrast)
| Foreground on background | Ratio | Result | Where used |
|---|---|---|---|
| `TextPrimary` on Sand | 15.28 | Pass | Body |
| `TextPrimary` dark `#F2ECE2` on dark surface | 13.58 | Pass | Body |
| `TextMuted` on Sand / white | 5.21 / 5.86 | Pass | Captions |
| `TextMuted` dark on dark surface / canvas | 6.08 / 6.75 | Pass | Captions |
| **iOS `secondaryLabel` on white / Sand** | **3.44 / 3.30** | **Fail** for small text | Do not use in our content. Use `TextMuted`. |
| iOS `secondaryLabel` dark on dark surface | 5.70 | Pass | System chrome only |
| White on Arizona Copper | 4.95 | Pass (min text 14 pt bold or 17 pt regular; buttons are 17 pt semibold) | Prominent button, selected day pill |
| `#121A16` on Dawn Copper | 6.22 | Pass | Prominent button in dark |
| **White on Dawn Copper** | **2.86** | **Fail** | Must never occur. See `BookingStateButton` fallback. |
| Arizona Copper text on white | 4.95 | Pass | Tint on cards |
| **Arizona Copper text on Sand** | **4.40** | **Fail** (small text) | Use `Link` 5.61 |
| `Link` on Sand / white | 5.61 / 6.31 | Pass | Text buttons on canvas |
| Dawn Copper text on dark canvas / surface | 6.22 / 5.60 | Pass | Tint text in dark |
| Dawn Copper on dark `surface-muted` | 4.81 | Pass | |
| Palo Verde / Amber / Chili on Sand | 5.32 / 5.63 / 5.84 | Pass | Status text |
| Dark status on dark surface | 8.09 / 8.49 / 6.66 | Pass | |
| `BrandBorderStrong` on white / Sand | 3.92 / 3.48 | Pass (3:1) | Control outlines, unfilled ribs |
| `BrandBorderStrong` dark on dark surface | 3.76 | Pass (3:1) | |
| `BrandBorder` Caliche on white | 1.49 | Decorative only. Never the only boundary of a control. | Card hairlines |
| `BrandRibFill` Saguaro on Sand / cream on dark surface | 12.02 / 13.58 | Pass | Ribs |
| Dawn Copper symbol on Saguaro Night | 4.74 | Pass | App icon, Wallet labels |
| Sand / white text on a Saguaro Night 80 % band over a white photo | 6.35 / 7.15 | Pass (worst case) | Text on photos [shared §2.6] |

### 3.3 Category colours (final shared values, `04` section 2.3)
Numbers are from the shared spec (`../01-shared-brand-components.md` section 2.2); my spot checks of the fills agree. Text token = the colour used for category-coloured text. Tint = 10 % (light) or 14 % (dark) of the fill.
| Category | Fill on white / Sand | White on fill | Text token on its tint over white / Sand | Dark fill on `Surface` | Dark text on 14 % tint over `Surface` | `#121A16` on dark fill |
|---|---|---|---|---|---|---|
| Strength (text `#9E4522`) | 4.95 / 4.40 | 4.95 | 5.53 / 4.94 | 5.60 | 4.54 | 6.22 |
| Cycle | 7.87 / 6.99 | 7.87 | 6.72 / 6.03 | 6.29 | 4.90 | 6.99 |
| Conditioning | 6.33 / 5.63 | 6.33 | 5.48 / 4.89 | 8.49 | 6.34 | 9.42 |
| Mind & Body (`#52684A`) | 6.11 / 5.43 | 6.11 | 5.33 / 4.75 | 8.26 | 6.16 | 9.17 |
| Aqua | 5.88 / 5.23 | 5.88 | 5.10 / 4.57 | 7.89 | 5.95 | 8.76 |
| Court (`#7F6019`) | 5.85 / 5.20 | 5.85 | 5.09 / 4.55 | 9.25 | 6.77 | 10.27 |
| Recovery | 7.19 / 6.39 | 7.19 | 6.19 / 5.55 | 7.23 | 5.55 | 8.03 |
| Youth | 6.38 / 5.67 | 6.38 | 5.51 / 4.92 | 7.43 | 5.69 | 8.25 |
- Icons and stripes: all at 3:1 or more (lowest 4.40, Strength fill on Sand).
- Text in a category colour passes 4.5:1 on its tint over white and Sand, and on `Surface` or `Background` (not on `SurfaceMuted`). Lowest: Aqua 4.57 on Sand. Do not weaken the tint rule. (Revision 1 table used the old Mind & Body and Court colours, where those failed; the final colours pass.)
- Strength fill as small text on Sand is 4.40:1 and fails; use the text token `#9E4522` or `TextPrimary`.
- Increased Contrast values (`04` section 2.3) measure 6.7:1 or more against white and Sand (light) and 7.4:1 or more against `Surface` (dark). Mind & Body IC `#3E4E38` is 8.93:1 on white; Court IC `#5F4813` is 8.67:1.

### 3.4 Process
1. Verify every asset in light, dark, light-IC, dark-IC with Digital Color Meter on a device screenshot.
2. Run Accessibility Inspector "Contrast" on each screen in all four appearances.
3. Test glass chrome over the busiest content (hero photo, map) with Reduce Transparency and Increase Contrast on. [apple §3]
4. Photo text: all text on a photo sits on a solid Saguaro Night band at 80 % opacity, in Sand or white. Worst case over a pure white photo: Sand 6.35:1, white 7.15:1. No gradient. No text over faces. [shared §2.6, §4.4] (Revision 1 used a 55 % gradient scrim; removed.)
5. Check opacity: dimmed (disabled) rows may be below 4.5:1; disabled controls are exempt, but the reason must also be written in text ("Full", "Opens Tue 5:30 a.m."). [skill:accessibility-sufficient-contrast-specialist]
6. Differentiate Without Color: busyness (ribs + word), categories (icon + name), status (icon or word), selected day (fill + `isSelected`), errors (icon + text). Test with colour filters on.

## 4. Reduce Motion, Reduce Transparency and other settings

| Setting | Behaviour |
|---|---|
| Reduce Motion | No stagger on ribs, no scale or slide transitions (use 150 ms fade), no symbol bounce, no hero parallax, static code ring. Springs: none with bounce. [apple §6] |
| Prefer Cross-Fade Transitions | Same as Reduce Motion for view transitions. |
| Reduce Transparency | System chrome adapts. Our content layer is already solid. Check the arrival accessory and the sticky bar. [apple §3] |
| Increase Contrast | Use the IC asset values. System glass adapts. Check borders show (`BrandBorder` IC = `#8C7F6B`). |
| Bold Text | SF follows. Archivo is already heavy; confirm no layout break. [apple §4] |
| Button Shapes | Text buttons get underlines through the system. Check `LinkButtonStyle` shows it. |
| On/Off Labels | `Toggle` shows labels. Do not replace toggles with custom switches. |
| Smart Invert | Photos and the QR frame use `.accessibilityIgnoresInvertColors(true)`. |
| Dark Interface | Full dark theme per `04` section 2. No pure black. |
| Differentiate Without Color | See 3.4 step 6. |
| Voice Control, Switch Control | Section 2.5. |
| Assistive Access | Not supported in v1. The pass opens with Siri "Show my pass". Confirmations ask twice for cancel and freeze if Assistive Access is detected `[UNVERIFIED]`. [apple §6] |
| Left-to-right only | v1 ships LTR languages. Layout still uses `.leading`/`.trailing` so RTL works later. |
| Touch accommodations | No custom gesture timing. |

## 5. Touch targets (44 pt)

Rule: 44 x 44 pt minimum for every interactive element. Space around bezelled controls about 12 pt, around plain controls about 24 pt. [apple §6]

| Element | Visual size | Target |
|---|---|---|
| Day chip | 56 x 64 pt | Same |
| Slot cell | 150 x 64 pt | Same |
| Filter chip, category chip | 32 to 36 pt tall | `.frame(minHeight: 44)` with `.contentShape(.rect)` |
| Heart (favourite), share | 24 pt glyph | System toolbar button (44 pt) |
| `InstructorChip` (tappable) | 28 pt | Row padded to 44 pt |
| Rib meters, `AmenityChip` | Not interactive | n/a |
| List rows, cards | 64 pt or more | Whole row |
| Swipe actions | System | Plus visible menu equivalent |
| Map pins | 44 pt circle | Same |
| Page dots on hero | 8 pt | Not interactive (swipe or VoiceOver adjust) |
| Close `xmark` in sheet | System | System |
| Text links in body | Inline | Use `Button` rows (44 pt) for standalone links |

## 6. Localisation readiness

- Use String Catalogs (`Localizable.xcstrings`). Strings in views are literals that SwiftUI localises. Non-view types use `LocalizedStringResource`. Do not wrap literals in `NSLocalizedString` or `String(localized:)`. [skill:swiftui-specialist] (`localization.md`)
- Interpolate, never concatenate. Do not build sentences from separate pieces. "Created by \(name)" style. [skill:swiftui-specialist]
- Plurals: use catalog plural variations for "%lld spots left", "%lld bikes left", "%lld months", "%lld strikes".
- Dates and times: `Text(date, format: .dateTime.hour().minute())`. The brand style "6:00 a.m." is the en-US output; do not hardcode it. Use `.formatted(...)`. No `DateFormatter` with fixed strings. [skill:swiftui-specialist]
- Currency: `.currency(code: "USD")`. Distances: `Measurement` with `.formatted()`. Temperature in club notices comes from the server as a localised string.
- Club names, class names and coach names are proper names or product names. Class names may be translated per catalog; club names are not. Use `Text(verbatim:)` for member numbers and codes.
- Layout: allow 40 % text growth. No fixed text widths. `ViewThatFits` where tight. `.leading` and `.trailing` only. [skill:swiftui-specialist]
- Case: write the case in the string. No `.textCase(.uppercase)` for eyebrows; the eyebrow string is already upper-case in the catalog so translators can adjust. [skill:swiftui-specialist]
- No text in images. Photos have no baked-in text. Wallet pass strings are localised in `pass.strings`.
- Translator comments on every string with a variable, for example "Spots left on a class card. %lld is a number."
- First locales: English (US), then Spanish (es-US) for the East Valley. `[PROPOSAL]` Archivo covers Latin accents (ñ, á). `[UNVERIFIED]` check glyph coverage in the bundled files.
- Pseudo-language test (double length, accented) on every screen. Test a right-to-left pseudo-locale for layout flips.
- Use the Xcode String Catalog tools and the translation skills when the catalog is ready. (`xcode-translation` skills exist in this workspace; they were not used for this spec.)
- App Shortcut phrases are localised per language; the English phrases are the contract (see `04` section 9). [skill:app-intents-specialist]

## 7. Performance targets `[PROPOSAL]`

Reference devices: iPhone 13 (low end for iOS 27, assumed) and iPhone 17 Pro. iPad Air for iPad checks. Numbers are targets to be measured; none was measured for this spec.

| Metric | Target |
|---|---|
| Cold launch to interactive Today (cached data) | 1.0 s on iPhone 13, 0.6 s on iPhone 17 Pro |
| Cold launch to fresh data | 2.0 s on LTE |
| Pass sheet open (tap to visible code) | 150 ms. The code never waits for the network. |
| Pass sheet from Lock Screen widget | 1.5 s total including unlock |
| Book list first paint after day change | 100 ms from cache, 600 ms fresh |
| Booking request round trip | 800 ms p95 on LTE; UI shows "Booking…" within 50 ms |
| Scroll | 60 fps on iPhone 13, 120 fps on ProMotion. Hitches under 5 ms per second. |
| Hangs | None over 250 ms. Zero over 500 ms in a release build. |
| Memory | Under 150 MB resident on Book and Today. Images downsampled to display size. |
| Binary size | Under 60 MB download. Fonts: 3 static Archivo files. |
| Battery | No background location. Busyness polling only while Today or Club detail is visible (60 s). No timers in the background. |
| Network | Today payload under 60 KB gzip. Photos 1x/2x/3x WebP or HEIC at most 250 KB for card size. |
| Widgets | Timeline reload at most every 15 min; respect budget. Snapshot read from App Group, no network in the widget when possible. |
| Live Activity | At most 6 updates per class. |
| Crash-free sessions | 99.7 % or better |
| Accessibility perf | VoiceOver can read a 14-row schedule without lag (under 100 ms per swipe) |

SwiftUI performance rules to follow: [skill:swiftui-specialist]
- `ForEach` and `List` use stable `Identifiable` IDs (session ID, club ID). Never use array indices. Rows are single views (no multi-view rows, no `AnyView`) so `List` keeps its fast path. No inline `filter`/`sort` in `ForEach`: precompute and cache sections in the view model.
- `@Observable @MainActor` models. Pass only the fields a row reads. Pass collection elements to row views.
- Do not store closures or class types in `@Entry` environment defaults.
- Do not put `@State` assignments in `init` before other stored properties (iOS 27 macro). [skill:swiftui-whats-new-27]
- Use `AsyncImage` default caching (iOS 27) and `AsyncImage(request:)` for card photos. [skill:swiftui-whats-new-27]
- Use `LazyVStack`/`LazyHStack` for long or horizontal content. Keep `Map` annotations to 5.
- Charts: split into small subviews to protect type-check time. [skill:swiftui-whats-new-27]
- Profile with Instruments: SwiftUI template (view body counts), Time Profiler, Hangs, Animation Hitches, Network, Energy. Add signposts around book, cancel and pass open. Use MetricKit in production.

## 8. Privacy and security quality
- Pass seed in the Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`), not in `UserDefaults`. Rotating code valid 60 s. Clock skew tolerance 30 s.
- Face ID gate (with passcode fallback) for Membership, payment, Freeze, Cancel membership.
- No third-party tracking. No ATT prompt. Analytics are first-party, opt-in in Settings, off by default.
- Location: When In Use only. Used for nearest club and the arrival accessory. Never stored on the server.
- No sensitive data on the Lock Screen (widgets, Live Activity, notifications). Notification bodies hide amounts when the device is locked (`hiddenPreviewsBodyPlaceholder`) for Billing categories.
- Sign out clears caches, Keychain seed, App Group snapshot, donations. Delete account in Settings, Privacy.
- Children's data: under-13 profiles have no login; photos optional; notes limited to allergies; data minimised. `[PROPOSAL]` Legal review needed.

## 9. Test plan
| Layer | Tests |
|---|---|
| Unit | Booking rules engine and `deriveBookingState` for all 12 states: windows open 6:00 a.m. (classes 7 days, Summit 9, courts 3), 2-h cancel, no-show = late cancel, 3 strikes in 30 days and what a pause blocks, 5 waitlists max, 30-min hold and 1-h promotion stop, drop-in spots, one court a day and 2 active, 5-min slot hold with one extension, lane sharing "1 of 2 swimmers", kids club blocks (max 2 per child per day, 15-min release), teen "Teen OK" rules, freeze start (first billing date at least 30 days out), plan-change timing, failed-payment days 3, 6, 8, 15, guest pass 14 days, streak with one rest week per 10. Time zone fixed to America/Phoenix. |
| Snapshot | All 26 screens x light, dark, light-IC, dark-IC x Default and AX5 (4 x 2 = 8 images per screen) |
| UI (XCUITest) | Cold launch → pass in 1 tap; book → confirm; waitlist; cancel (free and late); reserve court; freeze. Run an accessibility audit in UI tests (`performAccessibilityAudit()`) `[UNVERIFIED]`. |
| Intents | `AppIntentsTesting` against the installed app for all 9 shortcuts. [skill:app-intents-whats-new-27] |
| Notifications | Action handling for `WAITLIST_PROMOTED` in foreground, background and terminated states. |
| Widgets / Live Activity | Timeline previews in all families and rendering modes (full colour, accented, vibrant). Live Activity states with simulated pushes. |
| Manual | VoiceOver pass through the 5 core flows; Switch Control; Voice Control "Tap Book class"; real device brightness; offline pass; Low Power Mode; iPad Split View 1/3. |
| Devices | iPhone SE (small), iPhone 17, iPhone 17 Pro Max, iPad Air, iPad Pro. |

## 10. Acceptance checklist

### Navigation and architecture
- [ ] Five tab items: Today, Book, Clubs, You, Search (role). No badges. Tab bar visible on all root screens.
- [ ] Tab bar minimises on scroll on iPhone; accessory shows inline when minimised.
- [ ] Pass reachable in 1 tap on Today and 0 taps from the Lock Screen widget, Control Center, Action button, Wallet and Siri.
- [ ] Arrival accessory shows only under the rules in `01` section 1.3 and hides after a scan.
- [ ] Each tab has its own typed path; `AppRoute` encodes and decodes; a bad stored route does not crash.
- [ ] Only one sheet is ever presented (the Clubs map sheet is the one persistent exception); deep links dismiss others first.
- [ ] Class detail is a pushed page; the cancel, waitlist, hours, ClubSwitcher, invite and feedback screens are sheets.
- [ ] All deep links in `01` section 5 open the right screen, including when signed out (after sign-in).
- [ ] Warm launch within 30 min restores tab and stack; cold launch opens Today.
- [ ] iPad: sidebar-adaptable tabs, Book split view, Today two columns, 1/3 width works.
- [ ] Permissions are requested only at the moments in `01` section 9.

### Flows (from `02`)
- [ ] Sign in with passkey, Apple, and email code; membership linking works; offline gives a clear message.
- [ ] Onboarding five steps; quitting mid-way resumes; skipping notifications still allows waitlist.
- [ ] Pass: brightness up and restored, no auto-dismiss, all states in `02` flow 3, offline code works, scan success state.
- [ ] Book: `ScheduleDayStrip` with 7 visible chips scrolling to the window (today + 7, Summit + 9, courts + 3), selected chip in Saguaro Night; "Opens … 6:00 a.m." rows; row order time, title, instructor, spots, action; all 12 `BookingStateButton` states; drop-in rows; double-booking prompt.
- [ ] Cancel sheet: "Keep my spot" filled, "Reschedule instead" only when available, "Cancel booking" quiet; red X lines paired with words; free-cancel reasons optional.
- [ ] Waitlist sheet: consent checkbox always shown; button disabled until ticked; 5-waitlist limit message.
- [ ] Success view pattern identical for booking, reservation, freeze and guest pass.
- [ ] Waitlist: join, promotion notification with actions, hold expiry, release is not a strike, promotion stops 1 h before.
- [ ] Cancel: free path, late path with strike text, third-strike pause text, undo toast, visible cancel button (not only swipe).
- [ ] Court, lane, kids club reservation: `DurationChips`, 5-min hold with one extension, one court a day and 2 active, lane sharing, no lane waitlist, kids club ages 6 months to 12, blocks and 15-min release, Trailhead `restricted`, teen parent toggles, partner invite link, full-slot error.
- [ ] Find a club: filters, carousel sync, list present, location denied path.
- [ ] Freeze: start on the first billing date at least 30 days out (no date picker), 1/2/3 months, $10/mo for the account, household, no-strike cancellations, confirmation sheet, neutral frozen pill, resume early.
- [ ] Plan change (upgrade now prorated, downgrade next billing date), cancel with reinstate, failed-payment timeline (day 3, 6, 8, 15).
- [ ] Family: add adult and child, teen invite, teen mode limits, parent controls, remove with confirm.
- [ ] Guest pass: allowance per plan, reset on billing date, 14-day validity, age rule text, share, revoke, Trailhead empty state.
- [ ] Calendar add, Live Activity phases, Siri phrases, notification actions.

### Screens and states (from `03`)
- [ ] All 26 screens exist with loading (redacted), empty (`ContentUnavailableView` + action), error, offline states.
- [ ] No full-screen blocking spinner for a booking. [mobbin-ios §6 a4]
- [ ] Every list row is a single accessibility element with a full label and custom actions.
- [ ] Every destructive action has a confirmation and a visible control.

### Components and branding (from `04`)
- [ ] Only system chrome for tab bar, nav bar, sheets, pickers, toggles, alerts.
- [ ] AccentColor set; `BrandAccent` used for fills; `Link` used for text buttons on Sand; asset names follow `04` section 2.2.
- [ ] Category colours use the final shared values; Strength copper only as stripe, small icon and tint.
- [ ] Pass card is a night surface; text on photos sits on the 80 % Saguaro Night band; no gradients.
- [ ] Prominent button label contrast verified in light and dark (or fallback style used).
- [ ] No Liquid Glass on cards, rows, hero, charts, pass card. One prominent action per screen.
- [ ] Archivo used only for the allowed roles, always with `relativeTo:`; PostScript names verified.
- [ ] Custom symbols export and render at all weights; no flame, bolt, flexed arm, skull imagery.
- [ ] App icon: default, dark, clear, tinted; alternate icons; five ribs in every variant; no text.
- [ ] Widgets: all families render in full colour, accented and vibrant modes; no sensitive data.
- [ ] Live Activity under 8 h, ends 15 min after class, one at a time, no duplicate push.
- [ ] Wallet pass signs, installs, updates; labels meet 4.5:1.
- [ ] 9 App Shortcuts; every phrase has the app name; types, IDs, raw values frozen.

### Accessibility
- [ ] AX5 screenshots for all screens: no clipped primary text, no overlapping controls.
- [ ] Dynamic Type audit passes on all view files.
- [ ] VoiceOver audit passes; meters and charts have values and descriptors; announcements fire.
- [ ] Contrast verified for all pairs in section 3 in four appearances.
- [ ] Reduce Motion, Reduce Transparency, Increase Contrast, Bold Text, Differentiate Without Color checked.
- [ ] Voice Control labels match; Switch Control reaches every action; keyboard shortcuts work on iPad.
- [ ] Targets 44 pt verified.
- [ ] Accessibility Nutrition Labels declared in App Store Connect only for features that pass.

### Localisation
- [ ] String catalog complete; plurals; no concatenation; pseudo-language and RTL pseudo-locale pass.
- [ ] Dates, times, currency, distance use format styles.

### Performance and quality
- [ ] Targets in section 7 met on iPhone 13 and iPad Air.
- [ ] Booking rules unit tests pass with America/Phoenix time zone.
- [ ] No hangs over 250 ms; Instruments SwiftUI pass shows no excess body updates on Today and Book.
- [ ] Crash-free sessions in TestFlight at or above 99.7 %.

## 11. Master list of unverified items

| Area | Item |
|---|---|
| Platform | Liquid Glass HIG page (not found by Sosumi); HIG pages for Maps, Wallet, Charts, Notifications, Onboarding, App Shortcuts, Siri not read. |
| SwiftUI | Persistent bottom sheet over the Clubs map and tab bar reachability; `Gauge`/`GaugeStyle` for `RibGaugeStyle`; `Tab(value:role:)` title-less form; `tabViewSearchActivation` case names; `tabViewCustomization` hide rules; `presentationSizing(.form)`; `scrollEdgeEffectStyle(_:for:)` details; vertical `safeAreaBar` overload; `.widgetAccentable()`; `Map` selection/annotation APIs on iOS 27; `AccessibilityNotification.Announcement`; foreground colour override on `.glassProminent`. |
| Fonts and symbols | Archivo PostScript names, static expanded instances, variable-axis behaviour; custom symbol export; Spanish glyph coverage. |
| System | Passkey and Sign in with Apple modifier names; EventKit permission model on iOS 27; screen brightness API on iOS 27; `PKPassLibrary.containsPass`; Wallet entitlements and signing; Time Sensitive capability; Live Activity push-to-start; `WidgetPushHandler`; HealthKit (not researched); Assistive Access detection. |
| App Intents | Exact `requestChoice` option types; `RelevantEntities` for gym classes (no shipping context); value-control template for the busyness control. |
| Business | None open from revision 2. Lane counts, the hold meaning, freeze start, guest pass, age rules, ratings, windows, strikes, courts, kids club, PT prices, plan changes, failed payment and the streak are settled in `../00-foundation.md` §4. Remaining `[PROPOSAL]` items are UI choices only (see `02` section 0.2). |
| Measurement | All contrast numbers are hand calculations; all performance targets are unmeasured proposals. |

## 12. Revision log

### Revision 2 (all five files edited in place)

**Inputs:** `../research/mobbin-standard-pass.md`; final shared component spec (`../01-shared-brand-components.md`, `../01-shared-brand-components-part2.md`); `../00-foundation.md` §4 "Rules settled" (re-read after the coordinator's second message: freeze start, guest pass 14 days, kids club 6 months to 12 years with 4 fixed blocks, teens 13 to 17, booking windows at 6:00 a.m., strikes, 5 waitlists, court limits, 5-min slot hold, PT prices, plan changes, failed payment, streak, billing day).

| Area | Change | Files |
|---|---|---|
| Class detail | Sheet became a **pushed page** (`.classSession`), as the shared spec says (§11.1). Cancel, waitlist, hours, ClubSwitcher, invite and feedback are sheets. Confirmation is a pushed success view. | 01, 03, 02 |
| Booking states | Exactly the shared 12 ids and labels ("Book", "Booked", "Join waitlist", "On waitlist #3", "Confirm spot · 28:41", "Full", "Booking paused", "Ridge only", "Started", "Try again", late-cancel notice). Rows now carry the button. Drop-in rows added. | 02, 03, 04 |
| Cancel dialog | Bottom sheet: filled "Keep my spot", outline "Reschedule instead", quiet "Cancel booking"; red X lines with words; optional reasons. No-show = late cancel; courts and lanes share the rule; kids club has no strikes. | 01, 02, 03, 04 |
| Waitlist | Consent checkbox always shown; button disabled until ticked; 5-waitlist limit; hold = tap "Confirm spot" within 30 min; no "Release" action; lanes have no waitlist; kids club does; promotions stop 1 h before. | 02, 03, 04 |
| Success pattern | One green check, headline, "Confirmed" pill, summary, filled "Add to calendar", "Share" link, four action rows, "Done". Reused for reservations, freeze, guest pass. | 02, 03 |
| Reservations | `DurationChips`; iOS `ReservationSlotGrid` list rows; 5-min hold with one extension; one court a day, 2 active; lane counts 8/8/6, "1 of 2 swimmers", "Any lane"; kids club 4 fixed blocks, max 2 per child, 15-min release. Lane speed chips removed. | 02, 03, 04 |
| Freeze and billing | No date picker: start on the first billing date at least 30 days out; whole household; $10/mo for the account; no-strike cancellations; bottom sheet confirm; neutral frozen pill. Plan changes, cancel with reinstate and failed-payment timeline (day 3, 6, 8, 15) added. Maya's billing day is the 12th (bills read Nov 12). | 02, 03, 04, 05 |
| Family and guests | Child add-on 6 months to 17; teens 13 to 17 with "Teen OK" classes and parent toggles (lanes from 14); guest pass 14 days, 18+ or 16 to 17 with guardian waiver; resets on billing date. Household pass chips removed (the parent checks in). | 02, 03, 04 |
| Pass | Night-surface card, white QR, "Scan at the front desk", "Checking in at {club}" with Change, Wallet button below (system style), kids club section. Member sample is Maya Lopez, 0042 1187. | 02, 03, 04, 05 |
| Colour tokens | Asset names follow shared roles (`Background`, `Surface`, `TextMuted`, `BrandAccent`, `NightSurface`, …). Category colours use the final values (Mind & Body `#52684A`, Court `#7F6019`, Strength text `#9E4522`; tints 10 % / 14 %). Busyness tones: success, success, neutral, warning, danger. Day strip selected = Saguaro Night, not copper. Photo text sits on a solid 80 % Saguaro Night band; the gradient scrim is removed. | 03, 04, 05 |
| Components | `ClubCard` variants `feature/compact/list-row/map-callout`; `ClubSwitcher` and `HoursTable` are sheets; `ClubMap` is a map with a persistent bottom sheet; `VisitStreak` uses a leaf and a week strip (no Rib Peak mark, no X); `ProgressRibs` goal tick; `InstructorChip` `choice`; `CoachCard` `row`; `EmptyState` copy from the shared samples; Live Activity and widget layouts from the shared patterns. | 03, 04 |
| Ratings | No rating line anywhere. Private feedback after class (Today card, Past row action, notification). | 02, 03, 04 |
| Mobbin standard pass | Applied [iOS] rules 38 to 40, 42 to 51, 53 to 57, 59 to 62 and [Shared components] 60 to 62 (cited inline as "mobbin-standard-pass §2 rule N"). Not applied: rule 41 (rating), 52 (X on missed days, flame), 58 (YES/NO crowd prompt replaces the chart; the foundation requires the chart). Corrections §3 noted: waitlist, cancel, pause and Live Activity patterns now have Mobbin evidence. | 01 to 04 |
| Unverified list | Removed all business items (now settled). Added: persistent sheet over the Clubs map and tab bar reachability (fallback carousel); `Gauge`/`RibGaugeStyle`. Technical items are unchanged in section 11. | 05 |

**Contradictions removed:** sheet vs pushed Class detail; `Menu` vs sheet `ClubSwitcher`; copper vs Saguaro Night selected chip; amber/red busyness mapping; gradient scrim vs solid band; separate "Keep spot"/"Release" actions; household pass chips; flame/Rib Peak streak; consent only for members with strikes; old category colours; the lane-speed and date-picker inventions.
**Still `[PROPOSAL]` (UI choices, not business rules):** `02` section 0.2.
