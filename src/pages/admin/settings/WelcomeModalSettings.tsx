import { useCallback, useEffect, useState } from "react";

import type { ModalFrequency, WelcomeModalConfig } from "@/types";
import { settingsService, DEFAULTS } from "@/services/settingsService";
import { useToast } from "@/components/ui/ToastProvider";
import { Toggle } from "@/components/ui/Toggle";
import { Field, inputClass } from "@/components/ui/Field";
import { storageService } from "@/services/storageService";

export function WelcomeModalSettings() {
  const { showToast } = useToast();

  const [uploading, setUploading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<WelcomeModalConfig>(
    DEFAULTS.welcome_modal,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const setting = await settingsService.get("welcome_modal");
    setEnabled(setting?.enabled ?? false);
    setConfig({
      ...DEFAULTS.welcome_modal,
      ...((setting?.config as Partial<WelcomeModalConfig>) ?? {}),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(nextEnabled: boolean, nextConfig: WelcomeModalConfig) {
    setSaving(true);
    try {
      await settingsService.update(
        "welcome_modal",
        nextEnabled,
        nextConfig as unknown as Record<string, unknown>,
      );
      setEnabled(nextEnabled);
      setConfig(nextConfig);
      showToast(
        nextEnabled !== enabled
          ? `Modal ${nextEnabled ? "activado" : "desactivado"}.`
          : "Modal guardado.",
        "success",
      );
    } catch {
      showToast("No se pudo guardar el modal.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  async function handleImageChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await storageService.uploadBannerImage(file, "modal");
      if (config.image_url)
        await storageService.removeBannerByUrl(config.image_url);
      const next = { ...config, image_url: url };
      setConfig(next);
      await save(enabled, next);
    } catch {
      showToast("No se pudo subir la imagen.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    if (config.image_url)
      await storageService.removeBannerByUrl(config.image_url);
    const next = { ...config, image_url: null };
    setConfig(next);
    await save(enabled, next);
  }

  return (
    <section className="rounded-xl border border-black/5 bg-white p-6">
      <Toggle
        checked={enabled}
        onChange={(value) => save(value, config)}
        label="Mostrar modal al abrir la página"
        hint="Útil para anunciar ofertas o avisos importantes."
      />

      {enabled && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save(enabled, config);
          }}
          className="mt-6 space-y-4 border-t border-black/5 pt-6"
        >
          <div>
            <span className="text-sm font-medium text-carbon">Imagen</span>
            <div className="mt-2 flex items-start gap-4">
              <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-fondo">
                {config.image_url ? (
                  <img
                    src={config.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gris">Sin imagen</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] ?? null)
                  }
                  className="text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-verde file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                />
                {config.image_url && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="cursor-pointer self-start rounded-md px-2 py-1 text-xs font-medium text-rojo hover:bg-rojo/5"
                  >
                    Quitar imagen
                  </button>
                )}
                <span className="text-xs text-gris">
                  Opcional. Horizontal, mínimo 600 px de ancho.
                </span>
              </div>
            </div>
          </div>

          <Field label="Título">
            <input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Texto">
            <textarea
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Texto del botón"
              hint="Déjalo vacío para no mostrar botón."
            >
              <input
                value={config.button_label}
                onChange={(e) =>
                  setConfig({ ...config, button_label: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Enlace del botón" hint="Por ejemplo /catalogo">
              <input
                value={config.button_link}
                onChange={(e) =>
                  setConfig({ ...config, button_link: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Frecuencia">
              <select
                value={config.frequency}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    frequency: e.target.value as ModalFrequency,
                  })
                }
                className={inputClass}
              >
                <option value="always">Siempre que entren</option>
                <option value="session">Una vez por visita</option>
                <option value="days">Una vez cada varios días</option>
              </select>
            </Field>

            {config.frequency === "days" && (
              <Field label="Días entre apariciones">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={config.frequency_days}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frequency_days: Number(e.target.value) || 7,
                    })
                  }
                  className={inputClass}
                />
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mostrar desde" hint="Opcional.">
              <input
                type="date"
                value={config.start_date ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, start_date: e.target.value || null })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Mostrar hasta" hint="Opcional.">
              <input
                type="date"
                value={config.end_date ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, end_date: e.target.value || null })
                }
                className={inputClass}
              />
            </Field>
          </div>

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
