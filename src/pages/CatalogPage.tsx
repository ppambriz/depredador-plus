import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Category, Product } from "@/types";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Seo } from "@/seo/Seo";
import { useDebounce } from "@/hooks/useDebounce";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      productService.listPublic(),
      categoryService.list({ showActive: true, showInactive: false }),
    ])
      .then(([prods, cats]) => {
        if (cancelled) return;
        setProducts(prods);
        setCategories(cats);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el catálogo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Only categories that actually have products
  const visibleCategories = useMemo(() => {
    const used = new Set(products.map((p) => p.category_id).filter(Boolean));
    return categories.filter((c) => used.has(c.id));
  }, [categories, products]);

  const filtered = useMemo(() => {
    let result = products;

    if (activeCategory) {
      const category = categories.find((c) => c.slug === activeCategory);
      if (category)
        result = result.filter((p) => p.category_id === category.id);
    }

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term),
      );
    }

    return result;
  }, [products, categories, activeCategory, debouncedSearch]);

  function selectCategory(slug: string) {
    if (slug) setSearchParams({ categoria: slug });
    else setSearchParams({});
  }

  const currentCategory = categories.find((c) => c.slug === activeCategory);

  return (
    <>
      <Seo
        title={
          currentCategory
            ? `Veneno para ${currentCategory.name.toLowerCase()} | Depredador Plus`
            : "Catálogo de insecticidas | Depredador Plus"
        }
        description={
          currentCategory
            ? `Productos para eliminar ${currentCategory.name.toLowerCase()}. Precios y fichas de seguridad.`
            : "Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y alacranes."
        }
        path={
          activeCategory ? `/catalogo?categoria=${activeCategory}` : "/catalogo"
        }
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-verde sm:text-4xl">
          {currentCategory ? currentCategory.name : "Catálogo"}
        </h1>
        <p className="mt-2 text-gris">
          {currentCategory
            ? `Productos para eliminar ${currentCategory.name.toLowerCase()}.`
            : "Encuentra el producto adecuado para cada plaga."}
        </p>

        {/* Category filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory("")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !activeCategory
                ? "bg-verde text-white"
                : "border border-black/10 text-gris hover:border-verde/40 hover:text-verde"
            }`}
          >
            Todos
          </button>
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === cat.slug
                  ? "bg-verde text-white"
                  : "border border-black/10 text-gris hover:border-verde/40 hover:text-verde"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full max-w-md rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:border-verde focus:ring-1 focus:ring-verde"
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          {error ? (
            <p className="py-12 text-center text-rojo">{error}</p>
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-black/5 bg-white"
                >
                  <div className="aspect-square rounded-t-xl bg-fondo" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-16 rounded bg-fondo" />
                    <div className="h-4 w-3/4 rounded bg-fondo" />
                    <div className="h-6 w-20 rounded bg-fondo" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gris">
                No encontramos productos con esos criterios.
              </p>
              <Link
                to="/catalogo"
                className="mt-2 inline-block text-sm font-medium text-verde hover:underline"
              >
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gris">
                {filtered.length}{" "}
                {filtered.length === 1 ? "producto" : "productos"}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={
                      product.category_id
                        ? categoryNames.get(product.category_id)
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default CatalogPage;
