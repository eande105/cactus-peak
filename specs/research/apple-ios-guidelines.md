# Apple iOS 27 design rules for Cactus Peak Athletic

Research date: 2026-10-27. Scope: native iOS 27 SwiftUI app for a gym and athletic club (5 clubs, class booking, court reservations, check-in pass, club busyness, membership management).

## How to read this file

- Source tags:
  - `[skill:NAME]` means a rule from a user-installed Xcode skill, read from `/Users/ethanhanderson/Library/Developer/Xcode/CodingAssistant/ExportedPlugins/27B5038j/claude/skills/`.
  - `[HIG:page]` means Apple Human Interface Guidelines, fetched through Sosumi.
  - `[API:name]` means Apple API documentation, found through a Sosumi search. The search result gave the name and one-line description. The full page was not read.
  - `[PROPOSAL]` means my recommendation for this app. It is not an Apple rule.
  - `[UNVERIFIED]` means I did not verify the item in this run.
- Apple rules override anything in this file.

## Source gaps (read this first)

- The Liquid Glass HIG page (`/design/human-interface-guidelines/liquid-glass`) returned not found. Liquid Glass rules came from the Materials and Color HIG pages.
- Not read in full: HIG Maps, Charts, Notifications, Wallet, Siri, Onboarding, App Shortcuts, and Dark Mode pages. Only search summaries were available for Wallet, Charts, and Maps APIs.
- HealthKit was not researched in this run. Section 5 marks it `[UNVERIFIED]`.
- Exact SwiftUI signatures were taken from search titles. Check each one in Xcode before you rely on it. This applies to `Font.custom(_:size:relativeTo:)`, `fullScreenCover`, `navigationBarTitleDisplayMode`, `presentationDragIndicator`, `ActivityAttributes`, and `IntentDonationManager`.
- Contrast ratios in section 4 were calculated by hand with the WCAG 2.1 formula. They are not tool output.

---

## 1. Key rules from each skill

### swiftui-specialist `[skill:swiftui-specialist]`
- Use `ForEach` with stable identity (`Identifiable` or a stable `id`). Do not use indices as identity. This matters for lists of classes and courts.
- Prefer `@Observable` over `ObservableObject`. Keep `@Observable` models `@MainActor` when they drive UI.
- Narrow value inputs to the fields a view reads. Pass collection elements to row views.
- Do not store closures or class-typed defaults in `@Entry` environment values. These cause invalidation on every update.
- Use ternaries over `if`/`else` `@ViewBuilder` branches for simple modifier changes.
- Migrate from soft-deprecated APIs. Examples: `NavigationView` to `NavigationStack`, and the old `onChange` signature.
- Use `LocalizedStringResource` or `String` correctly. Use `.formatted(...)` for dates and numbers. Use `.leading` and `.trailing`, not `.left` and `.right`.

### swiftui-whats-new-27 `[skill:swiftui-whats-new-27]`
- `@State` is now a macro in the iOS 27 SDK. Views that compiled before may fail with "used before being initialized" or "invalid redeclaration". Do not fix this by reordering initializer assignments. Read `references/state-macro.md` in the skill.
- Drag-to-reorder works in any container with `.reorderable()` on `ForEach` and `.reorderContainer(for:)`. Useful for a user's favourite clubs list.
- `AsyncImage` caches by default. Use `AsyncImage(request:)` for a per-request cache policy. Use `asyncImageURLSession(_:)` for a custom session.
- Swipe actions work outside `List`. Mark the container with `swipeActionsContainer()`. Keep `swipeActions(edge:allowsFullSwipe:content:)` on each row. Useful for a booking list inside a `ScrollView`.
- Toolbar controls:
  - `visibilityPriority` sets which items stay visible.
  - `ToolbarOverflowMenu` forces items into overflow.
  - `toolbarMinimizeBehavior` minimizes the bar on scroll.
  - `.topBarPinnedTrailing` pins an item.
  - `ToolbarPlacement.statusBar` is available.
- `confirmationDialog` and `alert` accept `item: Binding<T?>`. Use this to confirm a class cancellation with the selected booking.
- Swift Charts can slow the type checker with deeply branching content. Split chart content into smaller views.

### accessibility-dynamic-type-specialist `[skill:accessibility-dynamic-type-specialist]`
- Pass: `.font(.body)`, `.font(.headline)`, and other text styles.
- Pass: custom fonts that scale through `relativeTo:` or `UIFontMetrics`.
- Pass: `@ScaledMetric` for icon and spacing sizes.
- Pass: `ViewThatFits` or a size-class check to switch horizontal rows to vertical at accessibility sizes.
- Fail: `.font(.system(size: N))`, custom fonts with a fixed size, `.minimumScaleFactor` as the main strategy, `.lineLimit(1)` on long text, and fixed `.frame(height:)` around text.
- Icon-only and layout checks are informational. Check every screen at AX5 in addition to these source checks.

### accessibility-sufficient-contrast-specialist `[skill:accessibility-sufficient-contrast-specialist]`
- Text under 18 pt regular (or under 14 pt bold) needs 4.5:1. Large text needs 3:1. UI boundaries and meaningful icons need 3:1.
- Asset-catalog colours that the audit cannot resolve return NEEDS VERIFICATION. Check each brand colour in both appearances with the Digital Color Meter.
- Opacity affects contrast. Composite alpha before you measure.

