import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'لا توجد بيانات متاحة حالياً',
  description = 'سيتم عرض السجلات الفعلية هنا فور ربط قاعدة البيانات وإضافة المحتوى.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/70 text-slate-600">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-brand-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
