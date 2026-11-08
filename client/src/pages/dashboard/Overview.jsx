import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { fetchDashboardOverview } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard Overview | MasterJiEstates';
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchDashboardOverview();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard overview.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = data?.metrics || {};
  const activities = data?.recentActivity || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Geometric Background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <svg className="w-96 h-96 text-white" viewBox="0 0 200 200" fill="currentColor">
            <path d="M40 0 L200 160 L160 200 L0 40 Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-gold text-xs font-semibold backdrop-blur-xs border border-white/10">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
            Unified Account Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Hello, {user?.fullName || 'Client'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to your MasterJi Estates portal. Track your real estate inquiries, manage scheduled property tours, review your bookmarked portfolio, and monitor seller listings in one place.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/properties">
              <Button variant="primary" size="sm" className="shadow-md">
                Explore Properties
              </Button>
            </Link>
            <Link to="/dashboard/listings">
              <Button
                variant="outline"
                size="sm"
                className="text-black border-white/30 hover:bg-white/10 hover:border-white"
              >
                Seller Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="font-bold underline hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <section aria-labelledby="overview-metrics-title">
        <h3 id="overview-metrics-title" className="text-base font-heading font-bold text-brand-navy mb-4">
          Portfolio Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Inquiries"
            value={metrics.totalEnquiries}
            isLoading={isLoading}
            linkTo="/dashboard/enquiries"
            linkLabel="Track inquiries"
            badgeText={metrics.totalEnquiries > 0 ? 'Active' : 'No records'}
            badgeVariant={metrics.totalEnquiries > 0 ? 'brand' : 'neutral'}
            icon={
              <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
          />

          <StatCard
            title="Upcoming Site Visits"
            value={metrics.upcomingSiteVisits}
            isLoading={isLoading}
            linkTo="/dashboard/site-visits"
            linkLabel="View schedule"
            badgeText={metrics.upcomingSiteVisits > 0 ? 'Scheduled' : 'None'}
            badgeVariant={metrics.upcomingSiteVisits > 0 ? 'success' : 'neutral'}
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />

          <StatCard
            title="Saved Properties"
            value={metrics.savedProperties}
            isLoading={isLoading}
            linkTo="/dashboard/favourites"
            linkLabel="Browse collection"
            badgeText={metrics.savedProperties > 0 ? 'Saved' : 'Empty'}
            badgeVariant={metrics.savedProperties > 0 ? 'brand' : 'neutral'}
            icon={
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />

          <StatCard
            title="My Submitted Listings"
            value={metrics.myListings}
            isLoading={isLoading}
            linkTo="/dashboard/listings"
            linkLabel="Seller inventory"
            badgeText={metrics.myListings > 0 ? 'Listed' : 'No listings'}
            badgeVariant={metrics.myListings > 0 ? 'brand' : 'neutral'}
            icon={
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Two Column Layout: Quick Actions & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions (5 Cols) */}
        <section aria-labelledby="quick-actions-title" className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
          <h3 id="quick-actions-title" className="text-base font-heading font-bold text-brand-navy mb-4 flex items-center justify-between">
            <span>Quick Shortcuts</span>
            <span className="text-[11px] font-normal text-slate-400">Available actions</span>
          </h3>

          <div className="space-y-3">
            <Link
              to="/properties"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-brand-gold/40 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center group-hover:bg-brand-navy group-hover:text-brand-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Explore Property Directory</div>
                  <div className="text-[11px] text-slate-500">Filter apartments, villas & plots</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-brand-navy transition-colors">→</span>
            </Link>

            <Link
              to="/dashboard/favourites"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-brand-gold/40 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">View Saved Properties</div>
                  <div className="text-[11px] text-slate-500">Review shortlisted properties</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-brand-navy transition-colors">→</span>
            </Link>

            <Link
              to="/dashboard/enquiries"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-brand-gold/40 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Track Inquiries</div>
                  <div className="text-[11px] text-slate-500">Check advisor response status</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-brand-navy transition-colors">→</span>
            </Link>

            <Link
              to="/dashboard/listings"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-brand-gold/40 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Seller Listings Center</div>
                  <div className="text-[11px] text-slate-500">Manage owner inventory & status</div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-brand-navy transition-colors">→</span>
            </Link>

            <Link
              to="/dashboard/listings/new"
              className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-accent-300 hover:border-accent-500 bg-accent-50/30 hover:bg-accent-50/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center group-hover:bg-accent-600 group-hover:text-white transition-colors font-bold text-base">
                  +
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Submit Property for Sale</div>
                  <div className="text-[11px] text-slate-500">List an apartment, villa or plot</div>
                </div>
              </div>
              <span className="text-accent-600 group-hover:text-accent-800 transition-colors">→</span>
            </Link>
          </div>
        </section>

        {/* Recent Genuine Activity Feed (7 Cols) */}
        <section aria-labelledby="activity-feed-title" className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card">
          <h3 id="activity-feed-title" className="text-base font-heading font-bold text-brand-navy mb-4 flex items-center justify-between">
            <span>Recent Activity</span>
            <span className="text-[11px] font-normal text-slate-400">Actual history</span>
          </h3>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-brand-navy flex-shrink-0 mt-0.5">
                      {act.type === 'enquiry' ? (
                        <svg className="w-3.5 h-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-brand-navy">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {act.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    {act.link && (
                      <Link
                        to={act.link}
                        className="text-[10px] font-semibold text-brand-gold hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-brand-navy">No recent activity recorded</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Your inquiries, site visit bookings, and listings will appear here automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

