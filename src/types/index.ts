// Categories

export type CategoryType = "insect" | "formart" | "area";

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  created_at: string;
}

//Products

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  active: boolean;
  active_ingredient: string | null;
  usage_instructions: string | null;
  warnings: string | null;
  created_at: string;
}

// Baner slides

export interface BannerSlide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  order: number;
  active: boolean;
}

//Site settings

export type SettingsSection =
  | "banner"
  | "welcome_modal"
  | "announcement_bar"
  | "contact"
  | "seo";

export interface SiteSetting {
  section: SettingsSection;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
}
