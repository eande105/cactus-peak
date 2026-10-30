# Mobbin research: member web app patterns (Cactus Peak Athletic)

## Status

- Completed: 16 `search_screens` calls returned results (web platform). Target was 15+. Met.
- The connector rate-limited several calls. The searches were rerun after a pause. Two calls returned no relevant screens (Peloton, Mindbody).
- Not run: `search_sections` and `search_flows`. One `search_flows` attempt was rate-limited and not retried.
- Not run: Linear sidebar and command menu. Not returned by any query.
- Every finding below comes from a screen image that a search returned. Gaps are marked "not observed".

## 1. Sources table

Mobbin IDs are the screen UUIDs. The canonical link is `https://mobbin.com/screens/<id>`.

| App | Screen / flow | What it shows | Mobbin ID |
|---|---|---|---|
| ClassPass | Video class library grid | 3-column cards: thumbnail, duration badge (bottom-right), title, instructor name. Pagination at bottom. | f7b535cb-4433-4edb-a4ab-e78068566316 |
| ClassPass | Top classes home | Horizontal carousel of category tiles with photo and "Top 10 classes" link list | f008843d-8213-4b6d-bcad-9456b1c33f12 |
| ClassPass | Category browse | Grid sections per category (HIIT, Strength, Mind and Body, Express Videos) | efeef2e6-0b90-4ee7-849a-411ebff8bdde |
| ClassPass | Filter sidebar + card grid | Left accordion filters (Activities checkboxes, Workout length, Body focus, Equipment, Partners); card grid with duration badge and instructor names | e6b9ef53-d4a8-44e1-9005-c8efe5aca7aa |
| ClassPass | Studio list + map | "Classes / Studios" tabs; studio rows with photo, category tags, star rating, "Safety guidelines" badge; map pane with pins; "Chat" button | df681198-23d1-427a-a5c5-d725e0784ca1 |
| ClassPass | Studio schedule with credits | Time-ordered rows: time, class name, instructor, duration (for example 120 min), credit cost button ("3 credits"); "See next day" button; "Checking availability" modal | de3abbfb-a3df-498b-a4ea-ef1184284c29 |
| Meetup | Event detail | Hero image, host avatar, details block, attendee avatars, sticky bottom bar with price, heart, share and primary "Attend online" button | b5390b55-28b4-4976-b670-bea4563a0c0d |
| Meetup | Event grid with filters | Chip row of categories, date, size, type and distance dropdowns; cards with photo, date line, host, attendee avatars and count; "4 seats left" badge on photo | (from organic gardening results, IDs not recorded) |
| Meetup | RSVP confirmation modal | "You're going!" modal over blurred page; event card in modal; guest note ("Your booking has 1 guests: sending them the guest invite link..."); "Share link" button | 4f1c7595-7b41-481c-af66-026cae663257 |
| Meetup | Subscription page | Settings left nav; status pill "Subscription ended"; plan name and price; start/billed/last bill/next bill grid; "Renew subscription"; invoices table | a3a6aeaf-a446-4de1-84c2-5972250c9b3c |
| Calendly | Booking page: date and time | Two-pane: event summary left (name, duration, location, price); calendar right with dated circles; time list; time-zone selector; selected slot filled; "Next" button | 254dc09b-8dd5-4057-a1e6-261900b61f18 (and 57876292-340c-408a-9563-fe0ab9f5dcbd) |
| Calendly | Confirmation | Green check, "You are scheduled!", summary card (name, date, time, time zone, conferencing), "Open Invitation" button | 456c3eb2-d9f9-4d08-b419-9776dad6552d |
| Calendly | Onboarding step 6 of 6 | Choice cards for meeting location (Zoom, Google Meet, Teams, In-person, Phone) with progress bar | (from location-switcher results) |
| GetYourGuide | Product detail | Star rating, "Likely to sell out" red tag, price per person, guest count selector, date selector, "Check availability" CTA; Highlights, Includes, Meeting point sections | 451eb9be-f8c1-470c-b953-d98a3ad2cfd2 |
| GetYourGuide | Reschedule activity | Right panel: "Original selection" line, "Select date" control, two-month calendar, booking reference, meeting point | 98baebd4-f715-4323-b368-6ca68c5973a4 |
| GetYourGuide | Results map | Left list of 3 results (photo, rating, duration, "From $X"); right map with price/count pins and "3 available activities" callout | a5478d0b-c08c-4c86-b3ea-df2b2a51f0e1 |
| Sweatpals | Schedule (list view) | Header with title, "All types" filter, view toggle (list, calendar, grid); week strip with selected day; rows: time, duration, title, "Event" type chip, host avatars, "Free" label, black "Book" button | 05e9f0a6-db81-4efa-aa67-1ae733110c67 |
| Sweatpals | Schedule (calendar view) | Dark admin week grid with hour rows and a booked block | c2e1c5aa-eab9-4bc9-9b3e-c8ed15aa96dd (admin, see note) |
| Sweatpals | Location picker | "Location" popover: search, "Use current location", city list | c87d39d0-bc0f-4ab4-b94e-0e81837d892c |
| Sweatpals | Date chips and calendar popover | Chips: Today, Tomorrow, Wed 8, Thu 9, Fri 10, Sat 11, Choose Date, Filters; calendar popover with Clear / Save | 06572b00-05f4-4153-bac9-c31d3b8cd038 |
| Sweatpals | Overview analytics (admin) | KPI row, member lists, "Churn risks" empty card | (admin, from Strava query) |
| Emergent | Streak modal | Account settings modal; streak stepper (7 day dots with reward icon); "Your streak" count; "Saves left" with use button; month calendar with streak days highlighted | ff726f2a-1309-44ef-86bb-73ee88b0dbb3 |
| Toggl Track | Weekly report | Stat row (Total, Billable, Average daily, Profit); line chart; filter chips | 693f2bf7-eb86-4b73-b15d-d65b7d645b70 |
| Toggl Track | Week calendar | Left nav with sections (Track, Analyze, Manage, Admin); week grid with hour rows and timer | 7f351a15-00e3-4530-acdd-e7384130f544 |
| lululemon | Membership benefits | Tier progress bar (Collective, Plus, Pinnacle), "Away from unlocking" amount, three benefit cards with icons, "Explore All Levels" / "View All Benefits" links | 5eaeb751-d5db-48b1-9452-bd3bdcd4b881 |
| lululemon | Country and currency picker | Right slide-over list grouped by region with currency codes | 33e06f3a-67b7-4b20-a7ab-dfb0342e8875 |
| Zoho CRM | Home dashboard | "Welcome" heading; "My open activities for today" dropdown; overdue items in red; table with related record and status | a69dd29d-8619-4436-ba9b-99793c17c9fa |
| Shopify | Add location | Location details card (Name, Address, Physical storefront toggle), Fulfillment toggle | 237e30e0-508c-40c6-8d1a-5c2cb56109c3 |
| H&M | Store locator | Search box with dropdown suggestions; map with count pins; list of stores with address and "+" action | c93aa1a9-66cb-48af-b6b3-a64e5958a404 |
| Zillow | Property map floor switcher | Dropdown "Floor: 2 (6 units)" with radio list and Done; floor-plan map with highlighted units; sticky "Book tour now" CTA | 68511b11-862d-46b5-8327-0f4c22433e4d |
| Square | Staff availability grid | Team-member rows by weekday columns; green "Available all day" block | 784bbf80-5fb1-4250-af8f-5e15f49745c3 |
| Square | Preorder settings modal | Segmented control "Single date / Date range"; date and time fields; cutoff fields | f80c7681-8e45-4ad3-8475-0b9ea227ae70 |
| HoneyBook | Consultation call scheduler (builder) | Booking page builder; month grid with dot markers for available days; time pills in AM and PM groups | 396402ad-7ecd-4a99-8462-e6fa561d82fe |
| Zillow | Tour availability form | Stepper (8 steps) with progress; date row, start and end time, "Add a day" | ea123c30-5911-46d9-ba35-ed36ef56d09f |
| Turo | Date-range picker | Two-month calendar popover with Reset and Save | 08091b8f-b51a-423c-bbb0-aac8b7cfc233 |
| Klaviyo | Change plan modal | Full-screen modal: plan blocks with current plan line, unit selectors, payment summary card with "Today's total", "Continue to payment" | b0d877ea-542e-4cfa-bcef-afd5f04c2aa5 |
| Workable | Upgrade plan options | "Current plan" card; three plan cards with billing toggle (Monthly / Annually) and a "Chosen by 56% of businesses" badge; struck-through old price | 3d65929e-3894-47b4-a1a6-ddecdff4a950 |
| Relevance AI | Manage your plan | Four tier columns; current tier labelled "Selected"; "Upgrade" buttons; inline notice "This feature is only available on the Pro plan" | 8ab72bfc-9b1c-4c7e-a7e8-15e6508f26b4 |
| QuickBooks | Upgrade comparison | Feature matrix (rows = features, columns = tiers), "CURRENT PLAN" tag, "Stay on plan" and "Choose plan" buttons | 5e1fb742-919a-4370-980a-e4923d2967d8 |
| Chatbase | Plans | "Current Plan" badge; Monthly / Yearly toggle; tier cards with feature checklists; "Cancel plan" link | 462e1bba-7b20-4216-9430-df2259d882dc |
| Neon | Change plan modal | Three tiers side by side, current tier shows "Current plan" disabled button, usage-based price per unit, "See full pricing details" link | a775b481-bdc0-465a-a179-556cfb6ffe3c |
| Base44 | Plan and subscriptions | Summary card: plan, credits, price, next billing date, payment method (card brand and last 4); subscriptions table with status pill "Auto Renew Off" and "Turn On" link | 7bb184bd-5b04-4b9c-b89e-d3d74eab1b31 |
| Canny | Billing | Current plan card, billing card (next cycle, status, card), "Change your plan" with Pay monthly / Pay yearly toggle | 856d06a3-14ee-426e-aa5f-ff2e08db4bd3 |
| Buffer | Billing (trial) | Top banner "You have 14 days left on your free trial"; plan line with "Change Plan" button; info cards (First bill after trial, Channels, Users) | 15a19cc8-a36a-472b-b50e-930d28427a4c |
| Bloom | Billing | Plan name and price; credits; "Renews on" date; billing and payment card with "Manage" button; invoices table with download icons | 2f3777ff-a65c-4e57-9747-dc208bf7362d |
| Magnific | Plan and billing | Plan line with price and "Upgrade plan" / "Change to annual billing"; credits progress bar with "Spent / Available"; billing info; payment details with "Update payment details"; collapsed "Danger zone" with "Cancel a subscription" | e76315e0-e935-479b-90c8-3b5984cc53b3 |
| Calendly | Event types list (scheduling) | Event cards with a coloured left stripe per event type, one-line meta (duration, location, host), "Copy link" action, "Shared" section | de486dbe-3dc9-4246-bd97-4ff523196b22 |
| GetYourGuide | Booking detail (guest count) | Right panel "How many people are now joining?" with stepper; "Your Booking" block with booking reference, PIN, validity, price | 22d9567e-1d99-4dcd-b2da-8bb6290e5863 |
| GetYourGuide | Empty bookings page | "Upcoming bookings: No tickets yet. Once you make a booking, you'll find your tickets here." Then "Past and canceled bookings" section with its own empty line | 32c1fed4-b93a-49e8-b444-faef98b10e59 (see note) |
| GetYourGuide | Updates modal | Centered modal list of updates: icon, bold headline, date, red unread dot per row, "mark all read" check icon at top right | c6695591-26d3-4f10-9676-7be69eab5e3c |
| Care.com | Household page | Right column sections (Children, Adults, Pets, Home), each with an "Add" link at right and a row per person (role label such as "Primary contact") | fdc1ca9c-0915-4eb3-83d7-3c68ea36323c |
| Instacart | Family account | Perks bullets; "Family" list with role labels (Owner, Invited); "Add member" row with "2 invites left"; note that only the owner can invite | 118c3f00-916e-4795-8fdf-ccbfdfeb710e |
| ChatGPT | Invite family member modal | Email field; radio group "This person is: My parent or guardian / My child"; short privacy note under the choice; Cancel and Send buttons | 52d29f37-d34b-49db-86c8-d1387b8b6a15 |
| Origin | Household and partner section | Account section with "Add dependent" button; "Add Partner" primary button with feature list | 9d2cba64-74eb-44f2-b82e-5de471c6348e |
| komoot | Account settings with safety contacts | Left settings list in a card; right content card with two tabs ("Manage contacts", "Added you"); empty line "Nobody has added you as a safety contact yet" | c059e466-87b4-4345-84a7-6e3f9e55463a |
| Sprig | Empty list state | Centered line illustration, "Your studies will appear here", "Get started by adding your first study", "New Study" button at top right | 20b41041-1173-4e0f-af93-10be683f33e1 |
| Customer.io | Empty list state | "You don't have any Webinars yet.", short description, two buttons (Add, View Setup Guide) | de105d2b-545a-4083-acc3-696784f32879 |
| Quo | Activity panel | Tabs (All activity, Internal threads, Tasks); list rows with icon, title and time; "Marked all activities as read" toast | 227d42a3-ba11-40fb-8555-69335f3030cb |
| Plane | Inbox dropdown | Header "Inbox" with filter icons; tabs (All, Mentions); rows with work item id, title, relative time | 469b9034-45f5-4e74-a046-123d2a9c8d44 |
| Klaviyo | Notifications dropdown | Header "Notifications"; rows with bold title, one-line sub text, relative time | c07fbefe-009d-4042-bbf8-e696e3ea4561 |
| Delphi | Notifications modal | Centered modal; rows with green check or blue status icon, time at right, bold question text | 11350c17-180f-437c-a48d-384f653b477e |
| Basecamp | Invite confirmation | Green check, "Invitation emailed to ...", primary "Set up which projects they can see", secondary "Not now, I'll do it later" | 7605dd73-96bb-4f75-8079-be75cf86e10e |
| Base44 | Add guest vs member dialog | "Not a workspace member" with two options: "Add as guest" (access to one app) and "Add to workspace" (full member) | 60411cf5-4159-4231-9ac9-671f8911be82 |
| Dropbox Dash | Invite sent | Centered success modal with email chip and "Done" | 34477beb-db8a-4562-8e72-63123c9c7ffe |
| MagicPath | Invitation accepted | Centered card, green check, "Go there" button | 369074e8-55c4-4d03-8795-95d1955b7976 |

