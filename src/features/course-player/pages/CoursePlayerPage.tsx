import {
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardList,
  FileText,
  ListChecks,
  PlayCircle,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { useCourse, useCourseLessons, useCourseModules } from '@/features/course-player/api'
import { lessonHref } from '@/features/course-player/lesson-link'
import { useCourseProgress, useLessonProgressList } from '@/features/progress/api'
import { cn } from '@/lib/utils'
import type { Lesson, LessonProgressStatus } from '@/types'

const lessonTypeIcon = {
  video: PlayCircle,
  article: FileText,
  quiz: ListChecks,
  assignment: ClipboardList,
} as const

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const courseQuery = useCourse(courseId)
  const { data: modules } = useCourseModules(courseId)
  const { data: lessons } = useCourseLessons(courseId)
  const { data: progress } = useCourseProgress(courseId)
  const { data: lessonProgress } = useLessonProgressList(courseId)

  const progressByLesson = new Map(lessonProgress?.map((p) => [p.lessonId, p]))

  return (
    <AsyncData query={courseQuery} loadingText="Loading course…" errorText="Couldn't load this course.">
      {(course) => (
        <div className="flex flex-col gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Back to dashboard
          </Link>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          {progress && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.completedLessonIds.length} of {progress.totalLessons} lessons complete
                </span>
                <span className="font-mono font-semibold text-primary">
                  {progress.percentComplete}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${String(progress.percentComplete)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {modules
              ?.slice()
              .sort((a, b) => a.order - b.order)
              .map((mod) => {
                const moduleLessons =
                  lessons?.filter((l) => l.moduleId === mod.id).sort((a, b) => a.order - b.order) ?? []
                return (
                  <div key={mod.id} className="rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-5 py-3">
                      <h2 className="font-heading font-semibold">{mod.title}</h2>
                    </div>
                    <ul className="flex flex-col">
                      {moduleLessons.map((lesson) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          courseId={course.id}
                          status={progressByLesson.get(lesson.id)?.status}
                        />
                      ))}
                    </ul>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </AsyncData>
  )
}

function LessonRow({
  lesson,
  courseId,
  status,
}: {
  lesson: Lesson
  courseId: string
  status: LessonProgressStatus | undefined
}) {
  const Icon = lessonTypeIcon[lesson.type]
  const to = lessonHref(courseId, lesson)

  return (
    <li className="border-b border-border last:border-0">
      <Link
        to={to}
        className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent/60"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">{lesson.title}</span>
        <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
        <StatusIcon status={status} />
      </Link>
    </li>
  )
}

function StatusIcon({ status }: { status: LessonProgressStatus | undefined }) {
  if (status === 'completed') return <CheckCircle2 className="size-4 shrink-0 text-success" />
  if (status === 'in-progress') return <CircleDot className="size-4 shrink-0 text-warning" />
  return <Circle className={cn('size-4 shrink-0 text-muted-foreground/40')} />
}
