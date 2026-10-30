# Marketing site 05 — Content, accessibility, performance and analytics

Tags (`MM §3 r6`, `MG r28`, `BG §8`, `FD §4`, `TH`) are explained in `01-strategy-and-ia.md` §0.
Sections: §1 Voice rules · §2 Microcopy · §3 State copy (loading, empty, error) · §4 WCAG 2.2 AA checklist · §5 Contrast checks and safety copy · §6 Performance budgets · §7 Privacy, consent and security · §8 Analytics events.

---

## 1. Voice rules applied

Voice source: `BG §8`. "A steady coach who knows your name. Warm, plain-spoken, encouraging, a little dry-humoured about the heat. Never shouting, never shaming."

| # | Rule | Do | Do not |
|---|---|---|---|
| 1 | Use "you" and "we". Short sentences. One idea per sentence. | "Pick a club. We will show you around." | "Prospective members may avail of facility tours." |
| 2 | Buttons start with a verb. | "Book a free tour", "Join Ridge", "Get my free pass" | "Submit", "Click here", "Learn more" |
| 3 | Be specific. Give a number, a time, a place. | "Spin, 6:00 a.m., Gilbert – Val Vista, 4 bikes left." | "Great classes daily." |
| 4 | Be steady, not loud. | "Show up. We'll take it from there." | "CRUSH IT!!!" |
| 5 | Be welcoming. | "First visit? Ask for a free tour." | "Not for the weak." |
| 6 | Be local. A little dry about the heat. | "Pool's 82° and the shade sails are up." | "World-class facilities." |
| 7 | Errors say what happened and what to do. | "That class is full. Join the waitlist or pick the 7:00 a.m. class." | "Error 409." |
| 8 | Numerals for numbers. | "5 clubs", "6:00 a.m.", "$79" | "five clubs", "6 o'clock" |
| 9 | Club names are "City – Neighbourhood" with an en dash and spaces. | "Gilbert – Val Vista" | "Gilbert Val Vista", "Val Vista club" in first mention |
| 10 | Times: lowercase "a.m." / "p.m." with periods. Ranges use an en dash. Dates use US order. | "6:00 a.m.–10:00 p.m.", "Tue, Oct 27" | "6AM", "27/10" |
| 11 | Sentence case in headings and buttons. | "Find your club." | "FIND YOUR CLUB" (except the `eyebrow` style, which is a style, not typed caps) |
| 12 | Prices include the period. | "$79 a month", "$79/mo" in tight spaces | "$79" alone on a plan card |
| 13 | Name effort, not punishment. | "Hard (4 of 5)" | "Brutal", "Destroy", "No excuses" |
| 14 | Neutral about bodies. | "Move your way." | "Burn fat", "Shred", "Beach body" |
| 15 | Do not shame. | "No pressure. Come back when you can." | "You missed your goal." |

**Reading level:** grade 7 or lower for marketing pages and forms (checked with the Hemingway/Flesch tool in review). Legal pages use plain language summaries (`03-pages.md` §25).
**Sentence length:** 20 words or fewer for UI and hero text; 25 or fewer for body text.
**Banned words and phrases:** crush, destroy, beast, shred, burn (calories), no excuses, no pain no gain, transform, world-class, state-of-the-art, best-in-class, unlock, journey (as filler), "elevate", "game-changer", "lifestyle" (as filler), "Oops!" on errors, exclamation marks in UI text.
**Allowed dry humour:** short, about weather or habits, never at the visitor's expense: "That page took a rest day." "Parking is free. Shade is not."
**Pronoun for the club:** "we". Never "Cactus Peak Athletic is pleased to…".
**Inclusive language:** "members", "families", "everyone". Avoid "guys". Describe photos by action, not by body.
**Medical and safety:** no health claims. Phrases such as "may help" are not used. Use "Ask your doctor first" where relevant (§5.3).
**Brand name:** "Cactus Peak" in running text; "Cactus Peak Athletic" in legal text and the footer (`01-design-brief.md` assumption 1).

---

## 2. Microcopy

### 2.1 Calls to action
| Context | Label | Notes |
|---|---|---|
| Header primary (all pages) | **Book a free tour** | Same text everywhere (`MM §3 r22`) |
| Header secondary | **Join** | Outline button |
| Club card / club page | **Tour this club** | Per club (`MM §3 r2`, `r11`) |
| Call | **Call the club** | Shows the number in the button on desktop |
| Trial pass | **Try a free 3-day pass** (ghost link) · **Get my free pass** (submit) · **Get a 3-day pass** (email-row button, with "No credit card required." under it) | `mobbin-standard-pass §2 rule 14` |
| Plan cards | **Join Trailhead / Join Ridge / Join Summit** | |
| Schedule row | **Book** · **Join waitlist** · **Full** · **Booked** | See §2.5 |
| Class detail | **See times** | |
| Coach | **Meet {first name} on a free tour** | |
| Tour flow | **Next** · **Back** · **Book my tour** | |
| Join flow | **Continue** · **Back** · **Join and pay $117 today** | The amount is always in the label |
| Contact | **Send message** | |
| Search | **See all results for "{query}"** | |
| Journal | **Read the article**, **Subscribe** | |
| Careers | **See open roles**, **Apply** | |
| App | **Download on the App Store** (official badge) | |
| Secondary info | **Compare every detail**, **See all clubs and the map**, **Meet all coaches**, **Open the full schedule** | |
Rule: a link's text names the destination. "Read the membership agreement", not "Click here" (WCAG 2.4.4).

### 2.2 Form labels, help and placeholders
| Field | Label | Help text | Placeholder |
|---|---|---|---|
| ZIP code | "ZIP code" | — | none |
| Email | "Email" | — | "name@example.com" |
| Email or mobile | "Email or mobile number" | "We send your pass here." / "We send your tour details here." | none |
| Mobile | "Mobile phone" | "We text only if you say yes." | "(480) 555-0100" shown as example text beside the label, not as a placeholder |
| First name | "First name" | — | none |
| Date of birth | "Date of birth" | "Members must be 18 or older." | "Month", "Day", "Year" (select first options) |
| Message | "Message" | "How can we help?" | none |
| Search | "Search clubs, classes, coaches" | — | none (the label is visible or an accessible name) |
| Promo code | "Promo code" | — | none |
| Child date of birth | "Child's date of birth" | "Ages 6 months to 17." | none |
| Allergy / medical note | "Anything we should know?" | "Share anything the kids club team should know." | none |
Placeholders are never the only label and never carry instructions (WCAG 3.3.2). Labels are visible above fields (Graphical `Field`).