Note on the Sweatpals admin screens: they show the operator side. Use them for layout reference only. The member side differs.

## 2. Flow catalog

Each flow lists the steps seen in the sources. Steps marked "not observed" were not in any returned screen.

### 2.1 Class booking (browse to confirmation)

1. Schedule or list view. Date strip or chips select the day. (Sweatpals schedule, 05e9f0a6; Sweatpals date chips, 06572b00.)
2. Filter by type, location, or other field. Filters sit in a left sidebar or a dropdown. (ClassPass filter sidebar, e6b9ef53; Sweatpals "All types" dropdown.)
3. Select a row or card. It opens the detail view. (GetYourGuide product detail, 451eb9be; Meetup event detail, b5390b55.)
4. Check availability. A "Checking availability, please wait..." modal shows while the list loads. (ClassPass, de3abbfb.)
5. Choose quantity and date where needed. (GetYourGuide "Adult x 1", "Select date", 451eb9be.)
6. Primary action: "Book" (Sweatpals), "Attend online" in a sticky bar (Meetup), "Check availability" then book (GetYourGuide).
7. Confirmation modal or page. Meetup shows "You're going!" with the event card and a share action. Calendly shows "You are scheduled!" with a summary card and "Open Invitation". (Meetup 4f1c7595; Calendly 456c3eb2.)
8. Guest prompt after booking. Meetup asks the member to share a guest link when the booking has guests. (Meetup 4f1c7595.)

