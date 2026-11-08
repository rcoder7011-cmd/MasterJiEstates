import React from 'react';

export default function PageLoader() {
  return (
    <div
      aria-label="Loading page content"
      role="status"
      className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 select-none"
    >
      <div className="relative w-12 h-12 mb-4">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        {/* Animated Gold Arc */}
        <div className="absolute inset-0 rounded-full border-4 border-brand-gold border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
        MasterJiEstates
      </p>
    </div>
  );
}

