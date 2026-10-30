# Cactus Peak Athletic marketing site: design review 2

Dev server on port 3112 (now stopped). Viewports: 1440 and 375 on every route group; 768 not re-run on every page (no horizontal overflow found at 375 on any of 28 routes, `scrollWidth` = 375 each time). Skills used: better-interface, make-responsive, web-design-guidelines (the remote rule list was not fetched; the check is by hand). Standard: `DESIGN-DIRECTION.md`. Previous review: `REVIEW-1.md`. Builder claims: `BUILD-NOTES.md` "Review 1 — response".
Opened and read: Home (desktop and mobile), Clubs (ZIP 85297 tested), Dobson, Classes, Mind & Body category, Climb Cycle, Schedule (list, week, panel), Membership, Kids, Aquatics, Recovery, Courts, Coaches, About, Contact, Journal index and an article, Careers index and a job, App, Fall climb offer, search ("pool", "sauna", "85202"), Tour step 1, Classes mega menu. Not opened visually: the other 4 club pages, the other 27 class pages, 7 other coach pages, join steps 2 to 5, legal, FAQ page (height and overflow only).

## Verdict

1. The site is now a clean, honest, left-aligned editorial site. It is no longer the LLM default. About 70 % of REVIEW-1 is fixed and verified (type scale, tables for hours and plans, Home and Classes structure, real article bodies, ZIP distances, spelling).
2. It still reads as one template. Every page is: breadcrumb, left H1 with a photo slot on the right, a tinted band, a 36 px H2 over a hairline list, a tinted band, a Night closer. Nine of twelve Home H2s are 36 px. The bands alternate sand and darker sand like a zebra, so rhythm comes from tint, not from scale or layout.
3. The schedule is still the weakest tool. The week grid is unreadable (class names cut to three letters), `ScheduleRow` columns shift on every Waitlist row, and the class panel close button is invisible (near-black on Night green, about 1.3:1).
4. Photo slots are the new "wireframe": big blank sand or sage rectangles (About 630 x 285, article hero, club gallery) and the same pool-line composition on six slots. They look intentional only when they carry a composition and a caption in the hero.
5. Mobile is too long: Home 13,681 px (target 9,000), Classes 13,179, Schedule 13,716, Dobson 12,770. The cut list is below. Search for "pool" now over-matches (returns all five clubs, two have no pool).

## REVIEW-1 items: verification

Key: Y = verified fixed. P = partly. N = not fixed. Builder status as written in BUILD-NOTES.

