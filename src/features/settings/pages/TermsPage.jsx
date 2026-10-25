import React from 'react';
import { PlaceholderPageSection } from '../../../components/shared/PlaceholderPageSection';
import { ROUTES } from '../../../constants/routes';

export function TermsPage() {
  return (
    <PlaceholderPageSection
      title="الشروط والأحكام"
      badgeText="صفحة قانونية"
      routePattern={ROUTES.TERMS}
      purpose="توضح هذه الصفحة ضوابط استخدام المنصة، شروط الاشتراك في الدورات المسجلة، حقوق الملكية الفكرية للمحتوى المرئي، وسياسة الاسترجاع الخاصة بالمعلم."
      responsibilities={[
        'تحديد التزامات الطالب بعدم مشاركة بيانات الحساب أو إعادة نشر الفيديوهات المسجلة.',
        'توضيح آلية تفعيل الاشتراك بعد مراجعة إيصال الدفع اليدوي.',
        'قابلة للتخصيص لكل معلم بحسب سياسة الأكاديمية الخاصة به.',
      ]}
    />
  );
}

export default TermsPage;
