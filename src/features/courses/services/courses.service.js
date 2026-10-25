import {
  supabase,
  isSupabaseConfigured,
  requireSupabaseClient,
} from '../../../services/supabase/client';
import { validateCourseForPublishing } from '../schemas/course.schema';

/**
 * Courses Feature Service (`src/features/courses/services/courses.service.js`).
 *
 * Security & Integrity Rules:
 * - Public queries strictly filter `status = 'published'`.
 * - Teacher mutations require an active Supabase connection and teacher authorization (enforced by RLS).
 * - Never fabricates course records or claims a save succeeded unless confirmed by Supabase.
 */
export const coursesService = {
  async listPublishedCourses({ search = '', category = '' } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async listTeacherCourses({ search = '', status = 'all' } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search.trim()) {
      query = query.or(
        `title.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getCourseBySlug(slug) {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        course_sections (
          id,
          title,
          sort_order,
          lessons (
            id,
            title,
            description,
            sort_order,
            duration_minutes,
            is_preview,
            is_published
          )
        )
      `
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!course) return null;

    const sections = (course.course_sections || [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((sec) => ({
        ...sec,
        lessons: (sec.lessons || [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order),
      }));

    return { ...course, course_sections: sections };
  },

  async getCourseById(courseId) {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        courseId
      );

    let query = supabase.from('courses').select('*');
    query = isUuid ? query.eq('id', courseId) : query.eq('slug', courseId);

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data || null;
  },

  async createCourse(values) {
    const client = requireSupabaseClient();

    if (values.status === 'published') {
      const check = validateCourseForPublishing(values);
      if (!check.isValid) {
        throw new Error(
          `لا يمكن نشر الدورة قبل استكمال الحقول المطلوبة: ${check.missingFields.join('، ')}`
        );
      }
    }

    const {
      data: { session },
    } = await client.auth.getSession();

    const payload = {
      teacher_id: session?.user?.id || null,
      title: values.title.trim(),
      slug: values.slug.trim().toLowerCase(),
      category: values.category || 'general',
      price: Number(values.price) || 0,
      currency: values.currency || 'EGP',
      short_description: values.short_description.trim(),
      full_description: (values.full_description || '').trim(),
      thumbnail_url: (values.thumbnail_url || '').trim(),
      status: values.status || 'draft',
    };

    const { data, error } = await client
      .from('courses')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(courseId, values) {
    const client = requireSupabaseClient();

    if (values.status === 'published') {
      const check = validateCourseForPublishing(values);
      if (!check.isValid) {
        throw new Error(
          `لا يمكن نشر الدورة قبل استكمال الحقول المطلوبة: ${check.missingFields.join('، ')}`
        );
      }
    }

    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim().toLowerCase(),
      category: values.category || 'general',
      price: Number(values.price) || 0,
      currency: values.currency || 'EGP',
      short_description: values.short_description.trim(),
      full_description: (values.full_description || '').trim(),
      thumbnail_url: (values.thumbnail_url || '').trim(),
      status: values.status || 'draft',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from('courses')
      .update(payload)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourseStatus(course, nextStatus) {
    const client = requireSupabaseClient();

    if (nextStatus === 'published') {
      const check = validateCourseForPublishing(course);
      if (!check.isValid) {
        throw new Error(
          `لا يمكن نشر الدورة قبل استكمال الحقول المطلوبة: ${check.missingFields.join('، ')}`
        );
      }
    }

    const { data, error } = await client
      .from('courses')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', course.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(courseId) {
    const client = requireSupabaseClient();
    const { error } = await client.from('courses').delete().eq('id', courseId);
    if (error) throw error;
    return true;
  },
};

export default coursesService;
