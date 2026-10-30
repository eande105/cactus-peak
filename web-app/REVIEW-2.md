# Cactus Peak member web app: design review 2

Reviewed on port 3212 against `DESIGN-DIRECTION.md`, REVIEW-1 and the builder's response. Viewports 1440 and 375 (plus the 800 px pane), light and dark. Members walked: maya, jordan (teen), alicia (parent). Every flow below was done by clicking, with the account menu and Demo tools. Skills loaded: better-interface, make-responsive, web-design-guidelines, dataviz.
Caveat on method: the browser screenshot tool lags by one step, so I confirmed each state with a second screenshot or a DOM read before I wrote it down. I withdrew one finding that way (the offline banner is visible).
Not run: axe, a screen reader, forced-colors, 200 % zoom, the contrast script on pages other than by eye.

## Verdict
- Big step up. Today, Bookings, Billing, Freeze step 2 and the change-plan summary now look like a designed product: one column, hairlines, a real timeline, tabular numerals, state in the row. The account menu, member switch and every Demo tool now work.
- The Schedule is still the weak screen. The list row is still 3 lines and about 90 px on desktop and 160 to 226 px on a phone. The Week view is still lanes of "M..", "C", "Rib R.." with the Saturday column cut off with no cue.
- Four wrong-fact or wrong-rule bugs are new or still open: "a.m.." on Today, a PT "free until yesterday" line, "Next charge Oct 27" after an upgrade, "This starts in 1 min" when the class is on.
- Copper is spent twice on many views (held banner plus Show pass, Choose Trailhead plus Choose Summit plus Switch, Copy link plus Done, Approve x4). Success pages still repeat one boxed template with a mislabelled "Share" heading.
- Distance to a designer-made member app: about 80 %. The rest is mostly row density on Schedule, one success pattern, copper discipline and four copy bugs.

---

# 1. REVIEW-1 items

Status key: builder status as written in BUILD-NOTES "Review 1 response". Verified: yes = I confirmed the fix in the running app; no = not fixed or only partly.

