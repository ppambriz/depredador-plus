-- =============================================================
-- 001_init.sql — Depredador Plus
-- Initial schema: catalog, visible codes, soft delete, audit
-- =============================================================

-- -------------------------------------------------------------
-- Code sequences: configurable prefix and zero padding
-- Editable from the admin panel (e.g. CP0001, CC0001, CB0001)
-- -------------------------------------------------------------
create table code_sequences (
  entity text primary key,
  prefix text not null,
  padding int not null default 4,
  updated_at timestamptz not null default now()
);

insert into code_sequences (entity, prefix, padding) values
  ('product',      'CP', 4),
  ('category',     'CC', 4),
  ('banner_slide', 'CB', 4);

-- -------------------------------------------------------------
-- Categories
-- type: how the catalog is grouped
--   insect = pest type | format = presentation
--   area   = usage area | line = business line
-- -------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  type text not null check (type in ('insect', 'format', 'area', 'line')),

  -- soft delete + audit
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  deleted_user_agent text,
  deleted_ip text
);

-- -------------------------------------------------------------
-- Products
-- visible_public: false = internal only (not shown in the store)
-- -------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slug text not null unique,
  description text default '',
  price numeric(10,2) not null default 0,
  cost numeric(10,2) not null default 0,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  visible_public boolean not null default true,

  -- safety data sheet
  active_ingredient text,
  usage_instructions text,
  warnings text,

  -- inventory
  stock int not null default 0,
  min_stock int not null default 0,

  -- soft delete + audit
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  deleted_user_agent text,
  deleted_ip text
);

-- -------------------------------------------------------------
-- Banner slides (carousel mode)
-- -------------------------------------------------------------
create table banner_slides (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  image_url text not null,
  title text,
  subtitle text,
  link text,
  "order" int not null default 0,

  -- soft delete + audit
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  deleted_user_agent text,
  deleted_ip text
);

-- -------------------------------------------------------------
-- Site settings: one fixed row per admin section
-- 'modules' holds the feature flags for upcoming modules
-- -------------------------------------------------------------
create table site_settings (
  section text primary key,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into site_settings (section, enabled, config) values
  ('banner',           false, '{"mode":"static","autoplay_ms":5000}'::jsonb),
  ('welcome_modal',    false, '{"frequency":"session"}'::jsonb),
  ('announcement_bar', false, '{"text":"","color":"#F9A825"}'::jsonb),
  ('contact',          true,  '{"whatsapp":"","email":""}'::jsonb),
  ('modules',          true,  '{"orders":false,"credit":false,"inventory":false,"reports":false}'::jsonb);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table code_sequences enable row level security;
alter table categories     enable row level security;
alter table products       enable row level security;
alter table banner_slides  enable row level security;
alter table site_settings  enable row level security;

-- Public: read-only, active records only
create policy "public read active categories" on categories
  for select using (active = true);

create policy "public read visible products" on products
  for select using (active = true and visible_public = true);

create policy "public read active slides" on banner_slides
  for select using (active = true);

create policy "public read settings" on site_settings
  for select using (true);

-- Authenticated (admin): full access
create policy "authenticated read sequences" on code_sequences
  for select to authenticated using (true);

create policy "admin all sequences"  on code_sequences for all to authenticated using (true) with check (true);
create policy "admin all categories" on categories     for all to authenticated using (true) with check (true);
create policy "admin all products"   on products       for all to authenticated using (true) with check (true);
create policy "admin all slides"     on banner_slides  for all to authenticated using (true) with check (true);
create policy "admin all settings"   on site_settings  for all to authenticated using (true) with check (true);