import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'

/**
 * A fresh, per-test QueryClient. Retries are disabled so a deliberately-failing query in a test
 * reaches its error state immediately instead of waiting through TanStack Query's retry backoff.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions {
  /** The URL the memory router starts on. */
  route?: string
  /**
   * A route pattern to match `route` against (e.g. `/quizzes/:quizId`). Only needed when the
   * component under test reads params via `useParams` — otherwise it's rendered directly.
   */
  path?: string
  queryClient?: QueryClient
}

/** Wraps a component with the providers every page in this app actually needs: query + router. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path, queryClient = createTestQueryClient() }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  const element = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  )

  return render(element, { wrapper: Wrapper })
}
