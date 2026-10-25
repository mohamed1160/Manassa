import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseStatusBadge } from '../../../components/shared/CourseStatusBadge';
import { DataTable } from '../../../components/ui/DataTable';
import { Card } from '../../../components/ui/Card';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { OrderVerificationInfo } from '../components/OrderVerificationInfo';
import { ordersService } from '../services/orders.service';
import { paymentService } from '../../../services/payments/payment.service';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';

export function TeacherOrdersPage() {
  const { locale, t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Modal state for Approve / Reject decision
  const [reviewTarget, setReviewTarget] = useState(null); // { order, decision: 'approved' | 'rejected' }
  const [rejectionReason, setRejectionReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Modal state for Receipt Preview
  const [receiptModalUrl, setReceiptModalUrl] = useState('');
  const [receiptModalOrder, setReceiptModalOrder] = useState(null);

  const loadTeacherOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await ordersService.listTeacherOrders({
        status: statusFilter,
        search,
      });
      setOrders(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل طلبات الاشتراك من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadTeacherOrders();
  }, [loadTeacherOrders]);

  const handleOpenReceipt = async (order) => {
    setError('');
    try {
      const signedUrl = await paymentService.getAuthorizedReceiptSignedUrl(
        order.receipt_path
      );
      setReceiptModalOrder(order);
      setReceiptModalUrl(signedUrl || '');
    } catch (err) {
      setError(
        err?.message ||
          'تعذر توليد رابط معاينة الإيصال المصرح به من حاوية التخزين الخاصة.'
      );
    }
  };

  const handleConfirmDecision = async () => {
    if (!reviewTarget) return;
    setIsReviewing(true);
    setError('');
    setFeedbackMessage('');

    try {
      const updated = await ordersService.reviewOrderByTeacher({
        orderId: reviewTarget.order.id,
        decision: reviewTarget.decision,
        rejectionReason,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === updated.id
            ? {
                ...o,
                status: updated.status,
                rejection_reason: updated.rejection_reason,
                reviewed_at: updated.reviewed_at,
              }
            : o
        )
      );

      setFeedbackMessage(
        reviewTarget.decision === 'approved'
          ? `تم اعتماد الطلب (${reviewTarget.order.order_reference}) ومنح صلاحية الدورة للطالب عبر الخادم.`
          : `تم رفض الطلب (${reviewTarget.order.order_reference}) وإشعار الطالب بسبب الرفض.`
      );
      setReviewTarget(null);
      setRejectionReason('');
    } catch (err) {
      setError(
        err?.message ||
          'تعذر تنفيذ قرار المراجعة. تأكد من صلاحية المعلم وتطبيق دالة review_manual_order في Supabase.'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const columns = [
    {
      key: 'order_reference',
      header: 'رقم الطلب / المرجع',
      render: (row) => (
        <div className="space-y-0.5">
          <code dir="ltr" className="font-mono text-xs font-bold text-brand-primary">
            {row.order_reference}
          </code>
          <p className="text-[11px] text-brand-muted">
            TXN:{' '}
            <code dir="ltr" className="font-mono">
              {row.transaction_reference}
            </code>
          </p>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'بيانات الطالب',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-brand-text">
            {row.student?.full_name || 'طالب مسجل'}
          </p>
          <p dir="ltr" className="font-mono text-[11px] text-brand-muted">
            {row.student?.email || row.sender_identifier}
          </p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'الدورة والمبلغ',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-brand-text">
            {row.courses?.title || row.course_id}
          </p>
          <p className="font-semibold text-brand-primary">
            {formatCurrency(row.amount, row.currency, locale)} (
            {row.payment_method})
          </p>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'تاريخ الطلب',
      render: (row) => (
        <span className="text-xs text-brand-muted">
          {formatDate(row.created_at, locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => <CourseStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {row.receipt_path && (
            <button
              type="button"
              onClick={() => handleOpenReceipt(row)}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <Eye className="h-3.5 w-3.5 text-brand-primary" />
              <span>الإيصال</span>
            </button>
          )}

          {row.status !== 'approved' && (
            <button
              type="button"
              onClick={() => {
                setRejectionReason('');
                setReviewTarget({ order: row, decision: 'approved' });
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>اعتماد</span>
            </button>
          )}

          {row.status !== 'rejected' && (
            <button
              type="button"
              onClick={() => {
                setRejectionReason(row.rejection_reason || '');
                setReviewTarget({ order: row, decision: 'rejected' });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>رفض</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('orders.teacherOrdersTitle')}
        subtitle="راجع حوالات الطلاب، تحقق من الرقم المرجعي وصورة الإيصال، واعتمد الطلب لتفعيل الدورة عبر دالة الخادم الموثوقة."
        badgeText={t('nav.teacherPortal')}
      />

      <OrderVerificationInfo />

      {/* Search & Status Filter */}
      <Card padding="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-brand-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم الطلب، الرقم المرجعي للعملية، أو رقم محفظة الطالب..."
              className="w-full rounded-lg border border-brand-border bg-brand-bg py-2 ps-9 pe-3.5 text-xs text-brand-text focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="تصفية حسب حالة الطلب"
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs font-medium text-brand-text focus:border-brand-primary focus:outline-none"
          >
            <option value="all">{t('common.allStatuses')}</option>
            <option value="pending_review">{t('status.pending_review')}</option>
            <option value="approved">{t('status.approved')}</option>
            <option value="rejected">{t('status.rejected')}</option>
            <option value="pending_payment">{t('status.pending_payment')}</option>
            <option value="cancelled">{t('status.cancelled')}</option>
          </select>
        </div>
      </Card>

      {feedbackMessage && (
        <div
          role="status"
          className="rounded-xl border border-brand-border bg-brand-accent/70 p-3.5 text-xs font-bold text-brand-primary"
        >
          {feedbackMessage}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadTeacherOrders} />}

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyTitle="لا توجد طلبات دفع مطابقة للبحث"
        emptyDescription="عند إرسال الطلاب لطلبات الاشتراك وإيصالات التحويل، ستظهر السجلات هنا ليقوم المعلم بمراجعتها واعتمادها."
      />

      {/* Approve / Reject Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(reviewTarget)}
        title={
          reviewTarget?.decision === 'approved'
            ? t('orders.approveOrder')
            : t('orders.rejectOrder')
        }
        message={
          reviewTarget?.decision === 'approved'
            ? `هل أنت متأكد من صحة إيصال الدفع للطلب (${reviewTarget?.order?.order_reference})؟ سيقوم الخادم بإنشاء سجل اشتراك رسمي (Enrollment) للطالب وإشعاره.`
            : `سيتم تغيير حالة الطلب (${reviewTarget?.order?.order_reference}) إلى مرفوض ولن يتم منح صلاحية الدورة.`
        }
        confirmLabel={
          reviewTarget?.decision === 'approved'
            ? t('orders.approveOrder')
            : t('orders.rejectOrder')
        }
        cancelLabel={t('common.cancel')}
        variant={reviewTarget?.decision === 'approved' ? 'primary' : 'danger'}
        isLoading={isReviewing}
        onConfirm={handleConfirmDecision}
        onCancel={() => setReviewTarget(null)}
      >
        {reviewTarget?.decision === 'rejected' && (
          <div className="space-y-1.5">
            <label
              htmlFor="rejectionReason"
              className="block text-xs font-bold text-brand-text"
            >
              {t('orders.rejectionReason')}
            </label>
            <textarea
              id="rejectionReason"
              rows={2}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: رقم العملية غير مطابق أو صورة الإيصال غير واضحة..."
              className="w-full rounded-lg border border-brand-border bg-brand-bg p-2.5 text-xs text-brand-text focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
            />
          </div>
        )}
      </ConfirmationDialog>

      {/* Receipt Preview Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(receiptModalOrder)}
        title={`معاينة إيصال الطلب (${receiptModalOrder?.order_reference || ''})`}
        message={`المرجع: ${receiptModalOrder?.transaction_reference || ''} — المحول منه: ${receiptModalOrder?.sender_identifier || ''}`}
        confirmLabel={t('common.close')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        onConfirm={() => {
          setReceiptModalOrder(null);
          setReceiptModalUrl('');
        }}
        onCancel={() => {
          setReceiptModalOrder(null);
          setReceiptModalUrl('');
        }}
      >
        {receiptModalUrl ? (
          <img
            src={receiptModalUrl}
            alt="Payment Receipt"
            className="max-h-72 w-full rounded-xl border border-brand-border object-contain"
          />
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg p-4 text-xs text-brand-muted">
            <FileCheck2 className="h-4 w-4 text-brand-primary" />
            <span>مسار الإيصال: {receiptModalOrder?.receipt_path}</span>
          </div>
        )}
      </ConfirmationDialog>
    </PageContainer>
  );
}

export default TeacherOrdersPage;
