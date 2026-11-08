import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchModerationQueue } from '../../services/api.js';

export default function PropertyModeration() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchModerationQueue({
        page,
        limit: 10,
        search,
        category,
        city,
        sortBy,
      });
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load moderation queue.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, city, sortBy]);

  useEffect(() => {
    document.title = 'Property Moderation Queue | MasterJiEstates Admin';
    loadQueue(1);
  }, [loadQueue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQueue(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              Property Moderation Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {pagination.total} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted brokerage listings, verify seller representations, and approve or request changes before publishing live.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, sector, or seller name..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50/50"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="apartment">Apartments</option>
              <option value="villa">Villas</option>
              <option value="residential_plot">Plots</option>
              <option value="penthouse">Penthouses</option>
              <option value="commercial_property">Commercial</option>
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Cities</option>
              <option value="Gurugram">Gurugram</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Noida">Noida</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-amber-400 text-xs font-bold hover:bg-[#112340] transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => loadQueue(1)} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* Queue List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 h-28" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((prop) => (
            <article
              key={prop.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col md:flex-row items-start gap-5"
            >
              {/* Photo Preview */}
              <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                {prop.imageUrl ? (
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <span>🖼</span>
                    <span>No image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-amber-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow">
                  Under Review
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {prop.images?.length || 0} photos
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {prop.categoryLabel || prop.category}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {prop.locality}, {prop.city}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-serif text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {prop.priceFormatted}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0A192F] hover:text-amber-700 transition-colors">
                  <Link to={`/admin/moderation/${prop.id}`}>{prop.title}</Link>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">{prop.description}</p>

                {/* Seller Contact Info & Submission Date */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>
                      Seller:{' '}
                      <strong className="text-slate-800">
                        {prop.owner?.name || 'Unknown'}
                      </strong>
                    </span>
                    {prop.owner?.phone && (
                      <span>
                        📞 <span className="font-mono">{prop.owner.phone}</span>
                      </span>
                    )}
                    {prop.owner?.email && (
                      <span className="hidden sm:inline">
                        ✉ <span>{prop.owner.email}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      Submitted:{' '}
                      {new Date(prop.submittedAt || prop.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <Link
                      to={`/admin/moderation/${prop.id}`}
                      className="px-4 py-1.5 rounded-lg bg-[#0A192F] hover:bg-[#112340] text-amber-400 text-xs font-bold transition-colors shadow-xs"
                    >
                      Review & Verify →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} listings)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadQueue(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => loadQueue(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
            ✓
          </div>
          <h3 className="text-base font-bold font-serif text-[#0A192F]">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 mt-1">
            No properties are currently awaiting administrative review. New seller submissions will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
}

