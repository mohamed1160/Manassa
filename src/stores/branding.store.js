import { create } from 'zustand';
import { siteConfig as defaultSiteConfig } from '../config/site.config';
import { applySiteTheme, sanitizeHexColor, sanitizeAssetUrl } from '../utils/theme';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { useLocaleStore } from './locale.store';

/**
 * Maps a database `site_settings` row onto the structured `siteConfig` shape.
 */
export function mapDbSettingsToSiteConfig(row, base = defaultSiteConfig) {
  if (!row) return base;

  return {
    ...base,
    academyName: row.academy_name || base.academyName,
    teacherName: row.teacher_name || base.teacherName,
    teacherTitle: row.teacher_title || base.teacherTitle,
    tagline: row.tagline || base.tagline,
    description: row.description || base.description,
    branding: {
      logoPath: sanitizeAssetUrl(row.logo_url, base.branding.logoPath),
      faviconPath: sanitizeAssetUrl(row.favicon_url, base.branding.faviconPath),
      coverImagePath: sanitizeAssetUrl(row.cover_image_url, base.branding.coverImagePath),
    },
    theme: {
      colors: {
        primary: sanitizeHexColor(row.primary_color, base.theme.colors.primary),
        primaryHover: sanitizeHexColor(row.primary_hover_color, base.theme.colors.primaryHover),
        dark: sanitizeHexColor(row.dark_color, base.theme.colors.dark),
        accent: sanitizeHexColor(row.accent_color, base.theme.colors.accent),
        secondary: sanitizeHexColor(row.secondary_color, base.theme.colors.secondary),
        background: sanitizeHexColor(row.background_color, base.theme.colors.background),
        surface: sanitizeHexColor(row.surface_color, base.theme.colors.surface),
        text: sanitizeHexColor(row.text_color, base.theme.colors.text),
        textMuted: sanitizeHexColor(row.text_muted_color, base.theme.colors.textMuted),
        border: sanitizeHexColor(row.border_color, base.theme.colors.border),
      },
    },
    contact: {
      email: row.contact_email ?? base.contact.email,
      phone: row.contact_phone ?? base.contact.phone,
      whatsapp: row.whatsapp_number ?? base.contact.whatsapp,
      supportHours: row.support_hours ?? base.contact.supportHours,
    },
    localization: {
      currency: row.default_currency || base.localization.currency,
      currencySymbol: row.currency_symbol || base.localization.currencySymbol,
      locale: row.default_locale || base.localization.locale,
      direction: row.default_direction || base.localization.direction,
    },
    socials: {
      youtube: sanitizeAssetUrl(row.social_links?.youtube, base.socials.youtube),
      facebook: sanitizeAssetUrl(row.social_links?.facebook, base.socials.facebook),
      telegram: sanitizeAssetUrl(row.social_links?.telegram, base.socials.telegram),
      instagram: sanitizeAssetUrl(row.social_links?.instagram, base.socials.instagram),
    },
  };
}

export const useBrandingStore = create((set, get) => ({
  config: defaultSiteConfig,
  source: 'static_config', // 'static_config' | 'database_runtime' | 'preview_unsaved'
  isLoading: false,
  error: null,

  initializeBranding: async () => {
    applySiteTheme(get().config);

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        // Table may not be migrated yet; keep static config gracefully
        set({ isLoading: false });
        return;
      }

      if (data) {
        const merged = mapDbSettingsToSiteConfig(data, defaultSiteConfig);
        applySiteTheme(merged);
        set({
          config: merged,
          source: 'database_runtime',
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  previewBrandingDraft: (draftConfig) => {
    applySiteTheme(draftConfig);
    if (draftConfig?.localization?.locale) {
      useLocaleStore
        .getState()
        .setLocale(draftConfig.localization.locale, draftConfig.localization.direction);
    }
    set({ config: draftConfig, source: 'preview_unsaved' });
  },

  resetToBaseline: () => {
    applySiteTheme(defaultSiteConfig);
    set({ config: defaultSiteConfig, source: 'static_config', error: null });
  },

  setSavedBranding: (savedConfig) => {
    applySiteTheme(savedConfig);
    set({ config: savedConfig, source: 'database_runtime', error: null });
  },
}));

export default useBrandingStore;
