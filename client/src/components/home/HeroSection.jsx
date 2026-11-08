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
      gsap.fromTo(
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
      className="relative bg-brand-navy-dark text-white overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32"
    >
      {/* Background Architectural Visual with Deep Navy Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy-dark/95 via-brand-navy/85 to-brand-navy-dark" />

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

        {/* Dual Primary & Secondary CTAs */}
        <div className="hero-anim-item flex flex-wrap items-center justify-center gap-4 mt-6">
          <Link to="/properties">
            <Button variant="secondary" size="md" className="font-semibold px-6 shadow-sm">
              Explore Properties
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard/listings/new">
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10 hover:border-white px-6">
                List Your Property
              </Button>
            </Link>
          ) : (
            <Link to="/login" state={{ from: { pathname: '/dashboard/listings/new' } }}>
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10 hover:border-white px-6">
                List Your Property
              </Button>
            </Link>
          )}
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
