# Cactus Peak Athletic iOS app — 04 Components and branding

Read `01`, `02`, `03` first. Tags are defined in `01` section 0.1.
The shared brand components are drawn and named in `../01-shared-brand-components.md` (in progress). This file does not redraw them. It says how each one is built and used on iOS.

## 1. System components first

Native first: never rebuild system chrome. [apple §2] [brief]

| Need | System component | Notes |
|---|---|---|
| Top-level navigation | `TabView`, `Tab`, `Tab(role: .search)` | `.tabViewStyle(.sidebarAdaptable)` on iPad. `[verified]` |
| Contextual pass shortcut | `tabViewBottomAccessory(isEnabled:content:)` | iOS 26.1+. `[verified]` |
| Hierarchy | `NavigationStack(path:)`, `navigationDestination(for:)`, `NavigationSplitView` (iPad) | `[verified]` |
| Task | `sheet(item:)`, `presentationDetents`, `presentationDragIndicator` | `[verified]` |
| Long flow | `fullScreenCover(isPresented:)` | Welcome and onboarding. `[verified]` |
| Confirm | `confirmationDialog(_:item:)`, `alert(_:item:)` | iOS 27 `item:` overloads. [skill:swiftui-whats-new-27] |
| Lists and forms | `List`, `Form`, `Section`, `LabeledContent`, `Toggle`, `Picker`, `DatePicker`, `Stepper`, `Menu` | |
| Row actions | `swipeActions`, `contextMenu`, `swipeActionsContainer()` | [skill:swiftui-whats-new-27] |
| Empty and error | `ContentUnavailableView`, `.search` | `[verified]` |
| Search | `searchable`, `searchScopes`, tokens | `[verified]` scopes |
| Refresh and loading | `refreshable`, `redacted(reason: .placeholder)`, `ProgressView` | |
| Share | `ShareLink` | Guest pass, partner invite, class. |
| Photos | `PhotosPicker` | No permission needed. |
| Map | `Map`, `Annotation`, `MapUserLocationButton` | `[UNVERIFIED]` for iOS 27 changes. |
| Charts | Swift Charts `Chart`, `BarMark`, `RuleMark`, `accessibilityChartDescriptor` | `[verified]` descriptor |
| Images | `AsyncImage(url:)`, `AsyncImage(request:)` | iOS 27 caching. [skill:swiftui-whats-new-27] |
| Glass buttons | `.buttonStyle(.glass)`, `.buttonStyle(.glassProminent)` | One prominent per screen. [apple §3] |
| Sign in | `SignInWithAppleButton`, passkey via `ASAuthorizationController` | `[UNVERIFIED]` |
| Wallet | `PKAddPassButton`, `PKAddPassesViewController` | [apple §5] |
| Calendar | `EKEventEditViewController` in a representable | [apple §5] |
| Auth gate | `LocalAuthentication` | Billing screens. |
| Widgets and activities | `WidgetKit`, `ActivityKit`, `ControlWidget` | `ControlWidget` and `ControlWidgetButton` exist `[verified]` |
| Voice | `AppIntents`, `AppShortcutsProvider` | [skill:app-intents-specialist] |

Do not build: a custom tab bar, a custom nav bar, a custom sheet, a custom segmented control, a custom date picker, a custom toggle, a custom alert, a custom pull to refresh. [apple §3]

## 2. Colour system

Final tokens come from the shared spec (`../01-shared-brand-components.md` sections 2 and 4.1) and `theme.json`. This section only adds the iOS asset names, the Increased Contrast values and the iOS-specific rules. Revision 1 used different asset names and the old category values; they are replaced.

### 2.1 Rules
1. Set the app tint with the `AccentColor` asset: Arizona Copper in light, Dawn Copper in dark. [apple §4]
2. Name every colour by role, not by hue. Role names follow the shared token roles. [apple §4] [shared §4.1]
3. Every colour has four values: light, dark, light + Increased Contrast, dark + Increased Contrast. [apple §4]
4. **Copper means "you can act" or "this is active".** Category colours are for stripes, icons and tints. Never put a category colour on a filled button. [shared §1 principle 5]
5. **Strength looks like the primary button.** Strength uses copper only as a 4 pt stripe, a 16 pt icon and a 10 % tint. A filled copper shape with a label on a card is always a button. The solid Strength badge appears on photos only. The selected ring is 2 pt, offset 2 pt from the card edge. [shared §2.4]
6. **Conditioning looks like the warning colour.** A warning always has the triangle icon and a sentence. A Conditioning badge always has its icon and the word "Conditioning". [shared §2.4]
7. Category-coloured text is allowed only on `Surface`, `Background` and tints over them, never on `SurfaceMuted`. [shared §2.3 change 6]
8. Colour is never the only signal. A category shows icon + name. Busyness shows ribs + word. Status shows an icon or word. [found §3] [apple §6]
9. Use the semantic `.secondary` style only in system chrome the system draws. In our content use `TextMuted`. iOS `secondaryLabel` (`#3C3C43` at 60 %) measures about 3.44:1 on white and 3.30:1 on Sand (my calculation), which fails 4.5:1. `TextMuted` is 5.21:1 on Sand. [skill:accessibility-sufficient-contrast-specialist]

### 2.2 Asset catalog (`Colors.xcassets`)
Light and Dark come from the shared tokens. Increased Contrast (IC) values are my proposal: about 20 % darker in light, about 20 % lighter in dark. `[PROPOSAL]` Check them with the Accessibility Inspector.

| Asset | Shared role | Light | Dark | Light IC | Dark IC | Use |
|---|---|---|---|---|---|---|
| `AccentColor` = `BrandAccent` | `primary` | `#B5532C` | `#E0804F` | `#9E4522` | `#EE9A6E` | Tint, prominent button fill, selected states, progress ribs |
| `BrandOnAccent` | `primary` label | `#FFFFFF` | `#121A16` | `#FFFFFF` | `#121A16` | Label on `BrandAccent` |
| `Link` | `link` | `#9E4522` | `#EE9A6E` | `#7A3418` | `#F5B08D` | Copper text on `Background` or `Surface` |
| `Background` | `background` | `#F6F1E8` | `#121A16` | `#FFFFFF` | `#0C120F` | Root screen background |
| `Surface` | `surface` | `#FFFFFF` | `#1A241F` | `#FFFFFF` | `#1A241F` | Cards, rows |
| `SurfaceMuted` | `surface-muted` | `#EFE7DA` | `#24302A` | `#E6DCCB` | `#2C3A33` | Chips, skeletons, disabled fill |
| `PrimarySubtle` | `primary-subtle` | `#F6DFD3` | `#3A2418` | `#F0CDBB` | `#4A2E20` | Selected row fill |
| `TextPrimary` | `text` | `#1D1B17` | `#F2ECE2` | `#000000` | `#FFFFFF` | Body, headings |
| `TextMuted` | `text-muted` | `#6B6457` | `#A69F92` | `#4A443A` | `#CFC8BB` | Captions |
| `Border` | `border` | `#DDD2C1` | `#34423A` | `#8C7F6B` | `#6E7F74` | Card hairlines (decorative) |
| `BorderStrong` | `border-strong` | `#8C7F6B` | `#6E7F74` | `#4A443A` | `#CFC8BB` | Control edge, empty rib outline (3:1) |
| `BorderHover` | `border-hover` | `#4A443A` | `#CFC8BB` | same | same | Pressed edge (iPad pointer) |
| `BrandSecondary` | `secondary` | `#1C3328` | `#F2ECE2` | `#1C3328` | `#FFFFFF` | Selected day chip, brand ribs, selected pin |
| `NightSurface` | `night-surface` | `#1C3328` | `#1C3328` | same | same | Pass card, highlighted `PlanCard`, `PromoBand`, text bands on photos (80 %), Live Activity |
| `NightOnSurface` | night text | `#F6F1E8` | `#F6F1E8` | same | same | Sand text on night surface |
| `StatusSuccess` | `success` | `#2A7047` | `#6FCB94` | `#1F5535` | `#9BE0B6` | Open dot, attended, quiet |
| `StatusWarning` | `warning` | `#8A5300` | `#F2B14C` | `#683E00` | `#F5C479` | Few spots, late-cancel notice |
| `StatusDanger` | `danger` | `#B42318` | `#F28B7C` | `#8F1C13` | `#F5A396` | Errors, packed, destructive text |
| `StatusSuccessSubtle` / `StatusWarningSubtle` / `StatusDangerSubtle` | `*-subtle` | `#E3F0E6` / `#FBEBCB` / `#FBE4E1` | `#1D3527` / `#3A2E14` / `#3D1F1B` | same | same | Banners |
| `Focus` | `focus` | `#2E6DB4` | `#7FB0E8` | `#1F4F8A` | `#A9CCF2` | Custom views only; system draws the keyboard focus ring |

