/**
 * Course structure domain types: courses, modules, and the lesson union
 * that powers the interactive course player.
 */

export type CourseStatus = 'draft' | 'published' | 'archived'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnailUrl?: string
  instructorId: string
  tags: string[]
  level: CourseLevel
  status: CourseStatus
  moduleIds: string[]
  estimatedDurationMinutes: number
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  courseId: string
  title: string
  order: number
  lessonIds: string[]
}

export type LessonType = 'video' | 'article' | 'quiz' | 'assignment'

interface LessonBase {
  id: string
  moduleId: string
  courseId: string
  title: string
  order: number
  type: LessonType
  durationMinutes: number
  isPreview?: boolean
}

export interface VideoLesson extends LessonBase {
  type: 'video'
  videoUrl: string
  captionsUrl?: string
  transcript?: string
}

export interface ArticleLesson extends LessonBase {
  type: 'article'
  content: string
  estimatedReadMinutes: number
}

export interface QuizLesson extends LessonBase {
  type: 'quiz'
  quizId: string
}

export interface AssignmentLesson extends LessonBase {
  type: 'assignment'
  instructions: string
  resourceIds: string[]
}

/** Discriminated union covering every lesson type the course player can render. */
export type Lesson = VideoLesson | ArticleLesson | QuizLesson | AssignmentLesson
