import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { UserPlus } from 'lucide-react';
import { FormField } from '../../../components/forms/FormField';
import { Button } from '../../../components/ui/Button';
import { AuthStatusNotice } from '../components/AuthStatusNotice';
import { registerSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { ROUTES } from '../../../constants/routes';

export function RegisterPage() {
  const [submissionNotice, setSubmissionNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setSubmissionNotice('');
      setErrorMessage('');

      if (!isSupabaseConfigured) {
        setErrorMessage(
          'تم التحقق من نموذج التسجيل بنجاح، ولكن لا يمكن إنشاء الحساب الفعلي قبل ربط متغيرات Supabase في ملف .env.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        await authService.registerStudent(values);
        setSubmissionNotice(
          'تم إنشاء حساب الطالب بنجاح. يمكنك الآن تسجيل الدخول أو تأكيد البريد الإلكتروني بحسب إعدادات مشروع Supabase.'
        );
        formik.resetForm();
      } catch (err) {
        setErrorMessage(err?.message || 'تعذر إنشاء الحساب الجديد.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-brand-primary">
          تسجيل حساب طالب جديد
        </h1>
        <p className="text-sm text-brand-muted">
          صفحة مخصصة لإنشاء حساب طالب للاشتراك في الدورات المسجلة ومتابعة الدروس.
        </p>
      </div>

      <AuthStatusNotice />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {submissionNotice && (
        <div className="rounded-lg border border-brand-border bg-brand-accent/70 p-3 text-xs font-medium text-brand-primary">
          {submissionNotice}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <FormField
          label="الاسم الثلاثي"
          name="fullName"
          placeholder="أدخل اسمك الكامل"
          required
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.fullName}
          touched={formik.touched.fullName}
        />

        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          dir="ltr"
          placeholder="student@example.com"
          required
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
        />

        <FormField
          label="رقم الهاتف (واتساب)"
          name="phone"
          dir="ltr"
          placeholder="01000000000"
          required
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.phone}
          touched={formik.touched.phone}
        />

        <FormField
          label="كلمة المرور"
          name="password"
          type="password"
          dir="ltr"
          placeholder="8 أحرف على الأقل"
          required
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.password}
          touched={formik.touched.password}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" />
          <span>{isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}</span>
        </Button>
      </form>

      <p className="text-center text-xs text-brand-muted">
        لديك حساب بالفعل؟{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-brand-primary hover:underline"
        >
          تسجيل الدخول
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
