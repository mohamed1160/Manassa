import { useAuthStore } from '../stores/auth.store';
import { ROLES } from '../constants/roles';

/**
 * Convenience hook for reading authentication status and role helpers.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const role = useAuthStore((state) => state.role);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const error = useAuthStore((state) => state.error);
  const signOut = useAuthStore((state) => state.signOut);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    profile,
    role,
    isLoading,
    isInitialized,
    isConfigured,
    error,
    isAuthenticated: Boolean(user),
    isTeacher: role === ROLES.TEACHER,
    isStudent: role === ROLES.STUDENT,
    signOut,
    clearError,
  };
}

export default useAuth;
