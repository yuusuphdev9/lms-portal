import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assertFound, mapCourseProgress, mapLessonProgress, type CourseProgressRow, type LessonProgressRow, type Result } from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { CourseProgress, LessonProgress, LessonProgressStatus } from '@/types'

export const progressKeys = {
  courses: ['progress', 'courses'] as const,
  course: (courseId: string) => ['progress', 'courses', courseId] as const,
  lessons: (courseId?: string) => ['progress', 'lessons', courseId ?? 'all'] as const,
}

export function useCourseProgressList() {
  return useQuery<CourseProgress[]>({
    queryKey: progressKeys.courses,
    queryFn: async () => {
      const { data, error } = (await supabase.from('course_progress').select('*')) as Result<CourseProgressRow[]>
      if (error) throw error
      return (data ?? []).map(mapCourseProgress)
    },
  })
}

export function useCourseProgress(courseId: string | undefined) {
  return useQuery<CourseProgress>({
    queryKey: progressKeys.course(courseId ?? ''),
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .single()) as Result<CourseProgressRow>
      if (error) throw error
      return mapCourseProgress(assertFound(data, 'Course progress'))
    },
    enabled: Boolean(courseId),
    retry: false,
  })
}

export function useLessonProgressList(courseId?: string) {
  return useQuery<LessonProgress[]>({
    queryKey: progressKeys.lessons(courseId),
    queryFn: async () => {
      let query = supabase.from('lesson_progress').select('*')
      if (courseId) query = query.eq('course_id', courseId)
      const { data, error } = (await query) as Result<LessonProgressRow[]>
      if (error) throw error
      return (data ?? []).map(mapLessonProgress)
    },
  })
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
    mutationFn: async ({ lessonId, status, progressPercent, lastPositionSeconds }: MarkLessonProgressInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user.id
      if (!userId) throw new Error('You need to be signed in to track progress.')

      const { data: lessonRow, error: lessonError } = (await supabase
        .from('lessons')
        .select('course_id')
        .eq('id', lessonId)
        .single()) as Result<{ course_id: string }>
      if (lessonError) throw lessonError
      const courseId = assertFound(lessonRow, 'Lesson').course_id

      // Upserting here is what fires the recalc_course_progress trigger (see
      // sql/001_schema_and_rls.sql), which is what keeps course_progress in sync.
      const { error: upsertError } = await supabase.from('lesson_progress').upsert({
        lesson_id: lessonId,
        course_id: courseId,
        user_id: userId,
        status,
        progress_percent: progressPercent,
        ...(lastPositionSeconds !== undefined && { last_position_seconds: lastPositionSeconds }),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      })
      if (upsertError) throw upsertError

      const { data: progress, error: progressError } = (await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single()) as Result<CourseProgressRow>
      if (progressError) throw progressError
      return mapCourseProgress(assertFound(progress, 'Course progress'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: progressKeys.courses })
      void queryClient.invalidateQueries({ queryKey: ['progress', 'lessons'] })
    },
  })
}
