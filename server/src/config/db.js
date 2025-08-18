import mongoose from "mongoose"
import app from "../app.js"
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

const dbConnection = async () => {
    try {
        const res = await mongoose.connect(process.env.DB_URL)

        app.listen(PORT, () => {
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

export default dbConnection