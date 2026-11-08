import React, { useState } from 'react';

/**
 * Reusable modal for administrative confirmation dialogs,
 * with optional reason/remarks text input for rejection or change requests.
 */
export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary', // 'primary', 'danger', 'warning'
  requireReason = false,
  reasonLabel = 'Reason / Remarks',
  reasonPlaceholder = 'Please enter a clear explanation (minimum 5 characters)...',
  isLoading = false,
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason) {
      if (!reason.trim() || reason.trim().length < 5) {
        setReasonError('Please provide a valid explanation (at least 5 characters).');
        return;
      }
    }
    setReasonError('');
    onConfirm(reason.trim());
  };

  const getConfirmBtnClasses = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      default:
        return 'bg-[#0A192F] hover:bg-[#112340] text-amber-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 animate-scaleUp">
        <h3 className="text-lg font-bold font-serif text-[#0A192F] mb-2">{title}</h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">{message}</p>

        {requireReason && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {reasonLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
              placeholder={reasonPlaceholder}
              className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-colors ${
                reasonError
                  ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                  : 'border-slate-300 focus:border-amber-500 bg-white'
              }`}
            />
            {reasonError && <p className="text-[11px] text-red-600 mt-1">{reasonError}</p>}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 ${getConfirmBtnClasses()}`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

