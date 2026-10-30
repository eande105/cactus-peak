# Mobbin iOS research: Cactus Peak Athletic member app

Status: PARTIAL. Eight screen searches returned results. Six flow searches and five further screen searches failed with a Mobbin rate-limit error. The 15-search target was not met. Gaps are listed in section 7.

Method: Mobbin `search_screens` (platform ios, mode standard). Every result image was read. Only what was visible on screen is reported. Mobbin URLs are the `mobbin_url` values returned.

## 1. Sources table

| # | App | Screen or flow | What it shows | Mobbin |
|---|---|---|---|---|
| 1 | ClassPass | Studio schedule (Mile High Run Club) | Horizontal day tabs (Today, Wed 18, Thu 19 ...). Rows: time, duration, class name, instructor, spots left at right. | https://mobbin.com/screens/fedc38b2-31b9-4d52-93e0-d8d5ef83d3dc |
| 2 | ClassPass | Studio schedule (exhale) | Same row pattern. Class name in bold, instructor below. Spots left at right. | https://mobbin.com/screens/fec8b7d0-e249-42ca-ad56-d7f4f4dd4b91 |
| 3 | ClassPass | Upcoming tab, empty state | Five-tab bar (Home, Search, Add credits, Upcoming, Profile). Empty-state card with illustration and "Time to book!". | https://mobbin.com/screens/fba3e09f-c48b-4b84-b596-8332ed761227 |
| 4 | ClassPass | Class detail (High 45) | Full-width photo with pager "1/4". Share and favourite icons top right. Credit cost in top bar. Status chip "VACCINATION REQUIRED". Title, rating, venue (tappable), date and time, instructor. Invite and Add (calendar) buttons. Sticky bottom bar: price left, Reserve button right. | https://mobbin.com/screens/fa71be76-bf15-43b3-af2f-e31d84bd6b22 |
| 5 | ClassPass | Class detail, cancel state | Same layout. Bottom sheet with spinner and "We'll refund your 8 credits." | https://mobbin.com/screens/f26c40c4-0647-402c-bf4f-ac0169a20ee6 |
| 6 | ClassPass | Favourites list | List of saved classes across studios. Each row shows studio name, instructor, star rating with review count, credit cost. | https://mobbin.com/screens/f22d5e3d-c68f-49b9-8b1d-bf6261181fad |
| 7 | WHOOP | Session details | Long-form description, primary outlined button "START EXERCISE" pinned at bottom. | https://mobbin.com/screens/eb826574-7f10-4bf5-bb70-5c4b20a73606 |
| 8 | Nike Training Club | Workout detail | Full-bleed hero video frame. Icon list for duration, level, focus, space. Pill "Start Workout" pinned bottom with mute icon beside it. | https://mobbin.com/screens/124e00db-1806-448a-8d21-5044c2091936 |
| 9 | Insight Timer | Program detail | Greyed-out locked day rows with thumbnail images. Teal "Invite friends" button pinned bottom. | https://mobbin.com/screens/9b4792b9-93b2-4009-b4d7-cb5073af1968 |
| 10 | Google Health (Fitbit) | AI workout detail | Large title, "Start workout" filled blue primary, secondary text link at bottom. | https://mobbin.com/screens/c709083a-f035-49c9-8c0d-4aac748d3240 |
| 11 | Tripadvisor | Tour time picker | Date chip and guest-count chip at top. Card with time-slot chips in a wrapping grid. Selected slot is outlined. Total price at bottom. | https://mobbin.com/screens/21632a98-8496-4d51-842f-103cd064d9c4 |
| 12 | Fresha | Booking detail | Business name in nav title. Cancellation policy in a plain text block. Booking reference in grey at bottom. | https://mobbin.com/screens/3e4ee052-5be7-4ed1-8ab0-f41c992c246f |
| 13 | Luma | Scan to check in | Full-screen dark camera viewfinder. Segmented control "List / Scan" bottom centre. Search icon bottom right. | https://mobbin.com/screens/07fa77cb-8f6f-40e1-aba9-1eafb60954bf |
| 14 | Jomo | QR pass in sheet | Bottom sheet with title, large QR code in dashed frame, Export button pinned at bottom. | https://mobbin.com/screens/21b16415-f52f-45c8-9ded-4fe20bdd10ba |
| 15 | CLEAR | Member pass | White card with brand mark, "Member" label, a light gradient band, and a large QR code. Blue "Add" nav button top right. | https://mobbin.com/screens/3cc1d99f-7942-48b5-825a-3301157d164a |
| 16 | Chick-fil-A | Scan tab | Full-bleed red panel. Large membership number in white. Segmented "Redeem rewards" toggle at top. Tab bar with Scan selected. | https://mobbin.com/screens/b5799f72-a7aa-442c-bcf8-8198ce9275ce |
| 17 | American Airlines | Wallet-style loyalty card | Blue card with brand header, member number, barcode in white panel. | https://mobbin.com/screens/fbf99042-14a3-472f-8587-6e3fea7602fd |
| 18 | Future Pro | Home with share-a-pass card | Large greeting title "Morning, Alex". Photo card with a bottom sheet CTA "Send a Free Month". | https://mobbin.com/screens/d341e055-5b2e-4403-b246-5a9257dafd03 |
| 19 | WHOOP | My Day (home) | Top bar: streak flame with count (14), date pager "TODAY", score percent. Three ring-style rows: Sleep, Recovery, Strain. Card sections below. Tab bar: Home, Health, Community, More, plus a floating action button. | https://mobbin.com/screens/cf930277-904f-40d4-82df-5003e171613f |
| 20 | BitePal | Home | Large mascot avatar in a coloured header. Stat cards for calories, steps, workouts. Circular action buttons. | https://mobbin.com/screens/46a02ecf-d18a-4847-bb3c-6ba18e1b52bc |
| 21 | Nike Training Club | Home widget-style cards | Grid of rounded cards: programme progress card (dark), a scheduled-workout card (white, with date and time), and a smaller thumbnail card. | https://mobbin.com/screens/7abc6053-b1e1-41bd-8e09-16398a93ee70 |
| 22 | Insight Timer | Streak widget preview | Rounded card with consecutive-day count "1", a row of seven weekday dots (filled for done days), and a bowl illustration. | https://mobbin.com/screens/059e3d86-ddb6-498c-b0cc-33afba20b190 |
| 23 | Google Health (Fitbit) | Today (home) | Top: a large steps ring with goal "of 10,000". Two-up pill chips: Distance, Cal burned, Exercise days. Action pills: Log, Start. Tab bar: Today, Fitness, Sleep, Health. | https://mobbin.com/screens/f8b0d51e-7031-4837-b6cf-69f2eec4614d |
| 24 | Tolan | Home | Full-bleed 3D scene. Floating icon buttons at the bottom. Milestone toast at top. | https://mobbin.com/screens/d2547f6d-14a5-4c78-ae50-e9be602c4622 |
| 25 | Rakuten | Map with bottom card | Map with numbered cluster pins. Search pill top. Floating card at the bottom with a photo thumbnail, title, and filled "Add Offer" button. Five-tab bar with the middle tab selected. | https://mobbin.com/screens/03930865-d0d1-4216-abf8-aa56b3463e42 |
| 26 | Tripadvisor | Nearby map with chips | Map with a sheet. Segmented chips: Discover, Saves, Restaurants. Empty state text. Tab bar: Explore, Nearby, Trips, Review, Account. | https://mobbin.com/screens/03568175-b53e-41ab-9def-70c217675e6f |
| 27 | Fresha | Map and venue sheet | Search pill top. Filter chips: Venues, Best match, Price. Count label "51 venues in map area". Horizontal carousel of venue cards with a large photo, "Best in class" badge, name, rating, category. Tab bar. | https://mobbin.com/screens/9c6ec1d7-3de4-4f92-9897-8b8b28e5b17c |
| 28 | Cash App | Map pin detail sheet | Map with pins. Half sheet with logo, address, fee line, "Need help?" secondary and "Directions" primary buttons. | https://mobbin.com/screens/f70ac04e-6599-4cd0-b4b6-9178f7fc177b |
| 29 | Swiggy | Outlet timings sheet | Sheet listing all seven days. Today row is highlighted in the accent colour. | https://mobbin.com/screens/90962942-7025-4a91-bcf9-47b8c4569cd1 |
| 30 | Mindtrip | Place detail | Top bar: close, share, favourite, add. Large rounded photo with pager dots. Title, category, short description. Bottom pill "Plan a trip". | https://mobbin.com/screens/a903fbfb-0b91-4c2a-a620-8e747bc3528f |
| 31 | Tripadvisor | Place detail | "Nearby" horizontal lists with thumbnails and star ratings. Rating histogram. Five-tab bar. | https://mobbin.com/screens/740bb9eb-fa31-446f-bcbc-2517ccaef836 |
| 32 | Fresha | Venue "Other" tab | Segmented tabs: About, Services, More, Team, Reviews, Other. Opening times list with a green dot per day. Additional info rows with icons. Sticky bottom bar: service count left, black "Book now" right. | https://mobbin.com/screens/e3a593d6-df18-42fe-a403-da9fb695e7d2 |
| 33 | Rodeo | Venue detail | Rounded map thumbnail. Title in bold display type. Rating line. Pill buttons: "Saved" with chevron, "Do it". Circular icon button. "About" and "Location" sections with headings. | https://mobbin.com/screens/eb91ab6a-c029-4503-834e-bcd38a4ba9b0 |
| 34 | corner | Place detail | Dark search pill. Title with emoji. Tag chips. Horizontal photo strip. "Saved by" avatar row with counts. Bottom action chips: share, directions, site, Instagram. | https://mobbin.com/screens/1af2ee0f-6b30-4bbe-a1c2-f8ea2156d07d |
| 35 | Swiggy | Time-slot grid | Segmented control "Breakfast / Lunch / Dinner". Grid of time chips, 4 per row, with a sub-label. Selected chip is outlined in accent. Booking summary card. Full-width green Proceed button. | https://mobbin.com/screens/340054cf-d085-4bd0-b1a4-c63392d4f881 |
| 36 | Insight Timer | Date and time picker | Sheet. Time field with am/pm segmented control. Inline calendar month grid. Selected day is a filled green circle. Inline error text in red. | https://mobbin.com/screens/9e18154a-a111-4372-ab48-923f073d28f5 |
| 37 | Fresha | Select time | Horizontal date strip with weekday and day number. Selected day is a filled accent pill. Vertical list of full-width time rows. | https://mobbin.com/screens/56cfe9d3-57c1-4f2b-b8ad-5590b7eb940c |
| 38 | Future Pro | Schedule call | Horizontal week strip. Selected day is a filled dark pill. Two-column grid of time labels. Muted "None of These Times Work" button. | https://mobbin.com/screens/fcbe692b-cc6f-45f7-9612-4cf544a3cd56 |
| 39 | American Airlines | Date picker sheet | Segmented trip type control. Month grid with selected day in a light circle. Cancel and Done buttons. | https://mobbin.com/screens/a36ce70b-43c6-47cb-a23e-47aaaa1b8017 |
| 40 | Fly Delta | Profile and settings | Top segmented tabs: SkyMiles, My Wallet, Profile. Grouped rounded sections with labels and Edit links. Toggle row for Face ID. Chevron rows for security. Tab bar with Account selected. | https://mobbin.com/screens/1159d570-fdb1-4fee-83a9-94b9d108d25f |
| 41 | Yami | Profile | Grid of editable tiles. Each tile shows a label and value with a chevron. Invite code card with copy icon. | https://mobbin.com/screens/5f4a6257-36be-4987-9df9-46e44142667a |
| 42 | Grab | Family members | Info card at top. Member list with avatar initial, role (Admin), and overflow menu. Section "Live location" with toggle. Section "Payment method". Nav title "Grab for Family". | https://mobbin.com/screens/d600e281-fb4b-40fd-8290-ca67876fb31f |
| 43 | Agoda | Account | Dark hero header with name, email, and tier badge. Grouped white cards for benefits and settings. Each row has an icon, label, and trailing value. Tab bar: Home, My Trips, Deals, Saved, More. | https://mobbin.com/screens/15b008f1-70c6-47de-9a4a-a1bc88539ab0 |
| 44 | Instacart | Account hub | Three-up button row: Orders, Settings, Help. Savings rows. Family section with avatar row and "Add member" circle with count "2 invites left". | https://mobbin.com/screens/50ae85ee-80e6-4ae3-a1a3-584514112f2c |
| 45 | Lyft | Family Hub | Member list with avatar, name, role, and pending invite line with an inline action. Full-width pill "Add a family member". Shared payment section with chevron rows. Destructive row "Delete family" in red at bottom. | https://mobbin.com/screens/449818e4-cf2b-47ff-9189-dcc14f58bc7c |

