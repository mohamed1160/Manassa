import { create } from 'zustand';
import {
  supabase,
  isSupabaseConfigured,
  SUPABASE_CONFIG_ERROR_MESSAGE,
} from '../services/supabase/client';

/**
 * Global Authentication Store (`src/stores/auth.store.js`).
 *
 * Maintains a minimal representation of the current user and profile role
 * without fabricating sessions or hardcoding teacher/student accounts.
 *
 * Security Note:
 * Frontend state is used strictly for UI rendering and route transitions.
 * Actual data access MUST be enforced by Supabase Row-Level Security (RLS).
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null, // 'student' | 'teacher' | null
  isLoading: true,
  isInitialized: false,
  error: null,
  isConfigured: isSupabaseConfigured,

  /**
   * Initializes auth state by checking Supabase configuration and current session.
   */
  initializeSession: async () => {
    if (get().isInitialized) return;

    if (!isSupabaseConfigured || !supabase) {
      set({
        user: null,
        profile: null,
        role: null,
        isLoading: false,
        isInitialized: true,
        isConfigured: false,
        error: SUPABASE_CONFIG_ERROR_MESSAGE,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const currentUser = session?.user ?? null;
      const derivedRole =
        currentUser?.user_metadata?.role ||
        currentUser?.app_metadata?.role ||
        null;

      set({
        user: currentUser,
        profile: currentUser
          ? {
              id: currentUser.id,
              email: currentUser.email,
              fullName: currentUser.user_metadata?.full_name || '',
              role: derivedRole,
            }
          : null,
        role: derivedRole,
        isLoading: false,
        isInitialized: true,
        isConfigured: true,
        error: null,
      });
    } catch (err) {
      set({
        user: null,
        profile: null,
        role: null,
        isLoading: false,
        isInitialized: true,
        error: err?.message || 'تعذر التحقق من جلسة المستخدم الحالية.',
      });
    }
  },

  /**
   * Signs out the current user from Supabase and resets store state.
   */
  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      set({
        user: null,
        profile: null,
        role: null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'حدث خطأ أثناء تسجيل الخروج.',
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
