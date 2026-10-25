import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseCard } from '../../../components/shared/CourseCard';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { learningService } from '../../learning/services/learning.service';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function StudentCoursesPage() {
  const { t } = useTranslation();

  const [enrolledItems, setEnrolledItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMyCourses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await learningService.getMyEnrolledCoursesWithProgress();
      setEnrolledItems(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل دورات الطالب المسجلة.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyCourses();
  }, [loadMyCourses]);

  return (
    <PageContainer>
      <PageHeader
        title={t('learning.myCoursesTitle')}
        subtitle="استعرض الدورات المشترك بها، نسبة تقدمك الفعلي في الدروس، واستأنف الدراسة."
        badgeText={t('nav.studentPortal')}
        actions={
          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
          >
            <BookOpen className="h-4 w-4 text-brand-primary" />
            <span>{t('nav.courses')}</span>
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={loadMyCourses} />}

      {isLoading ? (
        <LoadingState />
      ) : enrolledItems.length === 0 ? (
        <EmptyState
          title="لا توجد دورات مفعلة في حسابك بعد"
          description="عند اشتراكك في أي دورة واعتماد إيصال الدفع من المعلم، ستظهر الدورة هنا مع شريط تقدمك وعدد الدروس المكتملة."
          action={
            <Link
              to={ROUTES.COURSES}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('nav.courses')}</span>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledItems.map((item) => (
            <CourseCard
              key={item.enrollmentId}
              course={item.course}
              progress={item.progress}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default StudentCoursesPage;
