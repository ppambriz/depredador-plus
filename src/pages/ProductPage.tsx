import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { Seo } from "@/seo/Seo";
import type { Category, Product } from "@/types";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductCard } from "@/components/catalog/ProductCard";
import { formatPrice } from "@/lib/format";
import { AddToOrderButton } from "@/components/order/AddToOrderButton";
import { useModules } from "@/hooks/useModules";
import { JsonLd } from "@/seo/JsonLd";
import { breadcrumbData, productData } from "@/seo/structuredData";

export const ProductPage = () => {
  const { id: slug } = useParams();
  const { modules } = useModules();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [pRelated, setPRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    async function load() {
      if (!slug) return;

      const pFound = await productService.getBySlug(slug);
      if (cancelled) return;

      if (!pFound) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(pFound);

      if (pFound.category_id) {
        const [cat, /*pSiblings,*/ pCousin] = await Promise.all([
          categoryService.getById(pFound.category_id),
          // productService.listByCategory(pFound.category_id), //Muestra productos relacionados a categoría
          productService.listRelatedRandom(), // Muestra cualquier producto
        ]);

        if (cancelled) return;
        setCategory(cat);
        setPRelated(pCousin.filter((p) => p.id !== pFound.id).slice(0, 3));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hasSafetySheet = useMemo(
    () =>
      Boolean(
        product?.active_ingredient ||
        product?.usage_instructions ||
        product?.warnings,
      ),
    [product],
  );

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-xl bg-white" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-white" />
            <div className="h-8 w-3/4 rounded bg-white" />
            <div className="h-6 w-32 rounded bg-white" />
            <div className="h-20 w-full rounded bg-white" />
          </div>
        </div>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Seo
          title="Producto no encontrado | Depredador Plus"
          description="El producto que buscas no está disponible."
          noindex
        />
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-verde">
            Producto no encontrado
          </h1>
          <p className="mt-2 text-gris">
            El producto que buscas no está disponible.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-block rounded-lg bg-verde px-5 py-3 font-medium text-white transition hover:bg-verde-oscuro"
          >
            Ver catálogo
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${product.name} | Depredador Plus`}
        description={
          product.description || `${product.name} para control de plagas.`
        }
        path={`/producto/${product.slug}`}
        image={product.image_url ?? undefined}
      />

      <JsonLd data={productData(product, category)} />
      <JsonLd
        data={breadcrumbData([
          { name: "Inicio", url: "/" },
          { name: "Catálogo", url: "/catalogo" },
          ...(category
            ? [
                {
                  name: category.name,
                  url: `/catalogo?categoria=${category.slug}`,
                },
              ]
            : []),
          { name: product.name, url: `/producto/${product.slug}` },
        ])}
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gris">
          <Link to="/" className="hover:text-verde">
            Inicio
          </Link>
          <span>/</span>
          <Link to="/catalogo" className="hover:text-verde">
            Catálogo
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                to={`/catalogo?categoria=${category.slug}`}
                className="hover:text-verde"
              >
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-gris">
                Sin imagen
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {category && (
              <span className="text-xs font-semibold uppercase tracking-wide text-ambar-texto">
                {category.name}
              </span>
            )}

            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-verde sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-1 font-mono text-xs text-gris">
              Código: {product.code}
            </p>

            <p className="mt-5 font-display text-3xl font-bold text-verde">
              {formatPrice(product.price)}
            </p>

            {product.description && (
              <p className="mt-5 leading-relaxed text-carbon">
                {product.description}
              </p>
            )}

            {modules.orders && (
              <div className="mt-8">
                <AddToOrderButton product={product} showQuantity />
              </div>
            )}
            <p className="mt-2 text-xs text-gris">
              El armado de pedidos estará disponible muy pronto.
            </p>
          </div>
        </div>

        {/* Safety data sheet */}
        {hasSafetySheet && (
          <div className="mt-14 rounded-xl border border-ambar/30 bg-ambar/5 p-6">
            <h2 className="font-display text-lg font-bold text-carbon">
              Ficha técnica y de seguridad
            </h2>

            <dl className="mt-4 space-y-4">
              {product.active_ingredient && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gris">
                    Ingrediente activo
                  </dt>
                  <dd className="mt-1 text-sm text-carbon">
                    {product.active_ingredient}
                  </dd>
                </div>
              )}

              {product.usage_instructions && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gris">
                    Modo de uso
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-carbon">
                    {product.usage_instructions}
                  </dd>
                </div>
              )}

              {product.warnings && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-rojo">
                    Advertencias
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-carbon">
                    {product.warnings}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-5 border-t border-ambar/20 pt-4 text-xs text-gris">
              Mantener fuera del alcance de niños y mascotas. Lee siempre la
              etiqueta del producto antes de usarlo.
            </p>
          </div>
        )}

        {/* Related products */}
        {pRelated.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-verde">
              También te puede servir
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pRelated.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  // categoryName={category?.name}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};
export default ProductPage;
