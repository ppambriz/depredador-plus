// -- Audit fields (shared by soft-deletable entities) --

export interface AuditFields {
  active: boolean;
  created_at: string;
  created_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  deleted_user_agent: string | null;
  deleted_ip: string | null;
}

// -- Code sequences --

export type CodeEntity = "product" | "category" | "banner_slide";

export interface CodeSequence {
  entity: CodeEntity;
  prefix: string;
  padding: number;
  updated_at: string;
}

// -- Categories --

export type CategoryType = "insect" | "format" | "area" | "line";

export interface Category extends AuditFields {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: CategoryType;
}

// -- Products --

export interface Product extends AuditFields {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost: number;
  image_url: string | null;
  category_id: string | null;
  visible_public: boolean;

  // safety data sheet
  active_ingredient: string | null;
  usage_instructions: string | null;
  warnings: string | null;

  // inventory
  stock: number;
  min_stock: number;
}

// -- Banner slides --

export interface BannerSlide extends AuditFields {
  id: string;
  code: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  order: number;
}

// -- Site settings --

export type SettingSection =
  | "banner"
  | "welcome_modal"
  | "announcement_bar"
  | "contact"
  | "modules";

export interface SiteSetting {
  section: SettingSection;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}
