import React from 'react';
import Input from '../ui/Input.jsx';

const CATEGORY_LABELS = {
  apartment: 'Apartment / Flat',
  villa: 'Villa / Bungalow',
  residential_plot: 'Residential Plot / Land',
  independent_house: 'Independent House',
  commercial_property: 'Commercial Office / Retail',
  commercial_building: 'Commercial Building',
  other: 'Other Real Estate',
};

const FURNISHING_LABELS = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'Semi-Furnished',
  fully_furnished: 'Fully Furnished',
  'Unfurnished': 'Unfurnished',
  'Semi-Furnished': 'Semi-Furnished',
  'Fully Furnished': 'Fully Furnished',
};

export default function Step6ReviewSubmit({
  formData,
  updateFormData,
  onChange,
  onJumpToStep,
  isSubmitting,
  isSavingDraft,
  onSaveDraft,
  onOpenPreview,
  onSubmitForReview,
  errors = {},
}) {
  const update = (patch) => {
    if (typeof updateFormData === 'function') {
      updateFormData(patch);
    } else if (typeof onChange === 'function') {
      onChange(patch);
    }
  };

  const images = formData.images || [];
  const coverImage = images.find((img) => img.isCover) || images[0];

  const formatPrice = (val, isRent = false) => {
    const num = Number(val);
    if (!num || isNaN(num)) return 'Price not specified';
    if (isRent) {
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh / month`;
      return `₹${num.toLocaleString('en-IN')} / month`;
    }
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Crore`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const isPlot = formData.category === 'residential_plot';
  const isCommercial =
    formData.category === 'commercial_property' || formData.category === 'commercial_building';
  const isRent = formData.purpose === 'rent';

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-heading font-bold text-brand-navy">
          Step 6: Review, Contact Details & Final Submission
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review all property attributes, verify confidential seller contact details, and submit for verification.
        </p>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Cover + Basic Info Header */}
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 h-40 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
            {coverImage ? (
              <img
                src={coverImage.secureUrl || coverImage.url}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <span className="text-2xl mb-1">🖼</span>
                <span className="text-xs">No Cover Photo</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-brand-navy/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
              {images.length} {images.length === 1 ? 'photo' : 'photos'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-navy/10 text-brand-navy">
                  {CATEGORY_LABELS[formData.category] || formData.category || 'Category Unset'}
                </span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-gold/20 text-brand-navy">
                  {isRent ? 'For Rent' : 'For Sale'}
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {formData.sellerListingType === 'owner' ? 'Owner Listing' : 'Brokerage Mandate'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep(1)}
                className="text-xs text-brand-navy hover:text-brand-gold font-bold underline"
              >
                Edit Step 1 ✎
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-brand-navy leading-snug">
              {formData.title || 'Untitled Property Draft'}
            </h3>

            {formData.tagline && (
              <p className="text-xs text-slate-500 italic mt-0.5">{formData.tagline}</p>
            )}

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold font-heading text-brand-navy">
                {formatPrice(formData.price, isRent)}
              </span>
              {formData.priceNegotiable && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                  Price Negotiable
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mt-2 line-clamp-2">
              {formData.description || 'No description provided yet.'}
            </p>
          </div>
        </div>

        {/* Location Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
              <span>📍</span> Location Details
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="text-xs text-brand-navy hover:text-brand-gold font-bold underline"
            >
              Edit Step 2 ✎
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Locality</span>
              <span className="font-semibold text-slate-900">{formData.locality || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">City</span>
              <span className="font-semibold text-slate-900">{formData.city || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">State</span>
              <span className="font-semibold text-slate-900">{formData.state || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">PIN Code</span>
              <span className="font-semibold text-slate-900">{formData.pincode || '—'}</span>
            </div>
          </div>

          {formData.landmark && (
            <p className="text-xs text-slate-500 mt-2">
              <span className="font-medium text-slate-700">Nearby Landmark:</span> {formData.landmark}
            </p>
          )}

          <div className="mt-3 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
            <span>🔒</span>
            <span>
              <strong>Private Address Kept Confidential:</strong> Exact house/flat numbers ({formData.address || 'Confidential'}) are stored securely for admin inspection and will NOT appear on public search results.
            </span>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
              <span>📐</span> Specifications & Dimensions
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="text-xs text-brand-navy hover:text-brand-gold font-bold underline"
            >
              Edit Step 3 ✎
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Area</span>
              <span className="font-semibold text-slate-900">
                {formData.area ? `${formData.area} ${formData.areaUnit || 'sqft'}` : '—'}
              </span>
            </div>
            {!isPlot && !isCommercial && (
              <>
                <div>
                  <span className="text-slate-400 block text-[11px]">Configuration</span>
                  <span className="font-semibold text-slate-900">
                    {formData.bedrooms ? `${formData.bedrooms} BHK` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bathrooms</span>
                  <span className="font-semibold text-slate-900">
                    {formData.bathrooms ? `${formData.bathrooms} Baths` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Balconies</span>
                  <span className="font-semibold text-slate-900">
                    {formData.balconies !== undefined ? `${formData.balconies} Balconies` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Furnishing</span>
                  <span className="font-semibold text-slate-900">
                    {FURNISHING_LABELS[formData.furnishing] || formData.furnishing || '—'}
                  </span>
                </div>
              </>
            )}
            {isPlot && (
              <>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dimensions</span>
                  <span className="font-semibold text-slate-900">{formData.plotDimensions || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Boundary Wall</span>
                  <span className="font-semibold text-slate-900">{formData.hasBoundaryWall ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Corner Plot</span>
                  <span className="font-semibold text-slate-900">{formData.isCornerPlot ? 'Yes' : 'No'}</span>
                </div>
              </>
            )}
            {isCommercial && (
              <>
                <div>
                  <span className="text-slate-400 block text-[11px]">Washrooms</span>
                  <span className="font-semibold text-slate-900">{formData.washrooms || '1'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Parking</span>
                  <span className="font-semibold text-slate-900">{formData.parking ? `${formData.parking} Cars` : '0'}</span>
                </div>
              </>
            )}
            <div>
              <span className="text-slate-400 block text-[11px]">Facing</span>
              <span className="font-semibold text-slate-900">{formData.facing ? `${formData.facing}` : '—'}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="mt-4">
            <span className="text-slate-400 block text-[11px] mb-1.5">Selected Amenities ({formData.amenities?.length || 0})</span>
            {formData.amenities && formData.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {formData.amenities.map((item) => (
                  <span
                    key={item}
                    className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No society amenities selected.</p>
            )}
          </div>
        </div>

        {/* Photos Strip */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
              <span>📸</span> Photo Gallery ({images.length} / 15)
            </h4>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="text-xs text-brand-navy hover:text-brand-gold font-bold underline"
            >
              Edit Step 5 ✎
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg overflow-hidden border ${
                    img.isCover ? 'border-brand-gold ring-2 ring-brand-gold/40' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.secureUrl || img.url}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-rose-500 italic">No photos uploaded. Please upload at least 1 photo.</p>
          )}
        </div>
      </div>

      {/* SECTION G: SELLER CONTACT DETAILS */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
            Section G
          </span>
          <h3 className="text-base font-heading font-bold text-brand-navy">
            Seller Contact Information (Admin-Only)
          </h3>
        </div>

        {/* Statutory Privacy Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <span className="text-lg">🔒</span>
          <div>
            <strong className="text-brand-navy block mb-0.5">Strict Confidentiality Notice:</strong>
            Your contact information is strictly confidential. Only authorized MasterJiEstates administrators will have access to your personal details. Public visitors will contact MasterJiEstates customer support directly.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-navy block">
              Seller Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.ownerName || ''}
              onChange={(e) => update({ ownerName: e.target.value })}
              placeholder="e.g. Rajesh Sharma"
              required
            />
            {errors?.ownerName && <p className="text-[11px] text-rose-600 font-medium">{errors.ownerName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-navy block">
              Mobile Phone Number <span className="text-rose-500">*</span>
            </label>
            <Input
              type="tel"
              maxLength={10}
              value={formData.ownerPhone || ''}
              onChange={(e) => update({ ownerPhone: e.target.value.replace(/\D/g, '') })}
              placeholder="10-digit Mobile (e.g. 9876543210)"
              required
            />
            {errors?.ownerPhone && <p className="text-[11px] text-rose-600 font-medium">{errors.ownerPhone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-navy block">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.ownerEmail || ''}
              onChange={(e) => update({ ownerEmail: e.target.value })}
              placeholder="e.g. rajesh@example.com"
              required
            />
            {errors?.ownerEmail && <p className="text-[11px] text-rose-600 font-medium">{errors.ownerEmail}</p>}
          </div>
        </div>
      </div>

      {/* SECTION H: DECLARATION & SUBMISSION */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-brand-navy text-white">
            Section H
          </span>
          <h3 className="text-base font-heading font-bold text-brand-navy">
            Declaration & Submission Confirmation
          </h3>
        </div>

        {/* Required Declaration Checkbox */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.agreedToDeclaration)}
              onChange={(e) => update({ agreedToDeclaration: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded text-brand-navy focus:ring-brand-gold border-slate-300"
            />
            <span className="text-xs text-slate-800 leading-relaxed font-medium">
              I confirm that the information and photographs submitted are accurate to the best of my knowledge and that I am authorized to submit this property for listing. <span className="text-rose-500">*</span>
            </span>
          </label>
          {errors?.declaration && (
            <p className="text-[11px] text-rose-600 font-medium mt-2">{errors.declaration}</p>
          )}
        </div>

        {/* Action Controls: 3 Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              disabled={isSubmitting || isSavingDraft}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Back to Photos
            </button>

            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-navy text-brand-navy text-xs font-bold hover:bg-brand-navy/5 transition-colors disabled:opacity-50"
            >
              {isSavingDraft ? 'Saving Draft...' : '💾 Save as Draft'}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenPreview}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-gold bg-brand-gold/10 text-brand-navy text-xs font-bold hover:bg-brand-gold/20 transition-colors"
            >
              👁 Preview Listing
            </button>

            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={isSubmitting || isSavingDraft || !formData.agreedToDeclaration}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-900 text-brand-gold font-bold text-xs shadow-md shadow-brand-navy/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting to MongoDB...' : 'Submit Property for Review ✦'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
