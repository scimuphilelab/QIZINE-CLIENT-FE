import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export interface DishThumbnailProps {
  url?: string;
  name: string;
  className?: string;
}

/**
 * Modern Dish Thumbnail
 * If image is available, renders high-res image.
 * If NO image is provided or loading fails, renders a sleek "No preview" state.
 * Strictly avoids loading fake static burgers or mismatched stock photos.
 */
export const DishThumbnail: React.FC<DishThumbnailProps> = ({
  url,
  name,
  className = 'w-20 h-20 sm:w-22 sm:h-22',
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanUrl = url && url.trim().length > 0 ? url.trim() : null;

  if (!cleanUrl || hasError) {
    return (
      <div
        className={`${className} rounded-2xl bg-stone-100 border border-stone-200/80 flex flex-col items-center justify-center p-1 text-stone-400 shrink-0 select-none`}
        title="No preview available"
      >
        <ImageOff className="w-5 h-5 stroke-[1.8] text-stone-400 mb-0.5" />
        <span className="text-[9px] font-bold text-stone-400 tracking-tight text-center leading-none">
          No preview
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shrink-0 relative`}
    >
      <img
        src={cleanUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        className="w-full h-full max-w-full max-h-full object-cover rounded-2xl transition-transform duration-200"
      />
    </div>
  );
};

export default DishThumbnail;

