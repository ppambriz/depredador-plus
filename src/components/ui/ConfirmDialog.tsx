import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  requireText,
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const canConfirm =
    !requireText || typed.trim().toUpperCase() === requireText.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-carbon/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border border-black/5 bg-white p-6 shadow-xl"
      >
        <h2
          className={`font-display text-lg font-bold ${danger ? "text-rojo" : "text-verde"}`}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gris">{message}</p>

        {requireText && (
          <label className="mt-4 block">
            <span className="text-sm font-medium text-carbon">
              Escribe <span className="font-mono font-bold">{requireText}</span>{" "}
              para confirmar:
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-sm outline-none transition focus:border-rojo focus:ring-1 focus:ring-rojo"
            />
          </label>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-gris transition hover:bg-fondo"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
              danger
                ? "bg-rojo hover:bg-rojo/90"
                : "bg-verde hover:bg-verde-oscuro"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
