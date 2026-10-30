# Redesign goals

Started Oct 28, 2026. These goals come from the owner's critique and an audit with the `better-*` skills and the ui.sh design guidelines. References come from Mobbin.

## The critique

1. The site feels like a classic software landing page.
2. It has too many eyebrow labels, descriptions and captions.
3. Small components hold too much information. They have weak information architecture and a weak text hierarchy.

## What the audit measured (before)

| Page | Text elements in `main` | At 14 px or smaller | Eyebrows | Headings (h2 + h3) | Height at 1440 px |
| --- | --- | --- | --- | --- | --- |
| Home | 216 | 139 (64%) | 3 | 35 | 8,539 px |
| Club (Mesa – Dobson) | 227 | 141 (62%) | 4 | 26 | 9,423 px |
| Class (Climb Cycle) | 131 | 98 (75%) | 6 | 14 | 5,045 px |
| Membership | 71 | 36 (51%) | 1 | 14 | 4,949 px |

Source counts: 79 `eyebrow` uses and 227 `text-caption` or `text-detail` uses in `app/` and `components/`.

The causes, by skill:

- **Layout (one primary action, order by importance).** Home has 10 sections and tries to be the whole site. Each section repeats one pattern: eyebrow, heading, lede, list, then a row of links.
- **Typography (fewer sizes and weights).** Most content sits in the 14 px caption role or the 13 px detail role. With so many small sizes, nothing reads as secondary, because almost everything is.
- **Surfaces (lightest separation that works).** Rows use a color bar, a top rule, a bottom rule, a meter, a status dot and a caption line together.
- **Writing (delete every word that does no work).** Photo captions describe placeholder art. Trust lines repeat the hero. Section ledes repeat their headings.

## References (Mobbin)

