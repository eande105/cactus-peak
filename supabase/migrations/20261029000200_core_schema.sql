-- Cactus Peak Athletic: one backend for the marketing site, the member web app and the iOS app.
-- Facts come from cactus-peak-specs/00-foundation.md. Seed rows come from supabase/seed.sql,
-- which scripts/generate-seed.mjs writes from the apps' own sample data.
--
-- Three groups of tables:
--   1. Catalog: clubs, categories, class types, schedules, coaches, plans, site content. Anyone can read.
--   2. Household: members, bookings, billing, inbox and prefs. A signed-in member reads and writes
--      only the rows of their own household (row level security).
--   3. Requests from the marketing site: tours, 3-day passes, join requests, contact, newsletter.
--      Anyone can insert. Nobody can read them through the API.
--
-- The demo world runs on a fixed calendar that starts Tue Oct 27, 2026, 5:40 a.m. Arizona time.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- 1. Catalog
-- ---------------------------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  sort smallint not null,
  name text not null,
  blurb text not null default '',
  tagline text not null default '',
  lede text not null default '',
  examples text not null default '',
  hero_caption text not null default '',
  intensity_min smallint not null default 1 check (intensity_min between 1 and 5),
  intensity_max smallint not null default 5 check (intensity_max between 1 and 5)
);

create table public.clubs (
  slug text primary key,
  sort smallint not null,
  legacy_id text not null unique, -- "c1".."c5", the web app's short id
  name text not null,
  short_name text not null,
  city text not null check (city in ('Mesa', 'Gilbert')),
  neighborhood text not null,
  cross_streets text not null,
  address text not null,
  zip text not null,
  phone text not null,
  tel text not null,
  club_type text not null, -- "Flagship", "Full club", "Studio club"
  type_label text not null, -- "Flagship · 68,000 sq ft"
  sqft integer not null,
  opened smallint,
  personality text not null,
  intro text not null default '',
  parking text not null default '',
  access_notes text not null default '',
  lat double precision not null,
  lng double precision not null,
  scene text not null,
  tone text not null default '',
  photo_caption text not null default '',
  amenities text[] not null default '{}', -- member app wording
  site_amenities text[] not null default '{}', -- marketing site wording
  signature text[] not null default '{}',
  extras text not null default '',
  pool jsonb, -- { label, lanes, unit, outdoor?, therapy? } or null
  courts jsonb not null default '[]', -- [{ sport, count }]
  has jsonb not null default '{}', -- { pool, courts, cycling, kids, recovery, classes }
  kids_club boolean not null default false,
  recovery text not null default 'none' check (recovery in ('suite', 'lounge', 'none')),
  studios text[] not null default '{}',
  typical_weekday smallint[] not null default '{}', -- busyness 1-5, 4 a.m. to 9 p.m. (18 values)
  typical_weekend smallint[] not null default '{}',
  studio_count smallint not null default 0,
  demo_miles real, -- distance shown before the visitor shares a location
  demo_busyness smallint check (demo_busyness between 1 and 5),
  map_x real,
  map_y real
);

create table public.coaches (
  id text primary key, -- short id the web app uses ("marisol")
  slug text not null unique,
  name text not null,
  first_name text not null,
  discipline text not null default '', -- what they teach in group classes ("Cycle")
  credential text not null default '',
  years smallint,
  since smallint,
  clubs text[] not null default '{}',
  teaches_classes boolean not null default false, -- leads group classes
  personal_trainer boolean not null default false, -- takes PT bookings
  specialties text[] not null default '{}',
  tags text[] not null default '{}',
  teaches text[] not null default '{}', -- class type slugs
  favorite text not null default '',
  about text not null default '',
  quote text not null default '',
  good_for text[] not null default '{}',
  first_session text[] not null default '{}',
  open_times jsonb not null default '[]', -- PT openings: [{ dow, time }]
  tone text not null default ''
);

