# Cactus Peak member web app: design review 1

Reviewed on port 3211 against `DESIGN-DIRECTION.md`, the web-app specs 01 to 05 and the foundation. Viewports: 1440, 768, 375. Light and dark. Members: maya, jordan (teen), daniel (Trailhead). Payment-failed state reached by editing the saved store, because the account menu crashes (P0-1).

## Verdict
- The bones are good: real rules engine, honest states, a strong sand/copper/Saguaro palette, a rib vocabulary, a good bookings timetable and a good late-cancel dialog.
- The surface is still the spec's wireframe made literal: a dashboard Today (next-up card, club card, four-cell stat row, promo band), a Week grid that cannot be read, a copper "Book" button on every row, and 89 toasts.
- One crash blocks all demo tools (account menu). One chart renders empty. One sticky header lets content bleed through.
- Mobile stacks up to five fixed bars (top bar, banner, page, CTA bar, tab bar) and leaves about 40% of the screen for the page.
- Distance to a designer-made member app: about 60% there. The fixes below are mostly layout subtraction, one colour rule and a handful of component bugs, not a rebuild.

---

# Systemic issues (fix once, fixes many)

### S1. Copper is spent on every row, so it means nothing
- Where: `components/booking/class-row.tsx` (ScheduleRow), `components/booking/session-action.tsx`, `components/reserve/hub-page.tsx` (three copper buttons in a row), `components/today/today-page.tsx` (Show pass, Confirm spot, promo button), `/schedule` list (8 to 11 copper "Book" buttons in one screen), `/training` ("Book a session").
- Why it matters: the member cannot find the one thing that needs action now (the held spot, the next class). Copper on 10 rows reads as decoration, and the held-spot "Confirm spot" (the only urgent action) looks the same as "Book".
- Fix:
  1. Copper (`--primary`) is allowed once per view, and only for the single next best action: "Confirm spot", "Show pass" in the 30 minutes before a class, "Reserve court", "Continue", "Update card".
  2. List rows get a quiet action: `Button variant="outline" size="sm"` (or a text button with a 44 px hit area) labelled "Book". The row itself is the click target for details.
  3. `BookingStateButton` gets a `tone="quiet"` default for `open`. Keep `primary` for `held`, `offered` and a `featured` prop.
  4. Reserve hub: one row-link per object ("Reserve a court" as a text link with arrow), not three copper buttons.

### S2. Dashboard widgets on Today (spec-literal, and the direction forbids it)
- Where: `/today`, `components/today/today-page.tsx` lines 130 to 235 and `components/kit/ui.tsx` `StatRow`.
- What: next-up card + club photo card side by side, then a four-cell stat row (This week, Streak, Guest passes, Booking window), then a two-column agenda and attention list, then a horizontal "This week" strip, then three photo cards, then a promo band. That is eight blocks; five of them are not "what is next for me".
- Why it matters: the question is "what is next, can I get in, where is my pass". A member needs it in one glance and one scroll.
- Fix (replace the page, keep the data):
  1. One column, `max-w-[760px]` for the agenda column, left edge aligned to the title. Right rail (320 px) only at 1280 and up.
  2. Top: one sentence in Archivo 32/36: "Climb Cycle in 14 minutes. Bike 14, Cycle Studio." (live, `tabular-nums`). Under it, one line of facts and two actions: "Show pass" (copper) and "Details". Late-cancel rule as one muted line, no card, no left stripe.
  3. Below, one continuous timeline "Today" with hairlines between rows (time column 72 px, category stripe 3 px, title, place, state in place at the right). The next-up item is row 1 with larger type, not a separate card. The Kids club 4:00 p.m. row must appear (see T-3).
  4. Right rail: club status as three lines of text (name, "Light, 2 of 5", "Busier 6 to 8 a.m."), no photo. Needs attention as a plain list.
  5. Delete the stat row. Streak and visits live on `/progress`. Keep only two inline facts in the header meta line: "2 of 3 visits this week" with `ProgressRibs`, and "Nov 3 classes open at 6:00 a.m." (one line, only inside 24 hours of opening). Guest passes belong on `/guest-passes` and the promo.
  6. Move "Suggested for you" and the promo band to the bottom, collapse to a three-row text list (time, name, spots, quiet "Book"), no photo cards. Photo cards with the same art are the strongest LLM tell on this page (S6).
  7. Do not show a loading skeleton (T-5).

