# Cactus Peak Athletic — Member web app: product and information architecture

App: `my.cactuspeakathletic.com` (fictional). Logged-in member portal. Next.js (App Router) + Tailwind. Components: Graphical (`components/graphical/`) first, shadcn/ui (style `base-nova`, Lucide icons) second, shared brand components third.
Business facts come from `../00-foundation.md` and are used exactly. The rules this spec first proposed as **[P1]–[P17]** are now settled in `../00-foundation.md` §4 ("Rules settled"). The IDs stay in this spec as cross-references (section 9). Shared components are defined in `../01-shared-brand-components.md` and `../01-shared-brand-components-part2.md` ("shared spec"). This spec references them and does not redefine them.

## 0. How to read the citations

| Tag | Source |
|---|---|
| `(W §4 r12)` | `research/mobbin-webapp.md`, section 4 "Specific design rules", rule 12 |
| `(W §3.6)` | `research/mobbin-webapp.md`, pattern catalog section 3.6 |
| `(W §5 a4)` | `research/mobbin-webapp.md`, section 5 anti-pattern 4 |
| `(G r18)` | `research/mobbin-gaps.md`, "Design rules" rule 18 |
| `(G §5)` | `research/mobbin-gaps.md`, search detail section 5 |
| `(CL §2)` | `research/component-libraries.md`, section 2 |
| `(F §3)` | `00-foundation.md`, section 3 |
| `(Theme)` | `cactus-peak-brand/ui-theme/README.md` and `theme.json` |
| `(mobbin-standard-pass §2 rule N)` | `research/mobbin-standard-pass.md`, section 2 "New design rules", rule N (tagged [Web app], [iOS] or [Shared components]); `§3 correction N` = section 3 "Corrections" |
| `(shared §8.1)` | `../01-shared-brand-components-part2.md` (section numbers 7–12) or `../01-shared-brand-components.md` (sections 2–6) |
| `[P#]` | Cross-reference ID. The rule now lives in `00-foundation.md` §4. Section 9 maps each ID to the foundation bullet |

Research coverage after `mobbin-standard-pass.md`: web class **cancel** dialogs (rules 26–28), **membership pause** flows (rules 29–30, 48–49; §3 correction 3), **waitlist** (Fresha; §3 correction 5; rule 47), plan change "Before you switch" and Today's total (rules 31–32), billing tables (33–34), household roles (35), guest-pass sharing (36), staff avatar choice (37) and one success pattern (rules 45, 62) are now covered. Still **not observed**: a sport-court grid with courts as columns (the Square availability grid is the nearest; shared §8.2 says the matrix is new), a popular-times busyness chart (the shared spec also treats it as new), a gym check-in pass (Wallet buttons exist only on non-gym passes; §3 correction 4), a kids-club check-in flow, PT booking (nearest: Calendly, rules 25 and 37), and the command menu. For those, this spec names the nearest pattern and says so.

## 1. Product summary

**One sentence.** The member portal answers "What am I doing, can I get in, how busy is it, and where is my pass?" in the first 5 seconds, then lets a member book, change or stop anything about their membership without calling the front desk.

**Principles that drive this app** (from F §6 and the brief):
1. Clubs and classes are rich objects. Every club and class shows photo or icon, category colour + name, instructor face, intensity ribs, spots left and live busyness where the data exists (F §6.1; W §3.4).
2. Answer first. The Today page has no marketing. It has the next thing you do and the state of your club (F §6.2).
3. Specific beats vague. "Climb Cycle, 6:00 a.m., Gilbert – Val Vista, 4 bikes left."
4. Steady, not loud. Sand page, white cards, copper only for action and the active state (Theme).
5. One honest rule per surface. Every limit (7-day window, 2-hour cancel, strikes) appears in plain words at the moment it matters.
6. No dark patterns. Cancel and freeze are as easy to find as join (W §5 a4; G r18–r21).
7. Accessible by default: WCAG 2.2 AA, 44 px targets, Monsoon Sky focus ring, colour never the only signal (F §6.6).

**Out of scope for this app:** join/sign-up and tour booking (marketing site), staff tools, front-desk point of sale, admin schedules. Staff tools must never appear in the member shell (W §5 a8). A new member joins on the marketing site, then receives an email invite that opens `/sign-in` and then `/welcome`.

## 2. Personas and jobs to be done

Personas are the five in F §5. Each row is a job in the form "When…, I want…, so I can…". "Home" is the first route used.