### accessibility-voiceover-specialist `[skill:accessibility-voiceover-specialist]`
- Every interactive element needs a readable label. Icon-only buttons need `.accessibilityLabel`. Do not use identifiers such as `btnBook`.
- Traits: use `.isButton`, `.isHeader`, `.updatesFrequently` for live counters, and `.isSearchField` for custom search.
- Custom controls need `accessibilityAddTraits`. Adjustable controls need `.accessibilityAdjustableAction`.
- Decorative images use `.accessibilityHidden(true)`. Meaningful images need a label.
- Group related row text with `.accessibilityElement(children: .combine)`. Do not group when children are separate buttons.
- Expose row swipe actions as custom actions with `.accessibilityAction(named:)`.
- Use `.accessibilitySortPriority` only when visual order differs from reading order.

### app-intents-specialist `[skill:app-intents-specialist]`
- `perform()` is async and not `@MainActor`. Hop to the main actor for UI state.
- `perform()` can restart. Do irreversible work last and make it idempotent.
- Call `requestConfirmation` before destructive work, for example cancelling a booking.
- Return values with `.result(...)` factories.
- `AppEntity.id` must stay stable across launches and devices. Use Club, Class, Court, and Booking IDs that do not change.
- `entities(for:)` is required and batched. Avoid N+1 lookups.
- `AppEnum` raw values are stored by string. Never renumber them. Add only new cases at the end.
- Every `AppEnum` case needs a `caseDisplayRepresentations` entry, or the app crashes at runtime.
- `@Dependency` must be `Sendable` and registered at launch. It goes on intents and queries, not on entities.
- In-app actions are not donated automatically. Call `IntentDonationManager.shared.donate(intent:)`.
- User-facing intent strings must be literal `LocalizedStringResource`.
- App Shortcut phrases must include `\(.applicationName)`. Provide `shortTitle` and `systemImageName`.
- Treat intent type names, entity IDs, enum raw values, and shortcut phrases as public contracts. Renaming them breaks saved shortcuts.

### app-intents-whats-new-27 `[skill:app-intents-whats-new-27]`
- `supportedModes` (`.background` or `.foreground`) replaces the deprecated `openAppWhenRun`. Source: iOS 26 section.
- `requestChoice(between:dialog:)` asks the person to pick from a small set during `perform()`. Use it for a short choice, not for open-ended entity search. Source: iOS 26.
- `SnippetIntent` returns an interactive snippet. Keep its `perform()` side-effect free, because the system can re-run it. Source: iOS 26.
- `RelevantEntities.shared.updateEntities(_:for:)` surfaces entities the system should suggest. Source: iOS 27. Shipping contexts include `.audio(.nowPlaying)` and HealthKit workout contexts. A club app has no shipping context for classes in this list. Treat this as `[UNVERIFIED]` for a booking app.
- `IndexedEntityQuery` lets the system request reindexing. Source: iOS 27.
- `EntityCollection<Entity>` stores IDs and defers loading. Use it for large entity parameters. Source: iOS 27.
- `SystemShortcut` plus `RunSystemShortcutIntent` is only for widget configuration. iPhone and iPad only. Source: iOS 27.
- `AppIntentsTesting` runs intents out-of-process against the installed app. Use it for UI test coverage. Source: iOS 27.
- Gate each new API with `@available` or `if #available` when the deployment target is older.

### Read but not applied
- `app-intents-whats-new-27` also lists Visual Intelligence, Syncable entities, and Apple Intelligence schemas. These do not map to a gym app. Skipped.

---

## 2. Navigation rules

### Tab bar `[HIG:tab-bars]`
- Use the tab bar for top-level sections only. Do not use it for actions. Use a toolbar for actions.
- Keep the tab bar visible in every top-level section. Hide it only behind a modal view.
- Use the fewest tabs that work. Avoid a More (overflow) tab. Limit scenarios where tabs overflow.
- Do not disable or hide a tab, even when its content is empty. Explain the empty state in the content.
- Use one-word tab labels with SF Symbols. Prefer filled symbols.
- Use a badge only for critical information. Reserve badges for critical content.
- Use a trailing search tab with the search role. `[HIG:tab-bars]` lists this as allowed.
- A tab bar can minimize when a bottom accessory is present. Users can return it to full size by tapping a tab or scrolling to top. `[API:TabBarMinimizeBehavior]`.
- On iPad, the tab bar can convert to a sidebar. Users can customize tabs. A default list of five or fewer tabs keeps compact and regular layouts consistent. `[HIG:tab-bars]`
- SwiftUI: `TabView` with `Tab` and `Tab(role: .search)`. `[API:TabRole.search]` `[API:tabViewSearchActivation(_:)]`.
- SwiftUI: `tabViewBottomAccessory(content:)` and `tabViewBottomAccessory(isEnabled:content:)`. Placements are `.inline` and `.expanded`. `[API:tabViewBottomAccessory(content:)]` `[API:TabViewBottomAccessoryPlacement]`.

`[PROPOSAL]` Tab layout for Cactus Peak (five items in total, including search):
1. Today: check-in pass entry, next booking, club busyness for the home club.
2. Book: classes and courts, segmented.
3. Clubs: five clubs, busyness, and map.
4. Membership: plan, billing, and card.
5. Search role (trailing): search classes, courts, and clubs.

`[PROPOSAL]` Put the active booking or check-in pass in `tabViewBottomAccessory(isEnabled:)`. Show it only when a booking is active.

### Search `[HIG:navigation-and-search]` `[HIG:toolbars]`
- Use a search field for a collection of content. Search fields sit in the toolbar or the search tab.
- Put the search field in the trailing position of the tab bar when it is a dedicated search tab.

