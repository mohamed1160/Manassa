import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { VideoPlayerPlaceholder } from '../components/VideoPlayerPlaceholder';
import { learningService } from '../services/learning.service';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [context, setContext] = useState(null);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadPlayerContext = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await learningService.getLessonPlayerContext(
        courseId,
        lessonId
      );
      setContext(result);
      setCompletedSet(new Set(result.completedLessonIds || []));

      if (result.course?.id && result.currentLesson?.id) {
        learningService
          .recordLessonAccess(result.course.id, result.currentLesson.id)
          .catch(() => {});
      }
    } catch (err) {
      setError(err?.message || 'تعذر تحميل بيانات الدرس والمنهج الدراسي.');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    loadPlayerContext();
  }, [loadPlayerContext]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  const course = context?.course;
  const sections = context?.sections || [];
  const flatLessons = context?.flatLessons || [];
  const currentLesson = context?.currentLesson;

  const currentIdx = flatLessons.findIndex(
    (l) => l.id === (currentLesson?.id || lessonId)
  );
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < flatLessons.length - 1
      ? flatLessons[currentIdx + 1]
      : null;

  const activeLessonId = currentLesson?.id || lessonId;
  const isCurrentCompleted = completedSet.has(activeLessonId);

  const totalLessonsCount = flatLessons.length;
  const completedCount = flatLessons.filter((l) =>
    completedSet.has(l.id)
  ).length;
  const progressPercentage =
    totalLessonsCount > 0
      ? Math.round((completedCount / totalLessonsCount) * 100)
      : 0;

  const handleToggleComplete = async () => {
    setIsToggling(true);
    setStatusMessage('');
    setError('');
    const targetState = !isCurrentCompleted;

    try {
      await learningService.toggleLessonCompletion(
        course?.id || courseId,
        activeLessonId,
        targetState
      );
      setCompletedSet((prev) => {
        const next = new Set(prev);
        if (targetState) next.add(activeLessonId);
        else next.delete(activeLessonId);
        return next;
      });
      setStatusMessage(
        targetState
          ? 'تم حفظ إتمام الدرس في سجلك الدراسي بنجاح.'
          : 'تم إلغاء علامة إتمام الدرس.'
      );
    } catch (err) {
      setError(
        err?.message ||
          'تعذر حفظ حالة إتمام الدرس. تأكد من تسجيل الدخول والاشتراك الفعلي في الدورة.'
      );
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={currentLesson?.title || `الدرس (${lessonId})`}
        subtitle={
          course?.title ||
          `مشغل الدروس ومتابعة المنهج الدراسي (${courseId})`
        }
        badgeText={t('nav.studentPortal')}
        actions={
          <Link
            to={ROUTES.STUDENT.COURSES}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
          >
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
            <span>{t('nav.myCourses')}</span>
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={loadPlayerContext} />}

      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-brand-border bg-brand-accent/70 p-3 text-xs font-bold text-brand-primary"
        >
          {statusMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Video & Lesson Controls Column */}
        <div className="space-y-5 lg:col-span-8">
          <VideoPlayerPlaceholder
            courseId={course?.id || courseId}
            lessonId={activeLessonId}
          />

          {/* Lesson Navigation & Completion Bar */}
          <Card padding="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() =>
                    prevLesson &&
                    navigate(
                      ROUTES.STUDENT.getLearnPath(
                        course?.id || courseId,
                        prevLesson.id
                      )
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                  <span>{t('learning.previousLesson')}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() =>
                    nextLesson &&
                    navigate(
                      ROUTES.STUDENT.getLearnPath(
                        course?.id || courseId,
                        nextLesson.id
                      )
                    )
                  }
                >
                  <span>{t('learning.nextLesson')}</span>
                  <ChevronLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
                </Button>
              </div>

              <Button
                variant={isCurrentCompleted ? 'secondary' : 'primary'}
                size="sm"
                disabled={isToggling}
                onClick={handleToggleComplete}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isCurrentCompleted
                    ? t('learning.lessonCompleted')
                    : t('learning.markCompleted')}
                </span>
              </Button>
            </div>
          </Card>

          {/* Lesson Description */}
          <Card className="space-y-2">
            <h2 className="text-base font-bold text-brand-primary">
              ملاحظات ووصف الدرس
            </h2>
            <p className="text-sm leading-relaxed text-brand-muted">
              {currentLesson?.description ||
                'لا توجد ملاحظات إضافية مسجلة لهذا الدرس.'}
            </p>
          </Card>
        </div>

        {/* Curriculum Sidebar & Course Progress */}
        <div className="space-y-5 lg:col-span-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-brand-primary">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-base font-bold">
                {t('learning.courseCurriculum')}
              </h2>
            </div>

            <ProgressBar
              percentage={progressPercentage}
              completedCount={completedCount}
              totalCount={totalLessonsCount}
            />

            {sections.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-border bg-brand-bg p-4 text-center text-xs text-brand-muted">
                سيظهر هنا فهرس الوحدات والدروس الفعلي عند حفظ المنهج الدراسي في قاعدة البيانات.
              </p>
            ) : (
              <div className="max-h-[480px] space-y-3 overflow-y-auto pe-1">
                {sections.map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="overflow-hidden rounded-xl border border-brand-border bg-brand-bg/50"
                  >
                    <div className="border-b border-brand-border bg-brand-surface px-3.5 py-2.5 text-xs font-bold text-brand-primary">
                      {sIdx + 1}. {sec.title}
                    </div>
                    <ul className="divide-y divide-brand-border">
                      {(sec.lessons || []).map((les) => {
                        const isActive = les.id === activeLessonId;
                        const isDone = completedSet.has(les.id);
                        return (
                          <li key={les.id}>
                            <Link
                              to={ROUTES.STUDENT.getLearnPath(
                                course?.id || courseId,
                                les.id
                              )}
                              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs transition-colors ${
                                isActive
                                  ? 'bg-brand-accent font-bold text-brand-primary'
                                  : 'text-brand-text hover:bg-brand-accent/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-primary" />
                                ) : (
                                  <Circle className="h-4 w-4 shrink-0 text-brand-muted" />
                                )}
                                <span className="line-clamp-1">{les.title}</span>
                              </div>
                              {les.duration_minutes > 0 && (
                                <span className="shrink-0 text-[11px] text-brand-muted">
                                  {les.duration_minutes} د
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default LessonPlayerPage;
