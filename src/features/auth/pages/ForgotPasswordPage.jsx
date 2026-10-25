import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { KeyRound } from 'lucide-react';
import { FormField } from '../../../components/forms/FormField';
import { Button } from '../../../components/ui/Button';
import { AuthStatusNotice } from '../components/AuthStatusNotice';
import { forgotPasswordSchema } from '../schemas/auth.schema';
import { ROUTES } from '../../../constants/routes';

export function ForgotPasswordPage() {
  const [submissionNotice, setSubmissionNotice] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: () => {
      setSubmissionNotice(
        'تم التحقق من البريد الإلكتروني. إرسال رابط إعادة التعيين سيتم تفعيله عند ربط Supabase Auth.'
      );
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-brand-text">استعادة كلمة المرور</h1>
        <p className="text-sm text-brand-muted">
          صفحة مخصصة لإرسال رابط استعادة كلمة المرور إلى البريد الإلكتروني المسجل.
        </p>
      </div>

      <AuthStatusNotice />

      {submissionNotice && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs font-medium text-teal-900">
          {submissionNotice}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <FormField
          label="البريد الإلكتروني المسجل"
          name="email"
          type="email"
          placeholder="student@example.com"
          required
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
        />

        <Button type="submit" className="w-full">
          <KeyRound className="h-4 w-4" />
          <span>إرسال تعليمات الاستعادة</span>
        </Button>
      </form>

      <p className="text-center text-xs text-brand-muted">
        تذكرت كلمة المرور؟{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-brand-primary hover:underline"
        >
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
