import React from 'react';

export default function EmptyState({
  icon = null,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-surface-canvas border border-slate-200 flex items-center justify-center text-brand-navy mb-4 shadow-subtle">
        {icon || (
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>

      <h4 className="text-base font-bold text-brand-navy mb-1.5">
        {title}
      </h4>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}