| ID | Builder | Verified | Note |
|---|---|---|---|
| S1 chip removed | fixed | Y | No `IMG-` chips anywhere. |
| S1 captions only on large slots | fixed | P | Hero captions are fine. Club gallery thumbs still carry captions ("Swim school, Level 2", "Studio B, Rhythm Ride"). |
| S1 per-subject compositions | fixed | P | Court lines, bike wheels and journal wheel are good. Pool = identical horizontal bands on 6 slots (Home amenities, Dobson hero, gallery, Aquatics x2, article cards). Careers uses a head-and-shoulders silhouette (reads as a missing avatar). App phone slot is a blank green rectangle. |
| S1 radius by size | fixed | Y | 28 hero, 14 large, smaller on tiles. |
| S2 eyebrows removed from section heads | partly | Y | Kept only on heroes and 2 labels. |
| S2 three H2 sizes | partly | P | Measured on Home: 66, 36 x 9, 24 x 1. The 36 px dominates. |
| S2 no two adjacent sections share a layout | partly | P | Layouts differ, but backgrounds alternate strictly plain / tinted on Home (`bg-transparent`, `rgb(239,231,218)` x 4) and every inner page. |
| S2 FAQ then band ending | partly | P | `ClosingRow` is used on Journal, Offer, Coaches (Night band). Others still end FAQ then Night band then Night footer. |
| S3 lede 20/28, H1 96 px | partly | Y | H1 96 px, tracking -3.36 px. Lede is used on Home hero only (1 node at 20 px). Other pages use 16 px grey. |
| S3 12 px removed from content | partly | Y | 3 nodes at 12 px on Home (was 113). But 155 nodes at 14 px: a new flat grey wall. |
| S3 tabular numerals | partly | Y | Plan price 56 px `tabular-nums`. |
| S4 cards to rules | fixed | P | Fixed on Home, Classes, Careers, About, Contact, Coaches, Journal. Not fixed: Aquatics "Four ways to get wet" (4 equal cards), Recovery classes (3 equal cards, identical slots), Kids "Which clubs" (5 white rows), Clubs list (5 bordered cards), Offer plan cards, Courts table inside a white card. |
| S5 chrome merged | fixed | Y | One promo strip (find club, phone, login) plus header. |
| S5 schedule toolbar | fixed | Y | One row: Club, Category, Time segment, Filters, List/Week. |
| S6 fixed tracks | fixed | P | Aligned when a club is chosen (coach x = 861 on all rows). Breaks on "Full · N waiting" rows (see P1-2). |
| S6 one word for intensity | fixed | N | Rows say "Moderate". Class table, category table, class hero, panel and mega menu still say "Light · 2 of 5", "Hard · 4 of 5", wrapping to "Moderate · 3 / of 5". |
| S6 time once per group | fixed | Y | |
| S6 hide class column on class page | fixed | P | Club shown, but the caption still repeats "Climb Cycle · Cycle st…" (truncated) under every club. |
| S6 44 px actions | fixed | Y | |
| S7 focus ring on Night | fixed | Y | Rule at `app/globals.css:291`. Not tested by keyboard. |
| S8 eyebrows muted | fixed | Y | |
| S9 ZIP distances | fixed | Y | 85297 gives Val Vista 4.0 mi, Heritage 5.8, Dobson 10.2, Downtown 10.7; list re-sorts. |
| S9 search facts | fixed | N | "pool" now returns all 5 clubs. Downtown and Heritage have no pool. "sauna" is right (4 clubs). "85202" is right. Header says "1 results". |
| S9 journal bodies | fixed | Y | Article has its own 5 sections. |
| S9 spelling | fixed | Y | No British spellings left in `app`, `lib`, `components`. |
| Shell: Clubs mega menu | fixed | not opened | Classes menu opened: tint squares gone, counts shown. |
| Shell: Left/Right keys | not fixed | N | |
| Home hero bleeding photo | fixed | N | Photo ends at x = 1408 of 1440 (32 px short of the edge) with all four corners round. It neither bleeds nor sits in the grid. |
| Home trust row one line | fixed | Y | |
| Home finder as rows | fixed | P | Rows, one photo. On mobile it is 1,712 px. |
| Home amenities as table | fixed | Y | |
| Home category rail as text index | fixed | Y | Same index repeats on `/classes` (twice on one page). |
| Home plans as columns | fixed | Y | |
| Home mobile height | partly | N | 13,681 px (was 14,200). |
| Clubs ZIP table, sort | fixed | Y | |
| Clubs map labels (US 60, canal) | fixed | N | The brown diagonal and blue curve have no labels. Map is 1,150 px tall for 5 pins. |
| Clubs list density | fixed | P | Cards again, five filled copper "Tour this club" buttons in one column. |
| Compare table single dash | fixed | N | `YesNo` still renders icon + dash (`components/brand/atoms.tsx:56`), seen as "— —" in the Membership table. |
| Club detail H1 first, 21:9 band | fixed | Y | |
| Club detail popular here, other clubs | fixed | Y | |
| Classes grouped table | fixed | Y | Good. Intensity format still mixed (see S6). |
| Class page "Try it free" primary | fixed | Y | |
| Class page "Five clubs" as list | fixed | Y | Duplicates "When it runs" directly above it. |
| Recovery range label | not fixed | N | "Easy · 1 of 5" on Recovery. |
| Schedule week grid | fixed, not rechecked | N | Unreadable. |
| Schedule panel filled "Book in the app" | fixed | Y | Good. But close button is invisible, and the panel says "Open" under Spots. |
| Schedule mobile intensity and spots | fixed | Y | |
| Schedule count wording | fixed | Y | "95 classes today". |
| Membership | fixed | Y | New H1, calculator on one line. |
| Join guards, payment, tour step 1 | fixed | not retested | Tour step 1 opens with stacked clubs and a 14-day strip. |
| Kids | fixed | P | Programs table good. Hours strip wraps badly, "Which clubs" are cards, H1 still "Train. The kids are fine." |
| Aquatics | fixed | P | Pools table is the best block on the site. Cards below it are not fixed. |
| Courts | fixed | Y | Distinct court-line slot. H1 breaks "Play more / than / you plan." |
| Recovery | fixed | P | By-club table is good. "What's in the suite" is 4 icon columns; classes are 3 cards. |
| PT | fixed | not opened | |
| Coaches index, profile | fixed | Y | List of 8, no photos at all (see P1-9). |
| About | fixed | P | Values are plain lines. Hero slot is a blank 630 x 285. Story band is indented 44 px from the page edge. Two vertical gaps of about 90 px. |
| Contact | fixed | Y | Best page on the site. |
| Journal index | fixed | Y | Date column plus 24 px titles is the right editorial pattern. Featured post shows no date. |
| Journal article | fixed | Y | |
| Offer | fixed | P | Plain terms are good. Slot removed. The three plan cards repeat a fourth time. |
| Careers | fixed | P | Perks are 3 plain lines. Hero silhouette is a placeholder tell. |
| App | fixed | P | Numbered lines good. Phone slot is a plain green box; QR is a 40 px square with text. |
| FAQ, 404, legal | fixed | not opened visually | FAQ height 3,045 px mobile, no overflow. |
| A11y: 44 px targets | fixed | P | Buttons are 44. Mobile `tgt<40` counts: Courts 8, Coaches 9, Careers 7, Classes 9, Dobson 8 (mostly text links in table rows and chips). |
| A11y: heading jumps | fixed | Y | |
| 500 page without header | not fixed | N | Not retested. |

