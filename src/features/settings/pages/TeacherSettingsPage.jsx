import React, { useState } from 'react';
import {
  Palette,
  Building2,
  Image as ImageIcon,
  PhoneCall,
  Globe2,
  Share2,
  Eye,
  Info,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SettingsSection } from '../../../components/shared/SettingsSection';
import { SaveChangesBar } from '../../../components/shared/SaveChangesBar';
import { FormField } from '../../../components/forms/FormField';
import { ColorPicker } from '../../../components/forms/ColorPicker';
import { ImageUploadField } from '../../../components/forms/ImageUploadField';
import { Button } from '../../../components/ui/Button';
import { PaymentMethodsSummary } from '../../payments/components/PaymentMethodsSummary';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useBrandingStore } from '../../../stores/branding.store';
import { useTranslation } from '../../../hooks/useTranslation';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { settingsService } from '../services/settings.service';
import { sanitizeHexColor, sanitizeAssetUrl } from '../../../utils/theme';

const CURRENCY_OPTIONS = [
  { value: 'EGP', label: 'EGP — جنيه مصري (ج.م)', symbol: 'ج.م' },
  { value: 'SAR', label: 'SAR — ريال سعودي (ر.س)', symbol: 'ر.س' },
  { value: 'AED', label: 'AED — درهم إماراتي (د.إ)', symbol: 'د.إ' },
  { value: 'USD', label: 'USD — US Dollar ($)', symbol: '$' },
  { value: 'KWD', label: 'KWD — دينار كويتي (د.ك)', symbol: 'د.ك' },
];

function buildFormStateFromConfig(site) {
  return {
    academyName: site.academyName || '',
    teacherName: site.teacherName || '',
    teacherTitle: site.teacherTitle || '',
    tagline: site.tagline || '',
    description: site.description || '',
    logoPath: site.branding?.logoPath || '/logo.svg',
    faviconPath: site.branding?.faviconPath || '/favicon.svg',
    coverImagePath: site.branding?.coverImagePath || '',
    primary: site.theme?.colors?.primary || '#173F35',
    primaryHover: site.theme?.colors?.primaryHover || '#245747',
    dark: site.theme?.colors?.dark || '#0D332B',
    accent: site.theme?.colors?.accent || '#D5E8DD',
    secondary: site.theme?.colors?.secondary || '#245747',
    background: site.theme?.colors?.background || '#F7F8F4',
    surface: site.theme?.colors?.surface || '#FFFFFF',
    text: site.theme?.colors?.text || '#202923',
    textMuted: site.theme?.colors?.textMuted || '#66756C',
    border: site.theme?.colors?.border || '#DDE5DC',
    email: site.contact?.email || '',
    phone: site.contact?.phone || '',
    whatsapp: site.contact?.whatsapp || '',
    supportHours: site.contact?.supportHours || '',
    currency: site.localization?.currency || 'EGP',
    currencySymbol: site.localization?.currencySymbol || 'ج.م',
    locale: (site.localization?.locale || 'ar').split('-')[0],
    direction: site.localization?.direction || 'rtl',
    youtube: site.socials?.youtube || '',
    facebook: site.socials?.facebook || '',
    telegram: site.socials?.telegram || '',
    instagram: site.socials?.instagram || '',
  };
}