Notes on the sources:
- No search returned Equinox, Barry's, Peloton, Strava, Apple Fitness, Oura, Ladder, F45, or a gym planet-fitness-style check-in. Results used general and adjacent apps (ClassPass, WHOOP, Nike Training Club, Tripadvisor, Fresha) for these areas.
- Row 18 (Future Pro) shows a share-a-free-month card. It is not a check-in screen. It is listed in the check-in search results.
- Row 21 and row 22 are widget-style previews. Mobbin did not label them as widgets.
- Live Activities were not returned by any search.

## 2. Navigation models observed

| App | Tab count | Tab names seen | Notes |
|---|---|---|---|
| ClassPass | 5 | Home, Search, Add credits, Upcoming, Profile | Class booking lives under Upcoming. Class detail is a push screen with a sticky bottom action bar. Favourites is a pushed list (row 6). |
| Google Health (Fitbit) | 4 | Today, Fitness, Sleep, Health | Home is Today. Primary actions (Log, Start) are pill buttons in the header area. |
| WHOOP | 4 + action button | Home, Health, Community, More | Centre floating round button opens an action sheet (row 19). |
| Nike Training Club | Not confirmed in the screens returned | n/a | Home is a card grid. |
| Tripadvisor | 5 | Explore, Nearby, Trips, Review, Account | "Nearby" is a map-first tab. Bottom sheet holds segmented chips (Discover, Saves, Restaurants). |
| Rakuten | 5 | Home, Explore, Rewards, In-Store, $0.00 (balance) | In-Store is a map-first tab. Balance is shown as a tab label. |
| Fresha | 4 | Search, Activity, Profile, plus a Home tab | Map and list are toggled in the search tab. |
| Swiggy | Not confirmed in the screens returned | n/a | Booking is a push flow with a segmented meal control. |
| Agoda | 5 | Home, My Trips, Deals, Saved, More | Account is under More. |
| Instacart | Not confirmed | n/a | Account hub uses a three-button row (row 44). |
| Fly Delta | 5 | Explore, Book, Trips, Account, More | Profile and settings are inside Account. Sub-tabs at top: SkyMiles, My Wallet, Profile. |
| Insight Timer | Not confirmed | n/a | Home includes a streak widget preview (row 22). |

