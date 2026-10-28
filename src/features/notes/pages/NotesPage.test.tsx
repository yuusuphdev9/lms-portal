import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { NotesPage } from './NotesPage'

describe('NotesPage', () => {
  it('validates the form, then creates, edits, and deletes a note', async () => {
    const user = userEvent.setup()
    renderWithProviders(<NotesPage />, { route: '/notes' })

    // Wait for the course dropdown to populate before interacting with the form.
    await screen.findByRole('option', { name: 'Plant Physiology Fundamentals' })

    // Submitting empty shows both field errors instead of silently doing nothing.
    await user.click(screen.getByRole('button', { name: /add note/i }))
    expect(await screen.findByText('Write something before saving.')).toBeInTheDocument()
    expect(screen.getByText('Select which course this note is for.')).toBeInTheDocument()

    const content = 'Guard cells regulate stomatal aperture via turgor pressure changes.'
    await user.type(screen.getByPlaceholderText('Write a note…'), content)
    await user.selectOptions(screen.getByRole('combobox'), 'Plant Physiology Fundamentals')
    await user.click(screen.getByRole('button', { name: /add note/i }))

    const noteItem = (await screen.findByText(content)).closest('li')
    expect(noteItem).not.toBeNull()
    if (!noteItem) throw new Error('note item not found')

    // Edit it.
    await user.click(within(noteItem).getByLabelText('Edit note'))
    const editBox = within(noteItem).getByRole('textbox')
    await user.clear(editBox)
    await user.type(editBox, 'Updated: guard cells also respond to blue light signaling.')
    await user.click(within(noteItem).getByRole('button', { name: /save/i }))
    expect(
      await screen.findByText('Updated: guard cells also respond to blue light signaling.'),
    ).toBeInTheDocument()

    // Delete it.
    const updatedItem = screen
      .getByText('Updated: guard cells also respond to blue light signaling.')
      .closest('li')
    if (!updatedItem) throw new Error('updated note item not found')
    await user.click(within(updatedItem).getByLabelText('Delete note'))
    expect(
      screen.queryByText('Updated: guard cells also respond to blue light signaling.'),
    ).not.toBeInTheDocument()
  })
})
