import { useCallback, useEffect, useState } from "react";
import type { CodeEntity, CodeSequence } from "@/types";
import { codeService } from "@/services/codeService";
import { useToast } from "@/components/ui/ToastProvider";
import { Field, inputClass } from "@/components/ui/Field";

const ENTITIES: { key: CodeEntity; label: string }[] = [
  { key: "product", label: "Productos" },
  { key: "category", label: "Categorías" },
  { key: "banner_slide", label: "Diapositivas del banner" },
];

export function CodesSettings() {
  const { showToast } = useToast();

  const [sequences, setSequences] = useState<Record<string, CodeSequence>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      ENTITIES.map((e) => codeService.getSequence(e.key)),
    );
    const map: Record<string, CodeSequence> = {};
    results.forEach((seq) => {
      if (seq) map[seq.entity] = seq;
    });
    setSequences(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(entity: CodeEntity) {
    const seq = sequences[entity];
    if (!seq) return;

    setSaving(true);
    try {
      await codeService.updateSequence(entity, seq.prefix, seq.padding);
      showToast("Formato de código guardado.", "success");
    } catch {
      showToast("No se pudo guardar el formato.", "error");
    } finally {
      setSaving(false);
    }
  }

  function update(entity: CodeEntity, changes: Partial<CodeSequence>) {
    setSequences((prev) => ({
      ...prev,
      [entity]: { ...prev[entity], ...changes },
    }));
  }

  if (loading) return <p className="text-sm text-gris">Cargando...</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gris">
        Define el prefijo y la cantidad de dígitos de los códigos que se
        sugieren al crear registros. Los códigos ya creados no cambian.
      </p>

      {ENTITIES.map((entity) => {
        const seq = sequences[entity.key];
        if (!seq) return null;

        const preview = seq.prefix + "1".padStart(seq.padding, "0");

        return (
          <section
            key={entity.key}
            className="rounded-xl border border-black/5 bg-white p-6"
          >
            <h3 className="font-display text-sm font-semibold text-carbon">
              {entity.label}
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Prefijo">
                <input
                  value={seq.prefix}
                  maxLength={4}
                  onChange={(e) =>
                    update(entity.key, { prefix: e.target.value.toUpperCase() })
                  }
                  className={`${inputClass} font-mono`}
                />
              </Field>

              <Field label="Dígitos">
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={seq.padding}
                  onChange={(e) =>
                    update(entity.key, {
                      padding: Math.min(
                        8,
                        Math.max(2, Number(e.target.value) || 4),
                      ),
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Ejemplo">
                <p className="mt-1 rounded-lg bg-fondo px-3 py-2 font-mono text-sm text-carbon">
                  {preview}
                </p>
              </Field>
            </div>

            <button
              onClick={() => handleSave(entity.key)}
              disabled={saving}
              className="mt-4 cursor-pointer rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
            >
              Guardar
            </button>
          </section>
        );
      })}
    </div>
  );
}
