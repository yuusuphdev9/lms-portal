import { useQuery } from '@tanstack/react-query'
import { assertFound, mapCourse, mapLesson, mapModule, type CourseRow, type LessonRow, type ModuleRow, type Result } from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { Course, Lesson, Module } from '@/types'

export const courseKeys = {
  all: ['courses'] as const,
  detail: (courseId: string) => ['courses', courseId] as const,
  modules: (courseId: string) => ['courses', courseId, 'modules'] as const,
  allLessons: (courseId: string) => ['courses', courseId, 'lessons'] as const,
  lessons: (moduleId: string) => ['modules', moduleId, 'lessons'] as const,
  lesson: (lessonId: string) => ['lessons', lessonId] as const,
}

async function fetchCourses(): Promise<Course[]> {
  const { data, error } = (await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at')) as Result<CourseRow[]>
  if (error) throw error
  return (data ?? []).map(mapCourse)
}

async function fetchCourse(courseId: string): Promise<Course> {
  const { data, error } = (await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()) as Result<CourseRow>
  if (error) throw error
  return mapCourse(assertFound(data, 'Course'))
}

async function fetchCourseModules(courseId: string): Promise<Module[]> {
  const { data, error } = (await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')) as Result<ModuleRow[]>
  if (error) throw error
  return (data ?? []).map(mapModule)
}

async function fetchCourseLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = (await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')) as Result<LessonRow[]>
  if (error) throw error
  return (data ?? []).map(mapLesson)
}

async function fetchModuleLessons(moduleId: string): Promise<Lesson[]> {
  const { data, error } = (await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index')) as Result<LessonRow[]>
  if (error) throw error
  return (data ?? []).map(mapLesson)
}

async function fetchLesson(lessonId: string): Promise<Lesson> {
  const { data, error } = (await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()) as Result<LessonRow>
  if (error) throw error
  return mapLesson(assertFound(data, 'Lesson'))
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: courseKeys.all,
    queryFn: fetchCourses,
  })
}

export function useCourse(courseId: string | undefined) {
  return useQuery<Course>({
    queryKey: courseKeys.detail(courseId ?? ''),
    queryFn: () => fetchCourse(courseId ?? ''),
    enabled: Boolean(courseId),
  })
}

export function useCourseModules(courseId: string | undefined) {
  return useQuery<Module[]>({
    queryKey: courseKeys.modules(courseId ?? ''),
    queryFn: () => fetchCourseModules(courseId ?? ''),
    enabled: Boolean(courseId),
  })
}

export function useCourseLessons(courseId: string | undefined) {
  return useQuery<Lesson[]>({
    queryKey: courseKeys.allLessons(courseId ?? ''),
    queryFn: () => fetchCourseLessons(courseId ?? ''),
    enabled: Boolean(courseId),
  })
}

export function useModuleLessons(moduleId: string | undefined) {
  return useQuery<Lesson[]>({
    queryKey: courseKeys.lessons(moduleId ?? ''),
    queryFn: () => fetchModuleLessons(moduleId ?? ''),
    enabled: Boolean(moduleId),
  })
}

export function useLesson(lessonId: string | undefined) {
  return useQuery<Lesson>({
    queryKey: courseKeys.lesson(lessonId ?? ''),
    queryFn: () => fetchLesson(lessonId ?? ''),
    enabled: Boolean(lessonId),
  })
}

/**
 * Plain (non-hook) fetchers, exported so code outside a component render —
 * like a ForesightJS hover-prefetch callback — can warm the TanStack Query
 * cache with `queryClient.prefetchQuery` using the exact same fetching logic
 * the hooks above use.
 */
export const coursePlayerFetchers = {
  courseLessons: fetchCourseLessons,
  courseModules: fetchCourseModules,
  lesson: fetchLesson,
}
