import { Router } from "express"
import Notes from '../models/notes.model.js'
import upload from "../middleware/upload.js"

const router = Router()

router.get('/:firebaseUid', async (req, res) => {
    const firebaseUid = req.params.firebaseUid

    try {
        const notes = await Notes.find({ firebaseUid })

        const notesWithBase64 = notes.map(note => {
            let imageBase64 = ''
            if (note.image?.data) {
                imageBase64 = `data:${note.image.contentType};base64,${note.image.data.toString('base64')}`
            }

            return {
                _id: note._id,
                title: note.title,
                description: note.description,
                date: note.date,
                image: imageBase64,
                createdAt: note.createdAt
            }
        })

        res.json(notesWithBase64)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/', upload.single('image'), async (req, res) => {
    const { firebaseUid, title, description } = req.body

    try {
        const newNote = new Notes({
            firebaseUid,
            title,
            description,
            ...(req.file && {
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            })
        });
        const savedNote = await newNote.save()

        let imageBase64 = '';
        if (savedNote.image?.data) {
            imageBase64 = `data:${savedNote.image.contentType};base64,${savedNote.image.data.toString('base64')}`;
        }

        res.status(201).json({
            _id: savedNote._id,
            firebaseUid: savedNote.firebaseUid,
            title: savedNote.title,
            description: savedNote.description,
            image: imageBase64,
            createdAt: savedNote.createdAt
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/:noteId', upload.single('image'), async (req, res) => {
    const noteId = req.params.noteId;
    const { firebaseUid, title, description } = req.body

    try {
        // Build update object dynamically
        const updateData = {
            firebaseUid,
            title,
            description,
            ...(req.file && {
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            })
        };

        const updatedNote = await Notes.findByIdAndUpdate(
            noteId,
            { $set: updateData },
            { new: true } // return updated document
        );

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Convert image to Base64 for frontend
        let imageBase64 = '';
        if (updatedNote.image?.data) {
            imageBase64 = `data:${updatedNote.image.contentType};base64,${updatedNote.image.data.toString('base64')}`;
        }

        res.json({
            _id: updatedNote._id,
            firebaseUid: updatedNote.firebaseUid,
            title: updatedNote.title,
            description: updatedNote.description,
            image: imageBase64,
            createdAt: updatedNote.createdAt
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/:noteId', async (req, res) => {
    const noteId = req.params.noteId

    try {
        await Notes.findByIdAndDelete(noteId)
        res.json({ message: `Note of ID ${noteId} has been successfully deleted!` })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router