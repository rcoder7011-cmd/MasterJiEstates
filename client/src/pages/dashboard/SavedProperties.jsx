import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../components/properties/PropertyCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { fetchUserFavourites, removeFavouriteProperty } from '../../services/api.js';
import { useFavourites } from '../../context/FavouritesContext.jsx';

export default function SavedProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { refreshFavourites } = useFavourites();

  const loadFavourites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserFavourites();
      setProperties(data);
    } catch (err) {
      setError(err.message || 'Failed to load saved properties.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Saved Properties | MasterJiEstates';
    loadFavourites();
  }, []);

  const handleRemove = async (propertyId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Optimistically remove from local list
      setProperties((prev) => prev.filter((p) => (p.id || p.demoId || p.slug) !== propertyId));
      await removeFavouriteProperty(propertyId);
      await refreshFavourites();
    } catch (err) {
      alert(err.message || 'Failed to remove property from saved collection.');
      await loadFavourites();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy flex items-center gap-2">
            <span>Saved Properties</span>
            {properties.length > 0 && (
              <span className="text-xs font-bold text-brand-gold bg-brand-gold/15 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                {properties.length}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Properties you have shortlisted for comparison, site visit requests, and advisor consultation.
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

      {/* Grid of Saved Properties */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 shadow-card"></div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const key = property.id || property.demoId || property.slug;
            return (
              <div key={key} className="relative group">
                <PropertyCard property={property} view="grid" />
                <button
                  type="button"
                  onClick={(e) => handleRemove(key, e)}
                  title="Remove from saved properties"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md border border-rose-100 transition-transform active:scale-95 z-20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 mx-auto flex items-center justify-center text-rose-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-heading font-bold text-brand-navy">
            You haven't saved any properties yet
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6">
            Click the heart icon on any property card or details page to bookmark it in your personal collection.
          </p>
          <Link to="/properties">
            <Button variant="primary" size="sm">
              Explore Property Directory
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

