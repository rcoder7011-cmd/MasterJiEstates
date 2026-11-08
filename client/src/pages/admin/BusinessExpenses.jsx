import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../components/admin/DateRangeFilter.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import {
  fetchBusinessExpenses,
  recordBusinessExpense,
  reverseBusinessExpense,
} from '../../services/api.js';

export default function BusinessExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'office_rent',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    paymentMethod: 'bank_transfer',
    referenceNumber: '',
    description: '',
    receiptReference: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Reverse Modal
  const [reversingExpense, setReversingExpense] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState(null);

  useEffect(() => {
    document.title = 'General Business Expenses | MasterJiEstates Admin';
    loadExpenses();
  }, [page, category, dateRange]);

  async function loadExpenses() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchBusinessExpenses({
        page,
        limit: 15,
        category,
        range: dateRange,
      });
      setExpenses(res.items || []);
      setPagination(res.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load business expenses.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    setFormError(null);
    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Valid positive amount is required.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Expense title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordBusinessExpense({
        ...formData,
        amount: amt,
      });
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'office_rent',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        vendor: '',
        paymentMethod: 'bank_transfer',
        referenceNumber: '',
        description: '',
        receiptReference: '',
      });
      await loadExpenses();
    } catch (err) {
      setFormError(err.message || 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReverseSubmit(e) {
    e.preventDefault();
    setReverseError(null);
    if (!reverseReason.trim() || reverseReason.trim().length < 5) {
      setReverseError('Detailed reversal reason (at least 5 characters) is required.');
      return;
    }

    setIsReversing(true);
    try {
      const expId = reversingExpense.id || reversingExpense._id;
      await reverseBusinessExpense(expId, { reason: reverseReason });
      setReversingExpense(null);
      setReverseReason('');
      await loadExpenses();
    } catch (err) {
      setReverseError(err.message || 'Failed to reverse expense.');
    } finally {
      setIsReversing(false);
    }
  }

  const totalActive = expenses
    .filter((e) => !e.isReversed)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            General Business & <span className="text-amber-400">Operating Expenses</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational expenditures not directly associated with individual property assets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>+</span>
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter range={dateRange} onChange={setDateRange} />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="office_rent">Office Lease & Rent</option>
            <option value="software_subscriptions">Software & Cloud Subscriptions</option>
            <option value="marketing">Advertising & Marketing</option>
            <option value="travel">Field Travel & Fuel</option>
            <option value="utilities">Utilities & Maintenance</option>
            <option value="professional_services">Legal, CA & Advisory</option>
            <option value="staff_costs">Staff Miscellaneous</option>
            <option value="other">Other Operational</option>
          </select>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block text-[11px]">Total Expenses in View:</span>
          <span className="text-rose-400 font-bold text-sm">
            <MoneyDisplay amount={totalActive} showFull />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading operational expenses...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            No operating expenses recorded for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Ref</th>
                  <th className="py-3 px-3.5">Title & Description</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Vendor</th>
                  <th className="py-3 px-3.5">Payment Method</th>
                  <th className="py-3 px-3.5">Amount</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((e) => {
                  const eId = e.id || e._id;
                  return (
                    <tr key={eId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono text-amber-400 whitespace-nowrap">
                        {e.expenseReference}
                      </td>
                      <td className="py-3.5 px-3.5 max-w-xs">
                        <div className="font-semibold text-white">{e.title}</div>
                        {e.description && (
                          <div className="text-[11px] text-slate-400 truncate">{e.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3.5 capitalize text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                          {e.category?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-400 whitespace-nowrap">
                        {e.date ? new Date(e.date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-300 whitespace-nowrap">
                        {e.vendor || '—'}
                      </td>
                      <td className="py-3.5 px-3.5 capitalize text-slate-400 whitespace-nowrap">
                        {e.paymentMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono font-bold text-rose-400 whitespace-nowrap">
                        <MoneyDisplay amount={e.amount} showFull />
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        {!e.isReversed ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReversingExpense(e);
                              setReverseReason('');
                            }}
                            className="text-rose-400 hover:text-rose-300 hover:underline font-semibold cursor-pointer"
                          >
                            Reverse Entry
                          </button>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            {e.reversalReason || 'Reversed'}
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
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} Records)
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

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Record General Business Expense</h3>
            <p className="text-xs text-slate-400 mb-4">
              Operational expenditure logging for audit and financial reporting.
            </p>

            {formError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. November 2026 Office Lease"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="office_rent">Office Lease & Rent</option>
                    <option value="software_subscriptions">Software & Subscriptions</option>
                    <option value="marketing">Advertising & Marketing</option>
                    <option value="travel">Field Travel & Fuel</option>
                    <option value="utilities">Utilities & Maintenance</option>
                    <option value="professional_services">Legal, CA & Advisory</option>
                    <option value="staff_costs">Staff Miscellaneous</option>
                    <option value="other">Other Operational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 180000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. CyberHub Properties Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="bank_transfer">Bank Transfer (RTGS/NEFT)</option>
                    <option value="upi">UPI Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Reference / Tx Number
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, referenceNumber: e.target.value })
                    }
                    placeholder="e.g. NEFT-2026-99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional context or purpose"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmitting ? 'Recording...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Expense Modal */}
      {reversingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-400 mb-1">Reverse Operating Expense</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reversing {reversingExpense.expenseReference} (₹
              {reversingExpense.amount?.toLocaleString('en-IN')}) will remove it from operational
              financial aggregates.
            </p>

            {reverseError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {reverseError}
              </div>
            )}

            <form onSubmit={handleReverseSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Reversal *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Payment cancelled by bank / duplicate entry recorded in error..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReversingExpense(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReversing}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold"
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

