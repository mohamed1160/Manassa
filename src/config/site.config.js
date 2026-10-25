/**
 * Single Source of Truth for Developer-Managed Client Branding & Configuration.
 *
 * ARCHITECTURAL DISTINCTION:
 * - This file (`src/config/site.config.js`) defines the build-time baseline configuration
 *   customized by the developer when initializing a new teacher's codebase copy.
 * - Runtime overrides modified by the teacher in `/teacher/settings` are persisted in
 *   the Supabase `public.site_settings` table (row `id = 1`, protected by RLS) and merged
 *   safely at runtime via `src/stores/branding.store.js`.
 */

const env = import.meta.env || {};

export const siteConfig = {
  publicSiteUrl: env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173',
  teacherName: env.VITE_TEACHER_NAME || 'أ. محمد عبد الرحمن',
  teacherTitle: 'خبير تدريس المناهج التعليمية والدورات المسجلة',
  academyName: env.VITE_SITE_NAME || 'منصة الأستاذ التعليمية',
  tagline: 'تعليم منهجي واضح عبر دورات مسجلة عالية الجودة ومتابعة مستمرة.',
  description:
    'منصة تعليمية مخصصة لتقديم الدورات المسجلة والمحتوى الدراسي المنظم للطلاب بسهولة وأمان.',

  branding: {
    logoPath: '/logo.svg',
    faviconPath: '/favicon.svg',
    coverImagePath: '',
  },

  theme: {
    colors: {
      primary: '#173F35', // Primary — الأخضر الأساسي
      primaryHover: '#245747', // Primary Hover — الأخضر الداكن
      dark: '#0D332B', // Dark Green — أخضر عميق
      accent: '#D5E8DD', // Accent — الأخضر الفاتح
      secondary: '#245747', // Secondary color
      background: '#F7F8F4', // Background — أوف وايت
      surface: '#FFFFFF', // Surface — أبيض
      text: '#202923', // Text Primary — النص الأساسي
      textMuted: '#66756C', // Text Secondary — النص الثانوي
      border: '#DDE5DC', // Border — الحدود
    },
  },

  contact: {
    email: env.VITE_SUPPORT_EMAIL || 'support@teacher-platform.example.com',
    phone: '+20 100 000 0000',
    whatsapp: env.VITE_WHATSAPP_NUMBER || '+201000000000',
    supportHours: 'السبت - الخميس، 10:00 صباحاً إلى 8:00 مساءً',
  },

  localization: {
    currency: 'EGP',
    currencySymbol: 'ج.م',
    locale: 'ar',
    direction: 'rtl', // 'rtl' | 'ltr'
  },

  socials: {
    youtube: 'https://youtube.com',
    facebook: 'https://facebook.com',
    telegram: 'https://t.me',
    instagram: '',
  },

  video: {
    provider: env.VITE_VIDEO_PROVIDER || 'external_signed',
    libraryId: env.VITE_VIDEO_LIBRARY_ID || '',
  },
};

export default siteConfig;