Sheets vs push, as observed:
- Push: class detail, venue detail, booking detail, family list, settings sub-pages (ClassPass, Fresha, Grab, Lyft).
- Sheet: time or date picker (Insight Timer, Future Pro, American Airlines), outlet hours (Swiggy), QR pass (Jomo), map venue summary (Cash App).
- Sticky bottom bar on detail pages: ClassPass (Reserve), Fresha (Book now), Insight Timer (Invite friends), Nike Training Club (Start Workout).

## 3. Flow catalog

The flow search failed (rate limit). The steps below come from single screens, not from complete flows. Each step is marked with its source row.

### 3.1 Book a class
1. Open the schedule for one studio. Use day tabs at the top (ClassPass, rows 1 and 2).
2. Tap a row to open class detail (row 4).
3. Read the detail: hero photo, instructor, time, venue, cost (row 4).
4. Tap Reserve in the sticky bottom bar (row 4).
5. The bar shows a loading state while the booking runs (row 5 shows the refund state, not the booking).

### 3.2 Cancel a class booking
1. Open class detail for the booked class (row 5).
2. Confirm the cancel action. A bottom sheet shows a spinner and "We'll refund your 8 credits." (row 5).
3. Do not assume the exact confirm step. It was not visible.

### 3.3 Waitlist
Not observed. The waitlist search did not run.

