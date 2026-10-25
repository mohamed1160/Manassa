import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { Send, CheckCircle2, BookOpen, ShieldAlert, ArrowRight } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { FormField } from '../../../components/forms/FormField';
import { ImageUploadField } from '../../../components/forms/ImageUploadField';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { PaymentMethodsSummary } from '../../payments/components/PaymentMethodsSummary';
import { manualPaymentSubmissionSchema } from '../../payments/schemas/payment.schema';
import { paymentService } from '../../../services/payments/payment.service';
import { coursesService } from '../../courses/services/courses.service';
import { ordersService } from '../services/orders.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { formatCurrency } from '../../../utils/formatters';
import { sanitizeAssetUrl } from '../../../utils/theme';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function CheckoutPage() {
  const { courseId } = useParams();
  const site = useSiteConfig();
  const { locale, t } = useTranslation();

  const methods = paymentService.getAvailablePaymentMethods();

  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  const loadCourse = useCallback(async () => {
    if (!isSupabaseConfigured || !courseId) return;
    setIsLoadingCourse(true);
    try {
      const data = await coursesService.getCourseById(courseId);
      setCourse(data);
    } catch {
      setCourse(null);
    } finally {
      setIsLoadingCourse(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const formik = useFormik({
    initialValues: {
      paymentMethodId: methods[0]?.id || 'vodafone_cash',
      senderIdentifier: '',
      transactionReference: '',
      receiptPath: '',
      notes: '',
    },
    validationSchema: manualPaymentSubmissionSchema,
    onSubmit: async (values) => {
      setBackendError('');
      setSubmittedOrder(null);

      if (!isSupabaseConfigured) {
        setBackendError(
          'لا يمكن تسجيل طلب دفع حقيقي حالياً لأن قاعدة بيانات Supabase غير مربوطة في ملف .env. لن يتم عرض تأكيد دفع وهمي.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const order = await ordersService.submitManualOrder({
          courseId: course?.id || courseId,
          amount: course?.price ?? 0,
          currency: course?.currency || site.localization.currency,
          paymentMethodId: values.paymentMethodId,
          senderIdentifier: values.senderIdentifier,
          transactionReference: values.transactionReference,
          receiptPath: values.receiptPath,
          notes: values.notes,
        });
        setSubmittedOrder(order);
      } catch (err) {
        setBackendError(
          err?.message ||
            'تعذر إرسال طلب الاشتراك. تأكد من تسجيل الدخول بحساب طالب وتوفر الدورة في قاعدة البيانات.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (isLoadingCourse) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  const safeThumb = sanitizeAssetUrl(course?.thumbnail_url, '');

  return (
    <PageContainer>
      <PageHeader
        title={t('orders.checkoutTitle')}
        subtitle="قم بتحويل رسوم الاشتراك عبر إحدى وسائل الدفع المعتمدة للمعلم ثم أرفق الرقم المرجعي وصورة الإيصال للمراجعة."
        badgeText={t('nav.studentPortal')}
        actions={
          <Link
            to={ROUTES.STUDENT.ORDERS}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
          >
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>{t('nav.studentOrders')}</span>
          </Link>
        }
      />

      {/* Confirmed Backend Submission Result */}
      {submittedOrder ? (
        <Card className="space-y-4 border-brand-primary/40 bg-brand-accent/40">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-primary" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-brand-primary">
                تم استلام طلب تفعيل الاشتراك بنجاح وهو الآن قيد مراجعة المعلم
              </h2>
              <p className="text-xs text-brand-text">
                رقم الطلب المرجعي:{' '}
                <code dir="ltr" className="font-mono font-bold">
                  {submittedOrder.order_reference}
                </code>{' '}
                — الحالة الحالية: <span className="font-bold">قيد المراجعة (pending_review)</span>.
              </p>
              <p className="text-xs text-brand-muted">
                سيتم تفعيل الدورة وإرسال إشعار لحسابك فور مراجعة الإيصال واعتماده من قِبل المعلم.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to={ROUTES.STUDENT.ORDERS}
              className="inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              متابعة حالة الطلب في صفحة طلباتي
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Course Summary & Payment Instructions */}
          <div className="space-y-5 lg:col-span-5">
            <Card className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-accent/40">
                  {safeThumb ? (
                    <img
                      src={safeThumb}
                      alt={course?.title || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-brand-primary" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-brand-muted">
                    الدورة المختارة
                  </span>
                  <h2 className="text-base font-bold text-brand-text">
                    {course?.title || `دورة تدريبية (${courseId})`}
                  </h2>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-brand-border pt-3">
                <span className="text-xs font-medium text-brand-muted">
                  {t('courses.priceLabel')}
                </span>
                <span className="text-xl font-bold text-brand-primary">
                  {course
                    ? formatCurrency(course.price, course.currency, locale)
                    : `— ${site.localization.currencySymbol}`}
                </span>
              </div>
            </Card>

            <PaymentMethodsSummary />

            <Card className="flex items-start gap-2.5 bg-brand-bg text-xs text-brand-muted">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <p className="leading-relaxed">
                إرسال هذا النموذج يسجل طلب الدفع بحالة{' '}
                <code className="font-mono font-bold text-brand-primary">
                  pending_review
                </code>{' '}
                فقط، ولا يمنح صلاحية الوصول للدروس إلا بعد تحقق المعلم واعتماده للطلب في الخادم.
              </p>
            </Card>
          </div>

          {/* Payment Verification Submission Form */}
          <div className="lg:col-span-7">
            <Card className="space-y-5">
              <h2 className="text-base font-bold text-brand-primary">
                بيانات الحوالة وإيصال الدفع
              </h2>

              {backendError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
                >
                  {backendError}
                </div>
              )}

              <form
                onSubmit={formik.handleSubmit}
                noValidate
                className="space-y-4"
              >
                <FormField
                  as="select"
                  label={t('orders.paymentMethod')}
                  name="paymentMethodId"
                  required
                  value={formik.values.paymentMethodId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.paymentMethodId}
                  touched={formik.touched.paymentMethodId}
                  options={methods.map((m) => ({
                    value: m.id,
                    label: m.label,
                  }))}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label={t('orders.senderIdentifier')}
                    name="senderIdentifier"
                    dir="ltr"
                    required
                    placeholder="01000000000 / user@instapay"
                    value={formik.values.senderIdentifier}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.senderIdentifier}
                    touched={formik.touched.senderIdentifier}
                  />

                  <FormField
                    label={t('orders.transactionRef')}
                    name="transactionReference"
                    dir="ltr"
                    required
                    placeholder="TXN-98451230"
                    value={formik.values.transactionReference}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.transactionReference}
                    touched={formik.touched.transactionReference}
                  />
                </div>

                <ImageUploadField
                  label={t('orders.receiptUpload')}
                  name="receiptPath"
                  value={formik.values.receiptPath}
                  onUploadFile={
                    isSupabaseConfigured
                      ? (file) => paymentService.uploadReceiptImage(file)
                      : undefined
                  }
                  onChange={(_, val) =>
                    formik.setFieldValue('receiptPath', val)
                  }
                  helperText="أرفق صورة واضحة لإيصال التحويل البنكي أو المحفظة الإلكترونية."
                />

                <FormField
                  as="textarea"
                  rows={2}
                  label="ملاحظات إضافية للمعلم (اختياري)"
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.notes}
                  touched={formik.touched.notes}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? t('common.saving')
                      : t('orders.submitOrder')}
                  </span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default CheckoutPage;
