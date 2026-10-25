import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_CONFIG_ERROR_MESSAGE =
  'لم يتم ضبط إعدادات الاتصال بقاعدة البيانات (Supabase). يرجى إضافة متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY داخل ملف .env الخاص بالمشروع.';

/**
 * Singleton Supabase client instance.
 * Remains `null` if required public environment variables are not configured,
 * preventing uncaught runtime crashes on initial load.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Helper for service modules to assert that Supabase is configured before making calls.
 */
export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE);
  }
  return supabase;
}