### 3.4 Reserve a court
1. Pick a date from a horizontal date strip, or from an inline month calendar (rows 37, 36, 38).
2. Pick a time from a vertical list or a two-column grid (rows 37, 38, 35).
3. Pick a duration if needed. Not observed in a court context.
4. Review the summary card and tap the full-width primary button (row 35).

### 3.5 Check in at the front desk
1. Open the pass from a home tab or a pass tab (rows 13, 14, 15, 16).
2. Show a large QR or barcode on a light card or dark full-screen panel (rows 14, 15, 17).
3. Export or add to Wallet is available from the pass sheet (row 14 shows an Export button).
Brightness boost and Wallet behaviour were not observed.

### 3.6 Find a club
1. Open a map-first tab or a search tab (rows 5, 25, 26, 27).
2. Read a bottom sheet of nearby results, or tap a pin to see a summary card (rows 25, 28).
3. Tap a card to open the venue detail page (row 30, 33).
4. Read opening hours in a tab or sheet (rows 29, 32).

### 3.7 Freeze membership
Not observed. The membership search did not run.

## 4. Pattern catalog by area

### 4.1 Today / Home
- Greeting at top, large display type (row 18: "Morning, Alex").
- Ring or progress stats in a header block (rows 19, 23).
- Streak shown as a count next to a flame or leaf icon in the top bar (row 19: flame with "14"). Row 22 shows a seven-day strip with filled dots for done days.
- Stacked cards for the day: programme progress, next scheduled item (row 21).
- Action pills in the header for quick log or start (row 23: Log, Start).
- Tab bar with 4 to 5 items (see section 2).

