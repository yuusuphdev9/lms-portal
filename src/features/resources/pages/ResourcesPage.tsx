import {
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image,
  Link2,
  Music,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { AsyncData } from '@/components/ui/async-data'
import { useCourses } from '@/features/course-player/api'
import { useDownloadResource, useResources } from '@/features/resources/api'
import type { Resource, ResourceFileType } from '@/types'

const fileTypeIcon: Record<ResourceFileType, LucideIcon> = {
  pdf: FileText,
  slide: FileText,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  archive: FileArchive,
  image: Image,
  audio: Music,
  video: Video,
  link: Link2,
  other: FileText,
}

export function ResourcesPage() {
  const resourcesQuery = useResources()
  const { data: courses } = useCourses()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Resource Hub</h1>

      <AsyncData
        query={resourcesQuery}
        loadingText="Loading resources…"
        errorText="Couldn't load the resource hub."
        isEmpty={(resources) => resources.length === 0}
        emptyText="No resources available yet."
      >
        {(resources) => (
          <ul className="flex flex-col gap-2">
            {resources.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                courseTitle={courses?.find((c) => c.id === resource.courseId)?.title}
              />
            ))}
          </ul>
        )}
      </AsyncData>
    </div>
  )
}

function ResourceRow({
  resource,
  courseTitle,
}: {
  resource: Resource
  courseTitle: string | undefined
}) {
  const downloadResource = useDownloadResource()
  const Icon = fileTypeIcon[resource.fileType]

  const handleDownload = () => {
    downloadResource.mutate(resource.id, {
      onSuccess: () => {
        window.open(resource.fileUrl, '_blank', 'noreferrer')
      },
    })
  }

  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-medium">{resource.title}</p>
        {resource.description && (
          <p className="truncate text-sm text-muted-foreground">{resource.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {courseTitle && <span>{courseTitle}</span>}
          <span className="uppercase tracking-wide">{resource.fileType}</span>
          <span>{resource.downloadCount} downloads</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloadResource.isPending}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent/60 disabled:opacity-50"
      >
        <Download className="size-3.5" />
        Download
      </button>
    </li>
  )
}
