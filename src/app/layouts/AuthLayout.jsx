import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { ConfigurationNotice } from '../../components/feedback/ConfigurationNotice';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { ROUTES } from '../../constants/routes';

export function AuthLayout() {
  const site = useSiteConfig();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-brand-bg px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <BrandLogo />
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted transition-colors hover:text-brand-primary"
        >
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* Centered Auth Card Container */}
      <div className="mx-auto my-8 w-full max-w-md space-y-4">
        <ConfigurationNotice compact />
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="mx-auto w-full max-w-md text-center text-xs text-brand-muted">
        <p>
          {site.academyName} — بإشراف {site.teacherName}
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
