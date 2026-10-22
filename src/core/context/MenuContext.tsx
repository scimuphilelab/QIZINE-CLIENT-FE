import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { MongoMenuDocument, DietType, MenuItem } from '../types/menu.types';

export interface MenuContextValue {
  menu: MongoMenuDocument | null;
  loading: boolean;
  error: string | null;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dietFilter: DietType | 'ALL';
  setDietFilter: (diet: DietType | 'ALL') => void;
  filteredItems: MenuItem[];
  setMenu: (menu: MongoMenuDocument) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuProviderProps {
  children: React.ReactNode;
  initialMenu?: MongoMenuDocument | null;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children, initialMenu = null }) => {
  const [menu, setMenu] = useState<MongoMenuDocument | null>(initialMenu);
  const [loading, setLoading] = useState<boolean>(!initialMenu);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<DietType | 'ALL'>('ALL');

  // Sync menu state whenever initialMenu prop updates
  useEffect(() => {
    if (initialMenu) {
      setMenu(initialMenu);
      setLoading(false);
    }
  }, [initialMenu]);

  // Initialize selected section and category when menu loads
  useEffect(() => {
    if (menu && menu.sections.length > 0) {
      // Default to ALL so customer sees all sections initially
      setSelectedSectionId('ALL');
      const firstActiveCategory = menu.sections
        .flatMap((s) => (s.is_active ? s.categories.filter((c) => c.is_active) : []))[0];
      if (firstActiveCategory) {
        setSelectedCategoryId(firstActiveCategory.id);
      }
      setLoading(false);
    }
  }, [menu]);

  // All items flattened across the menu
  const allItems = useMemo(() => {
    if (!menu) return [];
    return menu.sections
      .filter((section) => section.is_active)
      .flatMap((section) =>
        section.categories
          .filter((cat) => cat.is_active)
          .flatMap((cat) => cat.items.filter((item) => item.is_active !== false))
      );
  }, [menu]);

  // Filter items based on active category, section, search query, and diet filter
  const filteredItems = useMemo(() => {
    let result = allItems;

    // If search query is present, search across all items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.short_name && item.short_name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    } else if (selectedCategoryId) {
      // Otherwise filter by selected category
      const targetCategory = menu?.sections
        .flatMap((s) => s.categories)
        .find((c) => c.id === selectedCategoryId);

      result = targetCategory ? targetCategory.items.filter((i) => i.is_active !== false) : [];
    } else if (selectedSectionId && selectedSectionId !== 'ALL') {
      const targetSection = menu?.sections.find((s) => s.id === selectedSectionId);
      result = targetSection
        ? targetSection.categories
            .filter((c) => c.is_active)
            .flatMap((c) => c.items.filter((i) => i.is_active !== false))
        : allItems;
    }

    // Apply dietary filter
    if (dietFilter !== 'ALL') {
      result = result.filter((item) => item.diet_type === dietFilter);
    }

    return result;
  }, [allItems, searchQuery, selectedCategoryId, selectedSectionId, dietFilter, menu]);

  const value = useMemo(
    () => ({
      menu,
      loading,
      error,
      selectedSectionId,
      setSelectedSectionId,
      selectedCategoryId,
      setSelectedCategoryId,
      searchQuery,
      setSearchQuery,
      dietFilter,
      setDietFilter,
      filteredItems,
      setMenu,
    }),
    [menu, loading, error, selectedSectionId, selectedCategoryId, searchQuery, dietFilter, filteredItems]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenuContext = (): MenuContextValue => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
};
