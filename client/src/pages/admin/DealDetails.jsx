import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DealStatusBadge from '../../components/admin/DealStatusBadge.jsx';
import PaymentStatusBadge from '../../components/admin/PaymentStatusBadge.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import {
  fetchBrokerageDealById,
  updateBrokerageDeal,
  updateCommissionAgreement,
  recordCommissionPayment,
  reverseCommissionPayment,
} from '../../services/api.js';

export default function DealDetails() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Switcher
  const [statusVal, setStatusVal] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Value update
  const [actualVal, setActualVal] = useState('');
  const [isUpdatingVal, setIsUpdatingVal] = useState(false);

  // Commission Revision Modal
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commData, setCommData] = useState({
    commissionType: 'percentage',
    percentageRate: 2,
    fixedAmount: '',
    payer: 'seller',
    documentReference: '',
    revisionReason: '',
  });
  const [isSavingComm, setIsSavingComm] = useState(false);
  const [commError, setCommError] = useState(null);

  // Record Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payData, setPayData] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionNumber: '',
    receivedFrom: 'seller',
    payerName: '',
    internalRemarks: '',
  });
  const [isSavingPay, setIsSavingPay] = useState(false);
  const [payError, setPayError] = useState(null);

  // Reverse Payment Modal
  const [reversingPayment, setReversingPayment] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState(null);

  useEffect(() => {
    document.title = 'Deal Details | MasterJiEstates Admin';
    loadDeal();
  }, [id]);

  async function loadDeal() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchBrokerageDealById(id);
      setDeal(res);
      setStatusVal(res.status);
      setActualVal(res.actualTransactionValue || '');
      setCommData({
        commissionType: res.commissionAgreement?.commissionType || 'percentage',
        percentageRate: res.commissionAgreement?.percentageRate || 2,
        fixedAmount: res.commissionAgreement?.fixedAmount || '',
        payer: res.commissionAgreement?.payer || 'seller',
        documentReference: res.commissionAgreement?.documentReference || '',
        revisionReason: '',
      });
      setPayData((prev) => ({
        ...prev,
        amount: res.outstandingCommission || '',
        receivedFrom: res.commissionAgreement?.payer === 'buyer' ? 'buyer' : 'seller',
        payerName:
          res.commissionAgreement?.payer === 'buyer' ? res.buyer?.name : res.seller?.name,
      }));
    } catch (err) {
      setError(err.message || 'Failed to load deal record.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setIsUpdatingStatus(true);
    try {
      await updateBrokerageDeal(deal.id || deal._id, { status: newStatus });
      await loadDeal();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleUpdateActualValue(e) {
    e.preventDefault();
    setIsUpdatingVal(true);
    try {
      await updateBrokerageDeal(deal.id || deal._id, {
        actualTransactionValue: Number(actualVal) || 0,
      });
      await loadDeal();
    } catch (err) {
      alert(err.message || 'Failed to update transaction value.');
    } finally {
      setIsUpdatingVal(false);
    }
  }

  async function handleSaveCommission(e) {
    e.preventDefault();
    setCommError(null);
    if (!commData.revisionReason.trim()) {
      setCommError('A reason for revising commission terms is required.');
      return;
    }

    setIsSavingComm(true);
    try {
      await updateCommissionAgreement(deal.id || deal._id, {
        commissionType: commData.commissionType,
        percentageRate: Number(commData.percentageRate) || 0,
        fixedAmount: Number(commData.fixedAmount) || 0,
        payer: commData.payer,
        documentReference: commData.documentReference,
        revisionReason: commData.revisionReason,
      });
      setShowCommissionModal(false);
      await loadDeal();
    } catch (err) {
      setCommError(err.message || 'Failed to update commission terms.');
    } finally {
      setIsSavingComm(false);
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    setPayError(null);
    const amt = Number(payData.amount);
    if (isNaN(amt) || amt <= 0) {
      setPayError('Valid payment amount is required.');
      return;
    }

    setIsSavingPay(true);
    try {
      await recordCommissionPayment(deal.id || deal._id, {
        amount: amt,
        paymentMethod: payData.paymentMethod,
        transactionNumber: payData.transactionNumber,
        receivedFrom: payData.receivedFrom,
        payerName: payData.payerName,
        internalRemarks: payData.internalRemarks,
      });
      setShowPayModal(false);
      await loadDeal();
    } catch (err) {
      setPayError(err.message || 'Failed to record payment.');
    } finally {
      setIsSavingPay(false);
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
      await loadDeal();
    } catch (err) {
      setReverseError(err.message || 'Failed to reverse payment.');
    } finally {
      setIsReversing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading deal details...</p>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
        {error || 'Deal not found.'}
        <div className="mt-3">
          <Link to="/admin/deals" className="text-xs text-amber-400 hover:underline">
            ← Return to Brokerage Deals
          </Link>
        </div>
      </div>
    );
  }

  const commission = deal.commissionAgreement || {};
  const payments = deal.payments || [];
  const revisions = commission.revisionHistory || [];

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      {/* Back and Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/deals"
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
        >
          <span>←</span>
          <span>Back to Deals Pipeline</span>
        </Link>
        <span className="font-mono text-slate-500">Ref: {deal.dealReference}</span>
      </div>

      {/* Header Card */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DealStatusBadge status={deal.status} />
            <span className="text-[11px] text-slate-400 font-mono">
              Created: {deal.dealDate ? new Date(deal.dealDate).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            {deal.propertyTitle}
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Facilitated Transaction in <strong className="text-amber-400">{deal.propertyCity}</strong>
          </p>
        </div>

        {/* Status Transition Control */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2 min-w-[220px]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Deal Lifecycle Status
          </span>
          <select
            value={statusVal}
            disabled={isUpdatingStatus}
            onChange={(e) => {
              setStatusVal(e.target.value);
              handleStatusChange(e.target.value);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-400 font-bold focus:outline-none cursor-pointer"
          >
            <option value="lead">New Lead</option>
            <option value="negotiation">In Negotiation</option>
            <option value="agreement_pending">Agreement Pending</option>
            <option value="agreement_signed">Agreement Signed</option>
            <option value="transaction_in_progress">Transaction in Progress</option>
            <option value="completed">Completed / Registered</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Top 3-Card Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transaction Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-slate-400 uppercase font-semibold text-[11px] block">
            Transaction Value
          </span>
          <div className="mt-2 text-xl font-bold text-white">
            <MoneyDisplay
              amount={
                deal.actualTransactionValue > 0
                  ? deal.actualTransactionValue
                  : deal.expectedTransactionValue
              }
              className="text-xl"
            />
          </div>
          <div className="mt-2 text-slate-400 text-[11px] flex items-center justify-between">
            <span>
              {deal.actualTransactionValue > 0 ? 'Confirmed Deed Value' : 'Estimated Asking Value'}
            </span>
            {deal.actualTransactionValue === 0 && (
              <span className="text-amber-400 font-medium">Pending Registration</span>
            )}
          </div>

          <form onSubmit={handleUpdateActualValue} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="number"
              min="0"
              value={actualVal}
              onChange={(e) => setActualVal(e.target.value)}
              placeholder="Actual Value (₹)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
            />
            <button
              type="submit"
              disabled={isUpdatingVal}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg border border-slate-700 whitespace-nowrap cursor-pointer"
            >
              Update
            </button>
          </form>
        </div>

        {/* Contracted Commission */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-semibold text-[11px]">
              Agreed Commission
            </span>
            <button
              type="button"
              onClick={() => setShowCommissionModal(true)}
              className="text-amber-400 hover:underline font-semibold text-[11px] cursor-pointer"
            >
              ✎ Revise Terms
            </button>
          </div>
          <div className="mt-2 text-xl font-bold text-white">
            <MoneyDisplay amount={commission.agreedAmount || 0} className="text-xl" />
          </div>
          <div className="mt-2 text-slate-400 text-[11px]">
            {commission.commissionType === 'percentage'
              ? `${commission.percentageRate}% commission (${commission.payer} pays)`
              : `Fixed ₹${commission.fixedAmount} (${commission.payer} pays)`}
            {commission.isEstimated && (
              <span className="text-amber-400 block mt-0.5 font-medium">
                * Estimated from expected value
              </span>
            )}
          </div>
        </div>

        {/* Realized vs Outstanding */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-slate-400 uppercase font-semibold text-[11px] block">
            Collection Status
          </span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-semibold block">Collected</span>
              <MoneyDisplay
                amount={deal.totalReceivedCommission || 0}
                className="text-lg text-emerald-400"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-400 font-semibold block">Outstanding</span>
              <MoneyDisplay
                amount={deal.outstandingCommission || 0}
                className="text-lg text-amber-400"
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setShowPayModal(true)}
              className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold text-center cursor-pointer shadow-sm"
            >
              + Record Commission Payment
            </button>
          </div>
        </div>
      </div>

      {/* Counterparties & Internal Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seller & Buyer Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
            Counterparty Identities
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Seller (Owner)
              </span>
              <div className="mt-1 font-semibold text-white">{deal.seller?.name || '—'}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">{deal.seller?.phone || 'No phone'}</div>
              <div className="text-slate-500 text-[11px] truncate">{deal.seller?.email || 'No email'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Buyer (Client)
              </span>
              <div className="mt-1 font-semibold text-white">{deal.buyer?.name || '—'}</div>
              <div className="text-slate-400 font-mono text-[11px] mt-0.5">{deal.buyer?.phone || 'No phone'}</div>
              <div className="text-slate-500 text-[11px] truncate">{deal.buyer?.email || 'No email'}</div>
            </div>
          </div>
        </div>

        {/* Agreement Details & Internal Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
            Mandate & Documentation
          </h3>
          <div className="text-slate-300 space-y-1">
            <div>
              <span className="text-slate-500 font-semibold">Mandate Document Ref: </span>
              <span className="font-mono text-slate-200">
                {commission.documentReference || 'Pending Reference'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Agreement Date: </span>
              <span>
                {commission.agreementDate
                  ? new Date(commission.agreementDate).toLocaleDateString('en-IN')
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Responsible Admin: </span>
              <span>{deal.responsibleAdmin?.name || 'Administrator'}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Internal Advisory Notes:
            </span>
            <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
              {deal.internalNotes || 'No internal notes recorded for this transaction.'}
            </p>
          </div>
        </div>
      </div>

      {/* Commission Payment Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Commission Payment Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited payment entries and bank realization logs for this deal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPayModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 cursor-pointer"
          >
            + Add Payment Entry
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No payments recorded yet for this brokerage deal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">UTR / Cheque No</th>
                  <th className="py-2.5 px-3">Payer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => {
                  const pId = p.id || p._id;
                  return (
                    <tr key={pId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{p.paymentReference}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                        <MoneyDisplay amount={p.amount} showFull />
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 capitalize">
                        {p.paymentMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {p.transactionNumber || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 capitalize">
                        {p.payerName ? `${p.payerName} (${p.receivedFrom})` : p.receivedFrom}
                      </td>
                      <td className="py-2.5 px-3">
                        <PaymentStatusBadge status={p.status} isReversed={p.isReversed} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
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
      </div>

      {/* Revision History */}
      {revisions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Commission Agreement Revision History
          </h3>
          <div className="space-y-2">
            {revisions.map((rev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-slate-200">
                    Reason: {rev.reason || 'Commission terms updated'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Previous Agreed: ₹{(rev.previousTerms?.agreedAmount || 0).toLocaleString('en-IN')} (
                    {rev.previousTerms?.commissionType === 'percentage'
                      ? `${rev.previousTerms?.percentageRate}%`
                      : 'Fixed'}
                    )
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                  <div>{rev.revisedBy?.adminName || 'Admin'}</div>
                  <div>{rev.revisedAt ? new Date(rev.revisedAt).toLocaleString('en-IN') : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revise Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2">Revise Commission Terms</h3>
            <p className="text-xs text-slate-400 mb-4">
              All revisions preserve previous values in the deal revision history and append an audit event.
            </p>

            {commError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {commError}
              </div>
            )}

            <form onSubmit={handleSaveCommission} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select
                    value={commData.commissionType}
                    onChange={(e) =>
                      setCommData({ ...commData, commissionType: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {commData.commissionType === 'percentage' ? (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={commData.percentageRate}
                      onChange={(e) =>
                        setCommData({ ...commData, percentageRate: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fixed Amount (₹)</label>
                    <input
                      type="number"
                      value={commData.fixedAmount}
                      onChange={(e) =>
                        setCommData({ ...commData, fixedAmount: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payer</label>
                  <select
                    value={commData.payer}
                    onChange={(e) => setCommData({ ...commData, payer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="seller">Seller Pays</option>
                    <option value="buyer">Buyer Pays</option>
                    <option value="both">Both (Shared)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Document Ref</label>
                  <input
                    type="text"
                    value={commData.documentReference}
                    onChange={(e) =>
                      setCommData({ ...commData, documentReference: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Revision *
                </label>
                <textarea
                  required
                  rows="2"
                  value={commData.revisionReason}
                  onChange={(e) =>
                    setCommData({ ...commData, revisionReason: e.target.value })
                  }
                  placeholder="e.g. Rate renegotiated with seller from 2% to 1.5% due to expedited closing."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingComm}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {isSavingComm ? 'Saving...' : 'Apply Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2">Record Commission Payment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Log bank receipt or cheque credit. Cannot exceed current outstanding balance of ₹
              {(deal.outstandingCommission || 0).toLocaleString('en-IN')}.
            </p>

            {payError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {payError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={deal.outstandingCommission}
                    required
                    value={payData.amount}
                    onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Payment Method</label>
                  <select
                    value={payData.paymentMethod}
                    onChange={(e) => setPayData({ ...payData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="upi">UPI Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash Receipt</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    UTR / Cheque / Tx Number
                  </label>
                  <input
                    type="text"
                    value={payData.transactionNumber}
                    onChange={(e) =>
                      setPayData({ ...payData, transactionNumber: e.target.value })
                    }
                    placeholder="e.g. HDFCR52026110..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Received From</label>
                  <select
                    value={payData.receivedFrom}
                    onChange={(e) => setPayData({ ...payData, receivedFrom: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Internal Remarks</label>
                <input
                  type="text"
                  value={payData.internalRemarks}
                  onChange={(e) => setPayData({ ...payData, internalRemarks: e.target.value })}
                  placeholder="e.g. Tranche 1 of 2 received upon sale deed registry."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPay}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  {isSavingPay ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Payment Modal */}
      {reversingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-200 shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-400 mb-1">Reverse Payment Entry</h3>
            <p className="text-xs text-slate-400 mb-4">
              Reversing {reversingPayment.paymentReference} (₹
              {reversingPayment.amount?.toLocaleString('en-IN')}) will restore the deal outstanding balance
              and log an immutable audit event.
            </p>

            {reverseError && (
              <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {reverseError}
              </div>
            )}

            <form onSubmit={handleReversePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reason for Reversal *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  placeholder="e.g. Cheque returned unpaid by drawee bank / duplicate entry recorded in error."
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
