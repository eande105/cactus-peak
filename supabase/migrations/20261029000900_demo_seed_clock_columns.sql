-- The household snapshots were taken before the shared clock columns existed, so a reset wrote null into
-- demo_clock_skew_ms. Add the columns to the snapshots. reset_demo_household() then restarts the clock.
update private.demo_seed
set rows = (
  select jsonb_agg(r || '{"demo_clock_started_at": null, "demo_clock_skew_ms": 0}'::jsonb)
  from jsonb_array_elements(rows) r
)
where table_name = 'households';