### 2.3 Validation and form errors
Format: what happened + what to do. Errors appear below the field (`role` via Graphical `Field` error part), in `danger` text with an `AlertCircle` icon, and in a summary at the top on submit.

| Case | Message |
|---|---|
| Required, empty | "Enter your first name." / "Enter your email." (each field names itself) |
| Email format | "Enter an email like name@example.com." |
| Phone format | "Enter a 10-digit mobile number." |
| Email or mobile format | "Enter an email like name@example.com or a 10-digit mobile number." |
| ZIP | "Enter a 5-digit ZIP code." |
| ZIP unknown | "We can't find that ZIP code. Check it and try again." |
| Age under 18 (adult) | "Members must be 18 or older. Add younger family members in the next step." |
| Child age out of range | "Children must be 6 months to 17. Anyone 18 or older joins as an adult." |
| Duplicate email | "You already have an account with this email. Sign in to continue." |
| Card incomplete | "Your card number is incomplete." |
| Card declined | "Your bank declined this card. Try another card, or call your bank." |
| Agreement unchecked | "Check the box to agree before you pay." |
| Message too short | "Write at least 10 characters so we can help." |
| Pass already used | "You already used a pass on {date}. Book a tour instead." |
| Rate limit | "Too many tries. Wait a few minutes and try again." |
| Server error | "We could not save that. Try again, or call {club phone}." In the join flow, use member services (480) 555-0100. |
| Network | "You're offline. Check your connection and try again." |
| Summary heading | "Fix 2 things to continue" (counts the errors, each a link to its field) |

### 2.4 Status and live-data copy
| Item | Copy |
|---|---|
| Club open | "Open · until 10 p.m." (success text + dot icon) |
| Club closed | "Closed · opens 4:30 a.m." (warning text + clock icon) |
| Opens later today | "Opens at 6:00 a.m." |
| Busyness labels | "Right now: Steady" (shared copy rule). Levels: Quiet · Light · Steady · Busy · Packed (always with the five-rib meter). The public site never shows a head-count. Tooltip/long form: "Quiet: plenty of room." "Light: easy to find a machine." "Steady: a normal day." "Busy: expect a short wait." "Packed: try another time." |
| Updated stamp | "Updated 4 min ago" |
| Spots left (≤5) | "4 bikes left" (cycle), "3 spots left" (others), "1 spot left" |
| Plenty of room | no number shown on public pages |
| Full | "Full" + "Join the waitlist" |
| Waitlist length | "3 on the waitlist" |
| Intensity | "Easy (1 of 5)", "Light (2 of 5)", "Moderate (3 of 5)", "Hard (4 of 5)", "All-out (5 of 5)" (`FD §3`) |
| First-timer flag | "Good for first-timers" |
| Age chips (capitals) | "AGES 6 MO–12 YR" (Kids Club) · "AGES 3–12" (Swim School) · "AGES 13–17" (Teen Strength) · "AGES 6 MO–17" (Youth tile) |
| Distance | "1.7 mi" (shown only after ZIP/location) |
| Time zone line | "All times are Arizona time." |

### 2.5 Booking state button labels
| State | Label | Style |
|---|---|---|
| Open | Book | `outline` (row) / `primary` (panel) |
| Few left | Book | same (the "4 left" text is separate) |
| Full | Join waitlist | `outline` |
| Waitlist closed (<1 h) | Full · waitlist closed | disabled with reason |
| Started | Started | disabled |
| Signed-in, booked | Booked | check icon, ghost |
| Signed-in, waitlisted | On the waitlist | ghost |
| Handoff dialog title | "Sign in to book." / "Sign in to join the waitlist." | — |

### 2.6 Confirmation and success copy
| Moment | Copy |
|---|---|
| Tour booked | Green check, pill "Confirmed", "You're booked." "Wednesday, Oct 28 at 9:30 a.m. Gilbert – Val Vista." Buttons "Add to calendar", "Done"; link "Share this tour". |
| Tour reminder (SMS, 24 h) | "Cactus Peak: your tour is tomorrow at 9:30 a.m. at Gilbert – Val Vista. Reply C to cancel. STOP to opt out." |
| Tour reminder (SMS, 2 h) | "Cactus Peak: see you at 9:30 a.m. Park in the east lot. Reply STOP to opt out." |
| Pass issued | Green check + "Your pass is ready, {first name}." Button "Done". |
| Pass email subject | "Your Cactus Peak 3-day pass" |
| Join complete | Green check + "You're in, {first name}." Button "Done". |
| Message sent | "Thanks, {first name}. We will reply by {date}." |
| Newsletter | "You're on the list. One note a month." |
| Copy link | "Link copied." |
| Saved progress | "Your plan is saved. We emailed you a link to finish." |
| Sign-in created | "Sign-in created." |

### 2.7 Navigation and utility copy
| Item | Copy |
|---|---|
| Skip links | "Skip to main content", "Skip to club hours", "Skip to footer" |
| Promo bar | "Fall climb: $0 enrollment through Nov 30. Join now →" |
| Club switcher (none) | "Find your club" |
| Club switcher (set) | "Gilbert – Val Vista" |
| Location prompt help | "Your browser will ask first. We use it once and do not store it." |
| Member login | "Member login" |
| Signed-in greeting | "Hi, Maya" |
| Search placeholder substitute (label) | "Search clubs, classes, coaches" |
| Tour band | "Come see the club." "A 30-minute tour. A coach, not a salesperson. No card." |
| Footer tagline | "Climb at your own pace." |
| Footer legal note | "Fictional brand made for a university project." |

### 2.8 Cookie banner and consent
Bottom-left card, 360 px wide on desktop, full width on mobile, never over hero copy. Defaults: analytics off until the visitor accepts (decline non-essential by default).
| Part | Copy |
|---|---|
| Title | "Cookies, kept small." |
| Body | "We use cookies to make the site work. With your OK, we also count visits so we can improve it. We do not use ad cookies." |
| Buttons | "Accept analytics" (outline) · "Only what's needed" (outline) · "Choose" (ghost → preference centre) |
| Buttons parity | The two main choices have equal size and weight. No pre-ticked boxes. |
| After choice | Toast: "Choices saved." Banner does not return for 12 months unless the policy version changes. |

---

