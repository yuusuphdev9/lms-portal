/**
 * Progress tracking domain types, at both the lesson and course level.
 */

export type LessonProgressStatus = 'not-started' | 'in-progress' | 'completed'

export interface LessonProgress {
  lessonId: string
  courseId: string
  userId: string
  status: LessonProgressStatus
  progressPercent: number
  /** Last playhead position, in seconds — video lessons only. */
  lastPositionSeconds?: number
  completedAt?: string
  updatedAt: string
}

export interface CourseProgress {
  courseId: string
  userId: string
  completedLessonIds: string[]
  totalLessons: number
  percentComplete: number
  lastAccessedLessonId?: string
  startedAt: string
  updatedAt: string
}
