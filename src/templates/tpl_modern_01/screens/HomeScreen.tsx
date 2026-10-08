import React, { useState } from 'react';
import { Search, ShoppingBag, MapPin, ChevronDown, ArrowRight, Plus } from 'lucide-react';
import type { MenuItem, MenuCategory, MongoMenuDocument } from '../../../core/types/menu.types';
import type { QRBoothContext } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface HomeScreenProps {
  menu?: MongoMenuDocument | null;
  categories: MenuCategory[];
  popularItems: MenuItem[];
  booth?: QRBoothContext;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectItem: (item: MenuItem) => void;
  onOpenCart: () => void;
  cartCount: number;
}

const getCategoryIcon = (catName: string, catId: string): string => {
  const text = `${catName} ${catId}`.toLowerCase();
  if (text.includes('burger')) return '🍔';
  if (text.includes('fry') || text.includes('fries') || text.includes('appetizer') || text.includes('snack') || text.includes('starter')) return '🍟';
  if (text.includes('shake') || text.includes('smoothie')) return '🥤';
  if (text.includes('drink') || text.includes('beverage') || text.includes('cocktail') || text.includes('tea') || text.includes('coffee') || text.includes('chai') || text.includes('mojito')) return '🍹';
  if (text.includes('pizza')) return '🍕';
  if (text.includes('dessert') || text.includes('cake') || text.includes('sweet') || text.includes('ice')) return '🍰';
  if (text.includes('sandwich') || text.includes('wrap') || text.includes('roll')) return '🥪';
  if (text.includes('biryani') || text.includes('rice') || text.includes('curry') || text.includes('bowl')) return '🍲';
  return '🍽️';
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  menu,
  categories,
  popularItems,
  booth,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectItem,
  onOpenCart,
  cartCount,
}) => {
  const { formatCurrency } = useCart();
  const [logoError, setLogoError] = useState(false);

  const cafeName = menu?.cafe_profile?.name || 'FAUGET BURGER';
  const nameParts = cafeName.trim().split(' ');
  const brandFirst = nameParts[0] || 'FAUGET';
  const brandSecond = nameParts.slice(1).join(' ') || 'BURGER';
  const brandTagline = menu?.cafe_profile?.tagline || 'Good Food. Better Moods.';

  const heroSection = menu?.sections?.[0];
  const heroWords = (heroSection?.name || 'Bigger Burgers').split(' ');
  const heroLine1 = heroWords[0] || 'Bigger';
  const heroLine2 = heroWords.slice(1).join(' ') || 'Burgers';

  const heroTaglineWords = (heroSection?.tagline || 'Bolder Flavours').split(' ');
  const heroLine3 = heroTaglineWords[0] || 'Bolder';
  const heroLine4 = heroTaglineWords.slice(1).join(' ') || 'Flavours';

  const heroImage =
    popularItems[0]?.images?.[0]?.url ||
    getFoodImageFallback(popularItems[0]?.name || heroLine2, heroLine1);

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
          <div className="w-11 h-11 rounded-2xl bg-[#1C1917] text-[#F7EFE3] flex items-center justify-center font-bold text-2xl shadow-[0_6px_16px_rgba(28,25,23,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-black/30 overflow-hidden">
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
            <h1 className="font-serif font-black text-xl leading-none tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] uppercase">
              {brandFirst}
            </h1>
            <h1 className="font-serif font-black text-xl leading-none tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] uppercase">
              {brandSecond}
            </h1>
          </div>
        </div>

        {/* Top Right Cart Button with 3D Badge */}
        <button
          onClick={onOpenCart}
          className="relative p-2.5 rounded-full bg-[#FAF4EC] hover:bg-[#EFE5D8] border border-[#E8DDCF] shadow-[0_4px_10px_rgba(28,25,23,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] text-[#1C1917] transition active:scale-95"
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

      {/* Brand Tagline */}
      <p className="text-xs text-[#7E756B] font-medium mb-1.5 ml-0.5 line-clamp-1">
        {brandTagline}
      </p>

      {/* Location / Table Booth Selector */}
      <div className="flex items-center space-x-1 text-xs text-[#7E756B] mb-3 ml-0.5">
        <MapPin className="w-3.5 h-3.5 text-[#1C1917]" />
        <span className="font-semibold text-[#1C1917] line-clamp-1">
          {booth ? `${booth.booth_label}${booth.zone ? ` • ${booth.zone}` : ''}` : (menu?.cafe_profile?.address || 'Table 04 • Indoor AC')}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#7E756B]" />
      </div>

      {/* 3D Inset Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E8276]" />
        <input
          type="text"
          placeholder="Search items, drinks, snacks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#EFE5D8] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-[#8E8276] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 border border-[#E2D5C3] shadow-[inset_0_2px_4px_rgba(28,25,23,0.06),0_1px_2px_rgba(255,255,255,0.8)] transition"
        />
      </div>

      {/* Elevated 3D Hero Promo Banner Card */}
      <div className="relative bg-[#1C1917] text-white rounded-3xl p-5 mb-6 overflow-hidden shadow-[0_18px_36px_-8px_rgba(28,25,23,0.4),0_6px_12px_-2px_rgba(28,25,23,0.25)] border border-black/30">
        <div className="flex items-center justify-between">
          <div className="max-w-[150px]">
            <h2 className="font-serif font-black text-2xl leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {heroLine1}
            </h2>
            <h2 className="font-serif font-black text-2xl leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {heroLine2}
            </h2>
            <h2 className="font-serif font-black text-2xl leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {heroLine3}
            </h2>
            <h2 className="font-serif font-black text-2xl leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {heroLine4}
            </h2>
          </div>

          <div className="relative w-36 h-28 shrink-0 flex items-center justify-center">
            <img
              src={heroImage}
              alt={heroLine2}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFoodImageFallback(heroLine2, heroLine1);
              }}
              className="w-32 h-28 object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform"
            />
            {/* 3D Arrow Action */}
            <button
              onClick={() => onSelectCategory(categories[0]?.id || '')}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-[#1C1917] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.35),0_1px_3px_rgba(255,255,255,0.6)] hover:scale-110 active:scale-95 transition"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Banner Pagination Dots */}
        <div className="flex justify-center space-x-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Elevated 3D Category Circular Avatars Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {categories.slice(0, 4).map((cat) => {
          const icon = getCategoryIcon(cat.name, cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center group transition transform active:scale-95"
            >
              <div className="w-15 h-15 rounded-full bg-[#EFE5D8] group-hover:bg-[#E5DACD] border border-[#E0D2C0] flex items-center justify-center text-2xl shadow-[0_8px_18px_-3px_rgba(142,130,118,0.3),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)] mb-1.5 transition-all group-hover:shadow-[0_10px_22px_-2px_rgba(142,130,118,0.4)]">
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{icon}</span>
              </div>
              <span className="text-[11px] font-bold text-[#1C1917] text-center tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] line-clamp-1">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Popular Picks Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-black text-base tracking-tight text-[#1C1917] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            Popular Picks
          </h3>
          <button
            onClick={() => onSelectCategory(categories[0]?.id || '')}
            className="text-xs font-bold text-[#7E756B] hover:text-[#1C1917] transition flex items-center space-x-0.5"
          >
            <span>View all</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* 2 Elevated 3D Popular Pick Cards */}
        <div className="grid grid-cols-2 gap-3.5">
          {popularItems.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-[#FAF4EC] rounded-2xl p-3 border border-[#E8DDCF] shadow-[0_10px_22px_-4px_rgba(28,25,23,0.12),0_3px_8px_-2px_rgba(28,25,23,0.06),inset_0_1px_1px_rgba(255,255,255,0.8)] cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_28px_-4px_rgba(28,25,23,0.18)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-[#EFE5D8] shadow-[0_3px_8px_rgba(0,0,0,0.06)]">
                  <img
                    src={item.images?.[0]?.url || getFoodImageFallback(item.name)}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-serif font-bold text-xs text-[#1C1917] leading-snug line-clamp-1">
                  {item.name}
                </h4>
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
    </div>
  );
};
