import type { RootState } from './store'
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Note } from '@/types/note'

export const fetchNotes = createAsyncThunk<Note[], void, { state: RootState }>(
  'notesSlice/fetchNotes',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState()
    const firebaseUid = state.userStore.user?.firebaseUid
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/notes/${firebaseUid}`)
    return res.data
  }
)

export const addNote = createAsyncThunk<Note, Note>(
  'notesSlice/addNote',
  async (newNote: Note) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/notes`, newNote, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }
)

export const editNote = createAsyncThunk<Note, Note>(
  'notesSlice/editNote',
  async (editedNote: Note) => {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/notes/${editedNote._id}`, editedNote, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }
)

export const deleteNote = createAsyncThunk<{ noteId: string }, string>(
  'notesSlice/deleteNote',
  async (noteId: string) => {
    const res = await axios.delete(`${import.meta.env.VITE_API_URL}/notes/${noteId}`)
    return { noteId, ...res.data }
  }
)
