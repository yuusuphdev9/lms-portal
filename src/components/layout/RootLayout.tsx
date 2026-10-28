import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'
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
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
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
