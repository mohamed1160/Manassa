import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookCopy,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  PlusCircle,
  Globe,
} from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { SidebarNavigation } from '../../components/shared/SidebarNavigation';
import { NotificationCenter } from '../../components/shared/NotificationCenter';
import { LanguageSwitcher } from '../../components/shared/LanguageSwitcher';
import { getTeacherNavigation } from '../../config/navigation.config';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../constants/routes';

const ICON_MAP = {
  LayoutDashboard,
  BookCopy,
  Users,
  CreditCard,
  Settings,
};

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const site = useSiteConfig();
  const { t } = useTranslation();

  const navItems = getTeacherNavigation(t);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Teacher Dashboard Header */}
      <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-brand-muted hover:bg-brand-accent/40 lg:hidden"
              aria-label={t('nav.teacherPortal')}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <BrandLogo showTeacherName={false} to={ROUTES.TEACHER.DASHBOARD} />
            <span className="rounded-md bg-brand-accent px-2.5 py-1 text-xs font-semibold text-brand-primary">
              {t('nav.teacherPortal')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationCenter />
            <Link
              to={ROUTES.TEACHER.COURSE_NEW}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-primary-hover"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('nav.createCourse')}</span>
            </Link>
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-text transition-colors hover:bg-brand-accent/40"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('nav.home')}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Teacher Dashboard Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } w-full shrink-0 border-b border-brand-border bg-brand-surface p-4 lg:block lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-e`}
        >
          <SidebarNavigation
            title={t('nav.teacherPortal')}
            subtitle={site.teacherName}
            items={navItems}
            iconMap={ICON_MAP}
            defaultIcon={LayoutDashboard}
            onNavigate={closeSidebar}
            footerSlot={
              <div className="space-y-1 text-xs">
                <NavLink
                  to={ROUTES.TEACHER.COURSE_NEW}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 font-medium ${
                      isActive
                        ? 'bg-brand-accent text-brand-primary'
                        : 'text-brand-muted hover:bg-brand-accent/30'
                    }`
                  }
                >
                  + {t('nav.createCourse')}
                </NavLink>
                <NavLink
                  to={ROUTES.TEACHER.getCourseEditPath('course-1')}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 font-medium ${
                      isActive
                        ? 'bg-brand-accent text-brand-primary'
                        : 'text-brand-muted hover:bg-brand-accent/30'
                    }`
                  }
                >
                  {t('courses.editTitle')} (:id/edit)
                </NavLink>
                <NavLink
                  to={ROUTES.TEACHER.getCourseCurriculumPath('course-1')}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 font-medium ${
                      isActive
                        ? 'bg-brand-accent text-brand-primary'
                        : 'text-brand-muted hover:bg-brand-accent/30'
                    }`
                  }
                >
                  {t('courses.curriculumTitle')} (:id/curriculum)
                </NavLink>
              </div>
            }
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;
