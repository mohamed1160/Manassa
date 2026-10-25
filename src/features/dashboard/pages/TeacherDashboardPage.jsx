import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookCopy,
  Users,
  Clock,
  Receipt,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  CreditCard,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseStatusBadge } from '../../../components/shared/CourseStatusBadge';
import { Card } from '../../../components/ui/Card';
import { DataTable } from '../../../components/ui/DataTable';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { DashboardModuleOverview } from '../components/DashboardModuleOverview';
import { dashboardService } from '../services/dashboard.service';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

const TEACHER_MODULES = [
  {
    title: 'إدارة الدورات والمناهج',
    description: 'إنشاء وتعديل الدورات وتنظيم الوحدات والدروس المسجلة.',
    path: ROUTES.TEACHER.COURSES,
  },
  {
    title: 'طلبات الاشتراك المعلقة',
    description: 'مراجعة إيصالات الدفع المرسلة من الطلاب واعتمادها أو رفضها.',
    path: ROUTES.TEACHER.ORDERS,
  },
  {
    title: 'الطلاب المسجلون',
    description: 'استعراض قائمة الطلاب والاشتراكات الفعالة في المنصة.',
    path: ROUTES.TEACHER.STUDENTS,
  },
];

export function TeacherDashboardPage() {
  const site = useSiteConfig();
  const { locale, t } = useTranslation();

  const [periodDays, setPeriodDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await dashboardService.getTeacherAnalytics({ periodDays });
      setAnalytics(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل إحصائيات لوحة المعلم.');
    } finally {
      setIsLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const currency = site.localization.currency || 'EGP';

  const statCards = [
    {
      label: t('analytics.publishedCourses'),
      value: analytics?.publishedCoursesCount ?? 0,
      icon: BookCopy,
    },
    {
      label: t('analytics.uniqueStudents'),
      value: analytics?.uniqueEnrolledStudentsCount ?? 0,
      icon: Users,
    },
    {
      label: t('analytics.pendingReviews'),
      value: analytics?.pendingPaymentReviewsCount ?? 0,
      icon: Clock,
    },
    {
      label: t('analytics.totalOrders'),
      value: analytics?.totalSubmittedOrdersCount ?? 0,
      icon: Receipt,
    },
    {
      label: t('analytics.approvedOrders'),
      value: analytics?.approvedOrdersCount ?? 0,
      icon: CheckCircle2,
    },
    {
      label: t('analytics.verifiedSales'),
      value: formatCurrency(
        analytics?.verifiedApprovedSalesAmount ?? 0,
        currency,
        locale
      ),
      subtext: `${t('analytics.grossSubmitted')}: ${formatCurrency(
        analytics?.grossSubmittedOrdersAmount ?? 0,
        currency,
        locale
      )}`,
      icon: TrendingUp,
    },
  ];

  const recentOrderColumns = [
    {
      key: 'order_reference',
      header: 'رقم الطلب',
      render: (row) => (
        <code dir="ltr" className="font-mono text-xs font-bold text-brand-primary">
          {row.order_reference}
        </code>
      ),
    },
    {
      key: 'student',
      header: 'الطالب',
      render: (row) => (
        <span className="text-xs font-bold text-brand-text">
          {row.student?.full_name || row.student?.email || 'طالب'}
        </span>
      ),
    },
    {
      key: 'course',
      header: t('courses.titleLabel'),
      render: (row) => (
        <span className="text-xs text-brand-text">
          {row.courses?.title || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'المبلغ',
      render: (row) => (
        <span className="text-xs font-bold text-brand-primary">
          {formatCurrency(row.amount, row.currency, locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => <CourseStatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'التاريخ',
      render: (row) => (
        <span className="text-xs text-brand-muted">
          {formatDate(row.created_at, locale)}
        </span>
      ),
    },
  ];

  const salesTrend = analytics?.salesTrend || [];
  const maxDayAmount = Math.max(
    ...salesTrend.map((d) => d.amount),
    1
  );

  return (
    <PageContainer>
      <PageHeader
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
        badgeText={t('nav.teacherPortal')}
        actions={
          <>
            <Link
              to={ROUTES.TEACHER.COURSE_NEW}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('nav.createCourse')}</span>
            </Link>
            <Link
              to={ROUTES.TEACHER.ORDERS}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <CreditCard className="h-4 w-4 text-brand-primary" />
              <span>{t('nav.reviewOrders')}</span>
            </Link>
          </>
        }
      />

      {error && <ErrorState message={error} onRetry={loadAnalytics} />}

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* Real Analytics Summary Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-brand-muted">
                      {card.label}
                    </span>
                    <div className="rounded-lg bg-brand-accent p-2 text-brand-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-brand-primary">
                    {card.value}
                  </p>
                  {card.subtext && (
                    <p className="text-[11px] text-brand-muted">
                      {card.subtext}
                    </p>
                  )}
                </Card>
              );
            })}
          </section>

          {/* Verified Sales Trend Over Selected Period */}
          <Card className="space-y-4">
            <div className="flex flex-col justify-between gap-3 border-b border-brand-border pb-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-brand-primary">
                  اتجاه المبيعات المعتمدة خلال الفترة المحددة
                </h2>
                <p className="text-xs text-brand-muted">
                  يحتسب فقط الطلبات المعتمدة (approved) ولا يتضمن الطلبات قيد المراجعة أو المرفوضة.
                </p>
              </div>

              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                aria-label="فترة تحليل المبيعات"
                className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text focus:border-brand-primary focus:outline-none"
              >
                <option value={7}>آخر 7 أيام</option>
                <option value={30}>آخر 30 يوماً</option>
                <option value={90}>آخر 90 يوماً</option>
              </select>
            </div>

            {salesTrend.length === 0 ? (
              <EmptyState
                title="لا توجد مبيعات معتمدة خلال هذه الفترة الزمنية"
                description="لا يتم توليد رسوم بيانية عشوائية. ستظهر أعمدة المبيعات اليومية هنا فور اعتماد طلبات اشتراك فعلية."
              />
            ) : (
              <div className="space-y-2.5">
                {salesTrend.map((day) => {
                  const widthPct = Math.max(
                    8,
                    Math.round((day.amount / maxDayAmount) * 100)
                  );
                  return (
                    <div key={day.date} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span dir="ltr" className="font-mono text-brand-muted">
                          {day.date}
                        </span>
                        <span className="font-bold text-brand-primary">
                          {formatCurrency(day.amount, currency, locale)} (
                          {day.count} طلب)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-accent/60">
                        <div
                          className="h-full rounded-full bg-brand-primary"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent Orders Table */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-primary">
                {t('analytics.recentOrders')}
              </h2>
              <Link
                to={ROUTES.TEACHER.ORDERS}
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                {t('nav.reviewOrders')}
              </Link>
            </div>

            <DataTable
              columns={recentOrderColumns}
              data={analytics?.recentOrders || []}
              emptyTitle="لا توجد طلبات واردة حتى الآن"
              emptyDescription="ستظهر أحدث 5 طلبات اشتراك هنا بمجرد إرسالها من الطلاب."
            />
          </section>
        </>
      )}

      <DashboardModuleOverview modules={TEACHER_MODULES} />
    </PageContainer>
  );
}

export default TeacherDashboardPage;
