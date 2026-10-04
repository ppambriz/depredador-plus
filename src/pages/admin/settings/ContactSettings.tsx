import { useCallback, useEffect, useState } from "react";
import type { ContactConfig } from "@/types";
import { settingsService, DEFAULTS } from "@/services/settingsService";
import { useToast } from "@/components/ui/ToastProvider";
import { Field, inputClass } from "@/components/ui/Field";

export function ContactSettings() {
  const { showToast } = useToast();

  const [config, setConfig] = useState<ContactConfig>(DEFAULTS.contact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const setting = await settingsService.get("contact");
    setConfig({
      ...DEFAULTS.contact,
      ...((setting?.config as Partial<ContactConfig>) ?? {}),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.update(
        "contact",
        true,
        config as unknown as Record<string, unknown>,
      );
      showToast("Datos de contacto guardados.", "success");
    } catch {
      showToast("No se pudieron guardar los datos.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  return (
    <section className="rounded-xl border border-black/5 bg-white p-6">
      <h2 className="font-display text-sm font-semibold uppercase text-gris">
        Datos de contacto
      </h2>
      <p className="mt-1 text-xs text-gris">
        Se usan en el botón flotante y para recibir los pedidos.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Nombre del negocio">
          <input
            value={config.business_name}
            onChange={(e) =>
              setConfig({ ...config, business_name: e.target.value })
            }
            className={inputClass}
          />
        </Field>

        <Field
          label="WhatsApp"
          hint="Formato internacional sin signos: 52 + lada + número. Ejemplo: 524771234567"
        >
          <input
            value={config.whatsapp}
            onChange={(e) =>
              setConfig({
                ...config,
                whatsapp: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="524771234567"
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field
          label="Correo electrónico"
          hint="Para recibir copia de los pedidos."
        >
          <input
            type="email"
            value={config.email}
            onChange={(e) => setConfig({ ...config, email: e.target.value })}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg bg-verde px-5 py-2.5 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </section>
  );
}
