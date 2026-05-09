import mongoose from "mongoose";

// ─── Set Schema (nested inside Exercise Log) ────────────────────────────────
const setSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    reps: {
      type: Number,
      required: true,
      min: 0,
    },
    weightKg: {
      type: Number,
      min: 0,
      default: 0,
    },
    rpe: {
      type: Number,
      min: 1,
      max: 10,
      default: null, // Rate of Perceived Exertion
    },
    restSeconds: {
      type: Number,
      min: 0,
      default: 60,
    },
    isWarmup: {
      type: Boolean,
      default: false,
    },
    isPR: {
      type: Boolean,
      default: false, // flagged by PR tracker after save
    },
  },
  { _id: false }
);

// ─── Exercise Log Schema (nested inside Workout) ────────────────────────────
const exerciseLogSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      default: null, // optional — user may log without exercise lib
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
    muscleGroups: {
      type: [String],
      default: [],
    },
    sets: {
      type: [setSchema],
      default: [],
    },
  },
  { _id: false }
);

// ─── Main Workout Schema ────────────────────────────────────────────────────
const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    caloriesBurned: {
      type: Number,
      required: true,
    },
    totalSets: {
      type: Number,
      required: true,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },

    // ─── Phase 3 additions ──────────────────────────────────────────────
    exercises: {
      type: [exerciseLogSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    workoutPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user workout history queries
workoutSchema.index({ userId: 1, completedAt: -1 });

export const Workout = mongoose.model("Workout", workoutSchema);
