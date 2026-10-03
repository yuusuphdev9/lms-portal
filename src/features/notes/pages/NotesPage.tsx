import { useEffect, useState } from 'react'
import type { Note } from '@/types'

export function NotesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null)

  useEffect(() => {
    void fetch('/api/notes')
      .then((res) => res.json() as Promise<Note[]>)
      .then(setNotes)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold">Notes</h1>
      <ul className="flex flex-col gap-2">
        {notes?.map((note) => (
          <li key={note.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p>{note.content}</p>
            {note.isBookmarked && (
              <span className="mt-1 inline-block text-xs font-medium text-warning">
                Bookmarked
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
