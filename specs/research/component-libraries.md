# Component libraries: Graphical (Base UI) and shadcn/ui

Status: research inventory, 2026-10-27. Read only. No app code changed.

Sources used:
- Local: `cactus-peak-brand/ui-theme/README.md`, `graphical-install.md`, `theme.json`; `cactus-peak-athletic/apps/web/GUI.md`, `gui/components.md`, `gui/base-ui.md`, `gui/themes.md`, `components.json`, `components/graphical/` (`index.ts`, `components/library/consumer.tsx`, `primitives.tsx`, `lib/base-ui-catalog.ts`).
- Web: `https://base-ui.com/llms.txt` (WebFetch), `https://ui.shadcn.com/docs/components` (WebFetch), `https://ui.shadcn.com/blocks` (WebFetch).
- Context7: `/websites/ui_shadcn` (3 queries; the install lines and `base-nova` style confirmed; the full list came from WebFetch).

Labels: "verified" means read in a source above. "unverified" means not checked against a source.

## 1. Graphical component table (Base UI, themed)

Install path in the app: `@/components/graphical` (named exports from `components/graphical/index.ts`). The `@/` alias comes from `components.json`; check `tsconfig.json` before use.

Count: `consumer.tsx` exports 38 component names (6 original controls plus 32 catalog components). `base-ui.com/llms.txt` lists 37 pages. The difference is `Radio`. Graphical also exports Radio, but llms.txt has no Radio page (verified).

Spec file column: each row links to `apps/web/gui/components/cactus-peak-athletic/<spec>.md` (verified file names).