## Page length on mobile (375 px)

| Route | Now | Target | Where the height is |
|---|---|---|---|
| Home | 13,681 | 9,000 | finder 1,712; plans 1,657; teaser 1,352; categories 1,239; testimonials 986; amenities 845; FAQ 800 |
| Classes | 13,179 | 8,000 | 28 two-line rows, plus the 8-category index and a 5-column intensity guide on top |
| Schedule | 13,716 | list only | long by nature; see P2-4 |
| Dobson | 12,770 | 8,500 | amenities 1,975; plans 1,535; hours 1,381; classes 1,333; gallery 759 |
| Kids | 9,307 | 6,500 | |
| Aquatics | 7,851 | 5,500 | |

Cut list for Home (about 4,700 px):
1. Finder (saves about 800 px): remove the 6 filter chips on mobile. Remove the full-width "Tour this club" button on each row; keep a text link "Tour" at 44 px. Row = name, one line of facts, status. 5 rows x 120 px.
2. Amenities table (saves 845 px): delete from Home. It repeats the finder chips and `/clubs`. Put one line under the finder: "Pools at 3 clubs, courts at 3, recovery at 4, kids club at 3."
3. Category index (saves about 700 px): on mobile show name and class count only, in two columns, 56 px rows. Drop the blurb, intensity range and class list (they are on `/classes`).
4. Schedule teaser (saves about 500 px): show 4 rows, not 8. Move "First time? Try the class free" to one text line under the list.
5. Plans (saves about 900 px): on mobile show three rows (name, price, one line, "Join" link) with a single "Compare plans" link. Keep the full columns at `md`.
6. Testimonials (saves 450 px): show 2 quotes on mobile, not 4.
7. Tour timeline plus Tour band (saves about 450 px): merge into one block. The timeline already says "Book a free tour". The Night band right after the FAQ repeats it.
8. Footer (saves about 600 px): collapse "Clubs" and "Hours at every club" into two `<details>` on mobile.
9. Coaches strip (saves 350 px): show 2 of 4, link "Meet all 8".

Apply the same rules to Dobson: collapse Amenities to the list-only view with the sticky left list removed on mobile, collapse Hours to today plus a `<details>` for the week, and show the plans as one line ("From $54 a month. Compare plans").

## New issues

### P0 (broken, invisible or wrong)

