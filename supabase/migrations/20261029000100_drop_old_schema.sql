-- Removes the schema of the first build (cactus-peak-athletic). That build is retired.
-- The new marketing site, member web app and iOS app use the schema in the next migration.

select cron.unschedule('generate-class-sessions')
where exists (select 1 from cron.job where jobname = 'generate-class-sessions');

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.book_class_session(uuid);
drop function if exists public.cancel_booking(uuid);
drop function if exists public.generate_class_sessions(integer);
drop function if exists public.handle_new_user();

drop table if exists
  public.bookings,
  public.join_requests,
  public.memberships,
  public.profiles,
  public.class_sessions,
  public.class_schedule_slots,
  public.classes,
  public.class_types,
  public.events,
  public.membership_plans,
  public.club_photos,
  public.club_facilities,
  public.facilities,
  public.club_hours,
  public.clubs
cascade;

drop function if exists public.touch_updated_at();

-- The old demo account belonged to the retired build.
delete from auth.users where email = 'demo@cactuspeak.test';
