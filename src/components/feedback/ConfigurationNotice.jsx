import React from 'react';
import { DatabaseZap } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR_MESSAGE } from '../../services/supabase/client';

/**
 * Displays a clear, non-crashing diagnostic banner when Supabase environment
 * variables (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) are not configured yet.
 */
export function ConfigurationNotice({ compact = false }) {
  if (isSupabaseConfigured) {
    return null;
  }

  if (compact) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold">
          <DatabaseZap className="h-4 w-4 shrink-0 text-amber-700" />
          <span>تنبيه إعداد البيئة: لم يتم ربط متغيرات Supabase في ملف .env بعد.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-amber-100 p-2 text-amber-800">
          <DatabaseZap className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h3 className="font-bold text-amber-950">
            الاتصال بقاعدة البيانات (Supabase) غير مُفعّل حالياً
          </h3>
          <p className="leading-relaxed text-amber-900">
            {SUPABASE_CONFIG_ERROR_MESSAGE}
          </p>
          <p className="text-xs text-amber-800">
            انسخ ملف <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">.env.example</code> إلى{' '}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">.env</code> وأضف بيانات مشروع المعلم لتفعيل المصادقة والبيانات.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationNotice;
