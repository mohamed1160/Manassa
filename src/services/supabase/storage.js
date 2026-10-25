import { requireSupabaseClient } from './client';

/**
 * Storage Bucket Identifiers used across the platform.
 * Actual buckets and Row-Level Security (RLS) policies must be provisioned
 * in the teacher's Supabase instance.
 */
export const STORAGE_BUCKETS = {
  COURSE_THUMBNAILS: 'course-thumbnails',
  PAYMENT_RECEIPTS: 'payment-receipts',
  LESSON_ATTACHMENTS: 'lesson-attachments',
};

/**
 * Service boundary for Supabase Storage operations.
 * Full upload/signed URL logic will be implemented alongside feature modules.
 */
export const storageService = {
  getPublicAssetUrl(bucket, filePath) {
    if (!bucket || !filePath) return null;
    const client = requireSupabaseClient();
    const { data } = client.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl || null;
  },

  async uploadReceiptPlaceholder() {
    requireSupabaseClient();
    throw new Error(
      'خدمة رفع إيصالات الدفع قيد التجهيز ضمن مرحلة ربط المدفوعات وتخزين الملفات.'
    );
  },
};

export default storageService;