### Push vs sheet vs full-screen cover `[HIG:sheets]` `[HIG:tab-bars]`
- Push onto a `NavigationStack` for hierarchy. Examples: Club to Class detail, Class detail to Booking flow step.
- Use a sheet for a scoped task that relates closely to the current view. Examples: choose a court time, confirm a membership change, or cancel a booking.
- Sheets can be modal or nonmodal on iPhone. A sheet is modal by default in SwiftUI.
- Use a full-screen modal for complex or prolonged flows, or content such as a camera or a check-in code. `[HIG:sheets]` says full-screen works well for multistep flows and media.
- Show only one sheet at a time from the main interface. If a sheet opens another sheet, close the first sheet first.
- Support swipe-to-dismiss for sheets. If there are unsaved changes, confirm with a dialog before dismissing.
- The Cancel button goes on the leading edge. The Done button goes on the trailing edge. Do not show Cancel, Done, and Back together.
- A multi-step sheet uses Back on steps after the first. The final step shows Done.
- SwiftUI: `sheet(item:onDismiss:content:)` `[API:sheet(item:ondismiss:content:)]`.
- SwiftUI full-screen cover: `fullScreenCover` `[UNVERIFIED]` signature in this run.

### Detents `[HIG:sheets]` `[API:presentationDetents(_:)]` `[API:presentationDetents(_:selection:)]`
- A sheet supports the large detent by default. Add `.medium` to let people see content first.
- `presentationDetents(_:)` sets the allowed detents. `presentationDetents(_:selection:)` binds the current one.
- Use `.medium` for a share or pick list. Do not use `.medium` for a long form. The HIG says compose sheets stay at full height.
- Include a grabber when the sheet is resizable. The grabber also helps VoiceOver users resize the sheet.
- SwiftUI grabber modifier `presentationDragIndicator` `[UNVERIFIED]`.
- `presentationBackgroundInteraction(_:)` controls whether people can use the content behind a sheet. `[API:presentationBackgroundInteraction(_:)]`.
- `[PROPOSAL]` Court reservation time picker: `.medium` and `.large` detents. Membership change confirmation: `.medium` only.
- `[PROPOSAL]` Check-in pass: `.large` detent or full-screen cover. A barcode or QR needs room.

### Inspector `[API:inspectorColumnWidth(_:)]`
- `inspector` shows supplementary detail beside content on iPad and Mac. On iPhone it becomes a sheet.
- `[PROPOSAL]` Use it on iPad for class details beside the class list. Do not rely on it on iPhone.

### Toolbars `[HIG:toolbars]` `[skill:swiftui-whats-new-27]`
- Put the most important items in the main toolbar. Add a More menu only for the rest. Do not add the overflow menu manually.
- Put the primary action on the trailing edge. Use the `.prominent` style for one primary action only.
- Use SF Symbols without borders for toolbar items. Use text buttons only when a symbol is unclear, such as Edit.
- Group items by function. Keep to about three groups.
- Keep text-labelled buttons apart with fixed space. Do not let two text labels run together.
- Keep navigation controls and critical actions (Done, Close, Save) in their own visually distinct group.
- Make every toolbar action available another way. On iOS, the toolbar is not always the only place for a command.
- Keep titles under 15 characters. Do not title a window with the app name.
- Use a large title on iOS for orientation. The title shrinks as people scroll. `[HIG:toolbars]`
- New in iOS 27: `visibilityPriority`, `ToolbarOverflowMenu`, `toolbarMinimizeBehavior`, and `topBarPinnedTrailing`. `[skill:swiftui-whats-new-27]`
- `[UNVERIFIED]` SwiftUI large title modifier `navigationBarTitleDisplayMode(.large)`.

### Lists and tables `[HIG:lists-and-tables]`
- Use a list for text-heavy items such as class schedules, bookings, and invoices.
- Let people reorder items when it makes sense. Let people enter edit mode to select items on iOS.
- Highlight a selected row briefly with a checkmark for option lists. Highlight a navigation row for hierarchy.
- Use a disclosure indicator (chevron) for drill-in. Use an info button only to show more information about the row.
- Do not add a section index to a list that has disclosure controls on its trailing edge.
- Keep row text short. Truncate long text only when people can open the full text.

### Other navigation rules
- A sidebar (`NavigationSplitView`) suits iPad layouts with many sections. `[HIG:navigation-and-search]` lists sidebars as navigation.
- Do not hide or relocate tab bar buttons in response to user state. This keeps the layout predictable.

---

## 3. Liquid Glass rules

### What gets glass `[HIG:materials]`
- Liquid Glass is a functional layer for controls and navigation. It floats above the content layer. Examples from the HIG: tab bars, sidebars, toolbars, and controls.
- Do not use Liquid Glass in the content layer. Use standard materials or solid colours for app backgrounds, cards, and list rows.
- Exception: transient controls such as sliders and toggles take a glass appearance while a person activates them.
- Apply glass to custom controls sparingly. Limit it to the most important functional elements.
- Standard system components pick up the glass appearance automatically. Do not re-add glass to them.

### Variants `[HIG:materials]` `[API:Glass]`
- Regular glass is the default. It blurs and adjusts the background for legibility. Use it for components with text.
- Clear glass is highly translucent. Use it only over visually rich media. For bright content behind clear glass, consider a 35 percent dark dimming layer.
- Accessibility settings (reduce transparency, increase contrast) change glass appearance. Test both.

### What must not get glass
- Club busyness cards, class cards, and membership cards. Use solid or standard-material backgrounds.
- A full toolbar of tinted buttons. Only one primary action should carry colour.