| Export name | Base UI primitive (import) | Spec file | Parts | Variants / sizes | States | Theme edits (README) |
|---|---|---|---|---|---|---|
| `Button` | `@base-ui/react/button` | `button` | control, label (`ButtonLabel`, `ButtonContent`) | `variant`: primary (default), secondary, outline, ghost, danger; small | Default, Hover, Focus, Disabled | 44 px height (padding S 12 px); focus ring Color 5; primary hover Color 6; danger hover Color 7; label weight 600; secondary and outline border Neutral 6 |
| `Input` (text field) | `@base-ui/react/input` | `input` | control, label (`InputLabel`) | Input size M (16 px) | Default, Hover, Focus, Disabled | 44 px height; border Neutral 6; hover border Neutral 8; focus ring Color 5 |
| `Checkbox` | `@base-ui/react/checkbox` | `checkbox` | Root, Indicator (from source); control | Graphical 16 px; local override 24 px | Default, Hover, Focus, Checked, Indeterminate | Border Neutral 6; hover border Neutral 5 not changed in app |
| `CheckboxGroup` | `@base-ui/react/checkbox-group` | `checkbox-group` | group | unverified | unverified | unverified |
| `Switch` | `@base-ui/react/switch` | `switch` | track (catalog part ID); control | unverified | Default, Hover, Focus, Checked | Off-track Neutral 6; focus ring Color 5 |
| `Select` | `@base-ui/react/select` | `select` | control (composed as `SelectField`) | unverified | Default, Hover, Focus, Open | Focus ring Color 5 |
| `Combobox` | `@base-ui/react/combobox` | `combobox` | input (composed as `ComboboxField`) | unverified | unverified | Focus ring Color 5 |
| `Accordion` | `@base-ui/react/accordion` | `accordion` | unverified | unverified | unverified | Trigger focus ring Color 5 |
| `AlertDialog` | `@base-ui/react/alert-dialog` | `alert-dialog` | unverified | unverified | unverified | unverified |
| `Autocomplete` | `@base-ui/react/autocomplete` | `autocomplete` | input | unverified | unverified | Input focus ring Color 5 |
| `Avatar` | `@base-ui/react/avatar` | `avatar` | image, fallback | unverified | unverified | unverified |
| `Collapsible` | `@base-ui/react/collapsible` | `collapsible` | unverified | unverified | unverified | Trigger focus ring Color 5 |
| `ContextMenu` | `@base-ui/react/context-menu` | `context-menu` | unverified | unverified | unverified | unverified |
| `Dialog` | `@base-ui/react/dialog` | `dialog` | unverified | unverified | unverified | unverified |
| `Drawer` | `@base-ui/react/drawer` | `drawer` | viewport, content | unverified | unverified | unverified |
| `Field` | `@base-ui/react/field` | `field` | label, control, description, error | unverified | unverified | Uses text field input |
| `Fieldset` | `@base-ui/react/fieldset` | `fieldset` | legend, label, error | unverified | unverified | unverified |
| `Form` | `@base-ui/react/form` | `form` | group, label, control, error | unverified | unverified | unverified |
| `Menu` | `@base-ui/react/menu` | `menu` | unverified | unverified | unverified | Uses shared Button variants on trigger |
| `Menubar` | `@base-ui/react/menubar` | `menubar` | trigger | unverified | unverified | Trigger focus ring Color 5 |
| `Meter` | `@base-ui/react/meter` | `meter` | track, value (Root wrapped as `ui-range`) | unverified | unverified | No focus state |
| `NavigationMenu` | `@base-ui/react/navigation-menu` | `navigation-menu` | trigger, positioner | unverified | unverified | Trigger focus ring Color 5 |
| `NumberField` | `@base-ui/react/number-field` | `number-field` | increment, decrement, input | unverified | unverified | Increment and decrement focus ring Color 5 |
| `OTPField` | `@base-ui/react/otp-field` | `otp-field` | input | unverified | unverified | Input focus ring Color 5 |
| `Popover` | `@base-ui/react/popover` | `popover` | trigger, positioner, content | unverified | unverified | Uses shared Button variants on trigger |
| `PreviewCard` | `@base-ui/react/preview-card` | `preview-card` | trigger, positioner | unverified | unverified | Trigger focus ring Color 5 |
| `Progress` | `@base-ui/react/progress` | `progress` | track, value | unverified | unverified | No focus state |
| `Radio` | `@base-ui/react/radio` | `radio` | control | unverified | unverified | Control focus ring Color 5 |
| `RadioGroup` | `@base-ui/react/radio-group` | `radio-group` | group, Row, Label | unverified | unverified | Uses Radio |
| `ScrollArea` | `@base-ui/react/scroll-area` | `scroll-area` | viewport, scrollbar | unverified | Focus | Focus ring cannot be set in app; global token stays Color 1 |
| `Separator` | `@base-ui/react/separator` | `separator` | unverified | unverified | No focus state | unverified |
| `Slider` | `@base-ui/react/slider` | `slider` | track, thumb, value | unverified | Focus (thumb) | Thumb focus ring Color 5 |
| `Tabs` | `@base-ui/react/tabs` | `tabs` | trigger, list, panel | Segmented tabs | Focus (trigger) | Trigger focus ring Color 5; tab bar labels XXS 11 px |
| `Toast` | `@base-ui/react/toast` | `toast` | content, title, description, close | unverified | Default, Open, Invalid, Loading | No focus state |
| `Toggle` | `@base-ui/react/toggle` | `toggle` | control | unverified | Focus | Control focus ring Color 5 |
| `ToggleGroup` | `@base-ui/react/toggle-group` | `toggle-group` | group, Label | unverified | unverified | Uses Toggle |
| `Toolbar` | `@base-ui/react/toolbar` | `toolbar` | unverified | unverified | unverified | Uses Toggle and shared Button |
| `Tooltip` | `@base-ui/react/tooltip` | `tooltip` | trigger, positioner, popup | unverified | unverified | Uses shared Button variants on trigger |

Notes on this table:
- Part names marked "from source" or "catalog part ID" come from Graphical's own code. They are not checked against Base UI docs.
- The `parts` column for most rows is unverified. Check the Base UI page for each row before a spec names a part.
- Graphical's catalog also includes `ButtonLabel`, `ButtonContent` (`ButtonLabel` is a `span`), `AnimatedValue`, `ThemedIcon`, `IconRendererProvider`, `GraphicalProvider`, `useGraphicalTheme`, and `createHugeiconsRenderer`. These are integration tools, not visual components.
- Graphical's `theme` export (`components/graphical/theme.ts`) holds the captured theme document.

### Base UI primitives not in Graphical
None found. All 37 llms.txt pages map to an export in Graphical (Radio is extra on the Graphical side). The llms.txt list also includes `Button`, `Input`, `Select`, `Switch`, `Checkbox`, and `Combobox`, which Graphical covers as original controls.

## 2. shadcn/ui component table

