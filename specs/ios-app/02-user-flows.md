# Cactus Peak Athletic iOS app — 02 User flows (revision 2)

Read `01-navigation-and-architecture.md` first for tab names, routes, sheets and tags.
Screen names in bold match section titles in `03-screens.md`. Components are named as in `../01-shared-brand-components.md` and `../01-shared-brand-components-part2.md` ("shared spec"). iOS build notes are in `04-components-and-branding.md`.
Tag key: `[found §N]` = `../00-foundation.md`; `[shared §N]` = the shared component spec; `[mobbin-standard-pass §2 rule N]` = `../research/mobbin-standard-pass.md`; other tags as in `01` section 0.1.
Sample "today" is Tuesday 27 October 2026. Times are Arizona time (no daylight saving).

## 0. Shared rules for all flows

### 0.1 Business rules used exactly [found §2–§4, "Rules settled"]
- **Booking windows** open at 6:00 a.m. Arizona time on the opening day. Classes and kids club: 7 days ahead (Summit 9). Courts: 3 days ahead. Lap lanes follow the class window (the foundation lists no separate lane window; shared spec §11.3 item 2 makes the same choice).
- **Day strip:** `ScheduleDayStrip` shows seven chips, with horizontal scroll to the member's window: today plus 7 days (Summit today plus 9). The last day is only partly open before 6:00 a.m.: its rows read "Opens Tue 6:00 a.m." and cannot be booked yet. Courts show today plus 3 days. [shared §7.5]
- **Cancel:** free up to 2 h before start. Later is a late cancel and a strike. A no-show counts as a late cancel. Courts and lanes use the same 2-h rule and strikes. Kids club has no strikes.
- **Strikes:** 3 strikes in 30 days = a 3-day booking pause. A pause blocks new class, court and lane bookings. It does not block kids club, personal training, check-in or cancelling.
- **Waitlist:** up to 5 active waitlists per member. The first person on the list gets a push notification and holds the spot for 30 min. They must tap "Confirm spot" in that time, or the spot goes to the next person. Promotions stop 1 h before start. Inside that hour, open spots show as drop-in spots. Lap lanes have no waitlist. Kids club blocks do.
- **Courts:** 60 or 90 min. One court reservation per member per day. At most 2 active. Ridge and Summit only. Checkout holds a court or kids-club slot for 5 min, with one 5-min extension.
- **Lap lanes:** 45-min slots. Mesa – Dobson 8 lanes, Mesa – Red Mountain 8 lanes (25 m outdoor), Gilbert – Val Vista 6 lanes. Up to 2 swimmers share a lane (circle swim); the slot shows "1 of 2 swimmers". "Any lane" is the default. Pools close 30 min before the club.
- **Kids club:** ages 6 months to 12 years. Four fixed 2-h blocks, Mon to Sat: 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. At most 2 blocks per child per day. The parent must check in at the same club. An unclaimed block is released 15 min after start. Clubs with a kids club: Mesa – Dobson, Mesa – Red Mountain, Gilbert – Val Vista.
- **Teens (13–17):** book classes flagged "Teen OK" (all Youth classes plus selected others, for example Teen Strength and Mind & Body). Parent toggles allow courts and lap lanes (lanes from age 14). Teen personal training needs parent approval. The parent manages billing.
- **Age rules:** sauna and cold plunge 18+. Strength floor without a coach 16+.
- **Guest pass:** guest 18+, or 16–17 with a guardian waiver. Valid 14 days from send. One visit, one club. Included passes reset on the billing date and do not roll over. An extra pass is the $20 day pass.
- **Personal training:** single $75. Packs: 4 for $276, 8 for $520, 12 for $732. Sessions 45 min (Summit intro 30 min). Free cancel or reschedule up to 24 h before. Packs last 12 months and pause during a freeze.
- **Freeze:** starts on the first billing date at least 30 days after the request. 1, 2 or 3 months. Covers the whole household. $10/mo for the account. Bookings inside the freeze are cancelled with no strike. Early resume bills the plan price for the rest of the cycle.
- **Plan changes:** upgrade now, prorated by day. Downgrade on the next billing date. Cancel on the first billing date at least 30 days after the request, with full access and one-click reinstate until then. Trailhead members may change home club once per cycle. A member turning 18 moves to the adult add-on price (30-day notice).
- **Failed payment:** retries on day 3 and day 6. Full access to day 7. New bookings pause from day 8. From day 15 the pass shows "See the front desk".
- **Billing day** is fixed per household. Maya's is the 12th.
- **Streak:** a streak week meets the member's weekly visit target (default 3). One rest week is forgiven per 10 weeks.
- **Ratings:** none are public. Members can give private feedback after a class.
- **Club hours:** Mon to Fri 4:30 a.m. to 10:00 p.m. Sat and Sun 6:00 a.m. to 8:00 p.m. Staffed 6:00 a.m. to 8:00 p.m. Front desk phone (fictional): (480) 555-0142.

### 0.2 Assumptions that remain `[PROPOSAL]`
- Time clash on a second booking shows a prompt, not a block.
- Past rows dim and sort to the bottom of the day. A started class cannot be booked.
- Undo toast lasts 8 s after a free cancel.
- Reminder lead time default is 60 min (member can pick 30, 60 or 120).
- Court partner invites allow up to 4 players for pickleball.

### 0.3 Haptic vocabulary
Defined in `04` section 5.
| Name | SwiftUI | When |
|---|---|---|
| `selection` | `.selection` | Day chip, segment, duration chip, slot, filter chip |
| `booked` | `.success` | Booking or reservation confirmed |
| `waitlisted` | `.impact(flexibility: .soft)` | Joined waitlist |
| `promoted` | `.success` | Spot confirmed from a hold |
| `released` | `.impact(weight: .light)` | Free cancel, left waitlist |
| `lateCancel` | `.warning` | Late cancel confirmed |
| `error` | `.error` | Failed action, rejected code |
| `checkedIn` | `.success` | Pass scan accepted |
| `levelChange` | `.levelChange` | Busyness level changes while visible |
Apply with `.sensoryFeedback(_:trigger:)`. `[verified]` Haptics stay on under Reduce Motion. A setting turns them off.

