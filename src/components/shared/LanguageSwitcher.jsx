import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Accessible Arabic (RTL) / English (LTR) language toggle button.
 */
export function LanguageSwitcher({ className = '' }) {
  const { locale, toggleLocale, t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-accent/40 ${className}`}
      aria-label={
        locale === 'ar' ? 'Switch language to English' : 'التبديل إلى اللغة العربية'
      }
    >
      <Languages className="h-3.5 w-3.5 text-brand-primary" />
      <span>{t('common.languageToggle')}</span>
    </button>
  );
}

export default LanguageSwitcher;
