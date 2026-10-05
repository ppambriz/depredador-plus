import { Link } from "react-router-dom";
import { useState } from "react";

import type { ContactConfig } from "@/types";
import { useOrder } from "@/components/order/OrderProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { usePublicSetting } from "@/hooks/usePublicSetting";
import { DEFAULTS } from "@/services/settingsService";
import { orderService } from "@/services/orderService";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { Field, inputClass } from "@/components/ui/Field";

type Props = {
  onSent: (orderCode: string) => void;
};

export function SendOrderForm({ onSent }: Props) {
  const { items, total, clear } = useOrder();
  const { showToast } = useToast();
  const { config } = usePublicSetting<ContactConfig>(
    "contact",
    DEFAULTS.contact,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      showToast("Escribe tu nombre y un teléfono de 10 dígitos.", "error");
      return;
    }

    if (!config.whatsapp) {
      showToast("La tienda aún no tiene WhatsApp configurado.", "error");
      return;
    }

    setSending(true);

    try {
      const order = await orderService.createFromDraft(
        { name, phone, notes },
        items,
      );

      const message = buildOrderMessage({
        orderCode: order.code,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        notes,
        items,
        total,
        businessName: config.business_name || "Depredador Plus",
      });

      window.open(buildWhatsAppUrl(config.whatsapp, message), "_blank");

      clear();
      onSent(order.code);
    } catch {
      showToast("No se pudo registrar el pedido. Intenta de nuevo.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tu nombre">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className={inputClass}
          />
        </Field>

        <Field label="Tu teléfono" hint="10 dígitos.">
          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
            autoComplete="tel"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Observaciones"
        hint="Opcional. Dirección, horario de entrega, dudas."
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={sending}
        className="w-full cursor-pointer rounded-xl bg-whatsapp py-3.5 font-display font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        {sending ? "Preparando pedido..." : "Enviar pedido por WhatsApp"}
      </button>

      <p className="text-center text-xs text-gris">
        Se abrirá WhatsApp con tu pedido listo para enviar. Al continuar aceptas
        nuestro{" "}
        <Link to="/aviso-de-privacidad" className="underline hover:text-verde">
          aviso de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
