import {
  supabase,
  isSupabaseConfigured,
  requireSupabaseClient,
} from '../../../services/supabase/client';

/**
 * Curriculum Service (`src/features/curriculum/services/curriculum.service.js`).
 *
 * Manages course sections and lessons ordering and persistence in Supabase.
 * Never fabricates sections or lessons, and only confirms saves when the database responds.
 */
export const curriculumService = {
  async getCourseCurriculum(courseId) {
    if (!isSupabaseConfigured || !supabase || !courseId) {
      return { course: null, sections: [] };
    }

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        courseId
      );

    let courseQuery = supabase.from('courses').select('*');
    courseQuery = isUuid
      ? courseQuery.eq('id', courseId)
      : courseQuery.eq('slug', courseId);

    const { data: course, error: courseError } = await courseQuery.maybeSingle();
    if (courseError) throw courseError;
    if (!course) return { course: null, sections: [] };

    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select(
        `
        id,
        course_id,
        title,
        sort_order,
        lessons (
          id,
          course_id,
          section_id,
          title,
          description,
          sort_order,
          duration_minutes,
          is_preview,
          is_published,
          video_provider,
          video_reference
        )
      `
      )
      .eq('course_id', course.id)
      .order('sort_order', { ascending: true });

    if (sectionsError) throw sectionsError;

    const normalizedSections = (sectionsData || []).map((sec) => ({
      ...sec,
      lessons: (sec.lessons || [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

    return {
      course,
      sections: normalizedSections,
    };
  },

  /**
   * Persists the full ordered curriculum tree (sections + lessons) to Supabase.
   */
  async saveCurriculumTree(courseId, sections = []) {
    const client = requireSupabaseClient();

    for (let sIndex = 0; sIndex < sections.length; sIndex += 1) {
      const sec = sections[sIndex];
      const isPersistedSection =
        sec.id && !String(sec.id).startsWith('temp-sec-');

      let sectionRow;
      if (isPersistedSection) {
        const { data, error } = await client
          .from('course_sections')
          .update({
            title: sec.title.trim(),
            sort_order: sIndex,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sec.id)
          .select()
          .single();
        if (error) throw error;
        sectionRow = data;
      } else {
        const { data, error } = await client
          .from('course_sections')
          .insert({
            course_id: courseId,
            title: sec.title.trim(),
            sort_order: sIndex,
          })
          .select()
          .single();
        if (error) throw error;
        sectionRow = data;
      }

      const lessons = sec.lessons || [];
      for (let lIndex = 0; lIndex < lessons.length; lIndex += 1) {
        const les = lessons[lIndex];
        const isPersistedLesson =
          les.id && !String(les.id).startsWith('temp-les-');

        const lessonPayload = {
          course_id: courseId,
          section_id: sectionRow.id,
          title: les.title.trim(),
          description: (les.description || '').trim(),
          sort_order: lIndex,
          duration_minutes: Math.max(0, Number(les.duration_minutes) || 0),
          is_preview: Boolean(les.is_preview),
          is_published: les.is_published !== false,
          video_reference: (les.video_reference || '').trim(),
          updated_at: new Date().toISOString(),
        };

        if (isPersistedLesson) {
          const { error } = await client
            .from('lessons')
            .update(lessonPayload)
            .eq('id', les.id);
          if (error) throw error;
        } else {
          const { error } = await client.from('lessons').insert(lessonPayload);
          if (error) throw error;
        }
      }
    }

    return this.getCourseCurriculum(courseId);
  },

  async deleteSection(sectionId) {
    const client = requireSupabaseClient();
    const { error } = await client
      .from('course_sections')
      .delete()
      .eq('id', sectionId);
    if (error) throw error;
    return true;
  },

  async deleteLesson(lessonId) {
    const client = requireSupabaseClient();
    const { error } = await client.from('lessons').delete().eq('id', lessonId);
    if (error) throw error;
    return true;
  },
};

export default curriculumService;
