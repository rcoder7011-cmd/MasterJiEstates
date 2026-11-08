import React from 'react';
import SectionHeading from '../ui/SectionHeading.jsx';

const steps = [
  {
    step: '01',
    title: 'Explore & Filter',
    description: 'Browse curated residential, commercial, and plotted opportunities. Filter by city, budget, and category to find properties that suit your criteria.',
  },
  {
    step: '02',
    title: 'Connect with Our Team',
    description: 'Submit an enquiry or request a physical site visit directly through the portal. A dedicated MasterJiEstates property advisor will reach out to understand your goals.',
  },
  {
    step: '03',
    title: 'Visit & Move Forward',
    description: 'Experience an escorted physical walkthrough. When you decide to proceed, our team assists in coordinating discussions, legal documentation, and deed execution.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Seamless Process"
          title="Your Property Journey, Made Simpler"
          subtitle="Three straightforward steps from initial discovery to confident transaction coordination."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="relative bg-surface-primary rounded-2xl p-7 border border-slate-200/80 shadow-subtle flex flex-col justify-between"
            >
              <div>
                {/* Step Number Accent */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold font-heading text-brand-gold">
                    {item.step}
                  </span>
                  <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                    Step {idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy font-heading">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

