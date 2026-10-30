# Cactus Peak Athletic — Member web app: content, accessibility and states

Citation tags are defined in `01-product-and-ia.md`. Button labels, state words and dialog buttons for shared components are the ones in the shared spec (`../01-shared-brand-components-part2.md` §7–§10). This file adds the app-only strings and does not redefine the shared ones. Voice comes from brand guidelines §8 ("a steady coach who knows your name") and `00-foundation.md` §1.
Example facts: today = Tue, Oct 27, 2026; Maya's billing day = the 12th; phone "(480) 555-0142" is a fictional placeholder for the club front desk.

## 1. Writing rules for the interface

1. Write short sentences. One idea per sentence. Use active voice.
2. Start buttons with a verb: "Book", "Freeze membership". Never "Submit", "OK", "Yes" or "No" alone.
3. Use sentence case. Use numerals for numbers (5 clubs, 6:00 a.m., 2 hours).
4. Time format: `6:00 a.m.`, ranges `6:00–6:45 a.m.` (en dash), dates `Tue, Oct 27`, ranges `Oct 26 – Nov 1`. Always Arizona time; say "Arizona time (no daylight saving)" under pickers.
5. Club names: "Mesa – Dobson", "Gilbert – Val Vista" (en dash, spaces).
6. Money: plans with a unit ("$79 per month"); invoices with cents ("$156.00"). Never a bare price (W §5 a2).
7. Say what happened, then what to do (brand §8). Never blame the member. Never write "Oops", "Uh-oh" or exclamation marks.
8. Say what the cost or consequence is **before** the member confirms (G r18).
9. Left-align anything longer than one line (W §5 a10).
10. Warmth, not hype. A little dry humour about the heat is allowed in empty states and success messages. Never in errors, billing, late cancels, freeze or cancel membership.
11. Name the thing: "Climb Cycle, Tue 6:00 a.m." not "your class".
12. Units follow equipment: bikes, spots, mats, places (lanes), courts.
13. Do not use the words: crush, no excuses, beast, grind, burn, smash, "journey". Do not shame rest days or missed visits.
14. Screen-reader text is as clear as visible text. Do not rely on icons alone.

## 2. Microcopy library

