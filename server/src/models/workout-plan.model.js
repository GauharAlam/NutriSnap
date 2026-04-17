import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: false, default: 0 }, // 0 implies till failure or timed
  rest: { type: Number, required: true }, // in seconds
  icon: { type: String, required: true },
  instructions: [{ type: String }],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    muscles: [{ type: String }],
    description: {
      type: String,
      required: true,
    },
    exercises: [exerciseSchema],
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
