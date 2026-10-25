import { siteConfig } from '../config/site.config';

/**
 * Formats a numeric amount using the selected locale and configured currency.
 * Does NOT perform currency conversion.
 */
export function formatCurrency(
  amount,
  currency = siteConfig.localization.currency,
  locale = siteConfig.localization.locale
) {
  const numericAmount = Number(amount);
  if (amount === null || amount === undefined || Number.isNaN(numericAmount)) {
    return `0 ${currency}`;
  }

  const resolvedLocale = locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-EG' : locale;

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: currency || 'EGP',
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency || siteConfig.localization.currencySymbol}`;
  }
}

/**
 * Formats an ISO timestamp according to the active locale (ar-EG or en-US).
 */
export function formatDate(dateInput, locale = 'ar') {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';

  const resolvedLocale = locale === 'en' ? 'en-US' : 'ar-EG';
  try {
    return new Intl.DateTimeFormat(resolvedLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
