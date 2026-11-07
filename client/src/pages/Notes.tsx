import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Search, X } from "lucide-react";
import { useAppStore } from '@/store/appStore'
import { useNotes, useNoteMutations } from '@/queries/notes'
import AddNoteDialog from "@/components/AddNoteDialog";
import EditNoteDialog from "@/components/EditNoteDialog";
import NoteSkeleton from "@/components/NoteSkeleton";
import DisplayNote from "@/components/DisplayNote";
import NoteItem from "@/components/NoteItem";

const Notes = () => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: notes = [], isLoading: loading, error } = useNotes(userId)
  const { deleteNote } = useNoteMutations(userId)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const setActiveNoteId = useAppStore((state) => state.setActiveNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const setBreadcrumb = useAppStore((state) => state.setBreadcrumb)
  const [filterQuery, setFilterQuery] = useState("")
  const [displayAddNote, setDisplayAddNote] = useState(false)
  const [displayEditNote, setDisplayEditNote] = useState(false)
  const [editNoteId, setEditNoteId] = useState("")
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    setBreadcrumb("Notes")
  }, [setBreadcrumb])

  useEffect(() => {
    if (activeNoteId && !notes.some((note) => note._id === activeNoteId)) {
      setActiveNoteId(null)
      setFullscreen(false)
    }
  }, [activeNoteId, notes, setActiveNoteId])

  const normalizedQuery = filterQuery.trim().toLowerCase()
  const filteredNotes = useMemo(() => [...notes]
    .filter((note) => !normalizedQuery
      || note.title.toLowerCase().includes(normalizedQuery)
      || note.description.toLowerCase().includes(normalizedQuery))
    .sort((first, second) => (second.createdAt ?? '').localeCompare(first.createdAt ?? '')),
  [notes, normalizedQuery])
  const activeNote = notes.find((note) => note._id === activeNoteId)
  const pageText = isDark ? 'text-white' : 'text-slate-900'
  const mutedText = isDark ? 'text-white/55' : 'text-slate-500'
  const surface = isDark ? 'border-white/10 bg-white/[0.035]' : 'border-slate-200 bg-white'

  const handleDelete = (noteId: string) => {
    deleteNote.mutate(noteId, {
      onSuccess: () => {
        if (activeNoteId === noteId) setActiveNoteId(null)
      }
    })
  }

  return (
    <div className={`col-span-1 row-span-1 flex min-h-0 flex-col overflow-y-auto ${pageText}`}>
      {displayAddNote && <AddNoteDialog setDisplayAddNote={setDisplayAddNote} />}
      {displayEditNote && (
        <EditNoteDialog
          setDisplayEditNote={setDisplayEditNote}
          editNoteId={editNoteId}
        />
      )}

      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`mb-1 text-xs font-medium uppercase tracking-[0.2em] ${mutedText}`}>Your workspace</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Notes</h1>
          <p className={`mt-1 text-sm ${mutedText}`}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-3 sm:w-64 ${surface}`}>
            <Search aria-hidden="true" size={16} className={mutedText} />
            <input
              type="search"
              placeholder="Search title or content"
              aria-label="Search notes"
              value={filterQuery}
              onChange={(event) => setFilterQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
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
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-indigo-500 px-3 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            <Plus aria-hidden="true" size={17} />
            New note
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Unable to load notes: {error.message}
        </p>
      )}

      <div className={`mt-5 min-h-0 flex-1 ${activeNote ? 'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]' : ''}`}>
        <section
          aria-label="Notes list"
          className={`${activeNote ? 'hidden overflow-y-auto pr-1 lg:block' : 'block'} ${fullscreen ? 'lg:hidden' : ''}`}
        >
          <div className="flex flex-col gap-2 pb-8">
            {loading
              ? Array.from({ length: 4 }, (_, index) => <NoteSkeleton key={index} />)
              : filteredNotes.map((note) => (
                <NoteItem
                  key={note._id}
                  note={note}
                  deleteNote={handleDelete}
                  setEditNoteId={setEditNoteId}
                  setDisplayEditNote={setDisplayEditNote}
                />
              ))}
          </div>
        </section>

        {activeNote && (
          <section className={`${fullscreen ? 'fixed inset-4 z-40' : 'min-h-[400px]'} overflow-hidden rounded-xl border ${surface}`}>
            <DisplayNote
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              onBack={() => {
                setActiveNoteId(null)
                setFullscreen(false)
              }}
            />
          </section>
        )}

        {!loading && !error && filteredNotes.length === 0 && (
          <div className={`rounded-2xl border px-5 py-12 text-center ${surface}`}>
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
              <FileText size={21} />
            </div>
            <h2 className="font-medium">{notes.length === 0 ? 'Make room for a thought' : 'No notes found'}</h2>
            <p className={`mx-auto mt-1 max-w-sm text-sm ${mutedText}`}>
              {notes.length === 0
                ? 'Capture ideas, plans, and the details you want to remember.'
                : 'Try a different search, or clear the search field.'}
            </p>
            {notes.length === 0
              ? (
                <button
                  type="button"
                  onClick={() => setDisplayAddNote(true)}
                  className="mt-4 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                >
                  Create your first note
                </button>
              )
              : filterQuery && (
                <button type="button" onClick={() => setFilterQuery('')} className="mt-4 text-sm text-indigo-200 hover:text-white">
                  Clear search
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes
