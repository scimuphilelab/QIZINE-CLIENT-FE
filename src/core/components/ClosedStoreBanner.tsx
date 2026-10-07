import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export interface ClosedStoreBannerProps {
  vendorName: string;
  openingTime?: string;
  closingTime?: string;
}

export const ClosedStoreBanner: React.FC<ClosedStoreBannerProps> = ({
  vendorName,
  openingTime = '09:00 AM',
  closingTime = '10:00 PM',
}) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 text-amber-900 text-xs">
      <div className="max-w-xl mx-auto flex items-center space-x-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">{vendorName} is currently closed.</span>{' '}
          <span className="text-amber-800">
            Operating hours: {openingTime} – {closingTime}. Browsing is available, but ordering is paused.
          </span>
        </div>
      </div>
    </div>
  );
};
