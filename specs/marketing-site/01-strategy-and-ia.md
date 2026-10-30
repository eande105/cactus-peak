# Marketing site 01 — Strategy and information architecture

Site: `cactuspeakathletic.com` (fictional). Stack: Next.js (App Router) + Tailwind, Graphical components (`components/graphical/`), shadcn/ui (style `base-nova`, Lucide icons).
Business facts come from `../00-foundation.md` (called FD). Brand sources: `brand-guidelines.md` (BG), `01-design-brief.md`, `ui-theme/README.md` and `theme.json`.
Shared brand components are defined in `../01-shared-brand-components.md`. This spec uses their exact names and defines only page-specific usage.

This file is the first of five. The others are `02-navigation.md`, `03-pages.md`, `04-components.md` and `05-content-and-accessibility.md`.

## 0. How to read the citations

Every design decision that comes from research carries a short tag.

| Tag | Meaning | Example |
|---|---|---|
| `MM §3 r6` | `research/mobbin-marketing.md`, section 3 (design rules), rule number 6 | "Desktop location page uses a split view" |
| `MM P1`, `MM L2` … | `mobbin-marketing.md` section 2, pattern ID (N = nav, H = hero, L = locations, D = location detail, C = class, S- = schedule, P = pricing, A = amenities, T = coaches, SP = social proof, TC = trial and tour, F = FAQ, FT = footer, M = mobile) | `MM TC2` = tour booking in three steps |
| `MM §4` | Anti-patterns list in `mobbin-marketing.md` | "Required card for a free trial" |
| `mobbin-standard-pass §2 rule N` | `research/mobbin-standard-pass.md`, section 2, rule N (rules 1–21 are the [Marketing] rules; 60–62 are [Shared components]). Always written in full. | "mobbin-standard-pass §2 rule 20" = full-screen mobile menu |
| `MG r28` | `research/mobbin-gaps.md`, design rule number (only the `[Marketing]` rules 28–33 and the `[Web app]` rules 18–27 are used) | "Four-column mega menu" |
| `CL §2` | `research/component-libraries.md`, section number | `CL §4` = gaps neither library fills |
| `FD §4` | `00-foundation.md`, section number | `FD §4` = plans |
| `BG §7` | `brand-guidelines.md`, section number | `BG §7` = photography |
| `TH` | `ui-theme/theme.json` / `README.md` token | `TH radius.m` |

Where this spec departs from a research rule, the text says "Deviation" and gives the reason.

---

## 1. Goals and KPIs

### 1.1 Business goal
Turn a curious East Valley visitor into a first visit. The first visit is a free tour or a free 3-day pass. A member who has stood in the club joins far more often than one who has only read a page.
The site does not try to be the member app. It sends booked members to the web app and the iOS app.

### 1.2 The three conversions

| Rank | Conversion | Definition | Event name (see file 05 §8) |
|---|---|---|---|
| 1 | **Tour booked** | Visitor confirms a guided tour slot at one club. | `tour_booked` |
| 2 | **Trial pass started** | Visitor gets a 3-day pass and the pass is issued. | `trial_pass_issued` |
| 3 | **Join completed** | Visitor pays and creates a membership. | `join_completed` |

Order of importance on the page: tour first, pass second, join third. `MM §3 r22` makes the free tour the main call to action. Join stays one click away in the header for visitors who already decided.

### 1.3 KPI table
Targets are planning assumptions for the launch quarter. Tune them with the first 30 days of data.

| KPI | Definition | Launch target | Source |
|---|---|---|---|
| Tours booked per week (all clubs) | `tour_booked` count | 120 (about 24 per club) | Analytics + booking system |
| Visit-to-lead rate | Sessions with `tour_booked`, `trial_pass_issued` or `join_completed` ÷ sessions | 4.5% | Analytics |
| Tour completion (show rate) | Tours attended ÷ tours booked | 70% | Club check-in |
| Tour-to-member rate | Members joined within 14 days ÷ tours attended | 40% | Membership system |
| Trial-pass-to-member rate | Members joined within 14 days of pass end ÷ passes used | 25% | Membership system |
| Direct joins per week | `join_completed` with no prior tour or pass | 40 | Analytics |
| Join flow completion | `join_completed` ÷ `join_started` | 55% | Analytics |
| Tour flow completion | `tour_booked` ÷ `tour_started` | 70% | Analytics |
| Club-finder success | Sessions on `/clubs` that open a club page or book a tour | 65% | Analytics |
| Schedule-to-handoff | `schedule_book_click` that reach the app login or join | 85% | Analytics |
| Largest Contentful Paint (p75, mobile) | See file 05 §6 | ≤ 2.5 s | RUM |
| Cumulative Layout Shift (p75) | See file 05 §6 | ≤ 0.1 | RUM |
| Accessibility defects at launch | WCAG 2.2 AA failures from the audit | 0 blockers | Audit |

### 1.4 Guardrail metrics
- Phone-call clicks per club (`club_call_click`). A rise can mean the page is missing an answer.
- Form error rate per field. A field above 8% needs a copy or validation fix.
- "No result" rate in site search. See file 02 §9.
- Bounce rate on `/clubs/[slug]` from paid search. A club page must answer "what does it have" in one screen.

