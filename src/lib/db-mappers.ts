/**
 * Supabase returns snake_case rows matching the SQL schema in `sql/001_schema_and_rls.sql`.
 * Every function here maps one table's row shape to the camelCase domain type in `@/types`,
 * so every feature's `api.ts` stays the one place that talks to Supabase and nothing else in
 * the app has to know the database's column names.
 *
 * The client in `@/lib/supabase` has no `Database` generic (see that file for why), so a
 * bare `await supabase.from(...).select(...)` resolves to `any`. `Result<T>` is the fix every
 * `api.ts` call site uses: casting the awaited response to `Result<SomeRow[]>` (or `Result<SomeRow>`
 * for `.single()`) before destructuring `data`/`error` out of it, so neither one is ever `any`.
 */
import type { PostgrestError } from '@supabase/supabase-js'
import type { ConfidenceLevel, Course, CourseProgress, Lesson, LessonProgress, Module, Note, Question, Quiz, QuizAttempt, Resource } from '@/types'

export interface Result<T> { data: T | null; error: PostgrestError | null }

/** Narrows a `.single()` result's `data` from `T | null` to `T`, after its `error` has
 *  already been checked — `.single()` returns a null `data` with no error only when the
 *  row genuinely doesn't exist (e.g. a stale id), which is worth its own clear message. */
export function assertFound<T>(data: T | null, what: string): T {
  if (!data) throw new Error(`${what} not found.`)
  return data
}

export interface CourseRow {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url: string | null
  instructor_name: string
  tags: string[] | null
  level: Course['level']
  status: Course['status']
  estimated_duration_minutes: number
  created_at: string
  updated_at: string
}

export interface ModuleRow {
  id: string
  course_id: string
  title: string
  order_index: number
}

export interface LessonRow {
  id: string
  module_id: string
  course_id: string
  title: string
  order_index: number
  type: Lesson['type']
  duration_minutes: number
  is_preview: boolean | null
  video_url: string | null
  captions_url: string | null
  transcript: string | null
  content: string | null
  estimated_read_minutes: number | null
  quiz_id: string | null
  instructions: string | null
  resource_ids: string[] | null
}

export interface QuizRow {
  id: string
  course_id: string
  lesson_id: string | null
  title: string
  description: string | null
  passing_score_percent: number
  time_limit_minutes: number | null
  allow_retakes: boolean
  shuffle_questions: boolean | null
}

export interface QuestionRow {
  id: string
  quiz_id: string
  type: Question['type']
  prompt: string
  order_index: number
  points: number
  explanation: string | null
  /**
   * Every field a question type needs beyond id/type/prompt/order/points/explanation
   * (options, correctOptionId, pairs, blanks, …) — already camelCase, matching the
   * corresponding member of the `Question` union exactly, so this is a plain spread.
   */
  payload: Record<string, unknown>
}

export interface QuizAttemptRow {
  id: string
  quiz_id: string
  user_id: string
  answers: QuizAttempt['answers'] | null
  confidences: Record<string, ConfidenceLevel> | null
  status: QuizAttempt['status']
  started_at: string
  submitted_at: string | null
  score_percent: number | null
  passed: boolean | null
}

export interface ResourceRow {
  id: string
  title: string
  description: string | null
  file_type: Resource['fileType']
  file_url: string
  file_size_bytes: number | null
  course_id: string | null
  module_id: string | null
  lesson_id: string | null
  tags: string[] | null
  uploaded_by: string | null
  uploaded_at: string
  download_count: number
}

export interface NoteRow {
  id: string
  user_id: string
  course_id: string
  lesson_id: string | null
  content: string
  is_bookmarked: boolean
  timestamp_seconds: number | null
  color_tag: string | null
  created_at: string
  updated_at: string
}

export interface LessonProgressRow {
  lesson_id: string
  course_id: string
  user_id: string
  status: LessonProgress['status']
  progress_percent: number
  last_position_seconds: number | null
  completed_at: string | null
  updated_at: string
}

export interface CourseProgressRow {
  course_id: string
  user_id: string
  completed_lesson_ids: string[] | null
  total_lessons: number
  percent_complete: number
  last_accessed_lesson_id: string | null
  started_at: string
  updated_at: string
}

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    ...(row.thumbnail_url && { thumbnailUrl: row.thumbnail_url }),
    instructorName: row.instructor_name,
    tags: row.tags ?? [],
    level: row.level,
    status: row.status,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapModule(row: ModuleRow): Module {
  return { id: row.id, courseId: row.course_id, title: row.title, order: row.order_index }
}

