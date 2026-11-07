import { useEffect, useState } from 'react'
import { ArrowLeft, Bell, Check, Maximize2, Minimize2, Pencil, Pin, Trash2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppStore } from '@/store/appStore'
import { useNotes } from '@/queries/notes'
import NoteTitle from './NoteTitle'
import { stripInlineNoteImages } from './noteRichText'

interface DisplayNoteProps {
  fullscreen: boolean
  setFullscreen: (value: boolean) => void
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}

const DisplayNote = ({ fullscreen, setFullscreen, onBack, onEdit, onDelete, deleting }: DisplayNoteProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const { data: notes = [] } = useNotes(userId)
  const activeNote = notes.find((note) => note._id === activeNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const [imageUrl, setImageUrl] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!(activeNote?.image instanceof File)) {
      setImageUrl(typeof activeNote?.image === 'string' ? activeNote.image : '')
      return
    }

    const url = URL.createObjectURL(activeNote.image)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [activeNote?.image])

  if (!activeNote) return null

  const createdDate = activeNote.createdAt ? new Date(activeNote.createdAt) : null
  const dateIsValid = createdDate && !Number.isNaN(createdDate.getTime())

  return (
    <article className={`skald-note-reader__article skald-note-color--${activeNote.color ?? 'default'}${isDark ? ' is-dark' : ''}`}>
      <header className="skald-note-reader__toolbar">
        <button type="button" onClick={onBack} className="skald-note-reader__back">
          <ArrowLeft size={15} aria-hidden="true" />
          All notes
        </button>
        <div className="skald-note-reader__tools">
          {confirmDelete ? (
            <div className="skald-note-reader__delete-confirm" role="group" aria-label="Confirm note deletion">
              <span>Delete this note?</span>
              <button type="button" onClick={onDelete} disabled={deleting} aria-label="Confirm delete note">
                <Check size={15} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} aria-label="Cancel delete">
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              {activeNote.pinned && <span className="skald-note-reader__pinned"><Pin size={13} aria-hidden="true" /> Pinned</span>}
              <button type="button" onClick={onEdit} aria-label="Edit note">
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setConfirmDelete(true)} aria-label="Delete note">
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </>
          )}
          <span className="skald-note-reader__tool-divider" />
          <button
            type="button"
            aria-label={fullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="skald-note-reader__scroll">
        <div className="skald-note-reader__content">
          <p className="skald-workspace-kicker">Saved thought</p>
          {dateIsValid && (
            <time dateTime={activeNote.createdAt}>
              {new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(createdDate)}
            </time>
          )}
          {activeNote.reminderAt && (
            <p className="skald-note-reader__reminder">
              <Bell size={13} aria-hidden="true" />
              Remind me {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activeNote.reminderAt))}
            </p>
          )}
          <h2><NoteTitle title={activeNote.title} /></h2>
          {(activeNote.imageAttachments?.[0]?.url ?? imageUrl) && (
            <img
              className="skald-note-reader__image"
              src={activeNote.imageAttachments?.[0]?.url ?? imageUrl}
              alt={`Image attached to ${activeNote.title || 'note'}`}
            />
          )}
          <div className={`skald-note-reader__body skald-note-font--${activeNote.fontFamily ?? 'sans'}`}>
            {activeNote.description
              ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {stripInlineNoteImages(activeNote.description)}
                </ReactMarkdown>
              )
              : <span className="skald-note-reader__placeholder">Let this note grow when you have more to add.</span>}
          </div>
        </div>
      </div>
    </article>
  )
}

export default DisplayNote
