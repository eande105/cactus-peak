# Cactus Peak backend (Supabase)

One Supabase project serves the marketing site, the member web app and the iOS app.

- Project: `cactus-peak-athletic`, ref `tgaoosmlkaiffoirpnuz` (us-west-1). This folder is linked to it (`.temp/`).
- Secrets: `../.env.local` holds `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` and `DEMO_PASSWORD`. Never commit it.
- App keys: each web app has its own `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The iOS app reads the same two values from `ios/Config/Secrets.xcconfig`.
  The publishable key is safe in a client. Row level security protects the data. No app holds a secret or service key.

## Schema (`migrations/`)

| Group | Tables | Who can do what |
|---|---|---|
| Catalog | `categories`, `clubs`, `coaches`, `class_types`, `class_schedules`, `plans`, `pt_packs`, `plan_comparison`, `price_constants`, `faqs`, `journal_posts`, `jobs`, `site_content` | Anyone reads |
| Household | `households`, `members`, `invoices`, `bookings`, `strikes`, `notices`, `message_threads`, `teen_requests`, `guest_passes`, `visits` | A signed-in member reads and writes the rows of their own household |
| Marketing requests | `tour_requests`, `trial_passes`, `join_requests`, `contact_messages`, `email_signups` | Anyone inserts. Nobody reads through the API |

Functions:
- `session_counts(p_from, p_to)`: booked and waitlisted counts for each class session across all households (counts only).
- `reset_demo_household()`: puts the signed-in member's household back to the seeded demo state.

Class sessions are not stored. The apps make dated sessions from `class_schedules`.
A session id is `<club_slug>~YYYY-MM-DD~HHMM~<class_key>`. The demo calendar starts Tue Oct 27, 2026, 5:40 a.m. Arizona time.

## Seed

`seed.sql` is generated. Do not edit it.

```bash
node supabase/scripts/generate-seed.mjs            # seed-data/*.json → seed.sql
supabase db query --linked -f supabase/seed.sql    # replace all catalog and demo rows
node supabase/scripts/create-demo-logins.mjs       # create or refresh the demo logins
```

`seed-data/` holds the sample data the apps were first built with. When the web app and the marketing site disagreed,
the web app's numbers won (class lengths, capacity), because its booking rules use them.

## Demo logins

All use `DEMO_PASSWORD` from `../.env.local`.

| Email | Member | Household |
|---|---|---|
| maya@example.com | Maya Brandt (primary, Ridge, Gilbert – Val Vista) | h1, with Chris, Theo (child), Ivy (child) |
| chris@example.com | Chris Brandt (adult) | h1 |
| alicia@example.com | Alicia Ramos (primary) | h2 |
| jordan@example.com | Jordan Ramos (teen, 16) | h2 |
| daniel@example.com | Daniel Whitaker (primary) | h3 |
| ron@example.com | Ron Park (primary) | h4 |
| linda@example.com | Linda Park (adult) | h4 |

## Changing the schema

Add a new file in `migrations/`. Never edit a migration that is already applied. Then:

```bash
supabase db push --linked
supabase gen types typescript --linked --schema public > web-app/lib/supabase/database.types.ts
cp web-app/lib/supabase/database.types.ts marketing-site/lib/supabase/database.types.ts
```

The Supabase MCP server is configured in `.mcp.json` (build root, `marketing-site`, `web-app`, `ios`), scoped to this project.
