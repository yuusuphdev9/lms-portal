-- =============================================================================
-- LMS Student Portal — seed content: "Front-End Web Development"
-- =============================================================================
-- Run this AFTER 001_schema_and_rls.sql succeeds. It replaces the old
-- Botany/Electronics placeholder catalog with one real course — HTML, CSS,
-- JavaScript and React, one module per technology — covering the same shape
-- the app already expects: 4 modules, 10 lessons, 2 quizzes, 4 resources.
-- Safe to re-run: it deletes any rows it previously inserted for this course
-- (matched by slug) before recreating them.
-- =============================================================================

delete from public.courses where slug = 'front-end-web-development';

do $$
declare
  v_course_id uuid := gen_random_uuid();
  v_module_html uuid := gen_random_uuid();
  v_module_css uuid := gen_random_uuid();
  v_module_js uuid := gen_random_uuid();
  v_module_react uuid := gen_random_uuid();

  v_lesson_1 uuid := gen_random_uuid(); -- HTML video
  v_lesson_2 uuid := gen_random_uuid(); -- HTML article
  v_lesson_3 uuid := gen_random_uuid(); -- HTML quiz
  v_lesson_4 uuid := gen_random_uuid(); -- CSS video
  v_lesson_5 uuid := gen_random_uuid(); -- CSS assignment
  v_lesson_6 uuid := gen_random_uuid(); -- JS video
  v_lesson_7 uuid := gen_random_uuid(); -- JS article
  v_lesson_8 uuid := gen_random_uuid(); -- JS quiz
  v_lesson_9 uuid := gen_random_uuid(); -- React video
  v_lesson_10 uuid := gen_random_uuid(); -- React assignment

  v_quiz_html uuid := gen_random_uuid();
  v_quiz_js uuid := gen_random_uuid();

  v_resource_1 uuid := gen_random_uuid();
  v_resource_2 uuid := gen_random_uuid();
  v_resource_3 uuid := gen_random_uuid();
  v_resource_4 uuid := gen_random_uuid();