| ID | Builder status | Verified | Note and evidence |
|---|---|---|---|
| S1 copper once per view | fixed | partly | Schedule list rows are outline now. Still two or more copper in: Today with a held spot (Confirm spot + Show pass), Change plan (Choose Trailhead, Choose Summit, then Switch to Summit), Guest pass sent dialog (Copy link + Done), Inbox for a parent (4 Approve buttons), Billing with a failed payment (Update card x2, Update payment method). See N-S1. |
| S2 Today | fixed | yes | One column, live sentence, facts, 2 actions, timeline with the Kids club row, rail with text status. No stat row, no promo, no photos. Remaining: "12:00 p.m." wraps in the 72 px time column at 1440 (N-P1-3), double full stops (N-P0-1). |
| S3 mobile layers | partly | partly | Tab bar hides on `/reserve/*` (yes). Banner is not "one line" on phones: with a payment failure each banner is about 150 px (4 lines + 2 buttons) and two banners stack on `/billing` (N-P1-1). |
| S4 targets and text | partly | no | At 375: List/Calendar 40, Everyone 36, How it works 37, All 36, Give feedback 20, `change` 16, class-title links 18 px. 12 px text still on 107 nodes on Schedule. |
| S5 toasts | partly | partly | Removed: Viewing X, agenda refresh. Still toasts: "A spot opened on your waitlist", "Waiting for Alicia", "Approved. We told them they're booked", "You can now book 9 days ahead", "Clock moved forward". "Waiting for Alicia" has no in-place state (N-P1-5). In-place Cancelled row not built. |
| S6 art | fixed | yes | Coach tiles: initials in a tonal pair, one per coach, look good. Kids and Hub rows are typographic. Class sheet hero still a category scene (acceptable, it is the only art). |
| S7 boxes and rules | partly | partly | Sheet stat list yes; notice icon circles gone. Success pages are still a tinted boxed `dl` + full-width copper + outline Done (N-P1-2). Freeze step 2 table is the right model. |
| S8 dark selection | fixed | yes | Week and Today dark checked; selected = filled foreground. |
| S9 badge contrast | fixed | yes | Tokens `--badge-danger` in `app/globals.css:388-389`; white on #B42318. |
| S10 sticky sub-header | fixed | yes (visual, 1440 and 375) | Opaque, jump links 44 px tall on phone. |
| P0-1 account menu crash | fixed | yes | Opens, groups work, switch member to Jordan, Alicia, Maya all worked, Appearance and all Demo tools ran. Two small faults: the menu stays open after a member switch, and "Go offline" never flips to "Go online" (N-P1-6). |
| P0-2 chart empty | fixed | yes | `/progress` bars 88/70/2/70/35/2/2 px, table toggle present. The sentence says Monday and Tuesday but Thursday is also 4 (P2). |
| P0-3 partner validation | fixed | yes (code, `courts-page.tsx:88`) | Member must match a roster name. Not clicked in browser. |
| P0-4 stale cancel line | fixed | partly | `cancelNote` is used on Today, courts, confirmed. Not used in the PT review step (`training/book-page.tsx:121`) or the lane confirm (`reserve/lanes-page.tsx:92`). PT now says "Free to cancel or move until 1:00 p.m. Mon, Oct 26" for a session today at 1:00 p.m. (N-P0-2). |
| P0-5 teen reserve | fixed | yes | Jordan opens `/reserve/courts`, picks a slot, "Ask Alicia" dialog, request sent, Alicia sees it in Inbox and approved it, Jordan's request flips to Approved. "Waiting for Alicia" is only a toast (N-P1-5). |
| P0-6 plural and countdown | fixed | yes | "2 of 3 visits", "1 week" fine; no "1 weeks" found. |
| P0-7 double full stops | fixed | **no** | Still on Today: "Desert Flow Yoga tomorrow 9:30 a.m..", "Free to cancel until 7:30 a.m..", "Confirm by 6:04 a.m.. If you do nothing", "Kids club ... today 4:00 p.m.." (N-P0-1). |
| P0-8 week view | partly | **no** | Still lanes with names cut to "M..", "C", "Rib R..". Saturday cut off with no cue (grid 1400 px in 1112 px). "Now 5:41" label sits on top of blocks. `?view=week` is lost when a block opens the sheet (the list shows behind the sheet). See N-P0-3. |
| T-1 to T-3, T-5 to T-7 | fixed | yes | Hero card gone, kids row in agenda, no passkey item, no promo. |
| T-4 banner height transition | not fixed | no | Confirm spot: banner vanishes, page jumps up 80 px. The row shows "Booked" with no flash. Live region says "Spot confirmed." (good) (N-P2-1). |
| T-5 skeleton | "no skeleton" | **no** | Today is clean, but `/bookings` shows "Loading your bookings..." with 5 identical bars on every hard load; also the schedule sheet "Checking availability...", `/inbox`, `/progress`, `/family`, `/reserve/courts`. Files: `bookings-page.tsx:117,187`, `schedule-page.tsx:108,154`, `session-detail.tsx:57`, `inbox.tsx:87`, `progress-page.tsx:50`, `family-page.tsx:62`, `courts-page.tsx:140`. |
| T-8 payment banner tone | partly | yes | Day 0 amber at the top, red-tinted in-page banner on `/billing`: they disagree (N-P1-1). |
| SC-1 compact row | fixed | **no** | Desktop row about 90 px, 3 lines (name + chips, studio/coach/intensity, "First-timers welcome · Teen OK"). Phone 157 to 226 px. See N-P0-4. |
| SC-2 booked triangle | fixed | partly | "Booked" button still carries a warning triangle; the second line "Cancelling now is a late cancel." is there. Triangle on an outline button reads as an error. |
| SC-3 booked fill | fixed | yes | Left rule only. |
| SC-4 zero-count filters | fixed | yes | Court 0 gone. |
| SC-5 header meta | fixed | yes | One muted line. |
| SC-6 sheet | fixed | partly | The tab title stays "Cactus Peak Athletic" on the sheet and on every booking step page (`/training/.../book`, `/schedule/[id]`). Add to calendar / Invite are cut off under the sticky footer at 900 px height. |
| SC-7 context menu, preview card | not fixed | no | Not built. Low value; drop from spec or build. |
| B-1, B-2 | fixed | yes | Chips only on Held; one meter line. A "Class" / "Kids club" / "Lane" chip still sits on every row (redundant: the page is about bookings; delete the chip on class rows). Cancel is no longer red. |
| B-3 clear date | not fixed | n/a | Needs product decision. |
| R-1 hub | fixed | not walked | |
| R-2 court names | not fixed | no | Rows are "Court 1 to 4" on desktop and phone (`courts-page.tsx`, `slot-grid.tsx`). |
| R-3, R-4, R-5, R-8 | fixed | yes (R-3/R-4/R-5 seen on courts) | Hatch cells without lock, scroll hint text, 60 min default. |
| R-6 confirmation | partly | **no** | Same boxed template (see N-P1-2). |
| R-7 kids step 1 | fixed | not walked | |
| C-1 to C-3 | not fixed | n/a | Not touched. |
| TR-1 | fixed | yes | Coach list rows; initials tile. Row has no price or Book action and the right 35 % of the page is empty at 1440. |
| TR-2 | fixed | yes | |
| PR-1, PR-2 | fixed | yes | One sentence, "Goal 12 a month, 14 done." |
| M-1 | fixed | yes | "Your plan" tag; sticky summary. The empty box "Pick a plan to see the cost." remains until a pick (fine) but the "-$25" price formatting is wrong (N-P1-8). |
| M-2 freeze with failed payment | fixed | yes | Form shown disabled, reason and Update card in a banner. Two banners stack again. |
| M-3 | fixed | yes | |
| M-4, F-1, BL-1, I-1, ST-1, WL-1 | not fixed | no | F-1: add-member is still a 55 % empty page with a progress rule that does not advance between steps 2 and 3. I-1: Approve books at one tap, no confirm, no Undo. BL-1: failed-payment day has 3 copper actions. |
| PA-1 | fixed | not walked | |
| AU-1 demo hint, theme flash | partly | partly | The `/sign-in` hint is hidden, but `/sign-in/verify` still prints "Demo tip: 000000 shows the error." in the product (`app/(auth)/sign-in/verify/page.tsx:38`). |
| P2-1, P2-2 | fixed | partly | The avatar is borderless; the bell is still a bordered box. |
| P2-4, P2-9, P2-10 | fixed | not checked | |
| P2-3, P2-5 to P2-8, P2-11 to P2-13 | not fixed | n/a | |

