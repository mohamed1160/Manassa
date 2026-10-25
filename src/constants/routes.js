export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAILS: '/courses/:slug',
   getCourseDetailsPath: (slug = 'sample-course') => `/courses/${slug}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  STUDENT: {
    DASHBOARD: '/student/dashboard',
    COURSES: '/student/courses',
    ORDERS: '/student/orders',
    PROFILE: '/student/profile',
    LEARN: '/learn/:courseId/:lessonId',
    getLearnPath: (courseId = 'course-1', lessonId = 'lesson-1') =>
      `/learn/${courseId}/${lessonId}`,
    CHECKOUT: '/checkout/:courseId',
    getCheckoutPath: (courseId = 'course-1') => `/checkout/${courseId}`,
  },

  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    COURSES: '/teacher/courses',
    COURSE_NEW: '/teacher/courses/new',
    COURSE_EDIT: '/teacher/courses/:id/edit',
    getCourseEditPath: (id = 'course-1') => `/teacher/courses/${id}/edit`,
    COURSE_CURRICULUM: '/teacher/courses/:id/curriculum',
    getCourseCurriculumPath: (id = 'course-1') => `/teacher/courses/${id}/curriculum`,
    STUDENTS: '/teacher/students',
    ORDERS: '/teacher/orders',
    SETTINGS: '/teacher/settings',
  },
};

export default ROUTES;
