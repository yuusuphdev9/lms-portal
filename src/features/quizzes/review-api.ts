import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceReview, type ReviewRecord } from '@/features/quizzes/review-schedule'
import { mapQuestion, type QuestionRow, type Result } from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { Question } from '@/types'

export const reviewKeys = {
  due: ['question-reviews', 'due'] as const,
}

interface QuestionReviewRow {
  question_id: string
  stage: number
  resolved: boolean
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user.id
}

/** Questions currently due for review: ones the student has gotten wrong before and hasn't yet
 *  cleared the full interval ladder for (see `@/features/quizzes/review-schedule`). Capped at 20
 *  per load so a long-overdue queue doesn't try to render all at once. */
export function useDueReviews() {
  return useQuery<Question[]>({
    queryKey: reviewKeys.due,
    queryFn: async () => {
      const userId = await currentUserId()
      const nowIso = new Date().toISOString()

      const { data: due, error } = (await supabase
        .from('question_reviews')
        .select('question_id')
        .eq('user_id', userId)
        .eq('resolved', false)
        .lte('next_review_at', nowIso)
        .order('next_review_at')
        .limit(20)) as Result<{ question_id: string }[]>
      if (error) throw error

      const questionIds = (due ?? []).map((row) => row.question_id)
      if (questionIds.length === 0) return []

      const { data: questions, error: questionsError } = (await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)) as Result<QuestionRow[]>
      if (questionsError) throw questionsError
      return (questions ?? []).map(mapQuestion)
    },
  })
}

interface RecordReviewResultInput {
  questionId: string
  quizId: string
  correct: boolean
}

/** Records one answer given in the Review page, advancing (or resetting) that question's spot
 *  on the interval ladder. Used only by the standalone Review flow — a normal quiz attempt's
 *  review-queue bookkeeping happens inside `useSubmitQuizAttempt` instead. */
export function useRecordReviewResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ questionId, quizId, correct }: RecordReviewResultInput) => {
      const userId = await currentUserId()

      const { data: existing } = (await supabase
        .from('question_reviews')
        .select('stage, resolved')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle()) as Result<ReviewRecord | null>

      const next = advanceReview({ correct, previous: existing ?? undefined })

      const { error } = await supabase.from('question_reviews').upsert({
        user_id: userId,
        question_id: questionId,
        quiz_id: quizId,
        stage: next.stage,
        resolved: next.resolved,
        next_review_at: next.nextReviewAt,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      return next
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.due })
    },
  })
}

/**
 * Called from `useSubmitQuizAttempt` right after a normal quiz attempt is graded. A question
 * only ever enters the review queue once it's missed; an already-queued question that's answered
 * correctly again advances up the ladder. Swallows its own errors (e.g. the `question_reviews`
 * table not existing yet, if this migration hasn't been run) so a review-queue hiccup never
 * blocks the actual quiz submission it's piggybacking on.
 */
export async function syncReviewQueueAfterAttempt(
  userId: string,
  quizId: string,
  perQuestion: { questionId: string; autoGraded: boolean; correct: boolean }[],
): Promise<void> {
  try {
    const graded = perQuestion.filter((q) => q.autoGraded)
    if (graded.length === 0) return

    const { data: existingRows, error } = (await supabase
      .from('question_reviews')
      .select('question_id, stage, resolved')
      .eq('user_id', userId)
      .in(
        'question_id',
        graded.map((q) => q.questionId),
      )) as Result<QuestionReviewRow[]>
    if (error) throw error
    const existingByQuestion = new Map((existingRows ?? []).map((row) => [row.question_id, row]))

    const upserts = graded
      .filter((q) => !q.correct || existingByQuestion.has(q.questionId))
      .map((q) => {
        const previous = existingByQuestion.get(q.questionId)
        const next = advanceReview({ correct: q.correct, previous })
        return {
          user_id: userId,
          question_id: q.questionId,
          quiz_id: quizId,
          stage: next.stage,
          resolved: next.resolved,
          next_review_at: next.nextReviewAt,
          updated_at: new Date().toISOString(),
        }
      })

    if (upserts.length > 0) {
      const { error: upsertError } = await supabase.from('question_reviews').upsert(upserts)
      if (upsertError) throw upsertError
    }
  } catch {
    // Best-effort — see doc comment above.
  }
}
