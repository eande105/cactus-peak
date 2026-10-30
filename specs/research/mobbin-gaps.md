# Mobbin gap research: Cactus Peak Athletic

Scope: fill gaps in earlier Mobbin research for the Cactus Peak Athletic app, web app and marketing site.

Source notes:
- The earlier files `mobbin-marketing.md`, `mobbin-webapp.md` and `mobbin-ios.md` are not in `/Users/ethanhanderson/Documents/Development/git480/cactus-peak-specs/research/`. The folder holds only `apple-ios-guidelines.md` and `component-libraries.md`. There were no gap notes to skim.
- 12 Mobbin search calls were used. One extra call failed at tool lookup because of a mistyped tool name and did not reach Mobbin.
- Only results seen in the returned previews are reported. Mobbin results are screens from other brands. None are gym or club apps unless named.
- Mobbin URLs use `https://mobbin.com/screens/<id>` for screens and `https://mobbin.com/sites/sections/<id>` for web sections.

## Summary of coverage

| # | Search | Platform | Result |
|---|---|---|---|
| 1 | Class waitlist | iOS | Found. Fresha and Public show usable patterns. |
| 2 | Membership pause or freeze | iOS | Not found. Results show downgrade and reactivate flows instead. |
| 3 | Court or padel time slot | iOS | Partly found. No court or padel screens. Booking time pickers found. |
| 4 | Check-in card, Apple Wallet | iOS | Found. Luma ticket and Chick-fil-A membership number screens. |
| 5 | Busyness or popular times | iOS | Not found. Only general charts returned. |
| 6 | Home or today screen | iOS | Found. Peloton, Strava and Apple Fitness did not appear. |
| 7 | Cancel booking dialog | Web | Found. Five cancel patterns. |
| 8 | Trainer appointment booking | Web | Found. Calendly and Skillshare patterns. |
| 9 | Week schedule grid | Web | Found. Square, Calendly, Klaviyo, Sweatpals, Buffer. |
| 10 | Fitness nav menu | Marketing | Partly found. Jasper mega menu is the closest pattern. |
| 11 | Pool or amenity section | Marketing | Found. ClassPass and Samara sections. |
| 12 | Kids or family section | Marketing | Partly found. Maxima Therapy and HBO Max are the closest. |

## Search details

### 1. Class or event waitlist (iOS)

- Query: `fitness club app class waitlist join screen`
- Sources found:
  - Fresha, "Join the waitlist" screen. ID `aa2b773c-eccb-49de-b1fa-1d414b34d19b`. https://mobbin.com/screens/aa2b773c-eccb-49de-b1fa-1d414b34d19b
  - Public, waitlist card. ID `9d557b4a-3dcd-46bc-baf9-397dfc50acaf`. https://mobbin.com/screens/9d557b4a-3dcd-46bc-baf9-397dfc50acaf
  - Luma, "Join Waitlist" form. ID `fbac8eac-b349-45f8-bac4-18fb28ee7df6`. https://mobbin.com/screens/fbac8eac-b349-45f8-bac4-18fb28ee7df6
  - Sweatcoin, "Joined" state badge. ID `a282af39-9458-46f9-87f6-f3427a46acde`.
  - Nike Training Club and Lifesum returned, not relevant to waitlist.
- Fresha details, top to bottom:
  - Back arrow and close icon in a row.
  - Title "Join the waitlist".
  - Helper text: "Select your preferred dates and time. You can only join the waitlist for dates and time this partner is open. We'll notify you if a time slot becomes available."
  - White card with two dropdowns on one row: Date ("Wed, 19 Aug") and Start time ("Any time").
  - Outlined pill button "Add another time" with a plus icon.
  - Lavender info box: "There are time slots available to book on the selected dates, adjust your selection or book now." with a "Book now" link.
  - Text line: "Changed your mind?" followed by a purple link "See available times to book".
  - Sticky footer: price and duration on the left ("US$15 / 1 item · 15 mins"), gray disabled "Continue" button on the right.