---

## 2. Audiences and personas

The five personas come from `FD §5`. Each persona lands on a different first page and needs a different proof.

| Persona | What they want to know first | Best first page | Primary conversion | Proof they need |
|---|---|---|---|---|
| **Maya**, 34, Gilbert, two kids (6 and 9) | Kids club hours, swim school, 6:00 a.m. classes, one club that does it all | `/clubs/gilbert-val-vista`, `/kids` | Tour (with the kids) | Kids club hours and check-in rules, swim school levels, family price |
| **Daniel**, 52, Mesa, knee surgery | Low-intensity classes, warm-water pool, recovery, no judgment | `/recovery`, `/aquatics`, `/classes/category/mind-body` | Tour (asks for a coach) | A named coach, intensity 1–2 classes, a visit he can take before paying |
| **Priya**, 27, Mesa – Downtown | Lifting platforms, class booking speed, waitlist, price | `/clubs/mesa-downtown`, `/clubs/gilbert-heritage`, `/membership` | Join (fast) | Platform count, class capacity, "no contract" line |
| **Ron and Linda**, 66 and 63, Mesa – Red Mountain | Pickleball court booking, Aqua Fit, large text, a phone number | `/courts`, `/clubs/mesa-red-mountain`, `/contact` | Tour or phone call | Court counts, booking rules, a person to call |
| **Jordan**, 16, Gilbert – Val Vista | What teens do here, rules, cost | `/kids` (teen section), `/classes/teen-strength` | Parent joins (Jordan shares the link) | Teen rules, supervision, family add-on price |

Note on Jordan. A teen cannot buy a membership. The site speaks to the parent but gives Jordan a share link ("Send this to a parent") on `/classes/teen-strength` and `/kids`.

### 2.1 Journeys by persona

Each journey lists the real page order. The CTA at each step is the one shown in the page spec.

**Maya (Gilbert, two kids)**
| Step | Page | Question | What answers it | Next action |
|---|---|---|---|---|
| 1 | Search "gym with kids club Gilbert" → `/clubs/gilbert-val-vista` | Is there a club near me with a kids club? | `ClubHero` with kids club AmenityChip, hours, "Open until 10 p.m." | Scroll to Kids club block |
| 2 | `/kids` | When can the kids stay? How safe is it? | Kids club hours (Mon–Sat 8:00 a.m.–12:00 p.m., 4:00–8:00 p.m.), 2-hour blocks, parent check-in | "Book a free tour" |
| 3 | `/aquatics` or `/classes/swim-school` | Is there swim school? | Level ladder (`MM C3`) | Back to club |
| 4 | `/membership` | What does a family cost? | Family add-on calculator: Ridge $79 + 1 adult $39 + 2 children $38 = $156/mo | "Join" or "Book a free tour" |
| 5 | `/tour?club=gilbert-val-vista` | Can we visit on Saturday? | Tour picker with Saturday times | `tour_booked` |

**Daniel (Mesa, returning after surgery)**
| Step | Page | Question | What answers it | Next action |
|---|---|---|---|---|
| 1 | Search "warm water therapy pool Mesa" → `/aquatics` | Where is the warm-water pool? | Dobson club card, therapy pool facts | Open `/clubs/mesa-dobson` |
| 2 | `/clubs/mesa-dobson` | Will it feel welcoming? | Photos of older members, "Quiet" busyness hours chart | Open `/recovery` |
| 3 | `/classes/category/mind-body` and `/classes/mobility-30` | Which classes are gentle? | Intensity ribs 1–2, "good for first-timers" flag | Open `/coaches` |
| 4 | `/personal-training`, `/coaches/[slug]` | Who will coach me through knee limits? | Coach specialty "Return to training", credentials | "Book a free tour" with coach request |
| 5 | `/tour?club=mesa-dobson&coach=…` | Can I talk to someone first? | Tour form with optional note "I'm coming back after knee surgery" | `tour_booked` |

**Priya (Downtown, lifts five days a week)**
| Step | Page | Question | What answers it | Next action |
|---|---|---|---|---|
| 1 | `/clubs/mesa-downtown` | Does it have racks and is it busy at 6 p.m.? | Strength floor facts, `PopularTimesChart` | `/membership` |
| 2 | `/membership` | Which plan, and can I use Heritage too? | Ridge = all 5 clubs, comparison table | "Join" |
| 3 | `/join/*` | Fast checkout | Six steps, saved progress | `join_completed` |
Alternative for Priya: free 3-day pass (`/trial`) before she pays.

**Ron and Linda (Red Mountain, pickleball)**
| Step | Page | Question | What answers it | Next action |
|---|---|---|---|---|
| 1 | `/courts` | How many courts, how do we book? | 6 courts at Red Mountain, "book 3 days ahead", 60- or 90-min slots | Open `/clubs/mesa-red-mountain` |
| 2 | `/clubs/mesa-red-mountain` | Is there a person to call? | Phone number in sticky card, "Call the club" button | Call or tour |
| 3 | `/membership` (large text mode via browser zoom) | What does a couple pay? | Ridge $79 + adult add-on $39 = $118/mo | "Book a free tour" |
Rule: every page that Ron and Linda use shows a phone number as a link without a form (`MM §3 r11`).