### 4.2 Schedule
- Horizontal day tabs at the top. The selected day is underlined or filled (rows 1, 2, 37).
- Rows with time at left in bold, duration below in grey, class name bold, instructor below, spots remaining at right (rows 1, 2).
- Day headers inline as section labels ("Today", "Wed 18") (rows 1, 2).
- Favourites list uses the same row with a rating line added (row 6).

### 4.3 Class card (list item)
- Row layout: time, duration, name, instructor, rating, cost or spots (rows 1, 2, 6).
- Status chip above the title for a requirement (row 4: "VACCINATION REQUIRED").
- Photo thumbnails were not clearly shown in the schedule rows. Class-type colour coding was not observed in the schedule rows.

### 4.4 Class detail
- Full-width hero photo at about 40 percent of screen height with a pager "1/4" (row 4).
- Top bar icons: back, share, favourite. Credit cost in the top right (row 4).
- Title in large bold type. Rating line below the title. Venue as a tappable row with a chevron (row 4).
- Date and time line. Instructor name below (row 4).
- Two secondary buttons in a row: Invite and Add to calendar (row 4).
- Description text below. Sticky bottom bar: cost at left, primary button at right (row 4).
- Icon list for duration, level, focus, and space (row 8, Nike Training Club).

### 4.5 Club card
- Photo carousel in a horizontal row with pager dots (rows 27, 30).
- Name, category, rating, and distance on one or two lines (rows 27, 34).
- "Best in class" style badge on top of photo (row 27).
- Saved-by avatars for social proof (row 34).

### 4.6 Club detail
- Title with a small square or rounded photo at the top (row 33).
- Segmented tabs: About, Services, More, Team, Reviews, Other (row 32).
- Opening times as a list. Today's row can be highlighted (rows 29, 32).
- Additional info rows with a leading icon: verified, instant booking, pay in app, wheelchair access, parking (row 32).
- Sticky bottom bar with count at left and primary action at right (row 32).

