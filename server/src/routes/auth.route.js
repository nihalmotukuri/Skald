import { Router } from "express"
import { signInUser } from "../controllers/auth.controller.js"

const router = Router()

router.post('/firebase', signInUser)

export default router