import { AppError } from "../../utils/app-error.js";

export function validateEstimateNutritionPayload(req, res, next) {
  const { foodItems } = req.body;

  if (!Array.isArray(foodItems) || foodItems.length === 0) {
    return next(new AppError("foodItems must be a non-empty array", 400));
  }

  for (const item of foodItems) {
    if (!item || typeof item.name !== "string" || !item.name.trim()) {
      return next(new AppError("Each food item must include a name", 400));
    }

    if (
      item.portionMultiplier !== undefined &&
      (!Number.isFinite(Number(item.portionMultiplier)) || Number(item.portionMultiplier) <= 0)
    ) {
      return next(new AppError("portionMultiplier must be a positive number", 400));
    }
  }

  next();
}
