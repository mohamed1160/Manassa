import {
  supabase,
  isSupabaseConfigured,
  requireSupabaseClient,
} from '../../../services/supabase/client';

/**
 * Students & Profiles Service (`src/features/students/services/students.service.js`).
 */
export const studentsService = {
  async getMyProfile() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  async updateMyProfile({ fullName, phone }) {
    const client = requireSupabaseClient();
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.user) {
      throw new Error('يلزم تسجيل الدخول لتحديث الملف الشخصي.');
    }

    const { data, error } = await client
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listEnrolledStudents({ search = '' } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return [];
    }

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        granted_at,
        last_accessed_at,
        courses ( id, title, slug ),
        student:profiles!enrollments_student_id_fkey (
          id,
          full_name,
          email,
          phone,
          created_at
        )
      `
      )
      .order('granted_at', { ascending: false });

    if (error) throw error;

    const studentMap = new Map();
    for (const row of enrollments || []) {
      const stu = row.student;
      if (!stu) continue;
      if (!studentMap.has(stu.id)) {
        studentMap.set(stu.id, {
          ...stu,
          courses: [],
          lastAccessedAt: row.last_accessed_at,
        });
      }
      if (row.courses) {
        studentMap.get(stu.id).courses.push(row.courses);
      }
    }

    const list = Array.from(studentMap.values());
    if (!search.trim()) return list;

    const q = search.trim().toLowerCase();
    return list.filter(
      (item) =>
        (item.full_name || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q)
    );
  },
};

export default studentsService;
