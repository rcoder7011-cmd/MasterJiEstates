import React from 'react';
import Input from '../ui/Input.jsx';

const NCR_CITIES = ['Noida', 'Gurugram', 'New Delhi', 'Ghaziabad', 'Greater Noida', 'Faridabad'];

export default function Step2Location({ formData, updateFormData, onChange, errors = {} }) {
  // Support both updateFormData and onChange prop conventions
  const update = (patch) => {
    if (typeof updateFormData === 'function') {
      updateFormData(patch);
    } else if (typeof onChange === 'function') {
      onChange(patch);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
            Section C
          </span>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            Property Location & Geographic Details
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Specify exact geographic placement so prospective buyers in your target micro-market can discover the listing.
        </p>
      </div>

      {/* 100% Privacy Disclosure Callout */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
          🔒
        </div>
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="block font-semibold mb-0.5 text-amber-950">
            Confidentiality & Privacy Protection:
          </strong>
          Your exact flat number and private street address remain strictly confidential. Only authorized MasterJiEstates administrators and verified staff have access to private address details for title inspection. Public visitors only see the locality, sector, and city.
        </div>
      </div>

      {/* Quick City Selector Chips */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-brand-navy block">
          Primary NCR City <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {NCR_CITIES.map((city) => (
            <button
              type="button"
              key={city}
              onClick={() => update({ city })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                formData.city === city
                  ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-gold hover:bg-slate-50'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: City & Locality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-brand-navy block">
            City Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.city || ''}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="e.g. Noida, Gurugram"
            required
          />
          {errors?.city && <p className="text-[11px] text-rose-600 font-medium">{errors.city}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-brand-navy block">
            Locality / Sector / Area <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.locality || ''}
            onChange={(e) => update({ locality: e.target.value })}
            placeholder="e.g. Sector 62A, Golf Course Extension Road, Indirapuram"
            required
          />
          {errors?.locality && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.locality}</p>
          )}
        </div>
      </div>

      {/* Private Street Address (Admin-Only / Confidential) */}
      <div className="space-y-1 p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
            <span>House / Flat No. & Street Address</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
              🔒 Admin Only
            </span>
          </label>
        </div>
        <Input
          type="text"
          value={formData.address || formData.privateAddress || ''}
          onChange={(e) => update({ address: e.target.value, privateAddress: e.target.value })}
          placeholder="e.g. Tower B, Flat 402, MasterJi Residency, 12th Avenue"
        />
        <p className="text-[10px] text-slate-500">
          This address will NOT be displayed to public visitors. It is securely stored for title verification and escorted site visits.
        </p>
      </div>

      {/* Grid: State & Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-brand-navy block">
            State / Union Territory
          </label>
          <Input
            type="text"
            value={formData.state || ''}
            onChange={(e) => update({ state: e.target.value })}
            placeholder="e.g. Uttar Pradesh, Haryana, Delhi"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-brand-navy block">
            PIN Code (Postal Code)
          </label>
          <Input
            type="text"
            maxLength={6}
            value={formData.pincode || ''}
            onChange={(e) => update({ pincode: e.target.value.replace(/\D/g, '') })}
            placeholder="6-digit PIN (e.g. 201309)"
          />
          {errors?.pincode && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.pincode}</p>
          )}
        </div>
      </div>

      {/* Landmark */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy block">
          Prominent Landmark / Public Reference (Optional)
        </label>
        <Input
          type="text"
          value={formData.landmark || ''}
          onChange={(e) => update({ landmark: e.target.value })}
          placeholder="e.g. Near Electronic City Metro Station, opposite Fortis Hospital"
          maxLength={150}
        />
        <p className="text-[11px] text-slate-400">
          Public reference point to help prospective buyers understand connectivity and neighborhood.
        </p>
      </div>
    </div>
  );
}
