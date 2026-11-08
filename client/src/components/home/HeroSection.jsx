import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import PropertySearchBar from './PropertySearchBar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function HeroSection() {
  const heroRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // 1. Entrance timeline for hero items
      const tl = gsap.timeline();

      tl.fromTo(
        heroRef.current?.querySelectorAll('.hero-anim-item'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
        }
      );

      // 2. Animate the directional pointer towards "List your property" CTA
      tl.fromTo(
        '.hero-list-cta-pointer',
        { opacity: 0, y: -12, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        },
        '-=0.2'
      );

      // 3. Subtle periodic pointer guidance (gentle float towards button)
      gsap.to('.hero-list-cta-pointer-arrow', {
        y: 3,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });

      // 4. Soft golden ambient glow breathing
      gsap.to('.hero-list-cta-glow', {
        opacity: 0.85,
        scale: 1.03,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 5. Occasional premium golden shine sweep across the button
      // Runs initially after entrance, then repeats occasionally every 6 seconds
      gsap.fromTo(
        '.hero-list-cta-shine',
        { xPercent: -150 },
        {
          xPercent: 250,
          duration: 1.2,
          ease: 'power2.inOut',
          repeat: -1,
          repeatDelay: 6,
          delay: 0.5,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToFeatured = (e) => {
    e.preventDefault();
    const el = document.getElementById('featured-properties');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative text-white overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32"
    >
      {/* Background Architectural Visual in Natural Colors */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/Hero_section_background.png')`,
        }}
      />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        {/* Top Tagline Badge */}
        <div className="hero-anim-item inline-flex items-center gap-2 mb-4">
          <Badge variant="direct" size="md" dot>
            MasterJiEstates &bull; Real Estate Advisory
          </Badge>
        </div>

        {/* Main Heading per Section 4 requirement */}
        <h1 className="hero-anim-item text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight font-heading">
          Find the Right Property. Build Your Future.
        </h1>

        {/* Supporting Text */}
        <p className="hero-anim-item text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mt-4 font-light leading-relaxed">
          Explore properties, discover new opportunities, and get guidance throughout your buying or selling journey with MasterJiEstates.
        </p>

        {/* Dual Primary & Secondary CTAs with Consistent Icons & Attention Indicator */}
        <div className="hero-anim-item flex flex-wrap items-center justify-center gap-4 sm:gap-6 gap-y-8 mt-8 sm:mt-9">
          <Link to="/properties">
            <Button
              variant="secondary"
              size="md"
              className="group font-semibold px-6 shadow-sm inline-flex items-center"
            >
              <span>Explore Properties</span>
              <svg
                className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Button>
          </Link>

          {/* List your property CTA with subtle attention indicator & ambient glow */}
          <div className="relative group inline-flex items-center">
            {/* Elegant Directional Pointer guiding attention to List your property */}
            <div
              className="hero-list-cta-pointer absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-navy-dark/95 border border-amber-400/40 text-amber-300 shadow-md pointer-events-none select-none whitespace-nowrap z-20"
              aria-hidden="true"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Post Listing</span>
              <svg
                className="hero-list-cta-pointer-arrow w-3 h-3 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Soft Golden Outer Glow animated via GSAP */}
            <span
              className="hero-list-cta-glow absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-400/40 via-brand-gold/60 to-amber-400/40 blur-[4px] opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 pointer-events-none"
              aria-hidden="true"
            />

            {isAuthenticated ? (
              <Link to="/dashboard/listings/new" className="relative z-10 block">
                <Button
                  variant="secondary"
                  size="md"
                  style={{ color: '#142B4F' }}
                  className="relative overflow-hidden bg-brand-gold text-[#142B4F] font-semibold hover:bg-[#B38E46] border border-[#B38E46]/50 px-6 shadow-md inline-flex items-center select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Premium Golden Shine Glint Bar */}
                  <span
                    className="hero-list-cta-shine absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent transform -skew-x-20 pointer-events-none -translate-x-[150%] z-20"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">List your property</span>
                  <svg
                    className="relative z-10 w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </Button>
              </Link>
            ) : (
              <Link to="/login" state={{ from: { pathname: '/dashboard/listings/new' } }} className="relative z-10 block">
                <Button
                  variant="secondary"
                  size="md"
                  style={{ color: '#142B4F' }}
                  className="relative overflow-hidden bg-brand-gold text-[#142B4F] font-semibold hover:bg-[#B38E46] border border-[#B38E46]/50 px-6 shadow-md inline-flex items-center select-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Premium Golden Shine Glint Bar */}
                  <span
                    className="hero-list-cta-shine absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent transform -skew-x-20 pointer-events-none -translate-x-[150%] z-20"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">List your property</span>
                  <svg
                    className="relative z-10 w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Compact Property Search Bar */}
        <div className="hero-anim-item mt-10">
          <PropertySearchBar />
        </div>

        {/* Core Value Micro-Highlights */}
        <div className="hero-anim-item mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Verified Property Listings</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Complete Owner Contact Privacy</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Escorted Site Visits</span>
          </div>
        </div>
      </div>
    </section>
  );
}
