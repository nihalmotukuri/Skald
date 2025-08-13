import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: String,
  displayName: String,
  photoURL: String,
  taskList: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("User", UserSchema);