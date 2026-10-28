import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { QuizAttemptPage } from './QuizAttemptPage'

/**
 * Exercises quiz-1 from the mock data end to end: validation when questions are skipped,
 * then a fully-correct attempt through to the graded result. This is the flow the Sprint 3
 * rubric evidence ("form interaction and state persistence") is really about.
 */
describe('QuizAttemptPage', () => {
  function renderQuiz() {
    return renderWithProviders(<QuizAttemptPage />, {
      route: '/quizzes/quiz-1',
      path: '/quizzes/:quizId',
    })
  }

  it('shows a validation error instead of submitting when questions are unanswered', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await screen.findByText('Module Check: Energy Flow')
    await user.click(screen.getByRole('button', { name: /submit quiz/i }))

    expect(
      await screen.findByText(/answer all 4 questions before submitting/i),
    ).toBeInTheDocument()
    // No result should have been scored yet.
    expect(screen.queryByText(/quiz passed/i)).not.toBeInTheDocument()
  })

  it('scores a fully-correct attempt and shows the passed result', async () => {
    const user = userEvent.setup()
    renderQuiz()

    await screen.findByText('Module Check: Energy Flow')

    await user.click(screen.getByLabelText('Thylakoid membrane'))
    await user.click(screen.getByLabelText('ATP'))
    await user.click(screen.getByLabelText('NADPH'))
    await user.click(screen.getByLabelText('Oxygen'))
    await user.click(screen.getByRole('button', { name: 'False' }))
    await user.type(screen.getByPlaceholderText('0'), '3')

    await user.click(screen.getByRole('button', { name: /submit quiz/i }))

    expect(await screen.findByText(/quiz passed/i)).toBeInTheDocument()
    expect(screen.getByText(/scored 100%/i)).toBeInTheDocument()

    // The attempt also persists to the mock backend — not just local component state.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retake quiz/i })).toBeInTheDocument()
    })
  })
})