## 3. State copy (loading, empty, error)

`EmptyState` pattern: one plain sentence naming the situation, one line with the likely cause or the next step, and one or two actions. Icons are Lucide outline, 40 px, `text-muted`.

### 3.1 Loading
| Place | Treatment | Text (for assistive tech) |
|---|---|---|
| Schedule rows | 6 skeleton rows | "Loading classes" (`aria-busy`, status role) |
| Busyness meter | 5 grey ribs | "Checking how busy it is" |
| Club status | 96×16 skeleton | "Checking hours" |
| Map | Static image + pins | "Loading map" |
| Popular times | Skeleton bars | "Loading typical hours" |
| Buttons | Spinner, label changes: "Booking…", "Saving…", "Paying…", "Sending…" | `aria-live="polite"` |
| Page transitions | None (Next.js route progress bar 2 px `primary` at top under the header) | — |

### 3.2 Empty
| Place | Heading | Next step | Actions |
|---|---|---|---|
| Schedule, filters too tight | "No classes match those filters." | "Try fewer filters or a different day." | "Clear filters" · "See Wednesday" |
| Schedule, none left today | "No more classes today at {club}." | "The club is open until 10 p.m. Tomorrow's first class is at 6:00 a.m." | "See tomorrow" |
| Schedule, holiday | "No classes today." | "The club is open 6:00 a.m.–12:00 p.m." | "See tomorrow" |
| Club filters | "No club has all of that." | "Remove one filter to see more clubs." | One button per removable chip |
| Class detail, none in 7 days | "No sessions in the next 7 days at {club}." | "Another club may have one." | "Pick another club" |
| Tour days | "No tour times at {club} in the next 30 days." | "Pick another club or call {phone}." | "Pick another club" · "Call" |
| Tour times that day | "No times left on Wednesday." | — | "Pick another day" |
| Search | "We found nothing for '{query}'." | "Try 'cycle', 'pool' or 'kids club'." | "See all classes" · "Ask a person" |
| Coaches filter | "No coaches match." | "Remove a filter." | "Clear filters" |
| Careers | "No open roles match." | "Send us your name for the next opening." | Email field + "Notify me" |
| Journal category | "Nothing here yet." | "Read the latest instead." | "See all posts" |
| Testimonials | (section hidden) | — | — |
| Reviews tab | (tab hidden) | — | — |
| 404 | "That page took a rest day." | "We could not find it. Try one of these." | "Find a club" · "See the schedule" · "Search" |
| Promo ended | "This offer ended Nov 30." | "See current plans." | "See plans" |

### 3.3 Errors
| Place | Message | Action |
|---|---|---|
| Schedule load | "We couldn't load the schedule. Try again, or call your club at {phone}." | "Try again" |
| Busyness load | (nothing shown; "Typical hours below.") | — |
| Club status load | Static hours text | — |
| Map load | "The map did not load. The list has all five clubs." | — |
| Search index | "Search is not working right now. Browse the schedule or call your club." | Two links |
| Tour slots load | "We could not load tour times. Try again." | "Try again" |
| Tour slot taken | "Someone just booked 9:30 a.m. Pick another time." | Grid refreshes |
| Tour hold expired | "That time was released. Pick a time again." | — |
| Join: prices fail | "We could not load prices. Try again, or call {phone}." | "Try again" |
| Join: payment pending | "We are checking your payment. Do not pay again. We will email you in a few minutes." | — |
| Join: payment provider down | "Payment is not available right now. Your plan is saved. Try again in a few minutes or call {phone}." | "Try again" |
| Join: promo ended | "The Fall climb offer ended. Enrollment is now $49." | — |
| Class cancelled (panel) | "This class was cancelled. See other times." | Link |
| Geolocation denied | "Location is off for this site. Enter your ZIP code instead." | Focus ZIP |
| Geolocation timeout | "We could not find you in time. Enter your ZIP code instead." | — |
| Offline | Toast "You're offline. Times may be out of date." | — |
| 500 | "Something broke on our side." "We are fixing it. Try again in a minute, or call your club at {phone}." | "Try again" · "Go home" |

---

## 4. WCAG 2.2 AA checklist

Target: **WCAG 2.2 Level AA** for every page. The list covers every Level A and AA success criterion that applies and states how the site meets it. "Test" says how it is checked. Tools: axe-core in CI (`@axe-core/playwright`), Lighthouse CI, manual keyboard pass, screen readers (VoiceOver on iOS Safari and macOS Safari; NVDA on Windows with Firefox and Chrome; TalkBack on Android Chrome), 200% and 400% zoom, forced colours, reduced motion.

### 4.1 Perceivable
| SC | Requirement | How the site meets it | Test |
|---|---|---|---|
| 1.1.1 Non-text content | Text alternatives | `alt` required in CMS (≤125 chars). Decorative images `alt=""`. Rib meters, icons and maps have text equivalents (§4.5). | axe, manual |
| 1.2.1–1.2.5 Time-based media | Captions, transcripts, audio description | No autoplay. Video testimonials have captions, a transcript link, and audio description is covered by the transcript text where visuals add no new information. | manual |
| 1.3.1 Info and relationships | Structure in markup | Semantic landmarks; one `h1`; ordered headings (§4.6); real `table` for tables with `th scope`; `fieldset`/`legend` for groups; lists for lists. | axe, manual |
| 1.3.2 Meaningful sequence | DOM order = visual order | No CSS order tricks that change reading order (grid `order` limited to the mobile photo-first swap, where DOM order stays logical). | manual |
| 1.3.3 Sensory characteristics | Instructions not by shape/colour only | "Select a time" not "the green ones". | review |
| 1.3.4 Orientation | Both orientations | No orientation lock. | manual |
| 1.3.5 Identify input purpose | `autocomplete` | `given-name`, `family-name`, `email`, `tel`, `bday`, `postal-code`, `cc-*` (provider). | axe |
| 1.4.1 Use of colour | Not colour alone | Status has icon + words; category has icon + name; intensity has ribs + label; busyness has ribs + label; links underlined in body text; selected plan has border + check. | manual |
| 1.4.2 Audio control | No auto audio | No autoplay media. | review |
| 1.4.3 Contrast (minimum) | 4.5:1 text, 3:1 large | Theme pairs all pass (`contrast-report.md`). Extra checks in §5. | axe + manual |
| 1.4.4 Resize text | 200% | Layouts use rem; works at 200% without loss; Ron and Linda test at 200%. | manual |
| 1.4.5 Images of text | None | Headlines are live text. Logo is the exception. | review |
| 1.4.10 Reflow | 320 CSS px wide, no 2-D scroll | All templates stack. Tables with many columns (comparison) have an in-component horizontal scroller (allowed for data tables) and a stacked alternative at `base`. | manual |
| 1.4.11 Non-text contrast | 3:1 UI parts | Control borders Neutral 6 (3.48:1 on Sand, 3.92:1 on white); focus ring 4.71:1 on Sand; icon-only buttons 3:1+. Category bar/icon ≥ 4.2:1 (§5). | manual |
| 1.4.12 Text spacing | Overrides do not break | No fixed-height text containers; tested with the bookmarklet (line height 1.5, letter spacing 0.12em, word spacing 0.16em, paragraph spacing 2em). | manual |
| 1.4.13 Content on hover or focus | Dismissible, hoverable, persistent | Mega menu, tooltips and previews: dismiss with `Esc`; pointer can move onto the panel; remain until dismissed. | manual |

