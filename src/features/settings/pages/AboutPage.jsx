import React from 'react';
import { PlaceholderPageSection } from '../../../components/shared/PlaceholderPageSection';
import { BrandingConfigPreview } from '../components/BrandingConfigPreview';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { ROUTES } from '../../../constants/routes';

export function AboutPage() {
  const site = useSiteConfig();

  return (
    <PlaceholderPageSection
      title={`عن الأستاذ — ${site.teacherName}`}
      badgeText="المسارات العامة"
      routePattern={ROUTES.ABOUT}
      purpose="تعرض هذه الصفحة السيرة الذاتية للمعلم، خبراته الأكاديمية، منهجيته في الشرح والمتابعة، والرؤية التعليمية للأكاديمية."
      responsibilities={[
        'قراءة اسم المعلم والوصف التعريفي من ملف الإعدادات المركزي site.config.js.',
        'تقديم نبذة واضحة للطلاب وأولياء الأمور حول أسلوب الدراسة داخل المنصة.',
        'توجيه الزوار إلى فهرس الدورات التدريبية المتاحة.',
      ]}
    >
      <BrandingConfigPreview />
    </PlaceholderPageSection>
  );
}

export default AboutPage;
