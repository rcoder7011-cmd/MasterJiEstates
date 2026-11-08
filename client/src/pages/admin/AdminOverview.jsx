import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import { fetchAdminOverview } from '../../services/api.js';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Executive Overview | MasterJiEstates Admin';
    let isMounted = true;

    async function loadOverview() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchAdminOverview();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load administrative overview.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = data?.metrics || {};
  const recentSubmissions = data?.recentSubmissions || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Welcome & Real-Time Status */}
      <div className="bg-[#0A192F] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold mb-3">
            <span
              className={`w-2 h-2 rounded-full ${
                data?.databaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
              } animate-pulse`}
            />
            <span className="text-slate-300">
              Database:{' '}
              <strong className={data?.databaseConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {data?.databaseConnected ? 'MongoDB Atlas (Online)' : 'Disconnected (In-Memory Fallback)'}
              </strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Administrative Operations Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time catalog moderation, lead inquiries, property dispatch schedules, and asset lifecycle transitions across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/moderation"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <span>⚡ Review Queue</span>
            {metrics.pendingApprovals > 0 && (
              <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">
                {metrics.pendingApprovals}
              </span>
            )}
          </Link>
          <Link
            to="/admin/company-inventory"
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-amber-400/50 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
          >
            + Onboard Company Asset
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-bold underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <section aria-labelledby="overview-stats-title">
        <h3 id="overview-stats-title" className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Key Performance Indicators
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <AdminStatCard
            title="Pending Approvals"
            value={metrics.pendingApprovals}
            isLoading={isLoading}
            linkTo="/admin/moderation"
            linkLabel="Moderate queue"
            badgeText={metrics.pendingApprovals > 0 ? 'Requires Action' : 'Cleared'}
            badgeVariant={metrics.pendingApprovals > 0 ? 'warning' : 'success'}
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <AdminStatCard
            title="Published Properties"
            value={metrics.publishedProperties}
            isLoading={isLoading}
            linkTo="/admin/properties?status=available"
            linkLabel="View published"
            badgeText="Active on Portal"
            badgeVariant="success"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <AdminStatCard
            title="Customer Enquiries"
            value={metrics.totalEnquiries}
            isLoading={isLoading}
            linkTo="/admin/enquiries"
            linkLabel="Lead inbox"
            badgeText="All Time"
            badgeVariant="neutral"
            icon={
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
          />

          <AdminStatCard
            title="Upcoming Site Visits"
            value={metrics.upcomingSiteVisits}
            isLoading={isLoading}
            linkTo="/admin/site-visits"
            linkLabel="Dispatch schedule"
            badgeText="Scheduled"
            badgeVariant="gold"
            icon={
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Catalog Assets</span>
            <span className="text-xl font-bold font-serif text-[#0A192F] mt-1 block">
              {metrics.totalProperties ?? 0}
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 block">Registered Users</span>
            <span className="text-xl font-bold font-serif text-[#0A192F] mt-1 block">
              {metrics.totalUsers ?? 0}
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 block">Rejected Submissions</span>
            <span className="text-xl font-bold font-serif text-red-600 mt-1 block">
              {metrics.rejectedProperties ?? 0}
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 block">Withdrawn Properties</span>
            <span className="text-xl font-bold font-serif text-slate-600 mt-1 block">
              {metrics.withdrawnProperties ?? 0}
            </span>
          </div>
        </div>
      </section>

      {/* Two Column Section: Recent Submissions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Submissions Awaiting Moderation (7 Cols) */}
        <section aria-labelledby="submissions-title" className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 id="submissions-title" className="text-base font-bold font-serif text-[#0A192F]">
                Pending Moderation Queue
              </h3>
              <p className="text-xs text-slate-400">Listings awaiting title check and administrative approval</p>
            </div>
            <Link
              to="/admin/moderation"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              View All ({metrics.pendingApprovals ?? 0}) →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : recentSubmissions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((prop) => (
                <div key={prop.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Pending Review
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {prop.locality}, {prop.city}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{prop.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seller: <strong className="text-slate-700">{prop.owner?.name || 'Owner'}</strong> •{' '}
                      Price: <strong className="text-slate-700">{prop.priceFormatted}</strong>
                    </p>
                  </div>

                  <Link
                    to={`/admin/moderation/${prop.id}`}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#0A192F] hover:bg-[#112340] text-amber-400 text-xs font-semibold shadow-xs transition-colors"
                  >
                    Review ✎
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              <span className="text-2xl block mb-2">✓</span>
              <span>All submissions have been reviewed. Moderation queue is clear!</span>
            </div>
          )}
        </section>

        {/* Recent Audit Trail (5 Cols) */}
        <section aria-labelledby="audit-title" className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 id="audit-title" className="text-base font-bold font-serif text-[#0A192F]">
                Administrative Audit Log
              </h3>
              <p className="text-xs text-slate-400">Append-only log of recent privileged operations</p>
            </div>
            <Link
              to="/admin/activity-logs"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              Full Trail →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act._id || act.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 capitalize">
                      {act.action?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400">
                      {new Date(act.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    Target: <strong className="text-slate-900">{act.targetTitle || act.targetId}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">By: {act.adminEmail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              No recent administrative actions recorded yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

