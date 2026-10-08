import type {
  MongoMenuDocument,
  MenuSection,
  MenuCategory,
  MenuItem,
  MenuItemVariant,
  MenuItemAddonGroup,
  MenuItemAddon,
  DietType,
} from '../types/menu.types';
import type { ResolveResponseData } from '../api/axios';
import type { ServingModel } from '../types/order.types';

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  CAD: 'CA$',
  AUD: 'AU$',
  SGD: 'SG$',
};

export function getCurrencySymbol(currency?: string, fallbackSymbol?: string): string {
  if (fallbackSymbol) return fallbackSymbol;
  if (!currency) return '₹';
  const upper = currency.toUpperCase().trim();
  return CURRENCY_SYMBOL_MAP[upper] || upper;
}

/**
 * Universal recursive normalizer for raw Menu, Vendor, and Booth payloads.
 * Handles diverse MongoDB menu document schemas, dynamic keys, and missing properties safely.
 */
export function normalizeResolveData(raw: any): ResolveResponseData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backend data format: expected an object with booth, vendor, and menu.');
  }

  const rawBooth = raw.booth || {};
  const rawVendor = raw.vendor || {};
  const rawMenu = raw.menu || {};

  const currency = rawVendor.currency || rawMenu?.cafe_profile?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(
    currency,
    rawVendor.currency_symbol || rawMenu?.cafe_profile?.currency_symbol
  );

  const servingModel: ServingModel =
    rawBooth.serving_model ||
    rawVendor.serving_model ||
    'DINE_IN';

  // 1. Normalize Booth
  const booth = {
    id: String(rawBooth.id || rawBooth._id || 'bth_unknown'),
    label: String(rawBooth.label || rawBooth.name || 'Table / Booth'),
    zone: rawBooth.zone ? String(rawBooth.zone) : undefined,
    seats: typeof rawBooth.seats === 'number' ? rawBooth.seats : undefined,
    serving_model: servingModel,
    qr_code_key: rawBooth.qr_code_key || undefined,
  };

  // 2. Normalize Vendor
  const vendor = {
    id: String(rawVendor.id || rawVendor._id || rawMenu.vendor_id || 'vnd_unknown'),
    name: String(rawVendor.name || rawMenu.cafe_profile?.name || 'Restaurant'),
    business_type: String(rawVendor.business_type || 'CAFE'),
    slug: rawVendor.slug || undefined,
    serving_model: servingModel,
    accept_order_type: (rawVendor.accept_order_type === 'POSTPAID' ? 'POSTPAID' : 'PREPAID') as 'PREPAID' | 'POSTPAID',
    order_confirmation_model: String(rawVendor.order_confirmation_model || 'MANUAL'),
    currency,
    currency_symbol: currencySymbol,
    is_open: rawVendor.is_open !== false,
    opening_time: String(rawVendor.opening_time || '08:00:00'),
    closing_time: String(rawVendor.closing_time || '23:00:00'),
  };

  // 3. Normalize Cafe Profile
  const rawProfile = rawMenu.cafe_profile || {};
  const cafeProfile = {
    name: String(rawProfile.name || vendor.name),
    tagline: rawProfile.tagline || undefined,
    logo_url: rawProfile.logo_url || undefined,
    cover_url: rawProfile.cover_url || undefined,
    phone: rawProfile.phone || undefined,
    address: rawProfile.address || undefined,
    google_map_link: rawProfile.google_map_link || undefined,
    fssai_lic_no: rawProfile.fssai_lic_no || undefined,
    currency,
    currency_symbol: currencySymbol,
    socials: rawProfile.socials || {},
  };

  // 4. Normalize Design Config
  const rawDesign = rawMenu.design_config || {};
  const designConfig = {
    template_id: String(rawDesign.template_id || 'tpl_modern_01'),
    colors: {
      primary: rawDesign.colors?.primary || '#1F3D2B',
      secondary: rawDesign.colors?.secondary || '#C8A15B',
      accent: rawDesign.colors?.accent || '#D9534F',
      background: rawDesign.colors?.background || '#FBF8F1',
      surface: rawDesign.colors?.surface || '#FFFFFF',
      text: rawDesign.colors?.text || '#1A1A1A',
      text_muted: rawDesign.colors?.text_muted || '#6B6B6B',
      ...(rawDesign.colors || {}),
    },
    fonts: {
      heading: rawDesign.fonts?.heading || 'playfair_display',
      body: rawDesign.fonts?.body || 'inter',
      ...(rawDesign.fonts || {}),
    },
    options: rawDesign.options || {},
  };

  // 5. Normalize Settings
  const rawSettings = rawMenu.settings || {};
  const settings = {
    ordering_enabled: rawSettings.ordering_enabled !== false,
    waiter_call_enabled: rawSettings.waiter_call_enabled !== false,
    show_search_bar: rawSettings.show_search_bar !== false,
    show_diet_filter: rawSettings.show_diet_filter !== false,
    tax_rate_percent: Number(rawSettings.tax_rate_percent ?? 5),
    service_charge_percent: Number(rawSettings.service_charge_percent ?? 0),
    estimated_prep_time_minutes: Number(rawSettings.estimated_prep_time_minutes ?? 20),
  };

  // 6. Recursively normalize Sections -> Categories -> Items -> Variants & Addons
  const rawSections: any[] = Array.isArray(rawMenu.sections) ? rawMenu.sections : [];
  const normalizedSections: MenuSection[] = [];

  rawSections.forEach((s, sIdx) => {
    const rawCategories: any[] = Array.isArray(s.categories) ? s.categories : [];
    const normalizedCategories: MenuCategory[] = [];

    rawCategories.forEach((c, cIdx) => {
      const rawItems: any[] = Array.isArray(c.items) ? c.items : [];
      const normalizedItems: MenuItem[] = [];

      rawItems.forEach((it, itIdx) => {
        // Variants
        const rawVariants: any[] = Array.isArray(it.variants) ? it.variants : [];
        const variants: MenuItemVariant[] = rawVariants.map((v, vIdx) => ({
          id: String(v.id || `var_${vIdx}`),
          name: String(v.name || `Variant ${vIdx + 1}`),
          price_paise: Number(v.price_paise || 0),
          is_default: Boolean(v.is_default),
          in_stock: v.in_stock !== false,
        }));

        // Addon Groups (support both 'options' and 'addons' fields)
        const rawAddonGroups: any[] = Array.isArray(it.addon_groups) ? it.addon_groups : [];
        const addonGroups: MenuItemAddonGroup[] = rawAddonGroups.map((g, gIdx) => {
          const rawOpts = Array.isArray(g.options) ? g.options : Array.isArray(g.addons) ? g.addons : [];
          const normalizedOptions: MenuItemAddon[] = rawOpts.map((opt: any, optIdx: number) => ({
            id: String(opt.id || `opt_${optIdx}`),
            name: String(opt.name || `Option ${optIdx + 1}`),
            price_paise: Number(opt.price_paise || 0),
            in_stock: opt.in_stock !== false,
          }));

          return {
            id: String(g.id || `grp_${gIdx}`),
            title: String(g.title || g.name || 'Add-ons & Extras'),
            min_selection: Number(g.min_selection ?? 0),
            max_selection: Number(g.max_selection ?? (normalizedOptions.length || 1)),
            is_required: Boolean(g.is_required),
            options: normalizedOptions,
            addons: normalizedOptions,
          };
        });

        // Images array
        let images = it.images;
        if (!Array.isArray(images)) {
          if (it.image_url) {
            images = [{ url: it.image_url, alt: it.name }];
          } else {
            images = [];
          }
        }

        // Base price
        let basePricePaise = Number(it.base_price_paise || 0);
        if (!basePricePaise && variants.length > 0) {
          const defaultVar = variants.find((v) => v.is_default) || variants[0];
          basePricePaise = defaultVar.price_paise;
        }

        const dietType: DietType = ['VEG', 'NON_VEG', 'EGG', 'VEGAN'].includes(it.diet_type)
          ? it.diet_type
          : 'VEG';

        normalizedItems.push({
          id: String(it.id || `itm_${sIdx}_${cIdx}_${itIdx}`),
          name: String(it.name || 'Unnamed Item'),
          short_name: it.short_name ? String(it.short_name) : undefined,
          description: it.description ? String(it.description) : undefined,
          diet_type: dietType,
          spice_level: typeof it.spice_level === 'number' ? it.spice_level : undefined,
          prep_time_minutes: typeof it.prep_time_minutes === 'number' ? it.prep_time_minutes : undefined,
          images,
          pricing_type: it.pricing_type || (variants.length > 0 ? 'VARIANT' : 'SINGLE'),
          base_price_paise: basePricePaise,
          variants,
          addon_groups: addonGroups,
          tags: Array.isArray(it.tags) ? it.tags : [],
          allergens: Array.isArray(it.allergens) ? it.allergens : [],
          is_active: it.is_active !== false,
          is_visible: it.is_visible !== false,
          in_stock: it.in_stock !== false,
          sort_order: Number(it.sort_order ?? itIdx + 1),
        });
      });

      normalizedCategories.push({
        id: String(c.id || `cat_${sIdx}_${cIdx}`),
        name: String(c.name || 'Category'),
        description: c.description ? String(c.description) : undefined,
        image_url: c.image_url ? String(c.image_url) : undefined,
        sort_order: Number(c.sort_order ?? cIdx + 1),
        is_active: c.is_active !== false,
        schedule: Array.isArray(c.schedule) ? c.schedule : [],
        items: normalizedItems,
      });
    });

    normalizedSections.push({
      id: String(s.id || `sec_${sIdx}`),
      name: String(s.name || 'Menu Section'),
      tagline: s.tagline ? String(s.tagline) : undefined,
      sort_order: Number(s.sort_order ?? sIdx + 1),
      is_active: s.is_active !== false,
      categories: normalizedCategories,
    });
  });

  const menu: MongoMenuDocument = {
    _id: rawMenu._id,
    cafe_id: String(rawMenu.cafe_id || rawMenu.vendor_id || vendor.id),
    menu_id: String(rawMenu.menu_id || 'menu_main'),
    schema_version: Number(rawMenu.schema_version ?? 2),
    status: rawMenu.status || 'ACTIVE',
    cafe_profile: cafeProfile,
    design_config: designConfig,
    settings,
    sections: normalizedSections,
  };

  return {
    booth,
    vendor,
    menu,
  };
}
