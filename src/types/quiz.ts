/**
 * Quiz domain types.
 *
 * Questions are modeled as a discriminated union on `type` so the quiz
 * renderer can pick the right dynamic input component per question, and
 * answers mirror the same union so submissions stay type-safe end to end.
 */

export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'short-text'
  | 'long-text'
  | 'numeric'
  | 'matching'
  | 'ordering'
  | 'fill-in-blank'

export interface QuestionOption {
  id: string
  label: string
}

interface QuestionBase {
  id: string
  quizId: string
  type: QuestionType
  prompt: string
  order: number
  points: number
  explanation?: string
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single-choice'
  options: QuestionOption[]
  correctOptionId: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice'
  options: QuestionOption[]
  correctOptionIds: string[]
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false'
  correctAnswer: boolean
}

export interface ShortTextQuestion extends QuestionBase {
  type: 'short-text'
  acceptedAnswers: string[]
  caseSensitive?: boolean
}

export interface LongTextQuestion extends QuestionBase {
  type: 'long-text'
  /** Long-text answers are manually graded; no automatic correct value. */
  rubric?: string
}

export interface NumericQuestion extends QuestionBase {
  type: 'numeric'
  correctValue: number
  tolerance?: number
}

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching'
  pairs: MatchingPair[]
}

export interface OrderingItem {
  id: string
  label: string
}

export interface OrderingQuestion extends QuestionBase {
  type: 'ordering'
  items: OrderingItem[]
  correctOrder: string[]
}

export interface FillInBlankSlot {
  id: string
  acceptedAnswers: string[]
}

export interface FillInBlankQuestion extends QuestionBase {
  type: 'fill-in-blank'
  /** Template text containing `{{slotId}}` tokens matching `blanks[].id`. */
  template: string
  blanks: FillInBlankSlot[]
}

/** Discriminated union of every dynamic question input type the quiz engine supports. */
export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortTextQuestion
  | LongTextQuestion
  | NumericQuestion
  | MatchingQuestion
  | OrderingQuestion
  | FillInBlankQuestion

export interface Quiz {
  id: string
  courseId: string
  lessonId?: string
  title: string
  description?: string
  questions: Question[]
  passingScorePercent: number
  timeLimitMinutes?: number
  allowRetakes: boolean
  shuffleQuestions?: boolean
}

/** Answers mirror the question union so a submission's shape always matches its question type. */
export interface SingleChoiceAnswer {
  questionId: string
  type: 'single-choice'
  selectedOptionId: string
}

export interface MultipleChoiceAnswer {
  questionId: string
  type: 'multiple-choice'
  selectedOptionIds: string[]
}

export interface TrueFalseAnswer {
  questionId: string
  type: 'true-false'
  value: boolean
}

export interface ShortTextAnswer {
  questionId: string
  type: 'short-text'
  value: string
}

export interface LongTextAnswer {
  questionId: string
  type: 'long-text'
  value: string
}

export interface NumericAnswer {
  questionId: string
  type: 'numeric'
  value: number
}

export interface MatchingAnswer {
  questionId: string
  type: 'matching'
  /** Maps a `MatchingPair.id` (left) to the right-side id the student paired it with. */
  pairs: Record<string, string>
}

export interface OrderingAnswer {
  questionId: string
  type: 'ordering'
  /** Ordered list of `OrderingItem.id`s as arranged by the student. */
  order: string[]
}

export interface FillInBlankAnswer {
  questionId: string
  type: 'fill-in-blank'
  /** Maps a `FillInBlankSlot.id` to the student's entered value. */
  values: Record<string, string>
}

export type QuestionAnswer =
  | SingleChoiceAnswer
  | MultipleChoiceAnswer
  | TrueFalseAnswer
  | ShortTextAnswer
  | LongTextAnswer
  | NumericAnswer
  | MatchingAnswer
  | OrderingAnswer
  | FillInBlankAnswer

export type QuizAttemptStatus = 'in-progress' | 'submitted' | 'graded'

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: QuestionAnswer[]
  status: QuizAttemptStatus
  startedAt: string
  submittedAt?: string
  scorePercent?: number
  passed?: boolean
}
