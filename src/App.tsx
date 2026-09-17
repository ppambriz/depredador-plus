import { Layout } from "./components/layout/Layout";
import { ResponsiveImage } from "./components/ui/ResponsiveImage";

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
        <div className="mt-10">
          <p className="mb-3 text-sm font-medium text-carbon">
            Prueba del componente ImagenResponsiva:
          </p>
          <ResponsiveImage
            src="https://placehold.co/600x400/1B5E20/ffffff?text=Depredador+Plus"
            alt="Imagen de prueba con los colores de Depredador Plus"
            width={600}
            height={400}
            className="rounded-lg shadow-md"
          />
        </div>
      </section>
    </Layout>
  );
}

export default App;