### 2.2 Waitlist

- Not observed. No returned screen showed a full class with a join-waitlist action.
- Closest pattern: Meetup "4 seats left" badge on card (Meetup event grid). GetYourGuide "Likely to sell out" tag on the product card.

### 2.3 Cancel and reschedule

- Cancel: not observed as a class cancel flow.
- Reschedule (GetYourGuide, 98baebd4): right panel titled "Reschedule activity" shows "Original selection" (date and time), then "Select a date for your activity", then a two-month calendar. Past dates are greyed.
- Subscription cancel (Magnific, e76315e0): cancel sits in a collapsed "Danger zone" block at the bottom of the page.

### 2.4 Court or resource reservation (time-slot grid)

- Playtomic: not returned.
- Closest observed patterns:
  - Calendly 2-pane slot picker (254dc09b): event summary left; calendar; time list; "Next".
  - HoneyBook scheduler (396402ad): AM and PM groups of time pills; dot markers on available days.
  - Square weekly availability grid (784bbf80): rows per person, columns per weekday, blocks for available time. This is an admin view.
  - Mercor availability (2b92cf81): date multi-select with per-date hours and "I'm unavailable" link.

### 2.5 Personal training booking

- Not observed as a PT flow. Use the Calendly 2-pane slot picker (254dc09b) as the closest reference.
- Calendly scheduling flow (57876292): event details, time zone, slot list, confirmation.

