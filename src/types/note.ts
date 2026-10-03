/**
 * Bookmarked notes domain types.
 */

export interface Note {
  id: string
  userId: string
  courseId: string
  lessonId?: string
  content: string
  isBookmarked: boolean
  /** Timestamp within a video lesson this note is anchored to, in seconds. */
  timestampSeconds?: number
  colorTag?: string
  createdAt: string
  updatedAt: string
}