- Luma details:
  - Form-style waitlist with a required question, dropdown, text fields.
  - Checkbox that acknowledges a no-show policy, with the consequence stated in the label.
  - Full-width black "Join Waitlist" button at the bottom.
- Public details: full-width white primary button "Join waitlist" over a dark card, with a secondary "Watch the Keynote" outlined button below.

### 2. Membership pause or freeze (iOS)

- Query: `gym membership pause or freeze subscription screen`
- Result: No pause or freeze screen was returned.
- Closest sources:
  - WHOOP, "Downgrade membership". ID `94d55e74-7fa2-41aa-bd76-0fdae58207f9`. https://mobbin.com/screens/94d55e74-7fa2-41aa-bd76-0fdae58207f9
    - Plan comparison table with two plan columns. The current plan has a "YOUR PLAN" label above it.
    - Rows: annual cost, then feature rows with check marks or dashes.
    - Card text: "Downgrade to WHOOP One $0", then "Your membership will be downgraded at the end of your current billing cycle."
    - Two buttons: outlined "DOWNGRADE MEMBERSHIP" and filled "KEEP CURRENT MEMBERSHIP".
    - Renewal line at the bottom with the next renewal date and amount.
  - Ro, "Membership and subscriptions". ID `ab69777c-26c7-4a3c-b023-c4e937f552d5`. Inactive status tag, "No future charges" line, black "Reactivate" button.
  - Bevel paywall. ID `87ac5af9-7c7a-46b8-8a82-ad8c90bf574c`. Yearly and monthly plan cards, "Save 37%" badge on the yearly card.

### 3. Court or padel time slot booking (iOS)

- Query: `padel or tennis court booking time slot selection screen`
- Result: No court, padel or tennis screen was returned. Results were restaurant, tour and service booking screens.
- Closest sources:
  - Fresha, "Select time". ID `56cfe9d3-57c1-4f2b-b8ad-5590b7eb940c`. Horizontal date strip with weekday over date number. Selected date filled purple. Past dates grayed. Time list as full-width outlined rows, one time per row.
  - Swiggy, "Book table". ID `58b42b84-0995-4f65-b5c8-9eaa0534689f`. Guest count chips in a row. Date chips with a green "10% off" badge under each date. Meal period segmented control (Breakfast, Lunch, Dinner). Time chips in a three-column grid. "View all slots" link. Bottom "Proceed" button stays disabled until a slot is chosen.
  - Tripadvisor, tour booking. ID `b11db81a-d075-4c34-8060-97fa3fb65ab9`. Date and party size chips at the top. Time chips in a wrap grid. Price total line above a full-width green "Select" button.
  - Structured, time picker with duration segmented control. ID `247f1d98-01a7-4e26-9e01-f7fb85b1800c`. Scroll wheel for start time. Duration options as segments: 15m, 30, 45, 1h, 1.5h.
  - Places, "Upcoming Availability". ID `9c343f80-4c65-4763-a993-31e890e04169`. Guest count as numbered chips. Per date rows. Available times as green-outlined chips. Dates with no slots show "No available tables" in gray.

### 4. Check-in card, barcode, Apple Wallet (iOS)

- Query: `gym check-in membership card screen with barcode and Apple Wallet button`
- Sources found:
  - Luma, ticket screen. ID `fd60dbd4-6f2f-43e8-a2a8-dbf6954b3f59`. https://mobbin.com/screens/fd60dbd4-6f2f-43e8-a2a8-dbf6954b3f59
    - Dark screen with a grab handle and a title at the top. Close button top right.
    - Large white rounded square holding the QR code.
    - Caption under the code: "Ticket", then "1× Standard".
    - Full-width white pill button at the bottom: wallet icon and "Add to Apple Wallet".
  - Chick-fil-A, scan screen. ID `b5799f72-a7aa-442c-bcf8-8198ce9275ce`. Full red screen. Label "YOUR MEMBERSHIP NUMBER" in small caps above a large bold number. Second label "YOUR MOBILE PAY NUMBER". Segmented tab bar at the bottom.
  - American Airlines, Wallet pass preview. ID `fbf99042-14a3-472f-8587-6e3fea7602fd`. Blue pass with "Add" button top right, name field, member number under the barcode.
  - Ro and Future Pro checkout screens show Apple Pay as a black full-width button, with "OR" and a card option below it.
