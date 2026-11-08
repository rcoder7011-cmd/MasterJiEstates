import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal.jsx';
import { fetchAdminProperties, updateAdminPropertyStatus } from '../../services/api.js';

export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [listingType, setListingType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Status Change Modal State
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    property: null,
    targetStatus: '',
  });
  const [sellerModal, setSellerModal] = useState({
    isOpen: false,
    property: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadProperties = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProperties({
        page,
        limit: 10,
        search,
        status,
        category,
        listingType,
        sortBy,
      });
      setProperties(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load property inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, category, listingType, sortBy]);

  useEffect(() => {
    document.title = 'Property Inventory Management | MasterJiEstates Admin';
    loadProperties(1);
  }, [loadProperties]);

  const handleStatusChangeConfirm = async (reason) => {
    if (!statusModal.property || !statusModal.targetStatus) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminPropertyStatus(statusModal.property.id, {
        status: statusModal.targetStatus,
        reason,
      });
      setActionSuccess(
        `Property status updated to "${statusModal.targetStatus}" successfully.`
      );
      setStatusModal({ isOpen: false, property: null, targetStatus: '' });
      loadProperties(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to update property status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (stat) => {
    switch (stat) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Available</span>;
      case 'pending_review':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending Review</span>;
      case 'under_negotiation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Negotiation</span>;
      case 'sold':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">Sold</span>;
      case 'withdrawn':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Withdrawn</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{stat}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              Property Inventory Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {pagination.total} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Oversee company-owned assets and verified owner brokerage listings across their complete lifecycle.
          </p>
        </div>

        <Link
          to="/admin/company-inventory"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0A192F] hover:bg-[#112340] text-amber-400 text-xs font-bold shadow-xs transition-colors"
        >
          + Add Company Asset
        </Link>
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => loadProperties(1)} className="font-bold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProperties(1);
          }}
          className="flex flex-col lg:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, locality, or city..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50/50"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="pending_review">Pending Review</option>
              <option value="under_negotiation">Under Negotiation</option>
              <option value="sold">Sold</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="company_owned">MasterJi Direct</option>
              <option value="brokerage">Brokerage</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="apartment">Apartments</option>
              <option value="villa">Villas</option>
              <option value="residential_plot">Plots</option>
              <option value="commercial_property">Commercial</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-amber-400 text-xs font-bold hover:bg-[#112340] transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Property Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Property Asset</th>
                <th className="py-3.5 px-4 font-bold">Category & Type</th>
                <th className="py-3.5 px-4 font-bold">Asking Price</th>
                <th className="py-3.5 px-4 font-bold">Location</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title + Thumbnail */}
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
                          <Link
                            to={`/admin/moderation/${prop.id}`}
                            className="font-bold text-slate-900 hover:text-amber-700 truncate block"
                          >
                            {prop.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {prop.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-700 block">
                          {prop.categoryLabel || prop.category}
                        </span>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-0.5 ${
                            prop.listingType === 'company_owned'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prop.listingTypeLabel || prop.listingType}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-serif font-bold text-slate-900 whitespace-nowrap">
                      {prop.priceFormatted}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-800 font-medium block">{prop.locality}</span>
                      <span className="text-[11px] text-slate-400">{prop.city}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(prop.availabilityStatus)}</td>

                    {/* Quick State Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {prop.availabilityStatus === 'available' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  property: prop,
                                  targetStatus: 'under_negotiation',
                                })
                              }
                              className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100"
                            >
                              Negotiation
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  property: prop,
                                  targetStatus: 'sold',
                                })
                              }
                              className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                            >
                              Mark Sold
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  property: prop,
                                  targetStatus: 'withdrawn',
                                })
                              }
                              className="px-2 py-1 rounded text-[10px] font-semibold text-red-600 hover:bg-red-50"
                            >
                              Withdraw
                            </button>
                          </>
                        )}

                        {prop.availabilityStatus === 'under_negotiation' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  property: prop,
                                  targetStatus: 'sold',
                                })
                              }
                              className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-900 text-amber-400"
                            >
                              Sold ✓
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  property: prop,
                                  targetStatus: 'available',
                                })
                              }
                              className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700"
                            >
                              Restore
                            </button>
                          </>
                        )}

                        {prop.availabilityStatus === 'withdrawn' && (
                          <button
                            type="button"
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                property: prop,
                                targetStatus: 'available',
                              })
                            }
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            Relist Active
                          </button>
                        )}

                        {prop.listingType !== 'company_owned' && (
                          <button
                            type="button"
                            onClick={() => setSellerModal({ isOpen: true, property: prop })}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 flex items-center gap-1"
                            title="View Protected Seller Contact Information"
                          >
                            <span>👤</span>
                            <span>Seller</span>
                          </button>
                        )}

                        <Link
                          to={`/admin/moderation/${prop.id}`}
                          className="px-2 py-1 rounded text-[10px] font-bold text-amber-700 hover:text-amber-900"
                        >
                          View ✎
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No properties matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} listings)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadProperties(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadProperties(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, property: null, targetStatus: '' })}
        onConfirm={handleStatusChangeConfirm}
        title={`Change Status to "${statusModal.targetStatus}"?`}
        message={`Are you sure you want to transition property "${statusModal.property?.title}" to status "${statusModal.targetStatus}"?`}
        confirmLabel="Update Status"
        confirmVariant={statusModal.targetStatus === 'withdrawn' ? 'danger' : 'primary'}
        requireReason={false}
        isLoading={isProcessing}
      />

      {/* Seller Contact Privacy Modal (Admin Only) */}
      {sellerModal.isOpen && sellerModal.property && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
            <div className="p-5 border-b border-slate-100 bg-[#0A192F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">🔒</span>
                <div>
                  <h3 className="text-sm font-bold">Seller Contact Details (Admin Only)</h3>
                  <p className="text-[11px] text-slate-300">Protected owner record for brokerage coordination</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSellerModal({ isOpen: false, property: null })}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <span className="text-amber-600 font-bold">ℹ</span>
                <span>
                  <strong>Statutory Privacy Protection:</strong> This personal contact information is restricted to authorized administrators and is strictly excluded from public directory views and search engines.
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Seller Full Name</span>
                  <span className="text-xs font-bold text-slate-900">
                    {sellerModal.property.owner?.name || 'Unspecified Owner'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Mobile Number</span>
                  {sellerModal.property.owner?.phone ? (
                    <a
                      href={`tel:${sellerModal.property.owner.phone}`}
                      className="text-xs font-mono font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <span>📞</span>
                      <span>{sellerModal.property.owner.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Email Address</span>
                  {sellerModal.property.owner?.email ? (
                    <a
                      href={`mailto:${sellerModal.property.owner.email}`}
                      className="text-xs font-medium text-slate-800 hover:underline flex items-center gap-1"
                    >
                      <span>✉</span>
                      <span>{sellerModal.property.owner.email}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Property Title</span>
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[240px]">
                    {sellerModal.property.title}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Location</span>
                  <span className="text-xs text-slate-700">
                    {sellerModal.property.locality ? `${sellerModal.property.locality}, ${sellerModal.property.city}` : sellerModal.property.city}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Submission Date</span>
                  <span className="text-xs text-slate-700">
                    {new Date(sellerModal.property.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500 font-medium">Moderation Status</span>
                  <span className="text-xs">{getStatusBadge(sellerModal.property.availabilityStatus)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <Link
                to={`/admin/moderation/${sellerModal.property.id}`}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Open Full Review & Curation Desk →
              </Link>
              <button
                type="button"
                onClick={() => setSellerModal({ isOpen: false, property: null })}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