---

# 2. New issues, ranked

## P0: wrong fact or wrong rule shown to the member

### N-P0-1. "a.m.." double full stop is still everywhere (P0-7 not closed)
- Routes: `/today` (headline, cancel line, held banner), `/bookings`, any member with a next class. Seen: "Climb Cycle ... 9:30 a.m..", "Free to cancel until 7:30 a.m..", "Confirm by 6:04 a.m.. If you do nothing", "Kids club, Theo and Ivy today 4:00 p.m..".
- Cause: `fmtTime()` in `lib/time.ts:40-44` returns a string ending in "a.m." or "p.m." and the template then adds ".".
- Files: `components/today/today-page.tsx:79` (`${label(next)} ${whenText(...)}.`), `:108` (`Confirm by {fmtTime(...)}.`), `lib/engine.ts:206` (cancelNote text) plus the code that appends ".", `lib/data/seed.ts:176`.
- Fix: add `endSentence(s)` in `lib/time.ts`: `s.replace(/\.+$/, ".")` and wrap it around each sentence that ends with a time. Also read the sentence out loud: "Desert Flow Yoga tomorrow at 9:30 a.m." (add "at"). Add a unit test that scans rendered Today text for `/\.\./`.

### N-P0-2. PT review says "Free to cancel or move until 1:00 p.m. Mon, Oct 26" for a session today at 1:00 p.m.
- Route: `/training/coaches/sam-okafor/book` step 3 (booked 7 h before start). File: `components/training/book-page.tsx:121`; also the confirm page shows no rule at all.
- Why it matters: the member thinks they can still move it and will lose the session (rule: 24 h for PT).
- Fix: use `cancelNote(s, me.id, slot, now, "pt")` here and in the success panel (`extra`). In the late case the line reads "This starts in 7 h 15 min. Moving or cancelling now uses the session." (warning tone, same helper as courts). The engine currently returns only "Moving now uses the session." for PT; add the time to it. Same fix for lanes: `reserve/lanes-page.tsx:92` hard-codes "Free to cancel until {start - 2 h} Late cancels count as strikes." with a missing full stop and no late check.

