import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Category, Product } from "@/types";
import {
  productService,
  type ProductVisibility,
} from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Seo } from "@/seo/Seo";
import { useDebounce } from "@/hooks/useDebounce";
import { useSort } from "@/hooks/useSort";
import { useToast } from "@/components/ui/ToastProvider";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatPrice } from "@/lib/format";
import { PRODUCT_VISIBILITY_LABELS } from "@/lib/labels";

export function ProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Filters
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("all");
  const [visibility, setVisibility] = useState<ProductVisibility>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [toDeactivate, setToDeactivate] = useState<Product | null>(null);

  const { sorted, field, direction, toggleSort } = useSort<Product>(
    products,
    "code",
  );

  // Category lookup: id -> name
  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Load categories once (for the filter and the column)
  useEffect(() => {
    categoryService
      .list({ showActive: true, showInactive: true })
      .then(setCategories);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    productService
      .listAdmin({
        showActive,
        showInactive,
        categoryId,
        visibility,
        search: debouncedSearch,
      })
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los productos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    showActive,
    showInactive,
    categoryId,
    visibility,
    debouncedSearch,
    reloadKey,
  ]);

  async function confirmDeactivate() {
    if (!toDeactivate) return;
    try {
      await productService.softDelete(toDeactivate.id);
      showToast(`Producto ${toDeactivate.code} desactivado.`, "success");
      setReloadKey((k) => k + 1);
    } catch {
      showToast("No se pudo desactivar el producto.", "error");
    } finally {
      setToDeactivate(null);
    }
  }

  async function handleRestore(product: Product) {
    try {
      await productService.restore(product.id);
      showToast(`Producto ${product.code} reactivado.`, "success");
      setReloadKey((k) => k + 1);
    } catch {
      showToast("No se pudo reactivar el producto.", "error");
    }
  }

  const noStatusSelected = !showActive && !showInactive;
  const selectClass =
    "rounded-lg border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-verde";

  return (
    <>
      <Seo
        title="Productos | Admin"
        description="Gestión de productos"
        noindex
      />
      <AdminLayout
        title="Productos"
        action={
          <Link
            to="/admin/productos/nuevo"
            className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white transition hover:bg-verde-oscuro"
          >
            + Nuevo producto
          </Link>
        }
      >
        {/* Filters */}
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
              Activos
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="accent-verde"
              />
              Desactivados
            </label>
          </fieldset>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-xs font-semibold uppercase text-gris">
              Categoría
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
            >
              <option value="all">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-xs font-semibold uppercase text-gris">
              Visibilidad
            </span>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as ProductVisibility)
              }
              className={selectClass}
            >
              {Object.entries(PRODUCT_VISIBILITY_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
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
              className={selectClass}
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
              No hay productos con estos filtros.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 bg-fondo text-xs uppercase text-gris">
                <tr>
                  <th className="px-4 py-3">Foto</th>
                  <SortableHeader<Product>
                    label="Código"
                    field="code"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableHeader<Product>
                    label="Nombre"
                    field="name"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3">Categoría</th>
                  <SortableHeader<Product>
                    label="Precio"
                    field="price"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableHeader<Product>
                    label="Stock"
                    field="stock"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3">Visibilidad</th>
                  <SortableHeader<Product>
                    label="Estado"
                    field="active"
                    currentField={field}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((product) => {
                  const lowStock = product.stock <= product.min_stock;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-4 py-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-fondo text-xs text-gris">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                        {product.code}
                      </td>
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3 text-gris">
                        {product.category_id
                          ? (categoryNames.get(product.category_id) ?? "—")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={lowStock ? "font-medium text-rojo" : ""}
                        >
                          {product.stock}
                        </span>
                        {lowStock && (
                          <span
                            className="ml-1 text-xs text-rojo"
                            title="Stock en o bajo el mínimo"
                          >
                            ▼
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.visible_public
                              ? "bg-verde/10 text-verde"
                              : "bg-ambar/10 text-ambar"
                          }`}
                        >
                          {product.visible_public ? "Tienda" : "Interno"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.active
                              ? "bg-verde/10 text-verde"
                              : "bg-rojo/10 text-rojo"
                          }`}
                        >
                          {product.active ? "Activo" : "Desactivado"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/productos/${product.id}`}
                            className="rounded-md px-2 py-1 text-xs font-medium text-verde hover:bg-verde/5"
                          >
                            Editar
                          </Link>
                          {product.active ? (
                            <button
                              onClick={() => setToDeactivate(product)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-rojo hover:bg-rojo/5"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(product)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-verde hover:bg-verde/5"
                            >
                              Reactivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <ConfirmDialog
          open={toDeactivate !== null}
          title="Desactivar producto"
          message={`El producto ${toDeactivate?.code} · ${toDeactivate?.name} dejará de mostrarse, pero podrás reactivarlo después.`}
          confirmLabel="Desactivar"
          danger
          onConfirm={confirmDeactivate}
          onCancel={() => setToDeactivate(null)}
        />
      </AdminLayout>
    </>
  );
}
export default ProductsPage;
