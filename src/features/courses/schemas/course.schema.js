import * as Yup from 'yup';

export const courseMetadataSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(5, 'عنوان الدورة يجب ألا يقل عن 5 أحرف / Minimum 5 characters')
    .required('عنوان الدورة مطلوب / Course title is required'),
  slug: Yup.string()
    .trim()
    .matches(
      /^[a-z0-9-]+$/,
      'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط (a-z, 0-9, -)'
    )
    .required('الرابط المختصر (Slug) مطلوب'),
  category: Yup.string().trim().required('التصنيف الدراسي مطلوب'),
  price: Yup.number()
    .typeError('يرجى إدخال قيمة رقمية صحيحة للسعر')
    .min(0, 'السعر لا يمكن أن يكون سالباً')
    .required('سعر الدورة مطلوب'),
  currency: Yup.string().required('العملة مطلوبة'),
  short_description: Yup.string()
    .trim()
    .min(10, 'الوصف المختصر يجب ألا يقل عن 10 أحرف')
    .required('الوصف المختصر للدورة مطلوب'),
  full_description: Yup.string().trim(),
  thumbnail_url: Yup.string().trim(),
  status: Yup.string()
    .oneOf(['draft', 'published', 'archived'])
    .required(),
});

/**
 * Validates that a course has all required fields before transitioning to 'published'.
 */
export function validateCourseForPublishing(course) {
  const missing = [];
  if (!course?.title || course.title.trim().length < 5) {
    missing.push('عنوان الدورة (5 أحرف على الأقل)');
  }
  if (!course?.slug || !/^[a-z0-9-]+$/.test(course.slug)) {
    missing.push('الرابط المختصر الصحيح (Slug)');
  }
  if (!course?.short_description || course.short_description.trim().length < 10) {
    missing.push('الوصف المختصر للدورة');
  }
  if (typeof course?.price !== 'number' || Number.isNaN(course.price) || course.price < 0) {
    missing.push('سعر الدورة');
  }
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}

export default courseMetadataSchema;
