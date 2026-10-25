import { ROUTES } from '../constants/routes';

export function getPublicNavigation(t) {
  return [
    { label: t('nav.home'), path: ROUTES.HOME, exact: true },
    { label: t('nav.courses'), path: ROUTES.COURSES },
    { label: t('nav.about'), path: ROUTES.ABOUT },
    { label: t('nav.contact'), path: ROUTES.CONTACT },
  ];
}

export function getFooterLegalLinks(t) {
  return [
    { label: t('nav.terms'), path: ROUTES.TERMS },
    { label: t('nav.privacy'), path: ROUTES.PRIVACY },
  ];
}

export function getStudentNavigation(t) {
  return [
    {
      label: t('nav.studentDashboard'),
      path: ROUTES.STUDENT.DASHBOARD,
      icon: 'LayoutDashboard',
      exact: true,
    },
    {
      label: t('nav.myCourses'),
      path: ROUTES.STUDENT.COURSES,
      icon: 'BookOpen',
    },
    {
      label: t('nav.studentOrders'),
      path: ROUTES.STUDENT.ORDERS,
      icon: 'Receipt',
    },
    {
      label: t('nav.studentProfile'),
      path: ROUTES.STUDENT.PROFILE,
      icon: 'User',
    },
  ];
}

export function getTeacherNavigation(t) {
  return [
    {
      label: t('nav.teacherDashboard'),
      path: ROUTES.TEACHER.DASHBOARD,
      icon: 'LayoutDashboard',
      exact: true,
    },
    {
      label: t('nav.manageCourses'),
      path: ROUTES.TEACHER.COURSES,
      icon: 'BookCopy',
    },
    {
      label: t('nav.manageStudents'),
      path: ROUTES.TEACHER.STUDENTS,
      icon: 'Users',
    },
    {
      label: t('nav.reviewOrders'),
      path: ROUTES.TEACHER.ORDERS,
      icon: 'CreditCard',
    },
    {
      label: t('nav.platformSettings'),
      path: ROUTES.TEACHER.SETTINGS,
      icon: 'Settings',
    },
  ];
}
