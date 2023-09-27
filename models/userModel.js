import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  role: {
    type: String,
    default: "user",
  },

  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
})


const user = mongoose.model("User", userSchema)

export default user