### 4.2 Operable
| SC | Requirement | How the site meets it | Test |
|---|---|---|---|
| 2.1.1 Keyboard | All functions | Every control works by keyboard, including mega menu, carousel, calendar, week grid, map (list is the primary control), chart bars, lightbox. | manual |
| 2.1.2 No keyboard trap | Can leave | Dialogs/drawers trap focus intentionally and release on close; map has "Skip map". | manual |
| 2.1.4 Character key shortcuts | Can turn off / need modifier | `/` for search works only when focus is not in an input; `Cmd/Ctrl+K` is a modified shortcut. A setting is unnecessary because `/` is inactive in fields; the shortcut is documented in the Accessibility statement. | manual |
| 2.2.1 Timing adjustable | | The 5-minute tour slot hold shows a notice with the option to extend ("Keep this time" button at 1 minute left). Join session has no hard time-out (30-minute notice only). | manual |
| 2.2.2 Pause, stop, hide | | No autoplaying motion. Carousels do not auto-advance. Skeleton pulse stops under reduced motion. | review |
| 2.3.1 Three flashes | | No flashing content. | review |
| 2.4.1 Bypass blocks | | Skip links; landmarks. | manual |
| 2.4.2 Page titled | | Unique titles (`01` §5.2). | axe |
| 2.4.3 Focus order | | Logical; drawer/dialog focus moves in and returns to the trigger. | manual |
| 2.4.4 Link purpose (in context) | | Descriptive link text; card links have one accessible name. | manual |
| 2.4.5 Multiple ways | | Nav, search, sitemap.xml, footer, breadcrumbs. | review |
| 2.4.6 Headings and labels | | Descriptive headings and labels. | review |
| 2.4.7 Focus visible | | 2 px Monsoon Sky ring, 2 px offset, on all focusable parts (Scroll area via CSS). | manual |
| **2.4.11 Focus not obscured (min)** | New in 2.2 | `scroll-margin-top: 88px` (header 64 + gap) and `scroll-padding-bottom: 76px` for the bottom bar; the sticky tab bar uses `scroll-margin-top: 128px`; cookie banner never covers the focused control (it is repositioned or collapsed on focus). | manual |
| 2.5.1 Pointer gestures | | Carousel swipe and map pinch have button alternatives. | manual |
| 2.5.2 Pointer cancellation | | Actions on `click` (up-event). | review |
| 2.5.3 Label in name | | Visible label text is in the accessible name ("Book a free tour"). Icon+text buttons keep the visible text first. | axe |
| 2.5.4 Motion actuation | | None used. | review |
| **2.5.7 Dragging movements** | New in 2.2 | No drag is required: slider has keyboard and click, carousels have arrows, map has +/− and pan buttons, drawer closes with a button. | manual |
| **2.5.8 Target size (min)** | New in 2.2 | Targets ≥ 44×44 px (theme `size.control`), well above the 24 px minimum; inline text links in paragraphs are exempt. Footer link rows are 44 px high. | manual |

### 4.3 Understandable
| SC | Requirement | How the site meets it | Test |
|---|---|---|---|
| 3.1.1 Language of page | | `<html lang="en-US">` | axe |
| 3.1.2 Language of parts | | Not needed (English only). If Spanish copy is added later, mark `lang="es"`. | review |
| 3.2.1 On focus | | No context change on focus. | manual |
| 3.2.2 On input | | Filters update content in place and announce results; they do not navigate away. Club select in the tour flow does not auto-advance. | manual |
| 3.2.3 Consistent navigation | | Header, footer and drawer order are identical on every page. | review |
| 3.2.4 Consistent identification | | Same icon and label for the same function (for example "Book a free tour"). | review |
| **3.2.6 Consistent help** | New in 2.2 | The help phone link and "Contact" link are in the same place: the utility bar, the minimal checkout header ("Need help? (480) 555-0100"), the footer, and the drawer. | review |
| 3.3.1 Error identification | | Errors in text, linked from a summary. | manual |
| 3.3.2 Labels or instructions | | Visible labels; help text under labels; required fields marked in text ("Required" not asterisk only). | axe |
| 3.3.3 Error suggestion | | Messages say how to fix (§2.3). | review |
| 3.3.4 Error prevention (legal, financial) | | The join flow shows a full review (summary on the payment step), lets the member go back, and confirms by email. Tours can be rescheduled or cancelled by a signed link. | manual |
| **3.3.7 Redundant entry** | New in 2.2 | Club, time and details carry across steps. Billing ZIP prefilled from the member ZIP. The family step never asks the main member's details again. | manual |
| **3.3.8 Accessible authentication (min)** | New in 2.2 | The marketing site has no sign-in form. The sign-in creation on `/join/confirmed` allows paste, password managers and passkeys; no memory test or puzzle is used. No CAPTCHA anywhere (honeypot and rate limits protect forms). | manual |

### 4.4 Robust
| SC | Requirement | How the site meets it | Test |
|---|---|---|---|
| 4.1.2 Name, role, value | | Graphical (Base UI) supplies roles and states. Custom parts (`RibMeter`, week grid blocks, chart bars) set `role`/`aria-*` explicitly. | axe, SR |
| 4.1.3 Status messages | | Result counts, form errors, toasts, "Added family member", price changes use `role="status"` or `aria-live="polite"`; errors on submit `role="alert"`. | SR |

