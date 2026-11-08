import React from 'react';

export default function ActiveFilterChips({ activeFilters, onRemoveFilter, onClearAll }) {
  if (!activeFilters || activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Active Filters:
      </span>

      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-brand-navy border border-slate-200 transition-colors"
        >
          <span>{filter.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.key)}
            className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-200 focus:outline-none transition-colors"
            aria-label={`Remove filter ${filter.label}`}
          >
            &times;
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-brand-gold hover:text-amber-700 underline underline-offset-2 ml-1 cursor-pointer transition-colors"
      >
        Clear All
      </button>
    </div>
  );
}

