import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import { CITIES, CATEGORIES } from '../../data/demoProperties.js';

export default function PropertySearchBar({
  search,
  city,
  category,
  onSearchSubmit,
  onReset,
}) {
  const [localSearch, setLocalSearch] = useState(search || '');
  const [localCity, setLocalCity] = useState(city || 'all');
  const [localCategory, setLocalCategory] = useState(category || 'all');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit({
      search: localSearch.trim(),
      city: localCity,
      category: localCategory,
    });
  };

  const handleClear = () => {
    setLocalSearch('');
    setLocalCity('all');
    setLocalCategory('all');
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-3 sm:p-4 mb-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Keyword Search Input (5 spans on desktop) */}
        <div className="lg:col-span-5 relative">
          <label htmlFor="directory-search-input" className="sr-only">
            Search by title, locality or landmark
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="directory-search-input"
            type="text"
            placeholder="Search by locality, project, or keyword..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              aria-label="Clear keyword"
            >
              &times;
            </button>
          )}
        </div>

        {/* City Select (3 spans) */}
        <div className="lg:col-span-3">
          <label htmlFor="directory-city-select" className="sr-only">
            Select City
          </label>
          <select
            id="directory-city-select"
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c === 'All Cities' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Category Select (2 spans) */}
        <div className="lg:col-span-2">
          <label htmlFor="directory-category-select" className="sr-only">
            Select Category
          </label>
          <select
            id="directory-category-select"
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:bg-white transition-all cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions (2 spans) */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1 justify-center text-xs font-bold py-2.5"
          >
            Find
          </Button>

          {(localSearch || localCity !== 'all' || localCategory !== 'all') && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              title="Reset Search"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