### 2.1 Maya, 34, Gilbert — two kids (6 and 9), hybrid work, checks the app at 5:40 a.m.
Plan: Ridge $79 + 1 adult $39 + 2 children $19 = $156/mo. Home club: Gilbert – Val Vista. Primary member and billing owner.

| # | Job | Home route | Success signal |
|---|---|---|---|
| M1 | When I wake at 5:40 a.m., I want to see if my 6:00 a.m. class still has my spot, so I can leave on time. | `/today` | Next-up card with time, club, studio, "Booked". |
| M2 | When I plan Saturday, I want to book kids club for both kids in one action, so I can swim a lane. | `/reserve/kids-club` | One confirmation for 2 children. |
| M3 | When a class is full, I want a waitlist that tells me fast, so I do not refresh all morning. | `/schedule/[id]` | Push + in-app "Spot held for 30 minutes". |
| M4 | When swim school or a class changes, I want one calendar of the whole family. | `/bookings` | Household filter, calendar feed. |
| M5 | When my card expires, I want to fix it in under a minute. | `/billing` | Banner → card dialog → "Paid". |
| M6 | When summer starts, I want to freeze for a month and know the cost. | `/membership/freeze` | Cost and dates before I confirm. |
| M7 | When I add a child, I want to see the new monthly price first. | `/family` | Price preview shows $19 and the prorated charge. |

### 2.2 Daniel, 52, Mesa — returning after knee surgery, researches on desktop, wants low intensity
Plan: Trailhead $54. Home club: Mesa – Dobson. Later upgrades to Summit for recovery.

| # | Job | Home route | Success signal |
|---|---|---|---|
| D1 | When I choose a class, I want to filter by intensity 1–2 and "good for first-timers", so I do not walk into something too hard. | `/schedule` | Filters saved; rows show ribs and a first-timer flag. |
| D2 | When I plan my week, I want to see warm-water pool and recovery times at my club. | `/clubs/mesa-dobson` | Hours table, schedule links, busyness. |
| D3 | When I want to know if the club is quiet, I want popular times by day, so I can go off-peak. | `/clubs/[slug]` | Popular-times chart with "Now" marker. |
| D4 | When I need one-to-one help after surgery, I want to read coach profiles and book without a phone call. | `/training` | Coach filter by specialty "Return to training". |
| D5 | When I think of Summit, I want to compare plans and see what I would lose or gain, so I can decide calmly. | `/membership/change-plan` | Comparison table + proration preview. |

### 2.3 Priya, 27, Mesa – Downtown — lifts 5 days a week, cycles on Saturdays
Plan: Ridge. Home club: Mesa – Downtown. Wants speed and streaks.

| # | Job | Home route | Success signal |
|---|---|---|---|
| P1 | When booking opens at 6:00 a.m., I want to book in 2 taps, so I get the Saturday ride. | `/schedule` | Row action "Book" with optimistic state; undo toast. |
| P2 | When a class is full, I want to join the waitlist and be promoted automatically. | `/schedule` | Position shown; promotion notice. |
| P3 | When I plan a lift, I want to see how busy the strength floor is now and later. | `/today`, `/clubs/mesa-downtown` | Live busyness (5 levels) + popular times. |
| P4 | When I train, I want my streak and monthly goal to stay visible without shaming rest days. | `/progress` | VisitStreak + ProgressRibs. |
| P5 | When I book fast, I want ⌘K to jump to "Climb Cycle Saturday". | Global | Command menu returns sessions. |

### 2.4 Ron and Linda, 66 and 63, Mesa – Red Mountain — pickleball 4 mornings a week, Aqua Fit
Plan: Ridge ×2 (two accounts, one household). Need large text and no friction. They want to phone support.

| # | Job | Home route | Success signal |
|---|---|---|---|
| R1 | When I want a court, I want to pick the day, then see free courts at a glance, so I can book with the person I play with. | `/reserve/courts` | Grid with green-dot free slots; partner invite. |
| R2 | When the browser text is 200 %, I still need every page usable without side scroll. | All | Reflow at 320 CSS px; sidebar becomes a menu. |
| R3 | When I am stuck, I want to call a person. | Help in the top bar | Club phone number in the help menu on every page. |
| R4 | When Linda books a court for both of us, I want it on both calendars. | `/reserve/courts` | Partner accepts; both get the calendar entry. |
| R5 | When I want Aqua Fit on the same morning as pickleball, I want to see conflicts. | `/schedule` | Conflict warning with times. |

### 2.5 Jordan, 16, Gilbert – Val Vista — Teen Strength member on a family plan, mobile only
Role: teen. A parent owns billing. Jordan uses the web app on a phone browser, so the responsive layout at 375 px is the main layout for this persona.

