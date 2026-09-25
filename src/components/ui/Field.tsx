type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-carbon">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gris">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rojo">{error}</span>}
    </label>
  );
}

export const inputClass =
  "mt-1 block w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-verde focus:ring-1 focus:ring-verde disabled:bg-fondo disabled:text-gris";