create table public.class_types (
  key text primary key, -- short key the schedule uses ("rrs")
  slug text not null unique, -- marketing URL slug ("rib-rack-strength")
  sort smallint not null,
  name text not null,
  category_id text not null references public.categories (id),
  duration smallint not null check (duration > 0),
  intensity smallint not null check (intensity between 1 and 5),
  intensity_min smallint not null check (intensity_min between 1 and 5),
  intensity_max smallint not null check (intensity_max between 1 and 5),
  capacity smallint not null check (capacity > 0),
  unit text not null check (unit in ('bikes', 'spots', 'mats', 'lanes')),
  first_timer_ok boolean not null default false,
  teen_ok boolean not null default false,
  min_age smallint not null default 0,
  bookable boolean not null default true, -- false for lap swim, kids club and recovery slots, which use reservations
  about text not null default '',
  blurb text not null default '',
  bring text[] not null default '{}',
  equipment_note text not null default '',
  group_label text not null default '',
  club_slugs text[], -- clubs that run it; null means all five
  pick text not null default '',
  gear text not null default '',
  caption text not null default ''
);
create index class_types_category_id_idx on public.class_types (category_id);

-- Weekly timetable. The apps make dated sessions from these rows.
-- A session id is "<club_slug>~YYYY-MM-DD~HHMM~<class_key>".
create table public.class_schedules (
  id bigint generated always as identity primary key,
  club_slug text not null references public.clubs (slug),
  class_key text not null references public.class_types (key),
  start_time time not null,
  days smallint[] not null check (days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]), -- 0 = Sunday
  studio text not null,
  coach_id text not null references public.coaches (id),
  intensity smallint check (intensity between 1 and 5), -- overrides the class type for this slot
  unique (club_slug, class_key, start_time, studio)
);
create index class_schedules_club_slug_idx on public.class_schedules (club_slug);
create index class_schedules_class_key_idx on public.class_schedules (class_key);
create index class_schedules_coach_id_idx on public.class_schedules (coach_id);

create table public.plans (
  id text primary key check (id in ('trailhead', 'ridge', 'summit')),
  sort smallint not null,
  name text not null,
  price numeric(8, 2) not null,
  booking_window_days smallint not null,
  guest_passes smallint not null default 0,
  ribs smallint not null default 1,
  badge text,
  blurb text not null default '',
  best_for text not null default '',
  perks text[] not null default '{}',
  features text[] not null default '{}',
  compact text[] not null default '{}'
);

create table public.pt_packs (
  sessions smallint primary key,
  price numeric(8, 2) not null
);

create table public.plan_comparison (
  sort smallint primary key,
  row_label text not null,
  trailhead text not null,
  ridge text not null,
  summit text not null
);

-- Prices and fees that are not a plan row.
create table public.price_constants (
  key text primary key,
  amount numeric(8, 2) not null,
  label text not null
);

create table public.faqs (
  id text primary key,
  audience text not null check (audience in ('site', 'home', 'member')),
  sort smallint not null,
  group_name text not null default '',
  question text not null,
  answer text not null
);

create table public.journal_posts (
  slug text primary key,
  published_on date not null,
  title text not null,
  dek text not null default '',
  category text not null,
  author_slug text references public.coaches (slug),
  read_minutes smallint,
  tone text not null default '',
  caption text not null default '',
  class_slug text,
  sections jsonb not null default '[]' -- [[heading, body], ...]
);
create index journal_posts_author_slug_idx on public.journal_posts (author_slug);

create table public.jobs (
  slug text primary key,
  sort smallint not null,
  title text not null,
  club text not null,
  dept text not null,
  job_type text not null,
  pay text not null default '',
  details jsonb not null default '{}'
);

-- Small marketing lists that are not worth a table each: testimonials, club quotes, legal pages,
-- the first-timer shelf, popular classes, amenity filters, journal categories.
create table public.site_content (
  key text primary key,
  data jsonb not null
);

-- ---------------------------------------------------------------------------------------------
-- 2. Households and members
-- ---------------------------------------------------------------------------------------------

