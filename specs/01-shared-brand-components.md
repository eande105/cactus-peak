# Cactus Peak Athletic — Shared brand component spec (part 1 of 2)

Scope: the custom components that show clubs, classes, capacity and membership. The marketing website, the member web app and the iOS app all use them.
Part 1 (this file): principles, category colours, data model, shared rules, primitives, and the club components.
Part 2 (`01-shared-brand-components-part2.md`): class and schedule components, booking components, plan and membership components, support components, usage matrix, open decisions.

Business facts come from `00-foundation.md`. Tokens come from `../cactus-peak-brand/ui-theme/theme.json` and its README. Names in this spec are final. The other three specs refer to them exactly.

## 0. How to read this spec

### 0.1 Component index (exact names)

| Group | Components | Where |
|---|---|---|
| Primitives | `RibMeter`, `IntensityRibs`, `BusynessMeter`, `CapacityIndicator`, `CategoryBadge`, `AmenityChip` | Part 1, section 5 |
| Clubs | `ClubCard` (feature, compact, list-row, map-callout), `ClubHero`, `ClubSwitcher`, `HoursTable`, `PopularTimesChart`, `ClubMap` + `ClubPin` | Part 1, section 6 |
| Classes and schedule | `ClassCard` (schedule-row, card, featured, compact), `ClassDetailPanel`, `InstructorChip`, `CoachCard`, `ScheduleDayStrip`, `ScheduleWeekGrid`, `ScheduleFilters`, `ClassPhotoTile` | Part 2, section 7 |
| Booking | `BookingStateButton`, `ReservationSlotGrid` | Part 2, section 8 |
| Membership | `PlanCard`, `PlanComparisonTable`, `CheckInPass`, `VisitStreak`, `ProgressRibs` | Part 2, section 9 |
| Support | `EmptyState`, `PromoBand` | Part 2, section 10 |

Added by this spec (not in the required list): `ClubRibMark` (a part of `ClubHero`), `ClubSubnav` (a part of `ClubHero`), `ClassType` (a data type), `LateCancelNotice` (a part of `BookingStateButton`), `OpenStatus` (a small part used by `ClubCard`, `ClubHero`, `ClubPin`).

### 0.2 Research source keys

Every component ends with a "Research basis" line. These keys point to files in `cactus-peak-specs/research/`. "r" means rule number.

| Key | File | Example |
|---|---|---|
| MKT | `mobbin-marketing.md` | "MKT §3 r2" = section 3 rule 2. "MKT §4" = the anti-pattern list. |
| WEB | `mobbin-webapp.md` | "WEB §4 r9". "WEB §5 #11" = anti-pattern 11. |
| IOS | `mobbin-ios.md` | "IOS §5 r3". "IOS §6 #10" = anti-pattern 10. |
| GAP | `mobbin-gaps.md` | "GAP r13" = design rule 13 at the end of the file. |
| APL | `apple-ios-guidelines.md` | "APL §6" = section 6. |
| LIB | `component-libraries.md` | "LIB §1" = Graphical table. "LIB §2" = shadcn table. "LIB §4" = gaps table. |
| FND | `00-foundation.md` | "FND §3" = taxonomy. |
| BRD | `brand-guidelines.md` | "BRD §6" = iconography. |
| THM | `ui-theme/README.md` and `theme.json` | Token source. |
| (full name) | `mobbin-standard-pass.md` | Cited in full, for example "mobbin-standard-pass §2 rule 61". §3 of that file lists corrections to the older research files; this spec uses them (see Revision log in part 2). |

Some research files mark items as "unverified". This spec repeats that label. Where I add a design decision that research does not cover, the text says "Decision" or "Proposal".

### 0.3 Units and shared words

- Web sizes are in px. iOS sizes are in pt. The value is the same unless the text says otherwise.
- Spacing steps: 4, 8, 12, 16, 24, 32, 48. The theme names are xxs, xs, s, m, l, xl, xxl.
- Radius tokens: XS 4, S 10, M 14, L 20, XL 28, full 9999.
- Type steps: XXS 11/14, XS 12/16, S 14/20, M 16/24, L 24/30, XL 36/40, XXL 48/52. The theme also defines `data` (Archivo 500, 16/24, tabular), `data-l` (Archivo 700, 36/40, tabular) and `eyebrow` (Archivo 600, uppercase, 12/16, +0.24em).
- A "surface" is the theme role `surface` (white in light mode, `#1A241F` in dark mode). The "page" is the role `background` (Sand `#F6F1E8`, dark `#121A16`).
- Hex values appear only in this spec and in the theme files. App code uses role names (LIB §5).

## 1. Design principles for these components

These principles extend the cross-product principles in `00-foundation.md` section 6.

