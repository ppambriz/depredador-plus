import { useCallback, useEffect, useState } from "react";
import type { AnnouncementBarConfig } from "@/types";
import { settingsService, DEFAULTS } from "@/services/settingsService";
import { useToast } from "@/components/ui/ToastProvider";
import { Toggle } from "@/components/ui/Toggle";
import { Field, inputClass } from "@/components/ui/Field";

const COLORS = [
  { value: "#F9A825", label: "Ámbar" },
  { value: "#1B5E20", label: "Verde" },
  { value: "#C62828", label: "Rojo" },
  { value: "#212121", label: "Carbón" },
];

export function AnnouncementBarSettings() {
  const { showToast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<AnnouncementBarConfig>(
    DEFAULTS.announcement_bar,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const setting = await settingsService.get("announcement_bar");
    setEnabled(setting?.enabled ?? false);
    setConfig({
      ...DEFAULTS.announcement_bar,
      ...((setting?.config as Partial<AnnouncementBarConfig>) ?? {}),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(nextEnabled: boolean, nextConfig: AnnouncementBarConfig) {
    setSaving(true);
    try {
      await settingsService.update(
        "announcement_bar",
        nextEnabled,
        nextConfig as unknown as Record<string, unknown>,
      );
      setEnabled(nextEnabled);
      setConfig(nextConfig);
            showToast(
        nextEnabled !== enabled
          ? `Barra de avisos ${nextEnabled ? "activado" : "desactivado"}.`
          : "Barra de avisos.",
        "success",
      );
    } catch {
      showToast("No se pudo guardar la barra.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  return (
    <section className="rounded-xl border border-black/5 bg-white p-6">
      <Toggle
        checked={enabled}
        onChange={(value) => save(value, config)}
        label="Mostrar barra de avisos"
        hint="Franja delgada arriba del encabezado."
      />

      {enabled && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(enabled, config);
          }}
          className="mt-6 space-y-4 border-t border-black/5 pt-6"
        >
          <Field label="Texto">
            <input
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              placeholder="Envío gratis en pedidos mayores a $500"
              className={inputClass}
            />
          </Field>

          <Field label="Enlace" hint="Opcional.">
            <input
              value={config.link}
              onChange={(e) => setConfig({ ...config, link: e.target.value })}
              className={inputClass}
            />
          </Field>

          <div>
            <span className="text-sm font-medium text-carbon">
              Color de fondo
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setConfig({ ...config, color: color.value })}
                  className={`cursor-pointer rounded-lg border-2 px-4 py-2 text-xs font-medium text-white transition ${
                    config.color === color.value
                      ? "border-carbon"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {config.text && (
            <div>
              <span className="text-xs font-semibold uppercase text-gris">
                Vista previa
              </span>
              <div
                className="mt-2 rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
                style={{ backgroundColor: config.color }}
              >
                {config.text}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-verde px-5 py-2.5 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      )}
    </section>
  );
}
