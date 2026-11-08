import React from 'react';
import Input from '../ui/Input.jsx';

const AMENITY_OPTIONS = [
  '24/7 Gated Security',
  '100% Power Backup',
  'CCTV Surveillance',
  'High-Speed Elevators',
  'Reserved Covered Parking',
  'Visitor Parking',
  'Clubhouse & Community Hall',
  'Swimming Pool',
  'Equipped Gymnasium',
  'Children Play Area',
  'Landscaped Gardens / Park',
  'Jogging / Walking Track',
  'Intercom Facility',
  'Rainwater Harvesting',
  'Piped Gas Pipeline',
  'Fire Safety Systems',
  'Vastu Compliant',
];

const FACING_OPTIONS = [
  'North',
  'North-East',
  'East',
  'South-East',
  'South',
  'South-West',
  'West',
  'North-West',
];

const FURNISHING_OPTIONS = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

export default function Step3Specifications({ formData, updateFormData, onChange, errors = {} }) {
  // Support both updateFormData and onChange prop conventions
  const update = (patch) => {
    if (typeof updateFormData === 'function') {
      updateFormData(patch);
    } else if (typeof onChange === 'function') {
      onChange(patch);
    }
  };

  const isPlot = formData.category === 'residential_plot';
  const isCommercial =
    formData.category === 'commercial_property' || formData.category === 'commercial_building';

  const toggleAmenity = (item) => {
    const current = formData.amenities || [];
    if (current.includes(item)) {
      update({ amenities: current.filter((a) => a !== item) });
    } else {
      update({ amenities: [...current, item] });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION D: SPECIFICATIONS */}
      <div className="space-y-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
              Section D
            </span>
            <h3 className="text-lg font-heading font-bold text-brand-navy">
              Property Specifications & Dimensions
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {isPlot
              ? 'Specify land dimensions, plot orientation, and boundary conditions.'
              : isCommercial
              ? 'Specify commercial carpet area, floor specifications, and parking provisions.'
              : 'Specify built-up dimensions, room configurations, and furnishing condition.'}
          </p>
        </div>

        {/* Area & Units */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-navy block">
              {isPlot ? 'Plot Area' : 'Carpet / Built-up Area'} <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={formData.area || ''}
              onChange={(e) => update({ area: e.target.value })}
              placeholder={isPlot ? 'e.g. 250' : 'e.g. 1850'}
              required
            />
            {errors?.area && <p className="text-[11px] text-rose-600 font-medium">{errors.area}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-navy block">Area Unit</label>
            <select
              value={formData.areaUnit || (isPlot ? 'sqyd' : 'sqft')}
              onChange={(e) => update({ areaUnit: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            >
              <option value="sqft">Square Feet (sq.ft)</option>
              <option value="sqyd">Square Yards (Gaj / sq.yd)</option>
              <option value="acres">Acres</option>
              <option value="sqm">Square Meters (sq.m)</option>
            </select>
          </div>
        </div>

        {/* 1. PLOTS SPECIFIC FIELDS */}
        {isPlot && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Plot / Land Features
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">
                  Plot Dimensions (Length × Breadth)
                </label>
                <Input
                  type="text"
                  value={formData.plotDimensions || ''}
                  onChange={(e) => update({ plotDimensions: e.target.value })}
                  placeholder="e.g. 30 ft × 60 ft"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Plot Facing Direction</label>
                <select
                  value={formData.facing || ''}
                  onChange={(e) => update({ facing: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  <option value="">Select Orientation</option>
                  {FACING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f} Facing
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formData.hasBoundaryWall)}
                  onChange={(e) => update({ hasBoundaryWall: e.target.checked })}
                  className="rounded text-brand-navy focus:ring-brand-gold w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">Boundary Wall Constructed</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isCornerPlot)}
                  onChange={(e) => update({ isCornerPlot: e.target.checked })}
                  className="rounded text-brand-navy focus:ring-brand-gold w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">Corner Plot (2-Side Open)</span>
              </label>
            </div>
          </div>
        )}

        {/* 2. COMMERCIAL SPECIFIC FIELDS */}
        {isCommercial && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Commercial Space Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Washrooms</label>
                <select
                  value={formData.washrooms || '1'}
                  onChange={(e) => update({ washrooms: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  <option value="1">1 Private Washroom</option>
                  <option value="2">2 Private Washrooms</option>
                  <option value="3+">3+ Washrooms</option>
                  <option value="common">Common Floor Washrooms</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Dedicated Parking</label>
                <select
                  value={formData.parking || 0}
                  onChange={(e) => update({ parking: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} Car Spot{n !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Floor Number</label>
                <Input
                  type="text"
                  value={formData.floor || ''}
                  onChange={(e) => update({ floor: e.target.value })}
                  placeholder="e.g. 5th Floor"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. RESIDENTIAL SPECIFIC FIELDS */}
        {!isPlot && !isCommercial && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Bedrooms */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">
                  Bedrooms (BHK) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.bedrooms || '3'}
                  onChange={(e) => update({ bedrooms: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  <option value="1">1 BHK / 1 RK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
                {errors?.bedrooms && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.bedrooms}</p>
                )}
              </div>

              {/* Bathrooms */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Bathrooms</label>
                <select
                  value={formData.bathrooms || 2}
                  onChange={(e) => update({ bathrooms: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Bathroom{n !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Balconies */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Balconies</label>
                <select
                  value={formData.balconies || 2}
                  onChange={(e) => update({ balconies: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Balcon{n === 1 ? 'y' : 'ies'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parking */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Parking Spaces</label>
                <select
                  value={formData.parking || 1}
                  onChange={(e) => update({ parking: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Space{n !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Furnishing Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-navy block">Furnishing Status</label>
              <div className="grid grid-cols-3 gap-3">
                {FURNISHING_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => update({ furnishing: opt })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      (formData.furnishing || 'Semi-Furnished') === opt
                        ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor and Facing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">
                  Floor Level / Total Floors
                </label>
                <Input
                  type="text"
                  value={formData.floor || ''}
                  onChange={(e) => update({ floor: e.target.value })}
                  placeholder="e.g. 7th of 24 Floors, Penthouse"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-navy block">Facing Direction</label>
                <select
                  value={formData.facing || 'North-East'}
                  onChange={(e) => update({ facing: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
                >
                  <option value="">Select Facing</option>
                  {FACING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f} Facing
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION E: FEATURES & AMENITIES */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
              Section E
            </span>
            <h3 className="text-lg font-heading font-bold text-brand-navy">
              Features & Society Amenities
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Select all verified features and amenities available in the unit or society complex.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {AMENITY_OPTIONS.map((item) => {
            const isChecked = (formData.amenities || []).includes(item);
            return (
              <label
                key={item}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'border-brand-gold bg-brand-gold/15 text-brand-navy font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAmenity(item)}
                  className="rounded text-brand-navy focus:ring-brand-gold w-3.5 h-3.5"
                />
                <span className="truncate">{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
