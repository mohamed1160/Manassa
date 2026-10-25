import { requireSupabaseClient } from '../../../services/supabase/client';
import { ROLES } from '../../../constants/roles';

/**
 * Authentication Service (`src/features/auth/services/auth.service.js`).
 * Connects Login, Student Registration, and Password Reset to Supabase Auth.
 */
export const authService = {
  async signInWithPassword({ email, password }) {
    const client = requireSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  },

  async registerStudent({ fullName, email, phone, password }) {
    const client = requireSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: ROLES.STUDENT,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async requestPasswordReset({ email }) {
    const client = requireSupabaseClient();
    const { data, error } = await client.auth.resetPasswordForEmail(
      email.trim()
    );
    if (error) throw error;
    return data;
  },
};

export default authService;
