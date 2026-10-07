import React from 'react';
import { useMenu } from '../../../core/hooks/useMenu';
import type { QRBoothContext } from '../../../core/types/order.types';
import { Search } from 'lucide-react';

interface HeaderProps {
  booth?: QRBoothContext;
}

export const Header: React.FC<HeaderProps> = ({ booth }) => {
  const { menu, searchQuery, setSearchQuery, dietFilter, setDietFilter } = useMenu();

  if (!menu) return null;

  return (
    <div className="relative bg-[#FBF8F1]">
      {/* Editorial Cover */}
      {menu.cafe_profile.cover_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={menu.cafe_profile.cover_url}
            alt={menu.cafe_profile.name}
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F3D2B]/90 via-[#1F3D2B]/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="font-heading italic text-2xl font-bold tracking-wide">
              {menu.cafe_profile.name}
            </h1>
            {menu.cafe_profile.tagline && (
              <p className="text-xs text-[#C8A15B] font-serif tracking-widest uppercase mt-0.5">
                {menu.cafe_profile.tagline}
              </p>
            )}
            {booth && (
              <p className="text-[11px] text-white/80 mt-1">
                {booth.booth_label} • {booth.serving_model.replace('_', ' ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Editorial Search & Diet Toggle */}
      <div className="max-w-xl mx-auto px-4 py-3 space-y-2.5">
        {menu.settings.show_search_bar && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search culinary creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-lg pl-9 pr-4 py-2 text-xs text-gray-800 border border-[#C8A15B]/30 focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        )}

        {menu.settings.show_diet_filter && (
          <div className="flex items-center space-x-2">
            {(['ALL', 'VEG', 'NON_VEG'] as const).map((diet) => (
              <button
                key={diet}
                onClick={() => setDietFilter(diet)}
                className={`px-3 py-1 text-xs font-serif rounded-md transition-all ${
                  dietFilter === diet
                    ? 'bg-[#1F3D2B] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-[#C8A15B]/30'
                }`}
              >
                {diet === 'ALL' ? 'All Curations' : diet.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