- Not found: a membership card with a barcode and a standalone "Add to Apple Wallet" button for a gym.

### 5. Busyness or popular times (iOS)

- Query: `gym popular times busyness chart for a location`
- Result: No popular times or busyness chart was returned.
- Nearest patterns:
  - Insight Timer, "Time per Day" bar chart. ID `d407506b-6d75-43eb-b693-b63c96e3e0ed`. Tabs at the top: Days, Weeks, Months, All Time. Bars with a light gray average line.
  - MacroFactor, expenditure range chart. ID `6b30c84d-9b03-4873-b1c2-cec870dc73c0`. Shaded range band. Range selector pills (1W, 1M, 3M, 6M, 1Y, All) with the active pill filled black.
  - Future Pro, Overview calendar. ID `0a7f0ee7-9191-42d8-9d97-7973fc552d98`. Workout consistency shown as rows of circled day numbers, one row per week. Active days get a green ring.

### 6. Home or today screen (iOS)

- Query: `fitness app home today screen with workout summary and activity rings`
- Result: No Peloton, Strava or Apple Fitness screen was returned.
- Sources found:
  - Google Health (Fitbit), "Today". ID `59bc2882-bb6b-4964-aaa7-00defb0b42a4`.
    - Large ring with the step count in the center: "12,018" with "of 10,000" below.
    - Three tiles beside the ring: Distance, Cal burned, Exercise days. Each tile has its own color.
    - Two pill buttons: "+ Log" and "Start".
    - Below the pills, an AI summary card with a time stamp and a bold headline.
    - Bottom tab bar: Today, Fitness, Sleep, Health.
  - BitePal, home. ID `46a02ecf-d18a-4847-bb3c-6ba18e1b52bc`. Date chip "Today". Summary card list: Calories left to burn, Steps, Workouts, each with a number and a small icon. Green check line "Goal reached".
  - Nike Training Club, home. ID `7abc6053-b1e1-41bd-8e09-16398a93ee70`. Dark hero card with a progress bar. Two-column card grid below. Cards have a title, time, and a bookmark or calendar icon.
  - Sweatcoin, home. ID `e33a8910-f06f-45e8-9120-d79f2bfda541`. Large ring with "35" in the center, "Daily goal: 2,000" below. Tab bar: Home, Earn, Rewards, Challenges.
  - WHOOP, "My Day" menu. ID `cf930277-904f-40d4-82df-5003e171613f`. Floating action menu: Start Activity, Add Activity, Strength Trainer, Complete your journal, Create WHOOP Live. Bottom tab bar: Home, Health, Community, More, with a center circular button.

### 7. Cancel booking confirmation (Web)

- Query: `cancel booking confirmation dialog for a class reservation`
- Sources found:
  - Meetup, "Cancel event" modal. ID `bd48b511-e4cc-4d58-a333-dd02689f4400`. Title, then a consequence line: "This will automatically update your attendees that it's no longer happening. (You can't undo this.)" Radio options: "Cancel event" (selected by default) and "Cancel and delete event" with a helper line. Full-width black "Confirm" button.
  - Calendly, "Cancel Event" modal. ID `c3e2b97a-b2d4-47b8-9e97-65c731e8c1ff`. Event name and time shown. Consequence text in plain sentences. Optional message textarea. Two buttons side by side: "No, don't cancel" (outlined, left) and "Yes, cancel" (dark, right).
  - GetYourGuide, side panel. ID `1c409344-c4a5-4b7c-b58e-2c22ffc0d7c0`. Heading "Cancel your booking". Radio list of reasons with "Other reason" last. A textarea appears under "Other reason". Two stacked buttons: "Reschedule instead" (blue outline) above "Continue with cancellation" (red outline). The reschedule option comes first.
  - Xero, "Confirm cancellation" modal. ID `4dbed775-0129-4618-a3f0-2730c586370a`. Bold date line states when access ends. Long reason list with radio buttons. Red "Confirm cancellation" button at the bottom right.
  - Magnific, full page. ID `bcb02b1e-f2cc-4744-a899-b0b8259379ed`. Heading "We're sorry to see you go". Text states when access ends. Required textarea asks for feedback. Blue "Keep subscription" button is the primary action. "Yes, cancel" is a plain text link.
  - Emergent, "Delete this schedule?". ID `809372b4-845e-4932-bbdf-14608fe6bae8`. Red title. Body: "Once deleted, this schedule cannot be restored and will no longer run." Gray "Cancel" button on the left, red "Delete schedule" button on the right.

