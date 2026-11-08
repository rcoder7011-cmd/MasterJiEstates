import React from 'react';

export default function DeliveryBadge({ deliveryType, className = '' }) {
  switch (deliveryType) {
    case 'direct':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-navy text-brand-gold border border-brand-gold/30 shadow-xs ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
          MasterJi Direct
        </span>
      );

    case 'verified_partner':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Verified Partner Network
        </span>
      );

    case 'coming_soon':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Coming Soon
        </span>
      );

    case 'unavailable':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Currently Unavailable
        </span>
      );
  }
}

