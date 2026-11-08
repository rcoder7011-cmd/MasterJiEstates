import React from 'react';

export default function PaymentStatusBadge({ status, isReversed, className = '' }) {
  if (isReversed) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}
      >
        Reversed
      </span>
    );
  }

  const configs = {
    paid: {
      label: 'Paid / Realized',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    partially_paid: {
      label: 'Partially Paid',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    pending: {
      label: 'Pending Settlement',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  };

  const config = configs[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Recorded',
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
}

