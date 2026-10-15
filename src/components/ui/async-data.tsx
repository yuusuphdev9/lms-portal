import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

interface AsyncDataProps<T> {
  query: UseQueryResult<T>
  loadingText: string
  errorText?: string
  isEmpty?: (data: T) => boolean
  emptyText?: string
  children: (data: T) => ReactNode
}

/**
 * Generic loading/error/empty/success gate for a TanStack Query result. Every list and detail
 * page used to repeat its own `{isLoading && ...}` check with no error handling at all, which is
 * exactly how the dashboard once got stuck on "Loading…" forever when a query failed instead of
 * resolving (see Sprint 3). This replaces that pattern once, for whatever `T` the query returns,
 * with a path for all four states instead of just the happy one.
 */
export function AsyncData<T>({
  query,
  loadingText,
  errorText,
  isEmpty,
  emptyText,
  children,
}: AsyncDataProps<T>) {
  if (query.status === 'pending') {
    return <p className="text-sm text-muted-foreground">{loadingText}</p>
  }

  if (query.status === 'error') {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {errorText ?? 'Something went wrong loading this.'}
        </p>
        <button
          type="button"
          onClick={() => {
            void query.refetch()
          }}
          className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent/60"
        >
          Try again
        </button>
      </div>
    )
  }

  if (isEmpty?.(query.data) && emptyText) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>
  }

  return <>{children(query.data)}</>
}