### 8. Appointment booking with a person (Web)

- Query: `personal trainer appointment booking page with trainer avatar and calendar time picker`
- Sources found:
  - Calendly, public booking page. ID `57876292-340c-408a-9563-fe0ab9f5dcbd`. Left column: logo block, event name, duration with a clock icon. Right column: month grid with round date buttons, selected date filled dark. Time list as stacked outlined tiles. Green dot on each tile marks the time as available. Time zone dropdown under the grid.
  - Skillshare, 1-on-1 coach modal. ID `9ad852f9-4095-4e6b-9d1a-7a2c731f8071`. Left column: coach logo, name, session title, duration, description, price. Right column: month grid with only bookable dates active. Time zone line under the grid.
  - Sweatpals, schedule list. ID `05e9f0a6-db81-4efa-aa67-1ae733110c67`. Horizontal date strip with arrows. Rows: time, title, host, price ("Free"), black "Book" pill.
  - HoneyBook, scheduler setup. ID `396402ad-7ecd-4a99-8462-e6fa561d82fe`. Form error text "Please select an available date and time." with a "Required" tag. Calendar with a dot under each date that has availability. Time chips grouped under AM and PM headings.
  - Mercor, availability editor. ID `2b92cf81-d037-4789-bb00-609b2b7dbd9a`. Modal with a multi-date calendar. Hours row: start time, end time, a remove x, and a plus to add a row. Footer buttons: Cancel and Apply.
  - Turo, block availability panel. ID `192cbaae-c38a-4672-a956-18adeacad717`. Daily and Hourly segmented toggle. Start and end fields with a date dropdown and a time dropdown each. Optional notes field with a character count. Checkbox "Repeat this unavailability weekly".

### 9. Week schedule grid (Web)

- Query: `weekly calendar schedule grid of classes with time rows and day columns`
- Sources found:
  - Sweatpals, week schedule. ID `c2e1c5aa-eab9-4bc9-9b3e-c8ed15aa96dd`. Time labels down the left, day columns across. Today's date in a filled circle. Event block with a colored left edge. Time zone chip (GMT-5) above the day headers. Filter pills "Types" and "Providers". Primary "Book a client" button top right.
  - Klaviyo, week calendar. ID `6b3dd16e-7760-46c9-9f32-6d6852777fa0`. Day headers with date. All-day row above the time rows. Events as bordered chips with start time and title. Toolbar: Today, Week dropdown, filters, List and Calendar toggle, primary "Create campaign" button.
  - Square, staff schedule week grid. ID `66ea4b9b-7284-4f6a-bc5f-cb0860a34724`. Rows per team member. Shift blocks as colored cards with time range. Daily totals in a footer row. Week range shown in the header. Primary "Publish" button top right.
  - Calendly, new meeting grid. ID `ed3b366a-e6c7-46e6-b0c0-90153d253d47`. Hour rows on the left, day columns. Left panel: time zone, duration dropdown, host search.
  - Buffer, week calendar. ID `d064970a-0daa-460d-ab40-2ad1e47cc25a`. Time labels on the left. Post cards show time, text and a thumbnail. Filter dropdowns in the header.
  - Basecamp month view. ID `1473808a-3c51-4964-a01d-f13db8f485cd`. Month grid, not week. Listed for reference only.

