-- The primary member foreign key is already initially deferred, so the reset does not need to set it.
-- (The earlier version named the constraint without its schema, which fails with an empty search_path.)
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
end;
$$;
