import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'جاري التحميل وتجهيز البيانات...' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
      <p className="text-sm font-medium text-brand-muted">{message}</p>
    </div>
  );
}

export default LoadingState;
