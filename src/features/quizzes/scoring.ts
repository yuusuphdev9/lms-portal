import type { Question, QuestionAnswer, Quiz } from '@/types'

function normalize(value: string, caseSensitive?: boolean) {
  const trimmed = value.trim()
  return caseSensitive ? trimmed : trimmed.toLowerCase()
}

/**
 * Whether a given answer is correct for its question. Long-text is never auto-graded.
 *
 * `answer` is only narrowed by its own `type` field, which TypeScript can't correlate
 * with `question`'s discriminant automatically, so each branch casts it via `Extract`
 * once the matching check above has already guaranteed the runtime shape.
 */
export function isAnswerCorrect(question: Question, answer: QuestionAnswer | undefined): boolean {
  if (answer?.type !== question.type) return false

  switch (question.type) {
    case 'single-choice': {
      const a = answer as Extract<QuestionAnswer, { type: 'single-choice' }>
      return a.selectedOptionId === question.correctOptionId
    }
    case 'multiple-choice': {
      const a = answer as Extract<QuestionAnswer, { type: 'multiple-choice' }>
      const selected = new Set(a.selectedOptionIds)
      const correct = new Set(question.correctOptionIds)
      return selected.size === correct.size && [...selected].every((id) => correct.has(id))
    }
    case 'true-false': {
      const a = answer as Extract<QuestionAnswer, { type: 'true-false' }>
      return a.value === question.correctAnswer
    }
    case 'short-text': {
      const a = answer as Extract<QuestionAnswer, { type: 'short-text' }>
      return question.acceptedAnswers.some(
        (accepted) =>
          normalize(accepted, question.caseSensitive) === normalize(a.value, question.caseSensitive),
      )
    }
    case 'long-text':
      return false
    case 'numeric': {
      const a = answer as Extract<QuestionAnswer, { type: 'numeric' }>
      return Math.abs(a.value - question.correctValue) <= (question.tolerance ?? 0)
    }
    case 'matching': {
      const a = answer as Extract<QuestionAnswer, { type: 'matching' }>
      return question.pairs.every((pair) => a.pairs[pair.id] === pair.right)
    }
    case 'ordering': {
      const a = answer as Extract<QuestionAnswer, { type: 'ordering' }>
      return (
        a.order.length === question.correctOrder.length &&
        a.order.every((id, i) => id === question.correctOrder[i])
      )
    }
    case 'fill-in-blank': {
      const a = answer as Extract<QuestionAnswer, { type: 'fill-in-blank' }>
      return question.blanks.every((blank) => {
        const given = normalize(a.values[blank.id] ?? '')
        return blank.acceptedAnswers.some((accepted) => normalize(accepted) === given)
      })
    }
  }
}

export interface QuestionResult {
  questionId: string
  autoGraded: boolean
  correct: boolean
}

export interface QuizResult {
  scorePercent: number
  passed: boolean
  pointsEarned: number
  pointsPossible: number
  perQuestion: QuestionResult[]
}

/** Scores a submitted quiz attempt. Long-text questions are excluded from the auto-graded total. */
export function scoreQuiz(quiz: Quiz, answers: QuestionAnswer[]): QuizResult {
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a]))
  let pointsEarned = 0
  let pointsPossible = 0

  const perQuestion = quiz.questions.map((question): QuestionResult => {
    const autoGraded = question.type !== 'long-text'
    const correct = autoGraded && isAnswerCorrect(question, answerByQuestion.get(question.id))
    if (autoGraded) {
      pointsPossible += question.points
      if (correct) pointsEarned += question.points
    }
    return { questionId: question.id, autoGraded, correct }
  })

  const scorePercent = pointsPossible > 0 ? Math.round((pointsEarned / pointsPossible) * 100) : 0
  return {
    scorePercent,
    passed: scorePercent >= quiz.passingScorePercent,
    pointsEarned,
    pointsPossible,
    perQuestion,
  }
}
