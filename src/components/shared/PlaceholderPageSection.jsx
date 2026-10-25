import React from 'react';
import { Layers, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { PageHeader } from './PageHeader';

/**
 * Standardized structural section for foundation placeholder pages.
 * Clearly communicates the page's purpose, architectural responsibilities,
 * and backend dependencies without fabricating course/order/statistic data.
 */
export function PlaceholderPageSection({
  title,
  purpose,
  badgeText = 'تأسيس المنصة',
  routePattern,
  responsibilities = [],
  securityNote,
  actions = null,
  children,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={purpose}
        badgeText={badgeText}
        actions={actions}
      />

      {children}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-2.5 text-brand-primary">
            <Layers className="h-5 w-5" />
            <h2 className="text-base font-bold text-brand-text">
              الغرض الوظيفي والمسؤوليات المخططة لهذه الصفحة
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-brand-muted">{purpose}</p>

          {responsibilities.length > 0 && (
            <ul className="space-y-2 border-t border-slate-100 pt-3 text-sm text-brand-text">
              {responsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {routePattern && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-brand-muted">
              <span>نمط المسار (Route): </span>
              <code dir="ltr" className="font-mono font-semibold text-brand-text">
                {routePattern}
              </code>
            </div>
          )}
        </Card>

        <Card className="space-y-3 border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-base font-bold text-brand-text">
              حالة البيانات والأمان في مرحلة التأسيس
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-brand-muted">
            {securityNote ||
              'هذه الصفحة مهيأة هيكلياً بدون بيانات وهمية أو إحصائيات مزيفة. سيتم جلب وتحديث البيانات الحقيقية عبر طبقة الخدمات (Services) وسياسات أمان قاعدة البيانات (Supabase RLS).'}
          </p>
        </Card>
      </div>
    </div>
  );
}

export default PlaceholderPageSection;
