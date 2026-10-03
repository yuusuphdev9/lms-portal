import type { CourseProgress, LessonProgress } from '@/types'
import { currentUser } from './users'

export const lessonProgress: LessonProgress[] = [
  {
    lessonId: 'lesson-1',
    courseId: 'course-1',
    userId: currentUser.id,
    status: 'completed',
    progressPercent: 100,
    lastPositionSeconds: 720,
    completedAt: '2026-08-20T10:20:00.000Z',
    updatedAt: '2026-08-20T10:20:00.000Z',
  },
  {
    lessonId: 'lesson-2',
    courseId: 'course-1',
    userId: currentUser.id,
    status: 'completed',
    progressPercent: 100,
    completedAt: '2026-08-21T08:50:00.000Z',
    updatedAt: '2026-08-21T08:50:00.000Z',
  },
  {
    lessonId: 'lesson-3',
    courseId: 'course-1',
    userId: currentUser.id,
    status: 'in-progress',
    progressPercent: 0,
    updatedAt: '2026-08-21T09:00:00.000Z',
  },
  {
    lessonId: 'lesson-6',
    courseId: 'course-2',
    userId: currentUser.id,
    status: 'in-progress',
    progressPercent: 45,
    lastPositionSeconds: 405,
    updatedAt: '2026-09-10T14:10:00.000Z',
  },
]

export const courseProgress: CourseProgress[] = [
  {
    courseId: 'course-1',
    userId: currentUser.id,
    completedLessonIds: ['lesson-1', 'lesson-2'],
    totalLessons: 5,
    percentComplete: 40,
    lastAccessedLessonId: 'lesson-3',
    startedAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-21T09:00:00.000Z',
  },
  {
    courseId: 'course-2',
    userId: currentUser.id,
    completedLessonIds: [],
    totalLessons: 5,
    percentComplete: 9,
    lastAccessedLessonId: 'lesson-6',
    startedAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-10T14:10:00.000Z',
  },
]