### 2.1 Buttons and links
| Context | Label |
|---|---|
| Book | Book · Book session · Book kids club (state labels from `BookingStateButton`: Book · Booking… · Booked · Join waitlist · On waitlist #3 · Confirm spot · Full · Booking paused · Ridge only · Started · Try again) |
| Reserve | Reserve Court 3 · Reserve Lane 3 (the button names the choice) |
| Waitlist | Join waitlist · Confirm spot · Release · Leave waitlist · Pick another class |
| Cancel booking | Keep my spot · Reschedule instead · Cancel booking · Cancel and pause booking |
| Pass | Show pass · Add to Apple Wallet · Add to Google Wallet |
| Calendar | Add to calendar · Copy link · Subscribe · Reset link |
| Plan | Change plan · Choose Summit · Switch to Summit · Switch to Trailhead · Keep Ridge · Your plan · Compare plans |
| Freeze | Freeze membership · Not now · Cancel freeze · Resume membership · Resume early |
| Cancel membership | Keep my membership · Continue to cancel · Cancel membership · Download my visit history (CSV) |
| Payment | Update payment method · Save card · Try card again · Pay $156.00 now · Add a backup card · Download invoice |
| Guest pass | Send a guest pass · Send guest pass · Pay $20 and send · Buy a guest pass · Resend · Cancel pass |
| Family | Add · Add Noah · Set up Noah's pass · Resend invite · Remove Noah |
| Teen | Ask Alicia · Send request · Approve · Decline |
| Flow | Continue · Back · Skip · Skip for now · Done · Try again · Close |
| Inbox | Mark all read · Mark as read · Message Sam · Message the front desk |
| Notifications | Remind me · Turn on push · Send test notification |
| Sign in | Continue with email · Sign in with a passkey · Use a password instead · Resend code · Use a different email · Sign in · Sign out |
| Schedule | Today · Choose date · Filters · Clear all · Clear filters · Show as table |
| Clubs | Use my location · Set as my club · View club · Directions · Call |

### 2.2 Field labels, help and placeholders
| Field | Label | Help / placeholder |
|---|---|---|
| Email | Email | placeholder `you@example.com` |
| Code | 6-digit code | "From the email we just sent." |
| Visits per week | Visits per week | "Rest days count too." |
| Guest name | Guest's name | |
| Guest contact | Guest's email or mobile number | "We send the pass here." |
| Visit date | Visit date | "Within 14 days." |
| Notes to coach | Anything your coach should know? | "Injuries, goals, what to avoid. Only your coach and club staff see this." |
| Allergy notes | Allergies and medical notes | "We share these with kids club staff." |
| Cancel reason | Why? (optional) | |
| Card number | Card number | autocomplete `cc-number` |
| Players | How many players? | "2 to 4 for pickleball." |
| Start date (freeze) | Start on | "We need 30 days' notice, so the earliest start is Dec 12." |
| Home club | Home club | "We show this club first." |

### 2.3 Confirmations (toasts and success panels)
| Event | Title | Description / action |
|---|---|---|
| Booked | Booked: Climb Cycle, Tue 6:00 a.m. | [Undo] (10 s) |
| Booked (panel) | You're booked | "Tue, Oct 27 · 6:00–6:45 a.m. · Cycle Studio · Gilbert – Val Vista" |
| Cancelled (on time) | Cancelled: Climb Cycle, Tue 6:00 a.m. | [Undo] |
| Cancelled (late) | Cancelled. 2 late cancels in 30 days. | "The next one clears on Nov 26." |
| Waitlist joined | You're 3rd on the waitlist | "We'll tell you if a spot opens." |
| Left waitlist | You left the waitlist | [Undo] |
| Confirmed held spot | You're booked | "Rib Rack Strength, Thu 6:00 a.m. Cancelling now counts as a late cancel." (only if under 2 h) |
| Released | Released | "You're off the waitlist for this class." |
| Court reserved | Court 3 is yours | "Sat, Oct 31 · 8:00–9:30 a.m. · Mesa – Red Mountain" |
| Lane reserved | Lane 3 is yours | "Wed, Oct 28 · 6:00–6:45 a.m. · Mesa – Dobson" [Undo] |
| Kids club | Theo and Ivy are booked | "Sat, Oct 31 · 8:00–10:00 a.m. · Gilbert – Val Vista. Check in before drop-off." |
| PT booked | You're booked with Sam | "Thu, Nov 5 · 10:15 a.m. · Mesa – Dobson" |
| Guest pass sent | Pass sent to Pat | "Valid until Nov 10." |
| Member added | Noah is on your plan | "Adds $19 per month." |
| Invite sent | Invitation emailed to chris@example.com | |
| Plan changed | You're on Summit | "Next charge Nov 12 · $206.00." |
| Downgrade scheduled | Changing to Trailhead on Nov 12 | [Undo change] |
| Freeze set | Freeze set: Dec 12 – Jan 11 | "You can cancel it any time before Dec 12." |
| Freeze cancelled | Freeze cancelled | "You're active as usual." |
| Resumed | Welcome back | "Your pass works again." |
| Cancellation set | Your membership ends Dec 12 | "You keep full access until then." |
| Cancellation undone | Welcome back | "Your membership continues." |
| Card updated | Card updated: Mastercard ending 0937 | |
| Payment recovered | Paid. Your membership is active. | "$156.00 · Visa ending 4821" |
| Preferences | Saved | inline, not toast |
| Link copied | Link copied | |
| Calendar link reset | Calendar link reset | "Update the link in your calendar app." |
| All read | All caught up | [Undo] |

### 2.4 Dialogs
| Dialog | Text |
|---|---|
| **Cancel (on time)** | Title "Cancel your spot in Climb Cycle?" (class and time under it) · First line "You can cancel for free until 4:00 a.m. You can rebook until it fills." · Optional radios: Schedule changed / Feeling unwell / Injury / Booked by mistake / Other · Buttons stacked: **Keep my spot** (filled) · **Reschedule instead** (outline; only if the class runs again this week) · **Cancel booking** (quiet danger text) |
| **Late cancel** | Title "This is a late cancel" · "Cancelling now adds 1 late cancel to your account." · Red X lines, each with words: "Counts as a strike (2 of 3 in 30 days)" · "Your spot goes to the next person on the waitlist" · "3 strikes in 30 days pause booking for 3 days" · "This one clears on Nov 26." · Buttons stacked: **Keep my spot** · **Reschedule instead** · **Cancel booking** |
| **Late cancel, final strike** | Extra X line: "This is your 3rd late cancel in 30 days. Booking pauses for 3 days, until Fri, Oct 30 at 9:12 a.m. You can still cancel bookings and check in." · Last button reads **Cancel and pause booking** |
| **Kids club cancel** | "Cancel Theo and Ivy's kids club block? It's free. Please cancel at least 2 hours before so another family can use the spots." · Keep my spot · Cancel booking |
| **Join waitlist** (shared dialog) | Title "Join the waitlist for Rib Rack Strength" · "You are 4th in line. If a spot opens, we hold it for you. You get a push and 30 minutes to confirm. We stop moving people up 1 hour before class. Late cancels count as strikes." · Checkbox, shown every time: "I understand the late-cancel rule." · "Join waitlist" stays disabled until the box is ticked · Link "Pick another class" · Notify me by: Push, Email · Change |
| **Conflict** | "You're booked for Desert Flow Yoga at 6:30 a.m. Climb Cycle starts at 6:00 a.m. and ends at 6:45 a.m. Replace it?" · Keep Yoga · Book Climb Cycle instead (replacing cancels the first with no strike if it was more than 2 hours away) |
| **Freeze confirm (narrow screens)** | Bottom sheet with a pause icon: "Freeze your membership?" · "Your plan pauses Dec 12 and returns Jan 12 at $156.00 per month." · **Freeze membership** (filled, full width) · "Not now" (text link) |
| **Plan change summary** | Subtotal · "Today's total $25.81" · "The new monthly charge starts Nov 12." · Buttons: **Keep Ridge** (outline, left) · **Switch to Summit** (filled, right) |
| **Remove member** | "Remove Noah from your plan? His access ends Nov 12. His bookings after that date are cancelled with no late-cancel strike. We don't refund this month." · Keep Noah · Remove Noah |
| **Cancel freeze** | "Cancel your freeze? Your freeze starts Dec 12. Cancelling means you stay active and pay $156.00 on Dec 12 as usual." · Keep freeze · Cancel freeze |
| **Resume early** | "Resume today? You'll pay $80.52 for the rest of this cycle. Your pass works right away." · Not now · Resume membership |
| **Cancel pass** | "Cancel this pass? Pat won't be able to use this link. We'll return the pass to your balance." (bought pass: "We'll refund $20.00.") · Keep pass · Cancel pass |
| **Sign out everywhere** | "Sign out on all devices? You'll need to sign in again on each one." · Cancel · Sign out everywhere |
| **Leave unsaved** | "Leave without saving? Your changes to Noah's profile will be lost." · Keep editing · Leave |
| **Hold ending (court, kids club, PT)** | "1 minute left. We're holding Court 3 for you." · Let it go · Add 5 minutes (once) |
| **Hold ended** | "Your hold ended. The court is open to others. Pick it again?" · Close · Pick again |
| **Step-up** | "Confirm it's you · Sign in again to change billing." · Continue with email · Use a passkey |

### 2.5 Cancel and freeze membership copy (no dark patterns)
| Screen | Copy |
|---|---|
| Entry (collapsed block) | Title "Cancel membership" · "Cancel with 30 days' notice. You keep full access until your end date." |
| Step 1 | "Before you go, tell us why. It's optional." · Skip · Continue |
| Offer (Too expensive) | "Trailhead is $54 per month and covers one home club." · "Or freeze for $10 per month, 1 to 3 months." · Keep my membership · Continue to cancel |
| Offer (Injury or health) | "Freeze for $10 per month while you recover. Your streak and plan stay." |
| Offer (Moving) | "Moving to another club? Ridge covers all 5 clubs." |
| Offer (Not using it) | "Freeze for $10 per month. We'll remind you 7 days before it ends." |
| Offer (Schedule) | "Try a new time. These classes have spots this week." (3 classes) |
| Confirm | Title "Cancel your membership?" · "Your membership ends on Dec 12. You keep full access until then." · What ends, each line with a red X and words (mobbin-standard-pass §2 rule 28) · **Keep my membership** and **Cancel membership**, two full buttons of equal size |
| Done | "Your membership ends Dec 12." · "We emailed your receipt." · "Changed your mind? You can keep your membership until Dec 12." |
| Never write | "Are you sure you want to give up?" · "You'll lose everything." · "Don't go!" · timers · pre-ticked boxes |
| Freeze step 2 lines | Pass: "Your pass pauses for everyone on your plan." · Bookings: "Bookings inside the freeze are cancelled with no late-cancel strike." (or "You have no bookings in this time.") · Kids club, courts, lanes: "Reservations in this time are cancelled." · Guest passes: "Guest passes pause. Passes you sent for these dates are cancelled and returned." · Training: "Sessions in this time are cancelled. Your credits come back and your pack dates move out by the length of the freeze." · Billing: "You pay $10.00 on Dec 12. Your normal price of $156.00 returns on Jan 12." · Family: "The freeze applies to everyone on your plan." |

### 2.6 Errors
Rule: say what happened, then what to do. State "nothing changed" only if true.

| Code | Where | Copy |
|---|---|---|
| `CLASS_FULL` | Book | "That class is full. Join the waitlist or pick the 7:00 a.m. class." (If no other time: "That class is full. Join the waitlist, or see other times.") |
| `SLOT_TAKEN` | Court, lane, PT | "Court 3 was just booked. Pick another time." / "That time was just booked. Pick another time." |
| `WINDOW_CLOSED` | Book | "Saturday classes open Wed, Oct 28 at 6:00 a.m. We can remind you." |
| `BOOKING_PAUSED` | Book | "Booking is paused until Fri, Oct 30, 9:12 a.m. because of 3 late cancels in 30 days. You can still check in and cancel." |
| `PLAN_REQUIRED` | Courts, other clubs | "Courts come with Ridge and Summit. Compare plans." / "Trailhead books at Mesa – Dobson only. See Ridge." |
| `AGE_RESTRICTED` | Book | "Climb Cycle is for ages 13 and up." |
| `TEEN_APPROVAL` | Teen | "This needs Alicia's OK. Ask her?" |
| `CONFLICT_OVERLAP` | Book | See conflict dialog |
| `LIMIT_REACHED` | Court, waitlist | "You already have a court on Sat, Oct 31. You can have one per day." / "You're on 5 waitlists. Leave one to join another." |
| `HOLD_EXPIRED` | Keep spot | "Your hold ended. We offered the spot to the next person." |
| `FROZEN` | Book | "Your membership is frozen until Jan 11. Resume to book." |
| `PAYMENT_BLOCK` | Book (day 8+) | "Update your card to book. Your bookings are safe." |
| `PAYMENT_DECLINED` | Card | "Your bank declined this card. Try another card or call your bank." |
| `CARD_EXPIRED` | Card | "That card has expired. Use a card that's valid after Oct 2026." |
| `CARD_INCOMPLETE` | Card | "Check the card number." |
| `ZIP_MISMATCH` | Card | "The ZIP code doesn't match the card." |
| `PAYMENT_REQUIRES_ACTION` | Card | "Your bank needs to confirm it's you. Follow the steps in the window." |
| `AUTH_CODE_INVALID` | Sign in | "That code isn't right. Check the 6 digits, or send a new one." |
| `AUTH_CODE_EXPIRED` | Sign in | "That code expired. We sent a new one." |
| `AUTH_LINK_USED` | Sign in | "This link was already used. Enter the code from the same email, or ask for a new link." |
| `AUTH_LOCKED` | Sign in | "Too many tries. Wait 15 minutes, or call (480) 555-0142." |
| `GUEST_IS_MEMBER` | Guest pass | "Pat Lowe is already a member. They don't need a pass." |
| `PASS_NONE_LEFT` | Guest pass | "You've used your guest pass for this month. A pass costs $20 per guest." |
| `FORBIDDEN` | 403 | "You don't have access to this page." + reason |
| `RATE_LIMITED` | Any | "You're going fast. Wait a moment and try again." |
| `NETWORK` | Any write | "We couldn't reach the server, so nothing was changed. Try again." |
| `NETWORK` | Any read | "We couldn't load this. Check your connection and try again." |
| `UNKNOWN` | Any | "Something went wrong on our side. Try again, or call (480) 555-0142." + error id |
| `OFFLINE` | Banner | "You're offline. Showing what we saved. Booking is off until you're back." |

### 2.7 Validation messages
| Rule | Message |
|---|---|
| Required | "Enter your {field}." (e.g. "Enter your email.") |
| Email format | "Check the email address. It should look like you@example.com." |
| Phone | "Check the mobile number. Use 10 digits." |
| DOB | "Enter a date like 03/14/2015." |
| Child age | "Noah is 11, so he joins as a child. Adults are 18 and over." |
| Players | "Add at least 2 players." |
| Visit date | "Pick a date in the next 14 days." |
| Notes length | "Keep notes under 500 characters." |
| Photo | "Use a photo of your face, at least 400 px wide." |

### 2.8 Status pills (icon + text)
Active · Frozen · Freeze scheduled · Payment failed · Ends Dec 12 · Changing on Nov 12 · Invited · Invite expired · Paid · Pending · Failed · Refunded · Booked · Held · On the waitlist · Full · Cancelled · Attended · Late cancel · Missed · Sent · Opened · Used · Expired · Home · Teen OK · First-timers welcome · Live · Open now · Closed now · Closes 10:00 p.m.

### 2.9 Busyness and capacity words
Levels (F §2): **Quiet** (1) · **Light** (2) · **Steady** (3) · **Busy** (4) · **Packed** (5). Intensity (F §3): **Easy** (1) · **Light** (2) · **Moderate** (3) · **Hard** (4) · **All-out** (5).
Capacity: "12 spots left" · "4 bikes left" · "1 spot left" · "Full · 3 waiting" · "Lane 3, 1 of 2 swimmers".
Hint patterns: "Busier 6:00–7:00 a.m. Quieter after 8:30 a.m." · "Busiest 5:00–7:00 p.m."

### 2.10 Alt text rules
Photos of places: describe the scene in 8–14 words ("Cycle studio at dawn, rows of bikes facing a tall window"). Instructor and member faces: empty `alt=""` when the name is next to the photo; otherwise the name. QR code: `alt="Check-in code for Maya Brandt, updates every 60 seconds"`. Category and ribs icons: text beside them; icon `aria-hidden`. Charts: `aria-label` plus the table alternative.

---

## 3. Empty states per page

Each uses `EmptyState`: icon or small line art, headline, one line, one primary button (W §3.9: Customer.io, Sprig). Left aligned, 560 px max.

| Page / block | Headline | Line | Button |
|---|---|---|---|
| Today (nothing booked) | Nothing booked today. | "Gilbert – Val Vista has 14 classes today." | Browse today's schedule |
| Today (new member) | Your first week starts here. | "Pick something easy. These are good for first-timers." | See first-timer classes |
| Schedule (no filter match) | No classes match | "Try removing 'Hard' or pick another day." (shared `no-results`) | Clear filters |
| Schedule (empty day) | No classes on Sunday | "Try Monday. 11 classes start at 5:00 a.m." (shared `empty-day`) | See Monday |
| Schedule (closed day) | Gilbert – Heritage is closed | "Opens 4:30 a.m." (shared `club-closed`); holiday: "Closed on Thu, Nov 26. Mesa – Dobson has a holiday schedule." | See tomorrow / Switch club |
| Schedule (not open) | Nov 4 classes open Wed, Oct 28 at 6:00 a.m. | "We can remind you." | Remind me |
| Session not found | That class has ended. | "See what's on today." | See today's schedule |
| Bookings: Upcoming | No classes booked yet | "Pick a class and we'll save your spot." (shared `no-bookings`) | Book a class |
| Bookings: Waitlist | You are not on any waitlists | "Full class? Join its waitlist and we will book you if a spot opens." (shared `no-waitlist`) | Browse today's classes |
| Bookings: Past | No past classes yet | "Your finished classes will show here." (shared `no-past`) | — |
| Reserve (locked) | Courts come with Ridge and Summit. | "Trailhead covers pools and classes at your home club." | Compare plans |
| Reserve (no facility) | No courts at Mesa – Downtown. | "Mesa – Red Mountain has 6 pickleball courts." | Switch to Red Mountain |
| Courts (reservations list) | No court reservations | "Courts open for booking 3 days ahead." (shared `no-reservations`) | Reserve a court |
| Courts (all taken) | Every court is taken on Sat, Oct 31. | "Try Sunday, or Mesa – Dobson." (the shared grid empty line for a day with none open: "No courts open on this day. Try Thursday.") | See Sunday |
| Lanes (all taken) | All 8 lanes are taken at 6:00 a.m. | "Try 6:45 a.m." | Pick 6:45 a.m. |
| Lanes (no pool) | No pool at Mesa – Downtown. | "Mesa – Dobson has a 25-yard lap pool and a warm-water pool." | Switch to Dobson |
| Kids club (no children) | No children on your plan yet. | "Add a child to book kids club." | Add a child |
| Kids club (no kids club) | No kids club at Mesa – Downtown. | "Gilbert – Val Vista, Mesa – Dobson and Mesa – Red Mountain have one." | Switch club |
| Clubs (no match) | No club matches. | "Clear a filter." | Clear filters |
| Club detail (no pool/courts) | No pool or courts at this club. | — | — |
| Club detail (no coaches) | Coach profiles are coming soon | (shared `no-coaches`; informational, no button) | — |
| Training (no sessions) | No sessions yet. | "Pick a coach to start." | Find a coach |
| Training (no openings) | No open times with Sam in the next 14 days. | "Try Elena, or message the front desk." | See other coaches |
| Progress (new) | Your first visit starts the streak | "Show your pass at the front desk." (shared `no-visits`) | Show my pass |
| Family (alone) | It's just you for now. | "Add a partner or a child." | Add a member |
| Billing (no invoices) | Your invoices will show here after your first charge. | — | — |
| Guest passes (none sent) | No guest passes sent yet. | "Bring a friend this month." | Send a guest pass |
| Inbox: All | You're all caught up. | — | — |
| Inbox: Needs action | Nothing needs you right now. | — | — |
| Inbox: Messages | No messages yet. | "Message a coach from their profile." | Find a coach |
| Notifications popover | You're all caught up. | "New alerts show here." | Open inbox |
| Command menu | No results for "cyle". | "Try "cycle"." | — |
| Search/help | No answers for "{query}". | "Message the front desk. We're staffed 6:00 a.m.–8:00 p.m." | Message the front desk |
| Frozen (Today, Membership) | Your membership is frozen until Jan 11 | "Booking opens again then." (shared `frozen`) | Manage freeze (and "Resume early") |
| Teen (billing) | Your parent manages billing. | "Ask Alicia, or send her a note." | Message Alicia |
| 404 | We couldn't find that page. | "Try search, or go back to Today." | Back to Today |
| Offline | You are offline | "We will update this list when you reconnect." (shared `offline`) | Try again |
| Error | We could not load this | "Check your connection and try again." (shared `error`) | Try again |

Light humour allowed once per page: Aqua-heavy pages ("Pool's 82° and the shade sails are up." for Red Mountain club status in summer); Schedule early hours ("Early bird? Gilbert – Heritage opens at 4:30 a.m.").

---

## 4. Notification copy

Channels: Push (browser), Email, Text, In-app. Defaults: ✔ on, — off, ● always on. Timing is server-side. Quiet hours (default 9:00 p.m.–5:00 a.m.) hold everything except held-spot and same-day class alerts. Subject lines start with the key fact.

| Event | Push title / body | Email subject | In-app | P / E / T | When |
|---|---|---|---|---|---|
| Booking confirmed | — | "Booked: Climb Cycle, Tue 6:00 a.m." | "Booked: Climb Cycle, Tue 6:00 a.m." | — / ✔ / — | Now |
| Class reminder | "Climb Cycle at 6:00 a.m." / "Cycle Studio · Gilbert – Val Vista · Bike 14" | — | same | ✔ / — / — | 60 min before (setting: 30/60/120) |
| Class changed | "Climb Cycle moved to 6:15 a.m." / "Now with Devon Hart. Tap to review." | "Your Tuesday class changed" | same | ✔ / ✔ / — | Now |
| Class cancelled by club | "Climb Cycle on Thu was cancelled" / "No late-cancel strike. See other times." | "Climb Cycle on Thu was cancelled" | same + button "See other times" | ✔ / ✔ / ✔ | Now |
| Waitlist joined | — | — | "You're 3rd on the waitlist for Rib Rack Strength, Thu 6:00 a.m." | — | Now |
| **Spot held** | "A spot opened in Rib Rack Strength" / "Thu 6:00 a.m. It's yours for 30 minutes. Tap Confirm spot." | "A spot opened: confirm Rib Rack Strength by 6:05 a.m." | Needs-action row with [Confirm spot] | ✔ / ✔ / ✔ | Now |
| Hold ending | "10 minutes left to keep your spot" / "Rib Rack Strength, Thu 6:00 a.m." | — | updates row | ✔ / — / — | 10 min before expiry |
| Hold ended | — | — | "Your hold ended. We offered the spot to the next person." | — | At expiry |
| Waitlist closed | "The Rib Rack Strength waitlist is closed" / "Open spots show as drop-in spots. Check back before class." | — | same | ✔ / — / — | 1 h before start |
| Promotion skipped | — | — | "We skipped your waitlist spot: you're booked at that time." | — | When skipped |
| Booking window opens (reminder) | "Saturday classes open at 6:00 a.m." / "Tap to browse." | — | — | ✔ / — / — | 5 min before |
| Late cancel recorded | — | "Late cancel recorded: 2 of 3" | "Late cancel: 2 in the last 30 days. This one clears Nov 26." | — / ✔ / — | Now |
| Booking paused | "Booking is paused for 3 days" / "Until Fri, Oct 30, 9:12 a.m. You can still check in." | "Booking is paused until Fri, Oct 30" | banner | ✔ / ✔ / — | Now |
| Pause ended | "Booking is back on" | — | — | ✔ / — / — | At end |
| Private feedback prompt | — | — | "How was Climb Cycle?" (Great / Fine / Not for me; private, no stars) | — | 30 min after class ends; expires in 7 days |
| Missed class | — | "You missed Climb Cycle" (next morning) / "That counts as a late cancel." | same | — / ✔ / — | 6:00 a.m. next day |
| Court invite | "Linda invited you to pickleball" / "Sat 8:00 a.m., Mesa – Red Mountain, Court 3." | "Linda invited you to play Sat, Oct 31" | [Accept] [Can't make it] | ✔ / ✔ / — | Now |
| Court invite response | — | — | "Pat accepted. 3 of 4 are in." | ✔ / — / — | Now |
| Court reserved | — | "Court 3 is yours: Sat, Oct 31, 8:00 a.m." | — | — / ✔ / — | Now |
| Court reminder | "Pickleball at 8:00 a.m." / "Court 3 · Mesa – Red Mountain" | — | — | ✔ / — / — | 2 h before |
| Kids club booked | — | "Theo and Ivy: kids club Sat 8:00 a.m." | — | — / ✔ / — | Now |
| Kids club reminder | "Kids club at 8:00 a.m." / "Check in at Gilbert – Val Vista first." | — | — | ✔ / — / — | 90 min before |
| Kids club parent not checked in | "Please check in so Theo can join" | — | — | ✔ / — / ✔ | Block start + 5 min |
| PT booked | — | "Booked with Sam: Thu, Nov 5, 10:15 a.m." | — | — / ✔ / — | Now |
| PT reminder | "Training with Sam tomorrow, 10:15 a.m." | — | — | ✔ / ✔ / — | 24 h before |
| Coach cancelled | "Sam can't make Thu 10:15 a.m." / "Your credit is back. Pick a new time." | "Sam can't make Thursday" | [Pick a new time] | ✔ / ✔ / — | Now |
| Coach message | "Sam: {first 60 characters}" | — | thread | ✔ / — / — | Now |
| Guest pass sent | — | "Pass sent to Pat" | — | — / ✔ / — | Now |
| Guest pass opened / used | "Pat used your guest pass" / "Gilbert – Val Vista · 9:12 a.m." | — | — | ✔ / — / — | Now |
| Guest pass expiring | "Pat's pass expires in 2 days" | — | — | ✔ / — / — | 2 days before |
| Family invite | — | "Maya added you to Cactus Peak Athletic" | — | — / ● / — | Now |
| Invite accepted | "Chris joined your plan" | — | — | ✔ / ✔ / — | Now |
| Teen request | "Jordan asked to join Teen Strength" / "Approve?" | "Jordan asked to join Teen Strength" | [Approve] [Decline] | ✔ / ✔ / — | Now |
| Teen request result | "Alicia approved Teen Strength, Wed 4:30 p.m." / "Alicia said not this time." | — | same | ✔ / — / — | Now |
| Plan upgraded | — | "You're on Summit" (receipt) | — | — / ● / — | Now |
| Downgrade scheduled | — | "Changing to Trailhead on Nov 12" | banner | — / ● / — | Now; reminder 7 days before |
| Freeze scheduled | — | "Freeze set: Dec 12 – Jan 11" | banner | — / ● / — | Now |
| Freeze reminder | "Your freeze starts in 7 days" | "Your freeze starts Dec 12" | — | ✔ / ✔ / — | 7 days before |
| Freeze ending | "Your freeze ends in 7 days" / "Your plan returns Jan 12 at $156.00." | same | — | ✔ / ✔ / — | 7 days before end |
| Cancellation set | — | "Your membership ends Dec 12" | banner | — / ● / — | Within 1 min |
| Cancellation reminder | — | "Your membership ends in 7 days. Keep it any time before Dec 12." | — | — / ✔ / — | 7 days before end |
| Payment failed (day 0) | "Your Nov 12 payment didn't go through" / "Update your card to keep booking." | "Your Nov 12 payment didn't go through" | banner + [Update card] | ✔ / ● / ✔ | Day 0 |
| Payment retry (day 3, day 6) | "We'll try your card again" / "You have 4 days of full access left." (day 3) · "Last try tomorrow" (day 6) | "Update your card to keep booking" | banner | ✔ / ● / ✔ | Days 3 and 6 |
| Booking paused (day 8) | "New bookings are paused" / "Update your card. Your bookings are safe." | same | banner | ✔ / ● / ✔ | Day 8 |
| Payment succeeded | — | "Receipt: $156.00 paid" | toast if in app | — / ● / — | Now |
| Card expiring | "Your card expires next month" | "Visa ending 4821 expires 11/26" | [Update card] | ✔ / ✔ / — | 45 days before |
| Annual fee notice | — | "The $49 annual facility fee is charged in March" | — | — / ● / — | 14 days before |
| Member turning 18 | — | "Jordan turns 18 on Dec 3" | — | — / ● / — | 30 days before |
| Security: new device | — | "New sign-in on Chrome, Mesa AZ" | — | — / ● / — | Now |

---

## 5. WCAG 2.2 AA checklist

Level A and AA. "Where" points to the page or component to test. Test with: axe in CI, keyboard only, VoiceOver + Safari, NVDA + Firefox, TalkBack + Chrome, 200 % and 400 % zoom, forced colors, reduced motion.

### 5.1 Perceivable
| SC | Requirement | How this app meets it | Where to test |
|---|---|---|---|
| 1.1.1 Non-text content | Text alternatives | Alt rules in 2.10; QR has a text alternative (member number); charts have table alternatives | Pass, PopularTimesChart, class mix |
| 1.2.x Time-based media | Captions | No video in the app v1. If added: captions required | — |
| 1.3.1 Info and relationships | Structure in markup | One `h1` per page; heading order; landmarks `banner`, `navigation`, `main`, `complementary`, `contentinfo`; `Field` links label, help and error; tables use `th scope`; grids use `grid` roles | All |
| 1.3.2 Meaningful sequence | DOM order = visual order | Sticky bars sit last in DOM but are reachable; panel content order matches the visual order | Panel, schedule |
| 1.3.3 Sensory characteristics | No "click the green button" | Instructions use names | All copy |
| 1.3.4 Orientation | Portrait and landscape | No lock | All |
| 1.3.5 Identify input purpose | `autocomplete` | `name`, `email`, `tel`, `bday`, `cc-number`, `cc-exp`, `cc-csc`, `postal-code`, `username webauthn`, `one-time-code` | Sign in, profile, card |
| 1.4.1 Use of colour | Not by colour alone | Category = colour + icon + name; busyness = ribs + word; spots = number + unit; booked = check + word; states have icons | Schedule, grids |
| 1.4.2 Audio control | No auto audio | None | — |
| 1.4.3 Contrast (minimum) | 4.5:1 text, 3:1 large | Role pairs pass (Theme `contrast-report.md`). White on copper 4.95:1. Copper as text uses `link` (5.61:1 on Sand). Muted text 4.77:1 minimum. Category colours are checked in the shared spec (part 1, §2.2): Mind & Body `#52684A` and Court `#7F6019` were adjusted, and Strength text uses Copper Deep `#9E4522`. Category-coloured text is allowed only on `surface`, `background` and their tints, never on `surface-muted` | All; category tokens |
| 1.4.4 Resize text | 200 % | Rem units; layout reflows; Settings "Large" text sets root 18 px | All, 200 % |
| 1.4.5 Images of text | None | Logos are the exception | — |
| 1.4.10 Reflow | 320 CSS px, no 2-D scroll | Sidebar becomes Drawer; grids switch to lists; wide tables become cards. The week grid and comparison table scroll inside their own `ScrollArea` only above 1024 px; below, they change form | Schedule, plans, courts |
| 1.4.11 Non-text contrast | 3:1 for controls, focus, states | `border-strong` 3:1+; selected cells use 2 px `primary` border; free-slot green dot has text label | Forms, grids |
| 1.4.12 Text spacing | User spacing overrides | No fixed heights on text containers; cards grow | All |
| 1.4.13 Content on hover or focus | Dismissible, hoverable, persistent | Tooltips and PreviewCards open on focus, stay while pointer is over them, close with Esc | Tooltip, PreviewCard |

### 5.2 Operable
| SC | Requirement | How | Where |
|---|---|---|---|
| 2.1.1 Keyboard | All functions by keyboard | Section 6. No drag-only controls. | All |
| 2.1.2 No keyboard trap | | Dialogs trap focus by design and release on close/Esc | Dialogs |
| 2.1.4 Character key shortcuts | Single-key shortcuts can be turned off or need a modifier | All global shortcuts use ⌘/Ctrl. Component-scoped arrow keys apply only when the widget has focus | Global |
| 2.2.1 Timing adjustable | Warn and extend | Court/PT slot hold: warning at 1 minute and one extension of 5 minutes. The 30-minute waitlist hold is a fairness rule: announced at 10 min and 1 min, cannot be extended (essential). Sessions: step-up before expiry | Reserve |
| 2.2.2 Pause, stop, hide | | Live spots flashes stop after 600 ms; no auto-advancing carousels; skeleton shimmer is under 5 s and off with reduced motion | Schedule |
| 2.3.1 Three flashes | None | | — |
| 2.4.1 Bypass blocks | Skip link | "Skip to main content" first tab stop; landmark navigation | AppShell |
| 2.4.2 Page titled | | `document.title` = "Schedule · Cactus Peak Athletic" | All |
| 2.4.3 Focus order | | Panel focus: title first, close button last in order but reachable; focus returns to the trigger | Panels |
| 2.4.4 Link purpose | | Link text names the target ("Popular times"), not "Click here"; icon buttons have `aria-label` | All |
| 2.4.5 Multiple ways | | Sidebar, ⌘K, search in Help, breadcrumbs | — |
| 2.4.6 Headings and labels | | Visible labels on every control | Forms |
| 2.4.7 Focus visible | | Monsoon Sky 2 px ring, offset 2 px, on every focusable part including scroll areas and grid cells | All |
| **2.4.11 Focus not obscured (min)** | Focused element not hidden by sticky UI | `scroll-padding-top: 80px`, `scroll-padding-bottom: 96px`; sticky action bars never cover the focused field (the page scrolls it above the bar) | Panels, grids, forms |
| 2.5.1 Pointer gestures | No multi-point gestures | Map uses +/− buttons; no pinch-only | ClubMap |
| 2.5.2 Pointer cancellation | Up-event activation | Buttons activate on click | All |
| 2.5.3 Label in name | Accessible name contains visible label | "Book" button has an `aria-label` that starts with "Book" ("Book Climb Cycle, 6:00 a.m.") | Rows |
| 2.5.4 Motion actuation | None | | — |
| **2.5.7 Dragging movements** | Alternative to drag | Slider has +/− buttons and number input; no drag-and-drop anywhere | Intensity filter |
| **2.5.8 Target size (min)** | 24×24 CSS px minimum | Controls are 44×44 px; inline links in text have 24 px line height | All |

### 5.3 Understandable
| SC | Requirement | How | Where |
|---|---|---|---|
| 3.1.1 Language of page | | `<html lang="en-US">` | All |
| 3.1.2 Language of parts | | Not needed (English only) | — |
| 3.2.1 On focus | No context change | Focus never navigates or opens dialogs | All |
| 3.2.2 On input | No surprise change | Filter changes update the list in place and announce the result count; no auto-submit that moves the page. Club switch is explicit and announced | Filters |
| 3.2.3 Consistent navigation | | Sidebar order fixed | AppShell |
| 3.2.4 Consistent identification | | Same icon + label for the same action everywhere (Cancel booking, Add to calendar) | All |
| **3.2.6 Consistent help** | Help in same place | Help menu in the top bar on every page; Help in sidebar footer; same order of options | AppShell |
| 3.3.1 Error identification | | Text error under the field + summary at top of long forms with links to fields; `aria-invalid` | Forms |
| 3.3.2 Labels or instructions | | Labels above fields; formats shown | Forms |
| 3.3.3 Error suggestion | | Messages give the fix ("It should look like you@example.com") | Forms |
| 3.3.4 Error prevention (legal, financial) | Reversible, checked, confirmed | Payments, plan change, freeze, cancel, PT pack: review step with totals + explicit confirm; undo or reinstate windows | Billing flows |
| **3.3.7 Redundant entry** | Don't ask twice | Emergency contact prefilled; billing details reused; guest contact remembered; onboarding prefilled from the join | Family, guest, onboarding |
| **3.3.8 Accessible authentication (min)** | No cognitive test | Passkey, magic link, copy-paste code allowed, password managers allowed; no CAPTCHA puzzles; paste not blocked | Sign in |

### 5.4 Robust
| SC | Requirement | How | Where |
|---|---|---|---|
| 4.1.2 Name, role, value | | Use Base UI / Graphical primitives (roles, states built in); `ReservationSlotGrid` is a `radiogroup` of `radio` cells (shared §8.2); `ScheduleWeekGrid` follows the ARIA APG grid pattern; `aria-pressed`, `aria-selected`, `aria-current`, `aria-expanded` set | All |
| 4.1.3 Status messages | Announce without focus | `role="status"` for toasts, saved text, results count, live region for spots summary, hold countdown milestones; `role="alert"` for errors that block | Toasts, grids |
| (4.1.1 removed in WCAG 2.2) | | — | — |

### 5.5 Other accessibility commitments
- **Dark mode:** all pairs re-checked in dark. QR keeps a white quiet zone.
- **Forced colors:** borders use `CanvasText`; selected cells keep a 2 px outline; icons use `currentColor`.
- **Large text for Ron and Linda:** Settings > Display > Text size "Large" (18 px root). The sidebar labels never truncate: they wrap to two lines. Court grid on reflow shows the time-first list.
- **Phone support:** the Help menu shows the club phone number on every page.
- **Screen-reader live regions:** one polite region in `AppShell` for route changes and summaries; toasts have their own region; hold countdown uses a separate region at 10-minute, 1-minute and expiry marks only.
- **Autofill:** never block browser autofill or paste on any field (WCAG 3.3.8 and 3.3.7).
- **Cognitive load:** one primary action per view; plain words; consequences first; progress shown on every multi-step flow.
- **Release gate:** no release with open axe criticals, keyboard blockers, or contrast fails. Manual SR pass on Sign in, Schedule, Book, Cancel, Reserve court, Pay, Freeze, Pass each release.

---

## 6. Keyboard map

### 6.1 Global
| Keys | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus. First stop: "Skip to main content" |
| `Ctrl/⌘ + K` | Open command menu |
| `Ctrl/⌘ + /` | Open keyboard shortcuts dialog |
| `Ctrl/⌘ + B` | Toggle sidebar (shadcn default) |
| `Esc` | Close the top-most popover, drawer, dialog, menu or command menu; focus returns to the opener |
| `F6` | Move focus to the toast region (if supported) and back |
| `Enter` / `Space` | Activate buttons; `Space` toggles checkboxes and switches |
No single-letter shortcuts (WCAG 2.1.4).

### 6.2 Components
| Component | Keys |
|---|---|
| **Sidebar / menus** (`Menu`, `ContextMenu`) | `↑` `↓` move, `Home` `End` first/last, `Enter` activate, `→` open submenu, `←` close submenu, type-ahead letters, `Esc` close |
| **ClubSwitcher** | `Enter`/`↓` open; type to filter; `↑` `↓` choose; `Enter` select; `Esc` close |
| **CommandMenu** | Type to search; `↑` `↓` select; `Enter` run; `Ctrl/⌘ + Backspace` clear; `Esc` close; `Tab` moves to group filter chips if present |
| **Tabs / ToggleGroup / RadioGroup** | `←` `→` (or `↑` `↓` for vertical) move; `Home` `End`; `Space`/`Enter` select |
| **ScheduleDayStrip** | `←` `→` move between days; `Home`/`End` first/last visible day; `Enter` select; `PageUp`/`PageDown` previous/next week; disabled days are focusable with a tooltip explaining "Opens Wed, Oct 28 at 6:00 a.m." |
| **Schedule list** | `Tab` through rows (each row is one tab stop: the row link); inside row `Tab` reaches the Book button; `Enter` on row opens panel |
| **ScheduleWeekGrid** (`grid`, roving tabindex) | `↑` `↓` previous/next class in the day; `←` `→` same time in previous/next day; `Home` `End` first/last class of the day; `PageUp` `PageDown` previous/next week; `Enter` open panel; `Esc` in panel returns to block |
| **Court and lane grid** (`ReservationSlotGrid`, one `radiogroup` "Choose a court and start time"; shared §8.2) | Arrow keys move through cells in reading order (`←` `→` time, `↑` `↓` court); `Home` `End` first/last time in row; `PageUp` `PageDown` ±3 hours; `Space`/`Enter` select (range shown); `Esc` clear selection; `Tab` leaves the group |
| **Duration chips** (`DurationChips`) | `←` `→` move; `Space`/`Enter` select (single choice) |
| **Lane grid** | Same as court grid. "Any lane" is a button before the grid |
| **Calendar** | `←` `→` day; `↑` `↓` week; `PageUp` `PageDown` month; `Shift+PageUp/Down` year; `Home` `End` week start/end; `Enter` select; `Esc` close popover |
| **Combobox / Autocomplete** | Type to filter; `↓` open list; `↑` `↓` options; `Enter` select; `Esc` close; `Backspace` removes last chip |
| **Select** | `Enter`/`Space`/`↓` open; type-ahead; `↑` `↓`; `Enter` select; `Esc` |
| **Slider** | `←` `→` ±1; `PageUp` `PageDown` ±1 step big; `Home` `End` min/max; +/− buttons alternative |
| **NumberField (players)** | `↑` `↓` ±1; `Home` `End` min/max; typed digits allowed |
| **OTPField** | Type digits; paste fills all 6; `Backspace` moves back; auto-submit on 6th |
| **Dialog / AlertDialog / Drawer** | Focus moves into the dialog (first field, or the safe button on AlertDialog); `Tab` cycles inside; `Esc` closes (not on AlertDialog during "pending"); focus returns to opener |
| **Session panel** | On open, focus goes to the panel title; `Tab` order: close, facts, instructor, accordion, other times, action bar; `Esc` closes and returns focus to the row/block |
| **Toast** | `Tab` to Undo/Close inside the region; `Esc` dismisses the focused toast |
| **Accordion / Collapsible** | `Enter`/`Space` toggle; `↑` `↓` between triggers; `Home` `End` |
| **Data table (invoices)** | `Tab` through sort headers and rows; `Enter` open invoice; download button is a normal tab stop |
| **Carousel** | `←` `→` move when focused; arrows are buttons; no auto-advance |
| **Map** | Pins are tab stops after the list; `Enter` select; `+`/`−` buttons zoom; when the map has focus, arrows pan |
| **Pass** | `Tab` to member switcher and wallet button; QR is not interactive |

### 6.3 Focus management rules
1. Route change: focus moves to `<h1>` (tabindex −1); announce title in the live region.
2. Opening any overlay: focus first useful element; closing returns focus to the opener.
3. After deleting or cancelling an item in a list: focus moves to the next row (or the list heading if none).
4. After an optimistic rollback: focus returns to the control that failed.
5. Never move focus on live updates (spots left, busyness).
6. Disabled controls with a reason use `aria-disabled="true"` (stay focusable) and a tooltip; real `disabled` is used only when no explanation helps.

---

## 7. Landmarks, names and live regions

| Region | Role / name |
|---|---|
| Skip link | `a` "Skip to main content" |
| Top bar | `banner` |
| Sidebar | `navigation` "Main" |
| Tab bar (mobile) | `navigation` "Primary" |
| Main | `main` |
| Filters | `complementary` "Schedule filters" (or `form` with label) |
| Panel | `dialog` (non-modal on desktop `role="dialog"` `aria-modal="false"`; modal on mobile) labelled by title |
| Bell popover | `region` "Notifications" |
| Live regions | `status` global polite · `status` toast · `alert` errors · `status` spots summary (throttled 10 s) · `status` hold countdown (milestones) |
| Slot cells | `radio` inside a `radiogroup`; names such as "Court 3, 7:00 to 8:00 a.m., available" (shared §8.2); app additions in `04-components.md` D.17 |
| Charts | `figure` with `figcaption`, plus table |

Accessible names for repeated buttons include the item: "Book Climb Cycle, 6:00 a.m." (shared `BookingStateButton` pattern; the visible label "Book" is the start of the name; WCAG 2.5.3).

---

## 8. Revision log

### Revision 2 (coordinator pass: foundation, shared components, `mobbin-standard-pass.md`)

**Foundation alignment (`../00-foundation.md` §4 "Rules settled").** The rules proposed as P1–P17 now live in the foundation. `01-product-and-ia.md` §9 is now a cross-reference table.
- Kids club ages are **6 months–12 years** (was 3–12) in files 01, 02, 03. A child under 3 can be added for kids club only; no price is stated, flagged in 01 §9.
- Waitlist hold uses **"Confirm spot"** (was "Keep my spot"); promotions stop 1 hour before start; inside that hour open spots are **drop-in spots**. Release stays as an app-only ghost action.
- Lap lanes: Mesa – Dobson 8, Mesa – Red Mountain 8, Gilbert – Val Vista 6; slots read **"1 of 2 swimmers"**.
- Added age rules (sauna and cold plunge 18+; strength floor without a coach 16+) with entry-rule chips; Mind & Body named as a Teen OK example.
- Added "no public ratings; private feedback after a class" (notification, past-booking link, Inbox row).
- Early resume from a freeze now bills the household monthly price for the rest of the cycle: **$80.52** (was $70.52 after a $10 deduction).
- 5-minute checkout hold named for courts and kids-club slots; PT use is an open app decision.

**Shared component alignment (`../01-shared-brand-components*.md`).**
- `BookingStateButton`: 12 shared states and labels (Book, Booking…, Booked, Join waitlist, On waitlist #3, Confirm spot, Full, Booking paused, Ridge only, Started, Try again). Removed the app-only states `not_open`, `plan_locked`, `club_locked`, `age_blocked`, `teen_blocked`, `frozen`, `payment_failed`, `conflict`. Those cases map to `restricted` with a reason; requests sent to the shared owner (04 §C).
- **Cancel dialog** is stacked: filled "Keep my spot", outline "Reschedule instead", quiet danger "Cancel booking"; red X consequence lines with words; optional reasons. Replaces the side-by-side "Keep booking / Cancel anyway".
- **Waitlist consent:** one checkbox "I understand the late-cancel rule.", shown every time; "Join waitlist" disabled until ticked (was first-time only).
- **Success pattern:** one green check, one headline, "Confirmed" pill, summary card, filled "Add to calendar", "Share" link, action rows, "Done" for booking, reservations, kids club, PT, guest pass (adapted), freeze, plan change.
- `DurationChips` for court duration; `ReservationSlotGrid` layouts `matrix`/`blocks`/`list` and shared slot statuses (selected is a Saguaro fill, not copper); radiogroup keyboard model.
- Variant names corrected: `BusynessMeter` compact/inline/card/hero; `CapacityIndicator` ribs/text/badge-on-photo/large; `HoursTable` week/grouped/today; `ClubSwitcher` modes; `ClassDetailPanel` sheet/panel/page (480 px); `ScheduleFilters` sidebar/drawer; `CoachCard` card/feature/compact; `PlanCard` current/change/select with outline "Keep Ridge" and filled "Switch to {plan}"; `CheckInPass` full/compact/guest/teen with states valid/frozen/past-due/trial/guest; `PromoBand` card.
- `ClassCard` `schedule-row` reading order is time, title, instructor, spots, action. `ClassPhotoTile` is not used in v1. `ProgressRibs` is the weekly goal only; `PackMeter` and `PackCard` are app composites.
- **Category colour tokens:** Mind & Body `#52684A`, Court `#7F6019`, Strength text `#9E4522`; category text is not allowed on `surface-muted`. The old "to verify" contrast note was removed.
- Empty states reuse the shared ids and sample copy where they exist.

**Research (`mobbin-standard-pass.md`).** Applied (cited as "mobbin-standard-pass §2 rule N"): 22–23 (resource availability), 24–25 and 61 (row order, slot cards), 26–28 (cancel dialog), 29–30 and 48–49 (pause flow, neutral paused pill), 31–32 (Before you switch, Today's total), 33–34 (billing table), 35 (role help text), 36 (link field, Copy link, pending invites), 37 (coach choice ring), 39–40 and 43–46 and 62 (class detail hero band, booked bar, confirmed view), 47 (consent gate), 50–51 (add member, pending invite), 53, 56, 59–60. Replaced "not observed" notes for web cancel, pause and waitlist (§3 corrections 3 and 5). Kept as gaps: sport-court grid, popular-times chart, gym check-in pass (correction 4: Wallet buttons are non-gym), kids-club check-in, PT booking, command menu.
Not applied, on purpose: rules 11–12 (annual billing toggle: no yearly price), 52 (X on missed days: the brand does not shame), 58 (crowd YES/NO prompt: the foundation requires the typical-hours chart), 41 (star rating: no public ratings), and the text-link-only cancel in rule 28 for membership (both choices stay full buttons).
