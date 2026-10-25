import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { CourseStatusBadge } from './CourseStatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';
import { sanitizeAssetUrl } from '../../utils/theme';
import { ROUTES } from '../../constants/routes';

/**
 * Reusable CourseCard supporting catalog display, student enrolled progress display,
 * and teacher preview.
 */
export function CourseCard({
  course,
  showStatus = false,
  progress = null, // { percentage, completedCount, totalCount, nextLessonId }
  actionsSlot = null,
}) {
  const { locale, t } = useTranslation();

  if (!course) return null;

  const safeThumb = sanitizeAssetUrl(course.thumbnail_url || course.thumbnailUrl, '');
  const detailsPath = ROUTES.getCourseDetailsPath(course.slug || course.id);

  return (
    <Card padding="p-0" className="flex flex-col justify-between overflow-hidden">
      <div>
        {/* Thumbnail */}
        <div className="relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-brand-border bg-brand-accent/40">
          {safeThumb ? (
            <img
              src={safeThumb}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-brand-primary">
              <BookOpen className="h-10 w-10 opacity-80" />
              <span className="text-xs font-medium text-brand-muted">
                {course.category || t('nav.courses')}
              </span>
            </div>
          )}

          {showStatus && course.status && (
            <div className="absolute top-3 start-3">
              <CourseStatusBadge status={course.status} />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-2.5 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-brand-text line-clamp-2">
              {course.title}
            </h3>
            {typeof course.price === 'number' && !progress && (
              <span className="shrink-0 rounded-lg bg-brand-accent px-2.5 py-1 text-xs font-bold text-brand-primary">
                {formatCurrency(course.price, course.currency, locale)}
              </span>
            )}
          </div>

          {course.short_description && (
            <p className="text-xs leading-relaxed text-brand-muted line-clamp-2">
              {course.short_description}
            </p>
          )}

          {progress && (
            <div className="pt-2">
              <ProgressBar
                percentage={progress.percentage}
                completedCount={progress.completedCount}
                totalCount={progress.totalCount}
              />
              <p className="mt-1.5 text-[11px] text-brand-muted">
                {t('learning.completedLessons')}: {progress.completedCount} /{' '}
                {progress.totalCount}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-brand-border bg-brand-bg/50 px-5 py-3.5">
        {actionsSlot ? (
          actionsSlot
        ) : progress ? (
          <Link
            to={ROUTES.STUDENT.getLearnPath(
              course.id,
              progress.nextLessonId || 'overview'
            )}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-hover"
          >
            <PlayCircle className="h-4 w-4" />
            <span>
              {progress.completedCount > 0
                ? t('learning.continueLearning')
                : t('learning.startCourse')}
            </span>
          </Link>
        ) : (
          <Link
            to={detailsPath}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
          >
            <span>{t('common.preview')}</span>
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        )}
      </div>
    </Card>
  );
}

export default CourseCard;
