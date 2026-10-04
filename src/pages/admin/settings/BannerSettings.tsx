import { useCallback, useEffect, useState } from "react";
import type { BannerConfig, BannerMode, BannerSlide } from "@/types";
import { settingsService, DEFAULTS } from "@/services/settingsService";
import { storageService } from "@/services/storageService";
import { codeService } from "@/services/codeService";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "@/components/ui/Toggle";
import { Field, inputClass } from "@/components/ui/Field";

export function BannerSettings() {
  const { showToast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<BannerConfig>(DEFAULTS.banner);
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New slide form
  const [adding, setAdding] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLink, setNewLink] = useState("");

  // Edit slide
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  const [toDelete, setToDelete] = useState<BannerSlide | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [setting, allSlides] = await Promise.all([
      settingsService.get("banner"),
      settingsService.getBannerSlides(true),
    ]);
    setEnabled(setting?.enabled ?? false);
    setConfig({
      ...DEFAULTS.banner,
      ...((setting?.config as Partial<BannerConfig>) ?? {}),
    });
    setSlides(allSlides);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveConfig(nextEnabled: boolean, nextConfig: BannerConfig) {
    setSaving(true);
    try {
      await settingsService.update(
        "banner",
        nextEnabled,
        nextConfig as unknown as Record<string, unknown>,
      );
      setEnabled(nextEnabled);
      setConfig(nextConfig);
      showToast("Configuración del banner guardada.", "success");
    } catch {
      showToast("No se pudo guardar la configuración.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!newFile) {
      showToast("Selecciona una imagen.", "error");
      return;
    }

    setSaving(true);
    try {
      const code = await codeService.suggestNextCode("banner_slide");
      const imageUrl = await storageService.uploadBannerImage(newFile, code);

      await settingsService.createSlide({
        code,
        image_url: imageUrl,
        title: newTitle.trim() || null,
        subtitle: newSubtitle.trim() || null,
        link: newLink.trim() || null,
        order: Math.max(0, ...slides.map((s) => s.order)) + 1,
      });

      await codeService.registerCode("banner_slide", code);

      showToast(`Diapositiva ${code} agregada.`, "success");
      setAdding(false);
      setNewFile(null);
      setNewTitle("");
      setNewSubtitle("");
      setNewLink("");
      load();
    } catch {
      showToast("No se pudo agregar la diapositiva.", "error");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(slide: BannerSlide) {
    setEditingId(slide.id);
    setEditTitle(slide.title ?? "");
    setEditSubtitle(slide.subtitle ?? "");
    setEditLink(slide.link ?? "");
    setEditFile(null);
    setAdding(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFile(null);
  }

  async function handleUpdateSlide(e: React.FormEvent, slide: BannerSlide) {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = slide.image_url;

      if (editFile) {
        imageUrl = await storageService.uploadBannerImage(editFile, slide.code);
        await storageService.removeBannerByUrl(slide.image_url);
      }

      await settingsService.updateSlide(slide.id, {
        image_url: imageUrl,
        title: editTitle.trim() || null,
        subtitle: editSubtitle.trim() || null,
        link: editLink.trim() || null,
        order: slide.order,
      });

      showToast(`Diapositiva ${slide.code} actualizada.`, "success");
      setEditingId(null);
      setEditFile(null);
      load();
    } catch {
      showToast("No se pudo actualizar la diapositiva.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await settingsService.softDeleteSlide(toDelete.id);
      showToast(`Diapositiva ${toDelete.code} desactivada.`, "success");
      load();
    } catch {
      showToast("No se pudo desactivar la diapositiva.", "error");
    } finally {
      setToDelete(null);
    }
  }

  async function handleRestore(slide: BannerSlide) {
    try {
      await settingsService.restoreSlide(slide.id);
      showToast(`Diapositiva ${slide.code} reactivada.`, "success");
      load();
    } catch {
      showToast("No se pudo reactivar la diapositiva.", "error");
    }
  }

  async function moveSlide(slide: BannerSlide, direction: -1 | 1) {
    const active = slides.filter((s) => s.active);
    const index = active.findIndex((s) => s.id === slide.id);
    const target = active[index + direction];
    if (!target) return;

    const previousSlides = slides;

    // Optimistic update: swap orders locally first
    setSlides((prev) =>
      prev
        .map((s) => {
          if (s.id === slide.id) return { ...s, order: target.order };
          if (s.id === target.id) return { ...s, order: slide.order };
          return s;
        })
        .sort((a, b) => a.order - b.order),
    );

    try {
      await Promise.all([
        settingsService.updateSlide(slide.id, {
          image_url: slide.image_url,
          title: slide.title,
          subtitle: slide.subtitle,
          link: slide.link,
          order: target.order,
        }),
        settingsService.updateSlide(target.id, {
          image_url: target.image_url,
          title: target.title,
          subtitle: target.subtitle,
          link: target.link,
          order: slide.order,
        }),
      ]);
    } catch {
      setSlides(previousSlides);
      showToast("No se pudo cambiar el orden.", "error");
    }
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  const activeSlides = slides.filter((s) => s.active);
  const inactiveSlides = slides.filter((s) => !s.active);

  return (
    <div className="space-y-6">
      {/* Main settings */}
      <section className="rounded-xl border border-black/5 bg-white p-6">
        <Toggle
          checked={enabled}
          onChange={(value) => saveConfig(value, config)}
          label="Mostrar banner en la portada"
          hint="Si está apagado, la portada empieza directamente con el encabezado."
        />

        {enabled && (
          <div className="mt-6 space-y-4 border-t border-black/5 pt-6">
            <Field label="Comportamiento">
              <select
                value={config.mode}
                onChange={(e) =>
                  saveConfig(enabled, {
                    ...config,
                    mode: e.target.value as BannerMode,
                  })
                }
                className={inputClass}
              >
                <option value="static">Estático (una sola imagen)</option>
                <option value="carousel">
                  Carrusel automático (varias imágenes)
                </option>
              </select>
            </Field>

            {config.mode === "carousel" && (
              <Field
                label="Segundos entre imágenes"
                hint="Entre 2 y 15 segundos."
              >
                <input
                  type="number"
                  min={2}
                  max={15}
                  value={config.autoplay_ms / 1000}
                  onChange={(e) => {
                    const seconds = Math.min(
                      15,
                      Math.max(2, Number(e.target.value) || 5),
                    );
                    saveConfig(enabled, {
                      ...config,
                      autoplay_ms: seconds * 1000,
                    });
                  }}
                  className={inputClass}
                />
              </Field>
            )}
          </div>
        )}
      </section>

      {/* Slides */}
      <section className="rounded-xl border border-black/5 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase text-gris">
              Imágenes
            </h2>
            <p className="mt-1 text-xs text-gris">
              {config.mode === "static"
                ? "En modo estático solo se muestra la primera imagen activa."
                : "Se muestran en el orden indicado."}
            </p>
          </div>
          <button
            onClick={() => setAdding(!adding)}
            className="cursor-pointer rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition hover:bg-verde-oscuro"
          >
            {adding ? "Cancelar" : "+ Agregar imagen"}
          </button>
        </div>

        {/* New slide form */}
        {adding && (
          <form
            onSubmit={handleAddSlide}
            className="mt-5 space-y-4 rounded-lg bg-fondo p-4"
          >
            <Field
              label="Imagen"
              hint="Recomendado: 1600 × 533 px (formato panorámico)."
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-verde file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Subtítulo">
                <input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Enlace"
              hint="Ruta interna, por ejemplo /catalogo?categoria=alacranes"
            >
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-verde px-5 py-2.5 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </form>
        )}

        {/* Active slides */}
        <div className="mt-6 space-y-3">
          {activeSlides.length === 0 ? (
            <p className="text-sm text-gris">No hay imágenes activas.</p>
          ) : (
            activeSlides.map((slide, i) => (
              <div
                key={slide.id}
                className="rounded-lg border border-black/5 p-3"
              >
                {editingId === slide.id ? (
                  /* Edit form */
                  <form
                    onSubmit={(e) => handleUpdateSlide(e, slide)}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={slide.image_url}
                        alt=""
                        className="h-14 w-28 shrink-0 rounded object-cover"
                      />
                      <p className="font-mono text-xs text-gris">
                        {slide.code}
                      </p>
                    </div>

                    <Field
                      label="Reemplazar imagen"
                      hint="Opcional. Si no eliges archivo, se conserva la actual."
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                          setEditFile(e.target.files?.[0] ?? null)
                        }
                        className="mt-1 block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-verde file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Título">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Subtítulo">
                        <input
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Enlace">
                      <input
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className={inputClass}
                      />
                    </Field>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
                      >
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="cursor-pointer rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-gris transition hover:bg-fondo"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Read-only row */
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={slide.image_url}
                      alt={slide.title ?? "Diapositiva"}
                      loading="lazy"
                      className="h-14 w-28 shrink-0 rounded object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-gris">
                        {slide.code}
                      </p>
                      <p className="truncate text-sm font-medium text-carbon">
                        {slide.title || "Sin título"}
                      </p>
                      {slide.subtitle && (
                        <p className="truncate text-xs text-gris">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSlide(slide, -1)}
                        disabled={i === 0}
                        aria-label="Subir"
                        className="cursor-pointer rounded px-2 py-1 text-sm text-gris transition hover:bg-fondo disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveSlide(slide, 1)}
                        disabled={i === activeSlides.length - 1}
                        aria-label="Bajar"
                        className="cursor-pointer rounded px-2 py-1 text-sm text-gris transition hover:bg-fondo disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => startEdit(slide)}
                        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-verde transition hover:bg-verde/5"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setToDelete(slide)}
                        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-rojo transition hover:bg-rojo/5"
                      >
                        Desactivar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Inactive slides */}
        {inactiveSlides.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-gris">
              Desactivadas ({inactiveSlides.length})
            </summary>
            <div className="mt-3 space-y-2">
              {inactiveSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-4 rounded-lg border border-black/5 p-3 opacity-60"
                >
                  <img
                    src={slide.image_url}
                    alt=""
                    className="h-10 w-20 shrink-0 rounded object-cover"
                  />
                  <p className="flex-1 font-mono text-xs text-gris">
                    {slide.code}
                  </p>
                  <button
                    onClick={() => handleRestore(slide)}
                    className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-verde transition hover:bg-verde/5"
                  >
                    Reactivar
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        title="Desactivar diapositiva"
        message={`La diapositiva ${toDelete?.code} dejará de mostrarse en el banner, pero podrás reactivarla después.`}
        confirmLabel="Desactivar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
