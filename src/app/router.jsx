import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { TeacherLayout } from './layouts/TeacherLayout';

import { RouteGuard } from '../components/shared/RouteGuard';
import { NotFoundPage } from '../components/shared/NotFoundPage';

import { HomePage } from '../features/courses/pages/HomePage';
import { CourseCatalogPage } from '../features/courses/pages/CourseCatalogPage';
import { CourseDetailsPage } from '../features/courses/pages/CourseDetailsPage';
import { StudentCoursesPage } from '../features/courses/pages/StudentCoursesPage';
import { TeacherCoursesPage } from '../features/courses/pages/TeacherCoursesPage';
import { TeacherCourseCreatePage } from '../features/courses/pages/TeacherCourseCreatePage';
import { TeacherCourseEditPage } from '../features/courses/pages/TeacherCourseEditPage';
import { TeacherCourseCurriculumPage } from '../features/courses/pages/TeacherCourseCurriculumPage';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';

import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { TeacherDashboardPage } from '../features/dashboard/pages/TeacherDashboardPage';

import { StudentOrdersPage } from '../features/orders/pages/StudentOrdersPage';
import { TeacherOrdersPage } from '../features/orders/pages/TeacherOrdersPage';
import { CheckoutPage } from '../features/orders/pages/CheckoutPage';

import { StudentProfilePage } from '../features/students/pages/StudentProfilePage';
import { TeacherStudentsPage } from '../features/students/pages/TeacherStudentsPage';

import { LessonPlayerPage } from '../features/learning/pages/LessonPlayerPage';

import { TeacherSettingsPage } from '../features/settings/pages/TeacherSettingsPage';
import { AboutPage } from '../features/settings/pages/AboutPage';
import { ContactPage } from '../features/settings/pages/ContactPage';
import { TermsPage } from '../features/settings/pages/TermsPage';
import { PrivacyPage } from '../features/settings/pages/PrivacyPage';

import { ROLES } from '../constants/roles';

/**
 * Centralized Application Router (`src/app/router.jsx`).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Student Routes */}
        <Route
          element={
            <RouteGuard
              allowedRoles={[ROLES.STUDENT]}
              sectionLabel="بوابة الطالب"
            />
          }
        >
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/orders" element={<StudentOrdersPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route
              path="/learn/:courseId/:lessonId"
              element={<LessonPlayerPage />}
            />
            <Route path="/checkout/:courseId" element={<CheckoutPage />} />
          </Route>
        </Route>

        {/* Protected Teacher Routes */}
        <Route
          element={
            <RouteGuard
              allowedRoles={[ROLES.TEACHER]}
              sectionLabel="لوحة إدارة المعلم"
            />
          }
        >
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
            <Route
              path="/teacher/courses/new"
              element={<TeacherCourseCreatePage />}
            />
            <Route
              path="/teacher/courses/:id/edit"
              element={<TeacherCourseEditPage />}
            />
            <Route
              path="/teacher/courses/:id/curriculum"
              element={<TeacherCourseCurriculumPage />}
            />
            <Route path="/teacher/students" element={<TeacherStudentsPage />} />
            <Route path="/teacher/orders" element={<TeacherOrdersPage />} />
            <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback 404 Not Found Route */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