**P0-1. Class panel close button is invisible.**
Route: `/schedule`, any class opened (also anywhere `OverlayPopup` is used on a dark header).
File: `components/ui/overlay.tsx:29`, `components/sections/schedule-board.tsx:181-200`.
What: `D.Close` has no colour class. It computes `rgb(29,27,23)` on the Night header `rgb(28,51,40)`: about 1.3:1. The 44 px target exists but cannot be seen. A mouse user has no visible way to close it.
Fix: `D.Close className="… text-foreground"` by default; in `ClassPanel` pass `closeClassName="text-night-foreground hover:bg-night-foreground/10"` through `OverlayPopup`, or move the close button out of the Night block into the white body. Also add `hideClose={false}` focus ring check on Night (S7 rule covers it).

**P0-2. Week grid is unreadable.**
Route: `/schedule` with a club selected and Week on. File: `components/sections/schedule-board.tsx:150-170` (`MAXLANES = 3`, `grid-cols-[64px_repeat(7,minmax(168px,1fr))]`, `min-w-[1260px]`).
What: each class sits in a lane about 36 px wide, so names show as "Lap…", "Cli…", "Rib…", "Kid…". Events overlap vertically. The 7th day (Mon) is cut at 1440 with no scroll cue. This is the same defect REVIEW-1 called P0; the builder said "fixed, not re-checked".
Exact fix: replace the lane layout with a real table. Rows = start hour buckets (6, 7, 8 … 20), columns = 7 days (`minmax(0,1fr)`, no min width at `xl`). Each cell lists its classes as stacked one-line text rows, `time + name`, 13 px, category colour bar 2 px at left: `6:00 Lap Swim`. Cell shows 3 rows and `+2 more` which sets the day strip to that day. No absolute positioning, no lanes. Header row shows `Tue 27` and the class count. Below `xl` hide the week toggle and say "Week view needs a wider screen" in text. This table also prints well.

**P0-3. Search for "pool" returns clubs that have no pool.**
Route: `/search?q=pool` and the search dialog. File: the club document builder in `components/sections/search-results.tsx` (search index).
What: Dobson, Red Mountain, Downtown, Val Vista, Heritage all match. Downtown and Heritage have `has.pool = false`. Probably the index text includes the shared "Pools close 30 minutes before the club" line or the page-level hours text. Header also says "1 results".
Fix: build each club document only from `club.has` flags, `amenities`, `signature` and `intro`; keep the shared hours sentence out of the index. Add `n === 1 ? "1 result" : "n results"`. Test list: pool must give Dobson, Red Mountain, Val Vista; courts: Dobson, Red Mountain, Val Vista; kids: Dobson, Red Mountain, Val Vista; sauna: 4 clubs (already right).

### P1 (strong template tell, spec miss, or large usability cost)

**P1-1. Section rhythm is still tint-zebra plus 36 px H2.**
All pages. Files: `components/sections/common.tsx:13` (`Band`), `components/brand/atoms.tsx:60` (`SectionHead`).
Pattern: plain band, tinted band, plain band, tinted band; every H2 is 36 px, left, over a hairline list. It is calmer than REVIEW-1 but it is the same recipe, not editorial.
Replace with a page-level rhythm of four section types and use each at most once per page:
1. Lead moment: H2 at 66 px (`display-lead`), 5/12 columns, a single number or fact in the right 7/12 (for example "136 classes this week at Dobson" at 120 px tabular).
2. Dense table: no H2 at all, only a 24 px quiet label and a full-bleed top rule. Tables and lists carry themselves.
3. Split: 4/8 with a sticky 24 px label on the left and rows on the right (use it for Amenities, Hours, Plans detail).
4. Quiet text: 16/26 paragraph at 62 ch, no band.
Remove `tone="muted"` from every second section. Use tint only for one band per page (the one that matters), and use whitespace (96 px vs 48 px) and a 1 px rule for the rest. On Home: the finder is the lead moment (66 px), the teaser is the dense table, "Kids club, 8 a.m. to 8 p.m." is the split, plans are one full-bleed table with a 56 px price, testimonials are quiet text.

