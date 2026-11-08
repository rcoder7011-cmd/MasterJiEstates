import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import WhatsAppButton from '../common/WhatsAppButton.jsx';

export default function BuyerSellerCTA() {
  const scrollToFeatured = (e) => {
    e.preventDefault();
    const el = document.getElementById('featured-properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-surface-primary border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="brand" size="sm" className="mb-2">Unified Platform</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy font-heading tracking-tight">
            Designed for Both Buyers & Property Sellers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-light">
            One account provides complete dual capability. Discover properties or list your own assets with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buyer Panel */}
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                For Buyers & Investors
              </span>

              <h3 className="text-2xl font-bold text-brand-navy font-heading">
                Looking for Your Next Property?
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed font-light">
                Explore property opportunities and find a place that fits your needs. Browse verified residential and commercial opportunities with complete pricing transparency and direct site visits.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Curated inventory across prime locations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Direct company inventory with zero brokerage
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Scheduled escorted physical property visits
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <Link to="/properties">
                <Button variant="primary" size="md" className="font-semibold px-6">
                  Explore Properties
                </Button>
              </Link>
              <WhatsAppButton
                context="service_buy"
                variant="outline"
                size="md"
                label="WhatsApp Buyer Desk"
              />
            </div>
          </div>

          {/* Seller Panel */}
          <div className="bg-brand-navy-dark text-white rounded-2xl p-8 sm:p-10 border border-brand-navy-light shadow-card flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                For Property Owners
              </span>

              <h3 className="text-2xl font-bold text-white font-heading">
                Have a Property to Sell?
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-light">
                Connect with MasterJiEstates to discuss listing and selling your property. We guarantee 100% contact privacy, verified buyer leads, and professional transaction facilitation.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">✓</span> Personal phone number is never displayed publicly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">✓</span> Full legal and title due diligence assistance
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">✓</span> Field team manages customer visits and negotiations
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button variant="secondary" size="md" className="font-semibold px-6">
                  List Your Property
                </Button>
              </Link>
              <WhatsAppButton
                context="service_sell"
                variant="solid"
                size="md"
                label="Chat with Seller Desk"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