### S3. Mobile stacks too many fixed layers
- Where: `components/app/shell.tsx` (sticky header 56 px, `PaymentBanners`, tab bar), `components/reserve/common.tsx:58` (CTA bar `fixed bottom-16`), `/reserve/lanes` and `/reserve/courts` at 375.
- Seen: with the payment banner, `/reserve/lanes` shows about 40 px of the grid at 375. Banner is 140 px tall on every page. On `/pass` it pushes the QR below the fold.
- Fix:
  1. Banners: one line + one action on phones (`py-2`, 56 px max). "Payment didn't go through. Update card". Full text goes in the destination page. Hide banners on `/pass` and inside the booking CTA flows, show a 4 px copper top rule instead.
  2. Reserve pages: hide the tab bar on `/reserve/*` (`md:hidden` on `TabBar` when `pathname.startsWith('/reserve/')`) and let the CTA bar sit at `bottom-0`. One bottom bar at a time.
  3. Page grids get `scroll-padding-bottom: 96px` and `pb-28` already exists; keep it.
  4. Tab bar labels are 14 px and touch each other ("Schedule Bookings"). Set labels to 11/12 px `font-medium`, `min-w-0`, `truncate`, 5 equal columns, and make the Pass tab the same treatment as the others (filled dark pill only when `/pass` is active, or only when a class is within 60 minutes).

### S4. Touch targets and tiny text on phones
- Where: audit at 375 on `/today`, `/schedule`, `/bookings`, `/reserve/*`. Examples: Search icon 36x36, "Me" select 67x36, refresh 36x36, "See all" 46x20, "All bookings" 85x20, "Popular times" 115x32, filter chips 36 px tall, every bookings-row Details/Cancel/Move at 36 px, `Release` 36 px, text radios 14 px circles on `/membership/cancel`, `/family/add`, `/welcome`.
- Also: 11 px text appears 10 times on Today, 24 on Schedule. Body text under 14 px on phones is below the project's own 16 px mobile rule.
- Fix:
  1. In `components/ui/button.tsx` set `sm` to `min-h-11` below `md` (`max-md:min-h-11`), `icon` to `size-11`.
  2. Text links in headers ("See all", "All bookings") become `inline-flex min-h-11 items-center`.
  3. Replace raw radio inputs with the kit `RadioList` row (full-row hit, 48 px min, 20 px indicator) on cancel, add-member, welcome.
  4. Floor at 12 px (`text-detail`), and use 14 px for anything a member must read (spots left, coach). Remove 11 px (`text-tab` outside the tab bar).

### S5. Toasts carry state the page must show (89 `toast(` calls)
- Where: `components/booking/cancel-dialog.tsx:52,55` ("Cancelled: Climb Cycle"), `components/today/today-page.tsx:111,112,189`, `components/bookings/bookings-page.tsx:62-64`, `components/app/notices.tsx:25,31,59,85`, `components/settings/pages.tsx` (11), `components/clubs/*` ("Viewing Gilbert – Val Vista"), `components/schedule/schedule-page.tsx:122`.
- Why: toasts vanish after 5 s; a cancelled class leaves nothing to point at, and a toast covered the "Card expires" item on Today. Several are noise ("Agenda refreshed", "Viewing X", "Saved").
- Fix:
  1. Keep toasts only for Undo of a reversible action (book, cancel on time, change plan). Anchor them bottom-left on desktop, above the CTA bar on phones.
  2. Everything else becomes in-place state: a booked row turns into a "Booked" row with a 600 ms `primary-subtle` flash; a cancelled row collapses to a one-line "Cancelled, Tue 6:00 a.m. Climb Cycle. Undo until 5:50 a.m." that stays until reload; Settings saves show "Saved 5:41 a.m." next to the Save button (`aria-live="polite"`).
  3. Delete the "demo" toasts that tell members the app is a demo ("Photo upload isn't connected in this demo", "Apple Wallet isn't connected in this demo", `settings/pages.tsx:38`, `app/pass-page.tsx:31`). Disable those controls and say "Coming soon" in the control, or remove them.

### S6. Placeholder art repeats, so objects are not distinct
- Where: Today "Suggested for you" (Desert Flow Yoga and Mat Pilates share the same mountain scene), `/reserve/kids-club` (five identical circle/square/triangle tiles), `/training` (three identical grey silhouettes), `/training/coaches/*` (same silhouette), `/reserve` hub (court, lane and kids tiles are three different flat patterns but none says "Gilbert's court" or "Lane 3").
- Why: the direction says a member should tell a club, class, court and lane apart at a glance. Same art with different words is the "generic placeholder art" it forbids.
- Fix:
  1. `components/kit/photo-slot.tsx`: key scenes by object, not by category. One scene per club (five, already exist in `/clubs`), one per studio (Cycle Studio, Studio A, Studio B, Pool, Rooftop), one portrait treatment per coach (duotone with initials in Archivo at 40% size, different tonal pair per coach), not a silhouette.
  2. Kids club step 1: drop the photo. Use a 5-row list with club name, "Kids club here / not here", hours, spots left on the next block. Photos add nothing.
  3. Suggested classes: no photo. Use the row pattern.
  4. Captions stay as `alt`/`sr-only` text. Today the "Val Vista, cycle studio at dawn, rows of bikes facing a tall window" caption is rendered over the art and reads like a photographer's note. Coach caption "Marcus Hale, in the weight room before the 6 a.m. rush" is wrong for a swim coach.