**P1-2. `ScheduleRow` misaligns on every Waitlist row and wastes 500 px.**
Routes: `/schedule` (All clubs), `/classes/[slug]`, `/classes/category/[category]`, Home teaser, club pages. File: `components/brand/class-parts.tsx:87`.
What: each `<li>` is its own grid; the last track is `auto`. The "Waitlist" button is wider than "Book", so that row's other columns shift left by 6 to 10 px (seen: coach x differs by 6 px, ribs by 7 px on Climb Cycle, Mat Pilates). "Full · 2 waiting" is wider than its 100 px track and pushes into the coach column. "4 spots left" wraps to two lines at 1440. At 1440 the class column is 1fr (about 540 px), so the eye travels 540 px from "Lap Swim" to "Luis O."
Fix: set the last track to a fixed `104px` and give both buttons `w-full`. Set the spots track to `148px`, `whitespace-nowrap`, text "Full · 2 waiting" at 14 px. Cap the class track: `minmax(0,320px)` then `1fr` empty spacer, or move coach and intensity left and right-align only the action. Better: use `grid-template-columns: subgrid` from a parent `<ul>` so all rows share tracks. In the narrow `@container` layout keep the 3-track form.

**P1-3. Intensity words are still two formats.**
Files: `components/brand/meters.tsx:44-45`, `components/sections/classes-client.tsx`, `components/site/header.tsx` (Next up card), `ClassPanel`, class hero, category table.
What: `IntensityRibs` already has a `wordOnly` prop, but the class table, category table, class hero, panel and mega menu do not pass it. They show "Hard · 4 of 5", "Light · 2 of 5", or a wrapped "Moderate · 3 / of 5". Rows show "Moderate". Recovery shows "Easy · 1 of 5" next to "Easy to light" elsewhere.
Fix: make `wordOnly` the default; keep "n of 5" only in `sr-only`. In one table the Intensity column must use `whitespace-nowrap`, one word or "Light to moderate". Do this in `meters.tsx` so that it applies everywhere.

**P1-4. Hero photo neither bleeds nor aligns.**
Home, Kids, Aquatics, Recovery, Courts, App. File: `components/sections/common.tsx:150` (`HeroSplit`).
What: Home photo spans x 843 to 1408 on a 1440 screen, a 32 px strip of sand to its right, all corners round at 28 px. Kids, Aquatics, Recovery and Courts bleed to the right edge with square right corners and round left corners. Careers and Climb Cycle keep it inside the grid. Five different hero treatments, no system.
Fix: one rule. Home and club heroes: the photo bleeds to the viewport edge (`margin-right: calc(50% - 50vw)`, no right radius, 28 px left radius), 5/12 columns, `aspect-[4/5]` capped at `max-h-[78vh]`. All other pages: no photo in the hero; H1 on 7 columns and one fact on 5 columns (for example Aquatics: "3 pools · 25 yd · 80–82 °F"). Use the slot lower on the page where it explains something.

**P1-5. Photo slots are big, blank and repeated.**
Files: `components/brand/atoms.tsx` (`PhotoSlot`), pages below.
What: About hero is 630 x 285 px of two tan bands (nothing inside). Article hero is the same. Club gallery has 5 slots plus a hero slot on Dobson back to back. Class page has the same bike-wheel slot twice within 400 px (hero and "What to expect"). Aquatics repeats the same pool lines 3 times. Recovery has three identical purple slots in a row.
Fix: (1) At most 2 slots per page; delete the second bike slot, the Recovery card slots and the About hero. (2) Give each club its own composition in `club.tone`: Dobson = pool lanes; Red Mountain = skyline and ridge line; Downtown = brick grid; Val Vista = splash pad circles; Heritage = rooftop horizon with one rail. (3) Article hero cap at `aspect-[21/9]` and 960 px. (4) Replace the Careers silhouette with a plain Night block with the text "Front desk, 5:50 a.m." in the caption position. (5) On `/app` draw a CSS phone (rounded 36 px, 9:19.5) with a miniature of 4 real schedule rows from `sessions.ts`; this is the page's proof.

