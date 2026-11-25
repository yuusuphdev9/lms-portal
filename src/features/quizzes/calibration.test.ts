import { describe, expect, it } from 'vitest'
import type { ConfidenceLevel } from '@/types'
import { calibrateConfidence, summarizeCalibration } from './calibration'
import type { QuestionResult } from './scoring'

function result(questionId: string, autoGraded: boolean, correct: boolean): QuestionResult {
  return { questionId, autoGraded, correct }
}

describe('calibrateConfidence', () => {
  it('buckets auto-graded questions by their rated confidence level', () => {
    const perQuestion = [result('q1', true, true), result('q2', true, false), result('q3', true, true)]
    const confidences: Record<string, ConfidenceLevel> = { q1: 'high', q2: 'high', q3: 'low' }

    const buckets = calibrateConfidence(perQuestion, confidences)

    const high = buckets.find((b) => b.level === 'high')
    const low = buckets.find((b) => b.level === 'low')
    const medium = buckets.find((b) => b.level === 'medium')

    expect(high).toEqual({ level: 'high', answered: 2, correct: 1, accuracyPercent: 50 })
    expect(low).toEqual({ level: 'low', answered: 1, correct: 1, accuracyPercent: 100 })
    expect(medium).toEqual({ level: 'medium', answered: 0, correct: 0, accuracyPercent: 0 })
  })

  it('excludes unrated questions and long-text questions from every bucket', () => {
    const perQuestion = [result('q1', true, true), result('q2', false, false)]
    // q2 is never auto-graded (long-text); q3 was never rated at all.
    const confidences: Record<string, ConfidenceLevel> = { q2: 'high' }

    const buckets = calibrateConfidence(perQuestion, confidences)

    expect(buckets.every((b) => b.answered === 0)).toBe(true)
  })
})

describe('summarizeCalibration', () => {
  it('is well-calibrated when "Certain" accuracy beats "Not sure" accuracy', () => {
    const buckets = calibrateConfidence(
      [result('q1', true, true), result('q2', true, true), result('q3', true, false)],
      { q1: 'high', q2: 'high', q3: 'low' },
    )
    expect(summarizeCalibration(buckets)).toBe('well-calibrated')
  })

  it('is overconfident when "Certain" accuracy is no better than "Not sure" accuracy', () => {
    const buckets = calibrateConfidence(
      [result('q1', true, false), result('q2', true, true)],
      { q1: 'high', q2: 'low' },
    )
    expect(summarizeCalibration(buckets)).toBe('overconfident')
  })

  it('reports not-enough-data when one end of the scale has no rated questions', () => {
    const buckets = calibrateConfidence([result('q1', true, true)], { q1: 'high' })
    expect(summarizeCalibration(buckets)).toBe('not-enough-data')
  })
})
