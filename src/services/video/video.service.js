/**
 * Video Hosting & Playback Service Boundary (`src/services/video/video.service.js`).
 *
 * ARCHITECTURAL NOTE:
 * This module defines the interface for integrating with a dedicated video hosting
 * provider (such as Bunny Stream, Vimeo, Cloudflare Stream, or Mux) that supports
 * authenticated/signed playback URLs and domain-level embed protection.
 *
 * Security Reminder:
 * - Token signing and enrollment verification MUST happen on a trusted backend
 *   (e.g., Supabase Edge Function) after verifying the student's active enrollment.
 * - Never expose video provider API secret keys in frontend code.
 */

export const videoService = {
  /**
   * Requests a short-lived playback configuration or signed URL for an authorized lesson.
   * @param {Object} params
   * @param {string} params.courseId
   * @param {string} params.lessonId
   */
  async getPlaybackContext({ courseId, lessonId } = {}) {
    return {
      status: 'not_implemented',
      isOperational: false,
      courseId: courseId || null,
      lessonId: lessonId || null,
      message:
        'مشغل الفيديو المحمي والروابط الموقعة (Signed URLs) سيتم تفعيلها عند ربط مزود استضافة الفيديو والـ Backend.',
    };
  },

  /**
   * Placeholder for teacher video metadata linkage (e.g., associating a provider video ID with a lesson).
   */
  async attachVideoToLesson() {
    throw new Error(
      'ربط معرفات الفيديو بالدروس غير مفعل في مرحلة التأسيس الأولية للمنصة.'
    );
  },
};

export default videoService;
