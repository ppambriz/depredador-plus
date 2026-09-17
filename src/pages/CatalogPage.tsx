import { Seo } from "@/seo/Seo";

export const CatalogPage = () => {
  return (
    <>
      <Seo
        title="Catálogo | Depredador Plus"
        description="Explora nuestro catálogo de venenos e insecticidas por tipo de plaga."
        path="/catalogo"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-verde">Catalogo</h1>

        <p className="mt-2 text-gris">
          Aquí irán los productos agrupados por tipo de plaga
        </p>
      </section>
    </>
  );
};
