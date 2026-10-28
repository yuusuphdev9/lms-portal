import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseQueryResult } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { AsyncData } from './async-data'

/**
 * `AsyncData` only reads `status`, `data`, and `refetch` off the query result, so a minimal
 * stand-in is enough — no need to stand up a real QueryClient for a component-level test.
 */
function makeQuery<T>(overrides: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return {
    status: 'pending',
    data: undefined,
    refetch: vi.fn(),
    ...overrides,
  } as UseQueryResult<T>
}

describe('AsyncData', () => {
  it('shows the loading text while the query is pending', () => {
    render(
      <AsyncData query={makeQuery({ status: 'pending' })} loadingText="Loading courses…">
        {() => <p>content</p>}
      </AsyncData>,
    )
    expect(screen.getByText('Loading courses…')).toBeInTheDocument()
  })

  it('shows the error text and a working retry button when the query fails', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    render(
      <AsyncData
        query={makeQuery({ status: 'error', refetch })}
        loadingText="Loading…"
        errorText="Couldn't load your dashboard."
      >
        {() => <p>content</p>}
      </AsyncData>,
    )

    expect(screen.getByText("Couldn't load your dashboard.")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('shows the empty text when the data has loaded but isEmpty matches', () => {
    render(
      <AsyncData
        query={makeQuery<string[]>({ status: 'success', data: [] })}
        loadingText="Loading…"
        isEmpty={(data) => data.length === 0}
        emptyText="No notes yet — add one above."
      >
        {() => <p>content</p>}
      </AsyncData>,
    )
    expect(screen.getByText('No notes yet — add one above.')).toBeInTheDocument()
  })

  it('renders the children with the data on success', () => {
    render(
      <AsyncData query={makeQuery<string[]>({ status: 'success', data: ['a', 'b'] })} loadingText="Loading…">
        {(data) => <p>{data.join(', ')}</p>}
      </AsyncData>,
    )
    expect(screen.getByText('a, b')).toBeInTheDocument()
  })
})
