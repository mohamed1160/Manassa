import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Edit3,
  ListTree,
  Eye,
  Trash2,
  Globe,
  FileEdit,
  BookOpen,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseStatusBadge } from '../../../components/shared/CourseStatusBadge';
import { DataTable } from '../../../components/ui/DataTable';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { coursesService } from '../services/courses.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { formatCurrency } from '../../../utils/formatters';
import { sanitizeAssetUrl } from '../../../utils/theme';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function TeacherCoursesPage() {
  const { locale, t } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCourses([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await coursesService.listTeacherCourses({
        search,
        status: statusFilter,
      });
      setCourses(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل قائمة الدورات من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleTogglePublish = async (course) => {
    setFeedbackMessage('');
    setError('');
    const nextStatus = course.status === 'published' ? 'draft' : 'published';

    try {
      const updated = await coursesService.updateCourseStatus(course, nextStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setFeedbackMessage(
        updated.status === 'published'
          ? `تم نشر دورة "${updated.title}" بنجاح.`
          : `تم تحويل دورة "${updated.title}" إلى مسودة.`
      );
    } catch (err) {
      setError(err?.message || 'تعذر تحديث حالة نشر الدورة.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await coursesService.deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setFeedbackMessage(`تم حذف دورة "${courseToDelete.title}" من قاعدة البيانات.`);
      setCourseToDelete(null);
    } catch (err) {
      setError(err?.message || 'تعذر حذف الدورة.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'course',
      header: t('courses.titleLabel'),
      render: (row) => {
        const safeThumb = sanitizeAssetUrl(row.thumbnail_url, '');
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-brand-border bg-brand-accent/40">
              {safeThumb ? (
                <img
                  src={safeThumb}
                  alt={row.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BookOpen className="h-5 w-5 text-brand-primary" />
              )}
            </div>
            <div>
              <p className="font-bold text-brand-text">{row.title}</p>
              <code dir="ltr" className="text-[11px] font-mono text-brand-muted">
                /{row.slug}
              </code>
            </div>
          </div>
        );
      },
    },
    {
      key: 'price',
      header: t('courses.priceLabel'),
      render: (row) => (
        <span className="font-bold text-brand-primary">
          {formatCurrency(row.price, row.currency, locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('courses.statusLabel'),
      render: (row) => <CourseStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            to={ROUTES.TEACHER.getCourseEditPath(row.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{t('common.edit')}</span>
          </Link>

          <Link
            to={ROUTES.TEACHER.getCourseCurriculumPath(row.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-accent/50"
          >
            <ListTree className="h-3.5 w-3.5" />
            <span>المنهج</span>
          </Link>

          <Link
            to={ROUTES.getCourseDetailsPath(row.slug || row.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-muted hover:text-brand-text"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{t('common.preview')}</span>
          </Link>

          <button
            type="button"
            onClick={() => handleTogglePublish(row)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-accent px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            {row.status === 'published' ? (
              <>
                <FileEdit className="h-3.5 w-3.5" />
                <span>{t('courses.unpublishCourse')}</span>
              </>
            ) : (
              <>
                <Globe className="h-3.5 w-3.5" />
                <span>{t('courses.publishCourse')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCourseToDelete(row)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            aria-label={`${t('common.delete')} ${row.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.manageTitle')}
        subtitle={t('courses.manageSubtitle')}
        badgeText={t('nav.teacherPortal')}
        actions={
          <Link
            to={ROUTES.TEACHER.COURSE_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-hover"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('nav.createCourse')}</span>
          </Link>
        }
      />

      {/* Search & Status Filter Toolbar */}
      <Card padding="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-brand-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بعنوان الدورة أو الرابط المختصر (Slug)..."
              className="w-full rounded-lg border border-brand-border bg-brand-bg py-2 ps-9 pe-3.5 text-xs text-brand-text focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('courses.statusLabel')}
              className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs font-medium text-brand-text focus:border-brand-primary focus:outline-none"
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="published">{t('status.published')}</option>
              <option value="draft">{t('status.draft')}</option>
              <option value="archived">{t('status.archived')}</option>
            </select>
          </div>
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

      {error && <ErrorState message={error} onRetry={loadCourses} />}

      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        emptyTitle="لا توجد دورات تدريبية مسجلة في قاعدة البيانات"
        emptyDescription="ابدأ بإنشاء دورتك الأولى أو انتقل إلى بناء المنهج الدراسي. جميع السجلات المعروضة هنا تأتي مباشرة من جدول courses في Supabase."
        emptyAction={
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              to={ROUTES.TEACHER.COURSE_NEW}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary-hover"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('nav.createCourse')}</span>
            </Link>
            <Link
              to={ROUTES.TEACHER.getCourseCurriculumPath('course-1')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <ListTree className="h-4 w-4" />
              <span>معاينة باني المنهج الدراسي</span>
            </Link>
          </div>
        }
      />

      <ConfirmationDialog
        isOpen={Boolean(courseToDelete)}
        title={t('courses.deleteCourseTitle')}
        message={t('courses.deleteCourseMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCourseToDelete(null)}
      />
    </PageContainer>
  );
}

export default TeacherCoursesPage;
