/**
 * Zero-fallback image utility
 * Returns empty string so components render a sleek "No preview" state instead of static food photos.
 */
export const DEFAULT_FOOD_IMAGE = '';

export const getFoodImageFallback = (_itemName: string = '', _categoryName: string = ''): string => {
  return '';
};
