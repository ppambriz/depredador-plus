import type { DraftItem } from "@/types";
import { formatPrice } from "@/lib/format";

type BuildParams = {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  items: DraftItem[];
  total: number;
  businessName: string;
};

export function buildOrderMessage({
  orderCode,
  customerName,
  customerPhone,
  notes,
  items,
  total,
  businessName,
}: BuildParams): string {
  const lines: string[] = [];

  lines.push(`*Pedido ${orderCode}* — ${businessName}`);
  lines.push("");
  lines.push(`*Cliente:* ${customerName}`);
  lines.push(`*Teléfono:* ${customerPhone}`);
  lines.push("");
  lines.push("*Productos:*");

  items.forEach((item) => {
    const lineTotal = item.unit_price * item.quantity;
    lines.push(
      `• ${item.quantity} × ${item.product_name} (${item.product_code})`,
    );
    lines.push(
      `   ${formatPrice(item.unit_price)} c/u = ${formatPrice(lineTotal)}`,
    );
  });

  lines.push("");
  lines.push(`*TOTAL: ${formatPrice(total)}*`);

  if (notes.trim()) {
    lines.push("");
    lines.push(`*Observaciones:* ${notes.trim()}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