**Jordan (16, Val Vista) and a parent**
| Step | Page | Question | What answers it | Next action |
|---|---|---|---|---|
| 1 | Friend's link → `/classes/teen-strength` | What is Teen Strength? | Ages 13–17 note, coach, intensity, "good for first-timers" | "Send this to a parent" (native share) |
| 2 | Parent opens `/kids` | Is it safe? What does it cost? | Teen supervision rules, child add-on $19/mo | `/membership` |
| 3 | `/join/family` | Add Jordan | Child details, age 6 months–17 | `join_completed` |

---

## 3. Sitemap

Rendering: `SSG` = static at build with on-demand revalidation. `ISR` = incremental, revalidate on CMS publish. `SSR` = server-rendered per request. `CSR` = client app shell. Live data (schedule, busyness, spots left) always loads on the client from the platform API (see §5.3).

### 3.1 Primary pages

| URL | Template (file 03 §) | Render | CMS type | Primary CTA | Index | In nav |
|---|---|---|---|---|---|---|
| `/` | Home (§1) | ISR | `Page` + `Club` + `Promo` | Book a free tour | yes | logo |
| `/clubs` | Clubs index (§2) | ISR | `Club` | Tour this club | yes | Clubs |
| `/clubs/mesa-dobson` | Club detail (§3) | ISR | `Club` | Tour this club | yes | Clubs mega |
| `/clubs/mesa-red-mountain` | Club detail | ISR | `Club` | Tour this club | yes | Clubs mega |
| `/clubs/mesa-downtown` | Club detail | ISR | `Club` | Tour this club | yes | Clubs mega |
| `/clubs/gilbert-val-vista` | Club detail (worked example) | ISR | `Club` | Tour this club | yes | Clubs mega |
| `/clubs/gilbert-heritage` | Club detail | ISR | `Club` | Tour this club | yes | Clubs mega |
| `/classes` | Classes index (§4) | ISR | `ClassCategory`, `ClassType` | Book a free tour | yes | Classes |
| `/classes/category/strength` | Category landing (§4.1) | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/cycle` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/conditioning` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/mind-body` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/aqua` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/court` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/recovery` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/category/youth` | Category landing | ISR | `ClassCategory` | See the schedule | yes | Classes mega |
| `/classes/[slug]` | Class type detail (§5) | ISR | `ClassType` | Book a free tour (see §3.2 for slugs) | yes | via category |
| `/schedule` | Public schedule (§6) | SSR shell + CSR data | live API | Book (login or handoff) | yes (shell only) | Classes mega, utility |
| `/membership` | Membership and pricing (§7) | ISR | `Plan`, `FAQ` | Join | yes | Membership |
| `/join` | Join flow entry (§8) | SSR | `Plan` | Continue | no | Join button |
| `/join/plan` | Join step 1 | CSR (checkout) | `Plan` | Continue | no | — |
| `/join/club` | Join step 2 | CSR | `Club` | Continue | no | — |
| `/join/details` | Join step 3 | CSR | — | Continue | no | — |
| `/join/family` | Join step 4 | CSR | `Plan` | Continue | no | — |
| `/join/payment` | Join step 5 | CSR | — | Join and pay | no | — |
| `/join/confirmed` | Join step 6 | SSR | — | Open the app | no | — |
| `/trial` | Free trial pass flow (§9) | SSR + CSR | `Club` | Get my free pass | yes | Utility, Home |
| `/trial/confirmed` | Pass confirmation | SSR | — | Add to Wallet | no | — |
| `/tour` | Book a tour flow (§10) | SSR + CSR | `Club` | Book my tour | yes | Header CTA |
| `/tour/confirmed` | Tour confirmation | SSR | — | Add to calendar | no | — |
| `/kids` | Kids and family (§11) | ISR | `ProgramPage` | Book a free tour | yes | Kids and family |
| `/aquatics` | Aquatics (§12) | ISR | `ProgramPage` | Book a free tour | yes | Clubs mega (Facilities) |
| `/courts` | Courts (§13) | ISR | `ProgramPage` | Book a free tour | yes | Clubs mega (Facilities) |
| `/recovery` | Recovery (§14) | ISR | `ProgramPage` | Book a free tour | yes | Clubs mega (Facilities) |
| `/personal-training` | Personal training (§15) | ISR | `ProgramPage`, `Coach`, `Plan` | Book a free tour | yes | Personal training |
| `/coaches` | Coaches index (§15.2) | ISR | `Coach` | Meet a coach | yes | Personal training |
| `/coaches/[slug]` | Coach profile (§15.3) | ISR | `Coach` | Book an intro with [first name] | yes | via index |
| `/about` | About / Our story (§16) | ISR | `Page` | Book a free tour | yes | utility, footer |
| `/careers` | Careers (§21) | ISR | `Job` | See open roles | yes | footer |
| `/careers/[slug]` | Job detail (§21.2) | ISR | `Job` | Apply | yes | footer |
| `/faq` | FAQ (§17) | ISR | `FAQ` | Book a free tour | yes | footer, utility |
| `/contact` | Contact (§18) | ISR | `Club`, `Page` | Send message | yes | footer, utility |
| `/journal` | Journal index (§19.1) | ISR | `JournalPost` | Read | yes | footer |
| `/journal/[slug]` | Journal article (§19.2) | ISR | `JournalPost` | Book a free tour | yes | footer |
| `/offers/fall-climb` | Promo landing (§20) | ISR | `Promo` | Join with $0 enrollment | yes | PromoBand |
| `/app` | Get the app (§22) | SSG | `Page` | Download on the App Store | yes | footer |
| `/search` | Search results (§23) | SSR | all | — | no | header search |
| `/404`, `/500` | Error pages (§24) | SSG | — | Find a club | no | — |

### 3.2 Class type slugs (`/classes/[slug]`)
Category colour and icon follow `FD §3`.

| Category | Slugs |
|---|---|
| Strength | `rib-rack-strength`, `barbell-basics`, `kettlebell-flow`, `olympic-lifting-club` |
| Cycle | `climb-cycle`, `rhythm-ride`, `endurance-60` |
| Conditioning | `switchback-hiit`, `canal-run-club`, `bootcamp` |
| Mind & Body | `desert-flow-yoga`, `mat-pilates`, `mobility-30`, `breathwork` |
| Aqua | `lap-swim`, `aqua-fit`, `swim-school`, `masters-swim` |
| Court | `pickleball-open-play`, `pickleball-clinic`, `tennis-drills`, `hoops-run` |
| Recovery | `stretch-and-release`, `sauna-plunge`, `compression` |
| Youth | `kids-club`, `teen-strength`, `junior-pickleball` |

Total: 28 class types. Category slugs: `strength`, `cycle`, `conditioning`, `mind-body`, `aqua`, `court`, `recovery`, `youth`.
Slug collision rule: no class slug may equal `category`. The route `/classes/category/[category]` is reserved before `/classes/[slug]`.

### 3.3 Legal pages

| URL | Content |
|---|---|
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Website terms of use |
| `/legal/membership-agreement` | Month-to-month terms, cancel and freeze rules (`FD §4`), fees |
| `/legal/waiver` | Liability waiver and health acknowledgment |
| `/legal/kids-club-policy` | Check-in, ratios, pick-up, illness rules |
| `/legal/cookies` | Cookie notice and preference centre |
| `/legal/sms-terms` | Text-message terms for tour and class reminders |
| `/legal/accessibility` | Accessibility statement and feedback route |
| `/legal/guest-policy` | Guest pass rules |
All legal pages: `noindex` is off (they are indexable but not promoted). Each shows "Last updated" and a print stylesheet.

### 3.4 Redirects and aliases

| From | To | Type |
|---|---|---|
| `/login`, `/member-login`, `/signin` | `https://app.cactuspeakathletic.com/login` | 302 |
| `/book`, `/reserve` | `/schedule` | 301 |
| `/pricing`, `/plans`, `/join-now` | `/membership` | 301 |
| `/locations`, `/gyms` | `/clubs` | 301 |
| `/free-trial`, `/pass` | `/trial` | 301 |
| `/tours`, `/visit` | `/tour` | 301 |
| `/kids-club`, `/childcare` | `/kids` | 301 |
| `/pool`, `/swim`, `/swimming` | `/aquatics` | 301 |
| `/pickleball`, `/tennis` | `/courts` | 301 |
| `/training`, `/trainers` | `/personal-training` | 301 |
| `/blog`, `/blog/[slug]` | `/journal`, `/journal/[slug]` | 301 |
| `/clubs/[slug]/tour` | `/tour?club=[slug]` | 301 |
| Old club names (for example `/clubs/dobson`) | `/clubs/mesa-dobson` | 301 |

