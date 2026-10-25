-- =============================================================================
-- Manassa Single-Teacher Academy Platform — Initial Schema, RLS & RPC Migration
-- Architecture: Independent Single-Client Deployment (NOT Multi-Tenant SaaS)
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text default '',
  role text not null default 'student' check (role in ('student', 'teacher')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper function to check if current user is the authorized teacher
create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'teacher'
  );
$$;

-- 2. RUNTIME SITE SETTINGS TABLE (Single-row table id = 1 for teacher runtime overrides)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  academy_name text not null default 'منصة الأستاذ التعليمية',
  teacher_name text not null default 'أ. محمد عبد الرحمن',
  teacher_title text not null default 'خبير تدريس المناهج التعليمية والدورات المسجلة',
  tagline text not null default 'تعليم منهجي واضح عبر دورات مسجلة عالية الجودة ومتابعة مستمرة.',
  description text not null default 'منصة تعليمية مخصصة لتقديم الدورات المسجلة والمحتوى الدراسي المنظم للطلاب بسهولة وأمان.',
  logo_url text default '/logo.svg',
  favicon_url text default '/favicon.svg',
  cover_image_url text default '',
  primary_color text not null default '#173F35',
  primary_hover_color text not null default '#245747',
  dark_color text not null default '#0D332B',
  accent_color text not null default '#D5E8DD',
  secondary_color text not null default '#245747',
  background_color text not null default '#F7F8F4',
  surface_color text not null default '#FFFFFF',
  text_color text not null default '#202923',
  text_muted_color text not null default '#66756C',
  border_color text not null default '#DDE5DC',
  contact_email text default 'support@teacher-platform.example.com',
  contact_phone text default '+20 100 000 0000',
  whatsapp_number text default '+201000000000',
  support_hours text default 'السبت - الخميس، 10:00 صباحاً إلى 8:00 مساءً',
  default_currency text not null default 'EGP',
  currency_symbol text not null default 'ج.م',
  default_locale text not null default 'ar',
  default_direction text not null default 'rtl' check (default_direction in ('rtl', 'ltr')),
  social_links jsonb not null default '{"youtube":"","facebook":"","telegram":"","instagram":""}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 3. COURSES TABLE
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  full_description text not null default '',
  category text not null default 'general',
  thumbnail_url text default '',
  price numeric(10, 2) not null default 0 check (price >= 0),
  currency text not null default 'EGP',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_slug on public.courses(slug);

-- 4. COURSE SECTIONS TABLE
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_sections_course_order on public.course_sections(course_id, sort_order);

-- 5. LESSONS TABLE
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid not null references public.course_sections(id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  is_preview boolean not null default false,
  is_published boolean not null default true,
  video_provider text default 'external_signed',
  video_reference text default '',
  attachment_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lessons_section_order on public.lessons(section_id, sort_order);
create index if not exists idx_lessons_course on public.lessons(course_id);

-- 6. ORDERS TABLE (Manual Payment & Verification Workflow)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique default ('ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  student_id uuid not null references public.profiles(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'EGP',
  payment_method text not null,
  sender_identifier text not null default '',
  transaction_reference text not null,
  receipt_path text default '',
  notes text default '',
  status text not null default 'pending_review' check (
    status in ('pending_payment', 'pending_review', 'approved', 'rejected', 'cancelled')
  ),
  rejection_reason text default '',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_student on public.orders(student_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status, created_at desc);
create index if not exists idx_orders_course on public.orders(course_id);

-- 7. ENTITLEMENTS / ENROLLMENTS TABLE
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  last_accessed_lesson_id uuid references public.lessons(id) on delete set null,
  last_accessed_at timestamptz,
  granted_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);

-- 8. LESSON PROGRESS TABLE
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index if not exists idx_lesson_progress_student_course on public.lesson_progress(student_id, course_id);

-- 9. IN-APP NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title_ar text not null,
  title_en text not null,
  body_ar text not null default '',
  body_en text not null default '',
  link_path text default '',
  dedupe_key text unique,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient_unread on public.notifications(recipient_id, is_read, created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users read/update own profile; teacher can read all student profiles
create policy "profiles_select_own_or_teacher" on public.profiles
  for select using (auth.uid() = id or public.is_teacher());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Site Settings: anyone can read; only teacher can insert/update
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_teacher_write" on public.site_settings
  for all using (public.is_teacher())
  with check (public.is_teacher());

-- Courses: public can read published courses; teacher can manage all courses
create policy "courses_public_read_published" on public.courses
  for select using (status = 'published' or public.is_teacher());

create policy "courses_teacher_all" on public.courses
  for all using (public.is_teacher())
  with check (public.is_teacher());

-- Course Sections: readable if course is published or user is teacher/enrolled
create policy "sections_read" on public.course_sections
  for select using (
    public.is_teacher() or exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id and c.status = 'published'
    )
  );

create policy "sections_teacher_write" on public.course_sections
  for all using (public.is_teacher())
  with check (public.is_teacher());

-- Lessons: metadata readable for published courses; teacher manages all
create policy "lessons_read" on public.lessons
  for select using (
    public.is_teacher() or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.status = 'published'
    )
  );

