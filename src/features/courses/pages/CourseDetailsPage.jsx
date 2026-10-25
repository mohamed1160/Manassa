import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  PlayCircle,
  BookOpen,
  Clock,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { coursesService } from '../services/courses.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { formatCurrency } from '../../../utils/formatters';
import { sanitizeAssetUrl } from '../../../utils/theme';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function CourseDetailsPage() {
  const { slug } = useParams();
  const site = useSiteConfig();
  const { locale, t } = useTranslation();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCourseDetails = useCallback(async () => {
    if (!isSupabaseConfigured || !slug) return;

    setIsLoading(true);
    setError('');
    try {
      const data = await coursesService.getCourseBySlug(slug);
      setCourse(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل تفاصيل الدورة التدريبية.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadCourseDetails();
  }, [loadCourseDetails]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  const targetCourseId = course?.id || slug || 'course-1';
  const safeThumb = sanitizeAssetUrl(course?.thumbnail_url, '');
  const sections = course?.course_sections || [];

  return (
    <PageContainer>
      <PageHeader
        title={course?.title || `تفاصيل الدورة (${slug})`}
        subtitle={
          course?.short_description ||
          'عرض تفاصيل الدورة، الأهداف التعليمية، وهيكل الوحدات والدروس قبل الاشتراك.'
        }
        badgeText={course?.category || t('nav.courses')}
        actions={
          <>
            <Link
              to={ROUTES.STUDENT.getCheckoutPath(targetCourseId)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-hover"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>الاشتراك في الدورة</span>
            </Link>
            <Link
              to={ROUTES.COURSES}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2.5 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
              <span>{t('nav.courses')}</span>
            </Link>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Course Info & Curriculum */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-brand-primary">
              {t('courses.fullDescLabel')}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">
              {course?.full_description ||
                'عند حفظ ونشر الدورة من لوحة المعلم، يظهر هنا الوصف الكامل للدورة ومتطلباتها وأهدافها الدراسية.'}
            </p>
          </Card>

          {/* Curriculum Sections */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2 text-brand-primary">
                <BookOpen className="h-5 w-5" />
                <h2 className="text-base font-bold">
                  {t('learning.courseCurriculum')}
                </h2>
              </div>
              <Badge variant="neutral">
                {sections.length} وحدات دراسية
              </Badge>
            </div>

            {sections.length === 0 ? (
              <EmptyState
                title="لم يتم نشر وحدات دراسية لهذه الدورة بعد"
                description="ستظهر هنا قائمة الفصول والدروس الحقيقية فور إضافتها من المعلم في باني المنهج الدراسي."
              />
            ) : (
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-xl border border-brand-border bg-brand-bg/50"
                  >
                    <div className="flex items-center justify-between border-b border-brand-border bg-brand-surface px-4 py-3">
                      <span className="text-sm font-bold text-brand-primary">
                        {idx + 1}. {section.title}
                      </span>
                      <span className="text-xs text-brand-muted">
                        {(section.lessons || []).length} دروس
                      </span>
                    </div>

                    <ul className="divide-y divide-brand-border">
                      {(section.lessons || []).map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between px-4 py-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {lesson.is_preview ? (
                              <Unlock className="h-3.5 w-3.5 text-brand-primary" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-brand-muted" />
                            )}
                            <span className="font-medium text-brand-text">
                              {lesson.title}
                            </span>
                            {lesson.is_preview && (
                              <Badge variant="primary">معاينة مجانية</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-brand-muted">
                            {lesson.duration_minutes > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration_minutes} د
                              </span>
                            )}
                            {lesson.is_preview && (
                              <Link
                                to={ROUTES.STUDENT.getLearnPath(
                                  targetCourseId,
                                  lesson.id
                                )}
                                className="font-bold text-brand-primary hover:underline"
                              >
                                مشاهدة
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Enrollment Summary Card */}
        <div className="space-y-4">
          <Card className="space-y-5">
            {safeThumb && (
              <img
                src={safeThumb}
                alt={course?.title || ''}
                className="h-44 w-full rounded-xl border border-brand-border object-cover"
              />
            )}

            <div className="flex items-baseline justify-between border-b border-brand-border pb-4">
              <span className="text-xs font-medium text-brand-muted">
                {t('courses.priceLabel')}
              </span>
              <span className="text-2xl font-bold text-brand-primary">
                {course
                  ? formatCurrency(course.price, course.currency, locale)
                  : `— ${site.localization.currencySymbol}`}
              </span>
            </div>

            <div className="space-y-2 text-xs text-brand-muted">
              <p>الأستاذ المحاضر: {site.teacherName}</p>
              <p>تفعيل الاشتراك بعد مراجعة إيصال الدفع اليدوي</p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to={ROUTES.STUDENT.getCheckoutPath(targetCourseId)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>طلب الاشتراك وتأكيد الدفع</span>
              </Link>

              <Link
                to={ROUTES.STUDENT.getLearnPath(targetCourseId, 'lesson-1')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-5 py-2.5 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-accent/40"
              >
                <PlayCircle className="h-4 w-4 text-brand-primary" />
                <span>الانتقال إلى مشغل الدروس</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default CourseDetailsPage;
