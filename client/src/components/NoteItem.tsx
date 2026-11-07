import { useEffect, useState, type MouseEvent } from 'react'
import { Bell, Check, FileImage, Pin, Pencil, Trash2, X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import type { Note } from '@/types/note'
import NoteTitle from './NoteTitle'
import { stripInlineNoteImages } from './noteRichText'

interface NoteItemProps {
  note: Note
  deleteNote: (noteId: string) => void
  setEditNoteId: (noteId: string) => void
  setDisplayEditNote: (value: boolean) => void
  deleting: boolean
  togglePinned: (note: Note) => void
}

const formatNoteDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

const getNotePreview = (description: string) => description
  .replace(/([*_`#>~])/g, '')
  .trim()

const NoteItem = ({ note, deleteNote, setEditNoteId, setDisplayEditNote, deleting, togglePinned }: NoteItemProps) => {
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const noteId = note._id
  const selected = Boolean(noteId && activeNoteId === noteId)

  useEffect(() => {
    if (!(note.image instanceof File)) {
      setImageUrl(typeof note.image === 'string' ? note.image : '')
      return
    }

    const url = URL.createObjectURL(note.image)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [note.image])

  const edit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!noteId) return
    setEditNoteId(noteId)
    setDisplayEditNote(true)
  }

  const remove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (confirmDelete && noteId) deleteNote(noteId)
    else setConfirmDelete(true)
  }

  return (
    <article className={`skald-note-row skald-note-color--${note.color ?? 'default'} ${selected ? 'is-selected' : ''}`}>
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        onClick={() => noteId && setActiveNoteId(noteId)}
        className="skald-note-row__open"
      >
        {(note.imageAttachments?.[0]?.url ?? imageUrl)
          ? <img src={note.imageAttachments?.[0]?.url ?? imageUrl} alt="" className="skald-note-row__image" />
          : <span className="skald-note-row__image skald-note-row__image--empty"><FileImage size={17} aria-hidden="true" /></span>}
        <span className="skald-note-row__copy">
          <span className="skald-note-row__title">
            <NoteTitle title={note.title} />
            {note.pinned && (
              <span className="skald-note-row__pinned-indicator" title="Pinned note">
                <Pin size={11} aria-hidden="true" />
                <span className="sr-only">Pinned</span>
              </span>
            )}
          </span>
          <span className="skald-note-row__preview">{getNotePreview(stripInlineNoteImages(note.description)) || 'A thought worth keeping.'}</span>
          <span className="skald-note-row__date">{formatNoteDate(note.updatedAt ?? note.createdAt) || 'Just now'}</span>
          {note.reminderAt && (
            <span className="skald-note-row__reminder">
              <Bell size={11} aria-hidden="true" />
              {formatNoteDate(note.reminderAt)}
            </span>
          )}
        </span>
      </button>
      {confirmDelete ? (
        <div className="skald-note-row__confirm" role="group" aria-label={`Confirm deleting ${note.title || 'note'}`}>
          <span>Delete this note?</span>
          <button type="button" onClick={remove} disabled={deleting} aria-label="Confirm delete">
            <Check size={14} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="skald-note-row__actions">
          {!note.archivedAt && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                togglePinned(note)
              }}
              aria-label={note.pinned ? `Unpin ${note.title || 'note'}` : `Pin ${note.title || 'note'}`}
              aria-pressed={Boolean(note.pinned)}
              className={`skald-note-row__pin${note.pinned ? ' is-pinned' : ''}`}
              disabled={!noteId}
            >
              <Pin size={14} aria-hidden="true" />
            </button>
          )}
          <button className="skald-note-row__edit" type="button" onClick={edit} disabled={!noteId} aria-label={`Edit ${note.title || 'note'}`}>
            <Pencil size={14} aria-hidden="true" />
          </button>
          <button className="skald-note-row__delete" type="button" onClick={remove} disabled={!noteId} aria-label={`Delete ${note.title || 'note'}`}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  )
}

export default NoteItem
