import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAdminProperties,
  createCompanyProperty,
  updateCompanyProperty,
  fetchUploadSignature,
  uploadImageToCloudinary,
} from '../../services/api.js';

const INITIAL_COMPANY_FORM = {
  title: '',
  category: 'luxury_apartment',
  price: '',
  acquisitionCost: '',
  acquisitionDate: new Date().toISOString().slice(0, 10),
  area: '',
  areaUnit: 'sqft',
  bedrooms: '3',
  bathrooms: '3',
  parking: '2',
  city: 'Gurugram',
  locality: 'Golf Course Road',
  state: 'Haryana',
  pincode: '122002',
  privateAddress: '',
  internalNotes: '',
  description: '',
  tagline: 'MasterJi Direct Proprietary Asset',
  images: [],
};

export default function CompanyInventory() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(INITIAL_COMPANY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCompanyProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProperties({
        listingType: 'company_owned',
        limit: 50,
      });
      setProperties(data.items || []);
    } catch (err) {
      setError(err?.message || 'Failed to load company-owned inventory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Company Direct Portfolio | MasterJiEstates Admin';
    loadCompanyProperties();
  }, [loadCompanyProperties]);

  const handleOpenCreateModal = () => {
    setEditingProperty(null);
    setFormData(INITIAL_COMPANY_FORM);
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prop) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title || '',
      category: prop.category || 'luxury_apartment',
      price: prop.price?.toString() || '',
      acquisitionCost: prop.acquisitionCost?.toString() || '',
      acquisitionDate: prop.acquisitionDate
        ? new Date(prop.acquisitionDate).toISOString().slice(0, 10)
        : '',
      area: prop.area?.toString() || '',
      areaUnit: prop.areaUnit || 'sqft',
      bedrooms: prop.bedrooms?.toString() || '3',
      bathrooms: prop.bathrooms?.toString() || '3',
      parking: prop.parking?.toString() || '2',
      city: prop.city || 'Gurugram',
      locality: prop.locality || '',
      state: prop.state || 'Haryana',
      pincode: prop.pincode || '',
      privateAddress: prop.privateAddress || '',
      internalNotes: prop.internalNotes || '',
      description: prop.description || '',
      tagline: prop.tagline || '',
      images: prop.images || [],
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title?.trim() || formData.title.trim().length < 5) {
      errs.title = 'Title is required (min 5 characters).';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errs.price = 'Valid public asking price in INR is required.';
    }
    if (!formData.acquisitionCost || Number(formData.acquisitionCost) <= 0) {
      errs.acquisitionCost = 'Internal acquisition cost is required.';
    }
    if (!formData.locality?.trim()) {
      errs.locality = 'Locality / Sector is required.';
    }
    if (!formData.area || Number(formData.area) <= 0) {
      errs.area = 'Built-up area is required.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        acquisitionCost: Number(formData.acquisitionCost),
        area: Number(formData.area),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        parking: Number(formData.parking),
      };

      if (editingProperty) {
        await updateCompanyProperty(editingProperty.id, payload);
        setActionSuccess(`Company asset "${formData.title}" updated successfully.`);
      } else {
        await createCompanyProperty(payload);
        setActionSuccess(`New company asset "${formData.title}" onboarded successfully.`);
      }

      setShowFormModal(false);
      loadCompanyProperties();
    } catch (err) {
      setError(err?.message || 'Failed to save company property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for quick sample photo insertion
  const handleAddSamplePhoto = () => {
    const sample =
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, sample],
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              MasterJi Direct Portfolio
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Company-Owned Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage proprietary real estate acquisitions. Internal cost basis and private deed notes are strictly isolated from public visitors and external sellers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <span>+ Onboard Company Property</span>
        </button>
      </div>

      {/* Financial Confidentiality Alert */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <span className="text-lg">🛡</span>
        <div className="space-y-1">
          <strong className="block text-amber-950">Proprietary Financial Privacy Protected:</strong>
          <p className="text-amber-800 leading-relaxed">
            Acquisition costs, internal notes, and registry deed addresses are restricted to authorized SuperAdmin accounts. Public catalogue APIs and customer-facing interfaces never expose internal financial metrics.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Company Properties Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Property Asset</th>
                <th className="py-3.5 px-4 font-bold">Public Asking Price</th>
                <th className="py-3.5 px-4 font-bold">Acquisition Cost</th>
                <th className="py-3.5 px-4 font-bold">Projected Margin</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading company portfolio...
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((prop) => {
                  const ask = prop.price || 0;
                  const cost = prop.acquisitionCost || 0;
                  const margin = ask - cost;

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            {prop.imageUrl ? (
                              <img
                                src={prop.imageUrl}
                                alt={prop.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                                IMG
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 truncate block">
                              {prop.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {prop.locality}, {prop.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-serif font-bold text-slate-900 whitespace-nowrap">
                        {prop.priceFormatted}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {cost > 0 ? `₹${(cost / 10000000).toFixed(2)} Cr` : '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cost > 0 ? (
                          <span
                            className={`font-mono font-bold ${
                              margin >= 0 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {margin >= 0 ? '+' : ''}₹{(margin / 10000000).toFixed(2)} Cr
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {prop.availabilityStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prop)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                          >
                            Edit ✎
                          </button>
                          <Link
                            to={`/admin/moderation/${prop.id}`}
                            className="px-2.5 py-1 rounded-lg bg-[#0A192F] text-amber-400 font-semibold text-[11px]"
                          >
                            Inspect
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No company-owned properties recorded yet. Click "+ Onboard Company Property" to register your first proprietary asset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard / Edit Company Property Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isSubmitting && setShowFormModal(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#0A192F]">
                  {editingProperty ? 'Edit Company Property Asset' : 'Onboard Company Asset (MasterJi Direct)'}
                </h3>
                <p className="text-xs text-slate-400">
                  Proprietary acquisition records & public catalog pricing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. MasterJi Grand Residency — Penthouse Suite"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="apartment">Luxury Apartment</option>
                    <option value="villa">Independent Villa</option>
                    <option value="residential_plot">Residential Plot</option>
                    <option value="commercial_property">Commercial Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City & Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="Locality / Sector"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                  {formErrors.locality && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.locality}</p>
                  )}
                </div>
              </div>

              {/* Financials Row */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Financials & Acquisition Basis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Public Asking Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 25000000"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                    />
                    {formErrors.price && (
                      <p className="text-[10px] text-red-600 mt-0.5">{formErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Internal Acquisition Cost (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.acquisitionCost}
                      onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                      placeholder="e.g. 19500000"
                      className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white"
                    />
                    {formErrors.acquisitionCost && (
                      <p className="text-[10px] text-red-600 mt-0.5">{formErrors.acquisitionCost}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Acquisition Date
                    </label>
                    <input
                      type="date"
                      value={formData.acquisitionDate}
                      onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area (sq ft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="2450"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                  {formErrors.area && (
                    <p className="text-[10px] text-red-600 mt-0.5">{formErrors.area}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parking</label>
                  <input
                    type="number"
                    value={formData.parking}
                    onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Private Address & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Private Deed / Registry Address (Internal)
                  </label>
                  <input
                    type="text"
                    value={formData.privateAddress}
                    onChange={(e) => setFormData({ ...formData, privateAddress: e.target.value })}
                    placeholder="e.g. Unit 1402, Tower 4, Central Park..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Operational Notes
                  </label>
                  <input
                    type="text"
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    placeholder="e.g. Title deed in locker; renovated bathrooms in March 2026..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Photo Showcase */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Property Photos ({formData.images.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSamplePhoto}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    + Add Curated Showcase Image
                  </button>
                </div>

                {formData.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-12 rounded-lg overflow-hidden relative border border-slate-200"
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 flex items-center justify-center text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No photos added yet.</p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#112340] text-amber-400 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Asset...' : editingProperty ? 'Update Asset' : 'Onboard Asset ✦'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

