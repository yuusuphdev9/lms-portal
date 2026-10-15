import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router'
import type { FallbackProps } from 'react-error-boundary'

/**
 * Fallback UI for the page-level error boundary in RootLayout. Catches render-time exceptions —
 * a bug in a component, not a failed API call (TanStack Query errors are handled per-query by
 * AsyncData instead, since those are recoverable without tearing down the page tree).
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
        <Link
          to="/"
          onClick={resetErrorBoundary}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/60"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
