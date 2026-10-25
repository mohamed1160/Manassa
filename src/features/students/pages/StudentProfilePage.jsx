import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Save } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { FormField } from '../../../components/forms/FormField';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StudentAccountNotice } from '../components/StudentAccountNotice';
import { studentsService } from '../services/students.service';
import { commonValidationRules } from '../../../schemas/common.schema';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';

const profileSchema = Yup.object({
  fullName: commonValidationRules.fullName,
  phone: commonValidationRules.phone,
});

export function StudentProfilePage() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  const [dbProfile, setDbProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    studentsService
      .getMyProfile()
      .then((data) => {
        if (data) setDbProfile(data);
      })
      .catch(() => {});
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: dbProfile?.full_name || profile?.fullName || '',
      email: dbProfile?.email || user?.email || '',
      phone: dbProfile?.phone || '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setStatusMessage('');
      setErrorMessage('');

      if (!isSupabaseConfigured) {
        setErrorMessage(
          'تعذر حفظ الملف الشخصي: قاعدة بيانات Supabase غير مربوطة في ملف .env.'
        );
        return;
      }

      setIsSaving(true);
      try {
        const updated = await studentsService.updateMyProfile(values);
        setDbProfile(updated);
        setStatusMessage('تم تحديث بيانات ملفك الشخصي بنجاح.');
      } catch (err) {
        setErrorMessage(err?.message || 'تعذر تحديث بيانات الملف الشخصي.');
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title={t('nav.studentProfile')}
        subtitle="إدارة الاسم الكامل ورقم التواصل المرتبطين بحساب الطالب."
        badgeText={t('nav.studentPortal')}
      />

      <StudentAccountNotice />

      <Card className="max-w-2xl space-y-5">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
          >
            {errorMessage}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            className="rounded-xl border border-brand-border bg-brand-accent/70 p-3.5 text-xs font-bold text-brand-primary"
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <FormField
            label="الاسم الكامل"
            name="fullName"
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
            disabled
            value={formik.values.email}
            helperText="البريد الإلكتروني مرتبط بحساب المصادقة الأساسي."
          />

          <FormField
            label="رقم الهاتف (واتساب)"
            name="phone"
            dir="ltr"
            required
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.phone}
            touched={formik.touched.phone}
          />

          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4" />
            <span>{isSaving ? t('common.saving') : t('common.save')}</span>
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}

export default StudentProfilePage;
