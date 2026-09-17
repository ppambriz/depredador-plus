import { Seo } from "@/seo/Seo";
import { useParams } from "react-router-dom";

export const ProductPage = () => {
  const { id } = useParams();

  return (
    <>
      <Seo
        title={`Producto ${id} | Depredador Plus`}
        description="Ficha de producto con detalle, precio y ficha de seguridad."
        path={`/producto/${id}`}
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-verde">
          Producto: {id}
        </h1>
        <p className="mt-2 text-gris">
          Aquí irá la ficha completa del producto.
        </p>
      </section>
    </>
  );
};
