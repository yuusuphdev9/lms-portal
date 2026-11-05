/**
 * Downloadable resource hub domain types.
 */

export type ResourceFileType =
  | 'pdf'
  | 'slide'
  | 'doc'
  | 'spreadsheet'
  | 'archive'
  | 'image'
  | 'audio'
  | 'video'
  | 'link'
  | 'other'

export interface Resource {
  id: string
  title: string
  description?: string
  fileType: ResourceFileType
  fileUrl: string
  fileSizeBytes?: number
  courseId?: string
  moduleId?: string
  lessonId?: string
  tags?: string[]
  /** Not every resource is attributed to a real account — seeded catalog content leaves this unset. */
  uploadedBy?: string
  uploadedAt: string
  downloadCount: number
}