### 2.6 Freeze or pause membership

- Not observed. No returned screen showed a pause or freeze option, including the Peloton-style query.
- Closest: Base44 subscription row with "Auto Renew Off" and a "Turn On" link (7bb184bd). Use the same status-and-toggle pattern for freeze state.

### 2.7 Change plan

1. Open the plan area from a current-plan card. (Chatbase 462e1bba; Canny 856d06a3.)
2. Show the current plan with a "Current plan" tag or badge. (Workable 3d65929e; Neon a775b481; QuickBooks 5e1fb742.)
3. Choose billing period (Monthly / Annual). (Workable; Chatbase; Canny.)
4. Compare tiers in cards or in a feature matrix. (QuickBooks 5e1fb742 feature matrix; Relevance AI 8ab72bfc tier columns.)
5. Show the new total before confirm. (Klaviyo b0d877ea: "Today's total" line.)
6. Confirm with "Continue to payment" or "Upgrade". (Klaviyo; Relevance AI.)

### 2.8 Add family member

1. Open the household or family page. Each section has a visible "Add" link. (Care.com fdc1ca9c; Instacart 118c3f00.)
2. Show each member as a row with role label (Owner, Invited, Primary contact). (Instacart 118c3f00; Care.com fdc1ca9c.)
3. Show remaining invites in the add row ("2 invites left"). (Instacart 118c3f00.)
4. Ask for the relationship type with radio buttons before sending. (ChatGPT 52d29f37: "My parent or guardian" / "My child".)
5. Send the invite and show a success state. (Dropbox Dash 34477beb; Basecamp 7605dd73.)
- Dependent versus adult: Base44 dialog (60411cf5) offers "Add as guest" or "Add to workspace". Use the same two-choice pattern for "Add as guest" versus "Add as member".

