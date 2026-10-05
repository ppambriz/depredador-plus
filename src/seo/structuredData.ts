import type { Category, Product } from "@/types";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173";

export function localBusinessData(businessName: string, phone: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: businessName,
    description:
      "Venta de venenos e insecticidas para cucarachas, moscos, moscas, hormigas y alacranes.",
    url: SITE_URL,
    ...(phone ? { telephone: `+${phone}` } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "León",
      addressRegion: "Guanajuato",
      addressCountry: "MX",
    },
  };
}

export function productData(product: Product, category: Category | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description || `${product.name} para control de plagas.`,
    sku: product.code,
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(category ? { category: category.name } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.slug}`,
      priceCurrency: "MXN",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    },
  };
}

export function breadcrumbData(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
