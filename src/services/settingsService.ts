import type { BannerConfig, BannerSlide, SiteSetting } from "@/types";
import { supabase } from "@/lib/supabase";

const DEFAULT_BANNER_CONFIG: BannerConfig = {
  mode: "static",
  autoplay_ms: 5000,
};

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

  async getBanner(): Promise<{
    enabled: boolean;
    config: BannerConfig;
    slides: BannerSlide[];
  }> {
    const [setting, slides] = await Promise.all([
      this.get("banner"),
      this.getBannerSlides(),
    ]);

    const config: BannerConfig = {
      ...DEFAULT_BANNER_CONFIG,
      ...((setting?.config as Partial<BannerConfig>) ?? {}),
    };

    return {
      enabled: setting?.enabled ?? false,
      config,
      slides,
    };
  },
};
