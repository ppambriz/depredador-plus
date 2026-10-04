import type { DraftItem, Order } from "@/types";
import { supabase } from "@/lib/supabase";
import { codeService } from "@/services/codeService";

export type CustomerInput = {
  name: string;
  phone: string;
  notes: string;
};

export const orderService = {
  async createFromDraft(
    customer: CustomerInput,
    items: DraftItem[],
  ): Promise<Order> {
    if (!supabase) throw new Error("Supabase is not configured");
    if (items.length === 0) throw new Error("Empty order");

    const code = await codeService.suggestNextCode("order");

    const subtotal = items.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0,
    );
    const costTotal = items.reduce(
      (sum, i) => sum + i.unit_cost * i.quantity,
      0,
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        code,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_notes: customer.notes.trim() || null,
        subtotal,
        total: subtotal,
        cost_total: costTotal,
        source: "web",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderRow = order as Order;

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity,
      })),
    );

    if (itemsError) throw itemsError;

    await codeService.registerCode("order", code);

    return orderRow;
  },
};
