import React from 'react';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_desc', label: 'Area: Largest First' },
  { value: 'area_asc', label: 'Area: Smallest First' },
];

export default function PropertySort({ currentSort, onSortChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-dropdown" className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
        Sort By:
      </label>
      <div className="relative">
        <select
          id="sort-dropdown"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white border border-slate-300 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent shadow-xs cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

