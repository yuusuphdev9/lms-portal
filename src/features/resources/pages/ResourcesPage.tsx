import { useEffect, useState } from 'react'
import type { Resource } from '@/types'

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[] | null>(null)

  useEffect(() => {
    void fetch('/api/resources')
      .then((res) => res.json() as Promise<Resource[]>)
      .then(setResources)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Resource Hub</h1>
      <ul className="flex flex-col gap-2">
        {resources?.map((resource) => (
          <li
            key={resource.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{resource.title}</p>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </div>
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
              {resource.fileType}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
