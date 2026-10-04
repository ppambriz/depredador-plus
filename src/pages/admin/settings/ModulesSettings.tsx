import { useCallback, useEffect, useState } from "react";
import type { ModulesConfig } from "@/types";
import { settingsService, DEFAULTS } from "@/services/settingsService";
import { useToast } from "@/components/ui/ToastProvider";
import { Toggle } from "@/components/ui/Toggle";

const MODULES: { key: keyof ModulesConfig; label: string; hint: string }[] = [
  {
    key: "orders",
    label: "Pedidos",
    hint: "Permite a los clientes armar y enviar pedidos.",
  },
  { key: "credit", label: "Crédito", hint: "Clientes, adeudos y abonos." },
  {
    key: "inventory",
    label: "Inventario",
    hint: "Existencias, mínimos y alertas.",
  },
  { key: "reports", label: "Reportes", hint: "Ventas y utilidad." },
];

export function ModulesSettings() {
  const { showToast } = useToast();

  const [config, setConfig] = useState<ModulesConfig>(DEFAULTS.modules);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const setting = await settingsService.get("modules");
    setConfig({
      ...DEFAULTS.modules,
      ...((setting?.config as Partial<ModulesConfig>) ?? {}),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleModule(key: keyof ModulesConfig, value: boolean) {
    const next = { ...config, [key]: value };
    const previous = config;
    setConfig(next);

    try {
      await settingsService.update(
        "modules",
        true,
        next as unknown as Record<string, unknown>,
      );
      showToast(`Módulo ${value ? "activado" : "desactivado"}.`, "success");
    } catch {
      setConfig(previous);
      showToast("No se pudo cambiar el módulo.", "error");
    }
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  return (
    <section className="rounded-xl border border-black/5 bg-white p-6">
      <h2 className="font-display text-sm font-semibold uppercase text-gris">
        Módulos
      </h2>
      <p className="mt-1 text-xs text-gris">
        Activa cada módulo cuando esté listo. Los desactivados no aparecen en el
        sitio.
      </p>

      <div className="mt-6 space-y-5">
        {MODULES.map((module) => (
          <Toggle
            key={module.key}
            checked={config[module.key]}
            onChange={(value) => toggleModule(module.key, value)}
            label={module.label}
            hint={module.hint}
          />
        ))}
      </div>
    </section>
  );
}
