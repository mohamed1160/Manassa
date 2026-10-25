import React from 'react';
import { Palette } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useSiteConfig } from '../../../hooks/useSiteConfig';

export function BrandingConfigPreview() {
  const site = useSiteConfig();
  const { colors } = site.theme;

  const paletteSwatches = [
    { name: 'Primary', hex: colors.primary, role: 'اللوجو، الأزرار الأساسية، العناوين المهمة' },
    { name: 'Primary Hover', hex: colors.primaryHover, role: 'حالة Hover للأزرار والعناصر التفاعلية' },
    { name: 'Dark Green', hex: colors.dark, role: 'الفوتر والـ CTA الداكن' },
    { name: 'Accent', hex: colors.accent, role: 'الخلفيات الزخرفية والأيقونات والعناصر المميزة' },
    { name: 'Background', hex: colors.background, role: 'الخلفية الرئيسية للصفحات' },
    { name: 'Surface', hex: colors.surface, role: 'الكروت، النوافذ، وحقول الإدخال' },
    { name: 'Text Primary', hex: colors.text, role: 'النصوص والعناوين' },
    { name: 'Text Secondary', hex: colors.textMuted, role: 'الوصف والنصوص الأقل أهمية' },
    { name: 'Border', hex: colors.border, role: 'حدود الكروت والفواصل' },
  ];

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2 text-brand-primary">
        <Palette className="h-5 w-5" />
        <h3 className="text-base font-bold text-brand-primary">
          ملخص إعدادات الهوية ولوحة الألوان (src/config/site.config.js)
        </h3>
      </div>

      <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
          <span className="text-brand-muted">اسم المعلم:</span>
          <p className="mt-1 font-bold text-brand-text">{site.teacherName}</p>
        </div>
        <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
          <span className="text-brand-muted">اسم المنصة / الأكاديمية:</span>
          <p className="mt-1 font-bold text-brand-text">{site.academyName}</p>
        </div>
        <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
          <span className="text-brand-muted">العملة والاتجاه الافتراضي:</span>
          <p className="mt-1 font-bold text-brand-text">
            {site.localization.currency} ({site.localization.currencySymbol}) —{' '}
            {site.localization.direction.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paletteSwatches.map((swatch) => (
          <div
            key={swatch.name}
            className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-surface p-2.5 text-xs"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-lg border border-brand-border shadow-inner"
              style={{ backgroundColor: swatch.hex }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-brand-text">{swatch.name}</span>
                <code dir="ltr" className="font-mono text-[11px] text-brand-primary">
                  {swatch.hex}
                </code>
              </div>
              <p className="truncate text-[11px] text-brand-muted">{swatch.role}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default BrandingConfigPreview;
