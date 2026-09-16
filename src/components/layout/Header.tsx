export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-display text-lg font-bold text-verde">
          Depredador Plus
        </span>

        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          <a href="/" className="transition hover:text-verde">
            Inicio
          </a>
          <a href="#catalogo" className="transition hover:text-verde">
            Catálogo
          </a>
          <a href="#contacto" className="transition hover:text-verde">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
