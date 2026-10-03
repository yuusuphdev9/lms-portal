import { LayoutDashboard, ListChecks, NotebookPen, FolderDown } from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quizzes', label: 'Quizzes', icon: ListChecks },
  { to: '/resources', label: 'Resources', icon: FolderDown },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
]