Source: the component index at `ui.shadcn.com/docs/components` (WebFetch, verified). The docs show a `base` and an `aria` path variant. The `base-nova` style is the Base UI style in `components.json` (verified). Base UI became the default shadcn library in July 2026 (Context7 changelog snippet, verified).

Install command for every row: `npx shadcn@latest add <name>` (verified form from Context7 docs).

Rule: prefer Graphical when both exist. The app already has shadcn files in `apps/web/components/ui/` (accordion, badge, button, card, input, label, separator, skeleton, table). Graphical covers accordion, button, input, and separator. Replace those with Graphical when converting.

"Purpose" column: from the component name unless marked "verified" (I did not read each page).

| shadcn name | Install | Purpose | Graphical covers it? |
|---|---|---|---|
| accordion | `npx shadcn@latest add accordion` | Expandable sections | Yes: `Accordion` |
| alert | `npx shadcn@latest add alert` | Inline message box | No. Use Toast or AlertDialog for messages |
| alert-dialog | `npx shadcn@latest add alert-dialog` | Confirm or warn modal | Yes: `AlertDialog` |
| aspect-ratio | `npx shadcn@latest add aspect-ratio` | Fixed-ratio media box | No |
| attachment | `npx shadcn@latest add attachment` | File attachment chip | No (purpose unverified) |
| avatar | `npx shadcn@latest add avatar` | User picture or initials | Yes: `Avatar` |
| badge | `npx shadcn@latest add badge` | Small status label | No. Local `.cp-badge` exists; Graphical has no badge |
| breadcrumb | `npx shadcn@latest add breadcrumb` | Location trail | No |
| bubble | `npx shadcn@latest add bubble` | Chat message bubble | No (purpose unverified) |
| button | `npx shadcn@latest add button` | Action button | Yes: `Button` |
| button-group | `npx shadcn@latest add button-group` | Joined buttons | No (partial: Toggle group) |
| calendar | `npx shadcn@latest add calendar` | Month grid for dates | No |
| card | `npx shadcn@latest add card` | Surface container | No. Graphical is surfaces only; local `.cp-card` |
| carousel | `npx shadcn@latest add carousel` | Swipe or step through items | No |
| chart | `npx shadcn@latest add chart` | Charts (wraps Recharts, unverified) | No |
| checkbox | `npx shadcn@latest add checkbox` | Checkbox | Yes: `Checkbox` |
| code-block | `npx shadcn@latest add code-block` | Code display | No |
| collapsible | `npx shadcn@latest add collapsible` | Show or hide one section | Yes: `Collapsible` |
| combobox | `npx shadcn@latest add combobox` | Searchable select | Yes: `Combobox` |
| command | `npx shadcn@latest add command` | Command palette or search list | No |
| context-menu | `npx shadcn@latest add context-menu` | Right-click menu | Yes: `ContextMenu` |
| data-table | `npx shadcn@latest add data-table` | Sortable, filterable table | No (Graphical has no table; local `table` exists) |
| date-picker | `npx shadcn@latest add date-picker` | Date input with calendar | No |
| dialog | `npx shadcn@latest add dialog` | Modal dialog | Yes: `Dialog` |
| direction | `npx shadcn@latest add direction` | Text direction provider (RTL) | Not applicable (utility) |
| drawer | `npx shadcn@latest add drawer` | Bottom or side sheet | Yes: `Drawer` |
| dropdown-menu | `npx shadcn@latest add dropdown-menu` | Action menu | Yes: `Menu` |
| empty | `npx shadcn@latest add empty` | Empty-state block | No |
| field | `npx shadcn@latest add field` | Label, control, help, error | Yes: `Field` |
| hover-card | `npx shadcn@latest add hover-card` | Preview on hover | Yes: `PreviewCard` |
| input | `npx shadcn@latest add input` | Text input | Yes: `Input` |
| input-group | `npx shadcn@latest add input-group` | Input with addons | No |
| input-otp | `npx shadcn@latest add input-otp` | One-time code entry | Yes: `OTPField` |
| item | `npx shadcn@latest add item` | List row item | No |
| kbd | `npx shadcn@latest add kbd` | Keyboard key label | No |
| label | `npx shadcn@latest add label` | Form label | Yes, inside `Field` and `InputLabel` |
| marker | `npx shadcn@latest add marker` | Map or timeline marker (purpose unverified) | No |
| menubar | `npx shadcn@latest add menubar` | Menu bar | Yes: `Menubar` |
| message | `npx shadcn@latest add message` | Chat message (purpose unverified) | No |
| message-scroller | `npx shadcn@latest add message-scroller` | Scrolling message list (purpose unverified) | No |
| native-select | `npx shadcn@latest add native-select` | Native browser select | No (Graphical `Select` is custom) |
| navigation-menu | `npx shadcn@latest add navigation-menu` | Site nav with panels | Yes: `NavigationMenu` |
| pagination | `npx shadcn@latest add pagination` | Page controls | No |
| popover | `npx shadcn@latest add popover` | Floating panel | Yes: `Popover` |
| progress | `npx shadcn@latest add progress` | Progress bar | Yes: `Progress` (and `Meter`) |
| questionnaire | `npx shadcn@latest add questionnaire` | Multi-step questions (purpose unverified) | No |
| radio-group | `npx shadcn@latest add radio-group` | Single choice | Yes: `RadioGroup`, `Radio` |
| resizable | `npx shadcn@latest add resizable` | Resizable panes | No |
| scroll-area | `npx shadcn@latest add scroll-area` | Custom scrollbars | Yes: `ScrollArea` |
| select | `npx shadcn@latest add select` | Dropdown select | Yes: `Select` |
| separator | `npx shadcn@latest add separator` | Divider | Yes: `Separator` |
| sheet | `npx shadcn@latest add sheet` | Side panel | Partial: `Drawer` |
| sidebar | `npx shadcn@latest add sidebar` | App shell sidebar | No |
| skeleton | `npx shadcn@latest add skeleton` | Loading placeholder | No |
| slider | `npx shadcn@latest add slider` | Range slider | Yes: `Slider` |
| spinner | `npx shadcn@latest add spinner` | Loading indicator | No |
| switch | `npx shadcn@latest add switch` | On or off switch | Yes: `Switch` |
| table | `npx shadcn@latest add table` | Static table | No. Local `table` exists |
| tabs | `npx shadcn@latest add tabs` | Tabbed content | Yes: `Tabs` |
| textarea | `npx shadcn@latest add textarea` | Multi-line input | No (unverified: Graphical Input may cover it) |
| toast | `npx shadcn@latest add toast` | Short notice | Yes: `Toast` |
| toggle | `npx shadcn@latest add toggle` | Pressed or unpressed button | Yes: `Toggle` |
| toggle-group | `npx shadcn@latest add toggle-group` | Group of toggles | Yes: `ToggleGroup` |
| tooltip | `npx shadcn@latest add tooltip` | Hover hint | Yes: `Tooltip` |
| typography | `npx shadcn@latest add typography` | Text styles (purpose unverified) | No. Use the theme type scale |

