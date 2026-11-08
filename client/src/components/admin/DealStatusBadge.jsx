import React from 'react';

export default function DealStatusBadge({ status, className = '' }) {
  const configs = {
    lead: {
      label: 'New Lead',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    negotiation: {
      label: 'In Negotiation',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    agreement_pending: {
      label: 'Agreement Pending',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    agreement_signed: {
      label: 'Agreement Signed',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    transaction_in_progress: {
      label: 'In Progress',
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    completed: {
      label: 'Completed / Registered',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    on_hold: {
      label: 'On Hold',
      bg: 'bg-slate-500/15 text-slate-400 border-slate-600/30',
    },
  };

  const config = configs[status] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
}

