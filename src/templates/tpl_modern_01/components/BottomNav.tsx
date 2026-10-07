import React from 'react';
import { Home, Utensils, ShoppingBag, User } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F7EFE3]/95 backdrop-blur-lg border-t border-[#E5DACD] max-w-md mx-auto py-2.5 px-6 shadow-[0_-8px_30px_rgba(28,25,23,0.1),0_-1px_3px_rgba(255,255,255,0.7)]">
      <div className="flex items-center justify-between">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center space-y-1 transition-all transform active:scale-95 ${
            activeTab === 'home'
              ? 'text-[#1C1917] drop-shadow-[0_2px_4px_rgba(28,25,23,0.15)]'
              : 'text-[#8E8276] hover:text-[#1C1917]'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* Menu Tab */}
        <button
          onClick={() => onTabChange('menu')}
          className={`flex flex-col items-center space-y-1 transition-all transform active:scale-95 ${
            activeTab === 'menu'
              ? 'text-[#1C1917] drop-shadow-[0_2px_4px_rgba(28,25,23,0.15)]'
              : 'text-[#8E8276] hover:text-[#1C1917]'
          }`}
        >
          <Utensils className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>

        {/* Cart Tab with 3D Badge */}
        <button
          onClick={() => onTabChange('cart')}
          className={`relative flex flex-col items-center space-y-1 transition-all transform active:scale-95 ${
            activeTab === 'cart'
              ? 'text-[#1C1917] drop-shadow-[0_2px_4px_rgba(28,25,23,0.15)]'
              : 'text-[#8E8276] hover:text-[#1C1917]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#1C1917] text-[#F7EFE3] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(28,25,23,0.4)] border border-[#F7EFE3]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Cart</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center space-y-1 transition-all transform active:scale-95 ${
            activeTab === 'profile'
              ? 'text-[#1C1917] drop-shadow-[0_2px_4px_rgba(28,25,23,0.15)]'
              : 'text-[#8E8276] hover:text-[#1C1917]'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