create table public.households (
  id text primary key,
  primary_member_id text not null, -- FK added after members
  plan_id text not null references public.plans (id),
  billing_day smallint not null check (billing_day between 1 and 28),
  member_since timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'frozen', 'freeze_scheduled', 'payment_failed', 'cancel_scheduled')),
  freeze_window jsonb, -- { start, months, end, resume } in epoch ms
  cancel_on timestamptz,
  pending_plan jsonb, -- { plan, on, homeClub? }
  card jsonb not null, -- { brand, last4, expMonth, expYear }. Sample data only: never a real card number.
  backup_card jsonb,
  payment_failed_at timestamptz,
  pt_pack jsonb, -- { total, used, expiresOn, coachSlug? }
  pt_intro_left smallint not null default 0,
  guest_passes_bought smallint not null default 0,
  billing_name text not null default '',
  billing_address text not null default '',
  receipt_email text not null default '',
  home_club_changed_at timestamptz,
  -- Small UI state the web app keeps per household.
  dismissed jsonb not null default '{}',
  remind text[] not null default '{}',
  opened jsonb not null default '{}',
  seq integer not null default 1000,
  updated_at timestamptz not null default now()
);
create index households_plan_id_idx on public.households (plan_id);

create table public.members (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  role text not null check (role in ('primary', 'adult', 'teen', 'child')),
  first_name text not null,
  last_name text not null,
  dob date not null,
  email text not null default '',
  member_number text not null,
  home_club text not null references public.clubs (slug),
  parent_id text references public.members (id) on delete set null,
  allergy_notes text,
  status text not null default 'active' check (status in ('active', 'invited', 'invite_expired')),
  ends_on timestamptz,
  invited_at timestamptz,
  permissions jsonb, -- teens: { classes, courts, lanes, coachMessages }
  pickup text[],
  hue smallint not null default 0,
  paused_until timestamptz, -- booking pause after 3 late cancels
  streak_weeks smallint not null default 0,
  lifetime_visits integer not null default 0,
  longest_streak smallint not null default 0,
  prefs jsonb not null default '{}', -- MemberPrefs from the web app
  updated_at timestamptz not null default now()
);
create index members_household_id_idx on public.members (household_id);
create index members_home_club_idx on public.members (home_club);
create index members_parent_id_idx on public.members (parent_id);

alter table public.households
  add constraint households_primary_member_id_fkey
  foreign key (primary_member_id) references public.members (id) deferrable initially deferred;
create index households_primary_member_id_idx on public.households (primary_member_id);

create table public.invoices (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  issued_at timestamptz not null,
  description text not null,
  kind text not null check (kind in ('membership', 'training', 'guest', 'fee')),
  amount numeric(8, 2) not null,
  status text not null check (status in ('paid', 'open', 'failed', 'refunded')),
  lines jsonb not null default '[]' -- [{ label, amount }]
);
create index invoices_household_id_idx on public.invoices (household_id, issued_at desc);

-- Class bookings and reservations (court, lap lane, kids club, personal training) in one table.
create table public.bookings (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  kind text not null check (kind in ('class', 'court', 'lane', 'kids', 'pt')),
  member_id text not null references public.members (id) on delete cascade, -- who it is for
  owner_id text not null references public.members (id) on delete cascade, -- who made it
  status text not null check (status in (
    'booked', 'held', 'waitlisted', 'cancelled', 'late_cancelled', 'attended', 'no_show', 'pending_approval'
  )),
  ref text not null,
  club_slug text not null references public.clubs (slug),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  title text not null,
  category_id text not null references public.categories (id),
  place text not null default '',
  session_id text, -- class bookings: "<club>~YYYY-MM-DD~HHMM~<class_key>"
  spot text,
  waitlist_position smallint,
  hold_expires_at timestamptz,
  resource text, -- "Court 3", "Lane 3"
  sport text,
  players jsonb, -- [{ name, memberId?, status }]
  children text[], -- kids club: member ids
  coach_slug text,
  payment text,
  feedback_done boolean not null default false,
  cancelled_at timestamptz,
  no_strike boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null default now()
);
create index bookings_household_id_idx on public.bookings (household_id, starts_at);
create index bookings_member_id_idx on public.bookings (member_id, status);
create index bookings_owner_id_idx on public.bookings (owner_id);
create index bookings_session_id_idx on public.bookings (session_id) where session_id is not null;
create index bookings_club_slug_idx on public.bookings (club_slug);
create index bookings_category_id_idx on public.bookings (category_id);