### 3.5 Subdomains and handoff targets

| Host | Purpose |
|---|---|
| `www.cactuspeakathletic.com` | This marketing site (apex redirects to `www`) |
| `app.cactuspeakathletic.com` | Member web app: sign in, book, pass, billing |
| `help.cactuspeakathletic.com` | Out of scope. FAQ lives on `/faq`. |

---

## 4. URL and naming rules
1. Club slugs are `city-neighbourhood` in lowercase with hyphens: `mesa-dobson`. Display name uses an en dash with spaces: "Mesa – Dobson" (`BG §8`).
2. Class slugs are the class name in lowercase with hyphens. Ampersands become `and`.
3. Filters live in query strings and use fixed keys: `club`, `category`, `date`, `time`, `intensity`, `firstTimer`, `coach`, `amenity`, `zip`.
4. Query-string pages set `<link rel="canonical">` to the clean URL. The exception is `/schedule?club=…`, which is canonical to itself (club-specific schedules rank for local searches).
5. Trailing slash: none. Case: lowercase only. Language: `en-US` only at launch.

---

## 5. SEO and content model

### 5.1 SEO principles
1. **Local first.** Every club page must rank for "[service] in [neighbourhood/city]". The name, address and phone (NAP) match the Google Business Profile exactly.
2. **One intent per URL.** A page answers one question (see "primary question" in file 03).
3. **Server-rendered facts, client-rendered live data.** Hours, address, amenities, class descriptions, prices and FAQ are in the HTML. Busyness and spots left load after paint.
4. **Structured data on every template.** See §5.5.
5. **No thin pages.** A class type page with less than 150 words of unique copy is not published.

