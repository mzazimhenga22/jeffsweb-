-- Creates checkout_events table used for tracking checkout visits and cart totals.
-- Adjust RLS policies to your auth model before enabling in production.

create table if not exists checkout_events (
  id uuid primary key,
  user_id text null,
  cart_total numeric null,
  source text null,
  created_at timestamptz not null default now()
);

-- Optional: query performance
create index if not exists checkout_events_user_id_idx on checkout_events (user_id);

-- Optional RLS (customize per your roles)
-- alter table checkout_events enable row level security;
-- create policy "allow admin" on checkout_events
--   for all using (auth.role() = 'admin') with check (auth.role() = 'admin');
