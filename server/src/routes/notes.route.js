import { Router } from "express"
import upload from "../middleware/upload.js"
import { getNotes, addNote, updateNote, deleteNote } from '../controllers/notes.controller.js'

const router = Router()

router.get('/:firebaseUid', getNotes)

router.post('/', upload.single('image'), addNote)

router.put('/:noteId', upload.single('image'), updateNote)

router.delete('/:noteId', deleteNote)

export default router