import User from '../models/user.model.js'

export const getUser = async (req, res) => {
    const { firebaseUid } = req

    const user = await User.findOne({ firebaseUid })
    res.json(user)
}

export const addTaskList = async (req, res) => {
    const { firebaseUid, newTaskList } = req.body

    try {
        const updatedUser = await User.findOneAndUpdate({ firebaseUid }, { $addToSet: { taskList: newTaskList } })
        res.status(201).json({ message: "Task list successfully added", newTaskList })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const removeTaskList = async (req, res) => {
  const { firebaseUid, taskListToRemove } = req.body 
  try {
    const updatedUser = await User.findOneAndUpdate({ firebaseUid }, { $pull: {taskList: taskListToRemove} }, { new: true })
    res.status(201).json({ message: "Task list successfully removed", taskListToRemove })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}