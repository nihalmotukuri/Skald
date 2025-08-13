import { createSlice } from '@reduxjs/toolkit'
import { fetchNotes, addNote, editNote, deleteNote } from './notesThunks.ts'
import type { Note } from '@/types/note.ts'

const notesSlice = createSlice({
    name: "notes",
    initialState: {
        notes: [] as Note[],
        loading: false,
        activeNoteId: null as string | null,
        error: null as string | null
    },
    reducers: {
        setActiveNoteId: (state, action) => {
            state.activeNoteId = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false
                state.notes = action.payload
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false
                state.error = action.error?.message ?? null
            })
            .addCase(addNote.fulfilled, (state, action) => {
                state.notes.push(action.payload)
            })
            .addCase(editNote.fulfilled, (state, action) => {
                const index = state.notes.findIndex(n => n._id === action.payload._id)
                if (index !== -1) {
                    state.notes[index] = action.payload
                }
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.notes = state.notes.filter(n => n._id !== action.payload.noteId)
            })
    }
})

export const { setActiveNoteId } = notesSlice.actions
export default notesSlice.reducer
