import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export function useSort<T>(items: T[], defaultField: keyof T) {
  const [field, setField] = useState<keyof T>(defaultField);
  const [direction, setDirection] = useState<SortDirection>("asc");

  function toggleSort(nextField: keyof T) {
    if (nextField === field) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setField(nextField);
      setDirection("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      if (valueA === valueB) return 0;
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      let result: number;
      if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else {
        result = String(valueA).localeCompare(String(valueB), "es");
      }

      return direction === "asc" ? result : -result;
    });
  }, [items, field, direction]);

  return { sorted, field, direction, toggleSort };
}
