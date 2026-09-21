import type { Product } from "@/types";
import { supabase } from "@/lib/supabase";

export const productService = {
  async listPublic(): Promise<Product[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("visible_public", true)
      .order("name");

    if (error) throw error;
    return data as Product[];
  },

  async listAdmin(includeInactive = false): Promise<Product[]> {
    if (!supabase) return [];

    let query = supabase.from("products").select("*");
    if (!includeInactive) query = query.eq("active", true);

    const { data, error } = await query.order("code");
    if (error) throw error;
    return data as Product[];
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error) return null;
    return data as Product;
  },

  async listByCategory(categoryId: string): Promise<Product[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("active", true)
      .eq("visible_public", true)
      .order("name");

    if (error) throw error;
    return data as Product[];
  },
};
