import { Router } from "express"
import Tasks from "../models/tasks.model.js"

const router = Router()

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId
    const tasks = await Tasks.find({ userId })
    res.status(200).json(tasks)
})

router.post('/', async (req, res) => {
    const task = req.body 

    try {
        const newTask = new Tasks(task)
        const saved = await newTask.save()
        res.status(201).json(saved)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/:taskId', async (req, res) => {
    const taskId = req.params.taskId
    const updatedTask = req.body 

    try {
        const result = await Tasks.findByIdAndUpdate( taskId , { $set: updatedTask }, { new: true })
        res.json(result)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/:taskId', async (req, res) => {
    const taskId = req.params.taskId 

    try {
        await Tasks.findByIdAndDelete(taskId)
        res.json({message: `Task of ID ${taskId} has been successfully deleted!`})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

export default router