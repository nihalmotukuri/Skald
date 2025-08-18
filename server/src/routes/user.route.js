import { Router } from "express"
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js"
import { getUser, addTaskList, removeTaskList } from "../controllers/user.controller.js"

const router = Router()

router.get('/get_user', verifyFirebaseToken, getUser)

router.put('/add_tasklist', addTaskList)

router.put('/remove_tasklist', removeTaskList)

export default router