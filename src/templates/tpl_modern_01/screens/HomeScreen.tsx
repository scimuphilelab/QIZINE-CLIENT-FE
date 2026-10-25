import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Menu,
  Bell,
  ShoppingBag,
  Plus,
  X,
  ArrowRight,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import type { MenuItem, MenuCategory, MenuSection, MongoMenuDocument } from '../../../core/types/menu.types';
import type { QRBoothContext } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback, DEFAULT_FOOD_IMAGE } from '../../../core/utils/imageFallback';

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
  onOpenCart?: () => void;
  onOpenMenu?: () => void;
  onOpenTracker?: () => void;
  hasActiveOrder?: boolean;
  cartCount?: number;
}

const getCategoryIcon = (catName: string, catId: string): string => {
  const text = `${catName} ${catId}`.toLowerCase();
  if (text.includes('burger')) return '🍔';
  if (text.includes('chicken') || text.includes('poultry')) return '🍗';
  if (text.includes('fry') || text.includes('fries') || text.includes('appetizer') || text.includes('snack') || text.includes('starter')) return '🍟';
  if (text.includes('shake') || text.includes('smoothie')) return '🥤';
  if (text.includes('mocktail') || text.includes('cooler') || text.includes('cocktail') || text.includes('mojito')) return '🍹';
  if (text.includes('tea') || text.includes('chai') || text.includes('coffee') || text.includes('brew')) return '☕';
  if (text.includes('drink') || text.includes('beverage')) return '🥤';
  if (text.includes('pizza')) return '🍕';
  if (text.includes('dessert') || text.includes('cake') || text.includes('sweet') || text.includes('ice') || text.includes('treat')) return '🍦';
  if (text.includes('salad') || text.includes('green') || text.includes('healthy')) return '🥗';
  if (text.includes('sandwich') || text.includes('wrap') || text.includes('roll')) return '🥪';
  if (text.includes('biryani') || text.includes('rice') || text.includes('curry') || text.includes('bowl') || text.includes('meal')) return '🍲';
  return '🍽️';
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  menu,
  sections = [],
  allCategories,
  popularItems = [],
  booth,
  searchQuery,
  onSearchChange,
  onSelectItem,
  onOpenMenu,
  onOpenCart,
  onOpenTracker,
  hasActiveOrder = false,
  cartCount = 0,
}) => {
  const { addItem, formatCurrency } = useCart();
  const [logoError, setLogoError] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);
  const [failedCatImages, setFailedCatImages] = useState<Record<string, boolean>>({});

  // Dynamic Cafe Profile
  const cafeName = menu?.cafe_profile?.name || booth?.vendor_name || 'Qizine Dining';
  const tableLocation = booth
    ? `${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}`
    : (menu?.cafe_profile?.address || '');

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVarId =
      item.variants && item.variants.length > 0
        ? item.variants.find((v) => v.is_default)?.id || item.variants[0].id
        : undefined;
    addItem(item, defaultVarId);
  };

  // Categories list with dynamic icon or dish image
  const displayCategories = useMemo(() => {
    return [
      { id: 'all', name: 'All', icon: '🍽️' },
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
    <div className="flex-1 bg-[#FAF9F7] text-stone-900 pb-28 font-sans px-4 sm:px-6 pt-5 transition-colors">
      {/* 1. Header (Matching Chick-fil-A reference style) */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* Left: Squircle Hamburger Menu Button */}
        <button
          onClick={() => setShowVendorModal(true)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-stone-200/60 shadow-xs flex items-center justify-center text-stone-800 hover:text-[#C0192A] active:scale-95 transition-all shrink-0 cursor-pointer"
          aria-label="Restaurant Profile"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Center: Greeting & Stylized Cafe Brand Name */}
        <button
          onClick={() => setShowVendorModal(true)}
          className="flex flex-col items-center justify-center text-center px-1 flex-1 min-w-0 cursor-pointer group"
        >
          <div className="text-[11px] sm:text-xs font-semibold text-stone-500 flex items-center gap-1">
            <span>{booth?.booth_label ? `Table ${booth.booth_label}` : 'Welcome'}</span>
            <span>👋</span>
          </div>

          <div className="flex items-center justify-center gap-1 mt-0.5 max-w-full">
            <span className="font-serif font-black text-xl sm:text-2xl text-[#C0192A] tracking-tight italic leading-tight">
              {cafeName}
            </span>
          </div>

          {menu?.cafe_profile?.tagline && (
            <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium tracking-tight line-clamp-1">
              {menu.cafe_profile.tagline}
            </div>
          )}
        </button>

        {/* Right: Notifications Bell + Cart Bag Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Button */}
          <button
            onClick={onOpenTracker}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-stone-200/60 shadow-xs flex items-center justify-center text-stone-800 hover:text-[#C0192A] active:scale-95 transition-all cursor-pointer"
            aria-label="Active Orders"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {hasActiveOrder && (
              <span className="absolute -top-1 -right-1 bg-[#C0192A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                1
              </span>
            )}
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={onOpenCart}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border border-stone-200/60 shadow-xs flex items-center justify-center text-stone-800 hover:text-[#C0192A] active:scale-95 transition-all cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C0192A] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Search Input Bar with Filter Button (Matching reference) */}
      <div className="relative mb-5 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search your favorite meal..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white rounded-2xl pl-11 pr-10 py-3.5 text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C0192A]/20 border border-stone-200/60 shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
        <button
          onClick={onOpenMenu}
          className="w-12 h-12 rounded-2xl bg-white border border-stone-200/60 shadow-xs flex items-center justify-center text-stone-700 hover:text-[#C0192A] hover:border-[#C0192A]/40 active:scale-95 transition-all shrink-0 cursor-pointer"
          aria-label="Filters & Menu"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* 3. Hero Promo Banner: Dynamic Cafe Highlight */}
      {!isSearching && (
        <div className="relative bg-[#FBF4EE] rounded-[32px] p-5 sm:p-6 mb-6 overflow-hidden shadow-xs flex items-center justify-between border border-[#F3E7DC]">
          <div className="max-w-[170px] sm:max-w-[210px] z-10">
            {sections.length > 0 && (
              <span className="inline-block bg-[#FDE2D8] text-[#C0192A] text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2.5 truncate max-w-full">
                {sections[0].name}
              </span>
            )}
            <h2 className="font-extrabold text-2xl sm:text-3xl text-stone-900 leading-tight tracking-tight line-clamp-2">
              {cafeName}
            </h2>
            {menu?.cafe_profile?.tagline && (
              <p className="text-[11px] sm:text-xs text-stone-600 font-medium leading-relaxed my-2 line-clamp-2">
                {menu.cafe_profile.tagline}
              </p>
            )}
            <button
              onClick={onOpenMenu}
              className="bg-[#C0192A] hover:bg-[#A31423] text-white text-xs sm:text-sm font-bold pl-4 pr-1.5 py-1.5 rounded-full shadow-md shadow-red-600/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer mt-1"
            >
              <span>Explore Menu</span>
              <span className="w-6 h-6 rounded-full bg-white text-[#C0192A] flex items-center justify-center font-bold">
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </button>
          </div>

          {/* Right Image Graphic (from backend popular item or cafe cover) */}
          {(popularItems[0]?.images?.[0]?.url || menu?.cafe_profile?.cover_url || menu?.cafe_profile?.logo_url) && (
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 flex items-center justify-end overflow-hidden rounded-2xl">
              <img
                src={popularItems[0]?.images?.[0]?.url || menu?.cafe_profile?.cover_url || menu?.cafe_profile?.logo_url}
                alt={popularItems[0]?.name || cafeName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full max-w-full max-h-full object-cover rounded-2xl drop-shadow-xl hover:scale-105 transition-transform duration-300 block shrink-0"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. Circular Categories Row (Exact match to Chick-fil-A reference) */}
      {!isSearching && (
        <div className="mb-6">
          <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1 px-1">
            {displayCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              const catObj = allCategories.find((c) => c.id === cat.id);
              const foundImg = catObj?.items?.find((i) => i.images && i.images.length > 0 && i.images[0]?.url)?.images?.[0]?.url;
              const catItemImg =
                cat.id !== 'all'
                  ? foundImg
                  : menu?.cafe_profile?.logo_url && !logoError
                    ? menu.cafe_profile.logo_url
                    : null;
              const hasValidImg = catItemImg && !failedCatImages[cat.id];

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className="flex flex-col items-center justify-start group cursor-pointer shrink-0 active:scale-95 transition-transform"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-1 transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? 'border-2 border-[#C0192A] bg-white shadow-sm ring-4 ring-[#C0192A]/10 scale-105'
                        : 'border border-stone-200/70 bg-[#F8F4EE] hover:border-stone-300 shadow-2xs'
                    }`}
                  >
                    {hasValidImg ? (
                      <img
                        src={catItemImg}
                        alt={cat.name}
                        onError={() => {
                          setFailedCatImages((prev) => ({ ...prev, [cat.id]: true }));
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl select-none">{cat.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold mt-2 text-center whitespace-nowrap px-1 transition-colors ${
                      isSelected ? 'text-[#C0192A]' : 'text-stone-700 group-hover:text-stone-900'
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

      {/* 5. "Popular Picks" Horizontal Scroll Carousel */}
      {!isSearching && selectedCatId === 'all' && popularItems.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
              Popular Picks
            </h3>
            <button
              onClick={onOpenMenu}
              className="text-xs sm:text-sm font-bold text-[#C0192A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex items-stretch gap-3.5 overflow-x-auto no-scrollbar py-2 px-1">
            {popularItems.map((item) => {
              const imageUrl = item.images?.[0]?.url || getFoodImageFallback(item.name);
              const tagLabel = item.tags && item.tags.length > 0 ? item.tags[0] : (item.diet_type === 'VEG' ? 'VEG' : undefined);

              return (
                <div
                  key={`pop-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="w-48 sm:w-52 shrink-0 bg-white rounded-3xl p-3.5 sm:p-4 border border-stone-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group active:scale-[0.98]"
                >
                  {/* Top Badge (Only if real tag or diet exists) */}
                  <div className="flex items-center justify-start min-h-[22px] mb-1">
                    {tagLabel ? (
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#C0192A] border border-red-200">
                        {tagLabel}
                      </span>
                    ) : null}
                  </div>

                  {/* Centered Food Image with Rounded Border Radius */}
                  <div className="w-full h-28 sm:h-32 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center my-2 p-1 relative shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                      }}
                      className="w-full h-full max-w-full max-h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 block drop-shadow-xs shrink-0"
                    />
                  </div>

                  {/* Food Details */}
                  <div className="mt-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      {(item.description || item.short_name) && (
                        <p className="text-[11px] text-stone-400 font-normal line-clamp-1 mt-0.5">
                          {item.description || item.short_name}
                        </p>
                      )}
                    </div>
                    {item.prep_time_minutes ? (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{item.prep_time_minutes} mins</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                    <span className="font-black text-sm sm:text-base text-stone-900">
                      {formatCurrency(item.base_price_paise)}
                    </span>
                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="w-8 h-8 rounded-full bg-[#C0192A] hover:bg-[#A31423] text-white flex items-center justify-center shadow-md shadow-red-600/20 active:scale-90 transition-transform cursor-pointer"
                      aria-label="Add item"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. All Food Menu Items Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h3 className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
            {isSearching
              ? `Results for "${searchQuery}" (${filteredItems.length})`
              : selectedCatId === 'all'
                ? 'All Menu Items'
                : displayCategories.find((c) => c.id === selectedCatId)?.name || 'Menu Items'}
          </h3>
          {!isSearching && selectedCatId !== 'all' && (
            <button
              onClick={() => setSelectedCatId('all')}
              className="text-xs sm:text-sm font-bold text-[#C0192A] hover:underline cursor-pointer"
            >
              Show all
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/70 shadow-xs">
            <span className="text-4xl mb-2 inline-block">🔍</span>
            <p className="text-base font-extrabold text-stone-800">No items found</p>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Try searching with another keyword or explore other categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const imageUrl = item.images?.[0]?.url || getFoodImageFallback(item.name);
              const tagLabel =
                item.tags && item.tags.length > 0
                  ? item.tags[0]
                  : item.diet_type === 'VEG'
                  ? 'VEG'
                  : undefined;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white rounded-3xl p-3 sm:p-3.5 border border-stone-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group active:scale-[0.98]"
                >
                  {/* Top Badge (Only if real tag or diet exists) */}
                  <div className="flex items-center justify-start min-h-[20px] mb-1">
                    {tagLabel ? (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#C0192A] border border-red-200">
                        {tagLabel}
                      </span>
                    ) : null}
                  </div>

                  {/* Centered Food Image with Fixed Sizing & Rounded Border Radius */}
                  <div className="w-full h-28 sm:h-32 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center my-1.5 p-1 relative shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                      }}
                      className="w-full h-full max-w-full max-h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 block drop-shadow-xs shrink-0"
                    />
                  </div>

                  {/* Food Name & Subtitle */}
                  <div className="mt-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      {(item.description || item.short_name) && (
                        <p className="text-[11px] text-stone-400 font-normal line-clamp-1 mt-0.5">
                          {item.description || item.short_name}
                        </p>
                      )}
                    </div>
                    {item.prep_time_minutes ? (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{item.prep_time_minutes} mins</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Price & Red Circular Plus Button */}
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-100">
                    <span className="font-black text-sm sm:text-base text-stone-900">
                      {formatCurrency(item.base_price_paise)}
                    </span>

                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="w-8 h-8 rounded-full bg-[#C0192A] hover:bg-[#A31423] text-white flex items-center justify-center shadow-md shadow-red-600/20 active:scale-90 transition-transform cursor-pointer"
                      aria-label="Add item"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
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
            <Store className="w-3.5 h-3.5 text-[#C0192A]" />
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
            <div className="relative h-32 sm:h-36 bg-gradient-to-br from-[#E02438] via-[#C0192A] to-[#8C101D] p-4 flex items-start justify-between text-white shrink-0">
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
                className="z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
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
                    <Store className="w-8 h-8 text-[#C0192A]" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <h3 className="font-serif font-black text-2xl text-[#C0192A] italic leading-tight">
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
                <div className="bg-[#FAF9F7] rounded-2xl p-3 border border-stone-200/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Status</p>
                    <p className="text-xs font-black text-emerald-700">Kitchen Active</p>
                  </div>
                </div>

                <div className="bg-[#FAF9F7] rounded-2xl p-3 border border-stone-200/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#C0192A] flex items-center justify-center shrink-0">
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
                className="w-full bg-[#C0192A] hover:bg-[#A31423] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-red-600/25 active:scale-98 transition-all cursor-pointer"
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