### 2.9 Guest pass

- Partial: Meetup RSVP modal (4f1c7595). After booking with guests, the modal says the guest link is recommended. It has a "Share link" button.
- Invite form fields not observed.
- Invite success state: Basecamp (7605dd73) and Dropbox Dash (34477beb). Both show a green check and a "Done" or "Set up" next step.

### 2.10 Digital check-in

- Not observed as a member screen.
- Sweatpals admin sidebar has "Front Desk" group with "Check-in" and "Point of Sale" (05e9f0a6 family). This is a staff view. Do not copy it into the member app.

## 3. Pattern catalog by area

### 3.1 App shell

- Left sidebar, grouped with small section labels. Seen in: Toggl Track (7f351a15), Zoho CRM (a69dd29d), Base44 (7bb184bd), Sweatpals admin (c2e1c5aa).
- Top bar with logo, search or location field, icon buttons (notifications, help), avatar at right. Seen in: ClassPass (f7b535cb: "Gifts", "Videos", "Upcoming", credits count, avatar), Meetup (b5390b55: search, location, bell, avatar), Sweatpals (05e9f0a6: location pill, icon buttons, avatar).
- Settings pages use a left list nav with a card on the right. Seen in: Meetup account (a3a6aeaf), Shopify location settings, Base44 settings.

### 3.2 Dashboard (home)

- Stats row at top: Toggl (693f2bf7) shows Total, Billable, Average daily, Profit as four equal cells with dividers.
- Task list with date and status: Zoho CRM (a69dd29d) shows "Overdue" group in red, then "Today" group.
- Streak and reward strip: Emergent (ff726f2a) shows a row of 7 day dots and a reward icon at the end, plus "Your streak" number and a month calendar with highlighted days.
- Tier progress: lululemon (5eaeb751) shows a three-segment bar with the next-tier amount ("Away from unlocking..."), then benefit cards.

### 3.3 Schedule

- List view grouped by date. Row: time (bold) and duration below it, title, type chip, host avatars, price or "Free", action button at right. Seen in: Sweatpals (05e9f0a6).
- Date chips above the list: Today, Tomorrow, weekday chips, "Choose Date", "Filters". Seen in: Sweatpals (06572b00).
- View toggle group (list, calendar, grid) at right of header. Seen in: Sweatpals (05e9f0a6).
- Week-hour grid for admin: Toggl (7f351a15), Sweatpals (c2e1c5aa). Hour labels at left, blocks as coloured events.