- [Squarespace, fitness template hero](https://mobbin.com/sites/sections/88798f15-ebe6-4c02-9864-9f2d7b3190a1): one headline, one short line, one button.
- [BLOK on Framer](https://mobbin.com/sites/sections/933f929a-d118-4b5d-834d-c60a0f488cae): a headline, one sentence and one action, next to one large image. No eyebrow.
- [ClassPass, studio fitness](https://mobbin.com/sites/sections/8adaef9a-d647-4e38-9541-c886bdb6742b): a large image, and the headline is the only label.
- [Function membership](https://mobbin.com/sites/sections/f5d5c740-7af0-4718-9893-3b8e80e39eed) and [Superpower](https://mobbin.com/sites/sections/6116ce47-e74a-4afc-a67f-fa7496e8579f): one price, one button, one list.

## Goals

1. **The heading is the only label.** No eyebrow above a section heading, a hero or a page title. A heading that needs an eyebrow to make sense gets a better heading. The `eyebrow` style stays only for table column labels and form summaries.
2. **Three text levels on marketing pages.**
   - Display: the page title and section headings.
   - Body: 16 px (18 px for a section's single supporting line), in the foreground color.
   - Small: 14 px muted, only for true metadata, such as a time, a price unit or an address on a detail page.

   Use one supporting line under a section heading at most, and only when it adds a fact.
3. **One job per section, one primary action per page.** Home becomes six sections: hero, clubs, classes, plans, members, tour. Each of the other content blocks already has its own page, so Home links there.
4. **Rows show a name, one line and one action.** Leave the address, busyness, signature list, intensity meter and example classes to the detail page.
5. **No captions on photos.** The shot brief stays as the image's accessible name. Visible captions only on editorial photos in journal articles.
6. **Space separates groups.** Use one rule per list, not a rule plus a color bar plus a meter. Use larger gaps between groups than inside them.
7. **Bigger type, fewer elements.** Headlines and prices carry the page. When something is removed, the space stays.

## Pass 1 (Oct 28): what changed

Foundation, which reaches every page:

- `.eyebrow` is now a quiet sentence-case label (14 px, weight 600, muted). It is no longer uppercase with 0.2em tracking. ui.sh allows uppercase eyebrows only in a monospace face.
- `SectionHead`, `HeroSplit`, `PageHead` and `FaqSection` no longer take an `eyebrow`. `HeroSplit` no longer takes `trust`, and its photo has no caption.
- New `text-lead` role (18 px / 28 px) for the one supporting line under a section heading.
- `PhotoSlot` captions are gone everywhere except the journal article hero. The shot brief stays as the accessible name.
- `CategoryIndex` shows a name and one line. `PlanColumns` drops the rib meter. The Home club rows show a name, one line and today's status.
- I deleted the eyebrows above headings on the club, offer, journal, aquatics and class pages. The mega menu loses its one-line descriptions and the class counts.

Home was rebuilt on six sections. The club page lost its busyness meter, amenity chips, aside captions, "Popular here" list, amenity sub-lists, two of its three address lines and the "Other clubs" list.

| Page | Text elements | At 14 px or smaller | Headings | Height at 1440 px |
| --- | --- | --- | --- | --- |
| Home | 216 → 66 | 64% → 23% | 35 → 8 | 8,539 → 5,309 px |
| Club (Mesa – Dobson) | 225 → 179 | 62% → 66% | 26 → 24 | 9,410 → 8,189 px |

Home on a phone went from 9,153 px to 6,307 px. The club page's small-text share rose because I removed body text, while the schedule and hours tables remain. Those tables are the next target.

Checks: `tsc` passes. axe (WCAG 2.2 AA and best practice) finds no violations on Home, the club page, Journal, Climb Cycle, the Offer page and Aquatics at the widths tested. No tested page scrolls sideways at 375 px.

## Pass 1b (Oct 28): links and buttons

- Links in `main` are underlined at rest (40% of the link color, full color on hover). Quiet labels share the link's 14 px semibold step, so color alone did not separate them. Menus, the drawer and the footer keep plain links.
- `TextLink` underlines its label only, so the line stops before the arrow.
- Text ghost buttons rest on the muted fill. Icon ghost buttons keep none.
- The "Most popular" badge is a neutral tag, not link-colored text.

## Pass 2 (Oct 28): schedule rows and class pages

- `ScheduleRow` (`components/brand/class-parts.tsx`) is now the time, the class (16 px), one muted line (coach and studio) and Book. Spots show only when 5 or fewer are left. The duration, category icon, category, color bar, coach avatar and intensity word moved to the booking sheet, which already shows them.
- The day strip is one line per day. An empty day dims. The count is in the button's accessible name.
- Time-of-day groups on `/schedule` are `h3`-size headings, not eyebrows.
- Class detail: the hero has no badge and one link, not two. The facts are three (length, intensity, level) at heading size, not five at 14 px. The "Next class" card that repeated the schedule is gone. "Who it is for" and "Bring and provided" are one section, "Is it for you?", at body size.

| Page | Text elements | Height at 1440 px |
| --- | --- | --- |
| Class (Climb Cycle) | 130 → 97 | 5,045 → 4,964 px |
| Club (Mesa – Dobson) | 179 → 170 | 8,189 → 8,236 px |

Counts now include button labels. Most remaining 14 px text is one muted line per schedule row and each "Book" label. axe finds no violations on the class, club, schedule and coach pages at 1440 px and 375 px.

## Pass 3 (Oct 28): club page and mega menu

- Club page: Coaches and "What members say" are one section, "People at …", with coaches on the left and two quotes on the right. The coach rows show specialties only, without credentials. The club FAQ is gone, because its answers repeated "What this club has" and the hero. The stroller-bay answer was the only fact not shown elsewhere. `faqClub` is deleted. The Plans action moved into the section heading. The section nav now reads Classes, Amenities, Hours and map, People.
- The club page is 7,261 px at 1440 px (it was 9,410 px before pass 1) and has 7 sections after the hero (it had 11).
- Mega menu: the "Next up" panel repeated the schedule column. It is now one line and one action: "Try any class free." with "Get a 3-day pass". The "Popular now" items lost their intensity meters.
- axe finds no violations on Home and two club pages at 1440 px and 375 px.

## Pass 4 (Oct 28): join and tour flows

- Join plan step: each card shows the name, a "Most popular" tag where it applies, the price and who it is for. The rib meter and the feature line are gone, and "Compare every detail" holds the features.
- Join club step: each card shows the name and cross street at body size. The status line and the signature list are gone. The Trailhead "No pool at this club." warning stays.
- The order summary rows, the "Today" total, the family add-on total and all consent and option checkbox labels are now 16 px.
- Payment: I removed the line "Payments are processed by our payment provider. We never see your card number." It contradicted the sample-checkout note above it, which says nothing leaves the browser.
- Join confirmation: the "1, 2, 3" eyebrows above the step headings are gone. The `<ol>` carries the order.
- Tour flow: club cards, the coach note, the summary panel, the address card and the consent label are at body size. "Your tour" and "What to bring" are headings, not eyebrows. The filler line "Not sure? Pick the nearest." is gone. Small-text uses fell from 17 to 7.
- **Bug fixed:** at 375 px, the tour day strip sat in a `<fieldset>`, which defaults to its content's width. The strip grew to 1,200 px, never scrolled, and `body` clipped the later days, so users could not reach them. A base rule `fieldset { min-inline-size: 0 }` fixes it for every fieldset.

Checks: both flows ran end to end, including the 0002 decline, the join confirmation and the tour confirmation. axe finds no violations on every join and tour step at 1440 px or 375 px. All 30 routes fit 375 px, and every sideways scroller scrolls.

## Pass 5 (Oct 28): type scale

- `--text-h3` is now 20 px / 28 px, its own step below h2 (24 px). Before, both were 24 px, so a subordinate heading matched its parent. There are 66 `text-h3` uses.
- `text-detail` is folded into `text-caption`. The two roles had the same size, line height and weight. 86 uses changed, and the `--text-detail` tokens are deleted. The scale is now display, h1, h2, h3, lead, body, body-strong, label and caption.
- The club amenity h3s are `text-h3 lg:text-h2`. On a phone they had matched their 24 px h2.
- `/faq` has a visually hidden h2 naming the current group or search. Before, the questions sat in the outline under the nav's "Question groups" heading.

Checks: on 22 routes at 1440 px and 375 px, every visible h3 is smaller than the h2 above it, and nothing overflows. axe finds no violations on 16 routes at 1440 px and on Home at 375 px.

## Pass 6 (Oct 28): remaining pages

- **Membership.** The intro no longer repeats the freeze fee, which the money FAQ answers. One action follows the plans, not two. The guest rules are one line and a policy link. The paragraph that linked to personal training and kids club is gone, because the main navigation has both.
- **Coach pages.** The hero is the name, one muted line (credential, specialties and years) and two actions. It lost the specialty chips, category badges, three stat tiles, the "Favorite class" line, Share and the reply note. "Clubs." became "Where {name} coaches.", a list of links that replaces compact club cards. "Other coaches" is an h3, not an eyebrow.
- **Kids.** Nine sections became seven. "Parents say" is gone, because Home carries member quotes. The family calculator is now a link to the full calculator on Membership. The teen section lost its category badge, and "Which clubs" is an h3.
- **Aquatics.** The warm-pool feature list and the class pitches that repeated the swim classes table are gone. The lanes lede is one sentence. The six-tile rules grid is one sentence. "Pool hours" is an h3.
- **Personal training, Courts and Recovery** already met the goals (22% to 48% small text, mostly tables and controls), so they did not change.

| Page | Text elements | Sections | Height at 1440 px |
| --- | --- | --- | --- |
| Membership | 110 → 102 | 6 → 5 | 4,949 → 4,701 px |
| Coach (Marisol Vega) | 78 → 63 | 5 | 3,452 → 3,543 px |
| Kids | 102 → 89 | 9 → 7 | 6,172 → 5,233 px |
| Aquatics | 105 → 94 | 5 | 4,563 → 4,377 px |

The coach page is a little taller because the clubs list now uses full-width rows. Outside data tables and schedule rows, what remains at 14 px is controls and data: button labels, day buttons, slot times and prices. That matches the label and caption roles.

Checks: axe finds no violations on all nine pages at 1440 px and 375 px. Nothing overflows at 375 px.

## Status

All passes listed in this file are done. `pnpm build` passed on Oct 28: it compiled with no errors and prerendered 107 pages. Not done and not verified:

- A screen-reader pass.
- The pages the passes did not touch directly (About, Careers, App, Contact, Search, Legal, Offer, the class category pages and the 404 page) received the foundation changes only. They had no page-level review.

## Pass 7 (Oct 28): brand graphics

The brand is fictional, so the site no longer shows placeholder "photos". A new vector system replaces them: `components/brand/graphics/`, with a specimen at `/graphics` (noindex). `node scripts/export-graphics.mjs` writes 322 standalone SVGs, in light and dark, to `../brand-graphics/svg/` for the web app and the iOS app. `../brand-graphics/README.md` has the rules.

- **Space graphics (15) and class graphics (8):** one collection of duotone line drawings, each modelled on a real object (see `components/brand/graphics/references.md`). Each has a flat, very light tint of its tone, one subject with strong-tone strokes (about 2 px at 96 px and 3 px at 400 px) and a mid-tint fill on its main surfaces, and the same margins at any ratio. No subject appears in both sets. Kids club is a slide and turf is an agility ladder with cones.
- **Coach marks (8):** a bespoke portrait of each coach's interests, never a person silhouette.
- **Space art (13):** scene illustrations of each space and club exterior in the same line and duotone style, recomposed for every ratio from 21:9 to 4:5.
- **Bespoke graphics (8):** decorative compositions for bands and callouts, still in the earlier filled style.
- **Club pages:** one "Spaces" section (3 or 4 primary spaces with their amenities, then club-wide amenity tiles) replaces the gallery dialog and the amenities section. The mapping is in `lib/data/club-spaces.ts` so the apps can reuse it. The hero is the club exterior (16:9 on phones, 21:9 from `sm`).
- **Home "Eight ways to move.":** a shadcn/ui carousel of six featured classes beside a 4 × 2 grid of class-type cards.
- **Personal training "Find a coach.":** coach marks as profile images. `CoachCard` and `InstructorChip` use them everywhere.
- **Everywhere else:** `PhotoSlot`, `PhotoThumb` and `ClassPhotoTile` are deleted. Each place uses `ClubArt`, `SpaceArt`, `SpaceGraphic`, `ClassGraphic`, `CoachMark` or `JournalArt`. The trial page's person photo and the journal photo caption were removed.

Checks: axe finds no violations and nothing overflows on 24 routes at 1440 px and 375 px. `tsc` passes, ESLint shows 0 errors and 13 warnings, and `pnpm build` prerenders 108 pages.

Open:
- The coach marks (bold line emblems with solid parts) and the 13 space art scenes now follow the base line and duotone style. The bespoke graphics still use the earlier filled style with the rib skyline.
- The web app and the iOS app do not use the exported SVGs yet.
- The club-space one-liners that are not in the club data need a copy review.
