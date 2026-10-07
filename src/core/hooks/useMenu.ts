import { useMemo } from 'react';
import { useMenuContext } from '../context/MenuContext';
import type { DietType, MenuItem, MenuCategory, MenuSection } from '../types/menu.types';

export interface UseMenuResult {
  menu: ReturnType<typeof useMenuContext>['menu'];
  loading: boolean;
  error: string | null;
  sections: MenuSection[];
  categories: MenuCategory[];
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

  const activeSection = useMemo(() => {
    if (!sections.length) return null;
    return sections.find((s) => s.id === selectedSectionId) || sections[0];
  }, [sections, selectedSectionId]);

  const categories = useMemo(() => {
    return activeSection ? activeSection.categories.filter((c) => c.is_active) : [];
  }, [activeSection]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  // Group filtered items into categories for seamless continuous-scroll UI layouts
  const categoriesWithFilteredItems = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.categories
      .filter((cat) => cat.is_active)
      .map((cat) => {
        const catItemIds = new Set(cat.items.map((i) => i.id));
        const matchedItems = filteredItems.filter((item) => catItemIds.has(item.id));
        return {
          ...cat,
          items: matchedItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [activeSection, filteredItems]);

  return {
    ...context,
    sections,
    categories,
    activeSection,
    activeCategory,
    categoriesWithFilteredItems,
  };
}
