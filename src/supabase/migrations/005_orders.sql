-- 005: Pedidos (orders) y sus líneas (order_items).
-- RECONSTRUIDA a partir del estado real de la BD (DP034).
-- NO EJECUTAR: ya está aplicada en Supabase. Queda como registro
-- para poder recrear la BD desde cero en orden 001 → 00N.
-- Nota: la 007 reemplaza las políticas de insert público de este archivo.

-- =========================================================
-- orders
-- =========================================================
create table orders (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,

  -- Cliente
  customer_name      text not null,
  customer_phone     text not null,
  customer_notes     text,
  customer_email     text,
  customer_address   text,

  -- Estados
  status             text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'partial', 'delivered', 'cancelled')),
  payment_status     text not null default 'unpaid'
                     check (payment_status in ('unpaid', 'paid', 'credit', 'partial')),
  cancel_reason      text,

  -- Importes (precios y costos congelados al momento del pedido)
  subtotal           numeric(10,2) not null default 0,
  discount_type      text check (discount_type in ('percent', 'amount')),
  discount_value     numeric(10,2) not null default 0,
  discount_total     numeric(10,2) not null default 0,
  total              numeric(10,2) not null default 0,
  cost_total         numeric(10,2) not null default 0,

  -- Entrega
  delivery_type      text not null default 'pickup'
                     check (delivery_type in ('pickup', 'delivery')),
  carrier            text,
  tracking_number    text,
  shipping_cost      numeric(10,2) not null default 0,

  -- Facturación (oculta tras checkbox en el admin)
  needs_invoice      boolean not null default false,
  tax_id             text,
  legal_name         text,

  -- Origen y ciclo de vida
  source             text not null default 'web'
                     check (source in ('web', 'admin')),
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  created_by         uuid references auth.users(id),
  confirmed_at       timestamptz,
  delivered_at       timestamptz,

  -- Auditoría de borrado lógico
  deleted_at         timestamptz,
  deleted_by         uuid references auth.users(id),
  deleted_user_agent text,
  deleted_ip         text
);

create index orders_created_at_idx on orders (created_at desc);

-- =========================================================
-- order_items
-- =========================================================
create table order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,

  -- product_id nulo = línea genérica (texto libre)
  product_id         uuid references products(id) on delete set null,
  product_code       text,
  product_name       text not null,

  unit_price         numeric(10,2) not null default 0,
  unit_cost          numeric(10,2) not null default 0,
  quantity           integer not null default 1,

  -- Entregas parciales
  delivered_quantity integer not null default 0,
  missing_reason     text,

  -- Descuento por línea
  discount_type      text check (discount_type in ('percent', 'amount')),
  discount_value     numeric(10,2) not null default 0,
  subtotal           numeric(10,2) not null default 0,

  created_at         timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);

-- =========================================================
-- RLS
-- =========================================================
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Visitante y admin pueden crear pedidos (reemplazado en la 007)
create policy "public insert orders" on orders
  for insert to anon, authenticated with check (true);

create policy "public insert order items" on order_items
  for insert to anon, authenticated with check (true);

-- Solo el admin lee, edita y borra
create policy "admin read orders" on orders
  for select to authenticated using (true);
create policy "admin update orders" on orders
  for update to authenticated using (true) with check (true);
create policy "admin delete orders" on orders
  for delete to authenticated using (true);

create policy "admin read order items" on order_items
  for select to authenticated using (true);
create policy "admin update order items" on order_items
  for update to authenticated using (true) with check (true);
create policy "admin delete order items" on order_items
  for delete to authenticated using (true);