`Color` extensions: `.appBackground` reads `Background`, `.brandAccent` reads `BrandAccent`, `.linkText` reads `Link`, `.nightSurface` reads `NightSurface`. `03` and `04` use these names. Revision 1 names (`BrandCopperFill`, `BrandCanvas`, `BrandSurface`, `BrandText`, `BrandBorder`, `BrandLink`, `BrandRibFill`) are removed.

### 2.3 Category colours (final shared values)
Tint strength is **10 % in light and 14 % in dark**. [shared §2.3 change 4]

| Asset prefix | Category | Light fill | Light text token | Dark fill and text | Light IC (fill) | Dark IC | Symbol |
|---|---|---|---|---|---|---|---|
| `CategoryStrength` | Strength | `#B5532C` | **`#9E4522`** | `#E0804F` | `#883E21` | `#E8A07B` | custom `cp.rib.barbell` (dev fallback `dumbbell.fill`) |
| `CategoryCycle` | Cycle | `#2F5A45` | `#2F5A45` | `#6FB08F` | `#234434` | `#93C4AB` | `bicycle` |
| `CategoryConditioning` | Conditioning | `#8A5300` | `#8A5300` | `#F2B14C` | `#683E00` | `#F5C479` | custom `cp.conditioning` (dev fallback `figure.run`) |
| `CategoryMindBody` | Mind & Body | **`#52684A`** | `#52684A` | `#A9C29A` | `#3E4E38` | `#BED1B3` | `figure.mind.and.body` |
| `CategoryAqua` | Aqua | `#1F6E7A` | `#1F6E7A` | `#6FC3CF` | `#17525C` | `#93D2DB` | `figure.pool.swim` |
| `CategoryCourt` | Court | **`#7F6019`** | `#7F6019` | `#E0C27A` | `#5F4813` | `#E8D19B` | custom `cp.court` (dev fallback `figure.pickleball`) |
| `CategoryRecovery` | Recovery | `#5F4E86` | `#5F4E86` | `#B6A6E0` | `#473A64` | `#C8BCE8` | `heart.text.square` |
| `CategoryYouth` | Youth | `#9C3D6B` | `#9C3D6B` | `#E59BC0` | `#752E50` | `#ECB4D0` | `face.smiling` |
Bold values changed from revision 1 (Mind & Body `#5E7352` to `#52684A`, Court `#8C6A1F` to `#7F6019`) and Strength gained a separate text token. [shared §2.3] Asset sets: `Category<X>` (fill), `Category<X>Text`. Tints are computed in code (10 % / 14 %).
Contrast (shared §2.2, my spot checks agree): Strength text `#9E4522` on its 10 % tint over Sand 4.94:1; Mind & Body 4.75:1; Court 4.55:1; Aqua 4.57:1 (the lowest; do not weaken the tint rule). Dark text on 14 % tint over `Surface` is 4.54:1 or better. Solid badge labels: white on light fills 4.95:1 or better; `#121A16` on dark fills 6.22:1 or better.
Symbol names: custom symbols are exported from the SF Symbols app so the web and iOS glyphs match. Dev fallbacks are suggestions only and unverified. [shared §2.5]

### 2.4 Contrast results for tint and brand pairs (my calculation)
| Pair | Ratio | Result |
|---|---|---|
| White on Arizona Copper | 4.95 | Pass |
| `#121A16` on Dawn Copper | 6.22 | Pass |
| White on Dawn Copper | 2.86 | **Fail.** Never. |
| Arizona Copper text on white / on Sand | 4.95 / 4.40 | Pass / **Fail for small text** |
| `Link` `#9E4522` on Sand / white | 5.61 / 6.31 | Pass |
| Dawn Copper on dark background / surface / surface-muted | 6.22 / 5.60 / 4.81 | Pass |
| `TextMuted` on Sand / white; dark on surface | 5.21 / 5.86; 6.08 | Pass |
| Status colours on Sand | 5.32 / 5.63 / 5.84 | Pass |
| `BorderStrong` on white / Sand | 3.92 / 3.48 | Pass (3:1) |
| Sand on Saguaro Night | 12.0 | Pass |
| Dawn Copper on Saguaro Night | 4.74 | Pass |
| Text on a Saguaro Night 80 % band over a white photo: Sand / white | 6.35 / 7.15 | Pass (worst case) [shared §2.6] |

### 2.5 Tint rule for text buttons on Sand
`AccentColor` light is Arizona Copper. System text buttons take the tint as text colour; on Sand that is 4.40:1 (fails for small text). Rule:
- Text-only buttons on `Background` use `.tint(Color.linkText)` through a `LinkButtonStyle`.
- Buttons on `Surface` (white) may use the default tint (4.95:1).
- Prominent buttons use `.tint(Color.brandAccent)` and a forced `BrandOnAccent` label.
- Alternative if QA dislikes the mixed rule: set `AccentColor` light to `#9E4522` and keep Arizona Copper only in fills. This changes the stated brand tint, so ask the brand owner first. `[PROPOSAL]`

### 2.6 Rib tones (shared §2.6, §5)
| Meter | Tone | Colours |
|---|---|---|
| `BusynessMeter` | by level | 1 Quiet and 2 Light: `StatusSuccess`; 3 Steady: neutral (`TextPrimary`); 4 Busy: `StatusWarning`; 5 Packed: `StatusDanger` |
| `IntensityRibs` | `category` (matches the class stripe); `neutral` on a photo band | category fill |
| `CapacityIndicator` | neutral; `StatusWarning` at 5 spots or fewer; never red for "low" | |
| `ProgressRibs` | `brand` (`BrandSecondary`); `StatusSuccess` when the goal is met | |
| Empty rib outline | `BorderStrong`, 1.5 pt | |
Closed or stale: ribs hidden; closed shows "Closed · opens 4:30 a.m."; stale (older than 15 min) shows five dashed outline ribs and "Busyness unavailable. Last update 22 min ago." [shared §5.3] Shape (filled or outline) and the word carry the value; colour only adds a hint. (Revision 1 mapped level 3 to amber and 4 to red; replaced.)

## 3. Typography, symbols, app icon, materials

### 3.1 Type roles
| Role | iOS style | Font |
|---|---|---|
| Navigation title, tab labels, toolbar | system | SF (system draws them) |
| Body, rows, forms, buttons | `.body`, `.callout`, `.subheadline`, `.footnote`, `.caption` | SF Pro |
| Section titles in content | `.title3.bold`, `.headline` | SF Pro |
| Display title inside content (class name on detail, club name on hero, greeting) | `.title` / `.largeTitle` size | Archivo ExtraBold, `relativeTo:` the same style |
| Eyebrow | `.caption` size, tracked +0.24 em, uppercase in the string | Archivo SemiBold |
| Big numerals (next-class time, streak, member number, price, spots on featured card) | `.largeTitle` / `.title2` | Archivo Bold or ExtraBold |
| Times in rows | `.headline.monospacedDigit()` | SF Pro |

This follows the brief: "Archivo only for large display numbers and titles where appropriate". It also follows [apple §4 Archivo versus SF]: keep SF for body, labels, toolbar titles, tab labels and button labels.

### 3.2 Archivo setup
- Bundle static Archivo instances (SIL OFL 1.1). Register them in `UIAppFonts`. Needed: ExtraBold (800), Bold (700), SemiBold (600).
- PostScript names must match the files. Check them in Font Book before use. `[UNVERIFIED]` — examples: `Archivo-ExtraBold`, `Archivo-Bold`, `Archivo-SemiBold`. The brand uses expanded widths 112 to 125 for headlines [brand §5]; if static expanded files are used the names differ (for example `Archivo-ExpandedExtraBold`). `[UNVERIFIED]`
- Do not rely on a variable-font weight axis from `Font.custom` + `.weight()`. `[UNVERIFIED]` It may not select the weight. Use static instances.
- Always scale. `Font.custom(_:size:relativeTo:)` `[verified]` signature. Never `Font.custom(_:fixedSize:)`. [skill:accessibility-dynamic-type-specialist]

