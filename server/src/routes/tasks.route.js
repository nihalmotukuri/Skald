import { Router } from "express"
import { getUser, addTask, removeTaskList, updateTask, deleteTask, getHeatmapDate } from "../controllers/tasks.controller.js"

const router = Router()

router.get('/:firebaseUid', getUser)

router.post('/', addTask)

router.put("/remove_tasklist", removeTaskList)

router.put('/:taskId', updateTask)

router.delete('/:taskId', deleteTask)

router.get("/heatmap/:firebaseUid", getHeatmapDate);

export default router