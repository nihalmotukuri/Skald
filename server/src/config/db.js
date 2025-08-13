import mongoose from "mongoose"
import app from "../app.js"
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

const dbConnection = async () => {
    try {
        const res = await mongoose.connect(process.env.DB_URL)
        console.log("Connected to MongoDB")

        app.listen(PORT, () => {
            console.log(`The server is currently running at PORT ${PORT}`)
        })
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

export default dbConnection