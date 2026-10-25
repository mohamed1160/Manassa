import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { LogIn } from 'lucide-react';
import { FormField } from '../../../components/forms/FormField';
import { Button } from '../../../components/ui/Button';
import { AuthStatusNotice } from '../components/AuthStatusNotice';
import { loginSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../../../stores/auth.store';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { ROLES } from '../../../constants/roles';
import { ROUTES } from '../../../constants/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const [submissionNotice, setSubmissionNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setSubmissionNotice('');
      setErrorMessage('');

      if (!isSupabaseConfigured) {
        setErrorMessage(
          'تم التحقق من الحقول بنجاح، ولكن لا يمكن تسجيل الدخول الفعلي قبل إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        await authService.signInWithPassword(values);
        useAuthStore.setState({ isInitialized: false });
        await useAuthStore.getState().initializeSession();
        const role = useAuthStore.getState().role;
        navigate(
          role === ROLES.TEACHER
            ? ROUTES.TEACHER.DASHBOARD
            : ROUTES.STUDENT.DASHBOARD
        );
      } catch (err) {
        setErrorMessage(
          err?.message || 'تعذر تسجيل الدخول. يرجى التأكد من البريد وكلمة المرور.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-brand-primary">تسجيل الدخول</h1>
        <p className="text-sm text-brand-muted">
          صفحة مخصصة لدخول الطلاب المسجلين أو المعلم لإدارة المنصة.
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
          label="كلمة المرور"
          name="password"
          type="password"
          dir="ltr"
          placeholder="••••••••"
          required
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.password}
          touched={formik.touched.password}
        />

        <div className="flex items-center justify-between text-xs">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="font-medium text-brand-primary hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <LogIn className="h-4 w-4" />
          <span>{isSubmitting ? 'جاري التحقق...' : 'دخول إلى المنصة'}</span>
        </Button>
      </form>

      <p className="text-center text-xs text-brand-muted">
        ليس لديك حساب طالب بعد؟{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-brand-primary hover:underline"
        >
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