### N-P0-3. Week view is still not readable (P0-8 open)
- Route `/schedule?view=week` at 1440 (light and dark). Files: `components/schedule/week-grid.tsx`, `schedule-page.tsx`.
- What I saw: titles "M..", "C", "Clim..", "Rib R.."; concurrent classes still split a column into 2 to 3 lanes of 30 to 60 px; the grid is 1400 px wide in a 1112 px frame and Sat/Sun is cut off with no fade or scrollbar cue (a "content past a scroll edge, no cue" failure); the "Now 5:41" tag overprints the Tue 6 a.m. block; the grid scrolls inside a `max-h-[70vh]` box inside the page (scroll trap); opening a block loses `?view=week`.
- Fix (pattern: the Google-Calendar-style 7-column grid is the wrong tool for a club timetable; the right one is an hour-by-day matrix where a cell lists classes as lines):
  1. Make columns 5 days at a minimum of 180 px each (Today plus 4), with prev/next by day, not by week, and a real fade (24 px gradient) on the clipped edge. 7 days only above 1600 px.
  2. Delete the lane split. Each hour band is a row. Inside a day cell, every class in that hour is one 24 px line: `time  Name  4 left`. Hour band height grows with the number of classes. Category = 3 px left rule, no tinted fill.
  3. Remove the `max-h-[70vh]` and let the page scroll; make the day header sticky (`top-14`).
  4. Move "Now 5:41" to the hour gutter (a 1 px line across the day column with a dot in the gutter, label left of the grid).
  5. Pass `view=week` through to `/schedule/[sessionId]` (`router.push(\`/schedule/${id}?view=week\`)`) and render the same underlay in `app/@modal/...` (intercepted route).
  6. Drop the Week toggle if time does not allow: the list is the better answer to "what is open at 7". Keep Week only as a secondary view.

### N-P0-4. Schedule list row is still 3 lines and about 90 px (160 to 226 px on phones)
- Route `/schedule` (default view). File: `components/booking/class-row.tsx:29` (`md:grid-cols-[72px_3px_minmax(0,1fr)_120px_136px]`), plus the chips and the third flags line.
- At 1440 an 11-class day takes 1000 px of list and each row carries: name, category chip, studio, coach, intensity ribs+word, flags line, spots meter + word, 136 px outline "Book". At 375 the first screen shows two classes (rows 157, 226, 211, 191 px).
- Fix: one line of meta on desktop: `7:00 a.m. | stripe | Climb Cycle  Devon Hart · Cycle Studio · Moderate ▮▮▮▯▯ | 11 left | Book`. Move "First-timers welcome · Teen OK" to the sheet and to a filter. Row height 56 px (padding `py-2.5`). Delete the category chip (the stripe and the filter already say it). On phones: line 1 `7:00 a.m.  Climb Cycle  Book`; line 2 `Devon Hart · Cycle Studio · 11 left`; 72 px per row. Make "Book" a text button (`variant="ghost"` with a 44 px hit area and a copper text colour only when `featured`) so the right edge reads as a column, not 11 boxes.

### N-P0-5. "Next charge Oct 27 · $245.00" after upgrading to Summit
- Route: `/membership/change-plan` success (after "Switch to Summit"). File: `components/membership/change-plan.tsx:69`: `fmtDayShort(imp?.on ?? pv?.next ?? now)`. For an upgrade `imp` and `pv` are unset so it falls back to `now`.
- The summary just before said "Next charge Nov 12 · $245.00" and the cancel page says Nov 12.
- Fix: use the household's next billing date (`hh.nextBillingAt` or the same value the preview used, `pv!.next`) and unit test that the confirmation equals the preview. Also the downgrade price: `components/membership/change-plan.tsx:122` prints "$-25 per month, starts Nov 12". Use `fmtDelta()` that prints "-$25 a month, from Nov 12" and "+$50 a month from today".

