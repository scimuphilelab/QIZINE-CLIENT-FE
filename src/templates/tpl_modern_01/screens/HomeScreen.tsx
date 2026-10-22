import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, MapPin, ChevronDown, ArrowRight, Plus, Utensils, Sparkles } from 'lucide-react';
import type { MenuItem, MenuCategory, MenuSection, MongoMenuDocument } from '../../../core/types/menu.types';
import type { QRBoothContext } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface HomeScreenProps {
  menu?: MongoMenuDocument | null;
  sections: MenuSection[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  categories: MenuCategory[];
  allCategories: MenuCategory[];
  popularItems: MenuItem[];
  booth?: QRBoothContext;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectItem: (item: MenuItem) => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  cartCount: number;
}

const getCategoryIcon = (catName: string, catId: string): string => {
  const text = `${catName} ${catId}`.toLowerCase();
  if (text.includes('burger')) return '🍔';
  if (text.includes('fry') || text.includes('fries') || text.includes('appetizer') || text.includes('snack') || text.includes('starter')) return '🍟';
  if (text.includes('shake') || text.includes('smoothie')) return '🥤';
  if (text.includes('mocktail') || text.includes('cooler') || text.includes('cocktail') || text.includes('mojito')) return '🍹';
  if (text.includes('tea') || text.includes('chai') || text.includes('coffee') || text.includes('brew')) return '☕';
  if (text.includes('drink') || text.includes('beverage')) return '🥤';
  if (text.includes('pizza')) return '🍕';
  if (text.includes('dessert') || text.includes('cake') || text.includes('sweet') || text.includes('ice')) return '🍰';
  if (text.includes('sandwich') || text.includes('wrap') || text.includes('roll')) return '🥪';
  if (text.includes('biryani') || text.includes('rice') || text.includes('curry') || text.includes('bowl')) return '🍲';
  return '🍽️';
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  menu,
  sections,
  selectedSectionId,
  onSelectSection,
  categories,
  allCategories,
  popularItems,
  booth,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectItem,
  onOpenCart,
  onOpenMenu,
  cartCount,
}) => {
  const { formatCurrency } = useCart();
  const [logoError, setLogoError] = useState(false);

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Dining';
  const brandTagline = menu?.cafe_profile?.tagline || 'Good Food. Better Moods.';
  const tableLocation = booth
    ? `${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}`
    : (menu?.cafe_profile?.address || 'Table 04 • Indoor Dining');

  // Active or Featured Section for Hero Banner
  const activeSection = useMemo(() => {
    if (selectedSectionId && selectedSectionId !== 'ALL') {
      return sections.find((s) => s.id === selectedSectionId) || sections[0];
    }
    return sections[0];
  }, [sections, selectedSectionId]);

  const heroTitle = activeSection?.name || 'Chef Specials';
  const heroTagline = activeSection?.tagline || 'Handcrafted recipes made with royal spices & fresh ingredients';
  const heroImage =
    activeSection?.categories?.[0]?.items?.[0]?.images?.[0]?.url ||
    popularItems[0]?.images?.[0]?.url ||
    getFoodImageFallback(heroTitle);

  // Search filter results if user is actively searching
  const isSearching = searchQuery.trim().length > 0;
  const searchResults: MenuItem[] = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    const all = allCategories.flatMap((c) => c.items);
    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.short_name && item.short_name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [allCategories, searchQuery, isSearching]);

  return (
    <div className="min-h-screen bg-[#F7EFE3] text-[#1C1917] pb-28 font-sans px-5 pt-3 max-w-md mx-auto">
      {/* iOS Top Status Placeholder */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-[#1C1917] px-1 mb-3 opacity-90">
        <span>9:41</span>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px]">●●●</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* Top Header Row: Logo & Brand + Cart Icon */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center space-x-2.5">
          {/* Retro 3D Logo Badge */}
          <div className="w-11 h-11 rounded-2xl bg-[#1C1917] text-[#F7EFE3] flex items-center justify-center font-bold text-2xl shadow-[0_6px_16px_rgba(28,25,23,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-black/30 overflow-hidden shrink-0">
            {menu?.cafe_profile?.logo_url && !logoError ? (
              <img
                src={menu.cafe_profile.logo_url}
                alt={cafeName}
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>☕</span>
            )}
          </div>
          <div>
            <h1 className="font-serif font-black text-lg leading-tight tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] line-clamp-1">
              {cafeName}
            </h1>
            <p className="text-[11px] text-[#7E756B] font-medium line-clamp-1">
              {brandTagline}
            </p>
          </div>
        </div>

        {/* Top Right Cart Button with 3D Badge */}
        <button
          onClick={onOpenCart}
          className="relative p-2.5 rounded-full bg-[#FAF4EC] hover:bg-[#EFE5D8] border border-[#E8DDCF] shadow-[0_4px_10px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] text-[#1C1917] transition active:scale-95 shrink-0"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#1C1917] text-[#F7EFE3] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(28,25,23,0.4)] border border-[#F7EFE3]">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Location / Table Booth Selector */}
      <div className="flex items-center space-x-1 text-xs text-[#7E756B] mb-3 ml-0.5">
        <MapPin className="w-3.5 h-3.5 text-[#1C1917]" />
        <span className="font-semibold text-[#1C1917] line-clamp-1">
          {tableLocation}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#7E756B]" />
      </div>

      {/* 3D Inset Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E8276]" />
        <input
          type="text"
          placeholder="Search items, drinks, snacks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#EFE5D8] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-[#8E8276] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 border border-[#E2D5C3] shadow-[inset_0_2px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(255,255,255,0.8)] transition"
        />
        {isSearching && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-xs font-bold text-[#8E8276] hover:text-[#1C1917]"
          >
            Clear
          </button>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {isSearching && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-black text-sm text-[#1C1917]">
              Search Results ({searchResults.length})
            </h3>
          </div>
          {searchResults.length === 0 ? (
            <div className="bg-[#FAF4EC] rounded-2xl p-6 text-center border border-[#E8DDCF]">
              <p className="text-xs text-[#7E756B]">No dishes or beverages match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_6px_16px_rgba(28,25,23,0.08)] flex items-center justify-between gap-3 cursor-pointer hover:-translate-y-0.5 transition"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#EFE5D8]">
                    <img
                      src={item.images?.[0]?.url || getFoodImageFallback(item.name)}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-[#1C1917] truncate">{item.name}</h4>
                    <p className="text-[10px] text-[#7E756B] line-clamp-1">{item.description}</p>
                    <p className="font-serif font-bold text-xs text-[#1C1917] mt-1">{formatCurrency(item.base_price_paise)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className="w-7 h-7 rounded-full bg-[#1C1917] text-white flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(28,25,23,0.3)] hover:scale-110 active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Elevated 3D Hero Promo Banner Card */}
      {!isSearching && (
        <div className="relative bg-[#1C1917] text-white rounded-3xl p-5 mb-5 overflow-hidden shadow-[0_18px_36px_-8px_rgba(28,25,23,0.4),0_6px_12px_-2px_rgba(28,25,23,0.25)] border border-black/30">
          <div className="flex items-center justify-between">
            <div className="max-w-[170px]">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full mb-1.5 border border-amber-400/20">
                <Sparkles className="w-2.5 h-2.5" />
                Featured Menu
              </span>
              <h2 className="font-serif font-black text-xl leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] line-clamp-2">
                {heroTitle}
              </h2>
              <p className="text-[11px] text-[#C4B5A5] mt-1 line-clamp-2 leading-snug">
                {heroTagline}
              </p>
            </div>

            <div className="relative w-32 h-28 shrink-0 flex items-center justify-center">
              <img
                src={heroImage}
                alt={heroTitle}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFoodImageFallback(heroTitle);
                }}
                className="w-28 h-26 object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform"
              />
              {/* 3D Arrow Action */}
              <button
                onClick={onOpenMenu}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-[#1C1917] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35),0_1px_3px_rgba(255,255,255,0.6)] hover:scale-110 active:scale-95 transition"
                title="View Full Menu"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Section / Menu Switcher Tabs */}
      {!isSearching && sections.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E756B]">
              Menus & Sections
            </span>
            <button
              onClick={onOpenMenu}
              className="text-xs font-bold text-[#1C1917] hover:underline flex items-center gap-0.5"
            >
              <span>Full Menu</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => onSelectSection('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all transform active:scale-95 ${
                selectedSectionId === 'ALL'
                  ? 'bg-[#1C1917] text-[#F7EFE3] shadow-[0_4px_12px_rgba(28,25,23,0.3)] border border-black/30'
                  : 'bg-[#FAF4EC] text-[#1C1917] hover:bg-[#EFE5D8] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(142,130,118,0.15)]'
              }`}
            >
              ✨ All Menus ({allCategories.length})
            </button>

            {sections.map((sec) => {
              const isSelected = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all transform active:scale-95 ${
                    isSelected
                      ? 'bg-[#1C1917] text-[#F7EFE3] shadow-[0_4px_12px_rgba(28,25,23,0.3)] border border-black/30'
                      : 'bg-[#FAF4EC] text-[#1C1917] hover:bg-[#EFE5D8] border border-[#E8DDCF] shadow-[0_2px_6px_rgba(142,130,118,0.15)]'
                  }`}
                >
                  📁 {sec.name} ({sec.categories.length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Elevated 3D Category Circular Avatars Row */}
      {!isSearching && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7E756B]">
              Categories ({categories.length})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => {
              const icon = getCategoryIcon(cat.name, cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="flex flex-col items-center group transition transform active:scale-95 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#EFE5D8] group-hover:bg-[#E5DACD] border border-[#E0D2C0] flex items-center justify-center text-2xl shadow-[0_8px_18px_-3px_rgba(142,130,118,0.3),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] mb-1.5 transition-all group-hover:shadow-[0_10px_22px_-2px_rgba(142,130,118,0.4)]">
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1C1917] tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Picks Section */}
      {!isSearching && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-black text-base tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              Popular Picks
            </h3>
            <button
              onClick={onOpenMenu}
              className="text-xs font-bold text-[#7E756B] hover:text-[#1C1917] transition flex items-center space-x-0.5"
            >
              <span>View all</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Elevated 3D Popular Pick Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {popularItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_10px_22px_-4px_rgba(28,25,23,0.12),0_3px_8px_-2px_rgba(28,25,23,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_28px_-4px_rgba(28,25,23,0.18)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-[#EFE5D8] shadow-[0_3px_8px_rgba(0,0,0,0.06)] relative">
                    <img
                      src={item.images?.[0]?.url || getFoodImageFallback(item.name)}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                      }}
                      className="w-full h-full object-cover"
                    />
                    {/* Diet flag badge */}
                    <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-sm shadow-xs border border-black/10">
                      <div className={`w-2 h-2 rounded-full ${item.diet_type === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    </div>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-[#1C1917] leading-snug line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-[#7E756B] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E8DDCF]/60">
                  <span className="font-serif font-bold text-xs text-[#1C1917]">
                    {formatCurrency(item.base_price_paise)}
                  </span>
                  {/* 3D Round + Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    className="w-7 h-7 rounded-full bg-[#1C1917] text-white flex items-center justify-center shadow-[0_4px_10px_rgba(28,25,23,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 active:shadow-[0_2px_4px_rgba(28,25,23,0.3)] transition"
                    aria-label="Add item"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