| # | Job | Home route | Success signal |
|---|---|---|---|
| J1 | When I arrive at the club, I want my pass on screen fast. | `/pass` (also bottom-bar tab) | Pass loads in under 1 s from cache. |
| J2 | When I plan the week, I want a simple list of Teen Strength and other classes I may join. | `/schedule` (list view) | Only teen-eligible classes bookable [P8]. |
| J3 | When the coach changes the time, I want a message. | `/inbox` | Notification + email. |
| J4 | When I ask for something I cannot do (billing), I want a clear answer. | `/membership` (blocked) | "Your parent manages billing. Ask Alicia." |

## 3. App shell decision

**Decision: a labelled left sidebar for destinations plus a slim top bar for context. A bottom tab bar replaces both below 768 px.**

Reasons:
1. The app has 14 destinations in 4 groups. A top nav holds 4–6 items. ClassPass, Meetup and Sweatpals use a top bar because they have few destinations (W §3.1). Toggl, Zoho and Base44 use a grouped left sidebar with small section labels because they have many (W §3.1). We follow the second group.
2. The settings-style pages (Membership, Billing, Settings) use an inner left list nav inside a card (W §3.1, Meetup a3a6aeaf). The shell sidebar and the inner list nav do not compete because the inner nav appears only on those pages and only at 1024 px and wider.
3. Ron and Linda need visible words. Icon-only rails hide meaning. The sidebar is **expanded with labels at 1024 px and wider**. A member can collapse it to icons (shadcn `sidebar-07`, `collapsible="icon"`); the choice is saved per device. Below 1024 px the sidebar is **hidden** and opens as a Drawer from a "Menu" button. We do not show an icon-only rail at tablet width.
4. Club, search, alerts and account are not destinations. They are context. They sit in the top bar on every page (consistent help and context location, WCAG 3.2.6).
5. On phones (Jordan, Maya at 5:40 a.m.) the 5 most used destinations sit in a bottom tab bar with 44 px targets and 11 px (XXS) labels. XXS is allowed only for tab labels (Theme).

### 3.1 Shell geometry

| Region | ≥1280 | 1024–1279 | 768–1023 | <768 |
|---|---|---|---|---|
| Sidebar | 264 px expanded (64 px if collapsed) | same | Drawer, 320 px wide | Drawer, 100 % width minus 48 px |
| Top bar | 64 px, sticky, surface | 64 px | 64 px | 56 px; shows logo symbol, ClubSwitcher, bell, avatar |
| Bottom tab bar | none | none | none | 64 px + safe area; Today, Schedule, Bookings, Pass, More |
| Content max width | 1200 px centred | fluid | fluid | fluid |
| Page gutter | 32 px | 32 px | 24 px | 16 px |
| Grid | 12 columns, 24 px gap | 12, 24 | 8, 16 | 4, 16 |

Sticky offsets: set `scroll-padding-top: 80px` (top bar + 16) and `scroll-padding-bottom: 96px` when a sticky action bar or tab bar shows, so focused items are never hidden (WCAG 2.4.11).

### 3.2 Sidebar content (groups with small labels; W §3.1)

| Group label (eyebrow style) | Item | Lucide icon | Route | Badge |
|---|---|---|---|---|
| (none) | Today | `Sun` | `/today` | — |
| (none) | Schedule | `CalendarDays` | `/schedule` | — |
| (none) | My bookings | `Ticket` | `/bookings` | count of held spots (amber) |
| BOOK | Reserve | `Grid2x2` (court) | `/reserve` | — |
| BOOK | Training | custom barbell-as-ribs icon (fallback `Dumbbell`) | `/training` | PT credits left |
| EXPLORE | Clubs | `MapPin` | `/clubs` | — |
| EXPLORE | Progress | `TrendingUp` | `/progress` | — |
| ACCOUNT | Family | `Users` | `/family` | — |
| ACCOUNT | Membership | `IdCard` | `/membership` | status pill if Frozen/Payment failed |
| ACCOUNT | Billing | `CreditCard` | `/billing` | red dot if payment failed |
| ACCOUNT | Guest passes | `Gift` | `/guest-passes` | passes left |
| Footer | Inbox | `Inbox` | `/inbox` | unread count |
| Footer | Settings | `Settings` | `/settings` | — |
| Footer | Help | `CircleHelp` | `/help` | — |
| Footer | Account menu (Avatar + name + plan) | — | menu | — |

