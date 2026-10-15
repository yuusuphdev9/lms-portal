import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useApiQuery } from '@/lib/use-api-query'
import type { Note } from '@/types'

export const noteKeys = {
  list: (courseId?: string) => ['notes', courseId ?? 'all'] as const,
}

export function useNotes(courseId?: string) {
  const query = courseId ? `?courseId=${courseId}` : ''
  return useApiQuery<Note[]>(noteKeys.list(courseId), `/api/notes${query}`)
}

export interface CreateNoteInput {
  courseId: string
  content: string
  lessonId?: string
  colorTag?: string
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNoteInput) => api.post<Note>('/api/notes', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export interface UpdateNoteInput {
  noteId: string
  content?: string
  isBookmarked?: boolean
  colorTag?: string
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, ...body }: UpdateNoteInput) =>
      api.patch<Note>(`/api/notes/${noteId}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => api.delete(`/api/notes/${noteId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