### 5.2 Metadata templates

| Template | `<title>` (≤ 60 chars) | Meta description (≤ 155 chars) |
|---|---|---|
| Home | `Cactus Peak Athletic — Five clubs in Mesa and Gilbert` | `Pools, courts, classes and recovery at five East Valley clubs. Climb at your own pace. Book a free tour or a 3-day pass.` |
| Clubs index | `Gym locations in Mesa and Gilbert, AZ — Cactus Peak` | `Find the club near you. 5 clubs, hours, pools, courts and kids club. Open 4:30 a.m. weekdays.` |
| Club detail | `{Club} — Gym, pool and classes in {City}, AZ` | `{personality line} {sq ft} sq ft. {top 3 amenities}. Open {today's hours}. Book a free tour.` |
| Category | `{Category} classes in Mesa and Gilbert — Cactus Peak` | `{N} {category} classes, from intensity 1 to 5. See times at all 5 clubs.` |
| Class type | `{Class} — {Category} class at Cactus Peak` | `{one-sentence description}. {duration} min, intensity {n} of 5. Try it free with a 3-day pass.` |
| Schedule | `Class schedule — Cactus Peak Athletic` | `See this week's classes at all 5 clubs. Filter by club, category and intensity.` |
| Membership | `Membership plans and prices — Cactus Peak` | `Trailhead $54, Ridge $79, Summit $129 per month. Month to month. Family add-ons from $19.` |
| Coach | `{Name}, {specialty} coach — Cactus Peak` | `{Name} coaches {specialty} at {clubs}. {credential}. Book an intro session.` |
| Journal | `{Title} — Cactus Peak Journal` | First 150 characters of the dek |
| Program | `{Program} at Cactus Peak — {key fact}` | One sentence with a number |

Open Graph image: one per template, generated at build (1200×630) with the `ClassPhotoTile` or club photo, the logo (reversed on a calm dark area, `BG §4`), and the title in Archivo 800. No gradients (`BG §9`).

### 5.3 Data ownership (CMS versus platform API)

| Data | Owner | Delivery | Cache |
|---|---|---|---|
| Club copy, photos, amenities, hours, holiday hours, phone, parking | CMS (`Club`) | Build + ISR | revalidate on publish |
| Class type copy, photos, intensity range, first-timer flag | CMS (`ClassType`) | Build + ISR | revalidate on publish |
| Plans, prices, promo | CMS (`Plan`, `Promo`) mirrored from the billing system | Build + ISR; the join flow re-fetches from billing | 60 s |
| Coaches | CMS (`Coach`) | Build + ISR | on publish |
| Live schedule (sessions, instructor, spots left, waitlist) | Platform API `GET /v1/sessions` | Client fetch, SWR | 30 s |
| Live busyness (5 levels) | Platform API `GET /v1/clubs/{id}/busyness` | Client fetch | 5 min (matches `FD §2`) |
| Typical-hours data (popular times) | Platform API `GET /v1/clubs/{id}/typical-hours` | Server fetch, ISR | 24 h |
| Tour and pass slots | Platform API `GET /v1/tours/slots` | Client fetch | none |
| Session (is the visitor a member?) | `app` domain cookie via `GET /v1/session` | Client fetch | none |

### 5.4 CMS content types
Use a headless CMS with typed models. Every type has `slug`, `seo.title`, `seo.description`, `seo.ogImage`, `updatedAt`, `status` (draft, review, published).

**`Club`**
| Field | Type | Notes |
|---|---|---|
| `name` | text | "Mesa – Dobson" (exact, `FD §2`) |
| `slug` | slug | `mesa-dobson` |
| `city` | enum | Mesa, Gilbert |
| `type` | enum | Flagship, Full club, Studio club |
| `sqFt` | number | 68000 |
| `address` | structured | street, city, state, ZIP, lat, lng |
| `crossStreets` | text | "Dobson Rd & Southern Ave" |
| `phone` | text | (480) 555-01xx (proposed, §9) |
| `personalityLine` | text | Exact line from `FD §2` |
| `intro` | rich text | 60–90 words |
| `heroPhoto`, `cardPhoto` (4:3), `gallery[]` | media | Real photos only (`MM §3 r45`) |
| `amenities[]` | refs to `Amenity` | With counts, for example "4 pickleball courts" |
| `studios` | structured | count of studios, cycle studio yes/no |
| `hasPool`, `hasCourts`, `hasKidsClub`, `hasRecovery` | boolean | Drive filters |
| `hours` | structured | Mon–Fri, Sat–Sun, staffed hours, kids club hours, pool-close offset (30 min) |
| `holidayHours[]` | date + text | Shown under `HoursTable` (`MM §3 r13`) |
| `parkingNote`, `transitNote`, `accessNote` | text | Required for each club (`MM §3 r46`) |
| `featuredCoaches[]` | refs to `Coach` | |
| `testimonials[]` | refs to `Testimonial` | |
| `tourSlotConfig` | structured | Days, start/end, length (30 min) |
| `gbpUrl`, `appleMapsUrl` | url | Directions links |
| `status` | enum | open, coming-soon |

