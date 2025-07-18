import { Schema, model } from "mongoose";

const taskSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    taskList: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Tasks = model("tasks", taskSchema)

export default Tasks