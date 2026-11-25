import type { ConfidenceLevel } from '@/types'
import type { QuestionResult } from './scoring'

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['low', 'medium', 'high']

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Not sure',
  medium: 'Fairly sure',
  high: 'Certain',
}

export interface CalibrationBucket {
  level: ConfidenceLevel
  answered: number
  correct: number
  accuracyPercent: number
}

/**
 * Buckets a quiz result's auto-graded questions by the student's self-rated confidence on each
 * one, so accuracy can be compared against how sure they felt. Questions left unrated (no entry
 * in `confidences`) and long-text questions (never auto-graded) are excluded from every bucket.
 */
export function calibrateConfidence(
  perQuestion: QuestionResult[],
  confidences: Record<string, ConfidenceLevel>,
): CalibrationBucket[] {
  return CONFIDENCE_LEVELS.map((level) => {
    const matching = perQuestion.filter((q) => q.autoGraded && confidences[q.questionId] === level)
    const correct = matching.filter((q) => q.correct).length
    return {
      level,
      answered: matching.length,
      correct,
      accuracyPercent: matching.length > 0 ? Math.round((correct / matching.length) * 100) : 0,
    }
  })
}

export type CalibrationVerdict = 'well-calibrated' | 'overconfident' | 'not-enough-data'

/**
 * A one-line read on the shape of the buckets, comparing the two ends of the scale: being more
 * accurate on "Certain" questions than "Not sure" ones is the expected, well-calibrated pattern.
 * Scoring no better (or worse) on "Certain" questions means confidence isn't tracking accuracy.
 * Needs at least one rated question at both ends to say anything meaningful.
 */
export function summarizeCalibration(buckets: CalibrationBucket[]): CalibrationVerdict {
  const low = buckets.find((b) => b.level === 'low')
  const high = buckets.find((b) => b.level === 'high')
  if (!low || !high || low.answered === 0 || high.answered === 0) return 'not-enough-data'

  return high.accuracyPercent > low.accuracyPercent ? 'well-calibrated' : 'overconfident'
}
