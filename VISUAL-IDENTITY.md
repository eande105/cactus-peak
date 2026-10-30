# Cactus Peak visual identity (graphics layer)

This file applies to the marketing site, the member web app and the iOS app.
`DESIGN-DIRECTION.md` says how the product must feel. The brand guidelines (OneDrive, `Brand Identity/brand-guidelines.md`)
own the logo, colour, type, photo and voice rules. This file adds the graphic system on top of the logo: what the
graphics are, how they are drawn and composed, where each one goes, and the formats we present them in.

Board with live examples (private until shared): https://claude.ai/artifact/ChTRxLH2tc6SAZMa8ptRv4

## 1. The decision

**We do not draw scenes. We draw gym objects.**

No vector illustration replaces a photo. There are no rooms, buildings, pools, floors, skylines or people in our
graphics. A real place gets a real photo. Until the photo exists, the slot shows an object composition, which is
clearly a graphic and never pretends to be a picture of the place.

The graphic language is a set of gym objects (a plate, a kettlebell, a spin bike, a paddle, a cone) from the
Nucleo Pro icon library, drawn as two-tone glyphs and arranged in a few fixed compositions. The objects do three jobs:

1. **Represent what is inside the gym.** A class category, an amenity, a plan's contents.
2. **Reference a location.** Each club has its own set of three objects.
3. **Give a point a picture.** A section that says "the warm pool is 82° all winter" shows the pool, large and cropped.

## 2. What happens to the current library

| Set | Count | Decision |
|---|---|---|
| Space art (scenes, exteriors) | 13 | **Retire.** Photo slots show a photo or an object composition. |
| Bespoke graphics | 8 | **Retire.** Object compositions replace them. |
| Space and class pictograms (line) | 23 | **Replace** with the object set, drawn in the new style. |
| Coach marks | 8 | **Replace** with the coach fallback: initials on a tone, with the coach's object cropped at the edge. |
| Rib meter | — | **Keep.** It is data, not decoration. |

The build pipeline stays: one TypeScript source, export script, light and dark SVG pairs, web sync and iOS asset
catalog. Only the drawings and the composition helpers change.

Fix before the next export: the six `mind-body` SVG files have an unescaped `&` in `<title>`, so they are not valid
XML and do not render in `<img>`. Escape the title in `serialize.ts`.

## 3. The objects (Nucleo)

The objects come from **Nucleo Pro, core family, glyph style, 48 px** (licensed to the project owner's Nucleo
account; install with `npx @nucleoicons/skills setup`). Core glyphs are geometric, filled and two-tone, so they hold
up from a 24 px Tile to a 300 px Crop. Do not draw custom objects; pick from Nucleo.

- **Two tones.** Nucleo marks secondary parts with `data-color="color-2"`. That part takes the detail tone (`b`,
  copper on light fields); the rest takes the body tone (`a`). See section 5.
- **Glyph, not outline.** Use the glyph style at 48 px for every graphic. Outline icons and the `ui` family are
  interface icons, not brand graphics.
- **Objects only.** No icon with a person, a body part, a face or a building. Nucleo's `yoga`, `sauna`, `swimming`
  and `gym-building` glyphs are out for that reason.
- **No cactus or mountain glyphs.** The logo carries the desert and the peak; clip-art versions weaken it.
- **Same scale.** Every glyph fills 92 % of its square (the importer adds a 4 % margin). Do not resize one object
  to make it "fit" a composition.
- **Adding an object:** add the Nucleo label to `OBJECTS` in `marketing-site/scripts/import-nucleo-objects.mjs`, run
  it, add the label and meaning in `objects.ts`, and add a row to the table below.

### The set (33 objects)

| Object | Nucleo core label | Represents |
|---|---|---|
| Weight plate | `weight-plate` | Free weights, strength |
| Dumbbell | `dumbbell` | Strength floor, personal training |
| Barbell | `barbell` | Olympic platforms |
| Kettlebell | `kettlebell` | Strength classes |
| Squat rack | `squat-rack` | Racks, lifting platforms |
| Bench | `incline-bench` | Strength floor |
| Medicine ball | `medicine-ball` | Functional training |
| Heavy bag | `punching-bag` | Boxing, conditioning |
| Resistance band | `resistance-band` | Mobility, rehab |
| Spin bike | `spinning-bike` | Cycle studio, cycle classes |
| Rower | `rowing-machine` | Cardio floor |
| Treadmill | `treadmill` | Cardio floor, cardio deck |
| Jump rope | `skipping-rope` | Conditioning classes |
| Stopwatch | `stopwatch` | Early classes, short sessions |
| Sneaker | `sneaker` | Turf lane, cardio |
| Cone | `traffic-cone` | Youth, agility |
| Pool | `swimming-pool` | Lap pool, swim school |
| Water | `water-wave` | Aqua classes, warm pool |
| Paddle | `table-tennis` | Pickleball courts |
| Ball | `tennis-ball` | Courts, open play |
| Basketball | `basketball` | Basketball courts |
| Mat | `mat` | Studios, mind and body |
| Spa stones | `spa-stones` | Recovery suite |
| Towel | `towel` | Towel service, lounge |
| Water bottle | `water-bottle` | Day pass, drop-in |
| Shaker | `protein-shaker` | Café, nutrition |
| Whistle | `whistle` | Coaches, personal training |
| Gym bag | `gym-bag` | Membership, guest passes |
| Play structure | `playground` | Kids club |
| Key | `key` | Lockers, member access |
| Schedule | `workout-schedule` | Class schedule, booking |
| Heart-rate watch | `watch-heartbeat` | Progress, visits |
| Sun | `sun` | Outdoor pool, rooftop, early hours |

The last eight (shaker to sun) are service objects: use them for amenities, account and app states (empty
schedule, no guest passes, lockers), not in a hero Rack.

## 4. Compositions

Objects never float alone at random. They sit in one of five compositions.

| Composition | What it is | Use it for |
|---|---|---|
| **The Rack** | Object tiles (rounded squares or discs) in one of eleven layouts (table below). One tile is lit in the accent colour and carries the lead object. | Heroes, section cards, image slots without a photo, OG cards, App Store, iOS welcome |
| **The Set** | Three objects in a row of three cells. | A club's identity, a plan, a short list |
| **The Row** | A line of objects, one for each item, with a label under each. Count matters. | Points about quantity or inclusion ("5 clubs", "what Summit adds") |
| **The Crop** | One object at 2–3× its normal size, cut by one or two frame edges. | Illustrating one point in a section, beside a large figure |
| **The Tile** | One object alone. Bare at 16–48 px. At 64–160 px, in a square tint field with its top-left corner cut at 60° (never a rounded tinted square). | Pictogram use: lists, pickers, empty states |

### Rack layouts for section cards

Pick the layout by what the card says and by the card's shape. Pass the container's real ratio; on phones, pass the
ratio the card has there (a 21:9 desktop card is often 4:3 on a phone).

| Layout | What it looks like | Use it for | Best ratios | Mobbin reference |
|---|---|---|---|---|
| `cluster` | Three tile sizes packed around a large lit tile; the outer tiles fade | "Everything in one place": membership, all clubs | 4:3, 1:1, 16:10 | OpenPhone |
| `orbit` | Discs on three rings around a lit centre; six on the middle ring at 60° | One club or one programme and what surrounds it | 1:1, 4:3 | Linear, Perplexity Health |
| `arc` | Tiles on a rising arc to a lit apex; the ends crop at the lower corners | A range or a choice: class categories, "eight ways to move" | 16:10, 16:9 | Clay |
| `spotlight` | One row of discs that grows toward a lit centre, inside two halo rings | One action or one feature: booking, the app | 21:9, 16:9 (4:3 on phones) | Linear integrations |
| `hub` | A lit centre with spokes at 60° to six discs (eight on wide cards) | What a plan or a space includes | 16:10, 16:9 | Apollo |
| `climb` | Tiles that step up a stair line to a lit summit tile | Progress, plans, "Climb at your own pace" | 16:10, 16:9 | Brand (the peak) |
| `ascent` | Vertical lists of tiles side by side; each list starts half a tile higher than the one before, so the tops step up to a lit tile at the upper right. The lists run off the lower edge and the early ones are faint; the upper left stays clear | Progress through everything the clubs offer: the Home hero | 1:1 to 3:2, 16:9 on phones | Brand (the peak) |
| `stagger` | Two or three rows offset by half a tile, cropped at the sides | Breadth: every club, every class, the app | 21:9, 16:9 | monday.com |
| `frame` | Discs around the edges; the middle 40 % stays clear for a heading | A band or card with the copy set on the graphic | 16:9, 21:9 | Front, Circle |
| `wall` | Even tiles across the frame, cropped evenly | Large heroes and email headers | any | Jasper, Charma |
| `fade` | A grid that fades out from a lit centre | Tall slots: iOS welcome, stories | 4:5, 9:16 | Perplexity Health |

One Rack layout per section. Do not repeat a layout in two neighbouring sections. `frame` is the only layout that
takes copy on top of it; for the others, put the heading and line below or beside the graphic, as the
`/graphics` "Section cards" specimen does.

