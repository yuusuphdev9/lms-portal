import { useEffect, useState } from 'react'
import type { Course } from '@/types'

export function QuizzesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null)

  useEffect(() => {
    void fetch('/api/courses')
      .then((res) => res.json() as Promise<Course[]>)
      .then(setCourses)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Quizzes</h1>
      <p className="text-sm text-muted-foreground">
        Quiz-taking is built in a later sprint. For now, module quizzes are reachable from each
        course.
      </p>
      <ul className="flex flex-col gap-2">
        {courses?.map((course) => (
          <li key={course.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            {course.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
