import React from 'react';
import { Mail, Phone, Clock } from 'lucide-react';
import { PlaceholderPageSection } from '../../../components/shared/PlaceholderPageSection';
import { Card } from '../../../components/ui/Card';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { ROUTES } from '../../../constants/routes';

export function ContactPage() {
  const site = useSiteConfig();

  return (
    <PlaceholderPageSection
      title="تواصل معنا والدعم الفني"
      badgeText="المسارات العامة"
      routePattern={ROUTES.CONTACT}
      purpose="توفر هذه الصفحة قنوات التواصل المباشرة مع فريق دعم المعلم (البريد الإلكتروني، الهاتف، واتساب) ومواعيد العمل الرسمية."
      responsibilities={[
        'عرض بيانات التواصل الرسمية المعرفة في site.config.js دون تكرار قيم ثابتة في الكود.',
        'توضيح أوقات الدعم الفني للرد على استفسارات الاشتراكات والدورات.',
        'إمكانية إضافة نموذج مراسلة مباشر مرتبط بقاعدة البيانات أو البريد.',
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="space-y-1.5">
          <Mail className="h-5 w-5 text-brand-primary" />
          <h3 className="text-sm font-bold text-brand-text">البريد الإلكتروني</h3>
          <p dir="ltr" className="font-mono text-xs text-brand-muted">
            {site.contact.email}
          </p>
        </Card>

        <Card className="space-y-1.5">
          <Phone className="h-5 w-5 text-brand-primary" />
          <h3 className="text-sm font-bold text-brand-text">الهاتف / واتساب</h3>
          <p dir="ltr" className="font-mono text-xs text-brand-muted">
            {site.contact.phone}
          </p>
        </Card>

        <Card className="space-y-1.5">
          <Clock className="h-5 w-5 text-brand-primary" />
          <h3 className="text-sm font-bold text-brand-text">ساعات الدعم</h3>
          <p className="text-xs text-brand-muted">{site.contact.supportHours}</p>
        </Card>
      </div>
    </PlaceholderPageSection>
  );
}

export default ContactPage;
