import React, { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import PasswordInput from '../../components/auth/PasswordInput.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateUserProfile, changeUserPassword } from '../../services/api.js';

export default function AccountSettings() {
  const { user, refreshUser } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileError(null);

    if (fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters long.');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setProfileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateUserProfile({ fullName, phone: cleanPhone });
      setProfileMsg('Your profile contact details have been successfully updated.');
      await refreshUser();
      setTimeout(() => setProfileMsg(null), 5000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeUserPassword({ currentPassword, newPassword });
      setPasswordMsg(res.message || 'Password changed successfully. Please keep it safe.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 6000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200/90 pb-5">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-navy">
          Account Settings & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal contact details, role permissions, and active session password.
        </p>
      </div>

      {/* Grid: Profile Details + Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold font-heading text-brand-navy">
                Personal Profile
              </h3>
              <Badge variant={user?.role === 'admin' ? 'brand' : 'outline'} size="sm">
                {(user?.role || 'user').toUpperCase()}
              </Badge>
            </div>

            {profileMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {profileMsg}
              </div>
            )}

            {profileError && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (India)
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="text-[10px] text-slate-400">Read-only account identifier</span>
                </div>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdatingProfile}
                  className="w-full sm:w-auto"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Account created on{' '}
            {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold font-heading text-brand-navy">
              Change Password
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Session Security</span>
          </div>

          {passwordMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isChangingPassword}
                className="w-full sm:w-auto"
              >
                Update Password
              </Button>
            </div>
          </form>

          <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
            Changing your password increments your account security version and instantly revokes all active sessions across other devices.
          </p>
        </div>
      </div>
    </div>
  );
}

