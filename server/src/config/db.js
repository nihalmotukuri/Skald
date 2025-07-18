import mongoose from "mongoose"
import app from "../app.js"
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

const dbConnection = async () => {
    try {
        const res = await mongoose.connect("mongodb+srv://nihalmotukuri:6TPx5Q7bmvLhm9wy@skald-cluster.y7cetp4.mongodb.net/?retryWrites=true&w=majority&appName=skald-cluster")
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