```swift
extension Font {
    static func brandDisplay(_ base: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom("Archivo-ExtraBold", size: base, relativeTo: style)
    }
    static func brandNumeral(_ base: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom("Archivo-Bold", size: base, relativeTo: style)
    }
    static func brandEyebrow() -> Font { .custom("Archivo-SemiBold", size: 12, relativeTo: .caption) }
}
// Eyebrow: .font(.brandEyebrow()).tracking(2.9)   // 0.24 em at 12 pt
```
- Fallback: if the font fails to register, `Font.custom` falls back to the system font silently. In debug builds, assert with `UIFont(name:size:) != nil` at launch.
- Bold Text setting: static Archivo weights do not change. Acceptable because these are already heavy. Test at AX5 and with Bold Text on. [apple §4]
- No clamping with `.dynamicTypeSize(...)`. A "6:00" at 44 pt base grows to about 78 pt at AX5. That fits a 390 pt screen. [skill:accessibility-dynamic-type-specialist]
- Numerals: Archivo figures are tabular by default [theme `font.family.data`]. For SF numerals use `.monospacedDigit()`.

### 3.3 Spacing and shape tokens
| Token | Value | Source |
|---|---|---|
| Spacing | 4, 8, 12, 16, 24, 32, 48 pt | theme `space` |
| Card radius | 14 pt, `.continuous` | theme `radius.m` |
| Chip radius | capsule | theme `radius.full` |
| Button | system glass capsule | system |
| Hero radius | 0 (full bleed) or 20 pt when inset | theme `radius.l` |
| Control height | 44 pt minimum | theme `size.control` |

### 3.4 Symbols
- Base set: SF Symbols (iOS has no Lucide). Lucide's brand direction (2 pt stroke, round caps, outline) is matched by SF Symbols at Regular weight, `.symbolVariant(.none)` for outline in content and `.fill` for selected tab states. [brand §6]
- Forbidden imagery: flexed arms, lightning bolts, flames, skulls. [brand §6] Do not use `flame`, `bolt`, a flexed-arm figure, or `dumbbell` for Strength. The streak uses a leaf (`leaf.fill`), not a flame. [shared §9.4] (Mobbin shows flames for streaks [mobbin-ios §5 r24]; the brand rule wins.)
- Custom symbols (export from the SF Symbols app as `.svg` templates; 24 pt grid; upright strokes, 60° and 90° angles; 2 pt stroke at Regular; weights and scales): the four the shared spec names, plus none else.

| Symbol | Meaning | Drawing |
|---|---|---|
| `cp.rib.barbell` | Strength | Upright bar with two plates seen edge-on, drawn as ribs (dev fallback `dumbbell.fill`) |
| `cp.conditioning` | Conditioning | Timer/activity glyph in upright strokes (dev fallback `figure.run`) |
| `cp.court` | Court | Court lines, net as an upright stroke (dev fallback `figure.pickleball`) |
| `cp.ribs.empty` | Empty state | Five hollow ribs |
Fallback names are suggestions and unverified. [shared §2.5] Other categories use SF Symbols: `bicycle`, `figure.mind.and.body`, `figure.pool.swim`, `heart.text.square`, `face.smiling`.
`[UNVERIFIED]` Custom symbol export settings in Xcode 27. Test monochrome and hierarchical rendering at all weights.
- SF Symbols use `.symbolRenderingMode(.monochrome)` by default. Copper only for the active state. [brand §6]
- Symbols scale with text: use `Label` or `@ScaledMetric(relativeTo:)`. [skill:accessibility-dynamic-type-specialist]

### 3.5 App icon
Use Icon Composer. Master file: `cactus-peak-brand/identity/export/symbol/cpa-symbol-app-icon.svg` (1024 px). [brand §1]

| Variant | Background | Foreground | Notes |
|---|---|---|---|
| Default (light) | Saguaro Night `#1C3328`, flat | Rib Peak symbol in Dawn Copper `#E0804F` | 4.74:1. Five ribs. No text. |
| Dark | `#121A16` | Same symbol, Dawn Copper | Layers unchanged. [apple §4] |
| Clear (light and dark) | System-generated glass | Single-colour symbol layer (Sand) | Keep one foreground layer so clear works. |
| Tinted (light and dark) | Black / dark grey | Greyscale symbol with 100 % ribs | System applies the tint. |
Rules: square layers, no pre-rounded corners, sRGB or Display P3, no text, no screenshot, same elements in every variant. [apple §4]

Alternate icons (Settings, Appearance; `UIApplication.setAlternateIconName`):
| Name | Look |
|---|---|
| Peak (default) | As above |
| Sand | Sand `#F6F1E8` background, Arizona Copper symbol |
| Night | Saguaro Night, Sand symbol |
| Copper | Arizona Copper background, white symbol (white on copper 4.95:1) |
Alternate icon assets use the same layered format `[UNVERIFIED]`.

### 3.6 Materials and Liquid Glass
Rules from [apple §3]:
- **Glass:** tab bar, bottom accessory, toolbar items, `.glass` and `.glassProminent` buttons, map controls, system sheets, system menus. The system draws these. Do not re-add glass.
- **Not glass:** cards, rows, hero photos, charts, class cards, the pass card (night surface), the QR frame, ClubPin, the sticky bar content. Text on a photo sits on a solid 80 % Saguaro Night band, never a gradient. [shared §4.4] Use solid `Surface` or standard materials. [apple §3 "What must not get glass"]
- **One prominent action per screen** with copper tint. All other buttons `.glass` or `.bordered`. [apple §3]
- Group custom glass controls inside `GlassEffectContainer(spacing:)` if there are two or more. `[verified]` `glassEffect(_:in:)`, `GlassEffectContainer` exist.
- Clear glass only over rich media. The app uses regular glass everywhere; clear glass is not used. [apple §3]
- Sticky bottom bars (Class detail, Club detail, Reserve): container with `.background(.bar)` and a top hairline; the button inside is `.glassProminent`. Content scrolls under the bar with `scrollEdgeEffectStyle(.soft, for: .bottom)`. `scrollEdgeEffectStyle(_:for:)` `[verified]` name only. Visual check needed on device.
- Test with Reduce Transparency and Increase Contrast on. [apple §3] [apple §6]

## 4. Custom views mapped to the shared brand components

Source of truth: `../01-shared-brand-components.md` (part 1) and `../01-shared-brand-components-part2.md` (part 2). Variant names, state ids, copy and anatomy below match them exactly. This section only adds the SwiftUI structure and iOS rules. Revision 1 variants that the shared spec does not have (`compact` and `card` for `ClubCard`, `scheduleRow` spelling, the `BrandCopperFill` asset, a Rib Peak streak mark, household pass chips, a `Menu` for `ClubSwitcher`, a sheet for Class detail) are removed.

All types are `View` structs with value inputs only. Pass the fields the view reads, not the whole model. `ForEach` uses stable IDs. [skill:swiftui-specialist] The shared data model (`Club`, `ClassSession`, `Booking`, `Member`) is mirrored by `Codable` structs with the same field names. The state of a booking button comes from the shared `deriveBookingState(session, booking, member, now)`. [shared §8.1]

### 4.1 `RibMeter` (base) [shared §5.1]
- Inputs: `value: Int` (0 to 5), `tone` (`neutral`, `success`, `warning`, `danger`, `brand`, `category`), `categoryId?`, `size` (`sm`, `md`, `lg`, `xl`), `profile` (`peak` default, `flat` forced at `sm`), `label`, `valueText`, `decorative`.
- Sizes (pt): `sm` rib 4, gap 2, glyph 28 x 16; `md` 6, 3, 42 x 24; `lg` 8, 4, 56 x 32; `xl` 12, 6, 84 x 48. Peak profile heights 60, 80, 100, 80, 60 %. Corner radius is half the rib width, at most 4. Glyph size uses `@ScaledMetric(relativeTo: .caption)` up to 1.5 times the base.
- Structure: `HStack(spacing:)` of five rounded `Rectangle`s. Filled = tone colour. Empty = clear fill with a 1.5 pt `BorderStrong` outline. Unknown value: five dashed outlines and "Unavailable".
- iOS wrapper: `Gauge(value:in:)` with a custom `RibGaugeStyle`. `Gauge`/`GaugeStyle` are not in the Apple research file: `[UNVERIFIED]`. Fallback: plain `HStack`.
- Animation: new ribs fill left to right in 150 ms with a 40 ms stagger. None under Reduce Motion.
- Accessibility: `.accessibilityElement(children: .ignore)`, label "Busyness", value "Busy, 4 of 5". `decorative` when adjacent text repeats it. Never five ribs for anything but busyness, intensity, capacity, club access or progress.

### 4.2 `IntensityRibs` [shared §5.2]
`RibMeter` + word. Tone `category` by default, `neutral` on a photo band. Variants `ribs-only` (rows; the word is in the accessible name), `with-label` (cards, detail), `range` (class types). Words: 1 Easy, 2 Light, 3 Moderate, 4 Hard, 5 All-out. No tooltip on iOS; the scale shows on Class detail under INTENSITY.

