import { describe, expect, it } from 'vitest'
import { advanceReview } from './review-schedule'

const NOW = new Date('2026-01-01T00:00:00.000Z')

describe('advanceReview', () => {
  it('resets a missed question to stage 0, due immediately', () => {
    const result = advanceReview({ correct: false, previous: { stage: 2, resolved: false }, now: NOW })
    expect(result.stage).toBe(0)
    expect(result.resolved).toBe(false)
    expect(result.nextReviewAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('advances a first-time miss one rung up on its first correct review', () => {
    const result = advanceReview({ correct: true, previous: { stage: 0, resolved: false }, now: NOW })
    expect(result.stage).toBe(1)
    expect(result.resolved).toBe(false)
    expect(result.nextReviewAt).toBe('2026-01-02T00:00:00.000Z') // +1 day
  })

  it('resolves the question once it clears the last rung', () => {
    const result = advanceReview({ correct: true, previous: { stage: 2, resolved: false }, now: NOW })
    expect(result.stage).toBe(3)
    expect(result.resolved).toBe(true)
  })

  it('a wrong answer at any stage always resets to stage 0', () => {
    const result = advanceReview({ correct: false, previous: { stage: 1, resolved: false }, now: NOW })
    expect(result.stage).toBe(0)
    expect(result.resolved).toBe(false)
  })
})