create policy "lessons_teacher_write" on public.lessons
  for all using (public.is_teacher())
  with check (public.is_teacher());

-- Orders: students read/insert own orders; teacher reads all orders
create policy "orders_select_own_or_teacher" on public.orders
  for select using (student_id = auth.uid() or public.is_teacher());

create policy "orders_insert_student_own" on public.orders
  for insert with check (
    student_id = auth.uid()
    and status in ('pending_payment', 'pending_review')
  );

-- Enrollments: students read own enrollments; teacher reads all. Direct client inserts blocked (managed via RPC)
create policy "enrollments_select_own_or_teacher" on public.enrollments
  for select using (student_id = auth.uid() or public.is_teacher());

create policy "enrollments_update_last_accessed_own" on public.enrollments
  for update using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Lesson Progress: students read/write only their own progress for enrolled courses
create policy "lesson_progress_select_own_or_teacher" on public.lesson_progress
  for select using (student_id = auth.uid() or public.is_teacher());

create policy "lesson_progress_write_own_enrolled" on public.lesson_progress
  for all using (
    student_id = auth.uid() and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid() and e.course_id = lesson_progress.course_id
    )
  )
  with check (
    student_id = auth.uid() and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid() and e.course_id = lesson_progress.course_id
    )
  );

-- Notifications: users read and mark-as-read only their own notifications
create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- =============================================================================
-- TRUSTED BACKEND RPC FUNCTIONS (Transactional Order Approval & Analytics)
-- =============================================================================

create or replace function public.review_manual_order(
  p_order_id uuid,
  p_decision text,
  p_rejection_reason text default ''
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_course_title text;
begin
  if not public.is_teacher() then
    raise exception 'UNAUTHORIZED: Only the authorized teacher can review payment orders.';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'INVALID_DECISION: Decision must be approved or rejected.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND: Order does not exist.';
  end if;

  if v_order.status = 'approved' and p_decision = 'approved' then
    return v_order; -- Idempotent safe return
  end if;

  update public.orders
  set status = p_decision,
      rejection_reason = case when p_decision = 'rejected' then coalesce(p_rejection_reason, '') else '' end,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = p_order_id
  returning * into v_order;

  select title into v_course_title from public.courses where id = v_order.course_id;

  if p_decision = 'approved' then
    insert into public.enrollments (student_id, course_id, order_id, granted_at)
    values (v_order.student_id, v_order.course_id, v_order.id, now())
    on conflict (student_id, course_id)
    do update set order_id = excluded.order_id;

    insert into public.notifications (
      recipient_id, type, title_ar, title_en, body_ar, body_en, link_path, dedupe_key
    ) values (
      v_order.student_id,
      'order_approved',
      'تم اعتماد طلب اشتراكك وتفعيل الدورة',
      'Your payment was approved and course access granted',
      'تم تفعيل اشتراكك في دورة: ' || coalesce(v_course_title, ''),
      'Access granted for course: ' || coalesce(v_course_title, ''),
      '/student/courses',
      'order_approved_' || v_order.id::text
    ) on conflict (dedupe_key) do nothing;
  else
    insert into public.notifications (
      recipient_id, type, title_ar, title_en, body_ar, body_en, link_path, dedupe_key
    ) values (
      v_order.student_id,
      'order_rejected',
      'تعذر اعتماد طلب الدفع للطلب ' || v_order.order_reference,
      'Payment review update for order ' || v_order.order_reference,
      'السبب: ' || coalesce(nullif(p_rejection_reason, ''), 'يرجى مراجعة بيانات الإيصال'),
      'Reason: ' || coalesce(nullif(p_rejection_reason, ''), 'Please verify your receipt details'),
      '/student/orders',
      'order_rejected_' || v_order.id::text || '_' || extract(epoch from now())::bigint::text
    ) on conflict (dedupe_key) do nothing;
  end if;

  return v_order;
end;
$$;
