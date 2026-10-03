import type { Note } from '@/types'
import { currentUser } from './users'

export const notes: Note[] = [
  {
    id: 'note-1',
    userId: currentUser.id,
    courseId: 'course-1',
    lessonId: 'lesson-1',
    content: 'Photosystem II splits water to replace the electron lost to the electron transport chain.',
    isBookmarked: true,
    timestampSeconds: 184,
    colorTag: 'amber',
    createdAt: '2026-08-20T10:15:00.000Z',
    updatedAt: '2026-08-20T10:15:00.000Z',
  },
  {
    id: 'note-2',
    userId: currentUser.id,
    courseId: 'course-1',
    lessonId: 'lesson-2',
    content: 'Remember: Calvin cycle needs ATP and NADPH from the light reactions, but not light itself.',
    isBookmarked: false,
    colorTag: 'blue',
    createdAt: '2026-08-21T08:40:00.000Z',
    updatedAt: '2026-08-21T08:40:00.000Z',
  },
  {
    id: 'note-3',
    userId: currentUser.id,
    courseId: 'course-2',
    lessonId: 'lesson-6',
    content: 'Real op-amps have finite open-loop gain (~10^5) and small but nonzero bias current.',
    isBookmarked: true,
    timestampSeconds: 420,
    colorTag: 'green',
    createdAt: '2026-09-10T14:05:00.000Z',
    updatedAt: '2026-09-10T14:05:00.000Z',
  },
]
