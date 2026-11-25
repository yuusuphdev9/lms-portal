import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { AsyncData } from '@/components/ui/async-data'
import { QuestionField } from '@/features/quizzes/components/QuestionField'
import { useDueReviews, useRecordReviewResult } from '@/features/quizzes/review-api'
import { isAnswerCorrect } from '@/features/quizzes/scoring'
import type { QuestionAnswer } from '@/types'

export function ReviewPage() {
  const dueQuery = useDueReviews()
  const recordResult = useRecordReviewResult()

  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [results, setResults] = useState<Record<string, boolean> | null>(null)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Review</h1>
        <p className="text-sm text-muted-foreground">
          Questions you&rsquo;ve gotten wrong before, resurfaced for another try.
        </p>
      </div>

      <AsyncData
        query={dueQuery}
        loadingText="Loading your review queue…"
        errorText="Couldn't load your review queue."
        isEmpty={(questions) => questions.length === 0}
        emptyText="Nothing due for review right now — come back later."
      >
        {(questions) => {
          const handleCheck = () => {
            const outcomes: Record<string, boolean> = {}
            for (const question of questions) {
              const correct = isAnswerCorrect(question, answers[question.id])
              outcomes[question.id] = correct
              recordResult.mutate({ questionId: question.id, quizId: question.quizId, correct })
            }
            setResults(outcomes)
          }

          const handleNext = () => {
            setAnswers({})
            setResults(null)
          }

          const allAnswered = questions.every((q) => answers[q.id] !== undefined)

          return (
            <div className="flex flex-col gap-4">
              {questions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  disabled={Boolean(results)}
                  isCorrect={results ? results[question.id] : undefined}
                  onChange={(answer) => {
                    setAnswers((prev) => ({ ...prev, [question.id]: answer }))
                  }}
                />
              ))}

              {!results ? (
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={!allAnswered || recordResult.isPending}
                  className="self-start rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Check answers
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-fit items-center gap-1.5 self-start rounded-lg border border-border px-5 py-2.5 text-sm font-semibold"
                >
                  <RotateCcw className="size-4" />
                  Refresh queue
                </button>
              )}
            </div>
          )
        }}
      </AsyncData>
    </div>
  )
}
