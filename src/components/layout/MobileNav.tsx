import { Dialog } from '@base-ui/react/dialog'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { SidebarNav } from './SidebarNav'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden">
        <Menu className="size-5" />
        <span className="sr-only">Open navigation</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 data-closed:opacity-0 data-open:opacity-100 transition-opacity" />
        <Dialog.Popup className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform data-closed:-translate-x-full data-open:translate-x-0">
          <div className="flex items-center justify-between border-b border-sidebar-border p-3">
            <Dialog.Title className="px-1 text-sm font-semibold text-sidebar-foreground">
              Menu
            </Dialog.Title>
            <Dialog.Close className="inline-flex size-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent">
              <X className="size-4" />
              <span className="sr-only">Close navigation</span>
            </Dialog.Close>
          </div>
          <SidebarNav
            onNavigate={() => {
              setOpen(false)
            }}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
