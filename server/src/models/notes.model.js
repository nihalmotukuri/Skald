import { Schema, model } from "mongoose"

const noteSchema = new Schema({
    firebaseUid: { 
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: {
            data: Buffer,
            contentType: String
        },
        required: false,
        default: undefined
    }
}, { timestamps: true })

const Notes = model("notes", noteSchema)

export default Notes