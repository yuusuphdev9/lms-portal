import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useApiQuery } from '@/lib/use-api-query'
import type { CourseProgress, LessonProgress, LessonProgressStatus } from '@/types'

export const progressKeys = {
  courses: ['progress', 'courses'] as const,
  course: (courseId: string) => ['progress', 'courses', courseId] as const,
  lessons: (courseId?: string) => ['progress', 'lessons', courseId ?? 'all'] as const,
}

export function useCourseProgressList() {
  return useApiQuery<CourseProgress[]>(progressKeys.courses, '/api/progress/courses')
}

export function useCourseProgress(courseId: string | undefined) {
  return useApiQuery<CourseProgress>(
    progressKeys.course(courseId ?? ''),
    `/api/progress/courses/${courseId ?? ''}`,
    { enabled: Boolean(courseId), retry: false },
  )
}

export function useLessonProgressList(courseId?: string) {
  const query = courseId ? `?courseId=${courseId}` : ''
  return useApiQuery<LessonProgress[]>(progressKeys.lessons(courseId), `/api/progress/lessons${query}`)
}

interface MarkLessonProgressInput {
  lessonId: string
  status: LessonProgressStatus
  progressPercent: number
  lastPositionSeconds?: number
}

export function useMarkLessonProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, ...body }: MarkLessonProgressInput) =>
      api.patch<CourseProgress>(`/api/progress/lessons/${lessonId}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: progressKeys.courses })
      void queryClient.invalidateQueries({ queryKey: ['progress', 'lessons'] })
    },
  })
}