### N-P0-6. "This starts in 1 min. Cancelling now counts as a late cancel" is printed while the class is on
- Route `/today` after "Move the clock forward 1 hour" (headline reads "Climb Cycle is on. 2 minutes left." and the line under it still says "starts in 1 min"). File: `lib/engine.ts:197-205`: `Math.max(1, Math.round((start - now)/MIN))`.
- Fix: in `cancelNote`, if `now >= start` return `{ late: true, text: "Started. Cancelling now counts as a late cancel (strike 2 of 3)." }`; in the in-progress state of Today replace the whole line with "In progress. Show pass at the desk." (the cancel rule is irrelevant after start).

## P1: strong LLM look, state in the wrong place, copy

### N-P1-1. Two payment banners on `/billing` and `/membership/freeze`, with different colours (T-8, S3)
- Route `/billing` with "Fail my payment (day 0)": the global banner (amber) and an in-page banner (red-tinted, adds "Card declined.") say the same sentence with the same two actions, and the page has a third copper button "Update payment method". At 375 the two banners take 330 px of an 812 px screen. Same on `/membership/freeze`.
- Files: `components/app/banners.tsx` (global), `components/billing/billing-page.tsx` (page-level `Banner`), `components/membership/freeze.tsx`.
- Fix: the global banner is the only one. On pages that own the problem (`/billing`, `/membership/freeze`, `/billing/payment-method`) the global banner is hidden and the page shows one in-place line beside the payment method (`Card declined Oct 27. Update card · Try again`). One tone for the state (warning to day 5, destructive from day 6). On phones: one line, `Payment failed. Update card` plus one text action, 48 px max.

### N-P1-2. One boxed "success" template for every confirmation, with a mislabelled "Share"
- Routes: `/training/coaches/*/book` (done), `/membership/change-plan` (done), `/membership/freeze` (done), `/family/add` (step 5), the class sheet ("You're booked"), `/reserve/confirmed/[id]`.
- File: `components/booking/success-panel.tsx` (comment at line 11 calls it "The one confirmation pattern"). It is a tinted boxed `dl`, a green check, a pill, a full-width copper button, then a heading `Share` (line 35 is a button called Share, rendered above Get directions / Message / Club details) and a full-width outline Done.
- Why: boxes with a tinted fill and radius is the pattern the direction forbids; "Share" above "Get directions" is wrong; the copper button is "Back to Membership" or "Resend invite later" (a wrong primary action).
- Fix: title = the fact ("Sam Okafor, Tue 1:00 to 1:45 p.m."), `dl` with hairlines and no fill, one copper action only when it is the next step (Add to calendar), links as text rows (arrow right), no "Share" label, no Done button (Esc and the back link do it), cancel or move rule directly under the title using `cancelNote`.
- On `/family/add` step 5 the copper button reads "Resend invite later" right after the invite was sent (`components/family/add-member.tsx:103`). Make the primary "Go to family" and put "Resend invite" in the row menu on `/family`.

### N-P1-3. Today time column wraps "12:00 p.m." (and "12:00" over "p.m.")
- Route `/today` at 1440 (also `/schedule`, `/inbox`). File `components/today/today-page.tsx:152,170`: `grid-cols-[72px_3px_...]` with `text-body-strong`. Fix: `grid-cols-[88px_3px_...]` and `whitespace-nowrap` on the time, or shorten to "12:00 p" (no: keep the period). Same column in `class-row.tsx:29`.

### N-P1-4. Fake loading screens remain on every hard load (T-5)
- See the table. Local data does not need them: delete `loading` from `bookings-page.tsx:117`, `inbox.tsx:87`, `progress-page.tsx:50`, `family-page.tsx:62`, `courts-page.tsx:140`, `session-detail.tsx:57` and the `Suspense fallback` in `schedule-page.tsx:154`, `bookings-page.tsx:187`. If SSR needs a fallback, render the page chrome (title, tabs) with an empty list that fills in; never five identical bars with a status line.

