import { useMutation, useQueryClient } from '@tanstack/react-query'
import { progressKeys } from '@/features/progress/api'
import { api } from '@/lib/api'
import { useApiQuery } from '@/lib/use-api-query'
import type { QuestionAnswer, Quiz, QuizAttempt } from '@/types'

export const quizKeys = {
  all: ['quizzes'] as const,
  detail: (quizId: string) => ['quizzes', quizId] as const,
  attempts: (quizId: string) => ['quizzes', quizId, 'attempts'] as const,
}

export function useQuizzes() {
  return useApiQuery<Quiz[]>(quizKeys.all, '/api/quizzes')
}

export function useQuiz(quizId: string | undefined) {
  return useApiQuery<Quiz>(quizKeys.detail(quizId ?? ''), `/api/quizzes/${quizId ?? ''}`, {
    enabled: Boolean(quizId),
  })
}

export function useQuizAttempts(quizId: string | undefined) {
  return useApiQuery<QuizAttempt[]>(
    quizKeys.attempts(quizId ?? ''),
    `/api/quizzes/${quizId ?? ''}/attempts`,
    { enabled: Boolean(quizId) },
  )
}

interface SubmitQuizAttemptInput {
  quizId: string
  answers: QuestionAnswer[]
  scorePercent: number
  passed: boolean
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, ...body }: SubmitQuizAttemptInput) =>
      api.post<QuizAttempt>(`/api/quizzes/${quizId}/attempts`, body),
    onSuccess: (_attempt, variables) => {
      void queryClient.invalidateQueries({ queryKey: quizKeys.attempts(variables.quizId) })
      void queryClient.invalidateQueries({ queryKey: progressKeys.courses })
      void queryClient.invalidateQueries({ queryKey: ['progress', 'lessons'] })
    },
  })
}
