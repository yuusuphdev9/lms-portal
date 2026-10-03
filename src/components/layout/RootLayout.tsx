import { GraduationCap } from 'lucide-react'
import { Outlet } from 'react-router'
import { MobileNav } from './MobileNav'
import { SidebarNav } from './SidebarNav'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
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

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
