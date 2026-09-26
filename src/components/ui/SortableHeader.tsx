type Props<T> = {
  label: string;
  field: keyof T;
  currentField: keyof T;
  direction: "asc" | "desc";
  onSort: (field: keyof T) => void;
  align?: "left" | "right";
};

export function SortableHeader<T>({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = "left",
}: Props<T>) {
  const isActive = field === currentField;

  return (
    <th
      className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 transition hover:text-verde ${
          isActive ? "text-verde" : ""
        }`}
      >
        {label}
        <span
          className={`text-[10px] ${isActive ? "opacity-100" : "opacity-30"}`}
        >
          {isActive && direction === "desc" ? "▼" : "▲"}
        </span>
      </button>
    </th>
  );
}