### 0.4 Copy voice
Verbs first on buttons. Plain, short, a little dry. No hype. Errors say what happened and what to do. [brand guide §8]

### 0.5 The success screen pattern (used by every flow that ends in "done")
One pattern for all success screens. [shared §1 principle 12] [mobbin-standard-pass §2 rules 45, 46, 44, 62]
1. One green check (`success`), paired with a headline. Example "You're booked".
2. A green "Confirmed" pill (check icon plus word) above the date.
3. A summary card.
4. One full-width filled button (usually "Add to calendar") with a text link "Share" under it.
5. Four action rows: Add to calendar, Get directions, Call the club, Club details.
6. One "Done" button (toolbar, trailing).
Reservations, freezes, guest passes and plan changes reuse items 1, 2, 3 and 6, and swap the buttons and rows for ones that fit.

### 0.6 The cancel sheet (used by every cancel)
A `.medium` bottom sheet. It replaces `confirmationDialog` for booking cancels, because the consequence list needs room. [shared §7.2] [mobbin-standard-pass §2 rules 26, 27, 28, 43]
- Bold question "Cancel Climb Cycle?" and the class name in small capitals.
- Consequence first. Free cancel: "You can rebook until it fills." Late cancel: lines with a red X icon and words: "Counts as a strike (2 of 3 in 30 days)", "Your spot goes to the next person on the waitlist".
- Buttons, stacked, in this order: filled "Keep my spot"; outline "Reschedule instead" (only if other sessions of the same class exist this week); quiet `danger` text button "Cancel booking".
- Free cancel only: optional radio list "Why are you cancelling?" (Schedule changed, Feeling unwell, Booked by mistake, Other reason with a text box). Reasons never block the cancel.
Other destructive actions (sign out, remove family member, cancel membership) use `confirmationDialog(_:item:)`. `[skill:swiftui-whats-new-27]`

---

## Flow 1 — First launch and sign in

Persona: Maya, 34, Gilbert. She joined on the website last night. She opens the app at 5:40 a.m.

| Step | Screen / state | Member does | System does |
|---|---|---|---|
| 1 | Launch screen: Sand, Rib Peak symbol, no text. | Opens the app. | Loads. |
| 2 | **Welcome** (`fullScreenCover`). Photo of Mesa – Red Mountain at sunrise on a solid Saguaro Night band. Tagline "Climb at your own pace." Buttons: "Sign in with a passkey", "Continue with Apple", "Email me a code". Link "Not a member yet? Try a 3-day pass". | Taps "Sign in with a passkey". | System passkey sheet (`ASAuthorizationController`). `[UNVERIFIED]` |
| 3a | Passkey exists. | Confirms with Face ID. | Sends the assertion. Haptic `selection` on tap. |
| 3b | No passkey. | Taps "Continue with Apple" or "Email me a code". | Apple sheet or code screen. |
| 4 | **Code entry**. `.textContentType(.oneTimeCode)`. | Enters 6 digits. | Verifies. Auto-submits on the 6th digit. |
| 5 | **Link membership** only if the Apple ID email does not match: "Email on your membership", then code. | Enters email. | Matches. If none: "We cannot find that email. Check the spelling or call the front desk, (480) 555-0142." |
| 6 | **Create passkey**: "Next time, sign in with Face ID." | "Create passkey". | Registers. |
| 7 | Onboarding (flow 2). | | |

Edge cases:
- Offline: buttons stay on. Failure shows "No connection. Try again when you are online." with Retry.
- Wrong code: inline `danger` text with icon, "That code is not right. 2 tries left." Haptic `error`.
- Past due: sign-in works. Today shows the payment card (flow 12).
- Teen invited by a parent (13–17): the link `/family/join/{token}` skips Welcome. Jordan sees "Mike added you to the Hernandez family plan". Jordan creates a passkey and does a short onboarding (flow 13).
- "Try a 3-day pass" opens Safari (`SFSafariViewController`). The app never creates a paid account.
- Sign out: `confirmationDialog`. Clears cached codes and the Keychain seed.

Haptics: `selection` on primary buttons, `error` on failure.
Accessibility: focus lands on the title. [skill:accessibility-voiceover-specialist]

---

## Flow 2 — Onboarding (home club, interests, alerts, Wallet)

Five steps. `ProgressRibs` (5 ribs, tone `brand`) shows the step. It is a progress meter here, not the club motif. Each step has one primary button in a bottom bar and a "Skip" text button (not on step 1).

| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | **Onboarding: Home club.** Title "Pick your home club". Five `ClubCard` `list-row`. "Use my location" button on top. | Taps "Use my location" (optional), taps a card. | Asks location (When In Use) only now. Sorts by distance. Nearest gets chip "Closest". Selected: check + haptic `selection`. Trailhead note: "Trailhead covers one home club. You can change it once per billing cycle." |
| 2 | **Onboarding: Interests.** 8 `CategoryBadge` tiles. Multi-select. | Taps 1 or more. | Sets Today suggestions and default filter chips. Skip allowed. |
| 3 | **Onboarding: Alerts.** Toggle rows: "Waitlist spots" (on), "Class reminders · 60 min before" (on), "Club news" (off), "Show next class on Lock Screen" (on). Footnote "Waitlist spot? You get 30 minutes to confirm." | Taps "Turn on alerts". | System prompt. On allow: register categories (`04` section 9.4). On deny: banner in step 4. |
| 4 | **Onboarding: Wallet.** Pass preview. `PKAddPassButton`, "Maybe later". | Taps the button. | `PKAddPassesViewController`. Hidden if `canAddPasses()` is false. [shared §9.3] |
| 5 | **Onboarding: Ready.** Summary rows and a suggested `ClassCard` `card`. "Go to Today". | Taps it. | Sets `selection = .today`. |

