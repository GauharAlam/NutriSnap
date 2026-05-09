import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    servingLabel: {
      type: String,
      required: true,
    },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true },
      sugar: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
    category: {
      type: String,
      enum: [
        "Proteins",
        "Lentils & Legumes",
        "Grains & Carbs",
        "Vegetables",
        "Dairy",
        "Fruits",
        "Nuts & Seeds",
        "Fast / Junk Food",
        "Drinks & Shakes",
        "Sweets & Snacks",
        "Oils & Fats",
        "Supplements / Misc",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ label: "text", keywords: "text" });

export const Food = mongoose.model("Food", foodSchema);