### S7. Cards and boxed segments everywhere a rule would do
- Where: `Segmented` toggles (Pickleball/Basketball, 60/90 min, List/Calendar, Week/List) each a bordered pill; sheet stat strip (45 min / Light / 9 spots) in `components/booking/session-detail.tsx`; club photo card on Today; Settings fields; plan table cell backgrounds; notification rows with icon-in-tinted-circle (`components/app/notices.tsx:~49`, `size-8 rounded-full bg-warning-subtle`).
- Fix:
  1. Session sheet: replace the three-cell strip with a `dl` of two columns, hairline between rows: "Length 45 min", "Intensity Light" (ribs), "Spots 9 left". No dividers between cells, tabular numerals, label 12 px muted above value 16 px.
  2. Notification and attention rows: remove the tinted circle. Use a 3 px left rule only for state (held = warning), icon 16 px muted, same as nav.
  3. Segmented controls keep the border only when a control is truly a switch of views (Week/List). Filters like sport and duration become text tabs with an underline (2 px, `--foreground`), selected = bold.

### S8. Dark-mode selection states are too faint
- Where: `/reserve/courts` dark, Segmented (`Pickleball` vs `Basketball`, `60 min` vs `90 min`) and `Selected` legend swatch; Today dark `Show pass` vs secondary.
- Fix: selected = filled `--night` on light, filled `--on-night` text on `#E9E2D3` on dark, minimum 3:1 against the unselected state, plus bold weight (not colour alone). Check `Segmented` in `components/kit/ui.tsx:101`.

