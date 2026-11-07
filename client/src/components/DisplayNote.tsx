import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react"
import { useAppStore } from '@/store/appStore'
import { useNotes } from '@/queries/notes'

interface DisplayNoteProps {
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  onBack: () => void;
}

const DisplayNote = ({ fullscreen, setFullscreen, onBack }: DisplayNoteProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const activeNoteId = useAppStore((state) => state.activeNoteId)
  const { data: notes = [] } = useNotes(userId)
  const activeNote = notes.find((note) => note._id === activeNoteId)
  const isDark = useAppStore((state) => state.isDark)
  const text = isDark ? 'text-white' : 'text-slate-900'
  const mutedText = isDark ? 'text-white/50' : 'text-slate-500'

  if (!activeNote) return null

  return (
    <article className={`flex h-full min-h-0 flex-col ${text}`}>
      <header className={`sticky top-0 z-10 flex min-h-12 items-center justify-between border-b px-3 ${
        isDark ? 'border-white/10 bg-[#151722]/95' : 'border-slate-200 bg-white/95'
      } backdrop-blur`}>
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-indigo-300 ${mutedText}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All notes
        </button>
        <button
          type="button"
          aria-label={fullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          onClick={() => setFullscreen(!fullscreen)}
          className={`ml-auto rounded-lg p-2 transition focus-visible:outline-2 focus-visible:outline-indigo-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
        >
          {fullscreen
            ? <Minimize2 size={16} aria-hidden="true" />
            : <Maximize2 size={16} aria-hidden="true" />}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
          <time dateTime={activeNote.createdAt} className={`text-xs ${mutedText}`}>
            {activeNote.createdAt
              ? new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(activeNote.createdAt))
              : ''}
          </time>
          <h2 className="mt-3 break-words text-2xl font-semibold leading-tight sm:text-4xl">
            {activeNote.title}
          </h2>
          {activeNote.image && (
            <img
              className="mt-7 max-h-[60vh] w-full rounded-xl border border-white/10 object-contain"
              src={activeNote.image instanceof File
                ? URL.createObjectURL(activeNote.image)
                : activeNote.image}
              alt={`Image attached to ${activeNote.title}`}
            />
          )}
          <p className="mt-7 whitespace-pre-wrap break-words text-sm leading-7 sm:text-base">
            {activeNote.description || <span className={mutedText}>This note has no additional text.</span>}
          </p>
        </div>
      </div>
    </article>
  )
}

export default DisplayNote
