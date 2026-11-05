import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assertFound, mapNote, type NoteRow, type Result } from '@/lib/db-mappers'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export const noteKeys = {
  list: (courseId?: string) => ['notes', courseId ?? 'all'] as const,
}

export function useNotes(courseId?: string) {
  return useQuery<Note[]>({
    queryKey: noteKeys.list(courseId),
    queryFn: async () => {
      let query = supabase.from('notes').select('*').order('created_at', { ascending: false })
      if (courseId) query = query.eq('course_id', courseId)
      const { data, error } = (await query) as Result<NoteRow[]>
      if (error) throw error
      return (data ?? []).map(mapNote)
    },
  })
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
    mutationFn: async (input: CreateNoteInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user.id
      if (!userId) throw new Error('You need to be signed in to add a note.')

      const { data, error } = (await supabase
        .from('notes')
        .insert({
          user_id: userId,
          course_id: input.courseId,
          content: input.content,
          ...(input.lessonId !== undefined && { lesson_id: input.lessonId }),
          ...(input.colorTag !== undefined && { color_tag: input.colorTag }),
        })
        .select()
        .single()) as Result<NoteRow>
      if (error) throw error
      return mapNote(assertFound(data, 'Note'))
    },
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
    mutationFn: async ({ noteId, ...body }: UpdateNoteInput) => {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (body.content !== undefined) patch['content'] = body.content
      if (body.isBookmarked !== undefined) patch['is_bookmarked'] = body.isBookmarked
      if (body.colorTag !== undefined) patch['color_tag'] = body.colorTag

      const { data, error } = (await supabase
        .from('notes')
        .update(patch)
        .eq('id', noteId)
        .select()
        .single()) as Result<NoteRow>
      if (error) throw error
      return mapNote(assertFound(data, 'Note'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
