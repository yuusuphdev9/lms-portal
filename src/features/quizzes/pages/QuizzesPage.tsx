import { ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { useCourses } from '@/features/course-player/api'
import { useQuizzes } from '@/features/quizzes/api'

export function QuizzesPage() {
  const quizzesQuery = useQuizzes()
  const { data: courses } = useCourses()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Quizzes</h1>

      <AsyncData
        query={quizzesQuery}
        loadingText="Loading quizzes…"
        errorText="Couldn't load quizzes."
        isEmpty={(quizzes) => quizzes.length === 0}
        emptyText="No quizzes available yet."
      >
        {(quizzes) => (
          <ul className="flex flex-col gap-3">
            {quizzes.map((quiz) => {
              const course = courses?.find((c) => c.id === quiz.courseId)
              return (
                <li key={quiz.id}>
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <ListChecks className="size-5" />
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="font-heading font-semibold">{quiz.title}</span>
                      {course && <span className="text-xs text-muted-foreground">{course.title}</span>}
                    </div>
                    <div className="flex flex-col items-end text-xs text-muted-foreground">
                      <span>{quiz.questions.length} questions</span>
                      <span>Pass at {quiz.passingScorePercent}%</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </AsyncData>
    </div>
  )
}
