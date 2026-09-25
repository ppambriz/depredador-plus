import type { CategoryType } from "@/types";

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  insect: "Tipo de plaga",
  format: "Presentación",
  area: "Área de uso",
  line: "Línea de negocio",
};

export const PRODUCT_VISIBILITY_LABELS = {
  all: "Todos",
  public: "Visibles en tienda",
  internal: "Solo internos",
} as const;
