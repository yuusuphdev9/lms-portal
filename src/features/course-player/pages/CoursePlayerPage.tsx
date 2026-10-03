import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Course, Module } from '@/types'

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[] | null>(null)

  useEffect(() => {
    if (!courseId) return
    void Promise.all([
      fetch(`/api/courses/${courseId}`).then((res) => res.json() as Promise<Course>),
      fetch(`/api/courses/${courseId}/modules`).then((res) => res.json() as Promise<Module[]>),
    ]).then(([courseData, modulesData]) => {
      setCourse(courseData)
      setModules(modulesData)
    })
  }, [courseId])

  return (
    <div className="flex flex-col gap-4">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>

      {!course && <p className="text-sm text-muted-foreground">Loading course…</p>}

      {course && (
        <>
          <h1 className="font-heading text-2xl font-semibold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>

          <ul className="flex flex-col gap-3">
            {modules?.map((mod) => (
              <li
                key={mod.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="font-medium">{mod.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {mod.lessonIds.length} lessons
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
