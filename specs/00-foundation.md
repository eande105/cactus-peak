# Cactus Peak Athletic — Product foundation (shared facts for all three specs)

This file is the single source of business facts for the marketing website, the member web app and the iOS app.
All three specs use these names, numbers and rules. If a spec needs a new fact, add it here first.
Brand sources: `../cactus-peak-brand/identity/brand-guidelines.md`, `../cactus-peak-brand/identity/01-design-brief.md`,
`../cactus-peak-brand/ui-theme/README.md`, `../cactus-peak-brand/ui-theme/theme.json`.
Fictional brand for a university senior project. Addresses are fictional cross streets.

## 1. What the brand is
- **Promise:** *Every member climbs at their own pace.* Primary tagline: **"Climb at your own pace."**
  Secondary: "Five clubs. One climb." · "Built for the East Valley."
- **Position:** a full-service neighbourhood athletic club. More than a big-box gym (pools, courts, recovery, kids club),
  less intimidating than a hard-core box. Steady, grounded, sun-built, welcoming, capable.
- **Voice:** a steady coach who knows your name. Specific, local, warm, a little dry about the heat. Never hype, never shame.
- **Symbol:** the Rib Peak — five upright saguaro ribs that form one summit, one rib for each club. The five-rib motif
  may show progress or capacity (five bars). Never use more or fewer than five ribs when the motif means "the clubs".

## 2. The five clubs
Club names are always "City – Neighbourhood". Each club has a signature photo direction and a short "personality line".

| # | Club | Address (fictional) | Type | Signature amenities | Personality line |
|---|---|---|---|---|---|
| 1 | **Mesa – Dobson** | Dobson Rd & Southern Ave, Mesa | Flagship, 68,000 sq ft | 25-yd lap pool (8 lanes) + warm-water therapy pool, 4 pickleball + 2 tennis courts, full recovery suite (cold plunge, sauna, compression), 3 studios + cycle studio, kids club, café | "The big one. Bring the whole family." |
| 2 | **Mesa – Red Mountain** | Power Rd & McKellips Rd, Mesa | Full club, 52,000 sq ft | Outdoor 25-m pool with shade sails, 6 pickleball courts, turf lane, 2 studios + cycle studio, kids club, Superstition-view cardio deck | "Sunrise over the Superstitions, every morning." |
| 3 | **Mesa – Downtown** | Main St & Center St, Mesa | Studio club, 18,000 sq ft | Strength floor, 2 studios, cycle studio, recovery lounge (sauna, compression). No pool, no courts, no kids club | "In and out before your 8 a.m." |
| 4 | **Gilbert – Val Vista** | Val Vista Dr & Warner Rd, Gilbert | Full club, 60,000 sq ft | 25-yd lap pool + splash pad, swim school, 2 basketball courts, 4 pickleball courts, recovery suite, 3 studios + cycle studio, kids club | "Swim school, courts, and a kids club that kids ask for." |
| 5 | **Gilbert – Heritage** | Gilbert Rd & Page Ave, Gilbert | Studio club, 22,000 sq ft | Strength floor, Olympic lifting platforms, 2 studios, cycle studio, recovery lounge, rooftop mobility deck. No pool, no courts | "Lifting platforms and a rooftop at golden hour." |

**Hours (all clubs):** Mon–Fri 4:30 a.m.–10:00 p.m. · Sat–Sun 6:00 a.m.–8:00 p.m. Staffed hours 6:00 a.m.–8:00 p.m.
Kids club: Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m. Pools close 30 min before the club.
**Live busyness:** each club reports a check-in count every 5 min → shown as 5 levels (Quiet, Light, Steady, Busy, Packed),
drawn as the five-rib meter. Typical-hours chart by day (Google "popular times" style).

## 3. Class and activity taxonomy
Every class has: type, name, club, studio/room, start time, duration, instructor, intensity (1–5 ribs), capacity, spots left,
equipment notes, and "good for first-timers" flag. Category colour is never the only signal: a category always shows its icon
and its name.