Active item: `primary-subtle` fill, `primary`-coloured 3 px left rule, label in `text`, `aria-current="page"`. Copper is used for the active state only (Theme). Hover: `surface-muted`.
Role filtering: Teen sees Today, Schedule, My bookings, Training (read), Clubs, Progress, Inbox, Settings, Help. Teen never sees Family, Membership, Billing, Guest passes, Reserve > courts/kids club (section 6).

### 3.3 Mobile tab bar (<768 px)

`Today` · `Schedule` · `Bookings` · `Pass` (centre emphasis: the Pass tab opens `/pass`) · `More` (opens the Drawer with the full sidebar). Tab bar uses `Tabs`-like roving focus with `role="navigation"`, not `role="tablist"`, because each tab is a link.

## 4. Global elements

### 4.1 Top bar (left to right)
1. **Sidebar trigger** (`SidebarTrigger`, icon `PanelLeft`, label "Toggle sidebar", `⌘/Ctrl+B`). Below 1024 px label "Menu".
2. **ClubSwitcher** (shared, mode `single`; Graphical `Popover` on wide screens, `Drawer` on narrow screens; shared §6.3): button shows club name + 5-rib BusynessMeter + level word. See 4.2.
3. **Search / ⌘K trigger**: input-like button, 44 px high, placeholder "Search classes, clubs, coaches", `kbd` hint "⌘K" (Ctrl K on Windows). Opens CommandMenu (4.3). Below 768 px: icon button.
4. **Pass button** (outline `Button`, icon `QrCode`, label "Pass"): opens a `Dialog` with `CheckInPass` `full` (shared §9.3) at ≥1024; navigates to `/pass` below 1024.
5. **Notifications bell** (`Button` ghost, icon `Bell`, red dot count): Popover (4.4).
6. **Help** (`CircleHelp`): menu with "Help centre", "Message the front desk", "Call Gilbert – Val Vista (480) 555-0142", "Keyboard shortcuts". Same place on every page (WCAG 3.2.6).
7. **Account menu** (`Avatar` + chevron, Graphical `Menu`): name, plan, "Switch member" (household), Settings, Billing, Dark mode (System / Light / Dark), Sign out.

### 4.2 ClubSwitcher
- Purpose: set the **viewing club** used by Schedule, Reserve, Clubs, Training and Today status. Stored in cookie `cp_club` and in the user preference `viewingClub`. Default = home club.
- Open state: popover 360 px wide. Search field with "Use my location" action at top (W §4 r19; G §3 Sweatpals pattern). Clubs grouped by city: **MESA** (3) and **GILBERT** (2) (region-grouped list, W §4 r34). Each row: club thumbnail (40 px), name, "Home" tag, BusynessMeter with level word, distance if location allowed.
- Trailhead members: other clubs show a lock icon and "Ridge or Summit". Choosing one opens the club page (browse only). Schedule for those clubs is read-only with "Book" disabled and the reason shown.
- Location permission is requested only after the member picks "Use my location". Nothing is asked on load.
- Keyboard: type to filter, arrow keys, Enter selects, Esc closes and returns focus to the trigger.
- Live region: after change, announce "Viewing Mesa – Dobson. Busyness: Steady."

### 4.3 Command menu (⌘K) — shadcn `command` in Graphical `Dialog`
- Open: `⌘K` or `Ctrl+K`, or click the search button. Close: Esc.
- Groups (in order): **Suggestions** (when empty: "Show my pass", "Book a class", "Reserve a court", "Freeze membership"), **Sessions** (search class name, instructor, "Saturday"), **Clubs**, **Coaches**, **Pages**, **Actions** ("Add to calendar", "Update payment method", "Send a guest pass"), **Help**.
- Each result: icon, label, secondary text (time, club), right-aligned shortcut or "Open".
- Natural-language date words in the query ("tomorrow", "sat") filter Sessions.
- Actions that spend money or end something (Cancel membership, Buy pack) open their normal page; they do not run from the menu.
- Not observed in research (W "Coverage gaps"). Pattern source: shadcn `command` docs (CL §2).
- Teen role: no billing or membership results.

### 4.4 Notifications
- Bell → Popover 400 px wide (Plane/Klaviyo pattern, W §3.10). Header "Notifications", "Mark all read" action (W §4 r38). Tabs: All, Needs action.
- Row: icon, bold title, one-line text, relative time, red unread dot (W §4 r38). The red dot means "unread" only. Red is not used for good news (W §5 a9), so "Spot held" uses an amber icon, not a red dot beyond the unread marker.
- Footer link "Open inbox" → `/inbox`.
- Needs-action rows carry an inline button ("Keep spot", "Update card").
- Live: new items arrive over the same SSE channel; bell announces count via `aria-live="polite"`.

