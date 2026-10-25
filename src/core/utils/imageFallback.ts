/**
 * Branded SVG Food Placeholder
 * Offline-ready, zero-latency vector graphic matching the Qizine design system (#FAF4EE & #FF385C).
 * Prevents mismatched external stock photo loads when dishes have no custom photo.
 */
export const DEFAULT_FOOD_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" rx="24" fill="%23F5EEE6"/><circle cx="100" cy="100" r="62" fill="%23FFFFFF" stroke="%23EADFD5" stroke-width="2"/><path d="M60 122h80c0 5-4 10-10 10H70c-6 0-10-5-10-10z" fill="%23FF385C" opacity="0.9"/><path d="M66 118a34 34 0 0 1 68 0z" fill="%23FF385C" opacity="0.15" stroke="%23FF385C" stroke-width="3.5" stroke-linecap="round"/><circle cx="100" cy="80" r="5.5" fill="%23FF385C"/><path d="M86 70c0-6 5-6 5-12M100 68c0-6 5-6 5-12M114 70c0-6 5-6 5-12" stroke="%23E09B3D" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>';

export const getFoodImageFallback = (_itemName: string = '', _categoryName: string = ''): string => {
  return DEFAULT_FOOD_IMAGE;
};
