import { Seo } from "@/seo/Seo";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <>
      <Seo
        title="Página no encontrada | Depredador Plus"
        description="La página que buscas no existe."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-display text-6xl font-extrabold text-verde">404</h1>
        <p className="mt-4 text-lg text-gris">
          La página que buscas no existe.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-verde px-5 py-3 font-medium text-white transition hover:bg-verde-oscuro"
        >
          Volver al inicio
        </Link>
      </section>
    </>
  );
};
export default NotFoundPage;
