import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Heart, Plus, X, Info, MapPin, Phone, ShieldCheck, Clock, Store } from 'lucide-react';
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
  allCategories,
  booth,
  searchQuery,
  onSearchChange,
  onSelectItem,
  onOpenMenu,
}) => {
  const { addItem, formatCurrency } = useCart();
  const [logoError, setLogoError] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Dining';
  const tableLocation = booth
    ? `${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}`
    : (menu?.cafe_profile?.address || 'Table T-1 • Main Dining Hall');

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.addon_groups && item.addon_groups.length > 0) {
      onSelectItem(item);
    } else {
      addItem(item);
    }
  };

  // Build unified categories list with "All" first
  const displayCategories = useMemo(() => {
    return [
      { id: 'all', name: 'All', icon: '✨' },
      ...allCategories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: getCategoryIcon(c.name, c.id),
      })),
    ];
  }, [allCategories]);

  // Flatten items for active category filter or search
  const isSearching = searchQuery.trim().length > 0;
  const filteredItems = useMemo(() => {
    let items = allCategories.flatMap((c) => c.items);
    
    // Deduplicate items by ID if present across categories
    const seen = new Set<string>();
    items = items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.short_name && item.short_name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (selectedCatId !== 'all') {
      const activeCat = allCategories.find((c) => c.id === selectedCatId);
      return activeCat ? activeCat.items : items;
    }

    return items;
  }, [allCategories, selectedCatId, searchQuery, isSearching]);

  return (
    <div className="flex-1 bg-[#FAF4EE] text-stone-900 pb-28 font-sans px-4 sm:px-6 pt-5 transition-colors">
      {/* Top Bar: Cafe Avatar/Logo, Vendor Name & Location, Search Button */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: Cafe Avatar / Logo (Clickable to open Vendor details) */}
        <button
          onClick={() => setShowVendorModal(true)}
          className="relative w-12 h-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] rounded-2xl bg-white border border-stone-200/80 p-1 shadow-sm overflow-hidden flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          aria-label="View Restaurant Info"
        >
          {menu?.cafe_profile?.logo_url && !logoError ? (
            <img
              src={menu.cafe_profile.logo_url}
              alt={cafeName}
              onError={() => setLogoError(true)}
              className="w-full h-full max-w-full max-h-full object-cover rounded-xl block shrink-0"
            />
          ) : (
            <span className="text-2xl">🍔</span>
          )}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
        </button>

        {/* Center: Vendor Name + Location */}
        <button
          onClick={() => setShowVendorModal(true)}
          className="flex flex-col items-center justify-center text-center cursor-pointer group px-2 max-w-[210px] sm:max-w-[260px]"
        >
          <div className="text-base sm:text-lg font-black text-stone-900 tracking-tight group-hover:text-[#FF385C] transition-colors truncate max-w-full">
            {cafeName}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-500 mt-0.5">
            <span className="text-[#FF385C]">📍</span>
            <span className="truncate max-w-[160px] sm:max-w-[200px]">{tableLocation}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition" />
          </div>
        </button>

        {/* Right: Circular Search Trigger Button */}
        <button
          onClick={() => setShowSearchInput(!showSearchInput)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            showSearchInput
              ? 'bg-[#FF385C] text-white shadow-md shadow-red-500/25'
              : 'bg-white text-stone-800 border border-stone-200/80 shadow-sm hover:shadow-md active:scale-95'
          }`}
          aria-label="Toggle Search"
        >
          {showSearchInput ? (
            <X className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Search className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Expandable Search Input */}
      {showSearchInput && (
        <div className="relative mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search delicious burgers, sides, drinks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white rounded-2xl pl-12 pr-12 py-3 text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30 border border-stone-200/80 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-3 text-xs sm:text-sm font-bold text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Promo Banner Card (Exact match to provided design template) */}
      {!isSearching && (
        <div className="relative bg-[#FEE8DC] rounded-3xl p-5 sm:p-6 mb-6 overflow-hidden shadow-sm flex items-center justify-between border border-[#FCD8C4]/70">
          <div className="max-w-[170px] sm:max-w-[210px] z-10">
            <h2 className="font-black text-xl sm:text-2xl text-stone-900 leading-tight tracking-tight">
              Free Home
            </h2>
            <h3 className="font-black text-xl sm:text-2xl text-[#FF385C] leading-tight tracking-tight mb-3.5">
              Delivery Service
            </h3>
            <button
              onClick={onOpenMenu}
              className="bg-[#FF385C] hover:bg-[#E0294C] text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-2xl shadow-md shadow-red-500/25 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              Order Now
            </button>
          </div>

          {/* Right Image Graphic - Fixed Boundaries */}
          <div className="relative w-32 h-28 sm:w-36 sm:h-32 min-w-[7rem] max-w-[9rem] shrink-0 flex items-center justify-end overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80"
              alt="Delicious Burger Delivery"
              className="w-28 h-28 sm:w-32 sm:h-32 max-w-full max-h-full object-cover rounded-2xl drop-shadow-xl hover:scale-105 transition-transform duration-300 block shrink-0"
            />
          </div>
        </div>
      )}

      {/* Horizontal Category Cards (Active = Red pill, Inactive = White pill) */}
      {!isSearching && (
        <div className="mb-6">
          <div className="flex items-center space-x-3.5 overflow-x-auto no-scrollbar py-1 px-0.5">
            {displayCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex flex-col items-center justify-between min-w-[84px] px-3.5 py-3.5 rounded-2xl transition-all duration-200 transform active:scale-95 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#FF385C] text-white shadow-lg shadow-red-500/25 scale-[1.02]'
                      : 'bg-white text-stone-700 border border-stone-200/60 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      isSelected
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'bg-[#FAF4EE] text-stone-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-extrabold mt-2 text-center whitespace-nowrap px-1 ${
                      isSelected ? 'text-white' : 'text-stone-800'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Food Products Grid (2 Columns, matching mockup) */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-0.5">
          <h3 className="font-black text-lg sm:text-xl text-stone-900 tracking-tight">
            {isSearching
              ? `Results for "${searchQuery}" (${filteredItems.length})`
              : selectedCatId === 'all'
              ? 'Popular Food Menu'
              : displayCategories.find((c) => c.id === selectedCatId)?.name || 'Food Menu'}
          </h3>
          {!isSearching && (
            <button
              onClick={onOpenMenu}
              className="text-xs sm:text-sm font-bold text-[#FF385C] hover:underline"
            >
              See all
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 shadow-sm">
            <span className="text-4xl mb-2 inline-block">🔍</span>
            <p className="text-base font-extrabold text-stone-800">No items found</p>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Try searching with another keyword or explore all categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5">
            {filteredItems.map((item) => {
              const isFav = !!favorites[item.id];
              const imageUrl =
                item.images?.[0]?.url || getFoodImageFallback(item.name);
              const subLabel =
                item.short_name ||
                item.tags?.[0] ||
                (item.diet_type === 'VEG' ? 'Vegetarian' : 'Chef Special');

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.98]"
                >
                  {/* Top Row: Rating Badge & Heart Favorite Button */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-stone-800 bg-stone-50 px-2 py-0.5 rounded-full">
                      <span className="text-amber-500">★</span>
                      <span>4.9</span>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="p-1 rounded-full text-stone-400 hover:text-[#FF385C] transition-colors"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${
                          isFav
                            ? 'fill-[#FF385C] text-[#FF385C]'
                            : 'text-stone-300 stroke-[2]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Centered Food Image with Fixed Sizing & Rounded Corners */}
                  <div className="w-full h-28 sm:h-32 max-h-32 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center my-1.5 p-1 shadow-2xs relative shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          getFoodImageFallback(item.name);
                      }}
                      className="w-full h-full max-w-full max-h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-sm block shrink-0"
                    />
                  </div>

                  {/* Food Name & Subtitle */}
                  <div className="mt-1 flex-1 flex flex-col justify-between">
                    <h4 className="font-extrabold text-sm sm:text-base text-stone-900 leading-snug line-clamp-2 min-h-[2.4rem] flex items-center">
                      {item.name}
                    </h4>
                    <p className="text-xs text-stone-400 font-medium truncate mt-0.5">
                      {subLabel}
                    </p>
                  </div>

                  {/* Price & Red Circular Plus Button */}
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-100">
                    <span className="font-black text-sm sm:text-base text-stone-900">
                      {formatCurrency(item.base_price_paise)}
                    </span>

                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FF385C] hover:bg-[#E0294C] text-white flex items-center justify-center shadow-md shadow-red-500/25 hover:scale-110 active:scale-95 transition-all"
                      aria-label="Add item"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Restaurant Compliance & Info Footer */}
        <div className="mt-10 pt-6 border-t border-stone-200/80 text-center space-y-2 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-700">
            <Store className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>{cafeName}</span>
          </div>
          {menu?.cafe_profile?.tagline && (
            <p className="text-[11px] text-stone-500 italic max-w-xs mx-auto">
              "{menu.cafe_profile.tagline}"
            </p>
          )}
          {menu?.cafe_profile?.address && (
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span>{menu.cafe_profile.address}</span>
            </p>
          )}
          {menu?.cafe_profile?.fssai_lic_no && (
            <div className="inline-flex items-center gap-1.5 bg-white border border-stone-200/80 rounded-full px-3 py-1 shadow-2xs text-[10px] text-stone-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>FSSAI Lic. No. <strong>{menu.cafe_profile.fssai_lic_no}</strong></span>
            </div>
          )}
          <p className="text-[10px] text-stone-400 pt-2">
            Powered by <span className="font-bold text-stone-600">Qizine</span> • Digital Dining Experience
          </p>
        </div>
      </div>

      {/* Vendor Details & Regulatory Sheet / Modal */}
      {showVendorModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowVendorModal(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-stone-200/80 animate-in slide-in-from-bottom-6 duration-300 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div className="relative h-32 sm:h-36 bg-gradient-to-br from-[#FF512F] via-[#FF385C] to-[#DD2476] p-4 flex items-start justify-between text-white shrink-0">
              {menu?.cafe_profile?.cover_url && (
                <img
                  src={menu.cafe_profile.cover_url}
                  alt={cafeName}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                />
              )}
              <div className="z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider border border-white/20">
                  Restaurant Profile
                </span>
              </div>
              <button
                onClick={() => setShowVendorModal(false)}
                className="z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-5 -mt-10 z-20">
              {/* Logo + Name Header */}
              <div className="flex items-end gap-3.5">
                <div className="w-20 h-20 min-w-[5rem] min-h-[5rem] max-w-[5rem] max-h-[5rem] rounded-2xl bg-white border-2 border-white shadow-xl p-1.5 shrink-0 overflow-hidden flex items-center justify-center relative">
                  {menu?.cafe_profile?.logo_url && !logoError ? (
                    <img
                      src={menu.cafe_profile.logo_url}
                      alt={cafeName}
                      className="w-full h-full max-w-full max-h-full object-cover rounded-xl block shrink-0"
                    />
                  ) : (
                    <span className="text-3xl">🍔</span>
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <h3 className="font-black text-xl text-stone-900 leading-tight">
                    {cafeName}
                  </h3>
                  {menu?.cafe_profile?.tagline && (
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {menu.cafe_profile.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Status & Dining Badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#FAF4EE] rounded-2xl p-3 border border-stone-200/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Status</p>
                    <p className="text-xs font-black text-emerald-700">Kitchen Active</p>
                  </div>
                </div>

                <div className="bg-[#FAF4EE] rounded-2xl p-3 border border-stone-200/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#FF385C] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Your Table</p>
                    <p className="text-xs font-black text-stone-900 truncate">{tableLocation}</p>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/60 space-y-3">
                {/* Physical Address */}
                {menu?.cafe_profile?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-800">Address</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {menu.cafe_profile.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone Contact */}
                {menu?.cafe_profile?.phone && (
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-200/60">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-stone-800">Contact Helpdesk</p>
                        <p className="text-xs text-stone-500">{menu.cafe_profile.phone}</p>
                      </div>
                      <a
                        href={`tel:${menu.cafe_profile.phone}`}
                        className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                )}

                {/* FSSAI License */}
                {menu?.cafe_profile?.fssai_lic_no && (
                  <div className="flex items-start gap-3 pt-2 border-t border-stone-200/60">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800">Food Safety & Quality</p>
                      <p className="text-xs text-stone-600 font-mono mt-0.5">
                        FSSAI License: <strong>{menu.cafe_profile.fssai_lic_no}</strong>
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Certified hygienic preparation under government food standards
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => setShowVendorModal(false)}
                className="w-full bg-[#FF385C] hover:bg-[#E0294C] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-red-500/25 active:scale-98 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
