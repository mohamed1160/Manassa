import React from 'react';
import { Info } from 'lucide-react';

export function AuthStatusNotice({ message }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-brand-muted">
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
        <span>
          {message ||
            'هذا النموذج جزء من الهيكل التأسيسي للمنصة ومجهز بالتحقق المبدئي (Formik + Yup). سيتم ربطه بـ Supabase Auth في مرحلة تنفيذ المصادقة.'}
        </span>
      </div>
    </div>
  );
}

export default AuthStatusNotice;
