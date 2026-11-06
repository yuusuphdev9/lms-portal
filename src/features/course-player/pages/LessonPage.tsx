import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, PlayCircle } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { LessonContent } from '@/features/course-player/components/LessonContent'
import { coursePlayerFetchers, courseKeys, useCourseLessons, useLesson } from '@/features/course-player/api'
import { lessonHref } from '@/features/course-player/lesson-link'
import { useMarkLessonProgress, useLessonProgressList } from '@/features/progress/api'
import { useResources } from '@/features/resources/api'
import { usePrefetchLink } from '@/hooks/use-prefetch-link'
import { cn } from '@/lib/utils'
import type { AssignmentLesson, Lesson, Resource, VideoLesson } from '@/types'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const lessonQuery = useLesson(lessonId)
  const { data: lessons } = useCourseLessons(courseId)
  const { data: lessonProgress } = useLessonProgressList(courseId)
  const { data: resources } = useResources(courseId)
  const markProgress = useMarkLessonProgress()

  const safeCourseId = courseId ?? ''

  return (
    <AsyncData query={lessonQuery} loadingText="Loading lesson…" errorText="Couldn't load this lesson.">
      {(lesson) => {
        const isCompleted =
          lessonProgress?.find((p) => p.lessonId === lesson.id)?.status === 'completed'

        const index = lessons?.findIndex((l) => l.id === lesson.id) ?? -1
        const prevLesson = lessons && index > 0 ? lessons[index - 1] : undefined
        const nextLesson = lessons && index >= 0 ? lessons[index + 1] : undefined

        const handleMarkComplete = () => {
          markProgress.mutate({ lessonId: lesson.id, status: 'completed', progressPercent: 100 })
        }

        return (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <Link
              to={`/courses/${safeCourseId}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to course
            </Link>

            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold">{lesson.title}</h1>
              <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {lesson.type === 'video' && <VideoLessonBody lesson={lesson} />}
              {lesson.type === 'article' && <LessonContent content={lesson.content} />}
              {lesson.type === 'assignment' && (
                <AssignmentLessonBody lesson={lesson} resources={resources ?? []} />
              )}
              {lesson.type === 'quiz' && (
                <p className="text-sm text-muted-foreground">
                  This lesson is a quiz — it opens in the quiz player instead of here.
                </p>
              )}
            </div>

            <LessonFooterNav
              safeCourseId={safeCourseId}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              isCompleted={isCompleted}
              onMarkComplete={handleMarkComplete}
              isMarkingComplete={markProgress.isPending}
            />
          </div>
        )
      }}
    </AsyncData>
  )
}

function LessonFooterNav({
  safeCourseId,
  prevLesson,
  nextLesson,
  isCompleted,
  onMarkComplete,
  isMarkingComplete,
}: {
  safeCourseId: string
  prevLesson: Lesson | undefined
  nextLesson: Lesson | undefined
  isCompleted: boolean
  onMarkComplete: () => void
  isMarkingComplete: boolean
}) {
  // A quiz lesson navigates to a separate quiz player route with its own data
  // shape (not `courseKeys.lesson`), so there's nothing useful to prefetch for it here.
  const prevPrefetchRef = usePrefetchLink(
    `prev-lesson-${prevLesson?.id ?? 'none'}`,
    courseKeys.lesson(prevLesson?.id ?? ''),
    () => coursePlayerFetchers.lesson(prevLesson?.id ?? ''),
    Boolean(prevLesson) && prevLesson?.type !== 'quiz',
  )
  const nextPrefetchRef = usePrefetchLink(
    `next-lesson-${nextLesson?.id ?? 'none'}`,
    courseKeys.lesson(nextLesson?.id ?? ''),
    () => coursePlayerFetchers.lesson(nextLesson?.id ?? ''),
    Boolean(nextLesson) && nextLesson?.type !== 'quiz',
  )

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        {prevLesson && (
          <Link
            ref={prevPrefetchRef}
            to={lessonHref(safeCourseId, prevLesson)}
            className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate">{prevLesson.title}</span>
          </Link>
        )}
      </div>

      {!isCompleted ? (
        <button
          type="button"
          onClick={onMarkComplete}
          disabled={isMarkingComplete}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" />
          Mark complete
        </button>
      ) : (
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" />
          Completed
        </span>
      )}

      <div className="min-w-0 flex-1 text-right">
        {nextLesson && (
          <Link
            ref={nextPrefetchRef}
            to={lessonHref(safeCourseId, nextLesson)}
            className="flex items-center justify-end gap-1.5 truncate text-sm text-muted-foreground hover:underline"
          >
            <span className="truncate">{nextLesson.title}</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}

function VideoLessonBody({ lesson }: { lesson: VideoLesson }) {
  const isEmbeddable = lesson.videoUrl.startsWith('https://www.youtube.com/embed/')
  const isDirectFile = /\.(mp4|webm|ogg)$/i.test(lesson.videoUrl)

  return (
    <div className="flex flex-col gap-4">
      {isEmbeddable ? (
        <div className="aspect-video overflow-hidden rounded-xl bg-accent/60">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isDirectFile ? (
        <video
          src={lesson.videoUrl}
          controls
          className="aspect-video w-full rounded-xl bg-accent/60"
        >
          Your browser doesn&apos;t support embedded video.
        </video>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-accent/60 text-accent-foreground">
          <PlayCircle className="size-14 opacity-70" />
        </div>
      )}
      {lesson.transcript && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <h4 className="font-heading text-sm font-semibold">Transcript</h4>
          <p className="text-sm leading-relaxed text-foreground/90">{lesson.transcript}</p>
        </div>
      )}
    </div>
  )
}

function AssignmentLessonBody({
  lesson,
  resources,
}: {
  lesson: AssignmentLesson
  resources: Resource[]
}) {
  const attached = resources.filter((r) => lesson.resourceIds.includes(r.id))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground/90">{lesson.instructions}</p>
      {attached.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <h4 className="font-heading text-sm font-semibold">Attached resources</h4>
          <ul className="flex flex-col gap-2">
            {attached.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent/60',
                  )}
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1">{resource.title}</span>
                  <Download className="size-3.5 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
