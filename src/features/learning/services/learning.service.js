import {
  supabase,
  isSupabaseConfigured,
  requireSupabaseClient,
} from '../../../services/supabase/client';
import { videoService } from '../../../services/video/video.service';

/**
 * Student Learning & Progress Service (`src/features/learning/services/learning.service.js`).
 *
 * Integrity & Security Rules:
 * - Queries and writes progress strictly for the authenticated student (`auth.uid()`).
 * - Deduplicates completed lesson IDs using a Set against valid published course lessons
 *   to prevent double-counting.
 * - Does not fabricate enrollments, lessons, or video playback streams.
 */
export const learningService = {
  async getMyEnrolledCoursesWithProgress() {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return [];
    }

    const studentId = session.user.id;

    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        course_id,
        last_accessed_lesson_id,
        last_accessed_at,
        granted_at,
        courses (
          id,
          title,
          slug,
          short_description,
          thumbnail_url,
          category,
          price,
          currency,
          status,
          lessons (
            id,
            title,
            sort_order,
            is_published
          )
        )
      `
      )
      .eq('student_id', studentId)
      .order('last_accessed_at', { ascending: false, nullsFirst: false });

    if (enrollError) throw enrollError;

    const { data: progressRows, error: progError } = await supabase
      .from('lesson_progress')
      .select('course_id, lesson_id, is_completed, last_accessed_at')
      .eq('student_id', studentId);

    if (progError) throw progError;

    const completedByCourse = new Map();
    for (const row of progressRows || []) {
      if (row.is_completed) {
        if (!completedByCourse.has(row.course_id)) {
          completedByCourse.set(row.course_id, new Set());
        }
        completedByCourse.get(row.course_id).add(row.lesson_id);
      }
    }

    return (enrollments || [])
      .filter((e) => Boolean(e.courses))
      .map((enrollment) => {
        const course = enrollment.courses;
        const validLessons = (course.lessons || [])
          .filter((l) => l.is_published !== false)
          .sort((a, b) => a.sort_order - b.sort_order);

        const validLessonIds = new Set(validLessons.map((l) => l.id));
        const rawCompletedSet =
          completedByCourse.get(course.id) || new Set();

        let completedCount = 0;
        rawCompletedSet.forEach((lid) => {
          if (validLessonIds.has(lid)) completedCount += 1;
        });

        const totalCount = validLessons.length;
        const percentage =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const lastLesson =
          validLessons.find(
            (l) => l.id === enrollment.last_accessed_lesson_id
          ) || null;

        const firstIncomplete =
          validLessons.find((l) => !rawCompletedSet.has(l.id)) ||
          validLessons[0] ||
          null;

        const nextLessonId =
          lastLesson?.id || firstIncomplete?.id || 'lesson-1';

        return {
          enrollmentId: enrollment.id,
          grantedAt: enrollment.granted_at,
          lastAccessedAt: enrollment.last_accessed_at,
          lastAccessedLesson: lastLesson,
          course,
          progress: {
            percentage,
            completedCount,
            totalCount,
            nextLessonId,
          },
        };
      });
  },

  async getLessonPlayerContext(courseId, lessonId) {
    if (!isSupabaseConfigured || !supabase || !courseId) {
      const playback = await videoService.getPlaybackContext({
        courseId,
        lessonId,
      });
      return {
        course: null,
        sections: [],
        flatLessons: [],
        currentLesson: null,
        completedLessonIds: [],
        isEnrolled: false,
        playback,
      };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        courseId
      );

    let courseQuery = supabase.from('courses').select('*');
    courseQuery = isUuid
      ? courseQuery.eq('id', courseId)
      : courseQuery.eq('slug', courseId);

    const { data: course, error: courseErr } = await courseQuery.maybeSingle();
    if (courseErr) throw courseErr;
    if (!course) {
      return {
        course: null,
        sections: [],
        flatLessons: [],
        currentLesson: null,
        completedLessonIds: [],
        isEnrolled: false,
        playback: await videoService.getPlaybackContext({ courseId, lessonId }),
      };
    }

    const { data: sectionsData, error: secErr } = await supabase
      .from('course_sections')
      .select(
        `
        id,
        title,
        sort_order,
        lessons (
          id,
          section_id,
          title,
          description,
          sort_order,
          duration_minutes,
          is_preview,
          is_published,
          video_reference
        )
      `
      )
      .eq('course_id', course.id)
      .order('sort_order', { ascending: true });

    if (secErr) throw secErr;

    const sections = (sectionsData || []).map((sec) => ({
      ...sec,
      lessons: (sec.lessons || [])
        .filter((l) => l.is_published !== false)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

    const flatLessons = sections.flatMap((s) => s.lessons);
    const currentLesson =
      flatLessons.find((l) => l.id === lessonId) || flatLessons[0] || null;

    let isEnrolled = false;
    let completedLessonIds = [];

    if (session?.user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', session.user.id)
        .eq('course_id', course.id)
        .maybeSingle();

      isEnrolled = Boolean(enrollment);

      const { data: progressRows } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed')
        .eq('student_id', session.user.id)
        .eq('course_id', course.id);

      const validIds = new Set(flatLessons.map((l) => l.id));
      completedLessonIds = Array.from(
        new Set(
          (progressRows || [])
            .filter((r) => r.is_completed && validIds.has(r.lesson_id))
            .map((r) => r.lesson_id)
        )
      );
    }

    const playback = await videoService.getPlaybackContext({
      courseId: course.id,
      lessonId: currentLesson?.id || lessonId,
    });

    return {
      course,
      sections,
      flatLessons,
      currentLesson,
      completedLessonIds,
      isEnrolled,
      playback,
    };
  },

  async recordLessonAccess(courseId, lessonId) {
    if (!isSupabaseConfigured || !supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    const now = new Date().toISOString();
    await supabase
      .from('enrollments')
      .update({
        last_accessed_lesson_id: lessonId,
        last_accessed_at: now,
      })
      .eq('student_id', session.user.id)
      .eq('course_id', courseId);
  },

  async toggleLessonCompletion(courseId, lessonId, isCompleted) {
    const client = requireSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      throw new Error('يلزم تسجيل الدخول بحساب الطالب لحفظ تقدم الدرس.');
    }

    const now = new Date().toISOString();
    const { data, error } = await client
      .from('lesson_progress')
      .upsert(
        {
          student_id: session.user.id,
          course_id: courseId,
          lesson_id: lessonId,
          is_completed: Boolean(isCompleted),
          completed_at: isCompleted ? now : null,
          last_accessed_at: now,
        },
        { onConflict: 'student_id,lesson_id' }
      )
      .select()
      .single();

    if (error) throw error;

    await this.recordLessonAccess(courseId, lessonId);
    return data;
  },
};

export default learningService;
