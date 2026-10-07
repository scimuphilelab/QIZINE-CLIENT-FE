import React from 'react';
import { Search, UtensilsCrossed, Bell, Clock, Star, ShieldCheck } from 'lucide-react';
import { useMenu } from '../../../core/hooks/useMenu';
import type { QRBoothContext } from '../../../core/types/order.types';

export interface HeaderProps {
  booth?: QRBoothContext;
  onOpenWaiterCall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ booth, onOpenWaiterCall }) => {
  const { menu, searchQuery, setSearchQuery, dietFilter, setDietFilter } = useMenu();

  if (!menu) return null;

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-black/5 shadow-xs transition-all">
      <div className="max-w-xl mx-auto px-4 pt-3 pb-2.5">
        {/* Top Row: Vendor & Table Info & Call Waiter */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-3 min-w-0">
            {menu.cafe_profile.logo_url ? (
              <img
                src={menu.cafe_profile.logo_url}
                alt={menu.cafe_profile.name}
                className="w-11 h-11 rounded-full object-cover shadow-xs border border-black/10 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-base leading-tight text-gray-900 truncate">
                {menu.cafe_profile.name}
              </h1>
              <div className="flex items-center space-x-2 text-[11px] text-muted mt-0.5">
                {booth && (
                  <span className="font-semibold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                    {booth.booth_label}
                  </span>
                )}
                <span className="flex items-center space-x-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>~{menu.settings.estimated_prep_time_minutes || 20}m</span>
                </span>
                {menu.cafe_profile.fssai_lic_no && (
                  <span className="hidden sm:inline-flex items-center space-x-0.5">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    <span>FSSAI</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Call Waiter Quick Button */}
          {menu.settings.waiter_call_enabled && onOpenWaiterCall && (
            <button
              onClick={onOpenWaiterCall}
              className="px-2.5 py-1.5 bg-surface border border-black/10 hover:border-primary text-gray-700 hover:text-primary rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-2xs transition shrink-0"
              title="Call Waiter / Floor Assistance"
            >
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xs:inline">Assist</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        {menu.settings.show_search_bar && (
          <div className="relative mb-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes, drinks, biryanis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100/90 rounded-2xl pl-9 pr-4 py-2 text-xs md:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
          </div>
        )}

        {/* Dietary Switch Filters */}
        {menu.settings.show_diet_filter && (
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {(['ALL', 'VEG', 'NON_VEG'] as const).map((diet) => {
              const isActive = dietFilter === diet;
              return (
                <button
                  key={diet}
                  onClick={() => setDietFilter(diet)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {diet === 'ALL' && 'All'}
                  {diet === 'VEG' && '🟢 Veg Only'}
                  {diet === 'NON_VEG' && '🔴 Non-Veg'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
