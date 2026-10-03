import { createBrowserRouter } from 'react-router'
import { NotFoundPage } from '@/components/layout/NotFoundPage'
import { RootLayout } from '@/components/layout/RootLayout'
import { CoursePlayerPage } from '@/features/course-player/pages/CoursePlayerPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { NotesPage } from '@/features/notes/pages/NotesPage'
import { QuizzesPage } from '@/features/quizzes/pages/QuizzesPage'
import { ResourcesPage } from '@/features/resources/pages/ResourcesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'courses/:courseId', element: <CoursePlayerPage /> },
      { path: 'quizzes', element: <QuizzesPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
