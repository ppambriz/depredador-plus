import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

const NAV_ITEMS = [
  { to: "/admin", label: "Inicio" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/productos", label: "Productos" },
];

type Props = {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
};

export function AdminLayout({ children, title, action }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  async function handleLogout() {
    await authService.logout();
    navigate("/admin/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div className="flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-verde text-white"
                    : "text-gris hover:bg-verde/5 hover:text-verde"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-rojo/30 px-4 py-2 text-sm font-medium text-rojo transition hover:bg-rojo/5"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-verde">{title}</h1>
        {action}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
