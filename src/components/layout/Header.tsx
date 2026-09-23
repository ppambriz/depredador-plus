import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* <span className="font-display text-lg font-bold text-verde">
          Depredador Plus
        </span> */}

        <Link to="/" className="font-display text-lg font-bold text-verde">
          {/* Depredador Plus */}Generador de Reportes
        </Link>

        <nav className="hidden sm:flex gap-6 text-sm font-medium ">
          <Link to="/" className="transition hover:text-verde">
            Inicio
          </Link>

          <Link to="/" className="transition hover:text-verde">
            Catalogo
          </Link>

          <Link to="/" className="transition hover:text-verde">
            Contacto
          </Link>
        </nav>
      </div>
    </header>
  );
}
