import { ArrowRight, BookOpen, Clock, PlayCircle } from 'lucide-react'
import { Link } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { useCourses, useLesson } from '@/features/course-player/api'
import { useNotes } from '@/features/notes/api'
import { useCourseProgressList } from '@/features/progress/api'
import { cn } from '@/lib/utils'
import type { Course } from '@/types'

export function DashboardPage() {
  const coursesQuery = useCourses()
  const { data: progress } = useCourseProgressList()
  const { data: notes } = useNotes()

  const mostRecentProgress =
    progress && progress.length > 0
      ? [...progress].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
      : undefined

  const { data: continueLesson } = useLesson(mostRecentProgress?.lastAccessedLessonId)

  const coursesInProgress =
    progress?.filter((p) => p.percentComplete > 0 && p.percentComplete < 100).length ?? 0
  const bookmarkedNotes = notes?.filter((n) => n.isBookmarked).length ?? 0
  const lessonsCompleted =
    progress?.reduce((sum, p) => sum + p.completedLessonIds.length, 0) ?? 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          Welcome back
        </span>
        <h1 className="font-heading text-2xl font-semibold">Your courses</h1>
      </div>

      <AsyncData
        query={coursesQuery}
        loadingText="Loading your dashboard…"
        errorText="Couldn't load your dashboard."
        isEmpty={(courses) => courses.length === 0}
        emptyText="You're not enrolled in any courses yet."
      >
        {(courses) => (
          <DashboardBody
            courses={courses}
            progress={progress}
            continueLesson={continueLesson}
            continueCourseId={mostRecentProgress?.courseId}
            coursesInProgress={coursesInProgress}
            lessonsCompleted={lessonsCompleted}
            bookmarkedNotes={bookmarkedNotes}
          />
        )}
      </AsyncData>
    </div>
  )
}

function DashboardBody({
  courses,
  progress,
  continueLesson,
  continueCourseId,
  coursesInProgress,
  lessonsCompleted,
  bookmarkedNotes,
}: {
  courses: Course[]
  progress: ReturnType<typeof useCourseProgressList>['data']
  continueLesson: ReturnType<typeof useLesson>['data']
  continueCourseId: string | undefined
  coursesInProgress: number
  lessonsCompleted: number
  bookmarkedNotes: number
}) {
  const continueCourse = courses.find((c) => c.id === continueCourseId)

  return (
    <>
      {continueCourse && (
        <Link
          to={`/courses/${continueCourse.id}`}
          className="flex items-center gap-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <PlayCircle className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs font-medium opacity-85">Continue where you left off</span>
            <span className="font-heading text-base font-semibold">{continueCourse.title}</span>
            {continueLesson && (
              <span className="text-sm opacity-85">{continueLesson.title}</span>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-background px-4 py-2 text-sm font-semibold text-primary">
            Resume
            <ArrowRight className="size-3.5" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Courses in progress" value={coursesInProgress} />
        <StatTile label="Lessons completed" value={lessonsCompleted} />
        <StatTile label="Bookmarked notes" value={bookmarkedNotes} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">My courses</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {courses.map((course) => {
            const courseProgress = progress?.find((p) => p.courseId === course.id)
            const percent = courseProgress?.percentComplete ?? 0
            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  {course.tags[0] && (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                      {course.tags[0]}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-base font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {course.estimatedDurationMinutes} min
                  </span>
                  {courseProgress && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="size-3.5" />
                      {courseProgress.totalLessons} lessons
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {courseProgress
                        ? `${String(courseProgress.completedLessonIds.length)} of ${String(courseProgress.totalLessons)} lessons complete`
                        : 'Not started'}
                    </span>
                    <span className="font-mono font-semibold text-primary">{percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                    <div
                      className={cn('h-full rounded-full bg-primary transition-all')}
                      style={{ width: `${String(percent)}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-mono text-2xl font-semibold">{value}</span>
    </div>
  )
}
