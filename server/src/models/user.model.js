import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    goalType: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance"],
      default: "maintenance",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