function buildConfigObjectFromForm(form, baseConfig) {
  return {
    ...baseConfig,
    academyName: form.academyName,
    teacherName: form.teacherName,
    teacherTitle: form.teacherTitle,
    tagline: form.tagline,
    description: form.description,
    branding: {
      logoPath: sanitizeAssetUrl(form.logoPath, '/logo.svg'),
      faviconPath: sanitizeAssetUrl(form.faviconPath, '/favicon.svg'),
      coverImagePath: sanitizeAssetUrl(form.coverImagePath, ''),
    },
    theme: {
      colors: {
        primary: sanitizeHexColor(form.primary, '#173F35'),
        primaryHover: sanitizeHexColor(form.primaryHover, '#245747'),
        dark: sanitizeHexColor(form.dark, '#0D332B'),
        accent: sanitizeHexColor(form.accent, '#D5E8DD'),
        secondary: sanitizeHexColor(form.secondary, '#245747'),
        background: sanitizeHexColor(form.background, '#F7F8F4'),
        surface: sanitizeHexColor(form.surface, '#FFFFFF'),
        text: sanitizeHexColor(form.text, '#202923'),
        textMuted: sanitizeHexColor(form.textMuted, '#66756C'),
        border: sanitizeHexColor(form.border, '#DDE5DC'),
      },
    },
    contact: {
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      supportHours: form.supportHours,
    },
    localization: {
      currency: form.currency,
      currencySymbol: form.currencySymbol,
      locale: form.locale,
      direction: form.direction,
    },
    socials: {
      youtube: sanitizeAssetUrl(form.youtube, ''),
      facebook: sanitizeAssetUrl(form.facebook, ''),
      telegram: sanitizeAssetUrl(form.telegram, ''),
      instagram: sanitizeAssetUrl(form.instagram, ''),
    },
  };
}

