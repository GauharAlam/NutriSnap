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
      enum: ["weight_loss", "muscle_gain", "maintenance", "recomp"],
      default: "maintenance",
    },
    expoPushToken: {
      type: String,
      default: null,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String, // Stored as YYYY-MM-DD
      default: null,
    },

    // ─── Extended Profile (Phase 2) ───────────────────────────────────────
    profile: {
      age: {
        type: Number,
        min: 13,
        max: 120,
        default: null,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null,
      },
      heightCm: {
        type: Number,
        min: 50,
        max: 300,
        default: null,
      },
      weightKg: {
        type: Number,
        min: 20,
        max: 500,
        default: null,
      },
      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very_active"],
        default: "moderate",
      },
      trainingGoal: {
        type: String,
        enum: ["weight_loss", "muscle_gain", "maintenance", "recomp"],
        default: "maintenance",
      },
      dietPreference: {
        type: String,
        enum: ["any", "vegetarian", "vegan", "eggetarian", "keto", "paleo"],
        default: "any",
      },
      allergies: {
        type: [String],
        default: [],
      },
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      equipmentAccess: {
        type: String,
        enum: ["home", "gym", "both"],
        default: "gym",
      },
      injuries: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
