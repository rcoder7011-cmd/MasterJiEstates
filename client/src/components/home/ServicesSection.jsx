import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';

const services = [
  {
    title: 'Property Discovery',
    description: 'Explore verified residential apartments, independent houses, villas, and commercial real estate with clear specifications and pricing.',
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Buying Assistance',
    description: 'Personalized guidance from MasterJiEstates property advisors to help you navigate property options, paperwork, and financing.',
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Selling Assistance',
    description: 'List your property with complete contact privacy. MasterJiEstates vets interested buyers and handles preliminary screening.',
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Site Visit Coordination',
    description: 'Schedule escorted physical walkthroughs accompanied by experienced MasterJi field executives at convenient time slots.',
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Transaction Coordination',
    description: 'Professional facilitation of deed registration, legal documentation coordination, and administrative closing assistance.',
    icon: (
      <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Core Capabilities"
          title="Our Real Estate Services"
          subtitle="Focused property advisory designed to make buying, selling, and owning real estate straightforward and reliable."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {services.map((item) => (
            <div
              key={item.title}
              className="bg-surface-primary rounded-2xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 border border-slate-200 shadow-xs">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-brand-navy font-heading">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              <Link
                to="/services"
                className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-brand-navy hover:text-brand-gold transition-colors"
              >
                <span>Learn more</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}

          {/* Supportive Services Card */}
          <div className="bg-brand-navy-dark text-white rounded-2xl p-6 border border-brand-navy-light shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Allied Home Services
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-light">
                Need architectural design, home loan guidance, or interior planning? Connect with vetted third-party partner professionals through MasterJiEstates.
              </p>
            </div>

            <Link
              to="/services"
              className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-brand-gold hover:text-white transition-colors"
            >
              <span>Explore Allied Services</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

