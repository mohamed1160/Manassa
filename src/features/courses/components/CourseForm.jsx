import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Save, Send, Eye, Sparkles } from 'lucide-react';
import { FormField } from '../../../components/forms/FormField';
import { ImageUploadField } from '../../../components/forms/ImageUploadField';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CourseCard } from '../../../components/shared/CourseCard';
import { courseMetadataSchema } from '../schemas/course.schema';
import { useSiteConfig } from '../../../hooks/useSiteConfig';
import { useTranslation } from '../../../hooks/useTranslation';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'عام / منهج أساسي (General)' },
  { value: 'secondary_1', label: 'الصف الأول الثانوي (Grade 10)' },
  { value: 'secondary_2', label: 'الصف الثاني الثانوي (Grade 11)' },
  { value: 'secondary_3', label: 'الصف الثالث الثانوي (Grade 12)' },
  { value: 'revision', label: 'مراجعات نهائية ومكثفة (Final Revision)' },
];

function slugifyText(input = '') {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Reusable Course Form component for creating and editing courses.
 * Supports Save Draft, Publish, and Live Card Preview.
 */
export function CourseForm({
  initialData = null,
  onSubmitCourse,
  isSubmitting = false,
  backendError = '',
  successMessage = '',
}) {
  const site = useSiteConfig();
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      category: initialData?.category || 'general',
      price: initialData?.price ?? 0,
      currency: initialData?.currency || site.localization.currency || 'EGP',
      short_description: initialData?.short_description || '',
      full_description: initialData?.full_description || '',
      thumbnail_url: initialData?.thumbnail_url || '',
      status: initialData?.status || 'draft',
    },
    validationSchema: courseMetadataSchema,
    onSubmit: async (values) => {
      if (onSubmitCourse) {
        await onSubmitCourse(values);
      }
    },
  });

  const handleSubmitWithStatus = async (targetStatus) => {
    await formik.setFieldValue('status', targetStatus, true);
    formik.handleSubmit();
  };

  const handleAutoSlug = () => {
    const generated =
      slugifyText(formik.values.title) || `course-${Date.now().toString().slice(-5)}`;
    formik.setFieldValue('slug', generated);
  };

  return (
    <div className="space-y-6">
      {backendError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800"
        >
          {backendError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-brand-border bg-brand-accent/70 p-4 text-xs font-bold text-brand-primary"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
        <Card className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label={t('courses.titleLabel')}
              name="title"
              required
              placeholder="مثال: الدورة الشاملة في الجبر والهندسة الفراغية"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.title}
              touched={formik.touched.title}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-brand-text"
                >
                  {t('courses.slugLabel')} <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>توليد تلقائي</span>
                </button>
              </div>
              <input
                id="slug"
                name="slug"
                type="text"
                dir="ltr"
                placeholder="algebra-comprehensive-course"
                value={formik.values.slug}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-lg border border-brand-border bg-brand-surface px-3.5 py-2.5 font-mono text-sm text-brand-text focus:border-brand-primary focus:outline-none"
              />
              {formik.touched.slug && formik.errors.slug && (
                <p className="text-xs font-medium text-red-600" role="alert">
                  {formik.errors.slug}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              as="select"
              label={t('courses.categoryLabel')}
              name="category"
              required
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.category}
              touched={formik.touched.category}
              options={CATEGORY_OPTIONS}
            />

            <FormField
              label={t('courses.priceLabel')}
              name="price"
              type="number"
              dir="ltr"
              required
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.price}
              touched={formik.touched.price}
            />

            <FormField
              as="select"
              label={t('courses.currencyLabel')}
              name="currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
              options={[
                { value: 'EGP', label: 'EGP (ج.م)' },
                { value: 'SAR', label: 'SAR (ر.س)' },
                { value: 'AED', label: 'AED (د.إ)' },
                { value: 'USD', label: 'USD ($)' },
              ]}
            />
          </div>

          <FormField
            as="textarea"
            rows={2}
            label={t('courses.shortDescLabel')}
            name="short_description"
            required
            placeholder="ملخص سريع يظهر في بطاقة الدورة داخل الفهرس العام..."
            value={formik.values.short_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.short_description}
            touched={formik.touched.short_description}
          />

          <FormField
            as="textarea"
            rows={5}
            label={t('courses.fullDescLabel')}
            name="full_description"
            placeholder="اشرح بالتفصيل محتوى الدورة، المتطلبات السابقة، وما سيتعلمه الطالب..."
            value={formik.values.full_description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.full_description}
            touched={formik.touched.full_description}
          />

          <ImageUploadField
            label={t('courses.coverImageLabel')}
            name="thumbnail_url"
            value={formik.values.thumbnail_url}
            onChange={(_, val) => formik.setFieldValue('thumbnail_url', val)}
            previewHeight="h-32"
            helperText="صورة الغلاف التي تظهر للطلاب في بطاقة الدورة وصفحة التفاصيل."
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              <Eye className="h-4 w-4" />
              <span>{t('common.preview')}</span>
            </Button>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus('draft')}
              >
                <Save className="h-4 w-4" />
                <span>{t('courses.saveDraft')}</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus('published')}
              >
                <Send className="h-4 w-4" />
                <span>{t('courses.publishCourse')}</span>
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {showPreview && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-brand-primary">
            معاينة بطاقة الدورة كما ستظهر للطلاب:
          </h3>
          <div className="max-w-sm">
            <CourseCard
              showStatus
              course={{
                ...formik.values,
                title: formik.values.title || 'عنوان الدورة التدريبية',
                price: Number(formik.values.price) || 0,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseForm;