### 4.5 Global banners (stack under the top bar, one at a time, highest priority first)
1. **Payment failed** (danger-subtle): "Your Nov 12 payment didn't go through. Update your card to keep booking." + "Update card". Pattern: trial banner (W §3.8, W §4 r28).
2. **Booking paused** (warning-subtle): "Booking is paused until Fri, Oct 30, 9:12 a.m. You have 3 late cancels in 30 days."
3. **Membership frozen / freeze scheduled** (surface-muted with status pill).
4. **Offline** (surface-muted): "You're offline. Showing what we saved. Booking is off until you're back."
5. **Held spot** (warning-subtle) is shown on Today as WaitlistBanner, not globally.

## 5. Route map

Conventions: Next.js App Router. Route groups: `(auth)` public, `(app)` signed in. All times are `America/Phoenix` (no daylight saving). Dynamic segments in brackets. "Panel" means the route also opens as an intercepted overlay (see 5.2).

| Route | Page | Purpose | Roles allowed | Notes |
|---|---|---|---|---|
| `/sign-in` | Sign in | Email, passkey, magic link | public | `login-03` layout |
| `/sign-in/verify` | Code entry | 6-digit code | public | `OTPField` |
| `/sign-in/link/[token]` | Magic-link landing | Completes sign-in | public | one-time, 10 min |
| `/welcome` | Onboarding (steps 1–5) | First run | primary, adult, teen | query `?step=` |
| `/` | Redirect | → `/today` | all | |
| `/today` | Today | Agenda, next up, club status | all | |
| `/schedule` | Schedule | Week grid / list | all | query state in URL |
| `/schedule/[sessionId]` | Session detail | Panel and full page | all | intercepted panel |
| `/bookings` | My bookings | Upcoming, past, waitlist | all | household filter |
| `/reserve` | Reserve hub | Courts, lanes, kids club | primary, adult, teen* | *teen limited [P8] |
| `/reserve/courts` | Court grid | Reserve a court | primary, adult (Ridge+) | |
| `/reserve/lanes` | Lane grid | Reserve a lap lane | primary, adult, teen* | |
| `/reserve/kids-club` | Kids club blocks | Book children | primary, adult | |
| `/reserve/confirmed/[reservationId]` | Confirmation | Green check | owner | |
| `/clubs` | Clubs | List + map | all | |
| `/clubs/[slug]` | Club detail | Live busyness, hours, schedule | all | slugs: `mesa-dobson`, `mesa-red-mountain`, `mesa-downtown`, `gilbert-val-vista`, `gilbert-heritage` |
| `/training` | Training | PT overview, coaches, packs | primary, adult, teen (read) | |
| `/training/coaches/[coachSlug]` | Coach profile | Bio, availability | same | |
| `/training/coaches/[coachSlug]/book` | PT booking | Slot picker, pack | primary, adult | teen: parent approval [P8] |
| `/progress` | Progress | Visits, streak, class mix | all (own data) | |
| `/family` | Family | Household | primary; adult read; teen none | |
| `/family/add` | Add member | Wizard | primary | |
| `/family/[memberId]` | Member profile | Edit, permissions | primary | |
| `/membership` | Membership overview | Plan, status, actions | primary | |
| `/membership/change-plan` | Change plan | Compare + preview | primary | |
| `/membership/freeze` | Freeze | FreezeWizard | primary | |
| `/membership/cancel` | Cancel membership | 3 steps | primary | |
| `/billing` | Billing | Card, next charge, invoices | primary | |
| `/billing/invoices/[invoiceId]` | Invoice | Detail + PDF | primary | |
| `/billing/payment-method` | Update card | Opens as dialog | primary | intercepted |
| `/guest-passes` | Guest passes | Balance, history | primary, adult* | *Ridge/Summit |
| `/guest-passes/send` | Send / buy | Dialog or page | primary, adult | |
| `/inbox` | Inbox | Notifications + messages | all | |
| `/inbox/[threadId]` | Thread | Coach/club message | all | |
| `/settings` | Settings home | → `/settings/profile` | all | inner list nav |
| `/settings/profile` | Profile | Name, photo, contacts | all | |
| `/settings/preferences` | Home club and interests | | all | |
| `/settings/notifications` | Notification preferences | | all | |
| `/settings/calendar` | Calendar feed | ICS URL | all | |
| `/settings/security` | Sign-in and security | Passkeys, devices | all | |
| `/settings/display` | Display and accessibility | Theme, motion, text | all | |
| `/settings/privacy` | Privacy and data | Export, delete | all | |
| `/pass` | Check-in pass | QR, member number | all | switch member |
| `/help` | Help | FAQ, contact | all | |
| `/403` | No access | Role block | all | friendly copy |
| `/offline` | Offline | PWA fallback | all | |