Edge cases: Back on steps 2 to 5; the last step shows Done only. Quit mid-way: resume on the same step. Home club must be set; Today shows a "Pick your home club" card until it is. Location denied: sort by city. Teens (13–17) skip steps 1 (preset) and 4 if the parent has not allowed Wallet `[PROPOSAL]`.
Haptics: `selection`, `booked` on the last button. AX5: one-column tiles; pinned button.

---

## Flow 3 — Check in at the front desk (pass, brightness, Wallet, Lock Screen)

Persona: Maya, 5:40 a.m., Gilbert – Val Vista parking lot. The club opened at 4:30 a.m. The desk is staffed from 6:00 a.m.

### Entry points
1. Today toolbar `qrcode` (1 tap). 2. Arrival accessory "Show pass · Gilbert – Val Vista". 3. Lock Screen widget, Control Center, Action button. 4. Apple Wallet pass. 5. Siri "Show my pass in Cactus Peak" (flow 16).

### Steps
| Step | Screen / state | System does |
|---|---|---|
| 1 | Pass sheet opens (`.large`). Spring 0.35 s. Reduce Motion: 150 ms fade. | Saves brightness, sets 1.0. Disables idle timer. [shared §9.3] |
| 2 | **Check-in pass**: `CheckInPass` `full` on a night-surface card. Wordmark + plan badge "Ridge"; name "Maya Lopez"; eyebrow "MEMBER NUMBER"; number "0042 1187" (Archivo `data-l`); QR on a white rounded square, 280 pt with 16 pt quiet zone; caption "Scan at the front desk"; "Checking in at Gilbert – Val Vista" with a "Change" link (opens `ClubSwitcher` sheet). | Code made locally; rotates every 60 s. |
| 3 | Member holds the phone at the reader (door reader or desk). | Reader sends the scan. |
| 4 | **Scan accepted.** Card shows a green check and "Checked in · 5:43 a.m." (one check, one headline). `VisitStreak` week strip adds today's dot. | Haptic `checkedIn`. Brightness restored. Accessory hides. Live Activity moves to "Check in open" or "In progress". |
| 5 | Taps Done or swipes down. | Sheet closes. No timer ever closes it. [apple §6] |

Below the card: `PKAddPassButton` (full width, system black style in light and white in dark), "Maybe later" link on first visit only. [shared §9.3] [mobbin-standard-pass §1 search 9: non-gym evidence]. A "Kids club today: Mia · 4:00–6:00 p.m." section shows when the member has a kids-club block today. Children do not have their own codes; the parent checks in at the same club and shows this pass at the kids club desk. [found §4]

### States (state strip under the card)
| Case | Pass shows |
|---|---|
| Before 6:00 a.m. | Banner "Desk opens at 6:00 a.m. Scan at the door reader." |
| Club closed | Code hidden. "Gilbert – Val Vista opens at 4:30 a.m." |
| Frozen | Neutral pill with pause icon "Frozen until Feb 19". Code hidden. Button "View freeze". [shared §9.1 frozen pill] [mobbin-standard-pass §2 rule 49] |
| Payment failed, day 1 to 7 | Pass works. Banner "Payment failed. Update your card." |
| Day 8 to 14 | Pass works. Banner "New bookings are paused until you pay." |
| Day 15 or later | Code hidden. "See the front desk." Button "Call the front desk" `tel:` (480) 555-0142. |
| Trailhead member at another club | Banner "Your Trailhead plan covers Mesa – Dobson. A day pass here is $20." Buttons "See plans", "Buy day pass" (web). |
| Trial | Pill "3-day pass · 2 days left". |
| Offline | Cached rotating code works. Badge "Offline code". |
| Rejected | `danger` text with icon "That code did not scan. Hold still or show the Wallet pass." Haptic `error`. |
| Teen | `teen` variant; parent sees "Teen pass" in Family. |

### Lock Screen and Wallet
Accessory circular widget opens `/pass`. No code, name or number on the Lock Screen. [apple §5] Wallet pass: static revocable barcode. Design in `04` section 8.

Haptics: `checkedIn`, `error`. VoiceOver: announce "Checked in at 5:43 a.m." AX5: the QR stays 280 pt; the page scrolls.

---

## Flow 4 — Book a class

Persona: Maya, Ridge, wants Climb Cycle, Thu 6:00 a.m., Gilbert – Val Vista.

| Step | Screen / state | Member does | System does |
|---|---|---|---|
| 1 | **Today.** Quick card "Your usual: Climb Cycle, Thu 6:00 a.m." with `BookingStateButton` "Book". | Taps "Book" (goes to step 5) or the Book tab. | |
| 2 | **Book** tab, segment "Classes", day = today. `ScheduleDayStrip` (7 chips visible, scroll for the rest). | Taps `Thu 29`. | Haptic `selection`. Redacted rows under 300 ms, then rows. |
| 3 | Rows grouped "Early morning", "Morning", "Midday", "Evening". `ClassCard` `schedule-row`: stripe, "6:00 a.m." / "45 min", title, `CategoryBadge` + `IntensityRibs`, "(avatar) Marisol V. · Cycle studio", `CapacityIndicator` "4 bikes left", `BookingStateButton` "Book". | Taps the row (opens detail) or the "Book" button in the row. | Row tap pushes `ClassDetailPanel`. Row "Book" books at once for classes without a waiver. |
| 4 | **Class detail** (pushed). Hero with a solid Saguaro Night band "with Marisol Vega · Thu, 6:00 a.m."; stats row DURATION 45 min, INTENSITY Hard, SPOTS 4; rules block; sticky bar "Included with Ridge · 4 bikes left" + "Book". | Taps "Book". | |
| 5 | Button `booking`: "Booking…" with spinner. | | Sends request with an idempotency key. |
| 6a | **Confirmed view** (success pattern 0.5): check, "You're booked", "Confirmed" pill, summary card, "Add to calendar", "Share" link, four rows, toggle "Show on Lock Screen", "Done". | Taps Done. | Haptic `booked`. Donates `BookClassIntent`. Schedules reminder. |
| 6b | Class filled in between. | | Inline `danger` message "That class just filled. Join the waitlist or pick the 7:00 a.m. class." Button changes to "Join waitlist". Haptic `error`. |
| 7 | Back on the list: row shows "Booked ✓". Today shows "Next up". | | |

