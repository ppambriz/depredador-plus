-- Permanent registry of every code ever used.
-- Survives hard deletes so codes are never recycled.
create table used_codes (
  code text primary key,
  entity text not null,
  created_at timestamptz not null default now()
);

alter table used_codes enable row level security;

create policy "authenticated read used codes" on used_codes
  for select to authenticated using (true);

create policy "authenticated write used codes" on used_codes
  for all to authenticated using (true) with check (true);

-- Register the codes that already exist
insert into used_codes (code, entity)
  select code, 'category' from categories
  union all
  select code, 'product' from products
on conflict (code) do nothing;