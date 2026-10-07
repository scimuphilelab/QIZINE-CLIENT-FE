/**
 * Strictly typed against the MongoDB Menu Document Schema & TRD
 */

export type DietType = 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN';
export type MenuStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type PricingType = 'FLAT' | 'VARIANT';

export interface CafeSocials {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface CafeProfile {
  name: string;
  tagline?: string;
  logo_url?: string;
  cover_url?: string;
  phone?: string;
  address?: string;
  google_map_link?: string;
  fssai_lic_no?: string;
  currency: string;
  currency_symbol: string;
  socials?: CafeSocials;
}

export interface DesignColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  text_muted: string;
  [key: string]: string;
}

export interface DesignFonts {
  heading: string;
  body: string;
  [key: string]: string;
}

export interface DesignConfig {
  template_id: string;
  colors: DesignColors;
  fonts: DesignFonts;
  options?: Record<string, unknown>;
}

export interface MenuSettings {
  ordering_enabled: boolean;
  waiter_call_enabled: boolean;
  show_search_bar: boolean;
  show_diet_filter: boolean;
  tax_rate_percent: number;
  service_charge_percent: number;
  estimated_prep_time_minutes: number;
}

export interface MenuItemImage {
  url: string;
  alt?: string;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  price_paise: number;
  is_default?: boolean;
  in_stock: boolean;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price_paise: number;
  in_stock: boolean;
}

export interface MenuItemAddonGroup {
  id: string;
  title: string;
  min_selection: number;
  max_selection: number;
  addons: MenuItemAddon[];
}

export interface MenuItem {
  id: string;
  name: string;
  short_name?: string;
  description?: string;
  diet_type: DietType;
  spice_level?: number;
  prep_time_minutes?: number;
  images?: MenuItemImage[];
  pricing_type: PricingType;
  base_price_paise: number;
  variants?: MenuItemVariant[];
  addon_groups?: MenuItemAddonGroup[];
  tags?: string[];
  is_active?: boolean;
  in_stock?: boolean;
}

export interface MenuCategorySchedule {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  schedule?: MenuCategorySchedule[];
  items: MenuItem[];
}

export interface MenuSection {
  id: string;
  name: string;
  tagline?: string;
  sort_order: number;
  is_active: boolean;
  categories: MenuCategory[];
}

export interface MongoMenuDocument {
  _id?: { $oid: string } | string;
  cafe_id: string;
  menu_id: string;
  schema_version: number;
  status: MenuStatus;
  cafe_profile: CafeProfile;
  design_config: DesignConfig;
  settings: MenuSettings;
  sections: MenuSection[];
}
