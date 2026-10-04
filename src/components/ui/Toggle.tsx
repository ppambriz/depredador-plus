type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
};

export function Toggle({ checked, onChange, label, hint }: Props) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
          checked ? "bg-verde" : "bg-black/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>

      <span>
        <span className="block text-sm font-medium text-carbon">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-gris">{hint}</span>}
      </span>
    </label>
  );
}