**`ClassType`**: `name`, `slug`, `category` (ref), `icon` (Lucide name or custom), `shortDescription` (≤ 120 chars), `description` (rich text), `intensityMin`, `intensityMax` (1–5), `durationOptions[]`, `goodForFirstTimers` (bool), `whatToBring[]`, `whatToExpect[]` (3–5 steps), `levels[]` (for Swim School and similar), `heroPhoto`, `gallery[]`, `coaches[]` (refs), `clubs[]` (refs: where it runs), `faq[]` (refs), `relatedClasses[]`.

**`ClassCategory`**: `name`, `slug`, `colourToken` (maps to `FD §3` pair), `icon`, `intro`, `heroPhoto`, `order`.

**`Coach`**: `name`, `slug`, `photo` (4:5 portrait, `MM §3 r26`), `headshot` (1:1 crop for strips, mobbin-standard-pass §2 rule 16), `credentialLine` (one line, for example "CSCS, NASM-CPT"), `favoriteClass` (ref), `bio` (≤ 25 words for the card, plus `longBio`), `specialties[]` (tags), `clubs[]` (refs, required, `MM §3 r27`), `teaches[]` (class refs), `ptPacks` (bool), `quote` (≤ 30 words), `introBookingId` (platform ID).

**`Plan`**: `name`, `slug`, `priceMonthly` (cents), `badge` (for example "Most popular"), `bestFor` (one line, `MM §3 r21`), `features[]` (≤ 6, `MM §3 r20`), `comparison[]` (row key → value), `clubAccess` (home-only or all-5), `bookingWindowDays` (7 or 9), `guestPassesPerMonth`, `familyAddOnAdult`, `familyAddOnChild`, `billingPlanId`.

**`ProgramPage`** (Kids, Aquatics, Courts, Recovery, Personal training): `slug`, `heroPhoto`, `headline`, `sections[]` (blocks), `facts[]` (key numbers), `clubs[]` with per-club details (court count, pool size), `faq[]`.

**`Amenity`**: `name`, `icon`, `category`, `description`. Used for `AmenityChip` and `AmenityBento`.

**`Testimonial`**: `firstName`, `lastInitial`, `goal` (one line, `MM §3 r28`), `quote` (≤ 30 words, `MM §3 r29`), `photo`, `club` (ref), `consent` (bool, required), `videoUrl` (optional).

