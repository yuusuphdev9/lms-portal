import { HttpResponse, http } from 'msw'
import {
  courseProgress,
  courses,
  currentUser,
  lessonProgress,
  lessons,
  modules,
  notes,
  quizzes,
  resources,
} from './data'

const API = '/api'

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

  http.get(`${API}/lessons/:lessonId`, ({ params }) => {
    const lesson = lessons.find((l) => l.id === params['lessonId'])
    if (!lesson) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(lesson)
  }),

  http.get(`${API}/quizzes/:quizId`, ({ params }) => {
    const quiz = quizzes.find((q) => q.id === params['quizId'])
    if (!quiz) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(quiz)
  }),

  http.get(`${API}/resources`, ({ request }) => {
    const courseId = new URL(request.url).searchParams.get('courseId')
    const filtered = courseId ? resources.filter((r) => r.courseId === courseId) : resources
    return HttpResponse.json(filtered)
  }),

  http.get(`${API}/notes`, ({ request }) => {
    const courseId = new URL(request.url).searchParams.get('courseId')
    const userNotes = notes.filter((n) => n.userId === currentUser.id)
    const filtered = courseId ? userNotes.filter((n) => n.courseId === courseId) : userNotes
    return HttpResponse.json(filtered)
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
]