### 10. Fitness brand navigation menu (Marketing)

- Query: `fitness club website navigation menu with mega menu for classes, facilities and membership`
- Result: No fitness brand menu was returned. The closest patterns are from other sites.
- Sources found:
  - Jasper, mega menu. Section ID `47927a0a-f9b9-4a5b-82b0-ec3c7970a14e`. https://mobbin.com/sites/sections/47927a0a-f9b9-4a5b-82b0-ec3c7970a14e
    - Four columns. Each column has a bold heading, an optional "NEW" tag, a short description, and a list of links with arrows.
    - Sub-links sit under a heading with a thin left rule.
  - Superpower, top nav. Section ID `570d1933-5cc4-430a-9d4a-8cf67b35403f`. Dark pill-shaped nav bar with links on the left, logo centered, and an orange "Start Testing" pill button at the right.
  - Squarespace, full-screen menu. Section ID `f6ed9ec2-0d94-4ef5-a7df-0c1002a70a15`. Large text links for the menu.
  - ClassPass, category tabs. Section ID `76254648-1940-4409-b392-09a2361482e7`. Top nav: centered logo, text links, blue "Try For Free" button. Second row: category tabs (FITNESS, LIFESTYLE, WELLNESS & RECOVERY, SPA & BEAUTY). Active tab in blue.

### 11. Pool or amenity page section (Marketing)

- Query: `pool or spa amenity page section with facility photos and hours`
- Sources found:
  - Samara, location list. Section ID `f53bcfb9-579b-43ad-8923-89e66973e8fe`. Each location has a heading, address, a 2-column hours block (weekdays on the left, Saturday on the right), and a small "Schedule a tour" blue button. Second location is a pop-up with a small label "Temporary pop-up location" and a note "Open by appointment only".
  - ClassPass, carousel. Section ID `4018053f-0a22-40cc-b78e-fb8948ca3f76`. Large photo with left and right arrow buttons. Caption under the photo: "Aura Fitness – Toronto, strength training & gym time".
  - ClassPass, split section. Section ID `452d7ad4-bd59-4f32-9e8c-8b819aae31ac`. Text left with a heading and two paragraphs. Photo grid right with a label under each photo.
  - ClassPass, sidebar category list. Section ID `76254648-1940-4409-b392-09a2361482e7`. Right column with a bold heading and a plain list of links.
  - KOBU, "Property & Accommodations". Section ID `4c53b4ba-0ada-4f63-aad5-8ae76851b6f6`. Heading on the left, short paragraph on the right. Four large photos in a horizontal row, cropped at the edges.
  - ClassPass, footer. Section ID `94987f20-8911-4699-b4d2-98d03869e7f4`. Four columns of links (Company, Support, Partners, Community). App store badges. Legal links in a row at the bottom.
- Not found: a pool-only section with lap or swim hours.

### 12. Kids or family program section (Marketing)

- Query: `kids and family programs landing section for a sports or fitness club`
- Sources found:
  - Maxima Therapy, hero. Section ID `9ccbe70e-d346-4a29-b9ca-72824600d969`. Full-width green background. Very large headline "ADAPTIVE SKILLS TRAINING". Small label above it. Pill button "Explore Ages 3-18".
  - HBO Max, family section. Section ID `de4793a3-b07c-48f4-8ad7-b968720fc516`. Heading "Family-Friendly Streaming". One line of text: kids profiles, parental controls, age filters. Row of round character images.
  - Duolingo, kids story section. Section ID `c7d4c0e0-4225-454a-85f0-e0386c7ff191`. Heading and short line on the left. Phone-style image card on the right with a progress bar and a blue "next" button.
  - ClassPass, text section. Section ID `b4611af1-5670-4413-9171-2eeed310c00c`. Centered heading, short centered paragraphs, bold numbered callout.
  - Maxima Therapy, second section. Section ID `93171486-7f05-48ee-8a79-a704c4f5f685`. Rendered blank.
- Not found: a kids club section with a schedule or age-group grid.

## Design rules

