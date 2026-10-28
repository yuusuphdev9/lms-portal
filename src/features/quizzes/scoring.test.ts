import { describe, expect, it } from 'vitest'
import type {
  FillInBlankQuestion,
  MatchingQuestion,
  NumericQuestion,
  OrderingQuestion,
  Quiz,
  ShortTextQuestion,
  SingleChoiceQuestion,
} from '@/types'
import { isAnswerCorrect, scoreQuiz } from './scoring'

const singleChoice: SingleChoiceQuestion = {
  id: 'q1',
  quizId: 'quiz-1',
  type: 'single-choice',
  prompt: 'Pick the right one',
  order: 1,
  points: 10,
  options: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ],
  correctOptionId: 'b',
}

const numeric: NumericQuestion = {
  id: 'q2',
  quizId: 'quiz-1',
  type: 'numeric',
  prompt: 'How many?',
  order: 2,
  points: 10,
  correctValue: 3,
  tolerance: 0.5,
}

const shortText: ShortTextQuestion = {
  id: 'q3',
  quizId: 'quiz-1',
  type: 'short-text',
  prompt: 'Name it',
  order: 3,
  points: 10,
  acceptedAnswers: ['infinite', 'infinity'],
  caseSensitive: false,
}

const matching: MatchingQuestion = {
  id: 'q4',
  quizId: 'quiz-1',
  type: 'matching',
  prompt: 'Match them',
  order: 4,
  points: 10,
  pairs: [
    { id: 'p1', left: 'Inverting', right: '-Rf/Rin' },
    { id: 'p2', left: 'Follower', right: '1' },
  ],
}

const ordering: OrderingQuestion = {
  id: 'q5',
  quizId: 'quiz-1',
  type: 'ordering',
  prompt: 'Order the steps',
  order: 5,
  points: 10,
  items: [
    { id: 's1', label: 'First' },
    { id: 's2', label: 'Second' },
  ],
  correctOrder: ['s1', 's2'],
}

const fillInBlank: FillInBlankQuestion = {
  id: 'q6',
  quizId: 'quiz-1',
  type: 'fill-in-blank',
  prompt: 'Fill it in',
  order: 6,
  points: 10,
  template: 'Op-amps have {{b1}} gain.',
  blanks: [{ id: 'b1', acceptedAnswers: ['infinite'] }],
}

