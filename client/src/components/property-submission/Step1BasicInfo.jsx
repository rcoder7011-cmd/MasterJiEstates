import React from 'react';
import Input from '../ui/Input.jsx';

const CATEGORIES = [
  { id: 'apartment', label: 'Apartment / Flat', icon: '🏢' },
  { id: 'villa', label: 'Villa / Bungalow', icon: '🏡' },
  { id: 'residential_plot', label: 'Residential Plot / Land', icon: '📐' },
  { id: 'independent_house', label: 'Independent House', icon: '🏠' },
  { id: 'commercial_property', label: 'Commercial Office / Retail', icon: '🏬' },
  { id: 'commercial_building', label: 'Commercial Building', icon: '🏗️' },
  { id: 'other', label: 'Other Real Estate', icon: '📌' },
];

export default function Step1BasicInfo({ formData, updateFormData, onChange, errors = {} }) {
  // Support both updateFormData and onChange prop conventions
  const update = (patch) => {
    if (typeof updateFormData === 'function') {
      updateFormData(patch);
    } else if (typeof onChange === 'function') {
      onChange(patch);
    }
  };

  const currentType = formData.sellerListingType || 'owner';
  const currentPurpose = formData.purpose || 'sale';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION A: LISTING TYPE */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
              Section A
            </span>
            <h3 className="text-lg font-heading font-bold text-brand-navy">
              Listing Type & Engagement Model
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Select how you would like MasterJiEstates to position and assist with your property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Option 1: Owner Property */}
          <button
            type="button"
            onClick={() => update({ sellerListingType: 'owner', listingType: 'owner' })}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              currentType === 'owner'
                ? 'border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy/20 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  currentType === 'owner'
                    ? 'border-brand-navy bg-brand-navy'
                    : 'border-slate-300'
                }`}
              >
                {currentType === 'owner' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy mb-1">Owner Property</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Direct owner listing. List your self-owned property with curated buyer discovery and verification assistance.
              </p>
            </div>
          </button>

          {/* Option 2: Brokerage Property */}
          <button
            type="button"
            onClick={() => update({ sellerListingType: 'brokerage', listingType: 'brokerage' })}
            className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
              currentType === 'brokerage'
                ? 'border-brand-gold bg-brand-gold/10 ring-2 ring-brand-gold/30 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-2xl">🤝</span>
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  currentType === 'brokerage'
                    ? 'border-brand-navy bg-brand-navy'
                    : 'border-slate-300'
                }`}
              >
                {currentType === 'brokerage' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-brand-navy mb-1 flex items-center gap-1.5">
                Brokerage Property
                <span className="text-[10px] bg-brand-gold/30 text-brand-navy px-1.5 py-0.2 rounded font-semibold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Assisted advisory mandate. Includes dedicated relationship manager, physical viewing escorts, pricing guidance, and registry coordination.
              </p>
            </div>
          </button>

          {/* Option 3: Company-Owned Inventory (Restricted Admin Only) */}
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-left relative flex flex-col justify-between opacity-75">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-2xl">🏢</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                Admin Only
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">Company-Owned Property</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct corporate inventory acquired and held by MasterJiEstates. Strictly restricted to corporate administrators.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: BASIC INFORMATION */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
              Section B
            </span>
            <h3 className="text-lg font-heading font-bold text-brand-navy">
              Basic Property Information
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Provide the primary title, purpose, category, and descriptive narrative.
          </p>
        </div>

        {/* Listing Purpose: For Sale vs For Rent */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-navy block">
            Listing Purpose <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update({ purpose: 'sale' })}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                currentPurpose === 'sale'
                  ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🏷️ For Sale (Outright Purchase)
            </button>
            <button
              type="button"
              onClick={() => update({ purpose: 'rent' })}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-center ${
                currentPurpose === 'rent'
                  ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🔑 For Rent / Lease
            </button>
          </div>
        </div>

        {/* Property Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-navy">
              Property Title <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">
              {(formData.title || '').length} / 200 characters (min 10)
            </span>
          </div>
          <Input
            type="text"
            value={formData.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Luxurious 3 BHK Park-Facing Apartment in Sector 62A, Noida"
            maxLength={200}
            required
          />
          {errors?.title && <p className="text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          <p className="text-[11px] text-slate-400">
            A clear, informative title mentioning key attributes (BHK, view, society/locality).
          </p>
        </div>

        {/* Property Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-navy block">
            Property Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = formData.category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => update({ category: cat.id })}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-navy bg-brand-navy text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-gold hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-xs font-bold leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
          {errors?.category && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.category}</p>
          )}
        </div>

        {/* Highlight Tagline */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-brand-navy block">
            Highlight Tagline (Optional)
          </label>
          <Input
            type="text"
            value={formData.tagline || ''}
            onChange={(e) => update({ tagline: e.target.value })}
            placeholder="e.g. Corner unit with open greens, 2 car parking & vastu compliant"
            maxLength={120}
          />
          <p className="text-[11px] text-slate-400">
            A punchy secondary headline shown prominently on listing cards and search results.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-navy">
              Property Narrative & Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">
              Min 20 characters (Current: {(formData.description || '').length})
            </span>
          </div>
          <textarea
            rows={5}
            value={formData.description || ''}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe your property in detail: room layout, natural lighting, ventilation, recent renovations, proximity to metro/schools, society amenities, and maintenance details..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy placeholder:text-slate-400"
            required
          />
          {errors?.description && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
