import React, { useState, useMemo } from 'react';
import {
  Search,
  Mic,
  X,
  ChevronDown,
  BookOpen,
  Utensils,
  Bell,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
} from 'lucide-react';
import type { MenuItem, MenuCategory, MenuSection, MongoMenuDocument } from '../../../core/types/menu.types';
import type { QRBoothContext } from '../../../core/types/order.types';
import { CategoryPill } from '../components/CategoryPill';
import { ItemListItem } from '../components/ItemListItem';
import { MenuDrawer } from '../components/MenuDrawer';
import { BottomCartBar } from '../components/BottomCartBar';

export interface HomeScreenProps {
  menu?: MongoMenuDocument | null;
  sections: MenuSection[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  categories: MenuCategory[];
  allCategories: MenuCategory[];
  booth?: QRBoothContext;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectItem: (item: MenuItem) => void;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  hasActiveOrder?: boolean;
  cartCount?: number;
}

export type SortOption = 'relevance' | 'price_asc' | 'price_desc';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  menu,
  sections = [],
  selectedSectionId,
  onSelectSection,
  allCategories = [],
  booth,
  searchQuery,
  onSearchChange,
  onSelectItem,
  onOpenCart,
  onOpenTracker,
  hasActiveOrder = false,
  cartCount = 0,
}) => {
  // Category selection (defaults to first category or 'all')
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  // Veg-only toggle switch state (matching VEG toggle on top right of screenshot)
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  // Sort option state
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  // Menu Directory Drawer state
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  // Store info modal state
  const [showStoreInfo, setShowStoreInfo] = useState<boolean>(false);

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Restaurant';
  const tableLabel = booth?.booth_label ? `Table ${booth.booth_label}` : 'Dine-In';
  const tableZone = booth?.zone ? ` • ${booth.zone}` : '';

  // Get active section categories or all categories
  const activeSectionCategories = useMemo(() => {
    if (!selectedSectionId || selectedSectionId === 'ALL') {
      return allCategories;
    }
    const currentSection = sections.find((s) => s.id === selectedSectionId);
    return currentSection ? currentSection.categories : allCategories;
  }, [sections, selectedSectionId, allCategories]);

  // Categories for the circular carousel (with dish images extracted from first item with image)
  const circularCategories = useMemo(() => {
    const cats = activeSectionCategories.map((c) => {
      // Find real image from category image_url or first item with image
      const dishWithImg = c.items?.find((i) => i.images && i.images.length > 0 && i.images[0]?.url);
      const imgUrl = c.image_url || dishWithImg?.images?.[0]?.url;
      return {
        id: c.id,
        name: c.name,
        imageUrl: imgUrl,
        itemsCount: c.items?.length || 0,
      };
    });

    // Add 'All' as the very first circular category
    const allDishes = activeSectionCategories.flatMap((c) => c.items);
    const firstDishImg = allDishes.find((i) => i.images && i.images.length > 0 && i.images[0]?.url)?.images?.[0]?.url;

    return [
      {
        id: 'all',
        name: 'All Items',
        imageUrl: firstDishImg || menu?.cafe_profile?.logo_url,
        itemsCount: allDishes.length,
      },
      ...cats,
    ];
  }, [activeSectionCategories, menu]);

  // Flatten and filter items
  const isSearching = searchQuery.trim().length > 0;

  const displayedItems = useMemo(() => {
    // 1. Gather candidate items from active section and selected category
    let items: MenuItem[] = [];

    if (selectedCatId === 'all') {
      items = activeSectionCategories.flatMap((c) => c.items || []);
    } else {
      const activeCat = activeSectionCategories.find((c) => c.id === selectedCatId);
      items = activeCat?.items ? [...activeCat.items] : [];
    }

    // Deduplicate by item ID
    const seen = new Set<string>();
    items = items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // 2. Apply Veg-only filter if toggled
    if (vegOnly) {
      items = items.filter(
        (item) => item.diet_type === 'VEG' || item.diet_type === 'VEGAN'
      );
    }

    // 3. Apply Search query
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.short_name && item.short_name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 4. Apply Sorting
    if (sortBy === 'price_asc') {
      items.sort((a, b) => a.base_price_paise - b.base_price_paise);
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => b.base_price_paise - a.base_price_paise);
    }

    return items;
  }, [
    activeSectionCategories,
    selectedCatId,
    vegOnly,
    searchQuery,
    isSearching,
    sortBy,
  ]);

  // Active category display title
  const activeCategoryTitle = useMemo(() => {
    if (isSearching) return `Search Results (${displayedItems.length})`;
    if (selectedCatId === 'all') {
      if (selectedSectionId && selectedSectionId !== 'ALL') {
        const sec = sections.find((s) => s.id === selectedSectionId);
        return sec ? `${sec.name} (${displayedItems.length})` : 'All Items';
      }
      return `${displayedItems.length} items to explore`;
    }
    const cat = allCategories.find((c) => c.id === selectedCatId);
    return cat ? `${cat.name} (${displayedItems.length})` : `${displayedItems.length} items to explore`;
  }, [isSearching, selectedCatId, selectedSectionId, sections, allCategories, displayedItems.length]);

  return (
    <div className="flex-1 bg-[#FAF9F7] text-stone-900 pb-28 font-sans transition-colors">
      {/* 1. Top Store & Table Info Bar */}
      <header className="px-4 sm:px-6 pt-3 pb-2.5 flex items-center justify-between border-b border-stone-200/50 bg-white">
        <button
          onClick={() => setShowStoreInfo(true)}
          type="button"
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8.5 h-8.5 rounded-full bg-[#FFF4EE] text-[#FF5722] flex items-center justify-center font-bold shadow-2xs">
            <Store className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-black text-[15px] sm:text-[17px] text-stone-900 leading-tight group-hover:text-[#FF5722] transition-colors truncate max-w-[200px] tracking-tight">
              {cafeName}
            </h1>
            <p className="font-sans text-[11px] font-semibold text-stone-500">
              {tableLabel}
              {tableZone}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Live Order Tracker Trigger (pulsing when active order exists) */}
          <button
            onClick={onOpenTracker}
            type="button"
            className="relative w-10 h-10 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition"
            aria-label="Track Active Order"
            title="Track Order"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
            {hasActiveOrder && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF5722] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Cart Bag Trigger */}
          <button
            onClick={onOpenCart}
            type="button"
            className="relative w-10 h-10 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition"
            aria-label="View Basket"
            title="Basket"
          >
            <ShoppingBag className="w-4.5 h-4.5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-[10px] font-heading font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. Search Bar & VEG Switch Row (Exact Reference Screenshot Layout) */}
      <div className="px-4 sm:px-6 pt-3.5 pb-2.5 bg-white">
        <div className="flex items-center gap-2.5">
          {/* Main Search Pill Input */}
          <div className="relative flex-1 bg-white border border-stone-200 rounded-full shadow-2xs flex items-center px-3.5 py-2 hover:border-stone-300 focus-within:border-[#FF5722] focus-within:ring-2 focus-within:ring-[#FF5722]/15 transition-all">
            <Search className="w-4.5 h-4.5 text-stone-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search for 'Pizza', 'Burger'..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent font-sans text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 text-stone-400 hover:text-stone-700 transition"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : null}

            {/* Vertical Separator */}
            <div className="h-4 w-px bg-stone-200 mx-2 shrink-0" />

            {/* Mic / Voice Icon in Orange (Matching Screenshot) */}
            <button
              type="button"
              className="text-[#FF5722] hover:opacity-80 p-0.5 shrink-0"
              aria-label="Voice Search"
            >
              <Mic className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Dedicated VEG Switch Badge (Matching Screenshot Top Right) */}
          <button
            type="button"
            onClick={() => setVegOnly((prev) => !prev)}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 select-none shrink-0 ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-600'
            }`}
            title="Filter pure vegetarian items"
          >
            <span className={`font-heading text-[10px] font-black tracking-wider leading-none mb-1 ${vegOnly ? 'text-emerald-700' : 'text-stone-600'}`}>
              VEG
            </span>
            <div
              className={`w-6 h-3 rounded-full flex items-center p-0.5 transition-colors ${
                vegOnly ? 'bg-emerald-600 justify-end' : 'bg-stone-300 justify-start'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Horizontal Section Tabs (Matching Screenshot Under Search Bar) */}
      <nav className="bg-white border-b border-stone-200/60 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-5 min-w-max">
          {/* 'All' Tab */}
          <button
            type="button"
            onClick={() => {
              onSelectSection('ALL');
              setSelectedCatId('all');
            }}
            className={`pb-1.5 font-heading text-xs sm:text-sm font-bold tracking-tight transition-all relative whitespace-nowrap cursor-pointer ${
              !selectedSectionId || selectedSectionId === 'ALL'
                ? 'text-[#FF5722]'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All
            {(!selectedSectionId || selectedSectionId === 'ALL') && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5722] rounded-full animate-in fade-in" />
            )}
          </button>

          {/* Section Tabs from MongoDB */}
          {sections.map((sec) => {
            const isActive = selectedSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  onSelectSection(sec.id);
                  setSelectedCatId('all');
                }}
                className={`pb-1.5 font-heading text-xs sm:text-sm font-bold tracking-tight transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-[#FF5722]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {sec.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5722] rounded-full animate-in fade-in" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. Circular Categories Row (Exact Match to Screenshot) */}
      {!isSearching && circularCategories.length > 0 && (
        <div className="bg-white px-4 sm:px-6 pt-4 pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1">
            {circularCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <CategoryPill
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  imageUrl={cat.imageUrl}
                  isSelected={isSelected}
                  onClick={() => setSelectedCatId(cat.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Results Counter & Sorting Bar (Matching Screenshot: "125 restaurants to explore | Relevance ⌵") */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <h2 className="font-heading font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">
          {activeCategoryTitle}
        </h2>

        {/* Sort Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 font-heading text-xs font-bold text-stone-700 bg-white border border-stone-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs hover:bg-stone-50 active:scale-95 transition"
          >
            <span>
              {sortBy === 'relevance'
                ? 'Relevance'
                : sortBy === 'price_asc'
                ? 'Price: Low'
                : 'Price: High'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {isSortDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-30 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setSortBy('relevance');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 font-heading text-xs font-semibold hover:bg-stone-50 ${
                  sortBy === 'relevance' ? 'text-[#FF5722] font-black' : 'text-stone-700'
                }`}
              >
                Relevance
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy('price_asc');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 font-heading text-xs font-semibold hover:bg-stone-50 ${
                  sortBy === 'price_asc' ? 'text-[#FF5722] font-black' : 'text-stone-700'
                }`}
              >
                Price: Low to High
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy('price_desc');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 font-heading text-xs font-semibold hover:bg-stone-50 ${
                  sortBy === 'price_desc' ? 'text-[#FF5722] font-black' : 'text-stone-700'
                }`}
              >
                Price: High to Low
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Production-Grade List View for Items (PDF-Menu Modernization, NO Box Grids!) */}
      <main className="px-4 sm:px-6">
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 shadow-xs my-4">
            <span className="text-4xl mb-2 inline-block">🍽️</span>
            <p className="font-heading text-base font-extrabold text-stone-800">No items available</p>
            <p className="font-sans text-xs sm:text-sm text-stone-400 mt-1">
              {vegOnly
                ? 'No vegetarian items found in this section. Try turning off the VEG filter.'
                : 'Try exploring other categories or clearing your search.'}
            </p>
            {vegOnly && (
              <button
                type="button"
                onClick={() => setVegOnly(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white font-heading text-xs font-bold hover:bg-stone-800 transition"
              >
                Show All Items
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xs border border-stone-200/70 overflow-hidden divide-y divide-stone-100">
            {displayedItems.map((item) => (
              <ItemListItem
                key={item.id}
                item={item}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 7. Floating Food Menu Button in Bottom Right Corner (Squircle 25% radius, White, Utensils Icon, No Text) */}
      <div
        className={`fixed right-4 z-40 sm:right-6 transition-all duration-300 ${
          cartCount > 0 ? 'bottom-22 sm:bottom-24' : 'bottom-6 sm:bottom-8'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMenuDrawerOpen(true)}
          className="w-14 h-14 sm:w-15 sm:h-15 rounded-[16px] bg-white hover:bg-stone-50 text-[#FF5722] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-stone-200/90 flex items-center justify-center active:scale-90 transition-all cursor-pointer group"
          aria-label="Open Menu Directory"
          title="Menu Directory"
        >
          <Utensils className="w-6.5 h-6.5 text-[#FF5722] group-hover:scale-110 transition-transform stroke-[2.4]" />
        </button>
      </div>

      {/* 8. Menu Directory Drawer (Table of Contents) */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        sections={sections}
        allCategories={allCategories}
        selectedCategoryId={selectedCatId === 'all' ? null : selectedCatId}
        onSelectCategory={(catId) => {
          setSelectedCatId(catId);
          setIsMenuDrawerOpen(false);
        }}
      />

      {/* 9. Floating Bottom Cart Bar */}
      <BottomCartBar onOpenCart={onOpenCart} />

      {/* 10. Store Info Modal */}
      {showStoreInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-base text-stone-900">{cafeName}</h3>
              <button
                type="button"
                onClick={() => setShowStoreInfo(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-stone-600">
              {tableLabel && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5722]" />
                  <span className="font-semibold">
                    {tableLabel}
                    {tableZone}
                  </span>
                </div>
              )}
              {menu?.cafe_profile?.address && (
                <p className="text-stone-500 font-sans">{menu.cafe_profile.address}</p>
              )}
              {menu?.cafe_profile?.phone && (
                <p className="text-stone-700 font-bold">📞 {menu.cafe_profile.phone}</p>
              )}
              {menu?.cafe_profile?.fssai_lic_no && (
                <p className="text-[11px] text-stone-400 font-sans">
                  FSSAI Lic: {menu.cafe_profile.fssai_lic_no}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowStoreInfo(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-heading font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
