import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminHeader({ onToggleMobile }) {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/admin') return 'Executive Overview';
    if (pathname.startsWith('/admin/moderation/')) return 'Property Review & Verification';
    if (pathname === '/admin/moderation') return 'Property Moderation Queue';
    if (pathname === '/admin/properties') return 'Property Inventory Management';
    if (pathname === '/admin/company-inventory') return 'MasterJi Direct (Company Portfolio)';
    if (pathname === '/admin/users') return 'Registered User Directory';
    if (pathname === '/admin/enquiries') return 'Lead CRM & Inquiries';
    if (pathname === '/admin/site-visits') return 'Site Visits Dispatch Schedule';
    if (pathname === '/admin/activity-logs') return 'Audit Activity Logs';
    return 'Admin Back-Office';
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex-shrink-0"
          aria-label="Open navigation sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold font-serif text-[#0A192F] truncate">
            {getPageTitle(location.pathname)}
          </h1>
          <div className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
            <span>Admin Portal</span> • <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick shortcuts & user indicator */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/properties"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <span>All Properties</span>
        </Link>

        <Link
          to="/admin/moderation"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
        >
          <span>⚡ Review Queue</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0A192F] text-amber-400 font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">
            {user?.fullName || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}

