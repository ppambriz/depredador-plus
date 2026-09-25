import { useRef, useState } from "react";

type Props = {
  value: string | null;
  onFileSelected: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function ImageUploadField({
  value,
  onFileSelected,
  onRemove,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelected(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  }

  const shown = preview ?? value;

  return (
    <div>
      <span className="text-sm font-medium text-carbon">Foto del producto</span>

      <div className="mt-1 flex items-start gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-fondo">
          {shown ? (
            <img
              src={shown}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-gris">Sin foto</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={disabled}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-verde file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-verde-oscuro"
          />
          {shown && (
            <button
              type="button"
              onClick={handleRemove}
              className="self-start rounded-md px-2 py-1 text-xs font-medium text-rojo hover:bg-rojo/5"
            >
              Quitar foto
            </button>
          )}
          <span className="text-xs text-gris">
            JPG, PNG o WebP. Se comprime automáticamente antes de subirse.
          </span>
        </div>
      </div>
    </div>
  );
}
