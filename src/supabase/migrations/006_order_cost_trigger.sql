-- DP034: el costo de cada línea lo pone la BD, nunca el navegador.

-- 1. Copia el costo actual del producto a la línea del pedido
create or replace function public.set_order_item_cost()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo líneas ligadas a un producto; la línea genérica (texto libre)
  -- conserva el costo que capture el admin.
  if new.product_id is not null then
    select p.cost into new.unit_cost
    from products p
    where p.id = new.product_id;

    new.unit_cost := coalesce(new.unit_cost, 0);
  end if;
  return new;
end;
$$;

create trigger trg_order_items_set_cost
before insert or update of product_id on public.order_items
for each row execute function public.set_order_item_cost();

-- 2. Recalcula el costo total del pedido cuando cambian sus líneas
create or replace function public.recalc_order_cost_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if tg_op = 'DELETE' then
    v_order_id := old.order_id;
  else
    v_order_id := new.order_id;
  end if;

  update orders
     set cost_total = coalesce(
       (select sum(unit_cost * quantity)
          from order_items
         where order_id = v_order_id), 0)
   where id = v_order_id;

  return null;
end;
$$;

create trigger trg_order_items_recalc_cost
after insert or update of unit_cost, quantity or delete on public.order_items
for each row execute function public.recalc_order_cost_total();