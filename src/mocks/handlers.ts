import { HttpResponse, http } from 'msw'
import type { CourseProgress, LessonProgressStatus, Note, QuestionAnswer } from '@/types'
import {
  courseProgress,
  courses,
  currentUser,
  lessonProgress,
  lessons,
  modules,
  notes,
  quizAttempts,
  quizzes,
  resources,
} from './data'

const API = '/api'

function nowIso() {
  return new Date().toISOString()
}

function recalcCourseProgress(courseId: string, lessonId: string): CourseProgress {
  const totalLessons = lessons.filter((l) => l.courseId === courseId).length
  const completedLessonIds = lessonProgress
    .filter((p) => p.courseId === courseId && p.userId === currentUser.id && p.status === 'completed')
    .map((p) => p.lessonId)
  const percentComplete =
    totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0

  const existing = courseProgress.find(
    (p) => p.courseId === courseId && p.userId === currentUser.id,
  )
  if (existing) {
    existing.completedLessonIds = completedLessonIds
    existing.totalLessons = totalLessons
    existing.percentComplete = percentComplete
    existing.lastAccessedLessonId = lessonId
    existing.updatedAt = nowIso()
    return existing
  }

  const created: CourseProgress = {
    courseId,
    userId: currentUser.id,
    completedLessonIds,
    totalLessons,
    percentComplete,
    lastAccessedLessonId: lessonId,
    startedAt: nowIso(),
    updatedAt: nowIso(),
  }
  courseProgress.push(created)
  return created
}

