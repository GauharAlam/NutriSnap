import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    goalType: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance"],
      required: true,
    },
    dailyTargets: {
      calories: {
        type: Number,
        required: true,
        min: 1000,
      },
      protein: {
        type: Number,
        required: true,
        min: 0,
      },
      carbs: {
        type: Number,
        required: true,
        min: 0,
      },
      fats: {
        type: Number,
        required: true,
        min: 0,
      },
      sugar: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    currentWeight: {
      type: Number,
      min: 0,
      default: null,
    },
    targetWeight: {
      type: Number,
      min: 0,
      default: null,
    },
    weeklyWorkoutDays: {
      type: Number,
      min: 0,
      max: 14,
      default: 4,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 280,
    },
  },
  {
    timestamps: true,
  }
);

export const Goal = mongoose.model("Goal", goalSchema);