1. **A club or a class is a picture first.** Show the photo, the category colour, the icon, the face, the ribs and the live number. A text-only row is a fallback. Use it only for dense lists such as the schedule day list (WEB §4 r3), and even then add the stripe, the avatar and the ribs.
2. **Five ribs mean one thing at a time.** The `RibMeter` shows busyness, intensity, capacity and progress. Each use has its own label and its own colour rule. Never place two different rib meters side by side without a text label for each.
3. **Colour is never the only signal.** Every colour has a second signal: an icon, a word, a shape or a position. The category colour always travels with the category icon and the category name.
4. **Say the number.** Show "4 bikes left", not "Almost full". Show "Steady now", not a colour. Every meter has a text value that screen readers also read.
5. **Copper means "you can act" or "this is active".** Category colours are for stripes, icons and tints. Never use a category colour on a filled button. Use `primary` for one action on a card.
6. **One filled button per card.** A card has one primary action. Other actions are text links or outline buttons (MKT §3 r3).
7. **Calm surfaces.** Cards are flat: a 1 px border, no shadow, radius M. Only floating things (map callout, popover, sheet) use a shadow. No gradients. Text on photos sits on a solid Saguaro Night band, not on a gradient (BRD §9).
8. **Live data is honest.** Busyness and spots-left show their age. If data is older than 15 minutes, say so and hide the meter. Never fake a number.
9. **Same data, same words, three surfaces.** All three surfaces read the same model (section 3). Labels, units and copy come from shared formatters (section 4.7).
10. **Native where it counts.** On iOS, use system lists, sheets, tab bars, `Map`, `Chart` and `ContentUnavailableView`. Brand shows through tint, category colour, the rib shape and Archivo for big numbers (APL §4). Do not put Liquid Glass on cards or rows (APL §3).
11. **Rules that members feel are visible.** Late-cancel cutoff, waitlist hold and booking window appear next to the action that they affect (IOS §6 #5).
12. **One row order, one success pattern.** A class row reads time, title, instructor, spots, action on web and iOS (mobbin-standard-pass §2 rule 61). Every success screen has one green check and one headline (mobbin-standard-pass §2 rule 62).

## 2. Category colours and icons

### 2.1 How I checked contrast

Method: WCAG 2.2 relative luminance, computed by script for every pair below. Thresholds: 4.5:1 for text under 18 pt (24 px) and under 14 pt bold; 3:1 for large text, icons and meaningful graphics (SC 1.4.3, 1.4.11).

Surfaces used in the checks:

| Surface | Light | Dark |
|---|---|---|
| `surface` (white card) | `#FFFFFF` | `#1A241F` |
| `background` (page) | Sand `#F6F1E8` | `#121A16` |
| `surface-muted` | `#EFE7DA` | `#24302A` |

Category tint = the category colour at **10 % over the host surface in light mode** and **14 % over the host surface in dark mode**. I tried 12 % in light mode and 18 % in dark mode first. Those failed for four categories, so I lowered the tint strength.

Supported hosts for category-coloured text: `surface` and `background` (and the tint over them). Do not place category-coloured text on `surface-muted`. Use the role `text` there.

### 2.2 Results and final tokens

**Light mode** (fill = stripe, icon, solid badge; text = label colour on tint)

| Category | Icon (Lucide base) | Fill | Text token | Fill on white | Fill on Sand | White on fill | Text on tint over white | Text on tint over Sand | Tint vs host |
|---|---|---|---|---|---|---|---|---|---|
| Strength | custom `rib-barbell` (fallback `dumbbell`) | `#B5532C` | **`#9E4522`** | 4.95 | 4.40 | 4.95 | 5.53 | 4.94 | 1.14 |
| Cycle | `bike` | `#2F5A45` | `#2F5A45` | 7.87 | 6.99 | 7.87 | 6.72 | 6.03 | 1.17 |
| Conditioning | `activity` | `#8A5300` | `#8A5300` | 6.33 | 5.63 | 6.33 | 5.48 | 4.89 | 1.15 |
| Mind & Body | `flower-2` | **`#52684A`** | `#52684A` | 6.11 | 5.43 | 6.11 | 5.33 | 4.75 | 1.15 |
| Aqua | `waves` | `#1F6E7A` | `#1F6E7A` | 5.88 | 5.23 | 5.88 | 5.10 | 4.57 | 1.15 |
| Court | custom `court` | **`#7F6019`** | `#7F6019` | 5.85 | 5.20 | 5.85 | 5.09 | 4.55 | 1.15 |
| Recovery | `heart-pulse` | `#5F4E86` | `#5F4E86` | 7.19 | 6.39 | 7.19 | 6.19 | 5.55 | 1.16 |
| Youth | `smile` | `#9C3D6B` | `#9C3D6B` | 6.38 | 5.67 | 6.38 | 5.51 | 4.92 | 1.16 |

**Dark mode** (fill and text are the same colour; label on a solid fill is `#121A16`)

| Category | Fill and text | On `surface` `#1A241F` | On page `#121A16` | On `surface-muted` `#24302A` | Text on tint over `surface` | Text on tint over page | `#121A16` on fill | Tint vs host |
|---|---|---|---|---|---|---|---|---|
| Strength | `#E0804F` | 5.60 | 6.22 | 4.81 | 4.54 | 5.11 | 6.22 | 1.23 |
| Cycle | `#6FB08F` | 6.29 | 6.99 | 5.41 | 4.90 | 5.54 | 6.99 | 1.28 |
| Conditioning | `#F2B14C` | 8.49 | 9.42 | 7.29 | 6.34 | 7.18 | 9.42 | 1.34 |
| Mind & Body | `#A9C29A` | 8.26 | 9.17 | 7.10 | 6.16 | 6.91 | 9.17 | 1.34 |
| Aqua | `#6FC3CF` | 7.89 | 8.76 | 6.78 | 5.95 | 6.67 | 8.76 | 1.33 |
| Court | `#E0C27A` | 9.25 | 10.27 | 7.95 | 6.77 | 7.59 | 10.27 | 1.37 |
| Recovery | `#B6A6E0` | 7.23 | 8.03 | 6.22 | 5.55 | 6.22 | 8.03 | 1.30 |
| Youth | `#E59BC0` | 7.43 | 8.25 | 6.39 | 5.69 | 6.41 | 8.25 | 1.31 |

### 2.3 Changes I made, and why

| # | Change | Reason |
|---|---|---|
| 1 | **Mind & Body (light):** Sage `#5E7352` becomes `#52684A`. | The old colour gave 3.99:1 as text on its 12 % tint over Sand and 4.23:1 on `surface-muted`. The new colour gives 4.75:1 on the 10 % tint over Sand. Dark `#A9C29A` is unchanged. |
| 2 | **Court (light):** Caliche Gold `#8C6A1F` becomes `#7F6019`. | The old colour gave 4.45:1 on Sand and 3.85:1 on its tint over Sand. The new colour gives 5.20:1 on Sand and 4.55:1 on the tint. Dark `#E0C27A` is unchanged. |
| 3 | **Strength (light):** the fill stays Arizona Copper `#B5532C`. A separate **text token `#9E4522`** (Copper Deep) is added. | Arizona Copper as text on Sand is 4.40:1 (fails). The brand guide already says to use Copper Deep for copper text (BRD §4). The fill passes as a graphic (4.40:1 on Sand, needs 3:1) and as a white-text background (4.95:1). |
| 4 | **Tint strength:** 12 % becomes 10 % (light) and 18 % becomes 14 % (dark). | Strength dark text on the 18 % tint was 4.22:1. At 14 % it is 4.54:1. Aqua light on the 12 % tint over Sand was 4.44:1. At 10 % it is 4.57:1. |
| 5 | **Aqua (light):** no colour change. It passes by a small margin (4.57:1). | Do not lower the tint strength below the values above, and do not make the tint stronger. |
| 6 | **Rule:** category-coloured text is allowed only on `surface`, `background` and tints over them. | `surface-muted` fails for Strength, Mind & Body and Court. |

Unchanged and passing: Cycle, Conditioning, Recovery, Youth (light); all eight dark colours.

Add these tokens to `theme.json` under `color.light.category` and `color.dark.category`: for each category id, `fill`, `text` and `tint` (the tint is computed from the fill and the host, so store only the strength 10 % / 14 %). CSS names: `--cp-cat-<id>`, `--cp-cat-<id>-text`, `--cp-cat-<id>-tint`.

### 2.4 Two warnings about look-alike colours

- **Strength looks like the primary button.** Strength uses Arizona Copper. Rule: Strength shows copper only as a 4 px stripe, a 16 px icon, and a 10 % tint. A filled copper shape with a label on a card is always a button. The solid `CategoryBadge` for Strength is allowed only on photos. The selected ring (section 4.3) is 2 px, offset 2 px from the card edge, so the stripe and the ring never touch.
- **Conditioning looks like the warning colour.** Conditioning uses Monsoon Amber, which is also `warning`. Rule: a warning always has the triangle icon and a sentence. A Conditioning badge always has the `activity` icon and the word "Conditioning". Never use the Conditioning fill for a status.

### 2.5 Category icon and name table

| Category id | Display name | Web icon | iOS symbol | Class examples |
|---|---|---|---|---|
| `strength` | Strength | custom `rib-barbell`; fallback Lucide `dumbbell` | custom symbol `cp.rib.barbell`; dev fallback `dumbbell.fill` | Rib Rack Strength, Barbell Basics |
| `cycle` | Cycle | Lucide `bike` | `bicycle` | Climb Cycle, Rhythm Ride |
| `conditioning` | Conditioning | Lucide `activity` | custom `cp.conditioning`; dev fallback `figure.run` | Switchback HIIT, Canal Run Club |
| `mind-body` | Mind & Body | Lucide `flower-2` | `figure.mind.and.body` | Desert Flow Yoga, Mat Pilates |
| `aqua` | Aqua | Lucide `waves` | `figure.pool.swim` | Lap Swim, Aqua Fit |
| `court` | Court | custom `court` | custom `cp.court`; dev fallback `figure.pickleball` | Pickleball Open Play |
| `recovery` | Recovery | Lucide `heart-pulse` | `heart.text.square` | Stretch & Release, Sauna + Plunge |
| `youth` | Youth | Lucide `smile` | `face.smiling` | Kids Club, Teen Strength |

Rules:
- Ship all eight category icons as custom SF Symbols (SVG template) so the web glyph and the iOS glyph match. The names in the "dev fallback" column are suggestions. Check each one in the SF Symbols app before use. I did not verify them.
- Check each Lucide name against the installed `lucide-react` version. I did not verify them.
- Icons use a 24 px grid and a 2 px stroke with round caps (BRD §6). Custom icons use upright strokes, 60° and 90° angles.
- Category order in every filter, legend and table: Strength, Cycle, Conditioning, Mind & Body, Aqua, Court, Recovery, Youth.

### 2.6 Busyness, capacity and status tone colours

Rib tones use theme roles. All pass 3:1 as graphics on `surface` and `background` in both modes.

| Tone | Role | Light on white / Sand | Dark on surface / page |
|---|---|---|---|
| neutral | `text` | 17.19 / 15.28 | 13.58 / 15.08 |
| success | `success` | 5.99 / 5.32 | 8.09 / 8.98 |
| warning | `warning` | 6.33 / 5.63 | 8.49 / 9.42 |
| danger | `danger` | 6.57 / 5.84 | 6.66 / 7.39 |
| brand | `secondary` (Saguaro Night; dark: Sand) | 12.0+ | 12.0+ |
| category | the category fill | table 2.2 | table 2.2 |
| empty rib outline | `border-strong` | 3.92 / 3.48 | 3.76 / 4.18 |

Status chip text: `warning` on `warning-subtle` 5.38:1; `success` on `success-subtle` 5.10:1; `danger` on `danger-subtle` 5.41:1. Dark: 7.07, 6.69, 6.21.

Text on a photo band: Saguaro Night at 80 % over a pure white photo gives `#495C53`. Sand text on it is 6.35:1 and white text is 7.15:1. This is the worst case. Use the 80 % band for every text strip on a photo.

## 3. Shared data model

One model for web and iOS. TypeScript-like. iOS uses matching `Codable` structs with the same field names. Dates are ISO 8601 strings with an offset. Arizona does not use daylight saving time, so the offset is always `-07:00` for the clubs.

```ts
// ----- primitives -----
type ISODateTime = string;            // "2026-10-28T06:00:00-07:00"
type ISODate = string;                // "2026-10-28"
type LocalTime = string;              // "04:30" (24 h, club local time)
type Minutes = number;
type Usd = number;                    // whole dollars unless noted: 79
type Level = 1 | 2 | 3 | 4 | 5;       // five-rib scale
type RibCount = 0 | 1 | 2 | 3 | 4 | 5;

type ClubId = 'mesa-dobson' | 'mesa-red-mountain' | 'mesa-downtown' | 'gilbert-val-vista' | 'gilbert-heritage';
type CategoryId = 'strength' | 'cycle' | 'conditioning' | 'mind-body' | 'aqua' | 'court' | 'recovery' | 'youth';
type PlanId = 'trailhead' | 'ridge' | 'summit';

// Optional. Not in 00-foundation.md; components render it only when present.
interface Rating { average: number; count: number }   // 4.9, 120

interface Photo {
  src: string;                        // CDN URL
  alt: string;                        // describes the scene, not "photo of club"
  width: number; height: number;
  focal: { x: number; y: number };    // 0..1, keeps faces and the subject in crop
}

// ----- Club -----
interface Club {
  id: ClubId;
  slug: string;                       // "gilbert-val-vista"
  city: 'Mesa' | 'Gilbert';
  neighborhood: string;               // "Val Vista"
  displayName: string;                // "Gilbert – Val Vista" (en dash with spaces)
  shortName: string;                  // "Val Vista" (map pin, tight rows)
  ribIndex: 1 | 2 | 3 | 4 | 5;        // the club's rib in the Rib Peak (1 = Mesa – Dobson)
  type: 'flagship' | 'full' | 'studio';
  squareFeet: number;                 // 60000
  address: { line1: string; cityStateLine: string; crossStreets: string };
  geo: { lat: number; lng: number };
  timeZone: 'America/Phoenix';
  phone?: string;
  photo: Photo;                       // 4:3 master
  gallery: Photo[];
  personalityLine: string;            // from FND §2
  amenities: AmenityId[];             // ordered by importance, signature first
  hours: ClubHours;
  parkingNote?: string;
  busyness: Busyness;                 // live
  popularTimes: PopularTimes;         // typical, per weekday
  rating?: Rating;                    // optional, see note below
  flags: { pool: boolean; courts: boolean; kidsClub: boolean; recovery: boolean };
}

interface ClubHours {
  weekly: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', { open: LocalTime; close: LocalTime } | null>;
  staffed: { open: LocalTime; close: LocalTime };                 // 06:00-20:00
  kidsClub?: { days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat')[]; blocks: { open: LocalTime; close: LocalTime }[] };
  poolCloseOffsetMin?: 30;            // pools close 30 min before the club
  holidays: { date: ISODate; label: string; open?: LocalTime; close?: LocalTime }[];
}

type AmenityGroup = 'pool' | 'courts' | 'cycle' | 'kids-club' | 'recovery' | 'classes' | 'strength' | 'extras';
type AmenityId =
  | 'lap-pool' | 'therapy-pool' | 'outdoor-pool' | 'splash-pad' | 'swim-school'
  | 'pickleball' | 'tennis' | 'basketball' | 'turf-lane'
  | 'studios' | 'cycle-studio' | 'strength-floor' | 'lifting-platforms'
  | 'recovery-suite' | 'recovery-lounge' | 'kids-club' | 'cafe' | 'rooftop-deck' | 'cardio-deck';
interface Amenity { id: AmenityId; group: AmenityGroup; label: string; detail?: string; icon: string } // detail: "8 lanes", "4 courts"

// ----- Busyness (live) and typical -----
interface Busyness {
  level: Level | null;                // null when closed or stale
  label: 'Quiet' | 'Light' | 'Steady' | 'Busy' | 'Packed' | null;
  asOf: ISODateTime;                  // updated every 5 min
  stale: boolean;                     // true if asOf is older than 15 min
  closed: boolean;
  opensAt?: ISODateTime;
  vsTypical?: 'quieter' | 'usual' | 'busier';
  checkIns?: number;                  // member surfaces only; never on marketing
}
interface PopularTimes {
  // per weekday, one Level per open hour; key = hour 4..21 (24 h)
  byDay: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', { hour: number; level: Level }[]>;
  quietestWindow?: Partial<Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', { from: LocalTime; to: LocalTime }>>;
}

// ----- Class (type) and Session -----
interface ClassType {                 // "Climb Cycle" as a product
  id: string;
  name: string;
  categoryId: CategoryId;
  description: string;                // ≤ 60 words
  photo: Photo;
  intensityRange: [Level, Level];
  durationOptionsMin: Minutes[];      // [45]
  firstTimerFriendly: boolean;
  equipment: string[];                // ["Cycling shoes (rental free)"]
  ageNote?: string;                   // "Ages 13 to 17"; shown as an age chip
  rating?: Rating;                    // optional
}

interface ClassSession {
  id: string;
  classTypeId: string;
  name: string;                       // copied from ClassType for fast render
  categoryId: CategoryId;
  clubId: ClubId;
  room: string;                       // "Cycle studio", "Studio B"
  startsAt: ISODateTime;
  durationMin: Minutes;
  instructorId: string;
  substituteForId?: string;           // set when a sub teaches
  intensity: Level;
  capacity: number;
  spotsLeft: number;                  // 0..capacity
  capacityUnit: { one: string; other: string }; // {one:'bike',other:'bikes'} | {one:'spot',other:'spots'}
  waitlistCount: number;
  firstTimerFriendly: boolean;
  equipment: string[];
  photo?: Photo;                      // falls back to ClassType.photo
  status: 'scheduled' | 'cancelled' | 'in-progress' | 'ended';
  bookingWindow: {
    opensAt: ISODateTime;             // startsAt minus the member's window (7 d, Summit 9 d)
    lateCancelCutoffAt: ISODateTime;  // startsAt minus 2 h
    waitlistClosesAt: ISODateTime;    // startsAt minus 1 h
  };
}

// ----- Instructor / coach -----
interface Instructor {
  id: string;
  name: string;                       // "Dana Torres"
  shortName: string;                  // "Dana T."
  portrait: Photo;                    // 4:5 master; avatar is a square crop on `focal`
  credentialLine: string;             // "Cycle coach · RYT-200"
  favoriteClass?: string;
  bio: string;                        // ≤ 25 words
  clubIds: ClubId[];
  categories: CategoryId[];
  isPersonalTrainer: boolean;
  rating?: Rating;                    // optional
  ptPacks?: (4 | 8 | 12)[];
}

// ----- Booking (class) -----
type BookingState =
  | 'booked' | 'waitlisted' | 'promoted-hold'     // promoted-hold = spot opened, 30-min hold
  | 'attended' | 'cancelled' | 'late-cancelled' | 'no-show';
interface Booking {
  id: string;
  sessionId: string;
  memberId: string;
  state: BookingState;
  waitlistPosition?: number;
  holdExpiresAt?: ISODateTime;
  createdAt: ISODateTime;
  usedGuestPass?: boolean;
}

// ----- Reservation (court, lane, kids club, PT, recovery) -----
type ResourceKind = 'court' | 'lap-lane' | 'kids-club' | 'pt' | 'recovery-slot';
interface ReservationResource {
  id: string;
  clubId: ClubId;
  kind: ResourceKind;
  name: string;                       // "Court 3", "Lane 5", "Kids Club", "Coach Dana T."
  sport?: 'pickleball' | 'tennis' | 'basketball';
  slotStepMin: Minutes;               // court 30, lane 45, kids 120 (Decision, see part 2 section 11)
  durationOptionsMin: Minutes[];      // court [60, 90], lane [45], kids [120]
  bookDaysAhead: number;              // court 3
}
interface Slot {
  resourceId: string;
  startsAt: ISODateTime;
  durationMin: Minutes;
  status: 'open' | 'taken' | 'mine' | 'closed' | 'past';
  spotsLeft?: number;                 // kids club blocks only
}
interface Reservation {
  id: string;
  resourceId: string;
  clubId: ClubId;
  kind: ResourceKind;
  memberId: string;
  forMemberId?: string;               // the child, for kids club
  startsAt: ISODateTime;
  durationMin: Minutes;
  partySize?: number;
  state: 'reserved' | 'checked-in' | 'completed' | 'cancelled' | 'late-cancelled';
}

// ----- Plan -----
interface Plan {
  id: PlanId;
  name: 'Trailhead' | 'Ridge' | 'Summit';
  priceMonthlyUsd: 54 | 79 | 129;
  popular: boolean;                   // Ridge
  bestFor: string;                    // one line
  headlineFeatures: string[];         // ≤ 6
  access: {
    clubs: 'home' | 'all';
    clubCount: 1 | 5;
    classesAndPools: true;
    courts: boolean;                  // false for Trailhead
    recoverySuite: boolean;           // Summit
    bookingDaysAhead: 7 | 9;
    courtBookDaysAhead?: 3;
    guestPassesPerMonth: 0 | 1 | 4;
    towelService: boolean;
    ptIntroPerQuarter: 0 | 1;
  };
}
interface PlanAddOns {
  familyAdultUsd: 39; familyChildUsd: 19; childAges: [3, 17];
  dayPassUsd: 20;
  enrollmentFeeUsd: 49; enrollmentPromo?: { name: 'Fall climb'; feeUsd: 0 };
  annualFacilityFeeUsd: 49; annualFacilityFeeMonth: 'March';
  freezeUsdPerMonth: 10; freezeMonths: [1, 3]; noticeDays: 30;
}

// ----- Member -----
interface Member {
  id: string;
  firstName: string; lastName: string;
  avatar?: Photo;
  memberNumber: string;               // "0042 1187"
  planId: PlanId;
  homeClubId: ClubId;
  role: 'primary' | 'adult' | 'teen' | 'child';
  guardianId?: string;
  status: 'active' | 'trial' | 'frozen' | 'past-due';
  freezeUntil?: ISODate;
  strikes: { count: number; windowStartsAt?: ISODateTime; pausedUntil?: ISODateTime }; // 3 in 30 days = 3-day pause
  guestPassesLeft: number;
  weeklyGoal: { visitsPerWeek: 1 | 2 | 3 | 4 | 5 };
}

// ----- Visit -----
interface Visit {
  id: string;
  memberId: string;
  clubId: ClubId;
  checkedInAt: ISODateTime;
  method: 'qr' | 'wallet' | 'front-desk';
  sessionId?: string;
}
interface WeekProgress {              // derived from Visit[]
  weekStart: ISODate;
  visitDays: ISODate[];
  goal: 1 | 2 | 3 | 4 | 5;
  done: number;
  streakWeeks: number;                // consecutive weeks with done >= goal
}

// ----- Check-in pass -----
interface CheckInPass {
  memberId: string;
  memberNumber: string;
  planName: Plan['name'];
  homeClubId: ClubId;
  qrPayload: string;                  // short-lived token, rendered as a QR code
  issuedAt: ISODateTime;
  expiresAt: ISODateTime;
  state: 'valid' | 'frozen' | 'past-due' | 'trial' | 'guest';
  walletPassUrl?: string;             // signed .pkpass (iOS)
}

// ----- Promo -----
interface Promo { id: string; kind: 'top-bar'|'band'|'card'; text: string; cta: { label: string; href: string }; endsOn?: ISODate; dismissible: boolean }
```

Notes:
- Ratings are optional. `00-foundation.md` has no rating data, so `rating` is absent for now and no component shows a rating line, a star or an empty placeholder. If the coordinator adds ratings to the foundation, the shared `RatingLine` (section 4.8) appears on `ClassCard`, `ClassDetailPanel`, `CoachCard`, `ClubCard` and `ClubHero` without other changes (mobbin-standard-pass §2 rule 41; ClassPass rows and class grids, mobbin-standard-pass §2 rule 8). A "Reviews" tab on the marketing club page (MKT §3 r10) is the marketing spec's decision.
- `capacityUnit` carries the noun. Cycle uses bikes. Other classes use spots. Lap Swim uses lanes. Courts use courts.
- Sample people in examples below ("Dana T.") are invented example data for this spec only.

## 4. Shared rules for every component

### 4.1 Tokens

| Need | Light | Dark | Role |
|---|---|---|---|
| Page | Sand `#F6F1E8` | `#121A16` | `background` |
| Card, row, popover | `#FFFFFF` | `#1A241F` | `surface` |
| Hover fill, skeleton, disabled fill | `#EFE7DA` | `#24302A` | `surface-muted` |
| Selected row fill | `#F6DFD3` | `#3A2418` | `primary-subtle` |
| Text | `#1D1B17` | `#F2ECE2` | `text` |
| Secondary text | `#6B6457` | `#A69F92` | `text-muted` |
| Divider, card edge | `#DDD2C1` | `#34423A` | `border` |
| Control edge, empty rib | `#8C7F6B` | `#6E7F74` | `border-strong` |
| Hover edge | `#4A443A` | `#CFC8BB` | `border-hover` |
| Action | `#B5532C` / white label | `#E0804F` / `#121A16` label | `primary` |
| Link and copper text | `#9E4522` | `#EE9A6E` | `link` |
| Focus ring | `#2E6DB4` | `#7FB0E8` | `focus` (Monsoon Sky) |

**Night surface.** Some things always have a Saguaro Night background with Sand text, in both modes: the highlighted `PlanCard`, the `CheckInPass` card, the `PromoBand`, and text bands on photos. Token alias `night-surface`: background = `secondary` in light mode and `secondary-foreground` in dark mode (`#1C3328` both times). Text = `secondary-foreground` in light mode and `secondary` in dark mode (Sand-like both times). Actions on a night surface use Dawn Copper `#E0804F` with a `#121A16` label (6.22:1). Sand on Saguaro Night is 12.0:1. Dawn Copper on Saguaro Night is 4.74:1.

### 4.2 Shape and type

| Element | Radius | Type |
|---|---|---|
| Card | M 14 | Title: Archivo 600 `l` (24/30) for feature and card variants; Inter 600 `m` (16/24) for rows and compact |
| Photo inside a card | M 14 on the top corners only (clip to the card) | — |
| Sheet, large panel | L 20 | — |
| Hero panel | XL 28 | `xl` or `xxl` Archivo 800 |
| Button, input, tab | S 10 | `button` (Inter 600 14/20) |
| Static badge or tag (does not respond to taps) | XS 4 | `xs` Inter 600 12/16 |
| Interactive chip (responds to taps) | full | `s` Inter 500 14/20 |
| Avatar | full | initials: Archivo 600 |

Shape tells the user if a thing responds: **rectangles with a 4 px corner are labels; pills are controls.**

Number rules: times, durations, prices, counts and capacities use the `data` role (Archivo, tabular by default) on web. On iOS use SF Pro with `.monospacedDigit()`. Use Archivo on iOS only for big numbers (the `data-l` role) and large titles (APL §4).

iOS mapping of type steps: `m` → 17 pt Body; `s` → 15 pt Subheadline; `xs` → 13 pt Footnote; `xxs` → 11 pt Caption 2; `l` → 22 pt Title 2; `xl` → 28 pt Title 1; `xxl` → 34 pt Large Title. Scale custom fonts with `relativeTo:` and use `@ScaledMetric` for icon and spacing sizes. Do not clamp Dynamic Type unless this spec says so (APL §6).

### 4.3 State matrix (applies to every component unless the component says otherwise)

| State | Web | iOS |
|---|---|---|
| default | Tokens in 4.1. | Same roles through the asset catalog colours (light, dark, increased contrast). |
| hover | Card: edge goes to `border-hover`. Row: fill goes to `surface-muted`. No shadow change. 150 ms, `cubic-bezier(0.2,0.8,0.2,1)`. | Not applicable (pointer on iPad uses the system hover effect). |
| focus (visible) | 2 px ring in `focus` (Monsoon Sky), offset 2 px, on the whole control. Never remove it. A ring must have 3:1 against the surface: 5.30:1 on white, 4.71:1 on Sand, 7.05:1 on dark surface. | System focus ring for Full Keyboard Access. Do not draw a custom ring. |
| pressed | Scale 0.98 (`press-scale`) and fill `surface-muted`. | `ButtonStyle` with `isPressed`: scale 0.98 and opacity 0.9. Add `.sensoryFeedback(.selection)` for chip toggles. |
| selected | 2 px `primary` outline inset, plus a check icon or a "Selected" word. Rows also use `primary-subtle` fill. `aria-selected` / `aria-current` / `aria-pressed`. | Checkmark row, or 2 px tint outline plus the `.isSelected` trait. |
| disabled | `text-muted` text on `surface-muted`. Use `aria-disabled="true"` (not the `disabled` attribute) when a reason must be readable. Keep the reason visible as text. | `.disabled(true)` plus a visible reason line. |
| loading (skeleton) | `skeleton` (shadcn) blocks in `surface-muted`, same shapes and sizes as the real parts. Static fill when Reduce Motion is on. Pulse 1.2 s otherwise. A button that waits shows a spinner and a word, never a blank. | `.redacted(reason: .placeholder)`. A waiting button shows `ProgressView` and a word. |
| error | `danger` text with the triangle icon and a sentence that says what to do. Never colour only. | Same text. `Label` with `exclamationmark.triangle`. |
| empty | Use `EmptyState` (Part 2 section 10) with a next action. | `ContentUnavailableView`. |

Motion: use the theme durations (150 ms and 300 ms). Do not animate when Reduce Motion is on: replace movement with a fade or no change (APL §6).

### 4.4 Photo rules

- Club photos: 4:3 master. Class photos: 16:9 master. Instructor portraits: 4:5 master. Real photos only (MKT §3 r45).
- Every photo has meaningful alt text. Example: "Cycle studio at Gilbert – Val Vista at sunrise, riders mid-climb". Decorative repeats get empty alt.
- Text over a photo sits on a solid Saguaro Night band at 80 % opacity (section 2.6). No gradients. No text over faces.
- If a photo fails to load, show the small-cut Rib Peak symbol in `text-muted` on `surface-muted`. The text content stays.
- Dark mode: do not invert or tint photos.

### 4.5 Accessibility baseline

- All targets are at least 44 × 44 px/pt. A visually smaller control gets a larger hit area.
- Text 4.5:1, graphics 3:1, in light, dark and increased contrast.
- Every rib meter has a text value. Every category colour has an icon and a name.
- Each card is one link or one button for the whole card ("stretched link"), plus separate inner buttons. Inner buttons stay above the stretched link.
- Live values (spots left, busyness, waitlist position) sit in a polite live region, or use the `.updatesFrequently` trait on iOS. Announce only meaningful changes (a level change, a state change), not every 5-minute refresh.
- Dynamic Type: support to AX5. At accessibility sizes, rows become stacked (see each component). Do not truncate the class name or the time (APL §6).
- Reduce Motion, Reduce Transparency and Increase Contrast are supported.

### 4.6 Web build base

- Foundation: Graphical (Base UI) components first. shadcn/ui second. The app already has shadcn files in `components/ui/` for `accordion`, `badge`, `button`, `card`, `input`, `label`, `separator`, `skeleton` and `table`. Replace the ones Graphical covers (LIB §2).
- Graphical has no card, badge, table, skeleton, chart, calendar, carousel, empty, or aspect-ratio component. Use the shadcn names `card`, `badge`, `table`, `skeleton`, `chart`, `calendar`, `carousel`, `empty`, `aspect-ratio` (LIB §2, §4).
- Package each custom component as a React component with a `variant` prop and slots. Style with theme tokens only. No hex in app code (LIB §5).
- Layout uses container queries so a component adapts to its own width, not the window.

### 4.7 Shared formatters (one copy of the logic, used by all surfaces)

| Formatter | Output | Rule |
|---|---|---|
| `formatTime(iso)` | `6:00 a.m.` | Numerals. Lowercase with periods. No leading zero. `12:00 p.m.` for noon. |
| `formatTimeRange(iso, min)` | `6:00–6:45 a.m.` | Share the period when both ends match. En dash, no spaces. |
| `formatDuration(min)` | `45 min`, `1 h 30 min` | Numerals. |
| `formatClub(club)` | `Gilbert – Val Vista` | En dash with spaces. Use `shortName` only in tight spots. |
| `formatSpotsLeft(session)` | `4 bikes left`, `1 spot left`, `Full` | Uses `capacityUnit`. |
| `formatDay(iso)` | `Today`, `Tomorrow`, `Wed, Oct 28` | |
| `formatPrice(usd)` | `$79/mo` | Always with the unit (WEB §5 #2). |
| `intensityLabel(level)` | Easy, Light, Moderate, Hard, All-out | FND §3. |
| `busynessLabel(level)` | Quiet, Light, Steady, Busy, Packed | FND §2. |

On iOS, `Date.formatted` gives "6:00 AM". Use a custom `FormatStyle` to produce "6:00 a.m." so web and iOS match.

### 4.8 `RatingLine` (optional shared part)

Renders only when `rating` exists. Format: "4.9 ★ (120)" in `s` Inter, tabular figures; the star is one Lucide `star` icon at 16 px in `text` colour (not copper, not five stars). The word line "Excellent" is not used. Accessible text: "Rated 4.9 out of 5 from 120 reviews." Place it directly under the title (mobbin-standard-pass §2 rule 41). Do not put a rating next to a `RibMeter`; ribs never show ratings.

## 5. Primitives

### 5.1 `RibMeter` (base five-rib meter)

**Purpose and question.** It draws five upright ribs, some filled. Every other meter in this spec is built on it. The member question depends on the wrapper: "How busy is it?", "How hard is it?", "How full is it?", "How far am I?".

**Anatomy.** Five ribs left to right. Ribs follow the Rib Peak. Each rib is an upright bar with a rounded top.

| Part | Spec |
|---|---|
| Rib (filled) | Solid tone colour. |
| Rib (empty) | Transparent fill. 1.5 px outline in `border-strong`. The shape (solid or outline) carries the value. Colour does not. |
| Profile `peak` (default) | Heights 60 %, 80 %, 100 %, 80 %, 60 % of the glyph height. The summit rib is in the centre. |
| Profile `flat` | Five equal heights. Matches the small-cut symbol. Use at `sm`. |
| Fill order | Left to right. A level of 3 fills ribs 1, 2 and 3. |

| Size | Rib width | Gap | Glyph height | Glyph width | Use |
|---|---|---|---|---|---|
| `sm` | 4 | 2 | 16 | 28 | Rows, pins, chips. Profile `flat`. |
| `md` | 6 | 3 | 24 | 42 | Cards. |
| `lg` | 8 | 4 | 32 | 56 | Detail panels. |
| `xl` | 12 | 6 | 48 | 84 | Heroes, pass, Today screen. |

The 2 px and 3 px gaps are glyph geometry, not layout spacing. Layout around the glyph uses the 4/8/12/16 scale. The rib corner radius is half the rib width, with a maximum of 4 (XS).

**Variants.** `tone`: `neutral`, `success`, `warning`, `danger`, `brand`, `category`. `size`. `profile`. `decorative` (hides the meter from assistive tech when text beside it says the same thing).

**States.** Default only. It is not interactive. Loading: five empty outline ribs with a slow pulse (static under Reduce Motion). Unknown value: five dashed outlines and the text "Unavailable". Animation: when the value changes, new ribs fill left to right in 150 ms with a 40 ms stagger. No animation under Reduce Motion.

**Light and dark tokens.** See section 2.6. Filled rib = tone colour. Empty rib outline = `border-strong`.

**Data contract.**

```ts
interface RibMeterProps {
  value: RibCount;                    // 0..5, integer
  tone: 'neutral'|'success'|'warning'|'danger'|'brand'|'category';
  categoryId?: CategoryId;            // required when tone = 'category'
  size?: 'sm'|'md'|'lg'|'xl';         // default 'md'
  profile?: 'peak'|'flat';            // default 'peak' (sm forces 'flat')
  label: string;                      // the subject, "Busyness"
  valueText: string;                  // "Busy, 4 of 5"
  decorative?: boolean;               // true when adjacent text repeats valueText
}
```

**Content rules.** The meter never appears without a word or number nearby, or an accessible name. Never use a number of ribs other than five. Never use ribs for anything that is not busyness, intensity, capacity, club access or progress. Never animate a pulse on a live meter.

**Accessibility.** Web: `role="meter"`, `aria-valuemin="0"`, `aria-valuemax="5"`, `aria-valuenow`, `aria-valuetext="Busy, 4 of 5"`, `aria-label="Busyness"`. When `decorative`, use `aria-hidden="true"`. VoiceOver says "Busyness, Busy, 4 of 5". Not focusable. Dynamic Type: the glyph grows with `@ScaledMetric` up to 1.5 × the base size. At AX sizes the text label stacks under the glyph.

**Web build.** Graphical `Meter` supplies the semantics (root with value, min, max). Replace its track and indicator with five `span` ribs drawn with CSS. The Graphical Meter part names are unverified against Base UI docs (LIB §1 note, source note 5). Check before build. Custom parts: rib geometry, tones, fill animation.

**iOS build.** `Gauge(value:in:)` with a custom `GaugeStyle` (`RibGaugeStyle`) that draws five `RoundedRectangle` ribs. `Gauge` and `GaugeStyle` are not in `apple-ios-guidelines.md`. Check the API in Xcode. Add `.accessibilityLabel("Busyness")` and `.accessibilityValue("Busy, 4 of 5")`. Use `@ScaledMetric(relativeTo: .caption)` for the rib size. Colours come from asset-catalog roles (`BrandStatusBusy` and so on). Stays native: Gauge semantics, accessibility value, Dynamic Type machinery.

**Research basis.** FND §6 principle 5 (five-rib system). BRD §6 (rib motif). THM Components covered row "Rib meter" (`.cp-ribs`) and LIB §4 (capacity meter on Meter/Progress). APL §4 and §6 (do not use colour alone for busyness; pair colour with label and shape). APL §6 VoiceOver (value, not colour).

### 5.2 `IntensityRibs`

**Purpose and question.** "How hard is this class?" It shows intensity 1 to 5 for a class.

**Anatomy.** `RibMeter` + word. Layout: glyph, 8 px gap, text "Hard · 4 of 5" in `xs` Inter 500 (`s` in the card variant).

**Variants.** `ribs-only` (rows below 640 px, the glyph carries the value and the accessible name has the word), `with-label` (default for cards and detail), `range` (class types: "Light to moderate", ribs show two shades: solid up to the low value, a lighter fill up to the high value; used by `ClassPhotoTile`).

**Tone.** `category` by default, so the ribs match the class stripe. Use `neutral` on a photo band.

**Level words.** 1 Easy, 2 Light, 3 Moderate, 4 Hard, 5 All-out (FND §3).

**States.** Default only. Hover on web shows a `Tooltip` with the scale: "Intensity: 1 Easy, 2 Light, 3 Moderate, 4 Hard, 5 All-out". Loading: five empty ribs.

**Data contract.**

```ts
interface IntensityRibsProps {
  level: Level | [Level, Level];      // tuple = range
  categoryId: CategoryId;
  variant?: 'ribs-only'|'with-label'; // default 'with-label'
  size?: 'sm'|'md'|'lg';
  onPhotoBand?: boolean;              // uses neutral tone with Sand ribs
}
```

**Content rules.** Use the five words only. Write "Intensity" in the accessible name, not in the visible text. Never write "level 4". A Recovery or Mind & Body class is not "easy" by default. Use the data.

**Accessibility.** Accessible name: "Intensity, Hard, 4 of 5". Range: "Intensity, Light to moderate, 2 to 3 of 5". Use `decorative` when the word is visible.

**Web build.** Wrapper over `RibMeter`. Graphical `Tooltip` for the scale. No other parts.

**iOS build.** Wrapper over the `RibGaugeStyle` gauge. Use `Label`-like `HStack` with `Text`. Accessible value as above. No tooltip on iOS; the scale appears in the class detail under "Intensity".

**Research basis.** FND §3 (intensity scale, ribs filled from the left). MKT §3 r14 (class card shows intensity label). WEB §3.4 notes "intensity indicator: not observed", so this is a new pattern with no Mobbin reference. Decision: pair ribs with a word.

### 5.3 `BusynessMeter`

**Purpose and question.** "How busy is the club right now, and is that normal?"

**Anatomy.** Left to right: `RibMeter` (tone by level), the level word, optional "vs typical" text, optional "Updated 3 min ago".

| Level | Word | Tone |
|---|---|---|
| 1 | Quiet | success |
| 2 | Light | success |
| 3 | Steady | neutral |
| 4 | Busy | warning |
| 5 | Packed | danger |

**Variants.**

| Variant | Parts | Size | Use |
|---|---|---|---|
| `compact` | Ribs only (`sm`), word in accessible name | 28 × 16 | `ClubPin`, tight rows |
| `inline` | Ribs `sm` + word, `xs`/`s` | 16 high | `ClubCard` list-row and compact |
| `card` | Ribs `md` + "Steady now" + "Usually busier at 5:30 p.m." | 24 high | `ClubCard` feature, club page |
| `hero` | Ribs `xl` + word in Archivo `data-l` + vs-typical line + "Updated" | 48 high | `ClubHero`, Today screen |

**States.**
- Live: as above.
- Stale (`asOf` older than 15 minutes): hide ribs. Show five dashed outlines and "Busyness unavailable. Last update 22 min ago."
- Closed: hide ribs. Show "Closed · opens 4:30 a.m."
- Loading: skeleton of the glyph and one text line.
- Error: same as stale, with "Try again" on `hero` only.

**vs typical.** `quieter`: "Quieter than usual". `usual`: "About usual". `busier`: "Busier than usual". Plain words only. No up or down arrows.

**Data contract.**

```ts
interface BusynessMeterProps {
  busyness: Busyness;
  variant: 'compact'|'inline'|'card'|'hero';
  showUpdated?: boolean;              // member surfaces default true; marketing false
  now?: ISODateTime;                  // injected for tests
}
```

**Content rules.** Examples: "Steady now", "Busy now · Busier than usual", "Quiet now · Quietest hour of the day". Marketing says "Right now: Steady". Never show a head-count on marketing. Member surfaces may show `checkIns` in the `hero` variant only, as "38 people in the club" (Proposal; ops must confirm they want to publish counts).

**Accessibility.** Name: "Busyness". Value: "Steady, 3 of 5. Updated 3 minutes ago." Changes of level announce politely: "Busyness is now Busy". Do not announce when the level is unchanged. Colour is never the only signal: the word and the number of filled ribs carry the level (APL §6).

**Web build.** `RibMeter` (Graphical `Meter` semantics) + text. Live region: a visually hidden `div aria-live="polite"` updated only when the level changes. Data refresh: poll every 5 min, or subscribe. Marketing may cache for 5 min at the edge.

**iOS build.** `Gauge` with `RibGaugeStyle` + `Text`. `.accessibilityElement(children: .combine)`, `.accessibilityLabel("Club busyness")`, `.accessibilityValue("Busy, 4 of 5")`, `.accessibilityAddTraits(.updatesFrequently)` (APL §6). A widget (medium) shows `card`. Do not start a Live Activity for busyness; it changes too often (APL §5).

**Research basis.** FND §2 (live busyness, five levels, five-minute updates). APL §4, §6 (label plus shape; VoiceOver label "Club busyness" with value). APL §5 (no Live Activity for busyness; medium widget). MKT §3 r4 (status uses words and colour). GAP search 5 and mobbin-standard-pass §1 search 10 found no busyness-meter pattern, so this is a new pattern. I did not adopt mobbin-standard-pass §2 rule 58 (a YES/NO crowd prompt "in place of a busyness bar chart"); the foundation requires the chart. A member crowd-report button may be added later next to `BusynessMeter` `hero`.

### 5.4 `CapacityIndicator` ("spots left")

**Purpose and question.** "Can I get in?" It shows how many spots, bikes, lanes or courts remain for a session.

**Anatomy.** `RibMeter` (size `sm`, tone by availability) + text from `formatSpotsLeft`. Text uses the `data` role (tabular).

**Ribs filled** = `spotsLeft = 0` ? 5 : `min(4, ceil(5 × booked ÷ capacity))`. So five ribs always means full. Four ribs means "nearly full but not full".

| Condition | Tone | Text |
|---|---|---|
| `spotsLeft` ≥ 6 | success | "12 spots left" |
| 1 ≤ `spotsLeft` ≤ 5 | warning | "4 bikes left" (low) |
| `spotsLeft` = 0 and waitlist open | neutral | "Full · Waitlist 3" |
| `spotsLeft` = 0 and waitlist closed | neutral | "Full" |
| class cancelled | none | "Cancelled" |

**Variants.**

| Variant | Parts | Use |
|---|---|---|
| `ribs` | Ribs `sm` + text | Schedule rows, cards (app) |
| `text` | Text only, or text on a `warning-subtle` chip when low | Marketing, compact widget |
| `badge-on-photo` | Chip in a corner of a photo: `surface` fill, warning icon, "4 left" | `ClassCard` card and featured |
| `large` | Number in `data-l`, noun under it in `s` | `ClassDetailPanel` |

**Surface rule (resolves a conflict in the research).** Marketing shows spots left only when five or fewer remain (MKT §3 r15). The member web app and iOS app always show the count (IOS §5 r3, IOS §6 #3). Both show "Full" in place of the count when it is zero. The "low" threshold is 5 on every surface, so the emphasis is the same (the web research says "fewer than five", MKT says "five or fewer"; I use five or fewer).

**States.** Default. Low (warning tone). Full. Loading (skeleton of one text line). Error: "Spots unavailable" with the triangle icon; the booking button is disabled with the reason "We could not check spots. Try again."

**Data contract.**

```ts
interface CapacityIndicatorProps {
  capacity: number; spotsLeft: number; waitlistCount: number;
  waitlistOpen: boolean;
  unit: { one: string; other: string };
  variant: 'ribs'|'text'|'badge-on-photo'|'large';
  status?: ClassSession['status'];
}
```

**Content rules.** Examples: "4 bikes left", "1 spot left", "Full · Waitlist 3", "12 spots left". Use the noun from `capacityUnit`. Never write "Hurry", "Selling fast" or "Almost gone". Do not use red for "low" (WEB §5 #9). Red is for errors.

**Accessibility.** Name: "Spots". Value: "4 bikes left of 20". On a card, the whole card name includes it. Low-spots changes announce politely only while the user has the detail panel open: "3 bikes left".

**Web build.** `RibMeter` + shadcn `badge` (local `.cp-badge`) for the chip. Live region as in `BusynessMeter`. Custom parts: the ribs rule above.

**iOS build.** `Gauge` + `Text` in a `Label`-style `HStack`. For a plain List row at AX sizes, drop the gauge and show only the text. Use `.monospacedDigit()`.

**Research basis.** MKT §3 r15 (show only at five or fewer). WEB §4 r9 (seats-left badge on photo), WEB §5 #9 (no red for good news; I extend this to "no red for low spots"). IOS §5 r2–r3 (trailing edge, "Full" in place of the number), IOS §6 #3. LIB §4 (capacity meter on Meter/Progress). FND §3 (spots left).

### 5.5 `CategoryBadge`

**Purpose and question.** "What kind of class is this?" It names the category with its icon and colour.

**Anatomy.** Icon (16 px in `md`, 12 px in `sm`), 4 px gap, label. Height 24 (`md`) or 20 (`sm`). Horizontal padding 8. Radius XS 4. Label: `xs` Inter 600 12/16, +0.01em.

| Variant | Fill | Icon | Label | Use |
|---|---|---|---|---|
| `tint` (default) | 10 % category tint (14 % dark) | category fill | category text token | On cards and rows |
| `solid` | category fill | white (light) / `#121A16` (dark) | white (light) / `#121A16` (dark) | On photos only |
| `icon-disc` | category tint circle, 40 px | category fill, 24 px | none (name in accessible name) | `ClassCard` compact, widgets, `ClubPin` filters |
| `stripe` | category fill, 4 px wide, full height | none | none | Left edge of rows and cards (not alone: the badge or icon disc must be on the same card) |

Contrast: see section 2.2. White on the light solid fill is at least 4.95:1. `#121A16` on the dark solid fill is at least 6.22:1.

**States.** Static. It does not respond to taps (radius XS shows this). When used as a filter, use `AmenityChip`-style interactive chips with the category icon (`ScheduleFilters`). Loading: a 72 × 24 block.

**Data contract.**

```ts
interface CategoryBadgeProps {
  categoryId: CategoryId;
  variant?: 'tint'|'solid'|'icon-disc'|'stripe';
  size?: 'sm'|'md';
}
```

**Content rules.** Use the category display name from section 2.5. Do not shorten "Mind & Body". Do not write "Strength class". Do not invent a ninth category.

**Accessibility.** Text is real text. The icon is `aria-hidden`. `icon-disc` has `aria-label="Cycle"`. The stripe is `aria-hidden`.

**Web build.** shadcn `badge` (local `.cp-badge` is Inter 600 12/16) restyled with the category tokens. Icons from Lucide plus the two custom icons. Graphical has no badge (LIB §2).

**iOS build.** A `Label` with a custom `LabelStyle`, in a `Capsule`-free `RoundedRectangle(cornerRadius: 4)` background. Colour assets `CategoryCycle` etc. with light, dark and increased-contrast variants. Name colours by role, not hue (APL §4). Stays native: `Label`, SF Symbol rendering.

**Research basis.** FND §3 (category never colour alone: icon and name). WEB §3.4 and WEB §4 r35 (coloured left stripe per class type, from Calendly). MKT §3 r43 (contrast). IOS §4.3 notes "class-type colour not observed in schedule rows", so the stripe on iOS is a new pattern. APL §4 (colour assets with increased-contrast variants).

### 5.6 `AmenityChip`

**Purpose and question.** "Does this club have what I need?" (a pool, courts, a kids club).

**Anatomy.** Icon 16 px + label (`s` Inter 500 14/20). Height 32. Horizontal padding 12. Radius full. Gap 8.

| Variant | Behaviour |
|---|---|
| `info` | Static pill on a card. Fill `surface-muted`, text `text`, icon `text-muted`. Not interactive. |
| `filter` | A toggle. Hit area 44 px high. 1 px `border-strong` edge. Selected: `secondary` fill with `secondary-foreground` text and a check icon. |
| `detail` | Pill plus a second line, for the club amenity grid: "25-yd lap pool · 8 lanes". Also used as the sidebar list of related amenities next to a large amenity photo (mobbin-standard-pass §2 rule 19). |
| `unavailable` | Dashed `border-strong` edge, `text-muted` text, and a "No" prefix in the accessible name. Used in the club comparison filter so members see what a club lacks (MKT §3 r9 context, MKT §2 A3). Text still passes 4.5:1 (5.2:1 on Sand). |

**Filter set (six, MKT §3 r9).** Pool, Courts, Cycling, Kids club, Recovery, Group classes. Lucide icons: `waves`, custom `court`, `bike`, `smile`, `heart-pulse`, `calendar-days`. Each `AmenityId` rolls up to one filter group (section 3: `AmenityGroup`).

**On a `ClubCard`:** three chips, then "+4" as plain text (not a chip). Choose chips by `Club.amenities` order, signature first. Mesa – Dobson: "25-yd pool", "Pickleball + tennis", "Kids club".

**States.** `filter`: default, hover (`surface-muted` fill), focus ring, pressed, selected, disabled (zero clubs match: `aria-disabled`, "0 clubs"). Loading: 96 × 32 block.

**Data contract.**

```ts
interface AmenityChipProps {
  amenity: Amenity | { group: AmenityGroup; label: string; icon: string };
  variant: 'info'|'filter'|'detail'|'unavailable';
  selected?: boolean;
  count?: number;                     // filter: clubs that match
  onToggle?: (next: boolean) => void;
}
```

**Content rules.** Short nouns, no verbs. "Lap pool", "Kids club", "Sauna". Details in numbers: "8 lanes", "6 courts". Never "state-of-the-art".

**Accessibility.** `filter` uses `aria-pressed`. Name: "Pool, 3 clubs". `unavailable`: "No pool". Icon `aria-hidden`.

**Web build.** `info`: shadcn `badge`. `filter`: Graphical `Toggle` (control) and `ToggleGroup` (group, multiple selection) (LIB §1). `detail`: shadcn `item`. Custom parts: the roll-up from `AmenityId` to group, the unavailable style.

**iOS build.** `info`: `Label` in a `Capsule` background. `filter`: `Toggle` with a custom `ToggleStyle` in a horizontal `ScrollView`, with `.sensoryFeedback(.selection)`. 44 pt hit area with `.contentShape`. Stays native: `Toggle`, SF Symbols.

**Research basis.** MKT §3 r9 (six or fewer chips), MKT §3 r2 (three chips on a location card), MKT §2 L3 and A3 (chips with icons; unavailable greyed), MKT §4 (light grey text on white: avoid), IOS §5 r19 (filter chips above the map list).

## 6. Club components

### 6.1 `ClubCard`

**Purpose and question.** "Which club is right for me, and is it open and not too busy?" It shows one club as a rich visual object.

**Shared data.**

```ts
interface ClubCardProps {
  club: Club;
  variant: 'feature'|'compact'|'list-row'|'map-callout';
  surface: 'marketing'|'app';
  distanceMi?: number;                // hidden when no ZIP or location (MKT §3 r5)
  isHome?: boolean;                   // shows "Your club"
  selected?: boolean;
  primaryAction?: { label: string; href?: string; onPress?: () => void };
  secondaryAction?: { label: string; href?: string };
  now?: ISODateTime;
}
```

**Variants.**

| Variant | Size | Photo | Content | Use |
|---|---|---|---|---|
| `feature` | Min width 288, max 400 | 4:3, full card width | Eyebrow, name `l`, personality line, busyness `card`, three amenity chips, one filled button + one link | Marketing club grid, "Choose your club", app club list |
| `compact` | Web: 360 × 120 horizontal. iOS carousel: 280 wide, photo 280 × 160 | Web: 96 × 96 square at left. iOS: 16:9 top | Name, `OpenStatus`, busyness `inline`, distance | Home dashboards, carousels |
| `list-row` | Full width, 88 high | 96 × 72 (4:3) at left, radius S | Name `m` 600, `OpenStatus`, distance, busyness `compact`, chevron | `ClubSwitcher`, map list |
| `map-callout` | 280 wide | 280 × 140 (2:1) at the top | Name, `OpenStatus`, today's hours, busyness `inline`, two actions | Map pin popover, iOS sheet card |

**Anatomy: `feature` (ordered).**
1. Photo, 4:3, radius M on the top corners. Over the photo: `OpenStatus` chip top-left, distance chip top-right, "Your club" chip bottom-left (only for `isHome`). Chips are solid `surface` with `text`. They need no band.
2. Body, padding 16, vertical gap 8.
3. Eyebrow: "Flagship · 68,000 sq ft" (`eyebrow` role, `text-muted`).
4. Name: "Mesa – Dobson" (`l`, Archivo 600).
5. Personality line (`s`, `text-muted`): "The big one. Bring the whole family."
6. `BusynessMeter` `card`.
7. Row of three `AmenityChip` `info` and a "+4" text.
8. Actions row (padding-top 8): one filled `Button` (marketing: "Tour this club"; app: "View schedule") and one text link ("Club details").

**Wireframe: `feature`, 360 px wide (marketing).**

```
+--------------------------------------------+
| +----------------------------------------+ |
| | (o Open - until 10 p.m.)       (1.7 mi) | |
| |                                        | |
| |        PHOTO  4:3  (real club)         | |
| |                                        | |
| | (Your club)                            | |
| +----------------------------------------+ |
|  FLAGSHIP - 68,000 SQ FT                   |   eyebrow, muted
|  Mesa - Dobson                             |   l, Archivo 600
|  The big one. Bring the whole family.      |   s, muted
|                                            |
|  [###..]  Steady now                       |   BusynessMeter card
|           Usually busier at 5:30 p.m.      |
|                                            |
|  (Lap pool) (Pickleball) (Kids club) +4    |   AmenityChip x3
|                                            |
|  [ Tour this club ]    Club details >      |   1 filled + 1 link
+--------------------------------------------+
   radius M 14, 1 px border, padding 16
```

**Wireframe: `list-row` (88 high).**

```
+------------------------------------------------------+
| +--------+  Gilbert - Val Vista                      |
| | photo  |  (o) Open until 10 p.m. - 3.2 mi   [##...]|  compact ribs
| | 96x72  |  Pool - Courts - Kids club              > |
| +--------+                                           |
+------------------------------------------------------+
```

**Finder cards (marketing list beside the map).** In the `list-row` and `feature` variants on `surface="marketing"`, add the street address under the name and today's hours next to the status ("Dobson Rd & Southern Ave, Mesa · Open until 10 p.m."). A finder card always has name, address and hours (mobbin-standard-pass §2 rule 4). A club detail section that is not a card follows the order city name (largest), address, hours, one primary button (mobbin-standard-pass §2 rule 6). Hours in these cards use the two-line grouped format (Mon–Fri / Sat–Sun) from `HoursTable` (mobbin-standard-pass §2 rule 7). If `club.rating` exists, `RatingLine` sits under the name.

**States.**
- Default, hover (edge to `border-hover`), focus (ring on the whole card), pressed (scale 0.98), selected (2 px `primary` outline; used when list and map are in sync), loading (photo block, three text bars, chip bars), error (photo placeholder with the small-cut symbol).
- "Closed now": `OpenStatus` shows "Closed · opens 4:30 a.m."; `BusynessMeter` shows closed.
- `isHome`: shows "Your club" chip.
- Disabled (member plan cannot use this club): list-row only, in `ClubSwitcher`. See there.

**Light and dark.** Card `surface`, edge `border`. Photo unchanged. Chips `surface` with `text`. Dark: edge `#34423A`.

**Content rules.**
- Name format: "Mesa – Dobson". One filled button per card (MKT §3 r3).
- Marketing button "Tour this club". App button "View schedule". Map callout on iOS: primary "Directions", secondary "View club" (IOS §5 r21).
- Status text: "Open · until 10 p.m." or "Closed · opens 4:30 a.m." Word plus dot; never colour alone (MKT §3 r4).
- Distance: "1.7 mi", one decimal. Hidden until a ZIP or location is known.
- Eyebrow: type and size. Studio clubs read "Studio club · 18,000 sq ft".
- Do not show "No pool" on the card. Absence shows only in the comparison filter.

**Accessibility.** The card is one link named "Mesa – Dobson, Flagship, open until 10 p.m., busyness Steady 3 of 5, 1.7 miles". Inner buttons are separate tab stops with their own names ("Tour Mesa – Dobson"). The photo has alt text. VoiceOver custom action: "Tour this club".
Dynamic Type: at AX sizes, `list-row` stacks: photo on top (full width, 4:3), then text. `feature` is unchanged except the actions stack full width. Do not truncate the club name.

**Web build.** `card` (shadcn; local `.cp-card`), `aspect-ratio` (shadcn) for the photo, `Button` (Graphical) for the action, `AmenityChip`, `BusynessMeter`, `Skeleton` (shadcn). Link: stretched link pattern. `map-callout`: Graphical `Popover` (or `PreviewCard` for hover on desktop, LIB §1). Compact in a carousel: shadcn `carousel`.

**iOS build.** `feature` and `compact`: a `Button`/`NavigationLink` wrapping a `VStack` in a `RoundedRectangle(cornerRadius: 14)` with `Color("Surface")` background and a 1 pt `Color("Border")` stroke. No glass (APL §3). `AsyncImage` for the photo (caches by default in iOS 27). `list-row`: a `List` row with `Label`-like content; `.listRowInsets`. `map-callout`: a card inside a sheet at `.medium` detent with a grabber, plus a primary `Button` with `.buttonStyle(.borderedProminent)` and `.tint(Color("BrandAccent"))`. Archivo appears in the name only at `.title2` size via `Font.custom(_:size:relativeTo: .title2)` [unverified signature, APL §7]. Stays native: List, NavigationLink, AsyncImage, sheet.

**Research basis.** mobbin-standard-pass §2 rules 4, 6, 7 (finder cards: name, address, hours). MKT §3 r1 (4:3 photo), r2 (name, city, status, distance, three chips, one button), r3 (one filled button), r4 (status words and colour), r5 (distance format), r45 (real photos). MKT §4 (icon-heavy store cards with six actions: avoid). WEB §3.6 and WEB §4 r18 (list left, map right; selected pin callout). IOS §4.5 and IOS §5 r21 (club card, pin summary card with Directions). IOS §6 #10 (map with list).

### 6.2 `ClubHero`

**Purpose and question.** "What is this club like, is it open now, and what can I do next?" It heads a club page (marketing and app) and the iOS club detail.

**Anatomy: web, wide.**
1. Photo panel: radius XL 28, 16:9, max height 560, inset to the page grid. A row of three gallery thumbnails (96 × 72, radius S) sits under the photo's bottom-right. A "See all photos" link opens a `Dialog` with a `carousel`.
2. Text block, padding top 24:
   - `ClubRibMark` + eyebrow: five small ribs with the club's own rib filled, and "Club 4 of 5". Size 20 high.
   - H1: club name, `xxl` Archivo 800 (48/52, tracking −0.03em). On narrow screens `xl`.
   - Personality line, `m` Inter, `text-muted`.
   - Status row: `OpenStatus`, `BusynessMeter` `card`, address with a "Get directions" link, parking note.
   - Action group: filled "Tour this club", outline "Call the club" (MKT §3 r11). Marketing: sticky right-column booking card on wide screens; fixed bottom bar with the same two buttons on mobile (MKT §3 r11–r12).
3. `ClubSubnav`: Graphical `Tabs` in this order: Classes, Amenities, Hours and Map, Coaches, Reviews (MKT §3 r10). The Reviews tab is optional (the marketing spec decides, section 3 note).

**`ClubRibMark`.** Five upright ribs in the small-cut shape. The club's rib (by `ribIndex`) is filled with `secondary`; the other four are outlined in `border-strong`. It is decorative and sits only here. Never place it next to a `BusynessMeter` of the same size. Its accessible name is the eyebrow text, "Club 4 of 5".

**Anatomy: iOS.** Photo about 240 pt high (smaller than the class detail hero, which is about 40 % of the screen; IOS §5 r4 and r18), radius L 20 at the top corners when inside a card, full-bleed otherwise. Under it: title (large title, Archivo via `relativeTo: .largeTitle`), personality line, status row, then a `Picker` with `.segmented` style for About, Classes, Hours, Coaches (four items; six or fewer, IOS §5 r17). A sticky bottom bar has "Tour this club" (primary) and a "Directions" icon button.

**Variants.** `page` (marketing), `app` (member web app: smaller, no photo gallery, adds "Set as my club"), `ios`.

**States.** Default. Closed now. Loading: photo block + text bars. Photo error: placeholder. Hours exception (holiday today): a `warning` line "Holiday hours today: 6:00 a.m.–2:00 p.m." with the triangle icon.

**Data contract.**

```ts
interface ClubHeroProps {
  club: Club;
  surface: 'marketing'|'app'|'ios';
  primaryAction: { label: string; href?: string; onPress?: () => void };
  secondaryAction?: { label: string; href?: string };
  tabs?: ('classes'|'amenities'|'hours-map'|'coaches'|'reviews')[];
}
```

**Content rules.** Headline is the club name. Do not write a second tagline. The personality line is the one in FND §2. Photo shows real members, real light (BRD §7). No headline text on the photo.

**Accessibility.** H1 is the club name. The photo alt text describes the scene. `Tabs` follow the arrow-key pattern. The sticky bottom bar must not cover focus: add scroll padding equal to the bar height. Dynamic Type at AX: bottom bar buttons stack; the bar may take up to 40 % of the screen height, so make it scroll with the page at AX sizes instead of sticky.

**Web build.** `aspect-ratio` (shadcn), `Tabs` (Graphical), `Button` (Graphical), `Dialog` (Graphical) + `carousel` (shadcn) for the gallery. Custom: `ClubRibMark`, `OpenStatus`, sticky booking card layout.

**iOS build.** `ScrollView` with an `AsyncImage` header; `Picker(.segmented)`; `.safeAreaInset(edge: .bottom)` for the bottom bar with `.buttonStyle(.glassProminent)` on the one primary action (floating functional layer; APL §3). Toolbar: back, share. Stays native: navigation bar, large title behaviour.

**Research basis.** MKT §3 r10–r13, r45–r46 (tabs order, sticky card, bottom bar, per-club details). MKT §2 D1–D3. IOS §5 r4, r17, r18, r5 (sticky bottom bar). IOS §4.6. BRD §1 (ribs, one for each club).

### 6.3 `ClubSwitcher`

**Purpose and question.** "Which club am I looking at?" It sets the club for the schedule, the pass and the reservations.

**Anatomy.**
- **Trigger.** A pill button in the top bar or at the top of the schedule: pin icon + club short name + chevron. Height 44. Radius S. On iOS: `Button` in the toolbar or at the top of the content.
- **Panel.** Web: Graphical `Popover` on wide screens, `Drawer` on narrow screens. iOS: `.sheet` at `.medium` detent with a grabber.
- **Contents.**
  1. Search field: "Search clubs or ZIP" with "Use current location" as the first suggestion (WEB §4 r19).
  2. Group labels "Mesa" (3) and "Gilbert" (2).
  3. Five `ClubCard` `list-row` entries as a single-select list (radio semantics), each with `BusynessMeter` `compact` and distance.
  4. For multi-club filters: a first row "All clubs" and checkboxes on the rows.
  5. Your home club carries a "Home" tag.

**Modes.** `single` (default; picks the club for pass, reservations), `multi` (schedule filter), `compare` (marketing "Find a club": opens the split list and map).

**Plan locks.** A Trailhead member has one home club. Other rows are `disabled` with a lock icon and the text "Ridge unlocks all 5 clubs" and a link "See plans". The row stays visible and is greyed, not hidden (IOS §5 r13). A Trailhead member can still view another club's page, hours and busyness. They cannot book there.

**States.** Closed, open, selected row (check mark + `primary-subtle` fill), locked row, loading (five skeleton rows), location denied (inline text "Location is off. Search by ZIP.").

**Data contract.**

```ts
interface ClubSwitcherProps {
  clubs: Club[];
  value: ClubId | ClubId[];
  mode: 'single'|'multi'|'compare';
  homeClubId?: ClubId;
  lockedClubIds?: ClubId[];           // plan-based locks
  userLocation?: { lat: number; lng: number };
  onChange: (next: ClubId | ClubId[]) => void;
}
```

**Content rules.** Trigger text: "Gilbert – Val Vista" on wide screens, "Val Vista" when tight. Locked reason in plain words. "All clubs" only when the plan allows it.

**Accessibility.** The trigger is a button with `aria-haspopup="dialog"` and `aria-expanded`; name "Club: Gilbert – Val Vista. Change club." The list is a `radiogroup` (or a group of checkboxes in `multi`). Arrow keys move between rows, Enter selects, Escape closes and returns focus to the trigger. Locked rows use `aria-disabled` and keep their reason as text. VoiceOver: each row reads name, status, busyness, distance.

**Web build.** Graphical `Popover` (wide) and `Drawer` (narrow), `RadioGroup` + `Radio` for single mode, `CheckboxGroup` + `Checkbox` for multi mode, `Input` with `Field` for search, `ScrollArea` for the list, `Button` for the trigger. shadcn `command` is an alternative for keyboard search across clubs, classes and help (LIB §3); use it only if a global search is added. Custom: group headers, plan locks, location suggestion.

**iOS build.** `Button` with `Label` in the toolbar; `.sheet(isPresented:)` with `.presentationDetents([.medium, .large])` and `.presentationDragIndicator(.visible)` [signature unverified, APL §2]; `List` with `ForEach` and `Section("Mesa")`; selected row shows a `checkmark` (HIG option-list pattern); `.searchable`. Locked rows: `.disabled(true)` with a visible reason `Text`. Stays native: sheet, List, searchable.

**Research basis.** WEB §4 r19 (location search with "Use current location"), r20 (radio list with counts and Done), r34 (region-grouped list). WEB §3.6. IOS §5 r10 (bottom sheet for pickers) and r13 (greyed, not hidden). FND §4 (Trailhead has one home club).

### 6.4 `HoursTable`

**Purpose and question.** "Is the club open when I want to go?" It shows hours for the week, with today marked.

**Anatomy.**
- Seven rows: Monday to Sunday. Columns: day (left), hours (right).
- Today's row: bold, a "Today" tag, a dot before the day.
- Under the table: extra lines (when the club has them): "Staffed hours 6:00 a.m.–8:00 p.m.", "Kids club Mon–Sat 8:00 a.m.–12:00 p.m. and 4:00–8:00 p.m.", "Pools close 30 minutes before the club."
- Holiday hours: a separate line under the table (MKT §3 r13).
- Caption: "Arizona time".

**Variants.**

| Variant | Content | Use |
|---|---|---|
| `week` | Seven rows + extras | Club page, iOS hours sheet |
| `grouped` | Two rows: "Mon–Fri 4:30 a.m.–10 p.m." and "Sat–Sun 6 a.m.–8 p.m." (weekday left, weekend right, GAP r30) | Footer, small cards |
| `today` | One line: "Open today · 4:30 a.m.–10 p.m." | `ClubCard` expansions, widgets |
| `all-clubs` | Five clubs, grouped rows | Marketing footer (MKT §3 r34) |

**Type and tokens.** Day: `s` Inter. Hours: `data` Archivo (tabular) so columns align. Today row: weight 700 on hours, 600 on day. Row height 40 (padding 8/16). Divider `border`. Today dot: `success` 8 px circle, paired with the word "Open now" when open. Open days use the same dot style in the iOS list (IOS §5 r16).

**States.** Default. Open now (adds "Open now" text). Closed now (shows "Closed · opens 4:30 a.m."). Holiday today (warning line). Loading: seven bars. Error: "We could not load hours. Call the club." with the phone link.

**Data contract.**

```ts
interface HoursTableProps {
  hours: ClubHours;
  variant: 'week'|'grouped'|'today'|'all-clubs';
  now: ISODateTime;                   // decides "today" and "open now" in club time zone
  showExtras?: boolean;
  clubs?: Pick<Club,'displayName'|'hours'>[];   // for 'all-clubs'
}
```

**Content rules.** "4:30 a.m.–10:00 p.m." Use an en dash and no spaces. Do not use "24/7" (it is not true). Holiday example: "Thanksgiving Day: 6:00 a.m.–12:00 p.m." (sample copy). Pools: "Pool closes 9:30 p.m. on weekdays" is derived; compute it, do not hand-type.

**Accessibility.** A real `<table>` with `<th scope="row">` for days. Today's row has `aria-current="date"`. The dot is `aria-hidden`; the word "Today" is text. iOS: `LabeledContent` rows; today gets `.accessibilityLabel("Today, Wednesday, 4:30 a.m. to 10:00 p.m., open now")`. Dynamic Type: the two columns stack (day above hours) at AX sizes.

**Web build.** shadcn `table` (restyled), plus `Collapsible` (Graphical) for the extras if the page is dense. `Tabs` is not needed.

**iOS build.** `List` with `Section("Hours")` and `LabeledContent("Mon", value: ...)`. Today row uses `.fontWeight(.semibold)`, a `Label("Today", systemImage: "circle.fill")` tinted `Color("StatusOpen")`. Present from the "Open until 10 p.m." button in a sheet at `.medium` detent. Times in SF Pro with `.monospacedDigit()`.

**Research basis.** mobbin-standard-pass §2 rule 7 (day groups left, times right; Mon–Fri in one row). MKT §3 r13 (seven rows, today bold, holiday line), r34 (footer hours format), MKT §2 L7. GAP r30 (two columns weekday and Saturday). IOS §5 r15–r16 (seven days, today highlighted, green dot). IOS §1 source rows 29 and 32 (hours sheets). FND §2 (hours).

### 6.5 `PopularTimesChart`

**Purpose and question.** "When is this club quiet?" It shows typical busyness by hour for a chosen day, with the live level for now.

**Anatomy.**
1. Header: "Typical busyness" (`l`) + the day selector.
2. Day selector: seven items, Mon to Sun, today selected by default.
3. Chart plot: one bar per open hour. Bar height = level 1–5, in five fixed steps (20 %, 40 %, 60 %, 80 %, 100 % of plot height). Plot height 160 web, 140 iOS. Bar width fills the space with a 2 px gap (minimum 12 px). Radius XS at the top.
4. Y axis: three labels only: "Packed", "Steady", "Quiet", in `xs`. No numbers.
5. X axis: hour labels every 3 hours: "6 a.m.", "9 a.m.", "12 p.m.", "3 p.m.", "6 p.m.", "9 p.m.", in `xs`.
6. "Now" marker (today only): the current hour's bar has a 2 px `secondary` outline and a label above it, "Now: Steady".
7. Summary line under the chart: "Quietest: 9:00–11:00 a.m." (from `quietestWindow`) and "Busiest: 5:00–7:00 p.m.".

**Bar colour.** `text-muted` (5.86:1 on white) for typical bars, so the chart is calm. The "now" bar uses the live level's tone. Height carries the value. Colour never does.

**States.** Default. Day with no data: `EmptyState` compact "We do not have typical times for this day yet." Closed hours: no bars. Loading: skeleton bars at random fixed heights. Live data stale: hide the "now" marker.

**Data contract.**

```ts
interface PopularTimesChartProps {
  popularTimes: PopularTimes;
  hours: ClubHours;
  live?: Busyness;
  day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun';
  onDayChange: (d: PopularTimesChartProps['day']) => void;
  now: ISODateTime;
}
```

**Content rules.** Plain summary: "Quietest: 9:00–11:00 a.m.". No "peak hours" jargon. Do not promise ("Never busy"). Weekend charts start at 6 a.m. and end at 8 p.m.

**Accessibility.** Web: the chart has `role="img"` and an `aria-label` that states the day, the quietest window and the busiest window. A "View as table" `Collapsible` holds a real `<table>` (hour, level word). Keyboard users use the table. The day selector is a `radiogroup`-style `ToggleGroup`. iOS: `.accessibilityChartDescriptor` with an `AXChartDescriptorRepresentable`, so VoiceOver users hear an audio graph (APL §5). Each bar has `.accessibilityLabel("9 a.m.")` and `.accessibilityValue("Light, 2 of 5")`.
Dynamic Type: the day selector becomes a `Menu` picker at AX sizes. X-axis labels thin out to every 6 hours.

**Web build.** Custom SVG (recommended; seven days × 19 bars; full control of tokens). Option: shadcn `chart` (wraps Recharts; unverified, LIB §2). Day selector: Graphical `ToggleGroup` (single). Hover or focus tooltips: Graphical `Tooltip`. Table: shadcn `table` inside `Collapsible`.

**iOS build.** Swift Charts `Chart { ForEach(hours) { BarMark(x: .value("Hour", $0.hour), y: .value("Busyness", $0.level)) } }`. Add `RuleMark` or a highlighted `BarMark` for now. `.chartYAxis` with three custom labels. `.chartXSelection` for tap-to-read. Day selector: `Picker(.segmented)` with `Text("M")`-style labels and full-day accessibility labels. Split chart content into small views to protect the type checker (APL §1). Colours: `Color("TextMuted")`.

**Research basis.** FND §2 (typical hours chart by day, "popular times" style). mobbin-standard-pass §1 search 10 (again no popular-times chart; the only crowd pattern is the YES/NO prompt of mobbin-standard-pass §2 rule 58, not adopted because FND requires the chart). GAP search 5 (no busyness pattern found; closest: Insight Timer day tabs and bar chart with average line, MacroFactor range pills), so this is a new pattern. APL §5 (Swift Charts and chart descriptor). APL §6 (label plus shape). LIB §2 (`chart`, unverified).

### 6.6 `ClubMap` and `ClubPin`

**Purpose and question.** "Where are the clubs, and which one is near me?"

**`ClubMap` anatomy: web, wide.** A split view. List left (`ClubCard` `list-row`, 400 wide). Map right, at least 50 % of the width (MKT §3 r6). Above the list: `AmenityChip` `filter` row (six chips) and a result count line, "5 clubs" (IOS §5 r19). Top of the list: search field with "Use current location".

**`ClubMap` anatomy: web, narrow.** A "List | Map" toggle (`ToggleGroup`). Never a map without a list (WEB §5 #11, IOS §6 #10). The list is always reachable in one tap.

**`ClubMap` anatomy: iOS.** Full-bleed `Map` with a search pill at the top and a bottom sheet. The sheet's first line is the count "5 clubs in map area", under the filter chips (mobbin-standard-pass §2 rule 57). Sheet detents: collapsed (a 56 pt grab-handle strip with "5 clubs"), `.medium` (list), `.large`. The map keeps the interaction while the sheet is at the collapsed or medium detent (`presentationBackgroundInteraction`). A pin tap selects the club, centres the map and raises the sheet to a `ClubCard` `map-callout`.

**`ClubPin`.**

| Part | Spec |
|---|---|
| Body | A rounded rectangle (radius S 10), height 32, with a 8 px point below. Contains the `shortName` (`xs` Inter 600) and a `BusynessMeter` `compact` (28 × 16). |
| Target | 44 × 44 around the pin. |
| Default | Fill `surface`, 1 px `border-strong` edge, text `text`. |
| Hover and selected | Fill `secondary` (Saguaro Night), text `secondary-foreground`, ribs in Sand. Selected also has a 2 px `primary` outline. |
| Home club | A small house icon before the name. |
| Closed | Text `text-muted`, ribs hidden, "Closed" after the name. |
| Cluster | A circle (40 px) with a count, fill `secondary`, text Sand, used when pins overlap at a wide zoom (MKT §3 r8). Click zooms in. |

Pin edge has 3.48:1 or better against Sand map tiles only on a calm base map. Use a muted, low-contrast base map style (no saturated roads).

**Hover sync (web).** Hovering a list row highlights its pin. Hovering or focusing a pin highlights its row. Clicking a pin scrolls the list to the row and opens the callout (MKT §3 r7).

**States.** Default. Hover. Selected. Loading map: grey tile block with `surface-muted` and the text "Loading map". Map load error: static list stays; message "The map did not load. The list still works." with retry. Location denied: no distance, inline hint.

**Data contract.**

```ts
interface ClubMapProps {
  clubs: Club[];
  selectedId?: ClubId;
  homeClubId?: ClubId;
  userLocation?: { lat: number; lng: number };
  filters: AmenityGroup[];
  onSelect: (id: ClubId) => void;
  onFilterChange: (g: AmenityGroup[]) => void;
  surface: 'marketing'|'app'|'ios';
}
interface ClubPinProps { club: Pick<Club,'id'|'shortName'|'geo'|'busyness'>; selected: boolean; isHome: boolean; closed: boolean }
```

**Content rules.** Pin text is the short name ("Dobson", "Red Mountain", "Downtown", "Val Vista", "Heritage"). Result line: "5 clubs" or "3 clubs with a pool". Callout actions follow section 6.1.

**Accessibility.** The list is the primary accessible interface. Pins are `button`s in the tab order after the list, named "Show Gilbert – Val Vista on the map". The map itself is `role="application"` only if the renderer needs it; otherwise it is a group with the label "Map of the five clubs". Escape closes a callout and returns focus to the pin. Colour: selected state also changes the text and adds an outline. VoiceOver on iOS: `Marker` names are the club names; the sheet list is the main route.

**Web build.** Custom `ClubMap` and `ClubPin`. The map renderer is an open decision: LIB §4 says "none; use an embedded map or a static image (unverified choice)". Define a `MapRenderer` interface (`center`, `zoom`, `markers`, `onMarkerSelect`) so the choice stays swappable. A static-image fallback shows numbered links that point to the same list rows. Callout: Graphical `Popover`. Filters: Graphical `ToggleGroup`. Toggle on narrow screens: `ToggleGroup`. shadcn `marker` has an unverified purpose (LIB §2); do not use it.

**iOS build.** `Map(position: $camera)` with `Marker(club.shortName, systemImage:, coordinate:)` and `.tint(Color("BrandSecondary"))` per club. Use `Annotation` if a custom `ClubPin` view is needed (not in the research list; verify). `MapCameraPosition` for the camera; `MapUserLocationButton` in `.mapControls`. Sheet list with `List`. Stays native: Map, user location control, sheet. Busyness shows in the sheet cards, not on the iOS pin (keeps native markers).

**Research basis.** mobbin-standard-pass §2 rule 57 (search pill, count line, sheet with chips). MKT §3 r6–r8, r9 (split view, hover sync, cluster bubbles, short names). MKT §2 L1. WEB §4 r18 (list left, map right, count pins), WEB §5 #11 (no map without a list). IOS §5 r19–r21 (chips, clusters and bottom sheet, summary card with Directions), IOS §6 #10. APL §5 (Map, Marker, MapCameraPosition, MapUserLocationButton). LIB §4 (map: no library component).

---

Part 2 continues with section 7 (class and schedule components). See `01-shared-brand-components-part2.md`.
