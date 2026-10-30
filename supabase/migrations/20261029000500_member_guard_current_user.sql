-- Check the database role, not the JWT role. reset_demo_household() runs as its owner and must restore logins.
create or replace function private.guard_member_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
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