create table public.strikes (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  member_id text not null references public.members (id) on delete cascade,
  at timestamptz not null,
  booking_id text,
  title text not null
);
create index strikes_household_id_idx on public.strikes (household_id);
create index strikes_member_id_idx on public.strikes (member_id, at);

create table public.notices (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  member_id text not null references public.members (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  at timestamptz not null,
  read_at timestamptz,
  needs_action boolean not null default false,
  action_label text,
  booking_id text,
  request_id text,
  thread_id text,
  filter text not null check (filter in ('bookings', 'billing', 'news', 'training')),
  done text
);
create index notices_household_id_idx on public.notices (household_id);
create index notices_member_id_idx on public.notices (member_id, at desc);

create table public.message_threads (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  member_id text not null references public.members (id) on delete cascade,
  with_name text not null,
  subject text not null,
  messages jsonb not null default '[]' -- [{ from: "me" | "them", text, at (epoch ms) }]
);
create index message_threads_household_id_idx on public.message_threads (household_id);
create index message_threads_member_id_idx on public.message_threads (member_id);

create table public.teen_requests (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  teen_id text not null references public.members (id) on delete cascade,
  parent_id text not null references public.members (id) on delete cascade,
  session_id text,
  title text not null,
  note text,
  at timestamptz not null,
  status text not null check (status in ('pending', 'approved', 'declined')),
  expires_at timestamptz not null
);
create index teen_requests_household_id_idx on public.teen_requests (household_id);
create index teen_requests_teen_id_idx on public.teen_requests (teen_id);
create index teen_requests_parent_id_idx on public.teen_requests (parent_id);

create table public.guest_passes (
  id text primary key,
  household_id text not null references public.households (id) on delete cascade,
  guest_name text not null,
  contact text not null,
  club_slug text not null references public.clubs (slug),
  visit_date timestamptz not null,
  valid_until timestamptz not null,
  status text not null check (status in ('sent', 'opened', 'used', 'expired', 'cancelled')),
  bought boolean not null default false,
  used_on timestamptz,
  message text,
  sent_at timestamptz not null
);
create index guest_passes_household_id_idx on public.guest_passes (household_id);
create index guest_passes_club_slug_idx on public.guest_passes (club_slug);

create table public.visits (
  id bigint generated by default as identity primary key,
  household_id text not null references public.households (id) on delete cascade,
  member_id text not null references public.members (id) on delete cascade,
  club_slug text not null references public.clubs (slug),
  at timestamptz not null,
  category_id text references public.categories (id),
  unique (member_id, at)
);
create index visits_household_id_idx on public.visits (household_id);
create index visits_club_slug_idx on public.visits (club_slug);
create index visits_category_id_idx on public.visits (category_id);

-- ---------------------------------------------------------------------------------------------
-- 3. Requests from the marketing site (insert only)
-- ---------------------------------------------------------------------------------------------

create table public.tour_requests (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  club_slug text not null references public.clubs (slug),
  slot_at timestamptz not null,
  first_name text not null check (char_length(first_name) between 1 and 80),
  contact text not null check (char_length(contact) between 3 and 200), -- email or phone
  note text check (char_length(note) <= 1000),
  remind boolean not null default false,
  with_coach text,
  created_at timestamptz not null default now()
);
create index tour_requests_club_slug_idx on public.tour_requests (club_slug);

create table public.trial_passes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  club_slug text not null references public.clubs (slug),
  first_name text not null check (char_length(first_name) between 1 and 80),
  contact text not null check (char_length(contact) between 3 and 200),
  remind boolean not null default false,
  created_at timestamptz not null default now()
);
create index trial_passes_club_slug_idx on public.trial_passes (club_slug);

