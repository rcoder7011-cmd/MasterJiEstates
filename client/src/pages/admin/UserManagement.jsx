import React, { useState, useEffect, useCallback } from 'react';
import ConfirmActionModal from '../../components/admin/ConfirmActionModal.jsx';
import { fetchAdminUsers, updateAdminUserStatus } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserManagement() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Status Action Modal State
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    targetUser: null,
    targetStatus: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({
        page,
        limit: 10,
        search,
        role,
        status,
      });
      setUsers(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => {
    document.title = 'User Directory & Accounts | MasterJiEstates Admin';
    loadUsers(1);
  }, [loadUsers]);

  const handleStatusChangeConfirm = async (reason) => {
    if (!statusModal.targetUser || !statusModal.targetStatus) return;
    setIsProcessing(true);
    setError(null);
    try {
      await updateAdminUserStatus(statusModal.targetUser.id, {
        status: statusModal.targetStatus,
        reason,
      });
      setActionSuccess(
        `User account "${statusModal.targetUser.email}" is now ${statusModal.targetStatus}.`
      );
      setStatusModal({ isOpen: false, targetUser: null, targetStatus: '' });
      loadUsers(pagination.page);
    } catch (err) {
      setError(err?.message || 'Failed to update user status.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0A192F]">
              Registered User Directory
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              {pagination.total} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit registered buyer and seller accounts. Deactivating an account revokes active JWT credentials across all devices.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => loadUsers(1)} className="font-bold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers(1);
          }}
          className="flex flex-col md:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, email, or mobile..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-slate-50/50"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">User Identity</th>
                <th className="py-3.5 px-4 font-bold">Role</th>
                <th className="py-3.5 px-4 font-bold">Account Status</th>
                <th className="py-3.5 px-4 font-bold">Submissions</th>
                <th className="py-3.5 px-4 font-bold">Registered On</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading user records...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isCurrentAdmin = currentAdmin?.id === u.id;
                  const isActive = u.accountStatus === 'active';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0A192F] text-amber-400 font-bold flex items-center justify-center text-xs">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                            {u.phone && (
                              <span className="text-[10px] text-slate-400 block">📞 {u.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.role === 'staff'
                              ? 'bg-sky-100 text-sky-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Submissions Count */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {u.submittedPropertiesCount ?? 0} listings
                      </td>

                      {/* Creation Date */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isCurrentAdmin ? (
                          <span className="text-[11px] text-slate-400 italic">Self (Active)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                targetUser: u,
                                targetStatus: isActive ? 'suspended' : 'active',
                              })
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              isActive
                                ? 'text-red-700 hover:bg-red-50 border border-red-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No user accounts match the selected filters.
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => loadUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, targetUser: null, targetStatus: '' })}
        onConfirm={handleStatusChangeConfirm}
        title={`${statusModal.targetStatus === 'suspended' ? 'Suspend' : 'Activate'} User Account?`}
        message={`Are you sure you want to mark "${statusModal.targetUser?.email}" as ${statusModal.targetStatus}? If suspended, any active sessions on the user's devices will be invalidated immediately.`}
        confirmLabel={statusModal.targetStatus === 'suspended' ? 'Suspend Account' : 'Activate Account'}
        confirmVariant={statusModal.targetStatus === 'suspended' ? 'danger' : 'primary'}
        requireReason={false}
        isLoading={isProcessing}
      />
    </div>
  );
}

