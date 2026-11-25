import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { NotFoundPage } from '@/components/layout/NotFoundPage'
import { RootLayout } from '@/components/layout/RootLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

/**
 * Every route but the dashboard (the one page almost everyone lands on first) is code-split
 * into its own chunk. A visitor's first load now only pays for the dashboard's JS instead of
 * the quiz engine, course player, and every other feature bundled in up front; React.lazy +
 * the Suspense boundary in RootLayout fetch each chunk the first time its route is visited.
 */
const CoursePlayerPage = lazy(() =>
  import('@/features/course-player/pages/CoursePlayerPage').then((m) => ({ default: m.CoursePlayerPage })),
)
const LessonPage = lazy(() =>
  import('@/features/course-player/pages/LessonPage').then((m) => ({ default: m.LessonPage })),
)
const QuizzesPage = lazy(() =>
  import('@/features/quizzes/pages/QuizzesPage').then((m) => ({ default: m.QuizzesPage })),
)
const QuizAttemptPage = lazy(() =>
  import('@/features/quizzes/pages/QuizAttemptPage').then((m) => ({ default: m.QuizAttemptPage })),
)
const ReviewPage = lazy(() =>
  import('@/features/quizzes/pages/ReviewPage').then((m) => ({ default: m.ReviewPage })),
)
const ResourcesPage = lazy(() =>
  import('@/features/resources/pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })),
)
const NotesPage = lazy(() =>
  import('@/features/notes/pages/NotesPage').then((m) => ({ default: m.NotesPage })),
)

export const router = createBrowserRouter([
  // Public — rendered without the signed-in app shell, and redirect away from
  // themselves once there's a session (see LoginPage/SignupPage).
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'courses/:courseId', element: <CoursePlayerPage /> },
      { path: 'courses/:courseId/lessons/:lessonId', element: <LessonPage /> },
      { path: 'quizzes', element: <QuizzesPage /> },
      { path: 'quizzes/:quizId', element: <QuizAttemptPage /> },
      { path: 'review', element: <ReviewPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