**P1-6. Aquatics and Recovery still use equal cards.**
Files: `app/(site)/aquatics/page.tsx:44` ("Four ways to get wet."), `app/(site)/recovery/page.tsx:34` ("Recovery classes.").
What: 4 and 3 identical white cards: slot, Aqua tag, title, 2 lines, meta, "Good for first-timers", "Pick this if…". This is the S4 pattern the builder marked fixed.
Fix: use the same grouped table as `/classes` (class, length, intensity word, first-timer, next session). Keep the "Pick this if…" sentence as the second line of the class cell; it is the best copy on the page. Heading: "Four swim classes." (the current "get wet" is the only jokey line on the site). For Recovery also replace the four icon columns in "What's in the suite" with a 4-row definition list (Sauna: 10 to 15 minutes, dry heat; Cold plunge: 1 to 3 minutes; Compression: 20 minutes; Stretch area).

**P1-7. Clubs index brings back five filled buttons and a 1,150 px map.**
Route: `/clubs`. File: `components/sections/clubs-client.tsx`, `components/brand/club-map.tsx`.
What: five bordered cards each with a filled "Tour this club" and a link "See club". The page's one primary action is repeated 5 times. Map is 1,150 px tall for 5 pins; US 60 and canal labels are missing; the map is empty road grid.
Fix: rows with a hairline (no card border). One text link "Tour" and one "See club" at 44 px. One filled button on the page (ZIP "Find"). Cap the map at `h-[560px] sticky top-24`. Label the diagonal "US 60" and the blue curve "Consolidated Canal" at 10 px caps along the path.

**P1-8. Kids hours strip wraps and "Which clubs" is a card list.**
Route: `/kids`. File: `app/(site)/kids/page.tsx:31-37`.
What: "10:00 a.m.–12:00 p.m." wraps to four lines; "8:00–10:00 a.m." to two; columns are uneven heights. "Which clubs": five white rounded rows with a thumbnail, an arrow and a Yes/No; arrows are not aligned (x differs by 11 px between rows).
Fix: print blocks as `8–10 a.m.`, `10 a.m.–12 p.m.`, `4–6 p.m.`, `6–8 p.m.` with `whitespace-nowrap`, `font-data text-h3 tabular`. Replace "Which clubs" with a 5-row table: club, kids club (a filled dot or empty cell), hours. Drop the thumbnails. Change H1 "Train. The kids are fine." to a fact: "Kids club, 6 months to 12 years." (the Home H2 already uses the same fact; use "Kids club, for the whole workout." only if a joke is wanted).

**P1-9. Coaches have no faces and no weight.**
Routes: `/coaches`, `/coaches/[slug]`, class panel, schedule rows. File: `components/sections/coaches-client.tsx`.
What: eight coaches as plain text rows. DESIGN-DIRECTION says "each class has a coach face". A coach monogram circle (`LO`, `MV`) exists in rows but not on the index.
Fix: add a 72 px monogram portrait (category colour tint, initials in Archivo 800) at the left of each row on `/coaches`; on the profile, a 4/12 portrait slot with a 2-tone head-and-shoulders. Add "Teaches: Mon, Wed 6:00 a.m. at Heritage" (from `sessions.ts`) to the row. A coach row then carries a real fact.

**P1-10. Night closing band, then Night footer, with a sand gap.**
Routes: Coaches, Contact, Careers, Aquatics, Kids, others with `ClosingRow` or `TourCTABand` above the footer. File: `app/(site)/layout.tsx` (main bottom padding) and `components/sections/common.tsx:39,61`.
What: on Coaches a 330 px Night band, then 110 px of empty sand, then the 700 px Night footer. On Contact there is an empty 56 px strip after the form band. Two heavy dark blocks in 1,100 px read as a mistake.
Fix: remove the bottom padding of `main` (`pb-0`). If the last section is a Night band, the footer gets `border-t border-night-foreground/15` and no gap; better, use `ClosingRow` (sand, one rule, one button) on every page except Home, so Night appears only once, in the footer.

**P1-11. Mobile height and chrome (see the cut list).**
Also: promo strip wraps to 2 lines on mobile with an orphan "30." and sits above a "Find your club" bar and the header: 160 px of chrome before the H1. Fix: one-line promo at 14 px ("$0 enrollment through Nov 30 · Join now"), dismissible, 40 px; remove the separate "Find your club" bar on mobile and put the club name in the header next to the search icon. The fixed bottom action bar (72 px, "Book a free tour / Join") repeats the hero buttons; show it only after the hero has left the screen and hide it on `/tour`, `/join/*`, `/trial` and when a form field has focus.

