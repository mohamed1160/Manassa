import { siteConfig } from '../config/site.config';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/**
 * Validates a hex color string to prevent unsafe CSS injection.
 */
export function sanitizeHexColor(value, fallback) {
  if (typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim())) {
    return value.trim();
  }
  return fallback;
}

/**
 * Validates an asset path or URL to prevent javascript: or data:text/html injection.
 */
export function sanitizeAssetUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  return fallback;
}

/**
 * Applies branding configuration (sanitized CSS variables, document title, favicon)
 * to the root document element.
 */
export function applySiteTheme(config = siteConfig) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const defaults = siteConfig.theme.colors;
  const colors = config?.theme?.colors || defaults;

  root.style.setProperty('--color-primary', sanitizeHexColor(colors.primary, defaults.primary));
  root.style.setProperty(
    '--color-primary-hover',
    sanitizeHexColor(colors.primaryHover, defaults.primaryHover)
  );
  root.style.setProperty('--color-dark', sanitizeHexColor(colors.dark, defaults.dark));
  root.style.setProperty('--color-accent', sanitizeHexColor(colors.accent, defaults.accent));
  root.style.setProperty(
    '--color-secondary',
    sanitizeHexColor(colors.secondary, defaults.secondary)
  );
  root.style.setProperty(
    '--color-background',
    sanitizeHexColor(colors.background, defaults.background)
  );
  root.style.setProperty('--color-surface', sanitizeHexColor(colors.surface, defaults.surface));
  root.style.setProperty('--color-text', sanitizeHexColor(colors.text, defaults.text));
  root.style.setProperty(
    '--color-text-muted',
    sanitizeHexColor(colors.textMuted, defaults.textMuted)
  );
  root.style.setProperty('--color-border', sanitizeHexColor(colors.border, defaults.border));

  if (config?.academyName) {
    document.title = config.academyName;
  }

  const safeFavicon = sanitizeAssetUrl(config?.branding?.faviconPath, '/favicon.svg');
  if (safeFavicon) {
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) {
      favicon.setAttribute('href', safeFavicon);
    }
  }
}
