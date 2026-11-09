import React from 'react';
import { X, Utensils, ChevronRight } from 'lucide-react';
import type { MenuCategory, MenuSection } from '../../../core/types/menu.types';

export interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: MenuSection[];
  allCategories: MenuCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  sections,
  allCategories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-5 z-10 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF4EE] text-[#FF5722] flex items-center justify-center">
              <Utensils className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-stone-900">Menu Directory</h2>
              <p className="font-sans text-[11px] text-stone-400 font-medium">
                Jump directly to any section or category
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center active:scale-95 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* List of Sections & Categories */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div key={section.id} className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 px-2">
                  {section.name}
                </h3>
                <div className="bg-stone-50 rounded-2xl p-1.5 space-y-1">
                  {section.categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const count = cat.items?.length || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-white text-[#FF5722] font-black shadow-xs ring-1 ring-[#FF5722]/20'
                            : 'hover:bg-white text-stone-700 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs sm:text-sm truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-stone-400 font-bold bg-white/70 px-2 py-0.5 rounded-full border border-stone-200/50">
                            {count}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-1">
              {allCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const count = cat.items?.length || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFF4EE] text-[#FF5722] font-black shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold'
                    }`}
                  >
                    <span className="text-sm truncate">{cat.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-stone-400 font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200">
                        {count} items
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;

