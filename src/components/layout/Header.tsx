import { Link } from "react-router-dom";

import { useOrder } from "@/components/order/OrderProvider";
import { useModules } from "@/hooks/useModules";

export function Header() {
  const { itemCount } = useOrder();
  const { modules } = useModules();
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* <span className="font-display text-lg font-bold text-verde">
          Depredador Plus
        </span> */}

        <Link to="/" className="font-display text-lg font-bold text-verde">
          Depredador Plus
          {/* Generador de Reportes */}
        </Link>

        <nav className="hidden sm:flex gap-6 text-sm font-medium ">
          <Link to="/" className="transition hover:text-verde">
            Inicio
          </Link>

          <Link to="/catalogo" className="transition hover:text-verde">
            Catalogo
          </Link>

          <Link to="/contacto" className="transition hover:text-verde">
            Contacto
          </Link>
          {modules.orders && (
            <Link
              to="/pedido"
              className="relative flex items-center gap-1.5 font-medium transition hover:text-verde"
            >
              Mi pedido
              {itemCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ambar px-1.5 text-xs font-bold text-carbon">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
