# Manassa — Reusable Independent Teacher Online Course Platform

A modular, single-teacher online education platform built with **React 19, Vite 6, JavaScript (ES6+), React Router v7, Tailwind CSS v3, Zustand, Formik + Yup, Lucide React, and Supabase**.

> **Architecture Model:** Single-Client-Per-Deployment (NOT a multi-tenant SaaS). Every teacher client receives an independent copy of this repository, customized branding, and a dedicated Supabase backend project.

---

## Step-by-Step Guide: Initializing a New Independent Teacher Deployment

### 1. Copy the Master Project
Clone or copy the master project folder into a dedicated repository for the new teacher client:
```bash
cp -R Manassa teacher-academy-client
cd teacher-academy-client
npm install
```

### 2. Update the Client’s Static Branding Baseline
Open `src/config/site.config.js` and configure the teacher's baseline identity:
- `teacherName`, `teacherTitle`, `academyName`, `tagline`, and `description`.
- Replace `/public/logo.svg` and `/public/favicon.svg` (or set `branding.logoPath`, `branding.faviconPath`, and `branding.coverImagePath`).
- Update `theme.colors` hex tokens (`primary`, `primaryHover`, `dark`, `accent`, `secondary`, `background`, `surface`, `text`, `textMuted`, `border`).
- Update `contact` (`email`, `phone`, `whatsapp`, `supportHours`), `socials`, and `localization` (`currency`, `locale`, `direction`).
- Update `src/config/payment.config.js` with the teacher's manual transfer methods (e.g., Vodafone Cash number, InstaPay address).

### 3. Configure the Client’s Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with the teacher's public configuration only:
```env
VITE_SUPABASE_URL=https://your-teacher-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key-here
VITE_PUBLIC_SITE_URL=https://academy.teacher-domain.com
VITE_VIDEO_PROVIDER=external_signed
```
- **Security Rule:** Never place Supabase `service_role` keys or video provider secret keys inside `.env` or `VITE_` variables.

### 4. Connect the Client’s Dedicated Supabase Project
Create a new, isolated Supabase project for the teacher client in the Supabase Dashboard and copy its Project URL and `anon` public key into `.env`.

### 5. Apply the Required Database Migrations
Open the Supabase SQL Editor (or run via Supabase CLI) and execute:
- `supabase/migrations/001_initial_academy_schema.sql`

This migration provisions:
- `profiles`, `site_settings`, `courses`, `course_sections`, `lessons`, `orders`, `enrollments`, `lesson_progress`, and `notifications`.
- Row-Level Security (RLS) policies on all tables.
- The transactional `review_manual_order` RPC function (`SECURITY DEFINER`) for race-safe manual order approval, course entitlement creation, and student notifications.

### 6. Configure Storage Buckets and RLS
In Supabase Storage, create the following buckets:
1. `course-thumbnails` (Public read, Teacher write via `public.is_teacher()`).
2. `payment-receipts` (**Private** bucket: Students can upload to their own folder `auth.uid()/*`; only the student owner and `public.is_teacher()` can read via signed URLs).

### 7. Configure the Video Provider (When Implemented)
Implement a Supabase Edge Function that verifies `public.enrollments` for `auth.uid()` before generating short-lived signed playback URLs from the teacher's video host (Bunny Stream, Cloudflare Stream, Vimeo, or Mux), and connect its endpoint in `src/services/video/video.service.js`.

### 8. Build and Deploy the Website
Validate linting and production build before deploying to Vercel, Netlify, or Cloudflare Pages:
```bash
npm run lint
npm run build
```

### 9. Verify Instance Independence
Confirm that:
- `VITE_SUPABASE_URL` points exclusively to the new teacher's Supabase project.
- Runtime branding updates in `/teacher/settings` write only to that teacher's `public.site_settings` table.
- No cross-client database, storage bucket, or session state is shared with any other deployment.
