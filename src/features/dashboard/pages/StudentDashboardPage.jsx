import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  BookOpen,
  Clock,
  UserCheck,
  Receipt,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { learningService } from '../../learning/services/learning.service';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';
import { formatDate } from '../../../utils/formatters';
import { ROUTES } from '../../../constants/routes';

export function StudentDashboardPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const { locale, t } = useTranslation();

  const [enrolledItems, setEnrolledItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStudentProgress = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const items = await learningService.getMyEnrolledCoursesWithProgress();
      setEnrolledItems(items);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل بيانات تقدم الطالب.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentProgress();
  }, [loadStudentProgress]);

  const studentDisplayName =
    profile?.fullName || user?.email || (isAuthenticated ? 'طالب مسجل' : 'زائر (غير مسجل الدخول)');

  const recentlyAccessed = enrolledItems.filter((item) =>
    Boolean(item.lastAccessedAt || item.lastAccessedLesson)
  );

  return (
    <PageContainer>
      <PageHeader
        title={t('learning.dashboardTitle')}
        subtitle={`${t('learning.welcomeStudent')} — ${studentDisplayName}`}
        badgeText={t('nav.studentPortal')}
        actions={
          <>
            <Link
              to={ROUTES.STUDENT.COURSES}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('nav.myCourses')}</span>
            </Link>
            <Link
              to={ROUTES.STUDENT.ORDERS}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <Receipt className="h-4 w-4" />
              <span>{t('nav.studentOrders')}</span>
            </Link>
          </>
        }
      />

      {/* Real Authenticated Student Welcome Card */}
      <Card className="flex flex-col justify-between gap-4 bg-brand-accent/35 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-primary p-2.5 text-white">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-brand-primary">
              {studentDisplayName}
            </h2>
            <p className="text-xs text-brand-muted">
              {isAuthenticated
                ? `عدد الدورات المفعلة في حسابك: ${enrolledItems.length}`
                : 'سجل الدخول بحساب طالب لعرض دوراتك المفعلة واستئناف الدروس من آخر نقطة توقفت عندها.'}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.COURSES}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-accent"
        >
          <BookOpen className="h-4 w-4" />
          <span>{t('nav.courses')}</span>
        </Link>
      </Card>

      {error && <ErrorState message={error} onRetry={loadStudentProgress} />}

      {/* Recently Accessed Lesson Resume Banner */}
      {recentlyAccessed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-brand-primary">
            {t('learning.lastAccessed')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recentlyAccessed.slice(0, 2).map((item) => (
              <Card key={item.enrollmentId} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">
                      {item.course.title}
                    </h3>
                    {item.lastAccessedLesson && (
                      <p className="mt-0.5 text-xs text-brand-primary">
                        آخر درس: {item.lastAccessedLesson.title}
                      </p>
                    )}
                  </div>
                  {item.lastAccessedAt && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-brand-muted">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.lastAccessedAt, locale)}
                    </span>
                  )}
                </div>

                <ProgressBar
                  percentage={item.progress.percentage}
                  completedCount={item.progress.completedCount}
                  totalCount={item.progress.totalCount}
                  size="sm"
                />

                <div className="flex justify-end pt-1">
                  <Link
                    to={ROUTES.STUDENT.getLearnPath(
                      item.course.id,
                      item.progress.nextLessonId
                    )}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>{t('learning.continueLearning')}</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Enrolled Courses Progress Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-brand-primary">
          {t('learning.myCoursesTitle')}
        </h2>

        {isLoading ? (
          <LoadingState />
        ) : enrolledItems.length === 0 ? (
          <EmptyState
            title="لا توجد دورات مفعلة في حسابك حالياً"
            description="تظهر الدورات ونسب التقدم هنا فور اعتماد طلب اشتراكك من قِبل المعلم. لا يتم عرض أي أرقام أو دورات وهمية."
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
              <Card
                key={item.enrollmentId}
                className="flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-brand-text">
                    {item.course.title}
                  </h3>
                  <p className="text-xs text-brand-muted line-clamp-2">
                    {item.course.short_description}
                  </p>
                </div>

                <div className="space-y-3 border-t border-brand-border pt-3">
                  <ProgressBar
                    percentage={item.progress.percentage}
                    completedCount={item.progress.completedCount}
                    totalCount={item.progress.totalCount}
                  />
                  <Link
                    to={ROUTES.STUDENT.getLearnPath(
                      item.course.id,
                      item.progress.nextLessonId
                    )}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>{t('learning.continueLearning')}</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

export default StudentDashboardPage;