| Category | Example classes | Icon idea (Lucide base + custom) | Category colour (checked in 01-shared-brand-components.md) |
|---|---|---|---|
| **Strength** | Rib Rack Strength, Barbell Basics, Kettlebell Flow, Olympic Lifting Club | barbell drawn as ribs (custom) | Arizona Copper `#B5532C` (text: Copper Deep `#9E4522`) / dark `#E0804F` |
| **Cycle** | Climb Cycle, Rhythm Ride, Endurance 60 | bike | Saguaro `#2F5A45` / dark `#6FB08F` |
| **Conditioning** | Switchback HIIT, Canal Run Club, Bootcamp | activity / timer | Monsoon Amber `#8A5300` / dark `#F2B14C` |
| **Mind & Body** | Desert Flow Yoga, Mat Pilates, Mobility 30, Breathwork | flower / lotus | Sage `#52684A` / dark `#A9C29A` |
| **Aqua** | Lap Swim (reservable lanes), Aqua Fit, Swim School, Masters Swim | waves | Canal Teal `#1F6E7A` / dark `#6FC3CF` |
| **Court** | Pickleball Open Play, Pickleball Clinic, Tennis Drills, Hoops Run | custom court | Caliche Gold `#7F6019` / dark `#E0C27A` |
| **Recovery** | Stretch & Release, Sauna + Plunge slots, Compression | heart-pulse / snowflake | Dusk Violet `#5F4E86` / dark `#B6A6E0` |
| **Youth** | Kids Club (6 mo–12 yr), Teen Strength, Junior Pickleball | smile / custom | Prickly Pear `#9C3D6B` / dark `#E59BC0` |

Intensity scale: 1 Easy · 2 Light · 3 Moderate · 4 Hard · 5 All-out (shown as five ribs, filled from the left).
Booking rules: book up to 7 days ahead (Summit: 9 days). Cancel free up to 2 h before; later = late cancel (counts as a strike;
3 strikes in 30 days = 3-day booking pause). Waitlist auto-promotes until 1 h before start, with a push notification and
a 30-min hold. Courts: 60- or 90-min slots, book 3 days ahead. Lap lanes: 45-min slots. Kids club: 2-h blocks, check-in by parent.

## 4. Membership plans
| Plan | Price | What it includes |
|---|---|---|
| **Trailhead** | $54/mo | One home club, classes and pools at that club, app booking 7 days ahead |
| **Ridge** (most popular) | $79/mo | All 5 clubs, all classes, courts (book 3 days ahead), 1 guest pass/mo |
| **Summit** | $129/mo | Ridge + recovery suite, 9-day booking, 4 guest passes/mo, towel service, 1 PT intro session/quarter |
| Family add-on | +$39/adult, +$19/child (6 months–17) | Same access as the main member's plan; kids club included for children 12 and under; teens 13–17 follow the teen rules |
| Day pass | $20 | One visit, one club |

Rules settled after the first spec drafts (canonical; the web app spec proposed most of these as P1–P17):
- **Booking windows** open at 6:00 a.m. Arizona time on the opening day (classes and kids club 7 days, Summit 9; courts 3 days).
- **Strikes:** a no-show counts as a late cancel. A booking pause blocks new class, court and lane bookings; it does not block
  kids club, PT, check-in or cancelling. Courts and lanes use the same 2-hour cancel rule and strikes. Kids club has no strikes.
- **Waitlist:** up to 5 active waitlists per member. When a spot opens, the first person gets a push notification and holds
  the spot for 30 min; they must tap "Confirm spot" in that time, or the spot goes to the next person. Promotions stop 1 h
  before start; inside that hour, open spots show as drop-in spots. Lap lanes have no waitlist; kids club blocks do.
- **Courts:** one court reservation per member per day, at most 2 active. Checkout holds a court or kids-club slot for 5 min
  (one 5-min extension).
- **Lap lanes:** Mesa – Dobson 8 lanes, Mesa – Red Mountain 8 lanes (25 m outdoor), Gilbert – Val Vista 6 lanes. Up to 2
  swimmers share a lane (circle swim); the slot shows "1 of 2 swimmers". "Any lane" is the default choice.
- **Kids club:** ages 6 months–12 years. Blocks Mon–Sat 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m.,
  6:00–8:00 p.m.; max 2 blocks per child per day. The parent must check in at the same club; an unclaimed block is released
  15 min after start.
- **Teens (13–17):** book classes flagged "Teen OK" (all Youth classes plus selected others, e.g. Teen Strength, Mind & Body).
  Parent toggles allow courts and lap lanes (lanes from 14). Teen PT needs parent approval. The parent manages billing.
- **Age rules:** sauna and cold plunge 18+. Strength floor without a coach 16+.
- **Guest pass:** guest 18+, or 16–17 with a guardian waiver. Valid 14 days from send; one visit, one club. Included passes
  reset on the billing date and do not roll over. An extra pass is the $20 day pass.
- **Personal training:** single $75; packs 4 = $276, 8 = $520, 12 = $732. Sessions 45 min (Summit intro 30 min). Free cancel or
  reschedule up to 24 h before. Packs valid 12 months and pause during a freeze.
- **Freeze:** starts on the first billing date at least 30 days after the request; 1, 2 or 3 months; whole household;
  $10/mo for the account. Bookings inside the freeze are cancelled with no strike. Early resume bills the plan price for the rest of the cycle.
