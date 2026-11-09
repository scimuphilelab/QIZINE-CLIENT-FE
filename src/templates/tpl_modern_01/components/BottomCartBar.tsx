import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../../core/hooks/useCart';

export interface BottomCartBarProps {
  onOpenCart: () => void;
}

export const BottomCartBar: React.FC<BottomCartBarProps> = ({ onOpenCart }) => {
  const { calculation, formatCurrency } = useCart();

  if (calculation.total_items_count <= 0) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom duration-200">
      <div
        onClick={onOpenCart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenCart();
          }
        }}
        className="pointer-events-auto w-full max-w-md bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-2xl py-3.5 px-5 shadow-xl shadow-orange-500/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="font-heading text-xs uppercase tracking-wider font-extrabold text-white/90">
              {calculation.total_items_count} {calculation.total_items_count === 1 ? 'item' : 'items'}
            </p>
            <p className="font-heading text-base font-black tracking-tight leading-none mt-0.5">
              {formatCurrency(calculation.grand_total_paise)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-heading font-black text-sm uppercase tracking-wide bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl transition-colors">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4 stroke-[2.8]" />
        </div>
      </div>
    </div>
  );
};

export default BottomCartBar;

