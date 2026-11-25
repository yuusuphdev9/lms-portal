import { describe, expect, it } from 'vitest'
import type { ConfidenceLevel } from '@/types'
import { summarizeConfidenceAccuracy } from './calibration'
import type { QuestionResult } from './scoring'

function result(questionId: string, autoGraded: boolean, correct: boolean): QuestionResult {
  return { questionId, autoGraded, correct }
}

describe('summarizeConfidenceAccuracy', () => {
  it('is strong-confident when the student passed and mostly rated themselves sure', () => {
    const perQuestion = [result('q1', true, true), result('q2', true, true)]
    const confidences: Record<string, ConfidenceLevel> = { q1: 'high', q2: 'medium' }

    expect(summarizeConfidenceAccuracy(true, perQuestion, confidences).verdict).toBe('strong-confident')
  })

  it('is strong-unsure when the student passed but mostly rated themselves unsure', () => {
    const perQuestion = [result('q1', true, true), result('q2', true, true)]
    const confidences: Record<string, ConfidenceLevel> = { q1: 'low', q2: 'low' }

    expect(summarizeConfidenceAccuracy(true, perQuestion, confidences).verdict).toBe('strong-unsure')
  })

  it('is weak-confident when the student failed but mostly rated themselves sure', () => {
    const perQuestion = [result('q1', true, false), result('q2', true, false)]
    const confidences: Record<string, ConfidenceLevel> = { q1: 'high', q2: 'high' }

    expect(summarizeConfidenceAccuracy(false, perQuestion, confidences).verdict).toBe('weak-confident')
  })

  it('is weak-unsure when the student failed and mostly rated themselves unsure', () => {
    const perQuestion = [result('q1', true, false), result('q2', true, false)]
    const confidences: Record<string, ConfidenceLevel> = { q1: 'low', q2: 'medium' }

    expect(summarizeConfidenceAccuracy(false, perQuestion, confidences).verdict).toBe('weak-unsure')
  })

  it('reports not-enough-data when nothing was rated', () => {
    const perQuestion = [result('q1', true, true)]
    expect(summarizeConfidenceAccuracy(true, perQuestion, {}).verdict).toBe('not-enough-data')
  })

  it('ignores long-text questions and unrated questions when averaging confidence', () => {
    const perQuestion = [result('q1', true, true), result('q2', false, false)]
    // q2 is never auto-graded and q1 is the only rated question — average should rest on q1 alone.
    const confidences: Record<string, ConfidenceLevel> = { q1: 'high', q2: 'low' }

    expect(summarizeConfidenceAccuracy(true, perQuestion, confidences).verdict).toBe('strong-confident')
  })
})
