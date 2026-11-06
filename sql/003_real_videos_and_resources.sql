-- =============================================================================
-- LMS Student Portal — swap placeholder video/resource URLs for real ones
-- =============================================================================
-- Run this in the Supabase SQL Editor AFTER 001 and 002.
--
-- Part 1 (video_url): points each video lesson at a real, existing YouTube
-- video that matches its topic, embedded via the standard
-- https://www.youtube.com/embed/<id> form. No code change needed for this
-- part — the frontend (LessonPage.tsx) already knows to render that as an
-- <iframe> once the URL is in this form.
--
-- Part 2 (file_url): points each resource at a real file. These paths assume
-- you've created a PUBLIC Storage bucket named "resources" and uploaded the
-- 4 files I sent you into it, using these exact file names:
--   card-layout-starter.zip
--   react-todo-starter.zip
--   flexbox-grid-cheat-sheet.pdf
--   js-array-async-reference.pdf
-- If you used different file names or a different bucket name, edit the
-- URLs below to match before running this.
-- =============================================================================

update public.lessons
set video_url = 'https://www.youtube.com/embed/kGW8Al_cga4'
where title = 'Semantic HTML & Document Structure';
-- "HTML & CSS Crash Course Tutorial #6 - HTML5 Semantics" — The Net Ninja

update public.lessons
set video_url = 'https://www.youtube.com/embed/3YW65K6LcIA'
where title = 'The Box Model & Flexbox';
-- "Flexbox Crash Course" — Traversy Media

update public.lessons
set video_url = 'https://www.youtube.com/embed/j1laALb8OVM'
where title = 'Variables, Functions & Scope';
-- "JavaScript Functions Crash Course" — freeCodeCamp.org

update public.lessons
set video_url = 'https://www.youtube.com/embed/w7ejDZ8SWv8'
where title = 'Components, Props & State';
-- "React JS Crash Course" — Traversy Media

update public.resources
set file_url = 'https://zjgpkhpkxzxwyumrhmod.supabase.co/storage/v1/object/public/resources/card-layout-starter.zip'
where title = 'Responsive Card Layout Starter Files';

update public.resources
set file_url = 'https://zjgpkhpkxzxwyumrhmod.supabase.co/storage/v1/object/public/resources/react-todo-starter.zip'
where title = 'React Todo List Starter';

update public.resources
set file_url = 'https://zjgpkhpkxzxwyumrhmod.supabase.co/storage/v1/object/public/resources/flexbox-grid-cheat-sheet.pdf'
where title = 'Flexbox & Grid Cheat Sheet';

update public.resources
set file_url = 'https://zjgpkhpkxzxwyumrhmod.supabase.co/storage/v1/object/public/resources/js-array-async-reference.pdf'
where title = 'JavaScript Array & Async Methods Reference';
