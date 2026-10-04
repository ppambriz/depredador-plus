import type {
  AnnouncementBarConfig,
  BannerConfig,
  BannerSlide,
  ContactConfig,
  ModulesConfig,
  SettingSection,
  SiteSetting,
  WelcomeModalConfig,
} from "@/types";
import { supabase } from "@/lib/supabase";
import { buildSoftDeletePayload, getCurrentUserId, RESTORE_PAYLOAD } from "@/services/auditHelpers";

export const DEFAULTS = {
  banner: { mode: "static", autoplay_ms: 5000 } as BannerConfig,
  welcome_modal: {
    title: "",
    text: "",
    image_url: null,
    button_label: "",
    button_link: "",
    frequency: "session",
    frequency_days: 7,
    start_date: null,
    end_date: null,
  } as WelcomeModalConfig,
  announcement_bar: {
    text: "",
    color: "#F9A825",
    link: "",
  } as AnnouncementBarConfig,
  contact: {
    whatsapp: "",
    email: "",
    business_name: "Depredador Plus",
  } as ContactConfig,
  modules: {
    orders: false,
    credit: false,
    inventory: false,
    reports: false,
  } as ModulesConfig,
};

export const settingsService = {
  async get(section: SettingSection): Promise<SiteSetting | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("section", section)
      .single();

    if (error) return null;
    return data as SiteSetting;
  },

  async getAll(): Promise<SiteSetting[]> {
    if (!supabase) return [];

    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) return [];
    return data as SiteSetting[];
  },

  async update(
    section: SettingSection,
    enabled: boolean,
    config: Record<string, unknown>,
  ): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const updatedBy = await getCurrentUserId();

    const { error } = await supabase
      .from("site_settings")
      .update({
        enabled,
        config,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .eq("section", section);

    if (error) throw error;
  },

  // ---------- Banner slides ----------

  async getBannerSlides(includeInactive = false): Promise<BannerSlide[]> {
    if (!supabase) return [];

    let query = supabase.from("banner_slides").select("*");
    if (!includeInactive) query = query.eq("active", true);

    const { data, error } = await query.order("order");
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

    return {
      enabled: setting?.enabled ?? false,
      config: {
        ...DEFAULTS.banner,
        ...((setting?.config as Partial<BannerConfig>) ?? {}),
      },
      slides,
    };
  },

  async createSlide(input: {
    code: string;
    image_url: string;
    title: string | null;
    subtitle: string | null;
    link: string | null;
    order: number;
  }): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const createdBy = await getCurrentUserId();

    const { error } = await supabase
      .from("banner_slides")
      .insert({ ...input, created_by: createdBy });

    if (error) throw error;
  },

  async updateSlide(
    id: string,
    input: {
      image_url: string;
      title: string | null;
      subtitle: string | null;
      link: string | null;
      order: number;
    },
  ): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase
      .from("banner_slides")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async softDeleteSlide(id: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const payload = await buildSoftDeletePayload();
    const { error } = await supabase
      .from("banner_slides")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  },

  async restoreSlide(id: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase
      .from("banner_slides")
      .update(RESTORE_PAYLOAD)
      .eq("id", id);
    if (error) throw error;
  },
};
