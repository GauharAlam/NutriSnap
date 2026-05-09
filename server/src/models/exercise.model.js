import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Chest",
        "Back",
        "Shoulders",
        "Biceps",
        "Triceps",
        "Legs",
        "Core",
        "Cardio",
        "Full Body",
        "Olympic",
        "Stretching",
      ],
    },
    muscleGroups: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one muscle group is required",
      },
    },
    equipment: {
      type: String,
      enum: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "bodyweight",
        "kettlebell",
        "resistance_band",
        "smith_machine",
        "ez_bar",
        "none",
      ],
      default: "bodyweight",
    },
    instructions: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: "🏋️",
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = global/seeded exercise; set = user-custom
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for searching exercises
exerciseSchema.index({ name: "text" });
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ userId: 1, isCustom: 1 });

export const Exercise = mongoose.model("Exercise", exerciseSchema);
