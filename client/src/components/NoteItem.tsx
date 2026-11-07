import { useAppStore } from '@/store/appStore'
import type { Note } from "@/types/note";
import type React from "react"
import { FileImage, Pencil, Trash2 } from "lucide-react"

interface NoteItemProps {
  note: Note;
  deleteNote: (noteId: string) => void;
  setEditNoteId: React.Dispatch<React.SetStateAction<string>>;
  setDisplayEditNote: React.Dispatch<React.SetStateAction<boolean>>;
}

const formatNoteDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

const NoteItem = ({ note, deleteNote, setEditNoteId, setDisplayEditNote }: NoteItemProps) => {
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const noteId = note._id
  const selected = Boolean(noteId && activeNoteId === noteId)

  const openNote = () => {
    if (noteId) setActiveNoteId(noteId)
  }

  const editNote = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!noteId) return
    setEditNoteId(noteId)
    setDisplayEditNote(true)
  }

  const removeNote = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (noteId) deleteNote(noteId)
  }

  const previewImage = note.image instanceof File
    ? URL.createObjectURL(note.image)
    : note.image

  return (
    <article className={`group overflow-hidden rounded-xl border transition ${
      selected
        ? (isDark ? 'border-indigo-300/50 bg-indigo-400/[0.08]' : 'border-indigo-400 bg-indigo-50')
        : (isDark ? 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50')
    }`}>
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        onClick={openNote}
        className="block w-full px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-300"
      >
        <div className="flex items-start gap-3">
          {previewImage
            ? <img src={previewImage} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            : (
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-white/5 text-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                <FileImage size={19} aria-hidden="true" />
              </span>
            )}
          <div className="min-w-0 flex-1">
            <h2 className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {note.title || 'Untitled note'}
            </h2>
            <p className={`mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
              {note.description || 'No additional details'}
            </p>
            {formatNoteDate(note.createdAt) && (
              <time
                dateTime={note.createdAt}
                className={`mt-2 block text-[11px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}
              >
                {formatNoteDate(note.createdAt)}
              </time>
            )}
          </div>
        </div>
      </button>
      <div className={`flex justify-end gap-1 border-t px-3 py-1.5 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <button
          type="button"
          onClick={editNote}
          disabled={!noteId}
          aria-label={`Edit ${note.title || 'note'}`}
          className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={removeNote}
          disabled={!noteId}
          aria-label={`Delete ${note.title || 'note'}`}
          className={`rounded-md p-2 transition focus-visible:outline-2 focus-visible:outline-rose-300 ${isDark ? 'text-white/50 hover:bg-rose-500/10 hover:text-rose-300' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-700'}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default NoteItem
