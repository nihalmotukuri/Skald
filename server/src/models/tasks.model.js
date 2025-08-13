import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    firebaseUid: { 
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    taskList: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true })

const Tasks = model("tasks", taskSchema)

export default Tasks