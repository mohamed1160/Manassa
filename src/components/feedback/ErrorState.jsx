import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export function ErrorState({
  title = 'تعذر إتمام العملية المطلوبة',
  message = 'حدث خطأ أثناء الاتصال بقاعدة البيانات أو التحقق من الصلاحيات.',
  onRetry = null,
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50/90 p-5 text-red-950 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="space-y-1 text-sm">
            <h3 className="font-bold text-red-900">{title}</h3>
            <p className="text-xs leading-relaxed text-red-800">{message}</p>
          </div>
        </div>

        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>إعادة المحاولة</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
