-- Invoice numbers are unique inside a household, not across all households.
alter table public.invoices drop constraint invoices_pkey;
alter table public.invoices add primary key (household_id, id);