- **Plan changes:** upgrade now, prorated by day; downgrade on the next billing date; cancel on the first billing date at least
  30 days after the request, with full access and one-click reinstate until then. Trailhead members may change home club once
  per cycle. A member turning 18 moves to the adult add-on price (30-day notice).
- **Failed payment:** retries on day 3 and day 6; full access to day 7; new bookings paused from day 8; from day 15 the pass
  shows "See the front desk".
- **Billing day** is fixed per household (Maya's is the 12th).
- **Streak:** a streak week meets the member's weekly visit target (default 3). One rest week is forgiven per 10 weeks.
- **Ratings:** no public star ratings at launch. Members can give private feedback after a class.
- **Phones (fictional):** member services (480) 555-0100. Clubs: Mesa – Dobson (480) 555-0114 · Mesa – Red Mountain
  (480) 555-0127 · Mesa – Downtown (480) 555-0139 · Gilbert – Val Vista (480) 555-0142 · Gilbert – Heritage (480) 555-0156.
- **ZIP codes (demo):** Dobson 85202 · Red Mountain 85207 · Downtown 85201 · Val Vista 85233 · Heritage 85234.
- **Tour:** 30 min, free, no card. Slots Mon–Sat 9:00 a.m.–7:00 p.m., Sun 10:00 a.m.–4:00 p.m., every 30 min. Up to 6 guests.
- **3-day pass:** free, no card. Three consecutive days from first check-in, one club, classes and pools included; courts and
  recovery suite not included. One per person per 12 months. Photo ID at the desk.
- **Recovery access:** recovery suite/lounge is a Summit benefit. Trailhead and Ridge members can book Stretch & Release
  classes. Mesa – Red Mountain has no recovery suite.
- **Warm-water therapy pool:** 90–92°F, Mesa – Dobson only.
- **Promo:** "Fall climb" $0 enrollment through Nov 30, 2026.
- **Story (placeholder):** first club opened in Mesa in 2014; club five opened in 2024.
- **App:** iOS app and member web app. No Android app at launch.
- Sample "today" in specs: Tuesday, Oct 27, 2026. Instructor, coach and member names in specs are sample people.

Fees: $0 enrollment during "Fall climb" promo (else $49); $49 annual facility fee charged in March. Month to month; cancel or
freeze with 30 days' notice; freeze $10/mo, 1–3 months. Free trial: a **3-day pass** or a **guided tour** (book online).
Personal training: packs of 4/8/12 sessions; coaches have profiles with specialties and clubs.

## 5. Personas (use these in flows and empty-state copy)
1. **Maya, 34, Gilbert** — two kids (6 and 9), works hybrid. Needs kids club times, swim school, 6:00 a.m. classes.
   Checks the app daily at 5:40 a.m.
2. **Daniel, 52, Mesa** — returning to fitness after a knee surgery. Wants low-intensity classes, warm-water pool, recovery,
   no intimidation. Researches on desktop before joining.
3. **Priya, 27, Mesa – Downtown** — lifts 5 days/week, cycles on Saturdays. Wants fast booking, waitlist alerts, lifting
   platform availability, progress streaks.
4. **Ron and Linda, 66 and 63, Mesa – Red Mountain** — pickleball 4 mornings a week, Aqua Fit. Want large text, court
   booking without friction, phone support.
5. **Jordan, 16, Gilbert – Val Vista** — Teen Strength member on a family plan. Mobile only. Needs a check-in pass and a
   simple class list; parent manages billing.

## 6. Cross-product design principles
1. **Real places, real classes.** Clubs and classes are first-class visual objects with photos, colour, icons and live data —
   never a plain text row when a rich card helps a member choose. Every club has a photo, a personality line, amenity chips and
   live busyness. Every class has a category colour + icon, instructor face, intensity ribs and spots left.
2. **Answer the member's real question first.** Marketing: "Is there a club near me, what does it have, what does it cost, can I
   try it?" App: "What am I doing today, can I get in, how busy is it, where is my pass?"
3. **Specific beats vague.** "Spin, 6:00 a.m., Gilbert – Val Vista, 4 bikes left." Show real numbers, times and prices.
4. **Steady, not loud.** Calm surfaces (Sand page, white cards), copper only for action and the active state, Saguaro Night for
   brand weight. No gradients, no neon, no hype type.
5. **The five-rib system.** Capacity, intensity, busyness and progress use the five-rib meter, so one visual language spans the
   brand. Always paired with a text value for accessibility.
6. **Accessible by default.** WCAG 2.2 AA, 44 px/pt targets, Monsoon Sky focus ring, Dynamic Type, colour never the only signal.
7. **One system, three surfaces.** Same names, data, icons and rules; each surface uses its native patterns (web: Graphical
   + shadcn/ui; iOS: SwiftUI system components with brand tint).
