import React from 'react';
import { PlaceholderPageSection } from '../../../components/shared/PlaceholderPageSection';
import { ROUTES } from '../../../constants/routes';

export function PrivacyPage() {
  return (
    <PlaceholderPageSection
      title="سياسة الخصوصية وحماية البيانات"
      badgeText="صفحة قانونية"
      routePattern={ROUTES.PRIVACY}
      purpose="تشرح هذه الصفحة كيفية جمع وحماية بيانات الطلاب (الاسم، البريد الإلكتروني، رقم الهاتف، وإيصالات الدفع) داخل قاعدة البيانات المستقلة للمنصة."
      responsibilities={[
        'توضيح البيانات الأساسية المطلوبة لإنشاء حساب الطالب وتوثيق المدفوعات.',
        'تأكيد حفظ إيصالات الدفع في حاويات تخزين خاصة (Private Storage Buckets) لا يطلع عليها سوى المعلم.',
        'بيان حقوق الطالب في تحديث بياناته الشخصية أو التواصل مع إدارة المنصة.',
      ]}
    />
  );
}

export default PrivacyPage;
