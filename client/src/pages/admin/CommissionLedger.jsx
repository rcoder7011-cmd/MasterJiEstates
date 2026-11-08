import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PaymentStatusBadge from '../../components/admin/PaymentStatusBadge.jsx';
import DateRangeFilter from '../../components/admin/DateRangeFilter.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import { fetchCommissionLedger, reverseCommissionPayment } from '../../services/api.js';

export default function CommissionLedger() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);

  // Reversal Modal
  const [reversingPayment, setReversingPayment] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState(null);

  useEffect(() => {
    document.title = 'Commission Payment Ledger | MasterJiEstates Admin';
    loadLedger();
  }, [page, paymentMethod, status, dateRange]);

  async function loadLedger() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchCommissionLedger({
        page,
        limit: 15,
        paymentMethod,
        status,
        range: dateRange,
      });
      setPayments(res.items || []);
      setPagination(res.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load commission payment ledger.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReversePayment(e) {
    e.preventDefault();
    setReverseError(null);
    if (!reverseReason.trim() || reverseReason.trim().length < 5) {
      setReverseError('Detailed reversal reason (at least 5 characters) is required.');
      return;
    }

    setIsReversing(true);
    try {
      const payId = reversingPayment.id || reversingPayment._id;
      await reverseCommissionPayment(payId, { reason: reverseReason });
      setReversingPayment(null);
      setReverseReason('');
      await loadLedger();
    } catch (err) {
      setReverseError(err.message || 'Failed to reverse payment.');
    } finally {
      setIsReversing(false);
    }
  }

  const totalAmount = payments
    .filter((p) => !p.isReversed)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Commission <span className="text-amber-400">Payment Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Global ledger of all brokerage commission payments, partial receipts, and bank realizations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeFilter range={dateRange} onChange={setDateRange} />
          <Link
            to="/admin/financial-reports"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 transition-colors"
          >
            Export Ledger CSV
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer (RTGS/NEFT)</option>
            <option value="upi">UPI Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid / Settled</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled / Reversed</option>
          </select>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Total Realized in View:</span>
          <span className="text-emerald-400 font-bold text-sm">
            <MoneyDisplay amount={totalAmount} showFull />
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading commission ledger...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            No commission payment entries found for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Payment Ref</th>
                  <th className="py-3 px-3.5">Deal & Property</th>
                  <th className="py-3 px-3.5">Payment Date</th>
                  <th className="py-3 px-3.5">Method</th>
                  <th className="py-3 px-3.5">UTR / Cheque No</th>
                  <th className="py-3 px-3.5">Payer / Source</th>
                  <th className="py-3 px-3.5">Amount</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => {
                  const pId = p.id || p._id;
                  return (
                    <tr key={pId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-amber-400 whitespace-nowrap">
                        {p.paymentReference}
                      </td>
                      <td className="py-3.5 px-3.5 max-w-xs">
                        <Link
                          to={`/admin/deals/${p.dealId}`}
                          className="font-semibold text-white hover:text-amber-400 transition-colors truncate block"
                        >
                          {p.propertyTitle || p.dealReference}
                        </Link>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Ref: {p.dealReference}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-300 whitespace-nowrap">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-300 capitalize whitespace-nowrap">
                        {p.paymentMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {p.transactionNumber || '—'}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="text-slate-200 font-medium capitalize">
                          {p.payerName || p.receivedFrom}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{p.receivedFrom}</div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-emerald-400">
                        <MoneyDisplay amount={p.amount} showFull />
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <PaymentStatusBadge status={p.status} isReversed={p.isReversed} />
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        {!p.isReversed && (
                          <button
                            type="button"
                            onClick={() => {
                              setReversingPayment(p);
                              setReverseReason('');
                            }}
                            className="text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
                          >
                            Reverse Entry
                          </button>
                        )}
                        {p.isReversed && (
                          <span className="text-slate-500 italic text-[11px]">
                            {p.reversalReason || 'Reversed'}
                          </span>
                        )}
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
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-slate-400">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} Payments)
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

      {/* Reversal Confirmation Modal */}
      {reversingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-400 mb-1">Reverse Commission Payment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reversing {reversingPayment.paymentReference} (₹
              {reversingPayment.amount?.toLocaleString('en-IN')}) will restore the deal outstanding
              balance and log an audit event.
            </p>

            {reverseError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {reverseError}
              </div>
            )}

            <form onSubmit={handleReversePayment} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Reversal *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Bank chargeback / payment recorded under incorrect deal..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReversingPayment(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReversing}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold cursor-pointer"
                >
                  {isReversing ? 'Reversing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

