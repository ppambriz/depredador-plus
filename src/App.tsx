import { Layout } from "./components/layout/Layout";

function App() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ambar">
          Control de plagas
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold leading-tight text-verde sm:text-5xl">
          Tu espacio, tu hogar seguro.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gris">
          Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes. Arma tu pedido y envíalo por WhatsApp.
        </p>
      </section>
    </Layout>
  );
}

export default App;