**`FAQ`**: `question` (member's words, `MM F4`), `answer` (rich text), `group` (enum: Getting started, Memberships, Kids and teens, Clubs and classes, Billing), `order`, `pages[]` (which pages show it).

**`Promo`**: `title`, `body`, `ctaLabel`, `ctaUrl`, `startsAt`, `endsAt`, `placement[]` (top bar, PromoBand, join flow), `dismissible`.

**`JournalPost`**: `title`, `slug`, `dek`, `author` (ref `Coach` or staff), `category` (Train, Eat and recover, Families, Club news, Local), `heroImage`, `body` (rich text with embedded `ClassCard`/`CoachCard` blocks), `readingMinutes`, `relatedPosts[]`, `publishedAt`.

**`Job`**: `title`, `slug`, `department`, `club` (ref or "All clubs"), `type` (full-time, part-time, seasonal), `payRange`, `description`, `requirements[]`, `applyUrl`. Applicant tracking system link only; no applications stored on this site.

**`Page`**: generic page with `blocks[]` (Home, About, Contact, Legal). Legal pages add `lastUpdated` and `version`.

### 5.5 Structured data (JSON-LD)

| Template | Types |
|---|---|
| All | `Organization` (logo, sameAs), `WebSite` (with `SearchAction`), `BreadcrumbList` |
| Club | `HealthClub` (also `ExerciseGym`) with `address`, `geo`, `telephone`, `openingHoursSpecification`, `amenityFeature[]`, `image`, `priceRange` ("$54–$129"), `parentOrganization` |
| Class type | `Course`-like `Event` is not used (classes repeat). Use `WebPage` + `ItemList` of the next 5 sessions only when the live API returns them server-side. Otherwise `WebPage` only. |
| Membership | `Product` per plan with `Offer` (`price`, `priceCurrency`, `priceValidUntil` for promo) |
| Coach | `Person` (`jobTitle`, `worksFor` club, `image`) |
| FAQ | `FAQPage` (only on `/faq` and program pages that show FAQ) |
| Journal | `Article` (`author`, `datePublished`, `image`) |
| Job | `JobPosting` (`datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`) |
| Tour | no schema; `noindex` on confirmed |

### 5.6 Crawl control
- `robots.txt`: allow all; disallow `/join/`, `/trial/confirmed`, `/tour/confirmed`, `/search`, `/api/`.
- `sitemap.xml`: split into `sitemap-clubs.xml`, `sitemap-classes.xml`, `sitemap-coaches.xml`, `sitemap-journal.xml`, `sitemap-pages.xml`.
- Pagination: Journal index uses numbered pages with `rel="next"/"prev"` hints and self-canonical.
- Images: `alt` is required in the CMS and has a character limit of 125. Decorative images use empty `alt`.

---

## 6. Conversion funnel

### 6.1 Stages

```
 AWARE            CONSIDER                 TRY                      DECIDE              JOIN               ACTIVATE
 -----            --------                 ---                      ------              ----               --------
 Search (local)   Club page                Tour booked              Plan page           Join flow          App download
 Social / maps    Class + schedule         3-day pass issued        Price check         6 steps            First class booked
 Word of mouth    Programs (kids, pool)    Tour attended            FAQ                 Paid               First visit
 Fall climb ad    Coaches                  Pass used (check-in)     Call the club       Confirmed
        \             |                         |                        |                  |
         `------> /clubs  /classes  /kids ---> /tour  /trial  ------> /membership ------> /join/* ---> app
```

### 6.2 CTA hierarchy (applies to every page)

| Level | Label | Style (Graphical `Button`) | Where |
|---|---|---|---|
| Primary | **Book a free tour** | `variant="primary"` (copper) | Header (always), hero of Home, Club, Class, Program pages, sticky bottom bar on mobile (`MM §3 r22`) |
| Secondary | **Join** | `variant="outline"` | Header (always), Membership, Plan cards (as "Join Ridge") |
| Tertiary | **Try a free 3-day pass** | `variant="ghost"` with arrow icon, or text link | Under hero buttons, in tour form ("Prefer to try on your own?"), in empty states |
| Support | **Call the club** | `variant="outline"` | Club page sticky card (`MM §3 r11`) |

Rule: one filled copper button per section (`MM §3 r3`, `MM N1`). The header counts as one section.
Deviation from `MM §3 r36`, which allows one filled button in the header: the header also shows a "Join" outline button. Reason: the brief asks for a persistent "Book a free tour" and "Join" pair. "Join" is outline, so only one filled button remains.

### 6.3 Trial terms (no card)
Tour and pass flows never ask for a card (`MM §4`, "Required card for a free trial"). The 3-day pass needs name, email or mobile, and a home club. The pass activates on the first check-in. See file 03 §9.

### 6.4 Rescue and nurture (with consent)
| Trigger | Message | Channel | Timing |
|---|---|---|---|
| `tour_booked` | Confirmation + add to calendar + what to bring | Email + SMS | Immediate |
| Tour reminder | "Your tour is tomorrow at 9:30 a.m. at Gilbert – Val Vista." | SMS | 24 h and 2 h before |
| Tour no-show | "We missed you. Pick a new time." | Email | 2 h after |
| `trial_pass_issued` | Pass + class picks for the club | Email | Immediate |
| Pass day 2 | "One more day. Here is a class at 6:00 a.m." | Email | Day 2 |
| Pass ended | "How did it go? Join, or book a tour." | Email | 2 h after pass end |
| Join abandoned at `/join/payment` | "Your plan is saved." Link resumes at the same step | Email (only if email was given) | 1 h and 24 h |
All messages need opt-in recorded at the form. Each message has a one-click unsubscribe. Quiet hours: no SMS between 8:00 p.m. and 8:00 a.m.

### 6.5 Handoffs to the member web app

| From | To | Data passed | Return |
|---|---|---|---|
| Header "Member login" | `app…/login` | none | — |
| `/schedule` "Book" (signed out) | `app…/login?next=/book/{sessionId}` via a `Dialog` on the marketing site | session ID, club | App shows the class detail after sign-in |
| `/schedule` "Book" (signed in) | `app…/book/{sessionId}` | session ID | App |
| `/schedule` "Join the waitlist" | `app…/waitlist/{sessionId}` | session ID | App |
| `/join/confirmed` "Open the app" | `app…/welcome` | membership ID (server-side) | App |
| `/trial/confirmed` "Add to Wallet" | Wallet pass file | pass ID | — |
| `/courts` "Book a court" | `app…/courts?club={slug}` | club | App |
| `/personal-training` "Book an intro" | `app…/pt/intro?coach={slug}` | coach | App |

Signed-in detection: `GET /v1/session` with credentials on `app` domain cookie (`Domain=.cactuspeakathletic.com`, `SameSite=Lax`, `Secure`, `HttpOnly`). The site never reads the cookie value. It reads only `{ signedIn, firstName, homeClubSlug }`.

---

## 7. Personalisation: "my club"
One cookie `cpa_club` (first-party, functional, 12 months) holds the club slug. Sources, in priority order:
1. Signed-in member's home club (from the session).
2. A club the visitor picked in `ClubSwitcher`.
3. Nearest club from a ZIP the visitor typed.
4. Nearest club from browser location after the visitor tapped "Use my location".
5. None. The site shows all five clubs in neutral order (Mesa – Dobson first, the flagship).

The site never asks for location on page load (privacy rules; the prompt appears only after a tap).
Where "my club" shows: header `ClubSwitcher`, Home "Your club" strip, default filter on `/schedule`, prefilled club on `/tour`, `/trial`, `/join/club`, footer club hours (highlighted), `/membership` Trailhead note ("Trailhead gives you Gilbert – Val Vista"). Full behaviour in file 02 §4.

---

## 8. Content principles for IA
1. A club or class is always shown as a rich object (photo, category colour and icon, instructor face, intensity ribs, busyness). A plain text row is allowed only in dense lists with an icon and a name (FD §6 principle 1).
2. Every page opens with the answer. The first heading names the thing, the first sentence gives one number.
3. Each page type has one primary question. File 03 states it.
4. A visitor can reach any club page, the schedule, the price and a tour form in two clicks from any page.
5. The footer lists the five clubs and their hours on every page (`MM §3 r34`, `MM §4`: no long city wall).

---

## 9. Facts now live in the foundation
The facts this spec first proposed were promoted into `../00-foundation.md` §4 ("Rules settled"). This spec now follows the foundation. Where a number or rule appears in a page, the foundation is the source. Key values the pages use:

| Fact | Foundation value |
|---|---|
| Phones | Member services (480) 555-0100. Clubs: Mesa – Dobson (480) 555-0114 · Mesa – Red Mountain (480) 555-0127 · Mesa – Downtown (480) 555-0139 · Gilbert – Val Vista (480) 555-0142 · Gilbert – Heritage (480) 555-0156 |
| Demo ZIP codes | Dobson 85202 · Red Mountain 85207 · Downtown 85201 · Val Vista 85233 · Heritage 85234 |
| Tour | 30 min, free, no card. Mon–Sat 9:00 a.m.–7:00 p.m., Sun 10:00 a.m.–4:00 p.m., every 30 min. Up to 6 guests. |
| 3-day pass | Free, no card. Three consecutive days from first check-in, one club, classes and pools. No courts or recovery suite. One per person per 12 months. Photo ID at the desk. |
| Guest pass | Guest 18+, or 16–17 with a guardian waiver. Valid 14 days from send. One visit, one club. Included passes reset on the billing date. An extra pass is the $20 day pass. |
| Kids club | Ages 6 months–12 years. Blocks Mon–Sat 8:00–10:00 a.m., 10:00 a.m.–12:00 p.m., 4:00–6:00 p.m., 6:00–8:00 p.m. Max 2 blocks per child per day. Parent checks in at the same club. Unclaimed blocks release 15 min after start. |
| Family add-on | +$39 per adult, +$19 per child (6 months–17). Kids club included for children 12 and under. Teens 13–17 follow the teen rules. |
| Teens 13–17 | Book classes flagged "Teen OK". Parent toggles allow courts and lap lanes (lanes from 14). Strength floor without a coach is 16+. Sauna and cold plunge are 18+. |
| Personal training | Single session $75. Packs: 4 = $276, 8 = $520, 12 = $732 ($61 each). Sessions 45 min (Summit intro 30 min). Free cancel or reschedule up to 24 h before. Packs last 12 months. |
| Lap lanes | Mesa – Dobson 8 lanes, Mesa – Red Mountain 8 lanes (25 m outdoor), Gilbert – Val Vista 6 lanes. Up to 2 swimmers share a lane. No waitlist for lanes. |
| Booking windows | Open at 6:00 a.m. Arizona time on the opening day. Courts: one reservation per member per day, at most 2 active. A no-show counts as a late cancel. |
| Ratings | No public star ratings at launch. |
| Recovery access | Suite or lounge is a Summit benefit. Red Mountain has no suite. |
| Warm-water pool | 90–92°F, Mesa – Dobson only. |
| Promo | "Fall climb" $0 enrollment through Nov 30, 2026. |
| App | iOS app and member web app. No Android app. |

Still proposed by this spec (not in the foundation): a strength and cardio floor at every club; parking, access and stroller notes per club; coach names, bios and quotes; member quotes; the swim school level names (Splash, Float, Kick, Stroke, Lap-ready); club-level opening years other than 2014 and 2024; tour "ask for a coach at the front desk" line; sample FAQ answers marked "(proposed)" in `03-pages.md`. All names are sample people (foundation note).

## 10. Open issues for the design lead
1. **Strength colour equals action colour (open issue for the user).** `FD §3` gives Strength Arizona Copper `#B5532C`. The coordinator decision is: Strength stays Arizona Copper for now, with the shared-spec mitigations. The theme says copper means "you can act here". Mitigation: the shared components rules (`../01-shared-brand-components.md` §2.4): Strength uses copper only as a 4 px stripe, a 16 px icon and a 10% tint; a solid Strength badge appears only on photos; `CategoryBadge` is never a button; icon and name always show. The shared file also changed Mind & Body to `#52684A` and Court to `#7F6019` after a contrast check. Recommendation: ask the user to decide whether to move Strength to a non-copper colour before launch.
2. **No yearly price.** `FD §4` is month to month only. `MM §3 r19` (monthly/yearly toggle) does not apply. The Membership page shows no toggle.
3. **Reviews tab.** `MM §3 r10` lists "Reviews". The foundation says no public star ratings at launch. The tab shows consented member quotes only. No rating line renders anywhere on the site (`mobbin-standard-pass §2 rule 41` and rule 8 rating lines are not used).
4. **Android.** No Google Play badge (`MM §3 r35`).
5. **Mobile evidence is thin** (`MM` "Method and limits"). Test the mobile nav and sticky bar with real users before launch.
