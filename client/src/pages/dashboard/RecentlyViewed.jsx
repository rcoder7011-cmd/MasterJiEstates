import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../components/properties/PropertyCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { fetchRecentlyViewed } from '../../services/api.js';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Recently Viewed Properties | MasterJiEstates';
    let isMounted = true;

    async function loadRecentlyViewed() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRecentlyViewed();
        if (isMounted) {
          setItems(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load recently viewed properties.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecentlyViewed();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatViewedTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy">
            Recently Viewed Properties
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick up where you left off. Listings you inspected during your authenticated session.
          </p>
        </div>

        <Link to="/properties">
          <Button variant="outline" size="sm">
            Browse Catalogue
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 shadow-card"></div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const property = item.property;
            if (!property) return null;
            const key = property.id || property.demoId || property.slug || idx;

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                  <span>Viewed {formatViewedTime(item.viewedAt)}</span>
                  <Link
                    to={`/properties/${property.slug || property.id}`}
                    className="text-brand-gold font-semibold hover:underline"
                  >
                    Open Details
                  </Link>
                </div>
                <PropertyCard property={property} view="grid" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            No recently viewed properties
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            Properties you browse while logged into MasterJi Estates will automatically appear here for quick access.
          </p>
          <Link to="/properties">
            <Button variant="primary" size="sm">
              Discover Verified Properties
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