### Tinting with brand colour `[HIG:color]`
- Apply colour to the background of a prominent button, not to its symbol or label. The system uses the accent colour for prominent buttons.
- Do not put the same colour on many glass controls. Use colour on one primary action only.
- Use a monochrome toolbar when the content behind it is colourful. Choose an accent colour with enough difference from the content.
- Symbols and text on glass follow a monochrome scheme. They adapt to the content behind them.

### Glass API `[API:glassEffect(_:in:)]` `[API:GlassEffectContainer]` `[API:glassEffectID(_:in:)]`
- `glassEffect(_:in:)` applies Liquid Glass to a view.
- `GlassEffectContainer(spacing:content:)` combines several glass shapes into one shape. Use it for groups of glass controls. Nested glass without a container looks wrong.
- `glassEffectID(_:in:)` gives an identity so glass shapes can morph. Use it with a namespace.
- `glassEffectUnion(id:namespace:)` merges shapes into one union.
- `glassEffectTransition(_:)` with `GlassEffectTransition.materialize`, `.matchedGeometry`, or `.identity`.
- `Glass` defines the configuration. `DefaultGlassEffectShape` is a capsule by default.

### Glass button styles `[API:GlassButtonStyle]` `[API:GlassProminentButtonStyle]` `[API:primitiveButtonStyle glass]`
- `.buttonStyle(.glass)` applies a glass button style. `GlassButtonStyle` is the type.
- `.buttonStyle(.glassProminent)` applies a prominent glass style. Use it for the primary action only.
- `PrimitiveButtonStyle.glass(_:)` takes a configurable glass effect.
- `[PROPOSAL]` Use `.glassProminent` with `.tint(.arizonaCopper)` for "Book class", "Confirm booking", and "Check in". Use `.glass` for secondary actions.

---

## 4. Branding within native limits

### Accent and tint `[HIG:color]` `[HIG:materials]`
- Set the accent colour in the asset catalog as `AccentColor`. Use Arizona Copper (`#B5532C`) for light mode and Dawn Copper (`#E0804F`) for dark mode.
- Apply `.tint(...)` on the root view for app-wide tint.
- Provide light, dark, and increased-contrast variants for each custom colour. The HIG asks for a higher-contrast option for each variant. `[HIG:color]`
- Do not hard-code system colour values. Use semantic and system colours where possible. `[HIG:color]`

### Contrast results for the brand palette (calculated for this file)
These values use the WCAG 2.1 relative luminance formula. They are hand calculations. Check them with a tool before release.

| Pair | Ratio | Result |
|---|---|---|
| Arizona Copper `#B5532C` on white | about 4.95:1 | Passes 4.5:1 for normal text |
| Arizona Copper `#B5532C` on Sand `#F6F1E8` | about 4.40:1 | Fails 4.5:1 for normal text. Passes 3:1 for large text and UI boundaries. Do not use for body text on Sand. |
| Dawn Copper `#E0804F` on Saguaro Night `#1C3328` | about 4.73:1 | Passes 4.5:1 for normal text |
| Dawn Copper `#E0804F` on white | about 2.86:1 | Fails. Do not use Dawn Copper for text on light backgrounds. |
| Dawn Copper `#E0804F` on system dark background `#1C1C1E` | about 5.97:1 | Passes |

Rules that follow from this table:
- Use Arizona Copper for text only on white or system light backgrounds. Use it for body text only when the surface is white.
- Use Dawn Copper for text only on dark backgrounds.
- On Sand, use Arizona Copper for large text, icons, and fills. Use a darker shade (for example `#8F3F1F`) for small text. `[PROPOSAL]` Test this shade before you use it.

### Custom fonts and Dynamic Type `[HIG:typography]` `[HIG:accessibility]`
- System fonts scale with Dynamic Type through text styles. Custom fonts must scale too. `[HIG:typography]`
- Custom fonts that use a text style as the reference scale with Dynamic Type. The SwiftUI form is `Font.custom(_:size:relativeTo:)`. `[UNVERIFIED]` signature. Search result: "Applying custom fonts to text". `[API:Font.TextStyle]`
- `@ScaledMetric(relativeTo:)` scales icon and spacing values with text. `[API:ScaledMetric]` `[API:init(wrappedValue:relativeTo:)]`
- Do not embed system fonts in the app. Use `Font.Design` for system fonts. `[HIG:typography]`
- Keep the number of typefaces low. Mixing too many fonts makes hierarchy harder to read. `[HIG:typography]`
- Avoid light and ultralight weights for body text. Use Regular or heavier. `[HIG:typography]`
- The HIG minimum for iOS text is 11 pt. The default is 17 pt. `[HIG:typography]`

### Archivo versus SF `[PROPOSAL]` (based on the rules above)
- Archivo is fine for:
  - Large titles and display headings with `relativeTo: .largeTitle` or `.title`.
  - Hero numbers such as a club busyness percentage on a card, with `relativeTo: .largeTitle`.
  - Brand wordmark on the splash or onboarding screen.
- SF Pro should stay for:
  - Body text, labels, form fields, and list text.
  - Toolbar titles and tab labels. The system controls these.
  - Button labels. Keep them in the system font so they match the system controls.
  - Any text that VoiceOver, Dynamic Type, or Bold Text needs to change without custom code.
- Archivo is a custom font. Test it at AX5 and with Bold Text on. The HIG asks custom fonts to support the same behaviours as the system font. `[HIG:typography]`
- Confirm the Archivo font name in the bundled `.ttf` or `.otf` file before you write `Font.custom("Archivo-Bold", ...)`. The PostScript name must match.
- Archivo is not a system font. Do not use it inside system chrome (tab bar, toolbar, navigation titles).