### 3.4 Class card

- Video-style card: 16:9 thumbnail, duration badge in bottom-right corner, title (1 line), instructor name below in smaller type. Seen in: ClassPass (f7b535cb, e6b9ef53).
- Event card: photo top, date line in small caps above title, host name, attendee avatars with count, "seats left" badge over photo. Seen in: Meetup (organic gardening results). Badge text example: "4 seats left".
- Tag for scarcity: GetYourGuide (451eb9be) uses a red "Likely to sell out" tag at top of price card.
- Colour coding by type: Calendly event types (de486dbe) use a coloured vertical stripe at the left edge of each card, one colour per event type. Use the same approach for class type in the schedule.
- Badges on cards: GetYourGuide (c6695591 and the home results) shows "Likely to sell out" in red and "Official ticket" in a dark chip on the photo.
- Intensity, instructor avatar on class card, and a capacity meter: not observed.

### 3.5 Class detail

- Hero image or photo collage at top. Seen in: GetYourGuide (451eb9be), Meetup (b5390b55).
- Key facts row with icons: duration, location, price. Seen in: Calendly (254dc09b), Meetup (b5390b55).
- Sticky bottom action bar with price, secondary icon buttons (save, share) and primary button. Seen in: Meetup (b5390b55).
- Sections: Highlights, Full description, Includes, Meeting point, FAQ accordion. Seen in: GetYourGuide (451eb9be).
- Host block with avatar and name. Seen in: Meetup, ClassPass (instructor name in card).

### 3.6 Location card and switcher

- Studio card: photo at left (about 1/4 width), name, address, star rating with count, tags (category names), "Safety guidelines" trust badge. Right side: description. Seen in: ClassPass (df681198).
- Map beside list: list left, map right, pins with counts, selected pin callout. Seen in: ClassPass (df681198), GetYourGuide (a5478d0b), H&M (c93aa1a9).
- Location search: text field with dropdown of matches, "Use current location" option, then city list. Seen in: Sweatpals (c87d39d0), H&M (c93aa1a9), Threads (9459dfd3).
- Region-grouped selector with expand and collapse rows and currency code at right. Seen in: lululemon (33e06f3a).
- Floor selector: dropdown with radio options and count per option, then "Done" button. Seen in: Zillow (68511b11). Use this pattern for picking a court level or club floor.
- Location settings form: name, address, toggle for "Physical storefront". Seen in: Shopify (237e30e0).

### 3.7 Reservation grid (time slots)

- Two-pane: left event summary, right calendar plus time list. Selected date fills dark blue circle. Time list in a single column with equal-height buttons. Seen in: Calendly (254dc09b, 57876292).
- AM and PM groups with headers. Seen in: HoneyBook (396402ad).
- Time buttons show a green dot when the member is free. Seen in: Calendly (254dc09b).
- Time zone selector below calendar. Seen in: Calendly (254dc09b), GetYourGuide meeting point block (451eb9be).
- Date-range or multi-date picker with Reset and Save. Seen in: Turo (08091b8f), Square preorder (f80c7681).
- Multi-date availability with per-date hours and "I'm unavailable" link. Seen in: Mercor (2b92cf81).
- Week grid of team-member rows by weekday columns with block fills. Seen in: Square (784bbf80).

### 3.8 Account and billing

- Plan card: plan name as large text, price line, credits or usage, renewal date. Seen in: Bloom (2f3777ff), Base44 (7bb184bd), Canny (856d06a3).
- Billing card: payment method line with card brand and last 4 digits, "Update payment details" button. Seen in: Magnific (e76315e0), Base44 (7bb184bd).
- Invoices table: date, amount, status pill (Paid), download icon. Seen in: Bloom (2f3777ff), Meetup (a3a6aeaf).
- Status pill for subscription state: "Subscription ended" (red pill, Meetup a3a6aeaf); "Auto Renew Off" (amber pill, Base44 7bb184bd).
- Danger zone: collapsed block at bottom with red title and one action. Seen in: Magnific (e76315e0).
- Trial banner across top with days left and CTA. Seen in: Buffer (15a19cc8).

### 3.9 Empty and error states