export function TeacherSettingsPage() {
  const site = useSiteConfig();
  const { t } = useTranslation();
  const previewBrandingDraft = useBrandingStore((state) => state.previewBrandingDraft);
  const resetToBaseline = useBrandingStore((state) => state.resetToBaseline);
  const setSavedBranding = useBrandingStore((state) => state.setSavedBranding);
  const source = useBrandingStore((state) => state.source);

  const [form, setForm] = useState(() => buildFormStateFromConfig(site));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');

  const updateField = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'currency') {
        const matched = CURRENCY_OPTIONS.find((c) => c.value === value);
        if (matched) next.currencySymbol = matched.symbol;
      }
      return next;
    });
    setIsDirty(true);
    setStatusMessage('');
  };

  const handleFieldInput = (e) => {
    updateField(e.target.name, e.target.value);
  };

  const handleApplyLivePreview = () => {
    const draftConfig = buildConfigObjectFromForm(form, site);
    previewBrandingDraft(draftConfig);
    setStatusTone('success');
    setStatusMessage(
      'تم تطبيق معاينة الهوية والألوان واللغة مباشرة على المتغيرات (CSS Variables) في الواجهة.'
    );
  };

  const handleCancelReset = () => {
    resetToBaseline();
    const baseline = useBrandingStore.getState().config;
    setForm(buildFormStateFromConfig(baseline));
    setIsDirty(false);
    setStatusTone('info');
    setStatusMessage('تمت استعادة الإعدادات الافتراضية من src/config/site.config.js.');
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    const draftConfig = buildConfigObjectFromForm(form, site);
    previewBrandingDraft(draftConfig);

    if (!isSupabaseConfigured) {
      setStatusTone('error');
      setStatusMessage(
        'تم تطبيق المعاينة الحية في الواجهة، ولكن تعذر الحفظ في قاعدة البيانات لأن متغيرات Supabase غير مضبوطة في ملف .env.'
      );
      return;
    }

    setIsSaving(true);
    setStatusMessage('');
    try {
      const savedConfig = await settingsService.saveRuntimeBranding(form);
      setSavedBranding(savedConfig);
      setIsDirty(false);
      setStatusTone('success');
      setStatusMessage('تم حفظ إعدادات الهوية والمنصة بنجاح في جدول site_settings بقاعدة البيانات.');
    } catch (err) {
      setStatusTone('error');
      setStatusMessage(
        err?.message ||
          'تعذر حفظ الإعدادات في قاعدة البيانات. تأكد من تسجيل الدخول بحساب المعلم وتطبيق ملف الترحيل 001_initial_academy_schema.sql.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        badgeText={`Source: ${source}`}
        actions={
          <Button variant="secondary" size="sm" onClick={handleApplyLivePreview}>
            <Eye className="h-4 w-4" />
            <span>تطبيق معاينة حية على الموقع</span>
          </Button>
        }
      />

      {/* Architectural Distinction Banner */}
      <div className="rounded-xl border border-brand-border bg-brand-accent/40 p-4 text-xs">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <div className="space-y-1">
            <p className="font-bold text-brand-primary">
              {t('settings.configDistinctionTitle')}
            </p>
            <p className="leading-relaxed text-brand-muted">
              {t('settings.configDistinctionDesc')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Academy & Teacher Identity */}
        <SettingsSection
          title="1. هوية الأكاديمية وبيانات المعلم"
          description="الاسم الرسمي للأكاديمية، اسم المعلم، والنبذة التعريفية المعروضة في الهيدر والرئيسية والفوتر."
          icon={Building2}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="اسم الأكاديمية / المنصة"
              name="academyName"
              required
              value={form.academyName}
              onChange={handleFieldInput}
            />
            <FormField
              label="اسم الأستاذ / المعلم"
              name="teacherName"
              required
              value={form.teacherName}
              onChange={handleFieldInput}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="المسمى التخصصي للمعلم"
              name="teacherTitle"
              value={form.teacherTitle}
              onChange={handleFieldInput}
            />
            <FormField
              label="الشعار اللفظي المختصر (Tagline)"
              name="tagline"
              value={form.tagline}
              onChange={handleFieldInput}
            />
          </div>

          <FormField
            as="textarea"
            rows={3}
            label="الوصف التعريفي للمنصة (يظهر في الفوتر وبطاقة التعريف)"
            name="description"
            value={form.description}
            onChange={handleFieldInput}
          />
        </SettingsSection>

        {/* 2. Visual Assets: Logo, Favicon & Hero Cover Image */}
        <SettingsSection
          title="2. الشعار (Logo)، الأيقونة (Favicon)، وصورة الغلاف (Cover Image)"
          description="ارفع أو حدد روابط الصور الرسمية للمنصة مع معاينة فورية وآمنة."
          icon={ImageIcon}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <ImageUploadField
              label="شعار المنصة (Logo)"
              name="logoPath"
              value={form.logoPath}
              onChange={(name, val) => updateField(name, val)}
              helperText="يفضل صيغة SVG أو PNG بخلفية شفافة."
            />
            <ImageUploadField
              label="أيقونة المتصفح (Favicon)"
              name="faviconPath"
              value={form.faviconPath}
              onChange={(name, val) => updateField(name, val)}
              helperText="تظهر في تبويب المتصفح (SVG أو PNG بحجم 64×64)."
            />
          </div>

          <ImageUploadField
            label="صورة غلاف الصفحة الرئيسية (Hero / Cover Image)"
            name="coverImagePath"
            value={form.coverImagePath}
            onChange={(name, val) => updateField(name, val)}
            previewHeight="h-32"
            helperText="تظهر في القسم الترحيبي بالصفحة الرئيسية عند تحديدها."
          />
        </SettingsSection>

        {/* 3. Theme Color Tokens (CSS Variables) */}
        <SettingsSection
          title="3. لوحة الألوان المخصصة (Theme CSS Variables)"
          description="تُحقن هذه الألوان مباشرة كمتغيرات CSS على مستوى الجذر (:root) لتغيير مظهر المنصة بالكامل دون تعديل الكود."
          icon={Palette}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ColorPicker
              label="Primary (الأساسي)"
              name="primary"
              value={form.primary}
              onChange={updateField}
              helperText="اللوجو، الأزرار، العناوين"
            />
            <ColorPicker
              label="Primary Hover"
              name="primaryHover"
              value={form.primaryHover}
              onChange={updateField}
              helperText="حالة التحويم للأزرار"
            />
            <ColorPicker
              label="Dark Green (الفوتر/CTA)"
              name="dark"
              value={form.dark}
              onChange={updateField}
              helperText="الفوتر والبانر الداكن"
            />
            <ColorPicker
              label="Accent (الخلفية المميزة)"
              name="accent"
              value={form.accent}
              onChange={updateField}
              helperText="الأيقونات والبادجات"
            />
            <ColorPicker
              label="Secondary (الثانوي)"
              name="secondary"
              value={form.secondary}
              onChange={updateField}
              helperText="العناصر المساندة"
            />
            <ColorPicker
              label="Background (خلفية الصفحة)"
              name="background"
              value={form.background}
              onChange={updateField}
              helperText="أوف وايت للصفحات"
            />
            <ColorPicker
              label="Surface (سطح الكروت)"
              name="surface"
              value={form.surface}
              onChange={updateField}
              helperText="الكروت وحقول الإدخال"
            />
            <ColorPicker
              label="Text Primary (النص الأساسي)"
              name="text"
              value={form.text}
              onChange={updateField}
              helperText="العناوين والنصوص"
            />
            <ColorPicker
              label="Text Secondary (النص الثانوي)"
              name="textMuted"
              value={form.textMuted}
              onChange={updateField}
              helperText="الوصف والنصوص الفرعية"
            />
            <ColorPicker
              label="Border (الحدود)"
              name="border"
              value={form.border}
              onChange={updateField}
              helperText="حدود الكروت والفواصل"
            />
          </div>
        </SettingsSection>

        {/* 4. Contact & Support Channels */}
        <SettingsSection
          title="4. بيانات التواصل والدعم الفني"
          description="تظهر في صفحة تواصل معنا، الفوتر، وتعليمات دعم الطلاب."
          icon={PhoneCall}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="البريد الإلكتروني للدعم"
              name="email"
              type="email"
              dir="ltr"
              value={form.email}
              onChange={handleFieldInput}
            />
            <FormField
              label="رقم الهاتف الرسمي"
              name="phone"
              dir="ltr"
              value={form.phone}
              onChange={handleFieldInput}
            />
            <FormField
              label="رقم واتساب (WhatsApp)"
              name="whatsapp"
              dir="ltr"
              value={form.whatsapp}
              onChange={handleFieldInput}
            />
            <FormField
              label="مواعيد عمل الدعم الفني"
              name="supportHours"
              value={form.supportHours}
              onChange={handleFieldInput}
            />
          </div>
        </SettingsSection>

        {/* 5. Social Media Links */}
        <SettingsSection
          title="5. روابط القنوات والشبكات الاجتماعية"
          description="روابط الحسابات الرسمية للمعلم (يوتيوب، فيسبوك، تيليجرام، إنستجرام)."
          icon={Share2}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="قناة يوتيوب (YouTube)"
              name="youtube"
              dir="ltr"
              placeholder="https://youtube.com/@teacher"
              value={form.youtube}
              onChange={handleFieldInput}
            />
            <FormField
              label="صفحة فيسبوك (Facebook)"
              name="facebook"
              dir="ltr"
              placeholder="https://facebook.com/teacher"
              value={form.facebook}
              onChange={handleFieldInput}
            />
            <FormField
              label="قناة تيليجرام (Telegram)"
              name="telegram"
              dir="ltr"
              placeholder="https://t.me/teacher"
              value={form.telegram}
              onChange={handleFieldInput}
            />
            <FormField
              label="حساب إنستجرام (Instagram)"
              name="instagram"
              dir="ltr"
              placeholder="https://instagram.com/teacher"
              value={form.instagram}
              onChange={handleFieldInput}
            />
          </div>
        </SettingsSection>

        {/* 6. Localization, Direction & Currency */}
        <SettingsSection
          title="6. اللغة، اتجاه العرض (RTL / LTR)، والعملة الافتراضية"
          description={t('common.currencyNote')}
          icon={Globe2}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              as="select"
              label="اللغة الافتراضية للمنصة"
              name="locale"
              value={form.locale}
              onChange={(e) => {
                const nextLocale = e.target.value;
                updateField('locale', nextLocale);
                updateField('direction', nextLocale === 'en' ? 'ltr' : 'rtl');
              }}
              options={[
                { value: 'ar', label: 'العربية (Arabic)' },
                { value: 'en', label: 'English (الإنجليزية)' },
              ]}
            />

            <FormField
              as="select"
              label="اتجاه تخطيط الواجهة"
              name="direction"
              value={form.direction}
              onChange={handleFieldInput}
              options={[
                { value: 'rtl', label: 'RTL — من اليمين إلى اليسار' },
                { value: 'ltr', label: 'LTR — Left to Right' },
              ]}
            />

            <FormField
              as="select"
              label="العملة الافتراضية للدورات"
              name="currency"
              value={form.currency}
              onChange={handleFieldInput}
              options={CURRENCY_OPTIONS}
            />
          </div>
        </SettingsSection>

        {/* 7. Live Public Website Branding Preview */}
        <SettingsSection
          title="7. معاينة حية لهوية الموقع العام (Public Website Preview)"
          description="نموذج مصغر يوضح كيف ستبدو الترويسة، البانر الرئيسي، الأزرار، والفوتر للطلاب بالهوية المختارة."
          icon={Eye}
        >
          <div
            className="overflow-hidden rounded-2xl border shadow-sm"
            style={{
              backgroundColor: sanitizeHexColor(form.background, '#F7F8F4'),
              borderColor: sanitizeHexColor(form.border, '#DDE5DC'),
              color: sanitizeHexColor(form.text, '#202923'),
            }}
          >
            {/* Mock Public Header */}
            <div
              className="flex items-center justify-between border-b px-5 py-3"
              style={{
                backgroundColor: sanitizeHexColor(form.surface, '#FFFFFF'),
                borderColor: sanitizeHexColor(form.border, '#DDE5DC'),
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: sanitizeHexColor(form.primary, '#173F35') }}
                >
                  أ
                </span>
                <div>
                  <p className="text-sm font-bold">{form.academyName}</p>
                  <p
                    className="text-[11px]"
                    style={{ color: sanitizeHexColor(form.textMuted, '#66756C') }}
                  >
                    {form.teacherName}
                  </p>
                </div>
              </div>
              <span
                className="rounded-lg px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: sanitizeHexColor(form.accent, '#D5E8DD'),
                  color: sanitizeHexColor(form.primary, '#173F35'),
                }}
              >
                {form.currency} ({form.currencySymbol})
              </span>
            </div>

            {/* Mock Hero */}
            <div className="grid gap-4 p-6 md:grid-cols-3 md:items-center">
              <div className="space-y-2 md:col-span-2">
                <span
                  className="inline-block rounded-full px-3 py-0.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: sanitizeHexColor(form.accent, '#D5E8DD'),
                    color: sanitizeHexColor(form.primary, '#173F35'),
                  }}
                >
                  {form.teacherTitle}
                </span>
                <h4
                  className="text-lg font-bold"
                  style={{ color: sanitizeHexColor(form.primary, '#173F35') }}
                >
                  {form.tagline}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: sanitizeHexColor(form.textMuted, '#66756C') }}
                >
                  {form.description}
                </p>
              </div>
              {sanitizeAssetUrl(form.coverImagePath, '') && (
                <img
                  src={sanitizeAssetUrl(form.coverImagePath, '')}
                  alt="Cover Preview"
                  className="h-28 w-full rounded-xl object-cover"
                />
              )}
            </div>

            {/* Mock Footer */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs text-white"
              style={{ backgroundColor: sanitizeHexColor(form.dark, '#0D332B') }}
            >
              <span>{form.academyName}</span>
              <span dir="ltr" className="font-mono text-[11px] opacity-85">
                {form.email} | {form.phone}
              </span>
            </div>
          </div>
        </SettingsSection>

        <PaymentMethodsSummary />

        <SaveChangesBar
          isDirty={isDirty}
          isSaving={isSaving}
          statusMessage={statusMessage}
          statusTone={statusTone}
          onCancel={handleCancelReset}
        />
      </form>
    </PageContainer>
  );
}

export default TeacherSettingsPage;
