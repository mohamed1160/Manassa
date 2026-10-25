import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, Shield } from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { LanguageSwitcher } from '../../components/shared/LanguageSwitcher';
import { MobileNavigation } from '../../components/shared/MobileNavigation';
import { ConfigurationNotice } from '../../components/feedback/ConfigurationNotice';
import { getPublicNavigation, getFooterLegalLinks } from '../../config/navigation.config';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../constants/routes';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const site = useSiteConfig();
  const { t } = useTranslation();

  const navItems = getPublicNavigation(t);
  const legalLinks = getFooterLegalLinks(t);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-text">
      {/* Public Header */}
      <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex" aria-label={t('nav.home')}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.exact)}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-accent text-brand-primary'
                      : 'text-brand-muted hover:bg-brand-accent/40 hover:text-brand-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth, Language & Workspace Links */}
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <Link
              to={ROUTES.STUDENT.DASHBOARD}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-bg px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{t('nav.studentPortal')}</span>
            </Link>
            <Link
              to={ROUTES.TEACHER.DASHBOARD}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-bg px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>{t('nav.teacherPortal')}</span>
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-1.5 text-sm font-medium text-brand-text transition-colors hover:bg-brand-accent/40"
            >
              <LogIn className="h-4 w-4" />
              <span>{t('nav.login')}</span>
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t('nav.register')}</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-brand-muted hover:bg-brand-accent/40 hover:text-brand-text"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        <MobileNavigation
          isOpen={mobileMenuOpen}
          items={navItems}
          onClose={closeMobileMenu}
          actionsSlot={
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={ROUTES.LOGIN}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm font-medium text-brand-text"
              >
                <LogIn className="h-4 w-4" />
                <span>{t('nav.login')}</span>
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"
              >
                <UserPlus className="h-4 w-4" />
                <span>{t('nav.register')}</span>
              </Link>
              <Link
                to={ROUTES.STUDENT.DASHBOARD}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-accent/60 px-3 py-2 text-xs font-medium text-brand-primary"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>{t('nav.studentPortal')}</span>
              </Link>
              <Link
                to={ROUTES.TEACHER.DASHBOARD}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-accent/60 px-3 py-2 text-xs font-medium text-brand-primary"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{t('nav.teacherPortal')}</span>
              </Link>
            </div>
          }
        />
      </header>

      {/* Diagnostic Notice if Supabase env vars are missing */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <ConfigurationNotice compact />
      </div>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer — Uses Dark Green (#0D332B / bg-brand-dark) */}
      <footer className="border-t border-brand-border bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <BrandLogo inverted />
              <p className="max-w-sm text-sm leading-relaxed text-brand-accent/80">
                {site.description}
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-brand-accent">
                {t('nav.courses')}
              </h3>
              <ul className="space-y-2 text-sm text-white/80">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="transition-colors hover:text-brand-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-brand-accent">
                {t('nav.contact')}
              </h3>
              <ul className="space-y-1.5 text-sm text-white/80">
                <li>{site.teacherName}</li>
                <li>
                  <span dir="ltr" className="font-mono text-xs text-brand-accent">
                    {site.contact.email}
                  </span>
                </li>
                <li>
                  <span dir="ltr" className="font-mono text-xs text-brand-accent">
                    {site.contact.phone}
                  </span>
                </li>
                <li className="text-xs text-white/70">{site.contact.supportHours}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/75 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.academyName} — {site.teacherName}.
            </p>
            <div className="flex items-center gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="transition-colors hover:text-brand-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
