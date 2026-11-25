-- =============================================================================
-- Adds two things on top of 001-003:
--   1. Confidence ratings stored alongside each quiz attempt's answers.
--   2. A lightweight spaced-repetition review queue for missed questions.
-- Run once in the Supabase SQL Editor (Project zjgpkhpkxzxwyumrhmod → SQL
-- Editor → New query → paste this whole file → Run).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Confidence ratings — one 'low' | 'medium' | 'high' entry per question id
--    a student rated, submitted alongside the attempt's answers. Rating is
--    optional per question, so this can be an empty object.
-- -----------------------------------------------------------------------------
alter table public.quiz_attempts
  add column confidences jsonb not null default '{}'::jsonb;

-- -----------------------------------------------------------------------------
-- 2. Spaced-repetition review queue. A row only exists for a question once a
--    student has gotten it wrong at least once; it then climbs a fixed
--    interval ladder (1 day -> 3 days -> 7 days, see
--    src/features/quizzes/review-schedule.ts) each time they answer it
--    correctly again — in a later quiz attempt, or from the Review page — and
--    is marked resolved once it clears the last rung. A wrong answer at any
--    stage resets it back to stage 0, due again tomorrow.
-- -----------------------------------------------------------------------------
create table public.question_reviews (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  stage integer not null default 0,
  resolved boolean not null default false,
  next_review_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_reviews enable row level security;

-- Same per-user pattern as quiz_attempts/notes/lesson_progress: a student can
-- only ever see or change their own review rows.
create policy "question_reviews_own" on public.question_reviews
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
