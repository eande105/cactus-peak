-- Cycle labels said "Up to 24 riders", but the rooms hold 18 to 20 bikes.
update public.class_types
set group_label = 'Up to ' || capacity || ' riders'
where group_label ~ '^Up to \d+ riders$';
