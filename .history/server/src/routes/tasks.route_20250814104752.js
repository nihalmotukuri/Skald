import { Router } from "express"
import Tasks from "../models/tasks.model.js"

const router = Router()

router.get('/:firebaseUid', async (req, res) => {
    const firebaseUid = req.params.firebaseUid
    const tasks = await Tasks.find({ firebaseUid })
    console.log("hi", tasks)
    res.status(200).json(tasks)
})

router.post('/', async (req, res) => {
    const task = req.body

    try {
        const newTask = await Tasks.create(task);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/:taskId', async (req, res) => {
    const taskId = req.params.taskId
    const updatedTask = req.body

    try {
        const result = await Tasks.findByIdAndUpdate(taskId, { $set: updatedTask }, { new: true })
        res.json(result)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.delete('/:taskId', async (req, res) => {
    const taskId = req.params.taskId

    try {
        await Tasks.findByIdAndDelete(taskId)
        res.json({ message: `Task of ID ${taskId} has been successfully deleted!` })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get("/heatmap/:firebaseUid", async (req, res) => {
    const firebaseUid = req.params.firebaseUid

  try {
    const data = await Tasks.aggregate([
      { $match: { status: "Done", firebaseUid } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/remove_tasklist")

export default router