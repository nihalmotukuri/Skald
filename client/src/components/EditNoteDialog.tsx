import { useAppStore } from '@/store/appStore'
import { useNotes } from '@/queries/notes'
import NoteEditorDialog from './NoteEditorDialog'
import WorkspaceDialog from './WorkspaceDialog'

interface EditNoteDialogProps {
  setDisplayEditNote: (value: boolean) => void
  editNoteId: string
}

const EditNoteDialog = ({ setDisplayEditNote, editNoteId }: EditNoteDialogProps) => {
  const userId = useAppStore((state) => state.user?.id)
  const { data: notes = [], isLoading, error } = useNotes(userId)
  const note = notes.find((item) => item._id === editNoteId)

  if (!note) {
    return (
      <WorkspaceDialog labelledBy="skald-note-unavailable-title" onClose={() => setDisplayEditNote(false)}>
        <div className="skald-task-dialog__form">
          <h2 id="skald-note-unavailable-title">{isLoading ? 'Opening note…' : 'Note unavailable'}</h2>
          <p role={error ? 'alert' : undefined}>
            {error?.message ?? 'This note may have been deleted. Close this window and refresh your notes.'}
          </p>
          {!isLoading && (
            <button type="button" className="skald-task-dialog__submit" onClick={() => setDisplayEditNote(false)}>
              Close
            </button>
          )}
        </div>
      </WorkspaceDialog>
    )
  }

  return <NoteEditorDialog note={note} onClose={() => setDisplayEditNote(false)} />
}

export default EditNoteDialog