### 4.7 Map
- Full-bleed map with numbered cluster pins (rows 25, 27).
- Search pill at the top with a filter button (row 27).
- Filter chips in a row: Venues, Best match, Price (row 27).
- Result count label above the list: "51 venues in map area" (row 27).
- Bottom sheet with a grab handle. Sheet has a list or a card carousel (rows 5, 27, 28).
- Map and list toggle in the top bar (row 5, row 27).

### 4.8 Check-in pass
- Large QR in a dashed or white frame on a light sheet (row 14).
- Dark full-screen camera view for scanning (row 13).
- Membership number in very large type on a solid colour panel (row 16).
- Wallet-style card with a logo header, member name, and barcode in a white panel (row 17).
- Member card with brand mark, tier label, and QR block (row 15).
- Primary action in the top right: Add (row 15) or Export at bottom (row 14).

### 4.9 Progress
- Ring charts for steps, sleep, recovery, and strain (rows 19, 23).
- Stat tiles in a 2 by 2 grid with icon and number (row 23).
- Weekly strip with dots for streak days (row 22).
- Mascot-led progress is a playful option (row 20).

### 4.10 Account
- Hero header with the name, email, and tier badge (row 43).
- Grouped white cards with rows. Each row has an icon, label, and trailing value (rows 40, 43).
- Three-button row at top for quick actions: Orders, Settings, Help (row 44).
- Family section with avatar row and an "Add member" circle with count (row 44).
- Family list with role (Admin) under the name, overflow menu per row, pending invite line with inline action (rows 42, 45).
- Destructive action "Delete family" at the bottom in red (row 45).
- Toggle rows for Face ID and live location sharing (rows 40, 42).

## 5. Specific design rules we should adopt

Each rule cites the source row that supports it.

1. Use a horizontal day strip at the top of the Schedule tab. Show today first and seven days in total. Source: rows 1, 2, 37.
2. Use the same row layout for every class: start time at left, duration below, name bold, instructor below, spots left at right. Source: rows 1, 2.
3. Put the spots-left number at the trailing edge of each class row. Show "Full" in place of the number when the class has no spots. Source: rows 1, 2.
4. Keep the class detail hero photo at about 40 percent of screen height. Add a pager when there is more than one photo. Source: row 4.
5. Pin the primary booking action in a sticky bottom bar on the class detail page. Show the cost on the left of that bar. Source: rows 4, 32.
6. Show the instructor name directly under the class title on the detail page. Source: row 4.
7. Show a status chip above the class title for entry rules (for example "Waiver required" or "Under 16 with adult"). Source: row 4.
8. Use two secondary buttons in a row under the detail summary: Add to calendar and Invite a friend. Source: row 4.
9. Show a cancel confirmation as a bottom sheet with the refund amount in plain words. Source: row 5.
10. Use a bottom sheet for pickers of time and date. Do not push a new page for them. Source: rows 36, 39.
11. Use a horizontal date strip with an inline calendar button for court date selection. Source: row 37.
12. Show time slots as a vertical list for courts, with one row per slot. Use a two-column grid only when the slot count is high and each label is short. Source: rows 37, 38.
13. Mark an unavailable date or slot as greyed out and disabled. Do not hide it. Source: row 37 (greyed days 25 to 28).
14. Show an inline error in red under the picker when a time is not allowed. Source: row 36.
15. Show a club's opening hours as a list of all seven days. Highlight today. Source: rows 29, 32.
16. Show a green dot before each open day in the hours list. Use the same dot style for all open days. Source: row 32.
17. Use a segmented control at the top of the club detail page for About, Services, Team, Reviews, and Other. Keep the count at six or fewer. Source: row 32.
18. Show a photo at the top of the club detail page. Keep the photo smaller than the full hero in the class detail. Source: row 33.
19. Use filter chips above the map list: All, Strength, Classes, Cycling, Pools, Courts. Show a result count line above the list. Source: row 27.
20. Show a map with numbered cluster pins and a bottom sheet with a grab handle. Source: rows 25, 27.
21. Show a club summary card when a pin is tapped. The card has the name, a short line, and a primary "Directions" button. Source: rows 25, 28.
22. Show the check-in pass as one full-screen view with a large QR or barcode on a light card. Add a membership number under the code in large type. Source: rows 14, 16, 17.
23. Put the check-in pass action on the Home tab as a visible button in the header. Source: row 19 (header actions), row 23 (header pills). Note: this is a design choice based on these rows.
24. Show a streak count with a flame or leaf icon in the top bar of Home. Source: row 19.
25. Show a weekly streak strip with seven dots. Fill a dot for each day with a visit. Source: row 22.
26. Show progress as rings for each metric (for example visits per week, classes booked). Use one ring per row. Source: rows 19, 23.
27. Use grouped white rows for the account screen. Each row has an icon, a label, and a trailing value or chevron. Source: rows 40, 43.
28. Put family members in a list with avatar, name, and role under the name. Show an overflow menu per row. Source: rows 42, 45.
29. Show a pending invite under the member name with an inline "Send a reminder" action. Source: row 45.
30. Put "Delete family" as a red row at the bottom of the family screen, away from other rows. Source: row 45.
31. Use a primary pill button "Add a family member" at the bottom of the family list. Source: row 45.
32. Use a Tab bar with four or five items. Name each tab with one word. Source: rows 1, 19, 23, 25, 26.

