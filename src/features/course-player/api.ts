import { useApiQuery } from '@/lib/use-api-query'
import type { Course, Lesson, Module } from '@/types'

export const courseKeys = {
  all: ['courses'] as const,
  detail: (courseId: string) => ['courses', courseId] as const,
  modules: (courseId: string) => ['courses', courseId, 'modules'] as const,
  allLessons: (courseId: string) => ['courses', courseId, 'lessons'] as const,
  lessons: (moduleId: string) => ['modules', moduleId, 'lessons'] as const,
  lesson: (lessonId: string) => ['lessons', lessonId] as const,
}

export function useCourses() {
  return useApiQuery<Course[]>(courseKeys.all, '/api/courses')
}

export function useCourse(courseId: string | undefined) {
  return useApiQuery<Course>(courseKeys.detail(courseId ?? ''), `/api/courses/${courseId ?? ''}`, {
    enabled: Boolean(courseId),
  })
}

export function useCourseModules(courseId: string | undefined) {
  return useApiQuery<Module[]>(
    courseKeys.modules(courseId ?? ''),
    `/api/courses/${courseId ?? ''}/modules`,
    { enabled: Boolean(courseId) },
  )
}

export function useCourseLessons(courseId: string | undefined) {
  return useApiQuery<Lesson[]>(
    courseKeys.allLessons(courseId ?? ''),
    `/api/courses/${courseId ?? ''}/lessons`,
    { enabled: Boolean(courseId) },
  )
}

export function useModuleLessons(moduleId: string | undefined) {
  return useApiQuery<Lesson[]>(
    courseKeys.lessons(moduleId ?? ''),
    `/api/modules/${moduleId ?? ''}/lessons`,
    { enabled: Boolean(moduleId) },
  )
}

export function useLesson(lessonId: string | undefined) {
  return useApiQuery<Lesson>(courseKeys.lesson(lessonId ?? ''), `/api/lessons/${lessonId ?? ''}`, {
    enabled: Boolean(lessonId),
  })
}
