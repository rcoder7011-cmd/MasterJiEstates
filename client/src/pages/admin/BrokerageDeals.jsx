import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DealStatusBadge from '../../components/admin/DealStatusBadge.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import { fetchBrokerageDeals, createBrokerageDeal } from '../../services/api.js';

export default function BrokerageDeals() {
  const [deals, setDeals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    propertyTitle: '',
    propertyCity: 'Gurugram',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    expectedTransactionValue: '',
    actualTransactionValue: '',
    status: 'lead',
    commissionType: 'percentage',
    percentageRate: 2,
    fixedAmount: '',
    payer: 'seller',
    documentReference: '',
    internalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    document.title = 'Brokerage Deals | MasterJiEstates Admin';
    loadDeals();
  }, [page, status]);

  async function loadDeals() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchBrokerageDeals({ page, limit: 10, status, search });
      setDeals(res.items || []);
      setPagination(res.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load brokerage deals.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadDeals();
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!createFormData.propertyTitle.trim()) {
      setFormError('Property title is required.');
      return;
    }
    if (!createFormData.sellerName.trim()) {
      setFormError('Seller name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        propertyTitle: createFormData.propertyTitle,
        propertyCity: createFormData.propertyCity,
        seller: {
          name: createFormData.sellerName,
          phone: createFormData.sellerPhone,
          email: createFormData.sellerEmail,
        },
        buyer: {
          name: createFormData.buyerName,
          phone: createFormData.buyerPhone,
          email: createFormData.buyerEmail,
        },
        status: createFormData.status,
        expectedTransactionValue: Number(createFormData.expectedTransactionValue) || 0,
        actualTransactionValue: Number(createFormData.actualTransactionValue) || 0,
        internalNotes: createFormData.internalNotes,
        commissionTerms: {
          commissionType: createFormData.commissionType,
          percentageRate: Number(createFormData.percentageRate) || 2,
          fixedAmount: Number(createFormData.fixedAmount) || 0,
          payer: createFormData.payer,
          documentReference: createFormData.documentReference,
        },
      };

      await createBrokerageDeal(payload);
      setShowCreateModal(false);
      // Reset form
      setCreateFormData({
        propertyTitle: '',
        propertyCity: 'Gurugram',
        sellerName: '',
        sellerPhone: '',
        sellerEmail: '',
        buyerName: '',
        buyerPhone: '',
        buyerEmail: '',
        expectedTransactionValue: '',
        actualTransactionValue: '',
        status: 'lead',
        commissionType: 'percentage',
        percentageRate: 2,
        fixedAmount: '',
        payer: 'seller',
        documentReference: '',
        internalNotes: '',
      });
      loadDeals();
    } catch (err) {
      setFormError(err.message || 'Failed to create brokerage deal.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Brokerage Deals & <span className="text-amber-400">Transaction Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Facilitated property sales, commission agreements, and closing milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>+</span>
          <span>New Brokerage Deal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by deal ref, property, seller, buyer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">All Deal Statuses</option>
            <option value="lead">New Lead</option>
            <option value="negotiation">Negotiation</option>
            <option value="agreement_pending">Agreement Pending</option>
            <option value="agreement_signed">Agreement Signed</option>
            <option value="transaction_in_progress">In Progress</option>
            <option value="completed">Completed / Registered</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading brokerage deals...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 text-xs">{error}</div>
        ) : deals.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No brokerage deals found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Deal Reference</th>
                  <th className="py-3 px-3.5">Property Details</th>
                  <th className="py-3 px-3.5">Seller</th>
                  <th className="py-3 px-3.5">Buyer</th>
                  <th className="py-3 px-3.5">Transaction Value</th>
                  <th className="py-3 px-3.5">Agreed Commission</th>
                  <th className="py-3 px-3.5">Outstanding</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deals.map((deal) => {
                  const dealId = deal.id || deal._id;
                  const targetValue =
                    deal.actualTransactionValue > 0
                      ? deal.actualTransactionValue
                      : deal.expectedTransactionValue;
                  const isEstimatedVal = deal.actualTransactionValue === 0;

                  return (
                    <tr key={dealId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-amber-400 whitespace-nowrap">
                        <Link to={`/admin/deals/${dealId}`} className="hover:underline">
                          {deal.dealReference}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3.5 max-w-xs">
                        <div className="font-semibold text-white truncate">{deal.propertyTitle}</div>
                        <div className="text-[11px] text-slate-400">{deal.propertyCity}</div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{deal.seller?.name || '—'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{deal.seller?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-medium">{deal.buyer?.name || '—'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{deal.buyer?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <MoneyDisplay amount={targetValue} />
                        {isEstimatedVal && (
                          <span className="block text-[10px] text-amber-400/80 font-normal">
                            (Estimated)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <MoneyDisplay amount={deal.commissionAgreement?.agreedAmount || 0} />
                        <span className="block text-[10px] text-slate-400">
                          {deal.commissionAgreement?.commissionType === 'percentage'
                            ? `${deal.commissionAgreement?.percentageRate}% (${deal.commissionAgreement?.payer})`
                            : `Fixed (${deal.commissionAgreement?.payer})`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span
                          className={
                            deal.outstandingCommission > 0
                              ? 'text-amber-400 font-bold font-mono'
                              : 'text-emerald-400 font-bold font-mono'
                          }
                        >
                          <MoneyDisplay amount={deal.outstandingCommission || 0} />
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <DealStatusBadge status={deal.status} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/deals/${dealId}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 transition-colors inline-block"
                        >
                          Manage Deal →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} Total Deals)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 transition-colors"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Deal Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-200 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">Create New Brokerage Deal</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record transaction terms, counterparties, and contracted commission.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.propertyTitle}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, propertyTitle: e.target.value })
                    }
                    placeholder="e.g. 4 BHK Penthouse DLF Phase 5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={createFormData.propertyCity}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, propertyCity: e.target.value })
                    }
                    placeholder="Gurugram"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Counterparties */}
              <div className="border border-slate-800 rounded-xl p-3.5 bg-slate-950/60 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Counterparties (Seller & Buyer)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Seller Full Name *</label>
                    <input
                      type="text"
                      required
                      value={createFormData.sellerName}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, sellerName: e.target.value })
                      }
                      placeholder="Seller Name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Seller Phone</label>
                    <input
                      type="tel"
                      value={createFormData.sellerPhone}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, sellerPhone: e.target.value })
                      }
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Buyer Full Name</label>
                    <input
                      type="text"
                      value={createFormData.buyerName}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, buyerName: e.target.value })
                      }
                      placeholder="Buyer Name (if identified)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Buyer Phone</label>
                    <input
                      type="tel"
                      value={createFormData.buyerPhone}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, buyerPhone: e.target.value })
                      }
                      placeholder="98XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Values & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Expected Value (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createFormData.expectedTransactionValue}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        expectedTransactionValue: e.target.value,
                      })
                    }
                    placeholder="e.g. 45000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Actual Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createFormData.actualTransactionValue}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        actualTransactionValue: e.target.value,
                      })
                    }
                    placeholder="Leave 0 if unconfirmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Initial Status</label>
                  <select
                    value={createFormData.status}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, status: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="lead">New Lead</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="agreement_pending">Agreement Pending</option>
                    <option value="agreement_signed">Agreement Signed</option>
                    <option value="transaction_in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* Commission Terms */}
              <div className="border border-slate-800 rounded-xl p-3.5 bg-slate-950/60 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Commission Agreement Terms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Type</label>
                    <select
                      value={createFormData.commissionType}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, commissionType: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {createFormData.commissionType === 'percentage' ? (
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={createFormData.percentageRate}
                        onChange={(e) =>
                          setCreateFormData({ ...createFormData, percentageRate: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Fixed Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={createFormData.fixedAmount}
                        onChange={(e) =>
                          setCreateFormData({ ...createFormData, fixedAmount: e.target.value })
                        }
                        placeholder="e.g. 500000"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Payer</label>
                    <select
                      value={createFormData.payer}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, payer: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white cursor-pointer"
                    >
                      <option value="seller">Seller Pays</option>
                      <option value="buyer">Buyer Pays</option>
                      <option value="both">Both (Shared)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Agreement Reference / Document ID
                  </label>
                  <input
                    type="text"
                    value={createFormData.documentReference}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, documentReference: e.target.value })
                    }
                    placeholder="e.g. MJE-MANDATE-2026-088"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Internal Notes</label>
                <textarea
                  rows="2"
                  value={createFormData.internalNotes}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, internalNotes: e.target.value })
                  }
                  placeholder="Private negotiation history, lawyer contact, closing condition notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Recording Deal...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