### S9. Contrast: count badges
- Where: `NavLinks` badge (`components/app/shell.tsx:~62`, `tone === "danger"` uses `text-primary-foreground`) and the bell badge. Light: dark text on `rgb(180,35,24)` = 2.62:1. Dark: `rgb(242,236,226)` on `rgb(242,139,124)` = 2.04:1. Both fail 4.5:1 at 11 px.
- Fix: danger badge = `bg-destructive text-white` in light (white on #B42318 is 6.5:1), and in dark use `bg-[#7A1F17] text-[#FFE9E5]`. Use 12 px bold numerals. Everything else I measured on Today (light) passed 4.5:1; dark was clean apart from this badge.

### S10. Sticky sub-headers let content show through
- Where: `/schedule` day heading and Early/Morning/Midday/Evening jump links (`components/schedule/schedule-page.tsx:129`: `sticky top-14 z-10 ... bg-background/95`). Rows' buttons paint above it, so "Book" buttons and instructor names bleed across the heading (seen at 1440 and 375).
- Fix: `z-20 bg-background` (opaque), `border-b border-border`, and `top` equal to the header height plus the day strip height (use a CSS var `--stick`). The jump links become `Button variant="ghost" size="sm"` with 44 px height on phones.

---

# P0: broken, wrong rule or wrong fact

### P0-1. Account menu crashes the app (blocks Demo tools, member switch, theme, sign out)
- Route: any page, click the avatar. File: `components/app/shell.tsx:98,106,113`.
- What: `Menu.GroupLabel` is used outside a `Menu.Group`. Console: "Base UI: MenuGroupContext is missing. Menu group parts must be used within <Menu.Group> or <Menu.RadioGroup>". The error boundary shows "Something went wrong on our side." The spec's whole demo path (open waitlist spot, advance clock, fail payment, offline, reset) is unreachable.
- Fix: wrap each label with its items: `<Menu.Group><Menu.GroupLabel>Switch member (demo)</Menu.GroupLabel><Menu.RadioGroup ...>...</Menu.RadioGroup></Menu.Group>`, same for "Dark mode" (rename "Appearance") and for "Demo tools" (wrap the five items in `<Menu.Group>`). Add a Playwright check that opens the menu.

### P0-2. "Visits by day" chart renders no bars
- Route: `/progress`. File: `components/progress/progress-page.tsx:84`.
- What: bars use `height: N%` inside a flex column that has no definite height, so they collapse to 0. The member sees numbers (5 4 0 4 2 0 0) and an empty box. The sentence "You usually come Monday and Tuesday mornings." has nothing behind it.
- Fix: the column div gets `h-full`; give the bar wrapper `h-[96px]` and compute `style={{height: d.n ? Math.max(4, d.n/maxDow*96)+'px' : '2px'}}`. Zero days show a 2 px stub. Direct label on the peak only; others read from the table view ("Show as table" already exists for class mix).

### P0-3. Court partner accepts any two letters and invites a non-member
- Route: `/reserve/courts`, then confirmation `/reserve/confirmed/[id]`. File: `components/reserve/courts-page.tsx:84` (`players.every(p => p.name.trim().length > 1)`), line 97 (`memberId: member(p.name)?.id`).
- What: typing "Lin" enables "Reserve Court 1" and the confirmation says "Lin Invited". No member exists with that name, so nobody receives the invite and the court is booked with a ghost.
- Fix: for `kind: "member"` require a resolved `memberId` (pick from the combobox list, with suggestions shown under the field: avatar, full name, home club). Disable Reserve until resolved; error text under the field: "Pick a member from the list, or switch to Guest." Guest rows require a name of 2 or more letters and show "Uses 1 guest pass. You have 1 left."

### P0-4. Late-cancel copy on a hold says "Free to cancel until 5:00 a.m." when it is 5:41 a.m.
- Route: `/reserve/courts` (hold panel), `/reserve/confirmed/[id]`, bottom of confirmation. Files: `components/reserve/courts-page.tsx:114`, `components/reserve/confirmed-page.tsx:32`, `components/reserve/kids-page.tsx:142`, `lib/engine.ts:107`.
- What: the line prints the deadline even when it is already past. The member just booked a court 79 minutes ahead and any cancel will be a strike. The rule is stated as if it were not.
- Fix: if `start - now < 2h`, replace with a warning line using the warning tone: "This starts in 1 h 19 min. Cancelling now counts as a late cancel (strike 2 of 3)." Otherwise keep "Free to cancel until 5:00 a.m." Same helper everywhere: `cancelNote(start, now, kind)` in `lib/engine.ts`, used by Today, courts, lanes, kids, confirmed.

### P0-5. Teen cannot reach Reserve, Lanes or Courts (spec says limited access with a request)
- Route: jordan at `/reserve`, `/reserve/courts`, `/reserve/lanes` all return the 403 page "Reservations need a parent's OK."
- Spec: 01 IA lists `/reserve` and `/reserve/lanes` as teen "limited"; Flow 19 gives the teen "Ask Alicia", a note field, "Waiting for Alicia" pill and 24-hour hold.
- Fix: in `canOpen` allow `/reserve`, `/reserve/lanes`, `/reserve/courts` for teens. Render the grid read-only, with the bar button replaced by "Ask Alicia" (opens the existing `askParent` dialog with booking details). Lanes: teen may book lanes only if the parent permission "Always allow lap lanes" is on. Add the "Waiting for Alicia" pill on the booking row.

### P0-6. "Streak 1 weeks" and "IN 34 H 43 MIN"
- Route: `/today` for daniel (`1 weeks`) and for teen (`IN 34 H 43 MIN`). Files: `components/today/today-page.tsx:27-30` (`relIn`), `:176,180` (`${streakWeeks} weeks`).
- Fix: pluralise with `Intl.PluralRules` (`1 week`, `2 weeks`). `relIn`: under 60 min "14 min"; under 6 h "2 h 10 min"; otherwise a day and time: "Tomorrow 4:30 p.m." Use the eyebrow "Next up, tomorrow 4:30 p.m."

### P0-7. Double full stops in busyness copy
- Route: `/today`, `/clubs/[slug]`, tablet and phone. Files: `lib/engine.ts:194` (`" Quieter after 10:00 a.m."` followed by `"."`), `components/clubs/popular-times.tsx:43` ("Busiest 5:00–7:00 p.m.. Quietest 9:00–10:00 p.m.").
- Fix: `range()` returns "5 to 7 p.m." with no trailing period, and the sentence adds one. Output: "Busier 6 to 8 a.m. Quieter after 10 a.m." (drop ":00", it is noise).

### P0-8. Week view is the default at 1440 and cannot be read
- Route: `/schedule` (spec default at 1280+). Files: `components/schedule/week-grid.tsx` lines 64 to 110, `components/schedule/schedule-page.tsx`.
- What: 7 columns of about 150 px, and concurrent classes split each column into 2 to 5 lanes of 25 to 70 px. Titles read "M.", "Aqu", "Des", "C". Status triangles (low spots) sit on a dozen blocks. Truncated names have no tooltip. At load the 5:30 a.m. row is cropped under the sticky header. Opening a class from List view re-renders Week behind the sheet (the intercepted route loses `?view=list`).
- Fix:
  1. Default to List at every width; remember the choice in `localStorage` and in the URL.
  2. If the grid stays, make it a day-column timetable: 5 columns visible (Today plus 4), min column width 200 px, horizontal scroll with a visible fade, no lanes: concurrent classes stack in a row inside their hour as 2 or 3 chips with full names (`text-detail`, 12 px, no truncation), and the hour label on the left at 12 px `tabular-nums`.
  3. Preserve `view` in the intercepted route: pass `?view=` into `/schedule/[sessionId]` and render the same underlay.
  4. Scroll the grid to the first booked class minus 30 minutes on load.
  5. Replace the amber triangle for low spots with the number ("4 left") in the block, since the triangle carries state by shape alone.

---

# P1: strong LLM look or spec miss

### Today (`/today`)
- **T-1 Hero card nested in a card with a left stripe** (`today-page.tsx:130-170`): the next-up object is a bordered, rounded, shadowed card with a 4 px stripe and a CategoryBadge pill top right, next to a second photo card. Replace as S2. Keep the 72 px Archivo class name; drop the pill (the icon and the stripe already say Cycle).
- **T-2 Mobile primary actions misaligned**: "Show pass" is full width, "Book a class" is half width under it, "Cancel booking" is an indented ghost on its own row. Fix: one row, `grid grid-cols-2 gap-2`, "Show pass" copper, "Details" outline, and "Cancel booking" as a quiet text link inside the Details sheet only (the late-cancel rule is already printed).
- **T-3 Kids club missing from the Today agenda**: Maya's 4:00 p.m. Kids club (Theo and Ivy) is in `/bookings` but not in "Today" (it shows Climb Cycle, Switchback HIIT, Desert Flow Yoga only, and says "3 things on today"). The "Me" filter hides household items by default. Spec 3.1 row 4 lists it. Fix: default the filter to "Everyone" for primary members with children, count all rows in the sentence, and show the kids' names ("Theo and Ivy, Kids club, 4:00 to 6:00 p.m.").
- **T-4 Held-spot banner shifts the page when it disappears** (confirm spot): the page jumps up 80 px with no transition and a toast covers "Card expires 11/26". Fix: collapse the banner with a 150 ms height transition, then show the row "Switchback HIIT, 12:00 p.m., Booked" with a 600 ms flash; no toast. Also name the button's accessible name in full: "Confirm spot, 23 minutes left" (today it reads "Confirm spot ·").
- **T-5 Fake loading skeleton**: `today-page.tsx:39` delays 350 ms on local data and shows five identical grey bars, titled "Loading your day…". It matches no layout, flashes on every visit, and the direction forbids it. Delete the state. Keep a real skeleton only for network fetches and make it mirror the timeline (time column plus two bars).
- **T-6 "Sign in faster next time. Add a passkey." as a permanent attention item** is sticky and, on scroll, clips under the header. Show it once, inside `/settings/security` and as one dismissible row in Inbox, not in Needs attention.
- **T-7 Promo band** ("Fall climb. Bring a friend. Send a guest pass." dark band with copper button) is a marketing block in the member's daily screen. Move to `/guest-passes` header; on Today only show it when the member has an unused included pass and no class today.
- **T-8 Payment-failed banner** (red-tinted, 140 px on phones): see S3. Also at day 0 the banner colour is the danger tone. Day 0 to 3 should be warning tone (amber), danger from day 6.

### Schedule (`/schedule`, `/schedule/[sessionId]`)
- **SC-1 Rows are 100 px tall with three lines** (`class-row.tsx`). The spec's timetable target is the answer to "what is open at 7". Make the row 56 px on desktop: `time (72, tabular, Archivo 500) | stripe 3 px | name + one meta line "Cycle Studio · Devon Hart · Moderate ▮▮▮▯▯ · First-timers" | spots right-aligned | quiet action`. Put the intensity word and flags on the same line. On phones: line 1 time, name, state; line 2 coach, studio, spots. Target 72 px, so 11 classes fit in about 800 px instead of 2000.
- **SC-2 "Booked" has a warning triangle** on the 6:00 Climb Cycle row, a check on the 4:30 Yoga row. The triangle means "late cancel", but it appears with no text. Fix: both say "Booked"; add a second line under the label "Cancelling now is a late cancel" only on rows starting within 2 hours. No icon-only meaning.
- **SC-3 Booked row fill**: the whole row gets a green wash. Use a 3 px left rule in `--success`, no fill, plus the check and the word "Booked".
- **SC-4 Zero-count filters**: "Court 0" appears in Category. Hide any option whose count is 0 for the visible day, or show it disabled at 55% opacity with "0".
- **SC-5 Header meta**: two grey boxes under the day strip ("Arizona time (no daylight saving)", "Live · Spots update as they change.") and a poor mobile wrap. Merge into one muted line: "Arizona time, no daylight saving. Spots update live." right-aligned at desktop, below the strip on phones, no background.
- **SC-6 Session sheet** (`session-detail.tsx`): the tab title stays "Cactus Peak Athletic" (set `document.title` to "Climb Cycle, Tue 6:00 a.m."), the primary Book button sits at the bottom left and "Add to calendar / Invite a friend" outline buttons compete above it (move those two to a "More" menu), "Included with Ridge" is a plan line the member knows, show only when not included. The stat strip is S7.
- **SC-7 Spec misses**: no right-click `ContextMenu` on rows, no `PreviewCard` on hover/focus for blocks, no tooltip "Opens Wed, Oct 28 at 6:00 a.m." on closed day chips (they say "Not open" only), no "Save as my filters" persistence confirmation. Add the context menu (Details, Book, Add to calendar, Copy link) and the day-chip tooltip.
- **SC-8 Mobile sticky jump links** ("Early Morning Midday Evening") are text with no tap affordance at 36 px: see S10.

### My bookings (`/bookings`) (good base, keep it)
- **B-1 "Booked" chip on every upcoming row** is redundant on a list of only booked things, and every row repeats Details, Calendar, Cancel. Remove the chip on booked rows (show chips only for Held, Waitlist, Needs approval, Late). Keep one visible action per row ("Details") and move Calendar and Cancel into the expanded row. Cancel in red 12 times is danger colour used for a routine action: use foreground text, red only inside the confirm dialog.
- **B-2 Late-cancel header**: a four-line paragraph before the first booking on phones ("1 in the last 30 days. It clears Nov 23. At 3... Message the front desk."). Fix: one line "Late cancels 1 of 3 ▮▯▯ . Clears Nov 23." with "How it works" as a link; the "Think we got this wrong?" line moves into that link's sheet.
- **B-3 Date mismatch to spec**: clears Nov 23 (30 days) vs spec Nov 26; builder noted it. Confirm which is right with product before shipping, since "30 days from the strike" and the printed spec date cannot both be true.

### Reserve hub, courts, lanes, kids
- **R-1 Hub** (`/reserve`): three identical rows (photo, title, meta, copper button). Replace with one list: "Courts, 26 of 48 morning slots open Thu" / "Lap lanes, Lane 1 free at 6:00 a.m." / "Kids club, 4 spots left Sat 8:00 a.m." as three typographic rows with big Archivo titles, no photos, text links, and show "Your reservations" first when the member has any (it is below the fold today).
- **R-2 Court identity**: "Court 1 to 4" are four identical rows. Add court name and facts in the row label: "Court 1 · Ridge · indoor · pickleball" and "Court 3 · Summit · basketball". Distinct row-label tints are not needed; the label and a 2 px left tick in `--cat-court` are.
- **R-3 Slot states carried by a 6 px dot and a hatch** (`components/reserve/slot-grid.tsx`): free = tiny dot, taken = hatched with a lock icon, yours = dark with "Yours". Make free cells show the start time in the cell on hover/focus and enlarge the dot to 8 px with a visible cell border, and make taken cells empty with a 1 px diagonal hatch and no lock (the lock reads as "premium"). Keep "Yours" labelling.
- **R-4 Grids scroll horizontally with no cue**: `/reserve/lanes` is 1952 px wide inside 1112 px, so everything after 12:45 p.m. is hidden. Courts the same. Add a right-edge fade (24 px `linear-gradient`), "6:00 a.m. to 10:30 p.m. ➝ scroll" hint, `scroll-padding`, and scroll to "now" on load. Also hide past columns (4:30 and 5:15 are greyed at 5:41 a.m.).
- **R-5 Segmented sport and duration**: see S7/S8. Preselect 60 min for courts (90 is the less common default and costs more guest-pass time).
- **R-6 Confirmation page** (`reserve/confirmed/[id]`): a 480 px column with a boxed definition table, a copper full-width "Add to calendar", an unlabelled "Share" heading above "Get directions / Call the club / Club details" (mislabelled), "Done" as an outline full-width button and the cancel rule at the very bottom. Fix: title "Court 1, Tue 7:00 to 8:30 a.m." (the time is the fact), `dl` without a box, players list with status text ("Maya, confirmed", "Linda Park, invited, expires 6:45 a.m."), one copper action "Add to calendar", two text links, cancel rule directly under the title when it is late (P0-4).
- **R-7 Kids club step 1** (S6): remove photos, default to the viewing club, and only ask for a club when the member picks a different one. Step numerals are 10 px; use 14 px with a 2 px underline for the current step.
- **R-8 Lanes**: the "Any lane" copper switch is the only copper on the page besides Reserve. Make it neutral. Lane glyph (two circles) is a good object; add the lane number as large type in the selected cell and "Lane 2 · 1 of 2 swimmers" in the CTA bar (already there). Do not show a hold timer for lanes; none exists (spec says checkout hold applies to courts only, confirm).

### Clubs
- **C-1 Clubs list** is strong (distinct art per club, own line, 'Set as my club'). Fix: mobile shows search, a location row, a sort control and five chips before the first club (about 560 px). Collapse to one row: search + "Filters (0)" button. Show the club list first and the map below on phones.
- **C-2 Map**: the schematic map has labels "Dobson", "Downtown" with busyness ribs; fine, but pins are unlabeled for keyboard focus order. Make each pin a button (`aria-label="Mesa – Dobson, Light, 2 of 5"`) in the same tab order as the list, and add "Skip map".
- **C-3 Club detail**: tab strip (Now, Today's classes, Hours, ...) is anchor navigation; make it a sticky 44 px scroll-spy bar on phones. Popular times bars are all the same dark green; shade the current hour bar (copper outline already) and use two tones for "busy" (>=4) vs the rest, matching the five-rib level.

### Training
- **TR-1 Three grey silhouettes** (S6). Replace with a coach list: name in Archivo, specialty line, "Next open Wed 5:45 p.m." in tabular numerals, price "$75", one text button "Book". Photo only on the profile page when real.
- **TR-2 Coach profile caption** ("in the weight room") is wrong for a swim coach. Caption is derived from nothing: key to specialty.

### Progress
- **PR-1 Four KPI stats in a row** (Visits, Weekly average, Streak, Favourite) and a second stat-style "Weekly goal / This week" pair. Replace with one sentence: "14 visits in October. 3.8 a week. 9-week streak." Then the calendar and class mix. "14 of 12 visits this month. Goal met." is a wrong-looking fact; say "12 a month goal, 14 done."
- **PR-2 Class mix bars** are all category colours and thick; fine, but direct-label with counts and sort descending. Strength red, Cycle green, Mind & Body sage and Conditioning ochre appear together: keep, it is the right use of category colour. Remove the colour from the icons next to labels and keep it only on the bar.

### Membership, plans, billing, family
- **M-1 Change plan**: "Most popular" tag sits on the member's current plan (Ridge) and overlaps the plan name. Show "Your plan" there. Right column "Pick a plan to see the cost." is an empty bordered box; make it a sticky summary with the delta line "Summit: +$50 a month from today, prorated $34.19".
- **M-2 Freeze with a failed payment** shows only "Fix your payment first." on an empty page. Show the freeze form disabled, with the reason above it and the "Update card" action; the member needs to see what freezing offers.
- **M-3 Membership page**: three loose stat cells (Guest passes, Booking window, Late cancels) repeat Today's stat row. Drop them; those three facts are in the plan "Included" list and in Bookings.
- **M-4 Cancel membership survey radios** are 14 px bare circles (S4). Use `RadioList`.
- **F-1 Add member** is a left column with the right 55% empty; the steps are radios as in S4. Use a 2-column layout: form left (max 520 px), live "New monthly total $175, prorated $11.40 today" panel right.
- **BL-1 Billing** is good. Add `tabular-nums` and right-align every money column; "Expires next month" amber chip should state the date "Expires 11/26" and the action ("Update card") next to it, not a separate big copper button that duplicates the banner.

### Inbox, settings, pass, utility
- **I-1 Inbox** rows repeat the Today attention items. Fine. Notification icons: S7. "Approve" on a teen request (`notices.tsx:29`) books immediately from a popover with a toast; show the class, time and cost-free note in the row, and require a second tap in a confirm sheet.
- **ST-1 Settings** works; field row widths run 100% of the pane (about 780 px). Cap at 480 px; put the label left (160 px) and field right on desktop (a settings table), to get structure from alignment.
- **PA-1 Pass**: nothing blocks the QR, but the payment banner pushes it down (S3). On `/pass` the QR must be visible at 375x667 without scroll: reduce the pass header and move "Showing" selector below.
- **AU-1 Sign in**: "Demo: any email works. Try maya@, ..." box is a dev note in the product UI. Hide behind `?demo=1` and remove from production builds. Sign in page shows a dark panel in light mode on first load (flashes from dark to Sand after hydration); render the correct theme from `data-theme` before paint (theme script in `app/layout.tsx`).
- **WL-1 Welcome**: radios (S4), a 1 to 7 weekly-visit scale drawn as a bordered strip with tiny numerals, and a bottom bar with "Skip for now" and "Continue". Give the page a real left edge and a 2 px progress rule at the very top of the viewport.

---

# P2: polish
- **P2-1** Account trigger on phones draws an outline taller than the 56 px header and clipped at the top (`shell.tsx` `AccountMenu` `Menu.Trigger` with `!min-h-11` plus default padding and border). Make it a 44 px circle avatar with no border, `focus-visible` ring only.
- **P2-2** Header buttons (club switcher, bell, avatar, help, Pass) are each bordered; on phones that is four boxes in 56 px. Keep the club switcher bordered, make bell, avatar, help borderless icons.
- **P2-3** Sidebar: active item uses a tinted pill plus a 3 px left bar; pick one (the bar). Remove the sidebar's own border-right and use a hairline.
- **P2-4** `Quiet / Light / Steady / Busy` words and ribs: the "Light · 2 of 5" label and the ribs both say it. Keep the word and ribs, drop "2 of 5" (keep it in `aria-label`).
- **P2-5** Radius is mostly one value (`rounded-md` 8 px on buttons, inputs, chips, cards). Direction wants XS 4 for chips and tags, S 8 for buttons and inputs, M 12 for sheets only, and no radius on timetable rows. Chips and badges in `components/ui/badge.tsx` and `CategoryBadge`: `rounded-xs`.
- **P2-6** Shadows: `edge`/ring borders on most blocks. Flat by default: remove the ring from Today cards and the plan table; keep it for popovers, menus and sheets only.
- **P2-7** Numerals: use `font-variant-numeric: tabular-nums` (already on `.num`) on every clock, price, spots count and countdown. Apply it to the day-strip counts ("11 classes"), the week header dates and Today stat values.
- **P2-8** Reduce eyebrow overuse (`RESERVE`, `GILBERT – VAL VISTA`, `THIS WEEK`, `STREAK` on one page). Keep eyebrows for the date on Today and the club on Schedule only. The "RESERVE" eyebrow above "Courts" repeats the back link.
- **P2-9** Dead code: `kind !== "pt" || true` in `today-page.tsx` (`weekItems`), `void Modal` in `shell.tsx`, unused `Pause`, `Lock` imports.
- **P2-10** Heading order: `/reserve/courts` and `/reserve/lanes` have only an h1 and no h2, so screen-reader users get no structure for filters, grid and summary. Add visually hidden h2s ("Filters", "Choose a court and start time", "Your hold").
- **P2-11** Landmarks: two `<header>` elements and a `<nav aria-label="Primary">` (tab bar) plus `<nav aria-label="Main">`. Fine; set `aria-label` on both headers or use `div`.
- **P2-12** Live regions are `polite` only. Failed booking, hold expiry and "payment declined" need an `assertive` region (use `role="alert"` for errors; the toast already does for type error).
- **P2-13** Intensity: the word "Hard" is shown beside ribs on rows, but on the 768 list it drops to the second line and wraps a 2-line name; keep `whitespace-nowrap` on the intensity group.
- **P2-14** Dev "N" badge overlaps the bottom-left tab bar label ("Today") in dev. Not an app issue; ignore.

---

# Not verified (be honest)
- Account menu flows (member switch, Demo tools: open waitlist spot, clock +1 hour, fail payment day 9, reset) could not be used because of P0-1. I set the day-0 payment failure and the offline state by editing the saved store and overriding `navigator.onLine`. The offline banner and disabled-booking behaviour were not seen visually: no top banner appeared in my override (the page printed "Saved view" and "Offline: live count unavailable" only in the club card and a live region). Check that `PaymentBanners offline` renders a visible "You're offline" row.
- Not walked: waitlist join and offered-spot flow past the held banner, kids club steps 2 to 4, PT booking, guest pass send dialog, add-member steps 2 to 5, change-plan confirm, freeze steps (blocked by payment failure), cancel membership steps 2 to 3, alicia (parent) approvals, settings sub-pages beyond Profile, `/help`, `/404`, `/maintenance`, `/offline`.
- Contrast was measured with a script on `/today` (both themes) only. Other pages were judged by eye.
- No axe or screen-reader pass.

---

# Missing from spec
- Right-click `ContextMenu` on schedule rows (Details, Book, Add to calendar, Copy link): not implemented.
- Hover/focus `PreviewCard` with instructor and description on week blocks: not implemented.
- Tooltip "Opens Wed, Oct 28 at 6:00 a.m." on closed day chips: not present.
- Teen access to `/reserve`, `/reserve/lanes`, `/reserve/courts` with "Ask Alicia" (spec 01, Flow 19): replaced by a 403.
- Today agenda row for Kids club (Theo and Ivy, 4:00 p.m.): missing (Today shows only "Me").
- Today order below 768 (spec: banners, header, NextUp, agenda, ClubStatus, attention, stat row, this week, suggested, promo). Built order puts ClubStatus before the agenda.
- Banner-controlled disabled states for booking cards when payment is failed (spec 3.3): booking buttons stay enabled at day 0; confirm this is intended at day 0 and add the visible "Update card to book" reason from day 8.
- Weekly "Week view default at 1280" is built, but the spec's 160 px day columns with evenly split overlaps is not readable (see P0-8). Change the spec and the build together.
- Late-cancel clear date Nov 23 vs spec Nov 26 (builder deviation 3). Needs a product decision.
- Real photos and coach faces: none, by design; the replacement art needs the changes in S6.
- Weekly visits chart and "Visits by day" need the table view the other charts have ("Show as table" exists only on Class mix).

---

# Keep (do not undo)
- Bookings timetable (`/bookings`): time column, 3 px category stripe, one-line facts, "Held" row with live "Confirm spot · 21:58" and "Release", waitlist section, late-cancel meter. This is the standard the other lists should reach.
- The late-cancel dialog: plain headline, three consequences, primary "Keep my spot", destructive as a quiet text action, strike meter with the clear date.
- Held-spot banner copy and countdown, and the in-row "Held for Maya · Confirm spot · 21:58" on Schedule.
- Payment-failed banner copy ("Your Oct 27 payment didn't go through. Update your card to keep booking. You have 7 days of full access left.") with two clear actions.
- Focus ring: 2 px Monsoon Sky (`rgb(46,109,180)`), 1 px offset, visible on every control I tabbed through. Skip link. Focus moves to the page heading on route change with an announced title. `prefers-reduced-motion` rules exist. `lang` and tabular numerals are set.
- Typography: Archivo wide-stretched headings with Inter for UI; 72 px class name on Today; left-aligned type throughout; sentence-case copy with specific numbers (no hype found).
- Billing page: key/value layout, invoice table, right-aligned money, card expiry state.
- Change-plan comparison table (columns per plan, rows per benefit) and the "month to month, no contract" line.
- Clubs list: five distinct club scenes, one voice line per club, amenity chips, busyness ribs, "Set as my club".
- Club detail: popular-times chart with a table toggle, hours and amenities as plain lists, "Light · 2 of 5" with "Updated 5:45 a.m." and "Levels only, no head count."
- Court hold: 5-minute timer in place, partner field, sticky CTA bar with the chosen court and time spelled out.
- Teen Today: no billing items, "Next Teen Strength Wed 4:30 p.m." cell, and the `Needs parent OK` row state with "Ask Alicia" (the in-row part is right; the 403 on Reserve is not).
- Trailhead locked state on Courts: plain explanation and "Compare plans".
- Dark theme: surfaces, category colours and the Night sidebar hold up. Only the selected-state contrast and the count badge (S8, S9) need work.

Report file: `/Users/ethanhanderson/Documents/Development/git480/cactus-peak-build/web-app/REVIEW-1.md`
