import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Líquido anti-cucarachas",
    slug: "líquido-anti-cucarachas",
    description: "Líquido de acción rápida para cucarachas.",
    price: 149.99,
    image_url: null,
    category_id: "1",
    active: true,
    active_ingredient: null,
    usage_instructions: "Aplicar todo el producto en grietas y esquinas.",
    warnings: "Mantener fuera del alcance de niños y mascotas.",
    created_at: "",
  },
  {
    id: "2",
    name: "Líquido mata moscos",
    slug: "Líquido-mata-moscos",
    description: "Insecticida en líquido para moscos y mosquitos.",
    price: 89.99,
    image_url: null,
    category_id: "2",
    active: true,
    active_ingredient: null,
    usage_instructions: "Rociar al aire en la habitación.",
    warnings: "No inhalar directamente. Ventilar después de usar.",
    created_at: "",
  },
];

export const productService = {
  async list(): Promise<Product[]> {
    if (!supabase) return MOCK_PRODUCTS;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;
    return data as Product[];
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (!supabase) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) return null;
    return data as Product;
  },

  async listByCategory(categoryId: string): Promise<Product[]> {
    if (!supabase)
      return MOCK_PRODUCTS.filter((p) => p.category_id === categoryId);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("active", true)
      .order("name");

    if (error) throw error;
    return data as Product[];
  },
};
