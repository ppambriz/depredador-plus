import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { Category, CategoryType } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { categoryService } from "@/services/categoryService";
import { Seo } from "@/seo/Seo";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CATEGORY_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/ToastProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSort } from "@/hooks/useSort";
import { SortableHeader } from "@/components/ui/SortableHeader";

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const { showToast } = useToast();
  const [toDeactivate, setToDeactivate] = useState<Category | null>(null);
  const { sorted, field, direction, toggleSort } = useSort<Category>(
    categories,
    "code",
  );

  //Filtros
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [type, setType] = useState<CategoryType | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearhc = useDebounce(search);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    categoryService
      .list({ showActive, showInactive, type, search: debouncedSearhc })
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las categorías.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showActive, showInactive, type, debouncedSearhc, reloadKey]);

  async function confirmDeactivate() {
    if (!toDeactivate) return;
    try {
      await categoryService.softDelete(toDeactivate.id);
      showToast(`Categoría ${toDeactivate.code} desactivada.`, "success");
      setReloadKey((k) => k + 1);
    } catch {
      showToast("No se pudo desactivar la categoría.", "error");
    } finally {
      setToDeactivate(null);
    }
  }

  async function handleRestore(cat: Category) {
    try {
      await categoryService.restore(cat.id);
      showToast(`Categoría ${cat.code} reactivada.`, "success");
      setReloadKey((k) => k + 1);
    } catch {
      showToast("No se pudo reactivar la categoría.", "error");
    }
  }

  const noStatusSelected = !showActive && !showInactive;

  return (
    <>
      <Seo
        title="Categorías | Admin"
        description="Gestión de categorías"
        noindex
      />
      <AdminLayout
        title="Categorías"
        action={
          <Link
            to="/admin/categorias/nueva"
            className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition hover:bg-verde-oscuro"
          >
            + Nueva categoría
          </Link>
        }
      >
        {/*Filtros*/}
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-black/5 bg-white p-4">
          <fieldset className="flex gap-4">
            <legend className="mb-1 text-xs font-semibold uppercase text-gris">
              Estado
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
                className="accent-verde"
              />
              Activas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="accent-verde"
              />
              Desactivadas
            </label>
          </fieldset>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-xs font-semibold uppercase text-gris">
              Tipo
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType | "all")}
              className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-verde"
            >
              <option value="all">Todos</option>
              {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col text-sm">
            <span className="mb-1 text-xs font-semibold uppercase text-gris">
              Buscar
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o código..."
              className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-verde"
            />
          </label>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-black/5 bg-white">
          {error && <p className="p-4 text-sm text-rojo">{error}</p>}

          {noStatusSelected ? (
            <p className="p-6 text-center text-sm text-gris">
              Selecciona al menos un estado para ver resultados.
            </p>
          ) : loading ? (
            <p className="p-6 text-center text-sm text-gris">Cargando...</p>
          ) : sorted.length === 0 ? (
            <p className="p-6 text-center text-sm text-gris">
              No hay categorías con estos filtros.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 bg-fondo text-xs uppercase text-gris">
                <tr>
                  <SortableHeader<Category>
                    label="Código"
                    field="code"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableHeader<Category>
                    label="Nombre"
                    field="name"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3">Slug</th>
                  <SortableHeader<Category>
                    label="Tipo"
                    field="type"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableHeader<Category>
                    label="Estado"
                    field="active"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableHeader<Category>
                    label="Creada"
                    field="created_at"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      {cat.code}
                    </td>
                    <td className="px-4 py-3">{cat.name}</td>
                    <td className="px-4 py-3 text-gris">{cat.slug}</td>
                    <td className="px-4 py-3">
                      {CATEGORY_TYPE_LABELS[cat.type]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.active
                            ? "bg-verde/10 text-verde"
                            : "bg-rojo/10 text-rojo"
                        }`}
                      >
                        {cat.active ? "Activa" : "Desactivada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gris">
                      {formatDate(cat.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/categorias/${cat.id}`}
                          className="rounded-md px-2 py-1 text-xs font-medium text-verde hover:bg-verde/5"
                        >
                          Editar
                        </Link>
                        {cat.active ? (
                          <button
                            onClick={() => setToDeactivate(cat)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-rojo hover:bg-rojo/5"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(cat)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-verde hover:bg-verde/5"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ConfirmDialog
          open={toDeactivate !== null}
          title="Desactivar categoría"
          message={`La categoría ${toDeactivate?.code} · ${toDeactivate?.name} dejará de mostrarse, pero podrás reactivarla después.`}
          confirmLabel="Desactivar"
          danger
          onConfirm={confirmDeactivate}
          onCancel={() => setToDeactivate(null)}
        />
      </AdminLayout>
    </>
  );
};
