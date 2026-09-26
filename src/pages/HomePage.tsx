import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Category, Product } from "@/types";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Seo } from "@/seo/Seo";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      productService.listPublic(),
      categoryService.list({ showActive: true, showInactive: false }),
    ])
      .then(([prods, cats]) => {
        if (cancelled) return;
        setProducts(prods.slice(0, 6));
        setCategories(cats);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const insectCategories = useMemo(
    () => categories.filter((c) => c.type === "insect"),
    [categories],
  );

  return (
    <>
      <Seo
        title="Depredador Plus | Venenos e insecticidas para plagas"
        description="Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y alacranes. Arma tu pedido y envíalo por WhatsApp."
        path="/"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ambar">
          Control de plaga
        </p>

        <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-tight text-verde sm:text-5xl">
          Tu espacio, tu hogar seguro
        </h1>

        <p className="mt-4 max-w-xl text-xl text-gris">
          Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes. Arma tu pedido y envíalo por WhatsApp.
        </p>
      </section>

      {/* Categories */}
      {insectCategories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-verde">
            ¿Qué plaga necesitas eliminar?
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {insectCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-carbon transition hover:border-verde hover:text-verde"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-verde">
              Productos destacados
            </h2>
            <Link
              to="/catalogo"
              className="text-sm font-medium text-verde hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
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
        </section>
      )}
    </>
  );
}
