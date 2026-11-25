/**
 * Spaced-repetition scheduling for the review queue. Deliberately not a full SM-2
 * implementation — a question only enters the ladder once it's been missed at least once,
 * then climbs a fixed set of intervals each time it's answered correctly again (in a later
 * quiz attempt or in the dedicated Review page), resetting to the start on any wrong answer.
 * Clearing the last rung marks it resolved, so it stops being resurfaced.
 */

/** Days to wait before the next review, indexed by stage (0 = just missed). */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7] as const

export interface ReviewRecord {
  stage: number
  resolved: boolean
}

export interface AdvanceReviewInput {
  correct: boolean
  /**
   * The question's current review-queue row, if it has one yet. Only pass `undefined` when
   * `correct` is also `false` (a question missed for the first time, with nothing to advance
   * from yet) — callers should never invoke this for a question answered correctly that has no
   * existing row, since that question was never missed and shouldn't enter the queue at all.
   */
  previous?: ReviewRecord | undefined
  now?: Date
}

export interface AdvanceReviewResult {
  stage: number
  resolved: boolean
  nextReviewAt: string
}

export function advanceReview({ correct, previous, now = new Date() }: AdvanceReviewInput): AdvanceReviewResult {
  if (!correct) {
    return { stage: 0, resolved: false, nextReviewAt: addDays(now, REVIEW_INTERVALS_DAYS[0]).toISOString() }
  }

  const nextStage = (previous?.stage ?? -1) + 1
  if (nextStage >= REVIEW_INTERVALS_DAYS.length) {
    // Cleared every rung — stop resurfacing it. `nextReviewAt` is set far out mostly so the
    // column never holds a meaningless "due now" timestamp; `resolved` is what actually
    // excludes it from the queue.
    return { stage: REVIEW_INTERVALS_DAYS.length, resolved: true, nextReviewAt: addDays(now, 365).toISOString() }
  }

  const intervalDays = REVIEW_INTERVALS_DAYS[nextStage] ?? REVIEW_INTERVALS_DAYS[0]
  return { stage: nextStage, resolved: false, nextReviewAt: addDays(now, intervalDays).toISOString() }
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
