import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminEnquiries, updateAdminEnquiry } from '../../services/api.js';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit modal
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadEnquiries = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminEnquiries({
        page,
        limit: 10,
        search,
        status,
      });
      setEnquiries(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load enquiries.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    document.title = 'Lead Enquiries CRM | MasterJiEstates Admin';
    loadEnquiries(1);
  }, [loadEnquiries]);

  const handleOpenEdit = (enq) => {
    setEditingEnquiry(enq);
    setTargetStatus(enq.status || 'new');
    setInternalNotes(enq.internalNotes || '');
  };

  const handleSaveEnquiry = async (e) => {
    e.preventDefault();
    if (!editingEnquiry) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateAdminEnquiry(editingEnquiry.referenceCode || editingEnquiry._id, {
        status: targetStatus,
        internalNotes,
      });
      setActionSuccess(`Enquiry ${editingEnquiry.referenceCode} updated successfully.`);
      setEditingEnquiry(null);
      loadEnquiries(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to update enquiry.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'new':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">New Lead</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">Contacted</span>;
      case 'follow_up':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Follow-Up</span>;
      case 'converted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Converted</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              Lead Inquiries CRM
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {pagination.total} Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track prospective buyer inquiries, record advisor disposition notes, and coordinate client engagement.
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => loadEnquiries(1)} className="font-bold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadEnquiries(1);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, phone, or reference code..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50/50"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Lead Stages</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow-Up</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
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

      {/* Enquiries Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Client Contact</th>
                <th className="py-3.5 px-4 font-bold">Property Interest</th>
                <th className="py-3.5 px-4 font-bold">Message Excerpt</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : enquiries.length > 0 ? (
                enquiries.map((enq) => (
                  <tr key={enq._id || enq.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{enq.name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <a href={`tel:${enq.phone}`} className="hover:underline font-mono">
                            📞 {enq.phone}
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{enq.email}</div>
                      </div>
                    </td>

                    {/* Property Reference */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block truncate max-w-xs">
                          {enq.propertyTitle || 'Property Listing'}
                        </span>
                        <span className="text-[10px] text-amber-700 font-mono">
                          Ref: {enq.referenceCode}
                        </span>
                      </div>
                    </td>

                    {/* Message & Internal Notes */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-slate-600 line-clamp-2">{enq.message}</p>
                      {enq.internalNotes && (
                        <div className="mt-1 text-[10px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
                          <strong>Note:</strong> {enq.internalNotes}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(enq.status)}</td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(enq)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                      >
                        Update ✎
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No lead inquiries found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} inquiries)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadEnquiries(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadEnquiries(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Enquiry Modal */}
      {editingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isUpdating && setEditingEnquiry(null)}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-base font-bold font-serif text-[#0A192F] mb-1">
              Update Lead Disposition
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Reference: <strong className="text-slate-700">{editingEnquiry.referenceCode}</strong>
            </p>

            <form onSubmit={handleSaveEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Stage / Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Advisor Contacted</option>
                  <option value="follow_up">Follow-Up in Progress</option>
                  <option value="converted">Deal Converted</option>
                  <option value="closed">Closed / Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Operational Notes
                </label>
                <textarea
                  rows="3"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record conversation details, budget limits, or client requirements..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEnquiry(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0A192F] text-amber-400 hover:bg-[#112340]"
                >
                  {isUpdating ? 'Saving...' : 'Save Lead Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

