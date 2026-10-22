import { useMemo } from 'react';
import { useMenuContext } from '../context/MenuContext';
import type { DietType, MenuItem, MenuCategory, MenuSection } from '../types/menu.types';

export interface UseMenuResult {
  menu: ReturnType<typeof useMenuContext>['menu'];
  loading: boolean;
  error: string | null;
  sections: MenuSection[];
  categories: MenuCategory[];
  allCategories: MenuCategory[];
  activeSection: MenuSection | null;
  activeCategory: MenuCategory | null;
  selectedSectionId: string | null;
  selectedCategoryId: string | null;
  setSelectedSectionId: (id: string) => void;
  setSelectedCategoryId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dietFilter: DietType | 'ALL';
  setDietFilter: (diet: DietType | 'ALL') => void;
  filteredItems: MenuItem[];
  categoriesWithFilteredItems: Array<MenuCategory & { items: MenuItem[] }>;
}

export function useMenu(): UseMenuResult {
  const context = useMenuContext();
  const { menu, selectedSectionId, selectedCategoryId, filteredItems } = context;

  const sections = useMemo(() => {
    return menu ? menu.sections.filter((s) => s.is_active) : [];
  }, [menu]);

  const allCategories = useMemo(() => {
    return sections.flatMap((s) => s.categories.filter((c) => c.is_active));
  }, [sections]);

  const activeSection = useMemo(() => {
    if (!sections.length) return null;
    if (selectedSectionId === 'ALL') return null;
    return sections.find((s) => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  const categories = useMemo(() => {
    if (activeSection) {
      return activeSection.categories.filter((c) => c.is_active);
    }
    // If 'ALL' or no section is selected, show all active categories across all sections
    return allCategories;
  }, [activeSection, allCategories]);

  const activeCategory = useMemo(() => {
    if (selectedCategoryId) {
      const found = allCategories.find((c) => c.id === selectedCategoryId);
      if (found) return found;
    }
    return categories[0] || allCategories[0] || null;
  }, [categories, allCategories, selectedCategoryId]);

  // Group filtered items into categories for seamless continuous-scroll UI layouts
  const categoriesWithFilteredItems = useMemo(() => {
    const targetCats = categories;
    return targetCats
      .map((cat) => {
        const catItemIds = new Set(cat.items.map((i) => i.id));
        const matchedItems = filteredItems.filter((item) => catItemIds.has(item.id));
        return {
          ...cat,
          items: matchedItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, filteredItems]);

  return {
    ...context,
    sections,
    categories,
    allCategories,
    activeSection,
    activeCategory,
    categoriesWithFilteredItems,
  };
}
