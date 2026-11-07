import NoteEditorDialog from './NoteEditorDialog'

interface AddNoteDialogProps {
  setDisplayAddNote: (value: boolean) => void
}

const AddNoteDialog = ({ setDisplayAddNote }: AddNoteDialogProps) => (
  <NoteEditorDialog onClose={() => setDisplayAddNote(false)} />
)

export default AddNoteDialog
