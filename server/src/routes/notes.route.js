import { Router } from "express"
import Notes from '../models/notes.model.js'

const router = Router()

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId

    try {
        const notes = await Notes.find({ userId })
        res.status(200).json(notes)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/', async (req, res) => {
    const note = req.body

    try {
        const newNote = new Notes(note)
        const saved = await newNote.save()
        res.status(201).json(saved)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router