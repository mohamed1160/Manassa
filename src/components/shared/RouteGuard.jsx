import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState } from '../feedback/LoadingState';
import { ConfigurationNotice } from '../feedback/ConfigurationNotice';
import { ROUTES } from '../../constants/routes';

/**
 * Route Guard Structure for Authenticated Student & Teacher Sections.
 *
 * IMPORTANT SECURITY NOTE:
 * - Frontend route guards are for UX navigation and layout protection only.
 * - Real authorization MUST be enforced by backend validation and Supabase RLS policies.
 * - No fake user session is created. When unauthenticated or when Supabase is not
 *   configured, the guard explicitly surfaces the unauthenticated/configuration state
 *   while allowing structural inspection of the layout and route placeholders during
 *   the foundation review phase, or redirecting when `enforceRedirect` is enabled.
 */
export function RouteGuard({
  allowedRoles = [],
  sectionLabel = 'منطقة محمية',
  enforceRedirect = false,
}) {
  const location = useLocation();
  const { isLoading, isAuthenticated, role, isConfigured } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <LoadingState message="جاري التحقق من صلاحيات الجلسة..." />
      </div>
    );
  }

  const hasRequiredRole =
    isAuthenticated &&
    (allowedRoles.length === 0 || allowedRoles.includes(role));

  if (enforceRedirect && !hasRequiredRole) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="text-sm text-brand-muted">
          يلزم تسجيل الدخول للوصول إلى هذا المسار ({location.pathname}).
        </p>
        <Link
          to={ROUTES.LOGIN}
          state={{ from: location }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
        >
          <LogIn className="h-4 w-4" />
          <span>الانتقال لصفحة تسجيل الدخول</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hasRequiredRole && (
        <div
          role="region"
          aria-label="حالة حارس المسار (Route Guard)"
          className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-700">
                  {isAuthenticated ? (
                    <ShieldCheck className="h-5 w-5 text-teal-700" />
                  ) : (
                    <Lock className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-brand-text">
                      حارس المسارات (Route Guard): {sectionLabel}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                      {!isConfigured
                        ? 'وضع المعاينة الهيكلية (Supabase غير مضبوط)'
                        : 'غير مسجل الدخول حالياً'}
                    </span>
                  </div>
                  <p className="text-brand-muted">
                    هذا المسار محمي ويتطلب دور (
                    <code className="font-mono font-semibold text-brand-text">
                      {allowedRoles.join(' / ') || 'authenticated'}
                    </code>
                    ). لا توجد جلسة مصادقة نشطة حالياً، وتُعرض بنية الصفحة لأغراض مراجعة التأسيس فقط. الأمان الفعلي للبيانات يعتمد على سياسات Supabase RLS.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  state={{ from: location }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-medium text-white hover:opacity-95"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>تسجيل الدخول</span>
                </Link>
              </div>
            </div>

            {!isConfigured && (
              <div className="mt-3">
                <ConfigurationNotice compact />
              </div>
            )}
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
}

export default RouteGuard;
