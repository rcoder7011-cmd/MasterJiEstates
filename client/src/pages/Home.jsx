import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import HeroSection from '../components/home/HeroSection.jsx';
import PropertyCategories from '../components/home/PropertyCategories.jsx';
import FeaturedProperties from '../components/home/FeaturedProperties.jsx';
import WhyChooseUs from '../components/home/WhyChooseUs.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import BuyerSellerCTA from '../components/home/BuyerSellerCTA.jsx';
import ServicesSection from '../components/home/ServicesSection.jsx';
import TrustSection from '../components/home/TrustSection.jsx';
import FinalCTA from '../components/home/FinalCTA.jsx';

export default function Home() {
  const location = useLocation();
  const submissionData = location.state?.submissionSuccess;
  const [showSubmissionBanner, setShowSubmissionBanner] = useState(Boolean(submissionData));

  useEffect(() => {
    // Set descriptive page title for SEO & Accessibility
    document.title = 'MasterJiEstates — Find Your Property, Build Your Future';
  }, []);

  const handleDismiss = () => {
    setShowSubmissionBanner(false);
    if (window.history?.replaceState) {
      window.history.replaceState({}, document.title);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-brand-dark selection:bg-brand-gold/30 selection:text-brand-navy">
      {/* Global Sticky Navigation Header */}
      <Header />

      {/* Main Page Landmark */}
      <main id="main-content" className="flex-1">
        {/* Prominent Property Submission Success Banner */}
        {showSubmissionBanner && submissionData && (
          <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-navy text-white border-b border-brand-gold/40 shadow-lg relative z-30 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/50 text-brand-gold flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                    ✓
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-heading font-bold text-white">
                        Your Property Listing Has Been Successfully Submitted!
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                        {submissionData.status || 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Thank you for choosing MasterJiEstates. Your property details and photographs have been received successfully. Our team will review your submission, and the listing will be published after approval.
                    </p>
                    {submissionData.id && (
                      <div className="mt-1.5 text-xs text-brand-gold font-mono font-medium">
                        Reference ID: #{submissionData.id} {submissionData.title ? `— ${submissionData.title}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap pt-2 md:pt-0">
                  <Link
                    to="/dashboard/listings"
                    className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-amber-400 text-brand-navy text-xs font-bold transition-all shadow-sm"
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/properties"
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all"
                  >
                    Browse Properties
                  </Link>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss message"
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section with Architectural Showcase & Unified Search */}
        <HeroSection />

        {/* Property Categories Carousel / Grid */}
        <PropertyCategories />

        {/* Featured Listings Showcase with Illustrative Demo Badges */}
        <FeaturedProperties />

        {/* Why Choose MasterJiEstates — Genuine Real Estate Pillars */}
        <WhyChooseUs />

        {/* How It Works — 3-Step Guided Journey */}
        <HowItWorks />

        {/* Unified Buyer & Seller Value Proposition */}
        <BuyerSellerCTA />

        {/* Real Estate Services & Advisory Disclaimer */}
        <ServicesSection />

        {/* Trust & Integrity Commitment (No Fabricated Reviews) */}
        <TrustSection />

        {/* Final Conversion CTA */}
        <FinalCTA />
      </main>

      {/* Corporate Real Estate Footer with RERA & Regulatory Disclaimers */}
      <Footer />
    </div>
  );
}

