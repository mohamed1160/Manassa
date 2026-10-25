import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  User,
  Menu,
  X,
  PlayCircle,
  ShoppingBag,
  Globe,
} from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { SidebarNavigation } from '../../components/shared/SidebarNavigation';
import { NotificationCenter } from '../../components/shared/NotificationCenter';
import { LanguageSwitcher } from '../../components/shared/LanguageSwitcher';
import { getStudentNavigation } from '../../config/navigation.config';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../constants/routes';

const ICON_MAP = {
  LayoutDashboard,
  BookOpen,
  Receipt,
  User,
};

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const site = useSiteConfig();
  const { t } = useTranslation();

  const navItems = getStudentNavigation(t);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Student Top Header */}
      <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-brand-muted hover:bg-brand-accent/40 lg:hidden"
              aria-label={t('nav.studentPortal')}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <BrandLogo showTeacherName={false} />
            <span className="rounded-md bg-brand-accent px-2.5 py-1 text-xs font-semibold text-brand-primary">
              {t('nav.studentPortal')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationCenter />
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('nav.home')}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Student Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } w-full shrink-0 border-b border-brand-border bg-brand-surface p-4 lg:block lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-e`}
        >
          <SidebarNavigation
            title={t('nav.studentPortal')}
            subtitle={site.teacherName}
            items={navItems}
            iconMap={ICON_MAP}
            defaultIcon={LayoutDashboard}
            onNavigate={closeSidebar}
            footerSlot={
              <div className="space-y-1">
                <NavLink
                  to={ROUTES.STUDENT.getLearnPath('algebra-101', 'lesson-1')}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
                      isActive
                        ? 'bg-brand-accent text-brand-primary'
                        : 'text-brand-muted hover:bg-brand-accent/30'
                    }`
                  }
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>{t('learning.continueLearning')} (/learn/...)</span>
                </NavLink>
                <NavLink
                  to={ROUTES.STUDENT.getCheckoutPath('algebra-101')}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${
                      isActive
                        ? 'bg-brand-accent text-brand-primary'
                        : 'text-brand-muted hover:bg-brand-accent/30'
                    }`
                  }
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t('orders.checkoutTitle')} (/checkout/...)</span>
                </NavLink>
              </div>
            }
          />
        </aside>

        {/* Main Student Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
