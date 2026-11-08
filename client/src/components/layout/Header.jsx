import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import Logo from '../common/Logo.jsx';
import { WhatsAppIcon } from '../common/WhatsAppButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../../config/companyConfig.js';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Scroll detection for subtle elevation on scroll without layout shift
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-close drawer on viewport resize to desktop (>= 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Lock background scrolling and handle Escape key dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // 6 Primary Navigation Links specified in requirements
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Properties', path: '/properties' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ];

  // Helper to determine active route match
  const isRouteActive = useCallback(
    (itemPath) => {
      if (itemPath === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(itemPath);
    },
    [location.pathname]
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-200 ${
        isScrolled
          ? 'border-slate-200/90 shadow-subtle'
          : 'border-slate-100 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 xl:gap-6">
          
          {/* =========================================================
              1. LEFT: Company Logo & MasterJiEstates Branding
              ========================================================= */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          {/* =========================================================
              2. CENTER: Desktop Navigation Links (Desktop: xl+)
              ========================================================= */}
          <nav
            className="hidden xl:flex items-center justify-center gap-1.5 2xl:gap-3 flex-1 min-w-0 px-2"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active = isRouteActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                    active
                      ? 'text-brand-navy font-bold bg-brand-navy/5 shadow-2xs'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100/80'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* =========================================================
              3. RIGHT: Desktop Actions & Authentication (Desktop: xl+)
              ========================================================= */}
          <div className="hidden xl:flex items-center justify-end gap-2.5 2xl:gap-3 flex-shrink-0">
            
            {/* WhatsApp Action Button — Strictly Icon Only with Green Treatment & Accessible Tooltip */}
            <a
              href={getWhatsAppUrl('navbar')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with MasterJiEstates on WhatsApp"
              title="Chat with MasterJiEstates on WhatsApp"
              className="relative group w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all duration-150 shadow-xs hover:shadow-md hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 flex-shrink-0"
            >
              <WhatsAppIcon className="w-5 h-5 text-white fill-current" />
              {/* Accessible hover tooltip with zero phone number display */}
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md whitespace-nowrap z-50">
                WhatsApp
              </span>
            </a>

            {/* Add Property Action Button — Text Color Strictly BLACK (#000000) on Gold Background */}
            <Link
              to={isAuthenticated ? "/dashboard/listings/new" : "/login"}
              state={!isAuthenticated ? { from: { pathname: '/dashboard/listings/new' } } : undefined}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-9 rounded-full bg-brand-gold hover:bg-brand-gold-dark text-black font-bold text-xs shadow-xs transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              style={{ color: '#000000' }}
              title="Post a New Property Listing"
            >
              <span className="text-sm font-black leading-none" style={{ color: '#000000' }}>+</span>
              <span style={{ color: '#000000' }}>Add Property</span>
            </Link>

            {/* User Authentication & Dashboard Links */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 xl:gap-2">
                {/* User Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3 py-1.5 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-brand-gold/40 rounded-full transition-all group shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  title="Open Unified User Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-navy text-brand-gold flex items-center justify-center text-[10px] font-bold shadow-xs flex-shrink-0">
                    {getInitials(user?.fullName)}
                  </div>
                  <span className="text-xs font-semibold text-brand-navy max-w-[85px] xl:max-w-[110px] truncate">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[11px] font-bold text-brand-gold group-hover:underline hidden xl:inline">
                    Dashboard
                  </span>
                  {user?.role && user.role !== 'user' && (
                    <Badge variant={user.role === 'admin' ? 'brand' : 'outline'} size="sm">
                      {user.role.toUpperCase()}
                    </Badge>
                  )}
                </Link>

                {/* Back-Office Shortcut if Admin */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 h-9 bg-[#0A192F] text-amber-400 hover:bg-[#112340] border border-amber-400/40 rounded-full text-xs font-bold transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title="Open Admin Back-Office Suite"
                  >
                    <span>⚡ Admin</span>
                  </Link>
                )}

                {/* Sign Out Action */}
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center px-2.5 py-1.5 h-9 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  title="Sign Out of Your Account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-brand-navy hover:bg-slate-100"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-9 px-3.5 text-xs font-bold shadow-xs whitespace-nowrap"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* =========================================================
              4. MOBILE / TABLET HEADER CLUSTER (Visible on < 1280px)
              ========================================================= */}
          <div className="flex xl:hidden items-center gap-1.5 sm:gap-2">
            
            {/* Quick WhatsApp Direct Tap — Icon Only with Green Treatment */}
            <a
              href={getWhatsAppUrl('navbar')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with MasterJiEstates on WhatsApp"
              title="Chat with MasterJiEstates on WhatsApp"
              className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all duration-150 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] flex-shrink-0"
            >
              <WhatsAppIcon className="w-5 h-5 text-white fill-current" />
            </a>

            {/* Quick Add Property Tap — Text Color Strictly BLACK (#000000) on Gold Background */}
            <Link
              to={isAuthenticated ? "/dashboard/listings/new" : "/login"}
              state={!isAuthenticated ? { from: { pathname: '/dashboard/listings/new' } } : undefined}
              aria-label="Add Property Listing"
              className="h-9 px-2.5 sm:px-3 rounded-full bg-brand-gold hover:bg-brand-gold-dark text-black font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              style={{ color: '#000000' }}
            >
              <span className="text-base font-black leading-none" style={{ color: '#000000' }}>+</span>
              <span className="hidden sm:inline" style={{ color: '#000000' }}>Add</span>
            </Link>

            {/* Functional Hamburger Menu Button (Three Lines Closed, 'X' Open) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-10 h-10 rounded-xl text-slate-700 hover:text-brand-navy hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* =============================================================
          5. MOBILE NAVIGATION SLIDE-OVER DRAWER (Portal to document.body)
          Escapes header backdrop-filter containing block; NO duplicate logo!
          ============================================================= */}
      {typeof document !== 'undefined' &&
        mobileMenuOpen &&
        createPortal(
          <div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="fixed inset-0 z-[9999] flex justify-end"
          >
            {/* Backdrop with Click-Outside to Dismiss */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-Over Drawer Content */}
            <div className="relative w-full max-w-[340px] sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
              
              {/* Drawer Top: Simple Close Icon (NO Duplicate Logo) */}
              <div>
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <span className="text-sm font-bold text-brand-navy tracking-wide">
                    Navigation Menu
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    aria-label="Close navigation menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Drawer Navigation Links */}
                <nav className="p-4 space-y-1" aria-label="Mobile Menu Links">
                  {navLinks.map((link) => {
                    const active = isRouteActive(link.path);
                    return (
                      <Link
                        key={link.label}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                          active
                            ? 'bg-brand-navy text-white shadow-xs'
                            : 'text-slate-700 hover:text-brand-navy hover:bg-slate-50'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${active ? 'text-brand-gold' : 'text-slate-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </nav>

                {/* Direct Touchpoints (Phone & WhatsApp — strictly no phone number string on WhatsApp) */}
                <div className="px-4 py-3 mx-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Immediate Advisory Help
                  </span>

                  <a
                    href={COMPANY_CONFIG.phoneTel}
                    className="flex items-center gap-2.5 py-1.5 text-slate-800 hover:text-brand-navy font-semibold transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs">
                      📞
                    </span>
                    <span>Call: {COMPANY_CONFIG.phoneDisplay}</span>
                  </a>

                  <a
                    href={getWhatsAppUrl('navbar')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with MasterJiEstates on WhatsApp"
                    className="flex items-center gap-2.5 py-1.5 text-[#075E54] hover:text-[#05443c] font-bold transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center text-xs text-white shadow-2xs">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-white fill-current" />
                    </span>
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Drawer Bottom: User Status & Conversion CTAs */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* User Profile Mini-Card */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <div className="w-10 h-10 rounded-full bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                        {getInitials(user?.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-brand-navy truncate">
                          {user?.fullName || 'User'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {user?.email || ''}
                        </div>
                      </div>
                      {user?.role && user.role !== 'user' && (
                        <Badge variant={user.role === 'admin' ? 'brand' : 'outline'} size="sm">
                          {user.role.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons: Add Property (black text!) & Dashboard */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/dashboard/listings/new"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 px-3 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-black font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                        style={{ color: '#000000' }}
                      >
                        <span className="text-sm font-black" style={{ color: '#000000' }}>+</span>
                        <span style={{ color: '#000000' }}>Add Property</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 px-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Dashboard
                      </Link>
                    </div>

                    {/* Back-Office Link if Admin */}
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2 px-3 rounded-xl bg-[#0A192F] text-amber-400 hover:bg-[#112340] border border-amber-400/40 font-bold text-xs shadow-xs transition-colors block"
                      >
                        ⚡ Open Admin Portal
                      </Link>
                    )}

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      state={{ from: { pathname: '/dashboard/listings/new' } }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 px-3 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-black font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                      style={{ color: '#000000' }}
                    >
                      <span className="text-sm font-black" style={{ color: '#000000' }}>+</span>
                      <span style={{ color: '#000000' }}>Add Property</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors"
                      >
                        Login
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 px-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}

                {/* Legal Notice */}
                <div className="pt-1 text-[10px] text-center text-slate-400">
                  MasterJiEstates &bull; Real Estate Advisory Desk
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