### Colour assets `[HIG:color]` `[HIG:accessibility]`
- Each brand colour needs these variants in the asset catalog:
  - Any or Light appearance.
  - Dark appearance.
  - Increased-contrast variants for light and dark.
- Name colours by role, not by hue. Examples: `BrandAccent`, `BrandSurface`, `BrandTextPrimary`, `BrandStatusBusy`. Do not name them `Copper` or `Sand`.
- Test each role in light, dark, and increased contrast.
- Do not use colour alone for busyness. Pair colour with a label and a shape. `[HIG:accessibility]`

### App icon `[HIG:app-icons]`
- Use Icon Composer. Import layers, set the background, and export for Xcode. `[HIG:app-icons]`
- Provide the default, dark, clear light, clear dark, tinted light, and tinted dark variants. The system generates missing variants. `[HIG:app-icons]`
- Use square layers with no masking applied. The system applies rounded corners. `[HIG:app-icons]`
- Keep the same core features across all appearances. Do not swap elements between variants. `[HIG:app-icons]`
- Use simple shapes. Avoid fine line weights and sharp corners. Do not put text in the icon. `[HIG:app-icons]`
- Do not use app screenshots or UI components in the icon. Do not replicate Apple hardware. `[HIG:app-icons]`
- Provide 1024x1024 px layouts for iOS. Use sRGB or Display P3 colour. `[HIG:app-icons]`
- `[PROPOSAL]` Use a copper peak mark on Saguaro Night for the default icon. Use a mono mark for the tinted variant.

---

## 5. System integrations for a gym app

### Wallet (membership or check-in pass) `[API:PKAddPassesViewController]` `[API:PKAddPassesViewController(pass:)]` `[API:PKAddPassButton]`
- Show an add-to-Wallet button with `PKAddPassButton` on the membership screen. `[API:PKAddPassButton]`
- Present the Wallet sheet with `PKAddPassesViewController(pass:)` or `init(passes:)`. Check first with `PKAddPassesViewController.canAddPasses()`. `[API:canAddPasses()]`
- Delegate method `addPassesViewControllerDidFinish(_:)` runs when the sheet closes. `[API:addPassesViewControllerDidFinish(_:)]`
- `PKPassLibrary.Capability.backgroundAddPasses` lets an app add a pass without a confirmation screen. Check the entitlement and review rules before use. `[API:PKPassLibrary.Capability.backgroundAddPasses]` `[UNVERIFIED]` entitlement requirements.
- The pass file is a signed `.pkpass` made on a server. Pass Type ID and signing certificates are needed. `[API:Distributing and updating a pass]`
- `[UNVERIFIED]` Wallet HIG page rules. Only the search summary was read.
- `[PROPOSAL]` Put the barcode or QR for check-in on a Wallet pass. Do not put it only in the app.

### Live Activity (booked class or court session) `[HIG:live-activities]` `[API:ActivityKit]`
- Start a Live Activity with `Activity.request(attributes:content:pushType:)`. `[API:Activity.request(attributes:content:pushType:)]`
- Update with `update(_:)` or `update(_:alertConfiguration:timestamp:)`. `[API:update(_:)]` `[API:update(_:alertConfiguration:timestamp:)]`
- End with `end(_:dismissalPolicy:)`. `[API:end(_:dismissalPolicy:)]`
- Check whether Live Activities are allowed with `ActivityAuthorizationInfo` and `activityEnablementUpdates`. `[API:ActivityAuthorizationInfo]`
- Push updates use `pushToken` and `PushType`. `[API:pushToken]` `[API:PushType]`
- Rules from HIG:
  - Offer Live Activities only for tasks with a clear start and end. Keep them under eight hours. `[HIG:live-activities]`
  - End the activity as soon as the class or court session ends. Set a dismissal time of 15 to 30 minutes. `[HIG:live-activities]`
  - Do not show sensitive information on the Lock Screen. Show an innocuous summary, for example "Class in 10 min". `[HIG:live-activities]`
  - Do not show ads or promotions. `[HIG:live-activities]`
  - Do not use a push notification and a Live Activity for the same update. `[HIG:live-activities]`
  - Alert people only for essential updates. `[HIG:live-activities]`
  - Offer an App Shortcut that starts the activity. `[HIG:live-activities]`
  - Compact presentation must fit a 28 pt circle for limited-width contexts. `[HIG:live-activities]`
  - Lock Screen margin is 14 pt. `[HIG:live-activities]`
  - Use `ContainerRelativeShape` for rounded corners. `[HIG:live-activities]`
  - Use large, medium-weight or heavier text in the Dynamic Island. `[HIG:live-activities]`
  - Use `activitySystemActionForegroundColor(_:)` to set the dismiss button colour. `[HIG:live-activities]` `[API:activitySystemActionForegroundColor(_:)]`
  - Custom background colour is allowed only for the Lock Screen presentation. `[HIG:live-activities]`
- `[PROPOSAL]` One Live Activity per active booking. Do not show a Live Activity for club busyness. Busyness changes too often.

### Widgets (next class, busyness, pass) `[HIG:widgets]` `[API:WidgetKit]`
- Widgets are glanceable. Balance the information density. `[HIG:widgets]`
- Supported families include system small, medium, large, and extra large on iPad and Mac. Accessory families (circular, corner, inline, rectangular) suit the Lock Screen and Apple Watch. `[HIG:widgets]`
- Three rendering modes exist: full colour, accented, and vibrant. Lock Screen widgets use vibrant. `[HIG:widgets]`
- In tinted and clear appearances, the system removes colour and applies a tint. Design so text and icons still read. `[HIG:widgets]`
- Update frequency depends on how often the data changes. `[HIG:widgets]`
- `[UNVERIFIED]` widget modifiers such as `widgetAccentable()`.
- `[PROPOSAL]` Widgets: next booked class (small and accessory rectangular), club busyness (medium), and check-in pass (accessory circular, opens the pass screen).

