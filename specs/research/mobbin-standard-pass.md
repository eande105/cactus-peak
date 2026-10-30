# Mobbin standard pass: Cactus Peak Athletic

Run date: 2026-10-27. Mode: `standard` for every screen search. Output: `doc`.

## Run summary

- Total calls: 40. Screen searches on iOS: 19. Screen searches on web: 10. Section searches on web: 11.
- No flow searches were run.
- Not run as separate queries: "onboarding pick interests", "notification settings", "sidebar app dashboard", and "join waitlist". The waitlist screen appeared in the court-slot search (source 5 of search 12).
- "Mindbody class booking" returned no Mindbody screens. The closest query was search 16.
- No result carried an `ai_usage_notice`.
- Many results come from non-gym apps. ClassPass, Peloton, Strava, Equinox+, Fresha, Square, and Calendly gave the most useful gym or booking patterns.

---

## 1. Per search

Each entry lists the query, tool, platform, sources, and the layout I saw. Sources use the app name and the `mobbin_url` of the screen or section.

### iOS screens

**1. Peloton home.** Query: "Peloton home screen for workouts and classes". Tool: `search_screens`. Platform: iOS.
- Sources: Peloton [fe88d7fb](https://mobbin.com/screens/fe88d7fb-98f6-4a2e-a683-098523bf9666), Peloton [dea205e1](https://mobbin.com/screens/dea205e1-85f7-4a27-89bf-b0ea6af81816), Peloton [d20b11a8](https://mobbin.com/screens/d20b11a8-a278-4f16-8e96-450dc54dc520), Peloton [ddfccd1d](https://mobbin.com/screens/ddfccd1d-e5fa-430d-9fed-6e43f01b502b).
- Patterns: Class rows show a time at left, a "LIVE" tag, the title, and the instructor in caps with the discipline. Class cards use a 16:9 photo with the title over it. Category chips sit in a row (All, Strength, Meditation). The tab bar has Classes, Gym, Collections, Programs. A floating "FILTER" pill sits above the tab bar. Class detail has a red full-width "START" bar.

**2. Strava social feed.** Query: "Strava social feed screen of activities". Tool: `search_screens`. Platform: iOS.
- Sources: Strava [f9216faa](https://mobbin.com/screens/f9216faa-47b8-4b6c-9e69-6464b21c3d74), Strava [f75e89d7](https://mobbin.com/screens/f75e89d7-4088-478c-948b-c2af75795dba), Strava [dac568e6](https://mobbin.com/screens/dac568e6-1efa-4cbc-89fd-6a91d77e7633).
- Patterns: Activity post has an avatar and name at top, then the title. Three stats sit in one row (Distance, Pace, Time). A map thumbnail sits below. Kudos avatars and a like, comment, and share row close the card. Post actions appear in a bottom action sheet (Edit, Delete, Cancel).

**3. Activity summary with rings and weekly stats.** Query: "fitness activity summary screen with rings and weekly stats". Tool: `search_screens`. Platform: iOS.
- Sources: Nike Training Club [063c8530](https://mobbin.com/screens/063c8530-6eac-45ea-be78-38c9b9bececd), Future Pro [d4191871](https://mobbin.com/screens/d4191871-63e6-4dd8-a097-33f74563265e), WHOOP [cf930277](https://mobbin.com/screens/cf930277-904f-40d4-82df-5003e171613f), Noom [8de20416](https://mobbin.com/screens/8de20416-6923-4076-95e0-1bf711c0d8ba).
- Patterns: NTC uses segmented tabs (History, Achievements), then large totals ("3 Total Workouts", "62 Total Minutes") centered. Month headers carry a count on the right ("3 Workouts 62 Mins"). Future Pro uses a row per workout with an add button. No Apple Fitness screen returned.

**4. Equinox class schedule.** Query: "Equinox gym app class schedule screen". Tool: `search_screens`. Platform: iOS.
- Sources: Equinox+ [d64cb80e](https://mobbin.com/screens/d64cb80e-50c0-4ecf-a059-172bf8a5b19f), Equinox+ [d02f6689](https://mobbin.com/screens/d02f6689-84a9-4dbf-9c07-25627d6a816b), Equinox+ [c7f0998e](https://mobbin.com/screens/c7f0998e-4fb8-4735-be31-164617717dd4).
- Patterns: Dark mode throughout. A small monospace caps eyebrow sits above the title ("PROGRAMMED SESSION"). The class detail has a top photo, title, coach row, a meta line ("Strength · Full Body Strength · 18 moves"), and a date line. Primary action is a white "Start Session" button with an outlined "Remove from cal" next to it. Home has a "What will you accomplish today?" headline and a horizontal goal-card row with a progress bar (for example, "1 / 3 Check-ins"). Removal uses a centered confirm sheet with a bold question and a white "Yes, remove class" button.

**5. Class booking day picker.** Query: "fitness class booking app class schedule list with day picker". Tool: `search_screens`. Platform: iOS.
- Sources: Garmin Connect [6b9b2400](https://mobbin.com/screens/6b9b2400-174d-42f9-ba44-eebd8ea64f22), Nike Training Club [39948017](https://mobbin.com/screens/39948017-3572-4085-a412-e9e923b3c303), Fresha [b79eb06d](https://mobbin.com/screens/b79eb06d-9b03-42fa-9b40-0c88f2c97d3a).
- Patterns: Garmin shows a week header with prev and next arrows and a date range ("12 Apr 2026 – 18 Apr 2026"). Each day row has a date tile at left, a title, and a status line ("Completed" or "Next Workout"). NTC "Scheduled" lists cards with a thumbnail, a bookmark icon, and a calendar-check icon. Fresha time picker shows a horizontal day row (Wed 19 selected) above a vertical list of time rows.

**6. ClassPass class schedule (studio list).** Query: "ClassPass class schedule screen with class cards and times". Tool: `search_screens`. Platform: iOS.
- Sources: ClassPass [fedc38b2](https://mobbin.com/screens/fedc38b2-31b9-4d52-93e0-d8d5ef83d3dc), ClassPass [fec8b7d0](https://mobbin.com/screens/fec8b7d0-e249-42ca-ad56-d7f4f4dd4b91), ClassPass [fba3e09f](https://mobbin.com/screens/fba3e09f-c48b-4b84-b596-8332ed761227).
- Patterns: Day tabs are text only (Today, Wed 18, Thu 19). The selected tab has an underline. Each row: time in bold, duration in grey below, class name bold, instructor under it. A boxed number at right shows the credit cost. A lock icon marks classes with a requirement. Empty state shows a calendar illustration with "Time to book!" and a note.

**6b. ClassPass class detail and booking states (same search as 6).** Tool: `search_screens`. Platform: iOS.
- Sources: ClassPass [fa71be76](https://mobbin.com/screens/fa71be76-bf15-43b3-af2f-e31d84bd6b22), ClassPass [e1bffb81](https://mobbin.com/screens/e1bffb81-52a4-439d-9ee0-b16263f987ae), ClassPass [f26c40c4](https://mobbin.com/screens/f26c40c4-0647-402c-bf4f-ac0169a20ee6).
- Patterns: Hero photo with a carousel count ("1/4") and share and favorite icons at top. A grey pill "VACCINATION REQUIRED" sits above the title. Title is large bold. Rating line: "4.9 ★ (7500+) Excellent". Two outlined buttons sit side by side (Invite, Add). A sticky bottom bar shows the credit cost at left and a blue "Reserve" button at right. After booking, a blue top banner says "You successfully purchased 2 credits", and the bar shows "8 credits Reserved" with a grey "Cancel" button. Cancel shows a red button with a spinner and "We'll refund your 8 credits."

**7. Fitness studio detail with gallery and reviews.** Query: "fitness studio detail page with photo gallery, amenities and reviews". Tool: `search_screens`. Platform: iOS.
- Sources: WHOOP [f7ce5e9e](https://mobbin.com/screens/f7ce5e9e-6478-48e0-a1c2-7bd3389c7033), Fresha [a659b05e](https://mobbin.com/screens/a659b05e-4558-4a00-827f-927eb225db13), Garmin Connect [eebcc1fb](https://mobbin.com/screens/eebcc1fb-53e2-4486-bcaa-2f2fdd50a445).
- Patterns: WHOOP workout detail has a hero photo with the title over it, then a row of three stats ("65 min", "9 exercises", "32 sets"). Labels are small caps under each value. A green outline "NEXT" button sits at the bottom. Fresha venue detail has a sticky bottom bar with "57 services available" and a black "Book now" button. The top has a round back button and a heart.

**8. Gym membership card with barcode.** Query: "gym membership card screen with barcode and member number". Tool: `search_screens`. Platform: iOS.
- Sources: Chick-fil-A [b5799f72](https://mobbin.com/screens/b5799f72-a7aa-442c-bcf8-8198ce9275ce), CLEAR [3cc1d99f](https://mobbin.com/screens/3cc1d99f-7942-48b5-825a-3301157d164a), pushr [7c8e5492](https://mobbin.com/screens/7c8e5492-4497-4a9f-a106-d7911c9b34a7).
- Patterns: Chick-fil-A shows a full red screen with "YOUR MEMBERSHIP NUMBER" in white caps, then a large number. CLEAR member card shows the brand at top, the status "Member" at right, and a QR code in the lower part of the card. pushr shows a dark card with name, a stat row, and a small label per field. No gym card with a barcode appeared.

**9. Add pass to Apple Wallet.** Query: "add pass to Apple Wallet button on a ticket or membership screen". Tool: `search_screens`. Platform: iOS.
- Sources: Neo Financial [8c0feb4f](https://mobbin.com/screens/8c0feb4f-0ece-444a-88a5-90ffb1a39c08), Luma [fd60dbd4](https://mobbin.com/screens/fd60dbd4-6f2f-43e8-a2a8-dbf6954b3f59), Zip [878d73af](https://mobbin.com/screens/878d73af-ba85-48d5-8ddc-19ef6c9f8adf), Fly Delta [864e798d](https://mobbin.com/screens/864e798d-fa6b-4ea6-aa36-27b5a17fbebd).
- Patterns: The Wallet button is a full-width black pill with the Wallet icon and "Add to Apple Wallet". It sits below the pass on Luma (ticket QR) and above a "Maybe later" text link on Neo. Zip places it under the card number block with help links below. Lloyds uses a smaller button.

**10. Place busyness and popular times.** Query: "place detail screen showing popular times busyness bar chart by hour". Tool: `search_screens`. Platform: iOS.
- Sources: corner [b3ef2e90](https://mobbin.com/screens/b3ef2e90-449e-4057-84d4-f6a18c1f8aac), Fresha [e3a593d6](https://mobbin.com/screens/e3a593d6-df18-42fe-a403-da9fb695e7d2), Fresha [a659b05e](https://mobbin.com/screens/a659b05e-4558-4a00-827f-927eb225db13).
- Patterns: No popular-times bar chart by hour appeared. corner shows a card with the question "is this place crowded?" and two pill buttons, YES and NO. Fresha "Other" tab lists opening hours with a green dot per day and today in bold. Fresha service list shows a "Closed · Opens 10.00 am" line.

**11. Map with bottom sheet list of venues.** Query: "map view with bottom sheet listing nearby venues". Tool: `search_screens`. Platform: iOS.
- Sources: Fresha [9c6ec1d7](https://mobbin.com/screens/9c6ec1d7-3de4-4f92-9897-8b8b28e5b17c), corner [104a5a32](https://mobbin.com/screens/104a5a32-9017-498b-8b7d-4fbde9bfb35a), Chick-fil-A [d596acd9](https://mobbin.com/screens/d596acd9-31a5-48b5-ba61-1df7e240db41), Tripadvisor [03568175](https://mobbin.com/screens/03568175-b53e-41ab-9def-70c217675e6f).
- Patterns: Fresha has a search pill at top, a map, and a sheet with a drag handle. Under the sheet's chips (Venues, Best match, Price) the count line reads "51 venues in map area". Cards show a photo carousel with dots, a "Best in class" badge, and a rating at right. Chick-fil-A has a "Select a restaurant" sheet with "Nearby" section and a red "Start my order" button. Tripadvisor shows an overlay "No results found for this area."

**12. Court or padel booking time slots.** Query: "Playtomic padel or tennis court booking screen with time slots and duration". Tool: `search_screens`. Platform: iOS.
- Sources: Swiggy [3fef9c41](https://mobbin.com/screens/3fef9c41-a18c-4665-8bbc-ea387e375aad), Tripadvisor [b11db81a](https://mobbin.com/screens/b11db81a-d075-4c34-8060-97fa3fb65ab9), Structured [247f1d98](https://mobbin.com/screens/247f1d98-01a7-4e26-9e01-f7fb85b1800c), Fresha [f0d70080](https://mobbin.com/screens/f0d70080-560a-45b4-92d0-36b906228356).
- Patterns: No court or Playtomic screen returned. Swiggy shows a 2-column grid of time chips, each with a "10% off" tag, and a green "Proceed" bar. Tripadvisor shows time chips in a 4-column wrap with the selected chip outlined, then a total line and a green "Select" button. Structured has a segmented duration control ("1 | 15m | 30 | 45 | 1h | 1.5h"). Fresha "Join the waitlist" (this result) shows two date and time-of-day selects, an "Add another time" outline button, and a grey "Continue" until selections are valid.

**13. Pause subscription.** Query: "pause membership subscription screen with resume date picker". Tool: `search_screens`. Platform: iOS.
- Sources: PayPal [c3749ce9](https://mobbin.com/screens/c3749ce9-7155-4eb2-83cf-42668b842d19), Oportun [cf87ca10](https://mobbin.com/screens/cf87ca10-3b1e-4e9c-a7c3-e6038c66a3af), KOHO [3f1f2bca](https://mobbin.com/screens/3f1f2bca-6689-470c-a56e-e5844c2b28a9), Future Pro [ac5e1e1f](https://mobbin.com/screens/ac5e1e1f-eb71-4911-8961-6098a855bd42).
- Patterns: PayPal shows a bottom sheet with a pause icon, the bold question "Pause this recurring purchase?", a black full-width "Pause Purchase" button, and a blue text "Not Now". Oportun shows radio rows ("30 days until Jul 3") with a black "Pause goal" button, and a line saying the fee continues. KOHO shows a green pill "Goal Paused" at the top. Future Pro shows "Pending Cancellation" with a "Reactivate Membership" row.

**14. Family members list.** Query: "family plan screen listing members with avatars and manage access". Tool: `search_screens`. Platform: iOS.
- Sources: Instacart [f8bebd89](https://mobbin.com/screens/f8bebd89-05ab-4705-96ee-51fff034bd34), Lyft [449818e4](https://mobbin.com/screens/449818e4-cf2b-47ff-9189-dcc14f58bc7c), Grab [d600e281](https://mobbin.com/screens/d600e281-fb4b-40fd-8290-ca67876fb31f), talabat [891042e6](https://mobbin.com/screens/891042e6-38a8-4e03-b5ef-9d682494562f).
- Patterns: Instacart shows a row of circular avatars with names, a grey "+" circle for "Add member", and a caption "2 invites left". Lyft lists members with role labels ("Admin") and "Invite pending – Send a reminder?" in a magenta link. Grab lists members with an "Admin" role and a "You" badge. talabat shows "Plan members" with "You · Plan manager" and an outline "Invite" button.

**15. Workout streak.** Query: "workout streak counter screen with calendar of completed days". Tool: `search_screens`. Platform: iOS.
- Sources: WHOOP [db83268b](https://mobbin.com/screens/db83268b-206f-43b4-89ac-acb6f66cd699), BitePal [c6961180](https://mobbin.com/screens/c6961180-60fb-450b-88af-27755cdfd567), Noom [e8d88c93](https://mobbin.com/screens/e8d88c93-7fb9-4411-a5e2-1be6d3d0d8a5), pushr [2d9dedab](https://mobbin.com/screens/2d9dedab-7961-4927-ada0-5d9338d95bf7).
- Patterns: WHOOP shows the title "DAY STREAK", a subtitle, and seven day circles for the week. Missed days show an X. BitePal shows a large number and "day streak!" beside a flame illustration, then a month calendar with the active days highlighted. Noom shows a month grid with a streak-freeze note. pushr shows a row of seven day chips with check marks.

**16. Class booking screen with instructor and reserve.** Query: "fitness studio class booking screen with instructor, capacity and reserve button". Tool: `search_screens`. Platform: iOS.
- Sources: Future Pro [f02c3a7f](https://mobbin.com/screens/f02c3a7f-940b-4e92-a726-ee98eaa79d7e), Places [f4bead4f](https://mobbin.com/screens/f4bead4f-e77c-49a9-8317-a589026b2bd3), Grab [f2e361ca](https://mobbin.com/screens/f2e361ca-30de-43bf-a19d-7753c0fd5664).
- Patterns: Future Pro "Schedule Kickoff Call" uses a round coach photo at top, a short description, a row of weekday chips (selected one filled black), a time list in two columns, and a black full-width "Book Wed, Jul 1 at 10:45 AM" bar. Places has a date grid with "7-day window" and a black "Apply" button.

**17. Booking confirmed.** Query: "booking confirmed success screen with add to calendar and class details". Tool: `search_screens`. Platform: iOS.
- Sources: Swiggy [ced90a3d](https://mobbin.com/screens/ced90a3d-a220-4f7a-b25d-6d1c589e1a44), Insight Timer [ba656a70](https://mobbin.com/screens/ba656a70-b19b-42ff-a37e-41cfe13558e1), Fresha [8b05efdb](https://mobbin.com/screens/8b05efdb-3ca3-435f-b8d1-3de83f69f1b0), Tripadvisor [b8fde94c](https://mobbin.com/screens/b8fde94c-e6f3-4836-b357-0eaaf7608ba7).
- Patterns: Swiggy shows a green check, "Your table is booked!", and a summary card (Confirmed, date, time, guests, phone and map icons). Insight Timer "Attendance Confirmed" has a green check, a time line, a black full-width "Add to Calendar", and a grey "Share event" text link. Fresha shows a green pill "Confirmed", the date at large size, and four action rows (Add to calendar, Get directions, Send message, Venue details). Tripadvisor shows a green check, "You're all set", a confirmation number, and a dark green "My bookings" button.

**18. Home screen widget gallery.** Query: "home screen widget gallery preview for fitness app". Tool: `search_screens`. Platform: iOS.
- Sources: Cal AI [3d84df9c](https://mobbin.com/screens/3d84df9c-d2f6-4d39-9c45-1a9721b3d890), Nike Training Club [7abc6053](https://mobbin.com/screens/7abc6053-b1e1-41bd-8e09-16398a93ee70), BitePal [2d3ed72e](https://mobbin.com/screens/2d3ed72e-a87b-4559-975e-be7e21f2893b), WHOOP [3688ad6f](https://mobbin.com/screens/3688ad6f-ed24-4871-b55c-0ac639ce96b2).
- Patterns: Cal AI shows a sheet with a Home Screen or Lock Screen segmented control on top, a phone mockup, and a "Done" button at bottom. NTC shows a 2 by 2 grid of tiles. The large tile has the title "0 OF 6 WORKOUTS" in bold color. The small tile has an image and a date line. BitePal has a large wide widget and a small square widget with the same content. WHOOP shows a lock-screen live widget with heart rate and a timer.

**19. Live Activity on the lock screen.** Query: "Live Activity lock screen countdown for an upcoming workout session". Tool: `search_screens`. Platform: iOS.
- Sources: WHOOP [8e5c6a84](https://mobbin.com/screens/8e5c6a84-be67-48f2-89a1-4923f0a71f50), Bevel [ae6520ab](https://mobbin.com/screens/ae6520ab-36bb-4621-9fbf-aedd07ba9db7), BitePal [6367f897](https://mobbin.com/screens/6367f897-015b-4f82-8ce7-0b4d21b5b4d0), Nike Training Club [0ec4cee2](https://mobbin.com/screens/0ec4cee2-498c-424d-8442-c10d19ea657f).
- Patterns: WHOOP shows a dark rounded card with a heart rate value (77 bpm), a timer chip (0:15) at top right, a zone bar, and a three-value row (distance, brand, pace). BitePal shows a white card with a bold timer "0:00" and a progress bar with a meal icon. NTC shows a large timer "0:38" with a pause button at right.

### Web screens

**W1. Week calendar class schedule.** Query: "fitness class schedule week calendar grid with class blocks by day". Tool: `search_screens`. Platform: web.
- Sources: Square [61e61ca9](https://mobbin.com/screens/61e61ca9-6de7-4bde-8ac6-ead10874ed98), Calendly [54e3901e](https://mobbin.com/screens/54e3901e-5c39-4569-b618-5426f3d4b9ab), Sweatpals [05e9f0a6](https://mobbin.com/screens/05e9f0a6-db81-4efa-aa67-1ae733110c67).
- Patterns: Square scheduling uses a week grid. Team members are rows and days are columns. Each shift is a colored block with the role and time. Calendly "New meeting poll" uses a time grid with hour labels and a tooltip "Unavailable". Sweatpals schedule is a list grouped by date. Each row has time at left, a title, a "Free" label, and a black "Book" pill at right.

**W2. Cancel booking dialog.** Query: "cancel booking confirmation dialog with late cancellation fee warning". Tool: `search_screens`. Platform: web.
- Sources: GetYourGuide [1c409344](https://mobbin.com/screens/1c409344-c4a5-4b7c-b58e-2c22ffc0d7c0), Calendly [c3e2b97a](https://mobbin.com/screens/c3e2b97a-b2d4-47b8-9e97-65c731e8c1ff), Replit [b23bf4a5](https://mobbin.com/screens/b23bf4a5-fd6f-4941-b48a-962a96a2d4f4), Meetup [bd48b511](https://mobbin.com/screens/bd48b511-e4cc-4d58-a333-dd02689f4400).
- Patterns: GetYourGuide has a side panel "Cancel your booking" with a radio list of reasons, an "Other reason" text box, an outline "Reschedule instead" button, and a red "Continue with cancellation" button. Calendly "Cancel Event" has a short explanation, an optional message box, a grey "No, don't cancel" button, and a dark "Yes, cancel" button. Replit has a bulleted list of consequences with red X icons, a blue "Keep my subscription" button, and a text "Continue to cancel" link. Meetup has two radio choices and a black "Confirm" button.

**W3. Membership pause flow.** Query: "membership pause flow with reason selection and resume date". Tool: `search_screens`. Platform: web.
- Sources: Juicebox [336e3926](https://mobbin.com/screens/336e3926-76dc-454c-83ef-e06b6428e016), Skillshare [e1c0753f](https://mobbin.com/screens/e1c0753f-0dfc-4358-99d1-df979bab2a28), Unify [0ad44193](https://mobbin.com/screens/0ad44193-b8f4-4d6c-bbaf-1f97585d36fb), AutoSend [1bc1eda1](https://mobbin.com/screens/1bc1eda1-57f7-4a10-b1e0-f978eff974f0).
- Patterns: Juicebox "Let's hit pause." has a select for duration ("1 month"), a purple full-width "Pause Subscription" button, a line with the renewal date and the pause window, and two buttons at the bottom ("Go Back", "Decline Offer"). Skillshare shows a radio list of reasons (values for pausing), a text area, and a purple "Submit" button. Unify shows a confirmation with "Cancel" and a dark "Pause" button.

**W4. Change plan with prorated charge.** Query: "change subscription plan page showing prorated charge summary and new plan tiers". Tool: `search_screens`. Platform: web.
- Sources: Klaviyo [b0d877ea](https://mobbin.com/screens/b0d877ea-542e-4cfa-bcef-afd5f04c2aa5), Square [c1b701da](https://mobbin.com/screens/c1b701da-2166-4b48-ae96-aea5ca5a4355), Calendly [f41143d9](https://mobbin.com/screens/f41143d9-96a6-47a1-b760-8035e1758d86), Featurebase [539de2e4](https://mobbin.com/screens/539de2e4-81a3-4b9c-89fc-9239fd9c8212).
- Patterns: Klaviyo "Change Plan" is a modal. The left column has plan cards, each with a tier dropdown and a monthly price. The right column is a payment summary with Subtotal, Estimated Tax, Today's total, and a note "An upgrade will be applied if your active profile limit is exceeded." Square "Before you switch" lists changed fees, lost features, and ended campaigns, then "Stay on Square Plus" and "Next". Calendly billing shows three tier cards with a "MOST POPULAR" label on the middle card and a Yearly or Monthly toggle above.

**W5. Billing history table.** Query: "billing history page with invoices table, status badges and download links". Tool: `search_screens`. Platform: web.
- Sources: Mercury [36f606b5](https://mobbin.com/screens/36f606b5-2ee5-4b26-ba14-0204c5295576), Magnific [bef956a7](https://mobbin.com/screens/bef956a7-c7b0-41e5-9b0f-1d3dea4a6d07), Vercel [6d516db6](https://mobbin.com/screens/6d516db6-6810-4e5e-a37f-fb85c06eaee0), Base44 [909420e7](https://mobbin.com/screens/909420e7-06b1-4526-9d6c-bda5f3c4dd01).
- Patterns: Mercury has a table with sortable headers (Invoice #, Date, Customer, Status, Amount, Outstanding) and status labels "Open" and "Paid". Magnific shows a modal with a table (Product, Reference, Date, Amount, Status) and a per-row "Download" button. Vercel shows a list where each row has a status pill ("Paid", "Upcoming") and an ellipsis menu. Base44 shows a "Purchases" table with a green "Paid" pill.

**W6. Court or resource reservation grid.** Query: "court or resource reservation grid with time slots across courts". Tool: `search_screens`. Platform: web.
- Sources: Square [784bbf80](https://mobbin.com/screens/784bbf80-5fb1-4250-af8f-5e15f49745c3), Sweatpals [c2e1c5aa](https://mobbin.com/screens/c2e1c5aa-eab9-4bc9-9b3e-c8ed15aa96dd), Turo [a4fdf5a0](https://mobbin.com/screens/a4fdf5a0-31d7-460c-98dc-04da656bb6f8).
- Patterns: No court grid with courts as columns appeared. Square availability has team members as rows, a day-column grid, and an "Available All day" block. Turo shows a horizontal date strip with a price under each day. Sweatpals shows a day-column schedule with time rows on the left.

**W7. Appointment booking with staff avatars.** Query: "appointment booking page with staff member avatars to choose a trainer and time". Tool: `search_screens`. Platform: web.
- Sources: SchoolAI [8d998578](https://mobbin.com/screens/8d998578-98a2-44bc-9e9b-828b0dcba320), Calendly [57876292](https://mobbin.com/screens/57876292-340c-408a-9563-fe0ab9f5dcbd), Square [10dfaf1b](https://mobbin.com/screens/10dfaf1b-fa80-4934-9fb4-c609ef88b61f).
- Patterns: SchoolAI "Choose your look" shows a row of round avatars with the selected avatar outlined in a ring. Calendly booking shows a left panel with event title and duration (30 min), a month calendar with a filled date, and a right list of time slots as outlined cards with a green dot ("times you're available"). Square availability shows green "Available 8 am – 8 pm" blocks per staff member per day.

**W8. Household members management.** Query: "household or family members management page listing people with roles and invite". Tool: `search_screens`. Platform: web.
- Sources: Obvious [7e43776a](https://mobbin.com/screens/7e43776a-22eb-433a-b8a8-66c09235280a), Uxcel [9b6efb6f](https://mobbin.com/screens/9b6efb6f-8a8d-4714-9f5b-9de904e7a15e), Notion [e78d4c10](https://mobbin.com/screens/e78d4c10-2356-4a90-9021-f3179d6435d2), Greptile [b12df19c](https://mobbin.com/screens/b12df19c-d3be-4f7f-aa4e-a33b30dbbf5a).
- Patterns: Obvious has an email chip input, a role dropdown, and a list with a check mark on the current role. Each role option has a one-line description (Guest, Member, Admin, Owner). Uxcel "Members" has a filter bar with All, Active, Disabled tabs, a table (Name, Role, Permissions, Pro Access), and a green "Active" dot. Notion "People" has a table with a teamspace count and a "Workspace owner" role dropdown.

**W9. Refer a friend or gift a guest pass.** Query: "refer a friend or gift a guest pass page with share link and reward summary". Tool: `search_screens`. Platform: web.
- Sources: Cofounder [db53ea4d](https://mobbin.com/screens/db53ea4d-5070-4229-9d2a-366d85d2162c), Flodesk [d0a71d2e](https://mobbin.com/screens/d0a71d2e-1032-4c59-a855-3c982218a72e), Replit [41d5cd82](https://mobbin.com/screens/41d5cd82-3053-42ec-84f6-09890a40c51e), Airtable [cc378072](https://mobbin.com/screens/cc378072-3b42-4939-b7e3-b9f643c12f07).
- Patterns: Cofounder shows a blue card with "Share Your Referral Link", a link field with "Copy Link", and a "How It Works" card with three numbered steps. Flodesk shows "Give 25%, get $15" as a title, a link field with a "Save" button, and social icons below. Replit "Refer friends and earn credits" uses a three-step list and a blue "Copy link" button. Airtable shows a link field, a "Send invite" button, and a "Pending invites" list.

**W10. Mobile navigation menu.** Query: "mobile website navigation menu opened as full-screen overlay with links". Tool: `search_screens`. Platform: web. The result is a web capture, not a phone-sized capture. Check it at 375 px before use.
- Sources: ZARA [fab9fd81](https://mobbin.com/screens/fab9fd81-4397-423b-a03a-0c5c778c92fa), Square [d7c4a637](https://mobbin.com/screens/d7c4a637-4734-4035-8317-71283e973e78), The New York Times [753b5c58](https://mobbin.com/screens/753b5c58-280e-45f7-8291-f3a3437584e1).
- Patterns: ZARA opens a full-screen menu with a close X at top-left, the wordmark centered, and a search and bag at right. Large serif category names sit in a left column. Secondary links sit in a right column with small red caps. NYT shows a dropdown panel under the top bar with a grid of playlist links.

### Marketing (web sections)

**M1. Hero for a fitness brand.** Query: "fitness gym hero section with full-bleed photo, headline and primary call to action". Tool: `search_sections`. Platform: web.
- Sources: Framer BLOK-style hero [ce5cbf84](https://mobbin.com/sites/sections/ce5cbf84-6413-4aec-9955-f4ea9ea5bef5), The Performance Lab [74e82422](https://mobbin.com/sites/sections/74e82422-0ef3-43f8-bec2-29fa19b11301), ClassPass [2b293e2f](https://mobbin.com/sites/sections/2b293e2f-a6a8-4a01-bb0d-fad09fe8a220).
- Patterns: Framer uses a split hero with a headline in uppercase bold, a short subhead, a black "LEARN MORE" button, and a photo on the right half. The Performance Lab uses a dark full-bleed photo with a very large headline and one orange "BOOK A CONSULTATION" button with an arrow. ClassPass uses a left-aligned headline with a blue button under a full-width photo.

**M2. Gym location finder with map.** Query: "gym location finder section with map and list of club locations". Tool: `search_sections`. Platform: web.
- Sources: ClassPass [c60c063b](https://mobbin.com/sites/sections/c60c063b-e4f2-49b6-8c4e-5aee62b87300), SIGMA [d07b8877](https://mobbin.com/sites/sections/d07b8877-3f4e-4858-a7a7-e2cde1c9f454), Rains [83cbf6ef](https://mobbin.com/sites/sections/83cbf6ef-28d8-4e94-abe9-41b92fe45d18), TravelPerk [a170a1a3](https://mobbin.com/sites/sections/a170a1a3-2b57-40cf-aa68-bb257b17a561).
- Patterns: ClassPass "See what's nearby" uses a map at left with blue pins and copy on the right with a blue "Start exploring" button. Rains uses a left list of store cards (name, address, phone, hours) and a right map with numbered cluster bubbles. SIGMA uses two map panels with address and hours under each. TravelPerk uses a 3-column grid of city cards.

**M3. Location detail for a club or studio.** Query: "studio or gym location detail section with address, hours, map and amenities". Tool: `search_sections`. Platform: web.
- Sources: Samara [f53bcfb9](https://mobbin.com/sites/sections/f53bcfb9-579b-43ad-8923-89e66973e8fe), Little Amps Coffee [74a3a0da](https://mobbin.com/sites/sections/74a3a0da-d93a-419b-a675-1a641b46a4eb), Upwork [6579e166](https://mobbin.com/sites/sections/6579e166-e646-46d2-8745-554a7096c506).
- Patterns: Samara lists each location with a large city heading, the address, a blue "Schedule a tour" button, a two-column hours block ("Monday to Friday" and "Saturday"), and a photo on the right. Pop-up locations use a grey label "Pop-up". Little Amps shows the address, a short description, and two outline buttons ("Go to map", "Download menu").

**M4. Class or program grid.** Query: "class or program grid section with cards showing class name, instructor and schedule tags". Tool: `search_sections`. Platform: web.
- Sources: ClassPass [76bb8fd3](https://mobbin.com/sites/sections/76bb8fd3-7ba4-4340-b284-9904eb3c0522), ClassPass [cd2b5da3](https://mobbin.com/sites/sections/cd2b5da3-0c4d-4a67-bc13-f1d03940a5b5), MasterClass [1c3c60a2](https://mobbin.com/sites/sections/1c3c60a2-eb3c-4c7e-82ea-f1087f03cdb8).
- Patterns: ClassPass "Your favorites are back" is a blue section with a 3 by 3 grid of white cards. Each card has a thumbnail at left, a class name bold, the studio name, and a rating with a count. MasterClass uses a 3-column card grid with a photo, a title, a rating, and a price. Each card has a small type label.

**M5. Class timetable section.** Query: "weekly class timetable section with day tabs and time rows for a fitness studio". Tool: `search_sections`. Platform: web.
- Sources: ClassPass [cd2b5da3](https://mobbin.com/sites/sections/cd2b5da3-0c4d-4a67-bc13-f1d03940a5b5), MasterClass [624bb2a3](https://mobbin.com/sites/sections/624bb2a3-d649-47dd-9996-aaa8e3f5d8e2), HoneyBook [6dfbfd40](https://mobbin.com/sites/sections/6dfbfd40-07f4-43fb-861f-6fa0cdc072c4).
- Patterns: No day-tab timetable section appeared. MasterClass uses a time-of-day tab row ("Morning, Afternoon, Evening") above a photo grid. ClassPass uses a row of six category tiles under a centered headline ("Which activities does your studio offer?"). Each tile has a photo and a one-word label under it.

**M6. Membership pricing section.** Query: "membership pricing section with three plan cards and monthly annual toggle for fitness". Tool: `search_sections`. Platform: web.
- Sources: Oku [f66ba39e](https://mobbin.com/sites/sections/f66ba39e-9d4f-4336-955d-8721fef92d47), Save.design [8310aad8](https://mobbin.com/sites/sections/8310aad8-6473-4310-9b07-85251a7623b5), MasterClass [04be53c0](https://mobbin.com/sites/sections/04be53c0-c109-4e4d-b398-64246fe4cbf9), Maze [b6220462](https://mobbin.com/sites/sections/b6220462-e7a4-421c-bda8-748b65ea8f65).
- Patterns: Oku has a "Pay monthly / Pay yearly" toggle with a "Save 30%" label under the yearly side. The yearly view shows "$52 / year" with "($1 per week)" beside it, and a corner ribbon "SAVE 30%" on each card. Save.design uses three columns with the middle card outlined in magenta and a "MOST POPULAR" tag. MasterClass shows the price with "billed annually" text under it and a bordered highlight on the selected card.

**M7. Free trial signup section.** Query: "free trial signup section with email field and call to action for a fitness membership". Tool: `search_sections`. Platform: web.
- Sources: ClassPass [ca748772](https://mobbin.com/sites/sections/ca748772-c0a9-4787-a89f-53bae3754965), Circle [df355dc6](https://mobbin.com/sites/sections/df355dc6-c382-4c74-b3a0-6d363783aab5), Podia [59f8c37d](https://mobbin.com/sites/sections/59f8c37d-6f94-49f7-b225-f944bf8be9c0).
- Patterns: ClassPass "Start your free trial" has a 5-photo collage on the left and a white card on the right. The card shows "$0 for 14 days", three icon rows (20 credits, reminder, cancel anytime), an email field, a black "Try for free" button, social sign-in buttons, and a small terms note. Circle shows one blue band with an email field and a "Start your 14-day free trial" button in one row, and "No credit card required" below.

**M8. Testimonials with member photos.** Query: "testimonial section with member photos and quotes for a gym or studio". Tool: `search_sections`. Platform: web.
- Sources: MasterClass [36e859b4](https://mobbin.com/sites/sections/36e859b4-985c-40e8-97b6-0f3621fb3d45), ClassPass [4335581c](https://mobbin.com/sites/sections/4335581c-dad1-47c0-aefa-6e1e997baa1d), HoneyBook [07542141](https://mobbin.com/sites/sections/07542141-06cc-4b9d-ab1e-d7e248ca4c4b), Going [2d472cc1](https://mobbin.com/sites/sections/2d472cc1-6985-4c03-9199-319659f1cd44).
- Patterns: MasterClass uses a dark slider. A quote card sits left of a tall photo. Arrow buttons sit at each side and a dot pager sits under the card. HoneyBook shows the name and role, a large quote, "Read the spotlight" link, and a 1 of 3 counter with arrows. ClassPass shows a circular headshot above a quote in large blue text with a left arrow. Going uses a tall photo on the left and a large quote on the right.

**M9. Kids program section.** Query: "kids or youth program section with age groups and sign up cards for families". Tool: `search_sections`. Platform: web.
- Sources: Maxima Therapy [93171486](https://mobbin.com/sites/sections/93171486-7f05-48ee-8a79-a704c4f5f685), Maxima Therapy [9ccbe70e](https://mobbin.com/sites/sections/9ccbe70e-d346-4a29-b9ca-72824600d969), Revolut [27b0a2d5](https://mobbin.com/sites/sections/27b0a2d5-011a-4cc3-bd34-a9165892b739).
- Patterns: Maxima uses large colored program blocks (red and orange), each with an age chip in caps ("AGES 0-3"), a bold program name, and a one-line description with a down arrow. Revolut uses a bold caps headline ("Independence for them, peace of mind for you"), a short sub-line, an outline "Open an <18 account" button, and three feature cards.

**M10. Pool or wellness amenity section.** Query: "pool, spa or wellness amenity section with large photo and feature list". Tool: `search_sections`. Platform: web.
- Sources: ClassPass [76254648](https://mobbin.com/sites/sections/76254648-1940-4409-b392-09a2361482e7), ClassPass [ad30e1fb](https://mobbin.com/sites/sections/ad30e1fb-7e8d-43f8-b9bb-d8fe5aa49b27), KOBU [60ef30fd](https://mobbin.com/sites/sections/60ef30fd-c10e-46a9-aa26-2f34cbbfbff3).
- Patterns: ClassPass "Fitness, Beauty & Wellness" page uses a large swimming photo on the left and a sidebar list of activities at right (Pedicure, Sauna, Massage, Yoga, Spin class). KOBU uses one large full-width photo with a small caps category label and a title below it.

**M11. Coach and team grid.** Query: "coach or trainer team grid section with headshots, names and specialties". Tool: `search_sections`. Platform: web.
- Sources: Upwork [5cca6507](https://mobbin.com/sites/sections/5cca6507-8115-448d-b83c-6a7da8081572), ClassPass [2c544a1e](https://mobbin.com/sites/sections/2c544a1e-a7a8-4078-9a4a-76122e4971ea), Passionfroot [7142e4ef](https://mobbin.com/sites/sections/7142e4ef-7096-4260-aecc-0ea06c1763e3), Equals [455ea198](https://mobbin.com/sites/sections/455ea198-c649-4e11-8192-70d2c315f90c).
- Patterns: Upwork "Meet our coaches" uses a row of four square headshots with the name in bold under each. ClassPass "Expert instructors" uses a round headshot with the name and a role line ("Throwback Fitness"), and a larger photo next to it. Passionfroot uses circular photos with a role chip above each name. Equals uses a 5-column grid of square photos with the name and role under each.

---

## 2. New design rules

Each rule has a tag and a source. Rules are testable: a reviewer can check each one on a comp or built screen.

### Marketing

1. [Marketing] The hero has one photo, a headline of no more than three lines, one subhead line, and one primary button. Source: Framer hero ([ce5cbf84](https://mobbin.com/sites/sections/ce5cbf84-6413-4aec-9955-f4ea9ea5bef5)), The Performance Lab ([74e82422](https://mobbin.com/sites/sections/74e82422-0ef3-43f8-bec2-29fa19b11301)).
2. [Marketing] Use a split hero: text on the left half and a photo on the right half. Source: Framer hero.
3. [Marketing] The hero has one visible button in the main call-to-action color. Do not add a second button of equal weight. Source: The Performance Lab hero.
4. [Marketing] Location finders show a list and a map side by side. Each list item is a card with name, address, and hours. Source: Rains ([83cbf6ef](https://mobbin.com/sites/sections/83cbf6ef-28d8-4e94-abe9-41b92fe45d18)), ClassPass "See what's nearby" ([c60c063b](https://mobbin.com/sites/sections/c60c063b-e4f2-49b6-8c4e-5aee62b87300)).
5. [Marketing] Multi-site lists use a 3-column card grid. Each card shows the city as a bold heading and the address under it. Source: TravelPerk ([a170a1a3](https://mobbin.com/sites/sections/a170a1a3-2b57-40cf-aa68-bb257b17a561)).
6. [Marketing] A location detail section shows the city as the largest heading, then the address, then the hours, then one primary button. Source: Samara ([f53bcfb9](https://mobbin.com/sites/sections/f53bcfb9-579b-43ad-8923-89e66973e8fe)).
7. [Marketing] Hours use two columns. Days or day groups are on the left and times on the right. Group Monday to Friday in one row. Source: Samara.
8. [Marketing] Class grids use three columns on desktop. Each card has a square thumbnail, a bold class name, a studio line, and a rating with a count. Source: ClassPass "Your favorites are back" ([76bb8fd3](https://mobbin.com/sites/sections/76bb8fd3-7ba4-4340-b284-9904eb3c0522)).
9. [Marketing] Use a row of six photo tiles with one-word labels for activity categories. Source: ClassPass activities ([cd2b5da3](https://mobbin.com/sites/sections/cd2b5da3-0c4d-4a67-bc13-f1d03940a5b5)).
10. [Marketing] Pricing has three plan cards. Mark the recommended middle card with one badge ("Most popular"). Source: Save.design ([8310aad8](https://mobbin.com/sites/sections/8310aad8-6473-4310-9b07-85251a7623b5)).
11. [Marketing] Put a monthly or annual toggle above the plan cards. Show the savings percentage next to the annual option. Source: Oku ([f66ba39e](https://mobbin.com/sites/sections/f66ba39e-9d4f-4336-955d-8721fef92d47)).
12. [Marketing] Show the price as one large number with the period in smaller text beside it. Under the price, write "billed annually" when the price is annual. Source: Oku, MasterClass ([04be53c0](https://mobbin.com/sites/sections/04be53c0-c109-4e4d-b398-64246fe4cbf9)).
13. [Marketing] A free-trial card shows the trial price, three benefit rows with icons, an email field, one primary button, and the line "Cancel anytime". Source: ClassPass free trial ([ca748772](https://mobbin.com/sites/sections/ca748772-c0a9-4787-a89f-53bae3754965)).
14. [Marketing] An email-only signup uses one row: the email field and the button side by side. The button text names the offer. Put "No credit card required" below it. Source: Circle ([df355dc6](https://mobbin.com/sites/sections/df355dc6-c382-4c74-b3a0-6d363783aab5)).
15. [Marketing] A testimonial shows a quote card beside a large member photo. Add arrows at the sides and a dot pager under the card. Source: MasterClass ([36e859b4](https://mobbin.com/sites/sections/36e859b4-985c-40e8-97b6-0f3621fb3d45)), HoneyBook ([07542141](https://mobbin.com/sites/sections/07542141-06cc-4b9d-ab1e-d7e248ca4c4b)).
16. [Marketing] Coach and team grids use square or round headshots in a row of four or five. Each headshot has a bold name and a role line under it. Source: Upwork ([5cca6507](https://mobbin.com/sites/sections/5cca6507-8115-448d-b83c-6a7da8081572)), Equals ([455ea198](https://mobbin.com/sites/sections/455ea198-c649-4e11-8192-70d2c315f90c)).
17. [Marketing] Kids program blocks show an age chip in caps (for example, "AGES 0-3"), a bold program name, and one line of text. Source: Maxima Therapy ([93171486](https://mobbin.com/sites/sections/93171486-7f05-48ee-8a79-a704c4f5f685)).
18. [Marketing] A family or kids section starts with a bold caps headline, then a short line, then one outline button. Source: Revolut ([27b0a2d5](https://mobbin.com/sites/sections/27b0a2d5-011a-4cc3-bd34-a9165892b739)).
19. [Marketing] An amenity section shows a large photo on one side and a sidebar list of related items on the other. Source: ClassPass pool-style category page ([76254648](https://mobbin.com/sites/sections/76254648-1940-4409-b392-09a2361482e7)).
20. [Marketing] A mobile menu opens as a full-screen overlay. The close button sits at top-left, the logo is centered, and the search is at top-right. Source: ZARA ([fab9fd81](https://mobbin.com/screens/fab9fd81-4397-423b-a03a-0c5c778c92fa)). This is a web capture. Test the rule at 375 px.
21. [Marketing] Mobile menu links are large. Secondary links sit in a smaller column next to them. Source: ZARA.

### Web app

22. [Web app] A staff or court schedule uses team members as rows and days as columns. Each shift is a colored block with the role and the time. Source: Square ([61e61ca9](https://mobbin.com/screens/61e61ca9-6de7-4bde-8ac6-ead10874ed98)).
23. [Web app] Availability shows as green blocks with the time range (for example, "8 am – 8 pm"). Source: Square availability ([10dfaf1b](https://mobbin.com/screens/10dfaf1b-fa80-4934-9fb4-c609ef88b61f)).
24. [Web app] A booking list row shows the time at left, the class title, a small tag, and one black "Book" button at right. Source: Sweatpals ([05e9f0a6](https://mobbin.com/screens/05e9f0a6-db81-4efa-aa67-1ae733110c67)).
25. [Web app] A time-slot picker shows the date first, then outlined time cards with a green dot for each open slot. Source: Calendly ([57876292](https://mobbin.com/screens/57876292-340c-408a-9563-fe0ab9f5dcbd)).
26. [Web app] A cancel dialog asks for a reason with a radio list. Include an "Other reason" text box. Source: GetYourGuide ([1c409344](https://mobbin.com/screens/1c409344-c4a5-4b7c-b58e-2c22ffc0d7c0)).
27. [Web app] A cancel dialog offers "Reschedule" as an outline button above a red confirm button. Source: GetYourGuide.
28. [Web app] A cancel-subscription dialog lists what the member loses, with a red X icon for each item. The blue filled button keeps the subscription. The cancel action is a text link. Source: Replit ([b23bf4a5](https://mobbin.com/screens/b23bf4a5-fd6f-4941-b48a-962a96a2d4f4)).
29. [Web app] A pause flow starts with a plain headline ("Let's hit pause."), then a duration select, then one filled button. Source: Juicebox ([336e3926](https://mobbin.com/screens/336e3926-76dc-454c-83ef-e06b6428e016)).
30. [Web app] A pause flow shows the renewal date and the pause window in one sentence above the button. Source: Juicebox.
31. [Web app] A plan change opens a "Before you switch" modal. The modal lists fee changes, lost features, and ended campaigns. The modal has "Stay on [plan]" and "Next". Source: Square ([c1b701da](https://mobbin.com/screens/c1b701da-2166-4b48-ae96-aea5ca5a4355)).
32. [Web app] A plan change shows a payment summary column. The column lists Subtotal, Estimated Tax, and Today's total, and gives a note on when the new charge starts. Source: Klaviyo ([b0d877ea](https://mobbin.com/screens/b0d877ea-542e-4cfa-bcef-afd5f04c2aa5)).
33. [Web app] A billing table uses these columns: Invoice, Date, Amount, Status, and a row action. Source: Mercury ([36f606b5](https://mobbin.com/screens/36f606b5-2ee5-4b26-ba14-0204c5295576)).
34. [Web app] Status uses a pill with a light green tint for "Paid" and a grey tint for "Open". Each row has a download action. Source: Magnific ([bef956a7](https://mobbin.com/screens/bef956a7-c7b0-41e5-9b0f-1d3dea4a6d07)).
35. [Web app] A members page has an invite row with a role dropdown. Each role option has one line of help text. Source: Obvious ([7e43776a](https://mobbin.com/screens/7e43776a-22eb-433a-b8a8-66c09235280a)).
36. [Web app] A referral page shows three numbered steps, a link field, and a "Copy link" button. Source: Cofounder ([db53ea4d](https://mobbin.com/screens/db53ea4d-5070-4229-9d2a-366d85d2162c)), Replit ([41d5cd82](https://mobbin.com/screens/41d5cd82-3053-42ec-84f6-09890a40c51e)).
37. [Web app] A staff-selection row uses round avatars. The selected avatar has a colored ring. Source: SchoolAI ([8d998578](https://mobbin.com/screens/8d998578-98a2-44bc-9e9b-828b0dcba320)).

### iOS

38. [iOS] A class row shows the time in bold at left, the duration in grey below it, the class title in bold, and the instructor in caps below the title. An action icon sits at right. Source: ClassPass ([fedc38b2](https://mobbin.com/screens/fedc38b2-31b9-4d52-93e0-d8d5ef83d3dc)), Peloton ([dea205e1](https://mobbin.com/screens/dea205e1-85f7-4a27-89bf-b0ea6af81816)).
39. [iOS] A class detail uses a 16:9 hero with the instructor and time over the photo, then a sticky primary button at the bottom. Source: Peloton ([ddfccd1d](https://mobbin.com/screens/ddfccd1d-e5fa-430d-9fed-6e43f01b502b)).
40. [iOS] The sticky booking bar shows the credit or price at left and the primary action at right. After booking, the bar shows "Reserved" and a grey "Cancel" button. Source: ClassPass ([e1bffb81](https://mobbin.com/screens/e1bffb81-52a4-439d-9ee0-b16263f987ae)).
41. [iOS] Show a rating line under the class title, for example "4.9 ★ (7500+) Excellent". Source: ClassPass ([fa71be76](https://mobbin.com/screens/fa71be76-bf15-43b3-af2f-e31d84bd6b22)).
42. [iOS] Place a grey pill tag above the title for a requirement, for example "VACCINATION REQUIRED". Source: ClassPass ([fa71be76](https://mobbin.com/screens/fa71be76-bf15-43b3-af2f-e31d84bd6b22)).
43. [iOS] A removal confirmation uses a bottom sheet. The sheet has a bold question, the class name in small caps, a full-width primary button, and a text "Cancel". Source: Equinox+ ([c7f0998e](https://mobbin.com/screens/c7f0998e-4fb8-4735-be31-164617717dd4)).
44. [iOS] A booked item shows a green pill "Confirmed" above the title, then four action rows: add to calendar, get directions, message, venue details. Source: Fresha ([8b05efdb](https://mobbin.com/screens/8b05efdb-3ca3-435f-b8d1-3de83f69f1b0)).
45. [iOS] A success screen shows a green check, a headline, a summary card, and one "Done" button. Source: Swiggy ([ced90a3d](https://mobbin.com/screens/ced90a3d-a220-4f7a-b25d-6d1c589e1a44)).
46. [iOS] Add a full-width black "Add to Calendar" button on a confirmation screen. Put "Share event" as a text link under it. Source: Insight Timer ([ba656a70](https://mobbin.com/screens/ba656a70-b19b-42ff-a37e-41cfe13558e1)).
47. [iOS] A waitlist form uses date and time-of-day selects. Keep "Continue" grey until each row has a valid choice. Source: Fresha waitlist (search 12).
48. [iOS] A pause confirmation uses a bottom sheet with a pause icon, a bold question, a black full-width "Pause" button, and a blue "Not Now" text link. Source: PayPal ([c3749ce9](https://mobbin.com/screens/c3749ce9-7155-4eb2-83cf-42668b842d19)).
49. [iOS] A paused state uses a green pill with a check icon, for example "Goal Paused". Source: KOHO ([3f1f2bca](https://mobbin.com/screens/3f1f2bca-6689-470c-a56e-e5844c2b28a9)).
50. [iOS] A family row shows circular avatars, a grey "+" circle for "Add member", and a caption with the invite count ("2 invites left"). Source: Instacart ([f8bebd89](https://mobbin.com/screens/f8bebd89-05ab-4705-96ee-51fff034bd34)).
51. [iOS] A pending invite shows "Invite pending" with a link "Send a reminder?" in an accent color. Source: Lyft ([449818e4](https://mobbin.com/screens/449818e4-cf2b-47ff-9189-dcc14f58bc7c)).
52. [iOS] A streak shows seven day circles for the week. A completed day has a check or flame, and a missed day has an X. Source: WHOOP ([db83268b](https://mobbin.com/screens/db83268b-206f-43b4-89ac-acb6f66cd699)).
53. [iOS] A streak hero shows the number and unit large ("2 day streak!"), then a month calendar with the active days highlighted. Source: BitePal ([c6961180](https://mobbin.com/screens/c6961180-60fb-450b-88af-27755cdfd567)).
54. [iOS] A live class card on the lock screen shows a timer chip at top right, the main metric large, and a row of three values at the bottom. Source: WHOOP live activity ([8e5c6a84](https://mobbin.com/screens/8e5c6a84-be67-48f2-89a1-4923f0a71f50)).
55. [iOS] A widget grid uses 2 by 2 tiles. Each tile has a small photo, a bold title, and a progress label ("0 OF 6 WORKOUTS"). Source: Nike Training Club ([7abc6053](https://mobbin.com/screens/7abc6053-b1e1-41bd-8e09-16398a93ee70)).
56. [iOS] A workout detail shows a hero photo with the title over it, then a row of three stats (duration, exercises, sets), then an outline green primary button. Source: WHOOP ([f7ce5e9e](https://mobbin.com/screens/f7ce5e9e-6478-48e0-a1c2-7bd3389c7033)).
57. [iOS] A map screen shows a search pill at top, the count "N venues in map area", and a sheet with filter chips. Source: Fresha ([9c6ec1d7](https://mobbin.com/screens/9c6ec1d7-3de4-4f92-9897-8b8b28e5b17c)).
58. [iOS] A crowd prompt asks "is this place crowded?" with two pill buttons, YES and NO. Use this in place of a busyness bar chart. Source: corner ([b3ef2e90](https://mobbin.com/screens/b3ef2e90-449e-4057-84d4-f6a18c1f8aac)).
59. [iOS] Time slots wrap in a 4-column grid. The selected slot is outlined, and a total line sits under the grid. Source: Tripadvisor ([b11db81a](https://mobbin.com/screens/b11db81a-d075-4c34-8060-97fa3fb65ab9)).
60. [Shared components] A duration control is a segmented row of chips ("15m | 30 | 45 | 1h"). The selected chip is filled. Source: Structured ([247f1d98](https://mobbin.com/screens/247f1d98-01a7-4e26-9e01-f7fb85b1800c)).
61. [Shared components] A class or event row on iOS and web uses the same order: time, title, instructor or host, price or credit, action. Source: ClassPass ([fedc38b2](https://mobbin.com/screens/fedc38b2-31b9-4d52-93e0-d8d5ef83d3dc)), Sweatpals ([05e9f0a6](https://mobbin.com/screens/05e9f0a6-db81-4efa-aa67-1ae733110c67)).
62. [Shared components] Use one green check and one headline for every success screen, on web and iOS. Source: Swiggy, Tripadvisor ([b8fde94c](https://mobbin.com/screens/b8fde94c-e6f3-4836-b357-0eaaf7608ba7)).

---

## 3. Corrections

These corrections come from the four earlier files. I checked the gap sections and the summary rows. I did not check every rule in the earlier files.

1. `mobbin-ios.md` section 7 and `mobbin-gaps.md` summary row 6 say that Peloton, Strava, Apple Fitness, and Equinox returned no results. This pass returned Peloton (search 1), Strava (search 2), and Equinox+ (search 4). Apple Fitness did not return. Correct the earlier claim for Peloton, Strava, and Equinox.
2. `mobbin-ios.md` section 7 says that Live Activities were not observed. This pass observed Live Activity screens from WHOOP, Bevel, BitePal, and Nike Training Club (search 19). Correct the earlier claim.
3. `mobbin-webapp.md` "Coverage gaps" says that class cancel and membership pause were not observed. This pass observed a cancel booking dialog (W2) and a pause flow (W3). Court grid is still not observed for a sport court. Correct the earlier claim for cancel and pause only.
4. `mobbin-gaps.md` row 4 and the entry for "Add to Apple Wallet" say that no gym membership card with a barcode and a standalone Wallet button was found. This pass still found no gym card. It did find Wallet buttons on non-gym passes (search 9). The earlier claim stays true for gyms. Do not cite the new passes as gym patterns.
5. `mobbin-ios.md` section 7 says that the waitlist flow failed. This pass returned a Fresha waitlist screen in the court-slot search (search 12). Correct the earlier claim.

---

## Checked sources

- Every `mobbin_url` above came from a `search_screens` or `search_sections` result in this run.
- Screen and section images were read in each result. Descriptions show only what appeared on screen.
- No flow search (`search_flows`) was run.