export function mapLesson(row: LessonRow): Lesson {
  const base = {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    title: row.title,
    order: row.order_index,
    durationMinutes: row.duration_minutes,
    ...(row.is_preview && { isPreview: row.is_preview }),
  }

  if (row.type === 'video') {
    return {
      ...base,
      type: 'video',
      videoUrl: row.video_url ?? '',
      ...(row.captions_url && { captionsUrl: row.captions_url }),
      ...(row.transcript && { transcript: row.transcript }),
    }
  }
  if (row.type === 'article') {
    return {
      ...base,
      type: 'article',
      content: row.content ?? '',
      estimatedReadMinutes: row.estimated_read_minutes ?? 0,
    }
  }
  if (row.type === 'quiz') {
    return { ...base, type: 'quiz', quizId: row.quiz_id ?? '' }
  }
  return {
    ...base,
    type: 'assignment',
    instructions: row.instructions ?? '',
    resourceIds: row.resource_ids ?? [],
  }
}

export function mapQuiz(row: QuizRow, questions: Question[]): Quiz {
  return {
    id: row.id,
    courseId: row.course_id,
    ...(row.lesson_id && { lessonId: row.lesson_id }),
    title: row.title,
    ...(row.description && { description: row.description }),
    questions,
    passingScorePercent: row.passing_score_percent,
    ...(row.time_limit_minutes != null && { timeLimitMinutes: row.time_limit_minutes }),
    allowRetakes: row.allow_retakes,
    ...(row.shuffle_questions && { shuffleQuestions: row.shuffle_questions }),
  }
}

export function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    quizId: row.quiz_id,
    type: row.type,
    prompt: row.prompt,
    order: row.order_index,
    points: row.points,
    ...(row.explanation && { explanation: row.explanation }),
    // The type-specific fields (options, correctOptionId, pairs, blanks, …) already live
    // in `payload` as camelCase, matching the corresponding member of the `Question` union
    // exactly — this is what makes the spread below a plain, lossless merge.
    ...row.payload,
  } as Question
}

export function mapQuizAttempt(row: QuizAttemptRow): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    userId: row.user_id,
    answers: (row.answers ?? []),
    ...(row.confidences && Object.keys(row.confidences).length > 0 && { confidences: row.confidences }),
    status: row.status,
    startedAt: row.started_at,
    ...(row.submitted_at && { submittedAt: row.submitted_at }),
    ...(row.score_percent != null && { scorePercent: row.score_percent }),
    ...(row.passed != null && { passed: row.passed }),
  }
}

export function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    ...(row.description && { description: row.description }),
    fileType: row.file_type,
    fileUrl: row.file_url,
    ...(row.file_size_bytes != null && { fileSizeBytes: row.file_size_bytes }),
    ...(row.course_id && { courseId: row.course_id }),
    ...(row.module_id && { moduleId: row.module_id }),
    ...(row.lesson_id && { lessonId: row.lesson_id }),
    ...(row.tags && row.tags.length > 0 && { tags: row.tags }),
    ...(row.uploaded_by && { uploadedBy: row.uploaded_by }),
    uploadedAt: row.uploaded_at,
    downloadCount: row.download_count,
  }
}

export function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    ...(row.lesson_id && { lessonId: row.lesson_id }),
    content: row.content,
    isBookmarked: row.is_bookmarked,
    ...(row.timestamp_seconds != null && { timestampSeconds: row.timestamp_seconds }),
    ...(row.color_tag && { colorTag: row.color_tag }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLessonProgress(row: LessonProgressRow): LessonProgress {
  return {
    lessonId: row.lesson_id,
    courseId: row.course_id,
    userId: row.user_id,
    status: row.status,
    progressPercent: row.progress_percent,
    ...(row.last_position_seconds != null && { lastPositionSeconds: row.last_position_seconds }),
    ...(row.completed_at && { completedAt: row.completed_at }),
    updatedAt: row.updated_at,
  }
}

export function mapCourseProgress(row: CourseProgressRow): CourseProgress {
  return {
    courseId: row.course_id,
    userId: row.user_id,
    completedLessonIds: row.completed_lesson_ids ?? [],
    totalLessons: row.total_lessons,
    percentComplete: row.percent_complete,
    ...(row.last_accessed_lesson_id && { lastAccessedLessonId: row.last_accessed_lesson_id }),
    startedAt: row.started_at,
    updatedAt: row.updated_at,
  }
}
