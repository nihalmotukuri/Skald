import { useEffect, useMemo, useState } from 'react'
import { Archive, ArrowRight, FileText, Plus, Search, StickyNote, X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useNotes, useNoteMutations } from '@/queries/notes'
import type { Note } from '@/types/note'
import LoadingIndicator from '@/components/LoadingIndicator'
import AddNoteDialog from '@/components/AddNoteDialog'
import EditNoteDialog from '@/components/EditNoteDialog'
import DisplayNote from '@/components/DisplayNote'
import NoteItem from '@/components/NoteItem'

const Notes = () => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: notes = [], isLoading: loading, error } = useNotes(userId)
  const { deleteNote, editNote } = useNoteMutations(userId)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const [filterQuery, setFilterQuery] = useState('')
  const [displayAddNote, setDisplayAddNote] = useState(false)
  const [displayEditNote, setDisplayEditNote] = useState(false)
  const [editNoteId, setEditNoteId] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    setBreadcrumb('Notes')
  }, [setBreadcrumb])

  useEffect(() => {
    if (activeNoteId && !notes.some((note) => note._id === activeNoteId)) {
      setActiveNoteId(null)
      setFullscreen(false)
    }
  }, [activeNoteId, notes, setActiveNoteId])

  const normalizedQuery = filterQuery.trim().toLowerCase()
  const filteredNotes = useMemo(() => [...notes]
    .filter((note) => showArchived ? Boolean(note.archivedAt) : !note.archivedAt)
    .filter((note) => !normalizedQuery
      || note.title.toLowerCase().includes(normalizedQuery)
      || note.description.toLowerCase().includes(normalizedQuery))
    .sort((first, second) => Number(Boolean(second.pinned)) - Number(Boolean(first.pinned))
      || (second.updatedAt ?? second.createdAt ?? '').localeCompare(first.updatedAt ?? first.createdAt ?? '')),
  [notes, normalizedQuery, showArchived])
  const activeNote = notes.find((note) => note._id === activeNoteId)
  const pageText = isDark ? 'text-white' : 'text-slate-900'
  const mutedText = isDark ? 'text-white/55' : 'text-slate-500'

  const handleDelete = (noteId: string) => {
    deleteNote.mutate(noteId, {
      onSuccess: () => {
        if (activeNoteId === noteId) {
          setActiveNoteId(null)
          setFullscreen(false)
        }
      },
    })
  }

  const editSelectedNote = (noteId: string) => {
    setEditNoteId(noteId)
    setDisplayEditNote(true)
  }

  const togglePinned = (note: Note) => {
    if (!note._id) return
    editNote.mutate({ ...note, pinned: !note.pinned })
  }

  const visibleNotes = notes.filter((note) => showArchived ? Boolean(note.archivedAt) : !note.archivedAt)
  const pinnedCount = visibleNotes.filter((note) => note.pinned).length
  const archivedCount = notes.filter((note) => note.archivedAt).length

  return (
    <div className={`skald-page skald-notes-page col-span-1 row-span-1 flex min-h-0 flex-col overflow-y-auto ${pageText}`}>
      {displayAddNote && <AddNoteDialog setDisplayAddNote={setDisplayAddNote} />}
      {displayEditNote && <EditNoteDialog setDisplayEditNote={setDisplayEditNote} editNoteId={editNoteId} />}

      <header className="skald-page-header skald-notes-header flex flex-col gap-5 border-b sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="skald-workspace-kicker">A home for your thoughts</p>
          <h1 className="skald-page-title">Notes</h1>
          <p className="skald-page-description">
            {visibleNotes.length} {visibleNotes.length === 1 ? 'note' : 'notes'} {showArchived ? 'in your archive' : 'to come back to'}
          </p>
        </div>
        <div className="skald-page-actions flex flex-wrap items-center gap-2">
          <label className="skald-page-search flex min-h-10 w-full items-center gap-2 border px-3 sm:w-64">
            <Search aria-hidden="true" size={16} className={mutedText} />
            <input
              type="text"
              role="searchbox"
              placeholder="Find a thought"
              aria-label="Search notes"
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {filterQuery && (
              <button type="button" aria-label="Clear search" onClick={() => setFilterQuery('')}>
                <X size={15} className={mutedText} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setDisplayAddNote(true)}
            className="skald-add-action inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold transition"
          >
            <span className="skald-add-action__icon"><Plus aria-hidden="true" size={17} /></span>
            New note
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className={`mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm ${isDark ? 'text-rose-200' : 'text-rose-700'}`}>
          Unable to load notes: {error.message}
        </p>
      )}

      <div className={`skald-notes-workspace ${activeNote ? 'has-active-note' : ''} ${fullscreen ? 'is-fullscreen' : ''}`}>
        <aside className="skald-notes-rail" aria-label="Notes list">
          <div className="skald-notes-rail__heading">
            <div>
              <h2>{showArchived ? 'Archive' : 'Your notes'}</h2>
              <span>
                {pinnedCount > 0 && !showArchived ? `${pinnedCount} pinned · ` : ''}
                {filteredNotes.length} {filteredNotes.length === 1 ? 'thought' : 'thoughts'}
              </span>
            </div>
            <button
              type="button"
              aria-label={showArchived ? 'Show active notes' : 'Show archived notes'}
              title={showArchived ? 'Show active notes' : 'Show archived notes'}
              className={showArchived ? 'is-active' : ''}
              onClick={() => {
                setShowArchived((value) => !value)
                setActiveNoteId(null)
                setFullscreen(false)
              }}
            >
              {showArchived ? <StickyNote size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
              {archivedCount > 0 && <span className="skald-notes-archive-count">{archivedCount}</span>}
            </button>
            {!showArchived && (
              <button type="button" aria-label="Create a note" onClick={() => setDisplayAddNote(true)}>
                <Plus size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="skald-notes-list">
            {loading
              ? <LoadingIndicator label="Loading notes…" className="skald-loading-indicator--notes" />
              : filteredNotes.map((note) => (
                <NoteItem
                  key={note._id}
                  note={note}
                  deleteNote={handleDelete}
                  setEditNoteId={setEditNoteId}
                  setDisplayEditNote={setDisplayEditNote}
                  deleting={deleteNote.isPending}
                  togglePinned={togglePinned}
                />
              ))}
            {!loading && !error && filteredNotes.length === 0 && (
              <div className="skald-notes-list__empty">
                <FileText size={17} aria-hidden="true" />
                <p>
                  {showArchived
                    ? 'No notes in your archive.'
                    : notes.length
                      ? 'No notes match that search.'
                      : 'Your first thought can start here.'}
                </p>
                {!showArchived && notes.length === 0 && (
                  <button type="button" onClick={() => setDisplayAddNote(true)}>Write a note <ArrowRight size={14} /></button>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className={`skald-note-reader ${fullscreen ? 'is-fullscreen' : ''}`} aria-label="Selected note">
          {activeNote ? (
            <DisplayNote
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              onBack={() => {
                setActiveNoteId(null)
                setFullscreen(false)
              }}
              onEdit={() => activeNote._id && editSelectedNote(activeNote._id)}
              onDelete={() => activeNote._id && handleDelete(activeNote._id)}
              deleting={deleteNote.isPending}
            />
          ) : (
            <div className="skald-note-reader__empty">
              <span><FileText size={20} aria-hidden="true" /></span>
              <p className="skald-workspace-kicker">{notes.length ? 'Your quiet corner' : 'A little room for ideas'}</p>
              <h2>{notes.length ? 'Choose a note to settle into.' : 'Keep the thoughts you want to find again.'}</h2>
              <p>{notes.length
                ? 'Your notes stay close by, ready when you are.'
                : 'Plans, fragments, reminders, sparks of an idea. Give them somewhere to land.'}</p>
              {notes.length === 0 && (
                <button type="button" className="skald-add-action inline-flex items-center gap-2 text-sm font-semibold" onClick={() => setDisplayAddNote(true)}>
                  <span className="skald-add-action__icon"><Plus size={16} aria-hidden="true" /></span>
                  Write your first note
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Notes