### 4.5 Component patterns
| Component | Accessible pattern |
|---|---|
| `NavigationMenu` mega menu | Triggers are buttons with `aria-expanded`; panel `aria-labelledby` trigger; arrow keys between top items; `Esc` closes and returns focus. |
| `ClubSwitcher` | Popover/Drawer is a labelled dialog; options are radios with name, address, status, distance; results count in a live region. |
| `ClubMap` | The list is the accessible equivalent. Map container `aria-hidden` for pointer users with a "Skip map" link first; pins are buttons in DOM order after the list; scroll-zoom needs Ctrl/two fingers with a visible hint. |
| `RibMeter` / `IntensityRibs` / `BusynessMeter` / `CapacityIndicator` / `ProgressRibs` | `role="img"` with `aria-label` ("Intensity 4 of 5, Hard"; "Busyness Steady, 3 of 5"; "4 bikes left"). The visible text label is always present beside it. Decorative copies use `aria-hidden`. |
| `CategoryBadge` | Icon + name always visible; the icon is `aria-hidden`; text is the label. |
| `ScheduleDayStrip` | `role="group"` with buttons `aria-pressed`; label "Tuesday, October 27, 12 classes". |
| `ScheduleWeekGrid` | `role="grid"`? No. It is a list of days with lists of sessions (`<ul>` per day) for screen readers, with CSS grid for the visual. Each block is a button with a full label ("Climb Cycle, Tuesday 6:00 a.m., Gilbert – Val Vista, 4 spots left"). |
| `PopularTimesChart` | Bars are focusable with a text label per bar; a hidden table or summary sentence follows ("Quietest: weekdays 1:00–3:00 p.m."). |
| `calendar` (tour) | Native grid pattern of shadcn/React Aria; disabled days have `aria-disabled` and a tooltip reason; month change announces. |
| Carousels | `role="region"` + `aria-roledescription="carousel"`; slides `role="group"` "2 of 5"; prev/next buttons labelled; no auto-advance; hidden slides `inert`. |
| Accordion | Button triggers `aria-expanded`/`aria-controls`; heading wraps the button. |
| Dialog/Drawer | Focus moves to the title; trap; `Esc`; return focus; background `inert`. |
| Tables | `caption`, `th scope`, sticky headers do not hide focus. |
| Toasts | `role="status"` (info) / `role="alert"` (error); persist at least 6 s and pause on hover/focus. |
| Skeletons | `aria-busy="true"` on the region; one status message, not per skeleton. |
| Disabled buttons | Prefer `aria-disabled` with the reason in text next to the button so it is discoverable. |

### 4.6 Structure rules
1. One `h1` per page (the page title in the hero). Section titles are `h2`. Cards inside a section use `h3`. Never skip levels.
2. Landmarks: `header`, `nav` (primary, breadcrumb, footer, on-this-page), `main`, `footer`; `section` elements have `aria-labelledby` pointing at their `h2`.
3. On client route change focus moves to the `h1` (`tabindex="-1"`), and the document title updates. A visually hidden live region announces "Page loaded: {title}".
4. External links to the app and maps: visible icon `ArrowUpRight` and `sr-only` "(opens in a new tab)" where they open a new tab. App links on the same tab do not use `target`.
5. File downloads (PDF) state type and size: "Download PDF (240 KB)".
6. Tables only for tabular data (`ClubComparisonTable`, plans, hours, courts).
7. Language is plain (§1).

### 4.7 Test plan and gates
| Gate | Rule |
|---|---|
| CI | axe: 0 critical/serious on all templates in light and dark; Lighthouse accessibility ≥ 95 |
| Manual keyboard | Each template completed with keyboard only (nav, filters, forms, flows) |
| Screen reader | VoiceOver iOS + macOS, NVDA: header/mega menu, club finder, schedule, tour flow, join flow, FAQ |
| Zoom | 200% and 400% (320 px reflow) on Home, Club detail, Schedule, Membership, Join |
| Contrast | §5 table re-run when tokens change (`python3 ui-theme/build_theme_css.py`) |
| Reduced motion | Verified on mega menu, drawer, carousel, ribs |
| Forced colours | Windows High Contrast: focus ring and borders remain visible (`forced-color-adjust: auto`; rib meters use `currentColor`) |
| User test | 5 participants including 2 aged 60+ (Ron and Linda profile), 1 screen-reader user, 1 motor-impairment user, before launch |
| Accessibility statement | Published at `/legal/accessibility` with date of audit and feedback route |

---

## 5. Contrast checks and safety copy

### 5.1 Theme pairs (from `ui-theme/README.md` and `contrast-report.md`; all pass)
Ink on Sand 15.3:1 · Ink on white 17.2:1 · White on Arizona Copper 4.95:1 · Link `#9E4522` on Sand 5.61:1 · on `surface-muted` 5.14:1 · on `primary-subtle` 4.93:1 · Muted `#6B6457` on Sand 5.21:1 · on `surface-muted` 4.77:1 · Sand on Saguaro Night 12.0:1 · Caliche on Saguaro Night 9.05:1 · Dark `primary-foreground` `#121A16` on Dawn Copper 6.22:1 · Control border `#8C7F6B` on Sand 3.48:1, on white 3.92:1 · Focus ring `#2E6DB4` on Sand 4.71:1 · `#7FB0E8` on Saguaro Night 5.97:1 · Status text on Sand: success 5.32, warning 5.63, danger 5.84.
Rules: Copper text on Sand fails (4.40:1); use `link` for copper text and links (`BG §4`). Do not set white text under 14 px on copper (`BG §4`).

### 5.2 Category colours
The shared components file ran the full contrast check and fixed three light colours (`../01-shared-brand-components.md` §2.1–2.3). This site uses its final tokens (`04-components.md` §5.6). Summary of the results the site depends on:
- Category fills pass 3:1 as icons, stripes and graphics on `surface` and `background` in light and dark (lowest: Strength on Sand 4.40:1).
- Category text tokens pass 4.5:1 on `surface`, `background` and their 10% (light) or 14% (dark) tints. Strength text uses Copper Deep `#9E4522`.
- Category-coloured text fails on `surface-muted` for Strength, Mind & Body and Court. Rule: on `surface-muted` bands, put class items on white `surface` cards, or set the name in `text`.
- Category is never the only signal: icon and name always show (`FD §3`).
- Open issue: Strength shares Arizona Copper with the action colour. The shared rules in §2.4 of that file (stripe, small icon and tint only) are the mitigation (`01-strategy-and-ia.md` §10).
Re-run the shared contrast script when tokens change.

