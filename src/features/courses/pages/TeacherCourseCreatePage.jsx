import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseForm } from '../components/CourseForm';
import { coursesService } from '../services/courses.service';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function TeacherCourseCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateCourse = async (values) => {
    setIsSubmitting(true);
    setBackendError('');
    setSuccessMessage('');

    try {
      const created = await coursesService.createCourse(values);
      setSuccessMessage(
        `تم إنشاء الدورة "${created.title}" بنجاح في قاعدة البيانات.`
      );
      navigate(ROUTES.TEACHER.getCourseCurriculumPath(created.id));
    } catch (err) {
      setBackendError(
        err?.message ||
          'تعذر إنشاء الدورة في قاعدة البيانات. تأكد من إعداد Supabase وصلاحيات المعلم.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.createTitle')}
        subtitle="أدخل البيانات الأساسية للدورة التدريبية، حدد السعر والعملة، واحفظها كمسودة أو انشرها مباشرة."
        badgeText={t('nav.teacherPortal')}
        actions={
          <Link
            to={ROUTES.TEACHER.COURSES}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
          >
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>{t('nav.manageCourses')}</span>
          </Link>
        }
      />

      <CourseForm
        onSubmitCourse={handleCreateCourse}
        isSubmitting={isSubmitting}
        backendError={backendError}
        successMessage={successMessage}
      />
    </PageContainer>
  );
}

export default TeacherCourseCreatePage;