Not in the docs index (verified absence): `sonner`. The docs index lists `toast` only. Use `toast` for the notice role. Treat `sonner` as unverified.

## 3. shadcn blocks and composite pieces

Verified on `ui.shadcn.com/blocks` (WebFetch):

| Block | Install | Category | Use for |
|---|---|---|---|
| `sidebar-07` | `npx shadcn@latest add sidebar-07` | Dashboard layout; sidebar collapses to icons | Member app shell (iPad or web) |
| `sidebar-03` | `npx shadcn@latest add sidebar-03` | Dashboard layout; sidebar with submenus | Staff or admin shell (out of scope per AGENTS.md A6) |
| `dashboard-01` | `npx shadcn@latest add dashboard-01` | Dashboard | Reference only |
| `login-03` | `npx shadcn@latest add login-03` | Auth | Reference only; sign-up is out of scope |
| `login-04` | `npx shadcn@latest add login-04` | Auth | Reference only; sign-up is out of scope |

No marketing blocks appeared on the blocks page (verified). Marketing sections for the site must come from components, not blocks (unverified whether shadcn publishes marketing blocks).

Composite pieces to use from the component list (install commands in section 2):

| Piece | Use in gym site or member app | Graphical covers it? |
|---|---|---|
| `calendar` + `date-picker` | Class date selection, booking date | No |
| `carousel` | Photo strip, club gallery, testimonial strip | No |
| `command` | Search across clubs, classes, or help topics | No |
| `drawer` | Mobile filter sheet, class detail on phone | Yes (`Drawer`) |
| `toast` (for sonner role) | Booking saved, cancelled | Yes (`Toast`) |
| `chart` | Member attendance or capacity over time (Recharts, unverified) | No |
| `data-table` | Staff-facing lists. Out of scope for apps (A6) | No |
| `input-otp` | Sign-in code entry if OTP is used | Yes (`OTPField`) |
| `sidebar` | App shell primitives behind `sidebar-07` | No |
| `resizable` | Not needed for the gym site | No |

