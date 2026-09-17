-- Seed categories
-- Seed categories
insert into categories (name, slug, type) values
  ('Cucarachas', 'cucarachas', 'insect'),
  ('Moscos',     'moscos',     'insect'),
  ('Moscas',     'moscas',     'insect'),
  ('Hormigas',   'hormigas',   'insect'),
  ('Alacranes',  'alacranes',  'insect')
on conflict (slug) do nothing;

-- Seed products (using category IDs from above)
insert into products (name, slug, description, price, category_id, active_ingredient, usage_instructions, warnings)
select
  'Líquido anti-cucarachas',
  'liquido-anti-cucarachas',
  'Cebo en liquido de acción rápida para eliminar cucarachas.',
  149.99,
  c.id,
  null,
  'Aplicar pequeñas gotas en grietas, esquinas y detrás de muebles.',
  'Mantener fuera del alcance de niños y mascotas.'
from categories c where c.slug = 'cucarachas'
on conflict (slug) do nothing;

insert into products (name, slug, description, price, category_id, active_ingredient, usage_instructions, warnings)
select
  'Líquido mata moscos',
  'aerosol-mata-moscos',
  'Insecticida en líquido para moscos y mosquitos. Acción inmediata.',
  89.99,
  c.id,
  null,
  'Rociar al aire en la habitación con puertas y ventanas cerradas. Ventilar después de 15 minutos.',
  'No inhalar directamente. No aplicar sobre alimentos.'
from categories c where c.slug = 'moscos'
on conflict (slug) do nothing;

insert into products (name, slug, description, price, category_id, active_ingredient, usage_instructions, warnings)
select
  'Líquido para hormigas',
  'liquido-para-hormigas',
  'Liquido atomizado que las hormigas llevan al nido. Elimina la colonia completa.',
  59.99,
  c.id,
  null,
  'Colocar cerca de los caminos de hormigas y hormigueros',
  'Mantener fuera del alcance de niños y mascotas.'
from categories c where c.slug = 'hormigas'
on conflict (slug) do nothing;