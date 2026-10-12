-- DP034: el visitante crea pedidos SOLO a través de esta función.
-- La BD genera el código, toma precio/costo de products y lo hace todo
-- en una sola transacción (todo o nada).

create or replace function public.create_public_order(
  p_customer_name  text,
  p_customer_phone text,
  p_customer_notes text,
  p_items          jsonb   -- [{"product_id": "uuid", "quantity": 2}, ...]
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix     text;
  v_padding    int;
  v_last       text;
  v_next       int := 1;
  v_code       text;
  v_order_id   uuid := gen_random_uuid();
  v_item_count int;
  v_inserted   int;
  v_subtotal   numeric;
begin
  -- 1. Validaciones
  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_customer_phone), '') = '' then
    raise exception 'Nombre y teléfono son obligatorios';
  end if;

  v_item_count := coalesce(jsonb_array_length(p_items), 0);
  if v_item_count = 0 then
    raise exception 'El pedido está vacío';
  end if;

  -- 2. Candado: si dos clientes envían al mismo tiempo, uno espera al otro
  --    y no se repite el código
  perform pg_advisory_xact_lock(hashtext('order_code'));

  -- 3. Siguiente código (misma lógica que codeService.suggestNextCode)
  select prefix, padding into v_prefix, v_padding
  from code_sequences
  where entity = 'order';

  if v_prefix is null then
    raise exception 'No existe secuencia de códigos para pedidos';
  end if;

  select code into v_last
  from used_codes
  where entity = 'order' and code like v_prefix || '%'
  order by code desc
  limit 1;

  if v_last is not null then
    v_next := coalesce(
      nullif(regexp_replace(substr(v_last, length(v_prefix) + 1), '\D', '', 'g'), '')::int,
      0
    ) + 1;
  end if;

  -- lpad recorta si el número es más largo que el padding; esto lo evita
  v_code := v_prefix || case
    when length(v_next::text) >= v_padding then v_next::text
    else lpad(v_next::text, v_padding, '0')
  end;

  -- 4. Pedido (status, payment_status, etc. toman sus valores por defecto)
  insert into orders (id, code, customer_name, customer_phone, customer_notes, source)
  values (v_order_id, v_code, trim(p_customer_name), trim(p_customer_phone),
          nullif(trim(p_customer_notes), ''), 'web');

  -- 5. Líneas: precio desde products; el costo lo pone el trigger de la 006
  insert into order_items (order_id, product_id, product_code, product_name,
                           unit_price, quantity, subtotal)
  select v_order_id, p.id, p.code, p.name, p.price, i.quantity, p.price * i.quantity
  from jsonb_to_recordset(p_items) as i(product_id uuid, quantity int)
  join products p on p.id = i.product_id
  where p.active and p.visible_public and i.quantity > 0;

  get diagnostics v_inserted = row_count;
  if v_inserted <> v_item_count then
    raise exception 'Uno o más productos ya no están disponibles';
  end if;

  -- 6. Totales del pedido
  select coalesce(sum(subtotal), 0) into v_subtotal
  from order_items
  where order_id = v_order_id;

  update orders
  set subtotal = v_subtotal, total = v_subtotal
  where id = v_order_id;

  -- 7. Reservar el código para siempre
  insert into used_codes (entity, code) values ('order', v_code);

  return v_code;
end;
$$;

-- Solo esta función puede usarse desde el sitio público
revoke all on function public.create_public_order(text, text, text, jsonb) from public;
grant execute on function public.create_public_order(text, text, text, jsonb) to anon, authenticated;

-- El visitante ya NO puede insertar directo en las tablas
drop policy "public insert orders" on public.orders;
drop policy "public insert order items" on public.order_items;

-- El admin sí (para DP032: crear pedido desde el admin)
create policy "admin insert orders" on public.orders
  for insert to authenticated with check (true);

create policy "admin insert order items" on public.order_items
  for insert to authenticated with check (true);