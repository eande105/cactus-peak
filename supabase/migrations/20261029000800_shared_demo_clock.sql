-- One demo clock per household, shared by the web app and the iOS app.
-- Demo "now" = Tue Oct 27, 2026, 5:40 a.m. Arizona time + (real now - demo_clock_started_at) + demo_clock_skew_ms.
-- Before this, each browser and each phone kept its own clock, so two devices showed different demo times.

alter table public.households
  add column demo_clock_started_at timestamptz,
  add column demo_clock_skew_ms bigint not null default 0;

-- Returns the household's clock and restarts it when it is missing or older than 3 hours,
-- so a demo opened the next day starts again at 5:40 a.m. server_now lets a device correct its own clock offset.
create function public.demo_clock()
returns table (started_at timestamptz, skew_ms bigint, server_now timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  hh text := private.current_household_id();
begin
  if hh is null then
    raise exception 'not a member' using errcode = '42501';
  end if;
  update public.households h
  set demo_clock_started_at = now(), demo_clock_skew_ms = 0
  where h.id = hh
    and (h.demo_clock_started_at is null or h.demo_clock_started_at < now() - interval '3 hours');
  return query
  select h.demo_clock_started_at, h.demo_clock_skew_ms, now()
  from public.households h where h.id = hh;
end;
$$;
revoke execute on function public.demo_clock() from public, anon;
grant execute on function public.demo_clock() to authenticated;

-- The reset also restarts the shared clock.
create or replace function public.reset_demo_household()
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

  -- Every device of this household starts the demo day again from Tue Oct 27, 5:40 a.m.
  update public.households
  set demo_clock_started_at = now(), demo_clock_skew_ms = 0
  where id = hh;
end;
$$;

-- Devices learn about a clock jump or a reset from another device through realtime.
alter publication supabase_realtime add table public.households;
