import { Bookmark, Pencil, Trash2 } from 'lucide-react'
import { useState, type SubmitEvent } from 'react'
import { AsyncData } from '@/components/ui/async-data'
import { useCourses } from '@/features/course-player/api'
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '@/features/notes/api'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

export function NotesPage() {
  const notesQuery = useNotes()
  const { data: courses } = useCourses()
  const createNote = useCreateNote()

  const [content, setContent] = useState('')
  const [courseId, setCourseId] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const trimmedContent = content.trim()
  const contentError =
    submitAttempted && !trimmedContent ? 'Write something before saving.' : undefined
  const courseError = submitAttempted && !courseId ? 'Select which course this note is for.' : undefined

  const handleCreate = (event: SubmitEvent) => {
    event.preventDefault()
    setSubmitAttempted(true)
    if (!trimmedContent || !courseId) return
    createNote.mutate(
      { courseId, content: trimmedContent },
      { onSuccess: () => { setContent(''); setSubmitAttempted(false) } },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Notes</h1>

      <form
        onSubmit={handleCreate}
        noValidate
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1">
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
            }}
            placeholder="Write a note…"
            rows={3}
            aria-invalid={Boolean(contentError)}
            className={cn(
              'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40',
              contentError ? 'border-destructive' : 'border-border',
            )}
          />
          {contentError && <p className="text-xs font-medium text-destructive">{contentError}</p>}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <select
              value={courseId}
              onChange={(event) => {
                setCourseId(event.target.value)
              }}
              aria-invalid={Boolean(courseError)}
              className={cn(
                'rounded-lg border bg-background px-3 py-2 text-sm',
                courseError ? 'border-destructive' : 'border-border',
              )}
            >
              <option value="">Select a course…</option>
              {courses?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {courseError && <p className="text-xs font-medium text-destructive">{courseError}</p>}
          </div>
          <button
            type="submit"
            disabled={createNote.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Add note
          </button>
        </div>
      </form>

      <AsyncData
        query={notesQuery}
        loadingText="Loading notes…"
        errorText="Couldn't load your notes."
        isEmpty={(notes) => notes.length === 0}
        emptyText="No notes yet — add one above."
      >
        {(notes) => (
          <ul className="flex flex-col gap-3">
            {notes
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  courseTitle={courses?.find((c) => c.id === note.courseId)?.title}
                />
              ))}
          </ul>
        )}
      </AsyncData>
    </div>
  )
}

function NoteCard({ note, courseTitle }: { note: Note; courseTitle: string | undefined }) {
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note.content)
  const [editError, setEditError] = useState<string | undefined>(undefined)

  const handleStartEdit = () => {
    setDraft(note.content)
    setEditError(undefined)
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setEditError('A note can’t be empty.')
      return
    }
    if (trimmed !== note.content) {
      updateNote.mutate({ noteId: note.id, content: trimmed })
    }
    setIsEditing(false)
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {courseTitle && (
          <span className="text-xs font-medium text-muted-foreground">{courseTitle}</span>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              updateNote.mutate({ noteId: note.id, isBookmarked: !note.isBookmarked })
            }}
            aria-label="Toggle bookmark"
            className={cn(
              'rounded p-1 transition-colors hover:bg-accent/60',
              note.isBookmarked ? 'text-warning' : 'text-muted-foreground/50',
            )}
          >
            <Bookmark className={cn('size-4', note.isBookmarked && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={handleStartEdit}
            aria-label="Edit note"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent/60"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              deleteNote.mutate(note.id)
            }}
            aria-label="Delete note"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (editError) setEditError(undefined)
            }}
            rows={3}
            aria-invalid={Boolean(editError)}
            className={cn(
              'w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40',
              editError ? 'border-destructive' : 'border-border',
            )}
          />
          {editError && <p className="text-xs font-medium text-destructive">{editError}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setEditError(undefined)
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground/90">{note.content}</p>
      )}
    </li>
  )
}
