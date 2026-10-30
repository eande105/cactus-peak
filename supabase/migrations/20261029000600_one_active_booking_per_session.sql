-- One active booking per member per class session, from any device (web and iOS can race).
-- The apps show "You already have this booking" for the unique violation (23505).
create unique index bookings_member_session_active_uidx on public.bookings (member_id, session_id)
  where session_id is not null and status in ('booked', 'held', 'waitlisted');

-- "Up to N" group labels came from the marketing copy and disagreed with the real capacity.
update public.class_types
set group_label = 'Up to ' || capacity
where group_label ~ '^Up to \d+$';
