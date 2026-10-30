# Cactus Peak Athletic — Product plan and specs

This folder is the full plan for three products of the Cactus Peak Athletic brand, written as if the brand were real:
the marketing website, the member web app and the iOS member app. It starts again from the brand identity
(`../cactus-peak-brand/`). It replaced the older plans of the first build (`cactus-peak-athletic`, removed Oct 29, 2026). The built apps are in `../cactus-peak-build/`; their shared Supabase backend is described in `../cactus-peak-build/supabase/README.md`.

Fictional brand for a university senior project. Names, phone numbers, prices and people are sample data.

## Read in this order

| # | File | What it gives you |
|---|---|---|
| 0 | [`00-foundation.md`](00-foundation.md) | The business facts that all specs share: 5 clubs, class categories and colours, plans and prices, booking rules, personas, design principles. Change facts here first. |
| 1 | [`01-shared-brand-components.md`](01-shared-brand-components.md) + [`part 2`](01-shared-brand-components-part2.md) | The custom brand components for clubs, classes, capacity and membership (`ClubCard`, `ClassCard`, `RibMeter`, `ScheduleWeekGrid`, `ReservationSlotGrid`, `CheckInPass` and more). One data model and one design for web and SwiftUI. |
| 2 | [`marketing-site/`](marketing-site/) | Strategy and sitemap, navigation (mega menus, mobile overlay, footer), 25 page templates section by section, component inventory (Graphical + shadcn/ui + site sections), content, accessibility, analytics. |
| 3 | [`web-app/`](web-app/) | Member portal: IA and route map, 20 flows, 26 pages, component inventory, microcopy, states, accessibility. |
| 4 | [`ios-app/`](ios-app/) | Native SwiftUI app: tabs and navigation, 16 flows, 26 screens, components and branding (widgets, Live Activity, Wallet pass, App Shortcuts), accessibility and quality. |
| — | [`research/`](research/) | The evidence: four Mobbin passes (marketing, web app, iOS, gaps, standard-mode pass), the component library inventory, Apple skills + HIG rules. Specs cite these files by rule number. |

## The brand in one paragraph
A full-service neighbourhood athletic club with five clubs in Mesa and Gilbert, Arizona. The promise is
*"Climb at your own pace."* The Rib Peak symbol is five saguaro ribs (one for each club) that form one summit. The tone is
steady and welcoming, never hype. The palette is Arizona Copper for action, Saguaro Night for brand weight, and Sand
neutrals. The type is Archivo (display) and Inter (interface).

## Key decisions across the three products

| Topic | Decision |
|---|---|
| Core principle | Clubs and classes are rich visual objects: photo, category colour + icon, instructor face, intensity ribs, spots left, live busyness. |
| Five-rib system | One `RibMeter` primitive shows intensity, busyness, capacity and weekly progress, always with a text value. |
| Category colours | 8 categories, each with a colour, an icon and a name. Contrast checked; Mind & Body and Court were darkened. |
| Marketing main CTA | "Book a free tour" (filled) + "Join" (outline) in the header. Club finder is a list + map split view. |
| Web app shell | Labelled left sidebar (shadcn `sidebar-07`) + slim top bar; bottom tab bar below 768 px (Today, Schedule, Bookings, Pass, More). |
| iOS navigation | System `TabView`: Today, Book, Clubs, You + Search tab. The check-in pass is a Today toolbar button, a contextual `tabViewBottomAccessory`, a Wallet pass, a widget and a Siri shortcut, not a tab. |
| Naming note | iOS "Book" holds classes, courts, lanes and kids club in one tab. On the web these are two pages, "Schedule" and "Reserve". |
| Components (web) | Graphical (themed Base UI) first; shadcn/ui where Graphical has no component; custom brand components for clubs and classes. |
| Components (iOS) | System views and modifiers with brand tint; Archivo only for large numbers and titles; SF Pro and Dynamic Type for body text. |
| Retention | Freeze and cancel have no dark patterns: equal-weight buttons, plain words, one-click reinstate. |

## Open decisions for the design lead
1. **Strength colour equals the action colour.** Strength uses Arizona Copper, which also means "you can act here".
   The specs reduce the risk (stripe + icon + tint only, never a filled badge as a button). A non-copper Strength colour
   would remove the risk.
2. **Web map renderer** (for `ClubMap` on web) is not chosen.
3. **Unverified Apple APIs** are listed in `ios-app/05-accessibility-and-quality.md` §11 (Archivo font names, passkey APIs,
   glass button foreground override, Live Activity push-to-start, Wallet signing). Check them in Xcode before build.
4. **Mobile marketing navigation** has thin research evidence. Test it at 375 px with real users.

## How the plan was made
1. Read the brand identity, guidelines and UI theme.
2. Research with Haiku agents: Mobbin (marketing, web app, iOS, gaps, a 40-search standard-mode pass), Graphical +
   shadcn/ui inventory, Apple Xcode skills + Human Interface Guidelines.
3. Wrote `00-foundation.md` so all specs share one set of facts.
4. Spec writing with Sonnet agents: shared components, marketing site, web app, iOS app. Each spec then had a revision pass
   against the final shared components, the settled business rules and the standard-mode research.
5. Cross-spec check: fixed conflicting facts (kids club ages, PT prices, add-on ages, phone numbers) and recorded the answers
   to cross-spec questions in `01-shared-brand-components-part2.md` §13.
