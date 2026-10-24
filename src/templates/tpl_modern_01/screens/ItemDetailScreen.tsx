import React, { useState } from 'react';
import { ArrowLeft, Heart, Plus, Minus, Check, Flame, Clock, Star } from 'lucide-react';
import type { MenuItem, MenuItemAddon } from '../../../core/types/menu.types';
import type { SelectedAddon } from '../../../core/types/order.types';
import { useCart } from '../../../core/hooks/useCart';
import { getFoodImageFallback } from '../../../core/utils/imageFallback';

export interface ItemDetailScreenProps {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (item: MenuItem, selectedAddons: SelectedAddon[], quantity: number) => void;
}

const defaultIngredients = [
  { name: 'Beef', icon: '🥩' },
  { name: 'Cheese', icon: '🧀' },
  { name: 'Onion', icon: '🧅' },
  { name: 'Tomato', icon: '🍅' },
  { name: 'Greens', icon: '🥬' },
  { name: 'Egg', icon: '🥚' },
];

export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  item,
  onBack,
  onAddToCart,
}) => {
  const { formatCurrency } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  // Extract addons dynamically from MongoDB item document structure
  const firstAddonGroup = item.addon_groups?.[0];
  const availableAddons: MenuItemAddon[] =
    firstAddonGroup?.options || firstAddonGroup?.addons || [];

  const handleToggleAddon = (addon: MenuItemAddon) => {
    const exists = selectedAddons.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons((prev) => [
        ...prev,
        {
          id: addon.id,
          name: addon.name,
          price_paise: addon.price_paise,
          group_id: firstAddonGroup?.id || 'grp_extras',
        },
      ]);
    }
  };

  const addonTotalPaise = selectedAddons.reduce((sum, a) => sum + a.price_paise, 0);
  const totalUnitPricePaise = item.base_price_paise + addonTotalPaise;
  const grandTotalPaise = totalUnitPricePaise * quantity;

  const handleAdd = () => {
    onAddToCart(item, selectedAddons, quantity);
  };

  const imageUrl = item.images?.[0]?.url || getFoodImageFallback(item.name);
  const subLabel =
    item.short_name ||
    item.tags?.[0] ||
    (item.diet_type === 'VEG' ? 'Pure Vegetarian' : 'Chef Special');

  return (
    <div className="min-h-screen bg-[#FAF4EE] text-stone-900 font-sans flex flex-col justify-between selection:bg-[#FF385C]/20 selection:text-[#FF385C]">
      {/* Top Hero Gradient Area (Matching mockup Screen 2) */}
      <div className="relative bg-gradient-to-b from-[#FF5238] via-[#FF693C] to-[#FFA048] pt-4 pb-12 px-5 rounded-b-[40px] shadow-sm">
        {/* Top Navigation Row: Circular White Back and Heart Buttons */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-white text-stone-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            aria-label="Favorite"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                isFavorite
                  ? 'fill-[#FF385C] text-[#FF385C]'
                  : 'text-[#FF385C] stroke-[2]'
              }`}
            />
          </button>
        </div>

        {/* Large Food Image Centered in Hero Banner with Fixed Sizing & Rounded Corners */}
        <div className="w-full h-56 sm:h-64 flex items-center justify-center py-2 overflow-hidden">
          <div className="w-52 h-52 sm:w-60 sm:h-60 min-w-[13rem] min-h-[13rem] max-w-[15rem] max-h-[15rem] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/70 bg-white/20 backdrop-blur-xs flex items-center justify-center p-1 relative shrink-0">
            <img
              src={imageUrl}
              alt={item.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFoodImageFallback(item.name);
              }}
              className="w-full h-full max-w-full max-h-full object-cover rounded-[24px] hover:scale-105 transition-transform duration-300 block shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Overlapping White Bottom Sheet Card */}
      <div className="bg-white rounded-t-[36px] -mt-8 relative z-10 px-6 pt-7 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Title Row with Stepper on the Right */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-black text-2xl sm:text-3xl text-stone-900 leading-tight tracking-tight">
                {item.name}
              </h1>
              <p className="text-sm sm:text-base text-stone-400 font-semibold mt-1">
                {subLabel}
              </p>
            </div>

            {/* Stepper Pill [ - 03 + ] */}
            <div className="flex items-center space-x-3 bg-red-50/70 border border-red-200/70 rounded-full px-3.5 py-1.5 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#FF385C] hover:bg-white active:scale-90 transition"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="font-black text-sm sm:text-base text-[#FF385C] min-w-[20px] text-center">
                {String(quantity).padStart(2, '0')}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[#FF385C] hover:bg-white active:scale-90 transition"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Stats Row (Rating, Calories, Prep Time) */}
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-stone-800 bg-stone-50 border border-stone-200/60 px-3.5 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-stone-800 bg-stone-50 border border-stone-200/60 px-3.5 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-[#FF385C]" />
              <span>150 Kcal</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-stone-800 bg-stone-50 border border-stone-200/60 px-3.5 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>20-30 Min</span>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="pt-2">
            <h3 className="font-black text-base sm:text-lg text-stone-900 mb-3 tracking-tight">
              Ingredients
            </h3>
            <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-0.5">
              {defaultIngredients.map((ing) => (
                <div
                  key={ing.name}
                  className="w-13 h-13 rounded-2xl bg-[#FAF4EE] border border-stone-200/60 flex items-center justify-center text-2xl shadow-2xs hover:scale-105 transition-transform shrink-0"
                  title={ing.name}
                >
                  <span>{ing.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-2">
            <h3 className="font-black text-base sm:text-lg text-stone-900 mb-2 tracking-tight">
              Description
            </h3>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              {item.description ||
                'Crafted using 100% premium quality ingredients with delicious signature sauce, fresh crisp vegetables, secret spices, and toasted artisan buns for an unforgettable dining experience!'}
            </p>
          </div>

          {/* Optional Add-ons / Customizations */}
          {availableAddons.length > 0 && (
            <div className="pt-3 border-t border-stone-100">
              <h3 className="font-black text-base sm:text-lg text-stone-900 mb-2.5 tracking-tight">
                Add-ons & Extras
              </h3>
              <div className="space-y-2.5">
                {availableAddons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#FF385C] bg-red-50/40 text-stone-900'
                          : 'border-stone-200/70 bg-[#FAF4EE]/50 hover:bg-[#FAF4EE] text-stone-800'
                      }`}
                    >
                      <span className="text-sm font-bold">{addon.name}</span>
                      <div className="flex items-center space-x-2.5">
                        <span className="text-sm font-extrabold text-stone-700">
                          +{formatCurrency(addon.price_paise)}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#FF385C] text-white'
                              : 'border border-stone-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar: Total Price + Add to Cart Button */}
        <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Total Price
            </span>
            <span className="font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              {formatCurrency(grandTotalPaise)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 max-w-[210px] sm:max-w-[250px] py-4 px-6 bg-[#FF385C] hover:bg-[#E0294C] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;
