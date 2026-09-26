-- =============================================================
-- seed.sql — Depredador Plus
-- Sample data for local development and QA
-- =============================================================

-- Categories
insert into categories (code, name, slug, type) values
  ('CC0001', 'Cucarachas', 'cucarachas', 'insect'),
  ('CC0002', 'Moscos',     'moscos',     'insect'),
  ('CC0003', 'Moscas',     'moscas',     'insect'),
  ('CC0004', 'Hormigas',   'hormigas',   'insect'),
  ('CC0005', 'Alacranes',  'alacranes',  'insect')
on conflict (code) do nothing;

-- Products
insert into products (code, name, slug, description, price, cost, category_id,
                      active_ingredient, usage_instructions, warnings, stock, min_stock)
select 'CP0001', 'Gel anti-cucarachas', 'gel-anti-cucarachas',
  'Cebo en gel de acción rápida para eliminar cucarachas.',
  149.00, 85.00, c.id,
  'Fipronil 0.05%',
  'Aplicar pequeñas gotas en grietas, esquinas y detrás de muebles.',
  'Mantener fuera del alcance de niños y mascotas.',
  20, 5
from categories c where c.slug = 'cucarachas'
on conflict (code) do nothing;

insert into products (code, name, slug, description, price, cost, category_id,
                      active_ingredient, usage_instructions, warnings, stock, min_stock)
select 'CP0002', 'Aerosol mata moscos', 'aerosol-mata-moscos',
  'Insecticida en aerosol para moscos y mosquitos. Acción inmediata.',
  89.00, 52.00, c.id,
  'Piretrinas 0.15%',
  'Rociar al aire en la habitación con puertas y ventanas cerradas. Ventilar después de 15 minutos.',
  'No inhalar directamente. No aplicar sobre alimentos.',
  35, 10
from categories c where c.slug = 'moscos'
on conflict (code) do nothing;

insert into products (code, name, slug, description, price, cost, category_id,
                      active_ingredient, usage_instructions, warnings, stock, min_stock)
select 'CP0003', 'Trampa para hormigas', 'trampa-para-hormigas',
  'Estación cebo que las hormigas llevan al nido. Elimina la colonia completa.',
  65.00, 38.00, c.id,
  'Borax 5%',
  'Colocar cerca de los caminos de hormigas. No abrir la estación.',
  'Mantener fuera del alcance de niños y mascotas.',
  12, 5
from categories c where c.slug = 'hormigas'
on conflict (code) do nothing;