### `BookingStateButton` states on iOS [shared §8.1]
| State id | Label | Notes |
|---|---|---|
| `book` | Book | Filled. |
| `booking` | Booking… | Spinner + word. Width locked. |
| `booked` | Booked ✓ | In the detail bar: status text "Booked" + grey outline "Cancel" + "Manage" menu (Add to calendar, Cancel booking). [mobbin-standard-pass §2 rule 40] |
| `waitlist` | Join waitlist | Opens waitlist sheet (flow 5). |
| `waitlisted` | On waitlist #3 | Menu: Leave waitlist. |
| `hold` | Confirm spot · 28:41 | Filled. Timer is tabular. |
| `full` | Full | Disabled. Reason line "Waitlist closed 1 hour before start" (or "Full · Waitlist 3"). |
| `late-cancel` | Booked + `LateCancelNotice` | Warning triangle on the button; menu item "Cancel (late)". |
| `paused` | Booking paused | Reason "Back on Oct 30". |
| `restricted` | Ridge only | Opens plans. Used for Trailhead at another club, or courts. |
| `started` | Started | Disabled. |
| `error` | Try again | Outline `danger`. |
Extra row-level state: **drop-in.** Inside the last hour, a class with open spots shows "Drop-in · 3 spots left" and a "Book" button. [found §4]

### Rules shown next to the action [shared §1 principle 11]
Cancel line "Cancel free until 4:00 a.m. (2 hours before). After that, it counts as a late cancel." Waitlist line. Strike line if the member has 1 or 2 strikes.

### After class: private feedback `[found §4: no public ratings]`
- 10 min after the class ends, Today shows a card "How was Climb Cycle?" with three buttons "Great", "Okay", "Not for me" and a link "Add a note".
- My bookings, Past rows have a "Give feedback" action.
- Sheet (`.medium`): the three choices, an optional note, a line "Only the club sees this." No stars. No public score.

### Edge cases
- Pause: all class rows show `paused`. Kids club, PT and check-in still work. Cancelling still works.
- Failed payment day 8 or later: all booking buttons show `paused` with "Update your card" (Membership link).
- Frozen: booking buttons show "Membership frozen" and are disabled.
- Time clash: "You have Switchback HIIT at 6:15 a.m. Book both?" with "Keep both" / "Cancel". [PROPOSAL]
- Up to 5 active waitlists: the 6th shows "You are on 5 waitlists. Leave one to join another."
- Strength floor without a coach is 16+; teens (13–17) see only "Teen OK" classes; adult-only classes are hidden. Sauna + Plunge slots are 18+: hidden for under 18.
- Network drop: idempotency key; "Checking your booking…" then the result.
- Day with no classes: `EmptyState` "No classes Wed 28" with a "Go to Thu 29" action.

Haptics: `selection`, `booked`, `error`.
VoiceOver: "Climb Cycle, 6:00 a.m., 45 minutes, Marisol V., Cycle studio, intensity 4 of 5, 4 bikes left." Custom actions "Book", "Join waitlist", "Cancel booking". [shared §7.1]

---

## Flow 5 — Join a waitlist and be promoted

Persona: Priya, 27, Mesa – Downtown. Rib Rack Strength, Wed 5:30 p.m., full.

### Join
| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | Class detail. Left cell "Full · Waitlist 3". Button "Join waitlist". | Taps it. | If notifications are off, shows the pre-prompt first. |
| 2 | **Waitlist sheet** (`.medium`). Title "Join the waitlist for Rib Rack Strength". Body: "You are 4th in line. If a spot opens, we hold it for you until 4:30 p.m. (1 hour before). You get a push and 30 minutes to confirm. Late cancels count as strikes." One checkbox: "I understand the late-cancel rule." Primary "Join waitlist" (full width, grey and disabled until the box is ticked). Link "Pick another class". [shared §8.1] [mobbin-standard-pass §2 rule 47] | Ticks the box. Taps "Join waitlist". | The consent box always shows, for every member. |
| 3 | Button "Joining…". | | Adds the member. |
| 4 | **Waitlist confirmed** (success pattern 0.5: green check and the headline "You're on the waitlist, #4"). Lines: "We'll tell you if a spot opens. We can offer you one until 4:30 p.m." Buttons "Done", "Leave waitlist". | Done. | Haptic `waitlisted`. |

### Promotion
| Step | Where | What happens |
|---|---|---|
| 1 | Server | A booked member cancels. Priya is first. It is before 4:30 p.m. The server holds the spot for 30 min. |
| 2 | Lock Screen | **Time Sensitive** notification, category `WAITLIST_PROMOTED`. Title "A spot opened in Rib Rack Strength". Body "Wed 5:30 p.m. · Mesa – Downtown. Confirm by 4:12 p.m." Action **Confirm spot** (background). |
| 3a | Taps "Confirm spot" | `ConfirmWaitlistSpotIntent` runs. A follow-up notification: "You're in. Rib Rack Strength, Wed 5:30 p.m." State becomes `booked`. |
| 3b | Taps the notification | App opens `/book/class/{id}?action=confirm`. Detail shows banner "A spot opened. Confirm in 28:41." and `hold` button "Confirm spot · 28:41". Tapping confirms. Haptic `promoted`. Success pattern. |
| 3c | Does nothing | At 4:12 p.m. the spot goes to #2. Priya gets "Your hold ended" (active level). She is off that waitlist. |

