import { Seo } from "@/seo/Seo";

export const HomePage = () => {
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

        <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-tight text-verde sm:text-5xl">Tu espacio, tu hogar seguro</h1>

        <p className="mt-4 max-w-xl text-xl text-gris">
          Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes. Arma tu pedido y envíalo por WhatsApp.
        </p>
      </section>
    </>
  );
};
