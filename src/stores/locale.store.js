import { create } from 'zustand';
import { siteConfig } from '../config/site.config';
import { translations } from '../config/i18n.dictionary';

const STORAGE_KEY = 'manassa_locale_pref';

function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
  }
  const configLang = (siteConfig.localization.locale || 'ar-EG').split('-')[0];
  return configLang === 'en' ? 'en' : 'ar';
}

function applyDirectionToDOM(locale, directionOverride) {
  if (typeof document === 'undefined') return;
  const dir = directionOverride || (locale === 'en' ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', locale);
}

const initialLocale = getInitialLocale();
const initialDirection = initialLocale === 'en' ? 'ltr' : 'rtl';

export const useLocaleStore = create((set, get) => ({
  locale: initialLocale, // 'ar' | 'en'
  direction: initialDirection, // 'rtl' | 'ltr'

  setLocale: (nextLocale, customDirection) => {
    const normalized = nextLocale === 'en' ? 'en' : 'ar';
    const nextDir = customDirection || (normalized === 'en' ? 'ltr' : 'rtl');

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    applyDirectionToDOM(normalized, nextDir);
    set({ locale: normalized, direction: nextDir });
  },

  toggleLocale: () => {
    const current = get().locale;
    const next = current === 'ar' ? 'en' : 'ar';
    get().setLocale(next);
  },

  t: (path) => {
    const currentLocale = get().locale;
    const segments = path.split('.');
    let cursor = translations[currentLocale] || translations.ar;

    for (const key of segments) {
      if (cursor && typeof cursor === 'object' && key in cursor) {
        cursor = cursor[key];
      } else {
        return path;
      }
    }

    return typeof cursor === 'string' ? cursor : path;
  },
}));

export default useLocaleStore;