- Success modal with green check and one primary button. Seen in: Basecamp (7605dd73), MagicPath (369074e8), Dropbox Dash (34477beb).
- Loading modal with spinner and short text. Seen in: ClassPass (de3abbfb) "Checking availability, please wait...".
- No bookings empty state: GetYourGuide (32c1fed4) shows the heading "Upcoming bookings", one line "No tickets yet. Once you make a booking, you'll find your tickets here.", and a separate "Past and canceled bookings" block with its own empty line. Use this layout for "My classes" and "Past visits".
- Empty list with one CTA: Customer.io (de105d2b) shows a line "You don't have any ... yet.", one line of help, and two buttons. Sprig (20b41041) uses an illustration above the text and one primary button in the top bar.
- Empty member list: komoot (c059e466) shows "Nobody has added you yet" in a card, with a tab for the other direction.
- Not observed: error state with retry, offline state, and empty state for no class results after a filter.

### 3.10 Notifications

- Bell icon in top bar with red dot count: Meetup (b5390b55), Zoho CRM (a69dd29d), Plane (469b9034), Klaviyo (c07fbefe).
- Panel as dropdown from bell: Plane inbox (469b9034) with tabs All and Mentions; Klaviyo (c07fbefe) with title and sub text per row.
- Full modal list: GetYourGuide Updates (c6695591) with red unread dot per row and "mark all read" control.
- Activity panel with tabs and a list pane on the right: Quo (227d42a3). Tabs are All activity, Internal threads, Tasks.
- Not observed: booking reminder notification text, message thread inside the notification panel.

## 4. Specific design rules we should adopt

1. Show each class or event as a card with a 16:9 image, duration badge at bottom-right, and instructor name below the title. Source: ClassPass f7b535cb.
2. Put the time, duration and class name on one row in the schedule list. Show time in bold and duration under it. Source: Sweatpals 05e9f0a6.
3. Use one row per class in the schedule list. Do not use a card per class on the day list. Source: Sweatpals 05e9f0a6.
4. Put date chips (Today, Tomorrow, weekdays, Choose date) above the list. Source: Sweatpals 06572b00.
5. Add a view toggle with list, calendar and grid options. Source: Sweatpals 05e9f0a6.
6. Put filters in a left sidebar with grouped checkboxes on desktop. Use a single "Filters" button on narrow screens. Source: ClassPass e6b9ef53.
7. Show a "Checking availability" modal with a spinner while the schedule loads. Source: ClassPass de3abbfb.
8. Show credits or price in a button at the end of each schedule row. Source: ClassPass de3abbfb ("3 credits", "4 credits").
9. Show a "seats left" badge on the card image when fewer than five seats remain. Source: Meetup event grid ("4 seats left").
10. Show a red "Likely to sell out" tag on the price block when inventory is low. Source: GetYourGuide 451eb9be.
11. Use a sticky bottom action bar on class detail with price, save or share, and the primary button. Source: Meetup b5390b55.
12. Show a two-pane slot picker on desktop. Put the event summary left and the calendar plus time list right. Source: Calendly 254dc09b.
13. Group time slots under AM and PM headers. Source: HoneyBook 396402ad.
14. Show a green dot on time slots that are free. Source: Calendly 254dc09b.
15. Show the time zone selector under the calendar on every booking page. Source: Calendly 254dc09b.
16. Show the confirmation page with a green check, "You are scheduled!" heading, and a summary card with date, time and time zone. Source: Calendly 456c3eb2.
17. Put a "Share link" action in the booking confirmation when guests are included. Source: Meetup 4f1c7595.
18. Use a location list on the left and a map on the right on desktop. Put count pins on the map. Source: GetYourGuide a5478d0b, ClassPass df681198.
19. Show a location search with "Use current location" at the top of the dropdown and a city list below. Source: Sweatpals c87d39d0.
20. Show floor or court-level selection as a dropdown with radio options and a count per option, plus a "Done" button. Source: Zillow 68511b11.
21. Show the current plan as a card with a "Current plan" badge, and disable its action button. Source: Neon a775b481, Workable 3d65929e.
22. Show a Monthly / Annual toggle above plan cards. Source: Workable 3d65929e, Canny 856d06a3.
23. Show the new total in a summary card before the confirm button on any plan change. Source: Klaviyo b0d877ea ("Today's total").
24. Show a feature matrix when comparing three or more plans. Use check marks per feature. Source: QuickBooks 5e1fb742.
25. Show plan status as a pill with text (for example "Subscription ended" or "Auto Renew Off"). Use a second action to fix the status. Source: Meetup a3a6aeaf, Base44 7bb184bd.
26. Show the card brand and last four digits in the billing card. Source: Base44 7bb184bd, Magnific e76315e0.
27. Put cancel plan inside a collapsed "Danger zone" block at the bottom of the account page. Source: Magnific e76315e0.
28. Show a trial or credit banner at the top of the page with days left and a CTA. Source: Buffer 15a19cc8.
29. Show a stat row with four cells and dividers on the home page. Source: Toggl 693f2bf7.
30. Show a streak as a row of day dots with a reward icon at the end. Source: Emergent ff726f2a.
31. Show a tier progress bar with the amount left to the next tier. Source: lululemon 5eaeb751.
32. Use a green check and one primary button on success screens. Source: Basecamp 7605dd73, MagicPath 369074e8.
33. Show a choice between guest and full member when adding a person who has no account. Source: Base44 60411cf5.
34. Use a region-grouped location list with a currency code at right for multi-region selectors. Source: lululemon 33e06f3a.
35. Give each event type a coloured left stripe on the schedule card. Use one colour per class type. Source: Calendly de486dbe.
36. Show the booking reference and PIN in a "Your Booking" block on the booking detail. Source: GetYourGuide 22d9567e.
37. Show "Upcoming" and "Past and canceled" as separate blocks on the bookings page, each with its own empty line. Source: GetYourGuide 32c1fed4.
38. Show a red unread dot on each notification row and a "mark all read" control in the panel header. Source: GetYourGuide c6695591.
39. Put a relationship radio group in the invite-family modal before send. Source: ChatGPT 52d29f37.
40. Show invites left next to the add-member row. Source: Instacart 118c3f00.
41. Show the household as sections (Children, Adults, Pets, Home) with an Add link on each section header. Source: Care.com fdc1ca9c.
42. Show a guest count stepper in the booking detail right panel, labelled "How many people are now joining?". Source: GetYourGuide 22d9567e.

