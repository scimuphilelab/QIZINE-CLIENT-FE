import React from 'react';
import { Home, ShoppingBag, Heart, Bell } from 'lucide-react';

export type NavTab = 'home' | 'menu' | 'cart' | 'profile';

export interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
}) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-6 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-full py-2.5 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-stone-200/60 flex items-center justify-between transition-all">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`p-2 rounded-full transition-all transform active:scale-90 ${
            activeTab === 'home'
              ? 'text-[#FF385C]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          aria-label="Home"
        >
          <Home
            className={`w-5 h-5 ${
              activeTab === 'home' ? 'fill-[#FF385C] stroke-[#FF385C]' : 'stroke-[2]'
            }`}
          />
        </button>

        {/* Cart Tab with Badge */}
        <button
          onClick={() => onTabChange('cart')}
          className={`relative p-2 rounded-full transition-all transform active:scale-90 ${
            activeTab === 'cart'
              ? 'text-[#FF385C]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          aria-label="Cart"
        >
          <ShoppingBag
            className={`w-5 h-5 ${
              activeTab === 'cart' ? 'fill-[#FF385C] stroke-[#FF385C]' : 'stroke-[2]'
            }`}
          />
          {cartCount > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 bg-[#FF385C] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => onTabChange('menu')}
          className={`p-2 rounded-full transition-all transform active:scale-90 ${
            activeTab === 'menu'
              ? 'text-[#FF385C]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          aria-label="Favorites & Menu"
        >
          <Heart
            className={`w-5 h-5 ${
              activeTab === 'menu' ? 'fill-[#FF385C] stroke-[#FF385C]' : 'stroke-[2]'
            }`}
          />
        </button>

        {/* Profile / Orders Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`p-2 rounded-full transition-all transform active:scale-90 ${
            activeTab === 'profile'
              ? 'text-[#FF385C]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          aria-label="Orders & Profile"
        >
          <Bell
            className={`w-5 h-5 ${
              activeTab === 'profile' ? 'fill-[#FF385C] stroke-[#FF385C]' : 'stroke-[2]'
            }`}
          />
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;
