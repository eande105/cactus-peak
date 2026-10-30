# Cactus Peak Athletic marketing site: design review 1

Reviewed on a dev server at port 3111 (now stopped). Viewports: 1440, 768 and 375. Skills used: better-interface, web-design-guidelines, make-responsive. Standard: `DESIGN-DIRECTION.md`, `cactus-peak-specs/marketing-site/01..05`, `00-foundation.md`, `01-shared-brand-components*.md`.
Scope: every route in BUILD-NOTES.md was opened or fetched. Closely examined: Home, Clubs, 2 club pages, Classes, 1 category, Climb Cycle, Schedule (list, week, panel), Membership, Tour flow (all 3 steps, error, confirmation), Trial, Join plan and payment, Kids, Aquatics, Courts, Coaches (index and profile), Journal (index and 1 article), Offer, Careers, App, Legal, search dialog, both mega menus, mobile drawer, 404.
Not verified: Join steps 2 to 4 filled in, payment decline state, `/join/confirmed`, `/trial/confirmed`, club switcher dialog, cookie switches, screen reader output, `error.tsx` (500).

## Verdict

1. This is a clean, competent template site. It does not yet look designer-made. Typography is good. Everything else is the default LLM shape.
2. Every section opens with a 12 px eyebrow, a 36 px H2 and a block of equal white cards or photo tiles. The 36 px H2 never changes size. Almost all text is 12 or 14 px.
3. Real photos are absent, so 25 photo slots on Home and 15 on a club page read as a wireframe. The shot-ID chips on every slot are the main cause.
4. The core tool (the timetable) is the weakest page: misaligned columns, overlapping text, a 310 px sticky filter stack, an unreadable week grid.
5. Distance, search, intensity and journal data contain wrong facts. Fix these before any visual polish. Distance: ZIP lookup. Search: "pool" returns 1 of 3 pool clubs. Intensity: two values for one session. Journal: all 6 articles share one body.

---

## Systemic issues (fix once, fixes many)

### S1. Photo slots look like a wireframe, and all look the same
- Where: `components/brand/atoms.tsx` `PhotoSlot`. Seen on all pages (Home 25 slots, club page 15, `/classes` 20).
- What: a dark chip `IMG-HOME-HERO · 4:5` sits on every slot. The Rib Peak watermark, the horizon band and a flat tint repeat 25 times on one page. The category tiles, coach headshots and class cards put the chip on top of the text overlay.
- Why it matters: the page looks unfinished. The five clubs, eight categories and eight coaches do not look different from each other. Only the tint changes.
- Fix:
  1. Remove the chip from the slot. Add a prop `showId` that is false unless `?slots=1` is in the URL (or `NEXT_PUBLIC_SHOW_SLOT_IDS`). Keep the brief as `figcaption` only on large slots (hero, club hero, gallery lead). Hide captions on thumbnails, coaches and category tiles.
  2. Drop the watermark from every slot except the hero of each page. Elsewhere use a plain duotone fill.
  3. Give each slot type its own composition, so that clubs and classes are distinct: pool = 3 to 5 horizontal water lines at 8 % darker steps; courts = a thin court-line rectangle; cycle = a circle pair (wheels) at 12 % opacity; strength = one vertical bar; coach = a head and shoulders shape in two tones. Use the category colour for classes and a per-club colour for clubs (already in `club.tone`).
  4. Radius by size: 28 px for the home hero only, 14 px for large slots, 8 px for tiles, 4 px for thumbs. Today `rounded-2xl` (28) is the default for everything.

### S2. Every section uses the same recipe
- Where: all pages. Home has 22 `.eyebrow` elements; every section is eyebrow, H2 36 px, content. Each inner page ends with the same stack: muted band, FAQ ("X questions."), Night tour band.
- Why it matters: nothing leads. A visitor cannot tell which section matters. This is the "same section rhythm repeated" item from the Avoid list.
- Fix:
  1. Use an eyebrow on at most 3 sections per page (hero, one data section, one feature). Delete the eyebrow on Classes, Coaches, Members, Questions, Membership, This week, Five clubs on Home.
  2. Use 3 H2 sizes, not 1. Lead section: `clamp(2.5rem, 5vw, 4.5rem)` Archivo wdth 112, line height 0.98, tracking -0.03em. Normal: 36/40. Quiet utility sections (FAQ, hours, legal notes): 24/30.
  3. Vary section padding: 96 px for lead sections, 48 px for dense lists, 0 px (a full-bleed band with a hairline) for tables.
  4. Make no two adjacent sections use the same layout. On Home today: 3 consecutive "heading left, content right" splits (Families, Testimonials, Tour, FAQ).

