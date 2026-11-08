import React, { useState, useEffect, useCallback } from 'react';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal.jsx';
import { fetchAdminSiteVisits, updateAdminSiteVisit } from '../../services/api.js';

export default function AdminSiteVisits() {
  const [visits, setVisits] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal states
  const [cancelModal, setCancelModal] = useState({ isOpen: false, visit: null });
  const [editModal, setEditModal] = useState({ isOpen: false, visit: null, status: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadVisits = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSiteVisits({
        page,
        limit: 10,
        status,
        date,
      });
      setVisits(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load site visits.');
    } finally {
      setIsLoading(false);
    }
  }, [status, date]);

  useEffect(() => {
    document.title = 'Site Visits Schedule & Dispatch | MasterJiEstates Admin';
    loadVisits(1);
  }, [loadVisits]);

  const handleConfirmVisit = async (visit) => {
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminSiteVisit(visit.bookingReference || visit._id, {
        status: 'confirmed',
        internalNotes: 'Confirmed by administrative desk.',
      });
      setActionSuccess(`Site visit ${visit.bookingReference} confirmed.`);
      loadVisits(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to confirm site visit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelConfirm = async (reason) => {
    if (!cancelModal.visit) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminSiteVisit(cancelModal.visit.bookingReference || cancelModal.visit._id, {
        status: 'cancelled',
        cancellationReason: reason,
      });
      setActionSuccess(`Site visit ${cancelModal.visit.bookingReference} cancelled.`);
      setCancelModal({ isOpen: false, visit: null });
      loadVisits(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to cancel site visit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveVisitDetails = async (e) => {
    e.preventDefault();
    if (!editModal.visit) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminSiteVisit(editModal.visit.bookingReference || editModal.visit._id, {
        status: editModal.status,
        internalNotes: editModal.notes,
      });
      setActionSuccess('Site visit details updated successfully.');
      setEditModal({ isOpen: false, visit: null, status: '', notes: '' });
      loadVisits(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to update site visit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'requested':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Requested</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Cancelled</span>;
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
              Site Visits Dispatch Schedule
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {pagination.total} Visits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch escorted field viewings, confirm prospective buyer schedules, and record property inspection feedback.
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
          <button type="button" onClick={() => loadVisits(1)} className="font-bold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Visit Statuses</option>
          <option value="requested">Requested</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white"
        />

        <button
          type="button"
          onClick={() => loadVisits(1)}
          className="px-4 py-2 rounded-xl bg-[#0A192F] text-amber-400 text-xs font-bold hover:bg-[#112340]"
        >
          Apply Filters
        </button>

        {(status || date) && (
          <button
            type="button"
            onClick={() => {
              setStatus('');
              setDate('');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Client Contact</th>
                <th className="py-3.5 px-4 font-bold">Property Tour</th>
                <th className="py-3.5 px-4 font-bold">Date & Time Slot</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Client Instructions</th>
                <th className="py-3.5 px-4 font-bold text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading visit schedules...
                  </td>
                </tr>
              ) : visits.length > 0 ? (
                visits.map((v) => (
                  <tr key={v._id || v.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{v.name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <a href={`tel:${v.phone}`} className="hover:underline font-mono">
                            📞 {v.phone}
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{v.email}</div>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-800 block truncate max-w-xs">
                          {v.propertyTitle || 'Property Tour'}
                        </span>
                        <span className="text-[10px] text-amber-700 font-mono">
                          Booking: {v.bookingReference}
                        </span>
                      </div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">
                        {new Date(v.preferredDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ⏰ {v.preferredTimeSlot}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(v.status)}</td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {v.notes ? (
                        <p className="text-slate-600 line-clamp-2">{v.notes}</p>
                      ) : (
                        <span className="text-slate-400 italic">No notes</span>
                      )}
                      {v.cancellationReason && (
                        <div className="mt-1 text-[10px] text-red-700 bg-red-50 p-1 rounded">
                          Cancelled: {v.cancellationReason}
                        </div>
                      )}
                      {v.internalNotes && (
                        <div className="mt-1 text-[10px] text-slate-600 bg-slate-100 p-1 rounded">
                          Internal: {v.internalNotes}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status === 'requested' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmVisit(v)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                          >
                            Confirm ✓
                          </button>
                        )}

                        {['requested', 'confirmed'].includes(v.status) && (
                          <button
                            type="button"
                            onClick={() => setCancelModal({ isOpen: true, visit: v })}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold text-[11px]"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setEditModal({
                              isOpen: true,
                              visit: v,
                              status: v.status,
                              notes: v.internalNotes || '',
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                        >
                          Edit ✎
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No site visits scheduled matching the criteria.
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} visits)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadVisits(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadVisits(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Visit Modal */}
      <ConfirmActionModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, visit: null })}
        onConfirm={handleCancelConfirm}
        title="Cancel Site Visit?"
        message={`Please provide a reason for cancelling site visit booking "${cancelModal.visit?.bookingReference}".`}
        confirmLabel="Cancel Visit"
        confirmVariant="danger"
        requireReason={true}
        reasonLabel="Cancellation Reason"
        reasonPlaceholder="e.g. Buyer requested postponement, property unavailable on this date..."
        isLoading={isProcessing}
      />

      {/* Edit Visit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !isProcessing && setEditModal({ isOpen: false, visit: null, status: '', notes: '' })}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-base font-bold font-serif text-[#0A192F] mb-1">
              Update Site Visit Dispatch
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Booking: <strong className="text-slate-700">{editModal.visit?.bookingReference}</strong>
            </p>

            <form onSubmit={handleSaveVisitDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visit Status
                </label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="requested">Requested</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Operations Notes
                </label>
                <textarea
                  rows="3"
                  value={editModal.notes}
                  onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
                  placeholder="Field executive name, parking instructions, client feedback..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, visit: null, status: '', notes: '' })}
                  disabled={isProcessing}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0A192F] text-amber-400 hover:bg-[#112340]"
                >
                  {isProcessing ? 'Saving...' : 'Save Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

