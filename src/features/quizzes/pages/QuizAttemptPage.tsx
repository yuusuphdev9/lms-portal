import { AlertCircle, ArrowLeft, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { AsyncData } from '@/components/ui/async-data'
import { QuestionField } from '@/features/quizzes/components/QuestionField'
import { useQuiz, useSubmitQuizAttempt } from '@/features/quizzes/api'
import { scoreQuiz, type QuizResult } from '@/features/quizzes/scoring'
import { cn } from '@/lib/utils'
import type { QuestionAnswer } from '@/types'

export function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const quizQuery = useQuiz(quizId)
  const submitAttempt = useSubmitQuizAttempt()

  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  return (
    <AsyncData query={quizQuery} loadingText="Loading quiz…" errorText="Couldn't load this quiz.">
      {(quiz) => {
        const resultByQuestion = new Map(result?.perQuestion.map((r) => [r.questionId, r]))
        const unansweredQuestions = quiz.questions.filter((q) => answers[q.id] === undefined)
        const allAnswered = unansweredQuestions.length === 0
        const showValidationError = submitAttempted && !allAnswered && !result

        const handleSubmit = () => {
          setSubmitAttempted(true)
          if (!allAnswered) return

          const computed = scoreQuiz(quiz, Object.values(answers))
          setResult(computed)
          submitAttempt.mutate({
            quizId: quiz.id,
            answers: Object.values(answers),
            scorePercent: computed.scorePercent,
            passed: computed.passed,
          })
        }

        const handleRetake = () => {
          setAnswers({})
          setResult(null)
          setSubmitAttempted(false)
        }

        return (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <Link
              to={`/courses/${quiz.courseId}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to course
            </Link>

            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-semibold">{quiz.title}</h1>
              {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
              <p className="text-xs text-muted-foreground">
                {quiz.questions.length} questions · Passing score {quiz.passingScorePercent}%
              </p>
            </div>

            {result && (
              <div
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-6 py-5 text-primary-foreground shadow-sm',
                  result.passed ? 'bg-success' : 'bg-destructive',
                )}
              >
                <PartyPopper className="size-7 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading text-lg font-semibold">
                    {result.passed ? 'Quiz passed!' : 'Not quite there'}
                  </span>
                  <span className="text-sm opacity-90">
                    Scored {result.scorePercent}% ({result.pointsEarned} / {result.pointsPossible}{' '}
                    points)
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {quiz.questions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    answer={answers[question.id]}
                    disabled={Boolean(result)}
                    isCorrect={result ? resultByQuestion.get(question.id)?.correct : undefined}
                    showRequiredError={submitAttempted && !result && answers[question.id] === undefined}
                    onChange={(answer) => {
                      setAnswers((prev) => ({ ...prev, [question.id]: answer }))
                    }}
                  />
                ))}
            </div>

            {!result ? (
              <div className="flex flex-col gap-2">
                {showValidationError && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    Answer all {quiz.questions.length} questions before submitting —{' '}
                    {unansweredQuestions.length} left.
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitAttempt.isPending}
                    className="self-start rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Submit quiz
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {quiz.questions.length - unansweredQuestions.length} of {quiz.questions.length}{' '}
                    answered
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                className="self-start rounded-lg border border-border px-5 py-2.5 text-sm font-semibold"
              >
                Retake quiz
              </button>
            )}
          </div>
        )
      }}
    </AsyncData>
  )
}