### S3. Type scale is too small and too flat
- Where: `app/globals.css` text tokens. Measured on Home: 113 text nodes at 12 px, 115 at 14 px, 13 at 16 px, 20 at 24 px. The H1 is 56 px.
- Why it matters: schedule rows, club addresses, hours, meta lines and captions are all 12 px. A visitor on a phone in the sun cannot read them. There is no 18 or 20 px size, so lede text and body text look the same.
- Fix:
  1. Body is 16 px, never 14 px, in content (club blurbs, FAQ answers, plan bullets). Keep 14 px only for table cells and metadata. Never use 12 px for anything a visitor must read (`text-detail` stays for ID tags and legal fine print only).
  2. Add a 20/28 "lede" role for the first paragraph under H1 (the spec says no 18 px; 20 px is not 18 px, and the spec's own hero needs a lede).
  3. Hero H1: 96/92 px at 1440, `clamp(3rem, 8vw, 6rem)`. The spec says `xxl` 48/52, but a 56 px H1 in a 1200 px column looks timid. Use `font-display-wide` with `-0.035em` tracking. Keep it to 3 lines.
  4. Use `font-variant-numeric: tabular-nums` on all prices, times, counts (already on `.tabular`; also apply to the plan prices `$54 $79 $129` and to `68,000 sq ft`).

### S4. Cards and tiles carry structure that rules and alignment should carry
- Where: Home Plans, Amenities, Coaches; `/classes` all-classes grid (28 identical cards), intensity guide (5 equal white cards), `/kids` age groups, `/careers` perks, `/about` values, `/app` features, club "Popular here" list, "Other clubs near you".
- Why it matters: these are the "equal cards with icon in tinted round" and "everything in a rounded card" defects.
- Fix, per object:
  - Icon-in-circle trios (`bento.tsx`, `/about` values, `/careers` perks, `/app` features, classes mega menu): delete the circle and the icon. Use a 24 px Archivo 700 number or the word itself with a 2 px top rule (`border-t-2 border-foreground pt-3`), as `/about` "Who runs it" and `/membership` "Just visiting" already do. Those two are the right pattern.
  - 28 class cards: replace with one table per category (see Classes below).
  - Intensity guide: one row of 5 columns divided by hairlines; rib glyph at 48 px; no card.
  - Keep cards only for objects the visitor picks: club, plan, slot, class panel, form.

### S5. Sticky stack and chrome eat the first screen
- Where: `components/site/header.tsx`; `components/sections/schedule-board.tsx:102,132`; `clubs-client.tsx:38`.
- What: three bars before content on desktop (promo 40 px, utility 40 px, header 64 px = 144 px). On `/schedule` the pinned stack is 64 + 214 + 32 = 310 px of a 900 px viewport. The time-band heading is `sticky lg:top-48` (192 px) but the filter box ends at 278 px, so the heading sits under the filter and is hidden.
- Fix:
  1. Merge the utility bar into the footer; keep the phone number in the header at `xl` only. Keep the promo bar (one line, dismissible).
  2. Schedule filters: one 56 px toolbar (Club select, Category select, "Time" segmented control, "Filters" button opening a popover for intensity, coach, first-timer, spots). Sticky height must be 56 px. Time-band headings use `top-[120px]` (header 64 + toolbar 56).

### S6. Overlapping and misaligned text in `ScheduleRow`
- Where: `components/brand/class-parts.tsx:69-92`. Seen on Home teaser, club page, class page ("When it runs"), `/schedule`.
- What: the row is its own grid per `<li>` with `fr` tracks, so columns do not line up between rows (instructor chip starts at a different x in each row). `IntensityRibs` has `whitespace-nowrap` and spills into the next track, so "Hard · 4 of 5" runs into "Open" ("Hard · 4 of 5Open" on the class page). In narrow containers ("When it runs", club page at `lg`) the coach name and the club name wrap to two lines and "2 on the waitlist" overlaps the next cell.
- Fix:
  1. Use fixed tracks, the same in every row: `grid-cols-[88px_minmax(0,1fr)_120px_132px_104px_auto]` (time, class, coach, intensity, spots, action). Build the list as a CSS grid with `subgrid`, or as a real `<table>`.
  2. Intensity cell: ribs plus one word ("Hard"). Drop "· 4 of 5" (the rib count already says it; it stays in the `sr-only` text).
  3. Spots cell: empty when more than 5 are left. Remove the grey "Open" text; it says nothing. Show "Full · 3 waiting" on one line.
  4. Pick the layout by container width, not viewport: put `@container` on the list wrapper; below 640 px of container width, hide the coach column and keep the rest. This fixes the class page and club page where the list sits in a 2/3 column.
  5. Hide the class name column on `/classes/[slug]` (every row says "Climb Cycle"). Show the club instead.
  6. Group rows that start at the same time: print the time once on the first row (blank on the next rows) with a hairline between groups.
  7. Action button is 36 px high; make it 44 px, or use a text link "Book" with a 44 px hit area.

### S7. Colour and focus on dark bands
- Where: `app/globals.css` focus rule; Tour band, footer and the About symbol band (all Saguaro Night).
- What: the focus ring is Monsoon Sky `rgb(46,109,180)` on Night `rgb(28,51,40)`: contrast 2.55:1 (needs 3:1). Text colours pass (muted on sand 5.21, link on sand 5.61, white on copper 4.95, night-muted on night 9.05).
- Fix: `.bg-night :focus-visible, footer :focus-visible { outline-color: var(--night-foreground) }`. Use `outline-offset: 2px` (it is 1 px now, `--border-s`).

### S8. Copper is used for too many things
- Where: eyebrow text, links, filled buttons, active tab, "Most popular" tag, club-card eyebrows, text links with arrows.
- Fix: copper fill only on the one primary button per section. Eyebrows in `--muted-foreground` (5.21:1 is enough at 12 px caps). Links keep `--link` (5.61:1). This makes the one filled button the clear next step.

### S9. Wrong facts that a visitor will notice (also listed per route)
- ZIP distances (`club-context.tsx:48-65`), search matches, intensity inconsistency (`header.tsx:97` vs `ScheduleRow`), journal body text, British spelling ("neighbourhood" x2 in `app/(site)/about/page.tsx`, "centre" in `lib/data/classes.ts:20`).

---

## Per-route issues

P0 = broken or wrong facts. P1 = strong LLM look or spec miss. P2 = polish.

### Site shell (all routes)
- P1 `components/site/header.tsx`, Clubs mega menu: five columns at about 105 px each; "Mesa – Dobson" wraps to "Mesa –/Dobson" and "Open · until 10 p.m." wraps to three lines. Fix: one column of 5 clubs, 320 px wide, one line each: name left, "Open until 10 p.m." right-aligned at 14 px, a 3 px club-colour bar instead of the thumb. Column 2: facilities. Column 3: the feature card. Remove the "Mesa clubs / Gilbert clubs" sub-heads with their descriptions.
- P1 header.tsx:97, Classes mega menu "Next up" card: `IntensityRibs level={nct.intensity[1]}` shows Lap Swim as "Hard · 4 of 5". `ScheduleRow` shows the same session as "Moderate · 3 of 5". Fix: use `typicalLevel(nct)` in both places (and in `ClassCard`, class hero, panel). One helper, one value per class.
- P1 same menu: class icons in tinted rounded squares (8 of them). Delete the tint; keep the 16 px icon in `--cat-*` colour, or delete the icon and keep a 3 px colour bar.
- P2 header: keyboard roving is partial (known). Add Left/Right between triggers. Escape and focus return work (checked).
- P2 header chrome: "Find your club" appears in the utility bar, the home strip and the finder. Keep the utility-bar one only.
- P2 `components/site/footer.tsx:74`: "Fictional brand made for a university project." Fine for the course, but put it in a separate `<small>` line, not in the legal row. The "Hours at every club" row (4 columns) does not align to the 5 columns above it; use the same column template.

### `/` Home
- P1 Hero (`HeroSplit`, `components/sections/common.tsx:142`): 56 px H1, left column 544 px wide, a 560 px photo, 130 px dead gap. Fix: see S3 (H1 96 px). Photo slot becomes full-bleed on the right half (bleed to the viewport edge, 5/12 columns, 3:4), not an inset card. Cap the photo at `aspect-[16/10]` at `md` (at 768 it is 720 x 900 and pushes the whole page down).
- P1 Hero trust row: 3 check-list lines under the buttons are the LLM trust row. Keep the facts; set them as one line of plain text with `·` separators in 14 px, or fold into the lede.
- P1 `ClubStrip` (home-client.tsx:22): a full-width white card with a 420 px form, and a 100 px dead zone left of it. It repeats the club finder below. Remove it for visitors with no club. Show it only when `cpa_club` is set ("Your club: Mesa – Dobson. Open until 10 p.m. Next: Lap Swim 6:00. Change").
- P1 Club finder (`ClubFinderGrid`): the Dobson card is `row-span-2` and stretches, leaving about 160 px of blank card; the four other cards have different heights. On mobile it is 5 x 600 px cards (page is 17,080 px tall at 375). Fix: a table-like list, no photos: 5 rows, 88 px each: club name 24 px, street, status, busyness meter, 3 signature chips, "Tour" link. One photo slot only (the selected club, 16:9, on the right, changes on hover/focus). Mobile: the same 5 rows, 96 px each.
- P1 `AmenityBento` (`components/sections/bento.tsx`): six items in a 3-column grid with a row-span-2 first item leave "Strength floor" alone on row 3 with about 400 px empty. Icon in a tinted circle. Fix: delete the grid. Use one 3-column text table with hairlines: "Pools / At 3 clubs: Dobson, Red Mountain, Val Vista", "Courts / 3 clubs", ... plus one large photo slot. Names the clubs, which a grid of photos does not.
- P1 Class category rail (`ClassPhotoTile`, class-parts.tsx:98): each tile has a label overlay on the photo and the same label again below it (duplicate text), and the overlay hides the slot's own chip text (two overlapping labels). Fix: remove the overlay; keep one label below; tile = 3:4 slot with the category icon top-left. Or make it a text index: "Strength 4 · Cycle 3 · Conditioning 3 · ..." with colour bars, one row per category, 56 px high.
- P0 Schedule teaser rows: text overlap ("Moderate · 3 of 5 Open", "Full / 3 on the waitlist" over the next cell). See S6.
- P1 Schedule teaser heading "Classes at your club" shows Val Vista data when no club is chosen. Say "Classes at Gilbert – Val Vista" and the line "Pick another club" or the select.
- P1 Plans (home and `/membership`): three equal white cards with the middle one framed. Keep three plans, but set them as three columns divided by vertical hairlines, no card borders; price at 56 px tabular; one filled button (Ridge). Move the fee line above the plans.
- P1 Coaches strip: 4 square photo slots (each 150 px) with the ID chip over the face area and 40 % empty space to the right. Fix: 8 coaches as one row of 8 at 96 px circles? No: use a 4-column row at 1:1, full column width, name and speciality under, no chip (S1), and a link "Meet all 8".
- P1 Testimonials: a single quote at a time with dots. Quote is real, specific text (good). Show all four at once as a 2 x 2 text list with 24 px quotes and names, no carousel, no photo. The 4:5 photo of a pool slot is decoration.
- P1 Families band: "Train. The kids are fine." is the H2 here and the H1 of `/kids`. Change the home H2 to "Kids club, 8 a.m. to 8 p.m." (a fact). Three stat blocks (3 / 2-hour / 6 mo-12 yr) are good; keep.
- P2 "What a tour looks like." Timeline is good. Keep.
- P2 FAQ and Tour band: keep. The Tour band's mark above the heading (copper symbol) is decoration; remove it and make the heading 56 px.
- Mobile 375: page height is 17,080 px. Targets after the fixes: 9,000 px.

### `/clubs`
- P0 ZIP lookup (`components/site/club-context.tsx:48-65`): known ZIPs use a sample table. Any other `85xxx` ZIP gets invented distances. 85297 (Gilbert) gives Dobson 15.7 mi, Downtown 14.7 mi, Val Vista 16.7 mi: every club is more than 14 miles from a Gilbert ZIP, which is false. The list is also not re-sorted by distance, and the Sort select stays on "Size". Fix: add centroid lat/lng for about 20 East Valley ZIPs (85201 to 85215, 85224 to 85226, 85233 to 85234, 85286, 85295 to 85297) and compute with `lib/data/geo.ts` `miles()`. For other ZIPs say "We do not have that ZIP yet. Try the map or call (480) 555-0100." Set Sort to Distance when a ZIP is accepted.
- P1 Header and ZIP box: H1 on the left, ZIP form on the right, then filter chips, then a count. Four rows before the list. Fix: H1 and count in one line; the ZIP field and chips in one 56 px toolbar.
- P1 List cards: 176 px thumbnail + status line wrapping ("Open · until 10 p.m." in 2 lines, "(4:30 a.m.–10:00 p.m. today)" in a 3rd) in a 340 px column. Fix: make the list column 440 px (5/12) and the map 7/12; drop the thumbnails (use a 3 px club-colour bar); put status and hours on one line.
- P1 Map (`components/brand/club-map.tsx`): 5 identical pins; Downtown and Dobson labels sit on top of road lines. Fix: pins carry the club number (1 to 5) matching the list rows; labels offset by pin; "active" pin gets a copper ring; draw Dobson Rd and Val Vista Dr in the correct places (the diagonal and the river should be labelled "US 60" and "Santan Fwy" in 10 px caps).
- P1 Compare table: "— —" is two dashes (icon + text). Show one en dash. "Yes" with a check and "3" plain make mixed rows. Fix: numbers right-aligned tabular; yes = filled dot, no = empty cell; sticky column headers at `top-16`; the last row "Tour Dobson" is a text link; set the table at 14 px on a 1200 px grid without the card wrapper (just top and bottom rules).
- P2 `Which club has what.` heading: fine, plain.

### `/clubs/[slug]` (Dobson, Heritage checked; Red Mountain, Downtown, Val Vista spot-checked for facts)
- P1 Hero order: a 16:9 photo (about 700 px tall at 1440) comes before the H1; the H1 starts at y = 720 on a 900 px screen. Fix (spec 3.1): H1 first. Left 7 columns: eyebrow, H1 at 72 px, tagline, status line, address, 3 signature chips. Right 5 columns: booking card. Photo below as a 21:9 band (full container width, 480 px high).
- P1 Amenities tab (2,068 px): the same left/right photo-and-text zigzag five times (pool, courts, kids, recovery, studios), each with a 3:2 slot and a check list. Fix: one two-column definition list: left column 4/12 sticky list of amenity names, right 8/12 rows with a hairline between: name 24 px, one sentence, 3 facts (25 yd, 8 lanes, 90 to 92 °F), link. Photos: 2 slots max.
- P1 "Popular here" (right of the classes list): five white bordered rows with an icon in a tinted square. Replace with a plain list of 5 links with a count: "Lap Swim, 18 a week".
- P1 "Other clubs near you." shows 2 clubs (Dobson). Show the 4 other clubs as one-line rows with distance, not 2 cards. "Near you" is wrong: it shows other clubs, not nearby ones; rename "Other clubs" or sort by real distance.
- P1 Coaches at Dobson: slots with ID chips (S1). Show names and specialities as a text list when no photo exists.
- P2 Gallery: lead slot + 4 thumbs: good structure. Remove the "G1 · 3:2" chips (S1).
- P2 Hours: the `HoursTable` has the right shape (3 columns, today highlighted). Keep. Popular times chart is good (keep): add the numeric label "Steady now".
- Keep: quick facts as large numerals (68,000 sq ft, 25 yd, 4:30 a.m.). This is the editorial pattern the rest of the site needs.

### `/classes`
- P1 Page header + 8 category tiles: 6 tiles on row 1 and 2 on row 2; the 2 leftover tiles leave 70 % of the row empty. The tiles repeat the label over and under the photo (see Home). Fix: 4 x 2 grid at `lg` (each 1:1) or a text index (see Home rail).
- P1 "All 28 classes": 28 identical cards (3 columns), each with a 3:2 slot of the same category tint, a badge, a title, 1 line and 3 meta lines. At 1440 this is about 3,000 px. Fix: one table grouped by category. Columns: class (name + one sentence, 16 px), length, intensity ribs + word, "First-timer" tick, next session, clubs. Row height 64 px, rules between rows, category heading as a 24 px row with the colour bar. Result: about 28 x 64 = 1,800 px, scannable. Keep the first-timer filter. Photos only on `/classes/[slug]`.
- P1 Intensity guide ("Five ribs. Five efforts."): five equal white cards; the heading is a 3-part rhythm ("Five ribs. Five efforts."). Heading: "How hard is it?" Fix as in S4.
- P2 Recovery shows "Easy · 1 of 5" only in the category index but "Easy" is also its range lower end. Use the range ("Easy to light").

### `/classes/category/[category]`
- P1 Same card grid as `/classes` for 3 to 4 classes. Fix: use the table. Make the page header carry the category colour as a 6 px bar on the left of the H1, not a tinted band.
- P2 Check all 8: titles "3 ways to do cycle." is a template string: reads wrongly for "Mind & Body" ("4 ways to do mind & body"). Write one line per category in `lib/data/categories.ts`.

### `/classes/[slug]` (Climb Cycle checked; 27 others template)
- P0 "When it runs" rows break (S6): "Hard · 4 of 5Open", "Devon / H." wrapping, "2 on the waitlist" over the next row.
- P1 Hero: primary button is "Book a free tour"; the class-specific action ("See times") is the secondary. Make "See times" a text link and keep one filled button "Try it free" (3-day pass) as the primary for a class page; a tour is the wrong next step for a visitor who read about one class.
- P1 "Five clubs, one class": 5 cards in a 3 + 2 grid. Replace with a one-line list: "Dobson · Red Mountain · Downtown · Val Vista · Heritage", linked, with the next time after each.
- P1 "What to expect" 5 numbered steps beside a slot: good copy. Keep the steps; the numbers in dark circles are fine here (it is a real sequence).
- P2 Facts row (Duration / Intensity / Level / Group size / Equipment): 5 columns with icons. Remove the icons; label 12 px caps above value 24 px.

### `/schedule`
- P0 Week grid (`schedule-board.tsx`): at 1440 each day column is about 130 px and each class is a sliver of about 22 px wide with "L…" or "C…" labels, so it cannot be read. Up to 4 classes overlap per hour. Fix: change the grid to 7 columns with `minmax(168px,1fr)` and horizontal scroll, show at most 3 parallel classes per slot (class name 13 px, time) and a "+2 more" button that opens the day list. Or drop the grid and offer "Day" and "Week table" (rows = time, columns = day, cell = class names). Today it is a hand-drawn calendar with no value.
- P0 Sticky stack 310 px, with a hidden band heading (S5).
- P1 Filter area: three stacked rows (Category chips, Time + Intensity + Coach + checkboxes, count) = 214 px, with 8 category chips each with an icon. Fix: see S5.
- P1 Row columns do not align (S6).
- P1 Panel (`ClassPanel`): the primary action "Book" is an outline button; the 16:9 slot (with chip) takes 170 px of a 480 px panel. Fix: filled "Book" button (it hands off to the app sign-in; say so on the button: "Book in the app"), put it directly under the time and title; photo slot at 21:9 or removed from the panel.
- P1 Mobile (375): intensity and spots are hidden below `sm` (`hidden sm:block`), so a phone visitor cannot see how hard a class is or whether it is full. Fix: show the 5 ribs (no word) and "Full" on mobile in a second line under the coach name. Rows are about 140 px tall; the target is 88 px.
- P2 "570 classes" count is the sum across the week while the day strip says "97 classes" for Today. Show "97 classes today" next to the strip, and keep the weekly count out of the filter bar.

### `/membership`
- P1 Plan cards: see Home. The heading "Pick your pace." is also the H2 of the Home plans section; give the page its own: "Three plans. One price each month."
- P1 Family calculator: the result card repeats the plan price twice ("$79" small, then "$79 a month"). Fix: one line, "Ridge + 0 adults + 0 children = $79 a month". Steppers `- 0 +` are 36 px; make 44 px.
- P1 "Every detail." table (`PlanComparisonTable`): good table; the first column header "What you get" is 9 px. Make it 14 px; the tinted Ridge column is a good highlight (keep). Remove the white card wrapper; use rules.
- P2 Two highlighted notices (fees line with an info icon). Keep the plain-words text; remove the icon and the box.

### `/join/*`, `/trial`, `/tour` flows
- P0 `/join/payment` and other steps can be opened directly with no plan or club chosen ("Home club: Not picked yet" with the card form open). Fix: redirect to the first incomplete step; or disable the form and say what is missing.
- P1 `/join/payment`: the order summary shows twice (inline card, then a "Your plan" sidebar). Remove the inline one at `lg`. "or pay with card" has no wallet button above it; delete the divider or add Apple Pay / Google Pay buttons.
- P1 `/tour` step 1: the form column is 480 px wide, left-aligned, with about 480 px of empty space right of it. The 5 clubs are a 2-column grid (orphan fifth card); the month calendar is 31 cells with 5 enabled. Fix: club = 5 stacked radio rows (one column); day = a horizontal strip of the next 14 days (as on `/schedule`); put "Your tour" summary in the right column from step 1 (it appears only at step 2).
- P1 `/tour/confirmed`: a check icon and a "Confirmed" pill above the H1 (the pill-above-heading defect). Remove the pill. "Share this tour" is an odd action; remove. "Questions" at the end of the bring-list is a fragment.
- P2 Error summary box on `/tour` step 3 is good (summary, inline text, icon). Focus moves to the H1, not the summary; move focus to the summary (`tabIndex={-1}`).
- P2 Calendar past days are focusable (`aria-disabled`, "no tours"). Hide days before today.
- Keep: `/trial` (two columns, form right, "Today / Your first visit / Day 3" timeline), `/join/plan` (plans as rows, not cards), the error copy, the 3-segment step bar.

### `/kids`
- P1 "Four ways in." four equal class cards (photo + title + 3 meta lines). Fix: one table with 4 rows: Kids Club (6 mo to 12 yr), Swim School (5 levels), Junior Pickleball (8 to 14), Teen Strength (13 to 17), with age as the first column at 24 px.
- P1 "When kids club is open." The table repeats "Mon–Sat" on 4 rows with one block each. Fix: one row "Mon to Sat" with four blocks, or a 4-column strip: 8 to 10, 10 to 12, 4 to 6, 6 to 8, each with "2-hour block".
- P2 H1 "Train. The kids are fine." is repeated from Home. See Home.

### `/aquatics`, `/courts`, `/recovery`, `/personal-training`
- P1 Aquatics "Pools by club": the same three `ClubCard` tiles as on Home. A pool visitor needs facts: Fix: a table: club, length, lanes, water temp, lap lane reservation, hours; one photo above.
- P1 Courts: "Courts open today" (dense Open/Booked grid) is the right pattern. Keep it. "Four ways to play." four tiny chips: make a 4-row list with duration and who it is for.
- P1 Recovery "What's in the suite" and "By club" repeat the club-card pattern. Make "By club" a 5-row table (club, sauna, cold plunge, compression, hours). Check "Sauna + Plunge" runs at Downtown while the club table lists "Lounge (sauna, compression)" with no plunge: make the class list match the club facts.
- P1 Personal training H1 "A coach who knows your name." repeats the Home coaches heading "People who know your name." Change one.
- P1 All four pages end with: FAQ, then Night tour band, with the same heading style. See S2.

### `/coaches`, `/coaches/[slug]`
- P1 Index: 8 coaches in a 4-column card grid with 4:5 slots and ID chips over the face area. Fix: a 2-column list: name 24 px, speciality, 2 favourite classes, clubs, "Book intro"; one photo per row at 96 px, or no photo until real photos exist.
- P1 Profile: stats "9 / 2 / 4" (years coaching, clubs, classes) are good; keep. The quote beside the bio is good copy. Breadcrumb "Personal training > Coaches" is off for a coach who teaches classes (Marisol is a cycle coach). Use "Coaches".

### `/about`
- P1 Values: "Steady / Welcoming / Capable" is the LLM three-column icon block (icon in circle, bold title, one grey line). The three are also H2s (wrong heading level). Delete the icons; make them one paragraph each in the "Our story" band, or remove.
- P1 Two Night bands (Rib Peak symbol band and the Tour band). The spec allows one brand-weight band per page. Make the symbol band Sand with the symbol at 256 px on the left.
- P1 "1 promise" stat tile is a gimmick; delete. Keep "5 clubs, 28 classes, 4:30 a.m.".
- P0 Spelling: "neighbourhood" in `app/(site)/about/page.tsx` lines 16 and 28 (US site). Also "centre" in `lib/data/classes.ts:20` ("a stronger centre" in Mat Pilates). Run a search for `ou`, `re`, `ise` spellings.
- Keep: the 2014 to 2024 opening list (`years`) as a plain list with year numerals. This is the best editorial block on the page.

### `/faq`
- P1 The group list "Getting started 3 / Memberships 6 / Kids and teens 3" is only 12 questions. The H1 "Good questions." is also the home FAQ H2. Make the H1 "Questions". Heading levels: group titles must be H2.
- Keep: the left group nav + right accordion layout.

### `/contact`
- P1 Club cards: 5 white cards with "Mesa" and "Dobson" as two lines, address, phone, status, hours table, filled "Book a free tour" on each (5 filled buttons in one view). Fix: a 5-row table: club, address, phone (tabular, link), today's hours, "Directions". One filled button on the page ("Send a message").
- P2 Check the message form error and success states (not exercised).

### `/journal`, `/journal/[slug]`
- P0 `app/(site)/journal/[slug]/page.tsx:22-28`: every article uses the same Climb Cycle text. "A first week back after surgery", "What to eat before a 6:00 a.m. class", "Packing for kids club", "Heritage rooftop deck" and "Pickleball in the heat" all show "Arrive early / Pick a load you can talk over / Stand when you are told / Drink early / Come back on Thursday". Fix: put a `sections` array in each `journal` entry in `lib/data/content.ts` (5 sections, 40 to 80 words each, real advice for that topic). BUILD-NOTES says "shared sample text"; on a design review this reads as a wrong page.
- P1 Journal index: featured post + card grid with slots. Fix: first post large (as now), the rest a text list: date, category, title 24 px, dek, author; no photo for the list.
- P2 `datePublished` is the fixed string "2026-10-12" in JSON-LD; the page shows "Oct 5, 2026". Use the entry's date.

### `/offers/fall-climb`
- P1 Hero + "The terms, in plain words." Good plain text. The terms are a 2-column list in a muted band; fine. Remove the slot "IMG-PROMO-HERO" (S1); the offer is a fact ($0 enrollment), not a picture.

### `/careers`, `/careers/[slug]`
- P1 Perks row: 3 icons in circles ("Free membership...", "Schedules that fit a life...", "Training and certifications paid.") is the LLM trio. Fix: three lines as a plain list, no icons.
- P2 Job list: good as a list. Keep the dense list.

### `/app`
- P1 Spec 22.2 itself calls for "icon-in-circle columns". Do not build it. Use three numbered lines, in text, beside the phone. This is a deliberate departure from the spec; note it in BUILD-NOTES.
- P1 Missing: the QR code, screens carousel (known gaps). One 9:19.5 slot is fine; add the QR as a real SVG if a QR library is not wanted: render a placeholder with the label "QR to App Store".

### `/search`, search dialog
- P0 Search "pool": the Clubs group lists only "Gilbert – Val Vista". Dobson and Red Mountain have pools and "Pools" is an amenity in the data. The index matches the tagline text only. Fix: build each club document from `club.amenities`, `club.signature`, `club.intro` and `club.has` flags, so "pool", "courts", "kids", "sauna" find the right clubs. Add a search test list in BUILD-NOTES: pool, courts, kids, sauna, yoga, swim, cycle, Gilbert, 85202.
- P2 Group "Pages and FAQ" shows "Aquatics / Page" with a generic search icon. Use the page's own icon.
- Keep: grouped results, keyboard selection, `Esc` hint, "See all results" row.

### `404`
- P2 `not-found.tsx` renders the site root title; add `metadata.title = "Page not found — Cactus Peak Athletic"`. The page is good: left-aligned, plain, three actions. Keep the Rib Peak symbol and "That page took a rest day." (a small local touch).

### `/legal/[slug]`
- P2 The sample paragraph repeats 6 times in one page, and the cookie switches follow. The disclosure is honest. Keep one paragraph per section in the sample, add a banner "Sample text".

---

## Accessibility notes
- Pass: skip links (2) at the start of tab order; no positive `tabindex`; focus return after menu close; visible focus ring; reduced-motion CSS; error summary + inline errors in the tour flow; no page-level horizontal overflow at 375 or 768 (checked on 16 routes); all text pairs measured at 4.7:1 or higher.
- Fail: focus ring on Night bands 2.55:1 (S7).
- Fail: heading jumps on `/clubs`, `/membership`, `/trial` (H1 then H3). Add the missing H2 (visually hidden if needed).
- Fail: small targets: the "Join now →" promo link is 17 px high; schedule `Book` buttons are 36 px; carousel arrows 36 px; the club-card "Tour this club" is 36 px. WCAG 2.2 AA needs 24 px (passes) but the spec asks 44 px.
- Check: the Week/List toggle `Week` button is disabled until a club is chosen; the reason is shown as a title only. Write the reason next to the control.

## Missing from spec
- `/app` 22.1 QR code (desktop) and 22.3 screens carousel (known gap).
- Tour confirmation: Google and Outlook calendar items (known gap).
- Mega-menu Left/Right keys (known gap).
- Clubs 1.2 / 3.x: "Your club" strip overlaps the hero by 32 px at `lg` (spec 1.2). Built as a separate block. (I recommend dropping it for first-time visitors; see Home.)
- Spec 6.4: week grid readable at 7 columns. Built but unreadable (see `/schedule`).
- Spec 18.4 "Other ways" section on `/contact`: not found among H2s; check that it exists.
- Spec 3.4 "sticky booking card through all tabs": deviation is declared in BUILD-NOTES. The reason (list needs full width) is fair; keep the booking bar in the sticky tab nav ("Tour this club" button is there, good).
- Photo slot for the 4 coach pages' hero and `IMG-*` count: all present.
- Not in spec but needed: a real 12-ZIP table, real article bodies (see P0 above).
- All other pages and sections listed in `03-pages.md` exist: Home 13 of 13; Clubs 2.1 to 2.5; Club 3.1 to 3.13; Classes 4.1 to 4.7; Class 5.1 to 5.10; Schedule 6.1 to 6.7; Membership 7.1 to 7.8; Join 8.1 to 8.6; Trial 9; Tour 10; 11 to 25.

## Keep (do not undo)
- The brand layer: Archivo wide display at 800 weight with tight tracking, Inter for reading, Sand page, copper only on actions, Night band used sparingly. Colours and contrast numbers pass.
- RibMeter, IntensityRibs, BusynessMeter and the five-rib motif. Shape carries the value, and each has a text label. This is the most original thing on the site.
- `StatusLine` ("Open · until 10 p.m.") with icon plus words. `HoursTable` with "Today" tag.
- Club quick facts as big numerals; Popular times bars on the club page; Courts "open today" grid; compare table first column sticky.
- `/trial` layout; `/join/plan` plan rows; error summary pattern on `/tour`; the 3-step bar; the 404 copy.
- Copy: "Climb at your own pace." "Come see one. It's free." "A coach, not a salesperson." "That page took a rest day." Plain, specific, sentence case. No hype words found in a search of `app`, `lib`, `components` (only the British spellings above).
- The "Who runs it" and "Just visiting?" blocks with a 2 px top rule (the right pattern to extend).
- Fixed "now" (Tue Oct 27, 5:40 a.m.) and consistent counts: 570 weekly classes = 136 + 120 + 81 + 148 + 85; pools 3, courts 3, recovery 4, kids club 3 match the club data on every page checked.
- No fade-up scroll animations, no hover lift, no gradients, no glass, no emoji. Reduced motion is respected.
- The cookie-based "my club" and sessionStorage flow state.

---

## Suggested order of work
1. Wrong facts (S9, plus the P0 items): ZIP table, search index, `typicalLevel` everywhere, journal bodies, spellings, `/join/*` guards.
2. `ScheduleRow` grid and the schedule toolbar (S5, S6), then the week grid.
3. `PhotoSlot` chips and composition (S1).
4. Type scale and H2 variation (S2, S3), hero rebuild.
5. Replace card grids with tables: classes, club finder, amenities, aquatics, recovery, contact, coaches (S4).
6. Focus ring on Night, target sizes, heading jumps (S7, accessibility notes).
