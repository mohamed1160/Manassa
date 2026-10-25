import { siteConfig } from '../../../config/site.config';
import { paymentConfig } from '../../../config/payment.config';
import { requireSupabaseClient } from '../../../services/supabase/client';
import { sanitizeHexColor, sanitizeAssetUrl } from '../../../utils/theme';
import { mapDbSettingsToSiteConfig } from '../../../stores/branding.store';

/**
 * Settings & Teacher Branding Service (`src/features/settings/services/settings.service.js`).
 *
 * Distinguishes between:
 * 1. Static developer-managed configuration (`src/config/site.config.js`).
 * 2. Runtime database configuration stored in `public.site_settings` (row `id = 1`),
 *    restricted via Supabase RLS to the authorized `teacher` role.
 */
export const settingsService = {
  getStaticSiteConfiguration() {
    return {
      site: siteConfig,
      payment: paymentConfig,
    };
  },

  async saveRuntimeBranding(formValues) {
    const client = requireSupabaseClient();
    const defaults = siteConfig.theme.colors;

    const payload = {
      id: 1,
      academy_name: (formValues.academyName || '').trim(),
      teacher_name: (formValues.teacherName || '').trim(),
      teacher_title: (formValues.teacherTitle || '').trim(),
      tagline: (formValues.tagline || '').trim(),
      description: (formValues.description || '').trim(),
      logo_url: sanitizeAssetUrl(formValues.logoPath, '/logo.svg'),
      favicon_url: sanitizeAssetUrl(formValues.faviconPath, '/favicon.svg'),
      cover_image_url: sanitizeAssetUrl(formValues.coverImagePath, ''),
      primary_color: sanitizeHexColor(formValues.primary, defaults.primary),
      primary_hover_color: sanitizeHexColor(formValues.primaryHover, defaults.primaryHover),
      dark_color: sanitizeHexColor(formValues.dark, defaults.dark),
      accent_color: sanitizeHexColor(formValues.accent, defaults.accent),
      secondary_color: sanitizeHexColor(formValues.secondary, defaults.secondary),
      background_color: sanitizeHexColor(formValues.background, defaults.background),
      surface_color: sanitizeHexColor(formValues.surface, defaults.surface),
      text_color: sanitizeHexColor(formValues.text, defaults.text),
      text_muted_color: sanitizeHexColor(formValues.textMuted, defaults.textMuted),
      border_color: sanitizeHexColor(formValues.border, defaults.border),
      contact_email: (formValues.email || '').trim(),
      contact_phone: (formValues.phone || '').trim(),
      whatsapp_number: (formValues.whatsapp || '').trim(),
      support_hours: (formValues.supportHours || '').trim(),
      default_currency: formValues.currency || 'EGP',
      currency_symbol: formValues.currencySymbol || 'ج.م',
      default_locale: formValues.locale === 'en' ? 'en' : 'ar',
      default_direction: formValues.direction === 'ltr' ? 'ltr' : 'rtl',
      social_links: {
        youtube: sanitizeAssetUrl(formValues.youtube, ''),
        facebook: sanitizeAssetUrl(formValues.facebook, ''),
        telegram: sanitizeAssetUrl(formValues.telegram, ''),
        instagram: sanitizeAssetUrl(formValues.instagram, ''),
      },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDbSettingsToSiteConfig(data, siteConfig);
  },
};

export default settingsService;