## 4. Gaps: components neither library provides

Neither library provides these. Build them as custom brand components using Graphical foundations (tokens, Base UI primitives where interaction exists).

| Component | Why the gym needs it | Base UI or shadcn primitive to build on |
|---|---|---|
| Class card | Shows class name, time, coach, capacity, book action | Card surface (local `.cp-card`) plus Button |
| Location card | Club address, hours, map link | Card surface plus Button |
| Schedule week grid | Week view of classes across five clubs | Tabs or Toggle group for days; no grid primitive |
| Capacity meter | Seats taken of total for a class | Meter or Progress (Graphical has the rib meter `.cp-ribs` in local CSS) |
| Map | Five club locations | None. Use an embedded map or a static image (unverified choice) |
| Check-in QR pass | Member check-in screen | None. Use a QR image on a surface card |
| Membership or pass card | Member plan and status | Card surface plus Badge (local `.cp-badge`) |
| Price display | Prices use sample data | Type scale `data` role (Archivo tabular figures) |
| Brand heading and eyebrow | Display headings and uppercase tracking line | Type scale `xl`, `xxl`, `eyebrow` (local only) |
| Tab bar (iOS) | Member app bottom bar | Local `.cp-tabbar` (SwiftUI, not Base UI) |
| Top nav and side nav | Site and app nav | Navigation menu (partial), local `.cp-topnav` and `.cp-sidenav` |
| Empty and loading states | Schedule and bookings empty | `empty` and `skeleton` (shadcn) |
| Data table (brand) | Attendance or bookings lists, if shown | `data-table` (shadcn), restyled with theme tokens |

## 5. Token cheat-sheet

Source of truth: `cactus-peak-brand/ui-theme/theme.json` (values verified). Colour role table in `README.md` (verified). Graphical colour names in `apps/web/GUI.md`.

Rule for app code: the repo bans hex values in app code (AGENTS.md). Use role names. The hex values below belong to the theme files only.

### Colour roles

| Role | Light | Dark | Graphical name |
|---|---|---|---|
| background | `#F6F1E8` | `#121A16` | neutral-3 / neutral-1 |
| surface | `#FFFFFF` | `#1A241F` | neutral-1 / neutral-2 |
| surface-muted | `#EFE7DA` | `#24302A` | neutral-4 / neutral-3 |
| text | `#1D1B17` | `#F2ECE2` | neutral-10 |
| text-muted | `#6B6457` | `#A69F92` | neutral-7 |
| border (decorative) | `#DDD2C1` | `#34423A` | neutral-5 / neutral-4 |
| border-strong (controls) | `#8C7F6B` | `#6E7F74` | neutral-6 |
| border-hover | `#4A443A` | `#CFC8BB` | neutral-8 |
| primary | `#B5532C` | `#E0804F` | color-1 |
| primary-foreground | `#FFFFFF` | `#121A16` | accent-text |
| primary-hover | `#9E4522` | `#EE9A6E` | color-6 |
| primary-subtle | `#F6DFD3` | `#3A2418` | color-4 |
| link | `#9E4522` | `#EE9A6E` | local only |
| secondary | `#1C3328` | `#F2ECE2` | color-2 (light) |
| danger | `#B42318` | `#F28B7C` | error |
| danger-hover | `#8F1C13` | `#F5A396` | color-7 |
| success | `#2A7047` | `#6FCB94` | success |
| warning | `#8A5300` | `#F2B14C` | warning |
| focus | `#2E6DB4` | `#7FB0E8` | color-5 |

Other palette values from `theme.json`: `color-2` dark `#3E6B55`, `color-3` light `#E0804F` and dark `#B5532C`.

### Type scale

