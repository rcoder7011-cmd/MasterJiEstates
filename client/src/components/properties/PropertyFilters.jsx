import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import {
  CITIES,
  CATEGORIES,
  LISTING_TYPES,
  BUDGET_PRESETS,
} from '../../data/demoProperties.js';

export default function PropertyFilters({
  city,
  locality,
  category,
  listingType,
  minPrice,
  maxPrice,
  minArea,
  maxArea,
  bedrooms,
  status,
  onUpdateFilter,
  onUpdateMultipleFilters,
  onClearAll,
  onCloseDrawer, // For mobile drawer close
}) {
  const [localLocality, setLocalLocality] = useState(locality);

  // Handle locality enter or blur
  const handleLocalitySubmit = (e) => {
    e.preventDefault();
    onUpdateFilter('locality', localLocality.trim());
  };

  const handleBudgetPreset = (preset) => {
    onUpdateMultipleFilters({
      minPrice: preset.min,
      maxPrice: preset.max,
    });
  };

  // Determine which budget preset is currently active
  const activePresetIndex = BUDGET_PRESETS.findIndex(
    (p) => String(p.min) === String(minPrice || '') && String(p.max) === String(maxPrice || '')
  );

  return (
    <aside aria-label="Property Filters" className="space-y-6 text-slate-800">
      {/* Header with Title and Clear Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy font-heading flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-brand-gold hover:text-amber-700 transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* 1. Location Filter: City & Locality */}
      <div className="space-y-3">
        <label htmlFor="filter-city" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          City
        </label>
        <select
          id="filter-city"
          value={city}
          onChange={(e) => onUpdateFilter('city', e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
        >
          {CITIES.map((c) => (
            <option key={c} value={c === 'All Cities' ? 'all' : c}>
              {c}
            </option>
          ))}
        </select>

        {/* Locality Search Input */}
        <form onSubmit={handleLocalitySubmit} className="relative">
          <input
            type="text"
            placeholder="Search locality / sector..."
            value={localLocality}
            onChange={(e) => setLocalLocality(e.target.value)}
            onBlur={() => onUpdateFilter('locality', localLocality.trim())}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy"
          />
          {localLocality && (
            <button
              type="button"
              onClick={() => {
                setLocalLocality('');
                onUpdateFilter('locality', '');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              aria-label="Clear locality search"
            >
              &times;
            </button>
          )}
        </form>
      </div>

      {/* 2. Property Category */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200/70">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Property Category
        </label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            const isChecked = category === cat.id;
            return (
              <label
                key={cat.id}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-brand-navy text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="property_category"
                  value={cat.id}
                  checked={isChecked}
                  onChange={() => onUpdateFilter('category', cat.id)}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isChecked ? 'border-brand-gold bg-brand-gold' : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />}
                </span>
                <span>{cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Listing Type (Internal Catalog Classification) */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Listing Type
          </label>
        </div>
        <div className="space-y-1.5">
          {LISTING_TYPES.map((lt) => {
            const isChecked = listingType === lt.id;
            return (
              <label
                key={lt.id}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-brand-navy text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="listing_type"
                  value={lt.id}
                  checked={isChecked}
                  onChange={() => onUpdateFilter('listingType', lt.id)}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isChecked ? 'border-brand-gold bg-brand-gold' : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-brand-navy" />}
                </span>
                <span>{lt.label}</span>
              </label>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 italic leading-snug">
          *Listing classifications reflect company inventory vs owner listings and do not guarantee title verification.
        </p>
      </div>

      {/* 4. Budget Range (Presets + Custom) */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200/70">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Budget
        </label>
        
        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_PRESETS.map((preset, idx) => {
            const isActive = activePresetIndex === idx;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleBudgetPreset(preset)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-gold text-brand-navy font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Price Inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Min (₹)</span>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={minPrice}
              onChange={(e) => onUpdateFilter('minPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Max (₹)</span>
            <input
              type="number"
              placeholder="e.g. 25000000"
              value={maxPrice}
              onChange={(e) => onUpdateFilter('maxPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
        </div>
      </div>

      {/* 5. Bedrooms (BHK) — Only applies to residential properties */}
      <div className="space-y-2 pt-3 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Bedrooms (BHK)
          </label>
          {bedrooms !== 'all' && (
            <button
              type="button"
              onClick={() => onUpdateFilter('bedrooms', 'all')}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', '1', '2', '3', '4', '5+'].map((bhkVal) => {
            const isSelected = bedrooms === bhkVal;
            const displayLabel = bhkVal === 'all' ? 'Any' : `${bhkVal} BHK`;
            return (
              <button
                key={bhkVal}
                type="button"
                onClick={() => onUpdateFilter('bedrooms', bhkVal)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 italic">
          *Applies to apartments, villas, and independent floors.
        </p>
      </div>

      {/* 6. Area Range (sq ft) */}
      <div className="space-y-2 pt-3 border-t border-slate-200/70">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Area (Sq Ft)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Min Area</span>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={minArea}
              onChange={(e) => onUpdateFilter('minArea', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Max Area</span>
            <input
              type="number"
              placeholder="e.g. 4000"
              value={maxArea}
              onChange={(e) => onUpdateFilter('maxArea', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
          </div>
        </div>
      </div>

      {/* 7. Public Availability Status */}
      <div className="space-y-2 pt-3 border-t border-slate-200/70">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Availability Status
        </label>
        <select
          value={status}
          onChange={(e) => onUpdateFilter('status', e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy cursor-pointer"
        >
          <option value="all">All Available & Under Negotiation</option>
          <option value="available">Available Listings</option>
          <option value="under_negotiation">Under Negotiation</option>
        </select>
      </div>

      {/* Mobile-only Apply Button */}
      {onCloseDrawer && (
        <div className="pt-4 border-t border-slate-200 block lg:hidden">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={onCloseDrawer}
          >
            Apply & View Properties
          </Button>
        </div>
      )}
    </aside>
  );
}