### 5.3 Safety and legal copy blocks
Use these exact blocks where listed.
| Block | Text | Where |
|---|---|---|
| Health note | "Talk to your doctor before you start a new exercise plan, especially if you have a health condition or are coming back from an injury." | Class pages, Recovery, Aquatics, Kids/teens |
| Heat and cold | "Talk to your doctor if you have a heart condition, are pregnant, or take medicines that affect heat or cold." | Recovery |
| Emergency | "For a medical emergency, call 911." | Contact, club pages footer |
| Kids club | "Kids club takes children from 6 months to 12 years. A parent checks in at the same club and stays in the building. Kids with a fever or vomiting cannot check in." | Kids, Club detail |
| Pass terms | "One pass per person every 12 months. Ages 18 and up. Your 3 days start at your first check-in. No card needed." | Trial |
| Tour terms | "Free. No card. We use your details only to book this tour." | Tour |
| Cancellation | "Cancel free up to 2 hours before. Later is a late cancel. Three late cancels in 30 days pause booking for 3 days." | Schedule, FAQ |
| Fees | "Enrollment is $0 through Nov 30 (otherwise $49). A $49 annual facility fee is charged in March." | Membership, Join |
| Month to month | "Month to month. Cancel or freeze with 30 days' notice. Freeze costs $10 a month for 1 to 3 months." | Membership, Join, FAQ |
| Photo release (kids) | "I agree that kids club staff may take photos for safety and records. Photos are not posted." | Join family step |

---

## 6. Performance budgets

### 6.1 Core Web Vitals (field, p75, mobile unless noted)
| Metric | Budget | Target | Notes |
|---|---|---|---|
| LCP | ≤ 2.5 s | ≤ 2.0 s on Home, Club, Class, Membership | LCP element is the hero image or H1; see §6.4 |
| INP | ≤ 200 ms | ≤ 150 ms | Filters and menus respond in one frame |
| CLS | ≤ 0.1 | ≤ 0.05 | All live-data slots reserve size; fonts use fallback metrics |
| TTFB | ≤ 600 ms | ≤ 300 ms | ISR + CDN edge cache |
| FCP | ≤ 1.8 s | ≤ 1.4 s | |
Lab gates (Lighthouse CI, mobile, Moto G Power profile, Slow 4G): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

