import React from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Sticky action bar for saving or discarding form changes.
 */
export function SaveChangesBar({
  isDirty = false,
  isSaving = false,
  statusMessage = '',
  statusTone = 'info', // 'info' | 'success' | 'error'
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
}) {
  const { t } = useTranslation();

  const toneClass =
    statusTone === 'error'
      ? 'text-red-700 bg-red-50 border-red-200'
      : statusTone === 'success'
      ? 'text-brand-primary bg-brand-accent/70 border-brand-border'
      : 'text-brand-muted bg-brand-bg border-brand-border';

  return (
    <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs">
        {statusMessage ? (
          <div className={`rounded-lg border px-3 py-1.5 font-medium ${toneClass}`}>
            {statusMessage}
          </div>
        ) : (
          <span className="font-medium text-brand-muted">
            {isDirty
              ? 'توجد تعديلات غير محفوظة في النموذج الحالي.'
              : 'جميع الحقول متزامنة مع آخر حالة محملة.'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{cancelLabel || t('common.cancel')}</span>
          </Button>
        )}

        <Button
          type={onSave ? 'button' : 'submit'}
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-3.5 w-3.5" />
          <span>
            {isSaving ? t('common.saving') : saveLabel || t('common.save')}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default SaveChangesBar;