Rules and edge cases:
- Promotions stop 1 h before start. After that the row shows "Drop-in · 2 spots left" when a spot opens, for anyone. [found §4]
- The hold timer is announced at the start, at 5 min and at 1 min, not every second. [shared §8.1]
- After a member confirms inside the 2-h window, cancelling is a late cancel. The notification body adds "Cancelling after you confirm counts as a late cancel" when less than 2 h remain.
- Up to 5 active waitlists per member.
- Lap lanes have no waitlist: a full lane slot shows `full` with no join button. Kids club blocks do have a waitlist (flow 10).
- Two waitlists that overlap in time: when the second promotes, the prompt reads "You already have a class at that time."
- No Live Activity for waitlists (HIG: avoid push plus activity for one update). [apple §5]
- Notifications off: Today shows a "Check your spot" card on open and the app checks promotions on foreground.
- There is no "Release" action. A member who does not want the spot ignores it and the hold ends. `[PROPOSAL]` Add one if the club wants it.

---

## Flow 6 — Cancel and late cancel

Persona: Maya cancels Climb Cycle (Thu 6:00 a.m.).

### Free cancel (more than 2 h before)
| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | Today "Next up" card, **My bookings**, or the Class detail bar. | Taps "Cancel" (bar), "Manage" menu, or swipes the row. Context menu has it too. | Sets `presentedCancel`. |
| 2 | **Cancel sheet** (0.6). "Cancel Climb Cycle?" CLIMB CYCLE · THU 6:00 A.M. "You can rebook until it fills." Buttons: "Keep my spot", "Reschedule instead" (if Climb Cycle also runs Thu 7:00 a.m.), "Cancel booking". Optional reasons. | Taps "Cancel booking". | |
| 3 | Row slides out (Reduce Motion: fade). Toast "Cancelled. Undo" for 8 s. | | Haptic `released`. Live Activity ends. |

### Late cancel (2 h or less before)
Cancel sheet title "Cancel Climb Cycle?" Consequence lines with red X icons and words:
- "Counts as a strike (2 of 3 in 30 days)"
- "Your spot goes to the next person on the waitlist"
Footer sentence "3 strikes in 30 days pause new bookings for 3 days."
Third strike: first line becomes "This is your 3rd strike. New bookings pause for 3 days, until Sat Oct 31." Button label stays "Cancel booking".
Haptic `lateCancel`. Banner on My bookings "2 strikes in 30 days. One more pauses new bookings for 3 days."

### Other cancel rules
- **No-show** counts as a late cancel. Notification after class "We missed you at Climb Cycle. A no-show counts as a late cancel." [found §4]
- **Courts and lanes:** same sheet, same 2-h rule, same strikes.
- **Kids club:** same sheet but no strike lines; text "Kids club has no late-cancel strikes."
- **Personal training:** free cancel or reschedule up to 24 h before. The sheet says "Free until Wed 8:00 a.m." Later: "Counts as a used session." `[PROPOSAL]` wording.
- **Pause scope:** cancelling always works, even during a pause.
- **Freeze:** bookings inside a freeze are cancelled by the system with no strike; the member gets one summary notification.
- Leave waitlist: one tap, undo toast, no sheet.
- Show the strike count and rules at all times in My bookings ("How strikes work"). [gaps r6]

---

## Flow 7 — Add to calendar

Entry: success screen, My bookings menu, Today next-class menu, Class detail "Add to calendar".

| Step | Screen | System does |
|---|---|---|
| 1 | Member taps "Add to calendar". | Builds an `EKEvent`: title "Climb Cycle · Gilbert – Val Vista", location, start, end, 30-min alert, URL `/book/class/{id}`. |
| 2 | System `EKEventEditViewController` sheet. | `[verified]` class named in [apple §5]. iOS 27 permission model `[UNVERIFIED]`. |
| 3 | Button reads "Added to calendar" with a check. | Haptic `booked`. |

Edge cases: cancelled booking keeps the event; the cancel toast says "Remove it from your calendar if you added it." Calendar off: alert "Calendar is off for this app. Open Settings." Duplicate: no-op. Waitlisted: no button.

---

## Flow 8 — Reserve a court and invite a partner

Persona: Ron, 66, Mesa – Red Mountain, Ridge. Pickleball, Thursday. Large text on.

| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | **Book** tab, segment "Courts". Club = Mesa – Red Mountain (6 pickleball courts). `ScheduleDayStrip` shows today plus 3 days. Rule line "Courts: book up to 3 days ahead. 1 reservation a day, 2 active at most." | Taps `Thu 29`. | Haptic `selection`. |
| 2 | Sport chips "Pickleball" (Tennis at Mesa – Dobson only; Basketball at Gilbert – Val Vista only). `DurationChips` "60 min \| 90 min" (selected chip filled). [shared §8.2] [mobbin-standard-pass §2 rule 60] | Taps "90 min". | |
| 3 | `ReservationSlotGrid` (iOS list): AM and PM sections. Rows per start time (30-min steps): "8:00 a.m. · Courts 1, 3, 4 open". Taps a row. [shared §8.2] | | |
| 4 | **Reserve sheet** (`.medium`): summary "Pickleball · Thu Oct 29 · 8:00–9:30 a.m."; court `Picker` (`.inline`): "Any court" default or Court 1 to 6; party "Add a partner" (after booking); line "Included with Ridge"; **hold banner** "Holding Court 3 for 4:52" with "Add 5 minutes" (once). Button "Reserve Court 3". | Taps "Reserve Court 3". | Checkout holds the slot 5 min with one 5-min extension. [found §4] |
| 5 | Success pattern: "Court 3 is yours." Rows: Add to calendar, Invite a partner, Get directions, Call the club. | Taps "Invite a partner". | `ShareLink` with "Pickleball Thu 8:00–9:30 a.m., Mesa – Red Mountain, Court 3. Join me: https://app.cactuspeak.example/invite/court/ab12". |

