import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { progressKeys } from '@/features/progress/api'
import { reviewKeys, syncReviewQueueAfterAttempt } from '@/features/quizzes/review-api'
import type { QuestionResult } from '@/features/quizzes/scoring'
import {
  assertFound,
  mapQuestion,
  mapQuiz,
  mapQuizAttempt,
  type QuestionRow,
  type QuizAttemptRow,
  type QuizRow,
  type Result,
} from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { ConfidenceLevel, QuestionAnswer, Quiz, QuizAttempt } from '@/types'

export const quizKeys = {
  all: ['quizzes'] as const,
  detail: (quizId: string) => ['quizzes', quizId] as const,
  attempts: (quizId: string) => ['quizzes', quizId, 'attempts'] as const,
}

async function fetchQuestions(quizId: string) {
  const { data, error } = (await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index')) as Result<QuestionRow[]>
  if (error) throw error
  return (data ?? []).map(mapQuestion)
}

async function fetchQuizWithQuestions(quizId: string): Promise<Quiz> {
  const [{ data: quiz, error: quizError }, questions] = await Promise.all([
    supabase.from('quizzes').select('*').eq('id', quizId).single() as unknown as Promise<Result<QuizRow>>,
    fetchQuestions(quizId),
  ])
  if (quizError) throw quizError
  return mapQuiz(assertFound(quiz, 'Quiz'), questions)
}

export function useQuizzes() {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.all,
    queryFn: async () => {
      const { data, error } = (await supabase.from('quizzes').select('*')) as Result<QuizRow[]>
      if (error) throw error
      return Promise.all((data ?? []).map(async (row) => mapQuiz(row, await fetchQuestions(row.id))))
    },
  })
}

export function useQuiz(quizId: string | undefined) {
  return useQuery<Quiz>({
    queryKey: quizKeys.detail(quizId ?? ''),
    queryFn: () => fetchQuizWithQuestions(quizId ?? ''),
    enabled: Boolean(quizId),
  })
}

export function useQuizAttempts(quizId: string | undefined) {
  return useQuery<QuizAttempt[]>({
    queryKey: quizKeys.attempts(quizId ?? ''),
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)) as Result<QuizAttemptRow[]>
      if (error) throw error
      return (data ?? []).map(mapQuizAttempt)
    },
    enabled: Boolean(quizId),
  })
}

interface SubmitQuizAttemptInput {
  quizId: string
  answers: QuestionAnswer[]
  /** Self-rated confidence per question id — optional per question; see `ConfidenceLevel`. */
  confidences: Record<string, ConfidenceLevel>
  /** Per-question correctness from `scoreQuiz`, used only to update the review queue below —
   *  not persisted as its own column (it's derivable from `answers` + the question bank). */
  perQuestion: QuestionResult[]
  scorePercent: number
  passed: boolean
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
      confidences,
      perQuestion,
      scorePercent,
      passed,
    }: SubmitQuizAttemptInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user.id
      if (!userId) throw new Error('You need to be signed in to submit a quiz.')

      const nowIso = new Date().toISOString()
      const { data: attempt, error } = (await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          user_id: userId,
          answers,
          confidences,
          status: 'graded',
          submitted_at: nowIso,
          score_percent: scorePercent,
          passed,
        })
        .select()
        .single()) as Result<QuizAttemptRow>
      if (error) throw error

      // Mirrors the old MSW mock handler: finishing a quiz marks its linked lesson complete,
      // which in turn fires the course_progress recalculation trigger.
      const { data: quiz } = (await supabase
        .from('quizzes')
        .select('lesson_id, course_id')
        .eq('id', quizId)
        .single()) as Result<{ lesson_id: string | null; course_id: string }>
      if (quiz?.lesson_id) {
        await supabase.from('lesson_progress').upsert({
          lesson_id: quiz.lesson_id,
          course_id: quiz.course_id,
          user_id: userId,
          status: 'completed',
          progress_percent: 100,
          completed_at: nowIso,
          updated_at: nowIso,
        })
      }

      // Best-effort: advances (or resets) the spaced-repetition review queue for this quiz's
      // questions. Never throws — see syncReviewQueueAfterAttempt's own doc comment.
      await syncReviewQueueAfterAttempt(userId, quizId, perQuestion)

      return mapQuizAttempt(assertFound(attempt, 'Quiz attempt'))
    },
    onSuccess: (_attempt, variables) => {
      void queryClient.invalidateQueries({ queryKey: quizKeys.attempts(variables.quizId) })
      void queryClient.invalidateQueries({ queryKey: progressKeys.courses })
      void queryClient.invalidateQueries({ queryKey: ['progress', 'lessons'] })
      void queryClient.invalidateQueries({ queryKey: reviewKeys.due })
    },
  })
}
