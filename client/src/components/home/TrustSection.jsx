import React from 'react';
import SectionHeading from '../ui/SectionHeading.jsx';
import Badge from '../ui/Badge.jsx';
import UdyamBadge from '../common/UdyamBadge.jsx';

export default function TrustSection() {
  return (
    <section className="py-16 sm:py-20 bg-surface-primary border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Integrity Baseline"
          title="Our Client Commitment & Standards"
          subtitle="Real estate involves life-defining investments. Here is the operational code of conduct we uphold for every client."
          align="center"
        />

        <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-subtle space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-emerald-200">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">100% Owner Contact Masking</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                  Property owners' personal telephone numbers are never published on the website. Inquiries flow through the official MasterJiEstates helpline.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-emerald-200">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Physical Site Walkthroughs</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                  Every scheduled site visit is escorted by a verified field executive, ensuring safe and informed physical inspections.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-emerald-200">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Pre-Listing Title Checks</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                  Listings must pass administrative due diligence and document verification before being presented as approved on our catalog.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-sm border border-emerald-200">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Transparent Brokerage Mandate</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                  Brokerage commissions are formally agreed in advance in writing. Zero hidden fees or surprise costs at the time of closing.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
            <span>Committed to transparent real-estate advisory and verified property standards across Delhi NCR.</span>
            <div className="flex items-center gap-2">
              <UdyamBadge size="sm" />
              <Badge variant="brand" size="sm">Advisory Code of Conduct</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