### 4.3 `BusynessMeter` [shared §5.3]
Variants `compact` (28 x 16, `ClubPin`), `inline` (ribs `sm` + word), `card` (ribs `md` + "Steady now" + "Usually busier at 5:30 p.m."), `hero` (ribs `xl` + word in Archivo `data-l` + "About usual" + "Updated 5:35 a.m."; Today and `ClubHero`). Tone by level: 1 and 2 success, 3 neutral, 4 warning, 5 danger. States: live; stale (older than 15 min): dashed ribs + "Busyness unavailable. Last update 22 min ago."; closed: ribs hidden, "Closed · opens 4:30 a.m."; loading: skeleton. "vs typical" words: "Quieter than usual", "About usual", "Busier than usual" (no arrows). `.accessibilityAddTraits(.updatesFrequently)`; announce only a level change. No Live Activity for busyness. Member surfaces may show a head-count in `hero` only if operations agree. [shared §11.3 items 5, 6]

### 4.4 `CapacityIndicator` [shared §5.4]
Variants `ribs` (rows and cards), `text`, `badge-on-photo` (corner chip "4 left"), `large` (Class detail: number in Archivo `data-l` + noun). Always shows the count on iOS. Low = 5 or fewer: `StatusWarning` with the triangle icon. Never red for "low". Full: "Full · Waitlist 3". Copy uses the class unit: "4 bikes left", "1 spot left". Never "Hurry". At AX sizes drop the ribs and keep the text.

### 4.5 `CategoryBadge` [shared §5.5]
Variants `tint` (default, 10 % / 14 % tint; icon in category fill, label in the category text token), `solid` (photos only; white or `#121A16` label), `icon-disc` (40 pt, compact cards, widgets), `stripe` (4 pt row edge; always with a badge or disc on the same card). Sizes `sm` (20 pt) and `md` (24 pt). Static: radius 4 means "label, not control". Uses `Label` with a custom `LabelStyle`. Never shorten "Mind & Body".

### 4.6 `AmenityChip` [shared §5.6]
Variants `info` (static `Label` in a capsule on `SurfaceMuted`) and `filter` (`Toggle` with a custom `ToggleStyle`, 44 pt target, `.sensoryFeedback(.selection)`). `detail` text ("8 lanes", "4 courts"). Also used as a sidebar list beside a photo. In `FlowLayout`.

### 4.7 `ClubCard` [shared §6.1]
| Variant | iOS use | Size | Content |
|---|---|---|---|
| `feature` | iPad Clubs list, Onboarding on iPad | 288 to 400 wide | 4:3 photo, eyebrow, name, personality line, `BusynessMeter` `card`, 3 `AmenityChip`, one filled button |
| `compact` | Today shortcuts, Search results, fallback carousel | iOS carousel 280 wide, 16:9 photo on top | Name, `OpenStatus`, `BusynessMeter` `inline`, distance |
| `list-row` | Clubs sheet list, `ClubSwitcher` sheet, Onboarding step 1 | 88 pt high | 96 x 72 photo, name, `OpenStatus`, distance, `BusynessMeter` `compact`, chevron |
| `map-callout` | Pin tap in the Clubs sheet | 280 wide | 2:1 photo, name, `OpenStatus`, today's hours, `BusynessMeter` `inline`, "Directions" and "Open club" |
Structure: `Button`/`NavigationLink` wrapping a `VStack` in `RoundedRectangle(cornerRadius: 14)` with `Surface` and a 1 pt `Border`. No glass. `AsyncImage` (cached by default on iOS 27). Archivo for the name at `.title2` only. VoiceOver: "Gilbert – Val Vista. 2.1 miles. Steady. Open until 10 p.m."

