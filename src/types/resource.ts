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
  uploadedBy: string
  uploadedAt: string
  downloadCount: number
}
