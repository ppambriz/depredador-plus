import { Link } from "react-router-dom";

import { useOrder } from "@/components/order/OrderProvider";
import { useModules } from "@/hooks/useModules";
import { Seo } from "@/seo/Seo";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import { SendOrderForm } from "@/components/order/SendOrderForm";

export function OrderPage() {
  const { items, total, itemCount, setQuantity, removeItem, clear } =
    useOrder();
  const { modules, loading } = useModules();
  const [sentCode, setSentCode] = useState<string | null>(null);

  if (loading)
    return <p className="p-12 text-center text-sm text-gris">Cargando...</p>;

  if (!modules.orders) {
    return (
      <>
        <Seo title="Mi pedido | Depredador Plus" description="Pedido" noindex />
        <section className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-verde">
            Pedidos no disponibles
          </h1>
          <p className="mt-2 text-gris">
            Esta función estará disponible muy pronto.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-block rounded-lg bg-verde px-5 py-3 font-medium text-white transition hover:bg-verde-oscuro"
          >
            Ver catálogo
          </Link>
        </section>
      </>
    );
  }

  if (sentCode) {
    return (
      <>
        <Seo
          title="Pedido enviado | Depredador Plus"
          description="Pedido enviado"
          noindex
        />
        <section className="mx-auto max-w-lg px-4 py-20 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-verde/10 text-3xl">
            ✓
          </span>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-verde">
            Pedido {sentCode} registrado
          </h1>
          <p className="mt-3 text-gris">
            Si WhatsApp no se abrió, revisa que tu navegador permita ventanas
            emergentes. Nos pondremos en contacto contigo para confirmar.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-block rounded-lg bg-verde px-6 py-3 font-medium text-white transition hover:bg-verde-oscuro"
          >
            Seguir viendo productos
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Mi pedido | Depredador Plus"
        description="Revisa tu pedido antes de enviarlo."
        noindex
      />

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-verde">
          Mi pedido
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-black/10 bg-white py-16 text-center">
            <p className="text-gris">Todavía no has agregado productos.</p>
            <Link
              to="/catalogo"
              className="mt-4 inline-block rounded-lg bg-verde px-5 py-3 font-medium text-white transition hover:bg-verde-oscuro"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-gris">
              {itemCount} {itemCount === 1 ? "producto" : "productos"}
            </p>

            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5 bg-white p-4"
                >
                  <Link
                    to={`/producto/${item.product_slug}`}
                    className="shrink-0"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-fondo text-xs text-gris">
                        —
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/producto/${item.product_slug}`}
                      className="font-display font-semibold text-carbon hover:text-verde"
                    >
                      {item.product_name}
                    </Link>
                    <p className="mt-0.5 text-sm text-gris">
                      {formatPrice(item.unit_price)} c/u
                    </p>
                  </div>

                  <div className="flex items-center rounded-lg border border-black/10">
                    <button
                      onClick={() =>
                        setQuantity(item.product_id, item.quantity - 1)
                      }
                      aria-label="Menos"
                      className="cursor-pointer px-3 py-2 text-gris transition hover:text-verde"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(item.product_id, item.quantity + 1)
                      }
                      aria-label="Más"
                      className="cursor-pointer px-3 py-2 text-gris transition hover:text-verde"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-24 text-right font-display font-bold text-verde">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    aria-label="Quitar"
                    className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-rojo transition hover:bg-rojo/5"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 rounded-xl border border-black/5 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-carbon">
                  Total
                </span>
                <span className="font-display text-3xl font-extrabold text-verde">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="mt-6 border-t border-black/5 pt-6">
                <SendOrderForm onSent={setSentCode} />
              </div>
              <p className="mt-2 text-center text-xs text-gris">
                El envío por WhatsApp estará disponible en el siguiente paso.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="rounded-lg border border-black/10 px-5 py-2.5 text-sm font-medium text-gris transition hover:bg-white"
              >
                Seguir agregando
              </Link>
              <button
                onClick={clear}
                className="cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-rojo transition hover:bg-rojo/5"
              >
                Vaciar pedido
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
export default OrderPage;