## 6. Anti-patterns to avoid

1. Do not use a custom tab bar that looks like a floating pill with no labels. Use the system tab bar. Mobbin rows 19 and 25 show labelled tabs in the standard position.
2. Do not place a floating round action button over the tab bar as the only way to start a booking. Row 19 uses this for a quick-add menu. Keep it optional.
3. Do not hide the spots-left count. Row 1 and row 2 show it on every row.
4. Do not show a full-screen loading state for a booking. Row 5 shows a bottom sheet with a spinner, which is smaller and reversible.
5. Do not use a plain text cancellation policy without a clear label. Row 12 shows it in a text block at the bottom. Put it near the action and state the fee.
6. Do not place the primary action at the top of a detail page only. Rows 4, 32 use the bottom bar.
7. Do not use a dark background for the schedule list. Rows 1 and 2 use a light list. This is a visual observation, not a tested rule.
8. Do not show the QR pass under a dimmed or tinted overlay. Row 14 shows the pass on a light sheet. Row 5 shows a dimmed sheet during a loading state. Test the pass screen at full brightness before release.
9. Do not use custom bottom navigation that hides the tab label. Row 26 shows labels under each tab.
10. Do not show a map with no list. Row 27 shows a bottom sheet with a list. The list is needed for accessibility and for users who do not want the map.
11. Do not use a dense multi-column grid for time slots when labels are long. Rows 35 and 38 use one or two columns only.
12. Do not use a destructive action without a confirm step. Row 45 places delete at the bottom with red text. Add a confirm sheet.
13. Do not use decorative mascots or illustrations as the main home content for a studio member app. Row 20 uses this style. It is a playful choice that does not fit a serious club brand.
14. Do not leave an empty Upcoming or Schedule state without a next action. Row 3 shows an empty state with an illustration and a "Refer a friend" button, but no direct "Book a class" action. Add a clear primary button.

## 7. Gaps and next steps

- Flow search failed for: class booking flow, waitlist, cancel booking, court reservation, find gym location, freeze membership. Retry these queries later.
- Screen search failed for: class library with category cards, waitlist status screen, membership plan screen, add-to-calendar sheet, and workout activity summary.
- Apps named in the brief that returned no results: Equinox, Barry's, Peloton, Strava, Apple Fitness, Oura, Ladder, F45, Planet Fitness.
- Not observed: Live Activities, Home Screen widgets (only widget-style cards), brightness boost on the pass, Wallet add flow, instructor avatars in a class card, colour per class type.
