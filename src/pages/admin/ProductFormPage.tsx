import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Category } from "@/types";
import { productService, type ProductInput } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { codeService } from "@/services/codeService";
import { storageService } from "@/services/storageService";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Seo } from "@/seo/Seo";
import { Field, inputClass } from "@/components/ui/Field";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useToast } from "@/components/ui/ToastProvider";
import { generateSlug } from "@/lib/slug";

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [cost, setCost] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [visiblePublic, setVisiblePublic] = useState(true);
  const [activeIngredient, setActiveIngredient] = useState("");
  const [usageInstructions, setUsageInstructions] = useState("");
  const [warnings, setWarnings] = useState("");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("0");

  // Image
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cats = await categoryService.list({
        showActive: true,
        showInactive: false,
      });
      if (cancelled) return;
      setCategories(cats);

      if (isEdit && id) {
        const product = await productService.getById(id);
        if (cancelled) return;
        if (!product) {
          showToast("El producto no existe.", "error");
          navigate("/admin/productos");
          return;
        }
        setCode(product.code);
        setName(product.name);
        setSlug(product.slug);
        setSlugTouched(true);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setCost(String(product.cost));
        setCategoryId(product.category_id ?? "");
        setVisiblePublic(product.visible_public);
        setActiveIngredient(product.active_ingredient ?? "");
        setUsageInstructions(product.usage_instructions ?? "");
        setWarnings(product.warnings ?? "");
        setStock(String(product.stock));
        setMinStock(String(product.min_stock));
        setImageUrl(product.image_url);
        setOriginalImageUrl(product.image_url);
      } else {
        const suggested = await codeService.suggestNextCode("product");
        if (cancelled) return;
        setCode(suggested);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate, showToast]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(generateSlug(value));
  }

  async function validateCode(): Promise<boolean> {
    if (isEdit) return true;

    const trimmed = code.trim();
    if (!trimmed) {
      setCodeError("El código es obligatorio.");
      return false;
    }

    const available = await codeService.isCodeAvailable("product", trimmed);
    if (!available) {
      setCodeError(`El código ${trimmed} ya fue usado antes.`);
      return false;
    }

    setCodeError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      showToast("El nombre y el slug son obligatorios.", "error");
      return;
    }

    const priceNumber = Number(price);
    const costNumber = Number(cost);
    if (
      isNaN(priceNumber) ||
      priceNumber < 0 ||
      isNaN(costNumber) ||
      costNumber < 0
    ) {
      showToast("El precio y el costo deben ser números válidos.", "error");
      return;
    }

    setSaving(true);

    try {
      if (!(await validateCode())) {
        setSaving(false);
        return;
      }

      // Upload new photo if one was selected
      let finalImageUrl = imageUrl;
      const previousUrl = originalImageUrl ?? imageUrl;

      if (imageFile) {
        finalImageUrl = await storageService.uploadProductImage(
          imageFile,
          code.trim(),
        );
        if (previousUrl) await storageService.removeByUrl(previousUrl);
      } else if (imageRemoved) {
        if (previousUrl) await storageService.removeByUrl(previousUrl);
        finalImageUrl = null;
      }

      const payload: ProductInput = {
        code: code.trim(),
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: priceNumber,
        cost: costNumber,
        image_url: finalImageUrl,
        category_id: categoryId || null,
        visible_public: visiblePublic,
        active_ingredient: activeIngredient.trim() || null,
        usage_instructions: usageInstructions.trim() || null,
        warnings: warnings.trim() || null,
        stock: Number(stock) || 0,
        min_stock: Number(minStock) || 0,
      };

      if (isEdit && id) {
        const { code: _omit, ...updateData } = payload;
        await productService.update(id, updateData);
        showToast(`Producto ${payload.code} actualizado.`, "success");
      } else {
        await productService.create(payload);
        showToast(`Producto ${payload.code} creado.`, "success");
      }

      navigate("/admin/productos");
    } catch (err) {
      const dbError = err as { code?: string; message?: string };
      if (dbError.code === "23505") {
        showToast(
          dbError.message?.includes("slug")
            ? "Ese slug ya está en uso por otro producto."
            : "Ese código ya está en uso.",
          "error",
        );
      } else {
        showToast("No se pudo guardar el producto.", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Seo
        title={`${isEdit ? "Editar" : "Nuevo"} producto | Admin`}
        description="Formulario de producto"
        noindex
      />
      <AdminLayout title={isEdit ? "Editar producto" : "Nuevo producto"}>
        {loading ? (
          <p className="text-sm text-gris">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
            {/* Basic data */}
            <section className="rounded-xl border border-black/5 bg-white p-6">
              <h2 className="font-display text-sm font-semibold uppercase text-gris">
                Datos básicos
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Código"
                  hint={
                    isEdit
                      ? "No se puede modificar."
                      : "Sugerido automáticamente. Puedes cambiarlo."
                  }
                  error={codeError}
                >
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    onBlur={validateCode}
                    disabled={isEdit}
                    className={`${inputClass} font-mono`}
                  />
                </Field>

                <Field label="Categoría">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Nombre">
                  <input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Slug (URL)"
                  hint={`Aparecerá como /producto/${slug || "..."}`}
                >
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlug(generateSlug(e.target.value));
                      setSlugTouched(true);
                    }}
                    required
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Descripción">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={visiblePublic}
                    onChange={(e) => setVisiblePublic(e.target.checked)}
                    className="accent-verde"
                  />
                  Visible en la tienda
                </label>
                <span className="mt-1 block text-xs text-gris">
                  Desmarca para productos de uso interno que no deben aparecer
                  en el catálogo público.
                </span>
              </div>
            </section>

            {/* Photo */}
            <section className="rounded-xl border border-black/5 bg-white p-6">
              <ImageUploadField
                value={imageUrl}
                onFileSelected={(file) => {
                  setImageFile(file);
                  setImageRemoved(false);
                }}
                onRemove={() => {
                  setImageRemoved(true);
                  setImageUrl(null);
                }}
                disabled={saving}
              />
            </section>

            {/* Price and inventory */}
            <section className="rounded-xl border border-black/5 bg-white p-6">
              <h2 className="font-display text-sm font-semibold uppercase text-gris">
                Precio e inventario
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Precio de venta">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Costo" hint="Uso interno.">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Existencias">
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Mínimo" hint="Para alertas.">
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Safety data sheet */}
            <section className="rounded-xl border border-black/5 bg-white p-6">
              <h2 className="font-display text-sm font-semibold uppercase text-gris">
                Ficha de seguridad
              </h2>
              <p className="mt-1 text-xs text-gris">
                Opcional, pero recomendado para productos químicos.
              </p>

              <div className="mt-4 space-y-4">
                <Field label="Ingrediente activo">
                  <input
                    value={activeIngredient}
                    onChange={(e) => setActiveIngredient(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Modo de uso">
                  <textarea
                    value={usageInstructions}
                    onChange={(e) => setUsageInstructions(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>

                <Field label="Advertencias">
                  <textarea
                    value={warnings}
                    onChange={(e) => setWarnings(e.target.value)}
                    rows={2}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-verde px-5 py-2.5 text-sm font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <Link
                to="/admin/productos"
                className="rounded-lg border border-black/10 px-5 py-2.5 text-sm font-medium text-gris transition hover:bg-fondo"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </AdminLayout>
    </>
  );
}
export default ProductFormPage;
