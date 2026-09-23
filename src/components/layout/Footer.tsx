export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gris">
        <p className="font-display font-semibold text-verde">
          {/* Depredador Plus */} Generador de Reportes
        </p>
        <p className="mt-1">
          {/* Venenos e insecticidas para cucarachas, moscos, moscas, hormigas y
          alacranes. */}
        </p>
        <p className="mt-4 text-xs">
          {/* Usa los insecticidas de forma responsable. Mantener fuera del alcance
          de niños y mascotas. */}
        </p>
        <p className="mt-4 text-xs text-gris/60">
          © {new Date().getFullYear()} Reportes. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