### 5.1 URL state (shareable, back-button safe)
- `/schedule?club=gilbert-val-vista&date=2026-10-27&view=week|list&cat=cycle,strength&time=early|morning|midday|evening&int=1-3&inst=ses&open=1&first=1&mine=1`
- `/reserve/courts?club=mesa-red-mountain&sport=pickleball&date=2026-10-31&dur=90`
- `/bookings?tab=upcoming|waitlist|past&who=all|maya|theo`
- Filters write to the URL with `router.replace` (no history spam). Date and view use `push`.

### 5.2 Intercepted panel routes
- `app/(app)/schedule/@panel/(.)[sessionId]/page.tsx` renders the **panel** over the schedule when the member clicks a row or block. The URL changes to `/schedule/[sessionId]`.
- `app/(app)/schedule/[sessionId]/page.tsx` renders the **full page** on direct load, refresh, share link or email link.
- Same approach: `/billing/payment-method` (dialog), `/guest-passes/send` (dialog), `/clubs/[slug]` quick view from the map callout (drawer).

### 5.3 File tree (reference)
```
app/
  (auth)/sign-in/{page,verify/page,link/[token]/route}.tsx
  (app)/
    layout.tsx            -> AppShell
    today/page.tsx
    schedule/{page.tsx,[sessionId]/page.tsx,@panel/(.)[sessionId]/page.tsx,default.tsx}
    bookings/page.tsx
    reserve/{page,courts/page,lanes/page,kids-club/page,confirmed/[reservationId]/page}.tsx
    clubs/{page.tsx,[slug]/page.tsx}
    training/{page.tsx,coaches/[coachSlug]/{page,book/page}.tsx}
    progress/page.tsx
    family/{page,add/page,[memberId]/page}.tsx
    membership/{page,change-plan/page,freeze/page,cancel/page}.tsx
    billing/{page,invoices/[invoiceId]/page,@dialog/(.)payment-method/page}.tsx
    guest-passes/{page,send/page}.tsx
    inbox/{page,[threadId]/page}.tsx
    settings/{layout,profile,preferences,notifications,calendar,security,display,privacy}/page.tsx
    pass/page.tsx
    help/page.tsx
  api/ (route handlers: stream/sessions (SSE), clubs/[id]/busyness, calendar/[token].ics, passes/token)
```

## 6. Roles and permissions

Four roles exist in one household (`household`). The billing owner is the **primary member**.

| Role | Who | Login | Age |
|---|---|---|---|
| **Primary member** | Account owner and billing owner | Yes | 18+ |
| **Family adult** | Added adult ($39/mo) | Yes (own email) | 18+ |
| **Teen** | Child 13–17 ($19/mo) | Yes (own email, parent consent) | 13–17 |
| **Child** | Child under 13 ($19/mo add-on from age 3) | No. Managed by an adult | Under 13. Kids club takes ages 6 months–12 years |

### 6.1 Capability matrix
Legend: Y = yes · N = no · P = only with primary member approval or toggle · R = read only · Own = own data only.

| Capability | Primary | Family adult | Teen | Child |
|---|---|---|---|---|
| See own pass `/pass` | Y | Y | Y | Y (adult shows it) |
| See household passes | Y | Y | N | N |
| View schedule and clubs | Y | Y | Y | — |
| Book classes (own) | Y | Y | P: only "Teen OK" classes [P8]; strength floor without a coach 16+; no sauna or cold plunge (18+) | — |
| Book classes for a child | Y | Y | N | — |
| Join waitlist | Y | Y | Y (own, teen-eligible) | — |
| Reserve court | Y (Ridge+) | Y (Ridge+) | P: join as invited player only; can create if parent turns on "Court reservations" | — |
| Reserve lap lane | Y | Y | P: parent toggle "Lap lanes", age 14+ [P8] | — |
| Book kids club | Y | Y | N | — |
| Book PT | Y | Y | P: parent approves the request [P8] | — |
| Send guest pass | Y | Y (uses shared pool) | N | — |
| View progress | Own | Own | Own (parent can see check-ins and bookings) | Parent view only |
| View Family page | Y (edit) | R | N | — |
| Add / remove members | Y | N | N | — |
| View Membership | Y | R (plan name and status) | N | — |
| Change plan, freeze, cancel | Y | N | N | — |
| View Billing and invoices | Y | N | N | — |
| Update payment method | Y | N | N | — |
| Notification settings (own) | Y | Y | Y | Parent sets |
| Messages with coach | Y | Y | Y (parent copied) | — |

