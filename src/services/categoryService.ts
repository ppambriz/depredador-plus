import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Cucarachas",
    slug: "cucarachas",
    type: "insect",
    created_at: "",
  },
  { id: "2", name: "Moscos", slug: "moscos", type: "insect", created_at: "" },
  { id: "3", name: "Moscas", slug: "moscas", type: "insect", created_at: "" },
  {
    id: "4",
    name: "Hormigas",
    slug: "hormigas",
    type: "insect",
    created_at: "",
  },
  {
    id: "5",
    name: "Alacranes",
    slug: "alacranes",
    type: "insect",
    created_at: "",
  },
];

export const categoryService = {
  async list(): Promise<Category[]> {
    if (!supabase) return MOCK_CATEGORIES;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as Category[];
  },
  async getBySlug(slug: string): Promise<Category | null> {
    if (!supabase) return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data as Category;
  },
};
