import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Video, CreditCard, ArrowLeft } from 'lucide-react';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CourseCard } from '../../../components/shared/CourseCard';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { coursesService } from '../services/courses.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { sanitizeAssetUrl } from '../../../utils/theme';
import { ROUTES } from '../../../constants/routes';

export function HomePage() {
  const site = useSiteConfig();
  const { t } = useTranslation();
  const [publishedCourses, setPublishedCourses] = useState([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    coursesService
      .listPublishedCourses()
      .then((data) => setPublishedCourses((data || []).slice(0, 3)))
      .catch(() => setPublishedCourses([]));
  }, []);

  const safeCover = sanitizeAssetUrl(site?.branding?.coverImagePath, '');

  return (
    <div className="space-y-12">
      {/* Branded Hero Section */}
      <section className="rounded-3xl border border-brand-border bg-brand-surface p-8 shadow-sm sm:p-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-5 lg:col-span-8">
            <Badge variant="primary">{site.academyName}</Badge>
            <h1 className="text-3xl font-bold leading-tight text-brand-primary sm:text-4xl">
              {site.teacherName} — {site.teacherTitle}
            </h1>
            <p className="text-base leading-relaxed text-brand-muted sm:text-lg">
              {site.tagline} — {site.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={ROUTES.COURSES}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-hover"
              >
                <BookOpen className="h-4 w-4" />
                <span>{t('nav.courses')}</span>
              </Link>
              <Link
                to={ROUTES.ABOUT}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-accent/40"
              >
                <span>{t('nav.about')}</span>
              </Link>
            </div>
          </div>

          {safeCover && (
            <div className="lg:col-span-4">
              <img
                src={safeCover}
                alt={site.academyName}
                className="h-60 w-full rounded-2xl border border-brand-border object-cover shadow-sm"
              />
            </div>
          )}
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-2.5">
          <div className="inline-flex rounded-lg bg-brand-accent p-2.5 text-brand-primary">
            <Video className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-brand-primary">
            محتوى مرئي منظم بوحدات ودروس
          </h2>
          <p className="text-xs leading-relaxed text-brand-muted">
            هيكلية مخصصة لتقسيم كل دورة إلى فصول ودروس مسجلة مع تتبع دقيق لنسبة إنجاز كل طالب.
          </p>
        </Card>

        <Card className="space-y-2.5">
          <div className="inline-flex rounded-lg bg-brand-accent p-2.5 text-brand-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-brand-primary">
            اشتراك مرن وتأكيد دفع موثوق
          </h2>
          <p className="text-xs leading-relaxed text-brand-muted">
            دعم وسائل الدفع المحلية (المحافظ الإلكترونية و InstaPay) مع مراجعة الإيصالات واعتماد المعلم للطلبات.
          </p>
        </Card>

        <Card className="space-y-2.5">
          <div className="inline-flex rounded-lg bg-brand-accent p-2.5 text-brand-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-brand-primary">
            استقلالية كاملة لكل معلم
          </h2>
          <p className="text-xs leading-relaxed text-brand-muted">
            نسخة مستقلة تماماً بهوية المعلم، ألوانه، وقاعدة بيانات Supabase الخاصة به دون تداخل بيانات.
          </p>
        </Card>
      </section>

      {/* Published Courses Section */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">
              {t('courses.catalogTitle')}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {t('courses.catalogSubtitle')}
            </p>
          </div>
          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
          >
            <span>{t('nav.courses')}</span>
            <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>

        {publishedCourses.length === 0 ? (
          <EmptyState
            title="لا توجد دورات منشورة حالياً"
            description="بمجرد نشر الدورات من لوحة تحكم المعلم، ستظهر البطاقات الفعلية هنا تلقائياً."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Dark Green CTA Banner (#0D332B / bg-brand-dark) */}
      <section className="rounded-3xl bg-brand-dark p-8 text-white shadow-sm sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-brand-primary">
              {site.academyName}
            </span>
            <h2 className="text-2xl font-bold text-white">
              تصفح الدورات المتاحة أو تواصل مع فريق دعم {site.teacherName}
            </h2>
            <p className="text-sm text-brand-accent/85">
              {site.contact.supportHours}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.COURSES}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-brand-primary transition-colors hover:bg-white"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('nav.courses')}</span>
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
            >
              <span>{t('nav.contact')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