### App Intents, App Shortcuts, and Siri `[skill:app-intents-specialist]` `[API:AppShortcutsProvider]` `[API:AppShortcut]` `[API:AppShortcutPhrase]`
- Define `AppIntent` types for: check in, book a class, reserve a court, cancel a booking, and show my pass.
- Define `AppEntity` types for: Club, ClassSession, Court, and Booking. Each needs a stable `id`.
- Use `EntityQuery` for lookup. Use `EntityPropertyQuery` for "Find classes where..." in Shortcuts. `[skill:app-intents-specialist]`
- `AppShortcutsProvider` lists App Shortcuts. `AppShortcut` includes `intent`, `phrases`, `shortTitle`, and `systemImageName`. `[API:AppShortcutsProvider]` `[API:AppShortcut]`
- Every phrase includes `\(.applicationName)`. `[skill:app-intents-specialist]`
- Donate in-app actions with `IntentDonationManager.shared.donate(intent:)`. `[skill:app-intents-specialist]` `[UNVERIFIED]` exact signature.
- Cancelling a booking calls `requestConfirmation` first. `[skill:app-intents-specialist]`
- `RelevantEntities` and `updateEntities(_:for:)` suggest entities. `[skill:app-intents-whats-new-27]` `[UNVERIFIED]` for this app's contexts.
- `SystemShortcut` and `RunSystemShortcutIntent` only apply to widget configuration. `[skill:app-intents-whats-new-27]`
- `[PROPOSAL]` Start with "Check in" and "Book next class". These two cover most use.

### Maps (five clubs) `[API:Map]` `[API:Marker]` `[API:MapCameraPosition]` `[API:MapUserLocationButton]`
- `Map` is the SwiftUI map view. `[API:Map]`
- `Marker` places a balloon marker on a coordinate. `[API:Marker]`
- `MapCameraPosition` sets the camera. Cases include `.region(_:)`, `.rect(_:)`, `.camera(_:)`, `.item(_:)`, `.automatic`, and `.userLocation`. `[API:MapCameraPosition]`
- `MapUserLocationButton` centers the map on the user. `[API:MapUserLocationButton]`
- `[UNVERIFIED]` HIG Maps page not read. Check the Maps HIG page before you finalise the map screen.

### Calendar (add class to calendar) `[API:EKEventStore]` `[API:EKEvent]` `[API:EKEventEditViewController]`
- Create events with `EKEvent(eventStore:)`. Save with `EKEventStore.save(_:span:)`. `[API:EKEventStore.save(_:span:)]`
- The EventKitUI view `EKEventEditViewController` shows a standard add-event sheet. Use it when you want the system UI. `[API:EKEventEditViewController]`
- Calendar access uses levels. Request the lowest level that works. `[API:Accessing Calendar using EventKit and EventKitUI]` `[UNVERIFIED]` exact authorization call names for iOS 27.

### HealthKit `[UNVERIFIED]`
- Not researched in this run. Do not design health data flows until this item is checked.

### Notifications `[UNVERIFIED]`
- HIG Notifications page not read. Live Activity alert rules are in section 5 above.

### Charts (busyness history, attendance) `[HIG:charts]` `[API:Chart]` `[API:accessibilityChartDescriptor(_:)]`
- Use Swift Charts. `[UNVERIFIED]` HIG Charts page content.
- `accessibilityChartDescriptor(_:)` describes a chart for VoiceOver. Pair it with `AXChartDescriptorRepresentable`. `[API:accessibilityChartDescriptor(_:)]` `[API:AXChartDescriptorRepresentable]`
- Chart content supports `accessibilityLabel`, `accessibilityValue`, and `accessibilityHidden`. `[API:accessibilityLabel(_:)]` `[API:accessibilityHidden(_:)]`
- Audio graphs let VoiceOver users hear the data trend. `[API:Representing chart data as an audio graph]`

---

## 6. Accessibility requirements

### Dynamic Type `[HIG:typography]` `[HIG:accessibility]` `[skill:accessibility-dynamic-type-specialist]`
- Support enlargement to at least 200 percent. Use text styles so the system scales them. `[HIG:accessibility]`
- Test every screen at the largest accessibility size (AX5). Use Settings > Accessibility > Display & Text Size > Larger Text. `[HIG:typography]`
- AX5 body text is 53 pt. AX5 large title is 60 pt. `[HIG:typography]`
- Keep the most important text visible at AX5. Avoid truncating text in scrollable areas. `[HIG:typography]`
- At large sizes, stack text above secondary items. Reduce the number of columns. `[HIG:typography]`
- Keep the visual hierarchy in the same order at every size. `[HIG:typography]`
- Scale icons with text. SF Symbols scale automatically. `[HIG:typography]`
- Do not clamp Dynamic Type with `.dynamicTypeSize` unless the layout cannot work at large sizes. Document the reason if you do. `[skill:accessibility-dynamic-type-specialist]` `[PROPOSAL]`

### Touch targets `[HIG:accessibility]`
- Default control size on iOS: 44 x 44 pt. Minimum: 28 x 28 pt.
- Add about 12 pt of padding around controls with a bezel. Add about 24 pt around controls without a bezel.
- Make the whole booking row a tap target. Do not rely on a small icon.