Rules for all compositions:

- Wall, fade and stagger use one tile size. The other layouts size tiles by position (larger toward the lit
  tile). Gaps between tiles are at least 15 % of a tile. Tile corners use the theme's
  medium radius step (16 % of the tile).
- Objects never touch, overlap or stack on one another (the Stones and Towels objects are single objects).
- The Rack uses 6–12 different objects. It does not repeat an object until all its chosen objects are used.
- A lit tile swaps the colours: the tile takes the accent, the object body takes the field colour.
- A composition chosen for a meaning uses only objects with that meaning (a Dobson Rack shows Dobson's objects
  and the general objects, not Heritage's barbell).

## 5. Colour

| Field | Object tone A | Object tone B | Blocks |
|---|---|---|---|
| Sand `#F6F1E8` | Saguaro Night | Arizona Copper | Caliche, one Copper |
| Saguaro Night `#1C3328` | Sand | Dawn Copper | Night +1 step, one Dawn Copper |
| Arizona Copper `#B5532C` | Sand | Saguaro Night | Copper +1 step |

- These three pairings are the only fields for compositions. Night stays dark in both themes. In dark mode a Sand
  field becomes the dark page tone, objects become Sand and Dawn Copper.
- **Category colour is for the Tile only,** and only beside a class category name. Compositions use brand colours.
- Page proportion: Sand about 60 %, Night about 25 %, Copper about 10 %, category colour about 5 %.

## 6. Meaning maps

### Class categories (Tile)

| Category | Object |
|---|---|
| Strength | Kettlebell |
| Cycle | Spin bike |
| Conditioning | Jump rope |
| Mind & body | Mat |
| Aqua | Water |
| Court | Paddle |
| Recovery | Spa stones |
| Youth | Cone |

### Clubs (Set)

Each club's Set comes from what is real and particular there (seed data, `supabase/seed.sql`).

| Club | Set | Why |
|---|---|---|
| Mesa – Dobson | Pool, Paddle, Spa stones | Flagship: two pools, courts, full recovery suite |
| Mesa – Red Mountain | Stopwatch, Ball, Sneaker | First class at sunrise, six pickleball courts, turf lane |
| Mesa – Downtown | Dumbbell, Spin bike, Water bottle | Compact studio club: racks, cycle studio, in and out |
| Gilbert – Val Vista | Pool, Basketball, Play structure | Swim school, basketball courts, kids club |
| Gilbert – Heritage | Barbell, Squat rack, Mat | Olympic platforms, strength floor, rooftop mobility deck |

The Set shows on the club's card, its page hero (inside a Rack), its map pin callout and its OG card.
Never show a club's Set without the club's name.

### Plans (Row)

| Plan | Row |
|---|---|
| Trailhead | Weight plate, Water (classes and pools at your home club) |
| Ridge | + Paddle, Spin bike (all clubs, courts, classes) |
| Summit | + Spa stones, Towel, Whistle (recovery suite, towel service, PT intro) |

### Service objects (app and account states)

| State | Object |
|---|---|
| No bookings, empty schedule | Schedule |
| Guest passes | Gym bag |
| Lockers, door access, check-in | Key |
| Visits, progress | Heart-rate watch |
| Café, nutrition | Shaker |
| Kids club hours | Play structure |

### Icons on their own

A single object can stand alone as a gym-feature label or a visual accent. The shared section parts take one:

| Part | Prop | Use it for |
|---|---|---|
| `HeroSplit` fact | `fact.icon` | The page's subject beside its one fact (pool, paddle, whistle, spa stones, play structure) |
| `LeadSection` | `icon` | The thing the big figure is about ($20 day pass → water bottle) |
| `StatTile` | `icon` | Each stat's subject (5 clubs → key, 4:30 a.m. → sun) |
| `DenseSection` | `icon` | A table's subject, before the label |
| `SplitSection` | `graphic` | A Rack under the sticky label that pictures the section's point (a hub for "What's in the suite", a climb for "How it works") |
| `PageHead` | `icons` | A Row of what the page covers |
| `CategoryIcon` | — | The category object in the `mono` scheme (text colour, detail at 45 %), inline in chips, badges and table heads |

- Use the `mono` scheme only for icons set inline with text; everywhere else use a brand scheme.
- **Class cards** may use the category scheme: the category object as a Crop on the category tint, because the
  card is that category's content.
- **Coach avatars:** initials on Night with the coach's discipline object as a badge (`coachObjects`), until
  headshots exist.
- **Tour band:** the Night band shows a hub of what a tour includes (the club's Set when the band belongs to a
  club); the Sand band shows a Row of three of those objects above its heading.

## 7. Supporting devices

- **Type as image.** One real fact per view in Archivo 800, at least 3× body size, tabular figures: "82°",
  "6:00 a.m.", "$79". Pair it with a Crop when the section makes one point.
- **Rib meter.** Five upright ribs filled from the left, with a text value. The only place where five ribs mean
  something (busyness, intensity, plan level).
- **The Cut, for real photos only.** When a real hero photo exists, one top corner may be cut at 60° into three ribs,
  facing the text. Never on an object composition.

## 8. Surfaces: where each graphic goes

### Marketing site

| Place | Graphic |
|---|---|
| Home hero | `HomeHero`: one inset Night panel that fills the first screen, with the Night ascent Rack lit on the squat rack. The headline, the line and the copper tour action sit at the upper left; the lists step up on the right, filled with the pool, courts and recovery objects; a row of three facts closes the panel |
| Home clubs | Each club row: the club's Set at 32 px, after the name |
| Home classes | List of categories with Tiles at 32 px |
| Club page hero | Photo of the club; until then a spotlight Rack led by the club's lead object |
| Club page sections | Spaces: a hub per primary space; other amenities: a list with bare objects at 32 px |
| Class pages | Category Tile beside the title; coach photo |
| Membership | Each plan: its Row; the price as type |
| Tour and offer bands | Night field, one Crop at the right edge, one copper action |
| Journal | Editorial photos; when none, a Crop of the article's subject on its category tone |
| 404 and 500 | Sand field, one Crop (a dropped plate, cut by the bottom edge), one line, one link home |
| Link previews | Template A (section 9) |

### Member web app

| Place | Graphic |
|---|---|
| Sign-in | Night Rack panel with the reversed horizontal logo |
| Today | No decoration. Next class time as type; Rib meter for busyness |
| Club header | Photo; until then a short Rack (21:9) of the club's Set. Title below, never on the graphic |
| Class rows, filters | Category Tile at 24–32 px |
| Empty states | Tile of the missing thing at 96 px, one line, one action ("No bookings yet" → Kettlebell) |
| Coaches | Headshot; fallback: initials with the coach's object cropped at the edge |
| Check-in pass | Night strip with a one-row Rack of the home club's Set |

### iOS app

| Place | Graphic |
|---|---|
| App icon | Existing master; alternates: Night, Sand, one-colour copper |
| Launch screen | Plain background colour, no logo (match the first screen) |
| Welcome | Night Rack in the top 55 %, reversed symbol, headline, buttons on the flat Night below |
| Club detail | Photo carousel; until photos exist, one Rack image of the club's Set. Title in the nav bar |
| Class rows | Category Tile at 28 pt; SF Symbols for actions |
| Widgets | Type and Rib meter; a small category Tile in the corner of the medium widget |
| Live Activity | SF Symbol in compact; category Tile in the expanded view |
| Wallet pass | Strip: one-row Rack of the home club's Set on Night |
| Empty states | `ContentUnavailableView` with a Tile |

## 9. Presentation formats

Each format is a template with fixed slots. A designer fills the slots and picks the objects by meaning.

| Template | Size (px) | Slots |
|---|---|---|
| A. Link preview (OG) | 1200 × 630 | Night field; Rack in the right 40 %; page title and one line at left; reversed symbol |
| B. Social feed | 1080 × 1350 | Photo, or a Rack in the top 65 %; one fact as type; symbol bottom right |
| C. Social fact card | 1080 × 1350 | Sand field; one large figure; one line; one Crop at the edge |
| D. Story and reel cover | 1080 × 1920 | Rack top half; title in the lower third, clear of system UI |
| E. App Store screenshot | 1320 × 2868 (6.9-inch) | Sand or Night field; two-line headline; device frame; a Row of 3 objects above the device |
| F. Email header | 1200 × 240 | Night field; horizontal reversed logo left; one-row Rack right |
| G. Wallet strip | Apple's size for the pass style | Night one-row Rack of the club's Set |
| H. Club poster (print) | A2 portrait | Club Rack top third; club name as type; timetable in Inter |

Always use the real logo files. Never type the wordmark.

## 10. Motion

- **Rack fill:** on first view, cells appear in reading order, 40 ms apart, each fading in and settling from 96 % to
  100 % scale over 300 ms (Snappy ease). Once per page load.
- **Crop slide:** the cropped object moves 8 % toward its resting position over 300 ms. Once.
- **Meter change:** one rib at a time, 150 ms each.
- No looping, no bouncing objects, no parallax, no hover lift.
- With reduced motion on, show the final state at once.

## 11. Accessibility

- Compositions and Crops are decorative: `aria-hidden`, `alt=""`, `.accessibilityHidden(true)`.
- A Tile beside a category name is decorative. A Tile alone (a filter chip with no text) needs an accessible name.
- A club Set has meaning only with the club name beside it; the name carries it.
- Objects keep 3 : 1 contrast with their field in both themes (WCAG 2.2, 1.4.11).
- Never put text inside a graphic. Graphics do not scale with Dynamic Type; the layout around them reflows.

## 12. Production

- **Art:** `marketing-site/scripts/import-nucleo-objects.mjs` reads the local Nucleo install (`~/.nucleo/skills`, or
  `NUCLEO_SKILLS_ROOT`) and writes `components/brand/graphics/nucleo-art.ts`. Run `npx biome check --write` after it.
  The icons ship inside the products only; do not publish the source set.
- **Source:** `objects.ts` (labels, meanings and maps), `compose.ts` (Rack, Set, Row, Crop, Tile) and `scheme.ts`
  (colours). The Rack takes the real ratio, an object list and a seed, so each placement is stable.
- **Web:** React components render inline SVG with CSS variables. The web app syncs the folder.
- **iOS:** `node scripts/export-graphics.mjs` (marketing site), then `python3 tools/import-brand-graphics.py`
  (ios). The catalog gets `objects-<id>` and `category-<category>[-cut]` image sets with Any and Dark
  appearances. Draw the Rack in SwiftUI from those images in a `Grid`, so it fills any size.
- **Files:** export objects and template fallbacks only. Do not export compositions for each page; compose at run time.
- **OG images:** `next/og` (`ImageResponse`) with the same compose helpers.
- **Nucleo MCP and skills:** installed for Claude Code (`nucleo-icons`, `nucleo-family`, `nucleo-customize`).
  Use them to find new objects and interface icons.

## 13. Review checklist

- Is there a scene, a room, a building or a person drawn anywhere? Remove it.
- Is every object a Nucleo core glyph at 48 px, with no person, face, building, cactus or mountain?
- Is the object chosen for a meaning that the text beside it states?
- Is there a club Set without the club name, or five equal ribs used as decoration?
- Is category colour used outside a Tile?
- Is there text on a graphic?
- Do the dark-mode and reduced-motion states look right?

## 14. Build order

1. Done (Oct 29): `serialize.ts` escapes titles; all exported SVGs are valid XML.
2. Done (Oct 29): `objects.ts`, `compose.ts`, `scheme.ts`, React components, `/graphics` specimen, object and
   category exports, web app sync. Objects replaced by Nucleo core glyphs; Rack redesigned (wall and cluster);
   iOS catalog has the object and category image sets. Not built yet: the Rack fill motion.
3. Swap the Tiles in for the line pictograms (class lists, filters, empty states) in all three products.
   Marketing Home done (Oct 29): hero cluster, club finder orbit (follows the focused club), class carousel arcs,
   category list with Tiles, plan Rows (also on Membership through `PlanColumns`), club strip Set.
   Marketing club pages done (Oct 29): hero spotlight led by the club's lead object (4:3 on phones), a hub for each
   space (`spaceObjects` in `objects.ts`), the "Also at" amenities as a list with bare objects. `ClubArt` now draws
   an orbit (full) or the lead object on a muted tile (simple), so every club thumbnail on the site (club cards,
   header menu, search, tour and join flows) uses objects.
   All marketing pages done (Oct 29): class and category heroes (orbit, arc), class cards (category Crop), coach
   avatars, kids (climb), aquatics (hub), journal (Crop per article), courts, personal training, recovery,
   membership and the fall offer (SplitSection graphics and icons), about and app (icons), the classes index
   (category Tiles), tour bands. No scene, line pictogram, coach mark or bespoke graphic is left on a site page.
   Member web app done (Oct 29): `ClubArt` and `CoachArt` wrappers, `CategoryIcon`, `EmptyState` objects, sign-in,
   session detail, class rows, welcome, club detail, the check-in pass (see `web-app/BUILD-NOTES.md`).
4. Replace the four scene heroes (marketing Home, marketing club page, web club header, iOS welcome) with Racks.
5. Add club Sets to club cards and map callouts; add plan Rows to Membership.
6. Remove the scene, bespoke and coach-mark sets and their assets.
7. Build OG template A with `next/og`; then the email header, the Wallet strip and the App Store template.
