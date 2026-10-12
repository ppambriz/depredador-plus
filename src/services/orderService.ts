import type { DraftItem } from "@/types";
import { supabase } from "@/lib/supabase";

export type CustomerInput = {
  name: string;
  phone: string;
  notes: string;
};

export const orderService = {
  /**
   * Crea el pedido mediante la función create_public_order de la BD.
   * La BD genera el código, toma precio y costo de products,
   * registra el código y lo hace todo en una sola transacción.
   * Devuelve el código del pedido (ej. "PE0001").
   */
  async createFromDraft(
    customer: CustomerInput,
    items: DraftItem[],
  ): Promise<string> {
    if (!supabase) throw new Error("Supabase is not configured");
    if (items.length === 0) throw new Error("Empty order");

    const { data, error } = await supabase.rpc("create_public_order", {
      p_customer_name: customer.name,
      p_customer_phone: customer.phone,
      p_customer_notes: customer.notes,
      // Solo qué producto y cuántos; precio y costo los pone la BD
      p_items: items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
    });

    if (error) throw error;
    return data as string;
  },
};
