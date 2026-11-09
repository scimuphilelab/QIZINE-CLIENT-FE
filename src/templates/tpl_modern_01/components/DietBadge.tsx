import React from 'react';
import type { DietType } from '../../../core/types/menu.types';

export interface DietBadgeProps {
  dietType?: DietType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const DietBadge: React.FC<DietBadgeProps> = ({ dietType = 'VEG', size = 'sm' }) => {
  const normalized = (dietType || '').toUpperCase().trim();
  const isVeg = normalized === 'VEG' || normalized === 'VEGAN';
  const isEgg = normalized === 'EGG';

  const boxSize =
    size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const dotSize =
    size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5';

  if (isVeg) {
    return (
      <span
        className={`${boxSize} rounded-xs border-2 border-emerald-600 flex items-center justify-center shrink-0 bg-white`}
        title="Pure Vegetarian"
      >
        <span className={`${dotSize} rounded-full bg-emerald-600`} />
      </span>
    );
  }

  if (isEgg) {
    return (
      <span
        className={`${boxSize} rounded-xs border-2 border-amber-500 flex items-center justify-center shrink-0 bg-white`}
        title="Contains Egg"
      >
        <span className={`${dotSize} rounded-full bg-amber-500`} />
      </span>
    );
  }

  // Non-Veg (Red dot in red square or triangle)
  return (
    <span
      className={`${boxSize} rounded-xs border-2 border-red-600 flex items-center justify-center shrink-0 bg-white`}
      title="Non-Vegetarian"
    >
      <span className={`${dotSize} rounded-full bg-red-600`} />
    </span>
  );
};

export default DietBadge;

