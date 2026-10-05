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

export type CodeEntity = "product" | "category" | "banner_slide" | "order";

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

// Benner configuration

export type BannerMode = "static" | "carousel";

export interface BannerConfig {
  mode: BannerMode;
  autoplay_ms: number;
}

export type ModalFrequency = "always" | "session" | "days";

export interface WelcomeModalConfig {
  title: string;
  text: string;
  image_url: string | null;
  button_label: string;
  button_link: string;
  frequency: ModalFrequency;
  frequency_days: number;
  start_date: string | null;
  end_date: string | null;
}

export interface AnnouncementBarConfig {
  text: string;
  color: string;
  link: string;
}

export interface ContactConfig {
  whatsapp: string;
  email: string;
  business_name: string;
}

export interface ModulesConfig {
  orders: boolean;
  credit: boolean;
  inventory: boolean;
  reports: boolean;
}

// -- Orders --

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "partial"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "credit" | "partial";
export type DiscountType = "percent" | "amount";
export type DeliveryType = "pickup" | "delivery";
export type OrderSource = "web" | "admin";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_code: string | null;
  product_name: string;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  delivered_quantity: number;
  missing_reason: string | null;
  discount_type: DiscountType | null;
  discount_value: number;
  subtotal: number;
  created_at: string;
}

export interface Order extends AuditFields {
  id: string;
  code: string;

  customer_name: string;
  customer_phone: string;
  customer_notes: string | null;
  customer_email: string | null;
  customer_address: string | null;

  status: OrderStatus;
  payment_status: PaymentStatus;
  cancel_reason: string | null;

  subtotal: number;
  discount_type: DiscountType | null;
  discount_value: number;
  discount_total: number;
  total: number;
  cost_total: number;

  delivery_type: DeliveryType;
  carrier: string | null;
  tracking_number: string | null;
  shipping_cost: number;

  needs_invoice: boolean;
  tax_id: string | null;
  legal_name: string | null;

  source: OrderSource;
  confirmed_at: string | null;
  delivered_at: string | null;
}

// -- Draft order (browser only, before it is sent) --

export interface DraftItem {
  product_id: string;
  product_code: string;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  unit_price: number;
  unit_cost: number;
  quantity: number;
}
