import React, { useEffect } from 'react';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';
import { useLocaleStore } from '../stores/locale.store';

/**
 * Root Application Providers (`src/app/providers.jsx`).
 * Initializes:
 * 1. Branding CSS variables & runtime site_settings from Supabase (`useBrandingStore`).
 * 2. Active locale & document RTL/LTR direction (`useLocaleStore`).
 * 3. Supabase authentication session (`useAuthStore`).
 */
export function AppProviders({ children }) {
  const initializeSession = useAuthStore((state) => state.initializeSession);
  const initializeBranding = useBrandingStore((state) => state.initializeBranding);
  const locale = useLocaleStore((state) => state.locale);
  const direction = useLocaleStore((state) => state.direction);

  useEffect(() => {
    initializeBranding();
    initializeSession();
  }, [initializeBranding, initializeSession]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', direction);
      document.documentElement.setAttribute('lang', locale);
    }
  }, [locale, direction]);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default AppProviders;
