import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createTestQueryClient } from '@/test/test-utils'
import { RootLayout } from './RootLayout'

/**
 * Reports an error to the nearest boundary via react-error-boundary's own imperative API,
 * rather than throwing during render. Behaviorally this is what a real bug looks like to the
 * boundary either way, but it sidesteps React's render-phase-crash "recover by synchronously
 * re-rendering" retry — a dev-mode detail that's noisy in a test environment and orthogonal to
 * what this test is actually checking (the boundary's fallback and reset behavior).
 */
function Boom() {
  const { showBoundary } = useErrorBoundary()
  useEffect(() => {
    showBoundary(new Error('Simulated render crash'))
  }, [showBoundary])
  return null
}

/**
 * The error boundary in RootLayout is scoped to the routed page content (see the comment in
 * RootLayout.tsx), so the nav shell should survive a crash, and navigating away — not just
 * clicking "Try again" — should be enough to recover, since `resetKeys` is tied to the route.
 */
describe('RootLayout error boundary', () => {
  function renderAtBoom() {
    return render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={['/boom']}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<p>Dashboard stub</p>} />
              <Route path="boom" element={<Boom />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('shows the fallback UI instead of a blank page when a route crashes', () => {
    renderAtBoom()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Simulated render crash')).toBeInTheDocument()
    // The nav shell keeps rendering — it's outside the boundary.
    expect(screen.getByText('LMS Student Portal')).toBeInTheDocument()
  })

  it('recovers by navigating away, without needing a code change', async () => {
    const user = userEvent.setup()
    renderAtBoom()

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /back to dashboard/i }))

    expect(screen.getByText('Dashboard stub')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})
