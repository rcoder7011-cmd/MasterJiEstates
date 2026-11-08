import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../components/admin/DateRangeFilter.jsx';
import MoneyDisplay from '../../components/admin/MoneyDisplay.jsx';
import { fetchFinancialReports, downloadReportCsv } from '../../services/api.js';

export default function FinancialReports() {
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingType, setDownloadingType] = useState(null);

  useEffect(() => {
    document.title = 'Financial Reports & Analytics | MasterJiEstates Admin';
    loadReports();
  }, [dateRange]);

  async function loadReports() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFinancialReports({ range: dateRange });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load financial reports.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadCsv(reportType) {
    setDownloadingType(reportType);
    try {
      await downloadReportCsv(reportType, { range: dateRange });
    } catch (err) {
      alert(err.message || 'Failed to download CSV report.');
    } finally {
      setDownloadingType(null);
    }
  }

  const overview = data?.overview || {};
  const dealsByStatus = data?.brokerageReports?.dealsByStatus || {};
  const commissionByPayer = data?.brokerageReports?.commissionByPayer || {};
  const expensesByCategory = data?.businessExpenseReports?.expensesByCategory || {};

  const csvReports = [
    {
      id: 'brokerage_deals',
      title: 'Brokerage Deals Pipeline',
      description: 'Complete inventory of facilitated deals, counterparties, values, and agreed brokerage.',
      icon: '🤝',
    },
    {
      id: 'commission_ledger',
      title: 'Commission Payment Realizations',
      description: 'Audit log of all realized bank transfers, UTR numbers, and payment method breakdowns.',
      icon: '💳',
    },
    {
      id: 'company_sales',
      title: 'Company Asset Resale & Margins',
      description: 'Acquisition costs, CapEx investment, executed resale amounts, and gross margin yields.',
      icon: '🏢',
    },
    {
      id: 'business_expenses',
      title: 'Operating Expenses Ledger',
      description: 'Detailed operating expenses by category, vendor, payment method, and receipt reference.',
      icon: '📑',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Financial Analytics & <span className="text-amber-400">Executive Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified database financial aggregates, distribution metrics, and authorized CSV downloads.
          </p>
        </div>

        <DateRangeFilter range={dateRange} onChange={setDateRange} />
      </div>

      {/* CSV Export Cards */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Authorized CSV Report Exports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {csvReports.map((rep) => {
            const isDownloading = downloadingType === rep.id;
            return (
              <div
                key={rep.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="text-2xl mb-2">{rep.icon}</div>
                  <h3 className="font-bold text-white text-xs mb-1">{rep.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rep.description}</p>
                </div>

                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDownloadCsv(rep.id)}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>{isDownloading ? 'Generating...' : '⬇ Export CSV'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Computing report analytics from database...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deals by Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400">
              Deals by Pipeline Stage
            </h3>

            {Object.keys(dealsByStatus).length === 0 ? (
              <p className="text-slate-500 italic py-6 text-center">No deal data in period.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(dealsByStatus).map(([st, count]) => (
                  <div
                    key={st}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="capitalize text-slate-300 font-medium">
                      {st.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-amber-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commission by Payer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Commission Agreed by Payer
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Seller Obligations</span>
                <span className="font-mono font-bold text-emerald-400">
                  <MoneyDisplay amount={commissionByPayer.seller || 0} />
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Buyer Obligations</span>
                <span className="font-mono font-bold text-emerald-400">
                  <MoneyDisplay amount={commissionByPayer.buyer || 0} />
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Shared (Both)</span>
                <span className="font-mono font-bold text-emerald-400">
                  <MoneyDisplay amount={commissionByPayer.both || 0} />
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Total Agreed:</span>
              <span className="text-sm font-bold text-white">
                <MoneyDisplay amount={overview.totalCommissionAgreed || 0} />
              </span>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-rose-400">
              Operating Expenses Breakdown
            </h3>

            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-slate-500 italic py-6 text-center">No expense data in period.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(expensesByCategory).map(([cat, amt]) => (
                  <div
                    key={cat}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="capitalize text-slate-300 font-medium">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      <MoneyDisplay amount={amt} />
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Total Operating Expenses:</span>
              <span className="text-sm font-bold text-rose-400">
                <MoneyDisplay amount={overview.totalGeneralExpenses || 0} />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

