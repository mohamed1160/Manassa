import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Video,
  Eye,
  Edit3,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { SaveChangesBar } from '../../../components/shared/SaveChangesBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ConfirmationDialog } from '../../../components/feedback/ConfirmationDialog';
import { curriculumService } from '../../curriculum/services/curriculum.service';
import { isSupabaseConfigured } from '../../../services/supabase/client';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../constants/routes';

export function TeacherCourseCurriculumPage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState('info');

  const [draggedSectionIdx, setDraggedSectionIdx] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);

  const loadCurriculum = useCallback(async () => {
    if (!isSupabaseConfigured || !id) {
      setSections([]);
      return;
    }

    setIsLoading(true);
    setStatusMessage('');
    try {
      const result = await curriculumService.getCourseCurriculum(id);
      setCourse(result.course);
      setSections(result.sections || []);
      setIsDirty(false);
    } catch (err) {
      setStatusTone('error');
      setStatusMessage(
        err?.message || 'تعذر تحميل بيانات المنهج الدراسي من قاعدة البيانات.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCurriculum();
  }, [loadCurriculum]);

  const handleAddSection = () => {
    const nextIndex = sections.length + 1;
    setSections((prev) => [
      ...prev,
      {
        id: `temp-sec-${Date.now()}-${nextIndex}`,
        title: `الوحدة الدراسية ${nextIndex}`,
        sort_order: prev.length,
        lessons: [],
      },
    ]);
    setIsDirty(true);
  };

  const handleRenameSection = (secIdx, nextTitle) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === secIdx ? { ...sec, title: nextTitle } : sec
      )
    );
    setIsDirty(true);
  };

  const handleMoveSection = (secIdx, direction) => {
    const targetIdx = secIdx + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    setSections((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(secIdx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy.map((sec, i) => ({ ...sec, sort_order: i }));
    });
    setIsDirty(true);
  };

  const handleDeleteSection = async (secIdx) => {
    const target = sections[secIdx];
    if (!target) return;

    const isPersisted =
      target.id && !String(target.id).startsWith('temp-sec-');

    if (isPersisted && isSupabaseConfigured) {
      try {
        await curriculumService.deleteSection(target.id);
      } catch (err) {
        setStatusTone('error');
        setStatusMessage(err?.message || 'تعذر حذف الوحدة من قاعدة البيانات.');
        return;
      }
    }

    setSections((prev) => prev.filter((_, idx) => idx !== secIdx));
    setIsDirty(true);
  };

  const handleAddLesson = (secIdx) => {
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== secIdx) return sec;
        const nextNum = (sec.lessons?.length || 0) + 1;
        return {
          ...sec,
          lessons: [
            ...(sec.lessons || []),
            {
              id: `temp-les-${Date.now()}-${nextNum}`,
              title: `الدرس ${nextNum}`,
              description: '',
              duration_minutes: 15,
              is_preview: false,
              is_published: true,
              video_reference: '',
              sort_order: sec.lessons?.length || 0,
            },
          ],
        };
      })
    );
    setIsDirty(true);
  };

  const handleUpdateLesson = (secIdx, lesIdx, field, value) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          lessons: sec.lessons.map((les, lIdx) =>
            lIdx === lesIdx ? { ...les, [field]: value } : les
          ),
        };
      })
    );
    setIsDirty(true);
  };

  const handleMoveLesson = (secIdx, lesIdx, direction) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        const targetIdx = lesIdx + direction;
        if (targetIdx < 0 || targetIdx >= sec.lessons.length) return sec;
        const copy = [...sec.lessons];
        const [moved] = copy.splice(lesIdx, 1);
        copy.splice(targetIdx, 0, moved);
        return {
          ...sec,
          lessons: copy.map((les, i) => ({ ...les, sort_order: i })),
        };
      })
    );
    setIsDirty(true);
  };

  const handleDeleteLesson = async (secIdx, lesIdx) => {
    const targetLesson = sections[secIdx]?.lessons?.[lesIdx];
    if (!targetLesson) return;

    const isPersisted =
      targetLesson.id && !String(targetLesson.id).startsWith('temp-les-');

    if (isPersisted && isSupabaseConfigured) {
      try {
        await curriculumService.deleteLesson(targetLesson.id);
      } catch (err) {
        setStatusTone('error');
        setStatusMessage(err?.message || 'تعذر حذف الدرس من قاعدة البيانات.');
        return;
      }
    }

    setSections((prev) =>
      prev.map((sec, sIdx) =>
        sIdx === secIdx
          ? {
              ...sec,
              lessons: sec.lessons.filter((_, lIdx) => lIdx !== lesIdx),
            }
          : sec
      )
    );
    setIsDirty(true);
  };

  const handleSaveCurriculum = async () => {
    for (const sec of sections) {
      if (!sec.title || !sec.title.trim()) {
        setStatusTone('error');
        setStatusMessage('يرجى إدخال عنوان لكل وحدة دراسية قبل الحفظ.');
        return;
      }
      for (const les of sec.lessons || []) {
        if (!les.title || !les.title.trim()) {
          setStatusTone('error');
          setStatusMessage('يرجى إدخال عنوان لكل درس داخل الوحدات قبل الحفظ.');
          return;
        }
      }
    }

    if (!isSupabaseConfigured) {
      setStatusTone('error');
      setStatusMessage(
        'تعذر تأكيد الحفظ في الخادم: قاعدة بيانات Supabase غير مربوطة في ملف .env. لن يتم الادعاء بنجاح الحفظ بدون تأكيد الخادم.'
      );
      return;
    }

    const targetCourseId = course?.id || id;
    setIsSaving(true);
    setStatusMessage('');

    try {
      const refreshed = await curriculumService.saveCurriculumTree(
        targetCourseId,
        sections
      );
      setSections(refreshed.sections || []);
      setIsDirty(false);
      setStatusTone('success');
      setStatusMessage(
        'تم حفظ الوحدات والدروس وترتيبها بنجاح في قاعدة البيانات.'
      );
    } catch (err) {
      setStatusTone('error');
      setStatusMessage(
        err?.message ||
          'فشل حفظ المنهج الدراسي في قاعدة البيانات. تأكد من صلاحيات المعلم (RLS) ووجود الدورة.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('courses.curriculumTitle')}
        subtitle={`تنظيم الوحدات الدراسية، إضافة الدروس، وترتيب العرض للدورة (${course?.title || id}).`}
        badgeText={`Course: ${course?.slug || id}`}
        actions={
          <>
            <Button variant="primary" size="sm" onClick={handleAddSection}>
              <FolderPlus className="h-4 w-4" />
              <span>{t('curriculum.addSection')}</span>
            </Button>
            <Link
              to={ROUTES.TEACHER.getCourseEditPath(course?.id || id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-medium text-brand-text hover:bg-brand-accent/40"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('courses.editTitle')}</span>
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
      ) : sections.length === 0 ? (
        <EmptyState
          title="لا توجد وحدات أو دروس مضافة لهذه الدورة بعد"
          description="لا يتم توليد دروس مزيفة تلقائياً. اضغط على 'إضافة وحدة دراسية جديدة' للبدء في بناء هيكل المنهج الدراسي الحقيقي."
          action={
            <Button variant="primary" size="sm" onClick={handleAddSection}>
              <FolderPlus className="h-4 w-4" />
              <span>{t('curriculum.addSection')}</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {sections.map((section, secIdx) => (
            <Card
              key={section.id}
              draggable
              onDragStart={() => setDraggedSectionIdx(secIdx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (
                  draggedSectionIdx !== null &&
                  draggedSectionIdx !== secIdx
                ) {
                  handleMoveSection(
                    draggedSectionIdx,
                    secIdx - draggedSectionIdx
                  );
                }
                setDraggedSectionIdx(null);
              }}
              className="space-y-4"
            >
              {/* Section Header */}
              <div className="flex flex-col gap-3 border-b border-brand-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2.5">
                  <GripVertical
                    className="h-5 w-5 shrink-0 cursor-grab text-brand-muted"
                    title="اسحب لإعادة ترتيب الوحدة"
                  />
                  <Badge variant="primary">#{secIdx + 1}</Badge>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleRenameSection(secIdx, e.target.value)
                    }
                    placeholder={t('curriculum.sectionTitlePlaceholder')}
                    aria-label={t('curriculum.sectionTitlePlaceholder')}
                    className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm font-bold text-brand-primary focus:border-brand-primary focus:bg-brand-surface focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMoveSection(secIdx, -1)}
                    disabled={secIdx === 0}
                    className="rounded-lg border border-brand-border bg-brand-surface p-2 text-brand-muted hover:text-brand-primary disabled:opacity-40"
                    title={t('curriculum.moveUp')}
                    aria-label={t('curriculum.moveUp')}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(secIdx, 1)}
                    disabled={secIdx === sections.length - 1}
                    className="rounded-lg border border-brand-border bg-brand-surface p-2 text-brand-muted hover:text-brand-primary disabled:opacity-40"
                    title={t('curriculum.moveDown')}
                    aria-label={t('curriculum.moveDown')}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddLesson(secIdx)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t('curriculum.addLesson')}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(secIdx)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Lessons List inside Section */}
              {(!section.lessons || section.lessons.length === 0) ? (
                <div className="rounded-xl border border-dashed border-brand-border bg-brand-bg/50 p-4 text-center text-xs text-brand-muted">
                  لا توجد دروس داخل هذه الوحدة بعد. اضغط على &quot;{t('curriculum.addLesson')}&quot; لإضافة درس.
                </div>
              ) : (
                <div className="space-y-3">
                  {section.lessons.map((lesson, lesIdx) => (
                    <div
                      key={lesson.id}
                      className="rounded-xl border border-brand-border bg-brand-bg/60 p-4 transition-colors hover:border-brand-primary/40"
                    >
                      <div className="grid gap-3 md:grid-cols-12 md:items-start">
                        <div className="space-y-2 md:col-span-5">
                          <label className="block text-[11px] font-bold text-brand-muted">
                            {t('curriculum.lessonTitlePlaceholder')} #{lesIdx + 1}
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              handleUpdateLesson(
                                secIdx,
                                lesIdx,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder={t('curriculum.lessonTitlePlaceholder')}
                            className="w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-xs font-bold text-brand-text focus:border-brand-primary focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            value={lesson.description || ''}
                            onChange={(e) =>
                              handleUpdateLesson(
                                secIdx,
                                lesIdx,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder={t('curriculum.lessonDescPlaceholder')}
                            className="w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-4">
                          <label className="block text-[11px] font-bold text-brand-muted">
                            {t('curriculum.videoReference')} & {t('curriculum.durationMinutes')}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              dir="ltr"
                              value={lesson.video_reference || ''}
                              onChange={(e) =>
                                handleUpdateLesson(
                                  secIdx,
                                  lesIdx,
                                  'video_reference',
                                  e.target.value
                                )
                              }
                              placeholder="video-asset-id"
                              className="w-full rounded-lg border border-brand-border bg-brand-surface px-2.5 py-2 font-mono text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                            />
                            <input
                              type="number"
                              dir="ltr"
                              min={0}
                              value={lesson.duration_minutes ?? 0}
                              onChange={(e) =>
                                handleUpdateLesson(
                                  secIdx,
                                  lesIdx,
                                  'duration_minutes',
                                  e.target.value
                                )
                              }
                              className="w-20 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-2 text-center font-mono text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                              title={t('curriculum.durationMinutes')}
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 text-brand-text">
                              <input
                                type="checkbox"
                                checked={Boolean(lesson.is_preview)}
                                onChange={(e) =>
                                  handleUpdateLesson(
                                    secIdx,
                                    lesIdx,
                                    'is_preview',
                                    e.target.checked
                                  )
                                }
                                className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                              />
                              <span>{t('curriculum.freePreview')}</span>
                            </label>

                            <label className="inline-flex cursor-pointer items-center gap-1.5 text-brand-text">
                              <input
                                type="checkbox"
                                checked={lesson.is_published !== false}
                                onChange={(e) =>
                                  handleUpdateLesson(
                                    secIdx,
                                    lesIdx,
                                    'is_published',
                                    e.target.checked
                                  )
                                }
                                className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                              />
                              <span>{t('curriculum.publishedLesson')}</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 md:col-span-3 md:pt-5">
                          <button
                            type="button"
                            onClick={() =>
                              handleMoveLesson(secIdx, lesIdx, -1)
                            }
                            disabled={lesIdx === 0}
                            className="rounded-lg border border-brand-border bg-brand-surface p-1.5 text-brand-muted hover:text-brand-primary disabled:opacity-40"
                            title={t('curriculum.moveUp')}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleMoveLesson(secIdx, lesIdx, 1)
                            }
                            disabled={lesIdx === section.lessons.length - 1}
                            className="rounded-lg border border-brand-border bg-brand-surface p-1.5 text-brand-muted hover:text-brand-primary disabled:opacity-40"
                            title={t('curriculum.moveDown')}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewLesson(lesson)}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-accent/50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t('common.preview')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(secIdx, lesIdx)}
                            className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <SaveChangesBar
        isDirty={isDirty}
        isSaving={isSaving}
        statusMessage={statusMessage}
        statusTone={statusTone}
        saveLabel={t('curriculum.saveCurriculum')}
        onSave={handleSaveCurriculum}
        onCancel={loadCurriculum}
      />

      <ConfirmationDialog
        isOpen={Boolean(previewLesson)}
        title={previewLesson?.title || 'معاينة الدرس'}
        message={
          previewLesson?.description || 'لا يوجد وصف مضاف لهذا الدرس حتى الآن.'
        }
        confirmLabel={t('common.close')}
        cancelLabel={t('common.cancel')}
        variant="primary"
        onConfirm={() => setPreviewLesson(null)}
        onCancel={() => setPreviewLesson(null)}
      >
        {previewLesson && (
          <div className="space-y-2 rounded-xl border border-brand-border bg-brand-bg p-3 text-xs">
            <div className="flex items-center gap-2 text-brand-primary">
              <Video className="h-4 w-4" />
              <span className="font-bold">
                معرف الفيديو:{' '}
                <code dir="ltr" className="font-mono">
                  {previewLesson.video_reference || 'غير محدد بعد'}
                </code>
              </span>
            </div>
            <p className="text-brand-muted">
              المدة: {previewLesson.duration_minutes || 0} دقيقة |{' '}
              {previewLesson.is_preview ? 'متاح كمعاينة مجانية' : 'محمي للمشتركين فقط'}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </PageContainer>
  );
}

export default TeacherCourseCurriculumPage;
