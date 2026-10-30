import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { ErrorFallback } from '@/components/error-boundary/ErrorFallback'
import { MobileNav } from './MobileNav'
import { SidebarNav } from './SidebarNav'

export function RootLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <MobileNav />
        <div className="flex items-center gap-2.5">
          <SproutMark className="size-7 shrink-0 text-primary" />
          <span className="font-heading text-[15px] font-semibold tracking-tight">
            LMS Student Portal
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
          <SidebarNav />
        </aside>

        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-6 focus:outline-none">
          {/*
           * Scoped to the page content, not the whole app: if a page throws, the nav shell
           * survives so the student can navigate away instead of being stuck on a blank screen.
           * `resetKeys` ties the boundary to the current route, so simply navigating elsewhere
           * also clears the error without needing the "Try again" button.
           */}
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                resetKeys={[location.pathname]}
                FallbackComponent={ErrorFallback}
              >
                {/* Code-split routes (see router.tsx) resolve their chunk the first time they're
                    visited; this fallback covers that brief gap the same way AsyncData covers a
                    query's loading state. */}
                <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </main>
      </div>
    </div>
  )
}

/**
 * A small custom sprout mark for the nav brand, in place of a stock icon-in-a-box. Nods to the
 * botany-flavored course catalog without being literal about it, and a slightly imperfect,
 * hand-drawn curve reads less "generated" than a geometrically perfect icon library glyph.
 */
function SproutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 24V13.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M14 15c0-4.8-3.6-7.4-8.4-7.6C5.4 12.6 8.4 16 14 15Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M14 11.6c0-4.2 3-6.6 7.4-6.8.2 4.6-2.6 7.6-7.4 6.8Z"
        fill="currentColor"
      />
    </svg>
  )
}