**P1-12. About: broken left edge and dead space.**
Route: `/about`. File: `app/(site)/about/page.tsx`.
What: H1 and values start at x = 84; "Our story" and the year list are inset to x = 138 in a narrower container. About 90 px dead gaps above and below the Rib Peak band. Values "Steady. Welcoming. Capable." is a three-word slogan set in three equal columns.
Fix: put Our story in the same container as the H1: story paragraph 5/12, year list 7/12 with the year at 56 px tabular. Delete "Steady/Welcoming/Capable" as a separate row; fold it into one sentence in the story. Reduce the hero slot to 21:9 and 960 px.

**P1-13. Category page repeats its own sentence and has no label for "Val Vista".**
Route: `/classes/category/[category]`. File: `lib/data/categories.ts`, category page.
What: lede "Four slow classes for joints, breath and a steady head." and the H2 "Four slow classes for joints and breath." say the same thing 300 px apart. The table column says "Next, Val Vista" with no reason (it is the default club).
Fix: delete the H2 and let the table follow the lede with a 24 px quiet label "Classes". Rename the column "Next at {club}" and show a club select above the table when `cpa_club` is not set.

**P1-14. Membership table: "— —" and mismatched header cell.**
Route: `/membership` and the club compare table. Files: `components/brand/atoms.tsx:56` (`YesNo`), `components/brand/plan-parts.tsx`.
What: `YesNo` renders `<Minus/>` + "No" text or dash; in the table it shows two dashes. The header cell for "What you get" is white while its column cells are sand.
Fix: in tables pass `variant="cell"`: yes = a 8 px filled dot (and `sr-only` "Yes"), no = empty cell with `sr-only` "No". Make the first header cell transparent. Remove the white card behind the table.

**P1-15. Courts H1 rag.**
Route: `/courts`. File: `app/(site)/courts/page.tsx:22`.
What: "Play more / than / you plan." The word "than" sits alone.
Fix: `text-wrap: balance` on all H1s in `.display-lead`, and `max-w-[11ch]` on that H1 so it breaks "Play more than / you plan."

### P2 (polish)

**P2-1. Schedule list: ranges and labels.** `/schedule`: the heading "95 classes today" repeats the day chip "Today 95 classes" directly above it; delete the line and keep "Members book 7 days ahead. Summit: 9." Make the panel Spots line say "Plenty" (or hide it) when more than 5 spots are left; "Open" tells nothing. File: `schedule-board.tsx` panel.

**P2-2. Class page: "Five clubs, one class" duplicates "When it runs".** `/classes/[slug]`: remove the list (the club select above "When it runs" does the same job), or fold the next time per club into the select options. Hero facts row still has a stray 8 px glyph left of the "Level" value; delete it.

**P2-3. Journal.** Featured post has no date; add it. Article body 16/24 is small for long reading: 18/30 at 62 ch. The article hero slot is 630 x 285 of nothing; cap at 21:9. The in-article "Try a class free" card interrupts step 3 of a 5-step list; move it after step 5.

**P2-4. Schedule on mobile (13,716 px).** The list is fine but each row repeats a 68 x 44 outlined "Book" button. Make the whole row one tappable `<a>` and show a button only for "Waitlist" or "Full". Saves about 3,000 px of outlines and lets the list scan as a timetable.

**P2-5. Tour step 1.** Form column is 650 px on the left with 560 px empty on the right at 1440. Put the "Your tour" summary there from step 1, as REVIEW-1 asked (not seen in this state; builder says fixed).

**P2-6. Mega menu.** Wide panel with large empty areas; "Early birds, before 7 a.m." wraps to two lines. Keep one line: "Before 7 a.m." Left/Right keys still missing (known).

**P2-7. Motion.** Only the mega menu fades (about 150 ms). Good. Do not add scroll fades. The page transition on schedule day change should be none.

**P2-8. 14 px grey wall.** 155 text nodes at 14 px on Home. Set secondary text to `--foreground` at 70 % weight 400 only where it is metadata; set club blurbs, FAQ answers, plan bullets and "Pick this if…" sentences to 16 px. It cuts the "grey on sand" feel more than any layout change.