-- No card data. The join flow keeps its payment step as a demo and sends only the plan and the people.
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans (id),
  club_slug text not null references public.clubs (slug),
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null default '',
  birth_date date,
  zip text not null default '',
  sms_opt_in boolean not null default false,
  news_opt_in boolean not null default false,
  mode text not null default 'solo' check (mode in ('solo', 'family')),
  family jsonb not null default '{"adults": [], "kids": []}',
  promo text not null default '',
  created_at timestamptz not null default now()
);
create index join_requests_plan_id_idx on public.join_requests (plan_id);
create index join_requests_club_slug_idx on public.join_requests (club_slug);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  topic text not null default '',
  club_slug text references public.clubs (slug),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index contact_messages_club_slug_idx on public.contact_messages (club_slug);

create table public.email_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 200),
  source text not null check (source in ('newsletter', 'job_alert', 'pass_reminder')),
  details jsonb not null default '{}', -- job alerts: { club, dept, type }
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------------

-- The household of the signed-in member. Security definer so policies on members do not recurse.
create function private.current_household_id()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select household_id from public.members where auth_user_id = (select auth.uid()) limit 1
$$;
grant usage on schema private to authenticated;
grant execute on function private.current_household_id() to authenticated;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger households_touch before update on public.households
  for each row execute function private.touch_updated_at();
create trigger members_touch before update on public.members
  for each row execute function private.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function private.touch_updated_at();

-- A member can edit their family, but not move a row to another household or claim a login.
create function private.guard_member_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.role()) = 'authenticated' then
    if tg_op = 'INSERT' then
      new.auth_user_id := null;
    elsif new.auth_user_id is distinct from old.auth_user_id
       or new.household_id is distinct from old.household_id then
      raise exception 'auth_user_id and household_id cannot change' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
create trigger members_guard before insert or update on public.members
  for each row execute function private.guard_member_row();

-- Spots taken in each class session by all households, so every member sees the same spots-left count.
-- Returns counts only, never who booked.
create function public.session_counts(p_from timestamptz, p_to timestamptz)
returns table (session_id text, booked integer, waitlisted integer)
language sql
stable
security definer
set search_path = ''
as $$
  select b.session_id,
         count(*) filter (where b.status in ('booked', 'held', 'attended'))::integer,
         count(*) filter (where b.status = 'waitlisted')::integer
  from public.bookings b
  where b.kind = 'class'
    and b.session_id is not null
    and b.starts_at >= p_from
    and b.starts_at < p_to
  group by b.session_id
$$;
revoke execute on function public.session_counts(timestamptz, timestamptz) from public;
grant execute on function public.session_counts(timestamptz, timestamptz) to anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Demo reset: puts the signed-in member's household back to its seeded state.
-- ---------------------------------------------------------------------------------------------

create table private.demo_seed (
  household_id text not null,
  table_name text not null,
  rows jsonb not null,
  primary key (household_id, table_name)
);

create function public.reset_demo_household()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  hh text := private.current_household_id();
  t text;
  child_tables text[] := array[
    'invoices', 'bookings', 'strikes', 'notices', 'message_threads', 'teen_requests', 'guest_passes', 'visits'
  ];
  logins jsonb;