### 6.2 Resource budgets per template (gzip/brotli transfer, first load)
| Template | HTML+CSS | JS | Fonts | Images above fold | Total |
|---|---|---|---|---|---|
| Home | ≤ 45 KB | ≤ 170 KB | ≤ 120 KB | ≤ 150 KB (hero) | ≤ 800 KB |
| Club detail | ≤ 50 KB | ≤ 190 KB (map loads on view: +190 KB lazy) | ≤ 120 KB | ≤ 150 KB | ≤ 900 KB |
| Clubs index | ≤ 45 KB | ≤ 200 KB + map ≤ 220 KB (map is above the fold at `lg`) | ≤ 120 KB | list photos ≤ 5 × 40 KB | ≤ 1.1 MB |
| Classes index | ≤ 40 KB | ≤ 150 KB | ≤ 120 KB | ≤ 150 KB | ≤ 800 KB |
| Class detail | ≤ 40 KB | ≤ 150 KB | ≤ 120 KB | ≤ 120 KB | ≤ 700 KB |
| Schedule | ≤ 40 KB | ≤ 200 KB | ≤ 120 KB | none | ≤ 450 KB |
| Membership | ≤ 40 KB | ≤ 140 KB | ≤ 120 KB | none | ≤ 400 KB |
| Join steps | ≤ 30 KB | ≤ 160 KB + payment SDK (provider's own, loaded on payment step only) | ≤ 120 KB | none | ≤ 450 KB |
| Journal article | ≤ 40 KB | ≤ 100 KB | ≤ 120 KB | ≤ 150 KB | ≤ 600 KB |
Third-party scripts (analytics, payment, maps tiles) are the only external requests. No chat widgets, no ad pixels, no session replay at launch.

### 6.3 How the budgets are met
1. **Server Components by default.** Client islands only for: header menus, club switcher, live-data blocks, filters, carousels, calendar, forms. Static sections ship zero JS.
2. **ISR + CDN.** All CMS pages revalidate on publish (webhook) and cache at the edge. Live data is client-fetched with SWR, `Cache-Control: s-maxage=30, stale-while-revalidate=60`.
3. **No render-blocking requests.** Critical CSS is inlined by Next.js; Tailwind output ≤ 30 KB gzip. `preconnect` to the API host and the map tile host.
4. **Fonts.** `next/font` self-hosting, variable files, `display: swap`, `adjustFontFallback`. Subset to Latin. Archivo with only `wght` and `wdth` axes used.
5. **Images.** AVIF/WebP, correct `sizes`, `priority` on the LCP image only, blur placeholders, explicit aspect ratios (`04` §5).
6. **Map.** MapLibre loads on `IntersectionObserver` (or on tap at `base`), with a static placeholder image of identical size. Vector tiles are cached; style JSON ≤ 30 KB.
7. **Carousel (Embla)** is code-split per section. Charts (Recharts) load only on the club page when the tab is near the viewport.
8. **Search index** (≤ 40 KB gzip) loads on first open of the search.
9. **Personalisation without shift.** Club-dependent blocks reserve their final height; the cookie is read by a tiny inline script before paint.
10. **Animations** use `transform`/`opacity` only (`04` §4).
11. **Hydration cost.** `Suspense` boundaries around live blocks; skeletons share the final dimensions.

### 6.4 LCP strategy by page
| Page | LCP element | Tactics |
|---|---|---|
| Home | Hero photo (4:5) or H1 on mobile | `priority` image, preloaded; AVIF ≤ 150 KB at 1280; H1 is text with a system-metric fallback so text paints first |
| Club detail | Hero photo (16:9) | Same; breadcrumb and H1 above it are text |
| Class detail | Hero photo (4:3) | Same |
| Clubs index | H1 (text) | Map and photos below do not compete; first list photo has `loading="eager"` only for the first card |
| Schedule | Filters/H1 (text) | List loads client-side; skeleton rows reserve height |
| Membership | H1 (text) | No hero image |

### 6.5 Monitoring
Real-user monitoring through the `web-vitals` library, sent to the analytics endpoint (`web_vitals` event, §8). Dashboards per template and device. Alerts: LCP p75 > 2.5 s for 24 h, CLS p75 > 0.1, JS error rate > 1%. Quarterly performance review. A performance budget check runs in CI (bundle analyser with limits from §6.2); a pull request that exceeds a budget by 5% cannot merge without a written reason.

---

## 7. Privacy, consent and security

| Topic | Rule |
|---|---|
| Cookie categories | **Necessary** (`cpa_club` functional, `cpa_join` checkout, consent record, CSRF); **Analytics** (off until accepted); **Marketing** (none at launch). Declined by default (privacy rule: decline non-essential). |
| Consent signals | Honour Global Privacy Control as "decline analytics". Consent record kept 12 months. Preference centre at `/legal/cookies` and the footer button "Your privacy choices". |
| Personal data in URLs | Never. Query strings carry club slug, class slug, date and filters only. No names, emails, phones or ZIP codes in URLs or analytics events. |
| Forms | Collect the minimum. Tour: name, contact, club, time. Pass: name, contact, club. Join: see `03-pages.md` §8. Each form states the purpose in one line. |
| SMS | Express opt-in via an unchecked box. Messages include "Reply STOP to opt out" and "HELP for help". Quiet hours 8:00 p.m.–8:00 a.m. Terms at `/legal/sms-terms`. |
| Email | Marketing email only with an opt-in box (unchecked). One-click unsubscribe. Transactional email (tour, pass, receipt) is always sent. |
| Retention | Tour and pass leads: 24 months, then delete unless they joined. Contact messages: 12 months. Join data: lifetime of membership + 7 years for billing records. |
| Children | The site does not collect data from children. Child details (join step 4) come from a parent, are stored with the membership and used only for the kids club and billing. |
| Security | HTTPS only with HSTS; CSP allows self, the payment provider, the map tile host and the analytics host; `frame-ancestors 'none'`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` allows `geolocation=(self)` only; cookies `Secure`, `HttpOnly` (checkout), `SameSite=Lax`. |
| Form abuse | Honeypot field, server-side rate limit per IP and contact, email domain check. No CAPTCHA (`WCAG 3.3.8`; also the safety rule against bot-detection puzzles). |
| Payments | Card data goes to the provider's hosted fields; our servers never see it. PCI scope is SAQ A. No third-party scripts on `/join/payment` except the provider. |
| Geolocation | Requested only after the visitor taps "Use my location". Used once to sort clubs; not stored. |
| Embeds | None (no YouTube iframes at launch). Video uses self-hosted files with a poster and captions. |

---

## 8. Analytics events

Implementation: a thin `track(name, props)` wrapper pushes to `window.dataLayer` and to a first-party endpoint `/api/e`. Analytics scripts load only after consent. Page views are sent on every route change. Event names are `snake_case`. Properties are strings, numbers or booleans. **No personal data.**

### 8.1 Common properties (sent with every event)
`page_type` (home, clubs, club, classes, class, category, schedule, membership, join, trial, tour, kids, aquatics, courts, recovery, pt, coaches, coach, about, faq, contact, journal, article, careers, app, search, legal, error) · `page_path` · `club_slug` (my club, if set) · `device` (mobile, tablet, desktop) · `signed_in` (boolean) · `promo_id` (active promo) · `experiment` (if any) · `utm_source`, `utm_medium`, `utm_campaign` (first touch, stored in `sessionStorage`).

### 8.2 Event catalogue

**Conversions and flows**
| Event | Trigger | Extra properties |
|---|---|---|
| `tour_started` | Tour page opens or first interaction | `entry` (header, hero, club_page, class_page, coach, kids, band), `prefilled_club` |
| `tour_step_complete` | Step 1 or 2 completed | `step` (1, 2), `club_slug` |
| `tour_booked` | Booking confirmed (once per ID) | `club_slug`, `day_offset`, `slot` (hour), `has_note`, `coach_requested`, `sms_opt_in` |
| `trial_started` | Pass page form interaction | `entry`, `prefilled_club` |
| `trial_pass_issued` | Pass created (once per ID) | `club_slug`, `contact_type` (email, mobile) |
| `join_started` | `/join/plan` first view | `entry`, `plan_preselected` |
| `join_step_complete` | Each step passes validation | `step` (plan, club, details, family, payment), `plan`, `has_family` |
| `join_completed` | Payment success (once per order) | `plan`, `club_slug`, `adults_added`, `children_added`, `value` (today's total, number), `promo_code_used`, `currency` |
| `join_error` | Payment or step error shown | `step`, `error_type` (declined, network, provider, validation) |
| `join_abandon` | Leaves join with items saved (beforeunload/visibility) | `step` |

**Discovery**
| Event | Trigger | Extra properties |
|---|---|---|
| `cta_click` | Any CTA button/link | `cta_id`, `label`, `location` (header, hero, band, card, sticky_bar, drawer, footer), `destination` |
| `club_selected` | Club saved in `ClubSwitcher` | `club_slug`, `source` (picked, zip, geo) |
| `club_zip_search` | ZIP submit | `valid` |
| `club_geo_request` / `club_geo_denied` | Location tap / denial | `reason` |
| `club_cleared` | Clear my club | — |
| `club_filter_change` | Amenity chip toggled | `filter`, `state`, `results_count` |
| `club_card_tour_click` | Tour this club on a card | `club_slug`, `context` (home, index, map, mega, nearby) |
| `club_pin_click` | Map pin opened | `club_slug` |
| `club_detail_open` | Club page view | `club_slug`, `referrer_type` |
| `club_tab_view` | Tab section enters view | `tab` |
| `club_call_click` | `tel:` click | `club_slug`, `location` |
| `directions_click` | Get directions | `club_slug` |
| `popular_times_view` | Chart in view / day change | `club_slug`, `day` |
| `class_type_open` | Class detail view | `class_slug`, `category` |
| `category_open` | Category landing view | `category` |
| `schedule_open` | Schedule view | `club_filter`, `entry` |
| `schedule_filter_change` | Any filter | `filter`, `value`, `results_count` |
| `schedule_view_toggle` | List / Week | `view` |
| `schedule_day_select` | Day chip | `day_offset` |
| `class_detail_panel_open` | Panel open | `class_slug`, `session_state` |
| `schedule_book_click` | Book or waitlist button | `class_slug`, `club_slug`, `state` (open, waitlist), `signed_in` |
| `schedule_handoff_login` / `_trial` / `_join` | Choice in the handoff dialog | `class_slug`, `club_slug` |
| `plan_card_join_click` | Plan card button | `plan`, `location` |
| `family_calculator_change` | Stepper or plan change | `plan`, `adults`, `children`, `total` |
| `comparison_open` | Comparison table in view / dialog open | `context` |
| `coach_open` | Coach profile view | `coach_slug` |
| `coach_filter_change` | Coach filter | `filter`, `value` |
| `promo_click` / `promo_dismiss` | Promo bar/band | `promo_id` |
| `nav_mega_open` | Mega menu opens | `menu` (clubs, classes) |
| `mobile_drawer_open` | Drawer opens | — |
| `search_open` | Search dialog opens | `method` (click, slash, shortcut) |
| `search_query` | After 500 ms idle, or Enter | `query_length`, `results_count` (no raw text unless it matches no PII pattern; see below) |
| `search_result_click` | Result chosen | `group`, `position` |
| `search_no_results` | Zero results | `query` (sanitised) |
| `faq_open` | Question opened | `question_id`, `group` |
| `faq_search` | FAQ filter used | `results_count` |
| `contact_submit` | Contact form sent | `topic`, `club_slug` |
| `newsletter_subscribe` | Subscribe | `location` |
| `journal_read` | 50% and 90% scroll in an article | `post_slug`, `depth` |
| `testimonial_nav` | Arrow or dot | `index` |
| `gallery_open` | Lightbox | `club_slug`, `index` |
| `app_store_click` | App badge | `location` |
| `job_apply_click` | Apply | `job_slug` |
| `share_click` | Share or copy link | `target`, `method` |

**Quality and system**
| Event | Trigger | Extra properties |
|---|---|---|
| `form_error` | Validation error shown | `form`, `field`, `error_type` |
| `form_abandon` | Form touched, left without submit | `form`, `last_field` |
| `error_view` | 404 / 500 shown | `status`, `path` |
| `api_error` | Live-data fetch fails | `endpoint`, `status` |
| `web_vitals` | LCP, INP, CLS, FCP, TTFB final values | `metric`, `value`, `rating`, `template` |
| `consent_update` | Banner or preference centre | `analytics` (boolean) |
| `a11y_pref` | Reduced motion or forced colours detected | `pref` |

PII guard: `query`, `note`, `message`, name and contact fields are never sent. Search text is sent only after a regex removes anything that looks like an email or phone number and only the first 40 characters.

### 8.3 Funnels to build in the dashboard
1. **Tour funnel:** `cta_click(Book a free tour)` → `tour_started` → `tour_step_complete(1)` → `tour_step_complete(2)` → `tour_booked`.
2. **Pass funnel:** `trial_started` → `trial_pass_issued`.
3. **Join funnel:** `join_started` → `join_step_complete(plan)` → `(club)` → `(details)` → `(family)` → `(payment)` → `join_completed`.
4. **Club finder:** `club_zip_search` or `club_geo_request` → `club_card_tour_click` or `club_detail_open`.
5. **Schedule:** `schedule_open` → `schedule_book_click` → `schedule_handoff_login | _trial | _join`.
6. **Membership:** `plan_card_join_click` ← `membership` page view; `family_calculator_change` → `plan_card_join_click`.

### 8.4 Dashboard KPIs (maps to `01-strategy-and-ia.md` §1.3)
Tours booked per week · visit-to-lead rate · tour flow completion · join flow completion · club-finder success · schedule-to-handoff · no-result search rate · field error rate · LCP/CLS p75 by template.

### 8.5 Experiments (planned, one at a time)
1. Hero secondary button label: "Try a free 3-day pass" vs "See classes".
2. Home plan section position: after Schedule teaser vs after Families.
3. Tour band copy: "Come see the club." vs "Bring a friend. Tour free."
Rules: pre-register the metric (`tour_booked`), run to 95% confidence or 4 weeks, never test price, fee or legal text, never show different prices to different visitors.

---

## 9. Revision log

### Revision 2 (coordinator pass)
| # | Change | Files |
|---|---|---|
| 1 | Applied the foundation "Rules settled" block: kids club 6 months–12 years with four 2-hour blocks; child add-on 6 months–17; guest pass rules (18+, or 16–17 with guardian waiver, valid 14 days); PT single $75 and 12-pack $732 ($61 each), packs last 12 months; member services (480) 555-0100 for join, 500 and neutral help; Val Vista ZIP 85233; lap lane counts and shared lanes; court booking rules. Removed the "after 30 verified ratings" rule: no public star ratings, no rating lines. `01` §9 now says the facts live in the foundation. | 01, 02, 03, 05 |
| 2 | Strength stays Arizona Copper with the shared-spec mitigations. Kept as an open issue for the user (`01` §10 issue 1). | 01, 04, 05 |
| 3 | Applied `mobbin-standard-pass.md` §2 [Marketing] rules: 1–3 (one primary button, ghost link for the pass), 2 (split hero), 4 (finder cards with address and hours), 5 (3-column contact grid), 6–7 (club block order, hours grouping), 8 (`thumb-left` class grid, no rating), 9 (six category tiles + More), 10 and 12 (pricing badge, big price), 13–14 (trial benefit rows, email row), 15 (quote card beside photo), 16 (headshot strips), 17 (age chips), 18 (family section), 19 (photo + sidebar list), 20–21 (full-screen mobile menu, two levels). Not applied: 11 (no annual price). Rule 41 (rating line) not applied. | 01–05 |
| 4 | Mobile nav strengthened: menu button left, logo centred, search right; full-screen overlay with close top-left, large primary links beside a smaller secondary column, Clubs and Classes sub-panels with a back button, test note for 375 px. | 02, 04 |
| 5 | Shared-spec alignment: `DurationChips` on the courts preview; success pattern (green check, one headline, summary card, filled action, "Done") on join, pass and tour confirmations; finder cards with address and today's hours; `PromoBand` email row on Home and Club bands; six `category` tiles; `CoachCard` `headshot` for strips; `ClassCard` `thumb-left`; `schedule-row` reading order; category colours from shared §2. | 02–05 |
| 6 | New wording rule: dates read "Tue, Oct 27". Phones use the club number on club pages and member services on flows. | 03, 05 |
| Open | Mobile menu has one web capture as evidence. Test at 375 px. The email-row pass start sends the email by a server session, not the URL. | — |
