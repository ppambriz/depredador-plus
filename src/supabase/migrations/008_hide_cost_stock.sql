-- DP034: el visitante anónimo solo puede leer columnas seguras de products.
-- IMPORTANTE: si en el futuro agregas una columna pública a products,
-- debes agregarla también a este grant, o el catálogo no podrá leerla.

-- 1. Quitamos al rol anon el permiso de leer la tabla completa
revoke select on public.products from anon;

-- 2. Le damos permiso solo sobre columnas seguras
grant select (
  id, code, name, slug, description, price, image_url, category_id,
  active_ingredient, usage_instructions, warnings,
  active, visible_public, created_at
) on public.products to anon;

-- 3. Recargamos la caché de esquema de la API
notify pgrst, 'reload schema';