Rules are tagged by platform. Each rule is from a screen or section listed above.

1. [iOS] Show a waitlist action as an explicit screen with a date selector and a time selector. Use the Fresha pattern (Sources 1).
2. [iOS] On a waitlist screen, show a notice when a slot does open. Offer a "Book now" link in that notice (Fresha, Source 1).
3. [iOS] Keep a waitlist primary button full width and stick it to the bottom of the screen (Public and Luma, Source 1).
4. [iOS] Show a consent checkbox when the waitlist has a no-show rule. Put the rule text in the checkbox label (Luma, Source 1).
5. [iOS] Show a downgrade or cancel path as two buttons: an outlined option and a filled "keep current" option (WHOOP, Source 2).
6. [iOS] State the effective date of a plan change in plain text under the action (WHOOP, Source 2).
7. [iOS] Show the next renewal date and amount below the plan actions (WHOOP, Source 2).
8. [iOS] Use a date strip with weekday over date. Gray out past or unavailable dates (Fresha, Source 3).
9. [iOS] Keep the primary button disabled until the user picks a time (Swiggy and Fresha, Source 3).
10. [iOS] Put time chips in a three-column grid when there are many slots (Swiggy, Source 3).
11. [iOS] Show a total price line above the primary button when a booking has a cost (Tripadvisor, Source 3).
12. [iOS] Show the member or pass number in large bold type with a small label above it (Chick-fil-A, Source 4).
13. [iOS] Place "Add to Apple Wallet" as a full-width white button at the bottom of the pass screen (Luma, Source 4).
14. [iOS] Put the QR or barcode in a white rounded square on a dark screen. Add a caption below it with the pass type (Luma, Source 4).
15. [iOS] Put the home summary in a ring with the main number in the center and the goal under it (Google Health and Sweatcoin, Source 6).
16. [iOS] Put quick action pills, such as "+ Log" and "Start", directly under the summary ring (Google Health, Source 6).
17. [iOS] Use a four-item bottom tab bar on home screens (Google Health and Sweatcoin, Source 6).
18. [Web app] Put the consequence in the first line of a cancel dialog. State that the action cannot be undone when that is true (Meetup and Emergent, Source 7).
19. [Web app] Put the destructive button on the right and a safe option on the left (Calendly and Emergent, Source 7).
20. [Web app] Offer "Reschedule instead" before "Continue with cancellation" in the cancel panel (GetYourGuide, Source 7).
21. [Web app] Ask for a cancel reason with radio buttons. Show a text box only when "Other reason" is picked (GetYourGuide, Source 7).
22. [Web app] Mark available dates with a dot or a filled circle. Gray the rest (HoneyBook and Skillshare, Source 8).
23. [Web app] Show the time zone under the calendar grid, not above it (Calendly and Skillshare, Source 8).
24. [Web app] Show time slots as a vertical list of outlined tiles. Mark available slots with a green dot (Calendly, Source 8).
25. [Web app] Use hour rows on the left and day columns across the top for a week schedule (Sweatpals, Klaviyo and Calendly, Source 9).
26. [Web app] Put a time zone chip above the day headers in a schedule grid (Sweatpals, Source 9).
27. [Web app] Put a "Publish" or "Create" primary button in the top right of a schedule toolbar (Square and Klaviyo, Source 9).
28. [Marketing] Use a four-column mega menu. Each column has a bold heading, a one-line description, and links with arrows (Jasper, Source 10).
29. [Marketing] Put category tabs under the main nav for a multi-category site. Mark the active tab in the brand color (ClassPass, Source 10).
30. [Marketing] Show location hours in two columns: weekdays on the left, Saturday on the right (Samara, Source 11).
31. [Marketing] Give each location a "Schedule a tour" or "Request a visit" button under its address (Samara, Source 11).
32. [Marketing] Use a large headline with a pill button for the primary action in a kids or family hero. Put the age range in the button text (Maxima Therapy, Source 12).
33. [Marketing] Use four link columns in the footer with app store badges below (ClassPass, Source 11).
