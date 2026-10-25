import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ListTree, ArrowRight, Eye } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { CourseForm } from '../components/CourseForm';
import { coursesService } from '../services/courses.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function TeacherCourseEditPage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCourse = useCallback(async () => {
    if (!isSupabaseConfigured || !id) return;

    setIsLoading(true);
    setBackendError('');
    try {
      const data = await coursesService.getCourseById(id);
      setCourse(data);
    } catch (err) {
      setBackendError(err?.message || 'تعذر تحميل بيانات الدورة من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleUpdateCourse = async (values) => {
    setIsSubmitting(true);
    setBackendError('');
    setSuccessMessage('');

    try {
      const updated = await coursesService.updateCourse(course?.id || id, values);
      setCourse(updated);
      setSuccessMessage(`تم حفظ تعديلات الدورة "${updated.title}" بنجاح.`);
    } catch (err) {
      setBackendError(
        err?.message || 'تعذر تحديث بيانات الدورة في قاعدة البيانات.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.editTitle')}
        subtitle={`تحديث البيانات الوصفية، السعر، وحالة النشر للدورة (${course?.title || id}).`}
        badgeText={`Course ID: ${id}`}
        actions={
          <>
            <Link
              to={ROUTES.TEACHER.getCourseCurriculumPath(course?.id || id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <ListTree className="h-4 w-4" />
              <span>{t('courses.curriculumTitle')}</span>
            </Link>
            <Link
              to={ROUTES.getCourseDetailsPath(course?.slug || id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{t('common.preview')}</span>
            </Link>
            <Link
              to={ROUTES.TEACHER.COURSES}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
              <span>{t('common.back')}</span>
            </Link>
          </>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : (
        <CourseForm
          initialData={course}
          onSubmitCourse={handleUpdateCourse}
          isSubmitting={isSubmitting}
          backendError={backendError}
          successMessage={successMessage}
        />
      )}
    </PageContainer>
  );
}

export default TeacherCourseEditPage;
