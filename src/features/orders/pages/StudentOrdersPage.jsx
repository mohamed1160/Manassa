import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, RefreshCw, BookOpen } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseStatusBadge } from '../../../components/shared/CourseStatusBadge';
import { DataTable } from '../../../components/ui/DataTable';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { OrderVerificationInfo } from '../components/OrderVerificationInfo';
import { ordersService } from '../services/orders.service';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function StudentOrdersPage() {
  const { locale, t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMyOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ordersService.listStudentOrders();
      setOrders(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل سجل طلبات الطالب.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyOrders();
  }, [loadMyOrders]);

  const columns = [
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
      key: 'course',
      header: t('courses.titleLabel'),
      render: (row) => (
        <span className="font-bold text-brand-text">
          {row.courses?.title || row.course_id}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'المبلغ والعملة',
      render: (row) => (
        <span className="font-semibold text-brand-primary">
          {formatCurrency(row.amount, row.currency, locale)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'تاريخ الإرسال',
      render: (row) => (
        <span className="text-xs text-brand-muted">
          {formatDate(row.created_at, locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'حالة المراجعة',
      render: (row) => (
        <div className="space-y-1">
          <CourseStatusBadge status={row.status} />
          {row.status === 'rejected' && row.rejection_reason && (
            <p className="text-[11px] font-medium text-red-700">
              {t('orders.rejectionReason')}: {row.rejection_reason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'next_action',
      header: t('common.actions'),
      render: (row) => {
        if (row.status === 'approved') {
          return (
            <Link
              to={ROUTES.STUDENT.getLearnPath(row.course_id, 'lesson-1')}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>{t('learning.continueLearning')}</span>
            </Link>
          );
        }
        if (row.status === 'rejected') {
          return (
            <Link
              to={ROUTES.STUDENT.getCheckoutPath(row.course_id)}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-accent/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>إعادة إرسال الإيصال</span>
            </Link>
          );
        }
        return (
          <span className="text-xs text-brand-muted">بانتظار مراجعة المعلم</span>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('orders.studentOrdersTitle')}
        subtitle="تتبع حالة طلبات الاشتراك، المراجع المالية، وأسباب الرفض أو تفعيل الدورات."
        badgeText={t('nav.studentPortal')}
      />

      <OrderVerificationInfo />

      {error && <ErrorState message={error} onRetry={loadMyOrders} />}

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyTitle="لا توجد طلبات اشتراك مسجلة في حسابك"
        emptyDescription="عند إرسال إيصال دفع لأي دورة تدريبية، سيظهر سجل الطلب وحالته الفعلية هنا."
        emptyAction={
          <Link
            to={ROUTES.COURSES}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
          >
            <BookOpen className="h-4 w-4" />
            <span>{t('nav.courses')}</span>
          </Link>
        }
      />
    </PageContainer>
  );
}

export default StudentOrdersPage;