### N-P1-5. State in a toast instead of the page: "Waiting for Alicia", "A spot opened", "Approved", "You can now book 9 days ahead"
- `/reserve/courts` (teen): after "Send request" the grid still shows the slot as "selected" and the CTA still reads "Ask Alicia" (a second tap re-sends), the only sign is a 5 s toast "Waiting for Alicia".
- Fix: replace the CTA bar content with "Waiting for Alicia. Court 1, Tue 6:00 a.m. Held until Wed 5:44 a.m." and a quiet "Cancel request"; mark the cell "Asked" (dashed outline). Add the "Waiting for Alicia" pill on the booking row in `/bookings` (still missing). In Alicia's inbox the row already says "Approved." so delete the toast.
- `components/app/shell.tsx:~129`: the Demo tool "Open a spot on my waitlist" shows a toast and a banner; keep the banner only.

### N-P1-6. Demo tools state is not shown
- `components/app/shell.tsx:~120-126`: "Go offline" never becomes "Go online"; "Reset demo data" does not clear offline and gives no feedback (the page silently resets). The member-switch radio leaves the menu open after it navigates.
- Fix: `Menu.CheckboxItem` "Offline" with a check; `closeOnClick` on the member radios; after reset `announce` and show "Demo data reset" as a status line in the menu footer for 2 s. Also drop the "Move the clock forward 1 hour" toast: the Today page already changes.

