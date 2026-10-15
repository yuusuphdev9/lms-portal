import type { Lesson } from '@/types'

/**
 * Quiz lessons route to the dedicated quiz-attempt flow; every other lesson
 * type renders inside the in-course lesson viewer. Centralized here so the
 * module outline, lesson viewer, and anything else linking to a lesson agree.
 */
export function lessonHref(courseId: string, lesson: Lesson): string {
  return lesson.type === 'quiz' ? `/quizzes/${lesson.quizId}` : `/courses/${courseId}/lessons/${lesson.id}`
}
