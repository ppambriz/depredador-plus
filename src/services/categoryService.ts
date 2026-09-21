import type { Category } from "@/types";
import { supabase } from "@/lib/supabase";

export const categoryService = {
  async list(includeInactive = false): Promise<Category[]> {
    if (!supabase) return [];

    let query = supabase.from("categories").select("*");
    if (!includeInactive) query = query.eq("active", true);

    const { data, error } = await query.order("name");
    if (error) throw error;
    return data as Category[];
  },

  async getBySlug(slug: string): Promise<Category | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error) return null;
    return data as Category;
  },
};
