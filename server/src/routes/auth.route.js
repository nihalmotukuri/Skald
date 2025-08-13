import { Router } from "express"
import admin from '../config/firebaseAdmin.cjs'
import User from '../models/user.model.js'

const router = Router()

router.post('/firebase', async (req, res) => {
    const { idToken } = req.body
    console.log(req.body)
    try {
        console.log('lll')
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        const { uid, name, email, picture } = decodedToken
        console.log("wooble it, wiggle it", decodedToken)

        let user = await User.findOne({ firebaseUid: uid })
        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                displayName: name,
                email,
                photoURL: picture,
                taskList: [],
                noteList: []
            })
            return res.status(201).json({ ok: true, user, isNewUser: true })
        }
        return res.status(200).json({ ok: true, user, isNewUser: false })
    } catch (err) {
    return res.status(401).json({ ok: false, error: "Authentication failed" });
  }
})

export default router