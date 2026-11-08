import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Neumorphic StatCard for dashboard overview.
 */
export default function StatCard({
  title,
  value,
  icon,
  linkTo,
  linkLabel = 'View details',
  badgeText,
  badgeVariant = 'neutral',
  isLoading = false,
}) {
  const badgeClasses = {
    brand: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeVariant] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      {/* Top row: Icon & Optional Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-navy shadow-xs">
          {icon}
        </div>
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badgeText}
          </span>
        )}
      </div>

      {/* Metric value and title */}
      <div>
        <div className="text-3xl sm:text-4xl font-extrabold font-heading text-brand-navy tracking-tight">
          {isLoading ? (
            <div className="h-9 w-16 bg-slate-200 rounded animate-pulse my-0.5"></div>
          ) : (
            value ?? 0
          )}
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          {title}
        </p>
      </div>

      {/* Bottom link CTA */}
      {linkTo && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={linkTo}
            className="text-xs font-semibold text-brand-gold hover:text-brand-navy flex items-center gap-1 transition-colors group"
          >
            <span>{linkLabel}</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

