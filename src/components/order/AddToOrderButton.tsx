import { useState } from "react";
import type { Product } from "@/types";
import { useOrder } from "@/components/order/OrderProvider";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  product: Product;
  showQuantity?: boolean;
};

export function AddToOrderButton({ product, showQuantity = false }: Props) {
  const { addItem, hasItem } = useOrder();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const alreadyAdded = hasItem(product.id);

  function handleAdd() {
    addItem(product, quantity);
    showToast(`${product.name} agregado a tu pedido.`, "success");
    setQuantity(1);
  }

  return (
    <div className={showQuantity ? "flex flex-wrap items-center gap-3" : ""}>
      {showQuantity && (
        <div className="flex items-center rounded-lg border border-black/10">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Menos"
            className="cursor-pointer px-3 py-2.5 text-gris transition hover:text-verde"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Más"
            className="cursor-pointer px-3 py-2.5 text-gris transition hover:text-verde"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className={`cursor-pointer rounded-lg px-6 py-3 font-medium text-white transition ${
          showQuantity ? "flex-1 sm:flex-none" : "w-full"
        } bg-verde hover:bg-verde-oscuro`}
      >
        {alreadyAdded ? "Agregar otro" : "Agregar al pedido"}
      </button>
    </div>
  );
}