begin
  insert into public.courses (id, slug, title, description, instructor_name, tags, level, status, estimated_duration_minutes)
  values (
    v_course_id,
    'front-end-web-development',
    'Front-End Web Development',
    'A hands-on path through the four technologies behind every website you''ve ever used: semantic HTML, CSS layout, core JavaScript, and building interactive UIs with React.',
    'Staff',
    array['html', 'css', 'javascript', 'react'],
    'beginner',
    'published',
    154
  );

  insert into public.modules (id, course_id, title, order_index) values
    (v_module_html, v_course_id, 'HTML Foundations', 1),
    (v_module_css, v_course_id, 'CSS & Layout', 2),
    (v_module_js, v_course_id, 'JavaScript Essentials', 3),
    (v_module_react, v_course_id, 'React Fundamentals', 4);

  -- ---------------------------------------------------------------------------
  -- Module 1: HTML Foundations
  -- ---------------------------------------------------------------------------
  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, is_preview, video_url, transcript)
  values (
    v_lesson_1, v_module_html, v_course_id, 'Semantic HTML & Document Structure', 1, 'video', 12, true,
    'https://example.com/videos/semantic-html-document-structure.mp4',
    'In this lesson we walk through why <header>, <nav>, <main>, <section>, <article>, and <footer> exist as distinct elements instead of just reaching for <div> everywhere — screen readers and search engines both use this structure to understand a page, not just its visual layout.'
  );

  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, content, estimated_read_minutes)
  values (
    v_lesson_2, v_module_html, v_course_id, 'Forms, Inputs & Accessibility Basics', 2, 'article', 10,
    '## Forms, Inputs & Accessibility Basics' || chr(10) || chr(10) ||
    'Every form control needs a `<label>` associated with it — either by wrapping the input, or by matching the label''s `for` attribute to the input''s `id`. Without this, a screen reader user has no idea what a text box is asking for, and clicking the label text won''t focus the input either.' || chr(10) || chr(10) ||
    'Use the input `type` that matches the data you''re collecting (`email`, `tel`, `number`, `date`, …) — browsers validate the format for you and mobile devices show the right keyboard automatically. `required` and `aria-describedby` (pointing at a hint or error message''s `id`) cover most of what a basic accessible form needs beyond that.' || chr(10) || chr(10) ||
    'Images that convey information need descriptive `alt` text; purely decorative images should use `alt=""` so screen readers skip over them instead of reading a meaningless filename out loud.',
    10
  );

  -- quiz_id is filled in by an UPDATE further down, after the quiz row exists — lessons.quiz_id
  -- and quizzes.lesson_id reference each other, so one side has to be inserted first as null.
  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes)
  values (v_lesson_3, v_module_html, v_course_id, 'Module Check: HTML Foundations', 3, 'quiz', 10);

  -- ---------------------------------------------------------------------------
  -- Module 2: CSS & Layout
  -- ---------------------------------------------------------------------------
  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, video_url, transcript)
  values (
    v_lesson_4, v_module_css, v_course_id, 'The Box Model & Flexbox', 1, 'video', 14,
    'https://example.com/videos/box-model-flexbox.mp4',
    'Every element is a box: content, padding, border, then margin, stacking outward. We set `box-sizing: border-box` so padding and border count toward the width you specify instead of adding to it, then move into Flexbox — `display: flex`, main-axis vs cross-axis, and how `justify-content` and `align-items` take over the positioning work `float` used to do badly.'
  );

  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, instructions, resource_ids)
  values (
    v_lesson_5, v_module_css, v_course_id, 'Build a Responsive Card Layout', 2, 'assignment', 30,
    'Using Flexbox or CSS Grid, build a 3-column card layout that collapses to a single column below 640px width. Each card needs an image, a title, and a short description. Start from the template in the linked resource below, and use a media query for the breakpoint rather than JavaScript.',
    array[v_resource_1]
  );

  -- ---------------------------------------------------------------------------
  -- Module 3: JavaScript Essentials
  -- ---------------------------------------------------------------------------
  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, is_preview, video_url, transcript)
  values (
    v_lesson_6, v_module_js, v_course_id, 'Variables, Functions & Scope', 1, 'video', 15, true,
    'https://example.com/videos/variables-functions-scope.mp4',
    '`let` and `const` are block-scoped — they only exist inside the `{ }` they''re declared in — while `var` is function-scoped and can cause confusing bugs inside loops and conditionals. We also cover function declarations vs. arrow functions, and why arrow functions don''t get their own `this`.'
  );

  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, content, estimated_read_minutes)
  values (
    v_lesson_7, v_module_js, v_course_id, 'Async JavaScript: Promises & Async/Await', 2, 'article', 10,
    '## Async JavaScript: Promises & Async/Await' || chr(10) || chr(10) ||
    'A `Promise` represents a value that isn''t ready yet. It''s always in one of three states: **pending**, **fulfilled** (resolved with a value), or **rejected** (failed with an error) — and once it settles into fulfilled or rejected, it stays that way.' || chr(10) || chr(10) ||
    '`async`/`await` is syntax sugar over promises: marking a function `async` lets you `await` a promise inside it, pausing that function (not the whole program) until the promise settles. Wrap the `await` in a `try`/`catch` to handle a rejection the same way you''d catch a thrown error anywhere else in JavaScript.' || chr(10) || chr(10) ||
    'A common mistake is forgetting that `await` only pauses the function it''s written in — a `.map()` callback marked `async` returns a promise per item, not one awaited result, so collecting the real results back out still needs `Promise.all(...)`.',
    10
  );

  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes)
  values (v_lesson_8, v_module_js, v_course_id, 'Module Check: JavaScript Essentials', 3, 'quiz', 12);

  -- ---------------------------------------------------------------------------
  -- Module 4: React Fundamentals
  -- ---------------------------------------------------------------------------
  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, video_url, transcript)
  values (
    v_lesson_9, v_module_react, v_course_id, 'Components, Props & State', 1, 'video', 16,
    'https://example.com/videos/components-props-state.mp4',
    'A React component is a function that returns markup. Data flows into it as `props`, which it can''t change — only the parent that passed them can. `state` (via `useState`) is different: it''s data a component owns itself, and calling its setter schedules React to re-render that component with the new value.'
  );

  insert into public.lessons (id, module_id, course_id, title, order_index, type, duration_minutes, instructions, resource_ids)
  values (
    v_lesson_10, v_module_react, v_course_id, 'Build a Todo List with useState', 2, 'assignment', 25,
    'Build a component that lets a user type a task, add it to a list by pressing Enter or clicking "Add", mark it complete by clicking it, and remove it with a delete button. Keep the list of todos in a single `useState` array — don''t reach for anything heavier than that for this exercise. Start from the template in the linked resource below.',
    array[v_resource_2]
  );

  -- ---------------------------------------------------------------------------
  -- Quiz 1: HTML Foundations
  -- ---------------------------------------------------------------------------
  insert into public.quizzes (id, course_id, lesson_id, title, description, passing_score_percent, allow_retakes)
  values (v_quiz_html, v_course_id, v_lesson_3, 'Module Check: HTML Foundations', 'Covers semantic elements, forms, and image accessibility.', 70, true);

  insert into public.questions (quiz_id, type, prompt, order_index, points, payload) values
    (v_quiz_html, 'single-choice', 'Which element is the correct semantic choice for a page''s primary navigation links?', 1, 10,
      '{"options":[{"id":"opt-1","label":"div"},{"id":"opt-2","label":"nav"},{"id":"opt-3","label":"aside"}],"correctOptionId":"opt-2"}'::jsonb),
    (v_quiz_html, 'multiple-choice', 'Which of these statements about the <img> element''s alt attribute are true? (select all that apply)', 2, 10,
      '{"options":[{"id":"opt-4","label":"alt text should describe the image''s content or function for users who can''t see it"},{"id":"opt-5","label":"An empty alt=\"\" is appropriate for a purely decorative image"},{"id":"opt-6","label":"alt is only needed when the image fails to load"},{"id":"opt-7","label":"Screen readers ignore the alt attribute"}],"correctOptionIds":["opt-4","opt-5"]}'::jsonb),
    (v_quiz_html, 'true-false', 'A <section> element should only be used when it has a meaningful heading inside it.', 3, 5,
      '{"correctAnswer":true}'::jsonb),
    (v_quiz_html, 'numeric', 'How many levels of heading element (h1 through h?) does HTML provide?', 4, 10,
      '{"correctValue":6}'::jsonb);

  update public.lessons set quiz_id = v_quiz_html where id = v_lesson_3;

  -- ---------------------------------------------------------------------------
  -- Quiz 2: JavaScript Essentials
  -- ---------------------------------------------------------------------------
  insert into public.quizzes (id, course_id, lesson_id, title, description, passing_score_percent, allow_retakes, time_limit_minutes)
  values (v_quiz_js, v_course_id, v_lesson_8, 'Module Check: JavaScript Essentials', 'Covers variable scope and async/await.', 70, true, 20);

  insert into public.questions (quiz_id, type, prompt, order_index, points, payload) values
    (v_quiz_js, 'short-text', 'What keyword declares a block-scoped variable that can be reassigned later?', 1, 10,
      '{"acceptedAnswers":["let"],"caseSensitive":false}'::jsonb),
    (v_quiz_js, 'matching', 'Match each keyword to how its binding behaves.', 2, 15,
      '{"pairs":[{"id":"pair-1","left":"var","right":"Function-scoped (or global)"},{"id":"pair-2","left":"let","right":"Block-scoped, cannot be redeclared in the same scope"},{"id":"pair-3","left":"const","right":"Block-scoped, cannot be reassigned"}]}'::jsonb),
    (v_quiz_js, 'ordering', 'Arrange the steps for safely awaiting an async operation, in order.', 3, 15,
      '{"items":[{"id":"step-1","label":"Mark the function async"},{"id":"step-2","label":"Open a try block"},{"id":"step-3","label":"Await the async operation inside the try block"},{"id":"step-4","label":"Catch and handle any error in the catch block"}],"correctOrder":["step-1","step-2","step-3","step-4"]}'::jsonb),
    (v_quiz_js, 'fill-in-blank', 'Complete the statement about Promise states.', 4, 10,
      '{"template":"A Promise can be in one of three states: {{blank-1}}, {{blank-2}}, or {{blank-3}}.","blanks":[{"id":"blank-1","acceptedAnswers":["pending"]},{"id":"blank-2","acceptedAnswers":["fulfilled","resolved"]},{"id":"blank-3","acceptedAnswers":["rejected"]}]}'::jsonb);

  update public.lessons set quiz_id = v_quiz_js where id = v_lesson_8;

  -- ---------------------------------------------------------------------------
  -- Resources
  -- ---------------------------------------------------------------------------
  insert into public.resources (id, title, description, file_type, file_url, file_size_bytes, course_id, lesson_id, tags, download_count) values
    (v_resource_1, 'Responsive Card Layout Starter Files', 'HTML/CSS starter for the card-layout assignment — unstyled markup only.', 'archive', '/mock-files/card-layout-starter.zip', 68_000, v_course_id, v_lesson_5, array['css', 'starter'], 0),
    (v_resource_2, 'React Todo List Starter', 'Starter component shell for the useState todo-list assignment.', 'archive', '/mock-files/react-todo-starter.zip', 54_000, v_course_id, v_lesson_10, array['react', 'starter'], 0);

  insert into public.resources (id, title, description, file_type, file_url, file_size_bytes, course_id, module_id, tags, download_count) values
    (v_resource_3, 'Flexbox & Grid Cheat Sheet', 'One-page reference for Flexbox and CSS Grid properties.', 'slide', '/mock-files/flexbox-grid-cheat-sheet.pdf', 420_000, v_course_id, v_module_css, array['css', 'reference'], 0),
    (v_resource_4, 'JavaScript Array & Async Methods Reference', 'Quick reference for map/filter/reduce and Promise-based async patterns.', 'pdf', '/mock-files/js-array-async-reference.pdf', 310_000, v_course_id, v_module_js, array['javascript', 'reference'], 0);
end $$;
