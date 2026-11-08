import React from 'react';
import Input from '../ui/Input.jsx';

/**
 * Format Indian currency number into human-readable Crores or Lakhs.
 */
function formatIndianPrice(price, isRent = false) {
  const num = Number(price);
  if (!num || isNaN(num) || num <= 0) return '₹0';
  if (isRent) {
    if (num >= 100000) {
      const lk = num / 100000;
      return `₹${lk % 1 === 0 ? lk : lk.toFixed(2)} Lakh / month`;
    }
    return `₹${num.toLocaleString('en-IN')} / month`;
  }
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk % 1 === 0 ? lk : lk.toFixed(2)} Lakhs`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function Step4Pricing({ formData, updateFormData, onChange, errors = {} }) {
  // Support both updateFormData and onChange prop conventions
  const update = (patch) => {
    if (typeof updateFormData === 'function') {
      updateFormData(patch);
    } else if (typeof onChange === 'function') {
      onChange(patch);
    }
  };

  const isRent = formData.purpose === 'rent';
  const priceNum = Number(formData.price) || 0;
  const areaNum = Number(formData.area) || 0;
  const pricePerUnit = areaNum > 0 && priceNum > 0 ? Math.round(priceNum / areaNum) : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-lg font-heading font-bold text-brand-navy">
          Step 4: Pricing, Availability & Commercial Terms
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Establish asking price parameters, negotiable status, and handover timeline.
        </p>
      </div>

      {/* Expected Target Price */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-brand-navy">
            {isRent ? 'Expected Monthly Rent (in ₹ INR)' : 'Asking / Target Price (in ₹ INR)'}{' '}
            <span className="text-rose-500">*</span>
          </label>
          {priceNum > 0 && (
            <span className="text-xs font-extrabold text-brand-navy bg-brand-gold/20 px-2.5 py-0.5 rounded-full border border-brand-gold/40">
              Formatted: {formatIndianPrice(priceNum, isRent)}
            </span>
          )}
        </div>

        <Input
          type="number"
          min={1000}
          value={formData.price || ''}
          onChange={(e) => update({ price: e.target.value })}
          placeholder={isRent ? 'e.g. 45000' : 'e.g. 18500000 (for ₹1.85 Cr)'}
          required
        />
        {errors?.price && <p className="text-[11px] text-rose-600 font-medium">{errors.price}</p>}

        {pricePerUnit && !isRent && (
          <p className="text-[11px] text-slate-500 font-medium">
            Calculated rate: ~₹{pricePerUnit.toLocaleString('en-IN')} / {formData.areaUnit || 'sqft'}
          </p>
        )}
      </div>

      {/* Price Negotiable Toggle */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-brand-navy">Price Flexibility</div>
          <div className="text-[11px] text-slate-500">
            Are you open to structured price negotiations with verified serious buyers?
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.priceNegotiable !== false}
            onChange={(e) => update({ priceNegotiable: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-navy"></div>
        </label>
      </div>

      {/* Possession Status */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-brand-navy block">
          Possession / Handover Timeline
        </label>
        <select
          value={formData.availabilityLabel || 'Ready to Move'}
          onChange={(e) => update({ availabilityLabel: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-brand-dark focus:border-brand-navy focus:outline-none"
        >
          <option value="Ready to Move">Immediate / Ready to Move</option>
          <option value="Possession within 30 Days">Possession within 30 Days</option>
          <option value="Possession within 3 Months">Possession within 3 Months</option>
          <option value="Possession within 6 Months">Possession within 6 Months</option>
          <option value="Under Construction (1-2 Years)">Under Construction (1–2 Years)</option>
        </select>
      </div>
    </div>
  );
}