**P2-9. Footer.** The line "Fictional brand made for a university project." is fine but sits 14 px under the legal links; give it its own row.

**P2-10. Offer page.** Replace the three plan cards (4th repeat on the site) with a three-row table (plan, price, "Join") and keep the "Still deciding?" row.

## Template tells still present (patterns and replacements)

| Pattern | Where | Replacement |
|---|---|---|
| Left H1 + right photo hero | Home, Kids, Aquatics, Recovery, Courts, Careers, Class, Category, App | One hero with a photo (Home). Elsewhere the H1 spans 7 columns and a single fact fills the right 5 at 120 px tabular ("18 courts", "3 pools", "4:30 a.m."). |
| Zebra bands (plain, tint, plain, tint) | all pages | One tinted band per page. Use 96 px / 48 px spacing and rules. |
| Same 36 px H2 over a rule | all pages | 66 px lead, none on tables (24 px quiet label), 36 px only for splits. |
| Equal cards | Aquatics, Recovery, Offer, Clubs list, Kids clubs | Grouped tables with a rule between rows. Cards only for a club, a plan, a slot. |
| Outlined button repeated per row | Schedule, Careers (7 Apply), Courts (3), Coaches (8) | Text link with 44 px target; fill only the one primary. |
| Closing Night band + Night footer | most pages | `ClosingRow` on sand; Night only in the footer (and the Home tour band). |
| 3-word slogans | About values ("Steady. Welcoming. Capable."), About symbol ("Five ribs. One peak."), Kids H1, Aquatics H2 | One plain sentence with a fact. |
| Blank photo slots | About, article, gallery | A composition, a caption, max 2 per page. |
| Check-mark lists (3 in a row) | plan bullets, Membership, Offer | Keep on plans (they compare). Remove the check icons on prose lists (Kids "How kids club works", Job "What you will do"): use rules. |
| Rounded white cards in a tinted band | Contact form, Courts table | Open table with top and bottom rule; form fields with no card. |

## Keep (do not undo)

- The brand layer: Archivo wide at 800 weight, Inter body, Sand page, copper for the one primary action, Rib Peak and RibMeter, IntensityRibs, BusynessMeter.
- Home: H1 at 96 px, left-aligned, three lines. Rows for the finder with a club-colour bar. The category text index with colour bars. Plans as three columns with a 56 px tabular price.
- Pools-by-club table on `/aquatics`; By-club table on `/recovery`; Courts table, "Courts open today" grid, "Four ways to play" list with durations.
- `/contact` as a whole: the five-row club table with tabular phone numbers, "Talk to a person.", one filled button.
- `/classes` grouped table (category row, class, length, intensity, first-timer, next session, clubs) and the "Pick this if…" lines on category pages.
- `/journal` index (date, category, title, dek, author) and real article bodies.
- Schedule panel: Night header with the 6:00 a.m. time at 40 px and the filled "Book in the app". Fix only the close button.
- Dobson page: H1 first, status line, 21:9 band, quick facts as big numerals (68,000 sq ft, 25 yd, 6 courts, 4:30 a.m.), "Popular here" as a plain list.
- ZIP lookup with correct distances and re-sorting; search "sauna" and "85202".
- Copy: "Climb at your own pace." "Come see one. It's free." "Talk to a person." "Help people climb." "That page took a rest day." "Reserve a lane in a 45-minute slot." No hype words found in `app`, `lib`, `components`.
- No scroll fades, no hover lift, no gradients, no glass, no emoji, no horizontal overflow at 375 px.

## Suggested order of work

1. P0-1 (close button, 5 min), P0-3 (search), P0-2 (week table).
2. P1-2 and P1-3 (`ScheduleRow` tracks, `wordOnly` default): one pass fixes 6 pages.
3. P1-4, P1-5, P1-10 (hero rule, slot rules, closing band): one component each.
4. P1-11 plus the Home cut list: mobile length.
5. P1-1 (rhythm): apply to Home first, then Aquatics, Recovery, Kids.
6. P1-6, P1-7, P1-8, P1-9, P1-12 to P1-15.
7. P2 items.
