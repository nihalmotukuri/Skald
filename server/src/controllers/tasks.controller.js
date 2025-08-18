import Tasks from "../models/tasks.model.js"

export const getUser = async (req, res) => {
    const firebaseUid = req.params.firebaseUid
    const tasks = await Tasks.find({ firebaseUid })
    res.status(200).json(tasks)
}

export const addTask = async (req, res) => {
    const task = req.body

    try {
        const newTask = await Tasks.create(task);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const removeTaskList = async (req, res) => {
  const { firebaseUid, taskList } = req.body

  try {
    const updatedTasks = await Tasks.updateMany({ firebaseUid, taskList }, { $set: { taskList: '' } }, { new: true })
    res.status(201).json({ message: "Tasks updated successfully", taskList, updatedTasks })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateTask = async (req, res) => {
    const taskId = req.params.taskId
    const updatedTask = req.body

    try {
        const result = await Tasks.findByIdAndUpdate(taskId, { $set: updatedTask }, { new: true })
        res.json(result)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const deleteTask = async (req, res) => {
    const taskId = req.params.taskId

    try {
        await Tasks.findByIdAndDelete(taskId)
        res.json({ message: `Task of ID ${taskId} has been successfully deleted!` })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const getHeatmapDate = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}