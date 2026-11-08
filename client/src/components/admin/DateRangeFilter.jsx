import React from 'react';

export default function DateRangeFilter({ range, onChange, className = '' }) {
  const options = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'this_year', label: 'This Year' },
  ];

  return (
    <div className={`inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 ${className}`}>
      <span className="text-xs text-slate-400 font-medium">Period:</span>
      <select
        value={range}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

