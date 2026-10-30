# Cactus Peak build — design direction

This file applies to all three builds (marketing site, member web app, iOS app) and to every review of them.
The specs in `../cactus-peak-specs/` say WHAT to build. This file says how the result must FEEL, and what to avoid.

## The problem this file solves
Interfaces made by language models now share one look. People recognise it at once and trust it less.
A real club with five real places must not look like a template. Every screen must look like a designer
made a choice for this brand, this member and this moment.

## Avoid: the current LLM default look
Treat each item below as a defect in review.

**Layout**
- Everything centred. A centred hero, centred section heads, centred cards, section after section.
- The same section rhythm repeated: eyebrow, heading, sub-line, 3-card grid. Again and again.
- Three (or four) equal cards with an icon in a tinted rounded square, a bold title and two lines of grey text.
- A row of four identical KPI cards at the top of every dashboard.
- Every element inside a bordered, rounded, shadowed card. Cards inside cards.
- Equal spacing everywhere, so nothing groups and nothing leads.
- A pill badge above the hero heading ("New", "Now open", a sparkle icon).

**Visual**
- Purple, blue-violet or rainbow gradients; gradient text; glow and blur blobs behind the hero.
- Glassmorphism on web surfaces for decoration.
- One large radius (16–24 px) on every element, whatever its size.
- Soft grey shadows on every card.
- Emoji used as icons. Sparkles. Rockets.
- Generic placeholder art (abstract gradients, blurry shapes) where a photo of a place or a person must go.
- Low-contrast grey body text on white.

**Words**
- "Elevate", "unlock", "seamless", "journey", "transform", "empower", "next-level", "your all-in-one".
- Three-part slogans ("Train. Recover. Thrive."). Hype. Exclamation marks.
- Testimonials with a five-star row and a first name only.
- Numbers that are round and vague ("10,000+ happy members").

**Behaviour**
- Fade-up-on-scroll on every section. Hover lift on every card.
- Skeleton screens that do not match the real layout.
- Toasts for things that the page itself must show.

## Do: what current human-led product design does
- **Editorial type with real contrast.** Archivo set large and tight for one idea per view; Inter for reading.
  Use size, weight and case to make a hierarchy, not boxes. Use tabular numerals for times, prices and counts.
- **Asymmetric, intentional grids.** Left-aligned text. Uneven columns (for example 5/7, 4/8). A strong left edge.
  Let one element break the grid on purpose when it matters (a big time, a club name, a price).
- **Structure from alignment and rules, not containers.** Use hairline dividers, lists, tables and whitespace.
  Use a card only when the object is a real thing the user picks (a club, a class, a plan, a slot).
- **Density where people scan.** A schedule is a dense, readable timetable, not a stack of big cards.
  Show the facts a member needs on the row: time, length, category, coach, intensity, spots left.
- **Real places and people.** Each club has its own character (name, street, photo direction, amenities, busyness).
  Each class has a coach face, a category colour and icon, and a real time. Users must tell choices apart at a glance.
- **Art-directed photo slots.** There are no photos on disk. Do not use stock gradients. Use a photo slot with a
  duotone or tonal fill from the brand palette, a fixed aspect ratio, and a short caption for the intended shot
  ("Dobson — 25 m pool at 6 a.m., low sun"). It must look intentional in a portfolio screenshot.
  Do not use paid image generators.
- **Local character.** Sonoran desert, saguaro ribs, early-morning heat, monsoon sky. Use it with restraint:
  the Rib Peak symbol, the five-rib meter, copper on sand, Saguaro Night blocks. Not cactus clip art.
- **Specific, plain words.** Use the spec copy. Name the club, the time, the price and the rule. Sentence case.
- **Varied section rhythm.** A marketing page alternates scale and density: a full-bleed moment, a dense list,
  a split, a table, a quiet text block. No two adjacent sections share the same layout.
- **Considered radius and depth.** Use the theme radius scale by element size (XS 4 to XL 28). Flat by default.
  Use elevation only for things that float (menus, sheets, popovers).
- **Motion with a purpose.** Use the Snappy 150 / 300 ms tokens for state changes. Respect reduced motion.
- **Honest states.** Empty, loading, error, full, waitlist, held, closed. Each one designed, each one with a next step.
- **Native first on iOS.** System navigation, lists, sheets, Liquid Glass where the system gives it. Brand through
  tint, type for big numbers, category colours, photo slots and the rib meter. Do not rebuild system controls.

## Graphics and visual identity
`VISUAL-IDENTITY.md` sets the graphic system on top of the logo: the Cut, the Rib field, the Rib meter, type as image,
pictogram rules, where each graphic goes on each surface, and the presentation templates. Read it before you add or
place any graphic.

## Review standard
A reviewer looks at every page or screen, at desktop and phone width (web) or in light and dark mode
and at a large Dynamic Type size (iOS). For each issue the reviewer gives: where (route or screen and file),
what is wrong, why it matters to the member, and the exact fix. The reviewer ranks issues by impact.

## Brand identity files

The final Rib Peak logo set and the brand guidelines live outside this project, in OneDrive:
`/Users/ethanhanderson/Library/CloudStorage/OneDrive-ArizonaStateUniversity/git480/Senior Project - Cactus Peak Athletic/Brand Identity/`

Read its `README.md` first. Use the folder when you need a logo, an icon, or a brand rule:

- `logos/`: master SVG logos (symbol, horizontal, stacked, wordmark; colour, black, white, reversed).
- `exports/web-icons/`: favicons, `favicon.ico`, `site.webmanifest`, and `head-snippet.html`.
- `exports/symbol/cpa-symbol-app-icon.svg`: the 1024 px iOS app icon master.
- `brand-guidelines.md`: clear space, minimum sizes, the small cut at 32 px and below, logo colours, and don'ts.

Copy the files you need into this project. Do not link to the OneDrive path from code. The folder is a reference
for logos and brand rules, not a token source: this project's theme, specs, and rules still win for UI colour,
tokens, and type.