### Contrast `[HIG:accessibility]` `[HIG:color]` `[skill:accessibility-sufficient-contrast-specialist]`
- Text up to 17 pt: 4.5:1. Text at 18 pt or bold: 3:1. `[HIG:accessibility]`
- Check both light and dark appearances. `[HIG:accessibility]`
- Provide a higher-contrast colour scheme when Increase Contrast is on. `[HIG:accessibility]`
- Prefer system colours. They have accessible variants. `[HIG:accessibility]`
- Show the busyness state with a label or shape as well as colour. `[HIG:accessibility]`

### VoiceOver `[HIG:accessibility]` `[skill:accessibility-voiceover-specialist]`
- Label every control. Icon-only buttons need `.accessibilityLabel`. Example: "Check in" for a check-in icon. `[skill:accessibility-voiceover-specialist]`
- Busyness meter:
  - Label: "Club busyness".
  - Value: "Busy. 14 of 20 spots taken." Use the value, not only the colour.
  - Trait: `.updatesFrequently` if the value changes often.
- Class row: group the title, time, and coach with `.accessibilityElement(children: .combine)`. Expose "Book" and "Cancel" as custom actions with `.accessibilityAction(named:)`. `[skill:accessibility-voiceover-specialist]`
- Section headers: use `.isHeader`. `[skill:accessibility-voiceover-specialist]`
- Decorative images: `.accessibilityHidden(true)`. `[skill:accessibility-voiceover-specialist]`
- Use `.accessibilitySortPriority` only when the visual order differs from the reading order. `[skill:accessibility-voiceover-specialist]`
- Use `accessibilityAdjustableAction` for a stepper-like control, such as party size. `[skill:accessibility-voiceover-specialist]`
- Accessible descriptions for widgets and Live Activities: `[API:Adding accessible descriptions to widgets and Live Activities]`.

### Reduce Motion and Reduce Transparency `[HIG:accessibility]` `[HIG:materials]`
- When Reduce Motion is on, reduce automatic and repeating animation. Reduce zoom and scale effects. `[HIG:accessibility]`
- Tighten spring animations to reduce bounce. `[HIG:accessibility]`
- Replace x, y, and z transitions with fades. Avoid animating into and out of blurs. `[HIG:accessibility]`
- Track animations directly with gestures. `[HIG:accessibility]`
- Reduce Transparency and Increase Contrast change how Liquid Glass looks. Test both. `[HIG:materials]`

### Time limits `[HIG:accessibility]`
- Do not auto-dismiss views on a timer. Example: a check-in pass should not close after 30 seconds. Let people dismiss it with an action. `[HIG:accessibility]`

### Destructive actions `[HIG:accessibility]` `[skill:app-intents-specialist]`
- Ask for confirmation before cancelling a booking or a membership. For Assistive Access, ask twice. `[HIG:accessibility]`

### Other inputs `[HIG:accessibility]`
- Let people use Voice Control. Label controls clearly. `[HIG:accessibility]`
- Make every gesture also available as a button. Example: swipe-to-cancel also needs a visible Cancel button. `[HIG:accessibility]`
- Pair audio cues with haptics. `[HIG:accessibility]`
- Support Full Keyboard Access and Switch Control. Do not override system keyboard shortcuts. `[HIG:accessibility]`

### Accessibility Nutrition Labels `[HIG:accessibility]`
- Plan to report supported features in App Store Connect. Examples: VoiceOver, Larger Text, Sufficient Contrast, Reduced Motion, Captions. `[HIG:accessibility]`
- Check each feature in Accessibility Inspector before you declare it. `[HIG:accessibility]`

---

## 7. Exact SwiftUI and framework API names

### Navigation and structure
- `TabView` - top-level tab container.
- `Tab` - one tab item. `Tab(role: .search)` gives the trailing search tab.
- `TabRole.search` - search role for a tab.
- `tabViewSearchActivation(_:)` - controls how search activates in the search tab.
- `tabViewBottomAccessory(content:)` - places a view above the tab bar.
- `tabViewBottomAccessory(isEnabled:content:)` - shows or hides the accessory.
- `TabViewBottomAccessoryPlacement` - `.inline` or `.expanded`.
- `tabViewCustomization(_:)` and `TabViewCustomization` - user tab customization on iPad.
- `tabViewStyle(_:)` - for example `.sidebarAdaptable`.
- `NavigationStack` - push-based navigation. Use it instead of `NavigationView`.
- `NavigationSplitView` - sidebar layout for iPad.
- `sheet(item:onDismiss:content:)` - sheet presented from an optional item.
- `presentationDetents(_:)` - allowed sheet heights.
- `presentationDetents(_:selection:)` - allowed heights with a binding.
- `PresentationDetent.large` and `.medium` - system detents.
- `CustomPresentationDetent` - custom detent height.
- `presentationBackgroundInteraction(_:)` - interaction with content behind a sheet.
- `inspector` and `inspectorColumnWidth(_:)` - detail column on iPad and Mac.
- `InspectorCommands` - built-in inspector commands.
- `fullScreenCover` `[UNVERIFIED]` - full-screen modal presentation.

### Toolbars and lists
- `toolbar` - adds toolbar items.
- `ToolbarItemPlacement` and `ToolbarItem` - placement in the toolbar.
- `ToolbarPlacement.statusBar` - status bar placement (iOS 27).
- `visibilityPriority` - keeps an item visible when space is short (iOS 27).
- `ToolbarOverflowMenu` - forces items into overflow (iOS 27).
- `toolbarMinimizeBehavior` - minimizes the bar on scroll (iOS 27).
- `topBarPinnedTrailing` - pins an item to the trailing edge (iOS 27).
- `List`, `Section` - list and grouped sections.
- `swipeActions(edge:allowsFullSwipe:content:)` - row swipe actions.
- `swipeActionsContainer()` - enables swipe actions outside `List` (iOS 27).
- `reorderable()` and `reorderContainer(for:)` - drag-to-reorder (iOS 27).

