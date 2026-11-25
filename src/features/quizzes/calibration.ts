import type { ConfidenceLevel } from '@/types'
import type { QuestionResult } from './scoring'

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['low', 'medium', 'high']

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Not sure',
  medium: 'Fairly sure',
  high: 'Certain',
}

const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = { low: 0, medium: 1, high: 2 }

export type ConfidenceAccuracyVerdict =
  | 'strong-confident'
  | 'strong-unsure'
  | 'weak-confident'
  | 'weak-unsure'
  | 'not-enough-data'

export interface ConfidenceAccuracySummary {
  verdict: ConfidenceAccuracyVerdict
  headline: string
  detail: string
}

/**
 * One plain-language read on how a quiz attempt went, crossing whether the student actually
 * passed with how sure they said they were while answering — e.g. "strong and confident" vs.
 * "confident, but not quite there". Replaces an earlier per-confidence-level accuracy table that
 * was harder to read at a glance than a single headline.
 */
export function summarizeConfidenceAccuracy(
  passed: boolean,
  perQuestion: QuestionResult[],
  confidences: Record<string, ConfidenceLevel>,
): ConfidenceAccuracySummary {
  const rated = perQuestion.filter((q) => q.autoGraded && confidences[q.questionId] !== undefined)

  if (rated.length === 0) {
    return {
      verdict: 'not-enough-data',
      headline: "You didn't rate your confidence",
      detail: 'Rate how sure you are on each question next time to see this breakdown.',
    }
  }

  const averageConfidence =
    rated.reduce((sum, q) => sum + CONFIDENCE_SCORE[confidences[q.questionId] ?? 'low'], 0) / rated.length
  const feltConfident = averageConfidence >= 1 // average of "Fairly sure" or higher

  if (passed && feltConfident) {
    return {
      verdict: 'strong-confident',
      headline: 'Strong and confident',
      detail: 'You knew the material, and your confidence matched it.',
    }
  }
  if (passed && !feltConfident) {
    return {
      verdict: 'strong-unsure',
      headline: 'Stronger than you think',
      detail: 'You passed even though you doubted yourself on several questions — trust your instincts more.',
    }
  }
  if (!passed && feltConfident) {
    return {
      verdict: 'weak-confident',
      headline: 'Confident, but not quite there',
      detail: "You felt sure, but the score says this material needs another pass before it's solid.",
    }
  }
  return {
    verdict: 'weak-unsure',
    headline: 'Right to be unsure',
    detail: "Your instincts were accurate — this is the material worth reviewing next.",
  }
}
