import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Badge from '../ui/Badge.jsx';

export default function AuthVisualPanel({
  headline = "Find a Place You'll Love to Call Home",
  subtitle = "Discover verified residential and commercial properties across India with complete pricing transparency and zero unsolicited broker calls.",
  imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
  featureTag = "Verified Inventory",
}) {
  const panelRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
    }

    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: 'power2.out' }
      );
    }
  }, [headline]);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-brand-navy-dark overflow-hidden flex-col justify-between p-10 xl:p-14 2xl:p-16">
      {/* Background Photography */}
      <div
        ref={panelRef}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* Deep Navy Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/95 via-brand-navy/65 to-brand-navy-dark/45" />

      {/* Top Bar over Visual */}
      <div className="relative z-10 flex items-center justify-between">
        <Badge variant="direct" dot>
          MasterJi Direct &bull; {featureTag}
        </Badge>
        <span className="text-[11px] font-mono text-brand-gold-light/90 tracking-widest uppercase bg-brand-navy-dark/60 py-1 px-2.5 rounded backdrop-blur-xs">
          https://masterjiestates.in
        </span>
      </div>

      {/* Bottom Showcase Copy */}
      <div ref={textRef} className="relative z-10 max-w-lg space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-brand-gold rounded-full" />
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-gold">
            MasterJiEstates Advisory
          </span>
        </div>

        <blockquote className="text-2xl xl:text-3xl font-heading font-medium text-white leading-snug tracking-tight">
          &ldquo;{headline}&rdquo;
        </blockquote>

        <p className="text-sm text-slate-200/90 leading-relaxed font-light">
          {subtitle}
        </p>

        {/* Real Estate Trust Badges */}
        <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-brand-gold-light font-medium border-t border-white/15">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>100% Masked Owner Details</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Escorted Site Visits</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Title Cleared Properties</span>
          </div>
        </div>
      </div>
    </div>
  );
}

