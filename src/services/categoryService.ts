import type { Category, CategoryType } from "@/types";
import { supabase } from "@/lib/supabase";
import { buildSoftDeletePayload, getCurrentUserId, RESTORE_PAYLOAD } from '@/services/auditHelpers'

export type CategoryFilters = {
  showActive: boolean;
  showInactive: boolean;
  type?: CategoryType | "all";
  search?: string;
};

export type CategoryInput = {
  code: string;
  name: string;
  slug: string;
  type: CategoryType;
};

export const categoryService = {
  async list(filters?: CategoryFilters): Promise<Category[]> {
    if (!supabase) return [];

    let query = supabase.from("categories").select("*");

    // Active / inactive filter (combinable)
    if (filters) {
      if (filters.showActive && !filters.showInactive) {
        query = query.eq("active", true);
      } else if (!filters.showActive && filters.showInactive) {
        query = query.eq("active", false);
      } else if (!filters.showActive && !filters.showInactive) {
        return [];
      }
      // both true -> no filter, show everything

      if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`,
        );
      }
    } else {
      query = query.eq("active", true);
    }

    const { data, error } = await query.order("code");
    if (error) throw error;
    return data as Category[];
  },

  async getById(id: string): Promise<Category | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data as Category;
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

  // async create(input: CategoryInput): Promise<Category> {
  //   if (!supabase) throw new Error("Supabase is not configured");

  //   const { data: userData } = await supabase.auth.getUser();

  //   const { data, error } = await supabase
  //     .from("categories")
  //     .insert({ ...input, created_by: userData.user?.id ?? null })
  //     .select()
  //     .single();

  //   if (error) throw error;
  //   return data as Category;
  // },

    async create(input: CategoryInput): Promise<Category> {
    if (!supabase) throw new Error('Supabase is not configured')

    const createdBy = await getCurrentUserId()

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, created_by: createdBy })
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async update(
    id: string,
    input: Omit<CategoryInput, "code">,
  ): Promise<Category> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  // async softDelete(id: string): Promise<void> {
  //   if (!supabase) throw new Error("Supabase is not configured");

  //   const { data: userData } = await supabase.auth.getUser();

  //   const { error } = await supabase
  //     .from("categories")
  //     .update({
  //       active: false,
  //       deleted_at: new Date().toISOString(),
  //       deleted_by: userData.user?.id ?? null,
  //       deleted_user_agent: navigator.userAgent,
  //     })
  //     .eq("id", id);

  //   if (error) throw error;
  // },

    async softDelete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured')

    const payload = await buildSoftDeletePayload()
    const { error } = await supabase.from('categories').update(payload).eq('id', id)

    if (error) throw error
  },

  // async restore(id: string): Promise<void> {
  //   if (!supabase) throw new Error("Supabase is not configured");

  //   const { error } = await supabase
  //     .from("categories")
  //     .update({
  //       active: true,
  //       deleted_at: null,
  //       deleted_by: null,
  //       deleted_user_agent: null,
  //       deleted_ip: null,
  //     })
  //     .eq("id", id);

  //   if (error) throw error;
  // },

    async restore(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured')

    const { error } = await supabase.from('categories').update(RESTORE_PAYLOAD).eq('id', id)

    if (error) throw error
  },
};
