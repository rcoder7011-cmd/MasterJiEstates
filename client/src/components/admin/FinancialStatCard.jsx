import React from 'react';
import MoneyDisplay from './MoneyDisplay.jsx';

export default function FinancialStatCard({
  title,
  amount,
  isCurrency = true,
  subtext,
  badgeText,
  badgeColor = 'amber',
  icon,
  className = '',
}) {
  const badgeClasses = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  }[badgeColor] || 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden transition-all duration-200 hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold text-white tracking-tight">
            {isCurrency ? (
              <MoneyDisplay amount={amount} className="text-2xl" />
            ) : (
              <span>{amount}</span>
            )}
          </div>
        </div>

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtext || badgeText) && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {badgeText && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClasses}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

