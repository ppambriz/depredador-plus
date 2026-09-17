-- Categories: insect type, format or usage area
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null check (type in ('insect', 'format', 'area')),
  created_at timestamptz not null default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  price numeric(10,2) not null default 0,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  active boolean not null default true,
  active_ingredient text,
  usage_instructions text,
  warnings text,
  created_at timestamptz not null default now()
);

-- Site settings: one row per admin section (banner, modal, etc.)
create table if not exists site_settings (
  section text primary key,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Banner carousel slides
create table if not exists banner_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  link text,
  "order" int not null default 0,
  active boolean not null default true
);

-- Row Level Security (RLS)
alter table categories    enable row level security;
alter table products      enable row level security;
alter table site_settings enable row level security;
alter table banner_slides enable row level security;

-- Public read: anyone can see the catalog and settings
create policy "public read categories"  on categories    for select using (true);
create policy "public read products"    on products      for select using (true);
create policy "public read settings"    on site_settings for select using (true);
create policy "public read slides"      on banner_slides for select using (true);

-- Admin write: only authenticated users can modify data
create policy "admin write categories"  on categories    for all to authenticated using (true) with check (true);
create policy "admin write products"    on products      for all to authenticated using (true) with check (true);
create policy "admin write settings"    on site_settings for all to authenticated using (true) with check (true);
create policy "admin write slides"      on banner_slides for all to authenticated using (true) with check (true);