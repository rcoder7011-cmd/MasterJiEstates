import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function DashboardHeader({ onToggleMobile }) {
  const { user } = useAuth();

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Valued Client';
  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger button + Greeting */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold flex-shrink-0"
          aria-label="Toggle navigation drawer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-brand-navy leading-tight flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="truncate">Welcome, {firstName}</span>
            {user?.role && user.role !== 'user' && (
              <Badge variant={user.role === 'admin' ? 'brand' : 'outline'} size="sm" className="flex-shrink-0 text-[10px]">
                {user.role.toUpperCase()}
              </Badge>
            )}
          </h1>
          <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
            {todayStr} • MasterJi Estates Unified Portal
          </p>
        </div>
      </div>

      {/* Right side: Quick links & User Avatar */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-navy transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Main Site</span>
        </Link>

        <Link
          to="/dashboard/settings"
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="Account Settings"
        >
          <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-gold border border-brand-gold/40 flex items-center justify-center text-xs font-bold shadow-xs">
            {getInitials(user?.fullName)}
          </div>
        </Link>
      </div>
    </header>
  );
}