### 4.8 `ClubHero` [shared §6.2]
Variant `ios`. Photo pager (`TabView` `.page` or paging `ScrollView`), 260 pt (180 at AX), "1/4" pill. A solid Saguaro Night band at 80 % holds the name (Archivo ExtraBold 30, relative `.largeTitle`) and the personality line in Sand. `BusynessMeter` `inline` chip. `ClubRibMark` (the club's own rib) may sit in the band. Photos use `AsyncImage(request:)` with `.returnCacheDataElseLoad`. Photo failure: small-cut Rib Peak on `SurfaceMuted`.

### 4.9 `ClubSwitcher` [shared §6.3]
A toolbar `Button` with a `Label` (club short name + `chevron.down`) opens a **sheet** (`.medium`, `.large`, drag indicator visible): `List` with `Section("Mesa")` and `Section("Gilbert")` of `ClubCard` `list-row`; selected row shows a `checkmark`; `.searchable`. Variants `single` and `multi` (Filters). Locked rows (Trailhead other clubs): `.disabled(true)` with a visible reason "Ridge only". Selecting changes the viewed club, not the home club. At AX sizes the button moves into content. (Revision 1 used a `Menu`; replaced.)

### 4.10 `HoursTable` [shared §6.4]
Variants `week` (Hours sheet), `grouped`, `today`, `all-clubs`. iOS: `List` with `Section("Hours")` and `LabeledContent`. Today: semibold + "Today" tag + `StatusSuccess` dot and "Open now". Hours in SF `.monospacedDigit()`. Opened from the "Open until 10 p.m." button in a `.medium` sheet.

### 4.11 `PopularTimesChart` [shared §6.5]
Swift Charts `Chart { BarMark(x: hour, y: level) }`, 18 bars (4 a.m. to 10 p.m.), `RuleMark(x: now)` with a "Now" annotation (or a highlighted bar), `.chartYAxis` with three custom labels, `.chartXSelection` for tap-to-read. Day selector: `Picker(.segmented)` with single-letter labels and full-day accessibility labels (menu at AX). Colour `TextMuted`, bar height carries the level. `accessibilityChartDescriptor` (`05` section 2.3). Split chart content into small views. [skill:swiftui-whats-new-27]

### 4.12 `ClubMap` and `ClubPin` [shared §6.6]
`ClubMap` iOS: full-bleed `Map`, search pill, filter chips, persistent bottom sheet (collapsed `.height(56)`, `.medium`, `.large`) with "5 clubs in map area", `map-callout` on pin tap. `ClubMap` on Club detail: static non-interactive `Map` 180 pt. `ClubPin`: rounded rectangle 32 pt + 8 pt point, `shortName` + `BusynessMeter` `compact`; selected = `NightSurface` + `BrandAccent` outline; home = `house` icon; closed = "Closed" and no ribs; cluster circle with count; 44 pt target. See `03` section 9 and `01` section 3.5 for the `[UNVERIFIED]` tab bar note.

### 4.13 `ClassCard` [shared §7.1]
| Variant | iOS use | Size |
|---|---|---|
| `schedule-row` | Book list, My bookings, Search, Today "Coming up" | min 72 pt |
| `card` | Today "For you", Class detail "More" | 280 to 360 wide; `CategoryBadge` `icon-disc`, name, "6:00 a.m. · Val Vista", `CapacityIndicator` `text`; no button (the detail holds the action) |
| `featured` | Today "Next up" | full width |
| `compact` | Club detail, Coach profile, Siri snippet, widgets, Live Activity | icon disc; widget tile may add a small photo |
`schedule-row` reading order: stripe, time block (72 pt), main block (title; `CategoryBadge` `sm` + `IntensityRibs` `sm` + first-timer tag + age chip; instructor line with a 32 pt avatar after the title), trailing block (`CapacityIndicator` `ribs`, then `BookingStateButton`). The row opens the detail; the button is its own target; swipe trailing = Book or Join waitlist; custom actions mirror them. Age chip "Teen OK" / "Ages 16+" comes from `ClassType.ageNote`. Widget tile: small photo or icon disc, bold title, capitals label "NEXT: 6:00 A.M. CLIMB CYCLE". No rating line is rendered (no public ratings). [mobbin-standard-pass §2 rules 55, 61]

### 4.14 `ClassDetailPanel` [shared §7.2]
Variant `page` (iPhone, pushed). Variant `sheet` on iPad as an `inspector` when no split view exists. Ordered anatomy: hero with a solid 80 % Saguaro Night band ("with Marisol Vega · Thu, 6:00 a.m."); status chip; `CategoryBadge` + title; `InstructorChip` `lg`; stats row (DURATION, INTENSITY, SPOTS with small-capitals labels); two fact rows; "Add to calendar" and "Invite a friend"; About; rules block (cancellation, waitlist, strikes); sticky action bar. Confirmed view: one green check, "You're booked", "Confirmed" pill, summary card, filled "Add to calendar", "Share" link, four action rows, "Done". Cancel flow: the cancel sheet. States include `confirmed`, booked, waitlisted, promoted hold, full, cancelled by the club, ended. [shared §7.2]

### 4.15 `InstructorChip` [shared §7.3]
Variants `inline` (avatar + name), `stacked` (name + credential), `stack` (up to 3 avatars + count), `sub` (adds "Sub" in `StatusWarning` text with the triangle icon), `choice` (ring and check; PT coach picker). Avatar sizes via `@ScaledMetric(relativeTo: .body)`, capped at 1.5 times: 24/32 (row), 40 (`md`), 56 (`lg`). Placeholder: initials on `SurfaceMuted`. Avatar `.accessibilityHidden(true)`. Rows show the short name ("Marisol V.").

### 4.16 `CoachCard` [shared §7.4]
Variants `card`, `feature`, `row` (iOS list: 56 pt avatar, name, credential, chevron), `compact` (inside Class detail), `headshot`. iOS uses `row` for lists and `card` in horizontal strips. Portrait 4:5. Archivo only for the name in the detail header (relative `.title2`).

### 4.17 `ScheduleDayStrip` [shared §7.5]
Horizontal `ScrollViewReader` + `ScrollView` + `LazyHStack(spacing: 8)` with `scrollTargetBehavior(.viewAligned)`. Chip 56 x 64 pt, radius 10: weekday ("Today" for the first) over date number (`.monospacedDigit()`), class count under it. **Selected: `BrandSecondary` fill (Saguaro Night; Sand in dark) with `NightOnSurface`-style text.** Unselected: `Surface` + `Border`. Today has a dot. Disabled (past, beyond window): `SurfaceMuted`, still visible. Seven chips visible, scroll to the window (today + 7; Summit + 9; courts + 3). A 44 pt `calendar` button opens a `.medium` sheet with `DatePicker(.graphical)` limited to the window. `.accessibilityAddTraits(.isSelected)`; adjustable; AX sizes switch to a `Menu` picker. Haptic `selection`. (Revision 1 used a copper fill; replaced.)

### 4.18 `ReservationSlotGrid` [shared §8.2]
Layouts `matrix` (web only), `blocks` (kids club), `list` (iOS courts, lanes, PT, recovery). iOS `list`: AM and PM `Section`s, one row per start time, the free resources as text ("Courts 1, 3, 4 open"), chevron; the row opens a `.medium` sheet with an inline resource `Picker`, the summary and a full-width "Reserve Court 3" button. Optional four-column chip grid for many short slots with a total line. Slot status: `open` (green dot), `selected`, `mine`, `taken` (hatch + lock; stays visible), `closed`, `past`, `low` (kids blocks). **`DurationChips`** (courts only): segmented chips "60 min | 90 min", selected chip filled `BrandSecondary`, 44 pt tall, adjustable. Date window: courts 3 days. Caption "Arizona time". Checkout hold: 5 minutes with one 5-minute extension, shown as a banner above the button. [found §4]

### 4.19 `BookingStateButton` [shared §8.1]
State ids and labels are exactly the shared ones.
| State id | Label | Look on iOS | Enabled | Haptic |
|---|---|---|---|---|
| `book` | Book | `.borderedProminent` in rows and cards; `.glassProminent` in the sticky bar. Tint `BrandAccent`, label `BrandOnAccent`. | yes | `booked` |
| `booking` | Booking… | Same fill, `ProgressView` + word, width locked | no | |
| `booked` | Booked ✓ | Outline, `StatusSuccess` check, `TextPrimary` label. Sticky bar: status text "Booked" + grey outline "Cancel" + "Manage" menu. | yes | |
| `waitlist` | Join waitlist | Outline with a copper edge, `Link` label | yes | `waitlisted` |
| `waitlisted` | On waitlist #3 | Outline, tabular number; menu: Leave waitlist | yes | `released` |
| `hold` | Confirm spot · 28:41 | Filled, tabular timer | yes | `promoted` |
| `full` | Full | Disabled; reason line "Waitlist closed 1 hour before start" or "Lap lanes have no waitlist" | no | |
| `late-cancel` | Booked + `LateCancelNotice` | As `booked`, warning triangle; menu item "Cancel (late)" in `StatusWarning` | yes | `lateCancel` |
| `paused` | Booking paused | Disabled; reason "Back on Oct 30" | no | |
| `restricted` | Ridge only | Outline; reason; opens plans (also used for teen parent toggles: "Ask a parent to turn on courts") | yes | |
| `started` | Started | Disabled | no | |
| `error` | Try again | Outline `StatusDanger` with triangle; message under the button | yes | `error` |
Extra non-shared iOS states are mapped onto these: "Opens Tue 6:00 a.m." = `full`-style disabled with that reason; "Offline" = disabled with reason "You are offline"; "Frozen" = `paused` with reason "Membership frozen". Drop-in spots (last hour) show as `book` with the row tag "Drop-in". `[PROPOSAL]` for these mappings.
- Label colour: force `.foregroundStyle(Color.brandOnAccent)`. White on Dawn Copper is 2.86:1. `[UNVERIFIED]` whether `foregroundStyle` overrides the `.glassProminent` label. Fallback: a custom `ButtonStyle` with `.glassEffect(.regular.tint(.brandAccent).interactive(), in: .capsule)`. [skill:accessibility-sufficient-contrast-specialist]
- Sizes: 44 pt (`md`), 48 pt full width (`lg`) in the sticky bar, min width 96. Verbs first, three words or fewer. "Booked", not "Reserved".
- **Waitlist sheet:** consent checkbox always shown; "Join waitlist" disabled until ticked; link "Pick another class". **Cancel sheet:** "Keep my spot" (filled), "Reschedule instead" (outline), "Cancel booking" (quiet `StatusDanger`). `LateCancelNotice` text: "Cancel free until 4:00 a.m. Cancelling later counts as a late cancel (strike 2 of 3 in 30 days)." [shared §7.2, §8.1]
- A11y: `.accessibilityAction(named:)` for Book, Join waitlist, Cancel booking. The `hold` timer is announced at the start, at 5 min and at 1 min. Never auto-dismiss a sheet.

### 4.20 `PlanCard` [shared §9.1]
Variants `marketing` (not used on iOS), `current`, `change`, `select`. `current`: badge "Current plan", disabled "Your plan", next renewal date and amount under the price, neutral pause pill when frozen. `change`: "Before you switch" list with red X icons and words, summary block (Subtotal, prorated line, Today's total, when the new price starts), outline "Keep Ridge" and filled "Switch to Summit". `select`: radio card (add-family flow). Highlighted plan (Ridge) uses `NightSurface`. Price in Archivo Bold 36 (relative `.largeTitle`). `PlanComparisonTable` on iOS: a "Compare plans" sheet with a `Grid`; at AX a `List` per plan. [shared §9.2]

### 4.21 `CheckInPass` [shared §9.3]
Variants `full`, `compact`, `wallet-preview`, `guest`, `teen`. `full`: **night-surface** card (radius 28, padding 24, never glass): reversed wordmark + plan badge in Dawn Copper; name Archivo 600 24; eyebrow "MEMBER NUMBER"; number Archivo Bold 36, tabular; QR on a pure white rounded square (radius 10), 240 to 280 pt, 16 pt quiet zone; caption "Scan at the front desk"; "Checking in at {club}" + "Change" (opens `ClubSwitcher`). Under the card: `PKAddPassButton` (system black in light, white in dark), "Maybe later" first visit only; "Kids club today" section. States: `valid`, `frozen`, `past-due` (day 15+: "See the front desk."), `trial`, `guest`; refreshing (QR dims to 60 % under 1 s; never blank); error and offline text; expired with a "Refresh code" button. QR from `CIFilter.qrCodeGenerator` (error correction M) rendered with interpolation none. Rotating code every 60 s. Brightness boost is a proposal. Entry points: Today header button, tab bottom accessory, Lock Screen widget, App Intent. No household chips: children do not have their own codes; the parent checks in and shows their own pass. (Revision 1 removed.) Member sample: Maya Lopez, 0042 1187.

### 4.22 `VisitStreak` [shared §9.4]
Variants `strip` (Today), `month` (Progress, hero number above the calendar), `badge` (count only). Count: `Label("6-week streak", systemImage: "leaf.fill")` with `.monospacedDigit()`. No flame. Week strip: seven 32 pt dots Mon to Sun; visited = `BrandSecondary` fill with a check; today not visited = 2 pt ring; future = thin `BorderStrong` ring; past empty = thin `Border` ring. No red, no X, no shame. Rule: a streak week meets the weekly visit target (default 3); one rest week is forgiven per 10 weeks. [found §4] `.accessibilityElement(children: .combine)`: "6-week streak. This week: 2 visits." States: first week ("Start your streak: visit once this week."), broken ("Last week was 2 of 3. This week is a fresh climb."), milestone toast at 4, 8, 12 weeks. (Revision 1 used a Rib Peak mark; replaced by the leaf.)

### 4.23 `ProgressRibs` [shared §9.5]
`RibMeter` tone `brand`; lit ribs = visits; a tick under the goal rib; ribs beyond the goal dashed; goal met = `StatusSuccess` + "Goal met". Variants `inline`, `hero` (`xl` ribs + "2 of 3" in Archivo `data-l`, relative `.largeTitle`), `widget` (capitals label "3 OF 4 VISITS"). Goal range 1 to 5. Copy: "2 of 3 visits", "1 more to reach your goal." Never "behind" or "failed". iOS: `Gauge` + `RibGaugeStyle` `[UNVERIFIED]`; edit goal in a `Stepper` sheet. Also used for onboarding steps (5 ribs) and the guest pass allowance.

### 4.24 `ClassPhotoTile` [shared §7.8]
Variants `grid`, `square` (iOS two-up), `carousel` (4:5, 200 wide), `category` ("Browse by category", band shows "12 classes this week"). iOS: `NavigationLink` with `ZStack(alignment: .bottom)`: `AsyncImage` + `Rectangle().fill(Color.nightSurface.opacity(0.8))` band. `LazyVGrid` two columns. Text SF `.headline`. Placeholder: category tint + icon. Decorative by default.

### 4.25 `EmptyState` [shared §10.1]
iOS: `ContentUnavailableView { Label(title, image: "cp.ribs.empty") } description: { Text(body) } actions: { Button(label) {...}.buttonStyle(.borderedProminent) }`. Custom symbol `cp.ribs.empty` is the hollow-rib image. Search and filter results use `ContentUnavailableView.search` where it fits. Every empty state has a next action. Copy samples (shared): `no-bookings` "No classes booked yet" / "Pick a class and we'll save your spot." / "Book a class"; `no-past` "No past classes yet"; `no-waitlist` "You are not on any waitlists" / "Full class? Join its waitlist and we will book you if a spot opens." / "Browse today's classes". Block variant title in Archivo; inline in SF.

### 4.26 `DurationChips` [shared §8.2]
Segmented row of chips (44 pt tall, capsule). Selected chip filled `BrandSecondary`. Used for court duration (60 | 90 min) and freeze length (1 | 2 | 3 months). `Picker(.segmented)` is allowed as the native fallback. Adjustable for VoiceOver. At AX sizes a menu.

### 4.27 `LateCancelNotice`, `OpenStatus`, `RatingLine`
`LateCancelNotice` (part of `BookingStateButton`): text with the triangle, from 2 hours before start and in the cancel sheet. `OpenStatus`: dot + "Open until 10 p.m." / "Closed · opens 4:30 a.m." `RatingLine`: **not rendered** (no public ratings at launch); the model keeps an optional field. Members give private feedback after a class instead. [found §4] [shared §4.8]

## 5. Motion and haptics

### 5.1 Motion tokens
From theme `motion`. [theme]
| Token | Value | SwiftUI |
|---|---|---|
| Standard | 150 ms, cubic-bezier(0.2, 0.8, 0.2, 1) | `Animation.timingCurve(0.2, 0.8, 0.2, 1, duration: 0.15)` |
| Large | 300 ms, cubic-bezier(0.16, 1, 0.3, 1) | `Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.3)` |
| Press scale | 0.98 | `PressableCardStyle` |
| Popup scale | 0.96 | menus, toasts |
For state changes inside sheets use `.snappy`. For ribs use `.snappy(duration: 0.2)`. Do not use springs with big overshoot. [apple §6 Reduce Motion]

### 5.2 Reduce Motion
Read `@Environment(\.accessibilityReduceMotion)`. When on: replace slides and scales with a 150 ms fade, remove rib stagger, stop the code ring animation, disable `symbolEffect`, no parallax on hero. Haptics stay. [apple §6]

### 5.3 Haptic vocabulary (`sensoryFeedback`)
`sensoryFeedback(_:trigger:)` `[verified]` iOS 17+.
| Name | Feedback | Use |
|---|---|---|
| `selection` | `.selection` | Day chip, segment, slot, filter chip, favourite |
| `booked` | `.success` | Booking, reservation, freeze set, guest share |
| `waitlisted` | `.impact(flexibility: .soft)` | Waitlist joined |
| `promoted` | `.success` | Hold confirmed while app open |
| `released` | `.impact(weight: .light)` | Cancel free, leave waitlist |
| `lateCancel` | `.warning` | Late cancel |
| `error` | `.error` | Failed action, rejected code |
| `checkedIn` | `.success` | Scan accepted |
| `levelChange` | `.levelChange` | Busyness level changed on screen |
Rules: one haptic per user action. Do not pair a haptic with a repeating animation. Add a setting to turn haptics off. [apple §6 "pair audio cues with haptics"]

### 5.4 Sound
None in the app. Notifications use the default sound; Time Sensitive waitlist uses the default alert.

## 6. Widgets and controls

Framework: WidgetKit. Shared data through an App Group. Widgets read a small cached JSON snapshot. [apple §5 Widgets]

### 6.1 Home Screen widgets
| Widget | Family | Content | Tap |
|---|---|---|---|
| Next class | `systemSmall` | `ClassCard` `compact` widget tile: small photo or `icon-disc`, bold title, capitals label "NEXT: 6:00 A.M. CLIMB CYCLE", room, `IntensityRibs`. Empty: "Nothing booked. Tap to book." [shared §7.1] [mobbin-standard-pass §2 rule 55] | `/book/class/{id}` or `/book` |
| Club now | `systemMedium` | Club name, `BusynessMeter` large + word, mini `PopularTimesChart`, "as of 5:35 a.m.", open until | `/clubs/{slug}` |
| Next + pass | `systemMedium` | Left: next class. Right: pass tile ("Show pass") | pass: `/pass` |
| Today | `systemLarge` | Next 3 bookings, club busyness strip, pass tile | rows → class |
| Weekly goal | `systemSmall` | `ProgressRibs` `widget`: capitals label "2 OF 3 VISITS", ribs, and the `VisitStreak` strip (seven dots, read-only). [shared §9.4, §9.5] | `/progress` |
| Kids club | `systemSmall` (family) | Next kids club block, "Mia + Eli", "Check in by 8:15 a.m." | `/bookings/{id}` |
- Configurable with `AppIntentConfiguration` and a `WidgetConfigurationIntent` with a `ClubEntity` parameter (default: home club). `WidgetConfigurationIntent` has no `perform()`. [skill:app-intents-specialist]
- Background: `containerBackground(for: .widget) { Color("Surface") }`. Fonts: system styles, `.widgetAccentable()` on time and ribs `[UNVERIFIED]`.
- Tinted and clear modes: the system removes colour. The widget must read with only shape and text. Ribs use opacity (filled 100 %, unfilled 30 %). Category is shown by icon + name. [apple §5 Widgets]
- Refresh: next-class timeline entries at booking changes and every 15 min; busyness every 15 min (WidgetKit budget limits apply). Always show "as of" time. Optional push refresh with `WidgetPushHandler` `[UNVERIFIED]`.
- Dynamic Type: widgets use text styles; at large sizes the system reduces the available layout; use `ViewThatFits`.

```
systemSmall  (Next class)        systemMedium (Club now)
+------------------+             +------------------------------------+
| ▌Cycle           |             | Gilbert – Val Vista          Steady|
| 6:00 a.m.        |             | |||..                              |
| Climb Cycle      |             | ▁▂▅▇█▆▅▃▂  now ▲   as of 5:35 a.m.|
| Cycle studio     |             | Open until 10 p.m.                 |
| Val Vista  ||||. |             +------------------------------------+
+------------------+
```

### 6.2 Lock Screen widgets
| Widget | Family | Content |
|---|---|---|
| Pass | `accessoryCircular` | `qrcode` glyph in a ring. Tap opens `/pass`. No member data. |
| Next class | `accessoryRectangular` | Line 1 "Climb Cycle" (headline), line 2 "6:00 a.m. · Val Vista", small `RibMeter` (vibrant). |
| Next class | `accessoryInline` | "Cycle 6:00a · Val Vista" |
| Busyness | `accessoryCircular` | `Gauge` 1 to 5 with the word under it |
- Vibrant mode: monochrome only. Keep text weight medium or heavier. [apple §5 Widgets]
- No sensitive data: no name, no member number, no code. [apple §5]

### 6.3 Control Center and Action button
Use `ControlWidget` with `ControlWidgetButton`. `[verified]` types exist.
| Control | Label | Action |
|---|---|---|
| Show pass | `qrcode`, "Show pass" | `ShowPassIntent` with `supportedModes = .foreground(.immediate)` |
| Next class | `calendar`, "Next class" | Opens `/book/class/{id}` |
| Club busyness | Value control "Steady" (read-only) | Opens club `[UNVERIFIED]` value-control template |
- Action button: members can assign "Show pass" (the control or the App Shortcut).
- Controls appear on the Lock Screen bottom corners in place of Flashlight/Camera when the member sets them.

## 7. Live Activity and Dynamic Island

Flow: `02` flow 15. Rules: [apple §5 Live Activities].

### 7.1 Data
```swift
struct ClassActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        enum Phase: String, Codable { case upcoming, checkInDue, inProgress, ended }
        var phase: Phase
        var startsAt: Date
        var endsAt: Date
    }
    var sessionID: String
    var className: String          // "Climb Cycle"
    var categoryIcon: String       // SF/custom symbol name
    var clubShort: String          // "Val Vista"
    var room: String               // "Cycle studio"
}
```
Start: `Activity.request(attributes:content:pushType:)`. Update: `update(_:)` and `update(_:alertConfiguration:timestamp:)`. End: `end(_:dismissalPolicy:)`. `[verified]` names are in [apple §5]. `staleDate` = end + 15 min. Dismissal: `.after(endsAt + 15 min)`. Max 1 activity.
Push-to-start from the server `[UNVERIFIED]`.

### 7.2 Lock Screen / banner layout
Margin 14 pt. `ContainerRelativeShape` for corners. Background `NightSurface` with `NightOnSurface` (Sand) text (custom background allowed on Lock Screen only). Layout follows the shared Live Activity pattern: [shared §7.1] [mobbin-standard-pass §2 rule 54]
- Top right: a timer chip "Starts in 38 min" (`Text(timerInterval:countsDown:)`, tabular, counts without updates).
- Main: the class name large (Archivo 600, 22 pt base, relative `.title2`; allowed because it is a display title) with the start time under it. The category `icon-disc` sits at the left.
- Bottom row, three values: club short name · room · spots or "Check in open", for example "Val Vista · Cycle studio · Booked".
```
+----------------------------------------------+
| (icon) Climb Cycle           [Starts in 38 min]|
|        6:00 a.m.                              |
| Val Vista · Cycle studio · Booked             |
+----------------------------------------------+
```
Phases: Upcoming (timer chip); T-15 "Check in open" (alert) with `Button(intent: ShowPassIntent())`; In progress "Ends 6:45 a.m."; Ended "Done. Nice work." for 15 min. Show an innocuous summary, not the member name. [apple §5]

### 7.3 Dynamic Island
```
Compact:   [icon]                14m
Minimal:   [icon]
Expanded:
+----------------------------------------+
| [icon]  Climb Cycle           6:00 a.m. |
|         Cycle studio · Val Vista        |
| Starts in 14:32      [ Show pass ]      |
+----------------------------------------+
```
- Compact leading: category icon (28 pt circle limit). Compact trailing: minutes left, medium or heavier weight. Minimal: icon only. [apple §5 Live Activities]
- Expanded: leading icon + name, trailing time, bottom row repeats the three values (club · room · spots or "Check in open") plus the countdown and the pass button. [shared §7.1]
- Text in the island is medium weight or heavier. Tint is `BrandAccent` (Dawn Copper in dark). Dismiss button colour set with `activitySystemActionForegroundColor(_:)`. `[verified]` name
- Accessibility descriptions for the activity and the island regions. [apple §5]

### 7.4 What not to do
- No Live Activity for waitlist, busyness or kids club.
- No promotions. No member name on the Lock Screen.
- No second notification for an update the activity already shows.

## 8. Wallet pass

Style: `generic`. Signed `.pkpass` made on the server. `[apple §5 Wallet]` Signing, Pass Type ID and entitlement details are `[UNVERIFIED]`.

### 8.1 Design
| Field | Value |
|---|---|
| `backgroundColor` | `rgb(28, 51, 40)` Saguaro Night |
| `foregroundColor` | `rgb(246, 241, 232)` Sand |
| `labelColor` | `rgb(224, 128, 79)` Dawn Copper (4.74:1 on Night) |
| Logo image | Reversed horizontal wordmark (`cpa-horizontal-reversed`) at 160 x 50 pt @1x/2x/3x |
| Icon image | Rib Peak symbol (for notifications) |
| Thumbnail | Member photo 90 x 90 pt |
| Header field | Plan: RIDGE |
| Primary field | Member: Maya Lopez |
| Secondary fields | Home club: Gilbert – Val Vista · Member since: Mar 2025 |
| Auxiliary fields | Member no.: 0042 1187 |
| Barcode | QR, message = signed member token, alt text = member number |
| Relevant locations | 5 clubs (lat/long), `maxDistance` 150 m, `relevantText` "Show this at the door." |
| Back fields | Hours, staffed hours, front desk phone (480) 555-0142, link to freeze, terms |
| Updates | `webServiceURL` + `authenticationToken` for plan, freeze, past-due changes |

```
+--------------------------------------+
| [wordmark reversed]         RIDGE    |
|                                      |
| MEMBER                    [photo]    |
| Maya Lopez                           |
| HOME CLUB          MEMBER SINCE      |
| Gilbert – Val Vista   Mar 2025       |
| MEMBER NO.                           |
| 0042 1187                            |
|        +--------------+              |
|        |   ██ QR ██   |              |
|        +--------------+              |
+--------------------------------------+
```
- The Wallet code is static and revocable ("Reset my codes" in Settings). The in-app code rotates. Readers accept both. Security review needed. `[PROPOSAL]`
- Frozen: the pass update changes the primary field to "Frozen until Feb 19" and removes the barcode. Payment failed: full pass until day 14; from day 15 the pass shows "See the front desk" and removes the barcode. [found §4]
- Family: children have no separate Wallet passes. The parent checks in and shows their own pass at the kids club desk.
- The Wallet button in the app uses the system style (black in light, white in dark). [shared §9.3]

## 9. App Intents, App Shortcuts and notifications

### 9.1 Rules applied
[skill:app-intents-specialist] [skill:app-intents-whats-new-27]
- `perform()` is `async throws`, not `@MainActor`. Hop to the main actor for UI. It can restart, so do irreversible work last and make it idempotent.
- Intent type names, entity IDs, `AppEnum` raw values and shortcut phrases are public contracts. Never rename them after release.
- `AppEntity.id` is stable across launches and devices (`club_gilbert_val_vista`, server session IDs).
- `entities(for:)` is batched. No N+1 lookups.
- Every `AppEnum` case has a `caseDisplayRepresentations` entry (a missing one crashes at runtime). Raw values are strings and only grow.
- Register `@Dependency` values in `App.init()`. Values are `Sendable` (use an `actor` store).
- User-facing strings are literal `LocalizedStringResource`.
- Each App Shortcut has `shortTitle` and `systemImageName` (a literal). Each phrase has `\(.applicationName)`. Max 10 shortcuts.
- Use `supportedModes` (not `openAppWhenRun`). `requestConfirmation` before destructive work. `requestChoice(between:dialog:)` for short choices. Snippets are side-effect free.
- In-app actions are not donated automatically: call `IntentDonationManager.shared.donate(intent:)` after the action completes. `[verified]`

### 9.2 Entities and enums
| Type | Kind | Notes |
|---|---|---|
| `ClubEntity` | `AppEntity` + `EnumerableEntityQuery` (only 5) | `OpenIntent` target. `URLRepresentableEntity` → `/clubs/{slug}`. |
| `ClassSessionEntity` | `AppEntity` + `EntityPropertyQuery` + `EntityStringQuery` | Properties: category, club, start date, time of day. `IndexedEntity` for Spotlight. |
| `BookingEntity` | `AppEntity` + query for upcoming | Used by cancel and calendar intents. |
| `ClassCategoryEnum` | `AppEnum` | Raw values: `strength`, `cycle`, `conditioning`, `mindBody`, `aqua`, `court`, `recovery`, `youth`. |
| `UsualSlot` | `AppEnum` | `fiveAM`, `sixAM`, `sevenAM`, `noon`, `fivePM`, `sixPM`. Display "5 a.m." and so on. |
| `ReserveDuration` | `AppEnum` | `sixtyMinutes`, `ninetyMinutes`. |

### 9.3 Intents and shortcuts (9 of 10 allowed)
| Intent type | Title | Parameters | `supportedModes` | Confirm | Example phrases (all end with "in \(.applicationName)") |
|---|---|---|---|---|---|
| `ShowPassIntent` | Show my pass | none | `.foreground(.immediate)` | no | "Show my pass", "Open my check-in pass" |
| `BookUsualClassIntent` | Book my usual class | `slot: UsualSlot`, `day: Date?` | `[.background, .foreground(.dynamic)]` | When full: `requestConfirmation` with the late-cancel rule, then join the waitlist. When booking is paused: stops with the pause date. | "Book my usual class", "Book my usual \(\.$slot) class" |
| `NextClassIntent` | Next class | none | `.background` | no | "What's my next class", "When is my next class" |
| `ClubBusynessIntent` | Club busyness | `club: ClubEntity?` (default home) | `.background` | no | "How busy is \(\.$club)", "How busy is my club" |
| `CancelNextBookingIntent` | Cancel next class | `booking: BookingEntity?` | `.background` | `requestConfirmation` always; late-cancel text when it applies | "Cancel my next class" |
| `ReserveCourtIntent` | Reserve a court | `club`, `start`, `duration: ReserveDuration` | `[.background, .foreground(.dynamic)]` | `requestChoice` for 60 or 90. Enforces one court a day, 2 active, Ridge and Summit only. | "Reserve a court at \(\.$club)" |
| `JoinWaitlistIntent` | Join waitlist | `session: ClassSessionEntity` | `.background` | `requestConfirmation`: "Late cancels count as strikes. Join the waitlist?" (replaces the consent checkbox). Max 5 active waitlists. | "Join the waitlist for \(\.$session)" |
| `TrackNextClassIntent` | Track next class | none | `.background` | no | "Track my next class" |
| `AddNextClassToCalendarIntent` | Add to calendar | `booking` | `.foreground(.immediate)` (shows system sheet) | no | "Add my next class to my calendar" |
- Not an App Shortcut: `ConfirmWaitlistSpotIntent` (used by the notification action "Confirm spot"), `OpenClubIntent` (`OpenIntent`), widget configuration intents.
- Result views use `ClassCard` (compact) in a `SnippetIntent`. The snippet `perform()` has no side effects. [skill:app-intents-whats-new-27]

```swift
struct BookUsualClassIntent: AppIntent {
    static let title: LocalizedStringResource = "Book my usual class"
    static var supportedModes: IntentModes { [.background, .foreground(.dynamic)] }

    @Parameter(title: "Time") var slot: UsualSlot
    @Parameter(title: "Day") var day: Date?
    @Dependency var bookings: BookingService          // registered in App.init()

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let session = try await bookings.usualSession(slot: slot, on: day)
        switch try await bookings.book(session, idempotencyKey: session.id) {
        case .booked(let b):
            return .result(dialog: "Booked \(b.className), \(b.when.formatted(.dateTime.weekday().hour())) at \(b.clubName).")
        case .full:
            let choice = try await requestChoice(between: [.waitlist, .nextTime], dialog: "That class is full.")
            // handle choice; irreversible work last
            return .result(dialog: "...")
        }
    }
}

struct CactusPeakShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: ShowPassIntent(),
                    phrases: ["Show my pass in \(.applicationName)"],
                    shortTitle: "Show pass", systemImageName: "qrcode")
        AppShortcut(intent: BookUsualClassIntent(),
                    phrases: ["Book my usual \(\.$slot) class in \(.applicationName)"],
                    shortTitle: "Book usual class", systemImageName: "calendar.badge.plus")
        // ...seven more
    }
}
```
This sample shows the structure. Check each signature in Xcode. `requestChoice` option type names are `[UNVERIFIED]`.

- Donations: donate `BookClassIntent`-equivalent after each in-app booking; donate `ShowPassIntent` when the pass opens from the UI. Delete donations for cancelled bookings (`deleteDonations(matching:)`). `[verified]`
- Spotlight: index clubs and upcoming bookings (`IndexedEntity`); `IndexedEntityQuery` iOS 27. [skill:app-intents-whats-new-27]
- `RelevantEntities` has no shipping context for gym classes. Do not use. `[UNVERIFIED]`
- Test with `AppIntentsTesting` (iOS 27). [skill:app-intents-whats-new-27]
- Phrase text must not change after release; add new phrases only.

### 9.4 Notification catalogue
Register categories at launch. Use `threadIdentifier` per class or topic. Group with summary arguments. Time Sensitive needs the capability `[UNVERIFIED]`.

| Category ID | Trigger | Level | Title | Body | Actions |
|---|---|---|---|---|---|
| `WAITLIST_PROMOTED` | Spot opened, 30-min hold starts | Time Sensitive | "A spot opened in Rib Rack Strength" | "Wed 5:30 p.m. · Mesa – Downtown. Confirm by 4:12 p.m." | **Confirm spot** (background); tap opens `/book/class/{id}?action=confirm` |
| `WAITLIST_EXPIRED` | Hold ended | Active | "Your hold ended" | "Rib Rack Strength, Wed 5:30 p.m. The spot went to the next person." | Open |
| `WAITLIST_CLOSED` | 1 h before start, still waiting | Passive | "Waitlist closed" | "Rib Rack Strength starts in 1 hour. Open spots show as drop-in." | Open |
| `CLASS_REMINDER` | 60 min before (member setting 30/60/120) | Active | "Climb Cycle at 6:00 a.m." | "Gilbert – Val Vista, Cycle studio. Bring water." | **Show pass** (foreground), Directions (foreground). No Cancel action inside 2 h (a late cancel is a strike). |
| `CLASS_CANCELLED` | Club cancels a booked class | Time Sensitive | "Rhythm Ride at 7:00 a.m. is cancelled" | "Marisol is out. Try the 8:00 a.m. class." | See times (foreground) |
| `BOOKING_CHANGED` | Room or instructor change | Active | "Room change: Climb Cycle" | "Now in Studio 3, same time." | Open |
| `COURT_REMINDER` | 30 min before | Active | "Pickleball at 8:00 a.m." | "Court 3, Mesa – Red Mountain." | Show pass |
| `COURT_PARTNER` | Partner joins | Passive | "Linda joined your court" | "Thu 8:00 a.m., Court 3." | Open |
| `KIDS_PICKUP` | 10 min before block ends | Active | "Kids club ends at 10:00 a.m." | "Pick up Mia and Eli at the kids club desk." | Open |
| `FAMILY_CHECKIN` | Teen checks in (parent opt-in) | Passive | "Jordan checked in" | "Gilbert – Val Vista, 4:12 p.m." | Open |
| `STRIKE_WARNING` | 2nd strike | Active | "2 strikes in 30 days" | "One more pauses new bookings for 3 days." | Open |
| `STRIKE_PAUSE` | 3rd strike | Active | "New bookings are paused" | "You can book again on Sat Oct 31. Kids club and check-in still work." | Open |
| `NO_SHOW` | Class ended, not checked in | Active | "We missed you at Climb Cycle" | "A no-show counts as a late cancel." | Open |
| `KIDS_RELEASE` | 10 min after block start, parent not checked in | Active | "Check in to keep Mia and Eli's block" | "We release it 15 minutes after the start." | Show pass |
| `FEEDBACK` | 10 min after class | Passive | "How was Climb Cycle?" | "Only the club sees your answer." | Great, Okay, Not for me (background) |
| `PT_APPROVAL` | Teen requests PT (to parent) | Active | "Jordan asked for a session" | "Approve or decline." | Open |
| `BILLING_UPCOMING` | 3 days before bill | Passive | "Your Nov 12 bill is $117.00" | "Ridge plus Mia and Eli." | Open |
| `BILLING_FAILED` | Charge fails (day 0, 3, 6) | Active | "We could not charge your card" | "We will try again. Update it to keep full access." | **Update payment** (foreground) |
| `BILLING_PAUSED` | Day 8 | Active | "New bookings are paused" | "Pay your balance to book again. Your pass still works." | **Update payment** |
| `FREEZE_STARTING` | 3 days before | Active | "Your freeze starts Dec 20" | "You cannot check in while frozen." | Open |
| `GUEST_USED` | Guest checks in | Passive | "Alex used your guest pass" | "Gilbert – Val Vista, 10:05 a.m." | Open |
| `CLUB_NOTICE` | Club posts | Passive | "Gilbert – Val Vista" | "Pool's 82° and the shade sails are up." | Open |
- The waitlist action runs through `ConfirmWaitlistSpotIntent` so one code path serves notifications, Siri and the UI. [skill:app-intents-specialist] There is no "Release" action: an unconfirmed hold ends by itself after 30 minutes. [found §4]
- Do not use the Time Sensitive level for anything else. Do not send marketing in v1.
- Class reminders are skipped while a Live Activity for the same class is active. [apple §5 Live Activities]
- Quiet hours (Settings) hold Passive and Active items. Time Sensitive items still deliver.
- Copy voice: short, plain, a little dry. No emoji. No exclamation marks.
