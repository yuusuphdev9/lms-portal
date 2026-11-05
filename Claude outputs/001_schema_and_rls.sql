-- =============================================================================
-- LMS Student Portal — Supabase schema, security policies, and triggers
-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor (Project zjgpkhpkxzxwyumrhmod → SQL
-- Editor → New query → paste this whole file → Run). It creates every table
-- the app needs, locks them down with Row Level Security so each student can
-- only ever see their own notes/progress/quiz attempts, and wires up two
-- small pieces of automation (new-signup profile creation, and course
-- progress recalculation). After this succeeds, run 002_seed_content.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles — one row per signed-up user, linked 1:1 to Supabase Auth
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  avatar_url text,
  bio text,
  institution text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Course catalog: courses → modules → lessons, plus quizzes/questions and
--    downloadable resources. instructor_name / uploaded_by are plain display
--    fields, not foreign keys — the catalog isn't owned by a real login.
-- -----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  thumbnail_url text,
  instructor_name text not null default 'Staff',
  tags text[] not null default '{}',
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  estimated_duration_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  order_index integer not null
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  order_index integer not null,
  type text not null check (type in ('video', 'article', 'quiz', 'assignment')),
  duration_minutes integer not null default 0,
  is_preview boolean not null default false,
  -- video
  video_url text,
  captions_url text,
  transcript text,
  -- article
  content text,
  estimated_read_minutes integer,
  -- quiz (fk added below, after quizzes exists)
  quiz_id uuid,
  -- assignment
  instructions text,
  resource_ids uuid[] default '{}'
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  description text,
  passing_score_percent integer not null default 70,
  time_limit_minutes integer,
  allow_retakes boolean not null default true,
  shuffle_questions boolean not null default false
);

alter table public.lessons
  add constraint lessons_quiz_id_fkey foreign key (quiz_id) references public.quizzes (id) on delete set null;

-- Every question type (single-choice, matching, ordering, fill-in-blank, …) has a
-- different extra shape. Rather than ~15 mostly-empty columns, the type-specific
-- fields live in `payload` as JSON; `id`/`type`/`prompt`/`order`/`points`/`explanation`
-- stay as real columns since every question has them.
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  type text not null check (
    type in (
      'single-choice', 'multiple-choice', 'true-false', 'short-text',
      'long-text', 'numeric', 'matching', 'ordering', 'fill-in-blank'
    )
  ),
  prompt text not null,
  order_index integer not null,
  points integer not null default 10,
  explanation text,
  payload jsonb not null default '{}'::jsonb
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_type text not null check (
    file_type in ('pdf', 'slide', 'doc', 'spreadsheet', 'archive', 'image', 'audio', 'video', 'link', 'other')
  ),
  file_url text not null,
  file_size_bytes bigint,
  course_id uuid references public.courses (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  tags text[] default '{}',
  uploaded_at timestamptz not null default now(),
  download_count integer not null default 0
);

-- -----------------------------------------------------------------------------
-- 3. Per-student data: quiz attempts, lesson/course progress, notes.
--    Every row here is owned by exactly one user_id — this is the data RLS
--    exists to protect.
-- -----------------------------------------------------------------------------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  status text not null default 'graded' check (status in ('in-progress', 'submitted', 'graded')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score_percent integer,
  passed boolean
);

create table public.lesson_progress (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'not-started' check (status in ('not-started', 'in-progress', 'completed')),
  progress_percent integer not null default 0,
  last_position_seconds integer,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

create table public.course_progress (
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_lesson_ids uuid[] not null default '{}',
  total_lessons integer not null default 0,
  percent_complete integer not null default 0,
  last_accessed_lesson_id uuid,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  content text not null,
  is_bookmarked boolean not null default false,
  timestamp_seconds integer,
  color_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Automation
-- -----------------------------------------------------------------------------

-- 4a. When someone signs up through Supabase Auth, give them a profile row
--     automatically, using the "name" they passed as signup metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4b. Whenever a lesson_progress row is written, recompute that student's
--     course_progress row for the course it belongs to (mirrors the
--     recalcCourseProgress() logic that used to live in the MSW mock handler).
create function public.recalc_course_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid := coalesce(new.course_id, old.course_id);
  v_user_id uuid := coalesce(new.user_id, old.user_id);
  v_total integer;
  v_completed uuid[];
begin
  select count(*) into v_total from public.lessons where course_id = v_course_id;

  select coalesce(array_agg(lesson_id), '{}') into v_completed
  from public.lesson_progress
  where course_id = v_course_id and user_id = v_user_id and status = 'completed';

  insert into public.course_progress (
    course_id, user_id, completed_lesson_ids, total_lessons, percent_complete,
    last_accessed_lesson_id, started_at, updated_at
  )
  values (
    v_course_id, v_user_id, v_completed, v_total,
    case when v_total > 0 then round(coalesce(array_length(v_completed, 1), 0)::numeric / v_total * 100) else 0 end,
    new.lesson_id, now(), now()
  )
  on conflict (course_id, user_id) do update set
    completed_lesson_ids = excluded.completed_lesson_ids,
    total_lessons = excluded.total_lessons,
    percent_complete = excluded.percent_complete,
    last_accessed_lesson_id = coalesce(excluded.last_accessed_lesson_id, public.course_progress.last_accessed_lesson_id),
    updated_at = now();

  return new;
end;
$$;

create trigger on_lesson_progress_change
  after insert or update on public.lesson_progress
  for each row execute procedure public.recalc_course_progress();

-- 4c. Resource download counts are incremented through this function instead
--     of a direct UPDATE grant, so a student can bump the counter without
--     also being able to rewrite a resource's title, url, etc.
create function public.increment_resource_download(resource_id uuid)
returns public.resources
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.resources;
begin
  update public.resources set download_count = download_count + 1
  where id = resource_id
  returning * into updated;
  return updated;
end;
$$;

grant execute on function public.increment_resource_download(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Row Level Security
--    Supabase projects already grant table privileges to the `authenticated`
--    role by default (ALTER DEFAULT PRIVILEGES, set up when the project was
--    created) — RLS below is what then decides which *rows* a query can see,
--    on top of that.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.resources enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_progress enable row level security;
alter table public.notes enable row level security;

-- Catalog content: any signed-in user can read it. Nothing can write to it
-- except the SQL editor (as the table owner, which bypasses RLS) — that's
-- intentional, so a student account can never edit the course catalog itself.
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "courses_select_authenticated" on public.courses
  for select to authenticated using (true);
create policy "modules_select_authenticated" on public.modules
  for select to authenticated using (true);
create policy "lessons_select_authenticated" on public.lessons
  for select to authenticated using (true);
create policy "quizzes_select_authenticated" on public.quizzes
  for select to authenticated using (true);
create policy "questions_select_authenticated" on public.questions
  for select to authenticated using (true);
create policy "resources_select_authenticated" on public.resources
  for select to authenticated using (true);

-- Per-user data: a user can only ever see or change their own rows.
create policy "quiz_attempts_own" on public.quiz_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress_own" on public.lesson_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "course_progress_own" on public.course_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_own" on public.notes
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
