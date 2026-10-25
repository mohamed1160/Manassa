import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Accessible Confirmation Dialog for destructive or state-changing actions
 * (such as deleting a course, approving an order, or rejecting a receipt).
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'danger', // 'danger' | 'primary'
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-lg p-2 ${
                variant === 'danger'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-brand-accent text-brand-primary'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-brand-text"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg p-1 text-brand-muted hover:bg-brand-bg hover:text-brand-text"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {message && (
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">
            {message}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التنفيذ...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
