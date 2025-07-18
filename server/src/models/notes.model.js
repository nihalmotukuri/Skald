import { Schema, model } from "mongoose"

const noteSchema = new Schema({
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
}, { timestamps: true })

const Notes = model("notes", noteSchema)

export default Notes