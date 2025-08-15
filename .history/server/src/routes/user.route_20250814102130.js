import { Router } from "express"
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js"
import User from '../models/user.model.js'

const router = Router()

router.get('/get_user', verifyFirebaseToken, async (req, res) => {
  const { firebaseUid } = req

  const user = await User.findOne({ firebaseUid })
  res.json(user)
})

router.put('/add_tasklist', async (req, res) => {
  const { firebaseUid, newTaskList } = req.body

  try {
    const user = await User.findOneAndUpdate({ firebaseUid }, { $addToSet: { taskList: newTaskList } })
    console.log(user)
    res.status(201).json({ message: "Task list successfully added", newTaskList })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/remove_tasklist', async (req, res) => {
  const { firebaseUid, taskListToRemove } = req.body 

  try {
    const updatedUser = findOneAndUpdate({ firebaseUid }, { $pull: {taskList: taskListToRemove} })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router