### 6.2 Behaviour when blocked
- Navigation hides what a role cannot use (no dead ends).
- A direct URL opens `/403` with a plain reason and a next step. Example for a teen at `/billing`: "Your parent manages billing. Ask Alicia, or send her a note." Button "Message Alicia" (creates an inbox message to the primary member).
- Server enforces all permissions. The client hides UI but does not guard data.
- A family adult sees "Managed by Maya" on Membership (read-only plan name, status, next renewal date, no price breakdown beyond their own add-on).
- Teens: Settings > Privacy states "Your parent can see your bookings and check-ins." (honest disclosure).

### 6.3 Booking for others (BookingForSelect)
Adults can pick **who** a booking is for with `BookingForSelect` in the booking panel ("Booking for: Maya ▾ / Chris / Theo / Ivy"). Children who do not meet the class rule are shown disabled with the reason ("Climb Cycle is for ages 13 and up").

## 7. Plan gating (F §4)

| Feature | Trailhead $54 | Ridge $79 | Summit $129 |
|---|---|---|---|
| Clubs bookable | Home club only | All 5 | All 5 |
| Classes and pools | Home club | All clubs | All clubs |
| Booking window (classes) | 7 days | 7 days | 9 days |
| Courts (3 days ahead) | No | Yes | Yes |
| Guest passes per billing month | 0 (can buy $20) | 1 | 4 |
| Recovery suite | No | No | Yes |
| Towel service | No | No | Yes |
| PT intro session | No | No | 1 per quarter |
| Kids club (children on plan) | Included for children on the plan, at clubs that have one | same | same |

Locked features are never hidden. They show a lock icon, one sentence and a link to compare plans. Example: "Courts come with Ridge and Summit. Compare plans." (W §4 r21, r24). Lock copy never shames.

## 8. Cross-cutting rules

1. **Time zone.** Show "Arizona time (no daylight saving)" under every calendar or time list (W §4 r15; G r23). Store UTC, render `America/Phoenix`.
2. **Booking windows.** Classes: 7 days ahead (Summit 9). Courts: 3 days ahead. Windows open at 6:00 a.m. Arizona time on the opening day [P1]. Closed dates are greyed with a dot-free cell and the text "Opens Wed, Oct 28 at 6:00 a.m." (W §5 a3).
3. **Cancel.** Free up to 2 hours before start. Later is a late cancel (a strike). 3 strikes in 30 days = 3-day booking pause (F §3). Every cancel control states which case applies before the member confirms.
4. **Waitlist.** Auto-promotes until 1 hour before start. Push notification. 30-minute hold (F §3).
5. **Prices always have units.** "$79 per month", "$20 per guest" (W §5 a2).
6. **Undo.** Every booking, cancel and waitlist action shows an Undo toast for 10 seconds when undo is safe. A booking made less than 10 seconds ago can be cancelled with no strike.
7. **Live data.** Busyness refreshes every 5 minutes. Spots left update live (section "Real-time" in `04-components.md`).
8. **One popover at a time** (W §5 a7). Opening a second closes the first.
9. **No admin concepts** in member copy: no "slots released", "capacity override".
10. **Left-aligned text** for anything longer than one line (W §5 a10).
11. **Age rules** (F §4 "Rules settled"): sauna and cold plunge are 18+. The strength floor without a coach is 16+. Classes and slots that carry an age rule show an age chip (shared `ClassCard` "Age chip") and the booking state shows the reason.
12. **One success pattern** for every confirmation (mobbin-standard-pass §2 rules 45, 62; shared §7.2): one green check, one headline, a "Confirmed" pill, a summary card, a filled "Add to calendar" button, a "Share" text link and "Done".
13. **No public ratings** at launch. Members can send private feedback after a class (F §4). No star rating appears anywhere in the app.

## 9. Rules now settled in the foundation (cross-reference table)

The rules this spec first proposed are canonical in `../00-foundation.md` §4, block "Rules settled after the first spec drafts". This table keeps the **P-IDs** so other files can cross-reference. If the table and the foundation differ, the foundation wins.

