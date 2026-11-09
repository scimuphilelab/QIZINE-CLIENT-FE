import React, { useState } from 'react';
import { Check, Utensils } from 'lucide-react';

export interface CategoryPillProps {
  id: string;
  name: string;
  imageUrl?: string;
  isSelected: boolean;
  onClick: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  name,
  imageUrl,
  isSelected,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const cleanUrl = imageUrl && imageUrl.trim().length > 0 ? imageUrl.trim() : null;
  const showImg = Boolean(cleanUrl && !imgError);

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex flex-col items-center justify-start group cursor-pointer shrink-0 active:scale-95 transition-transform select-none"
    >
      <div className="relative">
        <div
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center p-1 transition-all duration-200 overflow-hidden ${
            isSelected
              ? 'border-2 border-[#FF5722] bg-white ring-2 ring-[#FF5722]/30 shadow-md scale-105'
              : 'border border-stone-200/80 bg-stone-50 hover:border-stone-300'
          }`}
        >
          {showImg ? (
            <img
              src={cleanUrl!}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
              <Utensils className="w-6 h-6 stroke-[1.8] text-stone-400" />
            </div>
          )}
        </div>

        {/* Orange Checkmark Badge on Selected Category (Matching Screenshot) */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-xs border-2 border-white animate-in zoom-in-75 duration-150">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
      </div>

      <span
        className={`font-heading font-extrabold text-[12px] mt-2 text-center whitespace-nowrap px-1 max-w-[80px] truncate tracking-tight transition-colors ${
          isSelected ? 'text-[#FF5722]' : 'text-stone-700 group-hover:text-stone-900'
        }`}
      >
        {name}
      </span>
    </button>
  );
};

export default CategoryPill;

