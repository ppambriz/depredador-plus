import type { SiteSetting, BannerSlide } from "@/types";
import { supabase } from "@/lib/supabase";

export const settingsService = {
  async get(section: string): Promise<SiteSetting | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("section", section)
      .single();

    if (error) return null;
    return data as SiteSetting;
  },

  async getBannerSlides(): Promise<BannerSlide[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("banner_slides")
      .select("*")
      .eq("active", true)
      .order("order");

    if (error) return [];
    return data as BannerSlide[];
  },
};