describe('isAnswerCorrect', () => {
  it('returns false when the answer type does not match the question type', () => {
    expect(
      isAnswerCorrect(singleChoice, { questionId: 'q1', type: 'numeric', value: 1 }),
    ).toBe(false)
  })

  it('returns false when there is no answer at all', () => {
    expect(isAnswerCorrect(singleChoice, undefined)).toBe(false)
  })

  it('grades single-choice against the correct option id', () => {
    expect(
      isAnswerCorrect(singleChoice, { questionId: 'q1', type: 'single-choice', selectedOptionId: 'b' }),
    ).toBe(true)
    expect(
      isAnswerCorrect(singleChoice, { questionId: 'q1', type: 'single-choice', selectedOptionId: 'a' }),
    ).toBe(false)
  })

  it('grades numeric answers within tolerance', () => {
    expect(isAnswerCorrect(numeric, { questionId: 'q2', type: 'numeric', value: 3.4 })).toBe(true)
    expect(isAnswerCorrect(numeric, { questionId: 'q2', type: 'numeric', value: 4 })).toBe(false)
  })

  it('grades short-text case-insensitively against any accepted answer', () => {
    expect(
      isAnswerCorrect(shortText, { questionId: 'q3', type: 'short-text', value: 'INFINITY' }),
    ).toBe(true)
    expect(
      isAnswerCorrect(shortText, { questionId: 'q3', type: 'short-text', value: '  infinite  ' }),
    ).toBe(true)
    expect(
      isAnswerCorrect(shortText, { questionId: 'q3', type: 'short-text', value: 'zero' }),
    ).toBe(false)
  })

  it('grades matching only when every pair is matched correctly', () => {
    expect(
      isAnswerCorrect(matching, {
        questionId: 'q4',
        type: 'matching',
        pairs: { p1: '-Rf/Rin', p2: '1' },
      }),
    ).toBe(true)
    expect(
      isAnswerCorrect(matching, {
        questionId: 'q4',
        type: 'matching',
        pairs: { p1: '1', p2: '-Rf/Rin' },
      }),
    ).toBe(false)
  })

  it('grades ordering only when every position matches exactly', () => {
    expect(
      isAnswerCorrect(ordering, { questionId: 'q5', type: 'ordering', order: ['s1', 's2'] }),
    ).toBe(true)
    expect(
      isAnswerCorrect(ordering, { questionId: 'q5', type: 'ordering', order: ['s2', 's1'] }),
    ).toBe(false)
  })

  it('grades fill-in-blank per slot, case-insensitively', () => {
    expect(
      isAnswerCorrect(fillInBlank, {
        questionId: 'q6',
        type: 'fill-in-blank',
        values: { b1: 'Infinite' },
      }),
    ).toBe(true)
    expect(
      isAnswerCorrect(fillInBlank, { questionId: 'q6', type: 'fill-in-blank', values: {} }),
    ).toBe(false)
  })

  it('never auto-grades long-text as correct', () => {
    expect(
      isAnswerCorrect(
        { id: 'q7', quizId: 'quiz-1', type: 'long-text', prompt: 'Explain', order: 7, points: 10 },
        { questionId: 'q7', type: 'long-text', value: 'a thoughtful essay' },
      ),
    ).toBe(false)
  })
})

describe('scoreQuiz', () => {
  const quiz: Quiz = {
    id: 'quiz-1',
    courseId: 'course-1',
    title: 'Mixed quiz',
    passingScorePercent: 70,
    allowRetakes: true,
    questions: [singleChoice, numeric],
  }

  it('computes percent score from points earned over points possible', () => {
    const result = scoreQuiz(quiz, [
      { questionId: 'q1', type: 'single-choice', selectedOptionId: 'b' },
      { questionId: 'q2', type: 'numeric', value: 3 },
    ])
    expect(result.pointsEarned).toBe(20)
    expect(result.pointsPossible).toBe(20)
    expect(result.scorePercent).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('marks the attempt as failed when the score is under the passing threshold', () => {
    const result = scoreQuiz(quiz, [
      { questionId: 'q1', type: 'single-choice', selectedOptionId: 'a' },
      { questionId: 'q2', type: 'numeric', value: 3 },
    ])
    expect(result.scorePercent).toBe(50)
    expect(result.passed).toBe(false)
  })

  it('excludes long-text questions from the auto-graded total entirely', () => {
    const quizWithEssay: Quiz = {
      ...quiz,
      questions: [
        singleChoice,
        { id: 'q7', quizId: 'quiz-1', type: 'long-text', prompt: 'Explain', order: 3, points: 50 },
      ],
    }
    const result = scoreQuiz(quizWithEssay, [
      { questionId: 'q1', type: 'single-choice', selectedOptionId: 'b' },
      { questionId: 'q7', type: 'long-text', value: 'an answer' },
    ])
    // Only the 10-point single-choice question counts toward the total — the 50-point essay is excluded.
    expect(result.pointsPossible).toBe(10)
    expect(result.scorePercent).toBe(100)
    const essayResult = result.perQuestion.find((q) => q.questionId === 'q7')
    expect(essayResult?.autoGraded).toBe(false)
  })

  it('treats an unanswered question as incorrect rather than throwing', () => {
    const result = scoreQuiz(quiz, [{ questionId: 'q1', type: 'single-choice', selectedOptionId: 'b' }])
    expect(result.pointsEarned).toBe(10)
    expect(result.pointsPossible).toBe(20)
  })
})
