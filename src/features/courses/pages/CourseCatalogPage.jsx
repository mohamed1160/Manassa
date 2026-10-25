import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { CourseCard } from '../../../components/shared/CourseCard';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { coursesService } from '../services/courses.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { useTranslation } from '../../../hooks/useTranslation';

export function CourseCatalogPage() {
  const { t } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPublishedCourses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCourses([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await coursesService.listPublishedCourses({
        search,
        category,
      });
      setCourses(data);
    } catch (err) {
      setError(err?.message || 'تعذر تحميل الدورات المنشورة من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadPublishedCourses();
  }, [loadPublishedCourses]);

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.catalogTitle')}
        subtitle={t('courses.catalogSubtitle')}
        badgeText={t('nav.courses')}
      />

      {/* Search & Category Filter */}
      <Card padding="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-brand-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              aria-label={t('common.search')}
              className="w-full rounded-lg border border-brand-border bg-brand-bg py-2 ps-9 pe-3.5 text-xs text-brand-text focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand-muted" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label={t('courses.categoryLabel')}
              className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs font-medium text-brand-text focus:border-brand-primary focus:outline-none"
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="general">عام / منهج أساسي</option>
              <option value="secondary_1">الصف الأول الثانوي</option>
              <option value="secondary_2">الصف الثاني الثانوي</option>
              <option value="secondary_3">الصف الثالث الثانوي</option>
              <option value="revision">مراجعات نهائية</option>
            </select>
          </div>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={loadPublishedCourses} />}

      {isLoading ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState
          title="لا توجد دورات منشورة حالياً في الفهرس العام"
          description="يعرض هذا الفهرس فقط الدورات المعتمدة ذات الحالة (published) من قاعدة البيانات دون أي بيانات وهمية."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default CourseCatalogPage;