Partner: a member taps the link and sees "Join Ron's court" (max 4 players, `[PROPOSAL]`). A non-member sees the web page with "Try a 3-day pass".

Edge cases:
- Trailhead: slots show `restricted` "Ridge only". `EmptyState` "Courts come with Ridge" with "See plans".
- Second reservation the same day: inline `danger` "You already have a court on Thu. One a day." Having 2 active already: "You have 2 active court reservations. Cancel one to book another."
- Hold expires: sheet shows "Your hold ended. Pick the time again." Haptic `error`.
- Slot taken: "Someone just took that time. Courts 1 and 4 are open at 8:00 a.m." [shared §8.2]
- 90 min not possible: chip disabled with reason "Next hour is full".
- Beyond 3 days: strip does not show it; a hint reads "Courts can be booked 3 days ahead." [gaps r14]
- Pause: slots show `paused`.
- Teens: courts only if a parent toggle is on; otherwise `restricted` "Ask a parent to turn on courts".
- Cancel: 2-h rule, strikes (flow 6).
Optional chip grid: when many 30-min slots fit, use a four-column wrap of short chips ("8:00") with a total line "Court 3 · 90 min · Included with Ridge". [mobbin-standard-pass §2 rule 59]
VoiceOver: row "8:00 a.m., courts 1, 3 and 4 open". `DurationChips` is adjustable.

---

## Flow 9 — Reserve a lap lane

Persona: Daniel, 52, Mesa – Dobson. Knee recovery. Trailhead (pool at home club included).

| Step | Screen | System / member |
|---|---|---|
| 1 | Book tab, segment "Lanes". Club = Mesa – Dobson (8 lanes). Header: pool status and `BusynessMeter` `inline`. Rule line "45-minute slots. Pool closes 30 minutes before the club. Up to 2 swimmers share a lane." |
| 2 | `ReservationSlotGrid` list. Row "9:15 a.m. · 5 of 8 lanes open". Some lanes show "1 of 2 swimmers" (a lane with room for one more at peak). |
| 3 | **Reserve sheet** (`.medium`): lane `Picker`: "Any lane" (default), Lane 1 to 8 with the swimmer count "1 of 2 swimmers". Duration shown as fixed "45 min". Button "Reserve lane". Hold banner (5 min). |
| 4 | Success pattern "Lane 4, 9:15–10:00 a.m." Cancel line "Free until 7:15 a.m." Haptic `booked`. |

Lane counts: Mesa – Dobson 8, Mesa – Red Mountain 8 (25 m outdoor), Gilbert – Val Vista 6. [found §4]
Edge cases:
- No waitlist for lanes: a full slot shows `full` with the reason "Lap lanes have no waitlist. Try 10:00 a.m."
- Warm-water pool at Mesa – Dobson is an Aqua class-like row (capacity-based), not a lane.
- Last slot ends 30 min before close: weekday 9:30 p.m., weekend 7:30 p.m.
- Pool closed: `EmptyState` "Lap pool closed today. Back Wed 28 at 5:00 a.m."
- Trailhead at another club: `restricted`.
- Same 2-h cancel and strikes as classes. Pause blocks new lane bookings.
- Teens: lanes from age 14 with a parent toggle.

---

## Flow 10 — Kids club block

Persona: Maya with Mia (9) and Eli (6). Gilbert – Val Vista, Saturday.

| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | Book tab, segment "Kids club". Club must have a kids club, else `EmptyState` "No kids club at Mesa – Downtown" with buttons to Mesa – Dobson, Mesa – Red Mountain, Gilbert – Val Vista. | | |
| 2 | `ReservationSlotGrid` `blocks`: four fixed 2-h cards: 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. Each: spots left, `CapacityIndicator`. Sunday chip says "Closed". | Taps 8:00–10:00 a.m. | |
| 3 | **Reserve sheet** (`.large`): child list with checkmarks for children aged 6 months to 12 years. Note field for allergies. Line "Mia and Eli: 1 block each. Up to 2 blocks per child per day." Line "Check in at Gilbert – Val Vista before 8:15 a.m. or we release the block." Hold banner 5 min. Button "Reserve 2 spots". | Selects both. | |
| 4 | Success pattern "Mia and Eli are booked." Rows incl. "Show pass". | | Haptic `booked`. |

Rules and edge cases:
- Parent must check in at the same club. An unclaimed block is released 15 min after start. The reminder says "Check in by 8:15 a.m." [found §4]
- Max 2 blocks per child per day: a third block shows `error` text "Mia has 2 blocks that day."
- Not enough spots for both: "Only 1 spot left. Reserve 1 child or join the waitlist for the other." Kids club blocks have a waitlist per child.
- Child over 12: not listed. Teens 13–17 use Youth classes, not kids club.
- No strikes for kids club. Cancel has no penalty (flow 6). A pause does not block kids club.
- Pick-up reminder 10 min before the block ends.
- Checked in: Today shows "Mia and Eli are in Kids Club until 10:00 a.m." `[PROPOSAL]`
- No Live Activity for kids club (privacy).

---

## Flow 11 — Find a club (map)

Persona: Daniel at home.