| ID | Rule (short) | Foundation §4 bullet | Change from the first draft | Used in |
|---|---|---|---|---|
| P1 | Windows open 6:00 a.m. Arizona time on the opening day | Booking windows | Kids club now follows the 7-day class window. | Schedule, Reserve, Today |
| P2 | No-show = late cancel | Strikes | None | Cancel flow, copy |
| P3 | Pause blocks class, court, lane bookings only | Strikes | None | Booking states |
| P4 | Courts and lanes use the 2-hour rule and strikes; kids club has no strikes | Strikes | None | Reserve |
| P5 | One court per member per day, 2 active | Courts | None | Courts |
| P6 | Lane slot holds 2 swimmers; "Any lane" default; no lane waitlist | Lap lanes | Lane counts are now fixed: Mesa – Dobson 8, Mesa – Red Mountain 8 (25 m outdoor), Gilbert – Val Vista 6. The slot reads "1 of 2 swimmers". | Lanes |
| P7 | Kids club blocks, max 2 per child per day, parent checks in, release 15 min after start, waitlist | Kids club | **Ages are 6 months–12 years** (was 3–12). | Kids club |
| P8 | Teen rules | Teens (13–17) | Mind & Body is named as a Teen OK example. Age rules added: sauna and cold plunge 18+; strength floor without a coach 16+. | Permissions |
| P9 | Guest pass rules | Guest pass | None | Guest passes |
| P10 | PT prices and policies | Personal training | None | Training |
| P11 | Freeze | Freeze | None | Freeze |
| P12 | Plan changes, cancel, home club change, turning 18 | Plan changes | None | Plans |
| P13 | Failed payment timeline | Failed payment | None | Billing |
| P14 | Up to 5 waitlists; 30-minute hold | Waitlist | **Hold mechanic is settled:** the first person gets a push and holds the spot for 30 minutes. They must tap **"Confirm spot"** or the spot goes to the next person. Promotions stop 1 hour before start. Inside that hour, open spots show as drop-in spots. | Waitlist |
| P15 | 5-minute checkout hold, one 5-minute extension | Courts | The foundation names courts and kids-club slots. | Reserve |
| P16 | Billing day fixed per household | Billing day | None | Billing |
| P17 | Streak rule | Streak | None | Progress |
| (new) | No public ratings. Private feedback after a class. | Ratings | New | Bookings, Inbox |

**Still app-level decisions (not in the foundation; confirm with the coordinator):**
1. Sign-in stays read-only for 90 days after a membership ends (invoices, data export, reactivate).
2. Unused PT sessions are refunded at the price paid per session when a membership is cancelled.
3. PT slot picking uses the same 5-minute checkout hold as courts.
4. The child add-on is +$19 per month for ages 6 months–17 (foundation §4). Children 12 and under get kids club; teens 13–17 follow the teen rules.
5. Early resume from a freeze charges the household monthly price (plan and add-ons) for the rest of the cycle, by day (foundation: "the plan price for the rest of the cycle"). Example: $156.00 × 16 ÷ 31 = $80.52.

Example billing numbers in this spec use: Maya's billing day = the 12th; today = Tuesday, Oct 27, 2026.

## 10. Content model (data the pages read)

`Member {id, householdId, role, name, dob, photoUrl, plan, homeClubId, memberNumber, strikes[], bookingPauseUntil}`
`Club {id, slug, name, city, address, type, sqft, photos[], personality, amenities[], hours, staffedHours, kidsClubHours, pool?, courts[], lat, lng, busyness{level 1–5, label, updatedAt, checkinCount}}`
`Session {id, clubId, type, name, category, studio, startsAt, durationMin, instructorId, intensity 1–5, capacity, spotsLeft, waitlistCount, equipment[], firstTimerOk, teenOk, minAge, description}`
`Booking {id, memberId, sessionId|reservationId, status: booked|held|waitlisted|cancelled|late_cancelled|attended|no_show, createdAt, holdExpiresAt?, position?}`
`Reservation {id, kind: court|lane|kidsclub|pt, clubId, resourceId, startsAt, durationMin, players[], status}`
`Plan {id: trailhead|ridge|summit, price, perks}` · `Subscription {planId, status: active|frozen|freeze_scheduled|payment_failed|cancel_scheduled|cancelled, billingDay, nextBillingDate, freeze?, cancelOn?}`
`Invoice {id, date, lines[], total, status, pdfUrl}` · `PaymentMethod {brand, last4, exp, isDefault}`
`GuestPass {id, status: sent|opened|used|expired|revoked, guestName, contact, validUntil, clubId}`
`Notification {id, type, title, body, createdAt, readAt, action?}` · `Thread {id, with, messages[]}`
`Visit {memberId, clubId, at, source: scan|class}`
