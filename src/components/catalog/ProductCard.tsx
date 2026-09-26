import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { memo } from "react";
import { Link } from "react-router-dom";

type Props = {
  product: Product;
  categoryName?: string;
};

export const ProductCard = memo(({ product, categoryName }: Props) => {
  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition hover:border-verde/30 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-fondo">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gris">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wide text-ambar">
            {categoryName}
          </span>
        )}

        <h3 className="mt-1 font-display font-semibold leading-snug text-carbon">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gris">
            {product.description}
          </p>
        )}

        <p className="mt-auto pt-3 font-display text-lg font-bold text-verde">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
});
