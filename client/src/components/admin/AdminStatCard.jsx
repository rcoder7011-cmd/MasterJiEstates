import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminStatCard({
  title,
  value,
  icon,
  linkTo,
  linkLabel = 'View details',
  badgeText,
  badgeVariant = 'neutral',
  isLoading = false,
}) {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'success':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'gold':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-3">
        {isLoading ? (
          <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg" />
        ) : (
          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0A192F]">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value ?? '0'}
          </span>
        )}

        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        )}
      </div>

      {linkTo && (
        <div className="pt-2 border-t border-slate-100">
          <Link
            to={linkTo}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
          >
            <span>{linkLabel}</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

