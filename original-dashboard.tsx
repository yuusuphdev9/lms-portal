import { ArrowRight, BookmarkCheck, CheckCircle2, Clock, Flame, PlayCircle } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { useCourses, useLesson } from '@/features/course-player/api'
import { useNotes } from '@/features/notes/api'
import { useCourseProgressList } from '@/features/progress/api'
import { accentForTag, cn, timeAgo, timeOfDayGreeting } from '@/lib/utils'
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
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {timeOfDayGreeting()}
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
          className="group relative isolate flex items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <span
            aria-hidden="true"
            className="blob-decoration -right-8 -top-20 size-56 bg-white/20"
          />
          <span
            aria-hidden="true"
            className="blob-decoration -bottom-16 left-1/3 size-40 bg-black/10"
          />
          <span
            aria-hidden="true"
            className="bg-grain absolute inset-0 opacity-70 mix-blend-overlay"
          />
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <PlayCircle className="size-5" />
          </span>
          <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs font-medium opacity-85">Continue where you left off</span>
            <span className="font-heading text-base font-semibold">{continueCourse.title}</span>
            {continueLesson && (
              <span className="text-sm opacity-85">{continueLesson.title}</span>
            )}
          </div>
          <span className="relative flex shrink-0 items-center gap-1.5 rounded-lg bg-background px-4 py-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
            Resume
            <ArrowRight className="size-3.5" />
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Courses in progress"
          value={coursesInProgress}
          icon={Flame}
          accent="clay"
        />
        <StatTile
          label="Lessons completed"
          value={lessonsCompleted}
          icon={CheckCircle2}
          accent="success"
        />
        <StatTile
          label="Bookmarked notes"
          value={bookmarkedNotes}
          icon={BookmarkCheck}
          accent="info"
        />
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
                  <div className="flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className={cn('size-1.5 rounded-full', {
                            'bg-primary': accentForTag(tag) === 'primary',
                            'bg-clay': accentForTag(tag) === 'clay',
                            'bg-info': accentForTag(tag) === 'info',
                            'bg-success': accentForTag(tag) === 'success',
                          })}
                        />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    updated {timeAgo(course.updatedAt)}
                  </span>
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

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  accent: 'clay' | 'success' | 'info'
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5">
      <span
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', {
          'bg-clay/15 text-clay': accent === 'clay',
          'bg-success/15 text-success': accent === 'success',
          'bg-info/15 text-info': accent === 'info',
        })}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="font-mono text-xl font-semibold leading-none">{value}</span>
      </div>
    </div>
  )
}
