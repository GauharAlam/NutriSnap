import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodItems: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    eatenAt: {
      type: Date,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePath: {
      type: String,
      default: "",
    },
    nutrition: {
      calories: {
        type: Number,
        required: true,
        min: 0,
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
    source: {
      type: String,
      enum: ["manual", "image_upload", "ai_estimated"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

mealSchema.index({ userId: 1, eatenAt: -1 });

export const Meal = mongoose.model("Meal", mealSchema);
