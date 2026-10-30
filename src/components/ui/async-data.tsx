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
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex gap-0.5" aria-hidden="true">
          <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-current" />
        </span>
        {loadingText}
      </p>
    )
  }

  if (query.status === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-4" />
        </span>
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-medium text-destructive">
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
      </div>
    )
  }

  if (isEmpty?.(query.data) && emptyText) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <EmptyDoodle className="size-14 text-muted-foreground/60" />
        <p className="max-w-[28ch] text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return <>{children(query.data)}</>
}

/** A small sketched "empty box" doodle, in place of blank white space with just a sentence in it. */
function EmptyDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 26 32 16l22 10-22 10-22-10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 26v22l22 10 22-10V26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 36v22" stroke="currentColor" strokeWidth="2" />
      <path d="M24 12l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