| Step | Screen | System does |
|---|---|---|
| 1 | **Clubs: map and list**. Full-bleed `Map` with a search pill ("City or ZIP") and filter chips (Open now, Pool, Courts, Kids club, Recovery). A bottom sheet with detents collapsed (56 pt strip "5 clubs in map area"), `.medium` (list), `.large`. [shared §6.6] [mobbin-standard-pass §2 rule 57] Map stays interactive at collapsed and medium. | First load frames all 5 clubs. |
| 2 | Member taps "Pool". | Pins without a pool fade. Count line "3 clubs in map area". |
| 3 | Member taps a pin. | Map centers. The sheet rises to a `ClubCard` `map-callout` (photo, today's hours, `BusynessMeter` `inline`, "Directions" and "Open club"). |
| 4 | "Open club". | Push **Club detail**. |
| 5 | "Directions". | Opens Maps. |

Edge cases: location denied: ZIP search still works. Zero results: `EmptyState` "No club has all of those" with "Clear filters". The list is always one drag away. [mobbin-ios §6 a10] VoiceOver: the map is one container; the sheet list is the main path. Set home club: Club detail row. Trailhead warning: "Your Trailhead plan covers one home club. You can change it once per billing cycle." [found §4]
`[UNVERIFIED]` Whether a persistent sheet leaves the tab bar reachable on iOS 27. Fallback: a paged carousel of `ClubCard` `compact` over the map.

---

## Flow 12 — Freeze, change plan, cancel, failed payment

### 12a Freeze
Persona: Daniel. Billing day is the 20th. He asks on Oct 27.

| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | **Membership** (Face ID gate). | Taps "Freeze membership". | |
| 2 | **Freeze**: plain headline "Let's hit pause." [mobbin-standard-pass §2 rule 29] `DurationChips` "1 month \| 2 months \| 3 months". One sentence above the button: "Your freeze starts Dec 20, your first billing date at least 30 days from today. It ends Feb 19, and billing restarts Feb 20." [mobbin-standard-pass §2 rule 30] Facts: "$10/mo for the account while frozen. Covers everyone on your plan." | Picks "2 months". | Dates update. Total "$20". |
| 3 | List of affected bookings "Bookings from Dec 20 are cancelled. No strikes." (first 3, then "and 4 more"). PT packs "pause while frozen". | | |
| 4 | Button "Freeze membership". | Taps it. | Bottom sheet (`.medium`): pause icon, bold question "Freeze from Dec 20?", full-width "Freeze membership", text link "Not now". [mobbin-standard-pass §2 rule 48] |
| 5 | Success pattern: "Freeze set." "Confirmed" pill; summary; "Add to calendar" (reminder); Done. | | Haptic `booked`. Wallet pass update scheduled. |

Frozen state: Membership shows the neutral pill "Frozen until Feb 19" with pause icon (not green). [mobbin-standard-pass §2 rule 49] "Resume early" button: "Resuming early bills your plan price for the rest of this cycle." The member confirms in a sheet.
Edge: the start date is computed by the server; no date picker. Family plan: only the owner can freeze, and it covers the household. The annual facility fee still bills in March `[PROPOSAL]`. Past due: freeze blocked with "Pay your balance first." Show next renewal date and amount below. [gaps r7]

### 12b Change plan
- **Plans** shows three `PlanCard` and a "Compare plans" sheet (`PlanComparisonTable` as a `Grid`). [shared §9.2]
- Upgrade (Ridge to Summit): `PlanCard` `change`. "Before you switch" list. Summary block: Subtotal, "Prorated by day for the rest of this cycle" with the amount from the server, Today's total, and a plain line on when the new price starts. [found §4] [mobbin-standard-pass §2 rules 31, 32]
- Downgrade: "Takes effect on your next billing date, Nov 12." Lost features with red X and words.
- Trailhead home club change: once per cycle. After one change the row reads "Changed this cycle. Next change after Nov 12."
- Turning 18: the owner gets "Jordan turns 18 on Apr 12. We'll move Jordan to the adult add-on price, +$39/mo, with 30 days' notice."

### 12c Cancel membership
Row at the bottom of Membership. Screen: two buttons, outline "Cancel membership" and filled "Keep my membership". Plain text: "You keep full access until Dec 12, the first billing date at least 30 days from today. You can reinstate with one tap until then." After confirm: a banner "Cancelling Dec 12" with "Reinstate". [mobbin-standard-pass §2 rule 28 for the loss list]

### 12d Failed payment
| Day | Member sees |
|---|---|
| 1 to 7 | Card on Today "We could not charge your card. Retrying on day 3 and day 6." Button "Update payment". Full access. |
| 8 to 14 | Banner "New bookings are paused until you pay." Pass works. `paused` buttons. |
| 15 and after | Pass shows "See the front desk." with a `tel:` button. |
Notification category `BILLING_FAILED`. Face ID gate before editing the card.

---

## Flow 13 — Manage family and teen account

Persona: Mike (owner, parent of Jordan, 16). Family add-on: +$39/adult, +$19/child (6 months to 17). [found §4]

### Parent adds a family member
| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | **Family**. Top row of circular avatars with a grey "+" circle "Add member". [mobbin-standard-pass §2 rule 50] List: Mike (Admin), Jordan. Pending invite row "Invite pending · Send a reminder?" [mobbin-standard-pass §2 rule 51] | Taps "Add a family member". | Sheet (`.large`). |
| 2 | Choose "Adult +$39/mo" or "Child +$19/mo (6 months to 17)". Name, birth date. | Child, "Jordan Hernandez", born 2010. | Age 16 shows "Teen account: Jordan can use the app and check in. You manage billing." |
| 3 | Summary "+$19/mo from your next bill on Nov 5." (Mike's billing day is sample data.) Button "Send invite". | Sends. | Share sheet with `/family/join/{token}`. |

### Teen (13–17) account
- Jordan opens the link, signs in, and sees a short onboarding.
- **Teen mode:** Book shows classes flagged "Teen OK" (all Youth classes plus selected others such as Teen Strength and Mind & Body). Other classes are hidden. Strength floor without a coach needs age 16+; Jordan is 16. Sauna and cold plunge (18+) are hidden.
- Parent toggles in **Family member**: "Courts" (off), "Lap lanes" (off; from age 14), "Check-in alerts" (off). Teen personal training shows "Needs a parent's OK"; the parent gets an approval request in the Inbox.
- You tab for a teen: no billing, no guest passes, no freeze. A card "Your plan is managed by Mike."
- Under 13: no login. They appear in Family with a photo; the parent holds the pass. Kids club covers up to age 12.
- Remove from plan: red row, confirm, effective date in plain text. [gaps r6]
- Owner cannot be removed: "Make someone else the plan owner first."
- A member turning 18: see 12b.

---

## Flow 14 — Guest pass share

Allowance: Ridge 1 per month, Summit 4, Trailhead 0. Included passes reset on the billing date and do not roll over. [found §4]

| Step | Screen | Member does | System does |
|---|---|---|---|
| 1 | **Guest passes**: `ProgressRibs` for allowance (Ridge 1 of 1). "1 guest pass left. Resets Nov 12." | Taps "Share a guest pass". | |
| 2 | **Guest share** sheet (`.medium`): guest first name (optional). Rules: "Valid 14 days from today (until Nov 10). One visit, one club. Guest must be 18+, or 16 to 17 with a guardian waiver." Field with link and "Copy link", plus `ShareLink`. [mobbin-standard-pass §2 rule 36] | Enters "Alex". Shares. | Server makes the pass. Message "Alex, here is your free visit to Cactus Peak Athletic. Sign the waiver and show this at the desk: https://app.cactuspeak.example/guest/xYz9". |
| 3 | Row "Alex · Shared · Expires Nov 10". Status chip: Shared, Waiver signed, Used, Expired. | | Count falls to 0. Haptic `booked`. |

Edge cases:
- 0 left: button becomes "Buy a day pass for a friend, $20". Text "Next guest pass Nov 12."
- Trailhead: `EmptyState` "Guest passes come with Ridge" with "See plans".
- Revoke a Shared pass: swipe or menu. The count returns only if the guest has not signed the waiver. `[PROPOSAL]`
- Guest 16–17: the web page asks for the guardian waiver.
- The class detail "Invite a friend" opens a small sheet: link field, "Copy link", "Guest passes left this month: 1". If 0 left, the button is hidden and the text reads "Guest passes: 0 left this month". [shared §7.2]
- One guest-pass visit per guest per 30 days is enforced by the server; the guest sees a clear message.

---

## Flow 15 — Live Activity for a booked class

Goal: show the booked class on the Lock Screen and Dynamic Island from 60 min before start to 15 min after end. Layout: `04` section 7. [shared §7.1] [mobbin-standard-pass §2 rule 54]

| Phase | Trigger | Content |
|---|---|---|
| Start | 60 min before. Push-to-start `[UNVERIFIED]` or local if the app is open and the class is within 8 h. | Night surface card. Top right timer chip "Starts in 38 min". Class name large. Bottom row of three values "Val Vista · Cycle studio · Booked". |
| T-15 | Update with alert | Third value becomes "Check in open". Tap opens the pass. |
| In progress | Start time | "Ends 6:45 a.m." |
| End | Class end | "Done. Nice work." Dismiss 15 min later. |
Rules: one activity at a time; no promotions; no member name; no waitlist, busyness or kids-club activities; skip the T-15 notification while the activity is active; cancelling ends it at once. [apple §5] Toggle "Show on Lock Screen" on the success screen and in Settings. `ActivityAuthorizationInfo` decides if the toggle shows.

---

## Flow 16 — Siri and App Shortcuts

Phrases include `\(.applicationName)`. Max 10 shortcuts. [skill:app-intents-specialist] Table in `04` section 9.

### 16.1 "Show my pass"
`ShowPassIntent`, `supportedModes = .foreground(.immediate)`. App opens the pass sheet. [skill:app-intents-whats-new-27]

### 16.2 "Book my usual 6 a.m. class"
1. Member says "Book my usual 6 a.m. class in Cactus Peak."
2. `BookUsualClassIntent(slot: .sixAM)`. "Usual" = most-booked class in that weekday slot over 8 weeks at the home club. For Maya: Climb Cycle.
3. Spots left: books in the background. Siri says "Booked Climb Cycle, Thursday 6 a.m. at Gilbert – Val Vista. Free cancel until 4 a.m." Snippet shows `ClassCard` `compact`.
4. Full: `requestChoice` between "Join waitlist" and "See 7:00 a.m." (waitlist sheet consent is replaced by a spoken line "Late cancels count as strikes. Join?" via `requestConfirmation`).
5. Paused: Siri says "Booking is paused until Sat Oct 31."
6. No usual: Siri asks "Which class?"

### 16.3 Other phrases
"What's my next class" → `NextClassIntent`. "How busy is Mesa – Dobson" → `ClubBusynessIntent`. "Cancel my next class" → `CancelNextBookingIntent` with `requestConfirmation` and the strike line when it applies. "Track my next class" → starts the Live Activity. "Reserve a court" → `ReserveCourtIntent` with `requestChoice` for 60 or 90 min; enforces one a day and 2 active.

Rules: `perform()` can restart: use idempotency keys and do irreversible work last. Donate `BookClassIntent` after in-app bookings (`IntentDonationManager` `[verified]`). Do not donate inside `perform()`. `RelevantEntities` has no shipping context for classes `[UNVERIFIED]`. Signed out: throw a `CustomLocalizedStringResourceConvertible` error "Open Cactus Peak and sign in."