## 5. Anti-patterns to avoid

1. Do not show a loading state with no text. ClassPass uses "Checking availability, please wait..." in de3abbfb. Use the same explicit text.
2. Do not show a price or credit cost without the unit. Use "3 credits" or "$25 per person" (GetYourGuide 451eb9be).
3. Do not show past dates as active in a calendar. GetYourGuide greys them out (98baebd4). Keep that.
4. Do not hide a cancel action inside a menu on the plan page. Magnific puts it in a collapsed block (e76315e0). Use a clear collapsed section with a red title, and state the consequence.
5. Do not place the primary action off screen on long class pages. Meetup uses a sticky bar (b5390b55).
6. Do not place the filter controls in a long unbroken list. ClassPass groups filters into collapsible sections with labels (e6b9ef53). Keep that grouping.
7. Do not open two calendar popovers at once. Sweatpals opens its calendar as a popover from a date chip (06572b00). Close any open popover before a second one opens.
8. Do not use admin-only nav items in the member app. Sweatpals admin nav includes "Front Desk" and "Point of Sale" (05e9f0a6 family). Keep staff tools out of the member shell.
9. Do not use a red badge for good news. Use red only for overdue or ended states (Zoho a69dd29d, Meetup a3a6aeaf).
10. Do not center long text blocks. Keep descriptions left-aligned (GetYourGuide 451eb9be).
11. Do not show a map without a list. Pair every map with a list (ClassPass df681198, H&M c93aa1a9).
12. Do not show a multi-step onboarding without a progress bar. Calendly (step 6 of 6) and Zillow (step 6 of 8) both show progress.

## Coverage gaps

- Searched with no useful result: Mindbody (returned Calendly and GetYourGuide), Peloton (returned Base44 and Plane profile screens). Linear sidebar and command menu were not returned.
- Not observed in any screen: waitlist join, class cancel, membership freeze or pause, court grid for padel or tennis, PT booking, digital check-in pass, kids-club check-in, instructor avatar on class card, intensity indicator, capacity meter bar, command menu.
- Not run: `search_flows` and `search_sections`. Run a `search_flows` pass for class booking, waitlist, and freeze when the connector allows it.
