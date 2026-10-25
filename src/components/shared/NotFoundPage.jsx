import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, BookOpen } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent text-brand-primary">
        <Compass className="h-8 w-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
        خطأ 404 — المسار غير موجود
      </span>
      <h1 className="mt-2 text-3xl font-bold text-brand-text">
        الصفحة المطلوبة غير متوفرة
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-muted">
        لم نتمكن من العثور على المسار{' '}
        <code dir="ltr" className="rounded bg-brand-accent px-1.5 py-0.5 font-mono text-xs text-brand-primary">
          {location.pathname}
        </code>{' '}
        داخل المنصة. تأكد من صحة الرابط أو انتقل إلى إحدى الصفحات الرئيسية.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
        >
          <Home className="h-4 w-4" />
          <span>العودة للرئيسية</span>
        </Link>
        <Link
          to={ROUTES.COURSES}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-5 py-2.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-accent/40"
        >
          <BookOpen className="h-4 w-4" />
          <span>تصفح الدورات</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
