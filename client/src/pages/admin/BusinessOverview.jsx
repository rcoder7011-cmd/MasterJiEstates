import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FinancialStatCard from '../../components/admin/FinancialStatCard.jsx';
import DateRangeFilter from '../../components/admin/DateRangeFilter.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import { fetchBusinessOverview } from '../../services/api.js';

export default function BusinessOverview() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    document.title = 'Business Operations & Financials | MasterJiEstates Admin';
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchBusinessOverview({ range: dateRange });
        if (isMounted) setData(res);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load business overview.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  const metrics = data?.metrics || {};
  const recentTransactions = data?.recentTransactions || [];
  const dbConnected = data?.databaseStatus?.connected;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Executive Header Banner */}
      <div className="bg-[#0A192F] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold mb-3">
            <span
              className={`w-2 h-2 rounded-full ${
                dbConnected ? 'bg-emerald-400' : 'bg-amber-400'
              } animate-pulse`}
            />
            <span className="text-slate-300">
              Database:{' '}
              <strong className={dbConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {dbConnected ? 'MongoDB Atlas (Online)' : 'In-Memory Fallback (Offline Mode)'}
              </strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Business Operations & <span className="text-amber-400">Financial Ledger</span>
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Real-time tracking of facilitated brokerage deals, commission realizations, company-owned
            asset CapEx, direct margins, and operational expenditures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter range={dateRange} onChange={setDateRange} />
          <Link
            to="/admin/deals"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all duration-150 inline-flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Brokerage Deals</span>
          </Link>
          <Link
            to="/admin/financial-reports"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Reports & CSV
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Aggregating financial ledger data from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Section 1: Brokerage Pipeline & Commissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                Brokerage Transactions & Commissions
              </h2>
              <Link to="/admin/commission-ledger" className="text-xs text-amber-400 hover:underline">
                View Commission Ledger →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialStatCard
                title="Active Brokerage Deals"
                amount={metrics.totalActiveDeals}
                isCurrency={false}
                subtext={`${metrics.completedDealsCount} completed deals registered`}
                badgeText="Pipeline"
                badgeColor="blue"
              />
              <FinancialStatCard
                title="Agreed Commission"
                amount={metrics.totalCommissionAgreed}
                subtext="Total contracted brokerage"
                badgeText="Contracted"
                badgeColor="purple"
              />
              <FinancialStatCard
                title="Commission Received"
                amount={metrics.totalCommissionReceived}
                subtext="Realized bank settlements"
                badgeText="Collected"
                badgeColor="emerald"
              />
              <FinancialStatCard
                title="Outstanding Commission"
                amount={metrics.outstandingCommission}
                subtext={`${metrics.pendingPaymentsCount} pending deal receivables`}
                badgeText="Receivable"
                badgeColor="amber"
              />
            </div>
          </div>

          {/* Section 2: Company-Owned Portfolio Financials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                Company-Owned Direct Asset Trading
              </h2>
              <Link to="/admin/company-financials" className="text-xs text-amber-400 hover:underline">
                View Asset Financials →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialStatCard
                title="Acquisition Cost Basis"
                amount={metrics.totalCompanyAcquisitionCost}
                subtext="Direct purchase capital"
                badgeText="Asset Base"
                badgeColor="slate"
              />
              <FinancialStatCard
                title="Asset CapEx & Expenses"
                amount={metrics.totalCompanyExpenses}
                subtext="Registry, legal, renovation"
                badgeText="Holding / Renovation"
                badgeColor="slate"
              />
              <FinancialStatCard
                title="Sales Revenue"
                amount={metrics.totalCompanySalesRevenue}
                subtext="Executed resale receipts"
                badgeText="Revenue"
                badgeColor="emerald"
              />
              <FinancialStatCard
                title="Realized Gross Profit"
                amount={metrics.grossProfitCompanySales}
                subtext="Before unrecorded tax/overheads"
                badgeText="Gross Margin"
                badgeColor="emerald"
              />
            </div>
          </div>

          {/* Section 3: Operating Expenditures & Unsold Asset Capital */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  General Operating Expenses
                </span>
                <div className="mt-2 text-2xl font-bold text-white">
                  <MoneyDisplay amount={metrics.totalGeneralExpenses} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Office rent, technology, advertising, utilities, and general administration.
                </p>
              </div>
              <Link
                to="/admin/expenses"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Manage Expenses →
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Unsold Company Inventory Investment
                </span>
                <div className="mt-2 text-2xl font-bold text-amber-400">
                  <MoneyDisplay amount={metrics.unsoldAcquisitionCost} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Active capital allocated to unsold company-owned properties in catalogue.
                </p>
              </div>
              <Link
                to="/admin/company-inventory"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Company Inventory →
              </Link>
            </div>
          </div>

          {/* Section 4: Recent Financial Transactions Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Financial Transactions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time stream of incoming commission payments, asset expenditures, and revenue receipts.
                </p>
              </div>
              <Link to="/admin/commission-ledger" className="text-xs text-amber-400 hover:underline">
                All Transactions →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No financial transactions recorded for the selected period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Transaction</th>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Party / Payer</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentTransactions.map((tx, idx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <tr key={tx.id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                            {tx.title}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                            {tx.reference}
                          </td>
                          <td className="py-3 px-3 text-slate-300 capitalize">{tx.payer || '—'}</td>
                          <td className="py-3 px-3 text-slate-400 capitalize">
                            {tx.method?.replace(/_/g, ' ') || 'Bank Transfer'}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                              isCredit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isCredit ? '+' : ''}
                            <MoneyDisplay amount={tx.amount} showFull />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

