import { useBrandingStore } from '../stores/branding.store';

/**
 * Returns the live site & teacher branding configuration (merging `site.config.js`
 * baseline defaults with any authorized runtime overrides).
 */
export function useSiteConfig() {
  return useBrandingStore((state) => state.config);
}

export default useSiteConfig;
