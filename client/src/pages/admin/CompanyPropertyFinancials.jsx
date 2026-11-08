import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import {
  fetchCompanyPropertiesFinancials,
  fetchPropertyExpenses,
  recordPropertyExpense,
  reversePropertyExpense,
  recordCompanyPropertySale,
} from '../../services/api.js';

export default function CompanyPropertyFinancials() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Expense Modal
  const [activeExpenseProp, setActiveExpenseProp] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'renovation',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    description: '',
    receiptReference: '',
    paymentMethod: 'bank_transfer',
  });
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState(null);

  // View Expenses Modal
  const [viewExpensesProp, setViewExpensesProp] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Reverse Expense
  const [reversingExpense, setReversingExpense] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);

  // Record Sale Modal
  const [activeSaleProp, setActiveSaleProp] = useState(null);
  const [saleForm, setSaleForm] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    buyerAddress: '',
    saleDate: new Date().toISOString().slice(0, 10),
    saleAmount: '',
    agreementReference: '',
    paymentReceived: '',
    internalRemarks: '',
  });
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleError, setSaleError] = useState(null);

  useEffect(() => {
    document.title = 'Company Asset Financials & CapEx | MasterJiEstates Admin';
    loadProperties();
  }, []);

  async function loadProperties() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchCompanyPropertiesFinancials();
      setProperties(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load company property financials.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOpenExpenses(prop) {
    setViewExpensesProp(prop);
    setLoadingExpenses(true);
    try {
      const list = await fetchPropertyExpenses(prop.id);
      setExpensesList(list || []);
    } catch (err) {
      alert(err.message || 'Failed to load property expenses.');
    } finally {
      setLoadingExpenses(false);
    }
  }

  async function handleCreateExpense(e) {
    e.preventDefault();
    setExpenseError(null);
    const amt = Number(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setExpenseError('Valid positive expense amount is required.');
      return;
    }

    setIsSubmittingExpense(true);
    try {
      await recordPropertyExpense(activeExpenseProp.id, {
        category: expenseForm.category,
        amount: amt,
        date: expenseForm.date,
        vendor: expenseForm.vendor,
        description: expenseForm.description,
        receiptReference: expenseForm.receiptReference,
        paymentMethod: expenseForm.paymentMethod,
      });
      setActiveExpenseProp(null);
      setExpenseForm({
        category: 'renovation',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        vendor: '',
        description: '',
        receiptReference: '',
        paymentMethod: 'bank_transfer',
      });
      await loadProperties();
    } catch (err) {
      setExpenseError(err.message || 'Failed to record expense.');
    } finally {
      setIsSubmittingExpense(false);
    }
  }

  async function handleReverseExpense(e) {
    e.preventDefault();
    if (!reverseReason.trim() || reverseReason.trim().length < 5) {
      alert('Detailed reversal reason (at least 5 characters) is required.');
      return;
    }

    setIsReversing(true);
    try {
      await reversePropertyExpense(viewExpensesProp.id, reversingExpense.id || reversingExpense._id, {
        reason: reverseReason,
      });
      setReversingExpense(null);
      setReverseReason('');
      // Reload expenses list
      const list = await fetchPropertyExpenses(viewExpensesProp.id);
      setExpensesList(list || []);
      await loadProperties();
    } catch (err) {
      alert(err.message || 'Failed to reverse expense.');
    } finally {
      setIsReversing(false);
    }
  }

  async function handleCreateSale(e) {
    e.preventDefault();
    setSaleError(null);
    const amt = Number(saleForm.saleAmount);
    if (isNaN(amt) || amt <= 0) {
      setSaleError('Valid sale amount is required.');
      return;
    }
    if (!saleForm.buyerName.trim()) {
      setSaleError('Buyer full legal name is required.');
      return;
    }
    if (!saleForm.agreementReference.trim()) {
      setSaleError('Sale agreement reference is required.');
      return;
    }

    setIsSubmittingSale(true);
    try {
      await recordCompanyPropertySale(activeSaleProp.id, {
        buyer: {
          name: saleForm.buyerName,
          phone: saleForm.buyerPhone,
          email: saleForm.buyerEmail,
          address: saleForm.buyerAddress,
        },
        saleDate: saleForm.saleDate,
        saleAmount: amt,
        agreementReference: saleForm.agreementReference,
        paymentReceived: Number(saleForm.paymentReceived) || 0,
        internalRemarks: saleForm.internalRemarks,
      });
      setActiveSaleProp(null);
      await loadProperties();
    } catch (err) {
      setSaleError(err.message || 'Failed to record company property sale.');
    } finally {
      setIsSubmittingSale(false);
    }
  }

  // Summary Cards
  const totalPortfolioAcquisition = properties.reduce((acc, p) => acc + (p.acquisitionCost || 0), 0);
  const totalPortfolioExpenses = properties.reduce((acc, p) => acc + (p.totalExpenses || 0), 0);
  const totalPortfolioInvestment = properties.reduce((acc, p) => acc + (p.totalInvestment || 0), 0);
  const totalPortfolioProfit = properties.reduce(
    (acc, p) => acc + (p.sale ? p.sale.grossProfit || 0 : 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Company-Owned Asset <span className="text-amber-400">Financials & CapEx</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acquisition costs, renovation/maintenance expenses, total basis investment, and direct resale margins.
          </p>
        </div>

        <Link
          to="/admin/company-inventory"
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          Manage Company Inventory →
        </Link>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            Portfolio Acquisition Basis
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            <MoneyDisplay amount={totalPortfolioAcquisition} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Purchase cost in vault</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            Total CapEx & Expenses
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            <MoneyDisplay amount={totalPortfolioExpenses} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Registry, legal, renovation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            Total Basis Investment
          </span>
          <div className="mt-1 text-xl font-bold text-amber-400">
            <MoneyDisplay amount={totalPortfolioInvestment} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Acquisition + All Expenses</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            Realized Gross Profit
          </span>
          <div className="mt-1 text-xl font-bold text-emerald-400">
            <MoneyDisplay amount={totalPortfolioProfit} />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Before unrecorded tax/overheads</span>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading company property financials...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400">{error}</div>
        ) : properties.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            No company-owned properties found. Onboard company inventory in the Company Direct module.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Property</th>
                  <th className="py-3 px-3.5">Acquisition Cost</th>
                  <th className="py-3 px-3.5">Recorded Expenses</th>
                  <th className="py-3 px-3.5">Total Investment</th>
                  <th className="py-3 px-3.5">Sale Status</th>
                  <th className="py-3 px-3.5">Sale Revenue</th>
                  <th className="py-3 px-3.5">Gross Profit / Margin</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {properties.map((prop) => {
                  const isSold = Boolean(prop.sale);

                  return (
                    <tr key={prop.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3.5 max-w-xs">
                        <div className="font-semibold text-white truncate">{prop.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {prop.locality}, {prop.city}
                        </div>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-semibold text-slate-200">
                        <MoneyDisplay amount={prop.acquisitionCost} />
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-mono text-slate-300 font-semibold">
                          <MoneyDisplay amount={prop.totalExpenses} />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenExpenses(prop)}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer block mt-0.5"
                        >
                          View Ledger ({prop.expenseCount} items) →
                        </button>
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-amber-400">
                        <MoneyDisplay amount={prop.totalInvestment} />
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isSold ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Sold
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Catalogue Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono">
                        {isSold ? (
                          <div>
                            <span className="text-white font-bold">
                              <MoneyDisplay amount={prop.sale.saleAmount} />
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              Buyer: {prop.sale.buyerName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {isSold ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-400">
                              +<MoneyDisplay amount={prop.sale.grossProfit} />
                            </span>
                            <span className="block text-[11px] font-semibold text-emerald-400/90">
                              {prop.sale.grossMarginPercentage}% margin
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveExpenseProp(prop);
                              setExpenseError(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 cursor-pointer"
                          >
                            + Expense
                          </button>

                          {!isSold ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSaleProp(prop);
                                setSaleError(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                            >
                              Record Sale
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">Deed Executed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {activeExpenseProp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Record Property Expense / CapEx</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add registry, renovation, or holding expenses for{' '}
              <strong className="text-amber-400">{activeExpenseProp.title}</strong>.
            </p>

            {expenseError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {expenseError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="registration">Registration & Stamp Duty</option>
                    <option value="legal_documentation">Legal Clearance</option>
                    <option value="renovation">Renovation & Civil Work</option>
                    <option value="repair_maintenance">Repair & Maintenance</option>
                    <option value="interior_work">Interior Staging</option>
                    <option value="brokerage_paid">Brokerage Paid</option>
                    <option value="marketing">Marketing & Promotion</option>
                    <option value="utilities">Utilities & Holding</option>
                    <option value="other">Other Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    placeholder="e.g. 250000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    value={expenseForm.vendor}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, vendor: e.target.value })
                    }
                    placeholder="Contractor or agency name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Receipt / Invoice Ref
                  </label>
                  <input
                    type="text"
                    value={expenseForm.receiptReference}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, receiptReference: e.target.value })
                    }
                    placeholder="e.g. INV-2026-99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="bank_transfer">Bank Transfer (RTGS/NEFT)</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  placeholder="e.g. Terrace waterproofing and marble polishing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveExpenseProp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSubmittingExpense ? 'Recording...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expenses Drawer / Modal */}
      {viewExpensesProp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full text-slate-200 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Property Expenses Ledger — {viewExpensesProp.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Itemized capital expenditure and property improvements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewExpensesProp(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingExpenses ? (
                <div className="p-10 text-center text-slate-400">Loading expense records...</div>
              ) : expensesList.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No expenses recorded for this property yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description / Vendor</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expensesList.map((exp) => (
                      <tr key={exp.id || exp._id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-300">
                          {exp.category?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-white">{exp.description || '—'}</div>
                          <div className="text-[10px] text-slate-500">
                            {exp.vendor ? `Vendor: ${exp.vendor}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                          <MoneyDisplay amount={exp.amount} showFull />
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {!exp.isReversed ? (
                            <button
                              type="button"
                              onClick={() => {
                                setReversingExpense(exp);
                                setReverseReason('');
                              }}
                              className="text-rose-400 hover:text-rose-300 hover:underline font-semibold"
                            >
                              Reverse
                            </button>
                          ) : (
                            <span className="text-slate-500 italic">Reversed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewExpensesProp(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Expense Confirmation Modal */}
      {reversingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-400 mb-1">Reverse Property Expense</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reversing {reversingExpense.expenseReference} (₹
              {reversingExpense.amount?.toLocaleString('en-IN')}) will deduct it from total property
              investment.
            </p>

            <form onSubmit={handleReverseExpense} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Reversal *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Invoice cancelled by contractor / duplicate entry recorded..."
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

      {/* Record Sale Modal */}
      {activeSaleProp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Record Sale — {activeSaleProp.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Total Cost Basis: ₹{activeSaleProp.totalInvestment?.toLocaleString('en-IN')}. Enter
              executed sale deed details.
            </p>

            {saleError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {saleError}
              </div>
            )}

            <form onSubmit={handleCreateSale} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Sale Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleForm.saleAmount}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, saleAmount: e.target.value })
                    }
                    placeholder="e.g. 35000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sale Date</label>
                  <input
                    type="date"
                    value={saleForm.saleDate}
                    onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Dynamic Live Margin Preview */}
              {Number(saleForm.saleAmount) > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Calculated Gross Profit:</span>
                    <span
                      className={`font-mono font-bold ${
                        Number(saleForm.saleAmount) - activeSaleProp.totalInvestment >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      <MoneyDisplay
                        amount={Number(saleForm.saleAmount) - activeSaleProp.totalInvestment}
                      />
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Gross Margin:</span>
                    <span className="font-bold text-emerald-400">
                      {(
                        ((Number(saleForm.saleAmount) - activeSaleProp.totalInvestment) /
                          Number(saleForm.saleAmount)) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Buyer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={saleForm.buyerName}
                    onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })}
                    placeholder="Legal name of buyer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Buyer Phone</label>
                  <input
                    type="tel"
                    value={saleForm.buyerPhone}
                    onChange={(e) => setSaleForm({ ...saleForm, buyerPhone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Agreement Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={saleForm.agreementReference}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, agreementReference: e.target.value })
                    }
                    placeholder="e.g. MJE-SALE-DIR-2026-09"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Payment Received (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={saleForm.paymentReceived}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, paymentReceived: e.target.value })
                    }
                    placeholder="Full or advance amount"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Internal Remarks</label>
                <input
                  type="text"
                  value={saleForm.internalRemarks}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, internalRemarks: e.target.value })
                  }
                  placeholder="Registry office notes, bank DD references..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSaleProp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSale}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {isSubmittingSale ? 'Executing...' : 'Confirm Sale Execution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