Font families: display (brand) and data = Archivo. ui and editorial = Inter. Graphical GUI.md uses the alias `"Sidebar Inter"` for Inter. theme.json uses `Inter`. Pick one before loading fonts.

| Token | Family | Size / line (px) | Weight | Tracking | Use |
|---|---|---|---|---|---|
| xxl | Archivo | 48 / 52 | 800 | -0.03em | Web hero |
| xl | Archivo | 36 / 40 | 800 | -0.02em | Page titles |
| l | Archivo | 24 / 30 | 600 | -0.02em | Section and card titles |
| m | Inter | 16 / 24 | 400 | 0 | Body |
| s | Inter | 14 / 20 | 400 | 0.01em | UI labels |
| xs | Inter | 12 / 16 | 500 | 0.01em | Help text, badges |
| xxs | Inter | 11 / 14 | 500 | 0.02em | Tab bar labels only |
| button | Inter | 14 / 20 | 600 | 0.01em | Button labels |
| label | Inter | 14 / 20 | 600 | 0.01em | Field labels |
| input | Inter | 16 / 20 | 400 | 0 | Text field values |
| data | Archivo | 16 / 24 | 500 (tabular) | 0 | Times, prices, counts |
| data-l | Archivo | 36 / 40 | 700 (tabular) | -0.02em | Big numbers |
| eyebrow | Archivo | 12 / 16 | 600, uppercase | 0.24em | Section labels (local only) |

Weights for the families (theme.json): UI Inter 400, 500, 600. Brand Archivo 500, 600, 800 (logo 760). Editorial Inter 400, 500, 600. Data Archivo 400, 500, 700.

### Radius

| Token | Value | Use |
|---|---|---|
| xs | 4 px | Checkbox, small chips |
| s | 10 px | Buttons, inputs, tabs (`buttonRadius`) |
| m | 14 px | Cards |
| l | 20 px | Sheets, large panels |
| xl | 28 px | Hero panels |
| full | 9999 px | Badges, avatars, pills |

### Spacing

| Token | Value |
|---|---|
| xxs | 4 px |
| xs | 8 px |
| s | 12 px |
| m | 16 px |
| l | 24 px |
| xl | 32 px |
| xxl | 48 px |

Sizes: control height 44 px (`size.control`). Checkbox 24 px in local theme (Graphical 16 px). Avatar 32 px.

### Motion

| Token | Value |
|---|---|
| duration | 150 ms |
| easing | cubic-bezier(0.2, 0.8, 0.2, 1) |
| duration-large | 300 ms |
| easing-large | cubic-bezier(0.16, 1, 0.3, 1) |
| press-scale | 0.98 |
| popup-scale | 0.96 |

Reduced motion: must be kept (gui/base-ui.md, verified).

### Focus ring

Colour: Color 5 (`#2E6DB4` light, `#7FB0E8` dark). Width: 2 px. Opacity: 100 %. Applied to every focusable part in the app, except Scroll area. The Scroll area ring cannot be set in Graphical (README, verified).

### Borders and shadows

Border widths: S 1, M 1, L 2 px (Graphical). Graphical shadows are 0 % opacity (flat design). `theme.json` has local warm shadows s, m, l for raised cards and popovers. This is a documented exception (README). Do not mix the two without a decision.

### Icons

Lucide, outline style, stroke width 2 (verified in theme.json). Use `IconRendererProvider` in Graphical for icon packs (base-ui.md).

## Source notes and discrepancies

1. `theme.json` header names Graphical registry revision `14l2fy8rytby`. `README.md` and `graphical-install.md` name `s8bexxclgkuo` as current. Use `s8bexxclgkuo`. Update the `theme.json` header.
2. Graphical says 37 Base UI components. `consumer.tsx` exports 38 (Radio is extra). llms.txt lists 37 and has no Radio page.
3. `GUI.md` font alias `"Sidebar Inter"` differs from `theme.json` family `Inter`. Confirm the loader alias.
4. The Graphical install is recorded, not run. The component source in `components/graphical/` is what exists locally. Re-run `pnpm graphical:update` only after the spec owner agrees.
5. Part names for most Graphical components are unverified against Base UI docs. Check each Base UI component page before a spec names a part.
6. Context7 returned partial shadcn results. The full component list came from WebFetch of the docs index.