begin
  if hh is null then
    raise exception 'not a member' using errcode = '42501';
  end if;
  if not exists (select 1 from private.demo_seed where household_id = hh) then
    raise exception 'no demo seed for this household' using errcode = 'P0002';
  end if;

  foreach t in array child_tables loop
    execute format('delete from public.%I where household_id = $1', t) using hh;
  end loop;

  -- Keep logins: members are deleted and inserted again with the same auth_user_id.
  select coalesce(jsonb_object_agg(id, auth_user_id), '{}') into logins
  from public.members where household_id = hh and auth_user_id is not null;

  set constraints households_primary_member_id_fkey deferred;
  delete from public.members where household_id = hh and id not in (
    select r->>'id' from private.demo_seed s, jsonb_array_elements(s.rows) r
    where s.household_id = hh and s.table_name = 'members'
  );
  delete from public.households where id = hh;

  insert into public.households
  select * from jsonb_populate_recordset(null::public.households,
    (select rows from private.demo_seed where household_id = hh and table_name = 'households'));

  insert into public.members
  select * from jsonb_populate_recordset(null::public.members,
    (select rows from private.demo_seed where household_id = hh and table_name = 'members'))
  on conflict (id) do update set
    role = excluded.role, first_name = excluded.first_name, last_name = excluded.last_name,
    dob = excluded.dob, email = excluded.email, member_number = excluded.member_number,
    home_club = excluded.home_club, parent_id = excluded.parent_id, allergy_notes = excluded.allergy_notes,
    status = excluded.status, ends_on = excluded.ends_on, invited_at = excluded.invited_at,
    permissions = excluded.permissions, pickup = excluded.pickup, hue = excluded.hue,
    paused_until = excluded.paused_until, streak_weeks = excluded.streak_weeks,
    lifetime_visits = excluded.lifetime_visits, longest_streak = excluded.longest_streak,
    prefs = excluded.prefs;

  update public.members m set auth_user_id = (logins->>m.id)::uuid
  where m.household_id = hh and logins ? m.id;

  foreach t in array child_tables loop
    execute format(
      'insert into public.%1$I select * from jsonb_populate_recordset(null::public.%1$I, '
      || '(select rows from private.demo_seed where household_id = $1 and table_name = %2$L))',
      t, t
    ) using hh;
  end loop;
end;
$$;
revoke execute on function public.reset_demo_household() from public, anon;
grant execute on function public.reset_demo_household() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------------------------

do $$
declare
  t text;
begin
  -- Catalog: anyone can read.
  foreach t in array array[
    'categories', 'clubs', 'coaches', 'class_types', 'class_schedules', 'plans', 'pt_packs',
    'plan_comparison', 'price_constants', 'faqs', 'journal_posts', 'jobs', 'site_content'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Anyone can read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;

  -- Household rows: members of the household read and write them.
  foreach t in array array[
    'invoices', 'bookings', 'strikes', 'notices', 'message_threads', 'teen_requests', 'guest_passes', 'visits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Household reads" on public.%I for select to authenticated '
      || 'using (household_id = (select private.current_household_id()))', t);
    execute format(
      'create policy "Household inserts" on public.%I for insert to authenticated '
      || 'with check (household_id = (select private.current_household_id()))', t);
    execute format(
      'create policy "Household updates" on public.%I for update to authenticated '
      || 'using (household_id = (select private.current_household_id())) '
      || 'with check (household_id = (select private.current_household_id()))', t);
    execute format(
      'create policy "Household deletes" on public.%I for delete to authenticated '
      || 'using (household_id = (select private.current_household_id()))', t);
  end loop;

  -- Marketing requests: anyone can send one. Nobody reads them through the API.
  foreach t in array array[
    'tour_requests', 'trial_passes', 'join_requests', 'contact_messages', 'email_signups'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Anyone can send" on public.%I for insert to anon, authenticated with check (true)', t);
  end loop;
end;
$$;

alter table public.households enable row level security;
create policy "Household reads" on public.households for select to authenticated
  using (id = (select private.current_household_id()));
create policy "Household updates" on public.households for update to authenticated
  using (id = (select private.current_household_id()))
  with check (id = (select private.current_household_id()));

alter table public.members enable row level security;
create policy "Household reads" on public.members for select to authenticated
  using (household_id = (select private.current_household_id()));
create policy "Household inserts" on public.members for insert to authenticated
  with check (household_id = (select private.current_household_id()));
create policy "Household updates" on public.members for update to authenticated
  using (household_id = (select private.current_household_id()))
  with check (household_id = (select private.current_household_id()));
create policy "Household deletes" on public.members for delete to authenticated
  using (household_id = (select private.current_household_id()) and auth_user_id is null);

-- Realtime: the apps can listen for changes to their own household's bookings and notices.
alter publication supabase_realtime add table public.bookings, public.notices;
