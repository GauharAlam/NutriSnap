import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    portionMultiplier: { type: Number, default: 1 },
    servingLabel: { type: String, default: "1 serving" },
    matchedFood: { type: String, default: "" },
  },
  { _id: false }
);

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
      type: [foodItemSchema],
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
      fiber: {
        type: Number,
        default: 0,
        min: 0,
      },
      sodium: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    source: {
      type: String,
      enum: ["manual", "image_upload", "ai_estimated"],
      default: "manual",
    },
    aiConfidence: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

mealSchema.index({ userId: 1, eatenAt: -1 });

export const Meal = mongoose.model("Meal", mealSchema);