export const handlers = [
  http.get(`${API}/me`, () => HttpResponse.json(currentUser)),

  http.get(`${API}/courses`, () => HttpResponse.json(courses)),

  http.get(`${API}/courses/:courseId`, ({ params }) => {
    const course = courses.find((c) => c.id === params['courseId'])
    if (!course) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(course)
  }),

  http.get(`${API}/courses/:courseId/modules`, ({ params }) => {
    const courseModules = modules.filter((m) => m.courseId === params['courseId'])
    return HttpResponse.json(courseModules)
  }),

  http.get(`${API}/modules/:moduleId/lessons`, ({ params }) => {
    const moduleLessons = lessons.filter((l) => l.moduleId === params['moduleId'])
    return HttpResponse.json(moduleLessons)
  }),

  http.get(`${API}/courses/:courseId/lessons`, ({ params }) => {
    const courseId = params['courseId']
    const moduleOrder = new Map(modules.filter((m) => m.courseId === courseId).map((m) => [m.id, m.order]))
    const courseLessons = lessons
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => {
        const orderDiff = (moduleOrder.get(a.moduleId) ?? 0) - (moduleOrder.get(b.moduleId) ?? 0)
        return orderDiff !== 0 ? orderDiff : a.order - b.order
      })
    return HttpResponse.json(courseLessons)
  }),

  http.get(`${API}/lessons/:lessonId`, ({ params }) => {
    const lesson = lessons.find((l) => l.id === params['lessonId'])
    if (!lesson) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(lesson)
  }),

  http.get(`${API}/quizzes`, () => HttpResponse.json(quizzes)),

  http.get(`${API}/quizzes/:quizId`, ({ params }) => {
    const quiz = quizzes.find((q) => q.id === params['quizId'])
    if (!quiz) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(quiz)
  }),

  http.get(`${API}/quizzes/:quizId/attempts`, ({ params }) => {
    const attempts = quizAttempts.filter(
      (a) => a.quizId === params['quizId'] && a.userId === currentUser.id,
    )
    return HttpResponse.json(attempts)
  }),

  http.post(`${API}/quizzes/:quizId/attempts`, async ({ params, request }) => {
    const quizId = params['quizId']
    const quiz = quizzes.find((q) => q.id === quizId)
    if (typeof quizId !== 'string' || !quiz) return new HttpResponse(null, { status: 404 })

    const body = (await request.json()) as {
      answers: QuestionAnswer[]
      scorePercent: number
      passed: boolean
    }

    const attempt = {
      id: crypto.randomUUID(),
      quizId,
      userId: currentUser.id,
      answers: body.answers,
      status: 'graded' as const,
      startedAt: nowIso(),
      submittedAt: nowIso(),
      scorePercent: body.scorePercent,
      passed: body.passed,
    }
    quizAttempts.push(attempt)

    if (quiz.lessonId) {
      const lesson = lessons.find((l) => l.id === quiz.lessonId)
      if (lesson) {
        const existingProgress = lessonProgress.find(
          (p) => p.lessonId === lesson.id && p.userId === currentUser.id,
        )
        if (existingProgress) {
          existingProgress.status = 'completed'
          existingProgress.progressPercent = 100
          existingProgress.completedAt = nowIso()
          existingProgress.updatedAt = nowIso()
        } else {
          lessonProgress.push({
            lessonId: lesson.id,
            courseId: lesson.courseId,
            userId: currentUser.id,
            status: 'completed',
            progressPercent: 100,
            completedAt: nowIso(),
            updatedAt: nowIso(),
          })
        }
        recalcCourseProgress(lesson.courseId, lesson.id)
      }
    }

    return HttpResponse.json(attempt, { status: 201 })
  }),

  http.get(`${API}/resources`, ({ request }) => {
    const courseId = new URL(request.url).searchParams.get('courseId')
    const filtered = courseId ? resources.filter((r) => r.courseId === courseId) : resources
    return HttpResponse.json(filtered)
  }),

  http.post(`${API}/resources/:resourceId/download`, ({ params }) => {
    const resource = resources.find((r) => r.id === params['resourceId'])
    if (!resource) return new HttpResponse(null, { status: 404 })
    resource.downloadCount += 1
    return HttpResponse.json(resource)
  }),

  http.get(`${API}/notes`, ({ request }) => {
    const courseId = new URL(request.url).searchParams.get('courseId')
    const userNotes = notes.filter((n) => n.userId === currentUser.id)
    const filtered = courseId ? userNotes.filter((n) => n.courseId === courseId) : userNotes
    return HttpResponse.json(filtered)
  }),

  http.post(`${API}/notes`, async ({ request }) => {
    const body = (await request.json()) as Pick<Note, 'courseId' | 'content'> &
      Partial<Pick<Note, 'lessonId' | 'timestampSeconds' | 'colorTag' | 'isBookmarked'>>

    const note: Note = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      courseId: body.courseId,
      content: body.content,
      isBookmarked: body.isBookmarked ?? false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...(body.lessonId !== undefined && { lessonId: body.lessonId }),
      ...(body.timestampSeconds !== undefined && { timestampSeconds: body.timestampSeconds }),
      ...(body.colorTag !== undefined && { colorTag: body.colorTag }),
    }
    notes.push(note)
    return HttpResponse.json(note, { status: 201 })
  }),

  http.patch(`${API}/notes/:noteId`, async ({ params, request }) => {
    const note = notes.find((n) => n.id === params['noteId'] && n.userId === currentUser.id)
    if (!note) return new HttpResponse(null, { status: 404 })

    const body = (await request.json()) as Partial<Pick<Note, 'content' | 'isBookmarked' | 'colorTag'>>
    if (body.content !== undefined) note.content = body.content
    if (body.isBookmarked !== undefined) note.isBookmarked = body.isBookmarked
    if (body.colorTag !== undefined) note.colorTag = body.colorTag
    note.updatedAt = nowIso()

    return HttpResponse.json(note)
  }),

  http.delete(`${API}/notes/:noteId`, ({ params }) => {
    const index = notes.findIndex((n) => n.id === params['noteId'] && n.userId === currentUser.id)
    if (index === -1) return new HttpResponse(null, { status: 404 })
    notes.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/progress/courses`, () =>
    HttpResponse.json(courseProgress.filter((p) => p.userId === currentUser.id)),
  ),

  http.get(`${API}/progress/courses/:courseId`, ({ params }) => {
    const progress = courseProgress.find(
      (p) => p.courseId === params['courseId'] && p.userId === currentUser.id,
    )
    if (!progress) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(progress)
  }),

  http.get(`${API}/progress/lessons`, ({ request }) => {
    const courseId = new URL(request.url).searchParams.get('courseId')
    const userLessonProgress = lessonProgress.filter((p) => p.userId === currentUser.id)
    const filtered = courseId
      ? userLessonProgress.filter((p) => p.courseId === courseId)
      : userLessonProgress
    return HttpResponse.json(filtered)
  }),

  http.patch(`${API}/progress/lessons/:lessonId`, async ({ params, request }) => {
    const lessonId = params['lessonId']
    const lesson = lessons.find((l) => l.id === lessonId)
    if (typeof lessonId !== 'string' || !lesson) return new HttpResponse(null, { status: 404 })

    const body = (await request.json()) as {
      status: LessonProgressStatus
      progressPercent: number
      lastPositionSeconds?: number
    }

    const existing = lessonProgress.find(
      (p) => p.lessonId === lessonId && p.userId === currentUser.id,
    )
    if (existing) {
      existing.status = body.status
      existing.progressPercent = body.progressPercent
      existing.updatedAt = nowIso()
      if (body.lastPositionSeconds !== undefined) existing.lastPositionSeconds = body.lastPositionSeconds
      if (body.status === 'completed') existing.completedAt = nowIso()
    } else {
      lessonProgress.push({
        lessonId,
        courseId: lesson.courseId,
        userId: currentUser.id,
        status: body.status,
        progressPercent: body.progressPercent,
        updatedAt: nowIso(),
        ...(body.lastPositionSeconds !== undefined && {
          lastPositionSeconds: body.lastPositionSeconds,
        }),
        ...(body.status === 'completed' && { completedAt: nowIso() }),
      })
    }

    const progress = recalcCourseProgress(lesson.courseId, lessonId)
    return HttpResponse.json(progress)
  }),
]
