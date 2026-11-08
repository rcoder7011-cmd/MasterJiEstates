import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminActivityLogs } from '../../services/api.js';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminActivityLogs({
        page,
        limit: 20,
        action,
        targetType,
      });
      setLogs(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [action, targetType]);

  useEffect(() => {
    document.title = 'Administrative Audit Trail | MasterJiEstates Admin';
    loadLogs(1);
  }, [loadLogs]);

  const getActionBadge = (act) => {
    switch (act) {
      case 'property_approved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>;
      case 'property_rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">Rejected</span>;
      case 'property_changes_requested':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Changes Requested</span>;
      case 'company_property_created':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Company Asset</span>;
      case 'user_status_changed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">User Status</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">{act?.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              Administrative Audit Trail
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {pagination.total} Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident, append-only log of all privileged moderation, status transitions, and user account modifications.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Action Types</option>
          <option value="property_approved">Property Approved</option>
          <option value="property_rejected">Property Rejected</option>
          <option value="property_changes_requested">Changes Requested</option>
          <option value="property_status_changed">Status Changed</option>
          <option value="company_property_created">Company Asset Created</option>
          <option value="user_status_changed">User Status Changed</option>
          <option value="enquiry_status_updated">Enquiry Updated</option>
          <option value="site_visit_status_updated">Site Visit Updated</option>
        </select>

        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white"
        >
          <option value="">All Target Types</option>
          <option value="property">Property</option>
          <option value="user">User</option>
          <option value="enquiry">Enquiry</option>
          <option value="site_visit">Site Visit</option>
        </select>

        <button
          type="button"
          onClick={() => loadLogs(1)}
          className="px-4 py-2 rounded-xl bg-[#0A192F] text-amber-400 text-xs font-bold hover:bg-[#112340]"
        >
          Filter Logs
        </button>

        {(action || targetType) && (
          <button
            type="button"
            onClick={() => {
              setAction('');
              setTargetType('');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Timestamp</th>
                <th className="py-3.5 px-4 font-bold">Action</th>
                <th className="py-3.5 px-4 font-bold">Admin Operator</th>
                <th className="py-3.5 px-4 font-bold">Target Entity</th>
                <th className="py-3.5 px-4 font-bold">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                    {/* Admin */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {log.adminName || 'Admin'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                      </div>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">
                          {log.targetTitle || log.targetId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                          {log.targetType} • ID: {log.targetId}
                        </span>
                      </div>
                    </td>

                    {/* Reason / Metadata */}
                    <td className="py-3.5 px-4 max-w-sm">
                      {log.reason ? (
                        <p className="text-slate-700 italic">"{log.reason}"</p>
                      ) : log.metadata?.notes ? (
                        <p className="text-slate-600">{log.metadata.notes}</p>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No administrative audit events recorded matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} audit events)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadLogs(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadLogs(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