### N-P1-7. Copper twice on one view (S1)
- `/today` with a held spot: Confirm spot and Show pass are both copper. Show pass is copper even when the class is 36 h away (teen and Alicia: "Show pass" copper for tomorrow's class). Rule: Show pass copper only inside 60 min of start; otherwise outline. Held banner: Confirm spot copper, and Show pass outline when a hold exists.
- `/membership/change-plan`: "Choose Trailhead" and "Choose Summit" both copper in the header, and "Switch to Summit" copper in the summary. Make the header buttons outline "Choose"; only the summary button is copper.
- Guest pass sent dialog: "Copy link" copper and "Done" copper. Copy link outline, Done copper.
- `/inbox` (parent): 2 rows x (Approve copper in the list) + (Approve copper in the detail). Approve is outline in the list; the detail pane has the one copper. Better: drop the master-detail on desktop for one list, and open a confirm sheet (I-1) with the class, time, cost "No charge" and a note.
- `/membership/cancel` step 3: "Keep my membership" (copper) and "Cancel membership" (deep red) are neighbours of nearly the same value. Keep (outline) and Cancel (destructive, solid), so the destructive treatment is distinct and the safe action is not louder than the rule requires. Spec says equal size; equal size is kept, equal hue is not required.

### N-P1-8. Semantic colour misuse on the cancel summary
- `/membership/cancel` step 3, `components/membership/cancel.tsx:87`: five bullets each with a red X (`text-destructive`). "Your visit history is available to download" and "No annual fee in March" are not losses; red X says error. Replace with a plain list with hairlines and no icons, or a 4 px dash in muted text; reserve red for the Cancel button.

### N-P1-9. Add member: right half empty, 3 of 5 steps carry one sentence (F-1)
- `/family/add`: Step 3 "Invitation" is one paragraph on an empty page; the progress rule jumps 20 %, 40 %, 40 % (step 2 and 3 the same width), 80 %, 100 %. DOB hint shows "Format: 2015-03-14" (a child's date) while adding an adult; the emergency-contact note appears for adults.
- Fix: merge steps 2 and 3 (details + "We email sam@... an invite" line at the bottom), 4 steps total, progress = step/total; a two-column layout (form 520 px + live "New monthly total $195, charged today $20.13" panel in the right column, plain text, no fill). Hint text by role.

### N-P1-10. `/sign-in/verify` still prints "Demo tip: 000000 shows the error." (AU-1)
- File: `app/(auth)/sign-in/verify/page.tsx:38`. Show only with `?demo=1`.

### N-P1-11. Schedule sheet and booking steps keep the title "Cactus Peak Athletic"
- Routes `/schedule/[sessionId]` (sheet and page), `/training/coaches/[slug]/book`, `/reserve/confirmed/[id]`. Set `document.title` ("Climb Cycle, Wed 7:00 a.m." / "Book Sam Okafor"). The sheet footer clips "Add to calendar / Invite a friend" at 900 px height: move them into the "More" menu as REVIEW-1 SC-6 said.

### N-P1-12. Mobile Bookings loses the timetable
- `/bookings` at 375: time stacks above the name and "Details" is a full-height button on its own row; each booking is 150 to 190 px. Keep the 72 px time column at 375 (`72px 3px 1fr auto`), put the chevron in the row and make the row the button; expand inline. Targets: List/Calendar 40, Who 36, How it works 37, All 36, Give feedback 20 (`min-h-11`).

### N-P1-13. Disabled Book buttons offline carry no reason
- Offline, Today and Schedule show faded "Book" buttons with only a `title`. The banner says "Booking is off until you're back." That is good; also show the same words as a tooltip-free `aria-describedby` and keep the `Try again` action. Fine on desktop; at 375 the banner is hidden under the stacked header when the page is scrolled. Pin it or leave as is.

## P2: polish

- **N-P2-1** Banner removal on Confirm spot jumps 80 px (T-4). Animate height 150 ms; add a 600 ms `primary-subtle` flash on the row that turned "Booked". Live region already says "Spot confirmed."
- **N-P2-2** Chip "Class" on every row of `/bookings` (`components/bookings/bookings-page.tsx`). Delete it for classes.
- **N-P2-3** Freeze success shows a stray "Freeze scheduled" pill under the Done button (duplicate of the title pill). Delete it.
- **N-P2-4** Header at 800 px: search is truncated ("Search classes, club...") and the bell and help are bordered boxes. Make bell and help borderless icon buttons (P2-2) and hide the Pass text under 900 px.
- **N-P2-5** Progress sentence "Monday and Tuesday mornings" while Thursday = Tuesday = 4. Say "Monday most".
- **N-P2-6** Calendar dot markers on `/training/.../book` are 3 px red dots with no legend. Use 6 px dots and the text "open times" in the legend.
- **N-P2-7** Court rows "Court 1..4" (R-2): add "Court 3 · basketball" and indoor/outdoor.
- **N-P2-8** Cancel step 2 ("Options"): the two small outline buttons plus two big buttons below = 4 buttons. "Switch to Trailhead" should show the saving; the copy says "$54 per month" for a Summit member without the difference.
- **N-P2-9** `/guest-passes`: the lone gift icon in a dark square next to "1 of 1 left" is the "icon in a tinted square" tell. Delete it.
- **N-P2-10** `/sign-in` first paint dark then light (flash) was not re-checked in a cold load; confirm with `data-theme` in `app/layout.tsx` (theme script).

---

# 3. Flow walks (clicked, not edited)

| Flow | Result |
|---|---|
| Switch member from the account menu (Maya, Jordan, Alicia, Maya) | Works, routes to `/today`, announces "Now viewing as X". The menu stays open after a switch. Teen and parent Today are correct but copper "Show pass" for a class 36 h away. |
| Waitlist, offered, 30-minute hold, Confirm spot | Demo tool "Open a spot" produced "Spot held ... Confirm by 6:11 a.m." and a 30:00 countdown (good). Confirm on Today and on the Bookings row both worked; the row becomes "Booked" with no flash and the live region says "Spot confirmed". Banner jump 80 px. Double full stop in the banner copy. |
| Move the clock forward 1 hour | Works. Held spot expired and left Today with no message (add an Inbox item and a one-line "Your hold on Switchback HIIT ended at 6:10 a.m." in Needs attention). Class started: wrong cancel line (N-P0-6). |
| PT booking | Steps 1 to 3 and done work. Wrong 24-hour rule line (N-P0-2). Step 2 loses the chosen time; show "Tue Oct 27, 1:00 p.m." as a heading line on every step. Raw-looking radios at 16 px. Pack count 5 to 4 updated. |
| Guest pass send | Dialog works, state in place, balance 1 to 0, new row in Sent. Two copper buttons in the result. Visit date defaults to the same Saturday as an existing pass. |
| Add member (adult) | 5 steps work; money maths correct ($20.13 = 39 x 16/31). Progress rule bug, empty step 3, wrong primary on step 5 (N-P1-9, N-P1-2). |
| Change plan (Ridge to Summit) | Summary panel is good; prorated $25.81 correct; confirmation shows wrong "Next charge Oct 27" (N-P0-5). No Undo for an upgrade (spec allows none; fine) but the toast is noise. |
| Cancel membership, steps 2 and 3 | Works; I did not confirm cancel. Red X bullets, near-identical button colours (N-P1-7, N-P1-8). |
| Freeze (3 steps, then confirm) | Works; step 2 table is the best page in the app. Success state shows a banner with "Cancel freeze". With a failed payment the form is disabled with the reason. |
| Billing with failed payment (day 0) | Invoice table is good (Failed pill with icon and word). Two banners and three copper buttons (N-P1-1). |
| Alicia's approvals | Teen request appears in her Inbox, Approve works, the row turns to "Approved." in place and the teen's request resolves. One-tap approve with no confirm (I-1). |
| Demo tools | Open waitlist spot, +1 hour, fail payment (day 0), clear, offline (banner, disabled Book, "Offline: live count unavailable."), reset: all run. Offline label never flips; reset keeps offline (N-P1-6). Day 9 not run. |
| Keyboard | 27 Tabs from Today reached "Clubs" in the sidebar: focus ring is 2 px light blue, visible in dark. Sidebar is before main content (skip link exists). Not run: week grid arrows, grid cell Enter, Escape on sheet. |
| Live regions | `role=status` polite regions announce "Spot confirmed.", "Court 1 selected, 6:00 a.m. to 7:00 a.m.", "Today page loaded". No assertive region seen for errors (P2-12 open). |
| 44 px targets (375) | Failing: List/Calendar 40, Everyone 36, How it works 37, All 36, `change` 16, class links 18 (in a larger row), Give feedback 20. |

---

# 4. Judgement against the direction (the "avoid" list)

- Today: now a real one-glance page. Keep. Remaining smell: two copper buttons; a tinted banner block above the greeting.
- Schedule: list is the least designed screen. Boxes in the right column (11 outline Book buttons at 136 px) read as a column of widgets, not a timetable. Week: see N-P0-3.
- Confirmations: one tinted boxed template, green check on every flow, full-width copper + outline Done. This is the strongest remaining "template" tell.
- Forms and steps: raw 16 px radios with small hint text, progress rules, a left column with the right half empty (Add member, Cancel, Training steps). Use a two-column step layout (form left 520 px, live summary right).
- Photo and art: the coach initial tiles, kids list and hub are good. Do not add more.
- Copy: specific (names, dates, prices). Bugs only: "a.m..", "$-25", "Resend invite later", "Next charge Oct 27".
- Radius: still one 8 px everywhere (buttons, inputs, chips, banners). Tags and chips `rounded-xs` (4 px), banners and success blocks 0 radius with a hairline.
- Colour: category colours on stripes are right. Red used for X bullets and for the Cancel button; amber used for the banner and for the "late cancel" lines; keep amber for time rules and red for the one destructive action.

# 5. Keep (do not undo)

- Today layout (live sentence, facts, 2 actions, timeline with Kids club, text status rail, attention list).
- `/bookings` timetable, late-cancel meter line, Held row with countdown and Release, expand-in-row Details with Cancel inside.
- Held-spot copy and the 30-minute countdown; "Spot confirmed." live announcement.
- Account menu with Switch member, Appearance and Demo tools; the demo clock.
- Freeze step 2 "What changes" table. Change-plan comparison table and the sticky "Summit · $129 per month" summary with proration lines.
- Billing page: Next charge, invoice table with word + icon status, right-aligned money, "Expires next month" chip.
- Guest pass page and dialog (labels, "Uses 1 of 1 included passes", result in place).
- Coach list (initials in tonal pairs), coach profile ("A first session looks like"), booking steps.
- Progress: one sentence summary, visits-by-day bars with table toggle, "Goal 12 a month, 14 done."
- Courts grid with hatch for taken, scroll hint, teen read-only with "Ask Alicia" dialog, offline banner copy, Focus ring, Archivo/Inter hierarchy, `tabular-nums`.

Report file: `/Users/ethanhanderson/Documents/Development/git480/cactus-peak-build/web-app/REVIEW-2.md`