### Liquid Glass
- `glassEffect(_:in:)` - applies glass to a view.
- `GlassEffectContainer(spacing:content:)` - groups glass shapes.
- `glassEffectID(_:in:)` - identity for morphing.
- `glassEffectUnion(id:namespace:)` - merges glass shapes.
- `glassEffectTransition(_:)` and `GlassEffectTransition` - transition for glass.
- `Glass` - glass configuration.
- `DefaultGlassEffectShape` - default capsule shape.
- `GlassButtonStyle` and `buttonStyle(.glass)` - glass button.
- `GlassProminentButtonStyle` and `buttonStyle(.glassProminent)` - prominent glass button.
- `PrimitiveButtonStyle.glass(_:)` - configurable glass button style.
- `tint(_:)` - sets the tint on a view.

### Type and layout
- `Font.custom(_:size:relativeTo:)` `[UNVERIFIED]` - custom font that scales.
- `Font.TextStyle` - text styles such as `.body`, `.headline`, `.largeTitle`.
- `Font.Design` - system font design constants.
- `ScaledMetric` and `init(wrappedValue:relativeTo:)` - scales a number with text.
- `ViewThatFits` - chooses a layout that fits.
- `dynamicTypeSize(_:)` - limits Dynamic Type range. Use with care.
- `ContainerRelativeShape` - corner shape that matches the container.
- `AsyncImage` and `AsyncImage(request:)` - remote images.

### Accessibility
- `accessibilityLabel(_:)`, `accessibilityValue(_:)`, `accessibilityHint(_:)`.
- `accessibilityAddTraits(_:)` and `accessibilityRemoveTraits(_:)`.
- `accessibilityElement(children:)` - `.combine`, `.contain`, `.ignore`.
- `accessibilityHidden(_:)` - hides a view from VoiceOver.
- `accessibilityAction(named:_:)` - custom action.
- `accessibilityAdjustableAction(_:)` - increment and decrement.
- `accessibilitySortPriority(_:)` - reading order.
- `activitySystemActionForegroundColor(_:)` - Live Activity dismiss colour.
- `accessibilityChartDescriptor(_:)` - chart description for VoiceOver.
- `AXChartDescriptorRepresentable` - builds a chart descriptor.
- `Chart` and chart content `accessibilityLabel`, `accessibilityValue`, `accessibilityHidden`.

### Data and state
- `@Observable` - observation macro.
- `@State` - now a macro in the iOS 27 SDK. See `references/state-macro.md` in the skill.
- `@Environment`, `@Entry` - environment values. Avoid closures and class defaults in `@Entry`.
- `@ScaledMetric` - scaled number property.
- `ForEach` with stable IDs.
- `confirmationDialog(...item:...)` and `alert(...item:...)` - optional item binding (iOS 27).

### App Intents
- `AppIntent`, `AppEntity`, `AppEnum`, `EntityQuery`, `EntityStringQuery`, `EnumerableEntityQuery`, `EntityPropertyQuery`.
- `AppShortcutsProvider`, `AppShortcut`, `AppShortcutPhrase`.
- `IntentDonationManager.shared.donate(intent:)` `[UNVERIFIED]` signature.
- `requestConfirmation`, `requestChoice(between:dialog:)`.
- `SnippetIntent`, `Button(intent:)`, `Toggle(isOn:intent:)`.
- `RelevantEntities`, `IndexedEntityQuery`, `EntityCollection` (iOS 27).
- `SystemShortcut`, `RunSystemShortcutIntent` (iOS 27, widget configuration only).
- `AppIntentsTesting` (iOS 27).

### WidgetKit and ActivityKit
- `WidgetKit` - widget framework.
- `Activity.request(attributes:content:pushType:)`, `update(_:)`, `end(_:dismissalPolicy:)`.
- `ActivityAuthorizationInfo`, `activityEnablementUpdates`, `pushToken`, `PushType`.
- `ActivityKit` - Live Activity framework.

### PassKit and EventKit
- `PKAddPassesViewController`, `init(pass:)`, `init(passes:)`, `canAddPasses()`.
- `PKAddPassesViewControllerDelegate`, `addPassesViewControllerDidFinish(_:)`.
- `PKAddPassButton`.
- `PKPassLibrary.Capability.backgroundAddPasses`.
- `EKEventStore`, `save(_:span:)`, `EKEvent(eventStore:)`.
- `EKEventEditViewController` (EventKitUI).

### MapKit and Charts
- `Map`, `Marker`, `MapCameraPosition`, `MapUserLocationButton`, `MapKit for SwiftUI`.
- `Chart`, `accessibilityChartDescriptor(_:)`.

---

## 8. Cross-cutting checks for the spec writer

- Plan a Dynamic Type review at AX5 for every screen, not only the screens with custom fonts.
- Plan a VoiceOver review for: busyness meter, class rows with swipe actions, check-in pass, and charts.
- Plan a contrast review for every brand colour in light, dark, and Increase Contrast. Use the table in section 4 as a start.
- Confirm all `[UNVERIFIED]` items before the spec is final. These include the Archivo font name, `Font.custom` signature, `fullScreenCover`, `presentationDragIndicator`, Wallet entitlements, `IntentDonationManager` signature, and HealthKit.
- Read the HIG pages not fetched here (Wallet, Maps, Charts, Notifications, Siri, App Shortcuts, Onboarding) before the related screens are specified.
