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